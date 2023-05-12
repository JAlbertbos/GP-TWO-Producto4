const mongoose = require("mongoose");

const WeekSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  numberWeek: {
    type: Number,
    required: true,
  },
  priority: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  borderColor: {
    type: String,
    required: true,
  },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
});

module.exports = mongoose.model("Week", WeekSchema);
