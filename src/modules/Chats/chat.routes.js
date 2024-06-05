import { Router } from "express";
const router = Router();

import * as mc from "./chat.controller.js";
import { asyncHandler } from "../../utils/errorhandling.js";
import { isAuth } from "../../middlewares/auth.js";
router.post("/:chatId", isAuth(), asyncHandler(mc.sendMessageToPrivate));
router.post("/merge/:chatId", asyncHandler(mc.mergeChat));
router.get("/public/:username", isAuth(), asyncHandler(mc.getPublicChat));
router.post("/", isAuth(), asyncHandler(mc.sendMessageToPublic));
router.get("/private/:chatId", isAuth(), asyncHandler(mc.getChat));
router.patch("/:chatId", isAuth(), asyncHandler(mc.updateMessage));
router.delete("/:chatId", isAuth(), asyncHandler(mc.deleteMessages));
// router.get("/all", asyncHandler(mc.getAllMessages));
export default router;
