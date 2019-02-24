'use strict';
const express = require('express');
const router = express.Router();
const pokedex = require('./pokedex');
const TYPES = require('./types.json');

function handleGetTypes(req, res) {
  res.json(TYPES);
}

function handleGetPokemon(req, res) {
  let results = pokedex.pokemon;
  let { name, type } = req.query;

  // filter by name if name query is present
  if (type) {
    type = type.replace(/^[a-z]/, () => type[0].toUpperCase());
    if (!TYPES.includes(type)) {
      return res.status(400).send('type must be a valid type of pokemon');
    }

    results = results.filter(result => {
      return result.type.includes(type);
    });
  }

  // filter by type if type query is present
  if (name) {
    name = name.replace(/^[a-z]/, () => name[0].toUpperCase());
    results = results.filter(result => {
      return result.name.includes(name);
    });
  }
  res.send(results);
}

function handlePostPokemon(req, res) {
  const newPokemon = req.body;

  if (!newPokemon.name) {
    return res.status(400).send('name is required');
  }
  // get names of pokemon in pokedex
  const names = pokedex.pokemon.map(p => p.name);

  // check if name already exists
  const isMatch = names.includes(newPokemon.name);

  if (isMatch) {
    return res.status(409).send('Conflict');
  }

  // create new id and add to pokedex
  const newId = pokedex.pokemon.length + 1;
  newPokemon.id = newId;
  newPokemon.num = newId + '';
  pokedex.pokemon.push(newPokemon);
  res.status(201).location(`/pokemon/${newId}`).end();

}

router.route('/pokemon').get(handleGetPokemon);
router.route('/types').get(handleGetTypes);

router.route('/pokemon/:id').get((req, res) => {
  const id = parseInt(req.params.id);
  res.json(pokedex.pokemon[id - 1]);
});

router.post('/pokemon', handlePostPokemon);

router.post('/types', (req, res) => {
  const { type } = req.body;

  if (TYPES.includes(type)) {
    return res.status(409).send('Conflict');
  }

  TYPES.push(type);
  res.status(201).json({ TYPES });

});

router.delete('/pokemon/:id', (req, res) => {

  const id = parseInt(req.params.id);
  pokedex.pokemon.splice(id - 1, 1);
  res.json();

});

module.exports = router;