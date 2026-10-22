#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>

#include "src/recordercontroller.h"

int main(int argc, char *argv[])
{
    QGuiApplication app(argc, argv);

    RecorderController controller;

    QQmlApplicationEngine engine;
    engine.rootContext()->setContextProperty("recorder", &controller);

    const QUrl url(QStringLiteral("qrc:/qt/qml/ScreenRecorder/Main.qml"));
    QObject::connect(&engine, &QQmlApplicationEngine::objectCreationFailed,
                     &app, []() { QCoreApplication::exit(-1); },
                     Qt::QueuedConnection);
    engine.load(url);

    return app.exec();
}
