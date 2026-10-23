#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>

#include "src/recordercontroller.h"

int main(int argc, char *argv[])
{
    QGuiApplication app(argc, argv);
    app.setApplicationName(QStringLiteral("Grabador"));
    app.setApplicationVersion(QStringLiteral("1.0"));

    RecorderController controller;

    QQmlApplicationEngine engine;
    engine.rootContext()->setContextProperty("recorder", &controller);

    QObject::connect(&engine, &QQmlApplicationEngine::objectCreationFailed,
                     &app, []() { QCoreApplication::exit(-1); },
                     Qt::QueuedConnection);
    engine.loadFromModule("ScreenRecorder", "Main");

    return app.exec();
}
