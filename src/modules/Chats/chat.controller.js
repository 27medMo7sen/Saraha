import { chatModel } from "../../../DB/Models/chat.model.js";
import { userModel } from "../../../DB/Models/user.model.js";
import { getIo } from "../../utils/ioGeneration.js";
import { generateToken } from "../../utils/tokenFunctions.js";
// //MARK:SEND MESSAGE TO PUBLIC
export const sendMessageToPublic = async (req, res, next) => {
  const { _id } = req.authUser;
  const { content, sendTo } = req.body;
  const user = await userModel.findOne({ username: sendTo });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  const chat = await chatModel.findOne({
    $or: [{ starter: _id, receiver: user._id }, { merged: true }],
  });
  if (!chat) {
    console.log("chat not found");
    const newChat = new chatModel({
      starter: _id,
      receiver: user._id,
      messages: [{ sender: _id, message: content }],
    });
    await newChat.save();
    getIo().emit("chatMessage", { message: content, sender: _id });
    return res.status(200).json({ message: "Done", newChat });
  }
  chat.messages.push({ sender: _id, message: content });
  await chat.save();
  getIo().emit("chatMessage", { message: content, sender: _id });
  return res.status(200).json({ message: "Done", chat });
};
//MARK: SEND MESSAGE TO PRIVATE
export const sendMessageToPrivate = async (req, res, next) => {
  const { chatId } = req.params;
  const { _id } = req.authUser;
  const { content } = req.body;
  const chat = await chatModel.findById(chatId);
  if (!chat) {
    return next(new Error("Chat not found", { cause: 404 }));
  }
  chat.messages.push({ sender: _id, message: content });
  await chat.save();
  getIo().emit("chatMessage", { message: content, sender: _id });
  return res.status(200).json({ message: "Done", chat });
};
//MARK:GET PRIVET CHAT
export const getChat = async (req, res, next) => {
  const { chatId } = req.params;
  const chat = await chatModel.findById(chatId);
  if (!chat) {
    return next(new Error("Chat not found", { cause: 404 }));
  }
  return res.status(200).json({ message: "Done", chat });
};
//MARK:GET PUBLIC CHAT
export const getPublicChat = async (req, res, next) => {
  const { _id } = req.authUser;
  const { username } = req.params;
  const user = await userModel.findOne({
    username,
  });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  const chat = await chatModel.findOne({
    $or: [{ starter: _id, receiver: user._id }, { merged: true }],
  });
  return res.status(200).json({ message: "Done", chat });
};
//MARK:DELETE MESSAGE
export const deleteMessages = async (req, res, next) => {
  const { chatId } = req.params;
  const { messageIdx } = req.query;
  const chat = await chatModel.findById(chatId);
  if (!chat) {
    return next(new Error("Chat not found", { cause: 404 }));
  }
  chat.messages.splice(messageIdx, 1);
  await chat.save();
  return res.status(200).json({ message: "Done", chat });
};
//MARK:UPDATE MESSAGE
export const updateMessage = async (req, res, next) => {
  const { chatId } = req.params;
  const { messageIdx } = req.query;
  const { content } = req.body;
  const chat = await chatModel.findById(chatId);
  if (!chat) {
    return next(new Error("Chat not found", { cause: 404 }));
  }
  chat.messages[messageIdx].message = content;
  await chat.save();
  return res.status(200).json({ message: "Done", chat });
};
//MARK:MERGE CHAT
export const mergeChat = async (req, res, next) => {
  const { chatId } = req.params;
  const chat = await chatModel.findById(chatId);
  if (!chat) {
    return next(new Error("Chat not found", { cause: 404 }));
  }
  const chat1 = await chatModel.findOne({
    starter: chat.receiver,
    receiver: chat.starter,
  });
  if (!chat1) {
    chat.merged = true;
    await chat.save();
    return res.status(200).json({ message: "Done", chat });
  }

  chat1.messages = chat1.messages
    .concat(chat.messages)
    .sort((a, b) => a.sentAt - b.sentAt);
  await chat1.save();
  await chat.remove();
  return res.status(200).json({ message: "Done", chat1 });
};
