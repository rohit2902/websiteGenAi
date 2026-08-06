import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const loginUser = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    
    // Check if user already exists
    let user = await userModel.findOne({ email });

    // If not, create a new user
    if (!user) {
      user = await userModel.create({
        name,
        email,
        avatar,
       
      });
    }
 
    
   const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET_KEY,
  {
    expiresIn: "7d",
  }
);

 const isProduction = process.env.NODE_ENV === "production";

 res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

    // Return existing or newly created user
    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};