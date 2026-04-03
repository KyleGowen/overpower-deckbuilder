// CardSearchService: centralized fetching and normalization of card search results
// Returns results in the form: { id, name, type, image, fullImage?, character?, imagePath? }

(function(global) {
    class CardSearchService {
        constructor(options = {}) {
            this.maxResults = options.maxResults || 20;
        }

        /**
         * Deck editor search label for teamwork rows (matches teamwork_cards columns:
         * name, followup_attack_types, first_attack_bonus, second_attack_bonus).
         */
        static formatTeamworkSearchDisplayName(card) {
            if (!card) return '';
            const rawName = card.name != null && String(card.name).trim() !== '' ? card.name : card.to_use;
            const n = String(rawName != null ? rawName : '').trim();
            const fut = String(card.followup_attack_types != null ? card.followup_attack_types : '').trim();
            const f1 = String(card.first_attack_bonus != null ? card.first_attack_bonus : '').trim();
            const f2 = String(card.second_attack_bonus != null ? card.second_attack_bonus : '').trim();
            return `${n} - ${fut} - +${f1}/+${f2}`;
        }

        static teamworkCardMatchesSearchTerm(card, termLower) {
            if (!card || !termLower) return false;
            if (termLower === 'teamwork') return true;
            const keys = [
                'name',
                'to_use',
                'followup_attack_types',
                'first_attack_bonus',
                'second_attack_bonus',
                'character',
                'character_name'
            ];
            for (let i = 0; i < keys.length; i++) {
                const v = card[keys[i]];
                if (v != null && String(v).toLowerCase().includes(termLower)) return true;
            }
            return false;
        }

        /** Deck editor search label for power rows: `{value} {power_type}` (power_cards.value + power_type). */
        static formatPowerSearchDisplayName(card) {
            if (!card) return '';
            const pt = String(card.power_type != null ? card.power_type : '').trim();
            const v = card.value;
            const num = v != null && v !== '' ? Number(v) : NaN;
            if (!Number.isNaN(num) && pt) {
                return `${num} ${pt}`;
            }
            return pt || String(card.name != null ? card.name : '').trim();
        }

        static powerCardMatchesSearchTerm(card, termLower) {
            if (!card || termLower == null || termLower === '') return false;
            const t = String(termLower).toLowerCase();
            if (t === 'power card') return true;
            const label = CardSearchService.formatPowerSearchDisplayName(card).toLowerCase();
            if (label.includes(t)) return true;
            return false;
        }

        /**
         * Sort key for picking representative mission thumbnail (lowest set_number first; missing last).
         * Prefer numeric `set_number_int` when present; else leading digits from `set_number`.
         */
        static missionSetNumberSortKey(m) {
            if (!m) return Number.POSITIVE_INFINITY;
            const sni = m.set_number_int;
            if (sni != null && sni !== '' && Number.isFinite(Number(sni))) {
                return Number(sni);
            }
            const sn = m.set_number;
            if (sn == null || sn === '') return Number.POSITIVE_INFINITY;
            const match = String(sn).trim().match(/^\d+/);
            return match ? parseInt(match[0], 10) : Number.POSITIVE_INFINITY;
        }

        _getImagePath(card, cardType) {
            const img = card.image || card.image_path || '';
            return cardType === 'location'
                ? `/src/resources/cards/images/locations/${img}`
                : `/src/resources/cards/images/${img}`;
        }

        /**
         * Preview URL (thumbnail + CDN when getCardImagePath exists) and full-res URL for data-image-path / hover.
         */
        _getSearchImageUrls(card, cardType) {
            const legacy = this._getImagePath(card, cardType);
            const g = typeof global.getCardImagePath === 'function' ? global.getCardImagePath.bind(global) : null;
            if (!g) {
                return { image: legacy, fullImage: legacy };
            }
            try {
                const preview = g(card, cardType, { useThumbnail: true });
                const full = g(card, cardType);
                return {
                    image: preview || legacy,
                    fullImage: full || legacy
                };
            } catch {
                return { image: legacy, fullImage: legacy };
            }
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

        /**
         * One synthetic row per distinct mission_set whose title includes the term (not for generic "mission"/"missions" queries).
         */
        _appendMissionSetBulkResults(termLower, allMissionRows, resultsArray) {
            if (!termLower || termLower === 'mission' || termLower === 'missions') return;
            if (!Array.isArray(allMissionRows) || !Array.isArray(resultsArray)) return;
            const t = String(termLower).toLowerCase();
            const bySet = new Map();
            for (let i = 0; i < allMissionRows.length; i++) {
                const m = allMissionRows[i];
                const ms = m && m.mission_set;
                if (ms == null || String(ms).trim() === '') continue;
                const setName = String(ms);
                if (!setName.toLowerCase().includes(t)) continue;
                if (!bySet.has(setName)) bySet.set(setName, []);
                bySet.get(setName).push(m);
            }
            for (const [setName, missionsInSet] of bySet) {
                if (!missionsInSet.length) continue;
                const sorted = missionsInSet.slice().sort((a, b) => {
                    const ka = CardSearchService.missionSetNumberSortKey(a);
                    const kb = CardSearchService.missionSetNumberSortKey(b);
                    if (ka !== kb) return ka - kb;
                    return String(a.id || '').localeCompare(String(b.id || ''));
                });
                const thumb = sorted[0];
                const urls = this._getSearchImageUrls(thumb, 'mission');
                const count = missionsInSet.length;
                const missionBulkIds = sorted.map(x => x.id).filter(id => id != null && id !== '');
                const id = `mission-set-bulk:${encodeURIComponent(setName)}`;
                resultsArray.push({
                    id,
                    name: setName,
                    type: 'mission-set',
                    missionSetName: setName,
                    typeCaption: `${count} Card Mission Set`,
                    image: urls.image,
                    fullImage: urls.fullImage,
                    character: null,
                    missionBulkIds,
                    imagePath: thumb.image || thumb.image_path
                });
            }
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
                else if (type === 'teamwork' && CardSearchService.teamworkCardMatchesSearchTerm(card, term)) match = true;
                else if (type === 'ally-universe' && ((card.card_name || '').toLowerCase().includes(term) || term === 'ally')) match = true;
                else if (type === 'training' && !card.is_foil && ((card.card_name || '').toLowerCase().includes(term) || term === 'training')) match = true;
                else if (type === 'basic-universe' && ((card.card_name || '').toLowerCase().includes(term) || term === 'basic')) match = true;
                else if (type === 'power' && CardSearchService.powerCardMatchesSearchTerm(card, term)) match = true;
                else if (type === 'location' && (name.includes(term) || term === 'location')) match = true;
                if (match) {
                    const displayName =
                        type === 'teamwork'
                            ? CardSearchService.formatTeamworkSearchDisplayName(card)
                            : type === 'power'
                              ? CardSearchService.formatPowerSearchDisplayName(card)
                              : card.card_name || card.name || card.power_type;
                    if (displayName) {
                        const linked = this._linkedCharacterRaw(card);
                        const t = type === 'advanced-universe' ? type : (type === 'ally-universe' ? type : (type === 'basic-universe' ? type : type));
                        const urls = this._getSearchImageUrls(card, t);
                        results.push({
                            id: card.id,
                            name: displayName,
                            type: t,
                            image: urls.image,
                            fullImage: urls.fullImage,
                            character: linked || null,
                            imagePath: card.image || card.image_path
                        });
                    }
                }
            }
            const allMissions = [];
            for (const card of byId.values()) {
                const ctype = card.cardType || card.type;
                if (ctype === 'mission') allMissions.push(card);
            }
            this._appendMissionSetBulkResults(term, allMissions, results);
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
                const fetchList =
                    typeof fetchCatalogList === 'function'
                        ? fetchCatalogList
                        : async (url) => {
                              try {
                                  const r = await fetch(url);
                                  const j = await r.json();
                                  const responseOk = r.ok !== false;
                                  const ok =
                                      responseOk &&
                                      j &&
                                      Array.isArray(j.data) &&
                                      j.success !== false &&
                                      (!j.errors || j.errors.length === 0);
                                  return { ok, rows: ok ? j.data : [] };
                              } catch {
                                  return { ok: false, rows: [] };
                              }
                          };
                const [characters, specials, missions, events, aspects, advanced, teamwork, ally, training, basic, power, locations] = await Promise.all([
                    fetchList('/api/v1/catalog/characters'),
                    fetchList('/api/v1/catalog/special-cards'),
                    fetchList('/api/v1/catalog/missions'),
                    fetchList('/api/v1/catalog/events'),
                    fetchList('/api/v1/catalog/aspects'),
                    fetchList('/api/v1/catalog/advanced-universe'),
                    fetchList('/api/v1/catalog/teamwork'),
                    fetchList('/api/ally-universe'),
                    fetchList('/api/training'),
                    fetchList('/api/basic-universe'),
                    fetchList('/api/power-cards'),
                    fetchList('/api/v1/catalog/locations')
                ]);

                if (characters.ok) {
                    characters.rows.forEach(char => {
                        if (char.name && char.name.toLowerCase().includes(searchTerm)) {
                            const urls = this._getSearchImageUrls(char, 'character');
                            results.push({
                                id: char.id,
                                name: char.name,
                                type: 'character',
                                image: urls.image,
                                fullImage: urls.fullImage,
                                character: null,
                                imagePath: char.image
                            });
                        }
                    });
                }

                if (specials.ok) {
                    specials.rows.forEach(card => {
                        const linkedChar = (card.character || card.character_name || '');
                        const nameMatch = card.name && card.name.toLowerCase().includes(searchTerm);
                        const characterMatch = linkedChar && linkedChar.toLowerCase().includes(searchTerm);
                        const exactCharacterMatch = linkedChar && linkedChar.toLowerCase() === searchTerm;
                        const typeMatch = searchTerm === 'special';
                        if (nameMatch || characterMatch || exactCharacterMatch || typeMatch) {
                            const urls = this._getSearchImageUrls(card, 'special');
                            results.push({
                                id: card.id,
                                name: card.name,
                                type: 'special',
                                image: urls.image,
                                fullImage: urls.fullImage,
                                character: linkedChar || null,
                                imagePath: card.image
                            });
                        }
                    });
                }

                if (missions.ok) {
                    missions.rows.forEach(mission => {
                        const nameMatch = mission.card_name && mission.card_name.toLowerCase().includes(searchTerm);
                        const setMatch = mission.mission_set && mission.mission_set.toLowerCase().includes(searchTerm);
                        const typeMatch = searchTerm === 'mission' || searchTerm === 'missions';
                        if (nameMatch || setMatch || typeMatch) {
                            const urls = this._getSearchImageUrls(mission, 'mission');
                            results.push({
                                id: mission.id,
                                name: mission.card_name,
                                type: 'mission',
                                image: urls.image,
                                fullImage: urls.fullImage,
                                character: mission.mission_set
                            });
                        }
                    });
                    this._appendMissionSetBulkResults(searchTerm, missions.rows, results);
                }

                if (events.ok) {
                    events.rows.forEach(event => {
                        const nameMatch = event.name && event.name.toLowerCase().includes(searchTerm);
                        const setMatch = event.mission_set && event.mission_set.toLowerCase().includes(searchTerm);
                        const typeMatch = searchTerm === 'event' || searchTerm === 'events';
                        if (nameMatch || setMatch || typeMatch) {
                            const urls = this._getSearchImageUrls(event, 'event');
                            results.push({
                                id: event.id,
                                name: event.name,
                                type: 'event',
                                image: urls.image,
                                fullImage: urls.fullImage,
                                character: event.mission_set
                            });
                        }
                    });
                }

                if (aspects.ok) {
                    aspects.rows.forEach(aspect => {
                        if (aspect.card_name && aspect.card_name.toLowerCase().includes(searchTerm)) {
                            const urls = this._getSearchImageUrls(aspect, 'aspect');
                            results.push({
                                id: aspect.id,
                                name: aspect.card_name,
                                type: 'aspect',
                                image: urls.image,
                                fullImage: urls.fullImage,
                                character: null
                            });
                        }
                    });
                }

                if (advanced.ok) {
                    advanced.rows.forEach(card => {
                        const linked = (card.character || card.character_name || '');
                        const nameMatch = card.name && card.name.toLowerCase().includes(searchTerm);
                        const characterMatch = linked && linked.toLowerCase().includes(searchTerm);
                        const exactCharacterMatch = linked && linked.toLowerCase() === searchTerm;
                        const typeMatch = searchTerm === 'advanced';
                        if (nameMatch || characterMatch || exactCharacterMatch || typeMatch) {
                            const urls = this._getSearchImageUrls(card, 'advanced-universe');
                            results.push({
                                id: card.id,
                                name: card.name,
                                type: 'advanced-universe',
                                image: urls.image,
                                fullImage: urls.fullImage,
                                character: linked || null
                            });
                        }
                    });
                }

                if (teamwork.ok) {
                    teamwork.rows.forEach(card => {
                        const linked = (card.character || card.character_name || '');
                        if (!CardSearchService.teamworkCardMatchesSearchTerm(card, searchTerm)) return;
                        const urls = this._getSearchImageUrls(card, 'teamwork');
                        results.push({
                            id: card.id,
                            name: CardSearchService.formatTeamworkSearchDisplayName(card),
                            type: 'teamwork',
                            image: urls.image,
                            fullImage: urls.fullImage,
                            character: linked || null
                        });
                    });
                }

                if (ally.ok) {
                    ally.rows.forEach(card => {
                        const nameMatch = card.card_name && card.card_name.toLowerCase().includes(searchTerm);
                        const typeMatch = searchTerm === 'ally';
                        if (nameMatch || typeMatch) {
                            const urls = this._getSearchImageUrls(card, 'ally-universe');
                            results.push({
                                id: card.id,
                                name: card.card_name,
                                type: 'ally-universe',
                                image: urls.image,
                                fullImage: urls.fullImage,
                                character: null
                            });
                        }
                    });
                }

                if (training.ok) {
                    training.rows.forEach(card => {
                        if (card.is_foil) return;
                        const nameMatch = card.card_name && card.card_name.toLowerCase().includes(searchTerm);
                        const typeMatch = searchTerm === 'training';
                        if (nameMatch || typeMatch) {
                            const urls = this._getSearchImageUrls(card, 'training');
                            results.push({
                                id: card.id,
                                name: card.card_name,
                                type: 'training',
                                image: urls.image,
                                fullImage: urls.fullImage,
                                character: null
                            });
                        }
                    });
                }

                if (basic.ok) {
                    basic.rows.forEach(card => {
                        const nameMatch = card.card_name && card.card_name.toLowerCase().includes(searchTerm);
                        const typeMatch = searchTerm === 'basic';
                        if (nameMatch || typeMatch) {
                            const urls = this._getSearchImageUrls(card, 'basic-universe');
                            results.push({
                                id: card.id,
                                name: card.card_name,
                                type: 'basic-universe',
                                image: urls.image,
                                fullImage: urls.fullImage,
                                character: null
                            });
                        }
                    });
                }

                if (power.ok) {
                    power.rows.forEach(card => {
                        if (!CardSearchService.powerCardMatchesSearchTerm(card, searchTerm)) return;
                        const urls = this._getSearchImageUrls(card, 'power');
                        results.push({
                            id: card.id,
                            name: CardSearchService.formatPowerSearchDisplayName(card),
                            type: 'power',
                            image: urls.image,
                            fullImage: urls.fullImage,
                            character: null
                        });
                    });
                }

                if (locations.ok) {
                    locations.rows.forEach(card => {
                        const nameMatch = card.name && card.name.toLowerCase().includes(searchTerm);
                        const typeMatch = searchTerm === 'location';
                        if (nameMatch || typeMatch) {
                            const urls = this._getSearchImageUrls(card, 'location');
                            results.push({
                                id: card.id,
                                name: card.name,
                                type: 'location',
                                image: urls.image,
                                fullImage: urls.fullImage,
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
    global.formatTeamworkSearchDisplayName = CardSearchService.formatTeamworkSearchDisplayName.bind(CardSearchService);
    global.teamworkCardMatchesSearchTerm = CardSearchService.teamworkCardMatchesSearchTerm.bind(CardSearchService);
    global.formatPowerSearchDisplayName = CardSearchService.formatPowerSearchDisplayName.bind(CardSearchService);
    global.powerCardMatchesSearchTerm = CardSearchService.powerCardMatchesSearchTerm.bind(CardSearchService);
})(window);


