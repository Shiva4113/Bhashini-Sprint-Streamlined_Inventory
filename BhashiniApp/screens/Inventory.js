import React, { useState } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet } from "react-native";

const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState([
    { id: "1", name: "Item 1", quantity: 10 },
    { id: "2", name: "Item 2", quantity: 15 },
    { id: "3", name: "Item 3", quantity: 20 },
    { id: "4", name: "Item 4", quantity: 5 },
    { id: "5", name: "Item 5", quantity: 8 },
    { id: "6", name: "Item 6", quantity: 12 },
    { id: "7", name: "Item 7", quantity: 18 },
    { id: "8", name: "Item 8", quantity: 3 },
    { id: "9", name: "Item 9", quantity: 7 },
    { id: "10", name: "Item 10", quantity: 9 },
    { id: "11", name: "Item 11", quantity: 11 },
    { id: "12", name: "Item 12", quantity: 14 },
    { id: "13", name: "Item 13", quantity: 16 },
    { id: "14", name: "Item 14", quantity: 19 },
    { id: "15", name: "Item 15", quantity: 4 },
  ]);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.name}</Text>
      <View style={styles.quantityContainer}>
        <Button title="-" onPress={() => decreaseQuantity(item.id)} />
        <TextInput
          style={styles.quantityInput}
          value={item.quantity.toString()}
          onChangeText={(text) => updateQuantity(item.id, text)}
          keyboardType="numeric"
        />
        <Button title="+" onPress={() => increaseQuantity(item.id)} />
      </View>
    </View>
  );

  const updateQuantity = (itemId, newQuantity) => {
    const updatedItems = inventoryItems.map((item) =>
      item.id === itemId ? { ...item, quantity: parseInt(newQuantity) || 0 } : item
    );
    setInventoryItems(updatedItems);
  };

  const increaseQuantity = (itemId) => {
    const updatedItems = inventoryItems.map((item) =>
      item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
    );
    setInventoryItems(updatedItems);
  };

  const decreaseQuantity = (itemId) => {
    const updatedItems = inventoryItems.map((item) =>
      item.id === itemId && item.quantity > 0 ? { ...item, quantity: item.quantity - 1 } : item
    );
    setInventoryItems(updatedItems);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={inventoryItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<Text style={styles.header}>Inventory</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0fff4', // Light green background color
     // Center items horizontally
  },
  itemContainer: {
    backgroundColor: '#ccffeb', // Light green background color for item container
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center', // Center items horizontally
  },
  header: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  itemName: {
    fontSize: 18,
    marginBottom: 5,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: "gray",
    width: 50,
    textAlign: "center",
    marginHorizontal: 5,
  },
});

export default Inventory;
