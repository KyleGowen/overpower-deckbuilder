/**
 * Shared DBV filter rules for Special cards and Aspects icon columns (`icons` array on API rows).
 *
 * Behavioral parity (pre-extraction):
 * - noIconOnly: row matches only when icons is missing or length 0.
 * - !noIconOnly && selectedPowerTypes.length === 0: no constraint (always true).
 * - Multi-Power in selection: true when icons.length >= 2.
 * - Other selected types: true when some icon equals one of those types.
 * - When multiple conditions apply: (matchesMultiPower || matchesSpecificType).
 *
 * @param {unknown} icons - Card/aspect `icons` field (array or null/undefined).
 * @param {boolean} noIconOnly
 * @param {string[]} selectedPowerTypes - From active `.power-type-filter-toggle` (excludes when no-icon is on).
 * @returns {boolean}
 */
function matchesIconsPowerTypeFilters(icons, noIconOnly, selectedPowerTypes) {
    if (noIconOnly) {
        return !icons || icons.length === 0;
    }
    if (!selectedPowerTypes || selectedPowerTypes.length === 0) {
        return true;
    }
    const multiPowerSelected = selectedPowerTypes.includes('Multi-Power');
    const specificTypes = selectedPowerTypes.filter((t) => t !== 'Multi-Power');
    const matchesMultiPower = multiPowerSelected && Array.isArray(icons) && icons.length >= 2;
    const matchesSpecificType =
        specificTypes.length > 0 &&
        Array.isArray(icons) &&
        icons.some((icon) => specificTypes.includes(icon));
    return matchesMultiPower || matchesSpecificType;
}

window.matchesIconsPowerTypeFilters = matchesIconsPowerTypeFilters;

/**
 * @param {NodeListOf<HTMLButtonElement>|HTMLButtonElement[]} toggles
 * @param {boolean} isDisabled
 */
function setDbvPowerTypeToggleButtonsDisabled(toggles, isDisabled) {
    toggles.forEach((btn) => {
        btn.disabled = isDisabled;
        btn.classList.toggle('is-disabled', isDisabled);
    });
}

window.setDbvPowerTypeToggleButtonsDisabled = setDbvPowerTypeToggleButtonsDisabled;
