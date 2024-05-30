import { msgModel } from "../../../DB/Models/message.model.js";
import { userModel } from "../../../DB/Models/user.model.js";

//MARK:SEND MESSAGE
export const sendMessage = async (req, res, next) => {
  const { _id } = req.authUser;
  const { content, sendTo } = req.body;

  const isUserExists = await userModel.findById(sendTo);
  if (!isUserExists) {
    return next(new Error("invalid account", { cause: 400 }));
  }

  const message = new msgModel({ content, sendTo, sentBy: _id });
  await message.save();
  res.status(201).json({ message: "Done", message });
};
//MARK:GET MESSAGES
export const getUserMessages = async (req, res, next) => {
  const { _id } = req.authUser;
  const messages = await msgModel.find({ sendTo: _id });
  if (messages.length) {
    return res.status(200).json({ message: "Done", messages });
  }
  res.status(200).json({ message: "empty inbox" });
};
//MARK:DELETE MESSAGE
export const deleteMessages = async (req, res, next) => {
  const { _id } = req.authUser;
  const { msgId } = req.params;
  const message = await msgModel.findOneAndDelete({
    _id: msgId,
    sendTo: _id,
  });

  if (message) {
    return res.status(200).json({ message: "Done" });
  }
  return next(new Error("Unauthorized to delete this message", { cause: 400 }));
};
//MARK:UPDATE MESSAGE
export const updateMessage = async (req, res, next) => {
  const { _id } = req.authUser;
  const { msgId } = req.params;
  const { content } = req.body;
  const message = await msgModel.findOneAndUpdate(
    { _id: msgId, sentBy: _id },
    { content },
    { new: true }
  );

  if (message) {
    return res.status(200).json({ message: "Done", message });
  }
  return next(new Error("Unauthorized to update this message", { cause: 400 }));
};
//MARK:GET MESSAGE
export const getAllMessages = async (req, res, next) => {
  const messages = await msgModel.find();
  res.status(200).json({ message: "Done", messages });
};
