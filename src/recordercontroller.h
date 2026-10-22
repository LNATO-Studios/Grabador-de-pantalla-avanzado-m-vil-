#ifndef RECORDERCONTROLLER_H
#define RECORDERCONTROLLER_H

#include <QObject>
#include <QString>

class RecorderController : public QObject
{
    Q_OBJECT
    Q_PROPERTY(bool recording READ isRecording NOTIFY recordingChanged)
    Q_PROPERTY(QString status READ status NOTIFY statusChanged)
    Q_PROPERTY(bool micEnabled READ micEnabled WRITE setMicEnabled NOTIFY micEnabledChanged)
public:
    explicit RecorderController(QObject *parent = nullptr);

    bool isRecording() const { return m_recording; }
    QString status() const { return m_status; }
    bool micEnabled() const { return m_micEnabled; }
    void setMicEnabled(bool v);

    Q_INVOKABLE void toggleRecording();

signals:
    void recordingChanged();
    void statusChanged();
    void micEnabledChanged();

private:
    void setStatus(const QString &s);
    void setRecording(bool v);
    QString outputPath() const;

    bool m_recording = false;
    QString m_status = QStringLiteral("Listo para grabar");
    bool m_micEnabled = true;
};

#endif // RECORDERCONTROLLER_H
