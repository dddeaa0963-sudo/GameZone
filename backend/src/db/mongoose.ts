import mongoose from "mongoose";

// URI Sanitizer Helper Function (CWP Fix)
const sanitizeMongoURI = (uri) => {
  if (!uri) return uri;
  const match = uri.match(/:\/\/(.*?):(.*?)@/);
  if (match) {
    const username = match[1];
    let password = match[2];
    
    // Fix: CWP sometimes converts '+' to space. Convert it back for the password.
    password = password.replace(/ /g, '+');
    
    // Auto encode the password properly
    try {
      password = encodeURIComponent(decodeURIComponent(password));
    } catch (e) {
      password = encodeURIComponent(password);
    }
    
    return uri.replace(`://${username}:${match[2]}@`, `://${username}:${password}@`);
  }
  return uri;
};

// Database connection with Retry Logic
const connectDB = async (retries = 5) => {
  let sanitizedURI = sanitizeMongoURI(process.env.MONGO_URI || "");
  
  while (retries > 0) {
    try {
      await mongoose.connect(sanitizedURI);
      return;
    } catch (error) {
      console.error(`MongoDB connection failed. Retries left: ${retries - 1}`, error.message);
      retries -= 1;
      if (retries === 0) {
        console.error("Could not connect to MongoDB after multiple attempts");
      } else {
        await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds
      }
    }
  }
};

export default connectDB;
