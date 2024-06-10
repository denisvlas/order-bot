// // const token="6982826990:AAEuE9poDPJxglvX2aylXkrx2v1TdyVKtjc"

// // const TelegramBot = require('node-telegram-bot-api');

// // const bot = new TelegramBot(token, {polling: true});

// // bot.on('message', (msg) => {
// //     const chatId = msg.chat.id;
// //     bot.sendMessage(chatId, 'Received your message');
// // });

// const express = require('express');
// const app = express();
// const port = 3000;

// app.use(express.json());
// const mysql = require("mysql");

// const db = mysql.createConnection({
//     user: "root",
//     host: "localhost",
//     password: "admin",
//     database: "bot",
//   });
// // Endpoint simplu de test
// app.get('/', (req, res) => {
//   res.send('Hello, World!');
// });

// app.get("/products", (req, res) => {
//     const sqlSelectProjects = "SELECT * FROM products";
//     db.query(sqlSelectProjects, (err, result) => {
//       if (err) {
//         return err;
//       }
//       res.json(result);
//     });
//   });

// app.post('/test', (req, res) => {
//   const data = req.body;
//   res.json({
//     message: 'Data received successfully',
//     receivedData: data
//   });
// });

// // Pornirea serverului
// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

const express = require("express");
const app = express();
const admin = require("firebase-admin");
const credentials = require("./key.json");
const multer = require("multer");
const cors = require("cors");


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

admin.initializeApp({
  credential: admin.credential.cert(credentials),
  storageBucket: "orders-1c550.appspot.com",
});
const bucket = admin.storage().bucket();

const db = admin.firestore();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.post("/addProduct", upload.single("image"), async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const file = req.file; // Accesează fișierul încărcat

    // Verificăm dacă s-a încărcat fișierul
    if (!file) {
      console.log("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileName = `products-images/${file.originalname}`;

    // Încarcăm fișierul în Firebase Storage
    const fileUpload = bucket.file(fileName);
    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    // Obținem URL-ul public al imaginii
    const [url] = await fileUpload.getSignedUrl({
      action: "read",
      expires: "03-09-2491",
    });

    // Adăugăm produsul în Firestore
    const newProductRef = db.collection("products").doc();
    await newProductRef.set({
      id: newProductRef.id,
      name: name,
      description: description,
      price: parseFloat(price),
      stock: 1, // Default 1, poate fi modificat ulterior
      imageUrl: url,
    });

    res
      .status(201)
      .json({
        message: "Product added successfully",
        productId: newProductRef.id,
      });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/create", async (req, res) => {
  try {
    const id = req.body.id;
    const userJson = {
      tgId: req.body.tgId,
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    };
    console.log(userJson);

    const response = await db.collection("users").doc(id).set(userJson);
    res.send(response);
  } catch (error) {
    res.send(error);
  }
});

app.get("/read/all", async (req, res) => {
  try {
    const response = await db.collection("products").get();
    let resArr = [];
    response.forEach((doc) => {
      let data = doc.data();
      data.id = doc.id;
      resArr.push(data);
    });
    res.send(resArr);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/images", async (req, res) => {
  try {
    // Obține lista de fișiere din directorul "products-images"
    const [files] = await bucket.getFiles({ prefix: "products-images/" });
    let fileUrls = [];

    for (const file of files) {
      // Obține URL-ul de descărcare
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: "03-09-2491",
      });
      fileUrls.push(url);
    }

    res.json(fileUrls);
  } catch (error) {
    res.status(500).send(error);
  }
});



app.post('/submitOrder', async (req, res) => {
  try {
    const { userId, cart,totalPrice } = req.body;

    const newOrderRef = db.collection('orders').doc();
    await newOrderRef.set({
      id: newOrderRef.id,
      userId: userId,
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      })),
      totalPrice:totalPrice,

      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: 'Order submitted successfully', orderId: newOrderRef.id });
  } catch (error) {
    console.error('Error submitting order:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});



const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


// import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyDScWOng97DJejZPdB08IT66xvpu71uLPA",
//   authDomain: "orders-1c550.firebaseapp.com",
//   projectId: "orders-1c550",
//   storageBucket: "orders-1c550.appspot.com",
//   messagingSenderId: "214286867595",
//   appId: "1:214286867595:web:a12ad779c40bf52d83088e"
// };

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
