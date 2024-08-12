const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    ratings: [
        {
            userId: { type: String, required: true },
            rating: { type: Number, required: true}
        },
    ],
    averageRating: { type: Number, required: true}
  });

  module.exports = mongoose.model('Book', bookSchema);