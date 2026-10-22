#ifndef RECORDERCONTROLLER_H
#define RECORDERCONTROLLER_H

#include <QObject>
#include <QString>

class RecorderController : public QObject
{
    Q_OBJECT
    Q_PROPERTY(bool recording READ isRecording NOTIFY recordingChanged)
    Q_PROPERTY(QString status READ status NOTIFY statusChanged)
public:
    explicit RecorderController(QObject *parent = nullptr);

    bool isRecording() const { return m_recording; }
    QString status() const { return m_status; }

    Q_INVOKABLE void toggleRecording();

signals:
    void recordingChanged();
    void statusChanged();

private:
    void setStatus(const QString &s);
    void setRecording(bool v);
    QString outputPath() const;

    bool m_recording = false;
    QString m_status = QStringLiteral("Listo para grabar");
};

#endif // RECORDERCONTROLLER_H
