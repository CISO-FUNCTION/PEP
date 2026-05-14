// --- Feedback /Index: non-blocking AJAX + full-page loading overlay (reference counted) ---
var _feedbackPageAjaxCount = 0;
function feedbackPageAjaxBegin() {
    _feedbackPageAjaxCount++;
    if (_feedbackPageAjaxCount !== 1) return;
    var $el = $('#feedbackPageLoadingOverlay');
    if (!$el.length) return;
    $el.stop(true, true).css({ display: 'flex', opacity: 0 }).animate({ opacity: 1 }, 160);
    $el.attr('aria-busy', 'true');
}
function feedbackPageAjaxEnd() {
    _feedbackPageAjaxCount = Math.max(0, _feedbackPageAjaxCount - 1);
    if (_feedbackPageAjaxCount !== 0) return;
    var $el = $('#feedbackPageLoadingOverlay');
    if (!$el.length) return;
    $el.stop(true, true).animate({ opacity: 0 }, 140, function () {
        $el.css({ display: 'none' });
    });
    $el.attr('aria-busy', 'false');
}

/** Avoid stacking many sync CheckSessionTimeOut calls when firing parallel FeedbackAsyncGET (blocks UI before overlay). */
var _feedbackLastSessionCheckMs = null;
var _FEEDBACK_SESSION_CHECK_THROTTLE_MS = 45000;
function feedbackThrottledSessionCheck() {
    var now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    if (_feedbackLastSessionCheckMs != null && (now - _feedbackLastSessionCheckMs) < _FEEDBACK_SESSION_CHECK_THROTTLE_MS) {
        return;
    }
    _feedbackLastSessionCheckMs = now;
    CheckSessionTimeOut();
}

function getFeedbackSelectedYear() {
    function readYear($ddl) {
        if (!$ddl || !$ddl.length) return null;
        var v = $ddl.val();
        if (v === undefined || v === null || String(v) === '') {
            var first = $ddl.find('option:first').val();
            return (first === undefined || first === null || String(first) === '') ? null : first;
        }
        return v;
    }
    var y = readYear($('#ddlyear'));
    if (y !== null) return y;
    y = readYear($('#ddlyearFeedback'));
    return y === null ? 0 : y;
}

function getFeedbackAppraisalCycleId() {
    var id = sessionStorage.AppraisalCycleId;
    if (id === undefined || id === null) return 0;
    var s = String(id);
    if (s === '' || s === 'undefined' || s === 'null') return 0;
    return s;
}

/** Normalize API payload to a row array for DataTables (prevents undefined data -> _DT_CellIndex errors). */
function feedbackGetRowsForDataTable(response) {
    if (!response || response.Success !== true) return [];
    var r = response.Result;
    if (r == null) return [];
    if ($.isArray(r)) return r;
    if ($.isArray(r.data)) return r.data;
    if ($.isArray(r.Data)) return r.Data;
    return [];
}

/** KPI text from Feedback API row (DataSet JSON keeps PascalCase; guard empty snapshot Measure). */
function feedbackRowKpiMeasure(row) {
    if (!row) return '';
    var v = row.Measure;
    if (v != null && String(v).trim() !== '') return String(v).trim();
    v = row.measure;
    if (v != null && String(v).trim() !== '') return String(v).trim();
    return '';
}

/** Calendar year from #ddlyear PerformCycleCheck (e.g. 122026 → 2026). */
function feedbackDdlyearCalendarYear() {
    var v = String(getFeedbackSelectedYear() || '');
    if (v.length < 4) return NaN;
    return parseInt(v.slice(-4), 10);
}

/** Feedback Given KRA grid: show Action Plan column only when cycle year > 2025. */
function feedbackShowActionPlanColumnForSelectedYear() {
    var y = feedbackDdlyearCalendarYear();
    return !isNaN(y) && y > 2025;
}

/** Normalize EmployeeKRA/GetEmployeeKRA response: Result may be { data: [] }, DataSet table keys (e.g. Table), or KRAData. */
function employeeKraApiResultToRows(kraResponse) {
    var rows = feedbackGetRowsForDataTable(kraResponse);
    if (rows.length > 0) return rows;
    var ok = kraResponse && (kraResponse.Success === true || kraResponse.success === true);
    if (!ok || kraResponse.Result == null) return [];
    var r = kraResponse.Result;
    if ($.isArray(r.KRAData)) return r.KRAData;
    if ($.isArray(r.kraData)) return r.kraData;
    if ($.isArray(r.Table)) return r.Table;
    if ($.isArray(r.table)) return r.table;
    if ($.isPlainObject(r)) {
        for (var k in r) {
            if (!Object.prototype.hasOwnProperty.call(r, k)) continue;
            if (k === 'Schema' || k === 'schema') continue;
            var v = r[k];
            if ($.isArray(v) && v.length > 0) return v;
        }
    }
    return [];
}

/** Async GET for Feedback page. Use instead of CommonAjaxGET here (CommonAjaxGET is sync and freezes the UI). */
function FeedbackAsyncGET(url, options) {
    options = options || {};
    feedbackThrottledSessionCheck();
    return $.ajax({
        url: url,
        type: 'GET',
        async: true,
        dataType: 'json',
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue,
            'X-EmpNo': sessionStorage.EmployeeId
        },
        beforeSend: function (xhr, settings) {
            if (!options.suppressOverlay) {
                feedbackPageAjaxBegin();
            }
            if (typeof options.beforeSend === 'function') {
                options.beforeSend(xhr, settings);
            }
        },
        complete: function (xhr, status) {
            if (!options.suppressOverlay) {
                feedbackPageAjaxEnd();
            }
            if (typeof options.complete === 'function') {
                options.complete(xhr, status);
            }
        }
    });
}

// Expose for other scripts on the same page (e.g. partials) if needed
window.FeedbackAsyncGET = FeedbackAsyncGET;
window.feedbackPageAjaxBegin = feedbackPageAjaxBegin;
window.feedbackPageAjaxEnd = feedbackPageAjaxEnd;

function feedbackTableLoadingRowHtml(colCount) {
    return '<tr><td colspan="' + colCount + '" style="text-align: center; padding: 40px;"><span class="feedback-loading-spinner" style="width:32px;height:32px;margin:0 auto 8px;display:block;border-width:2px;"></span><span style="display:block;font-size:14px;color:#555;">Loading...</span></td></tr>';
}

var ddlAppCycle = '';
$(document).ready(function () {



    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-center",
        "preventDuplicates": true,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }

    $(document).on('keypress', function (e) {

        $('textarea').each(function () {

            var txtValue = $(this).val();

            $(this).val(txtValue.replace(/[\<\>=]+/g, ''));

            var ascii = e.which || e.keyCode;

            if (ascii === 60 || ascii === 61 || ascii === 62) {

                $(e.target).addClass('csstxtarea');
                toastr.error("Special characters < , > and = are not allowed and !,@,#,$,%,^,&,*,(,),?,/,\,},{,[,],~,:,; are allowed. \n For security reasons, please refrain from using special characters in your input. Special characters may pose a risk to the system's security. Kindly remove any special characters and try again. Thank you for your understanding.")
                return false;
            }
            else {
                $(e.target).removeClass('csstxtarea');
                $(this).removeClass('csstxtarea');

            }
        });

    });


    var selectedyear = 0;
    var DashValue = DashValue1;


    if (DashValue != 8) {
        var ddlAppCycle = ddlAppCycleId;

    }
    if (DashValue == 1) {
        var ToEmployeeId = GToEmployeeId;
        selectedyear = parseInt(GToYearCycle);
        FillAppraisalHalfyearCycle(selectedyear, function () {
        fnBindFeebackGivenKRAList(ToEmployeeId);
        });
        $('#pnlKRAFeedbackGivenDashoard').show();
    }
    else {
        var EmployeeId = 0;
        if (DashValue != 6) {
            FillAppraisalHalfyearCycle(selectedyear, function () {
            fnBindFeebackGivenKRAList(EmployeeId);
            });
        }
    }
    var GselectyearSkipLevel = 0;
    if (DashValue == 6) {

        GselectyearSkipLevel = parseInt(Gselectedyear);
    }



    // FillAppraisalHalfyearCycle();
    // FillAppraisalHalfCycle(ddlAppCycle);

    if (DashValue != 1) {

        if (DashValue == 8) {

            fnBindDelegators();
        } else {

            FillAppraisalHalfCycleSkiplevel(GselectyearSkipLevel, ddlAppCycle, function () {
            var selectedyearCheck = $('#ddlyearSkiplevel :selected').val();
            if (selectedyearCheck != undefined) {
                    showSkipLevelFeedbackLoader();
                fnBindFeebackGivenSKIPLEVELKRAList();
                fnBindFeebackGivenbySkipLevelManager();
                } else {
                    FillAppraisalHalfyearCycle(selectedyear, function () {
                fnBindMyFeebackKRAList();
                fnBindMySelfAssessment();
                fnBindMyFeebackOtherList();
                fnBindFeebackRequestPendingList();
                    });
            }
            });
        }

    }


    //Modified by Garima for feedback by delegator 25-10-2018

    //end
    
    // Initialize read more/less handlers on page load
    setTimeout(function() {
        initializeReadMoreLessHandlers();
    }, 500); 

    $('#feedbackTabs a').click(function (e) {
        e.preventDefault()
        $("#hdnSelectedFeedbackTab").val($(this).attr('href'));


    })
    if (sessionStorage.EmployeeType == 'C') {

        $("[href='#tab_myfeedback']").hide();
        $("[href='#tab_myfeedback']").parent("li").removeClass("active");
        $("#tab_myfeedback").hide();
        $("[href='#tab_feedbackrequested']").hide();
        $("#feedbackTabs li").removeClass("active");
        $("[href='#tab_feedbackgiven']").parent("li").addClass('active');

        $("#tab_feedbackgiven").addClass("active")
        //  ("[href='#tab_feedbackgiven']").click();
        //  $("#tab_feedbackgiven").show();
    }
});


function FillAppraisalHalfCycleSkiplevel(GselectyearSkipLevel, ddlAppCycle, onDone) {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'AppraisalCycle/GetSelfAssesmentCycle?AppCycleId=' + ddlAppCycle;
    FeedbackAsyncGET(apiPath).done(function (AppraisalCycle) {
    $('#ddlPerformycle').empty();
        $('#ddlyearSkiplevel').empty();
        if (AppraisalCycle && AppraisalCycle.Result && AppraisalCycle.Result.data) {
            $.each(AppraisalCycle.Result.data, function (index, data) {
        $('#ddlPerformycle').append($("<option>").val(data.YearBreakCheck).text(data.AppraisalCycleName));
    });
            $.each(AppraisalCycle.Result.data, function (index, data) {
        $('#ddlyearSkiplevel').append($("<option>").val(data.YearBreakCheck).text(data.AppraisalCycleName));
            });
            if (GselectyearSkipLevel != 0) {
            $('#ddlyearSkiplevel option[value="' + GselectyearSkipLevel + '"]').attr("selected", "selected");
            }
        }
        if (typeof onDone === 'function') {
            onDone();
        }
    }).fail(function () {
        if (typeof onDone === 'function') {
            onDone();
        }
    });
}


$("#btnSubmitSkipLevel").click(function () {
    SaveFeedBackBySkipLevelManager();
    fnBindFeebackGivenbySkipLevelManager();
});
$("#btnUpdateEditableKRA").on('click', function () {
    EditableKRASave();

});
function EditableKRASave() {

    var textflag = 0;
    CheckSessionTimeOut();
    var table = $('#tblFeedbackGivenKRA').DataTable();
    var FeedbackArray = [];
    var rowsData = table.rows().data();

    for (var i = 0; i < rowsData.length; i++) {
        var row = rowsData[i];
        if (row.IsIgnore != 0) {
            continue;
        }
        var feedBackId = row.FeedBackId;
        var $ta = $('#' + feedBackId);
        if (!$ta.length || !$ta.is('textarea')) {
            continue;
        }
        var vFeedback = $ta.val();
        if (vFeedback === '' || vFeedback == null) {
            textflag = 1;
            toastr.warning('Please give feedback for given Goals & Objectives.');
            return false;
        }

        var EmployeeFeedback = {
            FromEmployeeId: sessionStorage.EmployeeId,
            ToEmployeeId: row.ToEmployeeId,
            AppraisalCycleId: sessionStorage.AppraisalCycleId,
            ActionTypeId: 1,
            Feedback: (vFeedback === undefined) ? 'null' : vFeedback,
            FeedBackId: feedBackId,
            QuestionaireId: row.QuestionaireId,
            IsIgnore: 1,
            AreaID: 2
        };
        FeedbackArray.push(EmployeeFeedback);
    }

    if (FeedbackArray.length > 0 && textflag != 1) {
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + '/Feedback/';
        var Result = CommonAjaxPOSTWithHeader(apiPath, FeedbackArray, CommonGetHeaderInfo());

        if (Result.Success) {
            toastr.success(Result.Result);
            window.location.reload();
        } else {
            toastr.error(Result.Result[0].ErrorMessage);
        }
    } else if (FeedbackArray.length === 0) {
        toastr.info('No editable Goals & Objectives feedback to update.');
        return false;
    }
}
function SaveFeedBackBySkipLevelManager() {

    var ddlPerformycle = $('#ddlyearSkiplevel :selected').val();
    var EmployeeManagerID = $('#hdnManagerId').val();
    CheckSessionTimeOut();
    var ToEmployeeId = GToEmployeeId;
    var FromEmployeeId = sessionStorage.EmployeeId;
    var numero = 1;
    var vFeedback;
    var vKRAId;
    var FeedbackArray = [];
    for (i = 1; i <= numero; i++) {
        vKRAId = null;
        vFeedback = $('#skiplevelfeedback').val();
        vRating = null;
        var EmployeeFeedback = {
            FeedBackId: 0,
            AppraisalCycleId: ddlAppCycle,
            FromEmployeeId: sessionStorage.EmployeeId,
            ToEmployeeId: ToEmployeeId,
            ActionTypeId: 1,
            AreaID: 0,
            QuestionaireId: null,
            Feedback: vFeedback,
            Rating: vRating,
            IsIgnore: true,
            PerformCycleCheck: ddlPerformycle
        }
        FeedbackArray.push(EmployeeFeedback);

    }
    if (FeedbackArray.length > 0) {
        var svrPath = CONFIG.get('SERVERNAME');
        // Web API route: [Route("api/ManagerFeedback/SubmitUpdateFeedback")] — not POST to /ManagerFeedback/
        var apiPath = svrPath + 'ManagerFeedback/SubmitUpdateFeedback';
        var Result = CommonAjaxPOST_Array(apiPath, FeedbackArray, CommonGetHeaderInfo());
        $('#skiplevelfeedback').val('');
        if (Result && Result.Success) {
            toastr.success('Feeback submitted !');
            // Email notification on feedback submit disabled — mail content was inaccurate
        }
        else {
            var errMsg = (Result && (Result.ErrorMessage || Result.statusText)) ? (Result.ErrorMessage || Result.statusText) : 'Unable to save feedback. Please try again.';
            toastr.error(errMsg);
        }
    }
    else {
        //alert("Please give feedback for atleast one KPI.");
    }

}


function FillAppraisalHalfCycle() {
    //var d = new Date();
    //var svrPath = CONFIG.get('SERVERNAME');
    //var apiPath = svrPath + "AppraisalCycle?performCycleCheck=" + formatDate(d) + "&Type=1";
    //var AppraisalCycle = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    //$('#ddlPerformycle').empty();
    //$.each(AppraisalCycle.responseJSON.Result.data, function (index, data) {
    //    $('#ddlPerformycle').append($("<option>").val(data.YearBreakCheck).text(data.AppraisalCycleName));
    //});


    //var d = new Date();
    //var svrPath = CONFIG.get('SERVERNAME');
    //var apiPath = svrPath + 'AppraisalCycle/GetSelfAssesmentCycle?AppCycleId=' + ddlAppCycle;
    //var AppraisalCycle = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    //$('#ddlPerformycle').empty();
    //$.each(AppraisalCycle.responseJSON.Result.data, function (index, data) {
    //    $('#ddlPerformycle').append($("<option>").val(data.YearBreakCheck).text(data.AppraisalCycleName));

    //    if (GselectyearNotGiven != 0)
    //        $('#ddlPerformycle option[value="' + GselectyearSkipLevel + '"]').attr("selected", "selected");

    //});

}
function FillAppraisalHalfyearCycle(selectedyear, onDone) {

    var d = new Date();
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "AppraisalCycle/GetDropDownCheck?performCycleCheck=" + formatDate(d) + "&Type=1&DropDownCheck=1";
    FeedbackAsyncGET(apiPath).done(function (AppraisalCycle) {
    $('#ddlyear').empty();
        if (AppraisalCycle && AppraisalCycle.Result && AppraisalCycle.Result.data) {
            $.each(AppraisalCycle.Result.data, function (index, data) {
        $('#ddlyear').append($("<option>").val(data.YearBreakCheck).text(data.AppraisalCycleName));
            });
            if (selectedyear != 0) {
            $('#ddlyear option[value="' + selectedyear + '"]').attr("selected", "selected");
            }
        }
        if (typeof onDone === 'function') {
            onDone();
        }
    }).fail(function () {
        if (typeof onDone === 'function') {
            onDone();
        }
    });

}

$('#ddlyearSkiplevel').change(function (e) {
    var selectedyear = $('#ddlyearSkiplevel :selected').val();
    if (selectedyear === undefined || selectedyear === null || selectedyear === '') {
        return;
    }
    showSkipLevelFeedbackLoader();
    //  fnBindFeebackGivenSKIPLEVELCompetencyList();
    fnBindFeebackGivenSKIPLEVELKRAList();
    fnBindFeebackGivenbySkipLevelManager();
})

$('#ddlyear').change(function (e) {
    var ToEmployeeId = GToEmployeeId;
    var selectedyear = getFeedbackSelectedYear();
    
    // Show full-page loader on GiveManagerFeedback page
    $('#giveFeedbackLoader').css('display', 'flex');
    
    // Show content divs but hide table headers, show loader in table body
    $('[id^="dvMyKraContent"]').each(function() {
        $(this).show();
        $(this).find('table thead').hide();
    });
    
    showFeedbackLoader();
    $('#tblMyFeedbackKRA_consolidatedTraining').remove();
    $('#tblFeedbackGivenKRA_consolidatedTraining').remove();
    
    fnBindMyFeebackKRAList();
    fnBindMySelfAssessment();
    // fnBindMyFeebackCompetencyList();
    fnBindMyFeebackOtherList();
    fnBindFeebackGivenKRAList(ToEmployeeId);
    fnBindFeebackGivenCompetencyList();
    fnBindFeebackGivenOtherList();
    fnBindFeebackRequestedList();
    fnBindFeebackRequestPendingList();
})

// Show loader for feedback tables
function showFeedbackLoader() {
    var tables = [
        '#tblMyFeedbackKRA',
        '#tblMySelfassessment',
        '#tblMyFeedbackOther',
        '#tblFeedbackGivenKRA',
        '#tblFeedbackGivenCompetency',
        '#tblFeedbackGivenOther',
        '#tblFeedbackRequested',
        '#tblFeedbackRequestPending'
    ];
    showFeedbackLoaderForTables(tables);
}

/** Destroy DataTable if present, show loading row + hide thead (smooth tab / partial refresh). */
function showFeedbackLoaderForTables(tableSelectors) {
    (tableSelectors || []).forEach(function (tableId) {
        var $table = $(tableId);
        if (!$table.length) return;
        if ($.fn.DataTable.isDataTable(tableId)) {
            try {
                $table.DataTable().clear().destroy();
            } catch (ex) { /* ignore */ }
        }
        var colCount = $table.find('thead tr th').length || 8;
        $table.find('thead').hide();
        $table.find('tbody').html(feedbackTableLoadingRowHtml(colCount));
    });
}

/** Skip-level manager page: table loaders + full-page overlay (via FeedbackAsyncGET) */
function showSkipLevelFeedbackLoader() {
    showFeedbackLoaderForTables([
        '#tblFeedbackGivenSkipLevelKRA',
        '#tblFeedbackBySkipLevelManager',
        '#tblFeedbackGivenSkipLevelBC'
    ]);
}

/** Per-tab loaders before AJAX (used on tab switch). */
function prepareFeedbackTabLoading(target) {
    var map = {
        '#tab_myfeedback': ['#tblMyFeedbackKRA', '#tblMySelfassessment', '#tblMyFeedbackOther'],
        '#tab_myselfassessment': ['#tblMySelfassessment'],
        '#tab_feedbackgiven': ['#tblFeedbackGivenKRA', '#tblFeedbackGivenCompetency', '#tblFeedbackGivenOther'],
        '#tab_feedbackrequested': ['#tblFeedbackRequested'],
        '#tab_feedbackpending': ['#tblFeedbackRequestPending']
    };
    var list = map[target];
    if (list && list.length) {
        showFeedbackLoaderForTables(list);
    }
}

// Show "No data available" message in datatable
function showNoDataMessage(tableId, colCount) {
    var $table = $(tableId);
    if ($table.length) {
        var noDataHtml = '<tr><td colspan="' + colCount + '" style="text-align: center; padding: 40px; color: #999;">No data available</td></tr>';
        $table.find('tbody').html(noDataHtml);
    }
}

// Generate read more/less HTML for long text (based on word count)
function generateReadMoreLess(text, maxWords, uniqueId) {
    if (!text || text.trim() === '' || text === 'N/A' || text === 'Not provided' || text === 'Not specified') {
        return text || 'N/A';
    }
    
    var textStr = String(text).trim();
    // Split by whitespace and filter out empty strings
    var words = textStr.split(/\s+/).filter(function(word) { return word.length > 0; });
    var wordCount = words.length;
    
    // If text has 10 words or less, return as is
    if (wordCount <= maxWords) {
        return '<span>' + escapeHtml(textStr) + '</span>';
    }
    
    // Truncate to maxWords and add read more/less functionality
    var truncatedWords = words.slice(0, maxWords);
    var truncatedText = truncatedWords.join(' ');
    var fullText = textStr;
    var shortId = 'short_' + uniqueId;
    var fullId = 'full_' + uniqueId;
    var linkId = 'link_' + uniqueId;
    
    var html = '<span id="' + shortId + '">' + 
               escapeHtml(truncatedText) + 
               '... <a href="javascript:void(0);" id="' + linkId + '" class="read-more-link" data-full-id="' + fullId + '" data-short-id="' + shortId + '" style="color: #337ab7; text-decoration: underline; cursor: pointer;">Read More</a>' +
               '</span>' +
               '<span id="' + fullId + '" style="display:none;">' + 
               escapeHtml(fullText) + 
               ' <a href="javascript:void(0);" class="read-less-link" data-full-id="' + fullId + '" data-short-id="' + shortId + '" style="color: #337ab7; text-decoration: underline; cursor: pointer;">Read Less</a>' +
               '</span>';
    
    return html;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Generate read more/less HTML for rich text editor content (HTML formatted)
// This function preserves HTML formatting from Summernote editor and properly truncates content
function generateReadMoreLessHTML(htmlContent, maxWords, uniqueId) {
    if (!htmlContent || htmlContent.trim() === '' || htmlContent === 'N/A' || htmlContent === 'Not provided' || htmlContent === 'Not specified') {
        return '<div style="text-align: left; word-wrap: break-word; white-space: normal; padding: 8px;">' + (htmlContent || 'N/A') + '</div>';
    }
    
    var htmlStr = String(htmlContent).trim();
    
    // Extract plain text from HTML for word count (using jQuery like KRAOperations.js)
    var textOnly = $('<div>').html(htmlStr).text();
    var words = textOnly.split(/\s+/).filter(function(word) { return word.length > 0; });
    var wordCount = words.length;
    
    // If text has maxWords or less, return HTML as is (directly render HTML, no escaping)
    if (wordCount <= maxWords) {
        return '<div style="text-align: left; word-wrap: break-word; white-space: normal; padding: 8px;">' + htmlStr + '</div>';
    }
    
    // For longer content, truncate to maxWords and show with Read More/Less
    var shortId = 'short_' + uniqueId;
    var fullId = 'full_' + uniqueId;
    
    // Truncate to maxWords (plain text) but try to preserve HTML structure
    var truncatedWords = words.slice(0, maxWords);
    var truncatedText = truncatedWords.join(' ');
    
    // Create truncated HTML by showing it in a limited height div with CSS truncation
    var truncatedHtml = '<div class="truncated-content" style="max-height: 60px; overflow: hidden; position: relative;">' + 
                        htmlStr + 
                        '</div>' +
                        '<a href="javascript:void(0);" class="read-more-link" data-full-id="' + fullId + '" data-short-id="' + shortId + '" style="color: #337ab7; text-decoration: underline; cursor: pointer; display: block; margin-top: 5px;">Read More</a>';
    
    var html = '<div style="text-align: left; word-wrap: break-word; white-space: normal; padding: 8px;">' +
               '<span id="' + shortId + '">' + truncatedHtml + '</span>' +
               '<span id="' + fullId + '" style="display:none;">' + 
               htmlStr + 
               ' <a href="javascript:void(0);" class="read-less-link" data-full-id="' + fullId + '" data-short-id="' + shortId + '" style="color: #337ab7; text-decoration: underline; cursor: pointer; display: block; margin-top: 5px;">Read Less</a>' +
               '</span></div>';
    
    return html;
}

// Initialize read more/less click handlers
function initializeReadMoreLessHandlers() {
    // Remove existing handlers to prevent duplicates
    $(document).off('click', '.read-more-link, .read-less-link');
    
    // Handle Read More click
    $(document).on('click', '.read-more-link', function(e) {
        e.preventDefault();
        var $link = $(this);
        var fullId = $link.data('full-id');
        var shortId = $link.data('short-id');
        $('#' + shortId).hide();
        $('#' + fullId).show();
    });
    
    // Handle Read Less click
    $(document).on('click', '.read-less-link', function(e) {
        e.preventDefault();
        var $link = $(this);
        var fullId = $link.data('full-id');
        var shortId = $link.data('short-id');
        $('#' + fullId).hide();
        $('#' + shortId).show();
    });
}
//var target1 = $("a[data-toggle='tab']").attr("href") // activated tab


$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {

    var target = $(e.target).attr("href"); // activated tab
    prepareFeedbackTabLoading(target);

    if (target === "#tab_myfeedback") {
        fnBindMyFeebackKRAList();
        fnBindMySelfAssessment();
        // fnBindMyFeebackCompetencyList();
        fnBindMyFeebackOtherList();
    }
    else if (target === "#tab_myselfassessment") {
        fnBindMySelfAssessment();
    }
    else if (target === "#tab_feedbackgiven") {
        var ToEmployeeId = 0;
        if ((sessionStorage.EmployeeRoleId != 1)) {
            fnBindFeebackGivenKRAList(ToEmployeeId);
            //  fnBindFeebackGivenCompetencyList();

            //Commented for hide behavioural competencies start
            //$('#pnlCompetencyFeedbackGiven').show();
            //Commented for hide behavioural competencies end

            $('#pnlKRAFeedbackGiven').show();
        }
        else {
            //Commented for hide behavioural competencies start
            //$('#pnlCompetencyFeedbackGiven').hide();
            //Commented for hide behavioural competencies end

            $('#pnlKRAFeedbackGiven').hide();
        }
        fnBindFeebackGivenOtherList();
    }
    else if (target === "#tab_feedbackrequested") {
        fnBindFeebackRequestedList();
    }
    else if (target === "#tab_feedbackpending") {
        fnBindFeebackRequestPendingList();
    }

});

function fnLimitFeedbackText() {
    var text_max = parseInt($("#txtReply").attr('maxLength'));

    $('#txtReplyRemaining').html(text_max + ' characters remaining');

    $('#txtReply').keyup(function () {
        var text_length = $('#txtReply').val().length;
        var text_remaining = text_max - text_length;

        $('#txtReplyRemaining').html(text_remaining + ' characters remaining');
    });
}

//Following function is used to bind the KRA list for employee (_MyFeedbackKRA.cshtml)
function fnBindMyFeebackKRAList() {


    var selectedyear = getFeedbackSelectedYear();

    var empId = sessionStorage.EmployeeId;
    var apraisalCycleId = getFeedbackAppraisalCycleId();
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Feedback?AppraisalCycleId=" + apraisalCycleId + "&ToEmployeeId=" + empId + "&FromEmployeeId=0&ActionTypeId=1&ParentFeedBackId=0&AreaID=2&SelectedYear=" + selectedyear;

    //FeedbackAsyncGET(apiPath).done(function (kraData) {

    //    if (kraData.Success == false) {
    //        console.log("BindMyFeebackKRAList-" + kraData.ErrorCode + ' ' + kraData.ErrorMessage)
    //        var table = $('#tblMyFeedbackKRA').DataTable();

    //        table.clear();

    //    }
    //     //console.log(kraData.Result.data);
    //    if (kraData.Success) {
    //        $("#tblMyFeedbackKRA").DataTable({
    //            data: kraData.Result.data,
    //            destroy: true,
    //            "bPaginate": false,
    //            "bFilter": true,
    //            "bInfo": false,
    //            "sPaginationType": "full_numbers",
    //            "iDisplayLength": 10,
    //            "bLengthChange": false,
    //            "oLanguage": {
    //                "oPaginate": {
    //                    "sNext": '<a href="#"><span class="glyphicon glyphicon-triangle-right"></span></a>',
    //                    "sPrevious": '<a href="#"><span class="glyphicon glyphicon-triangle-left"></span></a>',
    //                    "sLast": '<a href="#"><span class="glyphicon glyphicon-step-forward"></span></a>',
    //                    "sFirst": '<a href="#"><span class="glyphicon glyphicon-step-backward"></span></a>'
    //                }
    //            },
    //            "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
    //            aoColumns: [
    //                { mData: "FromEmployeeName" },
    //                { mData: "Question" },
    //                { mData: "Feedback" },
    //                {
    //                    mData: "Selfassesment",
    //                    mRender: function (data, type, full) {
    //                        var lbl;
    //                        if (full.Selfassesment != null) {
    //                            lbl = "<span>" + full.Selfassesment + "</span>";
    //                        }
    //                        else {
    //                            lbl = "<span>N/A</span>";
    //                        }
    //                        return lbl;
    //                    }
    //                },
    //                {
    //                    mData: "FeedbackDate", "render": function (data, type, row, meta) {
    //                        var dt = new Date(data);
    //                        return formatDate_DMY(dt);
    //                    },

    //                    "sWidth": "15%"
    //                },
    //                {
    //                    "render": function (data, type, row, meta) {
    //                        var button = fnGetButtonHTML(row);
    //                        return button;
    //                    }
    //                }
    //            ],
    //            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
    //                if ((aData.IsSeen == "0") && (aData.LastFeedbackGivenBy != sessionStorage.EmployeeId)) { // display unread messages in green color
    //                    $('td', nRow).addClass('UnreadMessage');
    //                }

    //            }
    //        });
    //    }
    //    else {
    //        $("#tblMyFeedbackKRA").DataTable({
    //            data: kraData.Result,
    //            destroy: true,
    //            "bPaginate": false,
    //            "bFilter": true,
    //            "bInfo": false,
    //            "sPaginationType": "full_numbers",
    //            "iDisplayLength": 10,
    //            "bLengthChange": false,
    //            "oLanguage": {
    //                "oPaginate": {
    //                    "sNext": '<a href="#"><span class="glyphicon glyphicon-triangle-right"></span></a>',
    //                    "sPrevious": '<a href="#"><span class="glyphicon glyphicon-triangle-left"></span></a>',
    //                    "sLast": '<a href="#"><span class="glyphicon glyphicon-step-forward"></span></a>',
    //                    "sFirst": '<a href="#"><span class="glyphicon glyphicon-step-backward"></span></a>'
    //                }
    //            },
    //            "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
    //            aoColumns: [
    //                { mData: "FromEmployeeName" },
    //                { mData: "Question" },
    //                { mData: "Feedback" },
    //                {
    //                    mData: "Selfassesment",
    //                    mRender: function (data, type, full) {
    //                        var lbl;
    //                        if (full.Selfassesment != null) {
    //                            lbl = "<span>" + full.Selfassesment + "</span>";
    //                        }
    //                        else {
    //                            lbl = "<span>N/A</span>";
    //                        }
    //                        return lbl;
    //                    }
    //                },
    //                {
    //                    mData: "FeedbackDate", "render": function (data, type, row, meta) {
    //                        var dt = new Date(data);
    //                        return formatDate_DMY(dt);
    //                    },

    //                    "sWidth": "15%"
    //                },
    //                {
    //                    "render": function (data, type, row, meta) {
    //                        var button = fnGetButtonHTML(row);
    //                        return button;
    //                    }
    //                }
    //            ],
    //            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
    //                if ((aData.IsSeen == "0") && (aData.LastFeedbackGivenBy != sessionStorage.EmployeeId)) { // display unread messages in green color
    //                    $('td', nRow).addClass('UnreadMessage');
    //                }

    //            }
    //        });
    //    }
    //});
    FeedbackAsyncGET(apiPath, {
        beforeSend: function () {
            $('#tblMyFeedbackKRA_consolidatedTraining').remove();
            $('#dvMyKraContent').show();
            $('#tblMyFeedbackKRA thead').hide();
            if ($.fn.DataTable.isDataTable('#tblMyFeedbackKRA')) {
                $('#tblMyFeedbackKRA').DataTable().clear().destroy();
            }
            var colCount = $('#tblMyFeedbackKRA thead tr th').length || 6;
            $('#tblMyFeedbackKRA tbody').html(feedbackTableLoadingRowHtml(colCount));
        }
    }).done(function (kraData) {
            $('#tblMyFeedbackKRA tbody').empty();
            $('#tblMyFeedbackKRA thead').show();
            
            if (!kraData.Success) {
                if (kraData.ErrorCode !== "NotFound" && kraData.ErrorCode !== "Not Found") {
                    console.log("BindMyFeebackKRAList-" + kraData.ErrorCode + ' ' + kraData.ErrorMessage);
                }
                // Show "No data available" message
                var colCount = $('#tblMyFeedbackKRA thead tr th').length || 6;
                showNoDataMessage('#tblMyFeedbackKRA', colCount);
                $('#tblMyFeedbackKRA_consolidatedTraining').remove();
            } else {
                var dataToBind = feedbackGetRowsForDataTable(kraData);
                
                $('#dvMyKraContent').show();
                
                if (dataToBind.length === 0) {
                    // Show "No data available" message
                    var colCount = $('#tblMyFeedbackKRA thead tr th').length || 6;
                    showNoDataMessage('#tblMyFeedbackKRA', colCount);
                } else {
                    $("#tblMyFeedbackKRA").DataTable({
                        data: dataToBind,
                        destroy: true,
                "autoWidth": false,
                "bPaginate": false,
                "bFilter": true,
                "bInfo": false,
                "sPaginationType": "full_numbers",
                "iDisplayLength": 10,
                "bLengthChange": false,
                "oLanguage": {
                    "oPaginate": {
                        "sNext": '<a href="#"><span class="glyphicon glyphicon-triangle-right"></span></a>',
                        "sPrevious": '<a href="#"><span class="glyphicon glyphicon-triangle-left"></span></a>',
                        "sLast": '<a href="#"><span class="glyphicon glyphicon-step-forward"></span></a>',
                        "sFirst": '<a href="#"><span class="glyphicon glyphicon-step-backward"></span></a>'
                    }
                },
                "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
                aoColumns: [
                    { 
                        mData: "FromEmployeeName",
                        "sWidth": "10%"
                    },
                    {
                        mData: "Question",
                        "sWidth": "20%",
                        mRender: function (data, type, full) {
                            var uniqueId = 'kra_' + (full.FeedBackId || full.FeedbackId || Math.random().toString(36).substr(2, 9));
                            return generateReadMoreLessHTML(full.Question, 20, uniqueId);
                        }
                    },
                    {
                        mData: "Measure",
                        "sWidth": "16%",
                        mRender: function (data, type, full) {
                            var raw = feedbackRowKpiMeasure(full);
                            var uniqueId = 'kpi_' + (full.FeedBackId || full.FeedbackId || Math.random().toString(36).substr(2, 9));
                            if (!raw) return '<span class="text-muted">Not specified</span>';
                            return generateReadMoreLessHTML(raw, 18, uniqueId);
                        }
                    },
                    {
                        mData: "Selfassesment",
                        "sWidth": "14%",
                        mRender: function (data, type, full) {
                            var uniqueId = 'selfassess_' + (full.FeedBackId || full.FeedbackId || Math.random().toString(36).substr(2, 9));
                            var text = full.Selfassesment != null && full.Selfassesment !== '' ? full.Selfassesment : 'N/A';
                            return generateReadMoreLessHTML(text, 15, uniqueId);
                        }
                    },
                    {
                        mData: "Feedback",
                        "sWidth": "16%",
                        mRender: function (data, type, full) {
                            var uniqueId = 'feedback_' + (full.FeedBackId || full.FeedbackId || Math.random().toString(36).substr(2, 9));
                            return generateReadMoreLessHTML(full.Feedback, 15, uniqueId);
                        }
                    },
                    {
                        mData: "FeedbackDate",
                        "sWidth": "10%",
                        render: function (data) {
                            return formatDate_DMY(new Date(data));
                        }
                    }
                ],
                "fnRowCallback": function (nRow, aData) {
                    if ((aData.IsSeen == "0") && (aData.LastFeedbackGivenBy != sessionStorage.EmployeeId)) {
                        $('td', nRow).addClass('UnreadMessage');
                    }
                }
            });
                    renderMyFeedbackTrainingRequirements(dataToBind);
                }
                }
            
            setTimeout(function() {
                initializeReadMoreLessHandlers();
            }, 100);
    }).fail(function (xhr, statusText, errorThrown) {
            $('#tblMyFeedbackKRA thead').show();
            $('#tblMyFeedbackKRA_consolidatedTraining').remove();
            console.error("AJAX Error: ", xhr.status, statusText, errorThrown);
    });
}

/** Consolidated training below a table. Use consolidatedTrainingFromFeedbackRowsOnly to list trainings from EmployeeFeedback rows only (not EmployeeKRA). */
function renderConsolidatedTrainingRequirementsForEmployee(toEmployeeId, tableSelector, containerId, fallbackGoalLikeRows, options) {
    if (!toEmployeeId || toEmployeeId === 0 || toEmployeeId === '0') return;
    var $tbl = $(tableSelector);
    if (!$tbl.length) return;

    $('#' + containerId).remove();

    options = options || {};
    var title = options.consolidatedTrainingSectionTitle;

    if (options.consolidatedTrainingFromFeedbackRowsOnly === true) {
        var dedupedFb = dedupeGoalLikeRowsForConsolidatedTraining(fallbackGoalLikeRows || []);
        var rowsFb = buildConsolidatedTrainingRowsFromGoalLikeArray(dedupedFb);
        if (rowsFb.length === 0) return;
        appendConsolidatedTrainingSection(tableSelector, containerId, rowsFb, title);
        return;
    }

    var appraisalCycleId = getFeedbackAppraisalCycleId();
    var selectedyear = getFeedbackSelectedYear();

    if (!appraisalCycleId || appraisalCycleId === '0') return;

    function tryAppendFromFallback() {
        if (!fallbackGoalLikeRows || !fallbackGoalLikeRows.length) return;
        var deduped = dedupeGoalLikeRowsForConsolidatedTraining(fallbackGoalLikeRows);
        var trainingRows = buildConsolidatedTrainingRowsFromGoalLikeArray(deduped);
        if (trainingRows.length === 0) return;
        appendConsolidatedTrainingSection(tableSelector, containerId, trainingRows, title);
    }

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'EmployeeKRA/GetEmployeeKRA?AppraisalCycleId=' + appraisalCycleId + '&ToEmployeeId=' + toEmployeeId + '&StatusId=3&SelectedYear=' + selectedyear + '&SelfAssCycleId=' + selectedyear;

    CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (kraResponse) {
        var kraDataArray = employeeKraApiResultToRows(kraResponse);
        var trainingRows = buildConsolidatedTrainingRowsFromGoalLikeArray(kraDataArray);
        if (trainingRows.length === 0) {
            tryAppendFromFallback();
            return;
        }
        appendConsolidatedTrainingSection(tableSelector, containerId, trainingRows, title);
    }).fail(function () {
        tryAppendFromFallback();
    });
}

function renderMyFeedbackTrainingRequirements(fallbackFeedbackRows) {
    renderConsolidatedTrainingRequirementsForEmployee(
        sessionStorage.EmployeeId,
        '#tblMyFeedbackKRA',
        'tblMyFeedbackKRA_consolidatedTraining',
        fallbackFeedbackRows,
        {
            consolidatedTrainingFromFeedbackRowsOnly: true,
            consolidatedTrainingSectionTitle: 'Training recommendations (from manager feedback)'
        }
    );
}

function fnBindMySelfAssessment() {

    var selectedyear = getFeedbackSelectedYear();

    var empId = sessionStorage.EmployeeId;
    var apraisalCycleId = getFeedbackAppraisalCycleId();
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Feedback?AppraisalCycleId=" + apraisalCycleId + "&ToEmployeeId=" + empId + "&FromEmployeeId=0&ActionTypeId=1&ParentFeedBackId=0&AreaID=10&SelectedYear=" + selectedyear;

    function endMySelfAssessmentLoading() {
        setTimeout(function () { initializeReadMoreLessHandlers(); }, 100);
        feedbackPageAjaxEnd();
    }

    // One overlay for Area 10 + optional GetEmployeeKRA (training block) so the table and training appear together
    feedbackPageAjaxBegin();
    FeedbackAsyncGET(apiPath, { suppressOverlay: true }).done(function (kraData) {
        var $tbl = $('#tblMySelfassessment');
        $tbl.find('thead').show();
        var colCount = $tbl.find('thead tr th').length || 4;

        if ($.fn.DataTable.isDataTable($tbl)) {
            $tbl.DataTable().clear().destroy();
        }
        $tbl.find('tbody').empty();

        var dataToBind = feedbackGetRowsForDataTable(kraData);

        if (!kraData || !kraData.Success || !dataToBind.length) {
            if (kraData && kraData.Success === false && kraData.ErrorCode && String(kraData.ErrorCode).indexOf('NotFound') === -1) {
                console.log('fnBindMySelfAssessment:', kraData.ErrorCode, kraData.ErrorMessage);
            }
            $('#tblMySelfassessment_kraGoalSettingConsolidatedTraining').remove();
            $('#tblMySelfassessment_managerFeedbackConsolidatedTraining').remove();
            $('#tblMySelfassessment_consolidatedTraining').remove();
            showNoDataMessage('#tblMySelfassessment', colCount);
            endMySelfAssessmentLoading();
            return;
        }

        $tbl.DataTable({
            data: dataToBind,
            destroy: true,
            "bPaginate": false,
            "bFilter": true,
            "bInfo": false,
            "sPaginationType": "full_numbers",
            "iDisplayLength": 10,
            "bLengthChange": false,
            "oLanguage": {
                "oPaginate": {
                    "sNext": '<a href="#"><span class="glyphicon glyphicon-triangle-right"></span></a>',
                    "sPrevious": '<a href="#"><span class="glyphicon glyphicon-triangle-left"></span></a>',
                    "sLast": '<a href="#"><span class="glyphicon glyphicon-step-forward"></span></a>',
                    "sFirst": '<a href="#"><span class="glyphicon glyphicon-step-backward"></span></a>'
                }
            },
            "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
            aoColumns: [
                { mData: "Question" },
                {
                    mData: "Measure",
                    mRender: function (data, type, full) {
                        var uniqueId = 'measure_self_' + (full.FeedBackId || full.FeedbackId || full.KRAId || Math.random().toString(36).substr(2, 9));
                        return generateReadMoreLessHTML(full.Measure, 10, uniqueId);
                    }
                },
                {
                    mData: "Selfassesment",
                    mRender: function (data, type, full) {
                        var uniqueId = 'selfassess_self_' + (full.FeedBackId || full.FeedbackId || full.KRAId || Math.random().toString(36).substr(2, 9));
                        return generateReadMoreLessHTML(full.Selfassesment, 10, uniqueId);
                    }
                },
                {
                    mData: "FeedbackDate", "render": function (data, type, row, meta) {
                        var dt = new Date(data);
                        return formatDate_DMY(dt);
                    },

                    "sWidth": "15%"
                }
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                if ((aData.IsSeen == "0") && (aData.LastFeedbackGivenBy != sessionStorage.EmployeeId)) { // display unread messages in green color
                    $('td', nRow).addClass('UnreadMessage');
                }

            }
        });

        // Area 10 self-assessment rows do not include EmployeeKRA training columns — load KRAs and show goal-setting consolidated table (same as ViewSelfAssessmentFeedback)
        if (typeof appendKraGoalSettingConsolidatedTraining === 'function' && apraisalCycleId && apraisalCycleId !== '0') {
            var kraPath = svrPath + 'EmployeeKRA/GetEmployeeKRA?AppraisalCycleId=' + apraisalCycleId + '&ToEmployeeId=' + empId + '&StatusId=3&SelectedYear=' + selectedyear + '&SelfAssCycleId=' + selectedyear;
            FeedbackAsyncGET(kraPath, { suppressOverlay: true }).done(function (kraResponse) {
                var kraRows = employeeKraApiResultToRows(kraResponse);
                var wrapperSel = '#tblMySelfassessment_wrapper';
                var insertAfter = $(wrapperSel).length ? wrapperSel : null;
                appendKraGoalSettingConsolidatedTraining(kraRows, '#tblMySelfassessment', insertAfter);
            }).fail(function () {
                $('#tblMySelfassessment_kraGoalSettingConsolidatedTraining').remove();
            }).always(function () {
                endMySelfAssessmentLoading();
            });
            return;
        }

        endMySelfAssessmentLoading();
    }).fail(function () {
        var $tblFail = $('#tblMySelfassessment');
        var colCountFail = $tblFail.find('thead tr th').length || 4;
        if ($.fn.DataTable.isDataTable($tblFail)) {
            try { $tblFail.DataTable().clear().destroy(); } catch (e) { }
        }
        $tblFail.find('tbody').empty();
        $('#tblMySelfassessment_kraGoalSettingConsolidatedTraining').remove();
        $('#tblMySelfassessment_managerFeedbackConsolidatedTraining').remove();
        $('#tblMySelfassessment_consolidatedTraining').remove();
        showNoDataMessage('#tblMySelfassessment', colCountFail);
        endMySelfAssessmentLoading();
    });



}



//Following function is used to bind the Competency list for employee (_MyFeedbackCompetency.cshtml)
function fnBindMyFeebackCompetencyList() {

    var selectedyear = getFeedbackSelectedYear();
    var empId = sessionStorage.EmployeeId;
    var apraisalCycleId = getFeedbackAppraisalCycleId();
    var token = sessionStorage.TokenValue;
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Feedback?AppraisalCycleId=" + apraisalCycleId + "&ToEmployeeId=" + empId + "&FromEmployeeId=0&ActionTypeId=1&ParentFeedBackId=0&AreaID=1&SelectedYear=" + selectedyear;

    FeedbackAsyncGET(apiPath).done(function (competencyData) {
        var $tblComp = $('#tblMyFeedbackCompetency');
        $tblComp.find('thead').show();
        var colCountComp = $tblComp.find('thead tr th').length || 6;
        if ($.fn.DataTable.isDataTable($tblComp)) {
            try { $tblComp.DataTable().destroy(); } catch (exComp) { }
        }
        $tblComp.find('tbody').empty();
        if (competencyData && competencyData.Success === false) {
            console.log("BindMyFeebackCompetencyList-" + competencyData.ErrorCode + " " + competencyData.ErrorMessage);
        }
        var rowsComp = feedbackGetRowsForDataTable(competencyData);
        if (!rowsComp.length) {
            showNoDataMessage('#tblMyFeedbackCompetency', colCountComp);
            return;
        }

        $tblComp.DataTable({
            data: rowsComp,
            destroy: true,
            "bPaginate": true,
            "bFilter": true,
            "bInfo": false,
            "sPaginationType": "full_numbers",
            "iDisplayLength": 10,
            "bLengthChange": false,
            "oLanguage": {
                "oPaginate": {
                    "sNext": '<a href="#"><span class="glyphicon glyphicon-triangle-right"></span></a>',
                    "sPrevious": '<a href="#"><span class="glyphicon glyphicon-triangle-left"></span></a>',
                    "sLast": '<a href="#"><span class="glyphicon glyphicon-step-forward"></span></a>',
                    "sFirst": '<a href="#"><span class="glyphicon glyphicon-step-backward"></span></a>'
                }
            },
            "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
            aoColumns: [
                { mData: "FromEmployeeName" },
                { mData: "Question" },
                { mData: "Feedback" },
                {
                    mData: "FeedbackDate", "render": function (data, type, row, meta) {
                        var dt = new Date(data);
                        return formatDate_DMY(dt);
                    },

                    "sWidth": "15%"
                },

                {
                    "render": function (data, type, row, meta) {
                        var button = fnGetButtonHTML(row);
                        return button;
                    }
                }
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                if ((aData.IsSeen == "0") && (aData.LastFeedbackGivenBy != sessionStorage.EmployeeId)) { // display unread messages in green color
                    $('td', nRow).addClass('UnreadMessage');
                }

            }
        });


    });
}

//Following function is used to bind the Feed back received from other (peers/collecgues) list for employee (_MyFeedbackOther.cshtml)
function fnBindMyFeebackOtherList() {

    var selectedyear = getFeedbackSelectedYear();
    var empId = sessionStorage.EmployeeId;
    var apraisalCycleId = getFeedbackAppraisalCycleId();
    var token = sessionStorage.TokenValue;
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Feedback?AppraisalCycleId=" + apraisalCycleId + "&ToEmployeeId=" + empId + "&FromEmployeeId=0&ActionTypeId=1&SelectedYear=" + selectedyear;

    FeedbackAsyncGET(apiPath).done(function (feedbackData) {
        var $tblOther = $('#tblMyFeedbackOther');
        $tblOther.find('thead').show();
        var colCountOther = $tblOther.find('thead tr th').length || 5;
        if ($.fn.DataTable.isDataTable($tblOther)) {
            try { $tblOther.DataTable().destroy(); } catch (exOther) { }
        }
        $tblOther.find('tbody').empty();
        if (feedbackData && feedbackData.Success === false) {
            if (feedbackData.ErrorCode !== "NotFound" && feedbackData.ErrorCode !== "Not Found") {
                console.log("BindMyFeebackOtherList-" + feedbackData.ErrorCode + " " + feedbackData.ErrorMessage);
            }
        }
        var rowsOther = feedbackGetRowsForDataTable(feedbackData);
        if (!rowsOther.length) {
            showNoDataMessage('#tblMyFeedbackOther', colCountOther);
            setTimeout(function () { initializeReadMoreLessHandlers(); }, 100);
            return;
        }
        $tblOther.DataTable({
            data: rowsOther,
            destroy: true,
            "bPaginate": true,
            "bFilter": true,
            "bInfo": false,
            "sPaginationType": "full_numbers",
            "iDisplayLength": 10,
            "bLengthChange": false,
            "oLanguage": {
                "oPaginate": {
                    "sNext": '<a href="#"><span class="glyphicon glyphicon-triangle-right"></span></a>',
                    "sPrevious": '<a href="#"><span class="glyphicon glyphicon-triangle-left"></span></a>',
                    "sLast": '<a href="#"><span class="glyphicon glyphicon-step-forward"></span></a>',
                    "sFirst": '<a href="#"><span class="glyphicon glyphicon-step-backward"></span></a>'
                }
            },
            "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
            aoColumns: [
                { mData: "FromName" },
                {
                    mData: "Feedback",
                    mRender: function (data, type, full) {
                        var uniqueId = 'feedback_other_' + (full.FeedBackId || full.FeedbackId || Math.random().toString(36).substr(2, 9));
                        return generateReadMoreLess(full.Feedback, 10, uniqueId);
                    }
                },
                {
                    mData: "FeedbackDate", "render": function (data, type, row, meta) {
                        var dt = new Date(data);
                        return formatDate_DMY(dt);
                    },
                    "sWidth": "15%"
                },
                {
                    "render": function (data, type, row, meta) {
                        var button = fnGetButtonHTML(row);
                        return button;
                    }
                }
            ]
            ,
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                if ((aData.IsSeen == "0") && (aData.LastFeedbackGivenBy != sessionStorage.EmployeeId)) { // display unread messages in green color
                    $('td', nRow).addClass('UnreadMessage');
                }

            }
        });
        
        // Initialize read more/less handlers
        setTimeout(function() {
            initializeReadMoreLessHandlers();
        }, 100);


    });
}


/*Start - Feedback Given tab*/

//Following function is used to bind the KRA list for employee (_FeedbackGivenKRA.cshtml)
function fnBindFeebackGivenKRAList(ToEmployeeId) {

    var flagButton = 0;
    var selectedyear = getFeedbackSelectedYear();
    var empId = sessionStorage.EmployeeId;
    var apraisalCycleId = getFeedbackAppraisalCycleId();
    var token = sessionStorage.TokenValue;
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = ''
    if (ToEmployeeId != 0 || ToEmployeeId == undefined) {

        apiPath = svrPath + "Feedback?AppraisalCycleId=" + apraisalCycleId + "&ToEmployeeId=" + ToEmployeeId + "&FromEmployeeId=" + empId +
            "&ActionTypeId=1&ParentFeedBackId=" + 0 + "&AreaID=2&SelectedYear=" + selectedyear;
    }
    else {
        apiPath = svrPath + "Feedback?AppraisalCycleId=" + apraisalCycleId + "&ToEmployeeId=" + 0 + "&FromEmployeeId=" + empId +
            "&ActionTypeId=1&ParentFeedBackId=" + 0 + "&AreaID=2&SelectedYear=" + selectedyear;
    }

    var colCount = 7;
    FeedbackAsyncGET(apiPath, {
        beforeSend: function () {
    $('#dvMyKraContent').show();
    $('#tblFeedbackGivenKRA_consolidatedTraining').remove();
    $('#tblFeedbackGivenKRA thead').hide();
    if ($.fn.DataTable.isDataTable('#tblFeedbackGivenKRA')) {
        $('#tblFeedbackGivenKRA').DataTable().clear().destroy();
    }
            colCount = $('#tblFeedbackGivenKRA thead tr th').length || 7;
            $('#tblFeedbackGivenKRA tbody').html(feedbackTableLoadingRowHtml(colCount));
        }
    }).done(function (kraData) {
            var today = new Date();
            var showActionPlanCol = feedbackShowActionPlanColumnForSelectedYear();
            
            // Clear loader and show table header
            $('#tblFeedbackGivenKRA tbody').empty();
            if ($('#thFeedbackGivenActionPlan').length) {
                $('#thFeedbackGivenActionPlan').toggle(showActionPlanCol);
            }
            $('#tblFeedbackGivenKRA thead').show();
            
            $('#dvMyKraContent').show();
            $('#giveFeedbackLoader').fadeOut(200);
            
            if (kraData.Success == false) {
                // Only log if it's not a "NotFound" error (expected when no data)
                if (kraData.ErrorCode !== "NotFound" && kraData.ErrorCode !== "Not Found") {
                    console.log("fnBindFeebackGivenKRAList-" + kraData.ErrorCode + " " + kraData.ErrorMessage);
                }
                // Show "No data available" message
                showNoDataMessage('#tblFeedbackGivenKRA', colCount);
                $('#tblFeedbackGivenKRA_consolidatedTraining').remove();
            }
            else {
                var dataToBind = feedbackGetRowsForDataTable(kraData);
                
                if (dataToBind.length === 0) {
                    // Show "No data available" message
                    showNoDataMessage('#tblFeedbackGivenKRA', colCount);
                    $('#tblFeedbackGivenKRA_consolidatedTraining').remove();
                } else {
                    flagButton = 0;
                    for (var fb = 0; fb < dataToBind.length; fb++) {
                        var fr = dataToBind[fb];
                        if (fr.IsIgnore == 0 && (today <= new Date(fr.EditableDateCheck))) {
                            flagButton = 1;
                            break;
                        }
                    }
                    $("#tblFeedbackGivenKRA").DataTable({
                        data: dataToBind,
                        destroy: true,
                "bPaginate": false,
                "autoWidth": false,
                "bFilter": true,
                "bInfo": false,
                "sPaginationType": "full_numbers",
                "iDisplayLength": 10,
                "bLengthChange": false,
                "oLanguage": {
                    "oPaginate": {
                        "sNext": '<a href="#"><span class="glyphicon glyphicon-triangle-right"></span></a>',
                        "sPrevious": '<a href="#"><span class="glyphicon glyphicon-triangle-left"></span></a>',
                        "sLast": '<a href="#"><span class="glyphicon glyphicon-step-forward"></span></a>',
                        "sFirst": '<a href="#"><span class="glyphicon glyphicon-step-backward"></span></a>'
                    }
                },
                "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
                aoColumns: [
                    { 
                        mData: "ToEmployeeName",
                        "sWidth": "10%"
                    },
                    { 
                        mData: "Question",
                        "sWidth": "18%",
                        mRender: function (data, type, full) {
                            var uniqueId = 'kra_given_' + (full.FeedBackId || full.FeedbackId || full.KRAId || Math.random().toString(36).substr(2, 9));
                            return generateReadMoreLessHTML(full.Question, 15, uniqueId);
                        }
                    },
                    {
                        mData: "Measure",
                        "sWidth": "14%",
                        mRender: function (data, type, full) {
                            var raw = feedbackRowKpiMeasure(full);
                            var uniqueId = 'kpi_given_' + (full.FeedBackId || full.FeedbackId || full.KRAId || Math.random().toString(36).substr(2, 9));
                            if (!raw) return '<span class="text-muted">Not specified</span>';
                            return generateReadMoreLessHTML(raw, 15, uniqueId);
                        }
                    },
                    {
                        mData: "ActionPlan",
                        visible: showActionPlanCol,
                        "sWidth": "12%",
                        mRender: function (data, type, full) {
                            var uniqueId = 'actionplan_given_' + (full.FeedBackId || full.FeedbackId || full.KRAId || Math.random().toString(36).substr(2, 9));
                            return generateReadMoreLessHTML(full.ActionPlan || 'Not specified', 15, uniqueId);
                        }
                    },
                    {
                        mData: "Selfassesment",
                        "sWidth": "13%",
                        mRender: function (data, type, full) {
                            var uniqueId = 'selfassess_comp_' + (full.FeedBackId || full.FeedbackId || full.KRAId || Math.random().toString(36).substr(2, 9));
                            return generateReadMoreLessHTML(full.Selfassesment, 10, uniqueId);
                        }
                    },
                    {
                        "sWidth": "15%",
                        "render": function (data, type, row, meta) {
                            var btn;
                            if (row.IsIgnore == 0) {
                                if ((today >= new Date(row.EditableDateCheck))) {
                                    // Read-only feedback - show with read more/less (preserve HTML)
                                    var uniqueId = 'feedback_comp_' + (row.FeedBackId || row.FeedbackId || Math.random().toString(36).substr(2, 9));
                                    btn = generateReadMoreLessHTML(row.Feedback, 10, uniqueId);
                                } else {
                                    // Editable feedback - show textarea
                                    btn = "<textarea type='text' value='" + (row.Feedback || '') + "'  class='form-control' rows='3' maxlength='600' id=" + row.FeedBackId + " />" + (row.Feedback || '') + "</textarea>";
                                }
                                return btn;

                            }
                            else {
                                // Ignored feedback - show with read more/less (preserve HTML)
                                var uniqueId = 'feedback_comp_ignored_' + (row.FeedBackId || row.FeedbackId || Math.random().toString(36).substr(2, 9));
                                return generateReadMoreLessHTML(row.Feedback, 10, uniqueId);
                            }

                        }
                    },
                    {
                        mData: "FeedbackDate", 
                        "sWidth": "9%",
                        "render": function (data, type, row, meta) {
                            var dt = new Date(data);
                            return formatDate_DMY(dt);
                        }
                    }
                ],
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    if ((aData.IsSeen == "0") && (aData.LastFeedbackGivenBy != sessionStorage.EmployeeId)) { // display unread messages in green color
                        $('td', nRow).addClass('UnreadMessage');
                    }
                }
            });
                    // Primary: EmployeeKRA API (canonical). Fallback: deduped feedback rows if API shape/errors (e.g. NotFound).
                    if (ToEmployeeId && ToEmployeeId !== 0 && ToEmployeeId !== '0') {
                        renderFeedbackGivenConsolidatedTraining(ToEmployeeId, dataToBind);
                    } else {
                        $('#tblFeedbackGivenKRA_consolidatedTraining').remove();
                    }
                }
            
            setTimeout(function () {
                initializeReadMoreLessHandlers();
            }, 1000);
            
            if (flagButton != 1) {
                $("#btnUpdateEditableKRA").css("display", "none");
            }
            else {
                $("#btnUpdateEditableKRA").css("display", "block");
                $("#btnUpdateEditableKRA").css("display", "table-caption");
            }
        }
    }).fail(function (xhr, statusText, errorThrown) {
        $('#tblFeedbackGivenKRA thead').show();
        $('#dvMyKraContent').show();
        $('#giveFeedbackLoader').fadeOut(200);
        $('#tblFeedbackGivenKRA_consolidatedTraining').remove();
        var cc = $('#tblFeedbackGivenKRA thead tr th').length || 7;
        $('#tblFeedbackGivenKRA tbody').html('<tr><td colspan="' + cc + '" style="text-align: center; padding: 40px; color: #d9534f;">Error loading data. Please try again.</td></tr>');
        console.error("Error loading feedback given KRA list:", errorThrown);
});
}

//Following function is used to bind the KRA list for employee (_FeedbackGivenCompetency.cshtml)
function fnBindFeebackGivenCompetencyList() {
    var flagButton = 0;
    var selectedyear = getFeedbackSelectedYear();
    var empId = sessionStorage.EmployeeId;
    var apraisalCycleId = getFeedbackAppraisalCycleId();
    var token = sessionStorage.TokenValue;
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Feedback?AppraisalCycleId=" + apraisalCycleId + "&ToEmployeeId=" + 0 + "&FromEmployeeId=" + empId +
        "&ActionTypeId=1&ParentFeedBackId=" + 0 + "&AreaID=1&SelectedYear=" + selectedyear;
    FeedbackAsyncGET(apiPath).done(function (kraData) {
        var $tblGivenComp = $('#tblFeedbackGivenCompetency');
        $tblGivenComp.find('thead').show();
        var colCountGivenComp = $tblGivenComp.find('thead tr th').length || 7;
        if ($.fn.DataTable.isDataTable($tblGivenComp)) {
            try { $tblGivenComp.DataTable().destroy(); } catch (exGc) { }
        }
        $tblGivenComp.find('tbody').empty();
        if (kraData && kraData.Success === false) {
            if (kraData.ErrorCode !== "NotFound" && kraData.ErrorCode !== "Not Found") {
                console.log("BindFeebackGivenCompetencyList-" + kraData.ErrorCode + " " + kraData.ErrorMessage);
            }
        }
        var rowsGivenComp = feedbackGetRowsForDataTable(kraData);
        if (!rowsGivenComp.length) {
            showNoDataMessage('#tblFeedbackGivenCompetency', colCountGivenComp);
            $("#btnUpdateEditableCompitency").css("display", "none");
            return;
        }
        var today = new Date();

        $tblGivenComp.DataTable({
            data: rowsGivenComp,
            "initComplete": function (settings, json) {

                setTimeout(function () {
                    console.log($('#tblFeedbackGivenCompetency'))
                    $('#tblFeedbackGivenCompetency').DataTable()
                        .columns.adjust();
                }, 3000)
            },
            destroy: true,
            "bPaginate": false,
            "autoWidth": true,
            "bPaginate": false,
            "scroller": true,
            "scrollY": 400,
            "bFilter": true,
            "bInfo": false,
            "sPaginationType": "full_numbers",
            "iDisplayLength": 10,
            "bLengthChange": false,
            "oLanguage": {
                "oPaginate": {
                    "sNext": '<a href="#"><span class="glyphicon glyphicon-triangle-right"></span></a>',
                    "sPrevious": '<a href="#"><span class="glyphicon glyphicon-triangle-left"></span></a>',
                    "sLast": '<a href="#"><span class="glyphicon glyphicon-step-forward"></span></a>',
                    "sFirst": '<a href="#"><span class="glyphicon glyphicon-step-backward"></span></a>'
                }
            },
            "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
            aoColumns: [
                {
                    "render": function (data, type, row, meta) {
                        if (row.IsIgnore == 0) {
                            if ((today <= new Date(row.EditableDateCheck))) {
                                flagButton = 1;
                                return "<input type='checkbox' class='checkbox_compentency' name='Id' value=" + row.FeedBackId + "#" + row.QuestionaireId + "#" + row.ToEmployeeId + ">";
                            }
                            else {
                                return "<input type='checkbox' name='Id'  disabled='true' >";
                            }
                        }
                        else {
                            return "<input type='checkbox' name='Id' disabled='true' >";
                        }

                    }
                },
                //{ mData: "QuestionaireId" },
                //{ mData: "FeedBackId" },
                { mData: "ToEmployeeName" },
                { mData: "Question" },
                {

                    "render": function (data, type, row, meta) {
                        var btn;
                        if (row.IsIgnore == 0) {
                            if ((today >= new Date(row.EditableDateCheck))) {
                                if (row.Feedback != null) {
                                    btn = "<span>" + row.Feedback + "</span>";
                                }
                                else {
                                    btn = "<span>" + row.Feedback + "</span>";
                                }

                            } else {
                                btn = "<textarea type='text' value='" + row.Feedback + "'  class='form-control'  rows='3' maxlength='600' id=" + row.FeedBackId + " />" + row.Feedback + "</textarea>";
                            }
                            return btn;
                        } else {
                            return "<span>" + row.Feedback + "</span>";
                        }
                    },
                    "sWidth": "30%"
                },
                {
                    mData: "FeedbackDate", "render": function (data, type, row, meta) {
                        var dt = new Date(data);
                        return formatDate_DMY(dt);
                    }
                },
                {
                    "render": function (data, type, row, meta) {
                        var button = fnGetButtonHTML(row);
                        return button;
                    }
                }
            ]
            ,
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                if ((aData.IsSeen == "0") && (aData.LastFeedbackGivenBy != sessionStorage.EmployeeId)) { // display unread messages in green color
                    $('td', nRow).addClass('UnreadMessage');
                }

            }
        });

        setTimeout(function () {

            // $('#tblFeedbackGivenCompetency').DataTable().columns.adjust();

            $(document.body).on('click', '.checkbox_compentency', function () {
                if ($(this).is(":checked")) {
                    arr.push($(this).val())

                }
                else {
                    var index = arr.indexOf($(this).val());
                    arr.splice(index, 1);
                }

                console.log(arr);
            });
        }, 1000)

        if (flagButton != 1) {
            $("#btnUpdateEditableCompitency").css("display", "none");
        }
        else {

            $("#btnUpdateEditableKRA").css("display", "block");
            $("#btnUpdateEditableKRA").css("display", "table-caption");

        }
    });
}



function fnBindFeebackGivenSKIPLEVELKRAList() {
    var selectedyear = $('#ddlyearSkiplevel :selected').val();
    var ToEmployeeId = GToEmployeeId;
    var empId = sessionStorage.EmployeeId;
    var apraisalCycleId = getFeedbackAppraisalCycleId();
    var token = sessionStorage.TokenValue;
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Feedback?AppraisalCycleId=" + apraisalCycleId + "&ToEmployeeId=" + ToEmployeeId + "&FromEmployeeId=" + 0 +
        "&ActionTypeId=1&ParentFeedBackId=" + 0 + "&AreaID=5&SelectedYear=" + selectedyear;

    FeedbackAsyncGET(apiPath).done(function (kraDataSKipLevel) {

        if (kraDataSKipLevel.Success == false) {
            console.log("fnBindFeebackGivenSKIPLEVELKRAList-" + kraDataSKipLevel.ErrorCode + " " + kraDataSKipLevel.ErrorMessage);
        }
        if ($.fn.DataTable.isDataTable('#tblFeedbackGivenSkipLevelKRA')) {
            try { $('#tblFeedbackGivenSkipLevelKRA').DataTable().destroy(); } catch (exSk) { }
        }

        $("#tblFeedbackGivenSkipLevelKRA").html('<thead><tr><th>From Feedback</th><th>Goals</th><th>G&Os</th><th>Feedback</th><th>Date</th></tr></thead><tbody></tbody>');

        $("#tblFeedbackGivenSkipLevelKRA").DataTable({
            data: feedbackGetRowsForDataTable(kraDataSKipLevel),
            destroy: true,
            "bPaginate": true,
            "bFilter": true,
            "bInfo": false,
            "sPaginationType": "full_numbers",
            "iDisplayLength": 10,
            "bLengthChange": false,
            "oLanguage": {
                "oPaginate": {
                    "sNext": '<a href="#"><span class="glyphicon glyphicon-triangle-right"></span></a>',
                    "sPrevious": '<a href="#"><span class="glyphicon glyphicon-triangle-left"></span></a>',
                    "sLast": '<a href="#"><span class="glyphicon glyphicon-step-forward"></span></a>',
                    "sFirst": '<a href="#"><span class="glyphicon glyphicon-step-backward"></span></a>'
                }
            },
            "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
            aoColumns: [
                { mData: "FromEmployeeName" },
                { mData: "Question" },
                {
                    mData: "Measure",
                    mRender: function (data, type, full) {
                        var uniqueId = 'measure_skip_' + (full.FeedBackId || full.FeedbackId || full.KRAId || Math.random().toString(36).substr(2, 9));
                        return generateReadMoreLess(full.Measure, 10, uniqueId);
                    }
                },
                {
                    mData: "Feedback",
                    mRender: function (data, type, full) {
                        var uniqueId = 'feedback_skip_' + (full.FeedBackId || full.FeedbackId || Math.random().toString(36).substr(2, 9));
                        return generateReadMoreLess(full.Feedback, 10, uniqueId);
                    }
                },
                {
                    mData: "FeedbackDate", "render": function (data, type, row, meta) {
                        var dt = new Date(data);
                        return formatDate_DMY(dt);
                    }
                }
            ]
            ,
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                if ((aData.IsSeen == "0") && (aData.LastFeedbackGivenBy != sessionStorage.EmployeeId)) { // display unread messages in green color
                    //$('td', nRow).addClass('UnreadMessage');
                }

            }
        });
    });
}

function fnBindFeebackGivenbySkipLevelManager() {
    $('#skiplevelfeedback input:text').val("");
    var selectedyear = $('#ddlyearSkiplevel :selected').val();
    var ToEmployeeId = GToEmployeeId;
    var empId = sessionStorage.EmployeeId;
    var apraisalCycleId = getFeedbackAppraisalCycleId();
    var token = sessionStorage.TokenValue;
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };
    var svrPath = CONFIG.get('SERVERNAME');

    var apiPath1 = svrPath + "Feedback?AppraisalCycleId=" + apraisalCycleId + "&ToEmployeeId=" + ToEmployeeId + "&FromEmployeeId=" + 0 +
        "&ActionTypeId=1&ParentFeedBackId=" + 0 + "&AreaID=8&SelectedYear=" + selectedyear;

    var apiPath = svrPath + "Feedback?AppraisalCycleId=" + apraisalCycleId + "&ToEmployeeId=" + ToEmployeeId + "&FromEmployeeId=" + 0 +
        "&ActionTypeId=1&ParentFeedBackId=" + 0 + "&AreaID=0&SelectedYear=" + selectedyear;

    FeedbackAsyncGET(apiPath1).done(function (kraDataSKipLevelManagerFirst) {
        if (kraDataSKipLevelManagerFirst && kraDataSKipLevelManagerFirst.Success === true && kraDataSKipLevelManagerFirst.Result && kraDataSKipLevelManagerFirst.Result.data && kraDataSKipLevelManagerFirst.Result.data[0]) {
            $('#hdnManagerId').val(kraDataSKipLevelManagerFirst.Result.data[0].EmployeeManagerId);
        }
    }).always(function () {
        FeedbackAsyncGET(apiPath).done(function (kraDataSKipLevelManager) {
        if (kraDataSKipLevelManager.Success == true) {
            // $('#hdnManagerId').val(kraDataSKipLevelManager.Result[0].EmployeeManagerId);
        }


        if (kraDataSKipLevelManager.Success == false) {
            console.log("fnBindFeebackGiventBySkipLevelManager-" + kraDataSKipLevelManager.ErrorCode + " " + kraDataSKipLevelManager.ErrorMessage);
        }
        if ($.fn.DataTable.isDataTable('#tblFeedbackBySkipLevelManager')) {
            try { $('#tblFeedbackBySkipLevelManager').DataTable().destroy(); } catch (exSm) { }
        }

        $("#tblFeedbackBySkipLevelManager").html('<thead><tr><th>From Feedback</th><th>Feedback</th><th>Date</th></tr></thead><tbody></tbody>');

        $("#tblFeedbackBySkipLevelManager").DataTable({

            data: feedbackGetRowsForDataTable(kraDataSKipLevelManager),
            destroy: true,
            "bPaginate": true,
            "bFilter": true,
            "bInfo": false,
            "sPaginationType": "full_numbers",
            "iDisplayLength": 10,
            "bLengthChange": false,
            "oLanguage": {
                "oPaginate": {
                    "sNext": '<a href="#"><span class="glyphicon glyphicon-triangle-right"></span></a>',
                    "sPrevious": '<a href="#"><span class="glyphicon glyphicon-triangle-left"></span></a>',
                    "sLast": '<a href="#"><span class="glyphicon glyphicon-step-forward"></span></a>',
                    "sFirst": '<a href="#"><span class="glyphicon glyphicon-step-backward"></span></a>'
                }
            },
            "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
            aoColumns: [
                { mData: "FromEmployeeName" },
                { mData: "Feedback" },
                {
                    mData: "FeedbackDate", "render": function (data, type, row, meta) {
                        var dt = new Date(data);
                        return formatDate_DMY(dt);
                    }
                }
            ]
            ,
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                if ((aData.IsSeen == "0") && (aData.LastFeedbackGivenBy != sessionStorage.EmployeeId)) { // display unread messages in green color
                    //$('td', nRow).addClass('UnreadMessage');
                }

            }
        });
        });
    });
}

function fnBindFeebackGivenSKIPLEVELCompetencyList() {
    var selectedyear = $('#ddlyearSkiplevel :selected').val();
    var ToEmployeeId = GToEmployeeId;
    var empId = sessionStorage.EmployeeId;
    var apraisalCycleId = getFeedbackAppraisalCycleId();
    var token = sessionStorage.TokenValue;
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Feedback?AppraisalCycleId=" + apraisalCycleId + "&ToEmployeeId=" + ToEmployeeId + "&FromEmployeeId=" + 0 +
        "&ActionTypeId=1&ParentFeedBackId=" + 0 + "&AreaID=4&SelectedYear=" + selectedyear;


    FeedbackAsyncGET(apiPath).done(function (CompitencyDataSkipLevel) {
        if (CompitencyDataSkipLevel.Success == false) {
            console.log("fnBindFeebackGivenSKIPLEVELCompetencyList-" + CompitencyDataSkipLevel.ErrorCode + " " + CompitencyDataSkipLevel.ErrorMessage);
        }
        if ($.fn.DataTable.isDataTable('#tblFeedbackGivenSkipLevelBC')) {
            try { $('#tblFeedbackGivenSkipLevelBC').DataTable().destroy(); } catch (exBc) { }
        }
        $("#tblFeedbackGivenSkipLevelBC").html('<thead><tr><th>From Feedback</th><th>Competencies</th><th>Feedback</th><th>Date</th></tr></thead><tbody></tbody>');

        $("#tblFeedbackGivenSkipLevelBC").DataTable({
            data: feedbackGetRowsForDataTable(CompitencyDataSkipLevel),
            destroy: true,
            "bPaginate": true,
            "bFilter": true,
            "bInfo": false,
            "sPaginationType": "full_numbers",
            "iDisplayLength": 10,
            "bLengthChange": false,
            "oLanguage": {
                "oPaginate": {
                    "sNext": '<a href="#"><span class="glyphicon glyphicon-triangle-right"></span></a>',
                    "sPrevious": '<a href="#"><span class="glyphicon glyphicon-triangle-left"></span></a>',
                    "sLast": '<a href="#"><span class="glyphicon glyphicon-step-forward"></span></a>',
                    "sFirst": '<a href="#"><span class="glyphicon glyphicon-step-backward"></span></a>'
                }
            },
            "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
            aoColumns: [
                { mData: "FromEmployeeName" },
                { mData: "Question" },
                { mData: "Feedback" },
                {
                    mData: "FeedbackDate", "render": function (data, type, row, meta) {
                        var dt = new Date(data);
                        return formatDate_DMY(dt);
                    }
                }
            ]
            ,
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                if ((aData.IsSeen == "0") && (aData.LastFeedbackGivenBy != sessionStorage.EmployeeId)) { // display unread messages in green color
                    //$('td', nRow).addClass('UnreadMessage');
                }

            }
        });

    });
}



//added by garima
function fnBindFeebackGivenKRAListByDelegator() {

    var Delegator = $('#ddlDelegators').val();
    var EmployeeId = $('#ddlEmployees').val();
    var empId = sessionStorage.EmployeeId;
    var apraisalCycleId = getFeedbackAppraisalCycleId();
    var token = sessionStorage.TokenValue;
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };


    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "ManagerFeedback?AppraisalCycleId=" + apraisalCycleId + "&ToEmployeeId=" + EmployeeId + "&FromEmployeeId=" + Delegator +
        "&ActionTypeId=1&AreaID=2";

    FeedbackAsyncGET(apiPath).done(function (kraData) {


        if (kraData.Success == false) {
            console.log("fnBindFeebackGivenKRAListByDelegator-" + kraData.ErrorCode + " " + kraData.ErrorMessage);
        }
        $("#tblFeedbackGivenKRAbyDelegator").html('<thead><tr><th>To Employee</th><th>Goals</th><th>Feedback</th><th>Date</th></tr></thead><tbody></tbody>');

        $("#tblFeedbackGivenKRAbyDelegator").DataTable({
            data: feedbackGetRowsForDataTable(kraData),
            destroy: true,
            "bPaginate": true,
            "bFilter": true,
            "bInfo": false,
            "sPaginationType": "full_numbers",
            "iDisplayLength": 10,
            "bLengthChange": false,
            "oLanguage": {
                "oPaginate": {
                    "sNext": '<a href="#"><span class="glyphicon glyphicon-triangle-right"></span></a>',
                    "sPrevious": '<a href="#"><span class="glyphicon glyphicon-triangle-left"></span></a>',
                    "sLast": '<a href="#"><span class="glyphicon glyphicon-step-forward"></span></a>',
                    "sFirst": '<a href="#"><span class="glyphicon glyphicon-step-backward"></span></a>'
                }
            },
            "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
            aoColumns: [
                { mData: "ToEmployeeName" },
                { mData: "Question" },
                { mData: "Feedback" },
                {
                    mData: "FeedbackDate", "render": function (data, type, row, meta) {
                        var dt = new Date(data);
                        return formatDate_DMY(dt);
                    }
                },
                //{
                //    "render": function (data, type, row, meta) {
                //        var button = fnGetButtonHTML(row);
                //        return button;
                //    }
                //}
            ]
            ,
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                if ((aData.IsSeen == "0") && (aData.LastFeedbackGivenBy != sessionStorage.EmployeeId)) { // display unread messages in green color
                    //$('td', nRow).addClass('UnreadMessage');
                }

            }
        });
    });
}

//added by garima
function fnBindFeebackGivenCompetencyListByDelegator() {

    var Delegator = $('#ddlDelegators').val();
    var EmployeeId = $('#ddlEmployees').val();
    var empId = sessionStorage.EmployeeId;
    var apraisalCycleId = getFeedbackAppraisalCycleId();
    var token = sessionStorage.TokenValue;
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "ManagerFeedback?AppraisalCycleId=" + apraisalCycleId + "&ToEmployeeId=" + EmployeeId + "&FromEmployeeId=" + Delegator +
        "&ActionTypeId=1&AreaID=1";

    FeedbackAsyncGET(apiPath).done(function (kraData) {

        if (kraData.Success == false) {
            console.log("fnBindFeebackGivenCompetencyListByDelegator-" + kraData.ErrorCode + " " + kraData.ErrorMessage);
        }
        $("#tblFeedbackGivenCompetencybyDelegator").html('<thead><tr><th>To Employee</th><th>Goals</th><th>Feedback</th><th>Date</th></tr></thead><tbody></tbody>');

        $("#tblFeedbackGivenCompetencybyDelegator").DataTable({
            data: feedbackGetRowsForDataTable(kraData),
            destroy: true,
            "bPaginate": true,
            "bFilter": true,
            "bInfo": false,
            "sPaginationType": "full_numbers",
            "iDisplayLength": 10,
            "bLengthChange": false,
            "oLanguage": {
                "oPaginate": {
                    "sNext": '<a href="#"><span class="glyphicon glyphicon-triangle-right"></span></a>',
                    "sPrevious": '<a href="#"><span class="glyphicon glyphicon-triangle-left"></span></a>',
                    "sLast": '<a href="#"><span class="glyphicon glyphicon-step-forward"></span></a>',
                    "sFirst": '<a href="#"><span class="glyphicon glyphicon-step-backward"></span></a>'
                }
            },
            "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
            aoColumns: [
                { mData: "ToEmployeeName" },
                { mData: "Question" },
                { mData: "Feedback" },
                {
                    mData: "FeedbackDate", "render": function (data, type, row, meta) {
                        var dt = new Date(data);
                        return formatDate_DMY(dt);
                    }
                },
                //{
                //    "render": function (data, type, row, meta) {
                //        var button = fnGetButtonHTML(row);
                //        return button;
                //    }
                //}
            ]
            ,
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                if ((aData.IsSeen == "0") && (aData.LastFeedbackGivenBy != sessionStorage.EmployeeId)) { // display unread messages in green color
                    //$('td', nRow).addClass('UnreadMessage');
                }

            }
        });
    });
}


//Following function is used to bind the Feed back received from other (peers/collecgues) list for employee (_FeedbackGivenOther.cshtml)
function fnBindFeebackGivenOtherList() {

    var selectedyear = getFeedbackSelectedYear();
    var empId = sessionStorage.EmployeeId;
    var apraisalCycleId = getFeedbackAppraisalCycleId();
    var token = sessionStorage.TokenValue;
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue,
        "X-EmpNo": empId
    };

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Feedback?AppraisalCycleId=" + apraisalCycleId + "&ToEmployeeId=0&FromEmployeeId=" + empId + "&ActionTypeId=1&SelectedYear=" + selectedyear;

    FeedbackAsyncGET(apiPath).done(function (feedbackData) {
        var $tblGivenO = $('#tblFeedbackGivenOther');
        $tblGivenO.find('thead').show();
        var colCountGivenO = $tblGivenO.find('thead tr th').length || 5;
        if ($.fn.DataTable.isDataTable($tblGivenO)) {
            try { $tblGivenO.DataTable().destroy(); } catch (exGo) { }
        }
        $tblGivenO.find('tbody').empty();
        if (feedbackData && feedbackData.Success === false) {
            if (feedbackData.ErrorCode !== "NotFound" && feedbackData.ErrorCode !== "Not Found") {
                console.log("fnBindFeebackGivenOtherList-" + feedbackData.ErrorCode + " " + feedbackData.ErrorMessage);
            }
        }
        var rowsGivenO = feedbackGetRowsForDataTable(feedbackData);
        if (!rowsGivenO.length) {
            showNoDataMessage('#tblFeedbackGivenOther', colCountGivenO);
            return;
        }

        $tblGivenO.DataTable({
            data: rowsGivenO,
            destroy: true,
            "bPaginate": true,
            "bFilter": true,
            "bInfo": false,
            "sPaginationType": "full_numbers",
            "iDisplayLength": 10,
            "bLengthChange": false,
            "oLanguage": {
                "oPaginate": {
                    "sNext": '<a href="#"><span class="glyphicon glyphicon-triangle-right"></span></a>',
                    "sPrevious": '<a href="#"><span class="glyphicon glyphicon-triangle-left"></span></a>',
                    "sLast": '<a href="#"><span class="glyphicon glyphicon-step-forward"></span></a>',
                    "sFirst": '<a href="#"><span class="glyphicon glyphicon-step-backward"></span></a>'
                }
            },
            "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
            aoColumns: [
                { mData: "ToName" },
                { mData: "Feedback" },
                {
                    mData: "FeedbackDate", "render": function (data, type, row, meta) {
                        var dt = new Date(data);
                        return formatDate_DMY(dt);
                    }
                },
                {
                    "render": function (data, type, row, meta) {
                        var button = fnGetButtonHTML(row);
                        return button;
                    }
                }
            ]
            ,
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                if ((aData.IsSeen == "0") && (aData.LastFeedbackGivenBy != sessionStorage.EmployeeId)) { // display unread messages in green color
                    $('td', nRow).addClass('UnreadMessage');
                }

            }
        });
    });
}

/*End - Feedback Given tab*/

/*Start - Feedback Requested */

//Following function is used to bind the Feed back received from other (peers/collecgues) list for employee (_FeedbackRequested.cshtml)
function fnBindFeebackRequestedList() {


    var selectedyear = getFeedbackSelectedYear();
    var empId = sessionStorage.EmployeeId;
    var apraisalCycleId = getFeedbackAppraisalCycleId();
    var token = sessionStorage.TokenValue;
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue,
        "X-EmpNo": empId
    };

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Feedback?AppraisalCycleId=" + apraisalCycleId + "&ToEmployeeId=0&FromEmployeeId=" + empId + "&ActionTypeId=3&SelectedYear=" + selectedyear;

    FeedbackAsyncGET(apiPath).done(function (feedbackData) {
        var $tblReq = $('#tblFeedbackRequested');
        $tblReq.find('thead').show();
        var colCountReq = $tblReq.find('thead tr th').length || 5;
        if ($.fn.DataTable.isDataTable($tblReq)) {
            try { $tblReq.DataTable().destroy(); } catch (exR) { }
        }
        $tblReq.find('tbody').empty();
        if (feedbackData && feedbackData.Success === false) {
            if (feedbackData.ErrorCode !== "NotFound" && feedbackData.ErrorCode !== "Not Found") {
                console.log("BindFeebackRequestedList-" + feedbackData.ErrorCode + " " + feedbackData.ErrorMessage);
            }
        }
        var rowsReq = feedbackGetRowsForDataTable(feedbackData);
        if (!rowsReq.length) {
            showNoDataMessage('#tblFeedbackRequested', colCountReq);
            return;
        }

        $tblReq.DataTable({
            data: rowsReq,
            destroy: true,
            "bPaginate": true,
            "bFilter": true,
            "bInfo": false,
            "sPaginationType": "full_numbers",
            "iDisplayLength": 10,
            "bLengthChange": false,
            "oLanguage": {
                "oPaginate": {
                    "sNext": '<a href="#"><span class="glyphicon glyphicon-triangle-right"></span></a>',
                    "sPrevious": '<a href="#"><span class="glyphicon glyphicon-triangle-left"></span></a>',
                    "sLast": '<a href="#"><span class="glyphicon glyphicon-step-forward"></span></a>',
                    "sFirst": '<a href="#"><span class="glyphicon glyphicon-step-backward"></span></a>'
                }
            },
            "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
            aoColumns: [
                { mData: "ToName" },
                { mData: "Feedback" },
                {
                    mData: "FeedbackDate", "render": function (data, type, row, meta) {
                        var dt = new Date(data);
                        return formatDate_DMY(dt);
                    }
                },

                {
                    "render": function (data, type, row, meta) {
                        var button = fnGetButtonHTML(row);
                        return button;
                    }
                }
            ]
            ,
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                if ((aData.IsSeen == "0") && (aData.LastFeedbackGivenBy != sessionStorage.EmployeeId)) { // display unread messages in green color
                    $('td', nRow).addClass('UnreadMessage');
                }

            }
        });
    });
}

/*End - Feedback Requested */

//Following function is used to bind the Feed back received from other (peers/collecgues) list for employee (_FeedbackRequestPending.cshtml)
function fnBindFeebackRequestPendingList() {

    var selectedyear = getFeedbackSelectedYear();
    var empId = sessionStorage.EmployeeId;
    var apraisalCycleId = getFeedbackAppraisalCycleId();
    var token = sessionStorage.TokenValue;
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue,
        "X-EmpNo": empId
    };

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Feedback?AppraisalCycleId=" + apraisalCycleId + "&ToEmployeeId=" + empId + "&FromEmployeeId=0&ActionTypeId=3&SelectedYear=" + selectedyear;

    FeedbackAsyncGET(apiPath).done(function (feedbackData) {
        var $tblPend = $('#tblFeedbackRequestPending');
        $tblPend.find('thead').show();
        var colCountPend = $tblPend.find('thead tr th').length || 6;
        if ($.fn.DataTable.isDataTable($tblPend)) {
            try { $tblPend.DataTable().destroy(); } catch (exP) { }
        }
        $tblPend.find('tbody').empty();
        if (feedbackData && feedbackData.Success === false) {
            if (feedbackData.ErrorCode !== "NotFound" && feedbackData.ErrorCode !== "Not Found") {
                console.log("BindFeebackRequestPendingList" + feedbackData.ErrorCode + ' ' + feedbackData.ErrorMessage);
            }
        }
        var rowsPend = feedbackGetRowsForDataTable(feedbackData);
        if (!rowsPend.length) {
            showNoDataMessage('#tblFeedbackRequestPending', colCountPend);
            return;
        }

        $tblPend.DataTable({
            data: rowsPend,
            destroy: true,
            "bPaginate": true,
            "bFilter": true,
            "bInfo": false,
            "sPaginationType": "full_numbers",
            "iDisplayLength": 10,
            "bLengthChange": false,
            "oLanguage": {
                "oPaginate": {
                    "sNext": '<a href="#"><span class="glyphicon glyphicon-triangle-right"></span></a>',
                    "sPrevious": '<a href="#"><span class="glyphicon glyphicon-triangle-left"></span></a>',
                    "sLast": '<a href="#"><span class="glyphicon glyphicon-step-forward"></span></a>',
                    "sFirst": '<a href="#"><span class="glyphicon glyphicon-step-backward"></span></a>'
                }
            },
            "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
            aoColumns: [
                { mData: "FromName" },
                { mData: "Feedback" },

                {
                    mData: "FeedbackDate", "render": function (data, type, row, meta) {
                        var dt = new Date(data);
                        return formatDate_DMY(dt);
                    },
                    "sWidth": "15%"
                },
                {
                    "render": function (data, type, row, meta) {
                        var button = fnGetButtonHTML(row);
                        return button;
                    }
                },
                {
                    "render": function (data, type, row, meta) {
                        var btn = fnRenderIgnoreButton(row);
                        return btn;
                    }
                }
            ]
            ,
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                if ((aData.IsSeen == "0") && (aData.LastFeedbackGivenBy != sessionStorage.EmployeeId)) { // display unread messages in green color
                    $('td', nRow).addClass('UnreadMessage');
                }

            }
        });
    });
}

/*End - Feedback Requested */
/** Escape dynamic text for double-quoted HTML attributes (prevents broken View button when Feedback contains HTML with quotes). */
function fnEscapeHtmlAttr(val) {
    if (val === null || val === undefined) return '';
    return String(val)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function fnGetButtonHTML(row) {
    if (row != undefined) {

        var feedbackId = 0;
        var fromEmpId = 0;
        var fromEmpName = '';
        var toEmpId = 0;
        var toEmpName = '';
        var feedback = '';

        feedbackId = row.FeedBackId;
        fromEmpId = row.FromEmployeeId;
        toEmpId = row.ToEmployeeId;
        feedback = row.Feedback;
        // Thread root for modal / replies: use parent when this row is a child, else this row's id (original feedback has no parent)
        var threadRootFeedbackId = (row.ParentFeedBackId != null && row.ParentFeedBackId > 0) ? row.ParentFeedBackId : row.FeedBackId;

        switch (row.AreaID) {
            case 1:
            case 2:
                fromEmpName = row.FromEmployeeName;
                toEmpName = row.ToEmployeeName;
                break;
            default:
                fromEmpName = row.FromName;
                toEmpName = row.ToName;
        }

        return '<button type="button" class="btn btn-warning btn-xs btn-round" ' +
            'data-feedbackid="' + feedbackId + '" ' +
            'data-fromempid="' + fromEmpId + '" data-fromempname="' + fnEscapeHtmlAttr(fromEmpName) + '" ' +
            'data-toempid="' + toEmpId + '" data-toempname="' + fnEscapeHtmlAttr(toEmpName) + '" ' +
            'data-feedback="' + fnEscapeHtmlAttr(feedback) + '" ' +
            'data-parentfeedbackid="' + threadRootFeedbackId + '" ' +
            'onclick="fnShowFeedbackModal(this);"><span class="glyphicon glyphicon-eye-open"></span></button>';
    }
}

function fnRenderIgnoreButton(row) {
    if (row != undefined) {

        var feedbackId = 0;
        feedbackId = row.FeedBackId

        return '<button type="button" class="btn btn-primary btn-xs hide" ' +
            'data-feedbackid="' + feedbackId + '" ' +
            'onclick="fnIgnoreFeedback(this);">Ignore</button>';
    }
}

function fnShowFeedbackModal(objButton) {
    $(objButton.parentElement).siblings().removeClass('UnreadMessage');
    var url = $('#feedbackModal').data('url');
    var selectedTab = $("#hdnSelectedFeedbackTab").val();
    $.get(url, function (data) {
        $('#feedbackContent').html(data);

        $("#txtFeedback").val($(objButton).attr('data-feedback'));
        $("#hdnParentFeedbackId").val($(objButton).attr('data-parentfeedbackid'));

        switch (selectedTab) {
            case '':
            case "":
            case "#tab_myfeedback":
                $("#dvFrom").show();
                $("#dvFeedback").hide();
                $("#spnFeedBackFrom").text($(objButton).attr('data-fromEmpName'));
                $("#spnFeedBackTo").text($(objButton).attr('data-toempname'));
                $("#hdnFromEmpId").val($(objButton).attr('data-fromempid'));
                break;
            case "#tab_feedbackgiven":

            case "#tab_feedbackrequested":
                $("#dvFrom").show();
                $("#dvFeedback").hide();
                $("#spnFeedBackFrom").text($(objButton).attr('data-fromEmpName'));
                $("#spnFeedBackTo").text($(objButton).attr('data-toempname'));
                $("#hdnFromEmpId").val($(objButton).attr('data-fromempid'));
                break;
            case "#tab_feedbackpending":
                $("#dvFrom").show();
                $("#dvFeedback").hide();
                $("#spnFeedBackFrom").text($(objButton).attr('data-fromEmpName'));
                $("#spnFeedBackTo").text($(objButton).attr('data-toempname'));
                $("#hdnFromEmpId").val($(objButton).attr('data-fromempid'));
                break;
        }

        //if ((selectedTab == "#tab_feedbackpending") || (selectedTab == "#tab_feedbackrequested")) {

        fnFillFeedbackTrail();

        var Count = $("#divNotification").html();
        Count = Count - 1;
        if (Count > 0) {
            $("#divNotification").show();
        }
        else {
            $("#divNotification").hide();
        }
        $("#divNotification").html(Count);
        $('#feedbackModal').modal({
            show: true,
            keyboard: false,
            backdrop: 'static'
        });

        fnLimitFeedbackText();
    });
}

function fnIgnoreFeedback(objButton) {

    //console.log($(objButton).attr('data-feedbackid'));

    var empId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue,
        "X-EmpNo": empId
    };


    var FeedbackId = $(objButton).attr('data-feedbackid');
    var UserId = empId;

    var svrPath = CONFIG.get('SERVERNAME');
    var webAPIURL = svrPath + 'Feedback?FeedbackId=' + FeedbackId + "&UserId=" + UserId;

    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: webAPIURL,
        dataType: "json",
        headers: headerInfo,
        success: function (data) {

            if (data.Success == false) {
                return false;
            }
            $("#tblFeedbackRequestPending").DataTable().clear().draw();
            $("#tblFeedbackRequestPending").DataTable().destroy();
            fnBindFeebackRequestPendingList();
        },
        error: function (result) {

            console.log("Error.. in fnIgnoreFeedback()");
        }
    });
}
function RemoveScript() {

    var txtValue = $('#txtReply').val();
    $('#txtReply').val(txtValue.replace(/[\<\>'=]+/g, ''));
}

//function to send feedback to specified employee

function fnSendFeedback() {


    CheckSessionTimeOut();
    var feedbackText = $("#txtReply").val();
    var toEmployeeId = $("#hdnFromEmpId").val();

    var loggedinUser = sessionStorage.EmployeeId;
    var apprisalCycleId = getFeedbackAppraisalCycleId();
    var token = sessionStorage.TokenValue;

    if (feedbackText.trim() == '') {
        toastr.error('Comment cannot be empty.');
        return false;
    }

    var rawParent = $("#hdnParentFeedbackId").val();
    if (rawParent === undefined || rawParent === null || rawParent === '' || rawParent === 'null' || isNaN(rawParent)) {
        toastr.error('No Parent Feedback id found. Please reopen the conversation from the list.');
        return false;
    }
    var parentfeedbackid = parseInt(rawParent, 10);
    if (parentfeedbackid <= 0) {
        toastr.error('No Parent Feedback id found. Please reopen the conversation from the list.');
        return false;
    }

    var params = "FromEmployeeId=" + loggedinUser + "&ToEmployeeId=" + toEmployeeId + "&AppraisalCycleId=" + apprisalCycleId + "&ActionTypeId=" + 2 +
        "&Feedback=" + feedbackText + "&ParentFeedbackId=" + parentfeedbackid;

    //if (parentfeedbackid != 0) {
    //    params = params + '&ParentFeedbackId=' + parentfeedbackid;
    //}
    var employeefeedbackEntity = {
        AppraisalCycleId: apprisalCycleId,
        FromEmployeeId: loggedinUser,
        ToEmployeeId: toEmployeeId,
        ActionTypeId: 2,  // reply
        Feedback: feedbackText,
        ParentFeedBackId: parseInt(parentfeedbackid, 10)
    };
    var svrPath = CONFIG.get('SERVERNAME');
    var apiURL = svrPath + "Feedback/PostSaveFeedback?" + params;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue,
        "X-EmpNo": loggedinUser
    };
    $.ajax({
        url: apiURL,
        type: 'POST',
        data: JSON.stringify(employeefeedbackEntity),
        async: true,
        dataType: 'json',
        contentType: 'application/json',
        headers: CommonGetHeaderInfo(),
        success: function (result) {
            data = result;
            if (!result || result.Success !== true) {
                toastr.error((result && result.ErrorMessage) ? result.ErrorMessage : 'Could not save your reply.');
                return;
            }
            $('#feedbackModal, #feedbackModalNotification').modal('hide');
            $('#txtReply').val('');
            toastr.success('Your reply was sent successfully.');
            if (typeof fnBindFeebackGivenKRAList === 'function' && $('#tblFeedbackGivenKRA').length && $('#ddlPreviousRMs').length) {
                var prevRm = $('#ddlPreviousRMs').val();
                if (prevRm && prevRm !== '0') { fnBindFeebackGivenKRAList(); }
            }

            // Email notification on reply disabled — mail content was inaccurate
        },
        complete: function (xhr, statusText) {

            if (data === null || data === "") {
                data = {
                    "statusCode": xhr.status, "statusText": statusText
                };
            }
        },
        error: function (xhr, statusText, errorThrown) {
            toastr.error('Error while requesting/sending feedback....');
            data = {
                "statusCode": xhr.status, "statusText": statusText, "error": "error"
            };
        }
    });
    //$.ajax({
    //    type: "POST",
    //    url: apiURL,
    //    cache: false,
    //    datatype: "application/json",
    //    headers: headerInfo,
    //    success: function (result) {

    //        data = result;
    //        $('#feedbackModal').modal('hide');
    //        alert('Feedback Reply has been given successfully');
    //    },
    //    error: function (xhr, statusText, errorThrown) {

    //        alert('Error while requesting/sending feedback....');
    //        console.log("statusCode : " + xhr.status + "statusText : " + statusText);
    //    }
    //});

}

function fnFillFeedbackTrail() {

    var empId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue,
        "X-EmpNo": empId
    };

    var parentfeedbackid = $("#hdnParentFeedbackId").val();
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Feedback?Id=" + parentfeedbackid + "&list=true";
    var svrPathToUpdate = svrPath + "Feedback?FeedbackId=" + parentfeedbackid + "&ParentId=" + parentfeedbackid + "&UserId=" + empId;

    FeedbackAsyncGET(apiPath).done(function (feedbackData) {

        if (feedbackData.Success == false) {
            console.log("BindFeebackRequestPendingList" + feedbackData.ErrorCode + ' ' + feedbackData.ErrorMessage)
            return false;
        }
        var empCount = 0;
        for (var i = 0; i < feedbackData.Result.employeeFeedbackEntity.data.length; i++) {
            var entry = feedbackData.Result.employeeFeedbackEntity.data[i];
            var dvfeedbackdata = '<div class="col-sm-8 leftbox">';

            if (empId == entry.FromEmployeeId) {
                empCount++;
                dvfeedbackdata = '<div class="col-sm-8 rightbox">';
            }

            var content = entry.Feedback || '';
            if (typeof buildTrainingDisplayHtml === 'function') {
                var trainingHtml = buildTrainingDisplayHtml(entry);
                if (trainingHtml) content += trainingHtml;
            }

            $("#dvFromTo").append(dvfeedbackdata + content + '<span class="name"></span></div>');

            if (empCount == feedbackData.Result.FeedbackLimit) {
                $("#dvSendReply").hide();
            }
        }
    });

    // Only make PUT request if we have valid feedback IDs
    if (parentfeedbackid && parentfeedbackid > 0 && empId && empId > 0) {
        $.ajax({
            type: "POST", // Changed from PUT to POST since controller uses [HttpPost]
            url: svrPathToUpdate,
            cache: false,
            dataType: "json",
            headers: headerInfo,
            success: function (result) {
                data = result;
                //alert('Feedback given successfully');
            },
            error: function (xhr, statusText, errorThrown) {
                // Only log if it's not a 404 (not found) or if it's a real error
                if (xhr.status !== 404 && xhr.status !== 405) {
                    console.error("Error updating feedback seen status - statusCode: " + xhr.status + ", statusText: " + statusText);
                }
                // Silently handle 404/405 as they may be expected in some cases
            }
        });
    }
}

//added by garima
function fnBindDelegators() {

    // $("#ddlDelegators option").remove();
    //$("#ddlDelegators").append($("<option></option>").val('0').html('---Select---'));


    //var AppraisalCycleId = sessionStorage.AppraisalCycleId;
    //var EmployeeGradeID = 0;
    //var AreaID = 1;

    var empId = sessionStorage.EmployeeId;
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "/ManagerFeedback/GetDelegators?ManagerId=" + empId;

    FeedbackAsyncGET(apiPath).done(function (res) {
        if (res && res.Success === true && res.Result) {
            var data = res.Result;
        $.each(data, function (index, value) {
            $("#ddlDelegators").append($("<option></option>").val((data[index].EmployeeId)).html(data[index].EmployeeName));
            });
    }
    });
}

//added by garima 25-10-2018
function fnBindEmployees() {

    $("#ddlEmployees option").remove();
    $("#ddlEmployees").append($("<option></option>").val('0').html('---Select---'));
    //var AppraisalCycleId = sessionStorage.AppraisalCycleId;
    //var EmployeeGradeID = 0;
    //var AreaID = 1;

    var empId = $("#ddlDelegators option:selected").val();
    var MgrempId = sessionStorage.EmployeeId;
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "/ManagerFeedback/GetEmployees?DelegatorId=" + empId + "&ManagerId=" + MgrempId;

    FeedbackAsyncGET(apiPath).done(function (res) {
        if (res && res.Success === true && res.Result) {
            var data = res.Result;
        $.each(data, function (index, value) {
            $("#ddlEmployees").append($("<option></option>").val((data[index].EmployeeId)).html(data[index].EmployeeName));
            });
    }
    });
}

setTimeout(function () {

    $("#feedbackTabsSkipLevel li.active").find("a").each(function () {
        if ($(this).attr("href") == "#tab_a") {
            // fnBindFeebackGivenSKIPLEVELCompetencyList();
            fnBindFeebackGivenbySkipLevelManager();

        }
        else {
            fnBindFeebackGivenSKIPLEVELKRAList();
        }
    });

    $("#feedbackTabs li.active").find("a").each(function () {
        //  if ($(this).attr("href") === "#tab_myfeedback") {


        //if (target1 === "#tab_myfeedback") {
        if ($(this).attr("href") == "#tab_myfeedback") {
            fnBindMyFeebackKRAList();
            fnBindMySelfAssessment();
            // fnBindMyFeebackCompetencyList();
            fnBindMyFeebackOtherList();
        }
        //else if (target1 === "#tab_feedbackgiven") {

        else if ($(this).attr("href") == "#tab_feedbackgiven") {

            if ((sessionStorage.EmployeeRoleId != 1)) {
                fnBindFeebackGivenKRAList(0);
                // fnBindFeebackGivenCompetencyList();

                //Commented for hide behavioural competencies start
                //$('#pnlCompetencyFeedbackGiven').show();
                //Commented for hide behavioural competencies end

                $('#pnlKRAFeedbackGiven').show();
            }
            else {
                //Commented for hide behavioural competencies start
                //$('#pnlCompetencyFeedbackGiven').hide();
                //Commented for hide behavioural competencies end

                $('#pnlKRAFeedbackGiven').hide();
            }
            fnBindFeebackGivenOtherList();
        }
        //else if (target1 === "#tab_feedbackrequested") {

        else if ($(this).attr("href") == "#tab_myselfassessment") {
            fnBindMySelfAssessment();
        }
        else if ($(this).attr("href") == "#tab_feedbackrequested") {
            fnBindFeebackRequestedList();
        }
        else if ($(this).attr("href") == "#tab_feedbackpending") {
            fnBindFeebackRequestPendingList();
        }

    })


}, 1000)

// --- R&R and Training Status for GiveManagerFeedback page ---
$(document).ready(function () {
    $('#modalRRAndTraining').on('shown.bs.modal', function () {
        $('#modalRRAndTraining .nav-tabs li').removeClass('active');
        $('#modalRRAndTraining .tab-pane').removeClass('active');

        $('a[href="#tabTrainingStatusGiven"]').parent('li').addClass('active');
        $('#tabTrainingStatusGiven').addClass('active');

        LoadTrainingStatusDataGiven();
    });

    $('a[href="#tabRRGiven"]').on('shown.bs.tab', function () {
        LoadRRDataGiven();
    });

    $('a[href="#tabTrainingStatusGiven"]').on('shown.bs.tab', function () {
        LoadTrainingStatusDataGiven();
    });
});

function getNewEmployeeCodeByIdGiven(employeeId, callback) {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'EmployeeMaster?EmployeeId=' + employeeId;
    var headerInfo = { 'Authorization': 'Bearer ' + sessionStorage.TokenValue, 'X-EmpNo': sessionStorage.EmployeeId };

    CommonAjaxGET(apiPath, headerInfo).done(function (data) {
        if (data && data.Success && data.Result && data.Result.NewEmployeeCode) {
            callback(data.Result.NewEmployeeCode);
        } else {
            callback(null);
        }
    }).fail(function () {
        callback(null);
    });
}

function LoadRRDataGiven() {
    try {
        var appraisalCycleId = sessionStorage.AppraisalCycleId || ddlAppCycleId || 0;
        var employeeId = GToEmployeeId;

        if (!employeeId || employeeId === 0) {
            $('#tblRRListGiven tbody').html('<tr><td colspan="4" style="text-align:center; padding:20px;">Employee ID not available.</td></tr>');
            return;
        }

        $('#tblRRListGiven tbody').html('<tr><td colspan="4" style="text-align:center; padding:20px;">Loading...</td></tr>');

        getNewEmployeeCodeByIdGiven(employeeId, function (newEmployeeCode) {
            if (!newEmployeeCode) {
                $('#tblRRListGiven tbody').html('<tr><td colspan="4" style="text-align:center; padding:20px;">Employee code not available.</td></tr>');
                return;
            }

            var svrPath = CONFIG.get('SERVERNAME');
            var headerInfo = { 'Authorization': 'Bearer ' + sessionStorage.TokenValue, 'X-EmpNo': sessionStorage.EmployeeId };
            var apiPath = svrPath + 'Rating/GetEmployeeAspireAwards?NewEmployeeCode=' + encodeURIComponent(newEmployeeCode) + '&AppraisalCycleId=' + appraisalCycleId;

            CommonAjaxGET(apiPath, headerInfo).done(function (data) {
                if ($.fn.DataTable.isDataTable('#tblRRListGiven')) {
                    $('#tblRRListGiven').DataTable().destroy();
                }
                $('#tblRRListGiven tbody').empty();

                var tableData = [];
                if (data && data.Success && data.Result && data.Result.length > 0) {
                    $.each(data.Result, function (index, item) {
                        tableData.push([
                            (index + 1),
                            (item.AwardName || 'N/A'),
                            (item.AwardType || 'N/A'),
                            (item.Month && item.Year ? item.Month + ' ' + item.Year : 'N/A')
                        ]);
                    });
                }

                if (tableData.length > 0) {
                    $('#tblRRListGiven').DataTable({
                        data: tableData,
                        destroy: true,
                        paging: true,
                        searching: true,
                        ordering: true,
                        info: true,
                        pageLength: 10,
                        columns: [
                            { title: "Sr. No." },
                            { title: "Award Name" },
                            { title: "Award Type" },
                            { title: "Award Date" }
                        ]
                    });
                } else {
                    $('#tblRRListGiven tbody').html('<tr><td colspan="4" style="text-align:center; padding:20px;">No Recognition Received</td></tr>');
                }
            }).fail(function (error) {
                console.error('Error loading R&R data:', error);
                $('#tblRRListGiven tbody').html('<tr><td colspan="4" style="text-align:center; padding:20px; color:red;">Error loading data. Please try again.</td></tr>');
            });
        });
    } catch (error) {
        console.error('Error in LoadRRDataGiven:', error);
        $('#tblRRListGiven tbody').html('<tr><td colspan="4" style="text-align:center; padding:20px; color:red;">Error loading data</td></tr>');
    }
}

function LoadTrainingStatusDataGiven() {
    try {

        var selectedyear = getFeedbackSelectedYear();
        //var appraisalCycleId = sessionStorage.AppraisalCycleId || ddlAppCycleId || 0;
        var appraisalCycleId = selectedyear || 0;
        var employeeId = GToEmployeeId;

        if (!appraisalCycleId || appraisalCycleId === 0) {
            $('#tblTrainingStatusListGiven tbody').html('<tr><td colspan="7" style="text-align:center; padding:20px;">Appraisal Cycle not available</td></tr>');
            return;
        }

        if (!employeeId || employeeId === 0) {
            $('#tblTrainingStatusListGiven tbody').html('<tr><td colspan="7" style="text-align:center; padding:20px;">Employee ID not available.</td></tr>');
            return;
        }

        $('#tblTrainingStatusListGiven tbody').html('<tr><td colspan="7" style="text-align:center; padding:20px;">Loading...</td></tr>');

        getNewEmployeeCodeByIdGiven(employeeId, function (newEmployeeCode) {
            if (!newEmployeeCode) {
                $('#tblTrainingStatusListGiven tbody').html('<tr><td colspan="7" style="text-align:center; padding:20px;">Employee code not available.</td></tr>');
                return;
            }

            var svrPath = CONFIG.get('SERVERNAME');
            var headerInfo = { 'Authorization': 'Bearer ' + sessionStorage.TokenValue, 'X-EmpNo': sessionStorage.EmployeeId };
            var apiPath = svrPath + 'Reports/GetTrainingStatusFromDailyTrainingsData?AppraisalCycleId=' + appraisalCycleId + '&NewEmployeeCode=' + encodeURIComponent(newEmployeeCode);

            CommonAjaxGET(apiPath, headerInfo).done(function (data) {
                var trainingData = null;
                if (data && data.responseJSON) {
                    if (data.responseJSON.Result && Array.isArray(data.responseJSON.Result)) {
                        trainingData = data.responseJSON.Result;
                    } else if (data.responseJSON.Result && data.responseJSON.Result.data && Array.isArray(data.responseJSON.Result.data)) {
                        trainingData = data.responseJSON.Result.data;
                    }
                } else if (data && data.Result && Array.isArray(data.Result)) {
                    trainingData = data.Result;
                } else if (Array.isArray(data)) {
                    trainingData = data;
                }

                if ($.fn.DataTable.isDataTable('#tblTrainingStatusListGiven')) {
                    $('#tblTrainingStatusListGiven').DataTable().destroy();
                }
                $('#tblTrainingStatusListGiven tbody').empty();

                var tableData = [];
                if (trainingData && trainingData.length > 0) {
                    $.each(trainingData, function (index, item) {
                        var progressPercentage = 'N/A';
                        if (item.ProgressPercentage !== null && item.ProgressPercentage !== undefined && item.ProgressPercentage !== '') {
                            var progressValue = item.ProgressPercentage.toString().trim();
                            if (progressValue.endsWith('%')) {
                                progressValue = progressValue.substring(0, progressValue.length - 1);
                            }
                            if (progressValue !== '' && !isNaN(progressValue)) {
                                var numValue = parseFloat(progressValue);
                                if (numValue >= 0 && numValue <= 100) {
                                    progressPercentage = numValue + '%';
                                } else {
                                    progressPercentage = item.ProgressPercentage.toString();
                                }
                            } else if (progressValue === '0' || progressValue === 0) {
                                progressPercentage = '0%';
                            } else {
                                progressPercentage = item.ProgressPercentage.toString();
                            }
                        }

                        var learningStatus = item.LearningStatus || item.Status || 'N/A';

                        var createdDate = 'N/A';
                        if (item.CreatedDate && item.CreatedDate !== 'N/A' && item.CreatedDate !== '') {
                            try {
                                var createdDateObj = new Date(item.CreatedDate);
                                if (!isNaN(createdDateObj.getTime())) {
                                    createdDate = formatDate_DMY(createdDateObj);
                                } else {
                                    createdDate = item.CreatedDate;
                                }
                            } catch (e) {
                                createdDate = item.CreatedDate;
                            }
                        }

                        var completionDate = '-';
                        if (item.CompletionDate && item.CompletionDate !== '' && item.CompletionDate !== 'N/A') {
                            try {
                                var completionDateObj = new Date(item.CompletionDate);
                                if (!isNaN(completionDateObj.getTime())) {
                                    completionDate = formatDate_DMY(completionDateObj);
                                } else {
                                    completionDate = item.CompletionDate;
                                }
                            } catch (e2) {
                                completionDate = item.CompletionDate;
                            }
                        }

                        tableData.push([
                            (item.TrainingType || 'N/A'),
                            (item.TrainingName || 'N/A'),
                            progressPercentage,
                            learningStatus,
                            (item.RequestedBy || 'N/A'),
                            createdDate,
                            completionDate
                        ]);
                    });
                }

                if (tableData.length > 0) {
                    $('#tblTrainingStatusListGiven').DataTable({
                        data: tableData,
                        destroy: true,
                        paging: true,
                        searching: true,
                        ordering: true,
                        info: true,
                        pageLength: 10,
                        columns: [
                            { title: "Training Type" },
                            { title: "Training Name" },
                            { title: "Progress Percentage" },
                            { title: "Learning Status" },
                            { title: "Requested From" },
                            { title: "Created Date" },
                            { title: "Completion Date" }
                        ]
                    });
                } else {
                    $('#tblTrainingStatusListGiven tbody').html('<tr><td colspan="7" style="text-align:center; padding:20px;">No training data available</td></tr>');
                }
            }).fail(function (error) {
                console.error('Error loading Training Status data:', error);
                $('#tblTrainingStatusListGiven tbody').html('<tr><td colspan="7" style="text-align:center; padding:20px; color:red;">Error loading data. Please try again.</td></tr>');
            });
        });
    } catch (error) {
        console.error('Error in LoadTrainingStatusDataGiven:', error);
        $('#tblTrainingStatusListGiven tbody').html('<tr><td colspan="7" style="text-align:center; padding:20px; color:red;">Error loading data</td></tr>');
    }
}