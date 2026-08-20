"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
        console.error('❌ MONGODB_URI environment variable is missing.');
        throw new Error('MONGODB_URI environment variable is required to start the Hostel Portal backend.');
    }
    try {
        const conn = await mongoose_1.default.connect(mongoURI, {
            dbName: process.env.DB_NAME || 'hostel_portal',
            serverSelectionTimeoutMS: 10000,
        });
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        throw new Error(`MongoDB connection failed: ${error.message}`);
    }
};
exports.connectDB = connectDB;
process.on('SIGINT', async () => {
    await mongoose_1.default.connection.close();
    console.log('MongoDB connection closed on app termination');
    process.exit(0);
});
exports.default = mongoose_1.default;
