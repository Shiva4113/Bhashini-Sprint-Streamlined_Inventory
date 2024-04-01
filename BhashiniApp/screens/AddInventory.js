import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import axios from "axios";

const AddInventory = ({ navigation }) => {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
  const [maxQuantity, setMaxQuantity] = useState("");

  const addItem = async () => {
    try {
      // Assuming your backend endpoint for adding items is "/inventory"
      await axios.post("YOUR_BACKEND_URL/inventory", {
        name: itemName,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        min_quantity: parseInt(minQuantity),
        max_quantity: parseInt(maxQuantity)
      });
      // Navigate back to the Inventory screen after adding the item
      navigation.goBack();
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
