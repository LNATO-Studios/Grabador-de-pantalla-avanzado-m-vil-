#include "recordercontroller.h"

#include <QGuiApplication>
#include <QStandardPaths>
#include <QDir>
#include <QDateTime>

#ifdef Q_OS_ANDROID
#include <QJniObject>
#include <QJniEnvironment>
#include <QCoreApplication>
#endif

RecorderController::RecorderController(QObject *parent) : QObject(parent) {}

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
            "(Landroid/app/Activity;Ljava/lang/String;)Z",
            activity.object<jobject>(),
            jpath.object<jstring>());
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
