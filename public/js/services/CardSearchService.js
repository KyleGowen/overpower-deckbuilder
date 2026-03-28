// CardSearchService: centralized fetching and normalization of card search results
// Returns results in the form: { id, name, type, image, character }

(function(global) {
    class CardSearchService {
        constructor(options = {}) {
            this.maxResults = options.maxResults || 20;
        }

        _getImagePath(card, cardType) {
            const img = card.image || card.image_path || '';
            return cardType === 'location'
                ? `/src/resources/cards/images/locations/${img}`
                : `/src/resources/cards/images/${img}`;
        }

        /** Linked character / universe line (API uses `character`; some caches use `character_name`). */
        _linkedCharacterRaw(card) {
            if (!card) return '';
            const a = card.character;
            if (a != null && String(a).trim() !== '') return String(a).trim();
            const b = card.character_name;
            if (b != null && String(b).trim() !== '') return String(b).trim();
            return '';
        }

        /**
         * Sort key: name match first; then character-linked match for special / advanced / teamwork
         * (so add-to-collection search surfaces e.g. Lancelot specials when typing "lance");
         * then other character matches; then type-only etc.
         */
        _searchResultTier(termLower, r) {
            const t = termLower;
            const n = (r.name || '').toLowerCase();
            if (n.includes(t)) return 0;
            const ch = (r.character || '').toLowerCase();
            if (ch.includes(t) && (r.type === 'special' || r.type === 'advanced-universe' || r.type === 'teamwork')) {
                return 0;
            }
            if (ch.includes(t)) return 1;
            return 2;
        }

        _finalizeSearchResults(termLower, rawResults) {
            return rawResults
                .filter(r => r.name && r.name.trim())
                .sort((a, b) => {
                    const pa = this._searchResultTier(termLower, a);
                    const pb = this._searchResultTier(termLower, b);
                    if (pa !== pb) return pa - pb;
                    return (a.name || '').localeCompare(b.name || '');
                })
                .slice(0, this.maxResults);
        }

        _searchInMap(searchTerm) {
            const map = typeof window !== 'undefined' ? window.availableCardsMap : null;
            if (!map || map.size === 0) return null;
            const byId = new Map();
            for (const c of map.values()) {
                if (c && c.id) byId.set(c.id, c);
            }
            const results = [];
            const term = searchTerm.toLowerCase();
            for (const card of byId.values()) {
                const type = card.cardType || card.type;
                const name = (card.name || card.card_name || card.power_type || card.to_use || '').toLowerCase();
                const charName = this._linkedCharacterRaw(card).toLowerCase();
                let match = false;
                if (type === 'character' && name && name.includes(term)) match = true;
                else if (type === 'special' && (name.includes(term) || charName.includes(term) || charName === term || term === 'special')) match = true;
                else if (type === 'mission' && ((card.card_name || '').toLowerCase().includes(term) || (card.mission_set || '').toLowerCase().includes(term) || term === 'mission' || term === 'missions')) match = true;
                else if (type === 'event' && (name.includes(term) || (card.mission_set || '').toLowerCase().includes(term) || term === 'event' || term === 'events')) match = true;
                else if (type === 'aspect' && (card.card_name || '').toLowerCase().includes(term)) match = true;
                else if (type === 'advanced-universe' && (name.includes(term) || charName.includes(term) || charName === term || term === 'advanced')) match = true;
                else if (type === 'teamwork' && ((card.to_use || card.name || '').toLowerCase().includes(term) || charName.includes(term) || charName === term || term === 'teamwork')) match = true;
                else if (type === 'ally-universe' && ((card.card_name || '').toLowerCase().includes(term) || term === 'ally')) match = true;
                else if (type === 'training' && !card.is_foil && ((card.card_name || '').toLowerCase().includes(term) || term === 'training')) match = true;
                else if (type === 'basic-universe' && ((card.card_name || '').toLowerCase().includes(term) || term === 'basic')) match = true;
                else if (type === 'power' && ((card.power_type || '').toLowerCase().includes(term) || term === 'power card')) match = true;
                else if (type === 'location' && (name.includes(term) || term === 'location')) match = true;
                if (match) {
                    const displayName = type === 'teamwork' ? (card.to_use || card.name) : (type === 'power' ? card.power_type : (card.card_name || card.name || card.power_type));
                    if (displayName) {
                        const linked = this._linkedCharacterRaw(card);
                        results.push({
                            id: card.id,
                            name: displayName,
                            type: type === 'advanced-universe' ? type : (type === 'ally-universe' ? type : (type === 'basic-universe' ? type : type)),
                            image: this._getImagePath(card, type),
                            character: linked || null,
                            imagePath: card.image
                        });
                    }
                }
            }
            return results;
        }

        async search(term) {
            const searchTerm = (term || '').trim().toLowerCase();
            if (searchTerm.length < 2) return [];

            const results = [];

            try {
                // Prefer in-memory search when availableCardsMap is populated (avoids 12 API calls per search)
                const mapResults = this._searchInMap(searchTerm);
                if (mapResults !== null) {
                    return this._finalizeSearchResults(searchTerm, mapResults);
                }

                // Fallback: fetch all endpoints in parallel when map is empty
                const [characters, specials, missions, events, aspects, advanced, teamwork, ally, training, basic, power, locations] = await Promise.all([
                    fetch('/api/characters').then(r => r.json()).catch(() => ({ success: false, data: [] })),
                    fetch('/api/special-cards').then(r => r.json()).catch(() => ({ success: false, data: [] })),
                    fetch('/api/missions').then(r => r.json()).catch(() => ({ success: false, data: [] })),
                    fetch('/api/events').then(r => r.json()).catch(() => ({ success: false, data: [] })),
                    fetch('/api/aspects').then(r => r.json()).catch(() => ({ success: false, data: [] })),
                    fetch('/api/advanced-universe').then(r => r.json()).catch(() => ({ success: false, data: [] })),
                    fetch('/api/teamwork').then(r => r.json()).catch(() => ({ success: false, data: [] })),
                    fetch('/api/ally-universe').then(r => r.json()).catch(() => ({ success: false, data: [] })),
                    fetch('/api/training').then(r => r.json()).catch(() => ({ success: false, data: [] })),
                    fetch('/api/basic-universe').then(r => r.json()).catch(() => ({ success: false, data: [] })),
                    fetch('/api/power-cards').then(r => r.json()).catch(() => ({ success: false, data: [] })),
                    fetch('/api/locations').then(r => r.json()).catch(() => ({ success: false, data: [] }))
                ]);

                if (characters.success) {
                    characters.data.forEach(char => {
                        if (char.name && char.name.toLowerCase().includes(searchTerm)) {
                            // Add default image as a result
                            // After migration, alternate cards are separate cards, so we just add the character
                            results.push({
                                id: char.id,
                                name: char.name,
                                type: 'character',
                                image: `/src/resources/cards/images/${char.image}`,
                                character: null,
                                imagePath: char.image
                            });
                        }
                    });
                }

                if (specials.success) {
                    specials.data.forEach(card => {
                        const linkedChar = (card.character || card.character_name || '');
                        const nameMatch = card.name && card.name.toLowerCase().includes(searchTerm);
                        const characterMatch = linkedChar && linkedChar.toLowerCase().includes(searchTerm);
                        const exactCharacterMatch = linkedChar && linkedChar.toLowerCase() === searchTerm;
                        const typeMatch = searchTerm === 'special';
                        if (nameMatch || characterMatch || exactCharacterMatch || typeMatch) {
                            // After migration, alternate cards are separate cards, so we just add the special card
                            results.push({
                                id: card.id,
                                name: card.name,
                                type: 'special',
                                image: `/src/resources/cards/images/${card.image}`,
                                character: linkedChar || null,
                                imagePath: card.image
                            });
                        }
                    });
                }

                if (missions.success) {
                    missions.data.forEach(mission => {
                        const nameMatch = mission.card_name && mission.card_name.toLowerCase().includes(searchTerm);
                        const setMatch = mission.mission_set && mission.mission_set.toLowerCase().includes(searchTerm);
                        const typeMatch = searchTerm === 'mission' || searchTerm === 'missions';
                        if (nameMatch || setMatch || typeMatch) {
                            results.push({
                                id: mission.id,
                                name: mission.card_name,
                                type: 'mission',
                                image: `/src/resources/cards/images/${mission.image}`,
                                character: mission.mission_set
                            });
                        }
                    });
                }

                if (events.success) {
                    events.data.forEach(event => {
                        const nameMatch = event.name && event.name.toLowerCase().includes(searchTerm);
                        const setMatch = event.mission_set && event.mission_set.toLowerCase().includes(searchTerm);
                        const typeMatch = searchTerm === 'event' || searchTerm === 'events';
                        if (nameMatch || setMatch || typeMatch) {
                            results.push({
                                id: event.id,
                                name: event.name,
                                type: 'event',
                                image: `/src/resources/cards/images/${event.image}`,
                                character: event.mission_set
                            });
                        }
                    });
                }

                if (aspects.success) {
                    aspects.data.forEach(aspect => {
                        if (aspect.card_name && aspect.card_name.toLowerCase().includes(searchTerm)) {
                            results.push({
                                id: aspect.id,
                                name: aspect.card_name,
                                type: 'aspect',
                                image: `/src/resources/cards/images/${aspect.image}`,
                                character: null
                            });
                        }
                    });
                }

                if (advanced.success) {
                    advanced.data.forEach(card => {
                        const linked = (card.character || card.character_name || '');
                        const nameMatch = card.name && card.name.toLowerCase().includes(searchTerm);
                        const characterMatch = linked && linked.toLowerCase().includes(searchTerm);
                        const exactCharacterMatch = linked && linked.toLowerCase() === searchTerm;
                        const typeMatch = searchTerm === 'advanced';
                        if (nameMatch || characterMatch || exactCharacterMatch || typeMatch) {
                            results.push({
                                id: card.id,
                                name: card.name,
                                type: 'advanced-universe',
                                image: `/src/resources/cards/images/${card.image}`,
                                character: linked || null
                            });
                        }
                    });
                }

                if (teamwork.success) {
                    teamwork.data.forEach(card => {
                        const linked = (card.character || card.character_name || '');
                        const nameMatch = (card.name || card.to_use) && (card.name || card.to_use).toLowerCase().includes(searchTerm);
                        const characterMatch = linked && linked.toLowerCase().includes(searchTerm);
                        const exactCharacterMatch = linked && linked.toLowerCase() === searchTerm;
                        const typeMatch = searchTerm === 'teamwork';
                        if (nameMatch || characterMatch || exactCharacterMatch || typeMatch) {
                            results.push({
                                id: card.id,
                                name: card.to_use || card.name,
                                type: 'teamwork',
                                image: `/src/resources/cards/images/${card.image}`,
                                character: linked || null
                            });
                        }
                    });
                }

                if (ally.success) {
                    ally.data.forEach(card => {
                        const nameMatch = card.card_name && card.card_name.toLowerCase().includes(searchTerm);
                        const typeMatch = searchTerm === 'ally';
                        if (nameMatch || typeMatch) {
                            results.push({
                                id: card.id,
                                name: card.card_name,
                                type: 'ally-universe',
                                image: `/src/resources/cards/images/${card.image}`,
                                character: null
                            });
                        }
                    });
                }

                if (training.success) {
                    training.data.forEach(card => {
                        if (card.is_foil) return;
                        const nameMatch = card.card_name && card.card_name.toLowerCase().includes(searchTerm);
                        const typeMatch = searchTerm === 'training';
                        if (nameMatch || typeMatch) {
                            results.push({
                                id: card.id,
                                name: card.card_name,
                                type: 'training',
                                image: `/src/resources/cards/images/${card.image}`,
                                character: null
                            });
                        }
                    });
                }

                if (basic.success) {
                    basic.data.forEach(card => {
                        const nameMatch = card.card_name && card.card_name.toLowerCase().includes(searchTerm);
                        const typeMatch = searchTerm === 'basic';
                        if (nameMatch || typeMatch) {
                            results.push({
                                id: card.id,
                                name: card.card_name,
                                type: 'basic-universe',
                                image: `/src/resources/cards/images/${card.image}`,
                                character: null
                            });
                        }
                    });
                }

                if (power.success) {
                    power.data.forEach(card => {
                        if ((card.power_type && card.power_type.toLowerCase().includes(searchTerm)) || searchTerm === 'power card') {
                            results.push({
                                id: card.id,
                                name: card.power_type,
                                type: 'power',
                                image: `/src/resources/cards/images/${card.image}`,
                                character: null
                            });
                        }
                    });
                }

                if (locations.success) {
                    locations.data.forEach(card => {
                        const nameMatch = card.name && card.name.toLowerCase().includes(searchTerm);
                        const typeMatch = searchTerm === 'location';
                        if (nameMatch || typeMatch) {
                            results.push({
                                id: card.id,
                                name: card.name,
                                type: 'location',
                                image: `/src/resources/cards/images/locations/${card.image}`,
                                character: null
                            });
                        }
                    });
                }
            } catch (err) {
                console.error('CardSearchService error:', err);
            }

            return this._finalizeSearchResults(searchTerm, results);
        }
    }

    global.CardSearchService = CardSearchService;
})(window);


