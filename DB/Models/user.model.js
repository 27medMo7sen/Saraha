import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      lowercase: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["female", "male", "not specified"],
      default: "not specified",
    },
    profile_pic: {
      secure_url: String,
      public_id: String,
    },
    coverPictures: [
      {
        secure_url: String,
        public_id: String,
      },
    ],
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    age: {
      type: Number,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    bio: {
      type: String,
      default: "Hi, I'm using Saraha App!",
      required: false,
    },
    state: {
      type: String,
      required: false,
    },
    QrCode: {
      type: String,
    },
    token: {
      type: String,
    },
    forgetCode: {
      type: String,
    },
    flowers: Number,
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const userModel = mongoose.model("User", userSchema);
