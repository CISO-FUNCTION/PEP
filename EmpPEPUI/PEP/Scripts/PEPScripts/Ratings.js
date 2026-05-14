///*const { sessionstorage } = require("modernizr");*/

//const { truncate } = require("node:fs/promises");

if (typeof getRatingPagesAppraisalCycleId !== 'function') {
    console.error('[PEP] RatingAppraisalCycleContext.js must load before Ratings.js; using sessionStorage.AppraisalCycleId only.');
    window.getRatingPagesAppraisalCycleId = function () { return sessionStorage.AppraisalCycleId; };
}

var ddlAppCycle = '';
var BE = 0, ME = 0, EE = 0, EE1 = 0;
var MBE = 0, MME = 0, MEE = 0, MEE1 = 0;
var FBE = 0, FME = 0, FEE = 0, FEE1 = 0;

var BE_STab = 0, ME_STab = 0, EE_STab = 0, EE1_STab = 0;
var MBE_STab = 0, MME_STab = 0, MEE_STab = 0, MEE1_STab = 0;
var FBE_STab = 0, FME_STab = 0, FEE_STab = 0, FEE1_STab = 0;

var BtndraftVisible = true;

var Referbackdone = false;
var HistoryVisible = true;

var BE_STab_PNorm = 0, ME_STab_PNorm = 0, EE_STab_PNorm = 0, EE1_STab_PNorm = 0;
var MBE_STab_PNorm = 0, MME_STab_PNorm = 0, MEE_STab_PNorm = 0, MEE1_STab_PNorm = 0;
var FBE_STab_PNorm = 0, FME_STab_PNorm = 0, FEE_STab_PNorm = 0, FEE1_STab_PNorm = 0;


var ShowGenderLocation = [];
ShowGenderLocation = ['1', '2', '4', '5', '9', '10', '11', '15', '16', '23'];


var EnableRoleId = 0;
var RecoDesig = false;
var rawData = [];
var rawDataOverallNorm = [];

var rawDataOverallNormStudio = [];

var rawDataOverallpractice = [];

var notgiven = 0;
var notgiven_PNorm = 0;

var data = [];
var TotalSpan = 0;
var TotalSpan_PNorm = 0;

var notUpdatedData = [];
var approvedReportees = [];
var gradeList = [];
var btnvisibleFlag = 0;
var DraftbtnvisibleFlag = 0;
var ReporteesSpanCountForReferback = 0;

var GlobalTotalGiven = 0;
var GlobalTotalNotGiven = 0;


var GlobalTotalGiven_PNorm = 0;
var GlobalTotalNotGiven_PNorm = 0;

var BtnUpdatetext = 'Update';

var ReferBackbtnvisibleFlag = 1;

var clickedDDLGroupAccount = '';
var TotalReporteesSpanCount = 0;
var ButtonCheck = 0;
var GlobalRowStaus = 0;
var globalRatingArrayForReferback = [];
var RecordsCountPerPage = 100;
//var dictGrade = {};
//var sortedGradeKeys;

var rawDataOverallPromotion = [];
var dictGroupAccount = {};

var IsRatingGiventoEmployees = 0;
var IsCurrentRatingGivenStatus = 0;
var currentAppraisalCycleId = 0;
// Store cycle information for dynamic table headers
var cycleInfo = {
    current: { AppraisalCycleId: 0, ShortFYName: '' },
    prev1: { AppraisalCycleId: 0, ShortFYName: '' },
    prev2: { AppraisalCycleId: 0, ShortFYName: '' }
};
var OBE = 0, OME = 0, OEE = 0, OEE1 = 0;

var dictCurrentPageState = {};
var clickedDDLReporteeValue = '';
var clickedDDLGradeValue = '';
var clickedDDLLocationValue = '';

var clickedEmployeeStatusDDLValue = '';
var clickedDDLgenderValue = '';
var clickedDDLPromotionValue = '';
var clickedDDLCriticalityPriorityValue = '';
/** Sentinel value for Criticality Priority filter = employees with no criticality priority recorded */
var NOT_CRITICAL_PRIORITY_FILTER_VALUE = '__NOT_CRITICAL__';
/** After clicking filtersDiv, apply this rating-band filter once BindReporteeRatings finishes refetch */
var _pendingTblEmpRatingBandFilter = null;
/** True while #ddlRole change is running its full reload — child AJAX must not hide the page loader until all finish */
var _ratingsRoleChangeBulkLoad = false;

function showRatingsPageLoadingOverlay() {
    $('.loader-div').show();
    if ($('#loading-overlay').length) {
        $('#loading-overlay').show();
    }
}

function hideRatingsPageLoadingOverlay() {
    $('.loader-div').hide();
    if ($('#loading-overlay').length) {
        $('#loading-overlay').hide();
    }
}

function hideRatingsPageLoaderIfNotRoleBulk() {
    if (_ratingsRoleChangeBulkLoad) {
        return;
    }
    hideRatingsPageLoadingOverlay();
}
var searchValue = '';
var eventSource = '';

function getFiltersDropCriticalitySelect() {
    var $f = $('#filtersDropDiv select#ddlCriticalityPriority');
    return $f.length ? $f : $();
}

function parseCriticalityFilterForRequest($crit) {
    var empty = {
        criticalityPriorityIdParam: '',
        applyClientNotCriticalFilter: false,
        applyClientCriticalityUnion: false,
        unionPriorityIds: [],
        includeNotCriticalInUnion: false,
        skipClientCriticalityFiltering: false
    };
    if (!$crit || !$crit.length) {
        return empty;
    }
    var vals = $crit.val() || [];
    if (!Array.isArray(vals)) {
        vals = vals ? [vals] : [];
    }
    vals = vals.filter(function (v) {
        if (v === null || v === undefined) {
            return false;
        }
        var s = String(v);
        if (s === '') {
            return false;
        }
        if (s.toLowerCase().indexOf('multiselect-all') !== -1) {
            return false;
        }
        return true;
    });
    if (vals.length === 0) {
        return empty;
    }

    var nc = NOT_CRITICAL_PRIORITY_FILTER_VALUE;
    var allValues = [];
    $crit.find('option').each(function () {
        var v = $(this).attr('value');
        if (v !== undefined && v !== null && String(v) !== '' && String(v).toLowerCase().indexOf('multiselect-all') === -1) {
            allValues.push(String(v));
        }
    });

    var selectedSet = {};
    for (var si = 0; si < vals.length; si++) {
        selectedSet[String(vals[si])] = true;
    }

    var allOptionsSelected = allValues.length > 0;
    if (allOptionsSelected) {
        for (var aj = 0; aj < allValues.length; aj++) {
            if (!selectedSet[allValues[aj]]) {
                allOptionsSelected = false;
                break;
            }
        }
    } else {
        allOptionsSelected = false;
    }

    if (allOptionsSelected) {
        return {
            criticalityPriorityIdParam: '',
            applyClientNotCriticalFilter: false,
            applyClientCriticalityUnion: false,
            unionPriorityIds: [],
            includeNotCriticalInUnion: false,
            skipClientCriticalityFiltering: true
        };
    }

    var notCriticalChosen = selectedSet[nc] === true;
    var ids = vals.filter(function (v) { return String(v) !== nc; });

    if (notCriticalChosen && ids.length === 0) {
        return {
            criticalityPriorityIdParam: '',
            applyClientNotCriticalFilter: true,
            applyClientCriticalityUnion: false,
            unionPriorityIds: [],
            includeNotCriticalInUnion: false,
            skipClientCriticalityFiltering: false
        };
    }

    if (!notCriticalChosen && ids.length > 0) {
        return {
            criticalityPriorityIdParam: ids.map(function (x) { return String(x); }).join(','),
            applyClientNotCriticalFilter: false,
            applyClientCriticalityUnion: false,
            unionPriorityIds: [],
            includeNotCriticalInUnion: false,
            skipClientCriticalityFiltering: false
        };
    }

    if (notCriticalChosen && ids.length > 0) {
        return {
            criticalityPriorityIdParam: '',
            applyClientNotCriticalFilter: false,
            applyClientCriticalityUnion: true,
            unionPriorityIds: ids.map(function (x) { return String(x); }),
            includeNotCriticalInUnion: true,
            skipClientCriticalityFiltering: false
        };
    }

    return empty;
}

/** Norm/Promo multiselect: comma-separated priority IDs for SQL; include "__NOT_CRITICAL__" in the list for rows with no priority. */
function buildCriticalityApiPayloadFromNormPromoMultiselect($ddl) {
    var empty = { criticalityPriorityIds: '' };
    if (!$ddl || !$ddl.length) {
        return empty;
    }
    var vals = $ddl.val() || [];
    if (!Array.isArray(vals)) {
        vals = vals ? [vals] : [];
    }
    vals = vals.filter(function (v) {
        if (v === null || v === undefined) {
            return false;
        }
        var s = String(v);
        if (s === '') {
            return false;
        }
        if (s.toLowerCase().indexOf('multiselect-all') !== -1) {
            return false;
        }
        return true;
    });
    if (vals.length === 0) {
        return empty;
    }
    var nc = NOT_CRITICAL_PRIORITY_FILTER_VALUE;
    var allValues = [];
    $ddl.find('option').each(function () {
        var v = $(this).attr('value');
        if (v !== undefined && v !== null && String(v) !== '' && String(v).toLowerCase().indexOf('multiselect-all') === -1) {
            allValues.push(String(v));
        }
    });
    var selectedSet = {};
    for (var si = 0; si < vals.length; si++) {
        selectedSet[String(vals[si])] = true;
    }
    var allOptionsSelected = allValues.length > 0;
    if (allOptionsSelected) {
        for (var aj = 0; aj < allValues.length; aj++) {
            if (!selectedSet[allValues[aj]]) {
                allOptionsSelected = false;
                break;
            }
        }
    } else {
        allOptionsSelected = false;
    }
    if (allOptionsSelected) {
        return empty;
    }
    var notCriticalChosen = selectedSet[nc] === true;
    var idParts = vals.filter(function (v) { return String(v) !== nc; }).map(function (x) { return String(x); });
    if (notCriticalChosen) {
        idParts.push(nc);
    }
    return { criticalityPriorityIds: idParts.join(',') };
}

/** Map filter-bar parse result to SQL API (CriticalityPriorityId CSV; "__NOT_CRITICAL__" = not set). */
function criticalityFilterParsedToApiPayload(parsed) {
    var nc = NOT_CRITICAL_PRIORITY_FILTER_VALUE;
    if (!parsed) {
        return { criticalityPriorityIds: '' };
    }
    if (parsed.skipClientCriticalityFiltering) {
        return { criticalityPriorityIds: '' };
    }
    if (parsed.applyClientNotCriticalFilter) {
        return { criticalityPriorityIds: nc };
    }
    if (parsed.applyClientCriticalityUnion) {
        var u = (parsed.unionPriorityIds || []).map(function (x) { return String(x); });
        if (parsed.includeNotCriticalInUnion) {
            u.push(nc);
        }
        return { criticalityPriorityIds: u.join(',') };
    }
    return {
        criticalityPriorityIds: parsed.criticalityPriorityIdParam || ''
    };
}

function rowIsNotCriticalForFilter(r) {
    var p = r.CriticalityPriority;
    var pt = r.CriticalityPriorityDisplayText;
    var emptyP = p == null || String(p).trim() === '';
    var emptyPt = pt == null || String(pt).trim() === '';
    return emptyP && emptyPt;
}

/**
 * Match row to a Criticality Priority chosen in the filter (master Id string).
 * Rows may store CriticalityPriority as Id, or legacy P1/P2/P3 text — same as SQL CM_Priority join.
 */
function rowMatchesSelectedPriorityFilter(row, selectedIdStr) {
    var sid = String(selectedIdStr).trim();
    if (!sid) {
        return false;
    }
    var pid = row.CriticalityPriority != null ? String(row.CriticalityPriority).trim() : '';
    if (pid === sid) {
        return true;
    }
    var map = window._criticalityPriorityIdToDisplayText || {};
    var disp = map[sid];
    var rDisp = row.CriticalityPriorityDisplayText != null ? String(row.CriticalityPriorityDisplayText).trim() : '';
    if (disp && rDisp) {
        if (rDisp === disp || rDisp.indexOf(disp) !== -1) {
            return true;
        }
    }
    if (disp && pid) {
        var dU = disp.toUpperCase();
        var pU = pid.toUpperCase();
        if ((dU.indexOf('P1') !== -1 || dU.indexOf('(P1') !== -1) && pU === 'P1') {
            return true;
        }
        if ((dU.indexOf('P2') !== -1 || dU.indexOf('(P2') !== -1) && pU === 'P2') {
            return true;
        }
        if ((dU.indexOf('P3') !== -1 || dU.indexOf('(P3') !== -1) && pU === 'P3') {
            return true;
        }
    }
    return false;
}

function filterRawDataToNotCritical(rows) {
    if (!rows || !rows.length) {
        return rows;
    }
    return rows.filter(function (r) {
        return rowIsNotCriticalForFilter(r);
    });
}

function filterRawDataCriticalityUnion(rows, priorityIds, includeNotCritical) {
    if (!rows || !rows.length) {
        return rows;
    }
    var out = [];
    var seen = {};
    for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        var eid = r.PEPEmployeeId;
        var keep = false;
        if (includeNotCritical && rowIsNotCriticalForFilter(r)) {
            keep = true;
        }
        if (!keep && priorityIds && priorityIds.length) {
            for (var k = 0; k < priorityIds.length; k++) {
                if (rowMatchesSelectedPriorityFilter(r, priorityIds[k])) {
                    keep = true;
                    break;
                }
            }
        }
        if (keep && seen[eid] !== true) {
            seen[eid] = true;
            out.push(r);
        }
    }
    return out;
}

function sliceEmployeesByRatingBand(filerDataSource, filter) {
    var sortedData = [];
    for (var i = 0; i < filerDataSource.length; i++) {
        if (filter === 'All') {
            if (filerDataSource[i].CurrentRating != '0') {
                sortedData.push(filerDataSource[i]);
            }
        } else if (filter === 'Total') {
            sortedData.push(filerDataSource[i]);
        } else if (filter === 'RM') {
            if (filerDataSource[i].RMName == sessionStorage.EmployeeId.trim()) {
                sortedData.push(filerDataSource[i]);
            }
        } else if (filter === '0') {
            if (filerDataSource[i].CurrentRating == '0') {
                sortedData.push(filerDataSource[i]);
            }
        } else {
            if (filerDataSource[i].CurrentRating == filter) {
                sortedData.push(filerDataSource[i]);
            }
        }
    }
    return sortedData;
}

/** Highlight rating-band control in #filtersDiv for tblEmpRatingList. Accepts UI names (BE, ME, …) or codes after filterData (3, 2, 1, 4, 0, All, RM, Total). */
function applyTblEmpRatingBandButtonAnimation(filterOrCode) {
    $('.animation').removeClass('animation');
    var c = filterOrCode;
    if (filterOrCode === 'BE' || filterOrCode === '3') {
        c = '3';
    } else if (filterOrCode === 'ME' || filterOrCode === '2') {
        c = '2';
    } else if (filterOrCode === 'EE' || filterOrCode === '1') {
        c = '1';
    } else if (filterOrCode === 'EE1' || filterOrCode === '4') {
        c = '4';
    } else if (filterOrCode === 'Not' || filterOrCode === '0') {
        c = '0';
    } else if (filterOrCode === 'All') {
        c = 'All';
    } else if (filterOrCode === 'RM') {
        c = 'RM';
    } else if (filterOrCode === 'Total') {
        c = 'Total';
    }

    if (c === '3') {
        $('.filterBE').closest('button').addClass('animation');
    } else if (c === '2') {
        $('.filterME').closest('button').addClass('animation');
    } else if (c === '1') {
        $('.filterEE').closest('button').addClass('animation');
    } else if (c === '4') {
        $('.filterEE1').closest('button').addClass('animation');
    } else if (c === 'All') {
        $('.filterAll').closest('button').addClass('animation');
    } else if (c === '0') {
        $('.filterNot').closest('button').addClass('animation');
    } else if (c === 'RM') {
        $('.RM').closest('button').addClass('animation');
    }
}

var GlobalRatingArray = [];

var GlobalsaveType = [];
var globalcheck;
var globalRowStatus;
var globalfinalSelectedEmployees;


var IsSubmitted = 0;
var IsDesigUploaded = 0;

$(document).ready(function () {

    currentAppraisalCycleId = parseInt(getRatingPagesAppraisalCycleId(), 10) || 0;

    var cycleid = sessionStorage.AppraisalCycleFrom.slice(-2);
    var today = new Date();


    BindRole();
    updatePrioritisationTextVisibility();
    // BindRoles();
    //  GetConfirmationRatingGivenCount();

    // Delay IsLoginEmployeeSubmittedRating to ensure BindRole has completed
    // This prevents RoleId from being undefined
    setTimeout(function() {
        IsLoginEmployeeSubmittedRating();
    }, 100);
    IsDesignationUploaded();
    var removedOptions = {}; // Move outside event handler to persist values

    $('#tblEmpRatingList').on('change', '.ddlPromoClass', function () {



        var row = $(this).closest('tr');
        var dropdownValue = $(this).val(); // Get selected value

        var rowId = row.index(); // Get row index (unique identifier)
        var $dropdown = row.find(".ddlPromoTrackClass"); // Get corresponding dropdown in the row

        if (dropdownValue == "2" || dropdownValue == "0") {



            // Initialize storage for the row if not already done
            if (!removedOptions[rowId]) {
                removedOptions[rowId] = [];
            }

            // Remove and store options except value "1"
            $dropdown.find("option[value!='1']").each(function () {
                removedOptions[rowId].push($(this).clone()); // Clone and store option
                $(this).remove(); // Remove from dropdown
            });

            // Set dropdown value to "1"
            if ($dropdown.find("option[value='1']").length != 1) {
                $dropdown.append(`<option value="1">NA</option>`);
                $dropdown.val("1");
            }


        }
        else {

            // Restore options if they were removed earlier
            if (removedOptions[rowId] && removedOptions[rowId].length > 0) {
                $.each(removedOptions[rowId], function (index, option) {
                    $dropdown.append(option); // Restore removed options
                });

                $dropdown.find("option[value='1']").remove();

                removedOptions[rowId] = []; // Clear stored options after restoring
            } else {


                var dropdownHtml;

                var hdnGradeLevel = row.find("#hdnGradeLevel"); // Get corresponding dropdown in the row

                //dropdownHtml = `<option value="0">---Select--</option>`;


                //dropdownHtml += `<option value="2">Individual Contributor</option>`;

                if (parseInt(hdnGradeLevel.val()) >= 3) {

                    dropdownHtml = `<option value="0">---Select--</option>`;


                    dropdownHtml += `<option value="2">Individual Contributor</option>`;

                } else {
                    dropdownHtml += `<option value="2">Individual Contributor</option>`;

                }


                if (parseInt(hdnGradeLevel.val()) >= 3) {

                    dropdownHtml += `<option value="3">Management Track</option>`;

                }

                if (parseInt(hdnGradeLevel.val()) >= 5) {


                    dropdownHtml += `<option value="4">Architect Track</option>`;


                }

                $dropdown.append(dropdownHtml);

                $dropdown.find("option[value='1']").remove();

                removedOptions[rowId] = []; // Clear stored options after restoring

            }
        }
    });



    $("#close-filter").click(function () {
        $(".filter-top-sec-item").slideToggle('slow');
        $("#open-filter").show('slow');
        $("#close-filter").hide('slow');
    });
    $("#open-filter").click(function () {
        $(".filter-top-sec-item").slideToggle('slow');
        $("#open-filter").hide('slow');
        $("#close-filter").show('slow');
    });

    $("#close-filterRAR").click(function () {
        $(".filter-top-sec-item").slideToggle('slow');
        $("#open-filterRAR").show('slow');
        $("#close-filterRAR").hide('slow');
    });
    $("#open-filterRAR").click(function () {
        $(".filter-top-sec-item").slideToggle('slow');
        $("#open-filterRAR").hide('slow');
        $("#close-filterRAR").show('slow');
    });


    $("#close-filter1").click(function () {
        $(".filter-top-sec-item1").slideToggle('slow');
        $("#open-filter1").show('slow');
        $("#close-filter1").hide('slow');
    });
    $("#open-filter1").click(function () {
        $(".filter-top-sec-item1").slideToggle('slow');
        $("#open-filter1").hide('slow');
        $("#close-filter1").show('slow');
    });

    $("#close-filter2").click(function () {
        $(".filter-top-sec-item2").slideToggle('slow');
        $("#open-filter2").show('slow');
        $("#close-filter2").hide('slow');
    });
    $("#open-filter2").click(function () {
        $(".filter-top-sec-item2").slideToggle('slow');
        $("#open-filter2").hide('slow');
        $("#close-filter2").show('slow');
    });

    $("#close-filter3").click(function () {
        $(".filter-top-sec-item3").slideToggle('slow');
        $("#open-filter3").show('slow');
        $("#close-filter3").hide('slow');
    });
    $("#open-filter3").click(function () {
        $(".filter-top-sec-item3").slideToggle('slow');
        $("#open-filter3").hide('slow');
        $("#close-filter3").show('slow');
    });

    //$("#close-filter-HRBPAdmin").click(function () {
    //    $(".filter-top-sec-item-HRBPAdmin").hide();
    //});
    //$("#open-filter-HRBPAdmin").click(function () {
    //    $(".filter-top-sec-item-HRBPAdmin").show();
    //});

    //$("#input").fileinput({ showCaption: false, dropZoneEnabled: false });
    //$(window).scroll(function () {

    //    if ($(this).scrollTop() > 50) {
    //        $('.btn-fixedon-scroll').fadeIn();
    //    }
    //    else {
    //        $('.btn-fixedon-scroll').fadeOut();
    //    }
    //});

    // Initialize multiselect only if plugin is loaded
    if (typeof $.fn.multiselect !== 'undefined') {
        $('#ddlgender').multiselect({
            includeSelectAllOption: true,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true,
            maxHeight: 150
        });

        $('#ddlPromotion').multiselect({
            includeSelectAllOption: true,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true,
            maxHeight: 150
        });

        $('#ddlPromotionNorm').multiselect({
            includeSelectAllOption: true,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true,
            maxHeight: 150
        });
    } else {
        console.warn('Multiselect plugin not loaded. Skipping multiselect initialization.');
    }

    $('#ddlgender_RAR').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });


    //  RatingGivenNotGivenDetailForDPandGDL();

    //if (sessionStorage.IsGDL == 1 || sessionStorage.IsDP == 1) {

    //    $('#RatingStatusDetail').css('display', 'inline-block');

    //}
    //else {
    //    $('#RatingStatusDetail').css('display', 'none');
    //}
    //  SetPracticeLeaderTab();

    // BindDirectReportees and ddlReportee refresh are called from BindRole().done() after ddlRole is populated (fixes RoleId null)

    BindGrade();

    BindNormalizationOverallDataOnInstertionScreen();

    //BindNormalizationOverallData();
    //BindNormalizationOverallDataOnInstertionScreen();
    //BindMaleFemaleNormalization();
    //BindGradeNorm();
    
    // Fetch cycle information for dynamic table headers
    FetchCycleInfoForTableHeaders(function() {
    BindReporteeRatings();
    });
    //BellCurve();
    RatingFilterTab();

    BindOverAllPromotionSummary();
    //changeBackgroundColor();

    //BindGradePromo();

    BindOverAllMaleFemalePromotionSummary();




    // Practice View

    // Commented For next Phase

    //if (sessionStorage.IsPracticeLead == "true") {
    //    BindGradePractice();
    //    BindOverAllPromotionSummary_PracticeView();
    //    BindOverAllMaleFemalePromotionSummary_PracticeView();
    //    bindChart_PracticeView();


    //    BindNormalizationOverallData_StudioView();
    //    BindMaleFemaleNormalization_StudioView();
    //    BellCurve_StudioView();
    //}


    //$("#ddlReportee_RAR").val(["-1"]);
    //$("#ddlReportee_RAR").multiselect('refresh');
    // BindApprovedReportee();
    //BindGradeRAR();
    //Bind_ddllocationRAR();
    //BindGroupAccountRAR();
    //ddlEmployeeStatus_RAR();

    //  MyReporteeBellCurve();
    // BellCurve();
    $("#btnSubmitrating").click(function () {

        toastr.clear();
        SaveSubmitRating("submit", 2);

    });
    $("#input").on("change", function (e) {

        var file = e.target.files[0];
        // input canceled, return
        if (!file) return;

        var FR = new FileReader();
        FR.onload = function (e) {
            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, { type: 'array' });
            var firstSheet = workbook.Sheets[workbook.SheetNames[0]];

            // header: 1 instructs xlsx to create an 'array of arrays'
            resultJson = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            // data preview
            //var output = document.getElementById('result');
            //output.innerHTML = JSON.stringify(resultJson, null, 2);

        };
        FR.readAsArrayBuffer(file);

    });
    $("#input").click(function () {
        if ($("#input").val() != "") {
            $("#input").val(null);
        }
    });

    //SetupSeachableDDL();
    $("#divFilters").show();
;


    BindDropdown();
    $('#ddlgender').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });
    $('#ddlgenderNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });
    $('#ddlgenderPromo').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });
    $('#ddlEmployeeStatusNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });
    $('#ddlEmployeeStatusPromo').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });
    $('#ddlgender_RAR').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    genderChangesforGeoWise();

});


function BindRole() {
    
    $('#ddlRole').empty();
    var ddldata;
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating/GetRoleList?AppraisalId=" + getRatingPagesAppraisalCycleId() + "&LoginEmpId=" + sessionStorage.EmployeeId;

    CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (dropdownData) {
        if (dropdownData.Success === true && dropdownData.Result.length > 0) {
            ddldata = dropdownData.Result;

            var $dropdown = $("#ddlRole"); // Change to your actual dropdown ID
            $dropdown.empty(); // Clear existing options

            $.each(ddldata, function (index, item) {

                var isEnabled = (item.IsEnabled === 1) ? 1 : 0; // Convert to 1 (Yes) or 0 (No)
                if (isEnabled == 1) {
                    EnableRoleId = item.Roleid
                }

                $dropdown.append(`<option value="${item.Roleid}">${item.RoleName}</option>`);
            });

            var role = localStorage.getItem("selectedRoleByStudio");
            if (role) {
                $dropdown.val(role);
            } else {
                $dropdown.val($dropdown.find('option:first').val());
            }
            localStorage.removeItem("selectedRoleByStudio");

            // Call BindDirectReportees now that ddlRole has a value (fixes RoleId null on initial load)
            BindDirectReportees();
            if ($("#ddlReportee").length && typeof $.fn.multiselect === 'function') {
                $("#ddlReportee").val(["-1"]);
                $("#ddlReportee").multiselect('refresh');
            }
            updatePrioritisationTextVisibility();
        } else {
            // No roles returned: still bind reportees using fallback RoleId inside BindDirectReportees
            BindDirectReportees();
            if ($("#ddlReportee").length && typeof $.fn.multiselect === 'function') {
                $("#ddlReportee").val(["-1"]);
                $("#ddlReportee").multiselect('refresh');
            }
            updatePrioritisationTextVisibility();
        }
    });
}

function BindDropdown() {

    var ddldata;
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating/GetDataForDropdown?AppraisalCycleId=" + getRatingPagesAppraisalCycleId() + "&LoginEmployeeId=" + sessionStorage.EmployeeId + "&RoleId=" + $("#ddlRole").val();

    CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (dropdownData) {

        if (dropdownData.Success == true) {

            ddldata = dropdownData.Result;
        }
    });
    //Binding Grade Dropdown

    var dictGrade = {};
    var sortedGradeKeys = [];
    $.each(ddldata, function (index, data) {
        if (dictGrade[data.GradeName] == undefined) {
            dictGrade[data.GradeName] = data.GradeID;
        }
    }
    );
    sortedGradeKeys = Object.keys(dictGrade).sort();
    $('#ddlgrade').empty();

    for (let t = 0; t < sortedGradeKeys.length; t++) {
        if (sortedGradeKeys[t] != 'C') {
            $('#ddlgrade').append($("<option>").val(dictGrade[sortedGradeKeys[t]]).text(sortedGradeKeys[t]));
        }
    }

    $('#ddlgrade').multiselect('destroy');

    $('#ddlgrade').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgrade').multiselect('refresh');

    ////////////////////////////////////////////////////////////////////////////

    $('#ddlgradeNorm').empty();

    for (let t = 0; t < sortedGradeKeys.length; t++) {
        if (sortedGradeKeys[t] != 'C') {
            $('#ddlgradeNorm').append($("<option>").val(dictGrade[sortedGradeKeys[t]]).text(sortedGradeKeys[t]));
        }
    }

    $('#ddlgradeNorm').multiselect('destroy');

    $('#ddlgradeNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgradeNorm').multiselect('refresh');


    $('#ddlgradePromo').empty();

    for (let t = 0; t < sortedGradeKeys.length; t++) {
        if (sortedGradeKeys[t] != 'C') {
            $('#ddlgradePromo').append($("<option>").val(dictGrade[sortedGradeKeys[t]]).text(sortedGradeKeys[t]));
        }
    }

    $('#ddlgradePromo').multiselect('destroy');

    $('#ddlgradePromo').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgradePromo').multiselect('refresh');


    //----------------------
    // Binding Criticality Priority Dropdown
    var svrPathCriticalityPriority = CONFIG.get('SERVERNAME');
    var apiPathCriticalityPriority = svrPathCriticalityPriority + "Rating/GetCriticalityPriorityForDropdown";

    CommonAjaxGET(apiPathCriticalityPriority, CommonGetHeaderInfo()).done(function (criticalityPriorityData) {
        if (criticalityPriorityData.Success == true && criticalityPriorityData.Result && criticalityPriorityData.Result.data) {
            var dictCriticalityPriority = {};
            var sortedCriticalityPriorityKeys = [];
            window._criticalityPriorityIdToDisplayText = window._criticalityPriorityIdToDisplayText || {};

            $.each(criticalityPriorityData.Result.data, function (index, data) {
                if (data && data.Id != null && data.DisplayText) {
                    window._criticalityPriorityIdToDisplayText[String(data.Id)] = data.DisplayText;
                }
                if (dictCriticalityPriority[data.DisplayText] == undefined) {
                    dictCriticalityPriority[data.DisplayText] = data.Id;
                }
            });

            sortedCriticalityPriorityKeys = Object.keys(dictCriticalityPriority).sort();

            var $critFilterBar = getFiltersDropCriticalitySelect();
            if ($critFilterBar.length) {
                $critFilterBar.empty();
                $critFilterBar.append($('<option>').val(NOT_CRITICAL_PRIORITY_FILTER_VALUE).text('Not Critical'));
            }
            $('#ddlCriticalityPriorityNorm').empty();
            $('#ddlCriticalityPriorityPromo').empty();
            $('#ddlCriticalityPriorityNorm').append($('<option>').val(NOT_CRITICAL_PRIORITY_FILTER_VALUE).text('Not Critical'));
            $('#ddlCriticalityPriorityPromo').append($('<option>').val(NOT_CRITICAL_PRIORITY_FILTER_VALUE).text('Not Critical'));

            for (let t = 0; t < sortedCriticalityPriorityKeys.length; t++) {
                var val = dictCriticalityPriority[sortedCriticalityPriorityKeys[t]];
                var text = sortedCriticalityPriorityKeys[t];
                if ($critFilterBar.length) {
                    $critFilterBar.append($('<option>').val(val).text(text));
                }
                $('#ddlCriticalityPriorityNorm').append($('<option>').val(val).text(text));
                $('#ddlCriticalityPriorityPromo').append($('<option>').val(val).text(text));
            }

            if ($critFilterBar.length) {
                $critFilterBar.multiselect('destroy');
                $critFilterBar.multiselect({
                    includeSelectAllOption: true,
                    enableFiltering: true,
                    enableCaseInsensitiveFiltering: true,
                    maxHeight: 150
                });
                $critFilterBar.multiselect('refresh');
            }

            if ($('#ddlCriticalityPriorityNorm').length) {
                $('#ddlCriticalityPriorityNorm').multiselect('destroy');
                $('#ddlCriticalityPriorityNorm').multiselect({
                    includeSelectAllOption: true,
                    enableFiltering: true,
                    enableCaseInsensitiveFiltering: true,
                    maxHeight: 150
                });
                $('#ddlCriticalityPriorityNorm').multiselect('refresh');
            }
            if ($('#ddlCriticalityPriorityPromo').length) {
                $('#ddlCriticalityPriorityPromo').multiselect('destroy');
                $('#ddlCriticalityPriorityPromo').multiselect({
                    includeSelectAllOption: true,
                    enableFiltering: true,
                    enableCaseInsensitiveFiltering: true,
                    maxHeight: 150
                });
                $('#ddlCriticalityPriorityPromo').multiselect('refresh');
            }
        }
    });

    ///////////////////////////////////////////////////////////////////////////


    // Binding Dropdown of EmployeeStatus
    var dictEmpStatus = {};
    var sortedEmpStatuseKeys = [];
    $.each(ddldata, function (index, data) {

        if (dictEmpStatus[data.EmployeeStatus] == undefined) {

            if (data.EmployeeStatus == 'A') {
                dictEmpStatus["Active"] = data.EmployeeStatus;
            } else if (data.EmployeeStatus == 'R') {
                dictEmpStatus["Resigned"] = data.EmployeeStatus;
            } else { dictEmpStatus["Exited"] = data.EmployeeStatus; }
        }
    }
    );

    sortedEmpStatuseKeys = Object.keys(dictEmpStatus).sort();

    $('#ddlEmployeeStatus').empty();

    for (let t = 0; t < sortedEmpStatuseKeys.length; t++) {
        $('#ddlEmployeeStatus').append($("<option>").val(dictEmpStatus[sortedEmpStatuseKeys[t]]).text(sortedEmpStatuseKeys[t]));

    }

    $('#ddlEmployeeStatus').multiselect('destroy');

    $('#ddlEmployeeStatus').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlEmployeeStatus').multiselect('refresh');

    ////////////////////////////////////////

    $('#ddlEmployeeStatusNorm').empty();

    for (let t = 0; t < sortedEmpStatuseKeys.length; t++) {
        $('#ddlEmployeeStatusNorm').append($("<option>").val(dictEmpStatus[sortedEmpStatuseKeys[t]]).text(sortedEmpStatuseKeys[t]));

    }

    $('#ddlEmployeeStatusNorm').multiselect('destroy');

    $('#ddlEmployeeStatusNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlEmployeeStatusNorm').multiselect('refresh');

    ////////////////////////////////////////

    $('#ddlEmployeeStatusPromo').empty();

    for (let t = 0; t < sortedEmpStatuseKeys.length; t++) {
        $('#ddlEmployeeStatusPromo').append($("<option>").val(dictEmpStatus[sortedEmpStatuseKeys[t]]).text(sortedEmpStatuseKeys[t]));

    }

    $('#ddlEmployeeStatusPromo').multiselect('destroy');

    $('#ddlEmployeeStatusPromo').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlEmployeeStatusPromo').multiselect('refresh');
    ////////////////////////////////////////////////////////////////////////

    $('#ddlEmpStatusPractice').empty();

    for (let t = 0; t < sortedEmpStatuseKeys.length; t++) {
        $('#ddlEmpStatusPractice').append($("<option>").val(dictEmpStatus[sortedEmpStatuseKeys[t]]).text(sortedEmpStatuseKeys[t]));

    }

    $('#ddlEmpStatusPractice').multiselect('destroy');

    $('#ddlEmpStatusPractice').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlEmpStatusPractice').multiselect('refresh');

    $('#ddlEmployeeStatusNorm_PNorm').empty();

    for (let t = 0; t < sortedEmpStatuseKeys.length; t++) {
        $('#ddlEmployeeStatusNorm_PNorm').append($("<option>").val(dictEmpStatus[sortedEmpStatuseKeys[t]]).text(sortedEmpStatuseKeys[t]));

    }

    $('#ddlEmployeeStatusNorm_PNorm').multiselect('destroy');

    $('#ddlEmployeeStatusNorm_PNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlEmployeeStatusNorm_PNorm').multiselect('refresh');


    // Binding Dropdown of Gender
    var dictEmpGender = {};
    var sortedEmpGenderKeys = [];
    $.each(ddldata, function (index, data) {

        if (dictEmpGender[data.Gender] == undefined) {

            if (data.Gender == 'Male') {
                dictEmpGender["Male"] = data.Gender;
            } else if (data.Gender == 'Female') {
                dictEmpGender["Female"] = data.Gender;
            }
        }
    }
    );

    sortedEmpGenderKeys = Object.keys(dictEmpGender).sort();

    $('#ddlgender').empty();

    for (let t = 0; t < sortedEmpGenderKeys.length; t++) {
        $('#ddlgender').append($("<option>").val(dictEmpGender[sortedEmpGenderKeys[t]]).text(sortedEmpGenderKeys[t]));

    }

    $('#ddlgender').multiselect('destroy');

    $('#ddlgender').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgender').multiselect('refresh');

    ////////////////////////////////////////

    $('#ddlgenderNorm').empty();

    for (let t = 0; t < sortedEmpGenderKeys.length; t++) {
        $('#ddlgenderNorm').append($("<option>").val(dictEmpGender[sortedEmpGenderKeys[t]]).text(sortedEmpGenderKeys[t]));

    }

    $('#ddlgenderNorm').multiselect('destroy');

    $('#ddlgenderNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgenderNorm').multiselect('refresh');

    ////////////////////////////////////////

    $('#ddlgenderPromo').empty();

    for (let t = 0; t < sortedEmpGenderKeys.length; t++) {
        $('#ddlgenderPromo').append($("<option>").val(dictEmpGender[sortedEmpGenderKeys[t]]).text(sortedEmpGenderKeys[t]));

    }

    $('#ddlgenderPromo').multiselect('destroy');

    $('#ddlgenderPromo').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgenderPromo').multiselect('refresh');

    //Binding Location Dropdowns

    var dictLocation = {};
    var sortedLocationKeys = [];

    $.each(ddldata, function (index, data) {
        if (dictLocation[data.LocationName] == undefined) {

            if (data.LocationID == 1) {
                dictLocation["India"] = data.LocationID;
            }
            else if (data.LocationID == 3) {
                dictLocation["US"] = data.LocationID;
            }
            else { dictLocation["ROW"] = data.LocationID; }
        }
    }
    );

    sortedLocationKeys = Object.keys(dictLocation).sort();

    $('#ddllocation').empty();

    for (let t = 0; t < sortedLocationKeys.length; t++) {
        if (sortedLocationKeys[t] != 'C') {
            $('#ddllocation').append($("<option>").val(dictLocation[sortedLocationKeys[t]]).text(sortedLocationKeys[t]));
        }
    }

    $('#ddllocation').multiselect('destroy');

    $('#ddllocation').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddllocation').multiselect('refresh');

    ////////////////////////////////////////

    $('#ddllocationNorm').empty();

    for (let t = 0; t < sortedLocationKeys.length; t++) {
        if (sortedLocationKeys[t] != 'C') {
            $('#ddllocationNorm').append($("<option>").val(dictLocation[sortedLocationKeys[t]]).text(sortedLocationKeys[t]));
        }
    }

    $('#ddllocationNorm').multiselect('destroy');

    $('#ddllocationNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddllocationNorm').multiselect('refresh');

    ////////////////////////////////////////

    $('#ddllocationPromo').empty();

    for (let t = 0; t < sortedLocationKeys.length; t++) {
        if (sortedLocationKeys[t] != 'C') {
            $('#ddllocationPromo').append($("<option>").val(dictLocation[sortedLocationKeys[t]]).text(sortedLocationKeys[t]));
        }
    }

    $('#ddllocationPromo').multiselect('destroy');

    $('#ddllocationPromo').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddllocationPromo').multiselect('refresh');



    ///////////////////////////////////////////////////////////////////////

    $('#ddllocationPractice').empty();

    for (let t = 0; t < sortedLocationKeys.length; t++) {
        if (sortedLocationKeys[t] != 'C') {
            $('#ddllocationPractice').append($("<option>").val(dictLocation[sortedLocationKeys[t]]).text(sortedLocationKeys[t]));
        }
    }

    $('#ddllocationPractice').multiselect('destroy');

    $('#ddllocationPractice').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddllocationPractice').multiselect('refresh');



    $('#ddllocationNorm_PNorm').empty();

    for (let t = 0; t < sortedLocationKeys.length; t++) {
        if (sortedLocationKeys[t] != 'C') {
            $('#ddllocationNorm_PNorm').append($("<option>").val(dictLocation[sortedLocationKeys[t]]).text(sortedLocationKeys[t]));
        }
    }

    $('#ddllocationNorm_PNorm').multiselect('destroy');

    $('#ddllocationNorm_PNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddllocationNorm_PNorm').multiselect('refresh');


    //Binding Group Account Dropdown

    var sortedAccountKeys = [];
    $.each(ddldata, function (index, data) {
        if (dictGroupAccount[data.AccountGroup] == undefined) {
            dictGroupAccount[data.AccountGroup] = data.AccountGroupId;
        }
    }
    );

    sortedAccountKeys = Object.keys(dictGroupAccount).sort();

    $('#ddlgroupaccount').empty();

    for (let t = 0; t < sortedAccountKeys.length; t++) {

        $('#ddlgroupaccount').append($("<option>").val(dictGroupAccount[sortedAccountKeys[t]]).text(sortedAccountKeys[t]));

    }

    $('#ddlgroupaccount').multiselect('destroy');

    $('#ddlgroupaccount').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgroupaccount').multiselect('refresh');


    ////////////////////////////////////////

    $('#ddlgroupaccountNorm').empty();

    for (let t = 0; t < sortedAccountKeys.length; t++) {

        $('#ddlgroupaccountNorm').append($("<option>").val(dictGroupAccount[sortedAccountKeys[t]]).text(sortedAccountKeys[t]));

    }

    $('#ddlgroupaccountNorm').multiselect('destroy');

    $('#ddlgroupaccountNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgroupaccountNorm').multiselect('refresh');

    ////////////////////////////////////////


    $('#ddlgroupaccountPromo').empty();

    for (let t = 0; t < sortedAccountKeys.length; t++) {

        $('#ddlgroupaccountPromo').append($("<option>").val(dictGroupAccount[sortedAccountKeys[t]]).text(sortedAccountKeys[t]));

    }

    $('#ddlgroupaccountPromo').multiselect('destroy');

    $('#ddlgroupaccountPromo').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgroupaccountPromo').multiselect('refresh');

    ////////////////////////////////////////////////////////////



    $('#ddlgroupaccountPractice').empty();

    for (let t = 0; t < sortedAccountKeys.length; t++) {
        $('#ddlgroupaccountPractice').append($("<option>").val(dictGroupAccount[sortedAccountKeys[t]]).text(sortedAccountKeys[t]));

    }

    $('#ddlgroupaccountPractice').multiselect('destroy');

    $('#ddlgroupaccountPractice').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgroupaccountPractice').multiselect('refresh');


    $('#ddlgroupaccountNorm_PNorm').empty();

    for (let t = 0; t < sortedAccountKeys.length; t++) {
        $('#ddlgroupaccountNorm_PNorm').append($("<option>").val(dictGroupAccount[sortedAccountKeys[t]]).text(sortedAccountKeys[t]));

    }

    $('#ddlgroupaccountNorm_PNorm').multiselect('destroy');

    $('#ddlgroupaccountNorm_PNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgroupaccountNorm_PNorm').multiselect('refresh');


}

function SetupSeachableDDL() {
    var elements = $(".multiselect.dropdown-toggle.btn.btn-default");
    if (elements) {
        elements.removeClass("btn");
        elements.removeClass("btn-default");
        elements.addClass("form-control");
    }
}

//$("#btnratingSaveDraft").click(function () {
//    SaveSubmitRating(1);
//});

$("#btnratingSaveDraft").click(function () {
    toastr.clear();
    SaveSubmitRating("draft", 1);
});


$("#btnReferback").click(function () {
    toastr.clear();
    ReferBackRating();
});


$('#tblEmpRatingList').on('draw.dt', function () {
    SetEmpRatingListTableState();
    changeBackgroundColor();
    // Keep header and body columns aligned after draw
    try {
        if ($.fn.DataTable.isDataTable('#tblEmpRatingList')) {
            $('#tblEmpRatingList').DataTable().columns.adjust();
        }
    } catch (e) { /* ignore */ }
});
$(document).on('mousedown', '#tdRI_EE1', function (e) {

    eventSource = 'boxRIFilterEE1';

    if (CheckEmpRatingListTableStateChanged()) {
        e.preventDefault();
        $('#confirm').modal('show');
    }
});

$(document).on('mousedown', '#tdRI_EE', function (e) {

    eventSource = 'boxRIFilterEE';

    if (CheckEmpRatingListTableStateChanged()) {
        e.preventDefault();
        $('#confirm').modal('show');
    }
});

$(document).on('mousedown', '#tdRI_ME', function (e) {

    eventSource = 'boxRIFilterME';

    if (CheckEmpRatingListTableStateChanged()) {
        e.preventDefault();
        $('#confirm').modal('show');
    }
});

$(document).on('mousedown', '#tdRI_BE', function (e) {

    eventSource = 'boxRIFilterBE';

    if (CheckEmpRatingListTableStateChanged()) {
        e.preventDefault();
        $('#confirm').modal('show');
    }
});

$(document).on('mousedown', '#tdRI_GivenRating', function (e) {

    eventSource = 'boxRIFilterRatingGiven';

    if (CheckEmpRatingListTableStateChanged()) {
        e.preventDefault();
        $('#confirm').modal('show');
    }
});

$(document).on('mousedown', '#tdRI_NotGivenRating', function (e) {

    eventSource = 'boxRIFilterRatingNotGiven';

    if (CheckEmpRatingListTableStateChanged()) {
        e.preventDefault();
        $('#confirm').modal('show');
    }
});

$(document).on('mousedown', '#tdRI_MyReportee', function (e) {

    eventSource = 'boxRIFilterMyReportee';

    if (CheckEmpRatingListTableStateChanged()) {
        e.preventDefault();
        $('#confirm').modal('show');
    }
});

$(document).on('mousedown', '#tdRI_ResetFilters', function (e) {

    eventSource = 'boxRIResetFilters';

    if (CheckEmpRatingListTableStateChanged()) {
        e.preventDefault();
        $('#confirm').modal('show');
    }
});

$(document).on('mousedown', '#groupAccountDDL .multiselect-container.dropdown-menu', function (e) {

    eventSource = 'ddlGroupAccount';

    clickedDDLGroupAccount = '';

    if (e && e.target && e.target.className == 'checkbox' && e.target.tagName == 'LABEL') {

        clickedDDLGroupAccount = e.target.firstChild.value;

        if (CheckEmpRatingListTableStateChanged()) {

            e.preventDefault();

            $('#confirm').modal('show');

        }
    }
});

$(document).on('mousedown', '#reporteeDDL .multiselect-container.dropdown-menu', function (e) {


    eventSource = 'ddlReportee';

    clickedDDLReporteeValue = '';

    if (e && e.target && e.target.className == 'checkbox' && e.target.tagName == 'LABEL') {

        clickedDDLReporteeValue = e.target.firstChild.value;

        if (CheckEmpRatingListTableStateChanged()) {

            e.preventDefault();

            $('#confirm').modal('show');

        }

    }

});

$(document).on('mousedown', '#gradeDDL .multiselect-container.dropdown-menu', function (e) {


    eventSource = 'ddlGrade';

    clickedDDLGradeValue = '';

    if (e && e.target && e.target.className == 'checkbox' && e.target.tagName == 'LABEL') {

        clickedDDLGradeValue = e.target.firstChild.value;

        if (CheckEmpRatingListTableStateChanged()) {

            e.preventDefault();

            $('#confirm').modal('show');

        }

    }

});

$(document).on('mousedown', '#locationDDL .multiselect-container.dropdown-menu', function (e) {

    //e.preventDefault();

    eventSource = 'ddlLocation';

    clickedDDLLocationValue = '';

    if (e && e.target && e.target.className == 'checkbox' && e.target.tagName == 'LABEL') {

        clickedDDLLocationValue = e.target.firstChild.value;

        if (CheckEmpRatingListTableStateChanged()) {

            e.preventDefault();

            $('#confirm').modal('show');

        }

    }

});


$(document).on('mousedown', '#GenderDDL .multiselect-container.dropdown-menu', function (e) {

    //e.preventDefault();

    eventSource = 'ddlgender';

    clickedDDLgenderValue = '';

    if (e && e.target && e.target.className == 'checkbox' && e.target.tagName == 'LABEL') {

        clickedDDLgenderValue = e.target.firstChild.value;

        if (CheckEmpRatingListTableStateChanged()) {

            e.preventDefault();

            $('#confirm').modal('show');

        }

    }

});

$(document).on('mousedown', '#GroupAccountDDL .multiselect-container.dropdown-menu', function (e) {

    //e.preventDefault();


    eventSource = 'ddlgroupaccount';

    clickedddlgroupaccountValue = '';

    if (e && e.target && e.target.className == 'checkbox' && e.target.tagName == 'LABEL') {

        clickedddlgroupaccountValue = e.target.firstChild.value;

        if (CheckEmpRatingListTableStateChanged()) {

            e.preventDefault();

            $('#confirm').modal('show');

        }

    }

});


$(document).on('mousedown', '#EmployeeStatusDDL .multiselect-container.dropdown-menu', function (e) {

    //e.preventDefault();

    eventSource = 'ddlEmployeeStatus';

    clickedEmployeeStatusDDLValue = '';

    if (e && e.target && e.target.className == 'checkbox' && e.target.tagName == 'LABEL') {

        clickedEmployeeStatusDDLValue = e.target.firstChild.value;

        if (CheckEmpRatingListTableStateChanged()) {

            e.preventDefault();

            $('#confirm').modal('show');

        }

    }

});

$(document).on('mousedown', '#PromotionDDL .multiselect-container.dropdown-menu', function (e) {

    eventSource = 'ddlPromotion';

    clickedDDLPromotionValue = '';

    if (e && e.target && e.target.className == 'checkbox' && e.target.tagName == 'LABEL') {

        clickedDDLPromotionValue = e.target.firstChild.value;

        if (CheckEmpRatingListTableStateChanged()) {

            e.preventDefault();

            $('#confirm').modal('show');

        }

    }

});

$(document).on('mousedown', '.multiselect-container.dropdown-menu', function (e) {

    if (!(e && e.target && e.target.tagName === 'LABEL' && (e.target.className === 'checkbox' || (e.target.className && e.target.className.indexOf('checkbox') !== -1)))) return;
    var $menu = $(e.currentTarget);
    var $critSelect = $menu.closest('.btn-group').find('select[id="ddlCriticalityPriority"]');
    if (!$critSelect.length) $critSelect = $menu.closest('label[for="ddlCriticalityPriority"], .Criticality.filterAttr').find('select[id="ddlCriticalityPriority"]');
    if (!$critSelect.length || !$('#filtersDropDiv').find($critSelect).length) return;

    eventSource = 'ddlCriticalityPriority';
    clickedDDLCriticalityPriorityValue = (e.target.firstChild && e.target.firstChild.value) ? e.target.firstChild.value : '';

    if (CheckEmpRatingListTableStateChanged()) {
        e.preventDefault();
        $('#confirm').modal('show');
    }
});

//$(document).on('mousedown', '.tblEmpRating-List .paginate_button', function (e) {

//    e.preventDefault();

//    if (e.target.className.includes("disabled")) {

//        eventSource = 'none';

//        return;

//    }

//    else if (e.target.className.includes("first")) {

//        eventSource = 'firstPageBtn';

//    }

//    else if (e.target.className.includes("last")) {

//        eventSource = 'lastPageBtn';

//    }

//    else if (e.target.className.includes("next")) {

//        eventSource = 'nextPageBtn';

//    }

//    else if (e.target.className.includes("previous")) {

//        eventSource = 'previousPageBtn';

//    } else {

//        eventSource = 'pageBtn#' + e.target.getAttribute("data-dt-idx");

//    }

//    if (CheckEmpRatingListTableStateChanged()) {

//        $('#confirm').modal('show');

//    }

//});



$(document).on('mousedown', '#tblEmpRatingList_length [name="tblEmpRatingList_length"]', function (e) {

    eventSource = "pagingLimit";

    if (CheckEmpRatingListTableStateChanged()) {

        e.preventDefault();

        $('#confirm').modal('show');

    }

});

$(document).on('keydown', '#tblEmpRatingList_filter [type="search"]', function (e) {

    eventSource = "search";

    searchValue = e.target.value + e.key;

    if (CheckEmpRatingListTableStateChanged()) {

        e.preventDefault();

        $('#confirm').modal('show');

    }

});

$("#yes").click(function () {

    $('#confirm').modal('hide');

    var runFilter = function () {
    if (eventSource == "boxRIFilterEE1") {
        $('#tdRI_EE1').click();
    }
    else if (eventSource == "boxRIFilterEE") {
        $('#tdRI_EE').click();
    }
    else if (eventSource == "boxRIFilterME") {
        $('#tdRI_ME').click();
    }
    else if (eventSource == "boxRIFilterBE") {
        $('#tdRI_BE').click();
    }
    else if (eventSource == "boxRIFilterRatingGiven") {
        $('#tdRI_GivenRating').click();
    }
    else if (eventSource == "boxRIFilterRatingNotGiven") {
        $('#tdRI_NotGivenRating').click();
    }
    else if (eventSource == "boxRIFilterMyReportee") {
        $('#tdRI_MyReportee').click();
    }
    else if (eventSource == "boxRIResetFilters") {
        $('#tdRI_ResetFilters').click();
    }
    else if (eventSource == "ddlReportee") {

        var selectedValue = $("#ddlReportee").val();
        if (!Array.isArray(selectedValue)) selectedValue = [];
        selectedValue.push(clickedDDLReporteeValue);

        $("#ddlReportee").val(selectedValue);

        $("#ddlReportee").multiselect('refresh');

        setTimeout(BindReporteeRatings, 500);

        $('.loader-div').show();

    }

    else if (eventSource == "ddlGrade") {

        var selectedValue = $("#ddlgrade").val();
        if (!Array.isArray(selectedValue)) selectedValue = [];
        selectedValue.push(clickedDDLGradeValue);

        $("#ddlgrade").val(selectedValue);

        $("#ddlgrade").multiselect('refresh');

        ddlGradeOnChange();

    }

    else if (eventSource == "ddlLocation") {

        var selectedValue = $("#ddllocation").val();
        if (!Array.isArray(selectedValue)) selectedValue = [];
        selectedValue.push(clickedDDLLocationValue);

        $("#ddllocation").val(selectedValue);

        $("#ddllocation").multiselect('refresh');

        ddlLocationOnChange();

    }
    else if (eventSource == "ddlGroupAccount") {

        var selectedValue = $("#ddlgroupaccount").val();
        if (!Array.isArray(selectedValue)) selectedValue = [];
        selectedValue.push(clickedDDLGroupAccount);

        $("#ddlgroupaccount").val(selectedValue);

        $("#ddlgroupaccount").multiselect('refresh');

        ddlGroupAccountOnChange();
    }
    else if (eventSource == "ddlgroupaccount") {

        var selectedValue = $("#ddlgroupaccount").val();
        if (!Array.isArray(selectedValue)) selectedValue = [];
        selectedValue.push(clickedddlgroupaccountValue);

        $("#ddlgroupaccount").val(selectedValue);

        $("#ddlgroupaccount").multiselect('refresh');

        ddlGroupAccountOnChange();
    } else if (eventSource == "ddlEmployeeStatus") {

        var selectedValue = $("#ddlEmployeeStatus").val();
        if (!Array.isArray(selectedValue)) selectedValue = [];
        selectedValue.push(clickedEmployeeStatusDDLValue);

        $("#ddlEmployeeStatus").val(selectedValue);

        $("#ddlEmployeeStatus").multiselect('refresh');

        ddlEmployeeStatusChange();
    }
    else if (eventSource == "ddlgender") {

        var selectedValue = $("#ddlgender").val();
        if (!Array.isArray(selectedValue)) selectedValue = [];
        selectedValue.push(clickedDDLgenderValue);

        $("#ddlgender").val(selectedValue);

        $("#ddlgender").multiselect('refresh');

        ddlgenderOnChange();
    }
    else if (eventSource == "ddlPromotion") {

        var selectedValue = $("#ddlPromotion").val();
        if (!Array.isArray(selectedValue)) selectedValue = [];
        selectedValue.push(clickedDDLPromotionValue);

        $("#ddlPromotion").val(selectedValue);

        $("#ddlPromotion").multiselect('refresh');

        FirstScreenfilterschange();
    }
    else if (eventSource == "ddlCriticalityPriority") {

        var $critSelect = $('#filtersDropDiv select#ddlCriticalityPriority');
        var selectedValue = $critSelect.val();
        if (!Array.isArray(selectedValue)) selectedValue = [];
        if (clickedDDLCriticalityPriorityValue && selectedValue.indexOf(clickedDDLCriticalityPriorityValue) === -1) {
            selectedValue.push(clickedDDLCriticalityPriorityValue);
        }
        $critSelect.val(selectedValue);
        $critSelect.multiselect('refresh');
        $critSelect.trigger('change');
    }
    else if (eventSource == "pagingLimit") {

        SetEmpRatingListTableState();

    }
    else if (eventSource == "search") {

        SetEmpRatingListTableState();

        //$("#tblEmpRatingList_filter [type='search']").val(searchValue);

    }
    else if (eventSource == "firstPageBtn") {

        $('.paginate_button.first').click();

    }
    else if (eventSource == "lastPageBtn") {

        $('.paginate_button.last').click();

    }

    else if (eventSource == "nextPageBtn") {

        $('.paginate_button.next').click();

    }

    else if (eventSource == "previousPageBtn") {

        $('.paginate_button.previous').click();

    }

    else {

        if (eventSource.indexOf("#") != -1) {

            var datadxid = eventSource.split("#")[1];

            $('.paginate_button[data-dt-idx="' + datadxid + '"]').click();

        }

    }

    };
    setTimeout(runFilter, 150);
});


function ddlGroupAccountOnChange() {

    checkSpanFilter();
    BindNormalizationOverallDataOnInstertionScreen();

    var Groupaccountarray = [];
    var filterData = [];

    var ddlGroupaccount = $("#ddlgroupaccount").val().toString();

    Groupaccountarray = ddlGroupaccount.split(',');

    for (let j = 0; j < rawData.length; j++) {
        for (let k = 0; k < Groupaccountarray.length; k++) {
            if (rawData[j].AccountGroupId == Groupaccountarray[k]) {
                filterData.push(rawData[j]);
            }
        }
    }

    if (Groupaccountarray.length > 0 && Groupaccountarray[0].length > 0 && filterData.length > 0) {
        BindTableForFilters(filterData)
    } else {
        BindTableForFilters(rawData)
    }
}

$('#ddlgroupaccount').on('change', function () {
    ddlGroupAccountOnChange();
});

// Criticality Priority filter (insertion filters bar only — not the modal duplicate id)
$(document).on('change', '#filtersDropDiv select#ddlCriticalityPriority', function () {
    BindNormalizationOverallDataOnInstertionScreen();
    BindReporteeRatings();
});

//$('#ddlRole').on('change', function () {

//    
//    //SetPracticeLeaderTab();
//    BindDirectReportees();
//    $("#ddlReportee").val(["-1"]);
//    $("#ddlReportee").multiselect('refresh');
//    BindGrade();
//    BindNormalizationOverallData();
//    BindNormalizationOverallDataOnInstertionScreen();
//    BindMaleFemaleNormalization();
//    RatingFilterTab();
//    BindOverAllPromotionSummary();
//    BindGradeNorm();
//    BindGradePromo();
//    BindOverAllMaleFemalePromotionSummary();
//    BindReporteeRatings();

//});

$('#ddlRole').on('change', function () {

    updatePrioritisationTextVisibility();
    if ($('#ddlRole').val() == 4) {


       /* window.location.href = "https://pep.infogain.com/RatingStudio/Index"; // Redirects to internal URL*/
        // Use session variable instead of hardcoded URL // Redirects to internal URL*/
        var redirectUrl = (typeof pepUrl !== 'undefined' && pepUrl) ? pepUrl : '';
        window.location.href = redirectUrl + "/RatingStudio/Index";

    }

    _ratingsRoleChangeBulkLoad = true;
    showRatingsPageLoadingOverlay();

    $("#ddlPromotion").multiselect("deselectAll", false);
    $("#ddlPromotion").multiselect("refresh");


    $("#ddlgrade").multiselect("deselectAll", false);
    $("#ddlgrade").multiselect("refresh");


    $("#ddllocation").multiselect("deselectAll", false);
    $("#ddllocation").multiselect("refresh");

    $("#ddlgroupaccount").multiselect("deselectAll", false);
    $("#ddlgroupaccount").multiselect("refresh")

    $("#ddlgender").multiselect("deselectAll", false);
    $("#ddlgender").multiselect("refresh")

    $("#ddlEmployeeStatus").multiselect("deselectAll", false);
    $("#ddlEmployeeStatus").multiselect("refresh");
    var $critF = getFiltersDropCriticalitySelect();
    if ($critF.length) { $critF.multiselect("deselectAll", false); $critF.multiselect("refresh"); }
    if ($("#ddlCriticalityPriorityNorm").length) { $("#ddlCriticalityPriorityNorm").multiselect("deselectAll", false); $("#ddlCriticalityPriorityNorm").multiselect("refresh"); }
    if ($("#ddlCriticalityPriorityPromo").length) { $("#ddlCriticalityPriorityPromo").multiselect("deselectAll", false); $("#ddlCriticalityPriorityPromo").multiselect("refresh"); }

    // Let the browser paint the loader before synchronous multiselect / AJAX work
    window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
            setTimeout(function () {
                IsLoginEmployeeSubmittedRating();
                BindDirectReportees();

                var promises = [];
                function addJqPromise(p) {
                    if (p && typeof p.then === 'function') {
                        promises.push(p);
                    }
                }

                addJqPromise(BindNormalizationOverallDataOnInstertionScreen());
                addJqPromise(BindReporteeRatings());
                addJqPromise(BindNormalizationOverallData());
                addJqPromise(BindMaleFemaleNormalization());
                addJqPromise(BindOverAllPromotionSummary());
                addJqPromise(BindOverAllMaleFemalePromotionSummary());

                RatingFilterTab();
                BellCurve();

                function finishRoleChangeLoad() {
                    _ratingsRoleChangeBulkLoad = false;
                    hideRatingsPageLoadingOverlay();
                }

                if (!promises.length) {
                    finishRoleChangeLoad();
                    return;
                }
                $.when.apply($, promises).always(finishRoleChangeLoad);
            }, 500);
        });
    });

});




function ReferBackRating() {
    // $(".loader-div").show();

    var IRecoForpromotion = 0;
    var ICurrentRating = 0;
    var Id = 0;
    var RatingArray = [];

    var hdnRMName = 0;
    var hdnNextApproverId = 0;
    var hdnSLastratingGivenBy = 0;
    var hdnLastratingGivenBy = 0;
    var RatingList = {};
    var ReferbackValid = 0;
    var RowStatus = 0;
    var ReferbackValidSelection = 0;
    var a = [];

    var ReferedbackArray = [];

    var selectedEmployees = $("#ddlReportee").val();



    if ($("#ddlReportee option:selected").length > 1) {
        toastr.error("You can choose only one reportee at a time from 'My Span' filter to Refer back.");
        return;

    }

    if (selectedEmployees == sessionStorage.EmployeeId || selectedEmployees == '-1' || selectedEmployees.includes('-1')) {
        toastr.error("You cannot Refer back to yourself.");
        return;
    }
    if (selectedEmployees == '') {
        toastr.error("Please select one reportee from 'My Span' filter to Refer back the ratings.");
        return;
    }




    if ($("#ddlReportee option:selected").attr('data-IsDP') == 0) {
        toastr.error("The data can only be referred back to a Reviewer. Please select an employee from 'My Span' filter who is a Reviewer.");
        return;
    }


    var table = $('#tblEmpRatingList').DataTable();
    var allRows = table.rows().nodes().to$();

    if (ReporteesSpanCountForReferback > 0 && (allRows != undefined) && allRows.length > 0 && ReporteesSpanCountForReferback == allRows.length) {
        var element;
        var isValid = true;
        var check = 0;



        $.each(allRows, function (index, row) {
            ICurrentRating = 0;
            IRecoForpromotion = 0;
            IComments = 0;
            ToEmployeeId = 0; hdnRMName = 0;
            hdnRowStatus = 0;
            hdnNextApproverId = 0;
            hdnFinalApprover = 0;
            Id = 0;
            finalstatus = 0;
            hdnSLastratingGivenBy = 0;
            hdnLastratingGivenBy = 0;

            var currentRow = $(row);

            element = currentRow.find('td .ddlRatingClass');
            if (element) {
                ICurrentRating = element.val(); //referback
            }

            element = currentRow.find('td .ddlPromoClass');
            if (element) {
                IRecoForpromotion = element.val();
            }

            element = currentRow.find('td textarea');
            if (element) {
                IComments = element.val();
            }

            element = currentRow.find('td #hdnEmployeeId');
            if (element) {
                ToEmployeeId = element.val();
            }


            element = currentRow.find('td #hdnRMName');
            if (element) {
                hdnRMName = element.val();
            }


            element = currentRow.find('td #hdnRowStatus');

            //element = currentRow.find('td:nth-child(2) input:hidden');
            if (element) {
                hdnRowStatus = element.val();
                RowStatus = 4;
                if (hdnRowStatus == 3) {
                    toastr.error("you have chosen already referred back records.");
                    ReferbackValid = 1;
                    return false;
                }
            }


            if (ICurrentRating != "0" || IRecoForpromotion != "0") {
                if (!ReferedbackArray.includes(hdnRMName)) {
                    ReferedbackArray.push(hdnRMName);
                }
            }

            if (ICurrentRating == "0" || IRecoForpromotion == "0") {
                if (ReferedbackArray.includes(hdnRMName)) {

                    ReferbackValidSelection = 1;
                }

            }



            if (hdnRowStatus == 2) {

                RatingList = {
                    AppraisalCycleId: getRatingPagesAppraisalCycleId(),
                    ModifiedBy: sessionStorage.EmployeeId, // ReferBack By
                    PEPEmployeeId: ToEmployeeId,  //PEPEmployeeId
                    // RatingGivenBy: hdnLastratingGivenBy,  // Last rating Given By (Means which DP rating given).
                    Status: 3, // referback 
                    Comments: IComments,
                    RoleId: $('#ddlRole').val(),
                    //  Status: parseInt(4 + hdnRowStatus), // referback status  (4+ hdnRowStatus) means to check it return referenck from HR side.

                };
                RatingArray.push(RatingList);
                check = 1;
            }

        });

        if (!isValid) {
            toastr.error("Skip Level reportees rating and promotions dropdown should be submitted by your direct reportees.");
            return;
        }
    }
    else {
        toastr.error("All employees rating is not selected.");
        return;
    }


    if (ReferbackValid == 0) {

        var finalSelectedEmployees = $('#ddlReportee :selected').val()
        globalcheck = check;
        globalRowStatus = RowStatus;
        globalfinalSelectedEmployees = finalSelectedEmployees;
        globalRatingArrayForReferback = RatingArray;
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + "/Rating/GetEmpName?Input=" + $('#ddlReportee option:selected').val();
        var EmpNames
        CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (result) {
            if (result.Success == true)
                EmpNames = result.Result;
        });
        $('#ReferbackText').text(EmpNames);
        $('#confirmReferbackAlert').modal('show');
        $('#btnconfirmReferbackAlert').off('click').on('click', function () {
            // Your submit button click logic
            confirmedReferback();
        });
    }


}

function confirmedReferback() {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "/Rating/RatingReferBack"

    var msg = '';

    if (globalcheck == 1) {
        msg = 'Rating has been Referred back.';
    }
    else if (globalRowStatus == 3) {
        msg = 'Ratings already Referred back to the Reviewers.';
    }
    else {
        msg = 'No Row Record found to Refer Back.';
    }

    if (globalRatingArrayForReferback.length > 0) {
        $.ajax({
            url: apiPath,
            type: 'POST',
            data: JSON.stringify(globalRatingArrayForReferback),
            async: true,
            dataType: 'json',
            headers: CommonGetHeaderInfo(),
            contentType: 'application/json',
            beforeSend: function (xhr, opts) {
                $('.loader-div').show();
            },
            headers: CommonGetHeaderInfo(),
            success: function (result) {
                Result = result;
                $(".loader-div").hide();
                if (globalcheck == 1) {
                    toastr.success(msg);
                    SendMailAfterAction(sessionStorage.EmployeeId, 'Referback', globalfinalSelectedEmployees);
                    BindReporteeRatings();
                    //changeBackgroundColor();
                }
                else {
                    toastr.error(msg);
                }

                $('.loader-div').hide();
            },
            complete: function (xhr, statusText) {
                if (data === null || data === "") {
                    data = {
                        "statusCode": xhr.status, "statusText": statusText
                    };
                }
            },
            error: function (xhr, statusText, errorThrown) {
                $(".loader-div").hide();
                data = {
                    "statusCode": xhr.status, "statusText": statusText, "error": "error"
                };
            }
        });
    } else {
        msg = 'No Row Record found to Refer Back.';
        toastr.error(msg);

    }
}




function filterschange() {


    var empId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    // $('#ddlReporteeNorm :selected').val();

    // var IReportee = $("#ddlReporteeNorm").val().toString();
    var GradeId = $("#ddlgradeNorm").val().toString();
    var LocationId = $("#ddllocationNorm").val().toString();
    var GroupAccountId = $("#ddlgroupaccountNorm").val().toString();
    var Gender = $("#ddlgenderNorm").val().toString();
    var EmpStatus = $("#ddlEmployeeStatusNorm").val().toString();
    var Promotion = $("#ddlPromotionNorm").val().toString();


    //if (($("#ddlReporteeNorm option").length == $("#ddlReporteeNorm option:selected").length)) {

    //    IReportee = 0;
    //}

    var selectedEmployees = $("#ddlReporteeNorm").val();


    if (selectedEmployees.indexOf("-1") != -1) {
        selectedEmployees[selectedEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    }
    var IReportee = selectedEmployees.toString();



    if (IReportee == "") {
        IReportee = 0;
    }
    if (GradeId == "") {
        GradeId = 0;
    }
    if (LocationId == "") {
        LocationId = 0;
    } if (GroupAccountId == "") {
        GroupAccountId = 0;
    }
    if (Gender == "") {
        Gender = 0;
    }
    if (EmpStatus == "") {
        EmpStatus = 0;
    }


    if (Promotion == "") {
        Promotion = 0;
    }

    var _critNormApi = buildCriticalityApiPayloadFromNormPromoMultiselect($("#ddlCriticalityPriorityNorm"));

    //$('#Normalizationtbl tbody tr:gt(1)').remove();


    //$('#Normalizationtbl tbody').empty();

    var svrPath = CONFIG.get('SERVERNAME') + "/Rating/GetRatingOverallData";

    RequestData = {
        AppraisalCycleId: getRatingPagesAppraisalCycleId(),
        LoginEmployeeId: empId,
        ReporteeIds: IReportee,
        GradeId: GradeId,
        LocationId: LocationId,
        GroupAccountId: GroupAccountId,
        Gender: Gender,
        EmpStatus: EmpStatus,
        Promotion: Promotion,
        RoleId: $('#ddlRole').val(),
        CriticalityPriorityId: _critNormApi.criticalityPriorityIds
    }



    $.ajax({
        type: "POST",
        url: svrPath,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        },
        cache: false,
        data: JSON.stringify(RequestData),
        beforeSend: function (xhr, opts) {
            $('.loader-div').show();
        },
        success: function (ratingOverallData) {

            $('#Normalizationtbl tbody').html('');

            if (ratingOverallData.Success == true) {


                let Arr = ratingOverallData;
                rawDataOverallNorm = ratingOverallData;

                // BindGradePractice(ratingOverallData.Result);
                let outputArray = [];

                let count = 0;

                let start = false

                for (let j = 0; j < Arr.Result.length; j++) {
                    for (let k = 0; k < outputArray.length; k++) {
                        if (Arr.Result[j].GRADE == outputArray[k]) {
                            start = true;
                        }
                    }
                    count++;
                    if (count == 1 && start == false) {
                        outputArray.push(Arr.Result[j].GRADE);
                    }
                    start = false;
                    count = 0;
                }

                //console.log(outputArray);

                var TotalCountGrade = 0;

                var idealTotalEE1 = 0.0;
                var idealTotalEE = 0;
                var idealTotalME = 0;
                var idealTotalBE = 0;

                var RatingGivenTotalEE1 = 0;
                var RatingGivenTotalEE = 0;
                var RatingGivenTotalME = 0;
                var RatingGivenTotalBE = 0;


                var DiffTotalEE1 = 0;
                var DiffTotalEE = 0;
                var DiffTotalME = 0;
                var DiffTotalBE = 0;

                var PerTotalEE1 = 0;
                var PerTotalEE = 0;
                var PerTotalME = 0;
                var PerTotalBE = 0;

                var OverallTotalCount = 0;
                var OverallGiven = 0;
                var OverallDiff = 0;


                for (let j = 0; j < outputArray.length; j++) {

                    var GradewiseTotalCount = 0;
                    var GradewiseEECurrentCount = 0;
                    var GradewiseEE1CurrentCount = 0;
                    var GradewiseBECurrentCount = 0;
                    var GradewiseMECurrentCount = 0;

                    var ME_CurrentCount = 0;
                    var BE_CurrentCount = 0;
                    var EE_CurrentCount = 0;
                    var EE1_CurrentCount = 0;

                    var ME_CurrentCountOverall = 0;
                    var BE_CurrentCountOverall = 0;
                    var EE_CurrentCountOverall = 0;
                    var EE1_CurrentCountOverall = 0;

                    var ME_TotalCount = 0;
                    var BE_TotalCount = 0;
                    var EE_TotalCount = 0;
                    var EE1_TotalCount = 0;

                    //  var OverallTotalCount = 0;
                    var TotalCount = 0;
                    var CurrentCount = 0;
                    var t1 = 0;
                    var t2 = 0;
                    var t3 = 0;
                    var t4 = 0;
                    var t5 = 0;


                    var t1_Per = 0;
                    var t2_Per = 0;
                    var t3_Per = 0;
                    var t4_Per = 0;
                    var t5_Per = 0;

                    var idealEE1 = 0;
                    var idealEE = 0;
                    var idealME = 0;
                    var idealBE = 0;



                    for (let k = 0; k < Arr.Result.length; k++) {

                        if (outputArray[j] == Arr.Result[k].GRADE) {

                            if (TotalCount == 0) {
                                TotalCount += Arr.Result[k].TotalCount;
                            }
                            if (Arr.Result[k].Rating == 'ME') {
                                ME_CurrentCount += Arr.Result[k].CurrentCount;
                                //if (TotalCount == 0) {
                                //    TotalCount += Arr.Result[k].TotalCount;
                                //}

                            }
                            if (Arr.Result[k].Rating == 'EE') {

                                EE_CurrentCount += Arr.Result[k].CurrentCount;
                                //if (TotalCount == 0) {
                                //    TotalCount += Arr.Result[k].TotalCount;
                                //}

                            }
                            if (Arr.Result[k].Rating == 'EE1') {
                                EE1_CurrentCount += Arr.Result[k].CurrentCount;
                                //if (TotalCount == 0) {
                                //    TotalCount += Arr.Result[k].TotalCount;
                                //}


                            }
                            if (Arr.Result[k].Rating == 'BE') {

                                BE_CurrentCount += Arr.Result[k].CurrentCount;
                                //if (TotalCount == 0) {
                                //    TotalCount += Arr.Result[k].TotalCount;
                                //}
                            }



                            idealEE1 = ((TotalCount * 5) / 100).toFixed(2).replace(".00", "");
                            idealEE = ((TotalCount * 25) / 100).toFixed(2).replace(".00", "");
                            idealME = ((TotalCount * 60) / 100).toFixed(2).replace(".00", "");
                            idealBE = ((TotalCount * 10) / 100).toFixed(2).replace(".00", "");

                            t1 = (idealEE1 - EE1_CurrentCount).toFixed(2).replace(".00", "");
                            t2 = (idealEE - EE_CurrentCount).toFixed(2).replace(".00", "");
                            t3 = (idealME - ME_CurrentCount).toFixed(2).replace(".00", "");
                            t4 = (idealBE - BE_CurrentCount).toFixed(2).replace(".00", "");


                            //t1_Per = ((idealEE1 - EE1_CurrentCount) / 100).toFixed(2).replace(".00", "");

                            //t2_Per = ((idealEE - EE_CurrentCount) / 100).toFixed(2).replace(".00", "");

                            //t3_Per = ((idealME - ME_CurrentCount) / 100).toFixed(2).replace(".00", "");

                            //t4_Per = ((idealBE - BE_CurrentCount) / 100).toFixed(2).replace(".00", "");

                            // TotalCount = (EE1_TotalCount + EE_TotalCount + ME_TotalCount + BE_TotalCount)
                            CurrentCount = (EE1_CurrentCount + EE_CurrentCount + ME_CurrentCount + BE_CurrentCount);
                            t5 = TotalCount - CurrentCount;

                            //EE1_CurrentCountOverall += EE1_CurrentCount;
                            //EE_CurrentCountOverall += EE_CurrentCount;
                            //BE_CurrentCountOverall += BE_CurrentCount;
                            //MM_CurrentCountOverall += MM_CurrentCount;


                        }
                    }

                    TotalCountGrade = TotalCountGrade + TotalCount;

                    idealTotalEE1 = (idealTotalEE1 + parseFloat(idealEE1));
                    idealTotalEE = (idealTotalEE + parseFloat(idealEE));
                    idealTotalME = (idealTotalME + parseFloat(idealME));
                    idealTotalBE = (idealTotalBE + parseFloat(idealBE));

                    RatingGivenTotalEE1 = (RatingGivenTotalEE1 + parseFloat(EE1_CurrentCount));
                    RatingGivenTotalEE = (RatingGivenTotalEE + parseFloat(EE_CurrentCount));
                    RatingGivenTotalME = (RatingGivenTotalME + parseFloat(ME_CurrentCount));
                    RatingGivenTotalBE = (RatingGivenTotalBE + parseFloat(BE_CurrentCount));

                    DiffTotalEE1 = (DiffTotalEE1 + parseFloat(t1));
                    DiffTotalEE = (DiffTotalEE + parseFloat(t2));
                    DiffTotalME = (DiffTotalME + parseFloat(t3));
                    DiffTotalBE = (DiffTotalBE + parseFloat(t4));

                    PerTotalEE1 = (PerTotalEE1 + parseFloat(t1_Per));
                    PerTotalEE = (PerTotalEE + parseFloat(t2_Per));
                    PerTotalME = (PerTotalME + parseFloat(t3_Per));
                    PerTotalBE = (PerTotalBE + parseFloat(t4_Per));

                    OverallTotalCount = (OverallTotalCount + parseFloat(TotalCount));
                    OverallGiven = (OverallGiven + parseFloat(CurrentCount));
                    OverallDiff = (OverallDiff + parseFloat(t5));


                    t1_Per = ((EE1_CurrentCount / TotalCount) * 100).toFixed(2).replace(".00", "");

                    t2_Per = ((EE_CurrentCount / TotalCount) * 100).toFixed(2).replace(".00", "");

                    t3_Per = ((ME_CurrentCount / TotalCount) * 100).toFixed(2).replace(".00", "");

                    t4_Per = ((BE_CurrentCount / TotalCount) * 100).toFixed(2).replace(".00", "");


                    TotalEachPer = ((CurrentCount / TotalCount) * 100).toFixed(2).replace(".00", "");;


                    var newRow1 = $("<tr>");
                    var cols = "";
                    cols += '<td>' + outputArray[j] + '</td>';
                    cols += '<td style="text-align: center;">' + TotalCount + '</td>';
                    cols += '<td style="text-align: center;">' + idealEE1 + '</td>';
                    cols += '<td style="text-align: center;">' + EE1_CurrentCount + '</td>';

                    if (parseFloat(t1) < 0) {
                        cols += '<td style="text-align: center;" class="diffcol">' + t1 + '</td>';
                    } else {

                        cols += '<td style="text-align: center;">' + t1 + '</td>';
                    }

                    cols += '<td style="text-align: center;">' + t1_Per + '</td>';
                    cols += '<td style="text-align: center;">' + idealEE + '</td>';
                    cols += '<td style="text-align: center;">' + EE_CurrentCount + '</td>';
                    if (parseFloat(t2) < 0) {
                        cols += '<td style="text-align: center;" class="diffcol">' + t2 + '</td>';
                    } else {

                        cols += '<td style="text-align: center;">' + t2 + '</td>';
                    }
                    cols += '<td style="text-align: center;">' + t2_Per + '</td>';
                    cols += '<td style="text-align: center;">' + idealME + '</td>';
                    cols += '<td style="text-align: center;">' + ME_CurrentCount + '</td>';
                    if (parseFloat(t3) < 0) {
                        cols += '<td style="text-align: center;" class="diffcol">' + t3 + '</td>';
                    } else {

                        cols += '<td style="text-align: center;">' + t3 + '</td>';
                    }
                    cols += '<td style="text-align: center;">' + t3_Per + '</td>';
                    cols += '<td style="text-align: center;">' + idealBE + '</td>';
                    cols += '<td style="text-align: center;">' + BE_CurrentCount + '</td>';

                    if (parseFloat(t4) < 0) {
                        cols += '<td style="text-align: center;" class="diffcol">' + t4 + '</td>';
                    } else {

                        cols += '<td style="text-align: center;">' + t4 + '</td>';
                    }

                    cols += '<td style="text-align: center;">' + t4_Per + '</td>';
                    cols += '<td style="text-align: center;">' + TotalCount + '</td>';
                    cols += '<td style="text-align: center;">' + CurrentCount + '</td>';
                    cols += '<td style="text-align: center;">' + t5 + '</td>';
                    //cols += '<td style="text-align: center;">' + TotalEachPer + '</td>';


                    newRow1.append(cols);
                    $("#Normalizationtbl tbody").append(newRow1);

                }

                PerTotalEE1 = ((RatingGivenTotalEE1 / TotalCountGrade) * 100).toFixed(2).replace(".00", "");
                PerTotalEE = ((RatingGivenTotalEE / TotalCountGrade) * 100).toFixed(2).replace(".00", "");
                PerTotalME = ((RatingGivenTotalME / TotalCountGrade) * 100).toFixed(2).replace(".00", "");
                PerTotalBE = ((RatingGivenTotalBE / TotalCountGrade) * 100).toFixed(2).replace(".00", "");

                if (isNaN(PerTotalEE1)) {
                    PerTotalEE1 = 0;
                }
                if (isNaN(PerTotalEE)) {
                    PerTotalEE = 0;
                }
                if (isNaN(PerTotalME)) {
                    PerTotalME = 0;
                }
                if (isNaN(PerTotalBE)) {
                    PerTotalBE = 0;
                }

                var newRow2 = $("<tr>");
                var cols2 = "";
                cols2 += '<td><b>Total<b/></td>';
                cols2 += '<td style="text-align: center;"><b>' + TotalCountGrade.toFixed(2).replace(".00", "");; + '<b/></td>';
                cols2 += '<td style="text-align: center;"><b>' + idealTotalEE1.toFixed(2).replace(".00", "");; + '<b/></td>';
                cols2 += '<td style="text-align: center;"><b>' + RatingGivenTotalEE1.toFixed(2).replace(".00", "");; + '<b/></td>';
                //cols2 += '<td style="text-align: center;">' + DiffTotalEE1.toFixed(2).replace(".00", "");; + '</td>';

                if (parseFloat(DiffTotalEE1) < 0) {
                    cols2 += '<td style="text-align: center;" class="diffcol"><b>' + DiffTotalEE1.toFixed(2).replace(".00", "");; + '<b/></td>';
                } else {

                    cols2 += '<td style="text-align: center;"><b>' + DiffTotalEE1.toFixed(2).replace(".00", "");; + '<b/></td>';
                }
                cols2 += '<td style="text-align: center;"><b>' + PerTotalEE1 + '<b/></td>';
                cols2 += '<td style="text-align: center;"><b>' + idealTotalEE.toFixed(2).replace(".00", "");; + '<b/></td>';
                cols2 += '<td style="text-align: center;"><b>' + RatingGivenTotalEE.toFixed(2).replace(".00", "");; + '<b/></td>';
                if (parseFloat(DiffTotalEE) < 0) {
                    cols2 += '<td style="text-align: center;" class="diffcol"><b>' + DiffTotalEE.toFixed(2).replace(".00", "");; + '<b/></td>';
                } else {

                    cols2 += '<td style="text-align: center;"><b>' + DiffTotalEE.toFixed(2).replace(".00", "");; + '<b/></td>';
                }
                cols2 += '<td style="text-align: center;"><b>' + PerTotalEE + '<b/></td>';

                cols2 += '<td style="text-align: center;"><b>' + idealTotalME.toFixed(2).replace(".00", "");; + '<b/></td>';
                cols2 += '<td style="text-align: center;"><b>' + RatingGivenTotalME.toFixed(2).replace(".00", "");; + '<b/></td>';

                if (parseFloat(DiffTotalME) < 0) {
                    cols2 += '<td style="text-align: center;" class="diffcol"><b>' + DiffTotalME.toFixed(2).replace(".00", "");; + '<b/></td>';
                } else {

                    cols2 += '<td style="text-align: center;"><b>' + DiffTotalME.toFixed(2).replace(".00", "");; + '<b/></td>';
                }

                cols2 += '<td style="text-align: center;"><b>' + PerTotalME + '<b/></td>';

                cols2 += '<td style="text-align: center;"><b>' + idealTotalBE.toFixed(2).replace(".00", "");; + '<b/></td>';
                cols2 += '<td style="text-align: center;"><b>' + RatingGivenTotalBE.toFixed(2).replace(".00", "");; + '<b/></td>';

                if (parseFloat(DiffTotalBE) < 0) {
                    cols2 += '<td style="text-align: center;" class="diffcol"><b>' + DiffTotalBE.toFixed(2).replace(".00", "");; + '<b/></td>';
                } else {

                    cols2 += '<td style="text-align: center;"><b>' + DiffTotalBE.toFixed(2).replace(".00", "");; + '<b/></td>';
                }

                cols2 += '<td style="text-align: center;"><b>' + PerTotalBE + '<b/></td>';


                cols2 += '<td style="text-align: center;"><b>' + OverallTotalCount.toFixed(2).replace(".00", "");; + '<b/></td>';
                cols2 += '<td style="text-align: center;"><b>' + OverallGiven.toFixed(2).replace(".00", "");; + '<b/></td>';
                cols2 += '<td style="text-align: center;"><b>' + OverallDiff.toFixed(2).replace(".00", "");; + '<b/></td>';


                newRow2.append(cols2);
                $("#Normalizationtbl tbody").append(newRow2);

                //  MyReporteeBellCurve();
            }
        },

        error: function (xhr, ajaxOptions, thrownError) {
            $('.loader-div').hide();
            alert('Failed to retrieve data.');
        }

    });

    BindMaleFemaleNormalization();



    if (ShowGenderLocation.includes(sessionStorage.LocationId)) {

        BellCurve();
    } else {

        MyReporteeBellCurve();
    }

}


function Promofilterschange() {

    var empId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    var IReportee = $("#ddlReporteePromo").val();
    var GradeId = $("#ddlgradePromo").val().toString();
    var LocationId = $("#ddllocationPromo").val().toString();
    var GroupAccountId = $("#ddlgroupaccountPromo").val().toString();
    var Gender = $("#ddlgenderPromo").val().toString();
    var EmpStatus = $("#ddlEmployeeStatusPromo").val().toString();

    var selectedEmployees = $("#ddlReporteePromo").val();


    if (selectedEmployees.indexOf("-1") != -1) {
        selectedEmployees[selectedEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    }
    var IReportee = selectedEmployees.toString();

    if (IReportee == "") {
        IReportee = 0;
    }

    if (GradeId == "") {
        GradeId = 0;
    }
    if (LocationId == "") {
        LocationId = 0;
    } if (GroupAccountId == "") {
        GroupAccountId = 0;
    }
    if (Gender == "") {
        Gender = 0;
    }
    if (EmpStatus == "") {
        EmpStatus = 0;
    }
    var _critPromoApi = buildCriticalityApiPayloadFromNormPromoMultiselect($("#ddlCriticalityPriorityPromo"));
    //var svrPath = CONFIG.get('SERVERNAME');
    //var apiPath = svrPath + "Rating/GetRatingPromotionDetails?AppraisalCycleId=" + getRatingPagesAppraisalCycleId() + "&LogEmpID=" + empId + "&IReportee=" + IReportee + "&GradeId=" + GradeId + "&LocationId=" + LocationId + "&GroupAccountId=" + GroupAccountId + "&Gender=" + Gender + "&EmpStatus=" + EmpStatus + "&RoleId=" + $('#ddlRole').val();


    var svrPath = CONFIG.get('SERVERNAME') + "/Rating/GetRatingPromotionDetails";

    RequestData = {
        AppraisalCycleId: getRatingPagesAppraisalCycleId(),
        LoginEmployeeId: empId,
        ReporteeIds: IReportee,
        GradeId: GradeId,
        LocationId: LocationId,
        GroupAccountId: GroupAccountId,
        Gender: Gender,
        EmpStatus: EmpStatus,
        RoleId: $('#ddlRole').val(),
        CriticalityPriorityId: _critPromoApi.criticalityPriorityIds
    }

    $('#tblPromotionSummary tbody tr:gt(0)').remove();

    $.ajax({
        type: "POST",
        url: svrPath,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        },
        cache: false,
        data: JSON.stringify(RequestData),
        async: true,
        beforeSend: function (xhr, opts) {
            $('.loader-div').show();
        },
        success: function (ratingPromotionOverallData) {

            if (ratingPromotionOverallData.Success == true) {

                var Total = 0;
                var PromotionPer = 0;
                var CurrentorgDistrubutionTotal = 0;
                var TotalPromotoionPercentage = 0;
                var TotalIdealNo = 0;
                var TotalProRecoReceived = 0;
                var TotalRatio = 0;
                var TotalDiff = 0;
                var TotalFinalApproved = 0;
                var TotalFinalApprovedPer = 0;

                rawDataOverallPromotion = ratingPromotionOverallData.Result;

                ratingPromotionOverallData.Result.forEach(function (R1, index) {

                    Total += R1.TotalCount
                    PromotionPer += R1.PromotoionPercentage

                });

                ratingPromotionOverallData.Result.forEach(function (d, index) {


                    var cols = "";

                    var newRow1 = $("<tr>");


                    var CurrentorgDistrubution = 0.00;
                    var IdealNumber = 0;
                    var ratio = 0;
                    var difference = 0;
                    var approvedpercentage = 0;

                    CurrentorgDistrubution = ((d.TotalCount / Total) * 100).toFixed(2).replace(".00", "");

                    if (isNaN((d.TotalCount / Total) * 100)) {
                        CurrentorgDistrubution = 0;
                    } else {
                        CurrentorgDistrubution = ((d.TotalCount / Total) * 100).toFixed(2).replace(".00", "");
                    }

                    CurrentorgDistrubutionTotal += parseFloat(CurrentorgDistrubution);
                    IdealNumber = ((d.TotalCount * d.PromotoionPercentage) / 100).toFixed(2).replace(".00", "");;

                    if (isNaN((d.RecommendationForPromotion / d.TotalCount) * 100)) {
                        ratio = 0;
                        TotalRatio = (TotalRatio + ratio);
                    } else {
                        ratio = ((d.RecommendationForPromotion / d.TotalCount) * 100);
                        TotalRatio = (TotalRatio + ratio);
                    }
                    difference = (d.RecommendationForPromotion - IdealNumber).toFixed(2).replace(".00", "");

                    if (isNaN((d.ApprovedCount / d.TotalCount) * 100)) {
                        approvedpercentage = 0;
                    } else {
                        approvedpercentage = ((d.ApprovedCount / d.TotalCount) * 100).toFixed(2).replace(".00", "");
                    }


                    TotalIdealNo = (TotalIdealNo + ((d.TotalCount * d.PromotoionPercentage) / 100));//.toFixed(2).replace(".00", "");;

                    TotalProRecoReceived = (TotalProRecoReceived + d.RecommendationForPromotion);//.toFixed(2).replace(".00", "");;
                    // TotalRatio = (TotalRatio + ratio);//.toFixed(2).replace(".00", "");;
                    TotalDiff = (parseFloat(TotalDiff) + parseFloat(difference));//.replace(".00", "");;
                    TotalDiff = TotalDiff.toFixed(2);
                    TotalFinalApproved = (parseFloat(TotalFinalApproved) + parseFloat(d.ApprovedCount));//.toFixed(2).replace(".00", "");;
                    TotalFinalApproved = TotalFinalApproved.toFixed(2);

                    TotalFinalApprovedPer = (parseFloat(TotalFinalApprovedPer) + parseFloat(approvedpercentage));//.toFixed(2).replace(".00", "");;
                    TotalFinalApprovedPer = TotalFinalApprovedPer.toFixed(2);
                    ratio = ratio.toFixed(2);

                    if (isNaN(ratio)) {

                        ratio = 0;
                    }
                    TotalPromotoionPercentage = (TotalPromotoionPercentage + parseFloat(d.PromotoionPercentage));

                    cols += '<td style="text-align: center;">' + d.Grade + '</td>';
                    cols += '<td style="text-align: center;">' + d.TotalCount + '</td>';
                    cols += '<td style="text-align: center;" title="Current Org Distribution =  Grade Wise Total Nos. / Total of Grade Wise Total Nos.">' + CurrentorgDistrubution + '</td>';
                    cols += '<td style="text-align: center;">' + (d.PromotoionPercentage) + '</td>';
                    cols += '<td style="text-align: center;"  title="Ideal Nos. =  (Grade Wise Total Nos * Grade Wise Promotion %)/100">' + IdealNumber + '</td>';
                    cols += '<td style="text-align: center;">' + d.RecommendationForPromotion + '</td>';
                    cols += '<td style="text-align: center;"  title="Ratio = Promotion Reco. Received/ Grade Wise Total Nos.">' + ratio + '</td>';

                    if (parseFloat(difference) > 0) {
                        cols += '<td style="text-align: center;" title="Difference = Promotion Reco.Received-Ideals Nos." class="diffcol">' + difference + '</td>';
                    } else {

                        cols += '<td style="text-align: center;" title="Difference = Promotion Reco.Received-Ideals Nos.">' + difference + '</td>';
                    }

                    cols += '<td style="text-align: center;">' + d.ApprovedCount + '</td>';
                    cols += '<td style="text-align: center;">' + approvedpercentage + '</td>';


                    newRow1.append(cols);
                    $("#tblPromotionSummary").append(newRow1);

                })

                var cols = "";

                TotalRatio = (TotalProRecoReceived / Total) * 100;
                if (isNaN(TotalRatio)) {

                    TotalRatio = 0;
                }

                var newRow1 = $("<tr>");
                TotalIdealNo = TotalIdealNo.toFixed(2).replace(".00", "");
                CurrentorgDistrubutionTotal = CurrentorgDistrubutionTotal.toFixed(2).replace(".00", "");
                TotalPromotoionPercentage = TotalPromotoionPercentage.toFixed(2).replace(".00", "");

                cols += '<td style="text-align: center;"><b> Total<b/></td>';
                cols += '<td style="text-align: center;"><b>' + Total + '<b/></td>';
                cols += '<td style="text-align: center;"><b>' + CurrentorgDistrubutionTotal + '<b/></td>';
                cols += '<td style="text-align: center;"><b>  9%<b/></td>'; // this should be fixed on company level --TotalPromotoionPercentage
                cols += '<td style="text-align: center;"><b>' + TotalIdealNo + '<b/></td>';
                cols += '<td style="text-align: center;"><b>' + TotalProRecoReceived + '<b/></td>';
                cols += '<td style="text-align: center;"><b>' + TotalRatio.toFixed(2).replace(".00", "") + '<b/></td>';
                cols += '<td style="text-align: center;"><b>' + TotalDiff + '<b/></td>';
                cols += '<td style="text-align: center;"><b>' + TotalFinalApproved + '<b/></td>';
                cols += '<td style="text-align: center;"><b>' + TotalFinalApprovedPer + '<b/></td>';

                newRow1.append(cols);
                $("#tblPromotionSummary").append(newRow1);
                BindOverAllMaleFemalePromotionSummary();
                bindChart();
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            $('.loader-div').hide();
            alert('Failed to retrieve data.');
        }
    });


}



function BindRoles() {



    if (sessionStorage.IsGDL == 1) {
        $('#spnRole').text('Approver');
        if ((new Date((new Date()).toDateString()) >= new Date((new Date(sessionStorage.GDLDateCheck)).toDateString())) && (new Date((new Date()).toDateString())) <= new Date((new Date(sessionStorage.GDLClosureDate)).toDateString())) {
            $('.divAlert').css('display', 'none');
        }
        else {
            $('.divAlert').css('display', 'inline-block');
            $('.spnRole').text('Approver window has been closed.');
        }
    }
    else if (sessionStorage.IsDP == 1) {
        $('#spnRole').text('Reviewer');
        if ((new Date((new Date()).toDateString()) > new Date((new Date(sessionStorage.DateCheckBelowDP)).toDateString())) && (new Date((new Date()).toDateString()) <= new Date((new Date(sessionStorage.DPClosureDate)).toDateString()))) {
            $('.divAlert').css('display', 'none');
        }
        if ((new Date((new Date()).toDateString()) > new Date((new Date(sessionStorage.DateCheckBelowDP)).toDateString())) && (new Date((new Date()).toDateString()) > new Date((new Date(sessionStorage.DPClosureDate)).toDateString()))) {
            $('.divAlert').css('display', 'inline-block');
            $('.spnRole').text('Now Reviewer window has been closed.');
        }
        else {
            $('.divAlert').css('display', 'inline-block');
            $('.spnRole').text('Now Reviewer window has been closed and Approver window is open.');
        }
    }
    else {
        $('#spnRole').text('Inputter');
        if ((new Date((new Date()).toDateString()) <= new Date((new Date(sessionStorage.DateCheckBelowDP)).toDateString()))) {
            $('.divAlert').css('display', 'none');

        } else
            if ((new Date((new Date()).toDateString()) > new Date((new Date(sessionStorage.DateCheckBelowDP)).toDateString())) && (new Date((new Date()).toDateString()) > new Date((new Date(sessionStorage.DPClosureDate)).toDateString()))) {
                $('.divAlert').css('display', 'inline-block');
                $('.spnRole').text('Now Inputter window has been closed.');
            }
            else {
                $('.divAlert').css('display', 'inline-block');
                if ((new Date((new Date()).toDateString()) > new Date((new Date(sessionStorage.DateCheckBelowDP)).toDateString())) && (new Date((new Date()).toDateString()) <= new Date((new Date(sessionStorage.DPClosureDate)).toDateString()))) {

                    $('.spnRole').text('Now Inputter window has been closed and Reviewer window is open.');
                }

                if ((new Date((new Date()).toDateString()) >= new Date((new Date(sessionStorage.GDLDateCheck)).toDateString())) && (new Date((new Date()).toDateString())) <= new Date((new Date(sessionStorage.GDLClosureDate)).toDateString())) {

                    $('.spnRole').text('Now Inputter and Reviewer window has been closed and Approver window is open.');
                }
            }
    }
}
function bindUnsavedGrid(unsavedData) {
    //alert('insaved')
    $("#tblUnsavedData").css('display', 'block');
    var table = $('#tblUnsavedData').DataTable();

    table.clear();
    $("#tblUnsavedData").DataTable({
        data: unsavedData,
        ordering: false,
        paging: false,
        "bDestroy": true,
        "searching": false,
        info: true,
        "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
        dom: '<"row"<"col-sm-6"Bl><"col-sm-6"f>>' + '<"row"<"col-sm-12"<"table-responsive"tr>>>' + '<"row"<"col-sm-5"i><"col-sm-7"p>>',
        aoColumns: [
            { mData: "SrNo" },
            { mData: "EmployeeName" },
            { mData: "Gender" },
            { mData: "TotalExp" },
            { mData: "InfogainExp" },
            { mData: "PrevRating" },
            { mData: "CurrentRating" },
            { mData: "ReccomendedforProm" },
            { mData: "Comments" },
            { mData: "Error" },

        ],
        "deferRender": true
    });
}
function downloadRatingGrid() {
    //filterData('Not');
    var sortedData = [];
    for (var i = 0; i < rawData.length; i++) {
        if (rawData[i].RatingGivenFlag == '0' && rawData[i].NextApproverId == sessionStorage.EmployeeId) {
            sortedData.push(rawData[i]);

        }
    }
    $("#tblFilteredData").css('display', 'block');
    var table = $('#tblFilteredData').DataTable();

    table.clear();
    $("#tblFilteredData").DataTable({
        data: sortedData,
        ordering: false,
        paging: false,
        "bDestroy": true,
        "searching": false,
        info: true,
        "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
        dom: '<"row"<"col-sm-6"Bl><"col-sm-6"f>>' + '<"row"<"col-sm-12"<"table-responsive"tr>>>' + '<"row"<"col-sm-5"i><"col-sm-7"p>>',
        aoColumns: [
            { mData: "EmployeeName" },
            { mData: "Gender" },
            { mData: "TotalExp" },
            { mData: "InfogainExp" },
            { mData: "PrevRating" },
            { mData: "LastpromotionDate" },
            //{ mData: "" },
            //{ mData: "" },
        ],
        "deferRender": true
    });
    exportTableToCSV(null, 'Ratings.csv');
}
function exportTableToCSV(html, filename) {
    var csv = [];
    var rows = document.querySelectorAll("#tblFilteredData tr");

    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll("td, th");
        for (var j = 0; j < cols.length; j++) {
            row.push(cols[j].innerText);
        }
        csv.push(row.join(","));
    }

    // download csv file
    downloadCSV(csv.join("\n"), filename);
}

function downloadCSV(csv, filename) {
    var csvFile;
    var downloadLink;

    if (window.Blob == undefined || window.URL == undefined || window.URL.createObjectURL == undefined) {
        alert("Your browser doesn't support Blobs");
        return;
    }

    csvFile = new Blob([csv], { type: "text/csv" });
    downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    $("#tblFilteredData").css('display', 'none');
}

//$("#btnNormfilter").click(function () {

//    BindNormalizationOverallData();
//    BindMaleFemaleNormalization();
//    BellCurve();
//});

//$("#btnNormRemovefilter").click(function () {

//    //$("#[id$=ddlgroupaccountNorm ]").multiselect("uncheckAll");
//    //$("#[id$=ddlgradeNorm ]").multiselect("uncheckAll");
//    //$("#[id$=ddllocationNorm ]").multiselect("uncheckAll");


//    $('#ddllocationNorm').find('option:selected').removeAttr('selected');

//    BindNormalizationOverallData();
//    BindMaleFemaleNormalization();
//    BellCurve();
//});

//$("#btnPromofilter").click(function () {

//    BindOverAllPromotionSummary();
//    BindOverAllMaleFemalePromotionSummary();
//    bindChart();
//});



//$("#btnPromtoRemovefilter").click(function () {

//    $("#[id$=ddlgradePromo ]").multiselect("uncheckAll");
//    $("#[id$=ddllocationPromo ]").multiselect("uncheckAll");
//    $("#[id$=ddlgroupaccountPromo ]").multiselect("uncheckAll");

//    BindOverAllPromotionSummary();
//    BindOverAllMaleFemalePromotionSummary();
//    bindChart();
//});

function IsLoginEmployeeSubmittedRating() {
    try {
        var LoginEmployeeId = sessionStorage.EmployeeId;
        var RoleId = $('#ddlRole').val();
        
        // Fix: Ensure RoleId is always a valid integer
        if (!RoleId || RoleId === '' || RoleId === 'undefined' || RoleId === undefined || isNaN(RoleId)) {
            // Try to get from sessionStorage or use a default value
            RoleId = sessionStorage.RoleId || sessionStorage.EmployeeRoleId;
            // Convert to integer and default to 0 if still invalid
            RoleId = parseInt(RoleId) || 0;
        } else {
            // Ensure RoleId is an integer
            RoleId = parseInt(RoleId) || 0;
        }
        
        // Validate required parameters
        if (!getRatingPagesAppraisalCycleId() || !LoginEmployeeId) {
            console.warn('IsLoginEmployeeSubmittedRating: Missing required parameters - AppraisalCycleId:', getRatingPagesAppraisalCycleId(), 'LoginEmployeeId:', LoginEmployeeId);
            IsSubmitted = 0; // Default to not submitted if we can't check
            return;
        }
        
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + 'Rating/IsloginEmpSubmittedRatings?AppraisalCycleId=' + getRatingPagesAppraisalCycleId() + '&LoginEmployeeId=' + LoginEmployeeId + '&RoleId=' + RoleId;
        
        var result = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

        // Fix: Handle jqXHR response from CommonAjaxGET (synchronous call)
        // Check for HTTP error status first
        if (result && result.status && result.status >= 400) {
            console.error('IsLoginEmployeeSubmittedRating: API call failed with HTTP status:', result.status, result.statusText);
            IsSubmitted = 0;
            return;
        }

        // Get response data from jqXHR object
        var responseData = null;
        if (result && result.responseJSON) {
            responseData = result.responseJSON;
        } else if (result && typeof result === 'object' && result.Success !== undefined) {
            // Direct response object (shouldn't happen with CommonAjaxGET, but handle it)
            responseData = result;
        } else {
            console.error('IsLoginEmployeeSubmittedRating: Invalid API response - no responseJSON', result);
            IsSubmitted = 0;
            return;
        }

        // Check if the response indicates success
        if (!responseData || !responseData.Success) {
            console.warn('IsLoginEmployeeSubmittedRating: API returned error', responseData);
            IsSubmitted = 0;
            return;
        }

        // Check if Result exists
        if (!responseData.Result) {
            console.warn('IsLoginEmployeeSubmittedRating: No Result in response', responseData);
            IsSubmitted = 0;
            return;
        }

        // Handle DataSet response structure (Result.data is a DataSet with Tables)
        if (responseData.Result.data && responseData.Result.data.Tables && Array.isArray(responseData.Result.data.Tables) && responseData.Result.data.Tables.length > 0) {
            var table = responseData.Result.data.Tables[0];
            if (table && table.Rows && Array.isArray(table.Rows) && table.Rows.length > 0) {
                var apiResult = table.Rows[0].ReturnResult;
                IsSubmitted = apiResult || 0;
                return;
            }
        }
        
        // Handle array response structure (Result.data is an array)
        if (responseData.Result.data && Array.isArray(responseData.Result.data) && responseData.Result.data.length > 0) {
            var apiResult = responseData.Result.data[0].ReturnResult;
            
            // CRITICAL FIX: If IsSubmitted was preserved (e.g., after criticality save),
            // and the API returns 1 but we know only criticality exists (no rating),
            // preserve the original value to prevent false positive
            if (typeof window._preservedIsSubmitted !== 'undefined' && window._preservedIsSubmitted === 0) {
                // Only override if we explicitly preserved it as 0 (not submitted)
                // This prevents criticality-only saves from marking ratings as submitted
                IsSubmitted = window._preservedIsSubmitted;
            } else {
                IsSubmitted = apiResult || 0; // Default to 0 if apiResult is undefined/null
            }
            return;
        }

        // If we get here, the response structure is unexpected
        console.warn('IsLoginEmployeeSubmittedRating: Unexpected response structure', responseData);
        IsSubmitted = 0;
        
    } catch (error) {
        console.error('IsLoginEmployeeSubmittedRating: Exception occurred', error);
        IsSubmitted = 0; // Default to not submitted on exception
    }
}
function IsDesignationUploaded() {

    var LoginEmployeeId = sessionStorage.EmployeeId;
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'Rating/IsDesignationUploaded?AppraisalCycleId=' + getRatingPagesAppraisalCycleId();
    var result = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    IsDesigUploaded = result.responseJSON.Result.data[0].ReturnResult;

}

function BindDirectReportees() {
    if (!$('#ddlReportee').length) {
        return;
    }

    var LoginEmployeeId = sessionStorage.EmployeeId;
    var svrPath = CONFIG.get('SERVERNAME');
    // Resolve RoleId: ddlRole may not be populated yet when called on initial load (BindRole is async)
    var roleId = $('#ddlRole').val();
    if (roleId == null || roleId === '' || roleId === undefined) {
        var $ddlRole = $('#ddlRole');
        roleId = ($ddlRole.find('option:first').val()) || (typeof EnableRoleId !== 'undefined' ? EnableRoleId : null) || '1';
    }
    var apiPath = svrPath + 'Rating/GetAspireeReporteeList?AppraisalCycleId=' + getRatingPagesAppraisalCycleId() + '&LoginEmployeeId=' + LoginEmployeeId + '&RoleId=' + roleId;
    var ddlreporteelist = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    $('#ddlReportee').empty();
    $('#ddlReportee').multiselect('destroy');


    $('#ddlReportee').append($("<option>").val(-1).text('All My Direct Reportees'));
    $.each(ddlreporteelist.responseJSON.Result.data, function (index, data) {

        $('#ddlReportee').append("<option value=" + data.EmployeeId + " data-IsDP=" + data.IsDP + ">" + data.EmployeeName + "</option>");
        //$('#ddlReportee').append($("<option>").val(data.EmployeeId).text(data.EmployeeName).attr('data-custom', 'custom-value'));

    });

    $('#ddlReportee').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });
    /////////////////

    $("#ddlReportee").val(["-1"]);
    $("#ddlReportee").multiselect('refresh');

    $('#ddlReporteeNorm').empty();
    $('#ddlReporteeNorm').multiselect('destroy');


    //$("#ddlReporteeNorm").append($("<option></option>").val('0').html('None selected'));

    $('#ddlReporteeNorm').append($("<option>").val(-1).text('All My Direct Reportees'));

    $.each(ddlreporteelist.responseJSON.Result.data, function (index, data) {
        $('#ddlReporteeNorm').append($("<option>").val(data.EmployeeId).text(data.EmployeeName));

    });

    $('#ddlReporteeNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });
    //////////////////
    $("#ddlReporteeNorm").val(["-1"]);
    $("#ddlReporteeNorm").multiselect('refresh');



    $('#ddlReporteePromo').empty();



    $('#ddlReporteePromo').multiselect('destroy');


    $('#ddlReporteePromo').append($("<option>").val(-1).text('All My Direct Reportees'));
    //$("#ddlReporteePromo").append($("<option></option>").val('0').html('None selected'));

    $.each(ddlreporteelist.responseJSON.Result.data, function (index, data) {
        $('#ddlReporteePromo').append($("<option>").val(data.EmployeeId).text(data.EmployeeName));

    });

    $('#ddlReporteePromo').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $("#ddlReporteePromo").val(["-1"]);



    $("#ddlReporteePromo").multiselect('refresh');
    //////////////////////////////////////////////////////////////////////

    //////////////////





    ////////////////////////////////////////////////////////////////////

    $('#ddlReportee_RAR').append($("<option>").val(-1).text('All My Direct Reportees'));
    $.each(ddlreporteelist.responseJSON.Result.data, function (index, data) {
        $('#ddlReportee_RAR').append($("<option>").val(data.EmployeeId).text(data.EmployeeName));

    });
    $('#ddlReportee_RAR').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });
}

function BindGrade() {

    var dictGrade = {};
    var sortedGradeKeys = [];
    $.each(rawData, function (index, data) {
        if (dictGrade[data.GradeName] == undefined) {
            dictGrade[data.GradeName] = data.GradeID;
        }
    }
    );

    sortedGradeKeys = Object.keys(dictGrade).sort();

    $('#ddlgrade').empty();

    for (let t = 0; t < sortedGradeKeys.length; t++) {
        if (sortedGradeKeys[t] != 'C') {
            $('#ddlgrade').append($("<option>").val(dictGrade[sortedGradeKeys[t]]).text(sortedGradeKeys[t]));
        }
    }

    $('#ddlgrade').multiselect('destroy');

    $('#ddlgrade').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgrade').multiselect('refresh');


}


//function ddlEmployeeStatus_RAR() {

//    var dictEmpStatus = {};
//    var sortedEmpStatuseKeys = [];
//    $.each(approvedReportees, function (index, data) {
//        if (dictEmpStatus[data.EmployeeStatus] == undefined) {

//            if (data.EmployeeStatus == 'A') {
//                dictEmpStatus["Active"] = data.EmployeeStatus;
//            } else if (data.EmployeeStatus == 'R') {
//                dictEmpStatus["Resigned"] = data.EmployeeStatus;
//            } else { dictEmpStatus["Exited"] = data.EmployeeStatus; }
//        }
//    }
//    );

//    sortedEmpStatuseKeys = Object.keys(dictEmpStatus).sort();

//    $('#ddlEmployeeStatus_RAR').empty();

//    for (let t = 0; t < sortedEmpStatuseKeys.length; t++) {
//        $('#ddlEmployeeStatus_RAR').append($("<option>").val(dictEmpStatus[sortedEmpStatuseKeys[t]]).text(sortedEmpStatuseKeys[t]));

//    }

//    $('#ddlEmployeeStatus_RAR').multiselect('destroy');

//    $('#ddlEmployeeStatus_RAR').multiselect({
//        includeSelectAllOption: true,
//        enableFiltering: true,
//        enableCaseInsensitiveFiltering: true,
//        maxHeight: 150
//    });

//    $('#ddlEmployeeStatus_RAR').multiselect('refresh');


//}

function BindEmployeeStatus() {

    var dictEmpStatus = {};
    var sortedEmpStatuseKeys = [];
    $.each(rawData, function (index, data) {
        if (dictEmpStatus[data.EmployeeStatus] == undefined) {

            if (data.EmployeeStatus == 'A') {
                dictEmpStatus["Active"] = data.EmployeeStatus;
            } else if (data.EmployeeStatus == 'R') {
                dictEmpStatus["Resigned"] = data.EmployeeStatus;
            } else { dictEmpStatus["Exited"] = data.EmployeeStatus; }
        }
    }
    );

    sortedEmpStatuseKeys = Object.keys(dictEmpStatus).sort();

    $('#ddlEmployeeStatus').empty();

    for (let t = 0; t < sortedEmpStatuseKeys.length; t++) {
        $('#ddlEmployeeStatus').append($("<option>").val(dictEmpStatus[sortedEmpStatuseKeys[t]]).text(sortedEmpStatuseKeys[t]));

    }

    $('#ddlEmployeeStatus').multiselect('destroy');

    $('#ddlEmployeeStatus').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlEmployeeStatus').multiselect('refresh');


}

function Bind_ddllocation() {

    var dictLocation = {};
    var sortedLocationKeys = [];
    $.each(rawData, function (index, data) {
        if (dictLocation[data.LocationName] == undefined) {

            if (data.LocationID == 1) {
                dictLocation["India"] = data.LocationID;
            }
            else if (data.LocationID == 3) {
                dictLocation["US"] = data.LocationID;
            }
            else { dictLocation["ROW"] = data.LocationID; }
        }
    }
    );

    sortedLocationKeys = Object.keys(dictLocation).sort();

    $('#ddllocation').empty();

    for (let t = 0; t < sortedLocationKeys.length; t++) {
        if (sortedLocationKeys[t] != 'C') {
            $('#ddllocation').append($("<option>").val(dictLocation[sortedLocationKeys[t]]).text(sortedLocationKeys[t]));
        }
    }

    $('#ddllocation').multiselect('destroy');

    $('#ddllocation').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddllocation').multiselect('refresh');


}

function Bind_ddllocationNorm() {

    var dictLocation = {};
    var sortedLocationKeys = [];
    $.each(rawData, function (index, data) {
        if (dictLocation[data.LocationName] == undefined) {

            if (data.LocationID == 1) {
                dictLocation["India"] = data.LocationID;
            }
            else if (data.LocationID == 3) {
                dictLocation["US"] = data.LocationID;
            }
            else { dictLocation["ROW"] = data.LocationID; }
        }
    }
    );

    sortedLocationKeys = Object.keys(dictLocation).sort();

    $('#ddllocationNorm').empty();

    for (let t = 0; t < sortedLocationKeys.length; t++) {

        $('#ddllocationNorm').append($("<option>").val(dictLocation[sortedLocationKeys[t]]).text(sortedLocationKeys[t]));

    }

    $('#ddllocationNorm').multiselect('destroy');

    $('#ddllocationNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddllocationNorm').multiselect('refresh');


}
function Bind_ddllocationPromo() {

    var dictLocation = {};
    var sortedLocationKeys = [];
    $.each(rawData, function (index, data) {
        if (dictLocation[data.LocationName] == undefined) {

            if (data.LocationID == 1) {
                dictLocation["India"] = data.LocationID;
            }
            else if (data.LocationID == 3) {
                dictLocation["US"] = data.LocationID;
            }
            else { dictLocation["ROW"] = data.LocationID; }
        }
    }
    );

    sortedLocationKeys = Object.keys(dictLocation).sort();

    $('#ddllocationPromo').empty();

    for (let t = 0; t < sortedLocationKeys.length; t++) {

        $('#ddllocationPromo').append($("<option>").val(dictLocation[sortedLocationKeys[t]]).text(sortedLocationKeys[t]));

    }

    $('#ddllocationPromo').multiselect('destroy');

    $('#ddllocationPromo').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddllocationPromo').multiselect('refresh');


}

//function Bind_ddllocationPractice() {

//    var dictLocation = {};
//    var sortedLocationKeys = [];
//    $.each(rawData, function (index, data) {
//        if (dictLocation[data.LocationName] == undefined) {

//            if (data.LocationID == 1) {
//                dictLocation["India"] = data.LocationID;
//            }
//            else if (data.LocationID == 3) {
//                dictLocation["US"] = data.LocationID;
//            }
//            else { dictLocation["ROW"] = data.LocationID; }
//        }
//    }
//    );

//    sortedLocationKeys = Object.keys(dictLocation).sort();

//    $('#ddllocationPractice').empty();

//    for (let t = 0; t < sortedLocationKeys.length; t++) {

//        $('#ddllocationPractice').append($("<option>").val(dictLocation[sortedLocationKeys[t]]).text(sortedLocationKeys[t]));

//    }

//    $('#ddllocationPractice').multiselect('destroy');

//    $('#ddllocationPractice').multiselect({
//        includeSelectAllOption: true,
//        enableFiltering: true,
//        enableCaseInsensitiveFiltering: true,
//        maxHeight: 150
//    });

//    $('#ddllocationPractice').multiselect('refresh');


//}




function Bind_ddllocationRAR() {

    var dictLocation = {};
    var sortedLocationKeys = [];
    $.each(approvedReportees, function (index, data) {
        if (dictLocation[data.LocationName] == undefined) {

            if (data.LocationID == 1) {
                dictLocation["India"] = data.LocationID;
            }
            else if (data.LocationID == 3) {
                dictLocation["US"] = data.LocationID;
            }
            else { dictLocation["ROW"] = data.LocationID; }
        }
    }
    );

    sortedLocationKeys = Object.keys(dictLocation).sort();

    $('#ddllocation_RAR').empty();

    for (let t = 0; t < sortedLocationKeys.length; t++) {

        $('#ddllocation_RAR').append($("<option>").val(dictLocation[sortedLocationKeys[t]]).text(sortedLocationKeys[t]));

    }

    $('#ddllocation_RAR').multiselect('destroy');

    $('#ddllocation_RAR').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddllocation_RAR').multiselect('refresh');


}

function BindGradePromo() {
    var dictGrade = {};
    var sortedGradeKeys = [];
    $.each(rawDataOverallPromotion, function (index, data) {
        if (dictGrade[data.Grade] == undefined) {
            dictGrade[data.Grade] = data.GradeId;
        }
    });

    sortedGradeKeys = Object.keys(dictGrade).sort();

    $('#ddlgradePromo').empty();

    for (let t = 0; t < sortedGradeKeys.length; t++) {
        if (sortedGradeKeys[t] != 'C') {
            $('#ddlgradePromo').append($("<option>").val(dictGrade[sortedGradeKeys[t]]).text(sortedGradeKeys[t]));
        }
    }

    $('#ddlgradePromo').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });
}
function BindGradeRAR() {
    var dictGrade = {};
    var sortedGradeKeys = [];
    $.each(approvedReportees, function (index, data) {
        if (dictGrade[data.GradeName] == undefined) {
            dictGrade[data.GradeName] = data.GradeID;
        }
    });

    sortedGradeKeys = Object.keys(dictGrade).sort();

    $('#ddlgrade_RAR').empty();

    for (let t = 0; t < sortedGradeKeys.length; t++) {
        if (sortedGradeKeys[t] != 'C') {
            $('#ddlgrade_RAR').append($("<option>").val(dictGrade[sortedGradeKeys[t]]).text(sortedGradeKeys[t]));
        }
    }

    $('#ddlgrade_RAR').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });
}
function BindGradePractice() {

    var dictGrade = {};
    var sortedGradeKeys = [];
    $.each(rawDataOverallNorm.Result, function (index, data) {
        if (dictGrade[data.GRADE] == undefined) {
            dictGrade[data.GRADE] = data.GradeId;
        }
    });

    ddlgradePractice = Object.keys(dictGrade).sort();


    $('#ddlgradePractice').empty();

    for (let t = 0; t < sortedGradeKeys.length; t++) {
        if (sortedGradeKeys[t] != 'C') {
            $('#ddlgradePractice').append($("<option>").val(dictGrade[sortedGradeKeys[t]]).text(sortedGradeKeys[t]));
        }
    }
    $('#ddlgradePractice').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

}


function BindGradeNorm() {

    var dictGrade = {};
    var sortedGradeKeys = [];
    $.each(rawDataOverallNorm.Result, function (index, data) {
        if (dictGrade[data.GRADE] == undefined) {
            dictGrade[data.GRADE] = data.GradeId;
        }
    });

    sortedGradeKeys = Object.keys(dictGrade).sort();


    $('#ddlgradeNorm').empty();
    $('#ddlgradeNorm').multiselect('destroy');



    for (let t = 0; t < sortedGradeKeys.length; t++) {
        if (sortedGradeKeys[t] != 'C') {
            $('#ddlgradeNorm').append($("<option>").val(dictGrade[sortedGradeKeys[t]]).text(sortedGradeKeys[t]));
        }
    }

    $('#ddlgradeNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });


    $('#ddlgradeNorm').multiselect('refresh');
}


$('#ddlEmployeeStatus_RAR').on('change', function () {

    ddlEmployeeStatusRARChange();

});
function ddlEmployeeStatusRARChange() {

    var EmpStatusarray = [];
    var filterData = [];

    var ddlEmployeeStatus = $("#ddlEmployeeStatus_RAR").val().toString();

    EmpStatusarray = ddlEmployeeStatus.split(',');

    for (let j = 0; j < rawData.length; j++) {
        for (let k = 0; k < EmpStatusarray.length; k++) {
            if (rawData[j].EmployeeStatus == EmpStatusarray[k]) {
                filterData.push(rawData[j]);

            }
        }
    }
    approvedReportees = filterData;

    if (EmpStatusarray.length > 0 && EmpStatusarray[0].length > 0) {
        filterApprovedData('tblApprovedReporteeList');
        // BindTableForFilters(filterData)
    } else {
        BindTableForFilters(rawData);
    }
}

function ddlEmployeeStatusChange() {
    checkSpanFilter();
    BindNormalizationOverallDataOnInstertionScreen();
    var EmpStatusarray = [];
    var filterData = [];

    var ddlEmployeeStatus = $("#ddlEmployeeStatus").val().toString();

    EmpStatusarray = ddlEmployeeStatus.split(',');

    for (let j = 0; j < rawData.length; j++) {
        for (let k = 0; k < EmpStatusarray.length; k++) {
            if (rawData[j].EmployeeStatus == EmpStatusarray[k]) {
                filterData.push(rawData[j]);
            }
        }
    }

    if (EmpStatusarray.length > 0 && EmpStatusarray[0].length > 0 && filterData.length > 0) {
        BindTableForFilters(filterData)
    } else {
        BindTableForFilters(rawData)
    }
}
//$('#ddlgrade').on('change', function () {

//    ddlGradeOnChange();

//});

function checkSpanFilter() {

    //var totalOptions = $("#ddlReportee option").length;

    //var selectedOptions = $("#ddlReportee option:selected").length;

    //if (totalOptions != selectedOptions) {

    //    $("#ddlReportee").multiselect('selectAll', false);

    //    $("#ddlReportee").multiselect("refresh");

    //    BindReporteeRatings();

    // }

}

function ddlGradeOnChange() {

    checkSpanFilter(); BindNormalizationOverallDataOnInstertionScreen();

    var gradearray = [];
    var filterData = [];

    var ddlgrade = $("#ddlgrade").val().toString();

    gradearray = ddlgrade.split(',');

    for (let j = 0; j < rawData.length; j++) {
        for (let k = 0; k < gradearray.length; k++) {
            if (rawData[j].GradeID == gradearray[k]) {
                filterData.push(rawData[j]);
            }
        }
    }

    if (gradearray.length > 0 && gradearray[0].length > 0 && filterData > 0) {
        BindTableForFilters(filterData)
    } else {
        BindTableForFilters(rawData)
    }
}

//$('#ddlgroupaccount').on('change', function () {

//    var Groupaccountarray = [];
//    var filterData = [];

//    var ddlGroupaccount = $("#ddlgroupaccount").val().toString();

//    Groupaccountarray = ddlGroupaccount.split(',');

//    for (let j = 0; j < rawData.length; j++) {
//        for (let k = 0; k < Groupaccountarray.length; k++) {
//            if (rawData[j].AccountGroupID == Groupaccountarray[k]) {
//                filterData.push(rawData[j]);
//            }
//        }
//    }
//    if (Groupaccountarray.length > 0 && Groupaccountarray[0].length > 0) {
//        BindTableForFilters(filterData)
//    } else {
//        BindTableForFilters(rawData)
//    }

//});

//$('#ddllocation').on('change', function () {

//    ddlLocationOnChange();
//});

function ddlLocationOnChange() {
    checkSpanFilter();
    BindNormalizationOverallDataOnInstertionScreen();
    var locationarray = [];
    var filterData = [];

    var ddllocation = $("#ddllocation").val().toString();

    locationarray = ddllocation.split(',');

    for (let j = 0; j < rawData.length; j++) {
        for (let k = 0; k < locationarray.length; k++) {
            if (rawData[j].LocationID == locationarray[k]) {
                filterData.push(rawData[j]);
            }
        }
    }
    if (locationarray.length > 0 && locationarray[0].length > 0 && filterData.length > 0) {
        BindTableForFilters(filterData)
    } else {
        BindTableForFilters(rawData)
    }
}

function ddlgenderOnChange() {
    checkSpanFilter();
    BindNormalizationOverallDataOnInstertionScreen();
    var genderarray = [];
    var filterData = [];

    var ddlgender = $("#ddlgender").val().toString();

    genderarray = ddlgender.split(',');

    for (let j = 0; j < rawData.length; j++) {
        for (let k = 0; k < genderarray.length; k++) {
            if (rawData[j].Gender == genderarray[k]) {
                filterData.push(rawData[j]);
            }
        }
    }
    if (genderarray.length > 0 && genderarray[0].length > 0 && filterData.length > 0) {
        BindTableForFilters(filterData)
    } else {
        BindTableForFilters(rawData)
    }
}


var FilterrawData = [];

var FilterPromorawData = [];


function FirstScreenfilterschange() {


    BindNormalizationOverallDataOnInstertionScreen();


    FilterrawData = [];

    var gradearray = [];

    if ($("#ddlgrade option:selected").length > 0) {

        var filterData = [];

        var ddlgrade = $("#ddlgrade").val().toString();

        gradearray = ddlgrade.split(',');

        if (FilterrawData.length == 0) {
            for (let j = 0; j < rawData.length; j++) {
                for (let k = 0; k < gradearray.length; k++) {
                    if (rawData[j].GradeID == gradearray[k]) {

                        const empId = rawData[j].PEPEmployeeId;

                        // Check if empId already exists in filterData
                        const exists = filterData.some(item => item.PEPEmployeeId === empId);

                        if (!exists) {
                            filterData.push(rawData[j]);
                        }


                    }
                }
            }
        } else {
            for (let j = 0; j < FilterrawData.length; j++) {
                for (let k = 0; k < gradearray.length; k++) {
                    if (FilterrawData[j].GradeID == gradearray[k]) {

                        const empId = FilterrawData[j].PEPEmployeeId;

                        // Check if empId already exists in filterData
                        const exists = filterData.some(item => item.PEPEmployeeId === empId);

                        if (!exists) {
                            filterData.push(FilterrawData[j]);
                        }
                        // filterData.push(FilterrawData[j]);
                    }
                }
            }
        }
        FilterrawData = filterData;
    }

    var genderarray = [];

    if ($("#ddlgender option:selected").length > 0) {

        var filterData = [];


        var ddlgender = $("#ddlgender").val().toString();

        genderarray = ddlgender.split(',');

        if (FilterrawData.length == 0) {
            for (let j = 0; j < rawData.length; j++) {
                for (let k = 0; k < genderarray.length; k++) {
                    if (rawData[j].Gender == genderarray[k]) {

                        const empId = rawData[j].PEPEmployeeId;

                        // Check if empId already exists in filterData
                        const exists = filterData.some(item => item.PEPEmployeeId === empId);

                        if (!exists) {
                            filterData.push(rawData[j]);
                        }

                        //filterData.push(rawData[j]);
                    }
                }
            }
        } else {

            for (let j = 0; j < FilterrawData.length; j++) {
                for (let k = 0; k < genderarray.length; k++) {
                    if (FilterrawData[j].Gender == genderarray[k]) {

                        const empId = FilterrawData[j].PEPEmployeeId;

                        // Check if empId already exists in filterData
                        const exists = filterData.some(item => item.PEPEmployeeId === empId);

                        if (!exists) {
                            filterData.push(FilterrawData[j]);
                        }
                        //  filterData.push(FilterrawData[j]);
                    }
                }
            }
        }

        FilterrawData = filterData;
    }

    var locationarray = [];

    if ($("#ddllocation option:selected").length > 0) {

        var filterData = [];

        var ddllocation = $("#ddllocation").val().toString();
        locationarray = ddllocation.split(',');

        if (FilterrawData.length == 0) {
            for (let j = 0; j < rawData.length; j++) {
                for (let k = 0; k < locationarray.length; k++) {
                    if (rawData[j].LocationID == locationarray[k]) {

                        const empId = rawData[j].PEPEmployeeId;

                        // Check if empId already exists in filterData
                        const exists = filterData.some(item => item.PEPEmployeeId === empId);

                        if (!exists) {
                            filterData.push(rawData[j]);
                        }

                        // filterData.push(rawData[j]);
                    }
                }
            }
        } else {

            for (let j = 0; j < FilterrawData.length; j++) {
                for (let k = 0; k < locationarray.length; k++) {
                    if (FilterrawData[j].LocationID == locationarray[k]) {

                        const empId = FilterrawData[j].PEPEmployeeId;

                        // Check if empId already exists in filterData
                        const exists = filterData.some(item => item.PEPEmployeeId === empId);

                        if (!exists) {
                            filterData.push(FilterrawData[j]);
                        }
                        // filterData.push(FilterrawData[j]);
                    }
                }
            }
        }

        FilterrawData = filterData;
    }


    var Groupaccountarray = [];
    if ($("#ddlgroupaccount option:selected").length > 0) {


        var filterData = [];
        var ddlGroupaccount = $("#ddlgroupaccount").val().toString();
        Groupaccountarray = ddlGroupaccount.split(',');

        if (FilterrawData.length == 0) {
            for (let j = 0; j < rawData.length; j++) {
                for (let k = 0; k < Groupaccountarray.length; k++) {
                    if (rawData[j].AccountGroupId == Groupaccountarray[k]) {

                        const empId = rawData[j].PEPEmployeeId;

                        // Check if empId already exists in filterData
                        const exists = filterData.some(item => item.PEPEmployeeId === empId);

                        if (!exists) {
                            filterData.push(rawData[j]);
                        }

                        // filterData.push(rawData[j]);
                    }
                }
            }
        } else {

            for (let j = 0; j < FilterrawData.length; j++) {
                for (let k = 0; k < Groupaccountarray.length; k++) {
                    if (FilterrawData[j].AccountGroupId == Groupaccountarray[k]) {

                        const empId = FilterrawData[j].PEPEmployeeId;

                        // Check if empId already exists in filterData
                        const exists = filterData.some(item => item.PEPEmployeeId === empId);

                        if (!exists) {
                            filterData.push(FilterrawData[j]);
                        }
                        //filterData.push(FilterrawData[j]);
                    }
                }
            }
        }

        FilterrawData = filterData;
    }

    var EmpStatusarray = [];


    if ($("#ddlEmployeeStatus option:selected").length > 0) {

        var filterData = [];

        var ddlEmployeeStatus = $("#ddlEmployeeStatus").val().toString();

        EmpStatusarray = ddlEmployeeStatus.split(',');

        if (FilterrawData.length == 0) {
            for (let j = 0; j < rawData.length; j++) {
                for (let k = 0; k < EmpStatusarray.length; k++) {
                    if (rawData[j].EmployeeStatus == EmpStatusarray[k]) {
                        const empId = rawData[j].PEPEmployeeId;

                        // Check if empId already exists in filterData
                        const exists = filterData.some(item => item.PEPEmployeeId === empId);

                        if (!exists) {
                            filterData.push(rawData[j]);
                        }

                        // filterData.push(rawData[j]);
                    }
                }
            }
        } else {

            for (let j = 0; j < FilterrawData.length; j++) {
                for (let k = 0; k < EmpStatusarray.length; k++) {
                    if (FilterrawData[j].EmployeeStatus == EmpStatusarray[k]) {

                        const empId = FilterrawData[j].PEPEmployeeId;

                        // Check if empId already exists in filterData
                        const exists = filterData.some(item => item.PEPEmployeeId === empId);

                        if (!exists) {
                            filterData.push(FilterrawData[j]);
                        }
                        //filterData.push(FilterrawData[j]);
                    }
                }
            }
        }

        FilterrawData = filterData;
    }


    var promotionarray = [];

    if ($("#ddlPromotion option:selected").length > 0) {

        var filterData = [];

        var ddlPromotion = $("#ddlPromotion").val().toString();

        promotionarray = ddlPromotion.split(',');


        if (FilterrawData.length == 0) {
            for (let j = 0; j < rawData.length; j++) {
                for (let k = 0; k < promotionarray.length; k++) {

                    if ((rawData[j].RecoForPromotion == promotionarray[k])) {

                        const empId = rawData[j].PEPEmployeeId;

                        // Check if empId already exists in filterData
                        const exists = filterData.some(item => item.PEPEmployeeId === empId);

                        if (!exists) {
                            filterData.push(rawData[j]);
                        }


                        //filterData.push(rawData[j]);
                    }


                    if ((rawData[j].IsEligibleForPromotion == promotionarray[k])) {

                        const empId = rawData[j].PEPEmployeeId;

                        // Check if empId already exists in filterData
                        const exists = filterData.some(item => item.PEPEmployeeId === empId);

                        if (!exists) {
                            filterData.push(rawData[j]);
                        }

                        //filterData.push(rawData[j]);
                    }
                }
            }
        } else {

            let selectedFilters = promotionarray; // example: Yes for Reco and Yes for Eligible

            // Split them into two separate filter groups
            let recoFilters = selectedFilters.filter(v => v === '1' || v === '2'); // reco: yes/no
            let eligibleFilters = selectedFilters.filter(v => v === '3' || v === '4'); // eligible: yes/no

            //   var filterData = [];

            for (let i = 0; i < FilterrawData.length; i++) {
                let item = FilterrawData[i];

                const empId = FilterrawData[i].PEPEmployeeId;

                // Check if empId already exists in filterData
                const exists = filterData.some(item => item.PEPEmployeeId === empId);

                if (!exists) {

                    let reco = item.RecoForPromotion?.toString();
                    let eligible = item.IsEligibleForPromotion?.toString();

                    let recoMatch = recoFilters.length === 0 || recoFilters.includes(reco);
                    let eligibleMatch = eligibleFilters.length === 0 || eligibleFilters.includes(eligible);

                    // If both filter types are selected, item must match BOTH
                    if (recoFilters.length > 0 && eligibleFilters.length > 0) {
                        if (recoMatch && eligibleMatch) {
                            filterData.push(item);
                        }
                    }
                    // If only reco selected
                    else if (recoFilters.length > 0 && eligibleFilters.length === 0) {
                        if (recoMatch) {
                            filterData.push(item);
                        }
                    }
                    // If only eligible selected
                    else if (eligibleFilters.length > 0 && recoFilters.length === 0) {
                        if (eligibleMatch) {
                            filterData.push(item);
                        }
                    }
                    // If no filter selected, you can include everything (optional)
                    else if (recoFilters.length === 0 && eligibleFilters.length === 0) {
                        filterData.push(item);
                    }
                }
            }

        }
        FilterrawData = filterData;

    }

    var critBar = getFiltersDropCriticalitySelect();
    if (critBar.length && critBar.val() && critBar.val().length) {
        var pReqBar = parseCriticalityFilterForRequest(critBar);
        var sourceCrit = FilterrawData.length ? FilterrawData : rawData;
        var filterDataCrit = sourceCrit.slice();
        if (pReqBar.skipClientCriticalityFiltering) {
            filterDataCrit = sourceCrit.slice();
        } else if (pReqBar.applyClientCriticalityUnion) {
            filterDataCrit = filterRawDataCriticalityUnion(sourceCrit, pReqBar.unionPriorityIds, pReqBar.includeNotCriticalInUnion);
        } else if (pReqBar.applyClientNotCriticalFilter) {
            filterDataCrit = filterRawDataToNotCritical(sourceCrit);
        } else if (pReqBar.criticalityPriorityIdParam) {
            // GetRatingData already applied CriticalityPriorityId; re-filtering client-side breaks when
            // rows use legacy P1/P2/P3 text vs dropdown Ids — keep server result as-is.
            filterDataCrit = sourceCrit.slice();
        }
        FilterrawData = filterDataCrit;
    }

    var hasCritBarFilter = critBar.length && critBar.val() && critBar.val().length;

    if ((promotionarray.length > 0 && promotionarray[0].length > 0) || (gradearray.length > 0 && gradearray[0].length > 0) || (genderarray.length > 0 && genderarray[0].length > 0) || (locationarray.length > 0 && locationarray[0].length > 0) || (Groupaccountarray.length > 0 && Groupaccountarray[0].length > 0) || (EmpStatusarray.length > 0 && EmpStatusarray[0].length > 0) || hasCritBarFilter) {
        BindTableForFilters(FilterrawData)
    } else {
        BindTableForFilters(rawData)
    }

}




//$('#ddlgender_RAR').on('change', function () {

//    ddlgender_RAROnChange();
//});


//function ddlgender_RAROnChange() {
//    var genderarray = [];
//    var filterApprovedData = [];

//    var ddlgender_RAR = $("#ddlgender_RAR").val().toString();

//    genderarray = ddlgender_RAR.split(',');

//    for (let j = 0; j < approvedReportees.length; j++) {
//        for (let k = 0; k < genderarray.length; k++) {
//            if (approvedReportees[j].Gender == genderarray[k]) {
//                filterApprovedData.push(approvedReportees[j]);
//            }
//        }
//    }

//    approvedReportees = filterApprovedData;

//    if (genderarray.length > 0 && genderarray[0].length > 0) {
//        filterApprovedData('tblApprovedReporteeList');
//        // BindTableForFilters(filterData)
//    } else {
//        BindTableForFilters(rawData);
//    }
//}



$('#ddlReportee').on('change', function (e) {

    setTimeout(BindReporteeRatings, 500);
    setTimeout(BindNormalizationOverallDataOnInstertionScreen, 500);
    setTimeout(RatingFilterTab, 500);

    $('.loader-div').show();
});

// Fetch cycle information for dynamic table headers
function FetchCycleInfoForTableHeaders(callback) {
    var appraisalCycleId = getRatingPagesAppraisalCycleId() || currentAppraisalCycleId;
    if (!appraisalCycleId || appraisalCycleId == 0) {
        // Fallback to default values
        cycleInfo.current = { AppraisalCycleId: 11, ShortFYName: 'FY-26' };
        cycleInfo.prev1 = { AppraisalCycleId: 10, ShortFYName: 'FY-25' };
        cycleInfo.prev2 = { AppraisalCycleId: 9, ShortFYName: 'FY-24' };
        if (callback) callback();
        return;
    }

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating/GetCyclesForTableHeaders?AppraisalCycleId=" + appraisalCycleId;
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    CommonAjaxGET(apiPath, headerInfo).done(function(response) {
        if (response && response.Success && response.Result && response.Result.length > 0) {
            var cycles = response.Result;
            
            // Find current cycle
            var currentCycle = cycles.find(function(c) { return c.IsCurrent === true; });
            if (currentCycle) {
                cycleInfo.current = {
                    AppraisalCycleId: currentCycle.AppraisalCycleId,
                    ShortFYName: currentCycle.ShortFYName || 'FY-' + String(currentCycle.AppraisalCycleId).slice(-2)
                };
            }

            // Get previous cycles (non-current, sorted by ID)
            var prevCycles = cycles.filter(function(c) { return c.IsCurrent === false; }).sort(function(a, b) {
                return a.AppraisalCycleId - b.AppraisalCycleId;
            });

            if (prevCycles.length > 0) {
                cycleInfo.prev1 = {
                    AppraisalCycleId: prevCycles[prevCycles.length - 1].AppraisalCycleId,
                    ShortFYName: prevCycles[prevCycles.length - 1].ShortFYName || 'FY-' + String(prevCycles[prevCycles.length - 1].AppraisalCycleId).slice(-2)
                };
            }
            if (prevCycles.length > 1) {
                cycleInfo.prev2 = {
                    AppraisalCycleId: prevCycles[prevCycles.length - 2].AppraisalCycleId,
                    ShortFYName: prevCycles[prevCycles.length - 2].ShortFYName || 'FY-' + String(prevCycles[prevCycles.length - 2].AppraisalCycleId).slice(-2)
                };
            }

            // Update table headers
            UpdateTableHeaders();
        } else {
            // Fallback to default values
            cycleInfo.current = { AppraisalCycleId: appraisalCycleId, ShortFYName: 'FY-' + String(appraisalCycleId).slice(-2) };
            cycleInfo.prev1 = { AppraisalCycleId: appraisalCycleId - 1, ShortFYName: 'FY-' + String(appraisalCycleId - 1).slice(-2) };
            cycleInfo.prev2 = { AppraisalCycleId: appraisalCycleId - 2, ShortFYName: 'FY-' + String(appraisalCycleId - 2).slice(-2) };
            UpdateTableHeaders();
        }
        
        if (callback) callback();
    }).fail(function() {
        // Fallback to default values on error
        cycleInfo.current = { AppraisalCycleId: appraisalCycleId, ShortFYName: 'FY-' + String(appraisalCycleId).slice(-2) };
        cycleInfo.prev1 = { AppraisalCycleId: appraisalCycleId - 1, ShortFYName: 'FY-' + String(appraisalCycleId - 1).slice(-2) };
        cycleInfo.prev2 = { AppraisalCycleId: appraisalCycleId - 2, ShortFYName: 'FY-' + String(appraisalCycleId - 2).slice(-2) };
        UpdateTableHeaders();
        if (callback) callback();
    });
}

// Update table headers dynamically based on cycle information
function UpdateTableHeaders() {
    // Update Previous Year 2 headers
    if (cycleInfo.prev2.ShortFYName) {
        $('#thPrev2Rating').html(cycleInfo.prev2.ShortFYName + '<br />Rating');
        $('#thPrev2Promotion').html(cycleInfo.prev2.ShortFYName + '<br />Promotion Reco.');
    }
    
    // Update Previous Year 1 headers
    if (cycleInfo.prev1.ShortFYName) {
        $('#thPrev1Rating').html(cycleInfo.prev1.ShortFYName + '<br />Rating');
        $('#thPrev1Promotion').html(cycleInfo.prev1.ShortFYName + '<br />Promotion Reco.');
    }
    
    // Update Current Year headers
    if (cycleInfo.current.ShortFYName) {
        $('#thCurrentRating').html(cycleInfo.current.ShortFYName + '<br /> Rating');
        $('#thCurrentPromotion').html(cycleInfo.current.ShortFYName + '<br />Promotion Reco.');
    }
}

// Shared function to get standard 24 column definitions for tblEmpRatingList (order: Name, Grade, Past RMs, ..., Criticality, Comments, Status, Action)
function GetEmpRatingListColumnDefinitions() {
    
    return [
        {
            // Column 0: Name
                "render": function (data, type, row, meta) {
                    return "<span>" + row.EmployeeName + "</span><span><input type='hidden' id='hdnRMName' name='hdnRMName' value='" + row.RMName + "'/></span>";
                },
            "sWidth": "160px",
            "name": "Name"
            },
            {
            // Column 1: Grade
                "render": function (data, type, row, meta) {
                    return "<span>" + row.GradeName + "</span><span><input type='hidden' id='hdnGradeID' name='hdnGradeID' value='" + row.GradeID + "'/></span>";
                },
            "sWidth": "70px",
            "name": "Grade"
            },
            {
            // Column 2: Past RM's
                "render": function (data, type, row, meta) {
                return "<a  style='margin-right:4px;' title='RM History'  data-id=" + row.PEPEmployeeId + " onclick='ViewRMHistory(" + row.PEPEmployeeId + ")'>View</a>";
                },
            "sWidth": "85px",
            "name": "PastRMs"
            },
            {
            // Column 3: Group Account
                "render": function (data, type, row, meta) {
                    return "<span>" + row.AccountGroup + "</span><span><input type='hidden' id='hdnAccountGroup' name='hdnAccountGroup' value='" + row.AccountGroup + "'/></span>";
                },
            "sWidth": "120px",
            "name": "GroupAccount"
            },
            {
            // Column 4: Talent Cube
                "render": function (data, type, row, meta) {
                    return "<span>" + row.TalentCube + "</span><input type='hidden' id='hdnGradeLevel' name='hdnGradeLevel' value='" + row.GradeLevel + "'/></span>";
                },
            "sWidth": "150px",
            "name": "TalentCube"
            },
            {
            // Column 5: Location
                "render": function (data, type, row, meta) {
                    return "<span>" + row.LocationName + "</span><span><input type='hidden' id='hdnLocationID' name='hdnLocationID' value='" + row.LocationID + "'/></span>";
                },
            "sWidth": "95px",
            "name": "Location"
            },
            {
            // Column 6: Gender (hidden by default)
                "render": function (data, type, row, meta) {
                    return "<span>" + row.Gender + "</span>";
                },
            "sWidth": "75px",
            "name": "Gender",
            "visible": false
            },
            {
            // Column 7: Total Exp.
                "render": function (data, type, row, meta) {
                    return "<span>" + row.TotalExp + "</span><span><input type='hidden' id='hdnRowStatus' name='hdnRowStatus' value='" + row.RowStatus + "'/></span>";
                },
            "sWidth": "90px",
            "name": "TotalExp"
            },
            {
            // Column 8: Infogain Exp.
                "render": function (data, type, row, meta) {
                    return "<span>" + row.InfogainExp + "</span><span><input type='hidden' id='hdnId' name='hdnId' value='" + row.Id + "'/></span>";
                },
            "sWidth": "95px",
            "name": "InfogainExp"
            },
            {
            // Column 9: Previous Year 2 Rating (FY-24 Rating)
                "render": function (data, type, row, meta) {
                    return "<span>" + (row.Prev2Rating || '') + "</span>";
                },
            "sWidth": "95px",
            "name": "Prev2Rating"
            },
            {
            // Column 10: Previous Year 2 Promotion Reco. (FY-24 Promotion Reco.)
                "render": function (data, type, row, meta) {
                    var promoText = '';
                    if (row.Prev2RecoForPromotion == 1) promoText = 'Yes';
                    else if (row.Prev2RecoForPromotion == 2) promoText = 'No';
                    else if (row.Prev2RecoForPromotion == 3) promoText = 'TBD';
                    else promoText = 'NA';
                    return "<span>" + promoText + "</span>";
                },
            "sWidth": "115px",
            "name": "Prev2PromotionReco"
            },
            {
            // Column 11: Previous Year 1 Rating (FY-25 Rating)
                "render": function (data, type, row, meta) {
                    return "<span>" + (row.PrevRating || '') + "</span><span><input type='hidden' id='hdnLastRatingGivenBy' name='hdnLastRatingGivenBy' value='" + (row.LastratingGivenBy || '') + "'/></span>";
                },
            "sWidth": "95px",
            "name": "Prev1Rating"
            },
            {
            // Column 12: Previous Year 1 Promotion Reco. (FY-25 Promotion Reco.)
                "render": function (data, type, row, meta) {
                    var promoText = '';
                    if (row.Prev1RecoForPromotion == 1) promoText = 'Yes';
                    else if (row.Prev1RecoForPromotion == 2) promoText = 'No';
                    else if (row.Prev1RecoForPromotion == 3) promoText = 'TBD';
                    else promoText = 'NA';
                    return "<span>" + promoText + "</span>";
                },
            "sWidth": "115px",
            "name": "Prev1PromotionReco"
            },
            {
            // Column 13: Last Promotion Date
                mData: "LastpromotionDate",
            "render": function (data, type, row, meta) {
                return "<span>" + (row.LastpromotionDate || '') + "</span ><span><input type='hidden' id='hdnSLastratingGivenBy' name='hdnSLastratingGivenBy' value='" + (row.SLastRatingGivenBy || '') + "' /></span>";
            },
            "sWidth": "130px",
            "name": "LastPromotionDate"
        },
        {
            // Column 14: Current Year Rating (FY-26 Rating - input dropdown)
                data: "CurrentRating",
                render: renderCurrentRatinggDropdown,
            "sWidth": "110px",
            "name": "CurrentRating"
            },
            {
            // Column 15: Current Year Promotion Reco. (FY-26 Promotion Reco. - input dropdown)
                data: "RecoForPromotion",
                render: renderPromotionnDropdown,
            width: "130px",
            "name": "PromotionReco"
            },
            {
            // Column 16: Promotion Track
                data: "RecoForPromotion",
                render: renderPromotionTrackDropdown,
            width: "120px",
            "name": "PromotionTrack"
            },
            {
            // Column 17: Reco. Designation (hidden by default)
                "render": function (data, type, row, meta) {
                    return "<span>" + row.RecoDesignation + "</span>";
                },
            "sWidth": "110px",
            "name": "RecoDesignation",
            "visible": false
            },
            {
            // Column 18: Reco. Designation Consent (hidden by default)
                "render": function (data, type, row) {
                    if (row.RecoDesignation == "NA") {
                        return "NA";
                    } else {
                        return `
        <select class="form-control rating consent-dropdown" data-empid="${row.PEPEmployeeId}">
            <option value="1" ${row.RecoForPromotion === 1 ? "selected" : ""}>Yes</option>
            <option value="2" ${row.RecoForPromotion === 2 ? "selected" : ""}>No</option>
        </select>
        `;
                    }
                },
            "sWidth": "120px",
            "name": "RecoDesignationConsent",
            "visible": false
            },
            {
            // Column 19: Criticality
                "render": function (data, type, row, meta) {
                    var currentRole = $('#ddlRole').val();
                    var criticalityDisplay = '';
                    
                    // Get criticality priority text (e.g., "P1(5%)") if marked
                    var criticalityPriorityText = '';
                    if (row.CriticalityPriorityDisplayText) {
                        criticalityPriorityText = row.CriticalityPriorityDisplayText;
                    } else if (row.CriticalityPriority) {
                        var pid = String(row.CriticalityPriority).trim();
                        if (window._criticalityPriorityIdToDisplayText && window._criticalityPriorityIdToDisplayText[pid]) {
                            criticalityPriorityText = window._criticalityPriorityIdToDisplayText[pid];
                        } else {
                            criticalityPriorityText = row.CriticalityPriority;
                        }
                    }
                    
                    var en = (row.EmployeeName || '').replace(/'/g, "\\'");
                    var loc = (row.LocationName || row.Location || '').replace(/'/g, "\\'");
                    var gr = (row.GradeName || row.Grade || '').replace(/'/g, "\\'");
                    var pep = row.PEPEmployeeId;
                    var openModalCall = 'openCriticalityModal(' + pep + ', \'' + en + '\', \'' + loc + '\', \'' + gr + '\')';

                    // EnableRoleId == selected role: + to add, pencil to edit, X to remove (remove calls API + sp_RemoveCriticalityDetails).
                    if ((currentRole == '1' || currentRole == '2' || currentRole == '3') && EnableRoleId == $('#ddlRole').val()) {
                        var hasCriticalityMarked = (criticalityPriorityText && criticalityPriorityText.trim() !== '') || row.CriticalityReasons || row.CriticalityPriority || row.AttritionRisk || row.ImmediateBackup || row.SuccessorName;
                        if (hasCriticalityMarked) {
                            var editIcon = '<a href="javascript:void(0);" class="table-icon fa fa-pencil" style="display: inline-block; cursor: pointer; color: #d9534f; vertical-align: middle; margin-right: 4px;" title="View/Edit Criticality Details" onclick="' + openModalCall + '; return false;"></a>';
                            var removeIcon = '<a href="javascript:void(0);" class="table-icon fa fa-times criticality-remove-link" data-pepid="' + pep + '" style="display: inline-block; cursor: pointer; color: #c9302c; vertical-align: middle;" title="Remove Criticality"></a>';
                            if (criticalityPriorityText && criticalityPriorityText.trim() !== '') {
                                criticalityDisplay = '<div style="white-space: nowrap; display: inline-block;"><span style="margin-right: 5px; font-weight: bold; display: inline-block;">' + criticalityPriorityText + '</span>' + editIcon + removeIcon + '</div>';
                            } else {
                                criticalityDisplay = '<div style="white-space: nowrap; display: inline-block;">' + editIcon + removeIcon + '</div>';
                            }
                        } else {
                            criticalityDisplay = '<a href="javascript:void(0);" class="table-icon fa fa-plus" style="display: inline-block; cursor: pointer; color: #5cb85c;" title="Add Criticality Details" onclick="' + openModalCall + '; return false;"></a>';
                        }
                        return criticalityDisplay;
                    }
                    
                    if (criticalityPriorityText && criticalityPriorityText.trim() !== '') {
                        return '<span style="font-weight: bold; white-space: nowrap;">' + criticalityPriorityText + '</span>';
                    }
                    
                    return '--';
                },
                "sWidth": "130px",
                orderable: false,
                "name": "Criticality",
                "className": "text-nowrap"
            },
            {
            // Column 20: Comments
                mRender: function (data, type, full) {
                    var btn;
                    if (EnableRoleId == $('#ddlRole').val()) {
                        if (full["RowStatus"] == "5") {
                            btn = '<div data-toggle="tooltip" class="Description" title="' + full["comment"] + '">' + full["comment"] + '</div>';
                        } else {
                            btn = "<textarea  maxlength='500'  type='text' value='" + full["comment"] + "'  class='form-control' rows='3' column='1'  id=" + full["PEPEmployeeId"] + " />" + full["comment"] + "</textarea><span><input type='hidden' id='hdnEmployeeId' name='hdnEmployeeId' value='" + + full["PEPEmployeeId"] + "'/></span>";
                        }
                    } else {
                    if (full["RowStatus"] == 3 && $('#ddlRole').val() == 2) {
                            btn = "<textarea  maxlength='500'  type='text' value='" + full["comment"] + "'  class='form-control' rows='3' column='1'  id=" + full["PEPEmployeeId"] + " />" + full["comment"] + "</textarea><span><input type='hidden' id='hdnEmployeeId' name='hdnEmployeeId' value='" + + full["PEPEmployeeId"] + "'/></span>";
                        } else {
                            btn = '<div data-toggle="tooltip" class="Description" title="' + full["comment"] + '">' + full["comment"] + '</div>';
                        }
                    }
                    return btn;
            },
            className: "Description",
            "sWidth": "150px",
            "name": "Comments"
        },
            {
            // Column 21: Status (Action Status)
                "render": function (data, type, row, meta) {
                    var Status = '--';
                    var currentRating = row.CurrentRating || "0";
                    var rowStatus = row.RowStatus;
                    
                    // Handle null/undefined RowStatus or 0 as "Not Initiated" when no rating given
                    // This covers cases where only criticality was saved (no rating yet)
                    // Check for null/0 first, then check for RowStatus == 1 with CurrentRating == "0"
                    if ((rowStatus == null || rowStatus == 0) && (currentRating == "0" || currentRating == null || currentRating == "")) {
                        Status = "Not Initiated";
                    }
                    else if (rowStatus == 1 && (currentRating == "0" || currentRating == null || currentRating == "")) {
                        Status = "Not Initiated"
                    }
                    else if (rowStatus == 1) {
                        Status = "Saved in Draft"
                    }
                    else if ((rowStatus == 2 && row.ByRoleId != 3) || (rowStatus == 3 && $('#ddlRole').val() == 1)) {
                        Status = "Submitted"
                        BtndraftVisible = false;
                        $('#btnSubmitrating').prop('value', 'Update');
                    }
                    else if ((rowStatus == 2) && (row.ByRoleId == 3)) {
                    Status = "Pending Management Approval"
                    RecoDesig = true;
                        BtndraftVisible = false;
                        $('#btnSubmitrating').prop('value', 'Update');
                    }
                    else if (rowStatus == 3 && $('#ddlRole').val() == 2) {
                        Status = "Referred back by Approver";
                        BtndraftVisible = false;
                        Referbackdone = true;
                        $('#btnSubmitrating').prop('value', 'Update');
                    }
                    else if (rowStatus == 3 && $('#ddlRole').val() == 3) {
                        Status = "Referred back to Reviewer";
                        BtndraftVisible = false;
                        Referbackdone = true;
                        $('#btnSubmitrating').prop('value', 'Update');
                    }
                    else if (rowStatus == 5) {
                    Status = "Approved"
                        BtndraftVisible = false;
                        HistoryVisible = false;
                        $('#btnSubmitrating').prop('value', 'Update');
                    }
                // Only return the status text, no history icon
                return "<span>" + Status + "</span><span><input type='hidden' id='hdnNextApproverId' name='hdnNextApproverId' value='" + row.NextApproverId + "'/></span>";
            },
            "sWidth": "155px",
            "name": "Status"
        },
        {
            // Column 22: Action (History)
            "render": function (data, type, row, meta) {
                var actionIcons = '';
                var currentRole = $('#ddlRole').val();
                var showHistory = true;
                if (showHistory) {
                    actionIcons += '<a class="table-icon fa fa-history" style="margin-right: 8px; cursor: pointer;" title="View Rating History" data-id="' + row.PEPEmployeeId + '" onclick="ViewClaimHistory(' + row.PEPEmployeeId + ')"></a>';
                }
                return actionIcons || '--';
            },
            "sWidth": "65px",
            orderable: false,
            "name": "Action"
        },
        {
            // Column 23: Recognitions (hidden by default, deprecated)
            "render": function (data, type, row, meta) {
                return "";
            },
            "sWidth": "0%",
            "name": "Recognitions",
            "visible": false
        }
       
    ];
}

function BindTableForFilters(filterData) {
    
    // Validate data before initializing
    if (!filterData) {
        console.error('filterData is null or undefined');
        return;
    }
    
    if (!Array.isArray(filterData)) {
        console.error('filterData is not an array:', typeof filterData, filterData);
        return;
    }
    
    console.log('BindTableForFilters called with', filterData.length, 'rows');
    
    // Check if table already exists and destroy it first
    if ($.fn.DataTable.isDataTable('#tblEmpRatingList')) {
        try {
            var existingTable = $('#tblEmpRatingList').DataTable();
            existingTable.clear().destroy();
            console.log('Destroyed existing DataTable');
        } catch (e) {
            console.warn('Could not destroy existing table:', e);
        }
    }

    //  rawData = filterData;
    
    // Update table headers with current cycle information
    UpdateTableHeaders();

    try {
        
        console.log('Initializing DataTable with', filterData.length, 'rows');
        console.log('First row sample:', filterData.length > 0 ? filterData[0] : 'No data');
        var dt = $("#tblEmpRatingList").DataTable({

        data: filterData,
        "sPaginationType": "full_numbers",
        "iDisplayLength": RecordsCountPerPage,
        "bLengthChange": true,
        "bDestroy": true,
        info: true,
        "searching": true,
        "paging": true,
        "ordering": true,
        "searching": true,
        "autoWidth": false,
            "columnDefs": [
                { "orderData": [], "targets": 0 }, //TURN OFF DEFAULT SORTING OF TABLE
                { "orderable": false, "targets": [17, 19, 21, 22] },  //TURN OFF SORTABLILITY FOR Reco Designation, Criticality, Status, Action columns
                { "targets": [6, 17, 18, 23], "visible": false } // Hide Gender (6), Reco. Designation (17), Reco. Designation Consent (18), Recognitions (23) by default
                // Note: Columns 14 and 15 (Current Rating and Current Promotion Reco) should always be visible
            ],
        "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
        dom: '<"row"<"col-sm-6"Bl><"col-sm-6"f>>' + '<"row"<"col-sm-12"<"table-responsive"tr>>>' + '<"row"<"col-sm-5"i><"col-sm-7"p>>',
        aoColumns: GetEmpRatingListColumnDefinitions(),
        "deferRender": false,
        "drawCallback": function(settings) {
            // Force column alignment on every draw
            try {
                var api = this.api();
                api.columns.adjust();
            } catch (e) {
                console.warn('Could not adjust columns in drawCallback:', e);
            }
        },
        "headerCallback": function(thead, data, start, end, display) {
            // Ensure headers are properly aligned with columns
            try {
                var api = this.api();
                api.columns.adjust();
            } catch (e) {
                console.warn('Could not adjust columns in headerCallback:', e);
            }
        },
        initComplete: function (settings, json) {
            console.log('DataTable initComplete called. Data rows:', json ? (json.data ? json.data.length : json.length) : 'N/A');
            
            if (IsSubmitted == 0 && EnableRoleId == $('#ddlRole').val()) {
                $('#btnratingSaveDraft').show();
            } else {
                $('#btnratingSaveDraft').hide();
            }

            var table = $('#tblEmpRatingList').DataTable();
            
            // CRITICAL: Run the same visibility + redraw logic that fixes alignment when user clicks "Select Columns"
            // Do it immediately so headers align with data on first paint
            try {
                UpdateTableColumnVisibility();
            } catch (e) {
                console.warn('UpdateTableColumnVisibility failed in initComplete:', e);
            }
            
            // Run again after a short delay: by then the column-preferences dropdown may be populated,
            // so we use the same code path as "user selected/unselected" and alignment stays correct
            setTimeout(function() {
                try {
                    if ($('#tblEmpRatingList').length && $.fn.DataTable.isDataTable('#tblEmpRatingList')) {
                        UpdateTableColumnVisibility();
                        console.log('Second UpdateTableColumnVisibility (delayed) completed');
                    }
                } catch (e) {
                    console.warn('Delayed UpdateTableColumnVisibility failed:', e);
                }
            }, 400);


            if (($('#ddlRole').val() == 1) && HistoryVisible == false) {
                $('.lnkHistory').hide()
            } else {
                $('.lnkHistory').show()
            }

            if ((EnableRoleId == $('#ddlRole').val()) || (Referbackdone == true)) {
                $('#btnSubmitrating').show();
            }
            else {
                $('#btnSubmitrating').hide();
                $('#btnratingSaveDraft').hide();
            }



            if ($('#ddlRole').val() == 3 && EnableRoleId == $('#ddlRole').val()) {

                $('#btnReferback').show();
            } else {
                $('#btnReferback').hide();
            }


        }
    });
        console.log('DataTable initialized successfully');
    
    } catch (e) {
        console.error('Error initializing DataTable in BindTableForFilters:', e);
        console.error('Error details:', e.message, e.stack);
        // Try to show error to user
        if (typeof toastr !== 'undefined') {
            toastr.error('Error loading table data: ' + (e.message || 'Unknown error'));
        }
        // Don't re-throw - allow page to continue functioning
    }

    changeBackgroundColor();


}

$('#tblEmpRatingList').on('change', '.consent-dropdown', function () {
    var empID = $(this).data('empid');
    var consentValue = $(this).val();


    //var employeedata = {
    //    LogEmpId: sessionStorage.EmployeeId,
    //    SelectEmpId: empID,
    //    action: consentValue,
    //    RoleId: $('#ddlRole').val();
    //};
    var svrPath = CONFIG.get('SERVERNAME');
    //   var apiURL = svrPath + "Rating/UpdateConsent";

    var apiPath = svrPath + "Rating/UpdateConsent?AppraisalCycleId=" + getRatingPagesAppraisalCycleId() + "&LogEmpId=" + sessionStorage.EmployeeId + "&SelectEmpId=" + empID + "&action=" + consentValue + "&RoleId=" + $('#ddlRole').val();;


    $.ajax({
        url: apiPath,
        type: 'POST',
        async: true,
        dataType: 'json',
        contentType: 'application/json',
        headers: CommonGetHeaderInfo(),
        success: function (result) {
            if (result.Success) {
                toastr.success('Consent updated successfully!');
            } else {

                toastr.error('Reco. Designation not updated for the selected employee.');
            }
        },
        complete: function (xhr, statusText) {

            if (data === null || data === "") {
                data = {
                    "statusCode": xhr.status, "statusText": statusText
                };
            }
        },
        error: function (xhr, statusText, errorThrown) {

            data = {
                "statusCode": xhr.status, "statusText": statusText, "error": "error"
            };
        }
    });

    //$.ajax({
    //    url: '/Rating/UpdateConsent', // Your API endpoint for updating consent
    //    type: 'POST',
    //    data: { EmployeeID: empID, ConsentFlag: consentValue },
    //    success: function (response) {
    //        alert("Consent updated successfully!");
    //    },
    //    error: function (xhr) {
    //        alert("Error updating consent!");
    //    }
    //});
});

function SendMailAfterAction(EmpId, action, selectedEmployees) {

    Role = 'G';


    //var Role = '';
    //if (sessionStorage.IsDP == 1) {
    //    Role = 'D';
    //} else if (sessionStorage.IsGDL == 1) {
    //    Role = 'G';
    //} else {
    //    Role = 'M';
    //}

    //var svrPath = CONFIG.get('SERVERNAME');
    //var apiPath = svrPath + "Rating/SendMailAfterAction?EmpId=" + EmpId + "&action=" + action + "&Role=" + Role + "&selectedEmployees=" + selectedEmployees + "&RowStaus=" + GlobalRowStaus;

    //var Result = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    var employeedata = {
        EmpId: EmpId,
        action: action,
        Role: Role,
        selectedEmployees: selectedEmployees,
    };
    var svrPath = CONFIG.get('SERVERNAME');
    var apiURL = svrPath + "Rating/SendMailAfterAction";


    $.ajax({
        url: apiURL,
        type: 'POST',
        data: JSON.stringify(employeedata),
        async: true,
        dataType: 'json',
        contentType: 'application/json',
        headers: CommonGetHeaderInfo(),
        success: function (result) {
            if (result.Result == 1)
                toastr.success('Mail has been sent to reviewer.');
        },
        complete: function (xhr, statusText) {

            if (data === null || data === "") {
                data = {
                    "statusCode": xhr.status, "statusText": statusText
                };
            }
        },
        error: function (xhr, statusText, errorThrown) {

            data = {
                "statusCode": xhr.status, "statusText": statusText, "error": "error"
            };
        }
    });
}


function GetConfirmationRatingGivenCount() {


    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating/GetConfirmationRatingGivenCount?AppraisalCycleId=" + getRatingPagesAppraisalCycleId() + "&LoginEmployeeId=" + sessionStorage.EmployeeId;


    var Result = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    if (Result.responseJSON) {


        IsRatingGiventoEmployees = Result.responseJSON.Result[0].IsRatingGiventoEmployees;
        IsCurrentRatingGivenStatus = Result.responseJSON.Result[0].IsCurrentRatingGivenStatus;
    }
}




function BindGroupAccount() {
    var sortedAccountKeys = [];
    $.each(rawData, function (index, data) {
        if (dictGroupAccount[data.AccountGroup] == undefined) {
            dictGroupAccount[data.AccountGroup] = data.AccountGroupId;
        }
    }
    );

    sortedAccountKeys = Object.keys(dictGroupAccount).sort();

    $('#ddlgroupaccount').empty();

    for (let t = 0; t < sortedAccountKeys.length; t++) {

        $('#ddlgroupaccount').append($("<option>").val(dictGroupAccount[sortedAccountKeys[t]]).text(sortedAccountKeys[t]));

    }

    $('#ddlgroupaccount').multiselect('destroy');

    $('#ddlgroupaccount').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgroupaccount').multiselect('refresh');


    ////////////////////////////////////////

    $('#ddlgroupaccountNorm').empty();

    for (let t = 0; t < sortedAccountKeys.length; t++) {

        $('#ddlgroupaccountNorm').append($("<option>").val(dictGroupAccount[sortedAccountKeys[t]]).text(sortedAccountKeys[t]));

    }

    $('#ddlgroupaccountNorm').multiselect('destroy');

    $('#ddlgroupaccountNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgroupaccountNorm').multiselect('refresh');

    ////////////////////////////////////////


    $('#ddlgroupaccountPromo').empty();

    for (let t = 0; t < sortedAccountKeys.length; t++) {
        $('#ddlgroupaccountPromo').append($("<option>").val(dictGroupAccount[sortedAccountKeys[t]]).text(sortedAccountKeys[t]));

    }

    $('#ddlgroupaccountPromo').multiselect('destroy');

    $('#ddlgroupaccountPromo').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgroupaccountPromo').multiselect('refresh');


    ///////////////////////////////////////

}


//function BindGroupAccountRAR() {
//    var sortedAccountKeys = [];
//    $.each(approvedReportees, function (index, data) {
//        if (dictGroupAccount[data.AccountGroup] == undefined) {
//            dictGroupAccount[data.AccountGroup] = data.AccountGroupID;
//        }
//    }
//  );

//    sortedAccountKeys = Object.keys(dictGroupAccount).sort();

//    $('#ddlgroupaccount_RAR').empty();

//    for (let t = 0; t < sortedAccountKeys.length; t++) {
//        $('#ddlgroupaccount_RAR').append($("<option>").val(dictGroupAccount[sortedAccountKeys[t]]).text(sortedAccountKeys[t]));

//    }

//    $('#ddlgroupaccount_RAR').multiselect('destroy');

//    $('#ddlgroupaccount_RAR').multiselect({
//        includeSelectAllOption: true,
//        enableFiltering: true,
//        enableCaseInsensitiveFiltering: true,
//        maxHeight: 150
//    });

//    $('#ddlgroupaccount_RAR').multiselect('refresh');

//}


//function BindGroupAccountNorm() {

//    var LoginEmployeeId = sessionStorage.EmployeeId;
//    var svrPath = CONFIG.get('SERVERNAME');
//    var apiPath = svrPath + 'Rating/GetAccountList';
//    var ddlgroupaccountNorm = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
//    $('#ddlgroupaccountNorm').empty();

//    $.each(ddlgroupaccountNorm.responseJSON.Result, function (index, data) {
//        $('#ddlgroupaccountNorm').append($("<option>").val(data.GROUPID).text(data.GROUPNAME));

//    });

//    $('#ddlgroupaccountNorm').multiselect({
//        includeSelectAllOption: true,
//        enableFiltering: true,
//        enableCaseInsensitiveFiltering: true,
//        maxHeight: 150
//    });
//}

//function BindGroupAccountPromo() {

//    var LoginEmployeeId = sessionStorage.EmployeeId;
//    var svrPath = CONFIG.get('SERVERNAME');
//    var apiPath = svrPath + 'Rating/GetAccountList';
//    var ddlgroupaccountPromo = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
//    $('#ddlgroupaccountPromo').empty();

//    $.each(ddlgroupaccountPromo.responseJSON.Result, function (index, data) {
//        $('#ddlgroupaccountPromo').append($("<option>").val(data.GROUPID).text(data.GROUPNAME));

//    });

//    $('#ddlgroupaccountPromo').multiselect({
//        includeSelectAllOption: true,
//        enableFiltering: true,
//        enableCaseInsensitiveFiltering: true,
//        maxHeight: 150
//    });
//}

//function BindGroupAccountPractice() {
//    var LoginEmployeeId = sessionStorage.EmployeeId;
//    var svrPath = CONFIG.get('SERVERNAME');
//    var apiPath = svrPath + 'Rating/GetAccountList';
//    var ddlgroupaccountPractice = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
//    $('#ddlgroupaccountPractice').empty();

//    $.each(ddlgroupaccountPractice.responseJSON.Result, function (index, data) {
//        $('#ddlgroupaccountPractice').append($("<option>").val(data.GROUPID).text(data.GROUPNAME));

//    });

//    $('#ddlgroupaccountPractice').multiselect({
//        includeSelectAllOption: true,
//        enableFiltering: true,
//        enableCaseInsensitiveFiltering: true,
//        maxHeight: 150
//    });
//}

function SaveSubmitRating(saveType, check) {

    //   CheckSessionTimeOut();  
    var IRecoForpromotion = 0;
    var btvDraftFlagForFinalApp = 0;
    var hdnFinalApprover = 0;
    var hdnSLastRatingGivenBy = 0;
    var ICurrentRating = 0;
    var IComments = 0;
    var Id = 0;
    var RatingArray = [];
    // var hdnDeliveryUnit = 0;
    var hdnNextApproverId = 0;
    var RatingList = {};
    var isDraftValid = true;
    var isAllTrackValid = false;


    var isBothDropdownselect = false;

    var Verified = 1;
    var count = 0;


    if (saveType == "draft") {
        //var numero = $('#tblEmpRatingList > tbody > tr').length;
        //if (numero != 0) {
        //    for (i = 1; i <= numero; i++) {
        //        var finalstatus = 0;
        //        ICurrentRating = $('#tblEmpRatingList tr:nth-child(' + i + ') td .ddlRatingClass').val();
        //        IRecoForpromotion = $('#tblEmpRatingList tr:nth-child(' + i + ') td .ddlPromoClass').val();
        //        IComments = $('#tblEmpRatingList tr:nth-child(' + i + ')  td textarea').val();
        //        ToEmployeeId = $($('#tblEmpRatingList tr:nth-child(' + i + ')  td:nth-child(14) input:hidden')).val();
        //        hdnRowStatus = $('#tblEmpRatingList tr:nth-child(' + i + ')  td #hdnRowStatus').val();
        //        hdnNextApproverId = $($('#tblEmpRatingList tr:nth-child(' + i + ')  td:nth-child(13) input:hidden')).val();

        //        element = currentRow.find('td #hdnRowStatus');

        //        if (element) {
        //            hdnRowStatus = element.val();
        //        }

        //        hdnSLastRatingGivenBy = $('#tblEmpRatingList tr:nth-child(' + i + ') td #hdnLastRatingGivenBy').val();

        //        Id = $($('#tblEmpRatingList tr:nth-child(' + i + ') td #hdnId')).val();

        var table = $('#tblEmpRatingList').DataTable();
        var allRows = table.rows().nodes().to$();

        //if ((TotalReporteesSpanCount > 0 && (allRows != undefined) && allRows.length > 0 && TotalReporteesSpanCount == allRows.length) || (IsRatingGiventoEmployees != 0)) {

        var element;
        $.each(allRows, function (index, row) {
            ICurrentRating = 0;
            IRecoForpromotion = 0;
            IComments = 0;
            ToEmployeeId = 0;
            //  hdnDeliveryUnit = 0;
            hdnRowStatus = 0;
            hdnNextApproverId = 0;
            hdnFinalApprover = 0;
            PromotionTrack = 0;
            Id = 0;
            finalstatus = 0;

            var currentRow = $(row);

            element = currentRow.find('td .ddlRatingClass');
            if (element) {
                ICurrentRating = element.val();
            }

            element = currentRow.find('td .ddlPromoClass');
            if (element) {
                IRecoForpromotion = element.val();
            }

            element = currentRow.find('td textarea');
            if (element) {
                IComments = element.val();
            }

            element = currentRow.find('td #hdnEmployeeId');
            if (element) {
                ToEmployeeId = element.val();
            }

            element = currentRow.find('td #hdnRMName');
            if (element) {
                hdnRMName = element.val();
            }

            element = currentRow.find('td #hdnRowStatus');

            if (element) {
                hdnRowStatus = element.val();
            }


            element = currentRow.find('td #hdnId');
            if (element) {
                Id = element.val();
            }

            element = currentRow.find('td #hdnSLastratingGivenBy');
            if (element) {
                hdnSLastRatingGivenBy = element.val();
            }

            element = currentRow.find('td .ddlPromoTrackClass');
            if (element) {
                PromotionTrack = element.val();
            }



            if (IRecoForpromotion == "1" && PromotionTrack == "0") {

                isAllTrackValid = true;
            }


            if (ICurrentRating != "0" && IRecoForpromotion != "0" && hdnRowStatus != 3) {
                isDraftValid = false;
            }



            if (ICurrentRating == "0" && IRecoForpromotion == "2" && IComments == "") {

            } else {

                RatingList = {
                    Id: Id,
                    AppraisalCycleId: getRatingPagesAppraisalCycleId(),
                    RatingGivenBy: sessionStorage.EmployeeId,
                    PEPEmployeeId: ToEmployeeId,  //PEPEmployeeId
                    Status: 1, //parseInt(check + hdnRowStatus + finalstatus),
                    Rating: ICurrentRating,
                    RecoForpromotion: IRecoForpromotion,
                    Comments: IComments,
                    NextSkipRM: hdnNextApproverId,
                    SLastRatingGivenBy: hdnSLastRatingGivenBy,
                    DeliveryUnit: 0,
                    PromotionTrack: PromotionTrack,
                    RoleId: $('#ddlRole').val()
                };
                RatingArray.push(RatingList);

            }

            count = count + 1;

        });


        if (isDraftValid) {
            toastr.error("At least one employee rating and Reco.Promotion values should be selected from dropdowns.");
            return;
        }


        if (isAllTrackValid) {
            toastr.error("Track Should be selected in case if promotion is selected ''Yes'' ");
            return;
        }


    }
    else if (saveType == "submit") {

        var selectedEmployees = $("#ddlReportee").val();


        //if (selectedEmployees.length != $("#ddlReportee option").length && IsRatingGiventoEmployees != 1) {
        //    //  toastr.error("Please select all span employee's list from 'My Span' dropdown filter before submitting the rating.");
        //    toastr.error("Please select “All” under “My Span” filter and review ratings of your entire span before submitting.");

        //    return;
        //}

        var table = $('#tblEmpRatingList').DataTable();
        var allRows = table.rows().nodes().to$();

        //if ((TotalReporteesSpanCount > 0 && (allRows != undefined) && allRows.length > 0 && TotalReporteesSpanCount == allRows.length) || (IsRatingGiventoEmployees != 0)) {

        var element;
        var finalstatus = 0;
        var isValid = true;
        var isSubmitValid = true;
        var isTrackValid = false;
        var isSubmitValidForFinalApp = true;
        $.each(allRows, function (index, row) {
            ICurrentRating = 0;
            IRecoForpromotion = 0;
            IComments = 0;
            ToEmployeeId = 0;
            //  hdnDeliveryUnit = 0;
            hdnRowStatus = 0;
            hdnNextApproverId = 0;
            hdnFinalApprover = 0;
            PromotionTrack = 0;
            Id = 0;
            finalstatus = 0;

            ;
            var currentRow = $(row);

            element = currentRow.find('td .ddlRatingClass');
            if (element) {
                ICurrentRating = element.val();
            }

            element = currentRow.find('td .ddlPromoClass');
            if (element) {
                IRecoForpromotion = element.val();
            }


            element = currentRow.find('td textarea');
            if (element) {
                IComments = element.val();
            }

            element = currentRow.find('td #hdnEmployeeId');
            if (element) {
                ToEmployeeId = element.val();
            }

            element = currentRow.find('td #hdnRMName');
            if (element) {
                hdnRMName = element.val();
            }

            element = currentRow.find('td #hdnRowStatus');

            if (element) {
                hdnRowStatus = element.val();
                GlobalRowStaus = hdnRowStatus;
            }


            element = currentRow.find('td #hdnId');
            if (element) {
                Id = element.val();
            }

            element = currentRow.find('td #hdnSLastratingGivenBy');
            if (element) {
                hdnSLastRatingGivenBy = element.val();
            }


            element = currentRow.find('td .ddlPromoTrackClass');
            if (element) {
                PromotionTrack = element.val();
            }


            if (ICurrentRating != "0" && isSubmitValid == true) {

                isSubmitValid = false;
            }

            if (IRecoForpromotion == 1 && PromotionTrack == 1) {

                isTrackValid = true;

            }

            if (IRecoForpromotion == "1" && PromotionTrack == "0") {

                isAllTrackValid = true;
            }



            if (EnableRoleId == $('#ddlRole').val()) {
                if ((ICurrentRating == "0" && IRecoForpromotion == "2" && IComments == "") || hdnRowStatus == "5") {

                } else {
                    RatingList = {
                        Id: Id,
                        AppraisalCycleId: getRatingPagesAppraisalCycleId(),
                        RatingGivenBy: sessionStorage.EmployeeId,
                        PEPEmployeeId: ToEmployeeId,  //PEPEmployeeId
                        Status: 2,// parseInt(check + hdnRowStatus + finalstatus),
                        Rating: ICurrentRating,
                        RecoForpromotion: IRecoForpromotion,
                        Comments: IComments,
                        NextSkipRM: hdnNextApproverId,
                        SLastRatingGivenBy: hdnSLastRatingGivenBy,
                        DeliveryUnit: 0,// hdnDeliveryUnit
                        PromotionTrack: PromotionTrack,
                        RoleId: $('#ddlRole').val()
                    };
                    RatingArray.push(RatingList);
                }
            } else {
                // Only Referback cases can update by Reviewer
                if (hdnRowStatus == 3) {

                    RatingList = {
                        Id: Id,
                        AppraisalCycleId: getRatingPagesAppraisalCycleId(),
                        RatingGivenBy: sessionStorage.EmployeeId,
                        PEPEmployeeId: ToEmployeeId,  //PEPEmployeeId
                        Status: 2,// parseInt(check + hdnRowStatus + finalstatus),
                        Rating: ICurrentRating,
                        RecoForpromotion: IRecoForpromotion,
                        Comments: IComments,
                        NextSkipRM: hdnNextApproverId,
                        SLastRatingGivenBy: hdnSLastRatingGivenBy,
                        DeliveryUnit: 0,// hdnDeliveryUnit
                        PromotionTrack: PromotionTrack,
                        RoleId: $('#ddlRole').val()
                    };
                    RatingArray.push(RatingList);
                }

            }

        });



        if (isAllTrackValid) {
            toastr.error("Track Should be selected in case if promotion is selected ''Yes'' ");
            return;
        }

        if (isTrackValid) {

            toastr.error("If Reco.Promotion is selected Yes, In that case, Promotion Track value should be selected expect NA.");
            return;
        }

        if (isSubmitValid) {
            toastr.error("Current Rating and Promotion recommendation needs to be provided atleast for one employee on this screen.");
            return;
        }

        if (!isSubmitValidForFinalApp) {

            toastr.error("Refered back records cannot be submit/Approve. Kindly ask your reportees to review and re-submit refered back records.");
            return;
        }

        //} else {
        //    toastr.error("All employee rating is not selected.");
        //    return;
        //}
    }


    GlobalRatingArray = RatingArray;
    GlobalsaveType = saveType;


    if (saveType == "submit" && Verified == 1) {
        $('#confirmSubmitAlert').modal('show');
    } else if (saveType == "draft") {
        SubmitProceed(RatingArray, saveType)

    }


    $('#btnconfirmSubmitAlert').off('click').on('click', function () {
        // Your submit button click logic
        SubmitProceed(GlobalRatingArray, GlobalsaveType);
    });

}

function SubmitProceed(GlobalRatingArray, GlobalsaveType) {


    var svrPath = CONFIG.get('SERVERNAME');
    url = svrPath + 'Rating/';
    var data;

    $.ajax({
        url: url,
        type: 'POST',
        data: JSON.stringify(GlobalRatingArray),
        async: true,
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function (xhr, opts) {
            //  $('#pleasewait').modal('show');
            $('.loader-div').show();

        },
        headers: CommonGetHeaderInfo(),
        success: function (result) {

            ;
            Result = result;

            if (GlobalsaveType == "submit") {
                msg = 'Rating and Promotion recommendation submitted.';

                // GetConfirmationRatingGivenCount();
            } else {
                msg = 'Rating and Promotion saved as Draft.';
            }

            IsLoginEmployeeSubmittedRating();


            $('#btnSubmitrating').prop('disabled', false);



            if (result.Success) {


                toastr.success(msg);


                $("#ddlPromotion").multiselect("deselectAll", false);
                $("#ddlPromotion").multiselect("refresh");


                $("#ddlgrade").multiselect("deselectAll", false);
                $("#ddlgrade").multiselect("refresh");


                $("#ddllocation").multiselect("deselectAll", false);
                $("#ddllocation").multiselect("refresh");

                $("#ddlgroupaccount").multiselect("deselectAll", false);
                $("#ddlgroupaccount").multiselect("refresh")

                $("#ddlgender").multiselect("deselectAll", false);
                $("#ddlgender").multiselect("refresh")

                $("#ddlEmployeeStatus").multiselect("deselectAll", false);
                $("#ddlEmployeeStatus").multiselect("refresh")

                BindReporteeRatings();
                BindNormalizationOverallDataOnInstertionScreen();

                RatingFilterTab();
                changeBackgroundColor();
                BindNormalizationOverallData();

                changeBackgroundColor();


                BindOverAllPromotionSummary();

                BindOverAllMaleFemalePromotionSummary();
                //     RatingGivenNotGivenDetailForDPandGDL();


                //ShowGenderLocation = ['1', '2', '4', '5', '9', '10', '11', '15', '16', '23'];


                //if (ShowGenderLocation.includes(sessionStorage.LocationId)) {

                //    BellCurve();
                //} else {

                //    MyReporteeBellCurve();
                //}
                //BellCurve();
                //MyReporteeBellCurve();
                //  $('#btnratingSaveDraft').hide();
                if (GlobalsaveType == "submit") {

                    /// SendMailAfterAction(sessionStorage.EmployeeId, 'Submit', sessionStorage.EmployeeId);

                    // $('#btnSubmitrating').hide();
                    //   $('#btnReferback').hide();
                }

            }
            else {
                toastr.error(Result.ErrorMessage);
            }

            //   $('#pleasewait').modal('hide');
            $('.loader-div').hide();
        },
        complete: function (xhr, statusText) {
            if (data === null || data === "") {
                data = {
                    "statusCode": xhr.status, "statusText": statusText
                };
            }

            $('.loader-div').hide();
        },
        error: function (xhr, statusText, errorThrown) {
            data = {
                "statusCode": xhr.status, "statusText": statusText, "error": "error"
            };

            $('.loader-div').hide();
        }
    });

}



function BindNormalizationOverallData() {

    var empId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    ;
    //  var IReportee = $('#ddlReporteeNorm :selected').val();// $("#ddlReporteeNorm").val().toString();


    //  var IReportee = $("#ddlReporteeNorm").val().toString();

    var GradeId = $("#ddlgradeNorm").val().toString();
    var LocationId = $("#ddllocationNorm").val().toString();
    var GroupAccountId = $("#ddlgroupaccountNorm").val().toString();
    var Gender = $("#ddlgenderNorm").val().toString();
    var EmpStatus = $("#ddlEmployeeStatusNorm").val().toString();
    var Promotion = $("#ddlPromotionNorm").val().toString();

    var selectedEmployees = $("#ddlReporteeNorm").val();


    if (selectedEmployees.indexOf("-1") != -1) {
        selectedEmployees[selectedEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    }
    var IReportee = selectedEmployees.toString();



    if (IReportee == "") {
        IReportee = 0;
    }
    //if (($("#ddlReporteeNorm option").length == $("#ddlReporteeNorm option:selected").length)) {

    //    IReportee = 0;
    //}

    if (GradeId == "") {
        GradeId = 0;
    }
    if (LocationId == "") {
        LocationId = 0;
    } if (GroupAccountId == "") {
        GroupAccountId = 0;
    }
    if (Gender == "") {
        Gender = 0;
    }
    if (EmpStatus == "") {
        EmpStatus = 0;
    }

    if (Promotion == "") {
        Promotion = 0;
    }

    var _critNormOverallApi = buildCriticalityApiPayloadFromNormPromoMultiselect($("#ddlCriticalityPriorityNorm"));

    //$('#Normalizationtbl tbody tr:gt(1)').remove();



    //$('#Normalizationtbl tbody').empty();
    //var svrPath = CONFIG.get('SERVERNAME');

    //;

    //var apiPath = svrPath + "Rating/GetRatingOverallData?AppraisalCycleId=" + getRatingPagesAppraisalCycleId() + "&EMPID=" + empId + "&IReportee=" + IReportee + "&GradeId=" + GradeId + "&LocationId=" + LocationId + "&GroupAccountId=" + GroupAccountId + "&Gender=" + Gender + "&EmpStatus=" + EmpStatus + "&Promotion=" + Promotion + "&RoleId=" + $('#ddlRole').val();


    var svrPath = CONFIG.get('SERVERNAME') + "/Rating/GetRatingOverallData";

    RequestData = {
        AppraisalCycleId: getRatingPagesAppraisalCycleId(),
        LoginEmployeeId: empId,
        ReporteeIds: IReportee,
        GradeId: GradeId,
        LocationId: LocationId,
        GroupAccountId: GroupAccountId,
        Gender: Gender,
        EmpStatus: EmpStatus,
        Promotion: Promotion,
        RoleId: $('#ddlRole').val(),
        CriticalityPriorityId: _critNormOverallApi.criticalityPriorityIds
    }



    //$.ajax({
    //    type: "POST",
    //    url: svrPath,
    //    headers: headerInfo,
    //    contentType: "application/json; charset=utf-8",
    //    dataType: "json",
    //    headers: {
    //        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
    //        'X-EmpNo': sessionStorage.EmployeeId
    //    },
    //    cache: false,
    //    data: JSON.stringify(RequestData),

    return CommonAjaxGetForNormalization(svrPath, RequestData, headerInfo).done(function (ratingOverallData) {


        $('#Normalizationtbl tbody').html('');

        if (ratingOverallData.Success == true) {


            let Arr = ratingOverallData;
            rawDataOverallNorm = ratingOverallData;

            // BindGradePractice(ratingOverallData.Result);
            let outputArray = [];

            let count = 0;

            let start = false

            for (let j = 0; j < Arr.Result.length; j++) {
                for (let k = 0; k < outputArray.length; k++) {
                    if (Arr.Result[j].GRADE == outputArray[k]) {
                        start = true;
                    }
                }
                count++;
                if (count == 1 && start == false) {
                    outputArray.push(Arr.Result[j].GRADE);
                }
                start = false;
                count = 0;
            }

            // console.log(outputArray);

            var TotalCountGrade = 0;

            var idealTotalEE1 = 0.0;
            var idealTotalEE = 0;
            var idealTotalME = 0;
            var idealTotalBE = 0;

            var RatingGivenTotalEE1 = 0;
            var RatingGivenTotalEE = 0;
            var RatingGivenTotalME = 0;
            var RatingGivenTotalBE = 0;


            var DiffTotalEE1 = 0;
            var DiffTotalEE = 0;
            var DiffTotalME = 0;
            var DiffTotalBE = 0;

            var PerTotalEE1 = 0;
            var PerTotalEE = 0;
            var PerTotalME = 0;
            var PerTotalBE = 0;

            var OverallTotalCount = 0;
            var OverallGiven = 0;
            var OverallDiff = 0;


            for (let j = 0; j < outputArray.length; j++) {

                var GradewiseTotalCount = 0;
                var GradewiseEECurrentCount = 0;
                var GradewiseEE1CurrentCount = 0;
                var GradewiseBECurrentCount = 0;
                var GradewiseMECurrentCount = 0;

                var ME_CurrentCount = 0;
                var BE_CurrentCount = 0;
                var EE_CurrentCount = 0;
                var EE1_CurrentCount = 0;

                var ME_CurrentCountOverall = 0;
                var BE_CurrentCountOverall = 0;
                var EE_CurrentCountOverall = 0;
                var EE1_CurrentCountOverall = 0;

                var ME_TotalCount = 0;
                var BE_TotalCount = 0;
                var EE_TotalCount = 0;
                var EE1_TotalCount = 0;

                //  var OverallTotalCount = 0;
                var TotalCount = 0;
                var CurrentCount = 0;
                var t1 = 0;
                var t2 = 0;
                var t3 = 0;
                var t4 = 0;
                var t5 = 0;


                var t1_Per = 0;
                var t2_Per = 0;
                var t3_Per = 0;
                var t4_Per = 0;
                var t5_Per = 0;

                var idealEE1 = 0;
                var idealEE = 0;
                var idealME = 0;
                var idealBE = 0;



                for (let k = 0; k < Arr.Result.length; k++) {

                    if (outputArray[j] == Arr.Result[k].GRADE) {

                        if (TotalCount == 0) {
                            TotalCount += Arr.Result[k].TotalCount;
                        }
                        if (Arr.Result[k].Rating == 'ME') {
                            ME_CurrentCount += Arr.Result[k].CurrentCount;
                            //if (TotalCount == 0) {
                            //    TotalCount += Arr.Result[k].TotalCount;
                            //}

                        }
                        if (Arr.Result[k].Rating == 'EE') {

                            EE_CurrentCount += Arr.Result[k].CurrentCount;
                            //if (TotalCount == 0) {
                            //    TotalCount += Arr.Result[k].TotalCount;
                            //}

                        }
                        if (Arr.Result[k].Rating == 'EE1') {
                            EE1_CurrentCount += Arr.Result[k].CurrentCount;
                            //if (TotalCount == 0) {
                            //    TotalCount += Arr.Result[k].TotalCount;
                            //}


                        }
                        if (Arr.Result[k].Rating == 'BE') {

                            BE_CurrentCount += Arr.Result[k].CurrentCount;
                            //if (TotalCount == 0) {
                            //    TotalCount += Arr.Result[k].TotalCount;
                            //}
                        }



                        idealEE1 = ((TotalCount * 5) / 100).toFixed(2).replace(".00", "");
                        idealEE = ((TotalCount * 25) / 100).toFixed(2).replace(".00", "");
                        idealME = ((TotalCount * 60) / 100).toFixed(2).replace(".00", "");
                        idealBE = ((TotalCount * 10) / 100).toFixed(2).replace(".00", "");

                        t1 = (idealEE1 - EE1_CurrentCount).toFixed(2).replace(".00", "");
                        t2 = (idealEE - EE_CurrentCount).toFixed(2).replace(".00", "");
                        t3 = (idealME - ME_CurrentCount).toFixed(2).replace(".00", "");
                        t4 = (idealBE - BE_CurrentCount).toFixed(2).replace(".00", "");


                        //t1_Per = (t1 / 100).toFixed(2).replace(".00", "");

                        //t2_Per = (t2 / 100).toFixed(2).replace(".00", "");

                        //t3_Per = (t3 / 100).toFixed(2).replace(".00", "");

                        //t4_Per = (t4 / 100).toFixed(2).replace(".00", "");

                        //t1_Per = ((idealEE1 - EE1_CurrentCount) / 100).toFixed(2).replace(".00", "");

                        //t2_Per = ((idealEE - EE_CurrentCount) / 100).toFixed(2).replace(".00", "");

                        //t3_Per = ((idealME - ME_CurrentCount) / 100).toFixed(2).replace(".00", "");

                        //t4_Per = ((idealBE - BE_CurrentCount) / 100).toFixed(2).replace(".00", "");


                        // TotalCount = (EE1_TotalCount + EE_TotalCount + ME_TotalCount + BE_TotalCount)
                        CurrentCount = (EE1_CurrentCount + EE_CurrentCount + ME_CurrentCount + BE_CurrentCount);
                        t5 = TotalCount - CurrentCount;

                        //EE1_CurrentCountOverall += EE1_CurrentCount;
                        //EE_CurrentCountOverall += EE_CurrentCount;
                        //BE_CurrentCountOverall += BE_CurrentCount;
                        //MM_CurrentCountOverall += MM_CurrentCount;


                    }
                }

                TotalCountGrade = TotalCountGrade + TotalCount;

                idealTotalEE1 = (idealTotalEE1 + parseFloat(idealEE1));
                idealTotalEE = (idealTotalEE + parseFloat(idealEE));
                idealTotalME = (idealTotalME + parseFloat(idealME));
                idealTotalBE = (idealTotalBE + parseFloat(idealBE));

                RatingGivenTotalEE1 = (RatingGivenTotalEE1 + parseFloat(EE1_CurrentCount));
                RatingGivenTotalEE = (RatingGivenTotalEE + parseFloat(EE_CurrentCount));
                RatingGivenTotalME = (RatingGivenTotalME + parseFloat(ME_CurrentCount));
                RatingGivenTotalBE = (RatingGivenTotalBE + parseFloat(BE_CurrentCount));

                DiffTotalEE1 = (DiffTotalEE1 + parseFloat(t1));
                DiffTotalEE = (DiffTotalEE + parseFloat(t2));
                DiffTotalME = (DiffTotalME + parseFloat(t3));
                DiffTotalBE = (DiffTotalBE + parseFloat(t4));

                PerTotalEE1 = (PerTotalEE1 + parseFloat(t1_Per));
                PerTotalEE = (PerTotalEE + parseFloat(t2_Per));
                PerTotalME = (PerTotalME + parseFloat(t3_Per));
                PerTotalBE = (PerTotalBE + parseFloat(t4_Per));

                OverallTotalCount = (OverallTotalCount + parseFloat(TotalCount));
                OverallGiven = (OverallGiven + parseFloat(CurrentCount));
                OverallDiff = (OverallDiff + parseFloat(t5));



                t1_Per = ((EE1_CurrentCount / TotalCount) * 100).toFixed(2).replace(".00", "");

                t2_Per = ((EE_CurrentCount / TotalCount) * 100).toFixed(2).replace(".00", "");

                t3_Per = ((ME_CurrentCount / TotalCount) * 100).toFixed(2).replace(".00", "");

                t4_Per = ((BE_CurrentCount / TotalCount) * 100).toFixed(2).replace(".00", "");


                var newRow1 = $("<tr>");
                var cols = "";
                cols += '<td>' + outputArray[j] + '</td>';
                cols += '<td style="text-align: center;">' + TotalCount + '</td>';
                cols += '<td style="text-align: center;">' + idealEE1 + '</td>';
                cols += '<td style="text-align: center;">' + EE1_CurrentCount + '</td>';

                if (parseFloat(t1) < 0) {
                    cols += '<td style="text-align: center;" class="diffcol">' + t1 + '</td>';
                } else {

                    cols += '<td style="text-align: center;">' + t1 + '</td>';
                }

                cols += '<td style="text-align: center;">' + t1_Per + '</td>';
                cols += '<td style="text-align: center;">' + idealEE + '</td>';
                cols += '<td style="text-align: center;">' + EE_CurrentCount + '</td>';
                if (parseFloat(t2) < 0) {
                    cols += '<td style="text-align: center;" class="diffcol">' + t2 + '</td>';
                } else {

                    cols += '<td style="text-align: center;">' + t2 + '</td>';
                }
                cols += '<td style="text-align: center;">' + t2_Per + '</td>';
                cols += '<td style="text-align: center;">' + idealME + '</td>';
                cols += '<td style="text-align: center;">' + ME_CurrentCount + '</td>';
                if (parseFloat(t3) < 0) {
                    cols += '<td style="text-align: center;" class="diffcol">' + t3 + '</td>';
                } else {

                    cols += '<td style="text-align: center;">' + t3 + '</td>';
                }
                cols += '<td style="text-align: center;">' + t3_Per + '</td>';
                cols += '<td style="text-align: center;">' + idealBE + '</td>';
                cols += '<td style="text-align: center;">' + BE_CurrentCount + '</td>';

                if (parseFloat(t4) < 0) {
                    cols += '<td style="text-align: center;" class="diffcol">' + t4 + '</td>';
                } else {

                    cols += '<td style="text-align: center;">' + t4 + '</td>';
                }

                cols += '<td style="text-align: center;">' + t4_Per + '</td>';
                cols += '<td style="text-align: center;">' + TotalCount + '</td>';
                cols += '<td style="text-align: center;">' + CurrentCount + '</td>';
                cols += '<td style="text-align: center;">' + t5 + '</td>';

                newRow1.append(cols);
                $("#Normalizationtbl tbody").append(newRow1);

            }


            PerTotalEE1 = ((RatingGivenTotalEE1 / TotalCountGrade) * 100).toFixed(2).replace(".00", "");
            PerTotalEE = ((RatingGivenTotalEE / TotalCountGrade) * 100).toFixed(2).replace(".00", "");
            PerTotalME = ((RatingGivenTotalME / TotalCountGrade) * 100).toFixed(2).replace(".00", "");
            PerTotalBE = ((RatingGivenTotalBE / TotalCountGrade) * 100).toFixed(2).replace(".00", "");

            if (isNaN(PerTotalEE1)) {
                PerTotalEE1 = 0;
            }
            if (isNaN(PerTotalEE)) {
                PerTotalEE = 0;
            }
            if (isNaN(PerTotalME)) {
                PerTotalME = 0;
            }
            if (isNaN(PerTotalBE)) {
                PerTotalBE = 0;
            }

            var newRow2 = $("<tr>");
            var cols2 = "";
            cols2 += '<td><b>Total<b/></td>';
            cols2 += '<td style="text-align: center;"><b>' + TotalCountGrade.toFixed(2).replace(".00", "");; + '<b/></td>';
            cols2 += '<td style="text-align: center;"><b>' + idealTotalEE1.toFixed(2).replace(".00", "");; + '<b/></td>';
            cols2 += '<td style="text-align: center;"><b>' + RatingGivenTotalEE1.toFixed(2).replace(".00", "");; + '<b/></td>';
            //cols2 += '<td style="text-align: center;">' + DiffTotalEE1.toFixed(2).replace(".00", "");; + '</td>';

            if (parseFloat(DiffTotalEE1) < 0) {
                cols2 += '<td style="text-align: center;" class="diffcol"><b>' + DiffTotalEE1.toFixed(2).replace(".00", "");; + '<b/></td>';
            } else {

                cols2 += '<td style="text-align: center;"><b>' + DiffTotalEE1.toFixed(2).replace(".00", "");; + '<b/></td>';
            }
            cols2 += '<td style="text-align: center;"><b>' + PerTotalEE1 + '<b/></td>';
            cols2 += '<td style="text-align: center;"><b>' + idealTotalEE.toFixed(2).replace(".00", "");; + '<b/></td>';
            cols2 += '<td style="text-align: center;"><b>' + RatingGivenTotalEE.toFixed(2).replace(".00", "");; + '<b/></td>';
            if (parseFloat(DiffTotalEE) < 0) {
                cols2 += '<td style="text-align: center;" class="diffcol"><b>' + DiffTotalEE.toFixed(2).replace(".00", "");; + '<b/></td>';
            } else {

                cols2 += '<td style="text-align: center;"><b>' + DiffTotalEE.toFixed(2).replace(".00", "");; + '<b/></td>';
            }
            cols2 += '<td style="text-align: center;"><b>' + PerTotalEE + '<b/></td>';

            cols2 += '<td style="text-align: center;"><b>' + idealTotalME.toFixed(2).replace(".00", "");; + '<b/></td>';
            cols2 += '<td style="text-align: center;"><b>' + RatingGivenTotalME.toFixed(2).replace(".00", "");; + '<b/></td>';

            if (parseFloat(DiffTotalME) < 0) {
                cols2 += '<td style="text-align: center;" class="diffcol"><b>' + DiffTotalME.toFixed(2).replace(".00", "");; + '<b/></td>';
            } else {

                cols2 += '<td style="text-align: center;"><b>' + DiffTotalME.toFixed(2).replace(".00", "");; + '<b/></td>';
            }

            cols2 += '<td style="text-align: center;"><b>' + PerTotalME + '<b/></td>';

            cols2 += '<td style="text-align: center;"><b>' + idealTotalBE.toFixed(2).replace(".00", "");; + '<b/></td>';
            cols2 += '<td style="text-align: center;"><b>' + RatingGivenTotalBE.toFixed(2).replace(".00", "");; + '<b/></td>';

            if (parseFloat(DiffTotalBE) < 0) {
                cols2 += '<td style="text-align: center;" class="diffcol"><b>' + DiffTotalBE.toFixed(2).replace(".00", "");; + '<b/></td>';
            } else {

                cols2 += '<td style="text-align: center;"><b>' + DiffTotalBE.toFixed(2).replace(".00", "");; + '<b/></td>';
            }

            cols2 += '<td style="text-align: center;"><b>' + PerTotalBE + '<b/></td>';


            cols2 += '<td style="text-align: center;"><b>' + OverallTotalCount.toFixed(2).replace(".00", "");; + '<b/></td>';
            cols2 += '<td style="text-align: center;"><b>' + OverallGiven.toFixed(2).replace(".00", "");; + '<b/></td>';
            cols2 += '<td style="text-align: center;"><b>' + OverallDiff.toFixed(2).replace(".00", "");; + '<b/></td>';


            newRow2.append(cols2);
            $("#Normalizationtbl tbody").append(newRow2);
        }
    });
}


function BindNormalizationOverallDataOnInstertionScreen() {
    
    var empId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    //var IReportee = $('#ddlReportee').val().toString();// $("#ddlReporteeNorm").val().toString();
    var selectedEmployees = $("#ddlReportee").val();


    if (selectedEmployees.indexOf("-1") != -1) {
        selectedEmployees[selectedEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    }
    var IReportee = selectedEmployees.toString();

    var GradeId = $("#ddlgrade").val().toString();
    var LocationId = $("#ddllocation").val().toString();
    var GroupAccountId = $("#ddlgroupaccount").val().toString();
    var Gender = $("#ddlgender").val().toString();
    var EmpStatus = $("#ddlEmployeeStatus").val().toString();
    var Promotion = $("#ddlPromotion").val().toString();
    var _critParsedNorm = parseCriticalityFilterForRequest(getFiltersDropCriticalitySelect());
    var _critNormCompleteApi = criticalityFilterParsedToApiPayload(_critParsedNorm);

    if (IReportee == "") {
        IReportee = 0;
    }
    if (GradeId == "") {
        GradeId = 0;
    }
    if (LocationId == "") {
        LocationId = 0;
    } if (GroupAccountId == "") {
        GroupAccountId = 0;
    }
    if (Gender == "") {
        Gender = 0;
    }
    if (EmpStatus == "") {
        EmpStatus = 0;
    }
    if (Promotion == "") {
        Promotion = 0;
    }

    //$('#CompleteSpanNormalizationtbl tbody tr:gt(1)').remove();



    var svrPath = CONFIG.get('SERVERNAME') + "/Rating/GetRatingOverallData";

    RequestData = {
        AppraisalCycleId: getRatingPagesAppraisalCycleId(),
        LoginEmployeeId: empId,
        ReporteeIds: IReportee,
        GradeId: GradeId,
        LocationId: LocationId,
        GroupAccountId: GroupAccountId,
        Gender: Gender,
        EmpStatus: EmpStatus,
        Promotion: Promotion,
        CriticalityPriorityId: _critNormCompleteApi.criticalityPriorityIds,
        RoleId: $('#ddlRole').val()

    }



    return $.ajax({
        type: "POST",
        url: svrPath,
        headers: headerInfo,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        },
        cache: false,
        data: JSON.stringify(RequestData),
        async: true,
        beforeSend: function (xhr, opts) {
            if (!_ratingsRoleChangeBulkLoad) {
                $('.loader-div').show();
            }
        },

        success: function (ratingOverallData) {
            if (ratingOverallData.Success == true) {

                $('#CompleteSpanNormalizationtbl tbody').html('');
                hideRatingsPageLoaderIfNotRoleBulk();
                let Arr = ratingOverallData;
                //    rawData = ratingOverallData;
                let outputArray = [];

                let count = 0;

                let start = false;

                for (let j = 0; j < Arr.Result.length; j++) {
                    for (let k = 0; k < outputArray.length; k++) {
                        if (Arr.Result[j].GRADE == outputArray[k]) {
                            start = true;
                        }
                    }
                    count++;
                    if (count == 1 && start == false) {
                        outputArray.push(Arr.Result[j].GRADE);
                    }
                    start = false;
                    count = 0;
                }

                // console.log(outputArray);

                var TotalCountGrade = 0;

                var idealTotalEE1 = 0.0;
                var idealTotalEE = 0;
                var idealTotalME = 0;
                var idealTotalBE = 0;

                var RatingGivenTotalEE1 = 0;
                var RatingGivenTotalEE = 0;
                var RatingGivenTotalME = 0;
                var RatingGivenTotalBE = 0;


                var DiffTotalEE1 = 0;
                var DiffTotalEE = 0;
                var DiffTotalME = 0;
                var DiffTotalBE = 0;

                var PerTotalEE1 = 0;
                var PerTotalEE = 0;
                var PerTotalME = 0;
                var PerTotalBE = 0;

                var OverallTotalCount = 0;
                var OverallGiven = 0;
                var OverallDiff = 0;


                for (let j = 0; j < outputArray.length; j++) {

                    var GradewiseTotalCount = 0;
                    var GradewiseEECurrentCount = 0;
                    var GradewiseEE1CurrentCount = 0;
                    var GradewiseBECurrentCount = 0;
                    var GradewiseMECurrentCount = 0;

                    var ME_CurrentCount = 0;
                    var BE_CurrentCount = 0;
                    var EE_CurrentCount = 0;
                    var EE1_CurrentCount = 0;

                    var ME_CurrentCountOverall = 0;
                    var BE_CurrentCountOverall = 0;
                    var EE_CurrentCountOverall = 0;
                    var EE1_CurrentCountOverall = 0;

                    var ME_TotalCount = 0;
                    var BE_TotalCount = 0;
                    var EE_TotalCount = 0;
                    var EE1_TotalCount = 0;

                    //  var OverallTotalCount = 0;
                    var TotalCount = 0;
                    var CurrentCount = 0;
                    var t1 = 0;
                    var t2 = 0;
                    var t3 = 0;
                    var t4 = 0;
                    var t5 = 0;


                    var t1_Per = 0;
                    var t2_Per = 0;
                    var t3_Per = 0;
                    var t4_Per = 0;
                    var t5_Per = 0;

                    var idealEE1 = 0;
                    var idealEE = 0;
                    var idealME = 0;
                    var idealBE = 0;

                    var TotalEachPer = 0;
                    var TotalPer = 0;


                    for (let k = 0; k < Arr.Result.length; k++) {

                        if (outputArray[j] == Arr.Result[k].GRADE) {

                            if (TotalCount == 0) {
                                TotalCount += Arr.Result[k].TotalCount;
                            }
                            if (Arr.Result[k].Rating == 'ME') {

                                ME_CurrentCount += Arr.Result[k].CurrentCount;


                            }
                            if (Arr.Result[k].Rating == 'EE') {

                                EE_CurrentCount += Arr.Result[k].CurrentCount;


                            }
                            if (Arr.Result[k].Rating == 'EE1') {
                                EE1_CurrentCount += Arr.Result[k].CurrentCount;

                            }
                            if (Arr.Result[k].Rating == 'BE') {

                                BE_CurrentCount += Arr.Result[k].CurrentCount;

                            }


                            idealEE1 = ((TotalCount * 5) / 100).toFixed(2).replace(".00", "");
                            idealEE = ((TotalCount * 25) / 100).toFixed(2).replace(".00", "");
                            idealME = ((TotalCount * 60) / 100).toFixed(2).replace(".00", "");
                            idealBE = ((TotalCount * 10) / 100).toFixed(2).replace(".00", "");

                            t1 = (idealEE1 - EE1_CurrentCount).toFixed(2).replace(".00", "");
                            t2 = (idealEE - EE_CurrentCount).toFixed(2).replace(".00", "");
                            t3 = (idealME - ME_CurrentCount).toFixed(2).replace(".00", "");
                            t4 = (idealBE - BE_CurrentCount).toFixed(2).replace(".00", "");


                            //t1_Per = (t1 / 100).toFixed(2).replace(".00", "");

                            //t2_Per = (t2 / 100).toFixed(2).replace(".00", "");

                            //t3_Per = (t3 / 100).toFixed(2).replace(".00", "");

                            //t4_Per = (t4 / 100).toFixed(2).replace(".00", "");

                            // TotalCount = (EE1_TotalCount + EE_TotalCount + ME_TotalCount + BE_TotalCount)
                            CurrentCount = (EE1_CurrentCount + EE_CurrentCount + ME_CurrentCount + BE_CurrentCount);
                            t5 = TotalCount - CurrentCount;

                            //EE1_CurrentCountOverall += EE1_CurrentCount;
                            //EE_CurrentCountOverall += EE_CurrentCount;
                            //BE_CurrentCountOverall += BE_CurrentCount;
                            //MM_CurrentCountOverall += MM_CurrentCount;


                        }
                    }

                    TotalCountGrade = TotalCountGrade + TotalCount;

                    idealTotalEE1 = (idealTotalEE1 + parseFloat(idealEE1));
                    idealTotalEE = (idealTotalEE + parseFloat(idealEE));
                    idealTotalME = (idealTotalME + parseFloat(idealME));
                    idealTotalBE = (idealTotalBE + parseFloat(idealBE));

                    RatingGivenTotalEE1 = (RatingGivenTotalEE1 + parseFloat(EE1_CurrentCount));
                    RatingGivenTotalEE = (RatingGivenTotalEE + parseFloat(EE_CurrentCount));
                    RatingGivenTotalME = (RatingGivenTotalME + parseFloat(ME_CurrentCount));
                    RatingGivenTotalBE = (RatingGivenTotalBE + parseFloat(BE_CurrentCount));

                    DiffTotalEE1 = (DiffTotalEE1 + parseFloat(t1));
                    DiffTotalEE = (DiffTotalEE + parseFloat(t2));
                    DiffTotalME = (DiffTotalME + parseFloat(t3));
                    DiffTotalBE = (DiffTotalBE + parseFloat(t4));

                    PerTotalEE1 = (PerTotalEE1 + parseFloat(t1_Per));
                    PerTotalEE = (PerTotalEE + parseFloat(t2_Per));
                    PerTotalME = (PerTotalME + parseFloat(t3_Per));
                    PerTotalBE = (PerTotalBE + parseFloat(t4_Per));

                    OverallTotalCount = (OverallTotalCount + parseFloat(TotalCount));
                    OverallGiven = (OverallGiven + parseFloat(CurrentCount));
                    OverallDiff = (OverallDiff + parseFloat(t5));


                    t1_Per = ((EE1_CurrentCount / TotalCount) * 100).toFixed(2).replace(".00", "");

                    t2_Per = ((EE_CurrentCount / TotalCount) * 100).toFixed(2).replace(".00", "");

                    t3_Per = ((ME_CurrentCount / TotalCount) * 100).toFixed(2).replace(".00", "");

                    t4_Per = ((BE_CurrentCount / TotalCount) * 100).toFixed(2).replace(".00", "");

                    TotalEachPer = ((CurrentCount / TotalCount) * 100).toFixed(2).replace(".00", "");;



                    var newRow1 = $("<tr>");
                    var cols = "";
                    cols += '<td>' + outputArray[j] + '</td>';
                    cols += '<td style="text-align: center;">' + TotalCount + '</td>';
                    cols += '<td style="text-align: center;">' + idealEE1 + '</td>';
                    cols += '<td style="text-align: center;">' + EE1_CurrentCount + '</td>';

                    if (parseFloat(t1) < 0) {
                        cols += '<td style="text-align: center;" title="Ideal Nos-Rating Given" class="diffcol">' + t1 + '</td>';
                    } else {

                        cols += '<td style="text-align: center;" title="Ideal Nos-Rating Given">' + t1 + '</td>';
                    }

                    cols += '<td style="text-align: center;" title="Difference/100">' + t1_Per + '</td>';
                    cols += '<td style="text-align: center;">' + idealEE + '</td>';
                    cols += '<td style="text-align: center;">' + EE_CurrentCount + '</td>';
                    if (parseFloat(t2) < 0) {
                        cols += '<td style="text-align: center;" title="Ideal Nos-Rating Given" class="diffcol">' + t2 + '</td>';
                    } else {

                        cols += '<td style="text-align: center;" title="Ideal Nos-Rating Given">' + t2 + '</td>';
                    }
                    cols += '<td style="text-align: center;" title="Difference/100">' + t2_Per + '</td>';
                    cols += '<td style="text-align: center;">' + idealME + '</td>';
                    cols += '<td style="text-align: center;">' + ME_CurrentCount + '</td>';
                    if (parseFloat(t3) < 0) {
                        cols += '<td style="text-align: center;" title="Ideal Nos-Rating Given" class="diffcol">' + t3 + '</td>';
                    } else {

                        cols += '<td style="text-align: center;" title="Ideal Nos-Rating Given">' + t3 + '</td>';
                    }
                    cols += '<td style="text-align: center;" title="Difference/100">' + t3_Per + '</td>';
                    cols += '<td style="text-align: center;">' + idealBE + '</td>';
                    cols += '<td style="text-align: center;">' + BE_CurrentCount + '</td>';

                    if (parseFloat(t4) < 0) {
                        cols += '<td style="text-align: center;" title="Ideal Nos-Rating Given" class="diffcol">' + t4 + '</td>';
                    } else {

                        cols += '<td style="text-align: center;" title="Ideal Nos-Rating Given">' + t4 + '</td>';
                    }

                    cols += '<td style="text-align: center;" title="Difference/100">' + t4_Per + '</td>';
                    cols += '<td style="text-align: center;">' + TotalCount + '</td>';
                    cols += '<td style="text-align: center;">' + CurrentCount + '</td>';
                    cols += '<td style="text-align: center;">' + t5 + '</td>';
                    //cols += '<td style="text-align: center;">' + TotalEachPer + '</td>';

                    newRow1.append(cols);
                    $("#CompleteSpanNormalizationtbl").append(newRow1);

                }


                PerTotalEE1 = ((RatingGivenTotalEE1 / TotalCountGrade) * 100).toFixed(2).replace(".00", "");
                PerTotalEE = ((RatingGivenTotalEE / TotalCountGrade) * 100).toFixed(2).replace(".00", "");
                PerTotalME = ((RatingGivenTotalME / TotalCountGrade) * 100).toFixed(2).replace(".00", "");
                PerTotalBE = ((RatingGivenTotalBE / TotalCountGrade) * 100).toFixed(2).replace(".00", "");

                if (isNaN(PerTotalEE1)) {
                    PerTotalEE1 = 0;
                }
                if (isNaN(PerTotalEE)) {
                    PerTotalEE = 0;
                }
                if (isNaN(PerTotalME)) {
                    PerTotalME = 0;
                }
                if (isNaN(PerTotalBE)) {
                    PerTotalBE = 0;
                }

                //TotalPer = ((OverallGiven / TotalCountGrade) * 100);

                var newRow2 = $("<tr>");
                var cols2 = "";
                cols2 += '<td><b>Total<b/></td>';
                cols2 += '<td style="text-align: center;"><b>' + TotalCountGrade.toFixed(2).replace(".00", "");; + '<b/></td>';
                cols2 += '<td style="text-align: center;"><b>' + idealTotalEE1.toFixed(2).replace(".00", "");; + '<b/></td>';
                cols2 += '<td style="text-align: center;"><b>' + RatingGivenTotalEE1.toFixed(2).replace(".00", "");; + '<b/></td>';
                //cols2 += '<td style="text-align: center;">' + DiffTotalEE1.toFixed(2).replace(".00", "");; + '</td>';

                if (parseFloat(DiffTotalEE1) < 0) {
                    cols2 += '<td style="text-align: center;" class="diffcol"><b>' + DiffTotalEE1.toFixed(2).replace(".00", "");; + '<b/></td>';
                } else {

                    cols2 += '<td style="text-align: center;"><b>' + DiffTotalEE1.toFixed(2).replace(".00", "");; + '<b/></td>';
                }
                cols2 += '<td style="text-align: center;"><b>' + PerTotalEE1 + '<b/></td>';
                cols2 += '<td style="text-align: center;"><b>' + idealTotalEE.toFixed(2).replace(".00", "");; + '<b/></td>';
                cols2 += '<td style="text-align: center;"><b>' + RatingGivenTotalEE.toFixed(2).replace(".00", "");; + '<b/></td>';
                if (parseFloat(DiffTotalEE) < 0) {
                    cols2 += '<td style="text-align: center;" class="diffcol"><b>' + DiffTotalEE.toFixed(2).replace(".00", "");; + '<b/></td>';
                } else {

                    cols2 += '<td style="text-align: center;"><b>' + DiffTotalEE.toFixed(2).replace(".00", "");; + '<b/></td>';
                }
                cols2 += '<td style="text-align: center;"><b>' + PerTotalEE + '<b/></td>';

                cols2 += '<td style="text-align: center;"><b>' + idealTotalME.toFixed(2).replace(".00", "");; + '<b/></td>';
                cols2 += '<td style="text-align: center;"><b>' + RatingGivenTotalME.toFixed(2).replace(".00", "");; + '<b/></td>';

                if (parseFloat(DiffTotalME) < 0) {
                    cols2 += '<td style="text-align: center;" class="diffcol"><b>' + DiffTotalME.toFixed(2).replace(".00", "");; + '<b/></td>';
                } else {

                    cols2 += '<td style="text-align: center;"><b>' + DiffTotalME.toFixed(2).replace(".00", "");; + '<b/></td>';
                }

                cols2 += '<td style="text-align: center;"><b>' + PerTotalME + '<b/></td>';

                cols2 += '<td style="text-align: center;"><b>' + idealTotalBE.toFixed(2).replace(".00", "");; + '<b/></td>';
                cols2 += '<td style="text-align: center;"><b>' + RatingGivenTotalBE.toFixed(2).replace(".00", "");; + '<b/></td>';

                if (parseFloat(DiffTotalBE) < 0) {
                    cols2 += '<td style="text-align: center;" class="diffcol"><b>' + DiffTotalBE.toFixed(2).replace(".00", "");; + '<b/></td>';
                } else {

                    cols2 += '<td style="text-align: center;"><b>' + DiffTotalBE.toFixed(2).replace(".00", "");; + '<b/></td>';
                }

                cols2 += '<td style="text-align: center;"><b>' + PerTotalBE + '<b/></td>';


                cols2 += '<td style="text-align: center;"><b>' + OverallTotalCount.toFixed(2).replace(".00", "");; + '<b/></td>';
                cols2 += '<td style="text-align: center;"><b>' + OverallGiven.toFixed(2).replace(".00", "");; + '<b/></td>';
                cols2 += '<td style="text-align: center;"><b>' + OverallDiff.toFixed(2).replace(".00", "");; + '<b/></td>';



                newRow2.append(cols2);
                $("#CompleteSpanNormalizationtbl").append(newRow2);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            hideRatingsPageLoaderIfNotRoleBulk();
            toastr.error('Failed to retrieve data.');
        }
    });
}

function BindOverAllPromotionSummary() {

    var empId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    //  var IReportee = $("#ddlReporteePromo").val().toString();
    var GradeId = $("#ddlgradePromo").val().toString();
    var LocationId = $("#ddllocationPromo").val().toString();
    var GroupAccountId = $("#ddlgroupaccountPromo").val().toString();
    var Gender = $("#ddlgenderPromo").val().toString();
    var EmpStatus = $("#ddlEmployeeStatusPromo").val().toString();


    var selectedEmployees = $("#ddlReporteePromo").val();


    if (selectedEmployees.indexOf("-1") != -1) {
        selectedEmployees[selectedEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    }
    var IReportee = selectedEmployees.toString();

    if (IReportee == "") {
        IReportee = 0;
    }
    //if (($("#ddlReporteePromo option").length == $("#ddlReporteePromo option:selected").length)) {

    //    IReportee = 0;
    //}
    if (GradeId == "") {
        GradeId = 0;
    }
    if (LocationId == "") {
        LocationId = 0;
    } if (GroupAccountId == "") {
        GroupAccountId = 0;
    }
    if (Gender == "") {
        Gender = 0;
    }
    if (EmpStatus == "") {
        EmpStatus = 0;
    }
    var _critPromoSummaryApi = buildCriticalityApiPayloadFromNormPromoMultiselect($("#ddlCriticalityPriorityPromo"));
    //var svrPath = CONFIG.get('SERVERNAME');
    //var apiPath = svrPath + "Rating/GetRatingPromotionDetails?AppraisalCycleId=" + getRatingPagesAppraisalCycleId() + "&LogEmpID=" + empId + "&IReportee=" + IReportee + "&GradeId=" + GradeId + "&LocationId=" + LocationId + "&GroupAccountId=" + GroupAccountId + "&Gender=" + Gender + "&EmpStatus=" + EmpStatus + '&RoleId=' + $('#ddlRole').val();


    var svrPath = CONFIG.get('SERVERNAME') + "/Rating/GetRatingPromotionDetails";

    RequestData = {
        AppraisalCycleId: getRatingPagesAppraisalCycleId(),
        LoginEmployeeId: empId,
        ReporteeIds: IReportee,
        GradeId: GradeId,
        LocationId: LocationId,
        GroupAccountId: GroupAccountId,
        Gender: Gender,
        EmpStatus: EmpStatus,
        RoleId: $('#ddlRole').val(),
        CriticalityPriorityId: _critPromoSummaryApi.criticalityPriorityIds
    }


    $('#tblPromotionSummary tbody tr:gt(0)').remove();

    return CommonAjaxGetForNormalization(svrPath, RequestData, headerInfo).done(function (ratingPromotionOverallData) {

        if (ratingPromotionOverallData.Success == true) {

            var Total = 0;
            var PromotionPer = 0;
            var CurrentorgDistrubutionTotal = 0;

            var TotalIdealNo = 0;
            var TotalProRecoReceived = 0;
            var TotalRatio = 0;
            var TotalDiff = 0;
            var TotalFinalApproved = 0;
            var TotalFinalApprovedPer = 0;
            var TotalPromotoionPercentage = 0;

            rawDataOverallPromotion = ratingPromotionOverallData.Result;

            ratingPromotionOverallData.Result.forEach(function (R1, index) {

                Total += R1.TotalCount
                PromotionPer += R1.PromotoionPercentage

            });

            ratingPromotionOverallData.Result.forEach(function (d, index) {


                var cols = "";

                var newRow1 = $("<tr>");


                var CurrentorgDistrubution = 0.00;
                var IdealNumber = 0;
                var ratio = 0;
                var difference = 0;
                var approvedpercentage = 0;

                CurrentorgDistrubution = ((d.TotalCount / Total) * 100).toFixed(2).replace(".00", "");

                if (isNaN((d.TotalCount / Total) * 100)) {
                    CurrentorgDistrubution = 0;
                } else {
                    CurrentorgDistrubution = ((d.TotalCount / Total) * 100).toFixed(2).replace(".00", "");
                }

                CurrentorgDistrubutionTotal += parseFloat(CurrentorgDistrubution);
                IdealNumber = ((d.TotalCount * d.PromotoionPercentage) / 100).toFixed(2).replace(".00", "");;

                if (isNaN((d.RecommendationForPromotion / d.TotalCount) * 100)) {
                    ratio = 0;
                    TotalRatio = (TotalRatio + ratio);
                } else {
                    ratio = ((d.RecommendationForPromotion / d.TotalCount) * 100);
                    TotalRatio = (TotalRatio + ratio);
                }
                difference = (d.RecommendationForPromotion - IdealNumber).toFixed(2).replace(".00", "");

                if (isNaN((d.ApprovedCount / d.TotalCount) * 100)) {
                    approvedpercentage = 0;
                } else {
                    approvedpercentage = ((d.ApprovedCount / d.TotalCount) * 100).toFixed(2).replace(".00", "");
                }


                TotalIdealNo = (TotalIdealNo + ((d.TotalCount * d.PromotoionPercentage) / 100));//.toFixed(2).replace(".00", "");;

                TotalProRecoReceived = (TotalProRecoReceived + d.RecommendationForPromotion);//.toFixed(2).replace(".00", "");;
                // TotalRatio = (TotalRatio + ratio);//.toFixed(2).replace(".00", "");;
                TotalDiff = (parseFloat(TotalDiff) + parseFloat(difference));//.replace(".00", "");;
                TotalDiff = TotalDiff.toFixed(2);
                TotalFinalApproved = (parseFloat(TotalFinalApproved) + parseFloat(d.ApprovedCount));//.toFixed(2).replace(".00", "");;
                TotalFinalApproved = TotalFinalApproved.toFixed(2);

                TotalFinalApprovedPer = (parseFloat(TotalFinalApprovedPer) + parseFloat(approvedpercentage));//.toFixed(2).replace(".00", "");;
                TotalFinalApprovedPer = TotalFinalApprovedPer.toFixed(2);
                ratio = ratio.toFixed(2);

                TotalPromotoionPercentage = (TotalPromotoionPercentage + parseFloat(d.PromotoionPercentage));


                cols += '<td style="text-align: center;">' + d.Grade + '</td>';
                cols += '<td style="text-align: center;">' + d.TotalCount + '</td>';
                cols += '<td style="text-align: center;" title="Current Org Distribution =  Grade Wise Total Nos. / Total of Grade Wise Total Nos.">' + CurrentorgDistrubution + '</td>';
                cols += '<td style="text-align: center;">' + (d.PromotoionPercentage) + '</td>';
                cols += '<td style="text-align: center;"  title="Ideal Nos. =  (Grade Wise Total Nos * Grade Wise Promotion %)/100">' + IdealNumber + '</td>';
                cols += '<td style="text-align: center;">' + d.RecommendationForPromotion + '</td>';
                cols += '<td style="text-align: center;"  title="Ratio = Promotion Reco. Received/ Grade Wise Total Nos.">' + ratio + '</td>';

                if (parseFloat(difference) > 0) {
                    cols += '<td style="text-align: center;" title="Difference = Promotion Reco.Received-Ideals Nos." class="diffcol">' + difference + '</td>';
                } else {

                    cols += '<td style="text-align: center;" title="Difference = Promotion Reco.Received-Ideals Nos.">' + difference + '</td>';
                }

                cols += '<td style="text-align: center;">' + d.ApprovedCount + '</td>';
                cols += '<td style="text-align: center;">' + approvedpercentage + '</td>';


                newRow1.append(cols);
                $("#tblPromotionSummary").append(newRow1);

            })

            var cols = "";
            var newRow1 = $("<tr>");

            TotalRatio = (TotalProRecoReceived / Total) * 100;
            TotalIdealNo = TotalIdealNo.toFixed(2).replace(".00", "");
            CurrentorgDistrubutionTotal = CurrentorgDistrubutionTotal.toFixed(2).replace(".00", "");
            //TotalRatio = TotalRatio.toFixed(2).replace(".00", "");
            TotalPromotoionPercentage = TotalPromotoionPercentage.toFixed(2).replace(".00", "");

            cols += '<td style="text-align: center;"><b> Total<b/></td>';
            cols += '<td style="text-align: center;"><b>' + Total + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + CurrentorgDistrubutionTotal + '<b/></td>';
            cols += '<td style="text-align: center;"><b>  9%<b/></td>';
            cols += '<td style="text-align: center;"><b>' + TotalIdealNo + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + TotalProRecoReceived + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + TotalRatio.toFixed(2).replace(".00", "") + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + TotalDiff + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + TotalFinalApproved + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + TotalFinalApprovedPer + '<b/></td>';

            newRow1.append(cols);
            $("#tblPromotionSummary").append(newRow1);

        }
    });
}

function BindOverAllMaleFemalePromotionSummary() {

    var empId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    //  var IReportee = $('#ddlReporteePromo').val(); // $("#ddlReporteePromo").val().toString();
    var GradeId = $("#ddlgradePromo").val().toString();
    var LocationId = $("#ddllocationPromo").val().toString();
    var GroupAccountId = $("#ddlgroupaccountPromo").val().toString();
    var Gender = $("#ddlgenderPromo").val().toString();
    var EmpStatus = $("#ddlEmployeeStatusPromo").val().toString();


    var selectedEmployees = $("#ddlReporteePromo").val();


    if (selectedEmployees.indexOf("-1") != -1) {
        selectedEmployees[selectedEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    }
    var IReportee = selectedEmployees.toString();

    if (IReportee == "") {
        IReportee = 0;
    }
    //if (($("#ddlReporteePromo option").length == $("#ddlReporteePromo option:selected").length)) {

    //    IReportee = 0;
    //}
    if (GradeId == "") {
        GradeId = 0;
    }
    if (LocationId == "") {
        LocationId = 0;
    } if (GroupAccountId == "") {
        GroupAccountId = 0;
    }
    if (Gender == "") {
        Gender = 0;
    }
    if (EmpStatus == "") {
        EmpStatus = 0;
    }
    //var svrPath = CONFIG.get('SERVERNAME');
    //var apiPath = svrPath + "Rating/GetRatingMaleFemalePromotionDetails?AppraisalCycleId=" + getRatingPagesAppraisalCycleId() + "&LogEmpID=" + empId + "&IReportee=" + IReportee + "&GradeId=" + GradeId + "&LocationId=" + LocationId + "&GroupAccountId=" + GroupAccountId + "&Gender=" + Gender + "&EmpStatus=" + EmpStatus + "&RoleId=" + $("#ddlRole").val();

    var _critNormMfPromoApi = buildCriticalityApiPayloadFromNormPromoMultiselect($("#ddlCriticalityPriorityNorm"));

    var svrPath = CONFIG.get('SERVERNAME') + "/Rating/GetRatingMaleFemalePromotionDetails";

    RequestData = {
        AppraisalCycleId: getRatingPagesAppraisalCycleId(),
        LoginEmployeeId: empId,
        ReporteeIds: IReportee,
        GradeId: GradeId,
        LocationId: LocationId,
        GroupAccountId: GroupAccountId,
        Gender: Gender,
        EmpStatus: EmpStatus,
        RoleId: $('#ddlRole').val(),
        CriticalityPriorityId: _critNormMfPromoApi.criticalityPriorityIds

    }



    $('#tblMFPromotionSummary tbody tr').remove();

    return CommonAjaxGetForNormalization(svrPath, RequestData, headerInfo).done(function (ratingPromotionOverallData) {

        if (ratingPromotionOverallData.Success == true) {

            var MaleTotal = 0;
            var MalePromotionPer = 0;
            var FemaleTotal = 0;
            var FemalePromotionPer = 0;

            /////////////////////////////

            var Male_CurrentOrgDist = 0;
            var Male_PromoRecoReceived = 0;
            var Male_Ratio = 0;
            var Male_FinalApproved = 0;
            var Male_FinalApprovedPer = 0;

            var Female_CurrentOrgDist = 0;
            var Female_PromoRecoReceived = 0;
            var Female_Ratio = 0;
            var Female_FinalApproved = 0;
            var Female_FinalApprovedPer = 0;

            var OthersTotal = 0;
            var OthersPromotionPer = 0;
            var Others_CurrentOrgDist = 0;
            var Others_PromoRecoReceived = 0;
            var Others_Ratio = 0;
            var Others_FinalApproved = 0;
            var Others_FinalApprovedPer = 0;

            ////////////////////////////



            var MaleCurrentorgDistrubution = 0.00;
            var Maleratio = 0;


            ratingPromotionOverallData.Result.forEach(function (R1, index) {

                MaleTotal += R1.MaleCount
                MalePromotionPer += R1.MalePercentage

                FemaleTotal += R1.FemaleCount
                FemalePromotionPer += R1.FemalePercentage

                OthersTotal += R1.OthersCount
                OthersPromotionPer += R1.OthersPercentage
            });

            ratingPromotionOverallData.Result.forEach(function (d, index) {

                var cols = "";

                var newRow1 = $("<tr>");


                var MaleCurrentorgDistrubution = 0.00;
                var Maleratio = 0;

                var FemaleCurrentorgDistrubution = 0.00;
                var FemaleIdealNumber = 0;
                var Femaleratio = 0;
                var Femaledifference = 0;

                var MaleApprovedRatio = 0;
                var FemaleApprovedRatio = 0;

                var OthersCurrentorgDistrubution = 0.00;
                var OthersIdealNumber = 0;
                var Othersratio = 0;
                var Othersdifference = 0;
                var OthersApprovedRatio = 0;


                //  MaleCurrentorgDistrubution = ((d.MaleCount / MaleTotal) * 100).toFixed(2).replace(".00", "");


                if (isNaN((d.MaleCount / MaleTotal) * 100)) {
                    MaleCurrentorgDistrubution = 0;
                } else {
                    MaleCurrentorgDistrubution = ((d.MaleCount / MaleTotal) * 100).toFixed(2).replace(".00", "");
                    Male_CurrentOrgDist = parseFloat(Male_CurrentOrgDist) + ((d.MaleCount / MaleTotal) * 100);

                }

                //   MaleCurrentorgDistrubution += parseFloat(MaleCurrentorgDistrubution);
                if (isNaN((d.MaleRecommendationForPromotion / d.MaleCount) * 100)) {
                    Maleratio = 0;
                    Male_Ratio = parseFloat(Male_Ratio) + parseFloat(Maleratio);
                    Male_Ratio = (Male_Ratio).toFixed(2).replace(".00", "");

                } else {
                    Maleratio = ((d.MaleRecommendationForPromotion / d.MaleCount) * 100);
                    Male_Ratio = parseFloat(Male_Ratio) + parseFloat(((d.MaleRecommendationForPromotion / d.MaleCount) * 100));
                    Maleratio = (Maleratio).toFixed(2).replace(".00", "");
                    Male_Ratio = (Male_Ratio).toFixed(2).replace(".00", "");
                }

                /// For Female

                FemaleCurrentorgDistrubution = ((d.FemaleCount / FemaleTotal) * 100).toFixed(2).replace(".00", "");

                if (isNaN((d.FemaleCount / FemaleTotal) * 100)) {
                    FemaleCurrentorgDistrubution = 0;

                    Female_CurrentOrgDist = parseFloat(Female_CurrentOrgDist) + parseFloat(FemaleCurrentorgDistrubution);
                } else {
                    FemaleCurrentorgDistrubution = ((d.FemaleCount / FemaleTotal) * 100).toFixed(2).replace(".00", "");

                    Female_CurrentOrgDist = parseFloat(Female_CurrentOrgDist) + ((d.FemaleCount / FemaleTotal) * 100);
                }


                if (isNaN((d.FeMaleRecommendationForPromotion / d.FemaleCount) * 100)) {
                    Femaleratio = 0;

                } else {
                    Femaleratio = ((d.FeMaleRecommendationForPromotion / d.FemaleCount) * 100).toFixed(2).replace(".00", "");
                }

                //For Others
                OthersCurrentorgDistrubution = ((d.OthersCount / OthersTotal) * 100).toFixed(2).replace(".00", "");

                if (isNaN((d.OthersCount / OthersTotal) * 100)) {
                    OthersCurrentorgDistrubution = 0;

                    Others_CurrentOrgDist = parseFloat(Others_CurrentOrgDist) + parseFloat(OthersCurrentorgDistrubution);
                } else {
                    OthersCurrentorgDistrubution = ((d.OthersCount / OthersTotal) * 100).toFixed(2).replace(".00", "");

                    Others_CurrentOrgDist = parseFloat(Others_CurrentOrgDist) + ((d.OthersCount / OthersTotal) * 100);
                }


                if (isNaN((d.OthersRecommendationForPromotion / d.OthersCount) * 100)) {
                    Othersratio = 0;

                } else {
                    Othersratio = ((d.OthersRecommendationForPromotion / d.OthersCount) * 100).toFixed(2).replace(".00", "");
                }

                if (isNaN((d.OthersApprovedCount / d.OthersCount) * 100)) {
                    OthersApprovedRatio = 0;
                    Others_FinalApproved = parseFloat(Others_FinalApproved) + parseFloat(OthersApprovedRatio);
                } else {
                    OthersApprovedRatio = ((d.OthersApprovedCount / d.OthersCount) * 100).toFixed(2).replace(".00", "");
                    Others_FinalApproved = parseFloat(Others_FinalApproved) + parseFloat(((d.OthersApprovedCount / d.OthersCount) * 100));
                }

                if (isNaN((d.MaleApprovedCount / d.MaleCount) * 100)) {
                    MaleApprovedRatio = 0;
                    Male_FinalApproved = parseFloat(Male_FinalApproved) + parseFloat(MaleApprovedRatio);
                } else {
                    MaleApprovedRatio = ((d.MaleApprovedCount / d.MaleCount) * 100).toFixed(2).replace(".00", "");
                    Male_FinalApproved = parseFloat(Male_FinalApproved) + parseFloat(((d.MaleApprovedCount / d.MaleCount) * 100));
                }

                if (isNaN((d.FemaleApprovedCount / d.FemaleCount) * 100)) {
                    FemaleApprovedRatio = 0;
                    Male_FinalApprovedPer = Male_FinalApprovedPer + FemaleApprovedRatio;

                } else {
                    FemaleApprovedRatio = ((d.FemaleApprovedCount / d.FemaleCount) * 100).toFixed(2).replace(".00", "");

                    Male_FinalApprovedPer = Male_FinalApprovedPer + ((d.FemaleApprovedCount / d.FemaleCount) * 100);
                }
                //  Male_CurrentOrgDist = Male_CurrentOrgDist + MaleCurrentorgDistrubution;
                Male_PromoRecoReceived = (parseInt(Male_PromoRecoReceived) + parseInt(d.MaleRecommendationForPromotion)).toFixed(2).replace(".00", "");;
                //Male_Ratio = Male_Ratio + Maleratio;
                // Male_FinalApproved = Male_FinalApproved + d.MaleApprovedCount;
                //Male_FinalApprovedPer = Male_FinalApprovedPer + FemaleApprovedRatio;

                // Female_CurrentOrgDist = parseFloat(Female_CurrentOrgDist) + parseFloat(FemaleCurrentorgDistrubution);
                Female_PromoRecoReceived = parseFloat(Female_PromoRecoReceived) + parseFloat(d.FeMaleRecommendationForPromotion);
                Female_Ratio = parseFloat(Female_Ratio) + parseFloat(Femaleratio);
                Female_FinalApproved = parseFloat(Female_FinalApproved) + parseFloat(d.FemaleApprovedCount);
                Female_FinalApprovedPer = parseFloat(Female_FinalApprovedPer) + parseFloat(FemaleApprovedRatio);

                Others_PromoRecoReceived = parseFloat(Others_PromoRecoReceived) + parseFloat(d.OthersRecommendationForPromotion);
                Others_Ratio = parseFloat(Others_Ratio) + parseFloat(Othersratio);
                Others_FinalApproved = parseFloat(Others_FinalApproved) + parseFloat(d.OthersApprovedCount);
                Others_FinalApprovedPer = parseFloat(Others_FinalApprovedPer) + parseFloat(OthersApprovedRatio);

                cols += '<td>' + d.Grade + '</td>';
                cols += '<td style="text-align: center;">' + d.MaleCount + '</td>';
                cols += '<td style="text-align: center;">' + MaleCurrentorgDistrubution + '</td>';

                cols += '<td style="text-align: center;">' + d.MaleRecommendationForPromotion + '</td>';

                cols += '<td style="text-align: center;">' + Maleratio + '</td>';

                cols += '<td style="text-align: center;">' + d.MaleApprovedCount + '</td>';
                cols += '<td style="text-align: center;">' + MaleApprovedRatio + '</td>';

                cols += '<td style="text-align: center;">' + d.FemaleCount + '</td>';
                cols += '<td style="text-align: center;">' + FemaleCurrentorgDistrubution + '</td>';

                cols += '<td style="text-align: center;">' + d.FeMaleRecommendationForPromotion + '</td>';
                cols += '<td style="text-align: center;">' + Femaleratio + '</td>';

                cols += '<td style="text-align: center;">' + d.FemaleApprovedCount + '</td>';
                cols += '<td style="text-align: center;">' + FemaleApprovedRatio + '</td>';

                cols += '<td style="text-align: center;">' + d.OthersCount + '</td>';
                cols += '<td style="text-align: center;">' + OthersCurrentorgDistrubution + '</td>';

                cols += '<td style="text-align: center;">' + d.OthersRecommendationForPromotion + '</td>';
                cols += '<td style="text-align: center;">' + Othersratio + '</td>';

                cols += '<td style="text-align: center;">' + d.OthersApprovedCount + '</td>';
                cols += '<td style="text-align: center;">' + OthersApprovedRatio + '</td>';


                newRow1.append(cols);
                $("#tblMFPromotionSummary").append(newRow1);

            })


            var cols = "";
            var newRow1 = $("<tr>");


            Male_CurrentOrgDist = Male_CurrentOrgDist.toFixed(2).replace(".00", "");
            cols += '<td><b>Total<b/></td>';

            Male_Ratio = (Male_PromoRecoReceived / MaleTotal) * 100;
            Female_Ratio = (Female_PromoRecoReceived / FemaleTotal) * 100;

            Male_FinalApproved = Male_FinalApproved.toFixed(2).replace(".00", "");
            Male_FinalApprovedPer = parseFloat(Male_FinalApprovedPer).toFixed(2).replace(".00", "");
            Female_CurrentOrgDist = parseFloat(Female_CurrentOrgDist).toFixed(2).replace(".00", "");
            Male_Ratio = parseFloat(Male_Ratio).toFixed(2).replace(".00", "");
            Female_Ratio = parseFloat(Female_Ratio).toFixed(2).replace(".00", "");

            if (isNaN(Female_Ratio)) {
                Female_Ratio = 0;
            }

            if (isNaN(Male_Ratio)) {
                Male_Ratio = 0;
            }

            cols += '<td style="text-align: center;"><b>' + MaleTotal + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + Male_CurrentOrgDist + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + Male_PromoRecoReceived + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + Male_Ratio + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + Male_FinalApproved + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + Male_FinalApprovedPer + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + FemaleTotal + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + Female_CurrentOrgDist + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + Female_PromoRecoReceived + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + Female_Ratio + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + Female_FinalApproved + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + Female_FinalApprovedPer + '<b/></td>';

            cols += '<td style="text-align: center;"><b>' + OthersTotal + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + Others_CurrentOrgDist + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + Others_PromoRecoReceived + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + Others_Ratio + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + Others_FinalApproved + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + Others_FinalApprovedPer + '<b/></td>';

            newRow1.append(cols);
            $("#tblMFPromotionSummary").append(newRow1);
        }
        else
            hideRatingsPageLoaderIfNotRoleBulk();
    });
}

//var GridtableToExcel = (function () {
//    var uri = 'data:application/vnd.ms-excel;base64,',
//        template = `
//        <html xmlns:o="urn:schemas-microsoft-com:office:office"
//              xmlns:x="urn:schemas-microsoft-com:office:excel"
//              xmlns="http://www.w3.org/TR/REC-html40">
//        <head>
//            <!--[if gte mso 9]>
//            <xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
//            <x:Name>{worksheet}</x:Name>
//            <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
//            </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml>
//            <![endif]-->
//        </head>
//        <body><table>{table}</table></body></html>`,

//        base64 = function (s) {
//            return window.btoa(unescape(encodeURIComponent(s)));
//        },
//        format = function (s, c) {
//            return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; });
//        };

//    return function (tableId, worksheetName, ButtonId) {
//        var $table = $('#' + tableId);
//        var visibleTable = $('<table></table>');

//        $table.find('tr:visible').each(function () {
//            var $tr = $(this);
//            var $newRow = $('<tr></tr>');

//            $tr.find('th:visible, td:visible').each(function () {
//                var $td = $(this);
//                var tag = $td.prop('tagName').toLowerCase();
//                var $newCell = $('<' + tag + '></' + tag + '>');
//                var cellText = '';

//                // Clone the cell so we can safely remove hidden elements
//                var $clone = $td.clone();

//                // Remove hidden children
//                $clone.find('*').each(function () {
//                    if ($(this).css('display') === 'none' || $(this).css('visibility') === 'hidden') {
//                        $(this).remove();
//                    }
//                });

//                // If select
//                if ($clone.find('select').length > 0) {
//                    cellText = $clone.find('select option:selected').text().trim();
//                }
//                // If textarea
//                else if ($clone.find('textarea').length > 0) {
//                    cellText = $clone.find('textarea').val()?.trim() || '';
//                }
//                // If input (but not hidden)
//                else if ($clone.find('input[type!="hidden"]').length > 0) {
//                    cellText = $clone.find('input[type!="hidden"]').val()?.trim() || '';
//                }
//                // Otherwise get visible text
//                else {
//                    cellText = $clone.text().trim();
//                }

//                //$newCell.text(cellText);
//                var columnName = $td.closest('table').find('thead th').eq($td.index()).text().trim();

//                // Preserve <th> (header) elements for bold formatting
//                if ($td.prop("tagName").toLowerCase() === "th") {
//                    $newCell = $("<th></th>"); // Keep headers bold
//                } else {
//                    $newCell = $("<td></td>");

//                    // Apply Excel text format only to "promotionDate" column
//                    if (columnName === "Last Promotion Date") {
//                        $newCell.attr("style", "mso-number-format:'@';"); // Force text format
//                    }
//                }

//                $newCell.text(cellText);

//                $newRow.append($newCell);
//            });

//            visibleTable.append($newRow);
//        });

//        var ctx = {
//            worksheet: worksheetName || 'Worksheet',
//            table: visibleTable.html()
//        };

//        document.getElementById(ButtonId).href = uri + base64(format(template, ctx));
//        document.getElementById(ButtonId).download = worksheetName + '.xls';
//    };
//})();

function ExportFullGridToExcel(tableId, worksheetName, buttonId) {
    var dataTable = $('#' + tableId).DataTable();

    // Save current page state
    var currentPageLength = dataTable.page.len();

    // Change to show all records
    dataTable.page.len(-1).draw();  // -1 tells DataTables to show all entries

    // Use a short timeout to let DataTables redraw
    setTimeout(function () {
        // Call your original export function
        GridtableToExcel(tableId, worksheetName, buttonId);

        // Revert to original page length
        dataTable.page.len(currentPageLength).draw();
    }, 500); // Wait for redraw to complete
}

var GridtableToExcel = (function () {
    var uri = 'data:application/vnd.ms-excel;base64,',
        template = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office"
              xmlns:x="urn:schemas-microsoft-com:office:excel"
              xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <!--[if gte mso 9]>
            <xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
            <x:Name>{worksheet}</x:Name>
            <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
            </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml>
            <![endif]-->
        </head>
        <body><table>{table}</table></body></html>`,

        base64 = function (s) {
            return window.btoa(unescape(encodeURIComponent(s)));
        },
        format = function (s, c) {
            return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; });
        };

    return function (tableId, worksheetName, ButtonId) {
        var $table = $('#' + tableId);
        var visibleTable = $('<table></table>');

        // Get index of "PastPM" column
        var pastPMIndex = -1;
        $table.find('thead th').each(function (index) {
            if ($(this).text().trim() === "Past RM's'") {
                pastPMIndex = index;
            }
        });

        $table.find('tr').each(function () {
            var $tr = $(this);
            var $newRow = $('<tr></tr>');

            $tr.find('th, td').each(function (i) {
                if (i === pastPMIndex) {
                    return; // Skip "PastPM" column
                }

                var $td = $(this);
                var tag = $td.prop('tagName').toLowerCase();
                var $newCell = $('<' + tag + '></' + tag + '>');
                var cellText = '';

                var $clone = $td.clone();

                $clone.find('*').each(function () {
                    if ($(this).css('display') === 'none' || $(this).css('visibility') === 'hidden') {
                        $(this).remove();
                    }
                });

                if ($clone.find('select').length > 0) {
                    cellText = $clone.find('select option:selected').text().trim();
                } else if ($clone.find('textarea').length > 0) {
                    cellText = $clone.find('textarea').val()?.trim() || '';
                } else if ($clone.find('input[type!="hidden"]').length > 0) {
                    cellText = $clone.find('input[type!="hidden"]').val()?.trim() || '';
                } else {
                    cellText = $clone.text().trim();
                }

                var columnName = $td.closest('table').find('thead th').eq($td.index()).text().trim();

                if (tag === "th") {
                    $newCell = $("<th></th>");
                } else {
                    $newCell = $("<td></td>");
                    if (columnName === "Last Promotion Date") {
                        $newCell.attr("style", "mso-number-format:'@';");
                    }
                }

                $newCell.text(cellText);
                $newRow.append($newCell);
            });

            visibleTable.append($newRow);
        });

        var ctx = {
            worksheet: worksheetName || 'Worksheet',
            table: visibleTable.html()
        };

        document.getElementById(ButtonId).href = uri + base64(format(template, ctx));
        document.getElementById(ButtonId).download = worksheetName + '.xls';
    };


})();



var tableToExcel = (function () {

    var uri = 'data:application/vnd.ms-excel;base64,',
        template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
        base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) },
        format = function (s, c) {
            return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; })
        }
    return function (tableId, name, ButtonId) {

        if (!tableId.nodeType) tableId = document.getElementById(tableId)

        var ctx = { worksheet: name || 'Worksheet', table: $('#' + tableId.id)[0].innerHTML }

        document.getElementById(ButtonId).href = uri + base64(format(template, ctx));
        document.getElementById(ButtonId).download = name + '.xls';

    }
})()


/////////////////////////////////////Normalization Studio view Section/////////////////////////////////




//////////////////////////////////////////////////////////////////////////////////////////////////////


function BindMaleFemaleNormalization() {
    var empId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };
    ///var IReportee = $('#ddlReporteeNorm :selected').val(); //$("#ddlReporteeNorm").val().toString();

    // var IReportee = $("#ddlReporteeNorm").val().toString();
    var GradeId = $("#ddlgradeNorm").val().toString();
    var LocationId = $("#ddllocationNorm").val().toString();
    var GroupAccountId = $("#ddlgroupaccountNorm").val().toString();
    var Gender = $("#ddlgenderNorm").val().toString();
    var EmpStatus = $("#ddlEmployeeStatusNorm").val().toString();
    var Promotion = $("#ddlPromotionNorm").val().toString();


    var selectedEmployees = $("#ddlReporteeNorm").val();


    if (selectedEmployees.indexOf("-1") != -1) {
        selectedEmployees[selectedEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    }
    var IReportee = selectedEmployees.toString();


    if (IReportee == "") {
        IReportee = 0;
    }

    if (GradeId == "") {
        GradeId = 0;
    }
    if (LocationId == "") {
        LocationId = 0;
    } if (GroupAccountId == "") {
        GroupAccountId = 0;
    }
    if (Gender == "") {
        Gender = 0;
    }
    if (EmpStatus == "") {
        EmpStatus = 0;
    }
    if (Promotion == "") {
        Promotion = 0;
    }

    var _critNormMfApi = buildCriticalityApiPayloadFromNormPromoMultiselect($("#ddlCriticalityPriorityNorm"));

    //$('#NormalizationMaleFemaletbl tbody tr').slice(3).remove();

    $('#NormalizationMaleFemaletbl tbody').empty();


    //$('#NormalizationMaleFemaletbl tbody tr:gt(2)').remove();

    //var svrPath = CONFIG.get('SERVERNAME');
    //var apiPath = svrPath + "Rating/GetMaleFemaleNormalization?EMPID=" + empId + "&AppraisalCycleId=" + getRatingPagesAppraisalCycleId() + "&IReportee=" + IReportee + "&GradeId=" + GradeId + "&LocationId=" + LocationId + "&GroupAccountId=" + GroupAccountId + "&Gender=" + Gender + "&EmpStatus=" + EmpStatus + "&Promotion=" + Promotion + "&RoleId=" + $('#ddlRole').val();

    //


    var svrPath = CONFIG.get('SERVERNAME') + "/Rating/GetMaleFemaleNormalization";

    RequestData = {
        AppraisalCycleId: getRatingPagesAppraisalCycleId(),
        LoginEmployeeId: empId,
        ReporteeIds: IReportee,
        GradeId: GradeId,
        LocationId: LocationId,
        GroupAccountId: GroupAccountId,
        Gender: Gender,
        EmpStatus: EmpStatus,
        Promotion: Promotion,
        RoleId: $('#ddlRole').val(),
        CriticalityPriorityId: _critNormMfApi.criticalityPriorityIds
    }





    return CommonAjaxGetForNormalization(svrPath, RequestData, headerInfo).done(function (ratingNormData) {


        if (ratingNormData.Success == true) {

            let Arr = ratingNormData;

            let outputArray = [];

            // Count variable is used to add the
            // new unique value only once in the
            // outputArray.
            let count = 0;

            // Start variable is used to set true
            // if a repeated duplicate value is
            // encontered in the output array.
            let start = false;

            for (let j = 0; j < Arr.Result.length; j++) {
                for (let k = 0; k < outputArray.length; k++) {
                    if (Arr.Result[j].Grade == outputArray[k]) {
                        start = true;
                    }
                }
                count++;
                if (count == 1 && start == false) {
                    outputArray.push(Arr.Result[j].Grade);
                }
                start = false;
                count = 0;
            }

            //  console.log(outputArray);
            //ratingNormData.Result.forEach(function (d, index) {


            var Male_Total = 0;
            var Male_TotalEE1 = 0;
            var Male_TotalEE = 0;
            var Male_TotalME = 0;
            var Male_TotalBE = 0;

            var Female_Total = 0;
            var Female_TotalEE1 = 0;
            var Female_TotalEE = 0;
            var Female_TotalME = 0;
            var Female_TotalBE = 0;

            var Others_Total = 0;
            var Others_TotalEE1 = 0;
            var Others_TotalEE = 0;
            var Others_TotalME = 0;
            var Others_TotalBE = 0;

            for (let j = 0; j < outputArray.length; j++) {


                var GradeWiseMaleCount = 0;
                var GradeWiseFemaleCount = 0;
                var GradeWiseOthersCount = 0;

                var EE1Male = 0;
                var EEMale = 0;
                var MEMale = 0;
                var BEMale = 0;
                var EE1FeMale = 0;
                var EEFeMale = 0;
                var MEFeMale = 0;
                var BEFeMale = 0;

                var EE1Others = 0;
                var EEOthers = 0;
                var MEOthers = 0;
                var BEOthers = 0;

                for (let k = 0; k < Arr.Result.length; k++) {

                    if (outputArray[j] == Arr.Result[k].Grade) {
                        GradeWiseMaleCount += Arr.Result[k].MaleCurrentCount;
                        GradeWiseFemaleCount += Arr.Result[k].FemaleCurrentCount;
                        GradeWiseOthersCount += Arr.Result[k].OthersCurrentCount;

                        if (Arr.Result[k].Rating == 'BE') {
                            BEMale = Arr.Result[k].MaleCurrentCount
                            BEFeMale = Arr.Result[k].FemaleCurrentCount;
                            BEOthers = Arr.Result[k].OthersCurrentCount;
                        }
                        if (Arr.Result[k].Rating == 'ME') {
                            MEMale = Arr.Result[k].MaleCurrentCount
                            MEFeMale = Arr.Result[k].FemaleCurrentCount;
                            MEOthers = Arr.Result[k].OthersCurrentCount;
                        }
                        if (Arr.Result[k].Rating == 'EE') {
                            EEMale = Arr.Result[k].MaleCurrentCount
                            EEFeMale = Arr.Result[k].FemaleCurrentCount;
                            EEOthers = Arr.Result[k].OthersCurrentCount;
                        }
                        if (Arr.Result[k].Rating == 'EE1') {
                            EE1Male = Arr.Result[k].MaleCurrentCount
                            EE1FeMale = Arr.Result[k].FemaleCurrentCount;
                            EE1Others = Arr.Result[k].OthersCurrentCount;
                        }
                    }

                }

                Male_Total = Male_Total + GradeWiseMaleCount;
                Male_TotalEE1 = Male_TotalEE1 + EE1Male;
                Male_TotalEE = Male_TotalEE + EEMale;
                Male_TotalME = Male_TotalME + MEMale;
                Male_TotalBE = Male_TotalBE + BEMale;


                Female_Total = Female_Total + GradeWiseFemaleCount;
                Female_TotalEE1 = Female_TotalEE1 + EE1FeMale;
                Female_TotalEE = Female_TotalEE + EEFeMale;
                Female_TotalME = Female_TotalME + MEFeMale;
                Female_TotalBE = Female_TotalBE + BEFeMale;

                Others_Total = Others_Total + GradeWiseOthersCount;
                Others_TotalEE1 = Others_TotalEE1 + EE1Others;
                Others_TotalEE = Others_TotalEE + EEOthers;
                Others_TotalME = Others_TotalME + MEOthers;
                Others_TotalBE = Others_TotalBE + BEOthers;


                var newRow = $("<tr>");
                var cols = "";
                cols += '<td style="text-align: center;">' + outputArray[j] + '</td>';
                cols += '<td style="text-align: center;">' + GradeWiseMaleCount + '</td>';
                cols += '<td style="text-align: center;">' + EE1Male + '</td>';
                cols += '<td style="text-align: center;">' + EEMale + '</td>';
                cols += '<td style="text-align: center;">' + MEMale + '</td>';
                cols += '<td style="text-align: center;">' + BEMale + '</td>';

                cols += '<td style="text-align: center;">' + GradeWiseFemaleCount + '</td>';
                cols += '<td style="text-align: center;">' + EE1FeMale + '</td>';
                cols += '<td style="text-align: center;">' + EEFeMale + '</td>';
                cols += '<td style="text-align: center;">' + MEFeMale + '</td>';
                cols += '<td style="text-align: center;">' + BEFeMale + '</td>';

                cols += '<td style="text-align: center;">' + GradeWiseOthersCount + '</td>';
                cols += '<td style="text-align: center;">' + EE1Others + '</td>';
                cols += '<td style="text-align: center;">' + EEOthers + '</td>';
                cols += '<td style="text-align: center;">' + MEOthers + '</td>';
                cols += '<td style="text-align: center;">' + BEOthers + '</td>';

                newRow.append(cols);
                $("#NormalizationMaleFemaletbl tbody").append(newRow);
            }


            var newRow2 = $("<tr>");
            var cols2 = "";
            cols2 += '<td  style="text-align: center;"><b>Total<b/></td>';

            cols2 += '<td  style="text-align: center;"><b>' + Male_Total + '<b/></td>';
            cols2 += '<td  style="text-align: center;"><b>' + Male_TotalEE1 + '<b/></td>';
            cols2 += '<td  style="text-align: center;"><b>' + Male_TotalEE + '<b/></td>';
            cols2 += '<td  style="text-align: center;"><b>' + Male_TotalME + '<b/></td>';
            cols2 += '<td  style="text-align: center;"><b>' + Male_TotalBE + '<b/></td>';

            cols2 += '<td  style="text-align: center;"><b>' + Female_Total + '<b/></td>';
            cols2 += '<td  style="text-align: center;"><b>' + Female_TotalEE1 + '<b/></td>';
            cols2 += '<td  style="text-align: center;"><b>' + Female_TotalEE + '<b/></td>';
            cols2 += '<td  style="text-align: center;"><b>' + Female_TotalME + '<b/></td>';
            cols2 += '<td  style="text-align: center;"><b>' + Female_TotalBE + '<b/></td>';

            cols2 += '<td  style="text-align: center;"><b>' + Others_Total + '<b/></td>';
            cols2 += '<td  style="text-align: center;"><b>' + Others_TotalEE1 + '<b/></td>';
            cols2 += '<td  style="text-align: center;"><b>' + Others_TotalEE + '<b/></td>';
            cols2 += '<td  style="text-align: center;"><b>' + Others_TotalME + '<b/></td>';
            cols2 += '<td  style="text-align: center;"><b>' + Others_TotalBE + '<b/></td>';

            newRow2.append(cols2);
            $("#NormalizationMaleFemaletbl tbody").append(newRow2);
            //outputArray.Result.forEach(function (a, index) {


            //    ratingNormData.Result.forEach(function (b, index) {

            //        var newRow = $("<tr>");
            //        var cols = "";
            //        cols += '<td><b>Expected Count (EC)</b></td>';

            //        newRow.append(cols);
            //        $("#NormalizationMaleFemaletbl").append(newRow);

            //    })
            //});


            //})
        }
    });
}

function showBellCurve() {

    //var totalemp = BE + ME + EE + EE1 + notgiven;

    var totalemp = BE_STab + ME_STab + EE_STab + EE1_STab;
    var title = '';

    var ddlReporteeValue = $('#ddlReporteeNorm').val();
    var ddlReporteeValueText = $('#ddlReporteeNorm :selected').text();

    // var TotalSpan = GlobalTotalNotGiven + GlobalTotalGiven;

    if (ddlReporteeValue != '') {

        if (($("#ddlReporteeNorm option").length == $("#ddlReporteeNorm option:selected").length)) {

            title = 'Bell Curve (Total no. of employees as per selected span : ' + TotalSpan + ')'
        } else {

            if (GlobalTotalGiven == 0) {
                title = 'Bell Curve (Total no. of employees as per selected span : ' + TotalSpan + ')'
            } else {
                title = 'Bell Curve (Total no. of employees as per selected span : ' + TotalSpan + ')'
            }

        }

    }
    else {
        title = 'Bell Curve (Total no. of employees in your span :' + TotalSpan + ')'
    }

    $('#myModal').modal('show');
    if (typeof Highcharts === 'undefined') {
        console.error('Highcharts is not loaded. Skipping bell curve render.');
        return;
    }
    Highcharts.chart("bellcurve", {

        legend: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        tooltip: {
            shared: true
        },
        title: {
            text: title
        },
        xAxis: {
            categories: [
                "",
                "EE(5%)",
                "EE(25%)",
                "ME(60%)",
                "BE(10%)",
                ""
            ]
        },
        yAxis: {
            title: {
                text: "No of Employees"
            }
        },

        responsive: {
            rules: [
                {
                    condition: {
                        maxWidth: 500,
                        callback() {
                            return true;
                        }
                    }
                }
            ]
        },

        plotOptions: {

            areaspline: {
                dataLabels: {
                    enabled: true
                },
                pointStart: 0,
                marker: {
                    enabled: false,
                    symbol: "circle",
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },
        series: [
            {
                type: "areaspline",
                name: "No. of Employees",
                data: [0, EE1_STab, EE_STab, ME_STab, BE_STab, 0],
            },


        ]
    });

}





function BindNormalizationView() {


    BindNormalizationOverallData();

    BindMaleFemaleNormalization();

    //MyReporteeBellCurve();
    //BindGradeNorm();

    if (ShowGenderLocation.includes(sessionStorage.LocationId)) {

        BellCurve();
    } else {

        MyReporteeBellCurve();

    }

}

function bindChart() {

    var grades = [];
    var TotalEmployees = [];
    var ApprovedforPromotion = [];
    var RecommendationForPromotion = [];
    var empId = sessionStorage.EmployeeId;
    var svrPath = CONFIG.get('SERVERNAME');

    // var IReportee = $("#ddlReporteePromo").val().toString();
    var GradeId = $("#ddlgradePromo").val().toString();
    var LocationId = $("#ddllocationPromo").val().toString();
    var GroupAccountId = $("#ddlgroupaccountPromo").val().toString();
    var Gender = $("#ddlgenderPromo").val().toString();
    var EmpStatus = $("#ddlEmployeeStatusPromo").val().toString();


    var selectedEmployees = $("#ddlReporteePromo").val();


    if (selectedEmployees.indexOf("-1") != -1) {
        selectedEmployees[selectedEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    }
    var IReportee = selectedEmployees.toString();

    if (IReportee == "") {
        IReportee = 0;
    }
    //if (($("#ddlReporteePromo option").length == $("#ddlReporteePromo option:selected").length)) {

    //    IReportee = 0;
    //}
    if (GradeId == "") {
        GradeId = 0;
    }
    if (LocationId == "") {
        LocationId = 0;
    } if (GroupAccountId == "") {
        GroupAccountId = 0;
    }
    if (Gender == "") {
        Gender = 0;
    }
    if (EmpStatus == "") {
        EmpStatus = 0;
    }



    var svrPath = CONFIG.get('SERVERNAME') + "/Rating/GetDataforPromotionGraph";

    RequestData = {
        AppraisalCycleId: getRatingPagesAppraisalCycleId(),
        LoginEmployeeId: empId,
        ReporteeIds: IReportee,
        GradeId: GradeId,
        LocationId: LocationId,
        GroupAccountId: GroupAccountId,
        Gender: Gender,
        EmpStatus: EmpStatus,
        RoleId: $('#ddlRole').val()

    }


    $.ajax({
        type: "POST",
        url: svrPath,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        },
        cache: false,
        data: JSON.stringify(RequestData),
        async: false,
        success: function (data) {
            $(".loader-div").hide();
            //setting  data from result to variables
            if (data && Array.isArray(data.Result) && data.Result.length > 0) {

                for (var i = 0; i < data.Result.length; i++) {
                    grades[i] = data.Result[i].Grade;
                    TotalEmployees[i] = data.Result[i].TotalEmployees;
                    ApprovedforPromotion[i] = data.Result[i].ApprovedforPromotion;
                    RecommendationForPromotion[i] = data.Result[i].RecommendationForPromotion;
                }
            }

        },
        error: function (response) {

            hideRatingsPageLoaderIfNotRoleBulk();
            alert(response + '4');
        }
    });
    if (typeof Highcharts === 'undefined') {
        console.error('Highcharts is not loaded. Skipping promotion chart render.');
        return;
    }
    Highcharts.chart("prom_chart", {

        legend: {
            enabled: true
        },
        credits: {
            enabled: false
        },
        tooltip: {
            shared: true
        },
        title: {
            text: "Ideal vs Recommended vs Approved Promotions"
        },
        xAxis: {
            categories: grades

        },
        yAxis: {
            title: {
                text: "No of Employees"
            }
        },

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500,
                    callback() {
                        return true;
                    }
                }
            }]
        },

        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
            },
        },
        series: [{
            type: "column",
            name: "Ideal no of Employees",
            data: TotalEmployees,
        },
        {
            type: "column",
            name: "Recommended for Promotion",
            data: RecommendationForPromotion,
        },
        {
            type: "column",
            name: "Approved for Promotion",
            data: ApprovedforPromotion,
        }

        ]
    });

}
////function BindEmployeeBy_Grade_Location_Group() {

//    var ddlReporteeValue = $('#ddlgrade :selected').val();
//    var ddlReporteeValue = $('#ddllocation :selected').val();
//    var ddlReporteeValue = $('#ddlgroupaccount :selected').val();

//    var sortedData = [];


//    for (var i = 0; i < rawData.length; i++) {


//        if (rawData[i].RMName == ddlReporteeValue) {
//            sortedData.push(rawData[i]);
//        } else {
//            if (ddlReporteeValue == "0") {
//                sortedData.push(rawData[i]);
//            }

//        }

//    }

//    var table = $('#tblEmpRatingList').DataTable();

//    table.clear();

//    $("#tblEmpRatingList").DataTable({

//        data: sortedData,
//        "sPaginationType": "full_numbers",
//        "iDisplayLength": RecordsCountPerPage,
//        "bLengthChange": true,
//        "bDestroy": true,
//        "searching": true,
//        info: true,
//        ordering: false,
//        paging: false,
//        "columnDefs": [
//            { "orderData": [], "targets": 0 }, //TURN OFF DEFAULT SORTING OF TABLE
//            { "orderable": false, "targets": 0 }  //TURN OFF SORTABLILITY FOR COLUMN 1
//        ],
//        "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
//        dom: '<"row"<"col-sm-6"Bl><"col-sm-6"f>>' + '<"row"<"col-sm-12"<"table-responsive"tr>>>' + '<"row"<"col-sm-5"i><"col-sm-7"p>>',
//        aoColumns: [



//            {

//                "render": function (data, type, row, meta) {
//                    return "<span>" + row.EmployeeName + "</span><span><input type='hidden' id='hdnRMName' name='hdnRMName' value='" + row.RMName + "'/></span>";
//                },
//                "sWidth": "6%"
//            },
//            {
//                "render": function (data, type, row, meta) {

//                    return "<a class='lnkRMHistory' style='margin-right:4px;' title='RM History'  data-id=" + row.PEPEmployeeId + " onclick='ViewRMHistory(" + row.PEPEmployeeId + ")'></a>";
//                },
//                "sWidth": "6%"
//            },
//            {

//                "render": function (data, type, row, meta) {
//                    return "<span>" + row.Gender + "</span><span><input type='hidden' id='hdnRowStatus' name='hdnRowStatus' value='" + row.RowStatus + "'/></span>";
//                },
//                "sWidth": "6%"
//            },
//            {

//                "render": function (data, type, row, meta) {
//                    return "<span>" + row.GradeName + "</span><span><input type='hidden' id='hdnGradeID' name='hdnGradeID' value='" + row.GradeID + "'/></span>";
//                },
//                "sWidth": "6%"
//            },
//            {

//                "render": function (data, type, row, meta) {
//                    return "<span>" + row.LocationName + "</span><span><input type='hidden' id='hdnLocationID' name='hdnLocationID' value='" + row.LocationID + "'/></span>";
//                },
//                "sWidth": "6%"
//            },
//            {

//                "render": function (data, type, row, meta) {
//                    return "<span>" + row.AccountGroup + "</span><span><input type='hidden' id='hdnAccountGroup' name='hdnAccountGroup' value='" + row.AccountGroup + "'/></span>";
//                },
//                "sWidth": "6%"
//            },


//            {

//                "render": function (data, type, row, meta) {
//                    return "<span>" + row.TotalExp + "</span><span><input type='hidden' id='hdnRowStatus' name='hdnRowStatus' value='" + row.RowStatus + "'/></span>";
//                },
//                "sWidth": "6%"
//            },

//            {

//                "render": function (data, type, row, meta) {
//                    return "<span>" + row.InfogainExp + "</span><span><input type='hidden' id='hdnId' name='hdnId' value='" + row.Id + "'/></span>";
//                },
//                "sWidth": "6%"
//            },
//            {
//                "render": function (data, type, row, meta) {
//                    return "<span>" + row.PrevRating + "</span><span><input type='hidden' id='hdnLastRatingGivenBy' name='hdnLastRatingGivenBy' value='" + row.LastratingGivenBy + "'/></span>";
//                },
//                "sWidth": "6%"
//            },


//            {
//                mData: "LastpromotionDate",
//                "sWidth": "12%"
//            },
//            {
//                data: "CurrentRating",
//                render: renderCurrentRatinggDropdown,
//                width: "9%"
//            },
//            {

//                "render": function (data, type, row, meta) {
//                    return "<span>NA</span><span><input type='hidden' id='hdnLastratingGivenBy' name='hdnLastratingGivenBy' value='" + row.LastratingGivenBy + "'/></span>";
//                },
//            },
//            {
//                data: "RecoForPromotion",
//                render: renderPromotionnDropdown,
//                width: "4%"
//            },
//            {
//                data: "RecoForPromotion",
//                render: renderPromotionTrackDropdown,
//                width: "4%"
//            },

//            {

//                "render": function (data, type, row, meta) {
//                    return "NA"
//                },
//            },

//            {

//                "render": function (data, type, row, meta) {
//                    return "<a class='table-icon fa fa-history lnkHistory' style='margin-right:4px;' title='History'  data-id=" + row.PEPEmployeeId + " onclick='ViewClaimHistory(" + row.PEPEmployeeId + ")'></a><span>" + row.CurrentStatus + "</span><span><input type='hidden' id='hdnNextApproverId' name='hdnNextApproverId' value='" + row.NextApproverId + "'/></span>";
//                },
//                "sWidth": "6%"
//            },

//            {
//                mRender: function (data, type, full) {
//                    var btn;


//                    if (EnableRoleId == $('#ddlRole').val()) {

//                        if (full["RowStatus"] == "5") {

//                            btn = '<div data-toggle="tooltip" class="Description" title="' + full["comment"] + '">' + full["comment"] + '</div>';
//                        } else {
//                            btn = "<textarea  maxlength='500'  type='text' value='" + full["comment"] + "'  class='form-control' rows='3' column='1'  id=" + full["PEPEmployeeId"] + " />" + full["comment"] + "</textarea><span><input type='hidden' id='hdnEmployeeId' name='hdnEmployeeId' value='" + + full["PEPEmployeeId"] + "'/></span>";

//                        }

//                    } else {
//                        btn = '<div data-toggle="tooltip" class="Description" title="' + full["comment"] + '">' + full["comment"] + '</div>';

//                    }

//                    return btn;
//                }
//                , className: "Description"
//            },


//        ],
//        "deferRender": true
//    });
//    changeBackgroundColor();
//}


function BindReporteesofReportee() {

    var ReporteeValuearray = [];
    var filterData = [];

    var ddlReporteeValue = $("#ddlReportee").val().toString();

    ReporteeValuearray = ddlReporteeValue.split(',');

    for (let j = 0; j < rawData.length; j++) {
        for (let k = 0; k < ReporteeValuearray.length; k++) {

            if (ReporteeValuearray[k] == '-1') {
                if (rawData[j].RMName == sessionStorage.EmployeeId.trim()) {
                    filterData.push(rawData[j]);

                }
            }
            if (rawData[j].RMName == ReporteeValuearray[k]) {
                filterData.push(rawData[j]);
            }
        }
    }

    if (ReporteeValuearray.length > 0 && ReporteeValuearray[0].length > 0 && filterData.length > 0) {
        BindTableForFilters(filterData)
    } else {
        BindTableForFilters(rawData)
    }

}

function filterApprovedData(TableName) {
    
    var sortedData = [];

    let filerDataSource = [];

    if (TableName == 'tblApprovedReporteeList') {
        filerDataSource = approvedReportees;
    } else {
        filerDataSource = rawData;
    }


    var table = $('#' + TableName).DataTable();

    table.clear();

    let colArr = [
        {
            "render": function (data, type, row, meta) {
                return "<span>" + row.EmployeeName + "</span><span><input type='hidden' id='hdnRMName' name='hdnRMName' value='" + row.RMName + "'/></span>";
            },
            "sWidth": "6%"
        },
        {
            "render": function (data, type, row, meta) {

                return "<a  style='margin-right:4px;' title='RM History'  data-id=" + row.PEPEmployeeId + " onclick='ViewRMHistory(" + row.PEPEmployeeId + ")'>View</a>";
            },
            "sWidth": "6%"
        },
        {

            "render": function (data, type, row, meta) {
                return "<span>" + row.Gender + "</span><span><input type='hidden' id='hdnRowStatus' name='hdnRowStatus' value='" + row.RowStatus + "'/></span>";
            },
            "sWidth": "6%"
        },
        {

            "render": function (data, type, row, meta) {
                return "<span>" + row.GradeName + "</span><span><input type='hidden' id='hdnGradeID' name='hdnGradeID' value='" + row.GradeID + "'/></span>";
            },
            "sWidth": "6%"
        },
        {

            "render": function (data, type, row, meta) {
                return "<span>" + row.LocationName + "</span><span><input type='hidden' id='hdnLocationID' name='hdnLocationID' value='" + row.LocationID + "'/></span>";
            },
            "sWidth": "6%"
        },
        {

            "render": function (data, type, row, meta) {
                return "<span>" + row.AccountGroup + "</span><span><input type='hidden' id='hdnAccountGroup' name='hdnAccountGroup' value='" + row.AccountGroup + "'/></span>";
            },
            "sWidth": "6%"
        },

        {
            "render": function (data, type, row, meta) {
                return "<span>" + row.TotalExp + "</span><span><input type='hidden' id='hdnRowStatus' name='hdnRowStatus' value='" + row.RowStatus + "'/></span>";
            },
            "sWidth": "6%"
        },
        {
            "render": function (data, type, row, meta) {
                return "<span>" + row.InfogainExp + "</span><span><input type='hidden' id='hdnId' name='hdnId' value='" + row.Id + "'/></span>";
            },
            "sWidth": "6%"
        },
        {
            mData: "PrevRating"
        },
        {
            mData: "LastpromotionDate", "render": function (data, type, row, meta) {
                // var dt = new Date(data);
                return "<span>" + row.LastpromotionDate + "</span ><span><input type='hidden' id='hdnSLastratingGivenBy' name='hdnSLastratingGivenBy' value='" + row.SLastRatingGivenBy + "' /></span>";
            },
            "sWidth": "20%"
        }
    ];

    if (TableName == 'tblApprovedReporteeList') {
        colArr.push(
            {

                "render": function (data, type, row, meta) {

                    return "<span>" + row.ApprovedRating + "</span><span><input type='hidden' id='hdnLastratingGivenBy' name='hdnLastratingGivenBy' value='" + row.LastratingGivenBy + "'/></span>";
                },
            }
        );
        colArr.push(
            {

                "render": function (data, type, row, meta) {
                    return "<span>" + row.ApprovedRecoPromo + "</span>";
                },
            }
        );
    }

    if (TableName != 'tblApprovedReporteeList') {
        colArr.push(
            {
                data: "CurrentRating",
                render: renderCurrentRatinggDropdown,
                width: "9%"
            }
        );
        colArr.push(
            {
                data: "RecoForPromotion",
                render: renderPromotionnDropdown,
                width: "4%"
            }
        );
        colArr.push(
            {
                data: "PromotionTrack",
                render: renderPromotionTrackDropdown,
                width: "4%"
            },
            {
                "render": function (data, type, row, meta) {
                    return "<span>" + row.RecoDesignation + "</span>";
                },
                "sWidth": "6%"
            },
            {


                "render": function (data, type, row) {

                    if (row.RecoDesignation == "NA") {
                        return "NA";
                    } else {
                        return `
        <select class="form-control rating consent-dropdown" data-empid="${row.PEPEmployeeId}">
            <option value="1" ${row.RecoForPromotion === 1 ? "selected" : ""}>Yes</option>
            <option value="2" ${row.RecoForPromotion === 2 ? "selected" : ""}>No</option>
        </select>
        `;
                    }

                },
                "sWidth": "6%"
            }
        );

        colArr.push({
            "render": function (data, type, row, meta) {
                return "<a class='table-icon fa fa-history lnkHistory' style='margin-right:4px;' title='History'  data-id=" + row.PEPEmployeeId + " onclick='ViewClaimHistory(" + row.PEPEmployeeId + ")'></a><span>" + row.CurrentStatus + "</span><span><input type='hidden' id='hdnNextApproverId' name='hdnNextApproverId' value='" + row.NextApproverId + "'/></span>";
            },
            "sWidth": "6%"
        });
        colArr.push({
            //"render": function (data, type, row, meta) {
            //    var btn;

            //    if (row.RowStatus == 3) {
            //        btn = "<textarea maxlength='500'  disabled type='text' value='" + row.Comment + "'  class='form-control' rows='3' column='1'  id=" + row.PEPEmployeeId + " />" + row.Comment + "</textarea><span><input type='hidden' id='hdnEmployeeId' name='hdnEmployeeId' value='" + row.PEPEmployeeId + "'/></span>";

            //    } else {
            //        btn = "<textarea  maxlength='500' type='text' value='" + row.Comment + "'  class='form-control' rows='3' column='1' id=" + row.PEPEmployeeId + " />" + row.Comment + "</textarea><span><input type='hidden' id='hdnEmployeeId' name='hdnEmployeeId' value='" + row.PEPEmployeeId + "'/></span>";

            //    }

            //    return btn;
            //},
            //"sWidth": "30%"



            mRender: function (data, type, full) {
                var btn;


                if (EnableRoleId == $('#ddlRole').val()) {

                    if (full["RowStatus"] == "5") {

                        btn = '<div data-toggle="tooltip" class="Description" title="' + full["comment"] + '">' + full["comment"] + '</div>';
                    } else {
                        btn = "<textarea  maxlength='500'  type='text' value='" + full["comment"] + "'  class='form-control' rows='3' column='1'  id=" + full["PEPEmployeeId"] + " />" + full["comment"] + "</textarea><span><input type='hidden' id='hdnEmployeeId' name='hdnEmployeeId' value='" + + full["PEPEmployeeId"] + "'/></span>";

                    }

                } else {
                    if (full["RowStatus"] == "3" && $('#ddlRole').val() == 2) {

                        btn = "<textarea  maxlength='500'  type='text' value='" + full["comment"] + "'  class='form-control' rows='3' column='1'  id=" + full["PEPEmployeeId"] + " />" + full["comment"] + "</textarea><span><input type='hidden' id='hdnEmployeeId' name='hdnEmployeeId' value='" + + full["PEPEmployeeId"] + "'/></span>";

                    } else {
                        btn = '<div data-toggle="tooltip" class="Description" title="' + full["comment"] + '">' + full["comment"] + '</div>';
                    }

                }

                return btn;
            }
            , className: "Description"


        });
    }

    $('#' + TableName).DataTable({

        data: filerDataSource,
        "sPaginationType": "full_numbers",
        "iDisplayLength": RecordsCountPerPage,
        "bLengthChange": true,
        "bDestroy": true,
        info: true,
        "searching": true,
        "paging": true,
        "ordering": true,
        "searching": true,
        "columnDefs": [
            { "orderData": [], "targets": 0 }, //TURN OFF DEFAULT SORTING OF TABLE
            { "orderable": false, "targets": 0 }  //TURN OFF SORTABLILITY FOR COLUMN 1
        ],
        "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
        dom: '<"row"<"col-sm-6"Bl><"col-sm-6"f>>' + '<"row"<"col-sm-12"<"table-responsive"tr>>>' + '<"row"<"col-sm-5"i><"col-sm-7"p>>',
        aoColumns: colArr,
        "deferRender": false
    });
    changeBackgroundColor();
}

function filterData(filter, TableName) {

    var needRefetchAfterClearCriticality = false;
    if (TableName === 'tblEmpRatingList') {
        var $cfBefore = getFiltersDropCriticalitySelect();
        if ($cfBefore.length) {
            var parsedBefore = parseCriticalityFilterForRequest($cfBefore);
            needRefetchAfterClearCriticality = parsedBefore.criticalityPriorityIdParam !== ''
                || parsedBefore.applyClientNotCriticalFilter
                || parsedBefore.applyClientCriticalityUnion;
        }
    }

    try {
        var $fd = $('#filtersDropDiv');
        if ($fd.find("#ddlPromotion").length) { $fd.find("#ddlPromotion").multiselect("deselectAll", false); $fd.find("#ddlPromotion").multiselect("refresh"); }
        if ($fd.find("#ddlgrade").length) { $fd.find("#ddlgrade").multiselect("deselectAll", false); $fd.find("#ddlgrade").multiselect("refresh"); }
        if ($fd.find("#ddllocation").length) { $fd.find("#ddllocation").multiselect("deselectAll", false); $fd.find("#ddllocation").multiselect("refresh"); }
        if ($fd.find("#ddlgroupaccount").length) { $fd.find("#ddlgroupaccount").multiselect("deselectAll", false); $fd.find("#ddlgroupaccount").multiselect("refresh"); }
        if ($fd.find("#ddlgender").length) { $fd.find("#ddlgender").multiselect("deselectAll", false); $fd.find("#ddlgender").multiselect("refresh"); }
        if ($fd.find("#ddlEmployeeStatus").length) { $fd.find("#ddlEmployeeStatus").multiselect("deselectAll", false); $fd.find("#ddlEmployeeStatus").multiselect("refresh"); }
        var $critBar = getFiltersDropCriticalitySelect();
        if ($critBar.length) { $critBar.multiselect("deselectAll", false); $critBar.multiselect("refresh"); }
        if ($("#ddlCriticalityPriorityNorm").length) { $("#ddlCriticalityPriorityNorm").multiselect("deselectAll", false); $("#ddlCriticalityPriorityNorm").multiselect("refresh"); }
        if ($("#ddlCriticalityPriorityPromo").length) { $("#ddlCriticalityPriorityPromo").multiselect("deselectAll", false); $("#ddlCriticalityPriorityPromo").multiselect("refresh"); }
    } catch (e) {
        console.warn('filterData: error clearing filter dropdowns', e);
    }

    var sortedData = [];
    if (TableName == 'tblEmpRatingList') {
        if (filter == 'BE') {
            applyTblEmpRatingBandButtonAnimation('BE');
            filter = '3';
        }
        else if (filter == 'ME') {
            applyTblEmpRatingBandButtonAnimation('ME');
            filter = '2';
        }
        else if (filter == 'EE') {
            applyTblEmpRatingBandButtonAnimation('EE');
            filter = '1';
        }
        else if (filter == 'EE1') {
            applyTblEmpRatingBandButtonAnimation('EE1');
            filter = '4';
        }
        else if (filter == 'All') {
            applyTblEmpRatingBandButtonAnimation('All');
        }
        else if (filter == 'Not') {
            applyTblEmpRatingBandButtonAnimation('Not');
            filter = '0';
        }
        else if (filter == 'RM') {
            applyTblEmpRatingBandButtonAnimation('RM');
            filter = 'RM';
        }
        else if (filter == 'Total') {
            applyTblEmpRatingBandButtonAnimation('Total');
            filter = 'Total';
        }
    } else {
        if (filter == 'BE') {
            $('.animation').removeClass('animation');
            $('.MR_filterBE').closest('td').addClass('animation');

            filter = '3';
        }
        else if (filter == 'ME') {
            $('.animation').removeClass('animation');
            $('.MR_filterME').closest('td').addClass('animation');
            filter = '2';
        }
        else if (filter == 'EE') {
            $('.animation').removeClass('animation');
            $('.MR_filterEE').closest('td').addClass('animation');
            filter = '1';
        }
        else if (filter == 'EE1') {
            $('.animation').removeClass('animation');
            $('.MR_filterEE1').closest('td').addClass('animation');
            filter = '4';
        }
        else if (filter == 'All') {
            $('.animation').removeClass('animation');
            $('.MR_filterAll').closest('td').addClass('animation');
        }
        else if (filter == 'Not') {
            $('.animation').removeClass('animation');
            $('.MR_filterNot').closest('td').addClass('animation');
            filter = '0';
        }
        else if (filter == 'RM') {
            $('.animation').removeClass('animation');
            $('.MR_RM').closest('td').addClass('animation');
            filter = 'RM';
        } else if (filter == 'Total') {
            $('.animation').removeClass('animation');
            //$('.MR_Total').closest('td').addClass('animation');
            filter = 'Total';
        }
    }

    let filerDataSource = [];

    if (TableName == 'tblApprovedReporteeList') {
        filerDataSource = approvedReportees;
    } else {
        filerDataSource = rawData;
    }

    for (var i = 0; i < filerDataSource.length; i++) {
        if (filter == 'All') {
            if (filerDataSource[i].CurrentRating != '0') {
                sortedData.push(filerDataSource[i]);
            }
        }
        else if (filter == 'Total') {
            sortedData.push(filerDataSource[i]);
        }
        else if (filter == 'RM') {

            if (filerDataSource[i].RMName == sessionStorage.EmployeeId.trim()) {

                sortedData.push(filerDataSource[i]);
            }
        }
        else if (filter == '0') {
            if (filerDataSource[i].CurrentRating == '0') {
                sortedData.push(filerDataSource[i]);
            }
        } else {
            if (filerDataSource[i].CurrentRating == filter) {
                sortedData.push(filerDataSource[i]);
            }
        }
    }
    
    // For tblEmpRatingList use the same binding as initial load (GetEmpRatingListColumnDefinitions, UpdateTableHeaders, UpdateTableColumnVisibility)
    if (TableName == 'tblEmpRatingList') {
        if (needRefetchAfterClearCriticality) {
            _pendingTblEmpRatingBandFilter = filter;
            BindReporteeRatings();
            return;
        }
        BindTableForFilters(sortedData);
        changeBackgroundColor();
        if (filter == 'Total' && typeof FirstScreenfilterschange === 'function') {
            FirstScreenfilterschange();
        }
        return;
    }

    var table = $('#' + TableName).DataTable();

    table.clear();

    let colArr = [
        {
            "render": function (data, type, row, meta) {
                return "<span>" + row.EmployeeName + "</span><span><input type='hidden' id='hdnRMName' name='hdnRMName' value='" + row.RMName + "'/></span>";
            },
            "sWidth": "6%"
        },
        {
            "render": function (data, type, row, meta) {

                return "<a  style='margin-right:4px;' title='RM History'  data-id=" + row.PEPEmployeeId + " onclick='ViewRMHistory(" + row.PEPEmployeeId + ")'>View</a>";
            },
            "sWidth": "6%"
        },
        {

            "render": function (data, type, row, meta) {
                return "<span>" + row.Gender + "</span><span><input type='hidden' id='hdnRowStatus' name='hdnRowStatus' value='" + row.RowStatus + "'/></span>";
            },
            "sWidth": "6%"
        },
        {

            "render": function (data, type, row, meta) {
                return "<span>" + row.GradeName + "</span><span><input type='hidden' id='hdnGradeID' name='hdnGradeID' value='" + row.GradeID + "'/></span>";
            },
            "sWidth": "6%"
        },
        {

            "render": function (data, type, row, meta) {
                return "<span>" + row.LocationName + "</span><span><input type='hidden' id='hdnLocationID' name='hdnLocationID' value='" + row.LocationID + "'/></span>";
            },
            "sWidth": "6%"
        },
        {

            "render": function (data, type, row, meta) {
                return "<span>" + row.AccountGroup + "</span><span><input type='hidden' id='hdnAccountGroup' name='hdnAccountGroup' value='" + row.AccountGroup + "'/></span>";
            },
            "sWidth": "6%"
        },

        {
            "render": function (data, type, row, meta) {
                return "<span>" + row.TotalExp + "</span><span><input type='hidden' id='hdnRowStatus' name='hdnRowStatus' value='" + row.RowStatus + "'/></span>";
            },
            "sWidth": "6%"
        },
        {
            "render": function (data, type, row, meta) {
                return "<span>" + row.InfogainExp + "</span><span><input type='hidden' id='hdnId' name='hdnId' value='" + row.Id + "'/></span>";
            },
            "sWidth": "6%"
        },
        {
            "render": function (data, type, row, meta) {
                return "<span>" + row.TalentCube + "</span><input type='hidden' id='hdnGradeLevel' name='hdnGradeLevel' value='" + row.GradeLevel + "'/></span>";
            },
            "sWidth": "6%"
        },
        {
            "render": function (data, type, row, meta) {

                return "<span>" + row.Prevrating + "</span><span><input type='hidden' id='hdnLastRatingGivenBy' name='hdnLastRatingGivenBy' value='" + row.LastratingGivenBy + "'/></span>";
            },
            "sWidth": "6%"
        },
        {
            mData: "LastpromotionDate", "render": function (data, type, row, meta) {
                // var dt = new Date(data);
                return "<span>" + row.LastpromotionDate + "</span ><span><input type='hidden' id='hdnSLastratingGivenBy' name='hdnSLastratingGivenBy' value='" + row.SLastRatingGivenBy + "' /></span>";
            },
            "sWidth": "20%"
        }
    ];

    if (TableName == 'tblApprovedReporteeList') {
        colArr.push(
            {

                "render": function (data, type, row, meta) {

                    return "<span>" + row.ApprovedRating + "</span><span><input type='hidden' id='hdnLastratingGivenBy' name='hdnLastratingGivenBy' value='" + row.LastratingGivenBy + "'/></span>";
                },
            }
        );
        colArr.push(
            {

                "render": function (data, type, row, meta) {
                    return "<span>" + row.ApprovedRecoPromo + "</span>";
                },
            }
        );
    }

    if (TableName != 'tblApprovedReporteeList') {
        colArr.push(
            {
                data: "CurrentRating",
                render: renderCurrentRatinggDropdown,
                width: "9%"
            }
        );
        colArr.push(
            {
                data: "RecoForPromotion",
                render: renderPromotionnDropdown,
                width: "4%"
            }
        );
        colArr.push(
            {
                data: "PromotionTrack",
                render: renderPromotionTrackDropdown,
                width: "4%"
            }
        );

        colArr.push(

            {
                "render": function (data, type, row, meta) {
                    return "<span>" + row.RecoDesignation + "</span>";
                },
                "sWidth": "6%"
            },
            {


                "render": function (data, type, row) {

                    if (row.RecoDesignation == "NA") {
                        return "NA";
                    } else {
                        return `
        <select class="form-control rating consent-dropdown" data-empid="${row.PEPEmployeeId}">
            <option value="1" ${row.RecoForPromotion === 1 ? "selected" : ""}>Yes</option>
            <option value="2" ${row.RecoForPromotion === 2 ? "selected" : ""}>No</option>
        </select>
        `;
                    }

                },
                "sWidth": "6%"
            },
            {
                "render": function (data, type, row, meta) {

                    var Status = '--';

                    if (row.RowStatus == 1 && row.CurrentRating == "0") {
                        Status = "Not Initiated"
                    }
                    else if (row.RowStatus == 1) {
                        Status = "Saved in Draft"
                    }
                    else if ((row.RowStatus == 2 && row.ByRoleId != 3) || (row.RowStatus == 3 && $('#ddlRole').val() == 1)) {
                        Status = "Submitted"
                        BtndraftVisible = false;

                        $('#btnSubmitrating').prop('value', 'Update');
                    }
                    else if ((row.RowStatus == 2) && (row.ByRoleId == 3)) {
                        Status = "Pending Management Approval"
                        BtndraftVisible = false;

                        $('#btnSubmitrating').prop('value', 'Update');
                    }
                    else if (row.RowStatus == 3 && $('#ddlRole').val() == 2) {

                        Status = "Referred back by Approver";
                        BtndraftVisible = false;
                        Referbackdone = true;
                        $('#btnSubmitrating').prop('value', 'Update');

                    }
                    else if (row.RowStatus == 3 && $('#ddlRole').val() == 3) {

                        Status = "Referred back to Reviewer";
                        BtndraftVisible = false;
                        Referbackdone = true;
                        $('#btnSubmitrating').prop('value', 'Update');

                    }
                    else if (row.RowStatus == 5) {
                        Status = "Approved"
                        BtndraftVisible = false;
                        HistoryVisible = false;
                        $('#btnSubmitrating').prop('value', 'Update');
                    }
                    return "<a class='table-icon fa fa-history lnkHistory' style='margin-right:4px;display:none;' title='History'  data-id=" + row.PEPEmployeeId + " onclick='ViewClaimHistory(" + row.PEPEmployeeId + ")'></a><span>" + Status + "</span><span><input type='hidden' id='hdnNextApproverId' name='hdnNextApproverId' value='" + row.NextApproverId + "'/></span>";

                    //if (($('#ddlRole').val() == 2 || $('#ddlRole').val() == 3) && row.RowStatus == 5) {
                    //    return "<a class='table-icon fa fa-history lnkHistory' style='margin-right:4px;' title='History'  data-id=" + row.PEPEmployeeId + " onclick='ViewClaimHistory(" + row.PEPEmployeeId + ")'></a><span>" + Status + "</span><span><input type='hidden' id='hdnNextApproverId' name='hdnNextApproverId' value='" + row.NextApproverId + "'/></span>";
                    //} else {
                    //    return "<span class='lnkHistory' data-id=" + row.PEPEmployeeId + ">" + Status + "</span><span><input type='hidden' id='hdnNextApproverId' name='hdnNextApproverId' value='" + row.NextApproverId + "'/></span>";
                    //}
                },
                "sWidth": "6%"
            }
        );
        colArr.push(

            {

                mRender: function (data, type, full) {
                    var btn;

                    if (EnableRoleId == $('#ddlRole').val()) {


                        if (full["RowStatus"] == "5") {

                            btn = '<div data-toggle="tooltip" class="Description" title="' + full["comment"] + '">' + full["comment"] + '</div>';
                        } else {
                            btn = "<textarea  maxlength='500'  type='text' value='" + full["comment"] + "'  class='form-control' rows='3' column='1'  id=" + full["PEPEmployeeId"] + " />" + full["comment"] + "</textarea><span><input type='hidden' id='hdnEmployeeId' name='hdnEmployeeId' value='" + + full["PEPEmployeeId"] + "'/></span>";

                        }

                    } else {
                        if (full["RowStatus"] == 3 && $('#ddlRole').val() == 2) {

                            btn = "<textarea  maxlength='500'  type='text' value='" + full["comment"] + "'  class='form-control' rows='3' column='1'  id=" + full["PEPEmployeeId"] + " />" + full["comment"] + "</textarea><span><input type='hidden' id='hdnEmployeeId' name='hdnEmployeeId' value='" + + full["PEPEmployeeId"] + "'/></span>";

                        } else {
                            btn = '<div data-toggle="tooltip" class="Description" title="' + full["comment"] + '">' + full["comment"] + '</div>';
                        }
                    }

                    return btn;
                }
                , className: "Description"

            }

        );
    }

    $('#' + TableName).DataTable({

        data: sortedData,
        "sPaginationType": "full_numbers",
        "iDisplayLength": RecordsCountPerPage,
        "bLengthChange": true,
        "bDestroy": true,
        info: true,
        "searching": true,
        "paging": true,
        "ordering": true,
        "searching": true,
        "autoWidth": TableName == 'tblEmpRatingList' ? false : undefined,
        "columnDefs": TableName == 'tblEmpRatingList' ? [
            { "orderData": [], "targets": 0 }, //TURN OFF DEFAULT SORTING OF TABLE
            { "orderable": false, "targets": [17, 19, 21, 22] },  //TURN OFF SORTABLILITY FOR Reco Designation, Criticality, Status, Action columns
            { "targets": [6, 17, 18], "visible": false } // Hide Gender (6), Reco. Designation (17), Reco. Designation Consent (18) by default
        ] : [
            { "orderData": [], "targets": 0 }, //TURN OFF DEFAULT SORTING OF TABLE
            { "orderable": false, "targets": 0 }  //TURN OFF SORTABLILITY FOR COLUMN 1
        ],
        "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
        dom: '<"row"<"col-sm-6"Bl><"col-sm-6"f>>' + '<"row"<"col-sm-12"<"table-responsive"tr>>>' + '<"row"<"col-sm-5"i><"col-sm-7"p>>',
        aoColumns: colArr,
        "deferRender": false,
        initComplete: function (settings, json) {
            if (IsSubmitted == 0 && EnableRoleId == $('#ddlRole').val()) {
                $('#btnratingSaveDraft').show();
            } else {
                $('#btnratingSaveDraft').hide();
            }



            var table = $('#tblEmpRatingList').DataTable();
            if (ShowGenderLocation.includes(sessionStorage.LocationId)) {
                table.column(2).visible(true);
                $('.hide-this').show();

            } else {
                table.column(2).visible(false);
                $('.hide-this').hide();

            }

            // Reco Designation columns are at index 19 and 20 (after Criticality at index 18)
            // Columns 15 and 16 are Current Rating and Current Promotion Reco (should always be visible)
            // Column 18 is Criticality (should always be visible)
            if (IsDesigUploaded == 1) {
                table.column(17).visible(true);  // Reco Designation
                table.column(18).visible(true);  // Reco Designation Consent
                $('.hide-this-Desig1').show();
                $('.hide-this-Desig2').show();
            } else {
                table.column(17).visible(false);  // Reco Designation
                table.column(18).visible(false);  // Reco Designation Consent
                $('.hide-this-Desig1').hide();
                $('.hide-this-Desig2').hide();
            }
            
            // Ensure Criticality column (18) is always visible
            table.column(19).visible(true);  // Criticality
            
            // Ensure Current Rating and Current Promotion Reco columns (15, 16) are always visible
            table.column(14).visible(true);  // Current Rating
            table.column(15).visible(true);  // Current Promotion Reco


            if (($('#ddlRole').val() == 1) && HistoryVisible == false) {
                $('.lnkHistory').hide()
            } else {
                $('.lnkHistory').show()
            }

            if ((EnableRoleId == $('#ddlRole').val()) || (Referbackdone == true)) {
                $('#btnSubmitrating').show();
                //    $('#btnratingSaveDraft').show();
            }
            else {
                $('#btnSubmitrating').hide();
                $('#btnratingSaveDraft').hide();
            }
        }
    });
    changeBackgroundColor();



    //setTimeout(function () {
    //    if (BtndraftVisible == true) {
    //        $('#btnratingSaveDraft').show();
    //    } else {
    //        $('#btnratingSaveDraft').hide();
    //    }
    //}, 5000);


}

function changeBackgroundColor() {

    $('.currRating').each(function () {

        if ($(this).val() == '1') {

            $(this).closest('td select').css('background-color', 'white');
            $(this).closest('td select').css('color', 'rgb(26 25 25)');

        }

        else if ($(this).val() == '2') {

            $(this).closest('td select').css('background-color', 'white');
            $(this).closest('td select').css('color', 'rgb(26 25 25)');

        }

        else if ($(this).val() == '3') {
            $(this).closest('td select').css('background-color', 'white');
            $(this).closest('td select').css('color', 'rgb(26 25 25)');

        }

        else if ($(this).val() == '4') {
            $(this).closest('td select').css('background-color', 'white');
            $(this).closest('td select').css('color', 'rgb(26 25 25)');

        }

        else {

            $(this).closest('td select').css('background-color', 'white');
            $(this).closest('td select').css('color', 'rgb(26 25 25)');

        }

    });

}


function onCurrentRatingChange(event) {

    if ($(event).val() == '1') {

        $(event).closest('td select').css('background-color', 'white');
        $(event).closest('td select').css('color', 'rgb(26 25 25)');

    }

    else if ($(event).val() == '2') {

        $(event).closest('td select').css('background-color', 'white');
        $(event).closest('td select').css('color', 'rgb(26 25 25)');

    }

    else if ($(event).val() == '3') {

        $(event).closest('td select').css('background-color', 'white');
        $(event).closest('td select').css('color', 'rgb(26 25 25)');


    }

    else if ($(event).val() == '4') {

        $(event).closest('td select').css('background-color', 'white');
        $(event).closest('td select').css('color', 'rgb(26 25 25)');

    }

    else {

        $(event).closest('td select').css('background-color', 'white');
        $(event).closest('td select').css('color', 'rgb(26 25 25)');



    }

}





function MyReporteeBellCurve() {

    var total;
    var empId = sessionStorage.EmployeeId;
    var svrPath = CONFIG.get('SERVERNAME');



    //  var IReportee = $("#ddlReporteeNorm").val();
    var GradeId = $("#ddlgradeNorm").val().toString();
    var LocationId = $("#ddllocationNorm").val().toString();
    var GroupAccountId = $("#ddlgroupaccountNorm").val().toString();
    var Gender = $("#ddlgenderNorm").val().toString();
    var EmpStatus = $("#ddlEmployeeStatusNorm").val().toString();
    var Promotion = $("#ddlPromotionNorm").val().toString();



    //if (($("#ddlReporteeNorm option").length == $("#ddlReporteeNorm option:selected").length)) {

    //    IReportee = 0;
    //}

    //var selectedEmployees = [];
    //if (selectedEmployees.indexOf("-1") != -1) {
    //    selectedEmployees[selectedEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    //}
    //var IReportee = selectedEmployees.toString();

    var selectedEmployees = $("#ddlReporteeNorm").val();


    if (selectedEmployees.indexOf("-1") != -1) {
        selectedEmployees[selectedEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    }
    var IReportee = selectedEmployees.toString();

    if (IReportee == "") {
        IReportee = 0;
    }

    if (GradeId == "") {
        GradeId = 0;
    }

    if (LocationId == "") {
        LocationId = 0;
    }

    if (GroupAccountId == "") {
        GroupAccountId = 0;
    }

    if (Gender == "") {
        Gender = 0;
    }
    if (EmpStatus == "") {
        EmpStatus = 0;
    }


    if (Promotion == "") {

        Promotion = 0;
    }

    var svrPath = CONFIG.get('SERVERNAME') + "/Rating/GetDataForChart";

    RequestData = {
        AppraisalCycleId: getRatingPagesAppraisalCycleId(),
        LoginEmployeeId: empId,
        ReporteeIds: IReportee,
        GradeId: GradeId,
        LocationId: LocationId,
        GroupAccountId: GroupAccountId,
        Gender: Gender,
        EmpStatus: EmpStatus,
        Promotion: Promotion,
        RoleId: $('#ddlRole').val()

    }



    $.ajax({
        type: "POST",
        url: svrPath,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        },
        cache: false,
        data: JSON.stringify(RequestData),
        async: false,
        success: function (data) {
            $(".loader-div").hide();
            //setting  data from result to variables


            if (data && Array.isArray(data.Result) && data.Result.length >= 4) {
                BE_STab = data.Result[0].BE;
                ME_STab = data.Result[0].ME;
                EE_STab = data.Result[0].EE;
                EE1_STab = data.Result[0].EE1;
                MBE_STab = data.Result[1].BE;
                MME_STab = data.Result[1].ME;
                MEE_STab = data.Result[1].EE;
                MEE1_STab = data.Result[1].EE1;
                FBE_STab = data.Result[2].BE;
                FME_STab = data.Result[2].ME;
                FEE_STab = data.Result[2].EE;
                FEE1_STab = data.Result[2].EE1;
                notgiven = data.Result[3].EE;
                //  $('#filtersMyReportee').css('display', 'block');
                //$('#filtersDropDiv').css('display', 'block');

                //$('#RM_EEspan').text(EE_STab);
                //$('#RM_MEspan').text(ME_STab);
                //$('#RM_BEspan').text(BE_STab);
                //$('#RM_EE1span').text(EE1_STab);
                //$('#RM_Notspan').text(notgiven);
                total = EE_STab + ME_STab + BE_STab + EE1_STab;
                // $('#RM_Totalspan').text(total);

                TotalSpan = total + notgiven;

            }
        },
        error: function (response) {
            $(".loader-div").hide();
            alert(response + '2');
        }
    });
    var totalEmp = total + notgiven;
    var idealData = [(totalEmp * 0.05).toFixed(2), (totalEmp * 0.25).toFixed(2), (totalEmp * 0.6).toFixed(2), (totalEmp * 0.1).toFixed(2)];
    //  console.log(idealData);


    if (typeof Highcharts === 'undefined') {
        console.error('Highcharts is not loaded. Skipping normalization chart render.');
        return;
    }
    Highcharts.chart("chart_div", {

        legend: {
            align: 'left',
            verticalAlign: 'top',
            x: 110,
            y: 90,
            floating: false,
            borderWidth: 1,
            backgroundColor:
                Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF'
        },
        credits: {
            enabled: false
        },
        tooltip: {
            shared: true
        },
        title: {
            text: "Ideal vs Given Ratings"
        },
        xAxis: {
            categories: [
                "Exceeds Expectations(5%)",
                "Exceeds Expectations(25%)",
                "Meets Expectations(60%)",
                "Below Expectations(10%)"
            ]
        },
        yAxis: {
            title: {
                text: "No of Employees"
            }
        },

        responsive: {
            rules: [
                {
                    condition: {
                        maxWidth: 500,
                        callback() {
                            return true;
                        }
                    }
                }
            ]
        },

        plotOptions: {
            spline: {
                dataLabels: {
                    enabled: true
                },

                marker: {
                    enabled: true,
                    symbol: "circle",
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            },

        },
        series: [
            {
                type: "spline",
                name: "Ideal No. of Employees",
                data: [parseFloat(idealData[0]), parseFloat(idealData[1]), parseFloat(idealData[2]), parseFloat(idealData[3])],
            },
            {
                type: "spline",
                name: "Rating Given No. of Employees",
                data: [EE1_STab, EE_STab, ME_STab, BE_STab],
            }


        ]
    });



}




function BellCurve() {

    var total;
    var empId = sessionStorage.EmployeeId;
    var svrPath = CONFIG.get('SERVERNAME');

    //  var IReportee = $("#ddlReporteeNorm").val();
    var GradeId = $("#ddlgradeNorm").val().toString();
    var LocationId = $("#ddllocationNorm").val().toString();
    var GroupAccountId = $("#ddlgroupaccountNorm").val().toString();
    var Gender = $("#ddlgenderNorm").val().toString();
    var EmpStatus = $("#ddlEmployeeStatusNorm").val().toString();
    var Promotion = $("#ddlPromotionNorm").val().toString();

    if (($("#ddlReporteeNorm option").length == $("#ddlReporteeNorm option:selected").length)) {

        IReportee = 0;
    }

    var selectedEmployees = [];

    selectedEmployees = $("#ddlReporteeNorm").val();

    if (selectedEmployees.indexOf("-1") != -1) {
        selectedEmployees[selectedEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    }
    var IReportee = selectedEmployees.toString();


    if (IReportee == "") {
        IReportee = 0;
    }

    if (GradeId == "") {
        GradeId = 0;
    }
    if (LocationId == "") {
        LocationId = 0;
    } if (GroupAccountId == "") {
        GroupAccountId = 0;
    }
    if (Gender == "") {
        Gender = 0;
    }
    if (EmpStatus == "") {

        EmpStatus = 0;
    }
    if (Promotion == "") {

        Promotion = 0;
    }

    var svrPath = CONFIG.get('SERVERNAME') + "/Rating/GetDataForChart";

    RequestData = {
        AppraisalCycleId: getRatingPagesAppraisalCycleId(),
        LoginEmployeeId: empId,
        ReporteeIds: IReportee,
        GradeId: GradeId,
        LocationId: LocationId,
        GroupAccountId: GroupAccountId,
        Gender: Gender,
        EmpStatus: EmpStatus,
        Promotion: Promotion,
        RoleId: $('#ddlRole').val()
    }


    $.ajax({
        type: "POST",
        url: svrPath,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        },
        cache: false,
        data: JSON.stringify(RequestData),
        async: false,
        success: function (data) {
            hideRatingsPageLoaderIfNotRoleBulk();
            //setting  data from result to variables


            if (data && Array.isArray(data.Result) && data.Result.length >= 4) {
                BE_STab = data.Result[0].BE;
                ME_STab = data.Result[0].ME;
                EE_STab = data.Result[0].EE;
                EE1_STab = data.Result[0].EE1;
                MBE_STab = data.Result[1].BE;
                MME_STab = data.Result[1].ME;
                MEE_STab = data.Result[1].EE;
                MEE1_STab = data.Result[1].EE1;
                FBE_STab = data.Result[2].BE;
                FME_STab = data.Result[2].ME;
                FEE_STab = data.Result[2].EE;
                FEE1_STab = data.Result[2].EE1;
                notgiven = data.Result[3].EE;
                $('#filtersDiv').css('display', 'block');
                $('#EEspan').text(EE_STab);
                $('#MEspan').text(ME_STab);
                $('#BEspan').text(BE_STab);
                $('#EE1span').text(EE1_STab);
                $('#Notspan').text(notgiven);
                total = EE_STab + ME_STab + BE_STab + EE1_STab;
                $('#Totalspan').text(total);
                $('#Notspan').text(notgiven);
                TotalSpan = total + notgiven;

                GlobalTotalNotGiven = notgiven;

                GlobalTotalGiven = total;
            }
        },
        error: function (response) {


            hideRatingsPageLoaderIfNotRoleBulk();
            alert(response + '5');
        }
    });
    var totalEmp = total + notgiven;
    var idealData = [(totalEmp * 0.05).toFixed(2), (totalEmp * 0.25).toFixed(2), (totalEmp * 0.6).toFixed(2), (totalEmp * 0.1).toFixed(2)];
    //   console.log(idealData);
    if (typeof Highcharts === 'undefined') {
        console.error('Highcharts is not loaded. Skipping tabular chart render.');
        return;
    }
    Highcharts.chart("chart_div", {

        legend: {
            align: 'left',
            verticalAlign: 'top',
            x: 110,
            y: 90,
            floating: false,
            borderWidth: 1,
            backgroundColor:
                Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF'
        },
        credits: {
            enabled: false
        },
        tooltip: {
            shared: true
        },
        title: {
            text: "Ideal vs Given Ratings"
        },
        xAxis: {
            categories: [
                "Exceeds Expectations(5%)",
                "Exceeds Expectations(25%)",
                "Meets Expectations(60%)",
                "Below Expectations(10%)"
            ]
        },
        yAxis: {
            title: {
                text: "No of Employees"
            }
        },

        responsive: {
            rules: [
                {
                    condition: {
                        maxWidth: 500,
                        callback() {
                            return true;
                        }
                    }
                }
            ]
        },

        plotOptions: {
            spline: {
                dataLabels: {
                    enabled: true
                },

                marker: {
                    enabled: true,
                    symbol: "circle",
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            },

        },
        series: [
            {
                type: "spline",
                name: "Ideal No. of Employees",
                data: [parseFloat(idealData[0]), parseFloat(idealData[1]), parseFloat(idealData[2]), parseFloat(idealData[3])],
            },
            {
                type: "spline",
                name: "Rating Given No. of Employees",
                data: [EE1_STab, EE_STab, ME_STab, BE_STab],
            },

            {
                type: "column",
                name: "Male Count",
                data: [MEE1_STab, MEE_STab, MME_STab, MBE_STab],

            },
            {
                type: "column",
                name: "Female Count",
                data: [FEE1_STab, FEE_STab, FME_STab, FBE_STab],

            },
            {

                type: "column",

                name: "Others Count",

                data: [0, 0, 0, 0],

            }
        ]
    });


}

function BindTabDirectReporteeRatings() {
    $('.animation').removeClass('animation');

    var empId = sessionStorage.EmployeeId;
    //    var apraisalCycleId = $('#ddlRating :selected').val();
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating?AppraisalCycleId=" + getRatingPagesAppraisalCycleId() + "&LoginEmployeeId=" + empId;

    // $("#loading-overlay").show(); // Show loading image

    CommonAjaxGET(apiPath, headerInfo).done(function (ratingData) {

        if (ratingData.Success == false) {
            // console.log("tblEmpRating-" + ratingData.ErrorCode + ' ' + ratingData.ErrorMessage)
            var table = $('#tblMyReporteeList').DataTable();

            table.clear();

        }
        else {
            rawData = ratingData.Result;
        }
        //  alert(ratingData.Result);

        var ReporteesortedData = [];

        for (var i = 0; i < rawData.length; i++) {
            if (rawData[i].RMName == sessionStorage.EmployeeId) {
                ReporteesortedData.push(rawData[i]);
            }
        }

        $('#ReporteeNoTab2').text(ReporteesortedData.length);

        $("#tblMyReporteeList").DataTable({

            data: ratingData.Result,
            "sPaginationType": "full_numbers",
            "iDisplayLength": RecordsCountPerPage,
            "bLengthChange": true,
            "bDestroy": true,
            "searching": true,
            info: true,
            ordering: false,
            paging: false,
            "columnDefs": [
                { "orderData": [], "targets": 0 }, //TURN OFF DEFAULT SORTING OF TABLE
                { "orderable": false, "targets": 0 }  //TURN OFF SORTABLILITY FOR COLUMN 1
            ],
            "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
            dom: '<"row"<"col-sm-6"Bl><"col-sm-6"f>>' + '<"row"<"col-sm-12"<"table-responsive"tr>>>' + '<"row"<"col-sm-5"i><"col-sm-7"p>>',
            aoColumns: [

                {

                    "render": function (data, type, row, meta) {
                        return "<span>" + row.EmployeeName + "</span><span><input type='hidden' id='hdnRMName' name='hdnRMName' value='" + row.RMName + "'/></span>";
                    },
                    "sWidth": "6%"
                },
                {
                    "render": function (data, type, row, meta) {

                        return "<a  style='margin-right:4px;' title='RM History'  data-id=" + row.PEPEmployeeId + " onclick='ViewRMHistory(" + row.PEPEmployeeId + ")'>View</a>";
                    },
                    "sWidth": "6%"
                },
                {

                    "render": function (data, type, row, meta) {
                        return "<span>" + row.Gender + "</span><span><input type='hidden' id='hdnRowStatus' name='hdnRowStatus' value='" + row.RowStatus + "'/></span>";
                    },
                    "sWidth": "6%"
                },
                {

                    "render": function (data, type, row, meta) {
                        return "<span>" + row.GradeName + "</span><span><input type='hidden' id='hdnGradeID' name='hdnGradeID' value='" + row.GradeID + "'/></span>";
                    },
                    "sWidth": "6%"
                },
                {

                    "render": function (data, type, row, meta) {
                        return "<span>" + row.LocationName + "</span><span><input type='hidden' id='hdnLocationID' name='hdnLocationID' value='" + row.LocationID + "'/></span>";
                    },
                    "sWidth": "6%"
                },
                {

                    "render": function (data, type, row, meta) {
                        return "<span>" + row.AccountGroup + "</span><span><input type='hidden' id='hdnAccountGroup' name='hdnAccountGroup' value='" + row.AccountGroup + "'/></span>";
                    },
                    "sWidth": "6%"
                },

                {

                    "render": function (data, type, row, meta) {
                        return "<span>" + row.TotalExp + "</span><span><input type='hidden' id='hdnRowStatus' name='hdnRowStatus' value='" + row.RowStatus + "'/></span>";
                    },
                    "sWidth": "6%"
                },

                {

                    "render": function (data, type, row, meta) {
                        return "<span>" + row.InfogainExp + "</span><span><input type='hidden' id='hdnId' name='hdnId' value='" + row.Id + "'/></span>";
                    },
                    "sWidth": "6%"
                },

                {
                    "render": function (data, type, row, meta) {
                        return "<span>" + row.PrevRating + "</span><span><input type='hidden' id='hdnLastRatingGivenBy' name='hdnLastRatingGivenBy' value='" + row.LastratingGivenBy + "'/></span>";
                    },
                    "sWidth": "6%"
                },
                {
                    data: "CurrentRating",
                    render: renderCurrentRatinggDropdown,
                    width: "9%"
                },
                {

                    "render": function (data, type, row, meta) {
                        return "<span>NA</span><span><input type='hidden' id='hdnLastratingGivenBy' name='hdnLastratingGivenBy' value='" + row.LastratingGivenBy + "'/></span>";
                    },
                },
                {
                    data: "RecoForPromotion",
                    render: renderPromotionnDropdown,
                    width: "4%"
                },
                {
                    data: "RecoForPromotion",
                    render: renderPromotionTrackDropdown,
                    width: "4%"
                },
                {

                    "render": function (data, type, row, meta) {
                        return "NA"
                    },
                },
                {

                    "render": function (data, type, row, meta) {
                        return "<a class='table-icon fa fa-history lnkHistory' style='margin-right:4px;display:none;' title='History'  data-id=" + row.PEPEmployeeId + " onclick='ViewClaimHistory(" + row.PEPEmployeeId + ")'></a><span>" + row.CurrentStatus + "</span><span><input type='hidden' id='hdnNextApproverId' name='hdnNextApproverId' value='" + row.NextApproverId + "'/></span>";
                    },
                    "sWidth": "6%"
                },
                {
                    mRender: function (data, type, full) {
                        var btn;

                        if (EnableRoleId == $('#ddlRole').val()) {

                            if (full["RowStatus"] == "5") {

                                btn = '<div data-toggle="tooltip" class="Description" title="' + full["comment"] + '">' + full["comment"] + '</div>';
                            } else {
                                btn = "<textarea  maxlength='500'  type='text' value='" + full["comment"] + "'  class='form-control' rows='3' column='1'  id=" + full["PEPEmployeeId"] + " />" + full["comment"] + "</textarea><span><input type='hidden' id='hdnEmployeeId' name='hdnEmployeeId' value='" + + full["PEPEmployeeId"] + "'/></span>";

                            }

                        } else {
                            if (full["RowStatus"] == 3 && $('#ddlRole').val() == 2) {

                                btn = "<textarea  maxlength='500'  type='text' value='" + full["comment"] + "'  class='form-control' rows='3' column='1'  id=" + full["PEPEmployeeId"] + " />" + full["comment"] + "</textarea><span><input type='hidden' id='hdnEmployeeId' name='hdnEmployeeId' value='" + + full["PEPEmployeeId"] + "'/></span>";

                            } else {
                                btn = '<div data-toggle="tooltip" class="Description" title="' + full["comment"] + '">' + full["comment"] + '</div>';
                            }

                        }

                        return btn;
                    }
                    , className: "Description"
                },


                //{

                //    "render": function (data, type, row, meta) {
                //        var btn;

                //        if (row.RowStatus == 3) {
                //            btn = "<textarea maxlength='500'  disabled type='text' value='" + row.Comment + "'  class='form-control' rows='3' column='1'  id=" + row.PEPEmployeeId + " />" + row.Comment + "</textarea><span><input type='hidden' id='hdnEmployeeId' name='hdnEmployeeId' value='" + row.PEPEmployeeId + "'/></span>";

                //        } else {
                //            btn = "<textarea maxlength='500'  type='text' value='" + row.Comment + "'  class='form-control' rows='3' column='1' id=" + row.PEPEmployeeId + " />" + row.Comment + "</textarea><span><input type='hidden' id='hdnEmployeeId' name='hdnEmployeeId' value='" + row.PEPEmployeeId + "'/></span>";

                //        }

                //        return btn;
                //    },
                //    "sWidth": "30%"
                //},

            ],
            "deferRender": true
        });
    });
    $("#loading-overlay").hide(); // Show loading image


}


function BindReporteeRatings() {
    btnvisibleFlag = 0;
    Referbackdone = false;
    $('.animation').removeClass('animation');

    var empId = sessionStorage.EmployeeId;
    //    var apraisalCycleId = $('#ddlRating :selected').val()
    var token = sessionStorage.TokenValue;

    var ReferbackCheck = 0;
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };
    var allSelected = false;

    //if (sessionStorage.IsDP == 1) {
    //    allSelected == true;
    //}

    var selectedEmployees = $("#ddlReportee").val();
    var reporteeIds;

    if (selectedEmployees.indexOf("-1") != -1) {
        selectedEmployees[selectedEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    }
    var reporteeIds = selectedEmployees.toString();

    if (selectedEmployees.length == $("#ddlReportee option").length) {
        allSelected = true;
    }

    var reporteeIds = selectedEmployees.toString();

    //// When only "All My Direct Reportees" (-1) is selected: send "0" and AllSelected=true so SP uses GetSpanListDPandGDL
    //var onlyAllSelected = (selectedEmployees && selectedEmployees.length === 1 && (selectedEmployees[0] === '-1' || selectedEmployees[0] === -1));
    //if (onlyAllSelected) {
    //    reporteeIds = '0';
    //    allSelected = true;
    //} else {
    //    if (selectedEmployees && selectedEmployees.indexOf("-1") != -1) {
    //        selectedEmployees[selectedEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    //    }
    //    reporteeIds = selectedEmployees ? selectedEmployees.toString() : '';
    //    if (selectedEmployees && selectedEmployees.length == $("#ddlReportee option").length) {
    //        allSelected = true;
    //    }
    //}
    
    var $critF = getFiltersDropCriticalitySelect();
    var _critParsed = parseCriticalityFilterForRequest($critF);
    var CriticalityPriorityId = _critParsed.criticalityPriorityIdParam;

    var svrPath = CONFIG.get('SERVERNAME') + "/Rating/GetRatingData";

    RequestData = {
        AppraisalCycleId: getRatingPagesAppraisalCycleId(),
        LoginEmployeeId: empId,
        ReporteeIds: reporteeIds,
        AllSelected: allSelected,
        CriticalityPriorityId: CriticalityPriorityId,
        RoleId: $('#ddlRole').val()

    }
    //var apiPath = svrPath + "Rating?AppraisalCycleId=" + getRatingPagesAppraisalCycleId() + "&LoginEmployeeId=" + empId +
    //    "&ReporteeIds=" + reporteeIds + "&AllSelected=" + allSelected + '&RoleId=' + $('#ddlRole').val();

    if (!_ratingsRoleChangeBulkLoad && $('#loading-overlay').length) {
        $("#loading-overlay").show(); // Full-page overlay when present (bulk role change uses .loader-div only)
    }

    var _bindReporteeRatingsXhr = CommonAjaxGetForNormalization(svrPath, RequestData, headerInfo).done(function (ratingData) {
        var rowsForTable = [];

        if (ratingData.Success == false) {

            //  console.log("tblEmpRating-" + ratingData.ErrorCode + ' ' + ratingData.ErrorMessage)
            var table = $('#tblEmpRatingList').DataTable();

            table.clear();
        }
        else {
            rawData = ratingData.Result.data;
            if (_critParsed.skipClientCriticalityFiltering) {
                // Select all / every option — show full span
            } else if (_critParsed.applyClientCriticalityUnion && rawData && rawData.length) {
                rawData = filterRawDataCriticalityUnion(rawData, _critParsed.unionPriorityIds, _critParsed.includeNotCriticalInUnion);
            } else if (_critParsed.applyClientNotCriticalFilter && rawData && rawData.length) {
                rawData = filterRawDataToNotCritical(rawData);
            }
            rowsForTable = rawData || [];
        }

        if (allSelected && ratingData.Success) {
            TotalReporteesSpanCount = rowsForTable.length;
        }

        //if (IsRatingGiventoEmployees == 1) // when all employees rating already completed.
        //{
        //    TotalReporteesSpanCount = ratingData.Result.length;
        //}

        if (ratingData.Success) {
            ReporteesSpanCountForReferback = rowsForTable.length;
        }

        BindGrade();
        BindGroupAccount();
        BindGender();
        BindEmpStatus();
        SetupApprovedDataSource(rawData);

        var ReporteesortedData = [];

        for (var i = 0; i < rowsForTable.length; i++) {
            if (rowsForTable[i].RMName == sessionStorage.EmployeeId) {
                ReporteesortedData.push(rowsForTable[i]);
            }
            //&& (rawData[i].RowStatus == 2 || rawData[i].RowStatus == 5) && rawData[i].RowStatus != 4
            if (rowsForTable[i].FinalApprover == sessionStorage.EmployeeId) {

                ReferbackCheck = 1;
            }

            //if (rawData[i].CurrentRating != 0) {
            //    $('#btnSubmitrating').prop('value', 'Update');
            //} else { $('#btnSubmitrating').prop('value', 'Submit'); }


        }



        //if (ReferbackCheck == 1) {
        //    $('#btnReferback').show();
        //}

        $('#ReporteeNo').text(ReporteesortedData.length);


        var selectedEmployees = $("#ddlReportee").val();



        // Destroy existing DataTable if it exists to avoid conflicts
        var $table = $("#tblEmpRatingList");
        if ($.fn.DataTable.isDataTable($table)) {
            $table.DataTable().destroy();
        }
        
        // Clear tbody but keep thead structure
        $table.find('tbody').empty();
        
        // Update table headers with current cycle information
        UpdateTableHeaders();
        
        // Ensure thead has exactly 23 columns matching our definitions (Action + 17 data columns + Criticality + Reco Designation + Reco Designation Consent + Status + Comments)
        var $thead = $table.find('thead tr');
        var headerColumnCount = $thead.find('th').length;
        if (headerColumnCount !== 24) {
            console.warn('Table header column count mismatch. Expected 24, found: ' + headerColumnCount);
        }
        
        $("#tblEmpRatingList").DataTable({
            data: rowsForTable,
            "sPaginationType": "full_numbers",
            "iDisplayLength": RecordsCountPerPage,
            "bLengthChange": true,
            "bDestroy": true,
            info: true,
            "searching": true,
            "paging": true,
            "ordering": true,
            "autoWidth": false,
            "columnDefs": [
                { "orderData": [], "targets": 0 }, //TURN OFF DEFAULT SORTING OF TABLE
                { "orderable": false, "targets": [17, 19, 21, 22] },  //TURN OFF SORTABLILITY FOR Reco Designation, Criticality, Status, Action columns
                { "targets": [6, 17, 18, 23], "visible": false } // Hide Gender (6), Reco. Designation (17), Reco. Designation Consent (18), Recognitions (23) by default
                // Note: Columns 14 and 15 (Current Rating and Current Promotion Reco) should always be visible
            ],
            "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
            dom: '<"row"<"col-sm-6"Bl><"col-sm-6"f>>' + '<"row"<"col-sm-12"<"table-responsive"tr>>>' + '<"row"<"col-sm-5"i><"col-sm-7"p>>',
            aoColumns: GetEmpRatingListColumnDefinitions(),
            "deferRender": true,
            initComplete: function (settings, json) {

                if (IsSubmitted == 0 && EnableRoleId == $('#ddlRole').val()) {
                    $('#btnratingSaveDraft').show();
                } else {
                    $('#btnratingSaveDraft').hide();
                }

                // var ShowGenderLocation = []; ShowGenderLocation = ['1', '2', '4', '5', '9', '10', '11', '15', '16', '23'];


                var table = $('#tblEmpRatingList').DataTable();
                
                // Ensure Current Rating and Current Promotion Reco columns (15, 16) are always visible
                table.column(14).visible(true);  // Current Rating
                table.column(15).visible(true);  // Current Promotion Reco
                
                // Apply column visibility based on dropdown selection
                // UpdateTableColumnVisibility now handles location and designation exceptions
                UpdateTableColumnVisibility();
                
                // Re-ensure Current Rating columns are visible after UpdateTableColumnVisibility
                table.column(14).visible(true);  // Current Rating
                table.column(15).visible(true);  // Current Promotion Reco
                table.column(19).visible(true);  // Criticality
                
                // CRITICAL: Force table redraw to fix column alignment on initial load
                // This ensures columns align correctly even if dropdown isn't ready yet
                setTimeout(function() {
                    try {
                        table.columns.adjust().draw(false);
                        console.log('Table redrawn in BindReporteeRatings initComplete after column visibility update');
                    } catch (e) {
                        console.warn('Could not redraw table in BindReporteeRatings initComplete:', e);
                    }
                }, 150); // Slightly longer delay to allow for dropdown initialization

                if (($('#ddlRole').val() == 1) && HistoryVisible == false) {
                    $('.lnkHistory').hide()
                } else {
                    $('.lnkHistory').show()
                }

                if ((EnableRoleId == $('#ddlRole').val()) || (Referbackdone == true)) {
                    $('#btnSubmitrating').show();
                    //  $('#btnratingSaveDraft').show();
                }
                else {
                    $('#btnSubmitrating').hide();
                    $('#btnratingSaveDraft').hide();
                }

                if ($("#ddlPromotion option:selected").length > 0 || $("#ddlgrade option:selected").length > 0 || $("#ddllocation option:selected").length > 0 || $("#ddlgroupaccount option:selected").length > 0 || $("#ddlgender option:selected").length > 0 || $("#ddlEmployeeStatus option:selected").length > 0 || (getFiltersDropCriticalitySelect().val() && getFiltersDropCriticalitySelect().val().length)) {
                    FirstScreenfilterschange();
                }

                if (_pendingTblEmpRatingBandFilter !== null && _pendingTblEmpRatingBandFilter !== undefined) {
                    var pfBand = _pendingTblEmpRatingBandFilter;
                    _pendingTblEmpRatingBandFilter = null;
                    var bandSlice = sliceEmployeesByRatingBand(rawData, pfBand);
                    BindTableForFilters(bandSlice);
                    changeBackgroundColor();
                    if (pfBand === 'Total' && typeof FirstScreenfilterschange === 'function') {
                        FirstScreenfilterschange();
                    }
                    // filterData set .animation, then BindReporteeRatings cleared all .animation at start — restore after bind
                    applyTblEmpRatingBandButtonAnimation(pfBand);
                }

            }
        });


        //  BellCurve();
        //if (RecoDesig == true) {
        //    if (table.column(14).visible(true));
        //} else {
        //    if (table.column(14).visible(false));
        //}
        //if ($('#ddlRole').val() == 1) {
        //    if (table.column(15).visible(false));
        //} else {
        //    if (table.column(15).visible(true));
        //}

        hideRatingsPageLoaderIfNotRoleBulk();
    }).fail(function () {
        hideRatingsPageLoaderIfNotRoleBulk();
    });

    // Initialize Column Visibility Dropdown after table is loaded
    // Use setTimeout to ensure DOM is fully rendered
    setTimeout(function() {
        InitializeColumnVisibilityDropdown();
    }, 100);

    //setTimeout(function () {
    //    if (BtndraftVisible == true) {
    //        $('#btnratingSaveDraft').show();
    //    } else {
    //        $('#btnratingSaveDraft').hide();
    //    }
    //}, 5000);



    if ($('#ddlRole').val() == 3 && EnableRoleId == $('#ddlRole').val()) {

        $('#btnReferback').show();
    } else {
        $('#btnReferback').hide();
    }
    //var today = new Date();

    //if (sessionStorage.IsDP == 1) {
    //    if ((new Date((new Date()).toDateString()) > new Date((new Date(sessionStorage.DateCheckBelowDP)).toDateString()))
    //        && (new Date((new Date()).toDateString()) <= new Date((new Date(sessionStorage.DPClosureDate)).toDateString()))) {
    //        if (btnvisibleFlag == 1) {
    //            $('#btnSubmitrating').show();
    //        } else {
    //            $('#btnSubmitrating').hide();
    //        }
    //    } else {

    //        if (btnvisibleFlag == 1) {
    //            $('#btnSubmitrating').show();
    //        } else {
    //            $('#btnSubmitrating').hide();
    //        }
    //    }
    //}
    //else if (sessionStorage.IsGDL == 1) {

    //    if ((new Date((new Date()).toDateString()) >= new Date((new Date(sessionStorage.GDLDateCheck)).toDateString())) &&
    //        (new Date((new Date()).toDateString())) <= new Date((new Date(sessionStorage.GDLClosureDate)).toDateString())

    //    ) {
    //        $('#btnSubmitrating').show();

    //    }
    //    else {

    //        $('#btnSubmitrating').hide();
    //    }
    //}
    //else {
    //    if (new Date((new Date()).toDateString()) <= new Date((new Date(sessionStorage.DateCheckBelowDP)).toDateString())) {

    //        if (btnvisibleFlag == 1) {
    //            $('#btnSubmitrating').show();
    //        } else {
    //            $('#btnSubmitrating').hide();
    //        }

    //    } else {
    //        $('#btnSubmitrating').hide();
    //    }
    //}


    //var today = new Date();

    //if (sessionStorage.IsDP == 1) {
    //    if ((new Date((new Date()).toDateString()) > new Date((new Date(sessionStorage.DateCheckBelowDP)).toDateString()))
    //        && (new Date((new Date()).toDateString()) <= new Date((new Date(sessionStorage.DPClosureDate)).toDateString()))) {
    //        //if (DraftbtnvisibleFlag == 1) {
    //        //    $('#btnratingSaveDraft').show();
    //        //} else {
    //        //    $('#btnratingSaveDraft').hide();
    //        //}
    //    }
    //}
    //else if (sessionStorage.IsGDL == 1) {

    //    if ((new Date((new Date()).toDateString()) >= new Date((new Date(sessionStorage.GDLDateCheck)).toDateString())) &&
    //        (new Date((new Date()).toDateString())) <= new Date((new Date(sessionStorage.GDLClosureDate)).toDateString())

    //    ) {
    //        $('#btnSubmitrating').show();

    //        //if (DraftbtnvisibleFlag == 1) {
    //        //    $('#btnratingSaveDraft').show();
    //        //} else {
    //        //    $('#btnratingSaveDraft').hide();
    //        //}
    //    }
    //    else {

    //        $('#btnSubmitrating').hide();
    //        //  $('#btnratingSaveDraft').hide();
    //    }
    //}
    ////else if (sessionStorage.IsGDL == 1) {

    ////        ;
    ////    if (new Date((new Date()).toDateString()) >= new Date((new Date(sessionStorage.GDLDateCheck)).toDateString())) {
    ////        if (DraftbtnvisibleFlag == 1) {
    ////            $('#btnratingSaveDraft').show();
    ////        } else {
    ////            $('#btnratingSaveDraft').hide();
    ////        }
    ////    }
    ////}
    //else {

    //    if (new Date((new Date()).toDateString()) <= new Date((new Date(sessionStorage.DateCheckBelowDP)).toDateString())) {

    //        //if (DraftbtnvisibleFlag == 1) {
    //        //    $('#btnratingSaveDraft').show();
    //        //} else {
    //        //    $('#btnratingSaveDraft').hide();
    //        //}

    //    } else {

    //        // $('#btnratingSaveDraft').hide();
    //    }

    //}



    //if (sessionStorage.IsGDL == 1) {

    //    if ((new Date((new Date()).toDateString()) >= new Date((new Date(sessionStorage.GDLDateCheck)).toDateString())) &&
    //        (new Date((new Date()).toDateString())) <= new Date((new Date(sessionStorage.GDLClosureDate)).toDateString())

    //    ) {
    //        $('#btnReferback').show();

    //    }
    //    else {

    //        $('#btnReferback').hide();
    //    }
    //}

    return _bindReporteeRatingsXhr;
}


//if (sessionStorage.IsDP == 1) {
//    if ((today > new Date(sessionStorage.DateCheckBelowDP))) {
//        $('#btnratingSaveDraft').show();
//        $('#btnSubmitrating').show();
//    } else {
//        $('#btnratingSaveDraft').hide();
//        $('#btnSubmitrating').hide();
//    }
//} else {
//    if ((today <= new Date(sessionStorage.DateCheckBelowDP))) {

//        $('#btnratingSaveDraft').show();
//        $('#btnSubmitrating').show();
//    } else {

//        $('#btnratingSaveDraft').hide();
//        $('#btnSubmitrating').hide();
//    }
//}

function SetEmpRatingListTableState() {

    dictCurrentPageState = {};

    var $rows = $("#tblEmpRatingList > tbody > tr");
    $rows.each(function () {
        var $row = $(this);
        var Id = getRowEmployeeId($row);
        if (Id == null || Id === undefined || Id === '') return;
        if (dictCurrentPageState[Id] !== undefined) return;
        var ICurrentRating = $row.find('td .ddlRatingClass').val();
        var IRecoForpromotion = $row.find('td .ddlPromoClass').val();
        var IComments = $row.find('td textarea').val();
        dictCurrentPageState[Id] = { CurrentRating: ICurrentRating, RecoForPromotion: IRecoForpromotion, Comment: IComments };
    });

}

// Get employee id for a table row (supports lnkHistory, Action column data-id, or dropdown id)
function getRowEmployeeId($row) {
    var id = $row.find('td .lnkHistory').attr("data-id");
    if (id != null && id !== '') return id;
    id = $row.find('td [data-id]').first().attr("data-id");
    if (id != null && id !== '') return id;
    var selId = $row.find('td .ddlRatingClass').attr("id");
    if (selId != null && selId !== '') return selId.indexOf('_') !== -1 ? String(selId).split('_')[1] : selId;
    selId = $row.find('td .ddlPromoClass').attr("id");
    if (selId != null && selId !== '') return selId.indexOf('_') !== -1 ? String(selId).split('_')[1] : selId;
    return null;
}

function CheckEmpRatingListTableStateChanged() {

    var IsStateChanged = false;
    var $rows = $("#tblEmpRatingList > tbody > tr");

    $rows.each(function () {
        var $row = $(this);
        var Id = getRowEmployeeId($row);
        if (Id == null || Id === undefined || Id === '') return;
        var obj = dictCurrentPageState[Id];
        if (!obj) return;

        var ICurrentRating = $row.find('td .ddlRatingClass').val();
        var IRecoForpromotion = $row.find('td .ddlPromoClass').val();
        var IComments = $row.find('td textarea').val();

        // Normalize to string for comparison so "1" and 1 are treated equal (avoid false positives from dropdown/input types)
        var s = function (v) { return (v === undefined || v === null) ? '' : String(v).trim(); };
        if (s(obj.CurrentRating) !== s(ICurrentRating) || s(obj.RecoForPromotion) !== s(IRecoForpromotion) || s(obj.Comment) !== s(IComments)) {
            IsStateChanged = true;
            return false; // break each
        }
    });

    return IsStateChanged;

}


function renderCurrentRatingtDropdown(data, type, row) {

    var dropdownHtml = '';

    if (EnableRoleId == $('#ddlRole').val()) {
        dropdownHtml = `<div class="input-group input-append date id="" style="margin: 0 auto;"> <select class='form-control rating ddlRatingClass' onchange="onCurrentRatingChange(this)" id="${row.PEPEmployeeId}">`;

    } else {

        if (row.RowStatus == 3 && $('#ddlRole').val() == 2) {
            dropdownHtml = `<div class="input-group input-append date id="" style="margin: 0 auto;"> <select class='form-control rating ddlRatingClass' onchange="onCurrentRatingChange(this)" id="${row.PEPEmployeeId}">`;
        }

        else {
        }
        dropdownHtml = `<div class="input-group input-append date id="" style="margin: 0 auto;"> <select class='form-control rating ddlRatingClass' onchange="onCurrentRatingChange(this)" id="${row.PEPEmployeeId}" disabled>`;

    }




    if (row.CurrentRating == "1") {

        dropdownHtml += `<option value="0">--Select--</option><option value="4">EE(5%)</option><option value="1" selected>EE(25%)</option><option value="2">ME(60%)</option><option value="3">BE(10%)</option>`;
    } else if (row.CurrentRating == "2") {
        dropdownHtml += `<option value="0">--Select--</option><option value="4">EE(5%)</option><option value="1">EE(25%)</option><option value="2" selected>ME(60%)</option><option value="3">BE(10%)</option>`;

    }
    else if (row.CurrentRating == "3") {

        dropdownHtml += `<option value="0">--Select--</option><option value="4">EE(5%)</option><option value="1">EE(25%)</option><option value="2" >ME(60%)</option><option value="3" selected>BE(10%)</option>`;

    }
    else if (row.CurrentRating == "4") {
        dropdownHtml += `<option value="0">--Select--</option><option value="4" selected>EE(5%)</option><option value="1">EE(25%)</option><option value="2" >ME(60%)</option><option value="3">BE(10%)</option>`;

    }
    else {
        dropdownHtml += `<option value="0" selected>--Select--</option><option value="4">EE(5%)</option><option value="1">EE(25%)</option><option value="2">ME(60%)</option><option value="3">BE(10%)</option>`;
    }
    //}


    dropdownHtml += `</select></div>`;


    return dropdownHtml;

}


function renderPromotiontDropdown(data, type, row) {



    var dropdownHtml = '';


    if (EnableRoleId == $('#ddlRole').val()) {
        dropdownHtml = `<div class="input-group input-append date id="" style="margin: 0 auto;"> <select class='form-control rating ddlPromoClass' id="${row.PEPEmployeeId}">`;
    } else {
        if (row.RowStatus == 3 && $('#ddlRole').val() == 2) {

            dropdownHtml = `<div class="input-group input-append date id="" style="margin: 0 auto;"> <select class='form-control rating ddlPromoClass' id="${row.PEPEmployeeId}">`;

        } else {

            dropdownHtml = `<div class="input-group input-append date id="" style="margin: 0 auto;"> <select class='form-control rating ddlPromoClass'  id="${row.PEPEmployeeId}" disabled>`;


        }

    }




    if (row.RecoForPromotion == "1") {

        dropdownHtml += `<option value="0" selected>--Select--</option><option value="1" selected>Yes</option><option value="2">No</option>`;
    } else if (row.RecoForPromotion == "2") {

        dropdownHtml += `<option value="0" selected>--Select--</option><option value="1">Yes</option><option value="2" selected>No</option>`;
    }
    else {
        dropdownHtml += `<option value="0" selected>--Select--</option><option value="1">Yes</option><option value="2">No</option>`;
    }


    dropdownHtml += `</select></div>`;



    return dropdownHtml;
}

function renderCurrentRatinggDropdown(data, type, row) {
    var dropdownHtml = '';


    if (EnableRoleId == $('#ddlRole').val() && row.RowStatus != 5) {
        if (EnableRoleId == $('#ddlRole').val()) {
            dropdownHtml = `<div class="input-group input-append CurrRating date id="" style="margin: 0 auto;"> <select class='form-control rating ddlRatingClass'  id="rating_${row.PEPEmployeeId}_${row.IsEligibleForPromotion}_${row.PrevRating}">`;

        } else {

            if (row.RowStatus == 3 && $('#ddlRole').val() == 2) {
                dropdownHtml = `<div class="input-group input-append CurrRating date id="" style="margin: 0 auto;"> <select class='form-control rating ddlRatingClass'  id="rating_${row.PEPEmployeeId}_${row.IsEligibleForPromotion}_${row.PrevRating}">`;

            }
            else {
                dropdownHtml = `<div class="input-group input-append CurrRating date id="" style="margin: 0 auto;"> <select class='form-control rating ddlRatingClass'  id="rating_${row.PEPEmployeeId}_${row.IsEligibleForPromotion}_${row.PrevRating}" disabled>`;
            }
        }

        if (row.CurrentRating == "1") {

            dropdownHtml += `<option value="0">--Select--</option><option value="4">EE(5%)</option><option value="1" selected>EE(25%)</option><option value="2">ME(60%)</option><option value="3">BE(10%)</option>`;
        } else if (row.CurrentRating == "2") {
            dropdownHtml += `<option value="0">--Select--</option><option value="4">EE(5%)</option><option value="1">EE(25%)</option><option value="2" selected>ME(60%)</option><option value="3">BE(10%)</option>`;

        }
        else if (row.CurrentRating == "3") {

            dropdownHtml += `<option value="0">--Select--</option><option value="4">EE(5%)</option><option value="1">EE(25%)</option><option value="2" >ME(60%)</option><option value="3" selected>BE(10%)</option>`;

        }
        else if (row.CurrentRating == "4") {
            dropdownHtml += `<option value="0">--Select--</option><option value="4" selected>EE(5%)</option><option value="1">EE(25%)</option><option value="2" >ME(60%)</option><option value="3">BE(10%)</option>`;

        }
        else {
            dropdownHtml += `<option value="0" selected>--Select--</option><option value="4">EE(5%)</option><option value="1">EE(25%)</option><option value="2">ME(60%)</option><option value="3">BE(10%)</option>`;
        }
        //}


        dropdownHtml += `</select></div>`;
    } else {

        if (row.RowStatus == 3 && $('#ddlRole').val() == 2) {
            dropdownHtml = `<div class="input-group input-append CurrRating date id="" style="margin: 0 auto;"> <select class='form-control rating ddlRatingClass'  id="rating_${row.PEPEmployeeId}_${row.IsEligibleForPromotion}_${row.PrevRating}">`;


            if (row.CurrentRating == "1") {

                dropdownHtml += `<option value="0">--Select--</option><option value="4">EE(5%)</option><option value="1" selected>EE(25%)</option><option value="2">ME(60%)</option><option value="3">BE(10%)</option>`;
            } else if (row.CurrentRating == "2") {
                dropdownHtml += `<option value="0">--Select--</option><option value="4">EE(5%)</option><option value="1">EE(25%)</option><option value="2" selected>ME(60%)</option><option value="3">BE(10%)</option>`;

            }
            else if (row.CurrentRating == "3") {

                dropdownHtml += `<option value="0">--Select--</option><option value="4">EE(5%)</option><option value="1">EE(25%)</option><option value="2" >ME(60%)</option><option value="3" selected>BE(10%)</option>`;

            }
            else if (row.CurrentRating == "4") {
                dropdownHtml += `<option value="0">--Select--</option><option value="4" selected>EE(5%)</option><option value="1">EE(25%)</option><option value="2" >ME(60%)</option><option value="3">BE(10%)</option>`;

            }
            else {
                dropdownHtml += `<option value="0" selected>--Select--</option><option value="4">EE(5%)</option><option value="1">EE(25%)</option><option value="2">ME(60%)</option><option value="3">BE(10%)</option>`;
            }


            dropdownHtml += `</select></div>`;

        } else {
            dropdownHtml = `<div class="input-group input-append CurrRating date id="" style="margin: 0 auto;"> <select class='form-control rating ddlRatingClass'  id="rating_${row.PEPEmployeeId}_${row.IsEligibleForPromotion}_${row.PrevRating}" disabled>`;

            if (row.CurrentRating == "1") {

                dropdownHtml = "EE(25%)";
            } else if (row.CurrentRating == "2") {
                dropdownHtml = "ME(60 %)";

            }
            else if (row.CurrentRating == "3") {

                dropdownHtml = "BE(10%)";

            }
            else if (row.CurrentRating == "4") {
                dropdownHtml = "EE(5%)";

            }
            else {
                dropdownHtml = "Rating not given";
            }
        }



    }


    return dropdownHtml;

}



function renderPromotionnDropdown(data, type, row) {
    
    var dropdownHtml = '';
    var bgColor = '';



    // Set background color based on IsEligibleforpromotion
    if (row.IsEligibleForPromotion == "3") {
        if ((row.Prevrating == 'BE(10%)' || row.CurrentRating == '3') && row.RecoForPromotion == "1") {
            bgColor = "border: 2px solid red;"; // Not Eligible - Red
        }
        else {
            bgColor = "border: 2px solid green;";  // Eligible - Green
        }
    } else {
        if (row.RecoForPromotion == "1") {
            bgColor = "border: 2px solid red;"; // Not Eligible - Red
        }
    }

    if (EnableRoleId == $('#ddlRole').val() && row.RowStatus != 5) {
        if (EnableRoleId == $('#ddlRole').val()) {
            dropdownHtml = `<div class="input-group input-append CurrPromotion date"  style="margin: 0 auto;">
  <select class='form-control rating ddlPromoClass' id="promo_${row.PEPEmployeeId}_${row.IsEligibleForPromotion}_${row.PrevRating}" style="${bgColor}" >`;
        } else {

            dropdownHtml = `<div class="input-group input-append CurrPromotion date" style="margin: 0 auto;">
<select class='form-control rating ddlPromoClass' id="promo_${row.PEPEmployeeId}_${row.IsEligibleForPromotion}_${row.PrevRating}" style="${bgColor}"  disabled>`;

        }
        if (row.RecoForPromotion == "1") {
            dropdownHtml += `<option value="0">--Select--</option><option value="1" selected>Yes</option><option value="2">No</option>`;
        } else if (row.RecoForPromotion == "2") {
            dropdownHtml += `<option value="0">--Select--</option><option value="1">Yes</option><option value="2" selected>No</option>`;
        } else {
            dropdownHtml += `<option value="0" selected>--Select--</option><option value="1">Yes</option><option value="2" selected>No</option>`;
        }

        dropdownHtml += `</select></div>`;
    } else {

        if (row.RowStatus == "3" && $('#ddlRole').val() == 2) {

            dropdownHtml = `<div class="input-group input-append CurrPromotion date"  style="margin: 0 auto;">
  <select class='form-control rating ddlPromoClass' id="promo_${row.PEPEmployeeId}_${row.IsEligibleForPromotion}_${row.PrevRating}" style="${bgColor}" >`;


            if (row.RecoForPromotion == "1") {
                dropdownHtml += `<option value="0">--Select--</option><option value="1" selected>Yes</option><option value="2">No</option>`;
            } else if (row.RecoForPromotion == "2") {
                dropdownHtml += `<option value="0">--Select--</option><option value="1">Yes</option><option value="2" selected>No</option>`;
            } else {
                dropdownHtml += `<option value="0" selected>--Select--</option><option value="1">Yes</option><option value="2" selected>No</option>`;
            }

            dropdownHtml += `</select></div>`;

        } else {


            dropdownHtml = `<div class="form-control  CurrPromotion date"  style="margin: 0 auto;${bgColor}"  >`;


            if (row.RecoForPromotion == "1") {
                dropdownHtml += "Yes";
            } else if (row.RecoForPromotion == "2") {
                dropdownHtml += "No";
            } else {
                dropdownHtml += "No";
            }

            dropdownHtml += `</div>`;
        }

    }

    return dropdownHtml;
}


function renderPromotionTrackDropdown(data, type, row) {
    
    var dropdownHtml;

    if ((EnableRoleId == $('#ddlRole').val() && row.RowStatus != 5) || (row.RowStatus == 3 && $('#ddlRole').val() == 2)) {
        dropdownHtml = `<div><select style="text-align:center;" class='form-control rating ddlPromoTrackClass'>`;

        if (row.RecoForPromotion == 2 || row.RecoForPromotion == 0) {

            dropdownHtml += `<option value="1" selected>NA</option>`;

        }

        if (row.RecoForPromotion == 1) {

            dropdownHtml += `<option value="0">--Select--</option>`;

            if (row.PromotionTrack == 2) {
                dropdownHtml += `<option value="2" selected>Individual Contributor</option>`;
            } else {
                dropdownHtml += `<option value="2">Individual Contributor</option>`;
            }


            if (parseInt(row.GradeLevel) >= 3) {

                if (row.PromotionTrack == 3) {
                    dropdownHtml += `<option value="3" selected>Management Track</option>`;
                } else {
                    dropdownHtml += `<option value="3">Management Track</option>`;
                }
            }

            if (parseInt(row.GradeLevel) >= 5) {

                if (row.PromotionTrack == 4) {
                    dropdownHtml += `<option value="4" selected>Architect Track</option>`;
                } else {
                    dropdownHtml += `<option value="4">Architect Track</option>`;
                }

            }
        }

        dropdownHtml += `</select></div>`;

    } else {

        if (row.RecoForPromotion == 1) {

            //if (row.PromotionTrack == 1) {
            //    dropdownHtml = "NA";
            //}
            //else
            if (row.PromotionTrack == 2) {
                dropdownHtml = `<option value="2" selected>Individual Track</option>`;
            }
            else if (row.PromotionTrack == 3) {
                dropdownHtml = `<option value="3" selected>Management Track</option>`;
            }
            else if (row.PromotionTrack == 4) {
                dropdownHtml = `<option value="4" selected>Architect Track</option>`;
            }
        } else {

            dropdownHtml = `<option value="1" selected>NA</option>`;
        }
    }
    return dropdownHtml || 'NA';
}


function onCurrRatingChange(element) {



    var employeeId = element.id.split("_")[1]; // Extract Employee ID from ID attribute
    var EligibleForPromotion = element.id.split("_")[2]; // Extract Eligibility from ID attribute
    var Prevrating = element.id.split("_")[3]; // Extract Eligibility from ID attribute
    var selectedRating = element.value;
    var promoDropdown = $("#promo_" + employeeId + "_" + EligibleForPromotion + "_" + Prevrating);

    // Get the current Promotion Recommendation value
    var promoRecoValue = promoDropdown.val();

    // Determine eligibility
    var eligibility = checkPromotionEligibility(selectedRating, promoRecoValue, EligibleForPromotion, Prevrating);

    // Apply border color based on eligibility
    if (eligibility === "green") {
        promoDropdown.css("border", "2px solid green");
    } else if (eligibility === "red") {
        promoDropdown.css("border", "2px solid red");
    } else {
        promoDropdown.css("border", ""); // Remove border (neutral)
    }
}

// Function to determine eligibility based on the table logic
function checkPromotionEligibility(rating, promoReco, EligibleForPromotion, Prevrating) {

    if (rating == '3' || Prevrating == 'BE(10%)') {
        EligibleForPromotion = 4;
    }

    if (EligibleForPromotion == 3) {
        return "green";
    }
    else if (EligibleForPromotion == 4) {
        if (promoReco == '1') return "red";
        if (promoReco == '2') return "neutral";
    }

    return "neutral"; // No border change
}


$(document).on("change", ".ddlRatingClass, .ddlPromoClass", function () {

    var employeeId = $(this).attr("id").split("_")[1];
    var eligible = $(this).attr("id").split("_")[2];
    var Prevrating = $(this).attr("id").split("_")[3];
    onCurrRatingChange($("#rating_" + employeeId + "_" + eligible + "_" + Prevrating)[0]);
});


function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function formatDate_DMY(date) {

    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [day, month, year].join('-');
}

function foramtDate_DMY2YMD(date) {
    var newdate = date.split("-").reverse().join("-");
    return formatDate(newdate);
}



function ViewRMHistory(EmpId) {

    var options = { "backdrop": "static", keyboard: true };
    var $buttonClicked = $(this);
    //  var ClaimID = EmpId;
    var LoginempId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating/GetRMHistory?EmpID= " + EmpId;

    CommonAjaxGET(apiPath, headerInfo).done(function (ratingHistoryData) {

        if (ratingHistoryData.Success == true) {

            $("#tblRMHistory").DataTable({
                "dom": 'lBfrtip',
                buttons: [
                    {
                        extend: 'excelHtml5',
                        text: 'Export to Excel',
                        title: 'History Details',
                        download: 'open',
                        orientation: 'landscape',
                        exportOptions: {
                            columns: [0, 1, 2, 3, 4, 5]
                        }
                    }],
                "data": ratingHistoryData.Result.data,
                "destroy": true,
                "sPaginationType": "full_numbers",
                "iDisplayLength": RecordsCountPerPage,
                "bLengthChange": false,
                "bDestroy": true,
                "searching": false,
                info: true,
                "oLanguage": {
                    "oPaginate": {
                        "sNext": '<a href="#"><span class="glyphicon glyphicon-triangle-right"></span></a>',
                        "sPrevious": '<a href="#"><span class="glyphicon glyphicon-triangle-left"></span></a>',
                        "sLast": '<a href="#"><span class="glyphicon glyphicon-step-forward"></span></a>',
                        "sFirst": '<a href="#"><span class="glyphicon glyphicon-step-backward"></span></a>'
                    }
                },
                aoColumns: [
                    {
                        "render": function (data, type, row, meta) {
                            return row.SrNo;
                        }
                    },
                    {
                        "render": function (data, type, row, meta) {
                            return row.RMID;
                        }
                    },
                    {
                        "render": function (data, type, row, meta) {
                            return row.RMNAME;
                        }
                    },
                    {
                        "render": function (data, type, row, meta) {
                            return row.EFFECTIVEFROM;
                        }
                    },
                    {
                        "render": function (data, type, row, meta) {
                            return row.RMDESIGNATION;
                        },
                    }],
            });
            $('#ViewRMHistoryDetails').modal('show');

        }
    });


}



function ViewClaimHistory(EmpId) {

    var options = { "backdrop": "static", keyboard: true };
    var $buttonClicked = $(this);
    //  var ClaimID = EmpId;
    var LoginempId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating/GetRatingHistory?AppraisalCycleId=" + getRatingPagesAppraisalCycleId() + "&EmpID=" + EmpId + "&LogEmpId=" + sessionStorage.EmployeeId;

    CommonAjaxGET(apiPath, headerInfo).done(function (ratingHistoryData) {

        if (ratingHistoryData.Success == true) {

            $("#tblActionHistory").DataTable({
                "dom": 'lBfrtip',
                buttons: [
                    {
                        extend: 'excelHtml5',
                        text: 'Export to Excel',
                        title: 'History Details',
                        download: 'open',
                        orientation: 'landscape',
                        exportOptions: {
                            columns: [0, 1, 2, 3, 4, 5, 6, 7]
                        }
                    }],
                "data": ratingHistoryData.Result,
                "destroy": true,
                "sPaginationType": "full_numbers",
                "iDisplayLength": RecordsCountPerPage,
                "bLengthChange": false,
                "bDestroy": true,
                "searching": false,
                info: true,
                "oLanguage": {
                    "oPaginate": {
                        "sNext": '<a href="#"><span class="glyphicon glyphicon-triangle-right"></span></a>',
                        "sPrevious": '<a href="#"><span class="glyphicon glyphicon-triangle-left"></span></a>',
                        "sLast": '<a href="#"><span class="glyphicon glyphicon-step-forward"></span></a>',
                        "sFirst": '<a href="#"><span class="glyphicon glyphicon-step-backward"></span></a>'
                    }
                },
                aoColumns: [
                    {
                        "render": function (data, type, row, meta) {
                            return row.SrNo;
                        },
                        "orderable": false
                    },
                    {
                        "render": function (data, type, row, meta) {
                            return row.GivenBy;
                        },
                        "orderable": false
                    },
                    {
                        "render": function (data, type, row, meta) {
                            return row.Rating;
                        },
                        "orderable": false
                    },
                    {
                        "render": function (data, type, row, meta) {
                            return row.RecoPromotion;
                        },
                        "orderable": false
                    },
                    {
                        "render": function (data, type, row, meta) {
                            var status = row.CriticalityStatus || '';
                            return status || '';
                        },
                        "orderable": false
                    },
                    {
                        "render": function (data, type, row, meta) {
                            return row.Givendate;
                        },
                        "orderable": false
                    },
                    {
                        "render": function (data, type, row, meta) {
                            return row.Action;
                        },
                        "orderable": false
                    },
                    {
                        "render": function (data, type, row, meta) {
                            return row.Comments;
                        },
                        "orderable": false
                    }],
            });
            $('#ViewNTHistoryDetails').modal('show');

        }
    });


}
$('#ddlReportee_RAR').on('change', function (e) {
    setTimeout(BindApprovedReportee, 500);
    //BindApprovedReportee();
    // $('.loader-div').show();
});

function BindApprovedReportee() {


    $('.animation').removeClass('animation');

    let empId = sessionStorage.EmployeeId;
    let token = sessionStorage.TokenValue;

    let AppraisalCycleId = getRatingPagesAppraisalCycleId();
    let FetchAllRecords = true;

    let headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };


    var allSelected = false;

    var selectedEmployees = $("#ddlReportee_RAR").val();

    if (selectedEmployees.indexOf("-1") != -1) {
        selectedEmployees[selectedEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    }

    if (selectedEmployees.length == $("#ddlReportee_RAR option").length) {
        allSelected = true;
    }

    var reporteeIds = selectedEmployees.toString();
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating/GetApprovedRating?AppraisalCycleId=" + getRatingPagesAppraisalCycleId() + "&LoginEmployeeId=" + empId + "&ReporteeIds=" + reporteeIds + "&AllSelected=" + allSelected;

    //let svrPath = CONFIG.get('SERVERNAME');
    //  let apiPath = svrPath + "Rating/GetApprovedRating?AppraisalCycleId=" + AppraisalCycleId + "&LoginEmployeeId=" + empId + "&ReporteeIds=" + empId + "&AllSelected=" + FetchAllRecords;

    CommonAjaxGET(apiPath, headerInfo).done(function (ratingData) {
        //  ;
        if (ratingData.Success == false) {
            // console.log("tblApprovedReporteeList-" + ratingData.ErrorCode + ' ' + ratingData.ErrorMessage);
            var table = $('#tblApprovedReporteeList').DataTable();
            table.clear();
            approvedReportees = [];
            //return;
        }

        if (ratingData && ratingData.Result && ratingData.Result.length > 0) {
            approvedReportees = ratingData.Result.filter(reportee => (reportee.RowStatus == 3) || (reportee.RowStatus == 2 && reportee.FinalApprover == empId));
            $('#TotalApprovedCount').text(approvedReportees.length);
            $('#MyReporteeCount').text(approvedReportees.filter(myreportees => myreportees.RMName == empId).length);
            $('#filtersApprovedReportee').css('display', 'block');
        }
        else {
            approvedReportees = [];
            $('#filtersApprovedReportee').css('display', 'none');
        }

        $("#tblApprovedReporteeList").DataTable({
            data: approvedReportees,
            "sPaginationType": "full_numbers",
            "iDisplayLength": RecordsCountPerPage,
            "bLengthChange": true,
            "bDestroy": true,
            "searching": true,
            info: true,
            ordering: true,
            order: [[1, 'asc']],
            paging: true,
            //"columnDefs": [
            //    { "orderData": [], "targets": 0 }, //TURN OFF DEFAULT SORTING OF TABLE
            //],
            "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
            dom: '<"row"<"col-sm-6"Bl><"col-sm-6"f>>' + '<"row"<"col-sm-12"<"table-responsive"tr>>>' + '<"row"<"col-sm-5"i><"col-sm-7"p>>',

            aoColumns: [
                {
                    "render": function (data, type, row, meta) {
                        return "<span>" + row.EmployeeName + "</span><span><input type='hidden' id='hdnRMName' name='hdnRMName' value='" + row.RMName + "'/></span>";
                    },
                    "sWidth": "7%"
                },
                {
                    "render": function (data, type, row, meta) {

                        return "<a  style='margin-right:4px;' title='RM History'  data-id=" + row.PEPEmployeeId + " onclick='ViewRMHistory(" + row.PEPEmployeeId + ")'>View</a>";
                    },
                    "sWidth": "6%"
                },
                {
                    "render": function (data, type, row, meta) {
                        return "<span>" + row.Gender + "</span><span><input type='hidden' id='hdnRowStatus' name='hdnRowStatus' value='" + row.RowStatus + "'/></span>";
                    },
                    "sWidth": "6%"
                },
                {
                    "render": function (data, type, row, meta) {
                        return "<span>" + row.GradeName + "</span><span><input type='hidden' id='hdnGradeID' name='hdnGradeID' value='" + row.GradeID + "'/></span>";
                    },
                    "sWidth": "6%"
                },
                {
                    "render": function (data, type, row, meta) {
                        return "<span>" + row.LocationName + "</span><span><input type='hidden' id='hdnLocationID' name='hdnLocationID' value='" + row.LocationID + "'/></span>";
                    },
                    "sWidth": "5%"
                },
                {
                    "render": function (data, type, row, meta) {
                        return "<span>" + row.AccountGroup + "</span><span><input type='hidden' id='hdnAccountGroup' name='hdnAccountGroup' value='" + row.AccountGroup + "'/></span>";
                    },
                    "sWidth": "5%"
                },
                {
                    "render": function (data, type, row, meta) {
                        return "<span>" + row.TotalExp + "</span><span><input type='hidden' id='hdnRowStatus' name='hdnRowStatus' value='" + row.RowStatus + "'/></span>";
                    },
                    "sWidth": "5%"
                },
                {
                    "render": function (data, type, row, meta) {
                        return "<span>" + row.InfogainExp + "</span><span><input type='hidden' id='hdnId' name='hdnId' value='" + row.Id + "'/></span>";
                    },
                    "sWidth": "1%"
                },
                {
                    mData: "PrevRating",
                    "sWidth": "6%"
                },
                {
                    mData: "LastpromotionDate",
                    "sWidth": "6%"
                },
                {
                    "render": function (data, type, row, meta) {

                        return "<span>" + row.ApprovedRating + "</span><span><input type='hidden' id='hdnLastratingGivenBy' name='hdnLastratingGivenBy' value='" + row.LastratingGivenBy + "'/></span>";
                    },
                    "sWidth": "6%"
                },
                {
                    "render": function (data, type, row, meta) {
                        return "<span>" + row.ApprovedRecoPromo + "</span>";
                    },
                    "sWidth": "6%"
                }
            ],
            "deferRender": true
        });
        $("#loading-overlay").hide();
    });
}

function SetupApprovedDataSource(data) {
    let EmployeeId = "";
    if (sessionStorage && sessionStorage.EmployeeId) {
        EmployeeId = sessionStorage.EmployeeId.trim();
    }
    if (data && data.length > 0) {
        approvedReportees = data.filter(reportee => reportee.RowStatus == 3);
        $('#filtersApprovedReportee').css('display', 'block');
    }
    else {
        $('#filtersApprovedReportee').css('display', 'none');
    }
    $('#TotalApprovedCount').text(approvedReportees.length);
    $('#MyReporteeCount').text(approvedReportees.filter(myreportees => myreportees.RMName == EmployeeId).length);
}

//function SetPracticeLeaderTab() {

//    if (sessionStorage.IsPracticeLead == "true") {
//        $("#anchor_tab_RatingPracticeView").css('display', 'block');
//        $("#anchor_tab_RatingNormPracticeView").css('display', 'block');


//    } else {
//        $("#anchor_tab_RatingPracticeView").css('display', 'none');
//        $("#anchor_tab_RatingNormPracticeView").css('display', 'none');
//    }
//}



function RatingFilterTab() {

    var total;
    var empId = sessionStorage.EmployeeId;
    var svrPath = CONFIG.get('SERVERNAME');

    var selectedEmployees = $("#ddlReportee").val();

    if (selectedEmployees.indexOf("-1") != -1) {
        selectedEmployees[selectedEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    }
    var IReportee = selectedEmployees.toString();
    var GradeId = $("#ddlgrade").val().toString();
    var LocationId = $("#ddllocation").val().toString();
    var GroupAccountId = $("#ddlgroupaccount").val().toString();
    var Gender = $("#ddlgender").val().toString();
    var EmpStatus = $("#ddlEmployeeStatus").val().toString();
    var Promotion = $("#ddlPromotion").val().toString();

    if (IReportee == "") {
        IReportee = 0;
    }
    if (GradeId == "") {
        GradeId = 0;
    }
    if (LocationId == "") {
        LocationId = 0;
    } if (GroupAccountId == "") {
        GroupAccountId = 0;
    }
    if (Gender == "") {
        Gender = 0;
    }

    if (Promotion == "") {

        Promotion = 0;
    }
    if (EmpStatus == "") {

        EmpStatus = 0;
    }

    var svrPath = CONFIG.get('SERVERNAME') + "/Rating/GetDataForChart";

    RequestData = {
        AppraisalCycleId: getRatingPagesAppraisalCycleId(),
        LoginEmployeeId: empId,
        ReporteeIds: IReportee,
        GradeId: GradeId,
        LocationId: LocationId,
        GroupAccountId: GroupAccountId,
        Gender: Gender,
        EmpStatus: EmpStatus,
        Promotion: Promotion,
        RoleId: $('#ddlRole').val()
    }




    $.ajax({
        type: "POST",
        url: svrPath,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        },
        cache: false,
        data: JSON.stringify(RequestData),
        async: false,
        success: function (data) {
            hideRatingsPageLoaderIfNotRoleBulk();
            //setting  data from result to variables


            if (data && Array.isArray(data.Result) && data.Result.length >= 4) {
                BE = data.Result[0].BE;
                ME = data.Result[0].ME;
                EE = data.Result[0].EE;
                EE1 = data.Result[0].EE1;
                MBE = data.Result[1].BE;
                MME = data.Result[1].ME;
                MEE = data.Result[1].EE;
                MEE1 = data.Result[1].EE1;
                FBE = data.Result[2].BE;
                FME = data.Result[2].ME;
                FEE = data.Result[2].EE;
                FEE1 = data.Result[2].EE1;
                notgiven = data.Result[3].EE;
                $('#filtersDiv').css('display', 'block');
                $('#EEspan').text(EE);
                $('#MEspan').text(ME);
                $('#BEspan').text(BE);
                $('#EE1span').text(EE1);
                $('#Notspan').text(notgiven);
                total = EE + ME + BE + EE1;
                $('#Totalspan').text(total);

                ;

            }
        },
        error: function (response) {

            hideRatingsPageLoaderIfNotRoleBulk();
            alert(response + '1');
        }
    });
}

//function RatingGivenNotGivenDetailForDPandGDL() {

//    var total;
//    var empId = sessionStorage.EmployeeId;
//    var svrPath = CONFIG.get('SERVERNAME');

//    GradeId = 0;
//    LocationId = 0;
//    GroupAccountId = 0;
//    Gender = 0;
//    EmpStatus = 0;

//    IReportee = 0;

//    var apiPath = svrPath + "Rating/GetDataForChart?EMPID=" + empId + "&AppraisalCycleId=" + getRatingPagesAppraisalCycleId() + "&IReportee=" + IReportee + "&GradeId=" + GradeId + "&LocationId=" + LocationId + "&GroupAccountId=" + GroupAccountId + "&Gender=" + Gender + "&EmpStatus=" + EmpStatus + '&RoleId=' + $('#ddlRole').val();

//    $.ajax({
//        contentType: 'application/json; charset=utf-8',
//        dataType: 'json',
//        type: 'Get',
//        url: apiPath,
//        headers: {
//            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
//            'X-EmpNo': sessionStorage.EmployeeId
//        },
//        async: false,

//        success: function (data) {
//            $(".loader-div").hide();
//            //setting  data from result to variables


//            if (data.Result.length > 0) {
//                BE = data.Result[0].BE;
//                ME = data.Result[0].ME;
//                EE = data.Result[0].EE;
//                EE1 = data.Result[0].EE1;
//                MBE = data.Result[1].BE;
//                MME = data.Result[1].ME;
//                MEE = data.Result[1].EE;
//                MEE1 = data.Result[1].EE1;
//                FBE = data.Result[2].BE;
//                FME = data.Result[2].ME;
//                FEE = data.Result[2].EE;
//                FEE1 = data.Result[2].EE1;
//                notgiven = data.Result[3].EE;
//                $('#spnRatingNotGiven').text(notgiven);

//                GlobalTotalNotGiven = notgiven;

//                total = EE + ME + BE + EE1;
//                $('#spnRatingGiven').text(total);

//                GlobalTotalGiven = total;
//            }
//        },
//        error: function (response) {
//            $(".loader-div").hide();
//            alert(response + '1');
//        }
//    });
//}



//function RatingGivenNotGivenDetailForSecondTabGenerateBellCurve() {


//    var total;
//    var empId = sessionStorage.EmployeeId;
//    var svrPath = CONFIG.get('SERVERNAME');

//    GradeId = 0;
//    LocationId = 0;
//    GroupAccountId = 0;
//    Gender = 0;
//    EmpStatus = 0;


//    IReportee = empId;
//    var apiPath = svrPath + "Rating/GetDataForChart?EMPID=" + empId + "&AppraisalCycleId=" + getRatingPagesAppraisalCycleId() + "&IReportee=" + IReportee + "&GradeId=" + GradeId + "&LocationId=" + LocationId + "&GroupAccountId=" + GroupAccountId + "&Gender=" + Gender + "&EmpStatus=" + EmpStatus;

//    $.ajax({
//        contentType: 'application/json; charset=utf-8',
//        dataType: 'json',
//        type: 'Get',
//        url: apiPath,
//        async: false,

//        success: function (data) {
//            $(".loader-div").hide();
//            //setting  data from result to variables


//            if (data.Result.length > 0) {
//                BE = data.Result[0].BE;
//                ME = data.Result[0].ME;
//                EE = data.Result[0].EE;
//                EE1 = data.Result[0].EE1;
//                MBE = data.Result[1].BE;
//                MME = data.Result[1].ME;
//                MEE = data.Result[1].EE;
//                MEE1 = data.Result[1].EE1;
//                FBE = data.Result[2].BE;
//                FME = data.Result[2].ME;
//                FEE = data.Result[2].EE;
//                FEE1 = data.Result[2].EE1;
//                notgiven = data.Result[3].EE;
//              //  $('#spnRatingNotGiven').text(notgiven);

//                GlobalTotalNotGiven = notgiven;

//                total = EE + ME + BE + EE1;
//              //  $('#spnRatingGiven').text(total);

//                GlobalTotalGiven = total;
//            }
//        },
//        error: function (response) {
//            $(".loader-div").hide();
//            alert(response + '1');
//        }
//    });
//}

function genderChangesforGeoWise() {


    //var ShowGenderLocation = [];
    //ShowGenderLocation = ['1', '2', '4', '5', '9', '10', '11', '15', '16', '23'];


    var dt = $('#tblEmpRatingList').DataTable();

    if (ShowGenderLocation.includes(sessionStorage.LocationId)) {
        $('#divGender').css('display', 'inline-block');
        $('#divGenderNorm').css('display', 'inline-block');
        $('#divGenderNorm_PNorm').css('display', 'inline-block');
        $('#divGenderPromo').css('display', 'inline-block');
        $('#NormalizationMaleFemaletbl').css('display', 'inline-block');
        /*        $('#NormalizationMaleFemaletbl_PNorm').css('display', 'inline-block');*/

        $('.divMaleFemaleTable').css('display', 'inline-block');
        /*        $('.divMaleFemaleTable_PNorm').css('display', 'inline-block');*/
        $('#tblMFPromotionSummary').css('display', 'inline-block');

        //   dt.column(1).visible(true);

        //if ($('#ddlRole').val() == 1) {
        //    if (dt.column(15).visible(false));
        //} else {
        //    if (dt.column(15).visible(true));
        //}

        BellCurve();
        //var total;
        //var empId = sessionStorage.EmployeeId;
        //var svrPath = CONFIG.get('SERVERNAME');

        //var IReportee = $("#ddlReporteeNorm").val().toString();
        //var GradeId = $("#ddlgradeNorm").val().toString();
        //var LocationId = $("#ddllocationNorm").val().toString();
        //var GroupAccountId = $("#ddlgroupaccountNorm").val().toString();
        //var Gender = $("#ddlgender").val().toString();
        //var EmpStatus = $("#ddlEmployeeStatus").val().toString();


        //if (IReportee == "" || IReportee == "-1") {
        //    IReportee = 0;
        //}
        //if (($("#ddlReporteeNorm option").length == $("#ddlReporteeNorm option:selected").length)) {

        //    IReportee = 0;
        //}


        //if (GradeId == "") {
        //    GradeId = 0;
        //}

        //if (LocationId == "") {
        //    LocationId = 0;
        //}

        //if (GroupAccountId == "") {
        //    GroupAccountId = 0;
        //}
        //if (Gender == "") {
        //    Gender = 0;
        //}
        //if (EmpStatus == "") {
        //    EmpStatus = 0;
        //}

        //var apiPath = svrPath + "Rating/GetDataForChart?EMPID=" + empId + "&AppraisalCycleId=" + getRatingPagesAppraisalCycleId() + "&IReportee=" + IReportee + "&GradeId=" + GradeId + "&LocationId=" + LocationId + "&GroupAccountId=" + GroupAccountId + "&Gender=" + Gender + "&EmpStatus=" + EmpStatus+"&RoleId="+$('#ddlRole').val();

        //$.ajax({
        //    contentType: 'application/json; charset=utf-8',
        //    dataType: 'json',
        //    type: 'Get',
        //    url: apiPath,
        //    async: false,

        //    success: function (data) {
        //        $(".loader-div").hide();
        //        //setting  data from result to variables


        //        if (data.Result.length > 0) {
        //            BE_STab = data.Result[0].BE;
        //            ME_STab = data.Result[0].ME;
        //            EE_STab = data.Result[0].EE;
        //            EE1_STab = data.Result[0].EE1;
        //            MBE_STab = data.Result[1].BE;
        //            MME_STab = data.Result[1].ME;
        //            MEE_STab = data.Result[1].EE;
        //            MEE1_STab = data.Result[1].EE1;
        //            FBE_STab = data.Result[2].BE;
        //            FME_STab = data.Result[2].ME;
        //            FEE_STab = data.Result[2].EE;
        //            FEE1_STab = data.Result[2].EE1;
        //            notgiven = data.Result[3].EE;

        //            $('#filtersMyReportee').css('display', 'block');
        //            //$('#filtersDropDiv').css('display', 'block');

        //            $('#RM_EEspan').text(EE);
        //            $('#RM_MEspan').text(ME);
        //            $('#RM_BEspan').text(BE);
        //            $('#RM_EE1span').text(EE1);
        //            $('#RM_Notspan').text(notgiven);
        //            total = EE + ME + BE + EE1;
        //            $('#RM_Totalspan').text(total);


        //        }
        //    },
        //    error: function (response) {
        //        $(".loader-div").hide();
        //        alert(response + '6');
        //    }
        //});
        //var totalEmp = total + notgiven;
        //var idealData = [(totalEmp * 0.05).toFixed(2), (totalEmp * 0.25).toFixed(2), (totalEmp * 0.6).toFixed(2), (totalEmp * 0.1).toFixed(2)];
        ////  console.log(idealData);
        //Highcharts.chart("chart_div", {

        //    legend: {
        //        align: 'left',
        //        verticalAlign: 'top',
        //        x: 110,
        //        y: 90,
        //        floating: false,
        //        borderWidth: 1,
        //        backgroundColor:
        //            Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF'
        //    },
        //    credits: {
        //        enabled: false
        //    },
        //    tooltip: {
        //        shared: true
        //    },
        //    title: {
        //        text: "Ideal vs Given Ratings"
        //    },
        //    xAxis: {
        //        categories: [
        //             "Exceeds Expectations(5%)",
        //             "Exceeds Expectations(25%)",
        //            "Meets Expectations(60%)",
        //            "Below Expectations(10%)"
        //        ]
        //    },
        //    yAxis: {
        //        title: {
        //            text: "No of Employees"
        //        }
        //    },

        //    responsive: {
        //        rules: [
        //            {
        //                condition: {
        //                    maxWidth: 500,
        //                    callback() {
        //                        return true;
        //                    }
        //                }
        //            }
        //        ]
        //    },

        //    plotOptions: {
        //        spline: {
        //            dataLabels: {
        //                enabled: true
        //            },

        //            marker: {
        //                enabled: true,
        //                symbol: "circle",
        //                radius: 5,
        //                states: {
        //                    hover: {
        //                        enabled: true
        //                    }
        //                }
        //            }
        //        },

        //    },
        //    series: [
        //        {
        //            type: "spline",
        //            name: "Ideal No. of Employees",
        //            data: [parseFloat(idealData[0]), parseFloat(idealData[1]), parseFloat(idealData[2]), parseFloat(idealData[3])],
        //        },
        //        {
        //            type: "spline",
        //            name: "Rating Given No. of Employees",
        //            data: [EE1_STab, EE_STab, ME_STab, BE_STab],
        //        },

        //        {
        //            type: "column",
        //            name: "Male Count",
        //            data: [MEE1_STab, MEE_STab, MME_STab, MBE_STab],

        //        },
        //        {
        //            type: "column",
        //            name: "Female Count",
        //            data: [FEE1_STab, FEE_STab, FME_STab, FBE_STab],

        //        },
        //      {

        //          type: "column",

        //          name: "Others Count",

        //          data: [0, 0, 0, 0],

        //      }
        //    ]
        //});


    } else {
        // dt.column(1).visible(false);

        //if ($('#ddlRole').val() == 1) {
        //    if (table.column(15).visible(false));
        //} else
        //    if (table.column(15).visible(true));
        //}
        MyReporteeBellCurve();
    }
}


function BindGender() {


    var dictEmpGender = {};
    var sortedEmpGenderKeys = [];
    $.each(rawData, function (index, data) {

        if (dictEmpGender[data.Gender] == undefined) {

            if (data.Gender == 'Male') {
                dictEmpGender["Male"] = data.Gender;
            } else if (data.Gender == 'Female') {
                dictEmpGender["Female"] = data.Gender;
            }
        }
    }

    );

    sortedEmpGenderKeys = Object.keys(dictEmpGender).sort();

    $('#ddlgender').empty();

    for (let t = 0; t < sortedEmpGenderKeys.length; t++) {
        $('#ddlgender').append($("<option>").val(dictEmpGender[sortedEmpGenderKeys[t]]).text(sortedEmpGenderKeys[t]));

    }

    $('#ddlgender').multiselect('destroy');

    $('#ddlgender').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgender').multiselect('refresh');
}

function BindEmpStatus() {

    // Binding Dropdown of EmployeeStatus
    var dictEmpStatus = {};
    var sortedEmpStatuseKeys = [];
    $.each(rawData, function (index, data) {

        if (dictEmpStatus[data.EmployeeStatus] == undefined) {

            if (data.EmployeeStatus == 'A') {
                dictEmpStatus["Active"] = data.EmployeeStatus;
            } else if (data.EmployeeStatus == 'R') {
                dictEmpStatus["Resigned"] = data.EmployeeStatus;
            } else { dictEmpStatus["Exited"] = data.EmployeeStatus; }
        }
    }
    );

    sortedEmpStatuseKeys = Object.keys(dictEmpStatus).sort();

    $('#ddlEmployeeStatus').empty();

    for (let t = 0; t < sortedEmpStatuseKeys.length; t++) {
        $('#ddlEmployeeStatus').append($("<option>").val(dictEmpStatus[sortedEmpStatuseKeys[t]]).text(sortedEmpStatuseKeys[t]));

    }

    $('#ddlEmployeeStatus').multiselect('destroy');

    $('#ddlEmployeeStatus').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlEmployeeStatus').multiselect('refresh');
}

// Initialize Column Visibility Dropdown - loads configuration and user preferences from backend
// ==================================================================================
// Column Visibility Functions - Recreated
// ==================================================================================
    
/**
 * Initialize column visibility dropdown with Reset and Select All buttons
 */
function InitializeColumnVisibilityDropdown() {
    var $dropdown = $('#ddlColumnVisibility');
    
    // Check if dropdown exists in DOM
    if ($dropdown.length === 0) {
        console.error('Column visibility dropdown not found in page');
        return;
    }
    
    var svrPath = CONFIG.get('SERVERNAME');
        var apiPathPreferences = svrPath + "Rating/GetUserColumnPreferences?EmployeeId=" + sessionStorage.EmployeeId;
        
    // Ensure cycleInfo is populated before processing column names
    // If cycleInfo is not available, fetch it first
    var appraisalCycleId = parseInt(getRatingPagesAppraisalCycleId()) || parseInt(sessionStorage.AppraisalCycleFrom) || 11;
    
    if (!cycleInfo || !cycleInfo.current || !cycleInfo.current.ShortFYName) {
        console.log('cycleInfo not available, fetching cycle information...');
        FetchCycleInfoForTableHeaders(appraisalCycleId, function() {
            console.log('cycleInfo loaded:', cycleInfo);
            // After cycleInfo is loaded, proceed with loading preferences
            loadColumnPreferences();
        });
    } else {
        console.log('cycleInfo already available:', cycleInfo);
        // cycleInfo already available, proceed directly
        loadColumnPreferences();
    }
    
    function loadColumnPreferences() {
        // Get user preferences from backend
        CommonAjaxGET(apiPathPreferences, CommonGetHeaderInfo()).done(function (preferencesResponse) {
            if (!preferencesResponse || preferencesResponse.Result === undefined) {
                console.error('Failed to load user preferences');
                toastr.error('Failed to load your column preferences');
                return;
            }
            
            // Normalize to array (API may return DataTable as array, or object with Table/Rows, or object with numeric keys)
            var raw = preferencesResponse.Result;
            var userPreferences = Array.isArray(raw) ? raw : (raw && Array.isArray(raw.Table) ? raw.Table : (raw && Array.isArray(raw.Rows) ? raw.Rows : (raw && typeof raw === 'object' ? Object.keys(raw).filter(function(k) { return /^\d+$/.test(k); }).sort(function(a, b) { return +a - +b; }).map(function(k) { return raw[k]; }) : [])));
            if (userPreferences.length === 0) {
                console.warn('No column preferences returned from API');
                toastr.error('Failed to load your column preferences');
                return;
            }
            console.log('LoadColumnPreferences: got', userPreferences.length, 'column(s) from API');
            
            // Destroy existing multiselect if it exists
            try {
                if ($dropdown.data('multiselect')) {
                    $dropdown.multiselect('destroy');
                }
            } catch (e) {
                console.log('Multiselect destroy skipped:', e);
            }

            // Clear and populate dropdown with columns from backend
            $dropdown.empty();
            
            // Store column info for later use
        window.columnVisibilityData = {
            mandatoryColumns: [],
            optionalColumns: [],
            allColumns: []
        };
        
        // Check location-based and designation-based visibility exceptions
        var shouldShowGender = ShowGenderLocation.includes(sessionStorage.LocationId);
        var shouldShowDesignation = IsDesigUploaded == 1;
        
        // Track processed ColumnIds to prevent duplicates (use ColumnId not ColumnIndex - backend index can be shared by different columns e.g. Criticality and Reco. Designation Consent both at 19)
        var processedColumnIds = {};
            
            $.each(userPreferences, function (index, column) {
            // Support both PascalCase and camelCase from API/JSON
            var columnId = column.ColumnId != null ? column.ColumnId : column.columnId;
            var columnIndex = column.ColumnIndex != null ? column.ColumnIndex : column.columnIndex;
            var columnName = (column.ColumnName || column.columnName || '').toString();
            var columnNameUpper = columnName.toUpperCase();
            
            // If we've already processed this ColumnId, skip it (prevent true duplicates only)
            if (processedColumnIds[columnId]) {
                return true; // Skip duplicate
            }
            
            // Debug logging for Criticality
            if (columnNameUpper === 'CRITICALITY') {
                console.log('Processing Criticality column:', {
                    ColumnId: columnId,
                    ColumnIndex: columnIndex,
                    ColumnName: columnName,
                    IsVisible: column.IsVisible || column.isVisible,
                    IsOptional: column.IsOptional || column.isOptional
                });
            }
            
            // Replace placeholder column names with dynamic FY names
            // This ensures the dropdown shows actual FY names instead of "Prev2 Rating", etc.
            var originalColumnName = columnName;
            
            if (columnName === 'Prev2 Rating') {
                if (cycleInfo && cycleInfo.prev2 && cycleInfo.prev2.ShortFYName) {
                    columnName = cycleInfo.prev2.ShortFYName + ' Rating';
                } else {
                    // Fallback: try to get from table header if cycleInfo not available
                    var $prev2Header = $('#thPrev2Rating');
                    if ($prev2Header.length) {
                        var headerText = $prev2Header.html() || $prev2Header.text();
                        // Extract FY name from header (e.g., "FY-24<br />Rating" -> "FY-24")
                        var fyMatch = headerText.match(/(FY-\d+)/i);
                        if (fyMatch && fyMatch[1]) {
                            columnName = fyMatch[1] + ' Rating';
                        }
                    }
                }
            } else if (columnName === 'Prev2 Promotion Reco') {
                if (cycleInfo && cycleInfo.prev2 && cycleInfo.prev2.ShortFYName) {
                    columnName = cycleInfo.prev2.ShortFYName + ' Promotion Reco';
                } else {
                    var $prev2PromoHeader = $('#thPrev2Promotion');
                    if ($prev2PromoHeader.length) {
                        var headerText = $prev2PromoHeader.html() || $prev2PromoHeader.text();
                        var fyMatch = headerText.match(/(FY-\d+)/i);
                        if (fyMatch && fyMatch[1]) {
                            columnName = fyMatch[1] + ' Promotion Reco';
                        }
                    }
                }
            } else if (columnName === 'Prev1 Rating') {
                if (cycleInfo && cycleInfo.prev1 && cycleInfo.prev1.ShortFYName) {
                    columnName = cycleInfo.prev1.ShortFYName + ' Rating';
                } else {
                    var $prev1Header = $('#thPrev1Rating');
                    if ($prev1Header.length) {
                        var headerText = $prev1Header.html() || $prev1Header.text();
                        var fyMatch = headerText.match(/(FY-\d+)/i);
                        if (fyMatch && fyMatch[1]) {
                            columnName = fyMatch[1] + ' Rating';
                        }
                    }
                }
            } else if (columnName === 'Prev1 Promotion Reco') {
                if (cycleInfo && cycleInfo.prev1 && cycleInfo.prev1.ShortFYName) {
                    columnName = cycleInfo.prev1.ShortFYName + ' Promotion Reco';
                } else {
                    var $prev1PromoHeader = $('#thPrev1Promotion');
                    if ($prev1PromoHeader.length) {
                        var headerText = $prev1PromoHeader.html() || $prev1PromoHeader.text();
                        var fyMatch = headerText.match(/(FY-\d+)/i);
                        if (fyMatch && fyMatch[1]) {
                            columnName = fyMatch[1] + ' Promotion Reco';
                        }
                    }
                }
            } else if (columnName === 'Current Rating') {
                if (cycleInfo && cycleInfo.current && cycleInfo.current.ShortFYName) {
                    columnName = cycleInfo.current.ShortFYName + ' Rating';
                } else {
                    var $currentHeader = $('#thCurrentRating');
                    if ($currentHeader.length) {
                        var headerText = $currentHeader.html() || $currentHeader.text();
                        var fyMatch = headerText.match(/(FY-\d+)/i);
                        if (fyMatch && fyMatch[1]) {
                            columnName = fyMatch[1] + ' Rating';
                        }
                    }
                }
            } else if (columnName === 'Current Promotion Reco') {
                if (cycleInfo && cycleInfo.current && cycleInfo.current.ShortFYName) {
                    columnName = cycleInfo.current.ShortFYName + ' Promotion Reco';
                } else {
                    var $currentPromoHeader = $('#thCurrentPromotion');
                    if ($currentPromoHeader.length) {
                        var headerText = $currentPromoHeader.html() || $currentPromoHeader.text();
                        var fyMatch = headerText.match(/(FY-\d+)/i);
                        if (fyMatch && fyMatch[1]) {
                            columnName = fyMatch[1] + ' Promotion Reco';
                        }
                    }
                }
            }
            
            // Debug logging
            if (originalColumnName !== columnName) {
                console.log('Replaced column name:', originalColumnName, '->', columnName);
            } else if (originalColumnName.includes('Prev') || originalColumnName.includes('Current')) {
                console.warn('Could not replace column name:', originalColumnName, 'cycleInfo:', cycleInfo);
            }
            
            // Skip Action column (index 0 or 1 depending on database indexing) - it's always visible and not in dropdown
            // Database might use 1-based indexing, so check both 0 and 1
            if (columnIndex == 0 || columnIndex == 1) {
                // Only skip if it's actually the Action column
                if (columnName === 'Action' || (column.ColumnName || column.columnName || '') === 'Action') {
                    return true; // continue to next iteration
                }
            }
            
            // Skip Recognitions column (deprecated)
            if ((column.ColumnName || column.columnName || '') === 'Recognitions' || columnName === 'Recognitions') {
                return true; // continue to next iteration
            }
            
            // Add ALL columns from API to dropdown so user's saved preference count is correct (e.g. 12 selected, not 9).
            // Do NOT skip Gender or Designation - add them and respect IsVisible; UpdateTableColumnVisibility will hide table column when !shouldShowGender/!shouldShowDesignation.
            
            // Current Rating and Current Promotion Reco columns (15, 16) are mandatory and should always be visible
            // They should NOT be filtered out and should always appear in the dropdown
            // (They are mandatory, so they'll be disabled but visible)
            
            // Special handling for Criticality column - should be selected by default (index 19)
            var columnNameDisplayUpper = (columnName || '').toUpperCase();
            var isCriticalityColumn = (columnNameUpper === 'CRITICALITY' || columnNameDisplayUpper === 'CRITICALITY') || 
                                     (columnIndex == 19);
            var isTalentCubeColumn = (columnNameUpper === 'TALENT CUBE' || columnNameDisplayUpper === 'TALENT CUBE' ||
                                     columnNameUpper === 'TALENTCUBE' || columnNameDisplayUpper === 'TALENTCUBE');
            var isGenderColumn = (columnNameUpper === 'GENDER' || columnNameDisplayUpper === 'GENDER');
            // Respect backend IsVisible (support both PascalCase and camelCase from JSON)
            var isVisibleFromApi = column.IsVisible === true || column.IsVisible === 1 || column.isVisible === true || column.isVisible === 1;
            var isSelected = isVisibleFromApi;
            if (isTalentCubeColumn) {
                // Talent Cube is optional and should not be selected by default (unless user saved it)
                isSelected = isVisibleFromApi;
            }
            if (isGenderColumn) {
                // Gender: respect user's saved preference (IsVisible from API) so "X columns selected" matches saved count
                isSelected = isVisibleFromApi;
            }
            if (isCriticalityColumn) {
                // Respect user's saved preference (IsVisible from API)
                isSelected = isVisibleFromApi;
            }


            
            var isOptional = column.IsOptional === true || column.IsOptional === 1 || column.isOptional === true || column.isOptional === 1;
                
                // Normalized key for visibility matching (backend ColumnIndex may not match DataTable order - e.g. Promotion Track is 17 in DB but index 16 in table)
                var columnNameKeyForOption = (columnName || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
                // Only show Reco Designation and Reco Designation Consent in dropdown when designation is uploaded (IsDesigUploaded == 1)
                if ((columnNameKeyForOption === 'recodesignation' || columnNameKeyForOption === 'recodesignationconsent') && (typeof IsDesigUploaded === 'undefined' || IsDesigUploaded != 1)) {
                    return true; // skip - do not add to dropdown
                }
                // Create option element with dynamic column name
                var $option = $('<option></option>')
                    .attr('value', columnId)
                    .attr('data-column-index', columnIndex)
                    .attr('data-column-name-key', columnNameKeyForOption)
                    .attr('data-is-optional', isOptional ? '1' : '0')
                    .attr('data-columnid', columnId)
                    .text(columnName)  // Use the dynamically replaced column name
                    .prop('selected', isSelected);
                
                // Disable non-optional (mandatory) columns so they cannot be unchecked
            // Name (index 0), Columns 14 and 15 (Current Rating/Promotion Reco) are mandatory and should always be visible
            // Gender (index 6) is optional but shown based on location
            // Designation columns are optional but shown based on designation upload (match by name - backend index may differ)
            // Criticality should be visible and selected by default
            var isDesignationByName = (columnNameKeyForOption === 'recodesignation' || columnNameKeyForOption === 'recodesignationconsent');
            var isExceptionColumn = (columnIndex == 6 && shouldShowGender) || 
                                   (isDesignationByName && shouldShowDesignation) ||
                                   (columnIndex == 19) || (columnNameKeyForOption === 'criticality');
            var isMandatoryColumn = columnIndex == 0 || (!isOptional && !isExceptionColumn); // Name (0) always mandatory

            if (isMandatoryColumn) {
                    $option.prop('disabled', true);
                window.columnVisibilityData.mandatoryColumns.push(columnId);
                } else {
                window.columnVisibilityData.optionalColumns.push(columnId);
            }
            
            window.columnVisibilityData.allColumns.push({
                columnId: columnId,
                columnIndex: columnIndex,
                isOptional: isOptional,
                isSelected: isSelected
            });
                
                $dropdown.append($option);
                
                // Debug logging for Criticality after appending
                if (isCriticalityColumn) {
                    console.log('Criticality option appended to dropdown:', {
                        ColumnId: columnId,
                        ColumnIndex: columnIndex,
                        ColumnName: columnName,
                        IsSelected: isSelected,
                        OptionText: columnName,
                        OptionValue: columnId
                    });
                }
                
                // Store this ColumnId as processed (after all checks pass and option is created)
                processedColumnIds[columnId] = {
                    $option: $option,
                    columnIndex: columnIndex,
                    columnName: columnName
                };
            });

        // Initialize multiselect WITHOUT default Select All option
            $dropdown.multiselect({
            includeSelectAllOption: false, // Remove default Select All
                enableFiltering: true,
                enableCaseInsensitiveFiltering: true,
                maxHeight: 200,
                numberDisplayed: 1,
                nonSelectedText: 'Select Columns',
                nSelectedText: ' columns selected',
                buttonWidth: '100%',
                disableIfEmpty: true,
                onChange: function(option, checked) {
                    var $option = $(option);
                var isOptional = $option.attr('data-is-optional') === '1';
                    
                // Prevent unchecking mandatory columns
                    if (!checked && !isOptional) {
                        toastr.warning('This column is mandatory and cannot be hidden.');
                        $option.prop('selected', true);
                        $dropdown.multiselect('refresh');
                        return false;
                    }
                
                // Validate minimum selection
                var selectedCount = $('#ddlColumnVisibility option:selected').length;
                if (selectedCount < 1) {
                    toastr.warning('At least one column must be visible.');
                        $option.prop('selected', true);
                        $dropdown.multiselect('refresh');
                        return false;
                    }
                    
                    // Update table visibility
                    UpdateTableColumnVisibility();
                    
                    // Save preferences to backend
                    SaveColumnPreferences();
                },
            onDropdownShown: function(event) {
                // Add custom buttons inside the dropdown after it's shown
                var $multiselectContainer = $dropdown.next('.btn-group');
                var $dropdownMenu = $multiselectContainer.find('.multiselect-container');
                
                // Remove existing buttons if they exist
                $dropdownMenu.find('.column-visibility-buttons').remove();
                
                // Create button container
                var $buttonContainer = $('<div class="column-visibility-buttons" style="padding: 8px; border-top: 1px solid #ddd; background-color: #f9f9f9; text-align: center;"></div>');
                
                // Create Show All button
                var $showAllBtn = $('<button type="button" class="btn btn-sm btn-primary" id="btnSelectAllColumns" style="margin-right: 5px; padding: 4px 12px; font-size: 11px; width: 48%;">Show All</button>');
                
                // Create Reset button
                var $resetBtn = $('<button type="button" class="btn btn-sm btn-default" id="btnResetColumns" style="padding: 4px 12px; font-size: 11px; width: 48%;">Reset</button>');
                
                // Append buttons to container
                $buttonContainer.append($showAllBtn).append($resetBtn);
                
                // Append container to dropdown menu
                $dropdownMenu.append($buttonContainer);
                
                // Setup Show All button - selects all columns (mandatory + optional)
                $showAllBtn.off('click').on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Select all columns that are in the dropdown (exceptions already filtered out)
                    $('#ddlColumnVisibility option').each(function() {
                        $(this).prop('selected', true);
                    });
                    $dropdown.multiselect('refresh');
                    UpdateTableColumnVisibility();
                    SaveColumnPreferences();
                    toastr.success('All columns are now visible');
                    
                    // Keep dropdown open
                    return false;
                });
                
                // Setup Reset button - shows only mandatory columns (hides all optional)
                $resetBtn.off('click').on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Check location and designation exceptions
                    var shouldShowGender = ShowGenderLocation.includes(sessionStorage.LocationId);
                    var shouldShowDesignation = IsDesigUploaded == 1;
                    
                    // Reset: Only select mandatory columns + exception columns (if they should be shown)
                    $('#ddlColumnVisibility option').each(function() {
                        var $option = $(this);
                        var isOptional = $option.attr('data-is-optional') === '1';
                        var columnIndex = parseInt($option.attr('data-column-index'));
                        var columnName = $option.text();
                        
                        // Always select mandatory columns
                        if (!isOptional) {
                            $option.prop('selected', true);
                        }
                        // For optional columns, check if they are exception columns
                        else {
                            var shouldSelect = false;
                            
                            // Exception 1: Grade column - mandatory, always select
                            if (columnIndex == 1 || columnName.toUpperCase() === 'GRADE') {
                                shouldSelect = true;
                            }
                            // Exception 2: Gender column (index 6) - select if location allows
                            else if (columnIndex == 6 && shouldShowGender) {
                                shouldSelect = true;
                            }
                            // Exception 3: Criticality column (index 19) - always select (case-insensitive)
                            else if (columnIndex == 19 || columnName.toUpperCase() === 'CRITICALITY') {
                                shouldSelect = true;
                            }
                            // Exception 4: Designation columns (index 17, 18) - select if uploaded
                            else if ((columnIndex == 17 || columnIndex == 18) && shouldShowDesignation) {
                                shouldSelect = true;
                            }
                            // All other optional columns - deselect (hide)
                            else {
                                shouldSelect = false;
                            }
                            
                            $option.prop('selected', shouldSelect);
                        }
                    });
                    
                    $dropdown.multiselect('refresh');
                    UpdateTableColumnVisibility();
                    SaveColumnPreferences();
                    toastr.success('Column visibility reset to mandatory columns only');
                    
                    // Keep dropdown open
                    return false;
                });
                }
            });
            
            // Debug: Verify Criticality is in dropdown after initialization
            var criticalityOptions = $dropdown.find('option').filter(function() {
                return $(this).text().toUpperCase().indexOf('CRITICALITY') !== -1;
            });
            if (criticalityOptions.length > 0) {
                console.log('Criticality found in dropdown after initialization:', criticalityOptions.length, 'option(s)');
                criticalityOptions.each(function() {
                    console.log('Criticality option:', {
                        Text: $(this).text(),
                        Value: $(this).val(),
                        Selected: $(this).prop('selected'),
                        ColumnIndex: $(this).attr('data-column-index')
                    });
                });
            } else {
                console.warn('WARNING: Criticality NOT found in dropdown after initialization!');
                console.log('All dropdown options:', $dropdown.find('option').map(function() {
                    return $(this).text();
                }).get());
            }
            
            // Apply initial column visibility based on user preferences (same path as "Select Columns" change)
            UpdateTableColumnVisibility();
        
        // Redraw table so headers align with data (do NOT override visibility - UpdateTableColumnVisibility already applied user preferences for Gender, Promotion Track, etc.)
        var table = $('#tblEmpRatingList').DataTable();
        if (table) {
            try {
                table.columns.adjust();
                table.draw(false);
                console.log('Table redrawn after column preferences loaded');
            } catch (e) {
                console.warn('Could not redraw after preferences:', e);
            }
        }
            
            console.log('Column visibility dropdown initialized successfully');
            
        }).fail(function(error) {
            console.error('Error loading user preferences:', error);
            toastr.error('Failed to load your column preferences');
        });
    }  // End of loadColumnPreferences function
}  // End of InitializeColumnVisibilityDropdown function

// Save user's column preferences to backend
function SaveColumnPreferences() {
    var selectedOptions = $('#ddlColumnVisibility option:selected');
    var selectedColumnIds = [];
    
    // Save ALL selected columns (both mandatory and optional) to track user preferences
    $.each(selectedOptions, function(index, option) {
        var $option = $(option);
        var columnId = $option.attr('data-columnid') || $option.val();
        if (columnId !== undefined && columnId !== null && columnId !== '') {
            selectedColumnIds.push(String(columnId).trim());
        }
    });
    
    console.log('Saving column preferences (all selected):', selectedColumnIds);
    
    // Always save preferences, even if only mandatory columns are selected
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating/SaveUserColumnPreferences?EmployeeId=" + sessionStorage.EmployeeId + "&PageType=Rating";
    
    var headerInfo = CommonGetHeaderInfo();
    
    // Backend expects wrapper object { VisibleColumnIds: "1,2,3,4" } for reliable [FromBody] binding in Web API 2
    var columnIdsString = selectedColumnIds.join(',');
    var requestBody = { VisibleColumnIds: columnIdsString };
    console.log('Sending column preferences:', requestBody);
    
    $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'POST',
        url: apiPath,
        headers: headerInfo,
        data: JSON.stringify(requestBody),
        success: function (response) {
            console.log('Save preferences response:', response);
            if (response && response.Success) {
                // Silent success - don't show toastr for every change
                console.log('Column preferences updated successfully');
            } else {
                console.error('Failed to save preferences:', response);
                toastr.error('Failed to save column preferences');
            }
        },
        error: function (xhr, statusText, errorThrown) {
            console.error('Error saving preferences:', xhr.status, statusText, errorThrown);
            
            // Handle 401 Unauthorized - token expired
            if (xhr.status === 401) {
                console.warn('Authentication token expired. Preferences will be saved on next login.');
                // Don't show error - just log it, preferences will save next time
            } else {
                toastr.error('Error saving column preferences: ' + xhr.status);
            }
        }
    });
}

/**
 * Update table column visibility based on dropdown selection
 * Handles location-based and designation-based exceptions
 */
function UpdateTableColumnVisibility() {
    var table = $('#tblEmpRatingList').DataTable();
    
    if (!table) {
        console.log('Table not found, skipping column visibility update');
        return;
    }

    var selectedOptions = $('#ddlColumnVisibility option:selected');
    
    // If dropdown is not populated yet, use default visibility settings
    // CRITICAL: Iterate ALL columns and set visibility explicitly (same as when dropdown has options).
    // This forces DataTables to recalc layout and fixes header/data misalignment on first load.
    if (selectedOptions.length === 0) {
        console.log('Column visibility dropdown not ready yet, applying default visibility to ALL columns...');
        
        var totalColumns = table.columns().count();
        var shouldShowGender = (typeof ShowGenderLocation !== 'undefined' && ShowGenderLocation) ? ShowGenderLocation.includes(sessionStorage.LocationId) : false;
        var shouldShowDesignation = (typeof IsDesigUploaded !== 'undefined' && IsDesigUploaded == 1);
        
        for (var i = 0; i < totalColumns; i++) {
            try {
                var col = table.column(i);
                if (!col || typeof col.visible !== 'function') continue;
                var visible = true;
                if (i === 0) visible = true;                                    // Name
                else if (i === 1) visible = true;                               // Grade (mandatory)
                else if (i === 22) visible = true;                                   // Action
                else if (i === 6) visible = false;                               // Gender (optional, hidden by default)
                else if (i === 14 || i === 15) visible = true;                   // Current Rating / Promotion Reco
                else if (i === 19) visible = true;                               // Criticality
                else if (i === 17 || i === 18) visible = shouldShowDesignation;   // Reco Designation / Consent
                else if (i === 23) visible = false;                               // Recognitions
                col.visible(visible);
            } catch (e) {
                console.warn('UpdateTableColumnVisibility default: column ' + i + ':', e);
            }
        }
        
        // Force synchronous layout recalc and redraw (same sequence as dropdown onChange)
        try {
            table.columns.adjust();
            table.draw(false);
            console.log('Table redrawn with default column visibility (all columns set)');
        } catch (e) {
            console.warn('Could not redraw table with defaults:', e);
        }
        
        return;
    }
    
    // Validate minimum column selection
    if (selectedOptions.length < 1) {
        console.warn('No columns selected in dropdown');
        // Don't show warning toastr here as it might be called during initialization
        return;
    }
    
    // Use name-key matching for regular columns because DB ColumnIndex can drift
    // from DataTable column positions after configuration changes.
    var normalizeColumnKey = function (value) {
        return (value || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
    };

    // Get selected columns by name key (backend ColumnIndex may not match our DataTable order - e.g. Promotion Track is 17 in DB but index 16 in table)
    var selectedIndexes = [];
    var selectedColumnIds = [];
    var selectedColumnNameKeys = [];
    $.each(selectedOptions, function(index, option) {
        var $option = $(option);
        var columnIndex = parseInt($option.attr('data-column-index'));
        var columnId = $option.attr('data-columnid') || $option.val();
        // Use data-column-name-key if set (set when option is built), else normalize option text - ensures reliable match when multiselect alters DOM
        var columnNameKey = $option.attr('data-column-name-key') || normalizeColumnKey($option.text());
        if (!isNaN(columnIndex) && columnIndex >= 0) {
            selectedIndexes.push(columnIndex);
        }
        if (columnId) {
            selectedColumnIds.push(parseInt(columnId));
        }
        if (columnNameKey) {
            selectedColumnNameKeys.push(columnNameKey);
        }
    });
    
    console.log('UpdateTableColumnVisibility - Selected ColumnIndexes:', selectedIndexes);
    console.log('UpdateTableColumnVisibility - Selected ColumnIds:', selectedColumnIds);
    
    // Get total number of columns in the table
    var totalColumns = table.columns().count();
    
    if (totalColumns === 0) {
        console.warn('Table has no columns, skipping visibility update');
        return;
    }
    
    // Check location-based and designation-based visibility exceptions
    var shouldShowGender = ShowGenderLocation.includes(sessionStorage.LocationId);
    var shouldShowDesignation = IsDesigUploaded == 1;
    
    // Update visibility for ALL columns based on selection and exceptions
    var updatedCount = 0;
    for (var i = 0; i < totalColumns; i++) {
        try {
            // Check if column exists in DataTable (may not exist if not in column definitions)
            var column = table.column(i);
            if (!column || typeof column.visible !== 'function') {
                // Column doesn't exist in DataTable, skip it
                continue;
            }
            
            // Column exists, proceed with visibility logic
            var shouldBeVisible = false;
            var tableColumnName = '';
            var tableColumnNameKey = '';
            try {
                var settings = table.settings()[0];
                if (settings && settings.aoColumns && settings.aoColumns[i]) {
                    tableColumnName = settings.aoColumns[i].name || '';
                }
            } catch (nameErr) {
                tableColumnName = '';
            }
            tableColumnNameKey = normalizeColumnKey(tableColumnName);
                
            // Name column (index 0) - always visible
            if (i == 0) {
                shouldBeVisible = true;
            }
            // Action column (index 22) - always visible
            else if (i == 22) {
                shouldBeVisible = true;
            }
            // Exception 1: Gender column (index 6) - location-based, match by name only (backend ColumnIndex may differ)
            else if (i == 6) {
                var genderSelected = selectedColumnNameKeys.indexOf('gender') !== -1;
                shouldBeVisible = shouldShowGender && genderSelected;
                // Also update HTML class
                if (shouldShowGender) {
                    $('.hide-this').show();
                } else {
                    $('.hide-this').hide();
                }
            }
            // Promotion Track column (index 16) - backend has ColumnIndex 17, so match by name only
            else if (i == 16) {
                shouldBeVisible = selectedColumnNameKeys.indexOf('promotiontrack') !== -1;
            }
            // Current Rating and Current Promotion Reco columns (index 14, 15) - MANDATORY, always visible
            // Designation columns are at index 17, 18
            else if (i == 14 || i == 15) {
                // Current FY columns are mandatory and should always be visible
                shouldBeVisible = true;
                console.log('Current FY column (index ' + i + ') forced to visible (mandatory)');
            }
            // Criticality column (index 19) - follow dropdown selection
            else if (i == 19) {
                var criticalitySelected = selectedColumnNameKeys.indexOf('criticality') !== -1 || selectedIndexes.indexOf(i) !== -1;
                shouldBeVisible = criticalitySelected;
            }
            // Exception 2: Designation columns (index 17, 18) - designation upload based, match by name (backend index may differ)
            else if (i == 17 || i == 18) {
                var designationSelected = (i == 17)
                    ? (selectedColumnNameKeys.indexOf('recodesignation') !== -1 || (tableColumnNameKey && selectedColumnNameKeys.indexOf(tableColumnNameKey) !== -1))
                    : (selectedColumnNameKeys.indexOf('recodesignationconsent') !== -1 || (tableColumnNameKey && selectedColumnNameKeys.indexOf(tableColumnNameKey) !== -1));
                shouldBeVisible = shouldShowDesignation && designationSelected;
                // Also update HTML classes
                if (shouldShowDesignation) {
                    if (i == 17) {
                        $('.hide-this-Desig1').show();
                    } else if (i == 18) {
                        $('.hide-this-Desig2').show();
                    }
                } else {
                    if (i == 17) {
                        $('.hide-this-Desig1').hide();
                    } else if (i == 18) {
                        $('.hide-this-Desig2').hide();
                    }
                }
            }
            // Recognitions column (index 23) - always hidden
            else if (i == 23) {
                shouldBeVisible = false;
            }
            // Regular columns - match by column NAME only (backend ColumnIndex does not match our DataTable order, e.g. Promotion Track is 17 in DB but 16 in table)
            else {
                if (tableColumnNameKey) {
                    shouldBeVisible = selectedColumnNameKeys.indexOf(tableColumnNameKey) !== -1;
                    // Dynamic FY columns: dropdown shows "FY-24 Rating" etc. (from UpdateTableHeaders), but DataTable column name is "Prev2Rating"/"Prev1Rating"
                    // Match by either column name or the current FY display label so visibility works when user selects the updated header name
                    if (!shouldBeVisible && cycleInfo && (cycleInfo.prev2 || cycleInfo.prev1)) {
                        var displayNameKey = '';
                        if (tableColumnName === 'Prev2Rating' && cycleInfo.prev2 && cycleInfo.prev2.ShortFYName) {
                            displayNameKey = normalizeColumnKey(cycleInfo.prev2.ShortFYName + ' Rating');
                        } else if (tableColumnName === 'Prev2PromotionReco' && cycleInfo.prev2 && cycleInfo.prev2.ShortFYName) {
                            displayNameKey = normalizeColumnKey(cycleInfo.prev2.ShortFYName + ' Promotion Reco');
                        } else if (tableColumnName === 'Prev1Rating' && cycleInfo.prev1 && cycleInfo.prev1.ShortFYName) {
                            displayNameKey = normalizeColumnKey(cycleInfo.prev1.ShortFYName + ' Rating');
                        } else if (tableColumnName === 'Prev1PromotionReco' && cycleInfo.prev1 && cycleInfo.prev1.ShortFYName) {
                            displayNameKey = normalizeColumnKey(cycleInfo.prev1.ShortFYName + ' Promotion Reco');
                        }
                        if (displayNameKey && selectedColumnNameKeys.indexOf(displayNameKey) !== -1) {
                            shouldBeVisible = true;
                        }
                    }
                    // Alternate display names: dropdown may show "Promotion Track" (with space) or "Gender" - normalize matches "PromotionTrack"/"promotiontrack", "Gender"/"gender"
                } else {
                    // Fallback for unnamed columns
                    shouldBeVisible = selectedIndexes.indexOf(i) !== -1;
                }
                // Log for debugging dynamic columns
                if ((i >= 9 && i <= 12) || (i == 14 || i == 15)) {
                    console.log('Column ' + i + ' visibility:', shouldBeVisible, 'tableColumnName:', tableColumnName, 'selectedIndexes:', selectedIndexes);
                }
            }
            
            // Update visibility for all columns (except those that used continue)
            try {
                column.visible(shouldBeVisible);
                updatedCount++;
                
                // Double-check Current Rating (14) and Current Promotion Reco (15) only - do not force column 16 (Promotion Track)
                if (i == 14 || i == 15) {
                    var actualVisibility = column.visible();
                    if (!actualVisibility) {
                        console.warn('Current FY column ' + i + ' was set to visible but is not visible. Forcing visibility...');
                        column.visible(true);
                    }
                }
            } catch (e) {
                console.warn('Column ' + i + ' could not be updated:', e);
            }
        } catch (e) {
            console.warn('Column ' + i + ' could not be accessed:', e);
        }
    }
    
    if (updatedCount === 0) {
        console.warn('No columns were updated. Table may not be fully initialized.');
        return;
    }

    // CRITICAL: Ensure Current FY columns (14, 15) stay visible after all updates (mandatory columns)
    try {
        table.column(14).visible(true);  // Current Rating - mandatory
        table.column(15).visible(true);  // Current Promotion Reco - mandatory
        console.log('Ensured Current FY columns (14, 15) are visible');
    } catch (e) {
        console.warn('Could not ensure Current FY columns are visible:', e);
    }

    // CRITICAL: Immediately adjust and redraw the table to fix column alignment
    try {
        // Adjust column widths and redraw immediately
        // Use requestAnimationFrame to ensure DOM updates are complete
        requestAnimationFrame(function() {
            try {
                table.columns.adjust();
                requestAnimationFrame(function() {
                    table.draw(false);
                    console.log('Table columns adjusted and redrawn immediately after visibility update');
                });
            } catch (e) {
                console.warn('Could not adjust table columns:', e);
                try {
                    table.draw(false);
                } catch (e2) {
                    console.warn('Could not draw table:', e2);
                }
            }
        });
    } catch (e) {
        console.warn('Could not adjust table columns, trying simple draw:', e);
        try {
            table.draw(false);
        } catch (e2) {
            console.warn('Could not draw table:', e2);
        }
    }
    
    // Additional safeguard: Re-ensure Current FY columns after a short delay
    setTimeout(function() {
        try {
            var $tableElement = $('#tblEmpRatingList');
            if ($tableElement.length && $.fn.DataTable.isDataTable($tableElement)) {
                var adjustedTable = $tableElement.DataTable();
                adjustedTable.column(14).visible(true);  // Current Rating
                adjustedTable.column(15).visible(true);  // Current Promotion Reco
                adjustedTable.columns.adjust().draw(false);
                console.log('Final table adjustment completed');
            }
        } catch (e) {
            console.warn('Could not perform final table adjustment:', e);
        }
    }, 200);
}

// ==================================================================================
// Criticality Details Modal Functions
// ==================================================================================

/**
 * Open criticality details modal
 * @param {number} employeeId - PEP Employee ID
 * @param {string} employeeName - Employee Name
 * @param {string} location - Location
 * @param {string} grade - Grade
 */
function openCriticalityModal(employeeId, employeeName, location, grade) {
    var currentRole = $('#ddlRole').val();
    // Allow Inputters (1), Reviewers (2), and Approvers (3)
    if (currentRole != '1' && currentRole != '2' && currentRole != '3') {
        toastr.warning('Only Inputters, Reviewers, and Approvers can edit criticality details.');
        return;
    }
    
    //var appraisalCycleId = sessionStorage.getItem('AppraisalCycleId') || '';
    var appraisalCycleId = getRatingPagesAppraisalCycleId();
    
    // Set basic employee information immediately (minimal DOM operations)
    $('#modalPEPEmployeeId').val(employeeId);
    $('#modalAppraisalCycleId').val(appraisalCycleId);
    $('#modalEmployeeName').text(employeeName);
    $('#modalEmployeeLocation').text(location || 'N/A');
    $('#modalEmployeeGrade').text(grade || 'N/A');
    
    // Show modal FIRST - before any other operations
    $('#criticalityModalLoader').show();
    $('#criticalityModalContent').hide();
    $('#btnSaveCriticalityDetails').hide();
    
    // Show modal immediately
    $('#criticalityDetailsModal').modal('show');
    
    // Use Bootstrap's 'shown.bs.modal' event to ensure modal is fully visible before operations
    // This event fires after CSS transitions complete
    $('#criticalityDetailsModal').one('shown.bs.modal', function() {
        updatePrioritisationTextVisibility();
        // Clear all dropdowns (deferred to not block modal opening)
        clearCriticalityForm();
        
        // Load span count and validation info FIRST to check if we should load master data
        var spanValidationPromise = new Promise(function(resolve) {
            loadSpanValidationInfo(sessionStorage.EmployeeId, appraisalCycleId, currentRole, employeeId, function() {
                resolve();
            });
        });
        
        // Create promises for all data loading operations
        // Always load master data first (needed to populate existing values in dropdowns)
        var masterDataPromise = new Promise(function(resolve) {
            loadCriticalityMasterData(function() {
                resolve();
            });
        });
        
        // Load employees in span when modal opens (not lazy loading)
        var employeesPromise = new Promise(function(resolve) {
            loadEmployeesInSpan(sessionStorage.EmployeeId, appraisalCycleId, employeeId, function() {
                resolve();
            });
        });
        
        var existingDataPromise = new Promise(function(resolve) {
            loadCriticalityDetails(employeeId, function() {
                resolve();
            });
        });
        
        // Load all data in background
        Promise.all([masterDataPromise, employeesPromise, existingDataPromise, spanValidationPromise]).then(function() {
            // Scope to modal: page has duplicate id="ddlCriticalityPriority" (filter vs modal)
            var $modal = $('#criticalityDetailsModal');
            var $mReasons = $modal.find('#ddlCriticalityReasons');
            var $mPriority = $modal.find('#ddlCriticalityPriority');

            // Always initialize multiselect (master data is always loaded now)
            if ($mReasons.data('multiselect')) {
                $mReasons.multiselect('destroy');
            }
            
            $mReasons.multiselect({
            buttonWidth: '100%',
            numberDisplayed: 2,
            includeSelectAllOption: false,
            maxHeight: 300,
            enableFiltering: false,
                buttonClass: 'form-control',
            buttonText: function(options, select) {
                if (options.length === 0) {
                    return 'Select Reasons (Max 2)';
                }
                else if (options.length > 2) {
                    return 'Max 2 reasons allowed!';
                }
                else {
                    var labels = [];
                    options.each(function() {
                        labels.push($(this).text());
                    });
                    return labels.join(', ');
                }
            },
            onChange: function(option, checked) {
                    var selectedCount = $mReasons.find('option:selected').length;
                
                if (checked && selectedCount > 2) {
                    toastr.warning('You can select maximum 2 criticality reasons.');
                    $(option).prop('selected', false);
                        $mReasons.multiselect('refresh');
                    return false;
                }
            }
        });
            
            setTimeout(function() {
                var $btnGroup = $mReasons.next('.btn-group');
                var $multiselectButton = $btnGroup.find('button');
                if ($btnGroup.length > 0 && $multiselectButton.length > 0) {
                    $btnGroup.css({
                        'width': '100%',
                        'display': 'block'
                    });
                    $multiselectButton.removeClass('btn-default').addClass('form-control');
                    $multiselectButton.css({
                        'width': '100%',
                        'text-align': 'left',
                        'height': '34px',
                        'padding': '6px 12px',
                        'font-size': '14px',
                        'line-height': '1.42857143',
                        'color': '#555',
                        'background-color': '#fff',
                        'border': '1px solid #ccc',
                        'border-radius': '4px'
                    });
                }
            }, 100);
            
            setTimeout(function() {
                var validation = $modal.data('spanValidation');
                if (validation) {
                    var existingPriority = $mPriority.data('originalValue') || '';
                    var isExistingMarking = (existingPriority != '' && existingPriority != null);
                    debugger
                    if (!validation.isValid && !isExistingMarking) {
                        disableCriticalityDropdowns();
                        $('#btnSaveCriticalityDetails').prop('disabled', true).addClass('disabled');
                        toastr.warning('Maximum number of employees are already marked as critical.', '', {
                            timeOut: 10000,
                            positionClass: 'toast-top-center'
                        });
                    } else if (!validation.isValid && isExistingMarking) {
                        enableCriticalityDropdowns();
                    } else {
                        enableCriticalityDropdowns();
                    }
                }
            }, 200);
            
            setTimeout(function() {
                initializeSearchableDropdowns();
            }, 200);

            setTimeout(function () {
                refreshCriticalityPriorityOptionAvailability($modal);
            }, 400);
            
            $mPriority.off('change.criticalityDependent').on('change.criticalityDependent', function() {
                toggleCriticalityDependentFields();
                
                var selectedPriorityId = $(this).val();
                if (selectedPriorityId && selectedPriorityId !== '') {
                    var currentRole = $('#ddlRole').val();
                    if (currentRole == '2' || currentRole == '3') {
                        validatePriorityMarkingLimit(selectedPriorityId);
                    }
                }
                setTimeout(function () {
                    refreshCriticalityPriorityOptionAvailability($modal);
                }, 450);
            });
            
            toggleCriticalityDependentFields();
            
            // Hide loader and show content
            $('#criticalityModalLoader').hide();
            $('#criticalityModalContent').show();
            $('#btnSaveCriticalityDetails').show();
        }).catch(function(error) {
            console.error('Error loading criticality data:', error);
            $('#criticalityModalLoader').hide();
            $('#criticalityModalContent').show();
            $('#btnSaveCriticalityDetails').show();
            toastr.error('Error loading criticality details. Please try again.');
        });
    });
}

/**
 * Load existing criticality details for an employee
 * @param {number} employeeId - PEP Employee ID
 * @param {function} callback - Callback function to call when loading is complete
 */
function loadCriticalityDetails(employeeId, callback) {
    //var appraisalCycleId = sessionStorage.getItem('AppraisalCycleId') || '';
    var appraisalCycleId = getRatingPagesAppraisalCycleId();
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating/GetCriticalityDetails?PEPEmployeeId=" + employeeId + "&AppraisalCycleId=" + appraisalCycleId;
    
    CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (response) {
        if (response && response.Success && response.Result) {
            var data = response.Result;
            var $modal = $('#criticalityDetailsModal');

                // Set Criticality Reasons (comma-separated IDs) - scope to modal
                if (data.CriticalityReasons) {
                    var reasonIds = data.CriticalityReasons.split(',').map(function(id) {
                        return id.trim();
                    });
                    var $reasons = $modal.find('#ddlCriticalityReasons');
                    $reasons.val(reasonIds);
                    if ($reasons.data('multiselect')) {
                        $reasons.multiselect('refresh');
                    }
                }
                
                // Set Criticality Priority (ID) - scope to modal
                if (data.CriticalityPriority) {
                    var priorityValue = data.CriticalityPriority.toString().trim();
                    var $priority = $modal.find('#ddlCriticalityPriority');
                    $priority.val(priorityValue);
                    $priority.data('originalValue', priorityValue);
                    
                    toggleCriticalityDependentFields();
                    
                    setTimeout(function() {
                        var validation = $modal.data('spanValidation');
                        if (validation) {
                            var existingPriority = $modal.find('#ddlCriticalityPriority').data('originalValue') || '';
                            var isExistingMarking = (existingPriority != '' && existingPriority != null);
                            debugger
                            if (!validation.isValid && !isExistingMarking) {
                                disableCriticalityDropdowns();
                                $('#btnSaveCriticalityDetails').prop('disabled', true).addClass('disabled');
                                toastr.warning('Maximum number of employees are already marked as critical.', '', {
                                    timeOut: 10000,
                                    positionClass: 'toast-top-center'
                                });
                            } else if (!validation.isValid && isExistingMarking) {
                                enableCriticalityDropdowns();
                            } else {
                                enableCriticalityDropdowns();
                            }
                        }
                    }, 100);
                } else {
                    $modal.find('#ddlCriticalityPriority').data('originalValue', '');
                    toggleCriticalityDependentFields();
                }
                
                // Set Attrition Risk (ID) - scope to modal
                if (data.AttritionRisk) {
                    $modal.find('#ddlAttritionRisk').val(data.AttritionRisk.toString().trim());
                }
                
                // Set Immediate Backup (data contains employee ID)
                if (data.ImmediateBackup) {
                    var backupId = data.ImmediateBackup.toString().trim();
                    var $ddlBackup = $('#ddlImmediateBackup');
                    
                    // Find by employee ID (dropdown values are employee IDs)
                    var $backupOption = $ddlBackup.find('option').filter(function() {
                        return $(this).val() == backupId;
                    });
                    if ($backupOption.length > 0) {
                        $ddlBackup.val(backupId);
                        // Trigger change event for Select2 if it's initialized
                        if ($ddlBackup.hasClass('select2-hidden-accessible')) {
                            $ddlBackup.trigger('change');
                        }
                    } else {
                        // Employee might not be in current span, but we'll keep the ID for reference
                        // Try to find by text match as fallback
                        var $backupTextOption = $ddlBackup.find('option').filter(function() {
                            return $(this).text().includes(backupId);
                        });
                        if ($backupTextOption.length > 0) {
                            $ddlBackup.val($backupTextOption.first().val());
                            if ($ddlBackup.hasClass('select2-hidden-accessible')) {
                                $ddlBackup.trigger('change');
                            }
                        }
                    }
                }
                
                // Set Successor Name (data contains employee ID)
                if (data.SuccessorName) {
                    var successorId = data.SuccessorName.toString().trim();
                    var $ddlSuccessor = $('#ddlSuccessorName');
                    
                    // Find by employee ID (dropdown values are employee IDs)
                    var $successorOption = $ddlSuccessor.find('option').filter(function() {
                        return $(this).val() == successorId;
                    });
                    if ($successorOption.length > 0) {
                        $ddlSuccessor.val(successorId);
                        // Trigger change event for Select2 if it's initialized
                        if ($ddlSuccessor.hasClass('select2-hidden-accessible')) {
                            $ddlSuccessor.trigger('change');
                        }
                    } else {
                        // Employee might not be in current span, but we'll keep the ID for reference
                        // Try to find by text match as fallback
                        var $successorTextOption = $ddlSuccessor.find('option').filter(function() {
                            return $(this).text().includes(successorId);
                        });
                        if ($successorTextOption.length > 0) {
                            $ddlSuccessor.val($successorTextOption.first().val());
                            if ($ddlSuccessor.hasClass('select2-hidden-accessible')) {
                                $ddlSuccessor.trigger('change');
                            }
                        }
                    }
                }
        } else {
            // Clear all fields if no data found
            clearCriticalityForm();
        }
        
        // Call callback if provided
        if (callback && typeof callback === 'function') {
            callback();
        }
    }).fail(function(xhr, status, error) {
        // Handle 404 gracefully - first time inputter, no data exists yet
        if (xhr.status === 404) {
            console.log('No criticality details found for this employee (first time). Initializing empty form.');
            clearCriticalityForm();
        } else {
            console.error('Error loading criticality details:', error);
            toastr.error('Error loading criticality details. Please try again.');
            clearCriticalityForm();
        }
        
        // Call callback even on error so the modal can still be shown
        if (callback && typeof callback === 'function') {
            callback();
        }
    });
}

/**
 * Load master data for criticality dropdowns
 */
function loadCriticalityMasterData(callback) {
    var svrPath = CONFIG.get('SERVERNAME');
    var completedCalls = 0;
    var totalCalls = 3;
    
    var checkAllComplete = function() {
        completedCalls++;
        if (completedCalls >= totalCalls && callback) {
            callback();
        }
    };
    
    // Scope to modal: page has duplicate id="ddlCriticalityPriority" (filter vs modal); bind to modal's dropdowns only
    var $modal = $('#criticalityDetailsModal');

    // Load Criticality Reasons - Use Id as value, DisplayText as text
    var apiPath = svrPath + "Rating/GetCriticalityReasons";
    CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (response) {
        if (response && response.Success && response.Result) {
            var $ddl = $modal.find('#ddlCriticalityReasons');
            $ddl.empty();
            $.each(response.Result, function (index, item) {
                // Use Id as value, DisplayText as display text
                $ddl.append($('<option></option>').val(item.Id).text(item.DisplayText));
            });
            if ($ddl.data('multiselect')) {
                $ddl.multiselect('refresh');
            }
        }
        checkAllComplete();
    }).fail(function() {
        console.error('Error loading criticality reasons');
        checkAllComplete();
    });
    
    // Load Criticality Priorities - Use Id as value, DisplayText as text
    // Also store mapping of Id to PriorityCode (Value or DisplayText) for validation
    apiPath = svrPath + "Rating/GetCriticalityPriorities";
    CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (response) {
        if (response && response.Success && response.Result) {
            var $ddl = $modal.find('#ddlCriticalityPriority');
            $ddl.empty();
            $ddl.append($('<option></option>').val('').text('--Select--'));
            
            // Store mapping of priority ID to priority code (P1, P2, P3) for validation
            var priorityCodeMap = {};
            $.each(response.Result, function (index, item) {
                // Use Id as value, DisplayText as display text
                $ddl.append($('<option></option>').val(item.Id).text(item.DisplayText));
                
                // Store mapping: Id -> PriorityCode (use Value if available, otherwise DisplayText)
                var priorityCode = (item.Value && item.Value.trim() !== '') ? item.Value.trim().toUpperCase() : item.DisplayText.trim().toUpperCase();
                priorityCodeMap[item.Id] = priorityCode;
            });
            
            // Store the mapping in the modal for later use
            $modal.data('priorityCodeMap', priorityCodeMap);
        }
        checkAllComplete();
    }).fail(function() {
        console.error('Error loading criticality priorities');
        checkAllComplete();
    });
    
    // Load Attrition Risks - Use Id as value, DisplayText as text
    apiPath = svrPath + "Rating/GetAttritionRisks";
    CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (response) {
        if (response && response.Success && response.Result) {
            var $ddl = $modal.find('#ddlAttritionRisk');
            $ddl.empty();
            $ddl.append($('<option></option>').val('').text('--Select--'));
            $.each(response.Result, function (index, item) {
                // Use Id as value, DisplayText as display text
                $ddl.append($('<option></option>').val(item.Id).text(item.DisplayText));
            });
        }
        checkAllComplete();
    }).fail(function() {
        console.error('Error loading attrition risks');
        checkAllComplete();
    });
}

/**
 * Load employees in logged-in employee's span
 * Excludes the employee for whom criticality details are being filled
 * @param {number} managerId - Manager Employee ID
 * @param {number} appraisalCycleId - Appraisal Cycle ID
 * @param {number} excludeEmployeeId - Employee ID to exclude from the list
 * @param {function} callback - Callback function to call when loading is complete
 */
function loadEmployeesInSpan(managerId, appraisalCycleId, excludeEmployeeId, callback) {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating/GetEmployeesInSpan?ManagerId=" + managerId + "&AppraisalCycleId=" + (appraisalCycleId || 0);
    if (excludeEmployeeId) {
        apiPath += "&ExcludeEmployeeId=" + excludeEmployeeId;
    }
    
    CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (response) {
        if (response && response.Success && response.Result) {
            var $ddlBackup = $('#ddlImmediateBackup');
            var $ddlSuccessor = $('#ddlSuccessorName');
            
            $ddlBackup.empty();
            $ddlSuccessor.empty();
            
            $ddlBackup.append($('<option></option>').val('').text('--Select Employee--'));
            $ddlSuccessor.append($('<option></option>').val('').text('--Select Employee--'));
            
            $.each(response.Result, function (index, item) {
                var optionText = item.DisplayText || (item.EmployeeName + ' (' + item.EmployeeCode + ')');
                $ddlBackup.append($('<option></option>').val(item.EmployeeId).text(optionText));
                $ddlSuccessor.append($('<option></option>').val(item.EmployeeId).text(optionText));
            });
            
            // Initialize Select2 for searchable dropdowns after populating
            setTimeout(function() {
                initializeSearchableDropdowns();
            }, 50);
        }
        
        // Call callback if provided
        if (callback && typeof callback === 'function') {
            callback();
        }
    }).fail(function() {
        console.error('Error loading employees in span');
        
        // Call callback even on error so the modal can still be shown
        if (callback && typeof callback === 'function') {
            callback();
        }
    });
}

/**
 * Initialize Select2 for Immediate Backup and Successor Name dropdowns
 */
function initializeSearchableDropdowns() {
    var $modal = $('#criticalityDetailsModal');
    var $ddlBackup = $modal.find('#ddlImmediateBackup');
    var $ddlSuccessor = $modal.find('#ddlSuccessorName');
    
    // Check if Select2 is available - retry if not loaded yet
    if (typeof $.fn.select2 === 'undefined') {
        console.warn('Select2 is not available yet, retrying in 100ms...');
        setTimeout(function() {
            initializeSearchableDropdowns();
        }, 100);
        return;
    }
    
    // Check if dropdowns exist (inside modal)
    if ($ddlBackup.length === 0 || $ddlSuccessor.length === 0) {
        console.warn('Dropdown elements not found for Select2 initialization');
        return;
    }
    
    // Initialize Select2 for Immediate Backup
    try {
        // Destroy only if Select2 is actually initialized (avoids "not using Select2" error)
        if ($ddlBackup.data('select2')) {
            try {
                $ddlBackup.select2('destroy');
            } catch (e) {
                $ddlBackup.removeClass('select2-hidden-accessible');
            }
        }
        
        var backupOptions = {
            placeholder: '--Select Employee--',
            allowClear: true,
            width: '100%',
            dropdownParent: $modal.length > 0 ? $modal : $('body')
        };
        
        // Initialize Select2
        $ddlBackup.select2(backupOptions);
        
        // Ensure Select2 container is properly positioned and opens at bottom
        $ddlBackup.off('select2:open').on('select2:open', function() {
            setTimeout(function() {
                var $select2Container = $ddlBackup.next('.select2-container');
                if ($select2Container.length) {
                    $select2Container.css('z-index', '9999');
                    // Force dropdown to open at bottom
                    var $dropdown = $select2Container.find('.select2-dropdown');
                    if ($dropdown.length) {
                        // Remove any inline styles that might position it upward
                        $dropdown.attr('style', function(i, style) {
                            return (style || '').replace(/top\s*:\s*[^;]+;?/gi, '').replace(/transform\s*:\s*[^;]+;?/gi, '');
                        });
                        // Force position to be below the select
                        $dropdown.css({
                            'top': '100%',
                            'bottom': 'auto',
                            'margin-top': '0',
                            'transform': 'none'
                        });
                    }
                }
            }, 10);
        });
        
        console.log('Select2 initialized for Immediate Backup');
    } catch (e) {
        console.error('Error initializing Select2 for Immediate Backup:', e);
    }
    
    // Initialize Select2 for Successor Name
    try {
        // Destroy only if Select2 is actually initialized (avoids "not using Select2" error)
        if ($ddlSuccessor.data('select2')) {
            try {
                $ddlSuccessor.select2('destroy');
            } catch (e) {
                $ddlSuccessor.removeClass('select2-hidden-accessible');
            }
        }
        
        var successorOptions = {
            placeholder: '--Select Employee--',
            allowClear: true,
            width: '100%',
            dropdownParent: $modal.length > 0 ? $modal : $('body')
        };
        
        // Initialize Select2
        $ddlSuccessor.select2(successorOptions);
        
        // Ensure Select2 container is properly positioned and opens at bottom
        $ddlSuccessor.off('select2:open').on('select2:open', function() {
            setTimeout(function() {
                var $select2Container = $ddlSuccessor.next('.select2-container');
                if ($select2Container.length) {
                    $select2Container.css('z-index', '9999');
                    // Force dropdown to open at bottom
                    var $dropdown = $select2Container.find('.select2-dropdown');
                    if ($dropdown.length) {
                        // Remove any inline styles that might position it upward
                        $dropdown.attr('style', function(i, style) {
                            return (style || '').replace(/top\s*:\s*[^;]+;?/gi, '').replace(/transform\s*:\s*[^;]+;?/gi, '');
                        });
                        // Force position to be below the select
                        $dropdown.css({
                            'top': '100%',
                            'bottom': 'auto',
                            'margin-top': '0',
                            'transform': 'none'
                        });
                    }
                }
            }, 10);
        });
        
        console.log('Select2 initialized for Successor Name');
    } catch (e) {
        console.error('Error initializing Select2 for Successor Name:', e);
    }
}

/**
 * Load span validation information and display limit info
 * @param {number} employeeId - Manager Employee ID
 * @param {number} appraisalCycleId - Appraisal Cycle ID
 * @param {string} roleId - Role ID (1=Inputter, 2=Reviewer, 3=Approver)
 * @param {number} currentEmployeeId - Current employee being marked (to check if already marked)
 * @param {function} callback - Callback function to call when loading is complete
 */
function loadSpanValidationInfo(employeeId, appraisalCycleId, roleId, currentEmployeeId, callback) {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating/ValidateCriticalityMarkingLimit?EmployeeId=" + employeeId + "&AppraisalCycleId=" + appraisalCycleId;
    if (roleId) {
        apiPath += "&RoleId=" + roleId;
    }
    
    CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (response) {
        if (response && response.Success && response.Result) {
            var data = response.Result;
            var spanCount = data.SpanCount || 0;
            var maxAllowed = data.MaxAllowed || 1;
            var currentCount = data.CurrentCount || 0;
            var isValid = data.IsValid !== false;
            
            // Store validation info for later use
            $('#criticalityDetailsModal').data('spanValidation', {
                spanCount: spanCount,
                maxAllowed: maxAllowed,
                currentCount: currentCount,
                isValid: isValid,
                errorMessage: data.ErrorMessage || ''
            });
            // Check if current employee already has criticality marked
            // This is determined by checking if originalValue exists (set when loading existing data)
            var existingPriority = $('#criticalityDetailsModal').find('#ddlCriticalityPriority').data('originalValue') || '';
            var isExistingMarking = (existingPriority != '' && existingPriority != null);
            
            if (!isValid && !isExistingMarking) {
                // Limit reached and this is a NEW marking - disable both dropdowns together
                disableCriticalityDropdowns();
                // Disable Save button - cannot save when limit is reached for new marking
                $('#btnSaveCriticalityDetails').prop('disabled', true).addClass('disabled');
                // Show toastr message ONLY for new marking (not for already marked employees)
                //toastr.warning('Maximum number of employees are already marked as critical.', '', {
                //    timeOut: 10000,
                //    positionClass: 'toast-top-center'
                //});
            } else if (!isValid && isExistingMarking) {
                // Limit reached but this is an existing marking - enable dropdowns (can update)
                enableCriticalityDropdowns();
                // Do NOT show warning for already marked employees
            } else {
                // Limit not reached - enable both dropdowns together
                enableCriticalityDropdowns();
            }
        }
        
        // Call callback if provided
        if (callback && typeof callback === 'function') {
            callback();
        }
    }).fail(function() {
        console.error('Error loading span validation info');
        
        // Call callback even on error so the modal can still be shown
        if (callback && typeof callback === 'function') {
            callback();
        }
    });
}

/**
 * Validate priority marking limit (P1: 5%, P2: 5%, P3: 15%) for Reviewer and Approver
 * @param {string} priorityId - Priority ID selected in dropdown
 */
function validatePriorityMarkingLimit(priorityId) {
    if (!priorityId || priorityId === '') {
        return;
    }
    
    // Get priority code mapping
    var priorityCodeMap = $('#criticalityDetailsModal').data('priorityCodeMap');
    if (!priorityCodeMap || !priorityCodeMap[priorityId]) {
        console.warn('Priority code mapping not found for ID:', priorityId);
        return;
    }
    
    var priorityCode = priorityCodeMap[priorityId]; // P1, P2, or P3
    var currentRole = $('#ddlRole').val();
    
    // Only validate for Reviewer (2) and Approver (3)
    if (currentRole != '2' && currentRole != '3') {
        return; // Inputter doesn't need priority-specific validation
    }
    
    // Determine percentage limit based on priority code
    var percentageLimit = 0;
    if (priorityCode === 'P1') {
        percentageLimit = 5;
    } else if (priorityCode === 'P2') {
        percentageLimit = 5;
    } else if (priorityCode === 'P3') {
        percentageLimit = 15;
    } else {
        // Unknown priority code, skip validation
        return;
    }
    
    var employeeId = sessionStorage.EmployeeId;
    var appraisalCycleId = $('#modalAppraisalCycleId').val();
    
    if (!employeeId || !appraisalCycleId || appraisalCycleId === '0') {
        return;
    }
    
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating/ValidatePriorityMarkingLimit?EmployeeId=" + employeeId 
        + "&AppraisalCycleId=" + appraisalCycleId 
        + "&PriorityCode=" + encodeURIComponent(priorityCode)
        + "&PercentageLimit=" + percentageLimit;
    
    if (currentRole) {
        apiPath += "&RoleId=" + currentRole;
    }
    
    CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (response) {
        if (response && response.Success && response.Result) {
            var data = response.Result;
            var isValid = data.IsValid !== false;
            var maxAllowed = data.MaxAllowed || 1;
            var currentCount = data.CurrentCount || 0;
            var spanCount = data.SpanCount || 0;
            var errorMessage = data.ErrorMessage || '';
            
            // Check if current employee already has criticality marked (scope to modal)
            var existingPriority = $('#criticalityDetailsModal').find('#ddlCriticalityPriority').data('originalValue') || '';
            var isExistingMarking = (existingPriority != '' && existingPriority != null);
            
            // Store priority validation info
            var priorityValidationKey = 'priorityValidation_' + priorityId;
            $('#criticalityDetailsModal').data(priorityValidationKey, {
                isValid: isValid,
                maxAllowed: maxAllowed,
                currentCount: currentCount,
                spanCount: spanCount,
                errorMessage: errorMessage,
                priorityCode: priorityCode,
                percentageLimit: percentageLimit
            });
            
            // Show warning if limit is reached and this is a new marking
            if (!isValid && !isExistingMarking) {
                toastr.warning(errorMessage || (priorityCode + ' marking limit reached. You can mark a maximum of ' + maxAllowed + ' employee(s) out of your span of ' + spanCount + ' employee(s) (' + percentageLimit + '% limit). Currently ' + currentCount + ' employee(s) are marked.'), '', {
                    timeOut: 10000,
                    positionClass: 'toast-top-right'
                });
            }
        }
    }).fail(function() {
        console.error('Error validating priority marking limit');
    });
}

/**
 * Disable P1/P2/P3 dropdown options when that bucket is full (Reviewer/Approver only).
 * Keeps the current selection and the employee's existing priority option enabled.
 */
function refreshCriticalityPriorityOptionAvailability($modal) {
    if (!$modal || !$modal.length) {
        $modal = $('#criticalityDetailsModal');
    }
    var currentRole = $('#ddlRole').val();
    if (currentRole != '2' && currentRole != '3') {
        $modal.find('#ddlCriticalityPriority option').prop('disabled', false);
        return;
    }

    var priorityCodeMap = $modal.data('priorityCodeMap');
    if (!priorityCodeMap) {
        return;
    }

    var employeeId = sessionStorage.EmployeeId;
    var appraisalCycleId = $('#modalAppraisalCycleId').val();
    if (!employeeId || !appraisalCycleId || appraisalCycleId === '0') {
        return;
    }

    var $sel = $modal.find('#ddlCriticalityPriority');
    var originalVal = ($sel.data('originalValue') || '').toString();
    var currentVal = ($sel.val() || '').toString();
    var svrPath = CONFIG.get('SERVERNAME');

    function fetchLimit(priorityCode, pct) {
        return $.ajax({
            url: svrPath + 'Rating/ValidatePriorityMarkingLimit?EmployeeId=' + encodeURIComponent(employeeId)
                + '&AppraisalCycleId=' + encodeURIComponent(appraisalCycleId)
                + '&PriorityCode=' + encodeURIComponent(priorityCode)
                + '&PercentageLimit=' + pct
                + '&RoleId=' + encodeURIComponent(currentRole),
            type: 'GET',
            headers: CommonGetHeaderInfo()
        });
    }

    $.when(fetchLimit('P1', 5), fetchLimit('P2', 5), fetchLimit('P3', 15)).done(function (r1, r2, r3) {
        var results = { P1: null, P2: null, P3: null };
        var packets = [r1, r2, r3];
        var codes = ['P1', 'P2', 'P3'];
        for (var i = 0; i < 3; i++) {
            var response = packets[i] && packets[i][0];
            if (response && response.Success && response.Result) {
                results[codes[i]] = response.Result;
            }
        }
        currentVal = ($sel.val() || '').toString();
        $sel.find('option').each(function () {
            var $opt = $(this);
            var optVal = ($opt.val() || '').toString();
            if (!optVal) {
                $opt.prop('disabled', false);
                return;
            }
            var code = priorityCodeMap[optVal];
            if (code !== 'P1' && code !== 'P2' && code !== 'P3') {
                $opt.prop('disabled', false);
                return;
            }
            var vr = results[code];
            var allow = !vr || vr.IsValid !== false;
            if (!allow && (optVal === originalVal || optVal === currentVal)) {
                allow = true;
            }
            $opt.prop('disabled', !allow);
        });
    }).fail(function () {
        console.warn('Could not load priority marking limits for dropdown cap UI');
    });
}

/**
 * Enable both Criticality Priority and Criticality Reasons dropdowns together
 * This ensures they're always enabled/disabled in sync
 * Also enables/disables Attrition Risk, Immediate Backup, and Successor Name fields
 * based on whether a criticality priority is selected
 */
function enableCriticalityDropdowns() {
    var $modal = $('#criticalityDetailsModal');
    var $mPriority = $modal.find('#ddlCriticalityPriority');
    var $mReasons = $modal.find('#ddlCriticalityReasons');

    $mPriority.prop('disabled', false).removeClass('disabled').css({
        'background-color': '',
        'color': '',
        'opacity': '',
        'cursor': ''
    });
    
    $mReasons.prop('disabled', false).removeClass('disabled');
    if ($mReasons.data('multiselect')) {
        $mReasons.multiselect('enable');
        setTimeout(function() {
            var $btnGroup = $mReasons.next('.btn-group');
            var $multiselectButton = $btnGroup.find('button');
            if ($btnGroup.length > 0 && $multiselectButton.length > 0) {
                $multiselectButton.removeClass('disabled').css({
                    'opacity': '',
                    'cursor': '',
                    'background-color': '',
                    'color': '',
                    'pointer-events': ''
                });
                $btnGroup.css({
                    'opacity': '',
                    'pointer-events': ''
                });
            }
        }, 100);
    }
    
    toggleCriticalityDependentFields();
    
    $('#btnSaveCriticalityDetails').prop('disabled', false).removeClass('disabled');
}

/**
 * Disable both Criticality Priority and Criticality Reasons dropdowns together
 * This ensures they're always enabled/disabled in sync
 * Also disables Attrition Risk, Immediate Backup, and Successor Name fields
 */
function disableCriticalityDropdowns() {
    var $modal = $('#criticalityDetailsModal');
    var $mPriority = $modal.find('#ddlCriticalityPriority');
    var $mReasons = $modal.find('#ddlCriticalityReasons');

    $mPriority.prop('disabled', true).addClass('disabled').css({
        'background-color': '#e9ecef',
        'color': '#6c757d',
        'opacity': '1',
        'cursor': 'not-allowed'
    });
    
    $mReasons.prop('disabled', true).addClass('disabled');
    if ($mReasons.data('multiselect')) {
        $mReasons.multiselect('disable');
        setTimeout(function() {
            var $btnGroup = $mReasons.next('.btn-group');
            var $multiselectButton = $btnGroup.find('button');
            if ($btnGroup.length > 0 && $multiselectButton.length > 0) {
                $multiselectButton.addClass('disabled').css({
                    'opacity': '1',
                    'cursor': 'not-allowed',
                    'background-color': '#e9ecef',
                    'color': '#6c757d',
                    'pointer-events': 'none',
                    'border-color': '#ced4da'
                });
                $btnGroup.css({
                    'opacity': '1',
                    'pointer-events': 'none'
                });
            }
        }, 100);
    }
    
    disableCriticalityDependentFields();
}

/**
 * Toggle criticality dependent fields (Attrition Risk, Immediate Backup, Successor Name).
 * Keeps them enabled so user can fill all fields; validation can still require priority for save.
 */
function toggleCriticalityDependentFields() {
    enableCriticalityDependentFields();
}

/**
 * Enable criticality dependent fields (Attrition Risk, Immediate Backup, Successor Name)
 * Scoped to Criticality Details modal so we always target the modal's dropdowns
 */
function enableCriticalityDependentFields() {
    var $modal = $('#criticalityDetailsModal');
    var $mAttrition = $modal.find('#ddlAttritionRisk');
    var $ddlBackup = $modal.find('#ddlImmediateBackup');
    var $ddlSuccessor = $modal.find('#ddlSuccessorName');

    $mAttrition.prop('disabled', false).removeClass('disabled').css({
        'background-color': '',
        'color': '',
        'opacity': '',
        'cursor': ''
    });
    
    if ($ddlBackup.length > 0) {
        $ddlBackup.prop('disabled', false).removeClass('disabled');
        if ($ddlBackup.data('select2')) {
            try {
                $ddlBackup.select2('enable');
            } catch (e) {
                console.warn('Select2 enable failed on Immediate Backup:', e);
            }
        }
        var $backupContainer = $ddlBackup.next('.select2-container');
        if ($backupContainer.length > 0) {
            $backupContainer.removeClass('select2-container-disabled').css({ 'opacity': '', 'pointer-events': '' });
        }
    }
    
    if ($ddlSuccessor.length > 0) {
        $ddlSuccessor.prop('disabled', false).removeClass('disabled');
        if ($ddlSuccessor.data('select2')) {
            try {
                $ddlSuccessor.select2('enable');
            } catch (e) {
                console.warn('Select2 enable failed on Successor Name:', e);
            }
        }
        var $successorContainer = $ddlSuccessor.next('.select2-container');
        if ($successorContainer.length > 0) {
            $successorContainer.removeClass('select2-container-disabled').css({ 'opacity': '', 'pointer-events': '' });
        }
    }
}

/**
 * Disable criticality dependent fields (Attrition Risk, Immediate Backup, Successor Name)
 * Scoped to Criticality Details modal so we always target the modal's dropdowns
 */
function disableCriticalityDependentFields() {
    var $modal = $('#criticalityDetailsModal');
    var $mAttrition = $modal.find('#ddlAttritionRisk');
    var $ddlBackup = $modal.find('#ddlImmediateBackup');
    var $ddlSuccessor = $modal.find('#ddlSuccessorName');

    $mAttrition.prop('disabled', true).addClass('disabled').css({
        'background-color': '#e9ecef',
        'color': '#6c757d',
        'opacity': '1',
        'cursor': 'not-allowed'
    });
    
    if ($ddlBackup.length > 0) {
        $ddlBackup.prop('disabled', true).addClass('disabled');
        if ($ddlBackup.data('select2')) {
            try {
                $ddlBackup.select2('disable');
            } catch (e) {
                console.warn('Select2 disable failed on Immediate Backup:', e);
            }
        }
        var $backupContainer = $ddlBackup.next('.select2-container');
        if ($backupContainer.length > 0) {
            $backupContainer.addClass('select2-container-disabled').css({ 'opacity': '1', 'pointer-events': 'none' });
        }
    }
    
    if ($ddlSuccessor.length > 0) {
        $ddlSuccessor.prop('disabled', true).addClass('disabled');
        if ($ddlSuccessor.data('select2')) {
            try {
                $ddlSuccessor.select2('disable');
            } catch (e) {
                console.warn('Select2 disable failed on Successor Name:', e);
            }
        }
        var $successorContainer = $ddlSuccessor.next('.select2-container');
        if ($successorContainer.length > 0) {
            $successorContainer.addClass('select2-container-disabled').css({ 'opacity': '1', 'pointer-events': 'none' });
        }
    }
}

/**
 * Clear criticality form
 */
function clearCriticalityForm() {
    var $modal = $('#criticalityDetailsModal');
    var $mReasons = $modal.find('#ddlCriticalityReasons');
    var $mPriority = $modal.find('#ddlCriticalityPriority');
    var $mAttrition = $modal.find('#ddlAttritionRisk');

    $mReasons.val([]);
    if ($mReasons.data('multiselect')) {
        $mReasons.multiselect('refresh');
    }
    $mPriority.val('');
    $mPriority.data('originalValue', '');
    $mPriority.prop('disabled', false).removeClass('disabled');
    $mReasons.prop('disabled', false).removeClass('disabled');
    if ($mReasons.data('multiselect')) {
        $mReasons.multiselect('enable');
    }
    $mAttrition.val('');
    
    var $ddlBackup = $modal.find('#ddlImmediateBackup');
    var $ddlSuccessor = $modal.find('#ddlSuccessorName');
    
    // Destroy Select2 only if it is actually initialized (avoids "not using Select2" error)
    if ($ddlBackup.length > 0 && $ddlBackup.data('select2')) {
        try {
            $ddlBackup.select2('destroy');
        } catch (e) {
            console.warn('Error destroying Select2 on Immediate Backup:', e);
        }
    }
    if ($ddlSuccessor.length > 0 && $ddlSuccessor.data('select2')) {
        try {
            $ddlSuccessor.select2('destroy');
        } catch (e) {
            console.warn('Error destroying Select2 on Successor Name:', e);
        }
    }
    
    // Reset dropdowns to default state (only if they exist)
    if ($ddlBackup.length > 0) {
        $ddlBackup.empty().append($('<option></option>').val('').text('--Select Employee--'));
    }
    if ($ddlSuccessor.length > 0) {
        $ddlSuccessor.empty().append($('<option></option>').val('').text('--Select Employee--'));
    }
    
    // Disable dependent fields initially (will be enabled when priority is selected)
    disableCriticalityDependentFields();
    
    // Reset loader and content visibility
    $('#criticalityModalLoader').show();
    $('#criticalityModalContent').hide();
    $('#btnSaveCriticalityDetails').hide().prop('disabled', false).removeClass('disabled');
}

/**
 * Save criticality details
 */
function validateCriticalityFormForSave($modal) {
    // Read values directly from selected options for reliable multiselect behavior.
    var selectedReasons = $modal.find('#ddlCriticalityReasons option:selected').map(function() {
        return ($(this).val() || '').toString().trim();
    }).get().filter(function(v) { return v !== ''; });

    var priority = ($modal.find('#ddlCriticalityPriority').val() || '').toString().trim();
    var attritionRisk = ($modal.find('#ddlAttritionRisk').val() || '').toString().trim();
    var immediateBackup = ($modal.find('#ddlImmediateBackup').val() || '').toString().trim();
    var successorName = ($modal.find('#ddlSuccessorName').val() || '').toString().trim();

    if (selectedReasons.length > 2) {
        toastr.error('You can select maximum 2 criticality reasons.');
        $modal.find('#ddlCriticalityReasons').focus();
        return { isValid: false };
    }

    // Do not allow fully blank save (prevents silent no-op/bypass).
    if (selectedReasons.length === 0 && !priority) {
        toastr.error('Please select Criticality Reasons or Criticality Priority.');
        $modal.find('#ddlCriticalityReasons').focus();
        return { isValid: false };
    }

    // Existing rule: if either reasons or priority is provided, these become mandatory.
    if (!attritionRisk) {
        toastr.error('Please select Attrition Risk.');
        $modal.find('#ddlAttritionRisk').focus();
        return { isValid: false };
    }

    if (!immediateBackup) {
        toastr.error('Please select Immediate Backup Name.');
        var $backup = $modal.find('#ddlImmediateBackup');
        if ($backup.data('select2')) {
            try { $backup.select2('open'); } catch (e) { $backup.focus(); }
        } else {
            $backup.focus();
        }
        return { isValid: false };
    }

    if (!successorName) {
        toastr.error('Please select Successor Name.');
        var $successor = $modal.find('#ddlSuccessorName');
        if ($successor.data('select2')) {
            try { $successor.select2('open'); } catch (e) { $successor.focus(); }
        } else {
            $successor.focus();
        }
        return { isValid: false };
    }

    return {
        isValid: true,
        selectedReasons: selectedReasons,
        priority: priority
    };
}

function saveCriticalityDetails() {
    var currentRole = $('#ddlRole').val();
    // Allow Inputters (1), Reviewers (2), and Approvers (3)
    if (currentRole != '1' && currentRole != '2' && currentRole != '3') {
        toastr.warning('Only Inputters, Reviewers, and Approvers can save criticality details.');
        return;
    }
    
    // Basic validation checks
    var employeeId = $('#modalPEPEmployeeId').val();
    var appraisalCycleId = $('#modalAppraisalCycleId').val();
    
    if (!employeeId || employeeId == '0' || !appraisalCycleId || appraisalCycleId == '0') {
        toastr.error('Invalid employee or appraisal cycle information. Please refresh the page and try again.');
        return;
    }
    
    var $modal = $('#criticalityDetailsModal');
    var selectedReasons = $modal.find('#ddlCriticalityReasons').val();
    var priority = $modal.find('#ddlCriticalityPriority').val();

    // Shared save validation (also enforced again in proceedWithSave for safety).
    var validationResult = validateCriticalityFormForSave($modal);
    if (!validationResult.isValid) {
        return;
    }
    
    if (priority && priority != '' && (!selectedReasons || selectedReasons.length == 0)) {
        toastr.error('Please select at least one Criticality Reason when Criticality Priority is selected.');
        $modal.find('#ddlCriticalityReasons').focus();
        return;
    }
    
    if (selectedReasons && selectedReasons.length > 2) {
        toastr.error('You can select maximum 2 criticality reasons.');
        $modal.find('#ddlCriticalityReasons').focus();
        return;
    }
    debugger
    // Check if criticality marking is restricted (limit exhausted for new marking)
    var validation = $modal.data('spanValidation');
    var existingPriority = $modal.find('#ddlCriticalityPriority').data('originalValue') || '';
    // isNewMarking is true only if employee has NO existing criticality marking (existingPriority is empty)
    // If employee already has criticality marked, even if they change priority, it's still an update, not a new marking
    var isNewMarking = (existingPriority == '' || existingPriority == null);
    
    // Check if user is trying to mark as critical (priority is selected)
    if (priority && priority != '') {
        if (validation) {
            // Check if limit is reached and this is a new marking
            if (isNewMarking && !validation.isValid) {
                // Prevent save entirely - show error and return
                toastr.error('Maximum number of employees are already marked as critical. Cannot save criticality details for this employee.', '', {
                    timeOut: 10000,
                    positionClass: 'toast-top-center'
                });
                return; // Stop save operation
            }
        } else {
            // If validation data is not available, re-check synchronously
            var appraisalCycleId = $('#modalAppraisalCycleId').val();
            var currentRole = $('#ddlRole').val();
            var userId = sessionStorage.EmployeeId;
            
            var svrPath = CONFIG.get('SERVERNAME');
            var apiPath = svrPath + "Rating/ValidateCriticalityMarkingLimit?EmployeeId=" + userId + "&AppraisalCycleId=" + appraisalCycleId;
            if (currentRole) {
                apiPath += "&RoleId=" + currentRole;
            }
            
            var validationResult = null;
            $.ajax({
                url: apiPath,
                type: 'GET',
                async: false, // Synchronous check
                headers: CommonGetHeaderInfo(),
                success: function (response) {
                    if (response && response.Success && response.Result) {
                        validationResult = response.Result;
                    }
                },
                error: function() {
                    // On error, allow save to proceed (don't block)
                    console.warn('Error validating criticality marking limit. Proceeding with save.');
                }
            });
            debugger
            if (validationResult) {
                var existingPriorityCheck = $modal.find('#ddlCriticalityPriority').data('originalValue') || '';
                // isNewMarkingCheck is true only if employee has NO existing criticality marking
                var isNewMarkingCheck = (existingPriorityCheck == '' || existingPriorityCheck == null);
                
                if (isNewMarkingCheck && !validationResult.IsValid) {
                    // Prevent save entirely - show error and return
                    toastr.error('Maximum number of employees are already marked as critical. Cannot save criticality details for this employee.', '', {
                        timeOut: 10000,
                        positionClass: 'toast-top-center'
                    });
                    return; // Stop save operation
                }
            }
        }
        
        // Validate P1/P2/P3 limits for Reviewer (2) and Approver (3) only
        var currentRole = $('#ddlRole').val();
        if (priority && priority != '' && (currentRole == '2' || currentRole == '3')) {
            // Get priority code mapping
            var priorityCodeMap = $('#criticalityDetailsModal').data('priorityCodeMap');
            if (priorityCodeMap && priorityCodeMap[priority]) {
                var priorityCode = priorityCodeMap[priority]; // P1, P2, or P3
                var priorityValidationKey = 'priorityValidation_' + priority;
                var priorityValidation = $('#criticalityDetailsModal').data(priorityValidationKey);
                
                // If validation data exists, check it
                if (priorityValidation) {
                    var existingPriorityCheck = $modal.find('#ddlCriticalityPriority').data('originalValue') || '';
                    var isNewMarkingCheck = (existingPriorityCheck == '' || existingPriorityCheck == null);
                    
                    // Also check if priority is being changed
                    if (!isNewMarkingCheck && existingPriorityCheck != priority) {
                        // Priority is being changed - treat as new marking for the new priority
                        isNewMarkingCheck = true;
                    }
                    
                    if (!priorityValidation.isValid && isNewMarkingCheck) {
                        // Prevent save - show error and return
                        toastr.error(priorityValidation.errorMessage || (priorityCode + ' marking limit reached. Cannot save criticality details for this employee.'), '', {
                            timeOut: 10000,
                            positionClass: 'toast-top-right'
                        });
                        return; // Stop save operation
                    }
                } else {
                    // Validation data not available, check synchronously
                    var appraisalCycleIdCheck = $('#modalAppraisalCycleId').val();
                    var userIdCheck = sessionStorage.EmployeeId;
                    
                    if (appraisalCycleIdCheck && userIdCheck) {
                        var percentageLimitCheck = 0;
                        if (priorityCode === 'P1') {
                            percentageLimitCheck = 5;
                        } else if (priorityCode === 'P2') {
                            percentageLimitCheck = 5;
                        } else if (priorityCode === 'P3') {
                            percentageLimitCheck = 15;
                        }
                        
                        if (percentageLimitCheck > 0) {
                            var svrPathCheck = CONFIG.get('SERVERNAME');
                            var apiPathCheck = svrPathCheck + "Rating/ValidatePriorityMarkingLimit?EmployeeId=" + userIdCheck 
                                + "&AppraisalCycleId=" + appraisalCycleIdCheck 
                                + "&PriorityCode=" + encodeURIComponent(priorityCode)
                                + "&PercentageLimit=" + percentageLimitCheck;
                            
                            if (currentRole) {
                                apiPathCheck += "&RoleId=" + currentRole;
                            }
                            
                            var validationResultCheck = null;
                            $.ajax({
                                url: apiPathCheck,
                                type: 'GET',
                                async: false, // Synchronous check
                                headers: CommonGetHeaderInfo(),
                                success: function (response) {
                                    if (response && response.Success && response.Result) {
                                        validationResultCheck = response.Result;
                                    }
                                },
                                error: function() {
                                    console.warn('Error validating priority marking limit. Proceeding with save.');
                                }
                            });
                            
                            if (validationResultCheck) {
                                var existingPrioritySyncCheck = $modal.find('#ddlCriticalityPriority').data('originalValue') || '';
                                var isNewMarkingSyncCheck = (existingPrioritySyncCheck == '' || existingPrioritySyncCheck == null);
                                
                                // Also check if priority is being changed
                                if (!isNewMarkingSyncCheck && existingPrioritySyncCheck != priority) {
                                    isNewMarkingSyncCheck = true;
                                }
                                
                                if (!validationResultCheck.IsValid && isNewMarkingSyncCheck) {
                                    // Prevent save - show error and return
                                    toastr.error(validationResultCheck.ErrorMessage || (priorityCode + ' marking limit reached. Cannot save criticality details for this employee.'), '', {
                                        timeOut: 10000,
                                        positionClass: 'toast-top-right'
                                    });
                                    return; // Stop save operation
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    // If reasons are selected but no priority, show modal confirmation
    if (selectedReasons && selectedReasons.length > 0 && (!priority || priority == '')) {
        // Show confirmation modal - both modals will be visible (confirmation modal has higher z-index)
        $('#criticalityConfirmModal').modal('show');
        return; // Don't proceed until user confirms
    }
    
    // If we reach here, proceed with save directly
    proceedWithSave();
}

/**
 * Proceed with saving criticality details (called after validation and confirmation)
 */
function proceedWithSave() {
    var employeeId = $('#modalPEPEmployeeId').val();
    var appraisalCycleId = $('#modalAppraisalCycleId').val();
    var currentRole = $('#ddlRole').val();
    
    // Get selected employee names for backup and successor
    var immediateBackupValue = $('#ddlImmediateBackup').val();
    var immediateBackupText = immediateBackupValue ? $('#ddlImmediateBackup option:selected').text() : null;
    
    var successorValue = $('#ddlSuccessorName').val();
    var successorText = successorValue ? $('#ddlSuccessorName option:selected').text() : null;
    
    // Get form values from modal dropdowns (scope to modal - page has duplicate id for priority)
    var $modal = $('#criticalityDetailsModal');

    // Defensive validation for alternate save paths (e.g., confirmation flow).
    var validationResult = validateCriticalityFormForSave($modal);
    if (!validationResult.isValid) {
        return;
    }

    var selectedReasons = $modal.find('#ddlCriticalityReasons').val(); // Array of IDs
    var priority = $modal.find('#ddlCriticalityPriority').val(); // Single ID
    var attritionRisk = $modal.find('#ddlAttritionRisk').val(); // Single ID
    
    // For ImmediateBackup and SuccessorName, save employee ID (not text)
    var immediateBackupId = immediateBackupValue || '';
    var successorId = successorValue || '';
    
    // Prepare data with ModifiedBy (RatingGivenBy) and RoleId
    var criticalityData = {
        PEPEmployeeId: parseInt(employeeId),
        AppraisalCycleId: parseInt(appraisalCycleId),
        CriticalityReasons: (selectedReasons && selectedReasons.length > 0 ? selectedReasons.join(',') : ''),
        CriticalityPriority: (priority || ''),
        AttritionRisk: attritionRisk || '',
        ImmediateBackup: immediateBackupId, // Save employee ID
        SuccessorName: successorId, // Save employee ID
        RatingGivenBy: parseInt(sessionStorage.EmployeeId) || 0,
        RoleId: parseInt(currentRole) || 0
    };
    
    // Show loading indicator
    $('#btnSaveCriticalityDetails').prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> Saving...');
    
    // Save via API
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating/SaveCriticalityDetails";
    
    $.ajax({
        url: apiPath,
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(criticalityData),
        headers: CommonGetHeaderInfo(),
        success: function (response) {
            $('#btnSaveCriticalityDetails').prop('disabled', false).html('Save');
            
            if (response && response.Success) {
                toastr.success('Criticality details saved successfully.');
                $('#criticalityDetailsModal').modal('hide');
                
                // CRITICAL: Preserve IsSubmitted value BEFORE reload
                // Criticality save should NOT affect IsSubmitted (ratings submission status)
                // The stored procedure checks EmployeeRatingNormailizationDetails_Log and may
                // return 1 (submitted) even when only criticality exists (no Rating field)
                var preservedIsSubmitted = IsSubmitted; // Store original value
                var currentEnableRoleId = EnableRoleId; // Preserve EnableRoleId value
                var currentRole = $('#ddlRole').val(); // Preserve current role
                
                // Store preserved value globally so IsLoginEmployeeSubmittedRating() can use it
                // This prevents the API from incorrectly setting IsSubmitted = 1 when only criticality exists
                window._preservedIsSubmitted = preservedIsSubmitted;
                
                // Reload the table to update the link text and status
                if (typeof BindReporteeRatings === 'function') {
                    BindReporteeRatings();
                } else if (typeof filterData === 'function') {
                    filterData();
                }
                
                // IMMEDIATELY restore IsSubmitted to prevent it from being recalculated incorrectly
                // Criticality-only records should NOT mark ratings as submitted
                IsSubmitted = preservedIsSubmitted;
                
                // Ensure btnratingSaveDraft remains visible after reload
                // Criticality save should NOT affect rating draft button visibility
                setTimeout(function() {
                    // Restore IsSubmitted again (in case it was changed during table initialization)
                    // This is critical because BindReporteeRatings() might trigger other functions
                    // that recalculate IsSubmitted based on log entries
                    IsSubmitted = preservedIsSubmitted;
                    
                    // Force button visibility based on preserved state
                    // Criticality save does not change IsSubmitted or EnableRoleId
                    if (preservedIsSubmitted == 0 && currentEnableRoleId == currentRole) {
                        $('#btnratingSaveDraft').show();
                    } else {
                        $('#btnratingSaveDraft').hide();
                    }
                }, 800); // Slightly increased to ensure all async operations complete
                
                // Clear the preserved flag after a delay to allow normal operation
                setTimeout(function() {
                    if (window._preservedIsSubmitted !== undefined) {
                        delete window._preservedIsSubmitted;
                    }
                }, 2000);
            } else {
                toastr.error(response.ErrorMessage || response.Message || 'Error saving criticality details.');
            }
        },
        error: function (xhr, status, error) {
            $('#btnSaveCriticalityDetails').prop('disabled', false).html('Save');
            console.error('Error saving criticality details:', error, xhr);
            var errorMsg = 'Error saving criticality details.';
            if (xhr.responseJSON) {
                if (xhr.responseJSON.ErrorMessage) {
                    errorMsg = xhr.responseJSON.ErrorMessage;
                } else if (xhr.responseJSON.Message) {
                    errorMsg = xhr.responseJSON.Message;
                } else if (xhr.responseJSON.error) {
                    errorMsg = xhr.responseJSON.error;
                }
            } else if (xhr.responseText) {
                try {
                    var errorResponse = JSON.parse(xhr.responseText);
                    if (errorResponse.ErrorMessage) {
                        errorMsg = errorResponse.ErrorMessage;
                    } else if (errorResponse.Message) {
                        errorMsg = errorResponse.Message;
                    }
                } catch (e) {
                    // If parsing fails, use default message
                }
            }
            toastr.error(errorMsg);
            
            // If it's a validation error (25% limit), refresh the validation info
            if (errorMsg.indexOf('limit') >= 0 || errorMsg.indexOf('25%') >= 0) {
                var appraisalCycleId = $('#modalAppraisalCycleId').val();
                var currentRole = $('#ddlRole').val();
                loadSpanValidationInfo(sessionStorage.EmployeeId, appraisalCycleId, currentRole, $('#modalPEPEmployeeId').val(), function() {});
            }
        }
    });
}

// Event handler for Save button
$(document).on('click', '#btnSaveCriticalityDetails', function() {
    saveCriticalityDetails();
});

/**
 * Remove criticality for a reportee (sp_RemoveCriticalityDetails via API).
 */
function removeCriticalityDetailsForEmployee(pepEmployeeId) {
    var currentRole = $('#ddlRole').val();
    if (currentRole != '1' && currentRole != '2' && currentRole != '3') {
        toastr.warning('Only Inputters, Reviewers, and Approvers can remove criticality details.');
        return;
    }
    if (EnableRoleId != $('#ddlRole').val()) {
        toastr.warning('You cannot modify criticality for this role.');
        return;
    }
    var appraisalCycleId = parseInt(getRatingPagesAppraisalCycleId(), 10) || 0;
    var loginId = parseInt(sessionStorage.EmployeeId, 10) || 0;
    if (!pepEmployeeId || !appraisalCycleId || !loginId) {
        toastr.error('Missing employee or appraisal cycle. Please refresh and try again.');
        return;
    }
    if (!confirm('Remove all criticality details for this employee?')) {
        return;
    }
    var payload = {
        PEPEmployeeId: parseInt(pepEmployeeId, 10),
        AppraisalCycleId: appraisalCycleId,
        RatingGivenBy: loginId,
        RoleId: parseInt(currentRole, 10) || 0
    };
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'Rating/RemoveCriticalityDetails';
    $.ajax({
        url: apiPath,
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(payload),
        headers: CommonGetHeaderInfo(),
        success: function (response) {
            if (response && response.Success) {
                toastr.success('Criticality details removed.');
                var preservedIsSubmitted = IsSubmitted;
                var currentEnableRoleId = EnableRoleId;
                var roleVal = $('#ddlRole').val();
                window._preservedIsSubmitted = preservedIsSubmitted;
                if (typeof BindReporteeRatings === 'function') {
                    BindReporteeRatings();
                } else if (typeof filterData === 'function') {
                    filterData();
                }
                IsSubmitted = preservedIsSubmitted;
                setTimeout(function () {
                    IsSubmitted = preservedIsSubmitted;
                    if (preservedIsSubmitted == 0 && currentEnableRoleId == roleVal) {
                        $('#btnratingSaveDraft').show();
                    } else {
                        $('#btnratingSaveDraft').hide();
                    }
                }, 800);
                setTimeout(function () {
                    if (window._preservedIsSubmitted !== undefined) {
                        delete window._preservedIsSubmitted;
                    }
                }, 2000);
            } else {
                toastr.error((response && (response.ErrorMessage || response.Message)) || 'Could not remove criticality details.');
            }
        },
        error: function (xhr) {
            var msg = 'Could not remove criticality details.';
            if (xhr.responseJSON && (xhr.responseJSON.ErrorMessage || xhr.responseJSON.Message)) {
                msg = xhr.responseJSON.ErrorMessage || xhr.responseJSON.Message;
            }
            toastr.error(msg);
        }
    });
}

$(document).on('click', '.criticality-remove-link', function (e) {
    e.preventDefault();
    var id = $(this).data('pepid');
    if (id) {
        removeCriticalityDetailsForEmployee(id);
    }
});

// Event handler for confirmation modal - Yes button
$(document).on('click', '#btnConfirmSaveCriticality', function() {
    $('#criticalityConfirmModal').data('confirmed', true);
    $('#criticalityConfirmModal').modal('hide');
    // Small delay to ensure modal is hidden, then proceed with save
    setTimeout(function() {
        proceedWithSave();
    }, 300);
});

// Event handler for confirmation modal - Cancel button (close modal and focus on priority field)
$(document).on('hidden.bs.modal', '#criticalityConfirmModal', function() {
    if (!$('#criticalityConfirmModal').data('confirmed')) {
        $('#criticalityDetailsModal').find('#ddlCriticalityPriority').focus();
    }
    $('#criticalityConfirmModal').removeData('confirmed');
});

// Clear form when modal is closed
$(document).on('hidden.bs.modal', '#criticalityDetailsModal', function() {
    clearCriticalityForm();
});
function updatePrioritisationTextVisibility() {

    var currentRole = $('#ddlRole').val();

    // P1/P2/P3 guidance applies only to Reviewer (2) and Approver (3)
    if (currentRole == '2' || currentRole == '3') {
        $('#prioritisationText').show();
    } else {
        $('#prioritisationText').hide();
    }
}



