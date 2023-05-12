const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/TasksController');

router.post('/tasks/:taskId/upload', tasksController.uploadFile);

module.exports = router;
