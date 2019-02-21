'use strict';

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const pokedex = require('./pokedex');
console.log(process.env.API_TOKEN);

const app = express();

app.use(morgan('dev'));
app.use(helmet()); // helmet must run before cors, else helmet won't effect cors preflight header
app.use(cors());

app.use((req, res, next) => {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');
  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  next();
});

const validTypes = [
  'Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting',
  'Fire', 'Flying', 'Ghost', 'Grass', 'Ground', 'Ice',
  'Normal', 'Poison', 'Psychic', 'Rock', 'Steel', 'Water'
];

function handleGetTypes(req, res) {
  res.json(validTypes);
}

function handleGetPokemon(req, res) {
  let results = pokedex.pokemon;
  let { name, type } = req.query;
  
  if (type) {
    type = type.replace(/^[a-z]/, () => type[0].toUpperCase());
    if (!validTypes.includes(type)) {
      return res.status(400).send('type must be a valid type of pokemon');
    }

    results = results.filter(result => {
      return result.type.includes(type);
    });
  }

  if (name) {
    name = name.replace(/^[a-z]/, () => name[0].toUpperCase());
    results = results.filter(result => {
      return result.name.includes(name);
    });
  }
  res.send(results);
}

app.get('/pokemon', handleGetPokemon);
app.get('/types', handleGetTypes);


const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
