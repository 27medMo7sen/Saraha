import { Router } from "express";
const router = Router();

import * as mc from "./chat.controller.js";
import { asyncHandler } from "../../utils/errorhandling.js";
import { isAuth } from "../../middlewares/auth.js";
router.post("/:userIdS", isAuth(), asyncHandler(mc.sendMessageToPrivate));
router.post("/merge/:chatId", asyncHandler(mc.mergeChat));
// router.get("/publicChats", isAuth(), asyncHandler(mc.getPublicChat));
// router.get("/privateChats", isAuth(), asyncHandler(mc.getPrivateChat));
router.post("/", isAuth(), asyncHandler(mc.sendMessageToPublic));
router.get("/private/:userIdS", isAuth(), asyncHandler(mc.getChat));
router.get("/public/:userIdR", isAuth(), asyncHandler(mc.getPublicChat));
router.patch("/:chatId", isAuth(), asyncHandler(mc.updateMessage));
router.delete("/:chatId", isAuth(), asyncHandler(mc.deleteMessages));
// router.get("/all", asyncHandler(mc.getAllMessages));
export default router;
