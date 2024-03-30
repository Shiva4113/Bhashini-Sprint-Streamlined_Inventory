//import * as React from "react";
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios'; // Import axios

const Settings = () => {
 const navigation = useNavigation();
 const [open, setOpen] = useState(false);
 const [language, setLanguage] = React.useState([]);
 const languages = [
    { label: 'English', value: 'English' },
    { label: 'Spanish', value: 'Spanish' },
    { label: 'Portuguese', value: 'Portuguese' },
    { label: 'French', value: 'French' },
    { label: 'German', value: 'German' },
    // Add more languages as needed
 ];

 const doUserLogOut = async function() {
    try {
      // Assuming you have a token stored in localStorage or another secure place
    //   const token = localStorage.getItem('token');

    //   // Construct the request headers, including the token for authentication
    //   const headers = {
    //     'Content-Type': 'application/json',
    //     'Authorization': Bearer ${token}
    //   };

    //   // Send the POST request to the logout endpoint
    //   const response = await axios.post('http://yourbackend.com/api/logout', {}, { headers });

    //   // Handle the response, e.g., clear user data, redirect to login page, etc.
    //   console.log('Logout successful:', response.data);
      // Navigate to the login screen or the first screen of your app
      navigation.navigate('Register'); // Adjust the screen name as necessary
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
 };

 return (
    <View>
      <TouchableOpacity onPress={() => navigation.navigate('YourProfile')} style={{marginTop:20,width:'90%',alignSelf:'center',borderRadius:10, borderColor:'black',borderWidth:1,padding:15,backgroundColor: '#e1fcf9'}}>
        <Text>Your Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('ChangePassword')} style={{margin:20,borderRadius:10, borderColor:'black',borderWidth:1,padding:15,backgroundColor: '#e1fcf9'}}>
        <Text>Change Password</Text>
      </TouchableOpacity>
      <DropDownPicker
        open={open} // Control the open state of the dropdown
        value={language} // The current selected value
        items={languages} // The list of items to display in the dropdown
        setOpen={setOpen} // A function to change the open state
        setValue={setLanguage} // A function to change the selected value
        setItems={() => {}} // A function to change the items
        containerStyle={{height: 40,width:'90%',alignSelf:'center'}}
        style={{backgroundColor: '#e1fcf9'}}
        itemStyle={{
          justifyContent: 'flex-start'
        }}
        dropDownStyle={{backgroundColor: '#e1fcf9'}}
        onChangeItem={item => setLanguage(item.value)} // Update the selected language
        placeholder="Select Language" // Add the placeholder text
        placeholderStyle={{ // Optional: Style the placeholder text
          color: "grey",
          fontWeight: "bold"
        }}
      />
      <TouchableOpacity onPress={doUserLogOut} style={{margin:20,marginTop:30,borderRadius:10, borderColor:'black',borderWidth:1,padding:15,backgroundColor: '#e1fcf9'}}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
 );
};

export default Settings;
