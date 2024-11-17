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

UserSchema.virtual('isNewUser').get(function () {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return this.createdAt > oneMonthAgo;
});


module.exports = mongoose.model("User", UserSchema);
