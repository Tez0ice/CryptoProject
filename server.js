// server.js
require('dotenv').config(); // 1. Read the .env file
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const path = require('path'); // Add this utility

const app = express();
app.use(cors()); // 2. Allow your web page to talk to this server
app.use(express.json());


// serve the webpage
app.use(express.static('public'));

// 3. Initialize Google AI with the key from .env
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// 4. Create the endpoint your web page will call
app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', // Make sure you have access to this model
      contents: userMessage,
    });

    // Send just the text back to the web page
    res.json({ reply: response.text });
    
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ reply: "I cannot connect to the mainframe right now." });
  }
});

// 5. Start the server
app.listen(3000, () => console.log('✅ Server is running on http://localhost:3000'));