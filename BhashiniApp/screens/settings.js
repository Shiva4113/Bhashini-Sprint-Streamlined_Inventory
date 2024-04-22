import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";

const Settings = () => {
  const navigation = useNavigation();


  const doUserLogOut = async function () {
    try {
      await SecureStore.deleteItemAsync("userID");
      await SecureStore.deleteItemAsync("language");
      navigation.navigate("Login");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  }
  const navigateToLanguageSelection = () => {
    navigation.navigate('LanguageSelection');
  };



  return (
    <View>
      <TouchableOpacity
        onPress={() => navigation.navigate('YourProfile')}
        style={{ marginTop: 20, width: '90%', alignSelf: 'center', borderRadius: 10, borderColor: 'black', borderWidth: 1, padding: 15, backgroundColor: '#e1fcf9' }}
      >
        <Text>Your Profile</Text>
      </TouchableOpacity>
      {/* Other settings options */}
      <TouchableOpacity
        onPress={navigateToLanguageSelection} // Navigate to language selection screen
        style={{ margin: 20, borderRadius: 10, borderColor: 'black', borderWidth: 1, padding: 15, backgroundColor: '#e1fcf9' }}
      >
        <Text>Select Language</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={doUserLogOut}
        style={{ borderRadius: 10, width: '90%', alignSelf: 'center', borderColor: 'black', borderWidth: 1, padding: 15, backgroundColor: '#e1fcf9' }}
      >
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Settings;
