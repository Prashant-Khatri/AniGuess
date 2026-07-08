import mongoose from "mongoose";
import { characterSeedData } from "../constants/character.js";
import { Character, ICharacter } from "../models/character.models.js";
import dotenv from 'dotenv'
dotenv.config()

async function seedTwelveMongoCharacters() {
  const MONGO_URI = process.env.MONGODB_URI

  try {
    console.log("📡 Connecting to MongoDB Database Matrix...");
    await mongoose.connect(MONGO_URI!);
    console.log("🟢 Connected Successfully.");

    // OPTIONAL: Clear existing character collections if you want a completely fresh pool
    // await Character.deleteMany({});

    // 4. Extract EXACTLY 12 random characters from your array dataset stack
    // (If you prefer the first 12 over random selection, replace this with .slice(0, 12))
    const selectedTwelve = [...characterSeedData]
      .sort(() => 0.5 - Math.random())
      .slice(0, 12);

    // 5. Clean, sanitize and map answers to lowercase for bulletproof match-validation loops
    const normalizedCharacters = selectedTwelve.map((char : ICharacter) => ({
      ...char,
      characterName: char.characterName.toLowerCase().trim(),
      alternateName: char.alternateName.map((name) => name.toLowerCase().trim())
    }));

    // 6. Bulk write insertions to database instance
    const result = await Character.insertMany(normalizedCharacters);
    
    console.log(`✅ Success! Injected ${result.length} character entries into MongoDB.`);
    console.log("📋 Sample Seed Target Matrix:", result.map(c => c.characterName));

  } catch (error) {
    console.error("❌ Critical runtime exception during MongoDB seeding sequence:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB cleanly.");
    process.exit(0);
  }
}

// Execute Script
seedTwelveMongoCharacters();