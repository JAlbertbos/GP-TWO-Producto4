const Week = require("../models/Week");

exports.getAllWeeks = async () => {
  try {
    return await Week.find().populate("tasks");
  } catch (err) {
    console.error(err);
    throw new Error("Error al recuperar semanas");
  }
};

exports.getWeekById = async (id) => {
  try {
    return await Week.findById(id).populate("tasks");
  } catch (err) {
    console.error(err);
    throw new Error("Error al recuperar la semana");
  }
};

exports.createWeek = async (weekData) => {
  try {
    const newWeek = new Week(weekData);
    return await newWeek.save();
  } catch (err) {
    console.error(err);
    throw new Error("Error al crear la semana");
  }
};

exports.updateWeekById = async (id, updatedData) => {
  try {
    console.log('Updating week with ID:', id, 'and data:', updatedData);
    const updatedWeek = await Week.findByIdAndUpdate(id, updatedData, { new: true });
    console.log('Updated week:', updatedWeek);
    if (!updatedWeek) {
      throw new Error("Semana no encontrada");
    }
    return updatedWeek;
  } catch (err) {
    console.error(err);
    throw new Error("Error al subir semana");
  }
};


exports.deleteWeekById = async (id) => {
    try {
      return await Week.findByIdAndRemove(id);
    } catch (err) {
      console.error(err);
      throw new Error("Error al borrar semana");
    }
  };
