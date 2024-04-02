import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';

const NotificationsPage = () => {
  const [lowInventoryItems, setLowInventoryItems] = useState([]);

  useEffect(() => {
    fetchLowInventoryItems();
  }, []);

  const fetchLowInventoryItems = async () => {
    try {
      // Fetch inventory items from the backend
      const response = await axios.get("http://10.1.1.58:5000/notif");
      const inventoryItems = response.data;

      // Filter items based on quantity less than min_quantity
      const lowQuantityItems = inventoryItems.filter(item => item.quantity < item.min_quantity);
      setLowInventoryItems(lowQuantityItems);
    } catch (error) {
      console.error("Error fetching low inventory items:", error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text>Quantity: {item.quantity}</Text>
      <Text>Min Quantity: {item.min_quantity}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={lowInventoryItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<Text style={styles.header}>Low Inventory Items</Text>}
        ListEmptyComponent={<Text>No low inventory items found</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0fff4", // Light green background color
  },
  itemContainer: {
    backgroundColor: "#ccffeb", // Light green background color for item container
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignItems: "center", // Center items horizontally
  },
  header: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: "bold",
  },
  itemName: {
    fontSize: 18,
    marginBottom: 5,
  },
});

export default NotificationsPage;
