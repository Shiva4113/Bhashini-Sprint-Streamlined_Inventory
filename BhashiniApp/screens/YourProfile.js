import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import axios from 'axios';

const YourProfile = () => {
 const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
 });

 useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Replace 'YOUR_API_ENDPOINT' with your actual API endpoint
        const response = await axios.get('...');
        setProfileData(response.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
 }, []);

 return (
    <View style={styles.container}>
      <Text style={styles.text}>Username: {profileData.username}</Text>
      <Text style={styles.text}>Email: {profileData.email}</Text>
      <Text style={styles.text}>Phone Number: {profileData.phoneNumber}</Text>
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