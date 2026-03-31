
    /**
     * DeckEditorSearch Component
     * ------------------------------------------
     * Encapsulated search UI for the Deck Editor. Provides debounced search across
     * all card families using CardSearchService, renders a dropdown of results,
     * and exposes a simple callback for selection.
     *
     * Usage:
     *   const component = new DeckEditorSearch({
     *       input: document.getElementById('deckEditorSearchInput'),
     *       results: document.getElementById('deckEditorSearchResults'),
     *       onSelect: ({ id, type, name, alternateImage }) => addCardToDeckFromSearch(id, type, name, alternateImage),
     *       debounceMs: 300,
     *       minChars: 2,
     *       maxResults: 20
     *   });
     *   component.mount();
     *
     * Public options:
     *   - input: HTMLInputElement for user typing (required)
     *   - results: HTMLElement container for rendered dropdown (required)
     *   - onSelect: function({ id, type, name, imagePath }) invoked when a result is clicked
     *   - minChars: minimum characters before searching (default: 2)
     *   - debounceMs: delay before querying (default: 300)
     *   - maxResults: maximum number of results to display (default: 20)
     *   - searchService: optional custom service with search(term) -> normalized array
     *   - clickInsideRootSelectors: string[] — for document click-outside handling; clicks inside
     *     any of these selectors (via element.closest) keep the dropdown open. Defaults to
     *     ['.deck-editor-search-container']. Pass e.g. ['.collection-search-container'] for
     *     Collection View, or ['.dev-mobile-deck-search-container'] for DEV in MV.
     *   - clearInputOnSelect: boolean — if false (e.g. DEV MV), keep the query after picking a
     *     result and refetch on focus when the field already has minChars. Default: true.
     *
     * Rendering contract:
     *   - The component writes item markup into `results` and toggles its display.
     *   - `.deck-editor-search-results` must be absolutely positioned with a
     *     high z-index, and its parents must not clip overflow. See
     *     public/css/deck-editor-search.css for the canonical rules and
     *     tests/unit/deck-editor-search-css-rules.test.ts for safeguards.
     *
     * Normalized result shape:
     *   { id: string, name: string, type: string, image: string, character?: string, imagePath?: string }
     *
     * Accessibility & Keyboard Navigation (future work):
     *   - The component is structured to support arrow key navigation and Enter
     *     selection in a future enhancement without changing the public API.
     */
(function(global) {
    class DeckEditorSearch {
        constructor(options = {}) {
            this.input = options.input || document.getElementById('deckEditorSearchInput');
            this.resultsEl = options.results || document.getElementById('deckEditorSearchResults');
            this.onSelect = options.onSelect || function() {};
            this.minChars = options.minChars || 2;
            this.debounceMs = options.debounceMs || 300;
            this.searchService = options.searchService || new global.CardSearchService({ maxResults: options.maxResults || 20 });
            const roots = options.clickInsideRootSelectors;
            this._clickInsideSelectors = Array.isArray(roots) && roots.length > 0
                ? roots
                : ['.deck-editor-search-container'];
            this._timeout = null;
            this._bound = false;
            this.clearInputOnSelect = options.clearInputOnSelect !== false;
        }

        _isClickInsideSearchUi(target) {
            if (!target || typeof target.closest !== 'function') return false;
            for (let i = 0; i < this._clickInsideSelectors.length; i++) {
                const sel = this._clickInsideSelectors[i];
                if (sel && target.closest(sel)) return true;
            }
            return false;
        }

        mount() {
            if (!this.input || !this.resultsEl) return;
            if (this._bound) return;
            this._bound = true;

            this.input.addEventListener('input', this._handleInput);
            this.input.addEventListener('blur', this._handleBlur);
            if (!this.clearInputOnSelect) {
                this.input.addEventListener('focus', this._handleFocus);
            }
            document.addEventListener('click', this._handleDocClick);
        }

        unmount() {
            if (!this._bound) return;
            this._bound = false;
            this.input.removeEventListener('input', this._handleInput);
            this.input.removeEventListener('blur', this._handleBlur);
            if (!this.clearInputOnSelect) {
                this.input.removeEventListener('focus', this._handleFocus);
            }
            document.removeEventListener('click', this._handleDocClick);
        }

        clear() {
            if (this.input) this.input.value = '';
            this.hideResults();
        }

        dismissAfterSelection() {
            if (this.clearInputOnSelect && this.input) this.input.value = '';
            this.hideResults();
        }

        _runDebouncedSearchFromInput() {
            if (!this.input) return;
            if (this._timeout) clearTimeout(this._timeout);
            this._timeout = setTimeout(async () => {
                const term = (this.input.value || '').trim().toLowerCase();
                if (term.length < this.minChars) {
                    this.hideResults();
                    return;
                }
                const results = await this.searchService.search(term);
                this.render(results);
            }, this.debounceMs);
        }

        // Bound arrow methods to preserve context
        _handleInput = (e) => {
            const term = (e.target.value || '').trim().toLowerCase();
            if (term.length < this.minChars) {
                if (this._timeout) clearTimeout(this._timeout);
                this.hideResults();
                return;
            }
            this._runDebouncedSearchFromInput();
        };

        _handleFocus = () => {
            if (this.clearInputOnSelect || !this.input) return;
            const term = (this.input.value || '').trim().toLowerCase();
            if (term.length < this.minChars) return;
            this._runDebouncedSearchFromInput();
        };

        _handleBlur = () => {
            setTimeout(() => this.hideResults(), 200);
        };

        _handleDocClick = (e) => {
            if (!this._isClickInsideSearchUi(e.target)) {
                this.hideResults();
            }
        };

        showResults = () => {
            if (this.resultsEl) {
                this.resultsEl.style.display = 'block';
            }
        };

        hideResults = () => {
            if (this.resultsEl) this.resultsEl.style.display = 'none';
        };

        render(results) {
            if (!this.resultsEl) return;
            if (!Array.isArray(results) || results.length === 0) {
                this.resultsEl.innerHTML = '<div class="deck-editor-search-result">No cards found</div>';
                this.showResults();
                return;
            }

            const html = results.map(card => {
                // After migration, alternate cards are separate cards, so we use the card's image directly
                const imagePath = card.image || card.image_path || '';
                const escapedImagePath = imagePath.replace(/"/g, '&quot;').replace(/'/g, "\\'");
                return `
                <div class="deck-editor-search-result"
                     data-id="${card.id}"
                     data-type="${card.type}"
                     data-name="${(card.name || '').replace(/'/g, "\\'")}"
                     data-image-path="${escapedImagePath}">
                    <div class="deck-editor-search-result-image" style="background-image: url('${card.image}')"></div>
                    <div class="deck-editor-search-result-info">
                        <div class="deck-editor-search-result-name">${card.name}</div>
                        <div class="deck-editor-search-result-type">${typeof global.formatCardType === 'function' ? global.formatCardType(card.type) : card.type}</div>
                        ${card.character ? `<div class="deck-editor-search-result-character">${card.character}</div>` : ''}
                    </div>
                </div>
            `;
            }).join('');

            this.resultsEl.innerHTML = html;
            this.resultsEl.querySelectorAll('.deck-editor-search-result').forEach(el => {
                el.addEventListener('click', () => {
                    const id = el.getAttribute('data-id');
                    const type = el.getAttribute('data-type');
                    const name = el.getAttribute('data-name');
                    const imagePath = el.getAttribute('data-image-path') || null;
                    this.onSelect({ id, type, name, imagePath: imagePath && imagePath.length > 0 ? imagePath : null });
                    this.dismissAfterSelection();
                });
            });
            this.showResults();
        }
    }

    global.DeckEditorSearch = DeckEditorSearch;
})(window);


