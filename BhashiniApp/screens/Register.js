import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Modal, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Login() {
  const navigation = useNavigation();

  const handleLogin = () => {
    navigation.navigate('Dashboard');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e6fff5' }}>
      <View style={{ width: 350, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, backgroundColor: '#fff', padding: 50 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <Text style={{ color: '#10b981', fontSize: 20 }}>⬅️</Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#10b981' }}>Let's get started</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ marginBottom: 20, alignItems: 'center' }}>
          {/* Your image component */}
          <Image source={require('../assets/mobile-loginpana-1.png')} style={{ width: 150, height: 150, resizeMode: 'cover' }} />
        </View>
        <View style={{ marginBottom: 20 }}>
          <TextInput style={{ width: '100%', padding: 10, borderWidth: 2, borderColor: '#10b981', borderRadius: 10, backgroundColor: '#ccffeb' }} placeholder="ENTER USERNAME" />
        </View>
        <View style={{ marginBottom: 20 }}>
          <TextInput style={{ width: '100%', padding: 10, borderWidth: 2, borderColor: '#10b981', borderRadius: 10, backgroundColor: '#ccffeb' }} placeholder="ENTER PASSWORD" secureTextEntry={true} />
        </View>
        
        <TouchableOpacity onPress={handleLogin} style={{ width: '100%', padding: 15, borderRadius: 10, backgroundColor: '#10b981', alignItems: 'center', marginTop: 20 }}>
          <Text style={{ color: 'white', fontSize: 18 }}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('signup')}>
          <Text style={{ color: '#10b981' ,marginTop:20,textAlign: 'right'}}>Not a Member? Signup Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
