// controllers/CreatorController.js
const Course = require('../models/Course');
const mongoose = require('mongoose');


exports.createCourse = async (req, res) => {
    const { title, description, category, price } = req.body;

    try {

        const creatorId = new mongoose.Types.ObjectId(req.user.id);

        console.log("Creating course with data:", {
            title,
            description,
            category,
            price,
            creatorId,
        });
        const course = new Course({
            title,
            description,
            category,
            price,
            creatorId,
        });
        console.log("Authenticated User:", req.user);

        await course.save();
        res.status(201).json(course); // Return the created course
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
    const { session, title, url, type } = req.body;
    try {

        const courseId = new mongoose.Types.ObjectId(id);
        const creatorId = new mongoose.Types.ObjectId(req.user.id);

         const course = await Course.findOneAndUpdate(
            { _id: courseId, creatorId: creatorId }, // Ensure both IDs match
            { $push: { content: { session, title, url, type } } }, // Add the content
            { new: true } // Return the updated document
        );
        console.log("Course ID from URL:", id);
        console.log("Authenticated User ID:", req.user.id);

        if (!course) return res.status(404).json({ message: 'Course not found or unauthorized' });
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getContentBySession = async (req, res) => {
    const { id } = req.params; // Course ID

    try {
        const course = await Course.findById(id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Group content by session
        const groupedContent = course.content.reduce((acc, item) => {
            if (!acc[item.session]) acc[item.session] = [];
            acc[item.session].push(item);
            return acc;
        }, {});

        res.status(200).json(groupedContent);
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
