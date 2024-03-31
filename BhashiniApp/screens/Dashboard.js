import React, { useState } from "react";
import { StyleSheet, View, StatusBar, Platform, Text, Button, TouchableOpacity } from "react-native";
import { Color, Border, FontFamily, FontSize } from "../GlobalStyles";
import { Audio } from "expo-av";
// import { SvgXml } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
// import Microphone from "../assets/svg/microphone";
import { useCallback } from "react";

const Dashboard = () => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const navigation = useNavigation();
  const cameraIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-camera"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
 `;

 const inventoryIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-box"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
 `;

 const micIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mic"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
 `;

  const cameraRef = useCallback(ref => {
    if (ref !== null) {
      ref.resumePreview();
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

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access audio recording denied');
        return;
      }
      if (!isRecording) {
        const recordingInstance = new Audio.Recording();
        await recordingInstance.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
        await recordingInstance.startAsync();
        setRecording(recordingInstance);
        setIsRecording(true);
      } else {
        stopRecording();
      }
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        const base64 = await convertAudioToBase64(uri);
        sendAudioToBackend(base64);
        setRecording(null);
        setIsRecording(false);
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const convertAudioToBase64 = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to convert audio to base64', error);
      throw error;
    }
  };

const playAudioFromBase64 = async (base64String) => {
    try {
      // Convert base64 string to binary data
      const audioData = atob(base64String);
      const bytes = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        bytes[i] = audioData.charCodeAt(i);
      }
      const audioBuffer = new Uint8Array(bytes);

      // Load the audio buffer
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mpeg;base64,${base64String}` },
        { shouldPlay: true }
      );

      // Play the audio
      setSound(sound);
    } catch (error) {
      console.error("Failed to play audio from base64:", error);
    }
  };

  const stopAudio = async () => {
    if (sound !== null) {
      await sound.unloadAsync();
      setSound(null);
    }
  };

  return (
    <View style={styles.dashboard}>
      
      <View style={[styles.dashboardInner, styles.groupItemLayout]}>
        <View style={[styles.groupItem, styles.groupItemBg]} />
      </View>
      <View style={styles.topHeader}>
        <View>
          <Text style={{textAlign:'center',alignSelf:'center',fontSize: 20,padding:'1%',fontWeight:'700'}}>प्रबंधन</Text>
        </View>
        <View style={styles.notificationIcon}>
          <Button title="Not" onPress={()=> navigation.navigate('NotificationsPage')}/>
        </View>      
      </View>
      <Text style={styles.whatWouldYou}>
        What would you like to do?
      </Text>
      <View style={{flex:1,justifyContent:'center',alignItems:'center',marginTop:'50%',backgroundColor:'#10b981',borderRadius:20,width:'80%',alignSelf:'center',paddingTop:'25%'}}> 
        <Button title="Recording" onPress={startRecording} style={styles.micFillIcon}/>
        <Text style={[styles.tapToRecord, styles.tapToRecordClr]}>
          {isRecording ? 'Tap to stop recording' : 'Tap to record'}
        </Text>
      </View>
      
        <View style={styles.buttonContainer}>
          <Button title="Inventory" onPress={()=> navigation.navigate('Inventory')} />
          <Button title="Camera" onPress={toggleCamera} />
          <Button title="Settings" onPress={() => navigation.navigate('Settings')} />
        </View>
      
    
      
      
      {isCameraVisible && (
        <Camera style={StyleSheet.absoluteFill} type={Camera.Constants.Type.back} ref={cameraRef}>
          {/* Button overlapping on the camera view */}
          {/* <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
            <Text style={styles.captureButtonText}>Capture</Text>
          </TouchableOpacity> */}
          <View style={styles.captureButton}>
            <Button title="Capture" onPress={takePicture} color='grey' />
          </View>
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
  recordingposition:{
    marginTop:10,
  },
  tapToRecordClr: {
    color: Color.colorBlack,
    //position: "absolute",
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
    backgroundColor: Color.color1, // Added background color to mimic image
  },
  menuIcon: {
    top: 0,
    left: 3,
    height: 42,
    borderRadius: Border.br_3xs,
    backgroundColor: Color.color1, // Added background color to mimic image
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
    
    //left: 342,
    //justifyContent:
    position:'absolute',
    left:'82%',
    right:'0%',
    marginRight:'0%',
    width:'0.01%',
    marginRight:'10%',
    padding:'5%',
  },
  topHeader:{
    top: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    borderColor:'black',
    borderRadius:20,
    borderWidth:0.5,
    padding:'1%',
    width:'90%',
    alignSelf:'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 10, // Adjust the elevation as needed
      },
    }),

  },
  whatWouldYou: {
    top: '10.5%',
    left: '15%',
    alignItems: 'center',
    fontSize: 15,
    fontFamily: FontFamily.poppinsRegular,
    textAlign: "center",
    width: '70%',
    //height: 16,
    fontWeight: "bold"
  },
  buttonContainer: {
    flex:1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:'center',
    marginTop:'40%',
    width:'90%',
    height:'50%',
    alignSelf:'center',
    backgroundColor:Color.color1,
    borderRadius:50,
    padding:'5%',
    marginBottom:'10%',

  },
  // buttonContainer1:{
  //   flexDirection:'column',
  //   justifyContent:'flex-end',
  //   alignItems:'stretch',
  //   marginTop:'100%'
  // },
  ellipseIcon: {
    top: 308,
    left: 148,
    width: 117,
    height: 109,
    position: "absolute",
  },
  micFillIcon: {
    // justifyContent:'center',
    // top: 334,
    // left: 172,
    // width: 70,
    // height: 58,
    // alignSelf: 'center',
    // position: "absolute",
    // marginTop:'70%'
  },
  tapToRecord: {
    //top: 435,
    flex:1,
    //left: '28%',
    alignSelf:'center',
    fontSize: FontSize.size_l,
    fontWeight: "500",
    fontFamily: FontFamily.poppinsMedium,
    textAlign: "center",
    //width: 168,
    //height: 37,
    justifyContent:'center'
  },
  dashboard: {
    backgroundColor: Color.colorWhite,
    flex: 1,
    width: "100%",
    height: 844,
    overflow: "hidden",
  },
  captureButton: {
    //backgroundColor: 'white',
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