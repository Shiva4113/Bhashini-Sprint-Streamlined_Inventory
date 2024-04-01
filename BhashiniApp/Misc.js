// import {RNFFmpeg} from 'react-native-ffmpeg';
ffmpeg = require("react-native-ffmpeg")
rnff = ffmpeg.RNFFmpeg
const convertToMp3 = async (inputFilePath, outputFilePath) => {
  try {
    // Execute FFmpeg command to convert .3gpp to mp3
    const result = await RNFFmpeg.execute(`-i ${inputFilePath} ${outputFilePath}`);
    console.log('FFmpeg result: ', result);
  } catch (error) {
    console.error('FFmpeg conversion error: ', error);
  }
};

// Usage
convertToMp3('C:/Users/shiva/Desktop/PESU/SEM IV/Bhashini-Sprint/Bhashini-Sprint-Streamlined_Inventory/audio.3gp', 'C:/Users/shiva/Desktop/PESU/SEM IV/Bhashini-Sprint/Bhashini-Sprint-Streamlined_Inventory/audio1.mp3');
