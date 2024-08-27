const Book = require('../models/Book');
const fs = require('fs');

// Contrôleur pour récupérer tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// Contrôleur pour récupérer un livre par son ID
exports.getBookById = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }
      res.status(200).json(book);
    })
    .catch((error) => res.status(400).json({ error }));
};

// Logique pour récupérer les 3 livres ayant la meilleure note moyenne
exports.getBestRatingBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Logique pour ajouter un nouveau livre avec une image
exports.addBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    ratings: [],
    averageRating: 0,
  });

  book
    .save()
    .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
    .catch((error) => res.status(400).json({ error }));
};

// Logique pour mettre à jour un livre par son ID avec ou sans image
exports.updateBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      }
    : { ...req.body };

  delete bookObject._userId;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ error: 'Livre non trouvé !' });
      }
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ error: 'Requête non autorisée !' });
      }

      if (req.file) {
        const oldFilename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${oldFilename}`, () => {
          Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Livre modifié avec succès !' }))
            .catch((error) => res.status(400).json({ error }));
        });
      } else {
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre modifié avec succès !' }))
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

// Logique pour supprimer un livre par son ID
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ error: 'Livre non trouvé !' });
      }

      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ error: 'Requête non autorisée !' });
      }

      const filename = book.imageUrl.split('/images/')[1];

      fs.unlink(`images/${filename}`, () => {
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre supprimé avec succès !' }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

// Logique pour ajouter une note à un livre pour un utilisateur donné
exports.addRating = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ error: 'Livre non trouvé !' });
      }

      const existingRatingIndex = book.ratings.findIndex(
        (rating) => rating.userId === req.auth.userId
      );
      if (existingRatingIndex !== -1) {
        return res.status(400).json({ error: 'Vous avez déjà noté ce livre.' });
      }

      const newRating = {
        userId: req.auth.userId,
        rating: req.body.rating,
      };
      book.ratings.push(newRating);

      const totalRatings = book.ratings.reduce((acc, rating) => acc + rating.rating, 0);
      book.averageRating = Math.round((totalRatings / book.ratings.length) * 10) / 10;

      book
        .save()
        .then(() => res.status(200).json(book))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
