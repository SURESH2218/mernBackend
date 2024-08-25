import { Router } from "express";
import signUpUser, { signInUser } from "../controllers/user.controller.js";
import signUpUser, {
  signInUser,
  googleAuth,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/signup").post(signUpUser);
router.route("/signin").post(signInUser);
router.route("/google-auth").post(googleAuth);

export default router;
