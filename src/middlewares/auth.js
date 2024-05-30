import { userModel } from "../../DB/Models/user.model.js";
import { generateToken, verifyToken } from "../utils/tokenFunctions.js";

export const isAuth = () => {
  return async (req, res, next) => {
    try {
      const { authorization } = req.headers;
      let refreshed = 0;
      if (!authorization) {
        return next(new Error("Please login first", { cause: 400 }));
      }

      if (!authorization.startsWith("Saraha")) {
        return next(new Error("invalid token prefix", { cause: 400 }));
      }

      const splitedToken = authorization.split(" ")[1];

      try {
        const decodedData = verifyToken({
          token: splitedToken,
          signature: process.env.SIGN_IN_TOKEN_SECRET,
        });

        const findUser = await userModel.findById(
          decodedData._id,
          "email username"
        );
        if (!findUser) {
          return next(new Error("Please SignUp", { cause: 400 }));
        }
        req.authUser = findUser;
        next();
      } catch (error) {
        // token  => search in db
        if (error == "TokenExpiredError: jwt expired") {
          // refresh token
          const user = await userModel.findOne({ token: splitedToken });
          if (!user) {
            return next(new Error("Wrong token", { cause: 400 }));
          }
          // generate new token
          const userToken = generateToken({
            payload: {
              email: user.email,
              firstname: user.firstname,
              username: user.username,
              _id: user._id,
            },
            signature: process.env.SIGN_IN_TOKEN_SECRET,
            expiresIn: "2h",
          });

          if (!userToken) {
            return next(
              new Error("token generation fail, payload canot be empty", {
                cause: 400,
              })
            );
          }

          user.token = userToken;
          req.authUser = user;
          await user.save();
          req.newToken = userToken;
          refreshed = 1;
          console.log("here");
        }
        console.log("there", refreshed);
        if (refreshed === 1) {
          console.log("passed");
          next();
        } else return next(new Error("invalid token", { cause: 500 }));
      }
    } catch (error) {
      console.log(error);
      next(new Error("catch error in auth", { cause: 500 }));
    }
  };
};
