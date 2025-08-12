import path from "path";
import express from "express";
import mongoose from "mongoose";
import userRoute from "./routes/user.route.js";
import gigRoute from "./routes/gig.route.js";
import orderRoute from "./routes/order.route.js";
import conversationRoute from "./routes/conversation.route.js";
import messageRoute from "./routes/message.route.js";
import reviewRoute from "./routes/review.route.js";
import authRoute from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
//import React, { useEffect, useState } from 'react';



const mongoUri = process.env.MONGO_URI;  //
const app = express();

mongoose.set("strictQuery", true);


// Middlewares
app.use(cors({ origin: [
    'http://localhost',      
    'http://localhost:80',   
    'http://localhost:3000',
    'http://localhost:5173'  
  ], credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  res.sendStatus(200);
});
// Routes API
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/gigs", gigRoute);
app.use("/api/orders", orderRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);
app.use("/api/reviews", reviewRoute);

  try {
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    console.log("⌛ Attempting to connect to MongoDB at:", mongoUri);

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 secondes timeout
    });

    console.log("✅ Connected to MongoDB!");

    app.listen(8800, '0.0.0.0', () => {
      console.log("🚀 Backend server is running on port 8800!");
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    // Tentative de reconnexion après 5 secondes
    setTimeout(connect, 5000);
  }


connect();
