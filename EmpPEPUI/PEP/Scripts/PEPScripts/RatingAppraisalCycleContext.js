/**
 * Rating + Rating Admin only: optional appraisal cycle override in sessionStorage (key: RatingAppraisalCycleId).
 * Query params (first non-empty wins): ratingCycle, RatingAppraisalCycleId, appraisalCycleId — valid positive integers only; invalid URL values never replace a valid existing override.
 * Fallback order: validated override → validated sessionStorage.AppraisalCycleId → raw AppraisalCycleId string (legacy) if non-empty, else null/undefined.
 * Invalid treated as absent: null, undefined, '', '0', non-numeric, NaN, negative or zero integers.
 * Clear override: sessionStorage.removeItem(RATING_APPRAISAL_CYCLE_OVERRIDE_KEY) — no URL-based clear.
 * On Rating/RatingAdmin pages only: if no valid override is set yet, the key is seeded from sessionStorage.AppraisalCycleId so it always exists in DevTools and mirrors the login cycle until you override (URL or setItem).
 * Server: GET api/Rating/GetRatingAppraisalCycleId?loginEmployeeId=… (auth) returns Result.RatingAppraisalCycleId — applied after seed unless this page load already set a valid cycle from the query string.
 */
(function (window) {
    'use strict';

    var RATING_APPRAISAL_CYCLE_OVERRIDE_KEY = 'RatingAppraisalCycleId';
    var GLOBAL_APPRAISAL_CYCLE_KEY = 'AppraisalCycleId';
    /** True when a valid cycle id was taken from the URL on this full page load (server sync will not overwrite). */
    var ratingAppraisalCycleSetFromQueryThisPageLoad = false;
    /** Extra keys accepted on read (case variants); values are migrated to RatingAppraisalCycleId when valid. */
    var OVERRIDE_READ_ALIASES = ['ratingAppraisalCycleId', 'RATING_APPRAISAL_CYCLE_ID'];

    function parseValidAppraisalCycleId(raw) {
        if (raw === null || raw === undefined) return null;
        var s = String(raw).trim();
        if (s === '' || s === '0') return null;
        if (!/^\d+$/.test(s)) return null;
        var n = parseInt(s, 10);
        if (isNaN(n) || n < 1) return null;
        return String(n);
    }

    function readOrderedQueryParams(search, orderedNames) {
        if (!search || search.length < 2) return null;
        var map = {};
        var pairs = search.substring(1).split('&');
        for (var i = 0; i < pairs.length; i++) {
            var eq = pairs[i].indexOf('=');
            var k = eq >= 0 ? pairs[i].substring(0, eq) : pairs[i];
            var v = eq >= 0 ? pairs[i].substring(eq + 1) : '';
            try {
                k = decodeURIComponent(k.replace(/\+/g, ' '));
                v = decodeURIComponent(v.replace(/\+/g, ' '));
            } catch (e1) {
                continue;
            }
            if (!(k in map)) map[k] = v;
        }
        for (var j = 0; j < orderedNames.length; j++) {
            var val = map[orderedNames[j]];
            if (val != null && String(val).trim() !== '') return val;
        }
        return null;
    }

    function initRatingAppraisalCycleFromQuery() {
        try {
            var paramNames = ['ratingCycle', 'RatingAppraisalCycleId', 'appraisalCycleId'];
            var candidate = readOrderedQueryParams(window.location.search, paramNames);
            if (candidate === null) return;

            var validated = parseValidAppraisalCycleId(candidate);
            if (validated === null) return;

            sessionStorage.setItem(RATING_APPRAISAL_CYCLE_OVERRIDE_KEY, validated);
            ratingAppraisalCycleSetFromQueryThisPageLoad = true;
        } catch (e) {
            /* non-fatal */
        }
    }

    function joinApiBaseAndPath(base, path) {
        if (typeof pepJoinUrl === 'function') return pepJoinUrl(base, path);
        if (!path) path = '';
        if (!base) return '/' + String(path).replace(/^\/+/, '');
        return String(base).replace(/\/+$/, '') + '/' + String(path).replace(/^\/+/, '');
    }

    /**
     * Synchronous API call (matches CommonAjaxGET pattern). Skipped if query string already set a valid override this load.
     */
    function syncRatingAppraisalCycleIdFromServer() {
        if (ratingAppraisalCycleSetFromQueryThisPageLoad) return;
        if (typeof window.jQuery === 'undefined' || typeof CONFIG === 'undefined' || typeof CONFIG.get !== 'function') return;

        var empId = String(sessionStorage.getItem('EmployeeId') || '').trim();
        var token = sessionStorage.getItem('TokenValue');
        if (!empId || !token) return;

        var url = joinApiBaseAndPath(CONFIG.get('SERVERNAME'), 'Rating/GetRatingAppraisalCycleId?loginEmployeeId=' + encodeURIComponent(empId));
        try {
            window.jQuery.ajax({
                url: url,
                async: false,
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'X-EmpNo': empId
                },
                success: function (res) {
                    if (!res || res.Success !== true || !res.Result) return;
                    var raw = res.Result.RatingAppraisalCycleId != null ? String(res.Result.RatingAppraisalCycleId) : '';
                    var v = parseValidAppraisalCycleId(raw);
                    if (v !== null) {
                        sessionStorage.setItem(RATING_APPRAISAL_CYCLE_OVERRIDE_KEY, v);
                    }
                }
            });
        } catch (e5) {
            /* non-fatal */
        }
    }

    function readOverrideRawFromSession() {
        var canonical = RATING_APPRAISAL_CYCLE_OVERRIDE_KEY;
        var primary = sessionStorage.getItem(canonical);
        if (primary != null && String(primary).trim() !== '') return primary;

        for (var a = 0; a < OVERRIDE_READ_ALIASES.length; a++) {
            var k = OVERRIDE_READ_ALIASES[a];
            var v = sessionStorage.getItem(k);
            if (v != null && String(v).trim() !== '') return v;
        }

        try {
            var viaProp = sessionStorage[canonical];
            if (viaProp != null && String(viaProp).trim() !== '') return String(viaProp);
        } catch (e2) {
            /* ignore */
        }
        return null;
    }

    /** If nothing valid is in the override slot yet, copy login cycle so RatingAppraisalCycleId always exists on these pages. */
    function seedRatingAppraisalCycleIdFromGlobalIfUnset() {
        try {
            if (parseValidAppraisalCycleId(readOverrideRawFromSession()) !== null) return;

            var globalRaw = sessionStorage.getItem(GLOBAL_APPRAISAL_CYCLE_KEY);
            var validatedGlobal = parseValidAppraisalCycleId(globalRaw);
            if (validatedGlobal !== null) {
                sessionStorage.setItem(RATING_APPRAISAL_CYCLE_OVERRIDE_KEY, validatedGlobal);
                return;
            }
            if (globalRaw != null && String(globalRaw).trim() !== '') {
                sessionStorage.setItem(RATING_APPRAISAL_CYCLE_OVERRIDE_KEY, String(globalRaw).trim());
            }
        } catch (e4) {
            /* ignore */
        }
    }

    function getRatingPagesAppraisalCycleId() {
        seedRatingAppraisalCycleIdFromGlobalIfUnset();
        var overrideRaw = readOverrideRawFromSession();
        var validatedOverride = parseValidAppraisalCycleId(overrideRaw);
        if (validatedOverride !== null) {
            try {
                if (sessionStorage.getItem(RATING_APPRAISAL_CYCLE_OVERRIDE_KEY) !== validatedOverride) {
                    sessionStorage.setItem(RATING_APPRAISAL_CYCLE_OVERRIDE_KEY, validatedOverride);
                }
            } catch (e3) {
                /* ignore quota / access errors */
            }
            return validatedOverride;
        }

        var globalRaw = sessionStorage.getItem(GLOBAL_APPRAISAL_CYCLE_KEY);
        var validatedGlobal = parseValidAppraisalCycleId(globalRaw);
        if (validatedGlobal !== null) return validatedGlobal;

        if (globalRaw != null && String(globalRaw).trim() !== '') return String(globalRaw).trim();
        return globalRaw;
    }

    window.RATING_APPRAISAL_CYCLE_OVERRIDE_KEY = RATING_APPRAISAL_CYCLE_OVERRIDE_KEY;
    window.getRatingPagesAppraisalCycleId = getRatingPagesAppraisalCycleId;
    window.initRatingAppraisalCycleFromQuery = initRatingAppraisalCycleFromQuery;
    window.syncRatingAppraisalCycleIdFromServer = syncRatingAppraisalCycleIdFromServer;

    initRatingAppraisalCycleFromQuery();
    seedRatingAppraisalCycleIdFromGlobalIfUnset();
    syncRatingAppraisalCycleIdFromServer();
})(window);
