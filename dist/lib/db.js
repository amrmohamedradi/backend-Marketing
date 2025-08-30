"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.isConnected = isConnected;
const mongoose_1 = __importDefault(require("mongoose"));
let _conn = null;
async function connectDB() {
    if (_conn)
        return _conn;
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.warn('[DB] MONGODB_URI missing, using mock storage');
        return null;
    }
    _conn = mongoose_1.default.connect(uri, {
        serverSelectionTimeoutMS: 7000
    });
    try {
        await _conn;
        console.log('[DB] Connected to MongoDB');
        return _conn;
    }
    catch (error) {
        console.error('[DB] Connection failed:', error);
        _conn = null;
        return null;
    }
}
function isConnected() {
    return mongoose_1.default.connection.readyState === 1;
}
