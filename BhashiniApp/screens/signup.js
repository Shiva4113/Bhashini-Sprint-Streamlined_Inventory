import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Modal, Pressable } from 'react-native';
import axios from 'axios'; // Import Axios library
import { useNavigation } from "@react-navigation/native";

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const navigation = useNavigation();

  // Function to send signup details to the backend
  const sendSignupDetails = async () => {
    try {
      // Data to be sent in the POST request
      const signupData = {
        username: username,
        email: email,
        password: password,
        phoneNumber: phoneNumber,
        language: selectedLanguage
      };

      // Send the signup data to the backend API using Axios
      const response = await axios.post('https://localhost:5000/signup', signupData);

      // Check if the request was successful
      if (response.status === 200) {
        // Navigate to the Register screen after successful signup
        navigation.navigate("Register");
      } else {
        console.error('Signup failed:', response.data);
        // Optionally, display an error message to the user
      }
    } catch (error) {
      console.error('Error:', error);
      // Optionally, display an error message to the user
    }
  };

  const handleLanguageSelection = (language) => {
    setSelectedLanguage(language);
    setModalVisible(false);
  };

  const handleSignup = () => {
    // Basic phone number validation for Indian phone numbers
    const phoneNumberRegex = /^[6-9]\d{9}$/; // Regex to match Indian phone numbers
    
    if (!phoneNumberRegex.test(phoneNumber)) {
      // Invalid phone number format
      alert('Please enter a valid Indian phone number.');
      return;
    }

    // Call sendSignupDetails function to send signup data to the backend
    sendSignupDetails();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e6fff5' }}>
      <View style={{ width: 350, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, backgroundColor: '#fff', padding: 50 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <Text style={{ color: '#10b981', fontSize: 20 }}>⬅️</Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#10b981' }}>Create an Account</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ marginBottom: 20, alignItems: 'center' }}>
          <Image source={require('../assets/mobile-loginpana-1.png')} style={{ width: 150, height: 150, resizeMode: 'cover' }} />
        </View>
        <View style={{ marginBottom: 20 }}>
          <TextInput 
            style={{ width: '100%', padding: 10, borderWidth: 2, borderColor: '#10b981', borderRadius: 10, backgroundColor: '#ccffeb' }} 
            placeholder="ENTER USERNAME"
            value={username}
            onChangeText={setUsername}
          />
        </View>
        <View style={{ marginBottom: 20 }}>
          <TextInput 
            style={{ width: '100%', padding: 10, borderWidth: 2, borderColor: '#10b981', borderRadius: 10, backgroundColor: '#ccffeb' }} 
            placeholder="ENTER EMAIL"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View style={{ marginBottom: 20 }}>
          <TextInput 
            style={{ width: '100%', padding: 10, borderWidth: 2, borderColor: '#10b981', borderRadius: 10, backgroundColor: '#ccffeb' }} 
            placeholder="ENTER PASSWORD" 
            secureTextEntry={true} 
            value={password}
            onChangeText={setPassword}
          />
        </View>
        <View style={{ marginBottom: 20 }}>
          <TextInput 
            style={{ width: '100%', padding: 10, borderWidth: 2, borderColor: '#10b981', borderRadius: 10, backgroundColor: '#ccffeb' }} 
            placeholder="ENTER PHONE NUMBER"
            keyboardType="numeric"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>
        <View style={{ marginBottom: 20 }}>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={{ width: '100%', padding: 10, borderWidth: 2, borderColor: '#10b981', borderRadius: 10, backgroundColor: '#ccffeb', alignItems: 'center' }}>
            <Text>{selectedLanguage ? selectedLanguage : 'Select Language'}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleSignup} style={{ width: '100%', padding: 15, borderRadius: 10, backgroundColor: '#10b981', alignItems: 'center' }}>
          <Text style={{ color: 'white', fontSize: 18 }}>Sign Up</Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ width: 300, borderRadius: 10, backgroundColor: '#fff', padding: 20 }}>
            <TouchableOpacity onPress={() => handleLanguageSelection('English')} style={{ marginBottom: 10 }}>
              <Text>English</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleLanguageSelection('Spanish')} style={{ marginBottom: 10 }}>
              <Text>Spanish</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleLanguageSelection('French')} style={{ marginBottom: 10 }}>
              <Text>French</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleLanguageSelection('German')} style={{ marginBottom: 10 }}>
              <Text>German</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleLanguageSelection('Chinese')} style={{ marginBottom: 10 }}>
              <Text>Chinese</Text>
            </TouchableOpacity>
            <Pressable onPress={() => setModalVisible(!modalVisible)} style={{ marginTop: 20 }}>
              <Text style={{ color: '#10b981', textAlign: 'center' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
