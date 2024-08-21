const express = require('express');
const bookCtrl = require('../controllers/bookCtrl');
const auth = require('auth');

const router = express.Router();

// Route pour récupérer tous les livres
router.get('/', bookCtrl.getAllBooks);

// Route pour récupérer un livre par son ID
router.get('/:id', bookCtrl.getBookById);

// Route pour récupérer les 3 livres ayant la meilleure note moyenne
router.get('/bestrating', bookCtrl.getBestRatingBooks);

// Route pour ajouter un nouveau livre avec une image
router.post('/', auth, bookCtrl.addBook);

// Route pour mettre à jour un livre par son ID avec ou sans image
router.put('/:id', auth, bookCtrl.updateBook);

// Route pour supprimer un livre par son ID
router.delete('/:id',auth, bookCtrl.deleteBook);

// Route pour ajouter une note à un livre pour un utilisateur donné
router.post('/:id/rating',auth, bookCtrl.addRating);

module.exports = router;