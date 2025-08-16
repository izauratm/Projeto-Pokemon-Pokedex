/*temas*/
const toggleBtn = document.getElementById('toggleTheme')
const themeLabel = document.getElementById('themeLabel')

// Aplica o tema salvo ao carregar
const savedTheme = localStorage.getItem('theme') || 'white'
document.body.classList.add(`theme-${savedTheme}`)
themeLabel.textContent = savedTheme === 'white' ? 'Raio Branco' : 'Fogo Negro'

toggleBtn.addEventListener('click', () => {
  const isWhite = document.body.classList.contains('theme-white')
  const newTheme = isWhite ? 'black' : 'white'

  document.body.classList.remove(`theme-${isWhite ? 'white' : 'black'}`)
  document.body.classList.add(`theme-${newTheme}`)

  localStorage.setItem('theme', newTheme)
  themeLabel.textContent = newTheme === 'white' ? 'Raio Branco' : 'Fogo Negro'
})
/*botão alternar os temas*/
document.getElementById('toggleTheme').addEventListener('click', () => {
  const root = document.documentElement;
  const isFire = root.style.getPropertyValue('--btn-bg').includes('#ff4500');

  if (isFire) {
    // Tema Raio Branco ⚡
    root.style.setProperty('--btn-bg', 'linear-gradient(135deg, #00bfff, #1e90ff)');
    root.style.setProperty('--btn-hover-bg', 'linear-gradient(135deg, #1e90ff, #00bfff)');
    root.style.setProperty('--btn-shadow', '0 4px 8px rgba(0, 0, 255, 0.3)');
  } else {
    // Tema Fogo Negro 🔥
    root.style.setProperty('--btn-bg', 'linear-gradient(135deg, #ff4500, #8b0000)');
    root.style.setProperty('--btn-hover-bg', 'linear-gradient(135deg, #8b0000, #ff4500)');
    root.style.setProperty('--btn-shadow', '0 4px 8px rgba(0, 0, 0, 0.3)');
  }
});

/*responsável por exibir os Pokémon na página*/
const pokemonList = document.getElementById('pokemonList')
const loadMoreButton = document.getElementById('loadMoreButton')

console.log('Sucesso!')
const maxRecords = 650
const limit = 20
let offset = 0;

function convertPokemonToLi(pokemon) {
  return `
        <li class="pokemon ${pokemon.type}" onclick="window.location.href='pokemon-detail.html?id=${pokemon.number}'">
            <span class="number">#${pokemon.number}</span>
            <span class="name">${pokemon.name}</span>

            <div class="detail">
                <ol class="types">
                    ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')}
                </ol>

                <img src="${pokemon.photo}"
                     alt="${pokemon.name}">
            </div>
        </li>
    `
}

function loadPokemonItens(offset, limit) {
  pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
    const newHtml = pokemons.map(convertPokemonToLi).join('')
    pokemonList.innerHTML += newHtml
  })
}

loadPokemonItens(offset, limit)

loadMoreButton.addEventListener('click', () => {
  offset += limit
  const qtdRecordsWithNexPage = offset + limit

  if (qtdRecordsWithNexPage >= maxRecords) {
    const newLimit = maxRecords - offset
    loadPokemonItens(offset, newLimit)

    loadMoreButton.parentElement.removeChild(loadMoreButton)
  } else {
    loadPokemonItens(offset, limit)
  }
})
/*busca e paginação juntas*/
function resetPokemonList() {
  offset = 0
  pokemonList.innerHTML = ''
  loadPokemonItens(offset, limit)
  if (!document.body.contains(loadMoreButton)) {
    document.querySelector('.pagination').appendChild(loadMoreButton)
  }
}

const searchInput = document.getElementById('searchInput')
const searchButton = document.getElementById('searchButton')

searchButton.addEventListener('click', () => {
  const query = searchInput.value.toLowerCase().trim()
  if (!query) {
    pokemonList.innerHTML = ''
    offset = 0
    loadPokemonItens(offset, limit)
    return
  }

  fetch(`https://pokeapi.co/api/v2/pokemon/${query}`)
    .then(response => {
      if (!response.ok) throw new Error('Pokémon não encontrado')
      return response.json()
    })
    .then(pokeDetail => {
      const pokemon = convertPokeApiDetailToPokemon(pokeDetail)
      pokemonList.innerHTML = convertPokemonToLi(pokemon)
      loadMoreButton.style.display = 'none' // Oculta o botão durante a busca
    })
    .catch(error => {
      pokemonList.innerHTML = `<li class="pokemon"><span class="name">Pokémon não encontrado</span></li>`
      loadMoreButton.style.display = 'none'
    })
})

clearButton.addEventListener('click', () => {
  searchInput.value = ''
  pokemonList.innerHTML = ''
  offset = 0
  loadPokemonItens(offset, limit)
  loadMoreButton.style.display = 'block' // Reexibe o botão
})




