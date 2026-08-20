"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
async function verify() {
    await mongoose_1.default.connect(process.env.MONGODB_URI, { dbName: 'hostel_portal' });
    const db = mongoose_1.default.connection.db;
    const dbName = db.databaseName;
    const usersColl = db.collection('users');
    const students = await usersColl.countDocuments({ role: 'student' });
    const parents = await usersColl.countDocuments({ role: 'parent' });
    const wardens = await usersColl.countDocuments({ role: 'warden' });
    const messManagers = await usersColl.countDocuments({ role: 'messmanager' });
    const admins = await usersColl.countDocuments({ role: 'admin' });
    const superadmins = await usersColl.countDocuments({ role: 'superadmin' });
    const totalUsers = await usersColl.countDocuments();
    console.log('=======================================================');
    console.log('   HOSTEL PORTAL FINAL DATABASE IMPORT VERIFICATION    ');
    console.log('=======================================================');
    console.log(`Database Name:          ${dbName}`);
    console.log(`Student Accounts:       ${students}`);
    console.log(`Parent Accounts:        ${parents}`);
    console.log(`Warden Accounts:        ${wardens}`);
    console.log(`Mess Manager Accounts:  ${messManagers}`);
    console.log(`Admin Accounts:         ${admins}`);
    console.log(`SuperAdmin Accounts:    ${superadmins}`);
    console.log(`-------------------------------------------------------`);
    console.log(`Total Users in DB:      ${totalUsers}`);
    console.log('=======================================================');
    await mongoose_1.default.disconnect();
}
verify().catch(console.error);
