import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import axios from "axios"; // Import Axios library
import { useNavigation } from "@react-navigation/native";
import DropDownPicker from "react-native-dropdown-picker"; // Import DropDownPicker

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [open, setOpen] = useState(false);
  const navigation = useNavigation();
  const [language, setLanguage] = React.useState([]);

  const languages = [
    { label: 'English', value: 'en' },
    { label: 'हिन्दी', value: 'hi' }, // Hindi
    { label: 'ગુજરાતી', value: 'gu' }, // Gujarati
    { label: 'தமிழ்', value: '  ta' }, // Tamil
    { label: 'ಕನ್ನಡ', value: 'kn' }, // Kannada
    { label: 'తెలుగు', value: 'te' }, // Telugu
    { label: 'മലയാളം', value: 'ml' } // Malayalam

  ];
  const sendSignupDetails = async () => {
    try {
      const signupData = {
        username: username,
        email: email,
        password: password,
        mobile_no: phoneNumber,
        language: language,
      };
      const response = await fetch(
        `http://192.168.68.104:5000/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(signupData),
        }
      );

      if (response.status === 201) {
        navigation.navigate("Login");
      } else {
        const errorData = await response.json();
        console.error("Signup failed:", errorData);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSignup = () => {
    const phoneNumberRegex = /^[6-9]\d{9}$/;

    if (!phoneNumberRegex.test(phoneNumber)) {
      alert("Please enter a valid Indian phone number.");
      return;
    }

    sendSignupDetails();
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#e6fff5",
      }}
    >
      <View
        style={{
          width: 350,
          borderRadius: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          backgroundColor: "#fff",
          padding: 50,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <Text style={{ color: "#10b981", fontSize: 20 }}>⬅️</Text>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#10b981" }}>
            Create an Account
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ marginBottom: 20, alignItems: "center" }}>
          <Image
            source={require("../assets/mobile-loginpana-1.png")}
            style={{ width: 150, height: 150, resizeMode: "cover" }}
          />
        </View>
        <View style={{ marginBottom: 20 }}>
          <TextInput
            style={{
              width: "100%",
              padding: 10,
              borderWidth: 2,
              borderColor: "#10b981",
              borderRadius: 10,
              backgroundColor: "#ccffeb",
            }}
            placeholder="ENTER USERNAME"
            value={username}
            onChangeText={setUsername}
          />
        </View>
        <View style={{ marginBottom: 20 }}>
          <TextInput
            style={{
              width: "100%",
              padding: 10,
              borderWidth: 2,
              borderColor: "#10b981",
              borderRadius: 10,
              backgroundColor: "#ccffeb",
            }}
            placeholder="ENTER EMAIL"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View style={{ marginBottom: 20 }}>
          <TextInput
            style={{
              width: "100%",
              padding: 10,
              borderWidth: 2,
              borderColor: "#10b981",
              borderRadius: 10,
              backgroundColor: "#ccffeb",
            }}
            placeholder="ENTER PASSWORD"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
        </View>
        <View style={{ marginBottom: 20 }}>
          <TextInput
            style={{
              width: "100%",
              padding: 10,
              borderWidth: 2,
              borderColor: "#10b981",
              borderRadius: 10,
              backgroundColor: "#ccffeb",
            }}
            placeholder="ENTER PHONE NUMBER"
            keyboardType="numeric"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>
        <View style={{ marginBottom: 20 }}>
          <DropDownPicker
            open={open} // Control the open state of the dropdown
            value={language} // The current selected value
            items={languages} // The list of items to display in the dropdown
            setOpen={setOpen} // A function to change the open state
            setValue={setLanguage} // A function to change the selected value
            setItems={() => {}} // A function to change the items
            containerStyle={{ height: 40, width: "100%", alignSelf: "center" }}
            style={{ backgroundColor: "#e1fcf9" }}
            itemStyle={{
              justifyContent: "flex-start",
            }}
            dropDownStyle={{ backgroundColor: "#e1fcf9" }}
            onChangeItem={(item) => setLanguage(item.value)} // Update the selected language
            placeholder="Select Language" // Add the placeholder text
            placeholderStyle={{
              // Optional: Style the placeholder text
              color: "grey",
              fontWeight: "bold",
            }}
          />
        </View>
        <TouchableOpacity
          onPress={handleSignup}
          style={{
            width: "100%",
            padding: 15,
            borderRadius: 10,
            backgroundColor: "#10b981",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 18 }}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={{ color: '#10b981' ,marginTop:20,textAlign: 'right'}}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
