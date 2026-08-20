"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
async function check() {
    await mongoose_1.default.connect(process.env.MONGODB_URI, { dbName: 'hostel_portal' });
    const user = await mongoose_1.default.connection.db.collection('users').findOne({ email: 'chandanamahadimane@gmail.com' });
    console.log('User email:', user?.email);
    console.log('Password hash in DB:', user?.password);
    const testPass = 'Parent@000191';
    const match = await bcryptjs_1.default.compare(testPass, user?.password);
    console.log(`bcrypt.compare("${testPass}", hash) => ${match}`);
    await mongoose_1.default.disconnect();
}
check().catch(console.error);
