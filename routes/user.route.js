import { Router } from "express";
import signUpUser, {
  signInUser,
  googleAuth,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  createBlog,
  latestBlogs,
  trendingBlogs,
} from "../controllers/blog.controller.js";

const router = Router();

router.route("/signup").post(signUpUser);
router.route("/signin").post(signInUser);
router.route("/google-auth").post(googleAuth);
router.route("/create-blog").post(verifyJWT, createBlog);
router.route("/latest-blogs").get(latestBlogs);
router.route("/trending-blogs").get(trendingBlogs);

export default router;
