
// I have used this file to play the audio that was stored....just for implementation purpose...doesnt include in the main project

import React, { useEffect } from 'react';
import { View, Button } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const PlayAudioFile = () => {
  useEffect(() => {
    // Load the audio file
    const loadAudio = async () => {
      try {
        // Get the URI of the audio file
        const audioFileUri = 'file:///data/user/0/host.exp.exponent/files/GeneratedAudio.wav';

        // Check if the file exists
        const fileInfo = await FileSystem.getInfoAsync(audioFileUri);
        if (!fileInfo.exists) {
          console.error('Audio file does not exist.');
          return;
        }

        // Create a sound object
        const { sound } = await Audio.Sound.createAsync({ uri: audioFileUri });

        // Play the audio file
        await sound.playAsync();
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    };

    // Call the function to load and play the audio file
    loadAudio();

    // Cleanup function
    return () => {
      // Unload the audio file when component unmounts
      Audio.Sound.unloadAsync();
    };
  }, []);

  return <View />;
};

export default PlayAudioFile;
