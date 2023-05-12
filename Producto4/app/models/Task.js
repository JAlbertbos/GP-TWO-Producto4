const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  participants: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  day: {
    type: String,
    required: true,
  },
  week: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Week",
    required: true,
  },
  fileUrl: {
    type: String,
    default: ''
},
});

module.exports = mongoose.model("Task", TaskSchema);
