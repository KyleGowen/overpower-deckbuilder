class ViewManager {
    constructor() {
        // Default to tile view initially - will be updated during initialization
        this.currentView = 'tile';
        this.deckCardsEditor = null;
        this.listViewBtn = null;
    }

    initialize() {
        this.deckCardsEditor = document.getElementById('deckCardsEditor');
        this.listViewBtn = document.getElementById('listViewBtn');
        
        // All users now start with Card View as the default
        this.currentView = 'card';
        this.setInitialView();
    }
    
    setInitialView() {
        // Set button text for all users (Card View → List View → Tile View)
        if (this.listViewBtn) {
            this.listViewBtn.textContent = 'List View';
        }
    }
    
    async applyInitialView() {
        // Apply the initial view based on currentView setting
        if (this.currentView === 'card') {
            await this.switchToCardView();
        } else {
            // Default to tile view
            await this.switchToTileView();
        }
    }

    async switchToTileView() {
        this.currentView = 'tile';

        if (typeof window.isLayoutMobile === 'function' && window.isLayoutMobile()) {
            if (this.deckCardsEditor) {
                this.deckCardsEditor.classList.remove('list-view', 'card-view', 'two-column');
            }
            await displayDeckCardsForEditing();
            return;
        }
        
        // Disconnect layout observer when switching to tile view
        if (layoutObserver) {
            layoutObserver.disconnect();
            layoutObserver = null;
        }
        
        if (this.deckCardsEditor) {
            this.deckCardsEditor.classList.remove('list-view');
            this.deckCardsEditor.classList.remove('card-view');
        }
        
        if (this.listViewBtn) {
            // All users now have the same view cycling: Card View → List View → Tile View → Card View
            this.listViewBtn.textContent = 'Card View';
        }
        
        // Use the original function to maintain exact behavior
        await displayDeckCardsForEditing();
        
        // Force layout recalculation to ensure tiles stretch properly
        // This fixes the issue where tiles don't take up full width initially
        if (this.deckCardsEditor) {
            // Wait for DOM to be fully updated
            await new Promise(resolve => requestAnimationFrame(resolve));
            
            // CRITICAL FIX: Ensure two-column layout is properly set up
            // First, ensure the two-column class is present
            if (!this.deckCardsEditor.classList.contains('two-column')) {
                this.deckCardsEditor.classList.add('two-column');
            }
            
            // Ensure columns exist - create them if they don't
            let deckColumns = this.deckCardsEditor.querySelectorAll('.deck-column');
            if (deckColumns.length === 0) {
                // Columns don't exist yet - create them
                if (typeof createTwoColumnLayout === 'function') {
                    createTwoColumnLayout();
                    // Re-query after creation
                    deckColumns = this.deckCardsEditor.querySelectorAll('.deck-column');
                }
            }
            
            // Force columns to stretch properly
            if (deckColumns.length > 0) {
                // Ensure deckCardsEditor is set up as flex container
                this.deckCardsEditor.style.display = 'flex';
                this.deckCardsEditor.style.flexDirection = 'row';
                this.deckCardsEditor.style.gap = '20px';
                this.deckCardsEditor.style.alignItems = 'flex-start';
                
                deckColumns.forEach(column => {
                    // Force column to stretch by setting flex properties directly
                    column.style.flex = '1 1 0%';
                    column.style.display = 'flex';
                    column.style.flexDirection = 'column';
                    column.style.gap = '20px';
                    column.style.width = '';
                    column.style.maxWidth = '';
                    column.style.minWidth = '0';
                    column.style.flexBasis = '0%';
                    
                    // Force reflow
                    void column.offsetWidth;
                    void column.offsetHeight;
                });
                
                // Force deckCardsEditor reflow to ensure it calculates column widths
                void this.deckCardsEditor.offsetWidth;
                void this.deckCardsEditor.offsetHeight;
            }
            
            // Force grid containers to recalculate by accessing their layout properties
            const gridContainers = this.deckCardsEditor.querySelectorAll('.deck-type-cards');
            gridContainers.forEach(container => {
                // Force reflow by accessing layout properties
                void container.offsetWidth;
                void container.offsetHeight;
                // Force grid recalculation by temporarily toggling display
                const originalDisplay = window.getComputedStyle(container).display;
                if (originalDisplay === 'grid') {
                    container.style.display = 'block';
                    void container.offsetHeight; // Force reflow
                    container.style.display = 'grid';
                    void container.offsetHeight; // Force reflow again
                }
            });
            
            // Force container reflow
            void this.deckCardsEditor.offsetWidth;
            void this.deckCardsEditor.offsetHeight;
            
            // Wait another frame for layout to settle
            await new Promise(resolve => requestAnimationFrame(resolve));
            
            // Access tile layout properties to ensure they stretch
            const tiles = this.deckCardsEditor.querySelectorAll('.deck-card-editor-item.preview-view');
            tiles.forEach(tile => {
                void tile.offsetWidth;
            });
            
            // Trigger a synthetic resize event to force any resize listeners to recalculate
            window.dispatchEvent(new Event('resize'));
            
            // One more frame to ensure everything is settled
            await new Promise(resolve => requestAnimationFrame(resolve));
            
            // Final check: Force columns to stretch one more time after everything settles
            if (deckColumns.length > 0) {
                deckColumns.forEach(column => {
                    void column.offsetWidth;
                    void column.offsetHeight;
                });
            }
            
            // Trigger layout update to ensure proper column widths
            // This calls updateDeckLayout which handles the two-column logic
            if (typeof updateDeckLayout === 'function') {
                const deckPane = document.querySelector('.deck-pane');
                if (deckPane) {
                    const layout = document.querySelector('.deck-editor-layout');
                    if (layout) {
                        const deckWidth = deckPane.getBoundingClientRect().width;
                        const layoutWidth = layout.getBoundingClientRect().width;
                        updateDeckLayout(deckWidth, layoutWidth);
                    }
                }
            }
        }
    }

    async switchToListView() {
        this.currentView = 'list';

        if (typeof window.isLayoutMobile === 'function' && window.isLayoutMobile()) {
            if (this.deckCardsEditor) {
                this.deckCardsEditor.classList.remove('list-view', 'card-view', 'two-column');
            }
            if (typeof renderDeckEditorMobileView === 'function') {
                renderDeckEditorMobileView();
            }
            return;
        }
        
        if (this.deckCardsEditor) {
            this.deckCardsEditor.classList.add('list-view');
            this.deckCardsEditor.classList.remove('card-view');
        }
        
        if (this.listViewBtn) {
            this.listViewBtn.textContent = 'Tile View';
        }
        
        // Use the original function to maintain exact behavior
        renderDeckCardsListView();
        
        // Set up layout observer for list view
        setupLayoutObserver();
        
        // Force 2-column layout for list view
        setTimeout(() => {
            enforceTwoColumnLayoutInListView();
        }, 10);
        
        // Force immediate layout fix for list view
        setTimeout(() => {
            const listItems = this.deckCardsEditor.querySelectorAll('.deck-list-item');
            listItems.forEach(item => {
                item.style.display = 'flex';
                item.style.flexDirection = 'row';
                item.style.flexWrap = 'nowrap';
                item.style.width = '100%';
                item.style.minWidth = '0';
                item.style.boxSizing = 'border-box';
                item.style.alignItems = 'center';
                item.style.justifyContent = 'flex-start';
            });
            this.deckCardsEditor.offsetHeight; // Trigger reflow
            
            // Additional enforcement after a short delay
            setTimeout(() => {
                const listItems = this.deckCardsEditor.querySelectorAll('.deck-list-item');
                listItems.forEach(item => {
                    item.style.display = 'flex';
                    item.style.flexDirection = 'row';
                    item.style.flexWrap = 'nowrap';
                    item.style.width = '100%';
                    item.style.minWidth = '100%';
                    item.style.boxSizing = 'border-box';
                    item.style.alignItems = 'center';
                    item.style.justifyContent = 'flex-start';
                });
            }, 50);
        }, 10);
    }

    async switchToCardView() {
        this.currentView = 'card';

        if (typeof window.isLayoutMobile === 'function' && window.isLayoutMobile()) {
            if (this.deckCardsEditor) {
                this.deckCardsEditor.classList.remove('list-view', 'card-view', 'two-column');
            }
            if (typeof renderDeckEditorMobileView === 'function') {
                renderDeckEditorMobileView();
            }
            return;
        }
        
        // Disconnect layout observer when switching to card view
        if (layoutObserver) {
            layoutObserver.disconnect();
            layoutObserver = null;
        }
        
        if (this.deckCardsEditor) {
            this.deckCardsEditor.classList.remove('list-view');
            this.deckCardsEditor.classList.remove('two-column'); // Remove two-column class that interferes with Card View
            this.deckCardsEditor.classList.add('card-view');
        }
        
        if (this.listViewBtn) {
            this.listViewBtn.textContent = 'List View';
        }
        
        // Use the new card view rendering function - completely independent
        renderDeckCardsCardView();
    }

    getCurrentView() {
        return this.currentView;
    }

    isListView() {
        return this.currentView === 'list';
    }

    isTileView() {
        return this.currentView === 'tile';
    }

    isCardView() {
        return this.currentView === 'card';
    }
}

// Global view manager instance (var so classic scripts share one binding)
var viewManager = new ViewManager();
if (typeof window !== 'undefined') {
    window.viewManager = viewManager;
}
