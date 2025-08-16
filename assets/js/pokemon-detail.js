function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function fetchPokemonDetail(id) {
    return fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json());
}

function fetchPokemonSpecies(id) {
    return fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then(res => res.json());
}

function fetchEvolutionChain(url) {
    return fetch(url).then(res => res.json());
}
    // Retorna array de {name, url}
function getEvolutionStages(chain) {
    
    const stages = [];
    let current = chain;
    while (current) {
        stages.push({
            name: current.species.name,
            url: current.species.url
        });
        if (current.evolves_to && current.evolves_to.length > 0) {
            current = current.evolves_to[0];
        } else {
            current = null;
        }
    }
    return stages;
}

async function getPokemonImageByName(name) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const data = await res.json();
    return data.sprites.other.dream_world.front_default || data.sprites.front_default;
}

function renderTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const aboutTab = document.getElementById('aboutTab');
    const evolutionTab = document.getElementById('evolutionTab');
    tabBtns.forEach(btn => {
        btn.onclick = () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (btn.dataset.tab === 'about') {
                aboutTab.style.display = '';
                evolutionTab.style.display = 'none';
            } else {
                aboutTab.style.display = 'none';
                evolutionTab.style.display = '';
            }
        };
    });
}

async function renderDetail(pokemon, species, evolutionStages) {
    const abilities = pokemon.abilities.map(a => a.ability.name).join(', ');
    const types = pokemon.types.map(t => t.type.name);
    const typeMain = types[0];
    const typesText = types.join(', ');
    const eggGroups = species.egg_groups.map(e => e.name).join(', ');
    const genus = species.genera.find(g => g.language.name === 'en')?.genus || '';

    // Card: Sobre
    const aboutHtml = `
        <img src="${pokemon.sprites.other.dream_world.front_default}" alt="${pokemon.name}">
        <h2>${pokemon.name} <span>#${pokemon.id}</span></h2>
        <div class="detail-list">
            <p><strong>Species:</strong> ${genus}</p>
            <p><strong>Type:</strong> ${typesText}</p>
            <p><strong>Height:</strong> ${pokemon.height / 10} m</p>
            <p><strong>Weight:</strong> ${pokemon.weight / 10} kg</p>
            <p><strong>Abilities:</strong> ${abilities}</p>
            <p><strong>Egg Groups:</strong> ${eggGroups}</p>
            <p><strong>Base Experience:</strong> ${pokemon.base_experience}</p>
        </div> 
    `;
    document.getElementById('aboutTab').innerHTML = aboutHtml;

    document.getElementById('backBtn').onclick = () => window.location.href = 'index.html';

    // Card: Evolução
    let evoHtml = '';
    if (evolutionStages.length > 1) {
        evoHtml += `<div class="evolution-images">`;
        for (let i = 0; i < evolutionStages.length; i++) {
            const evo = evolutionStages[i];
            const img = await getPokemonImageByName(evo.name);
            evoHtml += `
                <div class="evo-stage">
                    <img src="${img}" alt="${evo.name}">
                    <div>${evo.name}</div>
                </div>
                
            `;
            if (i < evolutionStages.length - 1) {
                evoHtml += `<div class="evolution-arrow">→</div>`;
            }
        }
        evoHtml += `</div>`;
    } else {
        evoHtml = `<p>Este Pokémon não possui evolução.</p>`;
    }
    document.getElementById('evolutionTab').innerHTML = evoHtml;

    // Card: cor
    const card = document.getElementById('pokemonDetail');
    card.className = `detail-card ${typeMain}`;

    // Ativação das abas
    renderTabs();
}

const id = getQueryParam('id');
if (id) {
    Promise.all([
        fetchPokemonDetail(id),
        fetchPokemonSpecies(id)
    ]).then(async ([pokemon, species]) => {
        let evolutionStages = [];
        if (species.evolution_chain && species.evolution_chain.url) {
            const evolutionChain = await fetchEvolutionChain(species.evolution_chain.url);
            evolutionStages = getEvolutionStages(evolutionChain.chain);
        }
        await renderDetail(pokemon, species, evolutionStages);
    });
}

