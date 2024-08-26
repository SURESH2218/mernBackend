import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";
import User from "../Schema/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import serviceAccountKey from "../mern-stack-blog-aee70-firebase-adminsdk-1kp96-96dfe74768.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

dotenv.config();

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

const signUpUser = asyncHandler(async (req, res) => {
  const { fullname, email, password } = req.body;

  if (
    [fullname, email, password].some((field) => !field || field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (fullname.length < 6) {
    throw new ApiError(403, "fullname must be at least 6 letters long");
  }

  if (!emailRegex.test(email)) {
    throw new ApiError(403, "email is invalid");
  }

  if (!passwordRegex.test(password)) {
    throw new ApiError(
      403,
      "Password should be between 6 to 20 characters long with a numeric, 1 lowercase, and 1 uppercase letter"
    );
  }

  try {
    // const existedUser = await User.findOne({ email });
    // if (existedUser) {
    //   throw new ApiError(409, "User with this email already exists");
    // }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = email.split("@")[0];

    const user = new User({
      personal_info: {
        fullname,
        email,
        password: hashedPassword,
        username,
      },
    });

    const savedUser = await user.save();
    if (savedUser) {
      const accessTokenSecret = process.env.SECRET_ACCESS_KEY;
      const refreshTokenSecret = process.env.SECRET_REFRESH_KEY;

      if (!accessTokenSecret || !refreshTokenSecret) {
        throw new ApiError(500, "Secret keys are missing in the environment");
      }

      const accessToken = jwt.sign(
        { id: savedUser._id, email: savedUser.personal_info.email },
        accessTokenSecret,
        { expiresIn: "1h" }
      );

      const refreshToken = jwt.sign(
        { id: savedUser._id, email: savedUser.personal_info.email },
        refreshTokenSecret,
        { expiresIn: "7d" }
      );

      const createdUser = await User.findById(savedUser._id).select(
        "-personal_info.password"
      );

      return res
        .status(201)
        .json(
          new ApiResponse(
            200,
            { user: createdUser, accessToken, refreshToken },
            "User created successfully"
          )
        );
    }
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "User with this email already exists");
    }
    console.error("Error during user creation:", error);
    throw new ApiError(500, "Internal server error");
  }
});

export const signInUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }
    const user = await User.findOne({ "personal_info.email": email });
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      user.personal_info.password
    );

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    const accessToken = jwt.sign(
      { id: user._id, email: user.personal_info.email },
      process.env.SECRET_ACCESS_KEY,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: user._id, email: user.personal_info.email },
      process.env.SECRET_REFRESH_KEY,
      { expiresIn: "7d" }
    );

    const createdUser = await User.findById(user._id).select(
      "-personal_info.password"
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          { user: createdUser, accessToken, refreshToken },
          "Signed in successfully"
        )
      );
  } catch (error) {
    console.error("Error during sign-in:", error);
    throw new ApiError(500, "Internal server error");
  }
});

export const googleAuth = asyncHandler(async (req, res) => {
  let { accessToken } = req.body;

  try {
    const decodedUser = await getAuth().verifyIdToken(accessToken);
    const { email, name, picture } = decodedUser;
    // console.log(decodedUser);

    const updatedPicture = picture.replace("s96-c", "s384-c");

    let user = await User.findOne({ "personal_info.email": email }).select(
      "personal_info.fullname personal_info.username personal_info.email personal_info.profile_img google_auth "
    );

    // console.log(user);

    if (user) {
      if (!user.google_auth) {
        throw new ApiError(
          403,
          "Email was signed up without Google. Please login with password to access the account."
        );
      }

      return res
        .status(200)
        .json(new ApiResponse(200, { user }, "Authenticated with Google"));
    } else {
      const userDetails = await User.findOne({
        "personal_info.email": email,
      });
      const username = email.split("@")[0];
      console.log(username);

      user = new User({
        personal_info: {
          fullname: name,
          email,
          username,
          // profile_img: updatedPicture,
        },
        google_auth: true,
      });

      await user.save();

      return res
        .status(200)
        .json(new ApiResponse(200, { user }, "Authenticated with Google"));
    }
  } catch (error) {
    console.error(error);
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, null, error.message));
    }
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

export default signUpUser;
