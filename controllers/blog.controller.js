import asyncHandler from "../utils/asyncHandler.js";
import Blog from "../Schema/Blog.js";
import User from "../Schema/User.js";
import { nanoid } from "nanoid";

export const createBlog = asyncHandler(async (req, res) => {
  let authorId = req.user;
  let { title, desc, banner, tags, content, draft } = req.body;
  if (!title.length) {
    return res
      .status(403)
      .json({ error: "You must provide a title to publish the blog" });
  }

  if (!desc.length || desc.length > 200) {
    return res
      .status(403)
      .json({ error: "You must provide blog desc under 200 characters" });
  }

  if (!banner.length) {
    return res
      .status(403)
      .json({ error: "You must provide banner to publish it" });
  }
  if (!content.blocks.length) {
    return res
      .status(403)
      .json({ error: "There must be some blog content to publish it" });
  }
  if (!tags.length || tags.length > 10) {
    return res
      .status(403)
      .json({ error: "provide tags in order to publish it,Maximum - 10" });
  }

  tags = tags.map((tag) => tag.toLowerCase());
  let blogId = title.replace(/[^a-zA-Z0-9]/g, "-").trim() + nanoid();
  let blog = new Blog({
    title,
    desc,
    banner,
    content,
    tags,
    author: authorId,
    blog_id: blogId,
    draft: Boolean(draft),
  });

  try {
    const savedBlog = await blog.save();
    let incrementalVal = draft ? 0 : 1;

    try {
      await User.findOneAndUpdate(
        { _id: authorId },
        {
          $inc: { "account_info.total_posts": incrementalVal },
          $push: { blogs: savedBlog.blogId },
        }
      );
    } catch (error) {
      console.error("User update failed:", error);
      return res
        .status(500)
        .json({ error: "Failed to update user: " + error.message });
    }

    return res.json({ status: savedBlog.blog_id });
  } catch (error) {
    console.error("Blog save failed:", error);
    return res
      .status(500)
      .json({ error: "Failed to save blog: " + error.message });
  }
});
