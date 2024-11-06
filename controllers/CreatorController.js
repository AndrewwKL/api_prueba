// controllers/CreatorController.js
const Course = require('../models/Course');

exports.createCourse = async (req, res) => {
    const { title, description, category, price } = req.body;
    try {
        const course = new Course({
            title,
            description,
            category,
            price,
            creatorId: req.user.userId // Asumiendo que el creador está autenticado
        });
        await course.save();
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.listCreatorCourses = async (req, res) => {
    try {
        const courses = await Course.find({ creatorId: req.user.userId });
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateCourse = async (req, res) => {
    const { id } = req.params;
    const { title, description, category, price } = req.body;
    try {
        const course = await Course.findOneAndUpdate(
            { _id: id, creatorId: req.user.userId },
            { title, description, category, price },
            { new: true }
        );
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteCourse = async (req, res) => {
    const { id } = req.params;
    try {
        const course = await Course.findOneAndDelete({ _id: id, creatorId: req.user.userId });
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.addContent = async (req, res) => {
    const { id } = req.params;
    const { title, url, type } = req.body;
    try {
        const course = await Course.findOneAndUpdate(
            { _id: id, creatorId: req.user.userId },
            { $push: { content: { title, url, type } } },
            { new: true }
        );
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteContent = async (req, res) => {
    const { id, contentId } = req.params;
    try {
        const course = await Course.findOneAndUpdate(
            { _id: id, creatorId: req.user.userId },
            { $pull: { content: { _id: contentId } } },
            { new: true }
        );
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getCourseRatings = async (req, res) => {
    const { id } = req.params;
    try {
        const course = await Course.findById(id).select('ratings');
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.status(200).json(course.ratings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
