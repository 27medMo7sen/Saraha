import { chatModel } from "../../../DB/Models/chat.model.js";
import { userModel } from "../../../DB/Models/user.model.js";
import {
  getIo,
  usersSocket,
  getIsRead,
  setIsRead,
} from "../../utils/ioGeneration.js";
// //MARK:SEND MESSAGE TO PUBLIC
export const sendMessageToPublic = async (req, res, next) => {
  const { userId, _id } = req.authUser;
  const { content, sendTo } = req.body;
  const user = await userModel.findOne({ userId: sendTo });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  const chat = await chatModel.findOne({
    $or: [{ starter: userId, receiver: sendTo }, { merged: true }],
  });
  getIo().to(usersSocket[sendTo]).emit("areYouHere", { userId });
  setTimeout(async () => {
    console.log(getIsRead(), "is read");
    if (!chat) {
      console.log("chat not found");
      const newChat = new chatModel({
        starter: userId,
        receiver: sendTo,
        starterId: _id,
        receiverId: user._id,
        messages: [
          {
            sender: userId,
            receiver: sendTo,
            message: content,
            read: getIsRead(),
          },
        ],
      });
      await newChat.save();
      getIo()
        .to(usersSocket[userId])
        .emit("chatMessage", {
          message: content,
          sender: userId,
          receiver: sendTo,
          sentAt: new Date(
            new Date().getTime() - new Date().getTimezoneOffset() * 60000
          ),
        });
      getIo()
        .to(usersSocket[sendTo])
        .emit("chatMessage", {
          message: content,
          sender: userId,
          receiver: sendTo,
          sentAt: new Date(
            new Date().getTime() - new Date().getTimezoneOffset() * 60000
          ),
        });
      return res.status(200).json({ message: "Done", newChat });
    }
    getIo()
      .to(usersSocket[userId])
      .emit("chatMessage", {
        message: content,
        sender: userId,
        receiver: sendTo,
        sentAt: new Date(
          new Date().getTime() - new Date().getTimezoneOffset() * 60000
        ),
      });
    getIo()
      .to(usersSocket[sendTo])
      .emit("chatMessage", {
        message: content,
        sender: userId,
        receiver: sendTo,
        sentAt: new Date(
          new Date().getTime() - new Date().getTimezoneOffset() * 60000
        ),
      });
    getIo()
      .to(usersSocket[sendTo])
      .emit("updateAnonymousChats", {
        userId: userId,
        lastMessage: `${chat.messages[chat.messages.length - 1].message} `,
        updatedAt:new Date(
          new Date().getTime() - new Date().getTimezoneOffset() * 60000
        ),
      });
    chat.messages.push({
      sender: userId,
      receiver: sendTo,
      message: content,
      read: getIsRead(),
    });
    await chat.save();
    return res.status(200).json({ message: "Done", chat });
  }, 5);
};
//MARK: SEND MESSAGE TO PRIVATE
export const sendMessageToPrivate = async (req, res, next) => {
  const { userIdS } = req.params;
  const { userId } = req.authUser;
  const { content } = req.body;
  const chat = await chatModel.findOne({
    starter: userIdS,
    receiver: userId,
    merged: false,
  });
  if (!chat) {
    return next(new Error("Chat not found", { cause: 404 }));
  }
  const socket = getIo();

  if (usersSocket[userIdS]) {
    socket.to(usersSocket[userIdS]).emit("areYouHere", { userId });
  }
  setTimeout(async () => {
    console.log(getIsRead(), "is read");
    chat.messages.push({
      sender: userId,
      receiver: userIdS,
      message: content,
      read: getIsRead(),
    });
    await chat.save();
    getIo()
      .to(usersSocket[userIdS])
      .emit("chatMessage", {
        message: content,
        sender: userId,
        receiver: userIdS,
        sentAt: chat.messages[chat.messages.length - 1].sentAt,
      });
    getIo()
      .to(usersSocket[userId])
      .emit("chatMessage", {
        message: content,
        sender: userId,
        receiver: userIdS,
        sentAt: chat.messages[chat.messages.length - 1].sentAt,
      });
    getIo()
      .to(usersSocket[userIdS])
      .emit("updatePublicChats", {
        userId: userId,
        lastMessage: `${chat.messages[chat.messages.length - 1].message} `,
        updatedAt: chat.messages[chat.messages.length - 1].sentAt,
      });
    setIsRead(false);
    return res.status(200).json({ message: "Done", chat });
  }, 5);
};
//MARK:GET CHAT
export const getChat = async (req, res, next) => {
  const { userId } = req.authUser;
  const { userIdS } = req.params;
  console.log(userIdS);
  const chat = await chatModel.findOne({
    receiver: userId,
    starter: userIdS,
    merged: false,
  });
  console.log(chat);
  for (let i = 0; i < chat.messages.length; i++) {
    if (chat.messages[i].sender.toString() !== userId.toString()) {
      chat.messages[i].read = true;
      console.log(chat.messages[i].sender, userId);
    }
  }
  await chat.save();

  return res.status(200).json({ message: "Done", chat });
};
//MARK:GET PUBLIC CHAT
export const getPublicChat = async (req, res, next) => {
  const { userId } = req.authUser;
  const { userIdR } = req.params;
  console.log(userId);
  const chat = await chatModel.findOne({
    $or: [
      { receiver: userIdR, starter: userId, merged: false },
      { merged: true },
    ],
  });
  for (let i = 0; i < chat.messages.length; i++) {
    if (chat.messages[i].sender !== userId) {
      chat.messages[i].read = true;
    }
  }
  await chat.save();
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
