/**
 * MV deck editor — reserve UX: ⋯ menu rows + under-name Reserve label.
 * Loads public/js/deck-editor-mobile-view.js in jsdom/vm (same pattern as deck-editor-mobile-header-collapse.test.ts).
 *
 * SYNC: computeReserveCharacterRowStateImpl must stay aligned with
 * extractReserveUuid + computeReserveCharacterRowState in public/js/index-page.js
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { JSDOM } from 'jsdom';
import { runInNewContext } from 'vm';

/** Copy of index-page reserve UUID normalization — keep in sync. */
function extractReserveUuid(id: string | null | undefined): string | null {
    if (!id) return null;
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidPattern.test(id)) return id;
    const prefixedMatch = id.match(/^[a-z]+_([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
    if (prefixedMatch && prefixedMatch[1]) return prefixedMatch[1];
    const parts = id.split('_');
    for (let i = 1; i < parts.length; i++) {
        const candidate = parts.slice(i).join('_');
        if (uuidPattern.test(candidate)) return candidate;
    }
    return id;
}

interface ReserveRowState {
    hasReserveCharacter: boolean;
    reserveCharacterId: string | null | undefined;
    isReadOnlyUI: boolean;
    isReserveCharacter: boolean;
    reserveMatchesAnyCard: boolean;
}

/** Copy of computeReserveCharacterRowState — uses win.* only (vm-safe). */
function computeReserveCharacterRowStateImpl(cardId: string, index: number, win: Window & any): ReserveRowState {
    const deckData = win.currentDeckData;
    const reserveCharacterId = deckData?.metadata?.reserve_character;
    const hasReserveCharacter = !!reserveCharacterId;
    const isReadOnlyUI = !!(
        win.document.body?.classList?.contains?.('read-only-mode')
    );

    let isReserveCharacter = false;
    const deckCards: any[] | undefined = win.deckEditorCards;
    if (reserveCharacterId && deckCards && deckCards[index]) {
        const card = deckCards[index];

        const normalizedReserveId = extractReserveUuid(reserveCharacterId)!;
        const normalizedCardId = extractReserveUuid(card.cardId)!;

        if (normalizedReserveId === normalizedCardId) {
            isReserveCharacter = true;
        } else if (card.selectedAlternateCardId) {
            const normalizedAlternateId = extractReserveUuid(card.selectedAlternateCardId)!;
            if (normalizedReserveId === normalizedAlternateId) {
                isReserveCharacter = true;
            }
        } else if (card.selectedAlternateCardIds && Array.isArray(card.selectedAlternateCardIds)) {
            for (const altId of card.selectedAlternateCardIds) {
                const normalizedAltId = extractReserveUuid(altId)!;
                if (normalizedReserveId === normalizedAltId) {
                    isReserveCharacter = true;
                    break;
                }
            }
        }
    } else if (reserveCharacterId) {
        isReserveCharacter = reserveCharacterId === cardId;
    }

    let reserveMatchesAnyCard = false;
    if (hasReserveCharacter && deckCards) {
        const normalizedReserveId = extractReserveUuid(reserveCharacterId)!;
        for (const card of deckCards) {
            if (card.type !== 'character') continue;
            const normalizedCid = extractReserveUuid(card.cardId)!;
            if (normalizedReserveId === normalizedCid) {
                reserveMatchesAnyCard = true;
                break;
            }
            if (card.selectedAlternateCardId) {
                const normalizedAltId = extractReserveUuid(card.selectedAlternateCardId)!;
                if (normalizedReserveId === normalizedAltId) {
                    reserveMatchesAnyCard = true;
                    break;
                }
            }
            if (card.selectedAlternateCardIds && Array.isArray(card.selectedAlternateCardIds)) {
                for (const altId of card.selectedAlternateCardIds) {
                    const normalizedAltId = extractReserveUuid(altId)!;
                    if (normalizedReserveId === normalizedAltId) {
                        reserveMatchesAnyCard = true;
                        break;
                    }
                }
                if (reserveMatchesAnyCard) break;
            }
        }
    }

    return {
        hasReserveCharacter,
        reserveCharacterId,
        isReadOnlyUI,
        isReserveCharacter,
        reserveMatchesAnyCard
    };
}

const CHAR_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const CHAR_B_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const CHAR_ALT = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

function buildDom(): JSDOM {
    return new JSDOM(
        `<!DOCTYPE html><html><body class="layout-mobile">
            <div id="deckEditorModal">
                <div id="deckCardsEditor"></div>
            </div>
            <div id="devMobileDeckActionsSheet" hidden>
                <div id="devMobileDeckActionsPanel">
                    <div id="devMobileDeckActionsBody"></div>
                </div>
            </div>
        </body></html>`,
        { url: 'http://localhost', pretendToBeVisual: true }
    );
}

describe('Deck editor MV — reserve label + ⋯ actions', () => {
    let mobileCode: string;

    beforeAll(() => {
        mobileCode = readFileSync(join(__dirname, '../../public/js/deck-editor-mobile-view.js'), 'utf8');
    });

    function loadMobileScript(win: Window & any) {
        const crs = (cid: string, idx: number) => computeReserveCharacterRowStateImpl(cid, idx, win);
        win.computeReserveCharacterRowState = crs;
        win.getCardImagePath = () => '';
        win.getDeckEditorCardViewInitialImagePath = (_p: string) => '';
        win.updateDeckEditorCardCount = jest.fn();
        win.updateDeckSummary = jest.fn();
        runInNewContext(mobileCode, {
            window: win,
            document: win.document,
            console,
            addEventListener: win.addEventListener.bind(win),
            requestAnimationFrame: (cb: FrameRequestCallback) => win.requestAnimationFrame(cb),
            deckEditorExpansionState: {},
            computeReserveCharacterRowState: crs
        });

        const HT = win.HTMLElement as any;
        jest.spyOn(HT.prototype, 'getBoundingClientRect').mockReturnValue({
            left: 200,
            right: 238,
            top: 400,
            bottom: 438,
            width: 38,
            height: 38,
            x: 200,
            y: 400,
            toJSON: () => ({})
        } as DOMRect);

        jest.spyOn(HT.prototype, 'offsetWidth', 'get').mockReturnValue(200);
        jest.spyOn(HT.prototype, 'offsetHeight', 'get').mockReturnValue(120);
    }

    afterEach(() => {
        jest.restoreAllMocks();
    });

    function twoCharacterDeck(withAltOnFirst = false): any[] {
        const first = {
            type: 'character',
            cardId: CHAR_A,
            quantity: 1,
            ...(withAltOnFirst ? { selectedAlternateCardId: CHAR_ALT } : {})
        };
        return [first, { type: 'character', cardId: CHAR_B_ID, quantity: 1 }];
    }

    function setupAvailMap(win: Window & any) {
        const entries: [string, { name: string; type?: string }][] = [
            [CHAR_A, { name: 'Alpha', type: 'character' }],
            [CHAR_B_ID, { name: 'Bravo', type: 'character' }],
            [CHAR_ALT, { name: 'Alpha Alt Art', type: 'character' }]
        ];
        win.availableCardsMap = new Map(entries);
    }

    it('shows dev-mobile-deck-row-reserve-label only on the reserve character row', () => {
        const dom = buildDom();
        const win = dom.window as any;
        win.deckEditorCards = twoCharacterDeck();
        win.currentDeckData = { metadata: { reserve_character: CHAR_A, isOwner: true } };
        win.isLayoutMobile = () => true;
        setupAvailMap(win);
        win.currentUser = null;

        loadMobileScript(win);
        win.renderDeckEditorMobileView();

        const rows = win.document.querySelectorAll('.dev-mobile-deck-row');
        expect(rows.length).toBe(2);

        expect(rows[0].querySelector('.dev-mobile-deck-row-reserve-label')?.textContent).toContain('Reserve');
        expect(rows[1].querySelector('.dev-mobile-deck-row-reserve-label')).toBeNull();

        const primary0 = rows[0].querySelector('.dev-mobile-deck-row-name-primary');
        expect(primary0).not.toBeNull();

        dom.window.close();
    });

    it('moves the under-name Reserve label when metadata.reserve_character changes target', () => {
        const dom = buildDom();
        const win = dom.window as any;
        win.deckEditorCards = twoCharacterDeck();
        win.currentDeckData = { metadata: { reserve_character: CHAR_B_ID, isOwner: true } };
        win.isLayoutMobile = () => true;
        setupAvailMap(win);
        win.currentUser = null;

        loadMobileScript(win);
        win.renderDeckEditorMobileView();

        const rows = win.document.querySelectorAll('.dev-mobile-deck-row');
        expect(rows[0].querySelector('.dev-mobile-deck-row-reserve-label')).toBeNull();
        expect(rows[1].querySelector('.dev-mobile-deck-row-reserve-label')?.textContent).toContain('Reserve');

        dom.window.close();
    });

    it('shows under-name Reserve when reserve_character matches selectedAlternateCardId', () => {
        const dom = buildDom();
        const win = dom.window as any;
        win.deckEditorCards = twoCharacterDeck(true);
        win.currentDeckData = { metadata: { reserve_character: CHAR_ALT, isOwner: true } };
        win.isLayoutMobile = () => true;
        setupAvailMap(win);
        win.currentUser = null;

        loadMobileScript(win);
        win.renderDeckEditorMobileView();

        const row0 = win.document.querySelector('.dev-mobile-deck-row') as HTMLElement;
        expect(row0.querySelector('.dev-mobile-deck-row-reserve-label')?.textContent).toContain('Reserve');

        dom.window.close();
    });

    it('⋯ sheet: Select Reserve + handler on non-reserve row; Reserve + deselect on reserve row (tap-to-switch)', () => {
        const dom = buildDom();
        const win = dom.window as any;
        win.deckEditorCards = twoCharacterDeck();
        win.currentDeckData = { metadata: { reserve_character: CHAR_A, isOwner: true } };
        win.isLayoutMobile = () => true;
        setupAvailMap(win);
        win.currentUser = null;

        loadMobileScript(win);
        win.renderDeckEditorMobileView();

        win.openDevMobileDeckRowSheet(1, 0, null as any);
        let body = win.document.getElementById('devMobileDeckActionsBody')!;
        expect(body.innerHTML).toContain('Select Reserve');
        expect(body.innerHTML).toContain(`selectReserveCharacter('${CHAR_B_ID}',1)`);

        win.openDevMobileDeckRowSheet(0, 0, null as any);
        body = win.document.getElementById('devMobileDeckActionsBody')!;
        expect(body.innerHTML).toContain(`deselectReserveCharacter(0)`);
        expect(body.innerHTML).toMatch(/<span[^>]*>Reserve<\/span>/);

        dom.window.close();
    });

    it('⋯ sheet read-only-mode (body): reserve row shows disabled menu button', () => {
        const dom = buildDom();
        const win = dom.window as any;
        win.document.body.classList.add('read-only-mode');
        win.deckEditorCards = twoCharacterDeck();
        win.currentDeckData = { metadata: { reserve_character: CHAR_A, isOwner: true } };
        win.isLayoutMobile = () => true;
        setupAvailMap(win);
        win.currentUser = null;

        loadMobileScript(win);
        win.renderDeckEditorMobileView();

        win.openDevMobileDeckRowSheet(0, 0, null as any);
        const body = win.document.getElementById('devMobileDeckActionsBody')!;
        expect(body.innerHTML).toContain('deck-editor-menu-panel-btn--disabled');
        expect(body.innerHTML).toContain('disabled');

        dom.window.close();
    });
});

describe('deck-editor-mobile.css — reserve list label tokens', () => {
    it('documents Reserve subtitle classes and typography tokens', () => {
        const css = readFileSync(join(__dirname, '../../public/css/deck-editor-mobile.css'), 'utf8');
        expect(css).toContain('.dev-mobile-deck-row-reserve-label');
        expect(css).toContain('.dev-mobile-deck-row-name-primary');
        expect(css).toContain('.dev-mobile-deck-row-name-primary');
        expect(css).toContain('flex-direction: column');
        expect(css).toContain('var(--font-2xs)');
        expect(css).toContain('#64748b');
    });
});
