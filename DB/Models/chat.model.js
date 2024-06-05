import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema(
  {
    starter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [
      {
        sender: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        sentAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    merged: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
    },
  },

  {
    timestamps: true,
  }
);

export const chatModel = mongoose.model("Chat", chatSchema);
