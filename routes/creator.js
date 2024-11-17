const express = require('express');
const router = express.Router();
const CreatorController = require('../controllers/CreatorController');
const auth = require('../middleware/auth'); 
// Rutas para gestión de cursos
router.post('/courses', auth, CreatorController.createCourse);
router.get('/courses', auth, CreatorController.listCreatorCourses);
router.put('/courses/:id', auth, CreatorController.updateCourse);
router.delete('/courses/:id', auth,  CreatorController.deleteCourse);

// Rutas para gestión de contenido
router.post('/courses/:id/content',  auth, CreatorController.addContent);
router.get('/courses/:id/content', auth, CreatorController.getContentBySession);
router.delete('/courses/:id/content/:contentId', auth,  CreatorController.deleteContent);

// Ruta para obtener calificaciones
router.get('/courses/:id/ratings', auth,  CreatorController.getCourseRatings);

module.exports = router;
