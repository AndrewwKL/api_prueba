// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
    usuario: {
        type: String,
        required: true
    },
    correo: {
        type: String,
        required: true,
        unique: true
    },
    clave: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "user", "creator"], // Define los roles permitidos
        default: "user"
    }
});

module.exports = mongoose.model("User", UserSchema);
