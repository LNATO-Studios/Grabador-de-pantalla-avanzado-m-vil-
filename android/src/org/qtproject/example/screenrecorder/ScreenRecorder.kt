package org.qtproject.example.screenrecorder

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.hardware.display.DisplayManager
import android.hardware.display.VirtualDisplay
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioPlaybackCaptureConfiguration
import android.media.AudioRecord
import android.media.MediaCodec
import android.media.MediaCodecInfo
import android.media.MediaFormat
import android.media.MediaMuxer
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.util.Log
import java.io.File

object ScreenRecorder {
    private const val TAG = "ScreenRecorder"
    private const val REQUEST_CODE = 1001

    private var mediaProjectionManager: MediaProjectionManager? = null
    private var mediaProjection: MediaProjection? = null

    private var pendingOutputPath: String? = null

    private var muxer: MediaMuxer? = null
    private var videoEncoder: MediaCodec? = null
    private var audioEncoder: MediaCodec? = null
    private var audioRecord: AudioRecord? = null
    private var virtualDisplay: VirtualDisplay? = null
    private var inputSurface: android.view.Surface? = null

    private var videoTrackIndex = -1
    private var audioTrackIndex = -1
    private var muxerStarted = false
    private val lock = Any()

    @Volatile private var recording = false
    private var audioThread: Thread? = null
    private var micEnabled: Boolean = true
    private var pendingMicEnabled: Boolean = true

    fun start(activity: Activity, outputPath: String, micEnabled: Boolean = true): Boolean {
        this.pendingMicEnabled = micEnabled
        if (mediaProjectionManager == null) {
            mediaProjectionManager = activity.getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
        }
        if (mediaProjection == null) {
            pendingOutputPath = outputPath
            activity.startActivityForResult(mediaProjectionManager!!.createScreenCaptureIntent(), REQUEST_CODE)
            return false
        }
        startCapture(activity, mediaProjection!!, outputPath, micEnabled)
        return true
    }

    fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode != REQUEST_CODE) return
        if (resultCode == Activity.RESULT_OK && data != null) {
            mediaProjection = mediaProjectionManager?.getMediaProjection(resultCode, data)
            val path = pendingOutputPath
            if (path != null && mediaProjection != null) {
                startCapture(activity, mediaProjection!!, path, pendingMicEnabled)
            }
        }
    }

    private fun startCapture(activity: Activity, projection: MediaProjection, outputPath: String, micEnabled: Boolean) {
        this.micEnabled = micEnabled
        val metrics = activity.resources.displayMetrics
        val width = metrics.widthPixels
        val height = metrics.heightPixels
        val dpi = metrics.densityDpi

        val m = MediaMuxer(outputPath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
        muxer = m

        // Video encoder
        val videoFormat = MediaFormat.createVideoFormat(MediaFormat.MIMETYPE_VIDEO_AVC, width, height)
        videoFormat.setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface)
        videoFormat.setInteger(MediaFormat.KEY_BIT_RATE, 6000000)
        videoFormat.setInteger(MediaFormat.KEY_FRAME_RATE, 30)
        videoFormat.setInteger(MediaFormat.KEY_CAPTURE_RATE, 30)
        videoFormat.setInteger(MediaFormat.KEY_REPEAT_PREVIOUS_FRAME_AFTER, 1000000 / 30)
        videoFormat.setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 1)

        val vEnc = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_VIDEO_AVC)
        vEnc.configure(videoFormat, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
        val surface = vEnc.createInputSurface()
        inputSurface = surface
        vEnc.setCallback(object : MediaCodec.Callback() {
            override fun onInputBufferAvailable(codec: MediaCodec, index: Int) {}
            override fun onOutputBufferAvailable(codec: MediaCodec, index: Int, info: MediaCodec.BufferInfo) {
                val buf = codec.getOutputBuffer(index) ?: return
                synchronized(lock) {
                    if (info.size != 0 && muxerStarted && videoTrackIndex >= 0) {
                        buf.position(info.offset)
                        buf.limit(info.offset + info.size)
                        muxer?.writeSampleData(videoTrackIndex, buf, info)
                    }
                }
                codec.releaseOutputBuffer(index, false)
            }
            override fun onError(codec: MediaCodec, e: MediaCodec.CodecException) {
                Log.e(TAG, "video codec error", e)
            }
            override fun onOutputFormatChanged(codec: MediaCodec, format: MediaFormat) {
                synchronized(lock) {
                    if (videoTrackIndex < 0) {
                        videoTrackIndex = muxer!!.addTrack(codec.outputFormat)
                        tryStartMuxer()
                    }
                }
            }
        })
        vEnc.start()
        videoEncoder = vEnc

        if (micEnabled) {
            // Audio
            val audioFormat = AudioFormat.Builder()
                .setSampleRate(44100)
                .setChannelMask(AudioFormat.CHANNEL_IN_STEREO)
                .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                .build()
            val captureConfig = AudioPlaybackCaptureConfiguration.Builder(projection)
                .addMatchingUsage(AudioAttributes.USAGE_MEDIA)
                .addMatchingUsage(AudioAttributes.USAGE_GAME)
                .addMatchingUsage(AudioAttributes.USAGE_UNKNOWN)
                .build()
            val aRecord = AudioRecord.Builder()
                .setAudioFormat(audioFormat)
                .setBufferSizeInBytes(AudioRecord.getMinBufferSize(44100, AudioFormat.CHANNEL_IN_STEREO, AudioFormat.ENCODING_PCM_16BIT))
                .setAudioPlaybackCaptureConfig(captureConfig)
                .build()
            audioRecord = aRecord

            val audioMediaFormat = MediaFormat.createAudioFormat(MediaFormat.MIMETYPE_AUDIO_AAC, 44100, 2)
            audioMediaFormat.setInteger(MediaFormat.KEY_BIT_RATE, 128000)
            audioMediaFormat.setInteger(MediaFormat.KEY_AAC_PROFILE, MediaCodecInfo.CodecProfileLevel.AACObjectLC)
            val aEnc = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_AUDIO_AAC)
            aEnc.configure(audioMediaFormat, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
            aEnc.start()
            audioEncoder = aEnc
        }

        virtualDisplay = projection.createVirtualDisplay(
            "ScreenRecorder", width, height, dpi,
            DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
            surface, null, null
        )

        recording = true
        if (micEnabled) {
            audioRecord?.startRecording()
        }

        if (micEnabled) {
        val thread = Thread {
            val bufSize = AudioRecord.getMinBufferSize(44100, AudioFormat.CHANNEL_IN_STEREO, AudioFormat.ENCODING_PCM_16BIT)
            val buffer = ByteArray(bufSize)
            val info = MediaCodec.BufferInfo()
            val startNanos = System.nanoTime()
            while (recording) {
                val read = aRecord.read(buffer, 0, buffer.size)
                if (read > 0) {
                    val inIndex = aEnc.dequeueInputBuffer(10000)
                    if (inIndex >= 0) {
                        val inBuf = aEnc.getInputBuffer(inIndex)
                        inBuf?.clear()
                        inBuf?.put(buffer, 0, read)
                        val pts = (System.nanoTime() - startNanos) / 1000
                        aEnc.queueInputBuffer(inIndex, 0, read, pts, 0)
                    }
                    drainAudio(aEnc, info)
                }
            }
            // EOS
            val inIndex = aEnc.dequeueInputBuffer(10000)
            if (inIndex >= 0) aEnc.queueInputBuffer(inIndex, 0, 0, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
            var done = false
            while (!done) {
                val outIndex = aEnc.dequeueOutputBuffer(info, 10000)
                if (outIndex >= 0) {
                    val outBuf = aEnc.getOutputBuffer(outIndex)
                    synchronized(lock) {
                        if (info.size > 0 && muxerStarted && audioTrackIndex >= 0) {
                            outBuf?.position(info.offset)
                            outBuf?.limit(info.offset + info.size)
                            muxer?.writeSampleData(audioTrackIndex, outBuf!!, info)
                        }
                    }
                    aEnc.releaseOutputBuffer(outIndex, false)
                    if (info.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0) done = true
                } else if (outIndex == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED) {
                    synchronized(lock) {
                        if (audioTrackIndex < 0) {
                            audioTrackIndex = muxer!!.addTrack(aEnc.outputFormat)
                            tryStartMuxer()
                        }
                    }
                } else {
                    done = true
                }
            }
        }
        thread.start()
        audioThread = thread
        }
    }

    private fun drainAudio(encoder: MediaCodec, info: MediaCodec.BufferInfo) {
        while (true) {
            val outIndex = encoder.dequeueOutputBuffer(info, 0)
            if (outIndex >= 0) {
                val outBuf = encoder.getOutputBuffer(outIndex)
                synchronized(lock) {
                    if (info.size > 0 && muxerStarted && audioTrackIndex >= 0) {
                        outBuf?.position(info.offset)
                        outBuf?.limit(info.offset + info.size)
                        muxer?.writeSampleData(audioTrackIndex, outBuf!!, info)
                    }
                }
                encoder.releaseOutputBuffer(outIndex, false)
                if (info.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0) break
            } else if (outIndex == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED) {
                synchronized(lock) {
                    if (audioTrackIndex < 0) {
                        audioTrackIndex = muxer!!.addTrack(encoder.outputFormat)
                        tryStartMuxer()
                    }
                }
            } else {
                break
            }
        }
    }

    private fun tryStartMuxer() {
        if (muxerStarted) return
        if (videoTrackIndex < 0) return
        if (micEnabled && audioTrackIndex < 0) return
        muxer?.start()
        muxerStarted = true
    }

    fun stop() {
        if (!recording && mediaProjection == null && muxer == null) {
            pendingOutputPath = null
            return
        }
        recording = false
        audioThread?.join(3000)
        audioThread = null
        virtualDisplay?.release()
        virtualDisplay = null
        inputSurface?.release()
        inputSurface = null
        try { videoEncoder?.stop() } catch (_: Exception) {}
        videoEncoder?.release()
        videoEncoder = null
        try { audioEncoder?.stop() } catch (_: Exception) {}
        audioEncoder?.release()
        audioEncoder = null
        try { audioRecord?.stop() } catch (_: Exception) {}
        audioRecord?.release()
        audioRecord = null
        synchronized(lock) {
            if (muxerStarted) try { muxer?.stop() } catch (_: Exception) {}
            try { muxer?.release() } catch (_: Exception) {}
        }
        muxer = null
        mediaProjection?.stop()
        mediaProjection = null
        videoTrackIndex = -1
        audioTrackIndex = -1
        muxerStarted = false
        pendingOutputPath = null
    }
}
