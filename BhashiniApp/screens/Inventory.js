import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity } from "react-native";
import axios from "axios";

const Inventory = ({ navigation }) => {
  const [inventoryItems, setInventoryItems] = useState([]);

  useEffect(() => {
    // Fetch inventory items from backend when component mounts
    fetchInventoryItems();
  }, []);

  const fetchInventoryItems = async () => {
    try {
      const response = await axios.get("YOUR_BACKEND_URL/inventory");
      setInventoryItems(response.data);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate("EditItem", { item })}>
      <View style={styles.itemContainer}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text>Quantity: {item.quantity}</Text>
        <Text>Price: ${item.price.toFixed(2)}</Text>
        <Text>Min_quantity: {item.min_quantity}</Text>
        <Text>Max_Quantity: {item.max_quantity}</Text>

      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={inventoryItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<Text style={styles.header}>Inventory</Text>}
      />
      <Button
        title="Add Item"
        onPress={() => navigation.navigate("AddItem")}
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

export default Inventory;
