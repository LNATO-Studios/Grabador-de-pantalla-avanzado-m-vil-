import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

ApplicationWindow {
    id: root
    width: 360
    height: 640
    visible: true
    title: qsTr("Grabador de pantalla")
    color: "#0b0f14"

    Rectangle {
        anchors.fill: parent
        gradient: Gradient {
            GradientStop { position: 0.0; color: "#0b0f14" }
            GradientStop { position: 1.0; color: "#1a2230" }
        }
    }

    ColumnLayout {
        anchors.centerIn: parent
        spacing: 48

        Text {
            text: qsTr("Grabador")
            font.pixelSize: 30
            font.bold: true
            color: "white"
            Layout.alignment: Qt.AlignHCenter
        }

        Text {
            text: recorder.status
            font.pixelSize: 14
            color: "#9aa0a6"
            Layout.alignment: Qt.AlignHCenter
            wrapMode: Text.Wrap
            Layout.maximumWidth: 280
            horizontalAlignment: Text.AlignHCenter
        }

        Item {
            Layout.alignment: Qt.AlignHCenter
            width: 160
            height: 160

            Rectangle {
                id: ring
                anchors.centerIn: parent
                width: 160
                height: 160
                radius: 80
                color: "transparent"
                border.width: 4
                border.color: recorder.recording ? "#ff3b30" : "#1e88e5"
                opacity: 0.6
            }

            Rectangle {
                id: button
                anchors.centerIn: parent
                width: 120
                height: 120
                radius: 60
                color: recorder.recording ? "#ff3b30" : "#1e88e5"

                Behavior on color { ColorAnimation { duration: 200 } }

                Rectangle {
                    anchors.centerIn: parent
                    width: recorder.recording ? 36 : 46
                    height: recorder.recording ? 36 : 46
                    radius: recorder.recording ? 8 : 23
                    color: "white"

                    Behavior on width { NumberAnimation { duration: 200 } }
                    Behavior on height { NumberAnimation { duration: 200 } }
                    Behavior on radius { NumberAnimation { duration: 200 } }
                }

                MouseArea {
                    anchors.fill: parent
                    cursorShape: Qt.PointingHandCursor
                    onClicked: recorder.toggleRecording()
                }
            }
        }

        Text {
            text: recorder.recording ? qsTr("Toca para detener") : qsTr("Toca para grabar")
            font.pixelSize: 13
            color: "#6b7280"
            Layout.alignment: Qt.AlignHCenter
        }
    }
}
