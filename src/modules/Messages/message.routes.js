import { Router } from "express";
const router = Router();

import * as mc from "./message.controller.js";
import { asyncHandler } from "../../utils/errorhandling.js";
import { isAuth } from "../../middlewares/auth.js";

router.post("/", isAuth(), asyncHandler(mc.sendMessage));
router.get("/", isAuth(), asyncHandler(mc.getUserMessages));
router.patch("/:msgId", isAuth(), asyncHandler(mc.updateMessage));
router.delete("/:msgId", isAuth(), asyncHandler(mc.deleteMessages));

export default router;
