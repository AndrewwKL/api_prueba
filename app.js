require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: 'http://localhost:4200', // Dominio del frontend Angular
  credentials: true // Permitir envío de cookies o encabezados de autorización
 }));
app.use(express.json());

// Configuración del puerto
const PORT = process.env.PORT || 5000;

// Conexión a la base de datos
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Conexión exitosa a MongoDB"))
  .catch((error) => console.log("Error al conectar a MongoDB:", error));

// Rutas
app.use('/api/admin', require('./routes/admin'));
app.use('/api/creator', require('./routes/creator'));
app.use('/api/taker', require('./routes/taker')); 
const authRoutes = require("./routes/authentication");
app.use("/api/auth", authRoutes);


// Inicialización del servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

