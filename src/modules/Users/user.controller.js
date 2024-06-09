import { userModel } from "../../../DB/Models/user.model.js";
import bcrypt from "bcrypt";
import { asyncHandler } from "../../utils/errorhandling.js";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("123456_=!ascbhdtel", 10);
import { sendEmailService } from "../../services/sendEmailService.js";
import cloudinary from "../../utils/coludinaryConfigrations.js";
import { generateQrCode } from "../../utils/qrCodeFunction.js";
import { generateToken, verifyToken } from "../../utils/tokenFunctions.js";
import { emailTemplate } from "../../utils/emailTemplate.js";
import { chatModel } from "../../../DB/Models/chat.model.js";

//MARK:SIGNUP
export const SignUp = async (req, res, next) => {
  const {
    firstname,
    lastname,
    username,
    email,
    password,
    gender,
    age,
    phoneNumber,
    bio,
    country,
    state,
  } = req.body;
  const isUserExists = await userModel.findOne({ email });
  if (isUserExists) {
    return res.status(400).json({ message: "Email is already exists" });
  }
  const userId = nanoid();
  const token = generateToken({
    payload: {
      email,
    },
    signature: process.env.CONFIRMATION_EMAIL_TOKEN,
    expiresIn: "1h",
  });

  if (!token) {
    return next(
      new Error("token generation fail, payload canot be empty", {
        cause: 400,
      })
    );
  }

  const confirmLink = `${req.protocol}://${req.headers.host}/user/confirmEmail/${token}`;

  const message = `<a href=${confirmLink}> Click to confirm your email </a>`;

  const isEmailSent = await sendEmailService({
    message,
    to: email,
    subject: "Confiramtion Email",
  });
  if (!isEmailSent) {
    return res
      .status(500)
      .json({ message: "Please try again later or contact teh support team" });
  }
  const qrcode = await generateQrCode({ data: isUserExists });
  const hashedPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS);
  const user = new userModel({
    firstname,
    lastname,
    username,
    email,
    password: hashedPassword,
    gender,
    age,
    QrCode: qrcode,
    phoneNumber,
    bio,
    userId,
    country,
    state,
  });
  await user.save();
  res.status(201).json({ message: "Done", user });
};

//MARK:Confirm email
export const confirmEmail = async (req, res, next) => {
  const { token } = req.params;
  const decodedData = verifyToken({
    token,
    signature: process.env.CONFIRMATION_EMAIL_TOKEN,
  });
  if (!decodedData) {
    return next(
      new Error("token decode fail, invalid token", {
        cause: 400,
      })
    );
  }

  const isConfirmedCheck = await userModel.findOne({
    email: decodedData.email,
  });
  if (isConfirmedCheck.isConfirmed) {
    return res.status(400).json({ message: "Your email is already confirmed" });
  }
  const user = await userModel.findOneAndUpdate(
    { email: decodedData.email },
    { isConfirmed: true },
    {
      new: true,
    }
  );
  res.status(200).json({ message: "Confirmed Done please try to login", user });
};

//MARK:SIGNIN
export const SignIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const isUserExists = await userModel.findOne({ email, isConfirmed: true });
  if (!isUserExists) {
    return next(
      new Error("email user is not exist or your E-mail is not verified")
    );
  }
  const passMatch = bcrypt.compareSync(password, isUserExists.password); // true , false
  if (!passMatch) {
    return next(new Error("password invalid login password", { cause: 400 }));
  }

  const userToken = generateToken({
    payload: {
      useremail: email,
      firstname: isUserExists.firstname,
      username: isUserExists.username,
      _id: isUserExists._id,
    },
    signature: process.env.SIGN_IN_TOKEN_SECRET,
    expiresIn: "2h",
  });

  if (!userToken) {
    return next(
      new Error("token generation fail, payload cannot be empty", {
        cause: 400,
      })
    );
  }
  isUserExists.token = userToken;
  await isUserExists.save();
  await res.cookie("userToken", userToken, {
    // httpOnly: true,
    maxAge: 1000 * 60 * 60 * 48,
    path: "/",
    sameSite: "Lax",
  });

  res.status(200).json({ message: "LoggedIn success", user: isUserExists });
});
//MARK:FORGOT PASSWORD
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) next(new Error("Email not found", { cause: 404 }));
  const code = nanoid();
  await userModel.findOneAndUpdate({ email }, { forgetCode: code });
  const token = generateToken({
    payload: { email, code },
    signature: process.env.FORGET_PASSWORD_TOKEN,
    expiresIn: "1h",
  });

  const confirmationLink = `${req.protocol}://${req.headers.host}/user/resetPassword/${token}`;
  const isEmailSent = sendEmailService({
    to: email,
    subject: "Forget Password",
    message: emailTemplate({
      link: confirmationLink,
      linkData: "click here to reset your password",
      subject: "Forget Password",
    }),
  });

  if (!isEmailSent) next(new Error("Email not sent", { cause: 500 }));

  res.status(200).json({ message: "Email sent successfully", token });
};
//MARK: reset password
export const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  const decode = verifyToken({
    token,
    signature: process.env.FORGET_PASSWORD_TOKEN,
  });
  const user = await userModel.findOne({
    email: decode.email,
    forgetCode: decode.code,
  });
  if (!user)
    next(
      new Error("you've already reseted your password, try to login", {
        cause: 404,
      })
    );
  const hashedPassword = bcrypt.hashSync(newPassword, +process.env.SALT_ROUNDS);
  user.password = hashedPassword;
  user.forgetCode = null;
  const updatedUser = await user.save();
  if (!updatedUser) next(new Error("Password not updated", { cause: 500 }));
  res.status(200).json({ message: "Password updated successfully" });
};
//MARK:UPDATEPROFILE
export const updateProfile = async (req, res, next) => {
  const { userId } = req.params;
  console.log(userId);
  const userExists = await userModel.findOne({ userId });
  if (!userExists) {
    return next(new Error("there is no such user", { cause: 400 }));
  }
  if (req.body.password) {
    req.body.password = bcrypt.hashSync(
      req.body.password,
      +process.env.SALT_ROUNDS
    );
  }
  const user = await userModel.findOneAndUpdate({ userId }, req.body, {
    new: true,
  });
  res.status(200).json({ message: "Done", user });
};

//MARK:GET USER
export const getUser = async (req, res, next) => {
  const { userId } = req.params;
  console.log(userId);
  const user = await userModel.findOne({ userId });

  if (!user) {
    return next(new Error("in-valid userId", { cause: 400 }));
  }
  console.log(user);
  const qrcode = await generateQrCode({
    data: [
      user.username,
      user.age,
      user.phoneNumber,
      user.profile_pic.secure_url,
    ],
  });
  res.status(200).json({ message: "Done", user, qrcode });
};

//MARK: PROFILE PICTURE
export const profilePicture = async (req, res, next) => {
  const { _id } = req.authUser;
  console.log(req.file);
  if (!req.file) {
    return next(new Error("please upload profile picture", { cause: 400 }));
  }
  await cloudinary.api.delete_resources_by_prefix(`Users/profiles/${_id}`);
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `Users/Profiles/${_id}`,
      resource_type: "image",
    }
  );

  const user = await userModel.findByIdAndUpdate(
    _id,
    {
      profile_pic: { secure_url, public_id },
    },
    {
      new: true,
    }
  );

  if (!user) {
    await cloudinary.uploader.destroy(public_id);
    return next(new Error("please try again later", { cause: 400 }));
  } else res.status(200).json({ message: "Done", user });
};
//MARK: COVER PICTURES
export const coverPictures = async (req, res, next) => {
  const { _id } = req.authUser;
  if (!req.files) {
    return next(new Error("please upload pictures", { cause: 400 }));
  }

  const coverImages = [];
  for (const file in req.files) {
    for (const key of req.files[file]) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        key.path,
        {
          folder: `Users/Covers/${_id}`,
          resource_type: "image",
        }
      );
      coverImages.push({ secure_url, public_id });
    }
  }
  const user = await userModel.findById(_id);

  user.coverPictures.length
    ? coverImages.push(...user.coverPictures)
    : coverImages;

  const userNew = await userModel.findByIdAndUpdate(
    _id,
    {
      coverPictures: coverImages,
    },
    {
      new: true,
    }
  );
  res.status(200).json({ message: "Done", userNew });
};
//MARK:GET ALL USERS
export const getAllUsers = async (req, res, next) => {
  const users = await userModel.find({});
  res.status(200).json({ message: "Done", users });
};
export const searchUser = async (req, res, next) => {
  const { username } = req.query;
  const users = await userModel
    .find({ username: { $regex: username, $options: "i" } })
    .limit(20)
    .skip(0)
    .select("userId username -_id");
  res.status(200).json({ message: "Done", users });
};
//MARK:DECODE TOKEN
export const decodeToken = async (req, res, next) => {
  const { _id } = req.authUser;
  const data = await userModel.findById(_id);
  if (!data) return next(new Error("user not found", { cause: 404 }));
  res.status(200).json({ message: "done", data });
};
//MARK:DELETE COVER PICTURE
export const deleteCoverPicture = async (req, res, next) => {
  const { _id } = req.authUser;
  const { secure_url } = req.body;
  console.log(req.body);
  const user = await userModel.findById(_id);
  let public_id;
  if (!user) return next(new Error("user not found", { cause: 404 }));
  for (const cover of user.coverPictures) {
    console.log(cover.secure_url, secure_url);
    if (cover.secure_url === secure_url) {
      public_id = cover.public_id;
      console.log("here");
      await cloudinary.uploader.destroy([cover.public_id]);
    }
  }
  const coverPictures = user.coverPictures.filter(
    (cover) => cover.public_id !== public_id
  );
  const userNew = await userModel.findByIdAndUpdate(
    _id,
    {
      coverPictures,
    },
    {
      new: true,
    }
  );
  res.status(200).json({ message: "Done", userNew });
};
//MARK: GET ALL ANONYMUOS CHATS
export const getAnonymousChats = async (req, res, next) => {
  const { userId } = req.authUser;
  // console.log(req.authUser);
  // console.log(userId);
  const chats = await chatModel
    .find({
      receiver: userId,
      merged: false,
    })
    .sort({ updatedAt: -1 })
    .select("updatedAt starter  _id");
  res.status(200).json({ message: "Done", chats });
};
//MARK: GET PUBLIC CHATS
export const getPublicChats = async (req, res, next) => {
  const { userId } = req.authUser;
  const chats = await chatModel
    .find({
      $or: [{ merged: true }, { starter: userId }],
    })
    .sort({ updatedAt: -1 })
    .populate("starterId receiverId");
  let ret = [];
  for (const chat of chats) {
    let appendList = {};
    if (chat.starter.toString() === userId.toString()) {
      appendList.userId = chat.receiverId.userId;
      appendList.firstname = chat.receiverId.firstname;
      appendList.lastname = chat.receiverId.lastname;
      appendList.profilePicture = chat.receiverId.profile_pic.secure_url
        ? chat.receiverId.profile_pic.secure_url
        : "";
      appendList.updatedAt = chat.updatedAt;
    } else {
      appendList.userId = chat.starterId.userId;
      appendList.firstname = chat.starterId.firstname;
      appendList.lastname = chat.starterId.lastname;
      appendList.profilePicture = chat.starterId.profile_pic.secure_url
        ? chat.starterId.profile_pic.secure_url
        : "";
      appendList.updatedAt = chat.updatedAt;
    }
    appendList.lastMessage = `${
      chat.messages[chat.messages.length - 1].sender == userId ? "you: " : ""
    }${chat.messages[chat.messages.length - 1].message}`;
    let unread = 0;
    for (const message of chat.messages) {
      if (message.sender.toString() !== userId.toString() && !message.read)
        unread++;
    }
    appendList.unread = unread;
    ret.push(appendList);
  }
  res.status(200).json({ message: "Done", ret });
};
