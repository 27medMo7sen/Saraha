import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema(
  {
    starter: {
      type: String,
      required: true,
    },
    receiver: {
      type: String,
      required: true,
    },
    starterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    messages: [
      {
        sender: {
          type: String,
          required: true,
        },
        receiver: {
          type: String,
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        read: {
          type: Boolean,
          default: false,
        },
        sentAt: {
          type: Date,
          default: () =>
            new Date(
              new Date().getTime() - new Date().getTimezoneOffset() * 60000
            ),
        },
      },
    ],
    merged: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const chatModel = mongoose.model("Chat", chatSchema);
