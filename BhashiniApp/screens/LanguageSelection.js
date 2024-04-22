import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios'; // Import axios

const LanguageSelectionScreen = ({ navigation }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [open, setOpen] = useState(false);
  const languages = [
    { label: 'English', value: 'en' },
    { label: 'हिन्दी', value: 'hi' },
    { label: 'ગુજરાતી', value: 'gu' },
    { label: 'தமிழ்', value: 'ta' },
    { label: 'ಕನ್ನಡ', value: 'kn' },
    { label: 'తెలుగు', value: 'te' },
    { label: 'മലയാളം', value: 'ml' },
  ];

  const sendSelectedLanguageToBackend = async () => {
    try {
      // Assuming you have a backend endpoint to receive the selected language
      const response = await axios.post(`http://${process.env.IP_ADDR}:5000/changelanguage`, { language: selectedLanguage });
      console.log('Selected language sent to backend:', selectedLanguage);
      console.log('Response from backend:', response.data);
      // Optionally, you can navigate back to the Settings screen after sending the language
      navigation.navigate('Settings');
    } catch (error) {
      console.error('Error sending selected language to backend:', error.message);
    }
  };

  return (

    <View style={{  alignItems: 'center', }}>
    <Text style={{ marginTop: "25%" ,fontSize:20}}>Select your preferred language</Text>
    <View style={{ marginTop: "10%"}}>
      <DropDownPicker
        open={open}
        value={selectedLanguage}
        items={languages}
        setOpen={setOpen}
        setValue={setSelectedLanguage}
        setItems={() => {}}
        containerStyle={{ height:100, width: '80%', alignSelf: 'center' }}
        style={{ backgroundColor: '#e1fcf9' }}
        itemStyle={{ justifyContent: 'flex-start' }}
        dropDownStyle={{ backgroundColor: '#e1fcf9' }}
        onChangeItem={(item) => setSelectedLanguage(item.value)}
        placeholder="Select Language"
        placeholderStyle={{ color: 'grey', fontWeight: 'bold' }}
      />
    </View>
    <TouchableOpacity 
    onPress={sendSelectedLanguageToBackend} 
    style={{ 
        marginTop:'70%', 
        padding: 20, // Increase padding
        backgroundColor: '#e1fcf9', 
        borderRadius: 10 
    }}
>
    <Text style={{ fontSize: 18 }}>Confirm</Text>
</TouchableOpacity> 
 
  </View>
         
  );
};

export default LanguageSelectionScreen;
