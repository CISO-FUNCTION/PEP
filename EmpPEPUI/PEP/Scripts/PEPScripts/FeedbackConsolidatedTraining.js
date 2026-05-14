/** Shared: consolidated training table from goal-like / feedback API rows (loaded before Feedback.js and AddManagersFeedback.js). */

/** One row per questionnaire/KRA for consolidated training fallback (RM feedback API repeats rows per feedback round). */
function dedupeGoalLikeRowsForConsolidatedTraining(rows) {
    if (!rows || !rows.length) return [];
    var seen = {};
    var out = [];
    for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        var key = r.QuestionaireId != null && r.QuestionaireId !== '' ? String(r.QuestionaireId) : null;
        if (!key && r.KRAId != null && r.KRAId !== '') key = 'kra:' + String(r.KRAId);
        if (!key) key = 'fb:' + String(r.FeedBackId != null ? r.FeedBackId : i);
        if (seen[key]) continue;
        seen[key] = true;
        out.push(r);
    }
    return out;
}

/** Build consolidated training rows from goal-like objects (EmployeeKRA or Feedback API rows with training fields). */
function buildConsolidatedTrainingRowsFromGoalLikeArray(kraDataArray) {
    if (!kraDataArray || kraDataArray.length === 0) return [];

    var TRAINING_SEP = '|||';
    var trainingRows = [];
    var seen = {};

    function splitSafe(data) {
        if (!data || typeof data !== 'string') return [];
        var d = data.trim();
        if (d === '') return [];
        if (d.indexOf(TRAINING_SEP) !== -1) {
            return d.split(TRAINING_SEP).map(function (s) { return s.trim(); });
        }
        if (d.indexOf(',') !== -1) {
            return d.split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s !== ''; });
        }
        return [d];
    }

    function splitNames(data, expectedCount) {
        if (!data || typeof data !== 'string') return [];
        var d = data.trim();
        if (d === '') return [];
        if (d.indexOf(TRAINING_SEP) !== -1) {
            return d.split(TRAINING_SEP).map(function (s) { return s.trim(); });
        }
        if (expectedCount > 1 && d.indexOf(',') !== -1) {
            var parts = d.split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s !== ''; });
            if (parts.length === expectedCount) return parts;
        }
        return [d];
    }

    $.each(kraDataArray, function (_, kra) {
        if (!kra) return;
        var gt = kra.GoalType != null ? kra.GoalType : kra.goalType;
        var goalType = String(gt != null ? gt : '').trim().toUpperCase();
        var isDevelopmental = goalType === 'D' || goalType.indexOf('DEVELOPMENTAL') === 0;
        var trn = kra.TrainingRequirementName != null ? kra.TrainingRequirementName : kra.trainingRequirementName;
        var hasFlatTraining = trn != null && String(trn).trim() !== '';
        var nested = kra.TrainingRequirements != null ? kra.TrainingRequirements : kra.trainingRequirements;
        var hasNestedTraining = nested && Array.isArray(nested) && nested.length > 0;
        if (!isDevelopmental && !hasFlatTraining && !hasNestedTraining) return;

        var ids = [], names = [], categories = [];

        if (hasNestedTraining) {
            $.each(nested, function (_, tr) {
                if (!tr) return;
                ids.push(tr.TrainingItemId || tr.trainingItemId || tr.Id || tr.id || '0');
                names.push(tr.TrainingRequirementName || tr.trainingRequirementName || tr.Name || tr.name || '');
                categories.push(tr.TrainingCategory || tr.trainingCategory || tr.Category || tr.category || '');
            });
        } else if (hasFlatTraining) {
            var tid = kra.TrainingItemId != null ? kra.TrainingItemId : kra.trainingItemId;
            var tcat = kra.TrainingCategory != null ? kra.TrainingCategory : kra.trainingCategory;
            ids = splitSafe(tid ? String(tid) : '0');
            categories = tcat ? splitSafe(tcat) : [];
            var expectedCount = Math.max(ids.length, categories.length);
            names = splitNames(String(trn), expectedCount);
        }

        var maxLen = Math.max(ids.length, names.length, categories.length);
        while (ids.length < maxLen) ids.push('0');
        while (names.length < maxLen) names.push('');
        while (categories.length < maxLen) categories.push('');

        for (var i = 0; i < maxLen; i++) {
            var name = (names[i] || '').trim();
            if (!name) continue;
            var id = (ids[i] || '0').toString().trim();
            var category = (categories[i] || '').trim();
            var idNum = parseInt(id, 10);
            var nameKey = name.toLowerCase();
            var catKey = category.toLowerCase();
            var dedupeKey = (idNum > 0)
                ? ('id:' + idNum + '|' + nameKey)
                : ('custom:' + nameKey + '|' + catKey);
            if (seen[dedupeKey]) continue;
            seen[dedupeKey] = true;

            var typeDisplay = '-';
            if (category) {
                var catLower = category.toLowerCase();
                if (catLower === 'lp') typeDisplay = 'Learning path';
                else if (catLower === 'course') typeDisplay = 'Course';
                else typeDisplay = category;
            }

            trainingRows.push({ name: name, type: typeDisplay });
        }
    });

    return trainingRows;
}

/**
 * @param {string} [insertAfterSelector] If set and matches an element, new block is inserted after it; otherwise after DataTables wrapper or table.
 */
function appendConsolidatedTrainingSection(tableSelector, containerId, trainingRows, sectionTitle, insertAfterSelector) {
    if (!trainingRows || trainingRows.length === 0) return;

    function escHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                   .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    $('#' + containerId).remove();

    var titleText = sectionTitle || 'Consolidated Training Requirements';
    var html = '<div id="' + containerId + '" class="consolidated-training-section" style="margin-top: 12px; margin-bottom: 10px;">';
    html += '<h5 style="margin-bottom: 8px; font-weight: 600; color: #333;"><i class="glyphicon glyphicon-education" style="margin-right: 5px;"></i>' + escHtml(titleText) + '</h5>';
    html += '<table class="table table-bordered table-striped table-hover" style="width: 100%; margin-bottom: 0;">';
    html += '<thead><tr>';
    html += '<th style="width: 10%; text-align: center;">Sr No.</th>';
    html += '<th style="width: 55%; text-align: center;">Training Name</th>';
    html += '<th style="width: 35%; text-align: center;">Training Type</th>';
    html += '</tr></thead><tbody>';

    $.each(trainingRows, function (idx, row) {
        html += '<tr>';
        html += '<td style="text-align: center;">' + (idx + 1) + '</td>';
        html += '<td style="text-align: center; padding: 8px; vertical-align: middle;">' + escHtml(row.name) + '</td>';
        html += '<td style="text-align: center;">' + escHtml(row.type) + '</td>';
        html += '</tr>';
    });

    html += '</tbody></table></div>';

    var $anchor = null;
    if (insertAfterSelector && String(insertAfterSelector).trim() && $(insertAfterSelector).length) {
        $anchor = $(insertAfterSelector).last();
    }
    if (!$anchor || !$anchor.length) {
        var $table = $(tableSelector);
        if (!$table.length) return;
        var $wrapper = $table.closest('.dataTables_wrapper');
        $anchor = $wrapper.length > 0 ? $wrapper : $table;
    }
    $anchor.after(html);
}

/** Previous RM / manager view: trainings from EmployeeFeedback row payload only (not EmployeeKRA). */
function renderFeedbackGivenConsolidatedTraining(toEmployeeId, fallbackFeedbackRows) {
    if (!toEmployeeId || toEmployeeId === 0 || toEmployeeId === '0') return;
    var $tbl = $('#tblFeedbackGivenKRA');
    if (!$tbl.length) return;
    var containerId = 'tblFeedbackGivenKRA_consolidatedTraining';
    $('#' + containerId).remove();
    var dedupedFb = dedupeGoalLikeRowsForConsolidatedTraining(fallbackFeedbackRows || []);
    var rowsFb = buildConsolidatedTrainingRowsFromGoalLikeArray(dedupedFb);
    if (rowsFb.length === 0) return;
    appendConsolidatedTrainingSection('#tblFeedbackGivenKRA', containerId, rowsFb, 'Training recommendations (from manager feedback)');
}

/**
 * Consolidated list from EmployeeKRA goal-setting fields (e.g. developmental trainings captured during goal setting).
 */
function appendKraGoalSettingConsolidatedTraining(kraLikeRows, tableSelector, insertAfterSelector) {
    if (!$(tableSelector).length) return;
    var tid = String(tableSelector).replace(/^#/, '') || 'tbl';
    var containerId = tid + '_kraGoalSettingConsolidatedTraining';
    $('#' + containerId).remove();
    $('#' + tid + '_managerFeedbackConsolidatedTraining').remove();
    $('#' + tid + '_consolidatedTraining').remove();
    if (!kraLikeRows || !kraLikeRows.length) return;
    var trainingRows = buildConsolidatedTrainingRowsFromGoalLikeArray(kraLikeRows);
    if (trainingRows.length === 0) return;
    appendConsolidatedTrainingSection(tableSelector, containerId, trainingRows, 'Training requirements (from goal setting)', insertAfterSelector);
}
