package org.qtproject.example.screenrecorder

import android.content.Intent
import org.qtproject.qt.android.bindings.QtActivity

class MainActivity : QtActivity() {
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        ScreenRecorder.onActivityResult(this, requestCode, resultCode, data)
    }
}
