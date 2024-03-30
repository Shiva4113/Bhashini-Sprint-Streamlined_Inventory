import React, {useState} from "react";
import { Image } from "expo-image";
import { StyleSheet, View,StatusBar,Platform, Text } from "react-native";
import { Color, Border, Padding, FontFamily, FontSize } from "../GlobalStyles";
import { Audio } from "expo-av";
import { TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';

const Dashboard = () => {
  const navigation = useNavigation();
 const [recording, setRecording] = useState(null); // Correctly defined state for recording
 const [isRecording, setIsRecording] = useState(false); // State to track recording status
 const [isCameraVisible, setIsCameraVisible] = useState(false);
 const cameraRef = React.useCallback(ref => {
    if (ref !== null) {
      ref.resumePreview(); // Start camera preview when ref is available
    }
  }, []);
 
  const toggleCamera = () => {
    setIsCameraVisible(!isCameraVisible);
  };
  
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const { uri } = await cameraRef.current.takePictureAsync({ quality: 0.5, base64: true });
        console.log('Picture taken:', uri);

        // Generate a unique filename
        const filename = `GeneratedImage_${Date.now()}.jpg`;

        // Create a directory for saving images if it doesn't exist
        const directory = `${FileSystem.documentDirectory}images/`;
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });

        // Save the image to the directory
        const savedImage = await FileSystem.moveAsync({
          from: uri,
          to: `${directory}${filename}`,
        });

        console.log('Image saved:', savedImage);
      } catch (error) {
        console.error('Failed to take picture:', error);
      }
    }
 };

  const saveImage = async (uri, fileName) => {
    const fileUri = FileSystem.documentDirectory + fileName;
    try {
      await FileSystem.copyAsync({ from: uri, to: fileUri });
      console.log('Image saved successfully:', fileUri);
    } catch (error) {
      console.error('Failed to save image:', error);
    }
  };

 const startRecording = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access audio recording denied');
      return;
    }
    if (!isRecording) {
      const recordingInstance = new Audio.Recording();
      try {
        await recordingInstance.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
        await recordingInstance.startAsync();
        setRecording(recordingInstance);
        setIsRecording(true); // Set isRecording to true
      } catch (error) {
        console.error('Failed to start recording', error);
      }
    } else {
      stopRecording(); // If already recording, stop it
    }
 };

 const stopRecording = async () => {
    if (recording) {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      // Convert the audio file to base64
      const base64 = await convertAudioToBase64(uri);
      // Send the base64 audio to the backend
      sendAudioToBackend(base64);
      setRecording(null);
      setIsRecording(false); // Set isRecording to false
    }
 };

 const convertAudioToBase64 = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
 };

 const sendAudioToBackend = async (base64Audio) => {
    try {
      const response = await axios.post('YOUR_BACKEND_ENDPOINT', { audio: base64Audio });
      console.log('Audio sent successfully', response);
    } catch (error) {
      console.error('Failed to send audio to backend', error);
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
      <TouchableOpacity onPress={()=> navigation.navigate('Notifications')}>
        <Image
          style={[styles.notificationIcon, styles.iconLayout]}
          contentFit="cover"
          source={require("../assets/notification.png")}
        />
      </TouchableOpacity>
      
      <Text style={[styles.whatWouldYou, styles.tapToRecordClr]}>
        What would you like to do?
      </Text>
      <TouchableOpacity onPress={toggleCamera }>
      <View style={styles.dashboardChild} />
      <Image
        style={[styles.cameraFillIcon, styles.iconLayout]}
        contentFit="cover"
        source={require("../assets/camera-fill.png")}
      />
      </TouchableOpacity>
    
      <TouchableOpacity onPress={()=> navigation.navigate('Inventory')}>
      <View style={[styles.dashboardItem, styles.dashboardItemLayout]} />
        <Image
          style={[styles.folderCheckFillIcon, styles.folderCheckFillIconLayout]}
          contentFit="cover"
          source={require("../assets/folder-check-fill.png")}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
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
      </TouchableOpacity>
      <TouchableOpacity onPress={startRecording}>
        <Image
          style={styles.ellipseIcon}
          contentFit="cover"
          source={require("../assets/ellipse-58.png")}
        />
      
      <Image
        style={styles.micFillIcon}
        contentFit="cover"
        source={require("../assets/mic-fill.png")}
      />
      </TouchableOpacity>
      <Text style={[styles.tapToRecord, styles.tapToRecordClr]}>
        {isRecording ? 'Tap to stop recording' : 'Tap to record'}
      </Text>
      {/* Button to take picture */}
      {isCameraVisible && (
  <Camera style={{ flex: 1 }} type={Camera.Constants.Type.back} ref={cameraRef}>
    {/* Button overlapping on the camera view */}
    <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
      <Text style={styles.captureButtonText}>Capture</Text>
    </TouchableOpacity>
  </Camera>
)}

    
      
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
    top: 0,
    left: 3,
    height: 42,
    borderRadius: Border.br_3xs,
  },
  vectorParent: {
    top: Platform.OS === "android" ? StatusBar.currentHeight : 0,
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
    top: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    left: 342,
  },
  component2ContainerChild: {
    top: 10,
    left: 58,
    zIndex: 0,
    height: 40,
  },


  whatWouldYou: {
    top: 140,
    left: '15%',
    alignItems:'center',
    fontSize: 15,
    fontFamily: FontFamily.poppinsRegular,
    textAlign: "center",
    width: 293,
    height: 26,
    fontWeight:"bold"
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
    alignSelf:'center',
    position: "absolute",
  },
  tapToRecord: {
    top: 435,
    left: '28%',
    fontSize: FontSize.size_l,
    fontWeight: "500",
    fontFamily: FontFamily.poppinsMedium,
    textAlign: "center",
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
  captureButton: {
    backgroundColor: 'white',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 20, // Adjust the bottom position as needed
    zIndex: 1, // Ensure the button is on top of the camera view
  },
  captureButtonText: {
    color: 'black', // Set the text color to black
    fontSize: 16,
    fontWeight: 'bold',
  },
});
export default Dashboard;