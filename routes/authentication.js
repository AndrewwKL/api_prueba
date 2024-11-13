const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User"); // Asegúrate de tener el modelo de usuario definido

// Ruta de registro (signup)
router.post("/signup", async (req, res) => {
    const { usuario, correo, clave, role } = req.body;

    const user = new User({
        usuario,
        correo,
        clave: await bcrypt.hash(clave, 10),
        role: role || "user"
    });

    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ auth: true, token });
});


// Ruta de inicio de sesión (login)
router.post("/login", async (req, res) => {
    const { correo, clave } = req.body;

    // Verificar que correo y clave no sean undefined o vacíos
    if (!correo || !clave) {
        return res.status(400).json({ message: "Correo y clave son requeridos" });
    }

    try {
        // Busca al usuario por su correo electrónico
        const user = await User.findOne({ correo });
        if (!user) return res.status(400).json({ message: "Usuario no encontrado" });

        // Compara la contraseña ingresada con la almacenada
        const validPassword = await bcrypt.compare(clave, user.clave);
        if (!validPassword) return res.status(400).json({ message: "Clave no válida" });

        // Genera un token JWT
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ auth: true, token });
    } catch (error) {
        console.error("Error en la autenticación:", error); // Para depuración
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
