import { Router } from "express";
const router = Router();

import * as uc from "./user.controller.js";
import { asyncHandler } from "../../utils/errorhandling.js";
import { isAuth } from "../../middlewares/auth.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import { SignUpSchema, UpdateProfileSchema } from "./user.validationSchemas.js";
import { multerCloudFunction } from "../../services/multerCloud.js";
import { allowedExtensions } from "../../utils/allowedExtensions.js";

router.get("/privateChats", isAuth(), asyncHandler(uc.getAnonymousChats));
router.get("/publicChats", isAuth(), asyncHandler(uc.getPublicChats));
router.post("/", validationCoreFunction(SignUpSchema), asyncHandler(uc.SignUp));
router.get("/confirmEmail/:token", asyncHandler(uc.confirmEmail));
router.get("/search", asyncHandler(uc.searchUser));
router.post("/login", uc.SignIn);
router.put(
  "/:username",
  validationCoreFunction(UpdateProfileSchema),
  isAuth(),
  asyncHandler(uc.updateProfile)
);
router.delete("/deleteCover", isAuth(), asyncHandler(uc.deleteCoverPicture));
router.get("/decodeToken", isAuth(), asyncHandler(uc.decodeToken));
router.get("/ALL", asyncHandler(uc.getAllUsers));
router.get("/forgotPassword", asyncHandler(uc.forgotPassword));
router.patch("/resetPassword/:token", asyncHandler(uc.resetPassword));
router.get("/:username", asyncHandler(uc.getUser));
router.post(
  "/profilePic",
  isAuth(),
  multerCloudFunction(allowedExtensions.Image).single("profile"),
  asyncHandler(uc.profilePicture)
);
router.post(
  "/coverPics",
  isAuth(),
  multerCloudFunction(allowedExtensions.Image).fields([
    { name: "cover", maxCount: 1 },
    { name: "cover", maxCount: 2 },
  ]),
  asyncHandler(uc.coverPictures)
);
export default router;
