import * as React from "react";
import { Image } from "expo-image";
import { StyleSheet, View, Text } from "react-native";
import { Color, Border, Padding, FontFamily, FontSize } from "../GlobalStyles";
import { Audio } from "expo-av";
import { TouchableOpacity } from "react-native";


const Dashboard = () => {
  const startRecording = async () => {
    const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING); // Request audio recording permissions
    if (status !== "granted") {
      console.log("Permission to access audio recording denied");
      return;
    }
    try {
      const recording = new Audio.Recording(); 
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY); 
      await recording.startAsync(); 

    } catch (error) {
      console.error("Failed to start recording", error);
      
    }
  };
  return (
    <View style={styles.dashboard}>
      <View style={styles.vectorParent}>
        <Image
          style={styles.groupChild}
          contentFit="cover"
          source={require("../assets/rectangle-29.png")}
        />
        <Image
          style={[styles.menuIcon, styles.iconLayout1]}
          contentFit="cover"
          source={require("../assets/menu.png")}
        />
      </View>
      <View style={[styles.dashboardInner, styles.groupItemLayout]}>
        <View style={[styles.groupItem, styles.groupItemBg]} />
      </View>
      <Image
        style={[styles.notificationIcon, styles.iconLayout]}
        contentFit="cover"
        source={require("../assets/notification.png")}
      />
      
      <Text style={[styles.whatWouldYou, styles.tapToRecordClr]}>
        what would you like to do?
      </Text>
      <View style={styles.dashboardChild} />
      <Image
        style={[styles.cameraFillIcon, styles.iconLayout]}
        contentFit="cover"
        source={require("../assets/camera-fill.png")}
      />
      <View style={[styles.dashboardItem, styles.dashboardItemLayout]} />
      <Image
        style={[styles.folderCheckFillIcon, styles.folderCheckFillIconLayout]}
        contentFit="cover"
        source={require("../assets/folder-check-fill.png")}
      />
      <Image
        style={[styles.rectangleIcon, styles.dashboardItemLayout]}
        contentFit="cover"
        source={require("../assets/rectangle-30.png")}
      />
      <Image
        style={[styles.settingFillIcon, styles.iconLayout1]}
        contentFit="cover"
        source={require("../assets/setting-fill.png")}
      />
      <TouchableOpacity onPress={startRecording}>
        <Image
          style={styles.ellipseIcon}
          contentFit="cover"
          source={require("../assets/ellipse-58.png")}
        />
      </TouchableOpacity>
      <Image
        style={styles.micFillIcon}
        contentFit="cover"
        source={require("../assets/mic-fill.png")}
      />
      <Text style={[styles.tapToRecord, styles.tapToRecordClr]}>{`TAP TO RECORD`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  iconLayout1: {
    width: 50,
    position: "absolute",
  },
  groupItemLayout: {
    width: 340,
    left: "50%",
    height: 40,
  },
  groupItemBg: {
    backgroundColor: Color.color1,
    position: "absolute",
  },
  iconLayout: {
    width: 48,
    height: 48,
    position: "absolute",
  },
  folderCheckFillIconLayout: {
    width: 40,
    position: "absolute",
  },
  icons8Layout: {
    width: 24,
    marginLeft: 50,
    height: 24,
  },
  tapToRecordClr: {
    color: Color.colorBlack,
    position: "absolute",
  },
  dashboardItemLayout: {
    top: 668,
    height: 70,
    width: 100,
    borderRadius: Border.br_mini,
    position: "absolute",
  },
  groupChild: {
    borderRadius: Border.br_3xs,
    left: 0,
    top: 0,
    height: 48,
    width: 57,
    position: "absolute",
  },
  menuIcon: {
    top: 4,
    left: 3,
    height: 42,
    borderRadius: Border.br_3xs,
  },
  vectorParent: {
    top: 12,
    left: 11,
    height: 48,
    width: 57,
    position: "absolute",
  },
  groupItem: {
    marginLeft: -170,
    borderRadius: Border.br_xl,
    borderStyle: "solid",
    borderColor: Color.colorBlack,
    borderWidth: 1,
    height: 40,
    width: 340,
    left: "50%",
    backgroundColor: Color.color1,
    top: 0,
  },
  dashboardInner: {
    marginLeft: -167,
    top: 129,
    height: 40,
    shadowOpacity: 1,
    elevation: 4,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowColor: "rgba(0, 0, 0, 0.25)",
    width: 340,
    left: "50%",
    position: "absolute",
  },
  notificationIcon: {
    top: 13,
    left: 342,
  },
  component2ContainerChild: {
    top: 10,
    left: 58,
    zIndex: 0,
    height: 40,
  },


  whatWouldYou: {
    top: 136,
    left: 48,
    fontSize: 15,
    fontFamily: FontFamily.poppinsRegular,
    textAlign: "center",
    width: 293,
    height: 26,
  },
  dashboardChild: {
    top: 669,
    left: 156,
    height: 70,
    width: 100,
    borderRadius: Border.br_mini,
    backgroundColor: Color.colorDarkcyan,
    shadowOpacity: 1,
    elevation: 4,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowColor: "rgba(0, 0, 0, 0.25)",
    position: "absolute",
  },
  cameraFillIcon: {
    top: 680,
    left: 182,
  },
  dashboardItem: {
    left: 37,
    backgroundColor: Color.colorDarkcyan,
    top: 668,
    shadowOpacity: 1,
    elevation: 4,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowColor: "rgba(0, 0, 0, 0.25)",
  },
  folderCheckFillIcon: {
    top: 688,
    left: 66,
    height: 35,
  },
  rectangleIcon: {
    left: 270,
  },
  settingFillIcon: {
    top: 677,
    left: 291,
    height: 51,
  },
  ellipseIcon: {
    top: 308,
    left: 148,
    width: 117,
    height: 109,
    position: "absolute",
  },
  micFillIcon: {
    top: 334,
    left: 172,
    width: 70,
    height: 58,
    position: "absolute",
  },
  tapToRecord: {
    top: 435,
    left: 144,
    fontSize: FontSize.size_l,
    fontWeight: "500",
    fontFamily: FontFamily.poppinsMedium,
    textAlign: "left",
    width: 168,
    height: 39,
  },
  dashboard: {
    backgroundColor: Color.colorWhite,
    flex: 1,
    width: "100%",
    height: 844,
    overflow: "hidden",
  },
});

export default Dashboard;
