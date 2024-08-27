import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, decodedToken) => {
      if (err) {
        return res.status(403).json({ error: "Access token is invalid" });
      }
      req.user = decodedToken.id;

      next();
    });
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
