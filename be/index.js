require('dotenv').config();
const token = process.env.TELEGRAM_BOT_TOKEN;

const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(token, { polling: true });

const express = require("express");
const app = express();
const admin = require("firebase-admin");
const credentials = require(process.env.FIREBASE_CREDENTIALS_PATH);
const multer = require("multer");
const cors = require("cors");
const ngrok = require("ngrok");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


admin.initializeApp({
  credential: admin.credential.cert(credentials),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});
const bucket = admin.storage().bucket();

const db = admin.firestore();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use((req, res, next) => {
  res.setHeader("ngrok-skip-browser-warning", "any-value");
  next();
});

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

    res.status(201).json({
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

let phoneNumber = "";
let chatId = "";

// bot.onText(/\/start/, (msg) => {
//   chatId = msg.chat.id;
//   bot.sendMessage(
//     chatId,
//     'Bine ai venit! Apasă pe butonul "Menu" pentru a deschide meniul.'
//   );
// });

const frontendURL="https://4896-178-168-93-81.ngrok-free.app/?tableId="

bot.onText(/\/start (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const param = match[1]; // Extract the parameter from the /start command
  const tableId = param.replace('table', ''); // Extract table number

  // Generate URL for the web app with tableId
  const webAppUrl = frontendURL+tableId;

  // Define the custom keyboard with a button
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Open Menu",
            web_app: {
              url: webAppUrl,
            },
          },
        ],
      ],
    },
  };

  // Send the message with the custom keyboard
  bot.sendMessage(chatId, "Apasă pe butonul de mai jos pentru a accesa meniul:", keyboard);
});

bot.on("contact", (msg) => {
  phoneNumber = msg.contact.phone_number;
  console.log(msg);
  console.log("User phone number:", phoneNumber);

  // Șterge mesajul de contact din chat
  bot
    .deleteMessage(msg.chat.id, msg.message_id)
    .then(() => {
      console.log("Mesajul de contact a fost șters.");
    })
    .catch((error) => {
      console.error("Eroare la ștergerea mesajului:", error);
    });
});

let order = null;

app.post("/submitOrder", async (req, res) => {
  try {
    const { userId, username, cart, totalPrice } = req.body;
    const newOrderRef = db.collection("orders").doc();
    await newOrderRef.set({
      id: newOrderRef.id,
      userId: userId,
      username: username,
      items: cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      totalPrice: totalPrice,
      phoneNumber: phoneNumber,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    let orderMessage = `\t🍽️Detalii comandă 🍽️\n\n`;
    cart.forEach((item) => {
      orderMessage += `\n🍔Produs: ${item.name}\n❔Cantitate: ${item.quantity}\n💲Preț: ${item.price} MDL \n`;
    });
    orderMessage += `\n💰Preț total: ${totalPrice} MDL\n`;

    // Trimite mesajul de confirmare în chat
    bot
      .sendMessage(userId, orderMessage)
      .then(() => {
        console.log("Mesajul de comandă a fost trimis.");
      })
      .catch((error) => {
        console.error("Eroare la trimiterea mesajului de comandă:", error);
      });
    res
      .status(201)
      .json({
        message: "Order submitted successfully",
        orderId: newOrderRef.id,
      });
  } catch (error) {
    console.error("Error submitting order:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});



app.get("/popular", async (req, res) => {
  try {
    // Obținem toate comenzile
    const ordersSnapshot = await db.collection("orders").get();
    let productCounts = {};

    // Iterăm prin fiecare comandă pentru a număra produsele comandate
    ordersSnapshot.forEach((orderDoc) => {
      const orderData = orderDoc.data();
      orderData.items.forEach((item) => {
        const productId = item.productId;
        if (productCounts[productId]) {
          productCounts[productId] += item.quantity;
        } else {
          productCounts[productId] = item.quantity;
        }
      });
    });

    // Sortăm produsele după numărul de comenzi descrescător
    const sortedProducts = Object.keys(productCounts).sort(
      (a, b) => productCounts[b] - productCounts[a]
    );

    // Obținem detalii despre produsele sortate
    const popularProducts = await Promise.all(
      sortedProducts.map(async (productId) => {
        const productDoc = await db.collection("products").doc(productId).get();
        const productData = productDoc.data();
        return {
          id: productId,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          imageUrl: productData.imageUrl,
          totalOrders: productCounts[productId],
        };
      })
    );

    res.json(popularProducts);
  } catch (error) {
    console.error("Error fetching popular products:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});



const port = process.env.PORT || 3000;

app.listen(port, async () => {
  console.log(`localhost is running on http://localhost:${port}`);
});

