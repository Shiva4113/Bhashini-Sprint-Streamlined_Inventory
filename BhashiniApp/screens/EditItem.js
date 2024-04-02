import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store'

let itemName = SecureStore.getItemAsync("itemName");
let userID = SecureStore.getItemAsync("userID");
console.log()
const EditItem = ({ route }) => {
  const { item } = route.params;
  const [editedItem, setEditedItem] = useState({
    name : item.item_name || "",
    quantity : item.item_qty || 0,
    price : item.item_price || 0.0,
    min_quantity: item.item_min || 0, 
    max_quantity: item.item_max || 0, 
  });

  const handleSave = async () => {
    try {
       const response = await fetch('http://192.168.68.104:5000/edititem', {
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
   

  const fetchItems = async () => {
    try {

      const response = await fetch('http://10.1.1.58:5000/fetchitem', {
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
        value={(editedItem.quantity ?? '').toString()}
        onChangeText={(text) => setEditedItem({ ...editedItem, quantity: text })}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Min Quantity:</Text>
      <TextInput
        style={styles.input}
        value={(editedItem.min_quantity ?? '').toString()}
        onChangeText={(text) => setEditedItem({ ...editedItem, min_quantity: text })}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Max Quantity:</Text>
      <TextInput
        style={styles.input}
        value={(editedItem.max_quantity ?? '').toString()}
        onChangeText={(text) => setEditedItem({ ...editedItem, max_quantity: text })}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Price:</Text>
      <TextInput
        style={styles.input}
        value={(editedItem.price ?? '').toString()}
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
