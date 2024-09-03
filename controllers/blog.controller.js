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

  if (!draft) {
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

export const latestBlogs = asyncHandler(async (req, res) => {
  let { page } = req.body;
  let maxLimit = 5;
  try {
    let blogs = await Blog.find({ draft: false })
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blog_id title desc banner activity tags publishedAt -_id")
      .skip((page - 1) * maxLimit)
      .limit(maxLimit);
    return res.status(200).json({ blogs });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

export const trendingBlogs = asyncHandler(async (req, res) => {
  let maxLimit = 5;
  try {
    let blogs = await Blog.find({ draft: false })
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({
        "activity.total_reads": -1,
        "activity.total_likes": -1,
        publishedAt: -1,
      })
      .select("blog_id title publishedAt -_id")
      .limit(maxLimit);
    return res.status(200).json({ blogs });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

export const allLatestBlogsCount = asyncHandler(async (req, res) => {
  try {
    const count = await Blog.countDocuments({ draft: false });
    return res.status(200).json({ totalDocs: count });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export const searchBlogsCount = asyncHandler(async (req, res) => {
  try {
    let findQuery;
    let { tag, query } = req.body;
    if (tag) {
      findQuery = { tags: tag, draft: false };
      // console.log(findQuery, "tag");
    } else if (query) {
      findQuery = { draft: false, title: new RegExp(query, "i") };
      console.log(findQuery, "query");
    }
    const count = await Blog.countDocuments(findQuery);
    return res.status(209).json({ totalDocs: count });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
});

export const searchBlogs = asyncHandler(async (req, res) => {
  try {
    let { tag, query, page } = req.body;
    let findQuery;
    if (tag) {
      findQuery = { tags: tag, draft: false };
      // console.log(findQuery, "tag");
    } else if (query) {
      findQuery = { draft: false, title: new RegExp(query, "i") };
      console.log(findQuery, "query");
    }
    // console.log("Find Query:", findQuery);
    let maxLimit = 5;
    let blogs = await Blog.find(findQuery)
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blog_id title desc banner activity tags publishedAt -_id")
      .skip((page - 1) * maxLimit)
      .limit(maxLimit);
    return res.status(200).json({ blogs });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});
