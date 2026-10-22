cmake_minimum_required(VERSION 3.16)

project(screenrecorder VERSION 1.0 LANGUAGES CXX)

find_package(Qt6 REQUIRED COMPONENTS Core Gui Quick Qml QuickControls2 QuickLayouts)

qt_standard_project_setup(REQUIRES 6.8)

qt_add_executable(screenrecorder
    main.cpp
    src/recordercontroller.h
    src/recordercontroller.cpp
)

qt_add_qml_module(screenrecorder
    URI ScreenRecorder
    VERSION 1.0
    QML_FILES qml/Main.qml
)

target_link_libraries(screenrecorder PRIVATE
    Qt6::Core
    Qt6::Gui
    Qt6::Quick
    Qt6::Qml
    Qt6::QuickControls2
    Qt6::QuickLayouts
)

set_target_properties(screenrecorder PROPERTIES
    QT_ANDROID_APP_NAME "Screen Recorder"
    QT_ANDROID_APP_ICON "@drawable/icon"
    QT_ANDROID_PACKAGE_SOURCE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/android"
    QT_ANDROID_VERSION_NAME "1.0"
    QT_ANDROID_VERSION_CODE 1
)

install(TARGETS screenrecorder
    BUNDLE DESTINATION .
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
)
