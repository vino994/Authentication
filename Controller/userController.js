// Controller/userController.js
import User from '../Model/userSchema.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '1h';

export const registerNew = async (req,res)=>{
    try {
        const {username,email,password,role} = req.body;

        // Validate fields
        if(!username || !email || !password){
            return res.status(400).json({message:"All fields are required"});
        }

        // Check if email already exists
        const userExists = await User.findOne({ email });
        if(userExists){
            return res.status(400).json({message:"Email already exists"});
        }

        const hashPassword = await bcrypt.hash(password,10);

        const newUser = await User.create({
            username,
            email,
            password: hashPassword,
            role
        });

        // Prepare safe response (toJSON removes password & tokens)
        res.status(201).json({
            message:"User registered successfully",
            data:newUser
        });

    } catch (error) {
        console.log("Register Error: ", error);
        res.status(500).json({message:"Server error"});
    }
}

export const loginUsers = async (req,res)=>{
    try {
        const {email,password} = req.body;
        // Validate fields
        if(!email || !password){
            return res.status(400).json({message:"All fields are required"});
        }

        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({message:"Invalid credentials"});
        }

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid credentials"});
        }

        // generate JWT
        const payload = {
            id: user._id,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

        // Save token record (optional)
        user.tokens = user.tokens || [];
        user.tokens.push({ token });
        await user.save();

        // Return token and safe user object
        res.status(200).json({
            message:"Login successful",
            token,
            data: user // user.toJSON() will hide password
        });
    } catch (error) {
        console.log("Login Error: ", error);
        res.status(500).json({message:"Server error"});
    }
}


// logout route to remove token (if using token storage)
export const logoutUser = async (req, res) => {
  try {
    const token = req.token; // set by auth middleware
    const user = await User.findById(req.user.id);
    if (!user) return res.status(400).json({ message: "User not found" });

    user.tokens = user.tokens.filter(t => t.token !== token);
    await user.save();
    res.json({ message: "Logged out" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}


// Protected route: get current user info
export const getProfile = async (req, res) => {
  try {
    // req.user is attached by auth middleware
    const user = await User.findById(req.user.id).select('-password -tokens');
    if(!user) return res.status(404).json({ message: "User not found" });
    res.json({ data: user });
  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
