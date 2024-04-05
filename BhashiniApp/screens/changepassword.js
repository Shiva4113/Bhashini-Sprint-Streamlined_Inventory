import React, { useState } from "react";
import { View, TextInput, Alert, Text } from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New password and confirm password do not match");
      return;
    }
  
    let userID = await SecureStore.getItemAsync("userID");
    console.log("user id from secure store:",userID)
    try {
      const response = await fetch(`http://${process.env.IP_ADDR}:5000/changepassword`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           userId: userID,
           password: oldPassword,
           newPassword: newPassword,
         }),
      });
     
      if (response.status === 200) {
         Alert.alert("Success", "Password changed successfully");
         setOldPassword("");
         setNewPassword("");
         setConfirmPassword("");
      } else {
         Alert.alert("Error", "Failed to change password");
      }
     } catch (error) {
      console.log(error)
      Alert.alert("Error", "An error occurred while changing password");
     }
     
  };

  return (
    <View>
      <View>
        <Text style={{ padding: 10 }}>Current Password:</Text>
        <TextInput
          placeholder="Old Password"
          secureTextEntry
          value={oldPassword}
          onChangeText={setOldPassword}
          style={{
            backgroundColor: "white",
            padding: 10,
            borderRadius: 10,
            borderColor: "black",
            borderWidth: 1,
            width: "90%",
            alignSelf: "center",
          }}
        />
      </View>
      <View>
        <Text style={{ padding: 10 }}>New Password:</Text>
        <TextInput
          placeholder="New Password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          style={{
            backgroundColor: "white",
            padding: 10,
            borderRadius: 10,
            borderColor: "black",
            borderWidth: 1,
            width: "90%",
            alignSelf: "center",
          }}
        />
      </View>
      <View>
        <Text style={{ padding: 10 }}>Confirm New Password:</Text>
        <TextInput
          placeholder="Confirm New Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={{
            backgroundColor: "white",
            padding: 10,
            borderRadius: 10,
            borderColor: "black",
            borderWidth: 1,
            width: "90%",
            alignSelf: "center",
            marginBottom: 10,
          }}
        />
      </View>
      <Text
        title="Change Password"
        onPress={handleSubmit}
        style={{
          alignSelf: "center",
          textAlign: "center",
          backgroundColor: "#e1fcf9",
          width: "90%",
          borderRadius: 10,
          borderColor: "black",
          borderWidth: 1,
          padding: 10,
          justifyContent: "center",
        }}
      >
        Change Password
      </Text>
    </View>
  );
};

export default ChangePassword;
