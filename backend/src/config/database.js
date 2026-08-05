import mongoose from "mongoose";

const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`connect to database`);

    // Safely drop stale non-sparse slug index if it exists in MongoDB collection
    try {
      await mongoose.connection.collection("websites").dropIndex("slug_1");
      console.log("Dropped stale slug_1 index from websites collection");
    } catch (e) {
      // Index might not exist or already dropped, ignore safely
    }
  } catch (err) {
    console.log(err);
    throw new Error(`connecting to database error ${err} `);
  }
};

export default connectToDb;