import asyncHandler from "../utils/asyncHandler.js";
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
  console.log(blogId);

  return res.json({ status: "done" });
});
