import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import axios from "axios";
import * as SecureStore from 'expo-secure-store'
const AddInventory = ({ navigation }) => {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
  const [maxQuantity, setMaxQuantity] = useState("");

  const addItem = async () => {
    try {
      let userID = await SecureStore.getItemAsync("userID").catch(error => {
        console.error("Error retrieving userID:", error);
        throw error; 
      });
  
      // Check if any of the fields are empty
      if (!itemName || !quantity || !price || !minQuantity || !maxQuantity) {
        console.error("Error adding item: One or more fields are empty");
        return;
      }
  
      const response = await fetch("http://10.1.1.58:5000/addinv", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userID,
          itemName: itemName,
          itemQty: parseInt(quantity),
          itemPrice: parseFloat(price),
          itemMin: parseInt(minQuantity),
          itemMax: parseInt(maxQuantity)
        }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      navigation.navigate('Inventory');
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Item Name</Text>
      <TextInput
        style={styles.input}
        value={itemName}
        onChangeText={setItemName}
        placeholder="Enter item name"
      />
      <Text style={styles.label}>Quantity</Text>
      <TextInput
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        placeholder="Enter quantity"
      />
      <Text style={styles.label}>Price</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        placeholder="Enter price"
      />
      <Text style={styles.label}>Min Quantity</Text>
      <TextInput
        style={styles.input}
        value={minQuantity}
        onChangeText={setMinQuantity}
        keyboardType="numeric"
        placeholder="Enter min quantity"
      />
      <Text style={styles.label}>Max Quantity</Text>
      <TextInput
        style={styles.input}
        value={maxQuantity}
        onChangeText={setMaxQuantity}
        keyboardType="numeric"
        placeholder="Enter max quantity"
      />
      <Button title="Save" onPress={addItem} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default AddInventory;
