
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
     *   - blurHideDelayMs: ms before hiding the dropdown after input blur (default 200 desktop,
     *     500 when (pointer: coarse) matches). MV / touch: use >= debounceMs so results are not
     *     hidden immediately after async search completes.
     *   - enableMultiSelect: boolean — opt-in checkbox selection for mobile batch add.
     *   - onBatchSelect: function(payload[]) invoked when the batch action is tapped.
     *   - batchActionLabel: function(count) or string for the batch action label.
     *
     * Rendering contract:
     *   - The component writes item markup into `results` and toggles its display.
     *   - `.deck-editor-search-results` must be absolutely positioned with a
     *     high z-index, and its parents must not clip overflow. See
     *     public/css/deck-editor-search.css for the canonical rules and
     *     tests/unit/deck-editor-search-css-rules.test.ts for safeguards.
     *
     * Normalized result shape:
     *   { id: string, name: string, type: string, image: string, fullImage?: string, character?: string, imagePath?: string,
     *     typeCaption?: string, missionBulkIds?: string[], missionSetName?: string }
     *   `image` is thumbnail preview (CDN + /thumb/ when available); `fullImage` is full-res for data-image-path / hover.
     *   Mission-set aggregate rows use `type: 'mission-set'`, `typeCaption` for the gray subtitle, and `missionBulkIds`.
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
            this._blurHideTimeout = null;
            this._bound = false;
            this._selectedResults = new Map();
            this.clearInputOnSelect = options.clearInputOnSelect !== false;
            this.enableMultiSelect = options.enableMultiSelect === true;
            this.onBatchSelect = typeof options.onBatchSelect === 'function' ? options.onBatchSelect : function() {};
            this.batchActionLabel = options.batchActionLabel || ((count) => `Add selected (${count})`);
            const coarsePointer =
                typeof global.matchMedia === 'function' && global.matchMedia('(pointer: coarse)').matches;
            if (options.blurHideDelayMs != null) {
                this.blurHideDelayMs = options.blurHideDelayMs;
            } else {
                this.blurHideDelayMs = coarsePointer ? 500 : 200;
            }
        }

        _isClickInsideSearchUi(target) {
            if (!target || typeof target.closest !== 'function') return false;
            for (let i = 0; i < this._clickInsideSelectors.length; i++) {
                const sel = this._clickInsideSelectors[i];
                if (sel && target.closest(sel)) return true;
            }
            return false;
        }

        _isFocusInsideRenderedResults() {
            if (!this.resultsEl || !document.activeElement) return false;
            return this.resultsEl.contains(document.activeElement);
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
            if (this._blurHideTimeout) {
                clearTimeout(this._blurHideTimeout);
                this._blurHideTimeout = null;
            }
            this.input.removeEventListener('input', this._handleInput);
            this.input.removeEventListener('blur', this._handleBlur);
            if (!this.clearInputOnSelect) {
                this.input.removeEventListener('focus', this._handleFocus);
            }
            document.removeEventListener('click', this._handleDocClick);
        }

        clear() {
            if (this.input) this.input.value = '';
            this._clearSelectedResults();
            this.hideResults();
        }

        dismissAfterSelection() {
            if (this.clearInputOnSelect && this.input) this.input.value = '';
            this._clearSelectedResults();
            this.hideResults();
        }

        _clearSelectedResults() {
            this._selectedResults.clear();
            this._updateBatchAction();
        }

        _getBatchActionLabel(count) {
            if (typeof this.batchActionLabel === 'function') {
                return this.batchActionLabel(count);
            }
            return String(this.batchActionLabel).replace('{count}', String(count));
        }

        _getResultKey(card) {
            return [
                String(card.type || ''),
                String(card.id || ''),
                String(card.name || '')
            ].join(':');
        }

        _payloadFromResultElement(el) {
            const id = el.getAttribute('data-id');
            const type = el.getAttribute('data-type');
            const name = el.getAttribute('data-name');
            const imagePathAttr = el.getAttribute('data-image-path') || null;
            let missionBulkIds;
            const bulkRaw = el.getAttribute('data-bulk-mission-ids');
            if (bulkRaw) {
                try {
                    missionBulkIds = JSON.parse(decodeURIComponent(bulkRaw));
                } catch {
                    missionBulkIds = [];
                }
            }
            const payload = {
                id,
                type,
                name,
                imagePath: imagePathAttr && imagePathAttr.length > 0 ? imagePathAttr : null
            };
            if (type === 'mission-set' && Array.isArray(missionBulkIds)) {
                payload.missionBulkIds = missionBulkIds;
                payload.missionSetName = name;
            }
            return payload;
        }

        _renderBatchAction() {
            if (!this.enableMultiSelect) return '';
            return `
                <div class="deck-editor-search-batch-action" data-deck-search-batch-action>
                    <button type="button"
                            class="deck-editor-search-batch-add-btn"
                            data-deck-search-batch-add
                            disabled>
                        ${this._getBatchActionLabel(0)}
                    </button>
                </div>
            `;
        }

        _updateBatchAction() {
            if (!this.resultsEl || !this.enableMultiSelect) return;
            const count = this._selectedResults.size;
            const action = this.resultsEl.querySelector('[data-deck-search-batch-action]');
            const button = this.resultsEl.querySelector('[data-deck-search-batch-add]');
            if (!action || !button) return;
            action.classList.toggle('is-visible', count > 0);
            button.disabled = count === 0;
            button.textContent = this._getBatchActionLabel(count);
        }

        _handleResultCheckboxChange(input, row) {
            const key = row.getAttribute('data-search-key');
            if (!key) return;
            if (input.checked) {
                this._selectedResults.set(key, this._payloadFromResultElement(row));
                row.classList.add('is-selected');
            } else {
                this._selectedResults.delete(key);
                row.classList.remove('is-selected');
            }
            this._updateBatchAction();
        }

        _bindBatchAction() {
            if (!this.resultsEl || !this.enableMultiSelect) return;
            const button = this.resultsEl.querySelector('[data-deck-search-batch-add]');
            if (!button) return;
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const payloads = Array.from(this._selectedResults.values());
                if (payloads.length === 0) return;
                button.disabled = true;
                try {
                    const result = await this.onBatchSelect(payloads);
                    if (result !== false) {
                        this.dismissAfterSelection();
                    } else {
                        button.disabled = false;
                    }
                } catch (err) {
                    button.disabled = false;
                    throw err;
                }
            });
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
            if (this._blurHideTimeout) clearTimeout(this._blurHideTimeout);
            this._blurHideTimeout = setTimeout(() => {
                this._blurHideTimeout = null;
                if (this._isFocusInsideRenderedResults()) {
                    return;
                }
                this.hideResults();
            }, this.blurHideDelayMs);
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
            this._clearSelectedResults();
            if (this.resultsEl) this.resultsEl.style.display = 'none';
        };

        render(results) {
            if (!this.resultsEl) return;
            this._clearSelectedResults();
            if (!Array.isArray(results) || results.length === 0) {
                this.resultsEl.innerHTML = '<div class="deck-editor-search-result">No cards found</div>';
                this.showResults();
                return;
            }

            const html = results.map(card => {
                const previewUrl = card.image || '';
                const fullPath =
                    card.fullImage || card.imagePath || card.image_path || card.image || '';
                const escapedFullPath = fullPath.replace(/"/g, '&quot;').replace(/'/g, "\\'");
                const typeLine =
                    card.typeCaption != null && String(card.typeCaption).trim() !== ''
                        ? String(card.typeCaption)
                        : typeof global.formatCardType === 'function'
                          ? global.formatCardType(card.type)
                          : card.type;
                const bulkAttr =
                    card.type === 'mission-set' && Array.isArray(card.missionBulkIds)
                        ? ` data-bulk-mission-ids="${encodeURIComponent(JSON.stringify(card.missionBulkIds))}"`
                        : '';
                const resultKey = this._getResultKey(card).replace(/"/g, '&quot;');
                const checkbox = this.enableMultiSelect
                    ? `
                    <label class="deck-editor-search-result-check" aria-label="Select ${String(card.name || '').replace(/"/g, '&quot;')} for batch add">
                        <input type="checkbox" data-deck-search-result-check>
                        <span class="deck-editor-search-result-check-box" aria-hidden="true"></span>
                    </label>`
                    : '';
                return `
                <div class="deck-editor-search-result"
                     data-search-key="${resultKey}"
                     data-id="${String(card.id || '').replace(/"/g, '&quot;')}"
                     data-type="${String(card.type || '').replace(/"/g, '&quot;')}"
                     data-name="${(card.name || '').replace(/"/g, '&quot;').replace(/'/g, "\\'")}"
                     data-image-path="${escapedFullPath}"${bulkAttr}>
                    <div class="deck-editor-search-result-image" style="background-image: url('${previewUrl}')"></div>
                    <div class="deck-editor-search-result-info">
                        <div class="deck-editor-search-result-name">${card.name}</div>
                        <div class="deck-editor-search-result-type">${typeLine}</div>
                        ${card.character ? `<div class="deck-editor-search-result-character">${card.character}</div>` : ''}
                    </div>
                    ${checkbox}
                </div>
            `;
            }).join('') + this._renderBatchAction();

            this.resultsEl.innerHTML = html;
            this.resultsEl.querySelectorAll('.deck-editor-search-result').forEach(el => {
                const checkbox = el.querySelector('[data-deck-search-result-check]');
                const checkboxControl = el.querySelector('.deck-editor-search-result-check');
                if (checkboxControl && checkbox) {
                    checkboxControl.addEventListener('click', (e) => {
                        e.stopPropagation();
                    });
                    checkbox.addEventListener('change', () => {
                        this._handleResultCheckboxChange(checkbox, el);
                    });
                }
                el.addEventListener('click', (e) => {
                    if (e.target && e.target.closest && e.target.closest('.deck-editor-search-result-check')) {
                        return;
                    }
                    const payload = this._payloadFromResultElement(el);
                    this.onSelect(payload);
                    this.dismissAfterSelection();
                });
            });
            this._bindBatchAction();
            this._updateBatchAction();
            this.showResults();
        }
    }

    global.DeckEditorSearch = DeckEditorSearch;
})(window);


