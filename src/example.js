const { pokemons } = require('./pokedex.json');

const columns = pokemons.reduce((prev, e) => [...prev, ...Object.keys(e)], [])
  .filter((v, i, a) => a.indexOf(v) === i)
  .map(name => ({ name }));


console.log(columns);
const data = pokemons;

export {
  columns,
  data,
};
