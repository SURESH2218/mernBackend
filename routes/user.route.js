import { Router } from "express";
import signUpUser, {
  signInUser,
  googleAuth,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createBlog } from "../controllers/blog.controller.js";

const router = Router();

router.route("/signup").post(signUpUser);
router.route("/signin").post(signInUser);
router.route("/google-auth").post(googleAuth);
router.route("/create-blog").post(verifyJWT, createBlog);

export default router;
