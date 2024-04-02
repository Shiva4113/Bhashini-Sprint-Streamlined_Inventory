import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Button, StyleSheet, TouchableOpacity } from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const Inventory = ({ navigation }) => {
const [inventoryItems, setInventoryItems] = useState([]);
SecureStore.deleteItemAsync("itemName");
 useEffect(() => {
    fetchInventoryItems();
 }, []);

 const fetchInventoryItems = async () => {
  try {
    let userID = await SecureStore.getItemAsync("userID");
    console.log("uid:", userID);

    const response = await fetch("http://10.1.1.58:5000/fetchinv", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ "userId": userID })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch inventory items');
    }

    const responseData = await response.json();
    const itemsArray = responseData.items; // Extract the array from the response object

    if (Array.isArray(itemsArray)) {
      setInventoryItems(itemsArray); // Set inventory items state with the extracted array
    } else {
      console.error("Data fetched is not an array:", itemsArray);
      setInventoryItems([]); // Set inventory items state to an empty array as a fallback
    }
  } catch (error) {
    console.error("Error fetching inventory items:", error);
  }
};


const renderItem = (item) => (
  <TouchableOpacity onPress={() => {console.log(item.item_name);
  navigation.navigate("EditItem", { item });
  SecureStore.setItemAsync("itemName",item.item_name)}}>
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.item_name}</Text>
      <Text>Quantity: {item.item_qty}</Text>
      {typeof item.item_price === 'number' ? ( 
        <Text>Price: {item.item_price.toFixed(2)}/-</Text> 
      ) : (
        <Text>Price: N/A</Text>
        
      )}
      <Text>Min: {item.item_min}</Text>
      <Text>Mix: {item.item_max}</Text>
    </View>
  </TouchableOpacity>
);


 return (
    <View style={styles.container}>
      <ScrollView>
        {inventoryItems.map(item => renderItem(item))}
      </ScrollView>
      <Button
        title="Add Item"
        onPress={() => {
          navigation.navigate("AddItem")}}
      />
    </View>
 );
};

const styles = StyleSheet.create({
 container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0fff4",
 },
 itemContainer: {
    backgroundColor: "#ccffeb",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
 },
 itemName: {
    fontSize: 18,
    marginBottom: 5,
 },
});

export default Inventory;