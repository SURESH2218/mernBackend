import { nanoid } from "nanoid";
import app from "./app.js";
import connectDB from "./db/index.js";
import aws from "aws-sdk";

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
};

startServer();

const s3 = new aws.S3({
  region: "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const generateUploadURL = async () => {
  const date = new Date();
  const imageName = `${nanoid()}-${date.getTime()}.jpg`;
  return await s3.getSignedUrlPromise("putObject", {
    Bucket: "blogging-website-18",
    Key: imageName,
    Expires: 1000,
    ContentType: "image/jpeg",
  });
};

app.get("/get-upload-url", async (req, res) => {
  try {
    const url = await generateUploadURL();
    res.status(200).json({ uploadURL: url });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});
