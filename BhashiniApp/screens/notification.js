import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import axios from 'axios';
import { Notifications } from 'react-native-notifications';

const NotificationsPage = () => {
 const [notifications, setNotifications] = useState([
    { title: 'Test Notification 1', message: 'This is a test notification.' },
    { title: 'Test Notification 2', message: 'Another test notification.' },
    // Add more placeholder notifications as needed
 ]);

 useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Replace 'YOUR_API_ENDPOINT' with your actual API endpoint
        const response = await axios.get('YOUR_API_ENDPOINT');
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    // Register for remote notifications
    Notifications.registerRemoteNotifications();

    // Listen for the remoteNotificationRegistered event to handle the new token
    Notifications.events().registerRemoteNotificationRegistered(event => {
      console.log('Device Token Received', event.deviceToken);
    });

    // Listen for notifications received in the foreground
    Notifications.events().registerNotificationReceivedForeground((notification, completion) => {
      console.log('Notification Received - Foreground', notification);
      completion({ alert: false, sound: false, badge: false });
    });

    // Listen for notifications received in the background
    Notifications.events().registerNotificationReceivedBackground((notification, completion) => {
      console.log('Notification Received - Background', notification);
      completion({ alert: true, sound: true, badge: false });
    });

    // Listen for notifications opened
    Notifications.events().registerNotificationOpened(notification => {
      console.log('Notification opened by device user', notification);
    });

 }, []);

 return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.notificationItem}>
            <Text style={styles.notificationText}>{item.title}</Text>
            <Text style={styles.notificationText}>{item.message}</Text>
          </View>
        )}
      />
    </View>
 );
};

const styles = StyleSheet.create({
 container: {
    flex: 1,
    padding: 20,
 },
 notificationItem: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
 },
 notificationText: {
    fontSize: 16,
 },
});

export default NotificationsPage;
