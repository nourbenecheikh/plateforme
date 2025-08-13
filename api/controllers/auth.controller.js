import User from "../models/user.model.js";
import createError from "../utils/createError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  try {
    console.log("📝 Register attempt with data:", req.body);

    // Vérifications de base
    const { username, email, password, country } = req.body;
    if (!username || !email || !password || !country) {
      console.log("❌ Missing required fields");
      return next(createError(400, "Username, email, password and country are required"));
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      console.log("❌ User already exists");
      return next(createError(409, "User with this email or username already exists"));
    }

    const hash = bcrypt.hashSync(password, 5);
    const newUser = new User({
      ...req.body,
      password: hash,
    });

    console.log("💾 Saving new user...");
    const savedUser = await newUser.save();
    console.log("✅ User created successfully:", savedUser._id);

    res.status(201).json({
      success: true,
      message: "User has been created successfully.",
      userId: savedUser._id
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    console.log("🔐 Login attempt for username:", req.body.username);

    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      console.log("❌ User not found");
      return next(createError(404, "User not found!"));
    }

    const isCorrect = bcrypt.compareSync(req.body.password, user.password);
    if (!isCorrect) {
      console.log("❌ Wrong password");
      return next(createError(400, "Wrong password or username!"));
    }

    if (!process.env.JWT_KEY) {
      console.error("❌ JWT_KEY not found in environment variables");
      return next(createError(500, "Server configuration error"));
    }

    const token = jwt.sign(
      {
        id: user._id,
        isSeller: user.isSeller,
      },
      process.env.JWT_KEY
    );

    const { password, ...info } = user._doc;
    console.log("✅ Login successful for user:", user._id);

    res
      .cookie("accessToken", token, {
        httpOnly: true,
      })
      .status(200)
      .json({
        success: true,
        user: info
      });
  } catch (err) {
    console.error("❌ Login error:", err);
    next(err);
  }
};

export const logout = async (req, res) => {
  try {
    console.log("👋 Logout request");
    res
      .clearCookie("accessToken", {
        sameSite: "none",
        secure: true,
      })
      .status(200)
      .json({
        success: true,
        message: "User has been logged out."
      });
  } catch (err) {
    console.error("❌ Logout error:", err);
    res.status(500).json({
      success: false,
      message: "Error during logout"
    });
  }
};