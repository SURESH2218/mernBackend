import app from "./app.js";
import connectDB from "./db/index.js";

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
