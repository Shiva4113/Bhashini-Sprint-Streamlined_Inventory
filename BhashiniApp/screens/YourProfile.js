import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import * as SecureStore from "expo-secure-store";
const YourProfile = () => {
 const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    mobile: 0,
 });

 useEffect(() => {
   const fetchProfileData = async () => {
      try {
        let userID = await SecureStore.getItemAsync("userID");
        console.log("uid:", userID);
    
        const response = await fetch("http://10.1.1.58:5000/profile", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ "userId": userID })
        });
    
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }
        else {
          console.log(response);
        }
    
        const userProfile = await response.json();
        setProfileData(userProfile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    
    fetchProfileData();
 }, []);

 return (
    <View style={styles.container}>
      <Text style={styles.text}>Username: {profileData.username}</Text>
      <Text style={styles.text}>Email: {profileData.email}</Text>
      <Text style={styles.text}>Phone Number: {profileData.mobile}</Text>
    </View>
 );
};

const styles = StyleSheet.create({
 container: {
    paddingTop:10,
    flex: 1,
    //justifyContent: 'center',
    //alignItems: 'center',
    
 },
 text: {
    //fontSize: 18,
    marginBottom: 10,
    padding: 15,
    borderColor:'black',
    borderWidth:1,
    borderRadius:10,
    width:'95%',
    alignSelf:'center',
    backgroundColor:'#e1fcf9'

 },
});

export default YourProfile;