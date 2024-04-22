import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const EditItem = ({ route }) => {
 const { item } = route.params;
 const [editedItem, setEditedItem] = useState({
    name: item.item_name || "",
    quantity: item.item_qty || 0,
    price: item.item_price || 0.0,
    min_quantity: item.item_min || 0,
    max_quantity: item.item_max || 0,
 });

 useEffect(() => {
    const fetchAndSetItems = async () => {
      try {
        const userID = await SecureStore.getItemAsync("userID");
        const itemName = await SecureStore.getItemAsync("itemName");

        console.log(userID);

        // Now that we have userID and itemName, we can proceed with fetching items
        await fetchItems(userID, itemName);
      } catch (error) {
        console.error('Error fetching userID or itemName:', error);
      }
    };

    fetchAndSetItems();
 }, []);

 const fetchItems = async (userID, itemName) => {
    try {
      const response = await fetch(`http://${process.env.IP_ADDR}:5000/fetchitem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "userId": userID, "itemName": itemName }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch item');
      }

      const responseData = await response.json();
      if (responseData.length > 0) {
        const fetchedItem = responseData[0];
        setEditedItem({
          name: fetchedItem.item_name,
          quantity: fetchedItem.item_qty,
          min_quantity: fetchedItem.item_min,
          max_quantity: fetchedItem.item_max,
          price: fetchedItem.item_price
        });
      } else {
        console.warn('No item data received.');
      }
    } catch (error) {
      console.error('Error fetching item:', error);
    }
 };

 const handleSave = async () => {
    try {
      const userID = await SecureStore.getItemAsync("userID");
      const itemName = await SecureStore.getItemAsync("itemName");

      console.log(userID);

      const response = await fetch(`http://${process.env.IP_ADDR}:5000/edititem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "userId": userID,
          "itemName": itemName,
          "itemQty": editedItem.quantity,
          "itemMin": editedItem.min_quantity,
          "itemMax": editedItem.max_quantity,
          "itemPrice": editedItem.price
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to edit item');
      }

      const responseData = await response.json();
      console.log('Item edited successfully:', responseData);
      

    } catch (error) {
      console.error('Error editing item:', error);
    }
 };  

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name:</Text>
      <TextInput
        style={styles.input}
        value={editedItem.name ?? ''}
        onChangeText={(text) => setEditedItem({ ...editedItem, name: text })}
      />
      <Text style={styles.label}>Quantity:</Text>
      <TextInput
        style={styles.input}
        value={(editedItem.quantity ?? 0).toString()}
        onChangeText={(text) => setEditedItem({ ...editedItem, quantity: text })}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Min Quantity:</Text>
      <TextInput
        style={styles.input}
        value={(editedItem.min_quantity ?? 0).toString()}
        onChangeText={(text) => setEditedItem({ ...editedItem, min_quantity: text })}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Max Quantity:</Text>
      <TextInput
        style={styles.input}
        value={(editedItem.max_quantity ?? 100).toString()}
        onChangeText={(text) => setEditedItem({ ...editedItem, max_quantity: text })}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Price:</Text>
      <TextInput
        style={styles.input}
        value={(editedItem.price ?? 0.0).toString()}
        onChangeText={(text) => setEditedItem({ ...editedItem, price: text })}
        keyboardType="numeric"
      />
      <Button title="Save" onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default EditItem;
