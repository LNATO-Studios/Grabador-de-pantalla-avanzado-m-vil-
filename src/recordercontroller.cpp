#include "recordercontroller.h"

#include <QGuiApplication>
#include <QStandardPaths>
#include <QDir>
#include <QDateTime>
#include <QMetaObject>

#ifdef Q_OS_ANDROID
#include <QJniObject>
#include <QJniEnvironment>
#include <QCoreApplication>
#endif

RecorderController* RecorderController::s_instance = nullptr;

RecorderController::RecorderController(QObject *parent) : QObject(parent)
{
    s_instance = this;
}

void RecorderController::setMicEnabled(bool v)
{
    if (m_micEnabled == v) return;
    m_micEnabled = v;
    emit micEnabledChanged();
}

void RecorderController::setStatus(const QString &s)
{
    if (m_status == s) return;
    m_status = s;
    emit statusChanged();
}

void RecorderController::setRecording(bool v)
{
    if (m_recording == v) return;
    m_recording = v;
    emit recordingChanged();
}

void RecorderController::handleRecordingStarted()
{
    setRecording(true);
    setStatus(QStringLiteral("Grabando..."));
}

QString RecorderController::outputPath() const
{
    QString base = QStandardPaths::writableLocation(QStandardPaths::MoviesLocation);
    if (base.isEmpty()) base = QDir::homePath();
    QDir().mkpath(base);
    return base + QStringLiteral("/grabacion_") +
           QDateTime::currentDateTime().toString(QStringLiteral("yyyyMMdd_HHmmss")) +
           QStringLiteral(".mp4");
}

void RecorderController::toggleRecording()
{
    if (m_recording) {
        // stop
#ifdef Q_OS_ANDROID
        QJniObject::callStaticMethod<void>(
            "org/qtproject/example/screenrecorder/ScreenRecorder",
            "stop",
            "()V");
#endif
        setRecording(false);
        setStatus(QStringLiteral("Grabación detenida"));
        return;
    }

    const QString path = outputPath();
#ifdef Q_OS_ANDROID
    QJniObject activity = QNativeInterface::QAndroidApplication::context();
    jboolean started = false;
    if (activity.isValid()) {
        QJniObject jpath = QJniObject::fromString(path);
        started = QJniObject::callStaticMethod<jboolean>(
            "org/qtproject/example/screenrecorder/ScreenRecorder",
            "start",
            "(Landroid/app/Activity;Ljava/lang/String;Z)Z",
            activity.object<jobject>(),
            jpath.object<jstring>(),
            (jboolean)m_micEnabled);
    }
    if (started) {
        setRecording(true);
        setStatus(QStringLiteral("Grabando..."));
    } else {
        setStatus(QStringLiteral("Concede el permiso de captura y vuelve a tocar"));
    }
#else
    setStatus(QStringLiteral("Grabación solo disponible en Android"));
#endif
}

#ifdef Q_OS_ANDROID
extern "C" JNIEXPORT void JNICALL Java_org_qtproject_example_screenrecorder_ScreenRecorder_nativeOnRecordingStarted(JNIEnv *env, jclass clazz)
{
    Q_UNUSED(env);
    Q_UNUSED(clazz);
    if (RecorderController::s_instance) {
        QMetaObject::invokeMethod(RecorderController::s_instance, "handleRecordingStarted", Qt::QueuedConnection);
    }
}
#endif
