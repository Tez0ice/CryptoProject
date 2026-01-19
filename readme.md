# 🔐 AI Cryptography Game

A web-based educational game where players learn about encryption (Transposition Ciphers) and data integrity (Hashing) by interacting with an AI powered by Google's Gemini models.

## 📂 Project Structure

* **`server.js`**: The backend "bridge." It serves the webpage and handles secure API calls to Google.
* **`public/`**: Contains the frontend game files (`index.html`, `style.css`, `script.js`).
* **`.env`**: Stores your private API key (not shared on GitHub).

---

## 🚀 How to Run Locally

Follow these steps to set up the project on your own computer.

### 1. Prerequisites

Ensure you have **Node.js** installed.

* Type `node -v` in your terminal to check.
* If not installed, download it from [nodejs.org](https://nodejs.org/).

### 2. Install Dependencies

Open your terminal in the `CRYPTOPROJECT` folder and run:

```bash
npm install

```

This will install `express`, `cors`, `dotenv`, and `@google/genai` inside the `node_modules` folder.

### 3. Configure API Key

1. Create a new file in the root folder named `.env` (if it doesn't exist).
2. Get your free API Key from [Google AI Studio](https://aistudio.google.com/).
3. Paste the key into the file. It should look **exactly** like this:

```env
GEMINI_API_KEY=AIzaSyYourActualKeyHere...

```

*(Note: Do not add quotes or spaces. Do not add GOOGLE_CLOUD_PROJECT or other variables unless you are using Vertex AI).*

### 4. Start the Server

Run the following command to turn on the backend:

```bash
node server.js

```

You should see a message saying:

> ✅ Server is running on https://www.google.com/search?q=http://localhost:3000

### 5. Play the Game

Open your web browser (Chrome, Edge, etc.) and visit:
**[http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)**

---

## 🛠 Troubleshooting

**Error: "API keys are not supported by this API"**

* **Cause:** Your `.env` file likely has extra variables like `GOOGLE_CLOUD_PROJECT` or `LOCATION`.
* **Fix:** Delete everything in `.env` except `GEMINI_API_KEY`.

**Error: "429 Resource Exhausted"**

* **Cause:** You hit the rate limit or are using a restricted model.
* **Fix:** Open `server.js` and ensure the model is set to a stable version:
```javascript
model: 'gemini-1.5-flash',

```



**Error: "Cannot GET /"**

* **Cause:** The server cannot find your HTML files.
* **Fix:** Ensure your `index.html`, `style.css`, and `script.js` are inside the `public` folder, and `server.js` contains `app.use(express.static('public'));`.