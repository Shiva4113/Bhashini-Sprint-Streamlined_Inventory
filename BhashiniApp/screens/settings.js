import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Settings = () => {
  const navigation = useNavigation();

  const navigateToLanguageSelection = () => {
    navigation.navigate('LanguageSelection');
  };

  const doUserLogOut = async () => {
    // Logout functionality
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
