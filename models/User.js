const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ['admin', 'creator', 'taker'], default: 'taker' },
    createdAt: { type: Date, default: Date.now }
});

UserSchema.methods.encryptClave = async (clave) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(clave, salt);
}


module.exports = mongoose.model('User', UserSchema);
