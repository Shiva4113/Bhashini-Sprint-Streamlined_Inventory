import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';

const EditItem = ({ route }) => {
  const { item } = route.params;
  const [editedItem, setEditedItem] = useState({
    ...item,
    min_quantity: item.min_quantity || 0, // Default to 0 if min_quantity is undefined
    max_quantity: item.max_quantity || 0, // Default to 0 if max_quantity is undefined
  });

  const handleSave = async () => {
    try {
      // Make a POST request to your backend API endpoint to save the edited item
      const response = await axios.post('http://192.168.68.104:5000/editItem', editedItem);
      console.log('Item edited successfully:', response.data);
      // Handle success response from the backend
    } catch (error) {
      console.error('Error editing item:', error);
      // Handle error
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name:</Text>
      <TextInput
        style={styles.input}
        value={editedItem.name}
        onChangeText={(text) => setEditedItem({ ...editedItem, name: text })}
      />
      <Text style={styles.label}>Quantity:</Text>
      <TextInput
        style={styles.input}
        value={editedItem.quantity.toString()}
        onChangeText={(text) => setEditedItem({ ...editedItem, quantity: parseInt(text) })}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Min Quantity:</Text>
      <TextInput
        style={styles.input}
        value={editedItem.min_quantity.toString()}
        onChangeText={(text) => setEditedItem({ ...editedItem, min_quantity: parseInt(text) })}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Max Quantity:</Text>
      <TextInput
        style={styles.input}
        value={editedItem.max_quantity.toString()}
        onChangeText={(text) => setEditedItem({ ...editedItem, max_quantity: parseInt(text) })}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Price:</Text>
      <TextInput
        style={styles.input}
        value={editedItem.price.toString()}
        onChangeText={(text) => setEditedItem({ ...editedItem, price: parseFloat(text) })}
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
