/* Ajout des librairies nécessaires */
const express     = require('express');
const mongoose    = require('mongoose');
const sauceRoutes = require('./routes/sauce');
const userRoutes  = require('./routes/utilisateur');
const path        = require('path');
const helmet      = require("helmet");
const rateLimit   = require('express-rate-limit');
require('dotenv').config();

const app = express();

app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // évite les erreurs de chargement d'image

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Apply the rate limiting middleware to all requests
app.use(limiter)

/* Test de connexion à la base de données */
mongoose.connect('mongodb+srv://' + process.env.MONGO_USERNAME + ':' + process.env.MONGO_PASSWORD + '@cluster0.tvlbvch.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

  app.use('/images', express.static(path.join(__dirname, 'images'))); /* Gestion des images */
  
  /* Routes */
  app.use('/api/sauces', sauceRoutes);
  app.use('/api/auth', userRoutes);

module.exports = app;