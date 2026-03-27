/**
 * Canonical in-memory store for DBV tab payloads. Legacy `window.missionsData` (etc.) stay as
 * the public API but mirror into `window.dbvTabData` on every assignment.
 * Load before card-display.js (and before any script that assigns these globals at parse time).
 */
(function () {
    if (typeof window === 'undefined') {
        return;
    }

    var store = {
        missions: null,
        events: null,
        teamwork: null,
        allyUniverse: null,
        training: null,
        basicUniverse: null,
    };
    window.dbvTabData = store;

    function mirror(legacyProp, key) {
        var backing = window[legacyProp];
        delete window[legacyProp];
        var current = backing;
        Object.defineProperty(window, legacyProp, {
            get: function () {
                return current;
            },
            set: function (val) {
                current = val;
                store[key] = val;
            },
            configurable: true,
            enumerable: true,
        });
    }

    mirror('missionsData', 'missions');
    mirror('eventsData', 'events');
    mirror('teamworkData', 'teamwork');
    mirror('allyUniverseData', 'allyUniverse');
    mirror('trainingData', 'training');
    mirror('basicUniverseData', 'basicUniverse');
})();
