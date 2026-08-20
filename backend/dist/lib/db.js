"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dns_1 = __importDefault(require("dns"));
if (dns_1.default.setDefaultResultOrder) {
    try {
        dns_1.default.setDefaultResultOrder('ipv4first');
    }
    catch (e) {
        // Ignore
    }
}
const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
        console.error('❌ MONGODB_URI environment variable is missing.');
        throw new Error('MONGODB_URI environment variable is required to start the Hostel Portal backend.');
    }
    const targetDbName = process.env.DB_NAME || 'hostel_portal';
    console.log(`Connecting to MongoDB Atlas (DB: ${targetDbName})...`);
    let lastError = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const conn = await mongoose_1.default.connect(mongoURI, {
                dbName: targetDbName,
                serverSelectionTimeoutMS: 30000,
                connectTimeoutMS: 30000,
            });
            console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
            return;
        }
        catch (error) {
            lastError = error;
            console.warn(`⚠️ Connection attempt ${attempt}/3 failed: ${error.message}`);
            if (attempt < 3) {
                await new Promise((resolve) => setTimeout(resolve, 3000));
            }
        }
    }
    console.error('❌ MongoDB connection failed after 3 attempts:', lastError?.message);
    throw new Error(`MongoDB connection failed: ${lastError?.message}`);
};
exports.connectDB = connectDB;
process.on('SIGINT', async () => {
    await mongoose_1.default.connection.close();
    console.log('MongoDB connection closed on app termination');
    process.exit(0);
});
exports.default = mongoose_1.default;
