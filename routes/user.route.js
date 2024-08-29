import { Router } from "express";
import signUpUser, {
  signInUser,
  googleAuth,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  allLatestBlogsCount,
  createBlog,
  latestBlogs,
  searchBlogs,
  searchBlogsCount,
  trendingBlogs,
} from "../controllers/blog.controller.js";

const router = Router();

router.route("/signup").post(signUpUser);
router.route("/signin").post(signInUser);
router.route("/google-auth").post(googleAuth);
router.route("/create-blog").post(verifyJWT, createBlog);
router.route("/latest-blogs").post(latestBlogs);
router.route("/trending-blogs").get(trendingBlogs);
router.route("/search-blogs").post(searchBlogs);
router.route("/all-latest-blogs-count").post(allLatestBlogsCount);
router.route("/search-blogs-count").post(searchBlogsCount);

export default router;
