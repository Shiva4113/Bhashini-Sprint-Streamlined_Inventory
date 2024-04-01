//this is for the signup validation....ensure the connection with atlas

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

// Connect to MongoDB Atlas (replace 'your_connection_string' with your actual connection string)
mongoose.connect('your_connection_string', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Define a schema for user data
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

// Create a model for user data
const User = mongoose.model('User', userSchema);

// Endpoint to handle sign-up validation
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if a user with the provided username exists in the database
    const user = await User.findOne({ username });

    if (!user) {
      // User not found, return an error
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the provided password matches the password stored in the database
    if (password !== user.password) {
      // Passwords do not match, return an error
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Validation successful, return success message
    return res.status(200).json({ message: 'Sign-up details validated successfully' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
