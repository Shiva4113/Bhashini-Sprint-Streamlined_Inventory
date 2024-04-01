import React, { useState,useEffect } from "react";
import { StyleSheet, View, StatusBar, Platform, Text, Button, TouchableOpacity, Image, Pressable } from "react-native";
import { Color, Border, FontFamily, FontSize } from "../GlobalStyles";
import { Audio } from "expo-av";
import { useNavigation } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store'
// import { Storage } from "react-native-firebase/storage";
import AudioRecord from "react-native-audio-record"
import { PermissionsAndroid } from 'react-native';
import { useCallback } from "react";

const Dashboard = () => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const navigation = useNavigation();
  const [sound,setSound] = useState(null);
  

  const cameraRef = useCallback(ref => {
    if (ref !== null) {
      ref.resumePreview();
    }
  }, []);

  const toggleCamera = () => {
    setIsCameraVisible(!isCameraVisible);
  };

  const takePicture = async () => {
    console.log("buttonclicked");
    if (cameraRef.current) {
      console.log(cameraRef.current);
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
    } else {
      console.log('Camera ref is not yet available');
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
        await recordingInstance.prepareToRecordAsync({
          android: {
            extension: '.mp3', // Specify the extension as MP3
            outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4, // Use MPEG-4 format
            audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC, // Use AAC encoder
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            extension: '.m4a', // iOS typically uses M4A format
            audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
        });
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
        console.log(uri)
        const base64 = await convertAudioToBase64(uri);
        console.log(base64)
        sendAudioToBackend(base64);
        setRecording(null);
        setIsRecording(false);
        // playAudio()
        // stopAudio()
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
  const sendAudioToBackend = async (base64Audio) => {
    try {
        let userID = await SecureStore.getItemAsync("userID").catch(error => {
            console.error("Error retrieving userID:", error);
            throw error; // Rethrow the error to be caught by the outer try-catch
        });

        const response = await fetch('http://192.168.68.104:5000/processaudio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sourceLanguage: "hi",
                targetLanguage: "en",
                audioContent: base64Audio,
                userId: userID
            })
        }).catch(error => {
            console.error("Error sending audio to backend:", error);
            throw error; // Rethrow the error to be caught by the outer try-catch
        });

        // Assuming you want to do something with the response, like checking the status
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Process the response as needed
        // For example, if you expect JSON in the response:
        const data = await response.json();
        console.log(data);
        playAudio(data.response)
        stopAudio()
    } catch (error) {
        console.error("An error occurred:", error);
        // Handle the error as appropriate for your application
    }
};

  // const sendAudioToBackend = async (base64Audio) => {
  //   try {
  //     // console.log(base64Audio)
  //     let userID = await SecureStore.getItemAsync("userID");
  //     const response = await fetch('http://192.168.68.104:5000/processaudio', {
  //       method: 'POST',
  //       headers: {
  //          'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //          sourceLanguage: "hi",
  //          targetLanguage: "en",
  //          audioContent: base64Audio,
  //          userId: userID
  //       })
  //      }
  //      );
       
  //     console.log('Audio sent successfully', response);
      
  //     // playAudioFromBase64(base64Audio);
  //   } catch (error) {
  //     console.error('Failed to send audio to backend!!', error);
  //   }
  // };

  // const playAudioFromBase64 = async (base64String) => {
  //   try {
  //     // Decode base64 string to binary data
  //     const binaryData = atob(base64String);
  //     const byteArray = new Uint8Array(binaryData.length);
  //     for (let i = 0; i < binaryData.length; i++) {
  //       byteArray[i] = binaryData.charCodeAt(i);
  //     }
  
  //     // Create audio context and decode audio data
  //     const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  //     const audioBuffer = await audioContext.decodeAudioData(byteArray.buffer);
  
  //     // Create source and connect it to the context
  //     const source = audioContext.createBufferSource();
  //     source.buffer = audioBuffer;
  //     source.connect(audioContext.destination);
  
  //     // Start playing the audio
  //     source.start();
  
  //     // Optionally return the source node to control playback
  //     return source;
  //   } catch (error) {
  //     console.error("Failed to play audio from base64:", error);
  //     return null;
  //   }
  // };
  
  const playAudio = async (base64String) => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }

    const uri = `data:audio/mp3;base64,${base64String}`;
    const { sound: newSound } = await Audio.Sound.createAsync({ uri });
    setSound(newSound);
    await newSound.playAsync();
 };

 const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      setSound(null);
    }
 };


  return (
    <View style={styles.dashboard}>
      
      <View style={styles.topHeader}>
        <View>
          <Text style={{textAlign:'center',alignSelf:'center',fontSize: 20,padding:'1%',fontWeight:'700'}}>प्रबंधन</Text>
        </View>
        <View style={styles.notificationIcon}>
          <Pressable onPress={()=> navigation.navigate('NotificationsPage')}>
            <Image source={require('../assets/notification1.png')} style={{width:30,height:30,marginLeft:'50%'}} />
          </Pressable>
        </View>      
      
      </View>
      <Text style={styles.whatWouldYou}>
        What would you like to do?
      </Text>
      <View style={{flex:1,
                    justifyContent:'center',
                    alignItems:'center',
                    marginTop:'50%',
                    backgroundColor:'#aff5ed',
                    borderRadius:20,
                    width:'80%',
                    alignSelf:'center',
                    paddingTop:'28%',
                    paddingBottom:'30%'}}> 
        <Pressable title="Mic" onPress={startRecording} style={styles.micFillIcon}>
          <Image source={require('../assets/mic.png')} style={{width:'80%',height:'80%',padding:'7%'}}/>
        </Pressable>
        <Text style={[styles.tapToRecord, styles.tapToRecordClr]}>
          {isRecording ? 'Tap to stop recording' : 'Tap to record'}
        </Text>
      </View>

      {/* <View style={styles.buttonContainer1}> */}
        <View style={styles.buttonContainer}>
          <Pressable title="Inventory" onPress={()=> navigation.navigate('Inventory')} >
            <Image source={require('../assets/folder.png')} style={{width:50,height:50,padding:5}}/>
          </Pressable>
          <Pressable title="Camera" onPress={toggleCamera} >
            <Image source={require('../assets/camera.png')} style={{width:50,height:50,padding:5}}/>
          </Pressable>
          <Pressable title="Settings" onPress={() => navigation.navigate('Settings')} >
            <Image source={require('../assets/settings.png')} style={{width:50,height:50,padding:5}}/>
          </Pressable>
        </View>
      {/* </View> */}
    
      
      
      {isCameraVisible && (
        <Camera style={StyleSheet.absoluteFill} type={Camera.Constants.Type.back} ref={cameraRef}>

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
    backgroundColor:'#d9d9d9',
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
    //left: '15%',
    alignSelf:'center',
    alignItems: 'center',
    fontSize: 15,
    fontFamily: FontFamily.poppinsRegular,
    textAlign: "center",
    width: '70%',
    //height: 16,
    fontWeight: "bold",
    borderColor:'black',
    borderWidth:1,
    borderRadius:20,
    padding:'2%',
    backgroundColor:Color.color1
  },
  buttonContainer: {
    flex:1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:'center',
    marginTop:'10%',
    width:'90%',
    //height:'50%',
    alignSelf:'center',
    backgroundColor:'#aff5ed',
    borderRadius:50,
    padding:'5%',
    marginBottom:'10%',

  },
  
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
    bottom:'20%',
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
    backgroundColor: '#e6fff5',
    flex: 1,
    width: "100%",
    height: 844,
    overflow: "hidden",
  },
  captureButton: {
    //backgroundColor: '#e6fff5',
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
