// Model/userSchema.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  role:{
    type:String,
    enum:['user','admin'],
    default:'user'
  },
  tokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

//  when converting to JSON, remove password and tokens
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.tokens;
  return user;
}

const User = mongoose.model("User", userSchema);

export default User;
