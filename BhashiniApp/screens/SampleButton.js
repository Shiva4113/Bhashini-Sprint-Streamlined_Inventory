import React, { useState } from 'react';
import { Button, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function MyScreen() {
 const navigation = useNavigation();
 const [loading, setLoading] = useState(false);

 const handleButtonPress = async () => {
    setLoading(true);
    try {
      // Replace this URL with your backend endpoint
      const response = await fetch('https://your-backend-url.com/api/endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Your request body
        }),
      });

      if (response.ok) {
        // If the response is successful, navigate to the next screen
        navigation.navigate('NextScreen');
      } else {
        // Handle error response
        console.error('Request failed');
      }
    } catch (error) {
      // Handle network errors
      console.error('Network error', error);
    } finally {
      setLoading(false);
    }
 };

 return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button
        title="Press me"
        onPress={handleButtonPress}
        disabled={loading}
      />
    </View>
 );
}

