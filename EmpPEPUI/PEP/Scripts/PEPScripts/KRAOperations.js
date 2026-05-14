/* About saving KRAs - Specifications and Assumptions - Subject to change
1. While saving the KRA, the user first inserts through the edit screen and then later edits and updates it.
2. Once the KRA is saved, its FlowStatus is 'Initialized'. It remains in this state till the KRA is submitted and approved.
3. Once Submitted and Approved the KRA cannot be modified.

KRAs can be submitted only when the following criteria is met:
1. One can set a maximum of 6 and Minimum of 4 Operational Goal.
2. Atleast one Developmental Goal.
3. Developmental Goal should have at least 5% Weightage.
4. Total weightage should be 100 to finalize the Goals.

In case of Manager change:
1. If the previous KRAs are approved, then the employee's current manager has the following choices: 
        a. Asking the employee to select a whole new set of KRAs.
        b. He can retain a few KRAs and adding a couple of new ones.
2. Regardless of the choice the total weightage of the KRA selected must amount to 100%.
*/

//const { debug } = require("node:console");
//console.debug("This is a debug message");

var KRAStatusMaster;
var statusFor = 'KRA';
var EmpId;
var subEmpId;
var AppraisalCycleId;
var DevSeqNo = 1;
var OpSeqNo = 1;
var StrategicSeqNo = 1;
var isSubmitted;
var PermissableInsert = 0;
var KRAACTION_SUBMIT = 8;
var KRAACTION_APPROVE = 9;
var KRAACTION_REJECT = 10;
var ROLE_SUPERADMIN = 5;
var ROLE_DUWISEHR = 7;
var LOCATION_ADMIN = 4;
var IsCopyKRA = 0;
var CycleEndDate = '';
var AppraisalCycle = '';
var ddlAppCycle = 0;

// Separator for multiple training requirements - using triple pipe to avoid conflicts with commas in training names
var TRAINING_SEPARATOR = '|||';

// Helper function to split training data using only ||| separator
function SplitTrainingData(data) {
    if (!data || typeof data !== 'string') return [];
    if (data.indexOf(TRAINING_SEPARATOR) !== -1) {
        return data.split(TRAINING_SEPARATOR).map(function(item) { return item.trim(); });
    }
    return [data.trim()];
}

// Helper function to check if data uses the ||| separator (multiple training entries)
function HasTrainingSeparator(data) {
    if (!data || typeof data !== 'string') return false;
    return data.indexOf(TRAINING_SEPARATOR) !== -1;
}

// Splits TrainingItemId or TrainingCategory (fields whose values never contain commas).
// Uses ||| first; falls back to comma for legacy data.
function SplitSafeField(data) {
    if (!data || typeof data !== 'string') return [];
    data = data.trim();
    if (data === '') return [];
    if (data.indexOf(TRAINING_SEPARATOR) !== -1) {
        return data.split(TRAINING_SEPARATOR).map(function(item) { return item.trim(); });
    }
    if (data.indexOf(',') !== -1) {
        return data.split(',').map(function(item) { return item.trim(); }).filter(function(item) { return item !== ''; });
    }
    return [data];
}

// Splits TrainingRequirementName: uses ||| first.
// For legacy comma-separated data, comma-split is used ONLY when the resulting
// count matches expectedCount (meaning no names contain commas).
function SplitTrainingNames(data, expectedCount) {
    if (!data || typeof data !== 'string') return [];
    data = data.trim();
    if (data === '') return [];
    if (data.indexOf(TRAINING_SEPARATOR) !== -1) {
        return data.split(TRAINING_SEPARATOR).map(function(item) { return item.trim(); });
    }
    if (expectedCount > 1 && data.indexOf(',') !== -1) {
        var parts = data.split(',').map(function(item) { return item.trim(); }).filter(function(item) { return item !== ''; });
        if (parts.length === expectedCount) {
            return parts;
        }
    }
    return [data];
}

// Overrides training fields on an API result with values from a DataTable row (which preserves ||| separators).
// The GetKRAById SP may convert ||| to commas; the list-API DataTable keeps the original format.
// tableSelectorOrList: single selector string, or array of selectors (team table is #tblTeamMemberKRAList under #tab_b / #tab_c).
function OverrideTrainingFieldsFromDataTable(empKRAData, tableSelectorOrList) {
    if (!empKRAData || empKRAData.KRAId == null) return;
    var selectors = Array.isArray(tableSelectorOrList) ? tableSelectorOrList : [tableSelectorOrList];
    var kraKey = String(empKRAData.KRAId);
    try {
        var $tbl = $();
        for (var si = 0; si < selectors.length; si++) {
            var $c = $(selectors[si]);
            if ($c.length && $.fn.DataTable.isDataTable($c)) {
                $tbl = $c;
                break;
            }
        }
        if (!$tbl.length) return;
        var dt = $tbl.DataTable();
        var found = false;
        dt.rows().every(function () {
            if (found) return;
            var d = this.data();
            if (!d) return;
            var rowKra = d.KRAId != null ? String(d.KRAId) : '';
            if (rowKra === kraKey) {
                var dtName = d.TrainingRequirementName || d['TrainingRequirementName'] || '';
                if (dtName.indexOf('|||') >= 0) {
                    empKRAData.TrainingItemId = d.TrainingItemId || d['TrainingItemId'] || empKRAData.TrainingItemId;
                    empKRAData.TrainingRequirementName = dtName;
                    empKRAData.TrainingCategory = d.TrainingCategory || d['TrainingCategory'] || empKRAData.TrainingCategory;
                }
                found = true;
            }
        });
    } catch (e) {
        console.warn('OverrideTrainingFieldsFromDataTable:', e.message);
    }
}

// Builds a consolidated training requirements table below a KRA DataTable.
// Collects training data from all Developmental goal rows and renders a summary table
// with the same columns as selectedTrainingList (Training Name, Training Type).
// @param {string} tableSelector - CSS selector for the KRA DataTable (e.g. '#tblKRAList')
// @param {Array} kraDataArray - The KRA data array used to populate the DataTable
function renderConsolidatedTrainingTable(tableSelector, kraDataArray) {
    var containerId = tableSelector.replace(/#/g, '').replace(/\s+/g, '_') + '_consolidatedTraining';
    // Remove any previously rendered container
    $('#' + containerId).remove();

    if (!kraDataArray || !Array.isArray(kraDataArray) || kraDataArray.length === 0) return;

    var trainingRows = [];
    var seen = {};

    $.each(kraDataArray, function (_, kra) {
        var goalType = (kra.GoalType || '').trim().toUpperCase();
        if (goalType !== 'D' && !goalType.startsWith('DEVELOPMENTAL')) return;

        var ids = [], names = [], categories = [];

        if (kra.TrainingRequirements && Array.isArray(kra.TrainingRequirements) && kra.TrainingRequirements.length > 0) {
            $.each(kra.TrainingRequirements, function (_, tr) {
                ids.push(tr.TrainingItemId || tr.Id || '0');
                names.push(tr.TrainingRequirementName || tr.Name || '');
                categories.push(tr.TrainingCategory || tr.Category || '');
            });
        } else {
            if (kra.TrainingRequirementName && kra.TrainingRequirementName.trim() !== '') {
                ids = SplitSafeField(kra.TrainingItemId ? String(kra.TrainingItemId) : '0');
                categories = kra.TrainingCategory ? SplitSafeField(kra.TrainingCategory) : [];
                var expectedCount = Math.max(ids.length, categories.length);
                names = SplitTrainingNames(kra.TrainingRequirementName, expectedCount);
            }
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

            // Only dedup items with a real ID (> 0); custom/Others (id=0) always show
            if (parseInt(id) > 0) {
                var key = id + '|' + name;
                if (seen[key]) continue;
                seen[key] = true;
            }

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

    if (trainingRows.length === 0) return;

    var html = '<div id="' + containerId + '" class="consolidated-training-section" style="margin-top: 12px; margin-bottom: 10px;">';
    html += '<h5 style="margin-bottom: 8px; font-weight: 600; color: #333;"><i class="glyphicon glyphicon-education" style="margin-right: 5px;"></i>Consolidated Training Requirements</h5>';
    html += '<table class="table table-bordered table-striped table-hover" style="width: 100%; margin-bottom: 0;">';
    html += '<thead><tr>';
    html += '<th style="width: 10%; text-align: center;">Sr No.</th>';
    html += '<th style="width: 55%; text-align: center;">Training Name</th>';
    html += '<th style="width: 35%; text-align: center;">Training Type</th>';
    html += '</tr></thead><tbody>';

    $.each(trainingRows, function (idx, row) {
        html += '<tr>';
        html += '<td style="text-align: center;">' + (idx + 1) + '</td>';
        html += '<td style="text-align: center; padding: 8px;">' + escapeHtml(row.name) + '</td>';
        html += '<td style="text-align: center;">' + escapeHtml(row.type) + '</td>';
        html += '</tr>';
    });

    html += '</tbody></table></div>';

    // Insert after the DataTable wrapper (or after the table if no wrapper)
    var $table = $(tableSelector);
    var $wrapper = $table.closest('.dataTables_wrapper');
    if ($wrapper.length > 0) {
        $wrapper.after(html);
    } else {
        $table.after(html);
    }
}

if (sessionStorage.EmployeeRoleId == ROLE_SUPERADMIN || sessionStorage.EmployeeRoleId == ROLE_DUWISEHR) {
    $('#KRATab_C').show();
    $('#KRATab_D').show();
    $('#KRATab_E').show();
}
else if (sessionStorage.EmployeeRoleId == LOCATION_ADMIN) {  // added by kaushal saini
    $('#KRATab_C').show();
    $('#KRATab_D').hide();
    $('#KRATab_E').hide();
}
else {
    $('#KRATab_C').hide();
    $('#KRATab_D').hide();
    $('#KRATab_E').hide();
}

if (sessionStorage.EmployeeRoleId == 1) {
    $('#KRATab_B').hide();
}
else {
    $('#KRATab_B').show();
}

// Helper function to create loader with fail-safe timeout - must be defined before document.ready
function CreateLoaderWithFailSafe(message, timeoutMs) {
    timeoutMs = timeoutMs || 30000; // Default 30 seconds
    message = message || 'Loading...';

    var loaderId = 'loader_' + Date.now();
    var $loader = $('<div id="' + loaderId + '" class="kra-loader" style="position: fixed; top: 60px; left: 53px; right: 0; bottom: 0; background: rgba(255,255,255,0.72); -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px); z-index: 2000; display: flex; align-items: center; justify-content: center;"><div style="text-align: center; padding: 24px 32px; background: #fff; border-radius: 8px; box-shadow: 0 4px 24px rgba(0,0,0,.12); min-width: 200px;"><span style="display: inline-block; width: 40px; height: 40px; border: 3px solid #e8e8e8; border-top-color: #337ab7; border-radius: 50%; animation: mf-spin 0.75s linear infinite; margin-bottom: 12px;"></span><span style="display: block; font-size: 14px; color: #555; font-weight: 500;">' + message + '</span></div></div>');
    $('body').append($loader);

    // Fail-safe timeout
    var timeoutId = setTimeout(function () {
        var $existingLoader = $('#' + loaderId);
        if ($existingLoader.length > 0) {
            $existingLoader.remove();
            AlertMessage('#divValidationAlert', 'The operation is taking longer than expected. Please try again later.', 'D');
        }
    }, timeoutMs);

    // Store timeout ID in loader for cleanup
    $loader.data('timeoutId', timeoutId);

    return {
        remove: function () {
            clearTimeout(timeoutId);
            $('#' + loaderId).remove();
        },
        element: $loader
    };
}

$(document).ready(function () {
    // Show page loader while initializing
    var pageLoader = CreateLoaderWithFailSafe('Loading Goals & Objectives page...', 30000);

    // Setup file attachment handler for modal (centralized)
    SetupFileAttachmentHandler();

    // Only add event listener if fileAttachment element exists (for backward compatibility)
    var fileAttachmentElement = document.getElementById('fileAttachment');
    if (fileAttachmentElement) {
        fileAttachmentElement.addEventListener('change', function (e) {
            const file = e.target.files[0]; // Get only the first file since we removed 'multiple'
            const attachmentFilename = document.querySelector('.attachment-filename');

            if (file) {
                // Display the file name, truncate if too long
                let fileName = file.name;
                if (fileName.length > 20) {
                    fileName = fileName.substring(0, 17) + '...';
                }
                if (attachmentFilename) {
                    attachmentFilename.textContent = fileName;
                    attachmentFilename.title = file.name; // Show full name on hover
                }

                // Optional: Add file size validation
                const maxSize = 5 * 1024 * 1024; // 5MB limit
                if (file.size > maxSize) {
                    alert('File size must be less than 5MB');
                    e.target.value = ''; // Clear the input
                    if (attachmentFilename) {
                        attachmentFilename.textContent = 'No file selected';
                        attachmentFilename.title = '';
                    }
                    return;
                }

                // You can add additional logic here to handle the uploaded file
                console.log('Selected file:', file.name, 'Size:', file.size, 'Type:', file.type);
            } else {
                if (attachmentFilename) {
                    attachmentFilename.textContent = 'No file selected';
                    attachmentFilename.title = '';
                }
            }
        });
    }

    // Initialize ddlMyTeamList_KRA with default value
    $("#ddlMyTeamList_KRA").empty();
    $("#ddlMyTeamList_KRA").append($("<option>").val(0).text('Select a Team Member'));

    ddlAppCycle = ddlAppCycleId;
    //if ($('#tblTeamMemberKRAList >tbody >tr').length < 6 && $('#tblTeamMemberKRAList >tbody >tr').length >0) {
    //    $("#tblTeamKRAEdit").show();
    //}

    //else {
    //    $("#tblTeamKRAEdit").hide();
    //}

    GetAllActiveAppraisalCycle();
    fnBindMyAnnualrating();
    GetSelfAssesmentCycle();
    $("#tblTeamKRAEdit").hide();
    $("#tab_c #tblTeamKRAEdit").hide();
    
    // Ensure training details section is hidden on page load (no team member selected initially)
    $('#trainingDetailsSectionTeam').hide();
    $('#tab_b #trainingDetailsSectionTeam').hide();
    $('#tab_c #trainingDetailsSectionTeam').hide();
    
    if (sessionStorage.EmployeeType == 'C') {
        // $('#tab_a').hide();
        $("#KRATab_A").hide();
        $("#KRATab_B").addClass('active');
        $("#tab_b").addClass('active');
        $("#tab_a").removeClass('active');


    }


    $("#KRAUpdatebtn").show();

    // Hide page loader after initialization
    setTimeout(function () {
        pageLoader.remove();
    }, 1000);

})



/**
 * When #AppCycle changes, clear Team Goals & Objectives (tab_b) / All Employee (tab_c) state so
 * status, team member list, search selection, and grids cannot show the previous appraisal cycle.
 * Must run before #ddlSelfAssCycle trigger('change') so self-assessment change does not reload a stale team member.
 */
function resetTeamAndAllEmployeeKraUiForAppraisalCycleChange() {
    window.teamMemberGoalsAllApproved = false;
    ['#tab_b #tblTeamMemberKRAList', '#tab_c #tblTeamMemberKRAList', '#tblTeamMemberKRAList'].forEach(function (sel) {
        var $t = $(sel);
        if ($t.length && $.fn.DataTable.isDataTable($t)) {
            try {
                $t.DataTable().clear().destroy();
            } catch (e) {
                try {
                    $t.DataTable().destroy();
                } catch (e2) { /* ignore */ }
            }
        }
    });
    $('.kra-grid-loader-container').remove();

    $('#tblTeamMemberKRAList').hide();
    $('#tblTeamMemberKRAListFooter').hide();
    $('#tab_b #tblTeamMemberKRAList').hide();
    $('#tab_b #tblTeamMemberKRAListFooter').hide();
    $('#tab_c #tblTeamMemberKRAList').hide();
    $('#tab_c #tblTeamMemberKRAListFooter').hide();
    $('#tblTeamMemberKRAList_consolidatedTraining').hide();
    $('#tab_b .consolidated-training-section').hide();
    $('#tab_c .consolidated-training-section').hide();
    $('#trainingDetailsSectionTeam').hide();
    $('#tab_b #trainingDetailsSectionTeam').hide();
    $('#tab_c #trainingDetailsSectionTeam').hide();
    $('#btnDownloadAllAttachmentsTeam').hide();
    $('#tab_b #btnDownloadAllAttachmentsTeam').hide();
    $('#tab_c #btnDownloadAllAttachmentsTeam').hide();
    $('[id="btnAddNewGoalTeam"]').hide();
    $('#btnApproveKRA').hide();
    $('#btnRejectKRA').hide();
    $('#tab_b #btnApproveKRA').hide();
    $('#tab_b #btnRejectKRA').hide();
    $('#tab_c #btnApproveKRA').hide();
    $('#tab_c #btnRejectKRA').hide();

    var st = GetStatus();
    if (st && st.length) {
        KRAStatusMaster = st;
    }
    if (typeof KRAStatusMaster !== 'undefined' && KRAStatusMaster && KRAStatusMaster.length) {
        loadKRAStatus();
    }
    $('#ddlKRAStatusForTeam').val(0);

    $('#ddlMyTeamList_KRA').empty();
    $('#ddlMyTeamList_KRA').append($('<option>').val(0).text('Select a Team Member'));

    $('#searchEmpKRA').val('');
    $('#hdnsearchEmpKRA').val('');

    $('#tab_b #divValidationAlert_Team,#tab_c #divValidationAlert_Team').hide();
    $('#divValidationAlert_Team').hide();

    UpdateApproveRejectButtonVisibility();
}

function OnAppraisalCycleChange() {
    
    // Remove any existing loaders first to prevent duplicates
    $('.appcycle-loader-overlay').remove();

    // Create overlay loader that covers the content area
    var $loaderOverlay = $('<div class="appcycle-loader-overlay" style="position: fixed; top: 60px; left: 53px; right: 0; bottom: 0; background: rgba(255,255,255,0.72); -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px); z-index: 2000; display: flex; align-items: center; justify-content: center;"><div style="text-align: center; padding: 24px 32px; background: #fff; border-radius: 8px; box-shadow: 0 4px 24px rgba(0,0,0,.12); min-width: 200px;"><span style="display: inline-block; width: 40px; height: 40px; border: 3px solid #e8e8e8; border-top-color: #337ab7; border-radius: 50%; animation: mf-spin 0.75s linear infinite; margin-bottom: 12px;"></span><span style="display: block; font-size: 14px; color: #555; font-weight: 500;">Loading data...</span></div></div>');
    
    // Add loader overlay to body
    $('body').append($loaderOverlay);

    // Fail-safe timeout for loader
    var loaderTimeout = setTimeout(function () {
        $('.appcycle-loader-overlay').remove();
    }, 30000);

    var SelectedEmpID = sessionStorage.getItem('EmployeeId');
    var SelectedEmployeeName = sessionStorage.getItem('EmployeeRoleName');
    var selectedAppCycleId = $('#AppCycle :selected').val();

    // Get Self Assessment Cycle using async AJAX
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'AppraisalCycle/GetSelfAssesmentCycle?AppCycleId=' + selectedAppCycleId;

    $.ajax({
        url: apiPath,
        type: 'GET',
        async: true,
        dataType: 'json',
        headers: CommonGetHeaderInfo(),
        beforeSend: function () {
            // Loader already shown above
        },
        success: function (result) {
            // Populate Self Assessment Cycle dropdown
            $('#ddlSelfAssCycle').empty();
            var selectedCycleValue = null;
            if (result && result.Result && result.Result.data && result.Result.data.length > 0) {
                $.each(result.Result.data, function (index, data) {
                    $('#ddlSelfAssCycle').append($("<option>").val(data.YearBreakCheck).text(data.AppraisalCycleName));
                });

                // Select the first option if available and store the value
                if ($('#ddlSelfAssCycle option').length > 0) {
                    selectedCycleValue = $('#ddlSelfAssCycle option:first').val();
                    $('#ddlSelfAssCycle').val(selectedCycleValue);

                    resetTeamAndAllEmployeeKraUiForAppraisalCycleChange();

                    // IMPORTANT: Validate Goal Modification button RIGHT AFTER dropdown is bound
                    // Use a small delay to ensure DOM is updated
                    setTimeout(function () {
                        console.log('OnAppraisalCycleChange: Dropdown bound, validating Goal Modification button');
                        var currentCycle = $('#ddlSelfAssCycle').val();
                        if (currentCycle && currentCycle !== '' && currentCycle !== '0') {
                            console.log('OnAppraisalCycleChange: Calling ValidateAndShowGoalModificationButton after dropdown binding');
                            console.log('OnAppraisalCycleChange: Cycle value =', currentCycle, 'AppraisalCycleId =', selectedAppCycleId);
                            ValidateAndShowGoalModificationButton();
                        } else {
                            console.warn('OnAppraisalCycleChange: Cycle value not available after dropdown binding');
                            $('#btnRequestGoalModification').hide();
                        }
                    }, 150); // Increased delay slightly to ensure DOM is fully updated

                    // Trigger change event to ensure dropdown is fully initialized
                    // Note: This will also trigger OnSelfAssesmentCycleChange, but validation will be skipped if already in progress
                    $('#ddlSelfAssCycle').trigger('change');
                } else {
                    // No options in dropdown, hide button
                    resetTeamAndAllEmployeeKraUiForAppraisalCycleChange();
                    $('#btnRequestGoalModification').hide();
                }
            } else {
                // No data returned, hide button
                resetTeamAndAllEmployeeKraUiForAppraisalCycleChange();
                $('#btnRequestGoalModification').hide();
            }

            // Check if AppraisalCycle response is valid
            if (!AppraisalCycle || !AppraisalCycle.responseJSON || !AppraisalCycle.responseJSON.Result || !AppraisalCycle.responseJSON.Result.data) {
                console.error('Invalid AppraisalCycle response in OnAppraisalCycleChange');
                clearTimeout(loaderTimeout);
                $('.appcycle-loader-overlay').remove();
                return;
            }

            $.each(AppraisalCycle.responseJSON.Result.data, function (index, data) {
                var NavAppCycleId = '';
                if ($('#AppCycle :selected').val() != undefined) {
                    NavAppCycleId = $('#AppCycle :selected').val();
                }
                else {
                    NavAppCycleId = ddlAppCycle
                }

                $("#AppCycle").val(NavAppCycleId);

                if (data.AppraisalCycleId == $('#AppCycle :selected').val()) {
                    var enddate = formatDate_DMY(data.EndDate);
                    $('#txtKRAEndDate').val(enddate);
                }
            });

            // Validate if Add Goal button should be shown
            ValidateAndShowAddGoalButton();

            fnBindMyAnnualrating();

            // Show KRA data using async call
            ShowMyKRAAsync(SelectedEmpID, 'E', selectedAppCycleId, function () {
                // Remove loader after data loads
                clearTimeout(loaderTimeout);
                $('.appcycle-loader-overlay').remove();
            });
        },
        error: function (xhr, status, error) {
            console.error('Error loading Self Assessment Cycle:', error);
            clearTimeout(loaderTimeout);
            $('.appcycle-loader-overlay').remove();
            AlertMessage('#divValidationAlert', 'Error loading data. Please try again.', 'D');
        }
    });
}

function ValidateAndShowAddGoalButton() {
    var appraisalCycleId = $('#AppCycle :selected').val();
    if (!appraisalCycleId || appraisalCycleId === '' || appraisalCycleId === undefined) {
        $('#btnAddNewGoal').hide();
        return;
    }
    
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "EmployeeKRA/ValidateCanAddGoal?AppraisalCycleId=" + appraisalCycleId;
    
    var validationResult = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    if (validationResult.responseJSON && validationResult.responseJSON.Success) {
        var result = validationResult.responseJSON.Result;
        if (result.CanAddGoal) {
            $('#btnAddNewGoal').show();
        } else {
            $('#btnAddNewGoal').hide();
            // Optionally show a message to the user
            if (result.Message) {
                console.log('Add Goal button hidden: ' + result.Message);
            }
        }
    } else {
        // On error, hide the button for safety
        $('#btnAddNewGoal').hide();
    }
}

/**
 * After employee KRA grid binds: call ValidateCanAddGoal only when at least one goal is Initialized (1) or Rejected (18).
 * If every goal is Submitted/Approved/etc., keep Add Goal hidden without calling the API (avoids H1/H2 subcycle mismatch with usp_ValidateCanAddGoal).
 */
function ApplyAddGoalButtonVisibilityAfterGridLoad(kraDataArray, isSubmitted) {
    if (isSubmitted) {
        $('#btnAddNewGoal').hide();
        return;
    }
    if (!kraDataArray || kraDataArray.length === 0) {
        ValidateAndShowAddGoalButton();
        return;
    }
    var anyInitOrRejected = kraDataArray.some(function (r) {
        var sid = r.KRAStatusId != null && r.KRAStatusId !== undefined ? r.KRAStatusId : r.kraStatusId;
        var n = parseInt(sid, 10);
        return n === 1 || n === 18;
    });
    if (!anyInitOrRejected) {
        $('#btnAddNewGoal').hide();
        return;
    }
    ValidateAndShowAddGoalButton();
}

/**
 * Same aggregate as tab_a Add Goal (Issue 19): hide when all relevant rows are Submitted/Approved or submit+approved weights total 100.
 */
function computeIsSubmittedForAddGoalFromKraRows(kraDataArray) {
    if (!kraDataArray || !Array.isArray(kraDataArray) || kraDataArray.length === 0) {
        return false;
    }
    var com = false, isSubmitted = false;
    var approved_check = 0, submit_check = 0;
    $.each(kraDataArray, function (index, data) {
        var status_result = $.grep(KRAStatusMaster, function (e) { return e.StatusId == data.KRAStatusId; });
        var statusDesc = (status_result.length > 0 && status_result[0]) ? status_result[0].StatusDescription : '';
        if (statusDesc == strKRAStatusCompleted) {
            com = true;
            isSubmitted = false;
        }
        if (statusDesc == strKRAStatusApproved) {
            approved_check += parseFloat(data.Weightage || 0);
        }
        if (statusDesc == strKRAStatusSubmitted) {
            submit_check += parseFloat(data.Weightage || 0);
        }
        if (com !== true) {
            if (statusDesc == strKRAStatusSubmitted || statusDesc == strKRAStatusApproved) {
                isSubmitted = true;
            }
        }
    });
    if (approved_check + submit_check == 100) {
        isSubmitted = true;
    }
    return isSubmitted;
}

/** Team / All Employee tab: employee id for Add Goal validation (tab_b = dropdown, tab_c = search hidden + subEmpId). */
function getTeamKraTargetEmployeeIdForAddGoal() {
    var activeTabId = $('#mytabs .tab-pane.active').attr('id');
    if (activeTabId === 'tab_c') {
        var hid = $('#hdnsearchEmpKRA').val();
        if (hid && hid !== '' && hid !== '0') return String(hid);
        if (typeof subEmpId !== 'undefined' && subEmpId != null && subEmpId !== '' && String(subEmpId) !== '0') {
            return String(subEmpId);
        }
        return '';
    }
    var v = $('#ddlMyTeamList_KRA').val();
    return v != null ? String(v) : '';
}

/**
 * After team KRA grid binds: same rules as ApplyAddGoalButtonVisibilityAfterGridLoad, then EmployeeKRA/ValidateCanAddGoal with EmployeeId (manager path on API).
 */
function ApplyAddGoalButtonVisibilityAfterGridLoadTeam(kraDataArray, isSubmitted) {
    if (isSubmitted) {
        $('[id="btnAddNewGoalTeam"]').hide();
        return;
    }
    if (!kraDataArray || kraDataArray.length === 0) {
        ValidateAndShowAddGoalButtonTeam();
        return;
    }
    var anyInitOrRejected = kraDataArray.some(function (r) {
        var sid = r.KRAStatusId != null && r.KRAStatusId !== undefined ? r.KRAStatusId : r.kraStatusId;
        var n = parseInt(sid, 10);
        return n === 1 || n === 18;
    });
    if (!anyInitOrRejected) {
        $('[id="btnAddNewGoalTeam"]').hide();
        return;
    }
    ValidateAndShowAddGoalButtonTeam();
}

/// <summary>
/// Validate and show/hide Add Goal button for Team view (manager adding goals for team members)
/// Same server check as tab_a via ValidateCanAddGoal with EmployeeId (uses ValidateCanAddGoalForManager on API).
/// Add Goal is not shown when ddlKRAStatusForTeam is "Submitted" or "Approved" (only for Not Submitted).
/// </summary>
function ValidateAndShowAddGoalButtonTeam() {
    // Add Goal button is not required for Submitted or Approved filter - only for Not Submitted employees
    var statusText = $('#ddlKRAStatusForTeam').find(':selected').text().toLowerCase().trim();
    if (statusText === 'submitted' || statusText === 'approved') {
        $('[id="btnAddNewGoalTeam"]').hide();
        return;
    }
    if (typeof window.teamMemberGoalsAllApproved !== 'undefined' && window.teamMemberGoalsAllApproved === true) {
        $('[id="btnAddNewGoalTeam"]').hide();
        return;
    }
    var selectedEmployeeId = getTeamKraTargetEmployeeIdForAddGoal();
    if (!selectedEmployeeId || selectedEmployeeId === '' || selectedEmployeeId === '0') {
        $('[id="btnAddNewGoalTeam"]').hide();
        return;
    }

    var appraisalCycleId = $('#AppCycle :selected').val();
    if (!appraisalCycleId || appraisalCycleId === '' || appraisalCycleId === undefined) {
        $('[id="btnAddNewGoalTeam"]').hide();
        return;
    }

    var $activePane = $('#mytabs .tab-pane.active');
    var teamStatusText = ($activePane.length ? $activePane.find('#lblTeamKRAStatus').first().text() : $('#lblTeamKRAStatus').first().text() || '').toLowerCase().trim();
    if (teamStatusText === 'approved') {
        $('[id="btnAddNewGoalTeam"]').hide();
        return;
    }

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "EmployeeKRA/ValidateCanAddGoal?AppraisalCycleId=" + encodeURIComponent(appraisalCycleId) + "&EmployeeId=" + encodeURIComponent(selectedEmployeeId);

    var validationResult = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    if (validationResult.responseJSON && validationResult.responseJSON.Success) {
        var result = validationResult.responseJSON.Result;
        if (result.CanAddGoal) {
            $('[id="btnAddNewGoalTeam"]').show();
        } else {
            $('[id="btnAddNewGoalTeam"]').hide();
            if (result.Message) {
                console.log('Add Goal (team) hidden: ' + result.Message);
            }
        }
    } else {
        $('[id="btnAddNewGoalTeam"]').hide();
    }
}

// Flag to prevent duplicate calls and track last validation
var isValidateGoalModificationInProgress = false;
var lastValidationParams = null; // Store last validation parameters to prevent duplicate calls

/**
 * Validate and show/hide Goal Modification button
 * This should ONLY be called from top-level callbacks (OnAppraisalCycleChange, OnSelfAssesmentCycleChange)
 * NOT from BindKRAGridContinue or other internal functions
 */
function ValidateAndShowGoalModificationButton() {

    
    console.log('ValidateAndShowGoalModificationButton: Function called');

    var appraisalCycleId = $('#AppCycle :selected').val();
    console.log('ValidateAndShowGoalModificationButton: AppraisalCycleId =', appraisalCycleId);

    if (!appraisalCycleId || appraisalCycleId === '' || appraisalCycleId === undefined) {
        console.log('ValidateAndShowGoalModificationButton: No AppraisalCycleId, hiding button');
        $('#btnRequestGoalModification').hide();
        return;
    }

    // Check if Self Assessment Cycle dropdown exists
    var $ddlSelfAssCycle = $('#ddlSelfAssCycle');
    console.log('ValidateAndShowGoalModificationButton: Dropdown exists =', $ddlSelfAssCycle.length > 0);
    console.log('ValidateAndShowGoalModificationButton: Dropdown options count =', $ddlSelfAssCycle.find('option').length);

    if ($ddlSelfAssCycle.length === 0) {
        console.log('ValidateAndShowGoalModificationButton: Dropdown element not found');
        $('#btnRequestGoalModification').hide();
        return;
    }

    if ($ddlSelfAssCycle.find('option').length === 0) {
        console.log('ValidateAndShowGoalModificationButton: Dropdown has no options yet');
        $('#btnRequestGoalModification').hide();
        return;
    }

    // Get the selected Self Assessment Cycle (ddlSelfAssCycle)
    var selectedCycle = $ddlSelfAssCycle.val();
    console.log('ValidateAndShowGoalModificationButton: Selected cycle =', selectedCycle);

    if (!selectedCycle || selectedCycle === '' || selectedCycle === undefined || selectedCycle === '0') {
        console.log('ValidateAndShowGoalModificationButton: No cycle selected or cycle is 0');
        $('#btnRequestGoalModification').hide();
        return;
    }

    // Check if this is a duplicate call with same parameters (only prevent if currently in progress)
    var currentParams = appraisalCycleId + '|' + selectedCycle;
    if (isValidateGoalModificationInProgress && lastValidationParams === currentParams) {
        console.log('ValidateAndShowGoalModificationButton: Duplicate call prevented', currentParams);
        return;
    }

    // Set flag and store parameters
    isValidateGoalModificationInProgress = true;
    lastValidationParams = currentParams;

    console.log('ValidateAndShowGoalModificationButton: Calling API', { appraisalCycleId: appraisalCycleId, cycle: selectedCycle });

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "EmployeeKRA/ValidateCanRequestGoalModification?AppraisalCycleId=" + appraisalCycleId + "&Cycle=" + encodeURIComponent(selectedCycle);

    console.log('ValidateAndShowGoalModificationButton: API Path =', apiPath);

    var validationResult = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    console.log('ValidateAndShowGoalModificationButton: API Response =', validationResult);

    // Reset flag after API call completes
    setTimeout(function () {
        isValidateGoalModificationInProgress = false;
        lastValidationParams = null;
    }, 1000);

    if (validationResult && validationResult.responseJSON && validationResult.responseJSON.Success) {
        var result = validationResult.responseJSON.Result;
        console.log('ValidateAndShowGoalModificationButton: Validation result =', result);

        // Log all debugging fields to see which validations are failing
        console.log('ValidateAndShowGoalModificationButton: Debug Info -', {
            CanRequestModification: result.CanRequestModification,
            IsCycleActive: result.IsCycleActive,
            TotalWeightage: result.TotalWeightage,
            AllGoalsApproved: result.AllGoalsApproved,
            HasPendingRequest: result.HasPendingRequest,
            IsCycleClosed: result.IsCycleClosed,
            HasSelfAssessment: result.HasSelfAssessment,
            HasManagerFeedback: result.HasManagerFeedback,
            TotalGoalsCount: result.TotalGoalsCount,
            ApprovedGoalsCount: result.ApprovedGoalsCount,
            Message: result.Message
        });

        if (result.CanRequestModification) {
            $('#btnRequestGoalModification').show();
            console.log('ValidateAndShowGoalModificationButton: Button shown');
            // Bind click event for Request Goal Modification button
            $('#btnRequestGoalModification').off('click').on('click', function () {
                // Get the actual cycle ID from dropdown (YearBreakCheck value like "112025" or "122025")
                var cycle = $('#ddlSelfAssCycle').val();
                GoalModification.showModificationModal(appraisalCycleId, cycle);
            });
        } else {
            $('#btnRequestGoalModification').hide();
            console.log('ValidateAndShowGoalModificationButton: Button hidden -', result.Message);
            // Optionally show a message to the user
            if (result.Message) {
                console.log('Goal Modification button hidden: ' + result.Message);
            }
        }
    } else {
        // On error, hide the button for safety
        $('#btnRequestGoalModification').hide();
        console.error('ValidateAndShowGoalModificationButton: API call failed', validationResult);
    }
}


function fnBindMyAnnualrating() {

    var empId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue,
        "X-EmpNo": empId
    };
    var NavAppCycleId = '';
    if ($('#AppCycle :selected').val() != undefined) {
        NavAppCycleId = $('#AppCycle :selected').val();
    }
    else {
        NavAppCycleId = ddlAppCycle
    }

    // $("#AppCycle").val(NavAppCycleId);

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "EmployeeMaster/GetAnnualRating?EmployeeId=" + empId + "&AppraisalCycleId=" + NavAppCycleId;


    CommonAjaxGET(apiPath, headerInfo).done(function (ratingData) {

        if (ratingData.Success == false) {

            $('#lblratingValue').text('NA');
        }
        else {

            if (ratingData.Result.length > 0) {
                $('#lblratingValue').text(ratingData.Result[0].RatingDesc);
            } else {
                $('#lblratingValue').text('NA');
            }
        }

        //$("#tblMyAnnualrating").DataTable({
        //    data: ratingData.Result,
        //    destroy: true,
        //    "bPaginate": false,
        //    "bFilter": true,
        //    "bInfo": false,
        //    "sPaginationType": "full_numbers",
        //    "iDisplayLength": 10,
        //    "bLengthChange": false,
        //    "oLanguage": {
        //        "oPaginate": {
        //            "sNext": '<a href="#"><span class="glyphicon glyphicon-triangle-right"></span></a>',
        //            "sPrevious": '<a href="#"><span class="glyphicon glyphicon-triangle-left"></span></a>',
        //            "sLast": '<a href="#"><span class="glyphicon glyphicon-step-forward"></span></a>',
        //            "sFirst": '<a href="#"><span class="glyphicon glyphicon-step-backward"></span></a>'
        //        }
        //    },
        //    "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
        //    aoColumns: [

        //        { mData: "AppraisalCycleName" },

        //            { mData: "RatingDesc" },

        //    ],


        //});
    });



}


function OnSelfAssesmentCycleChange() {
    // Remove any existing loaders first to prevent duplicates
    $('.selfasscycle-loader-overlay').remove();

    // Create overlay loader that covers the KRA list area
    var $loaderOverlay = $('<div class="selfasscycle-loader-overlay" style="position: fixed; top: 60px; left: 53px; right: 0; bottom: 0; background: rgba(255,255,255,0.72); -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px); z-index: 2000; display: flex; align-items: center; justify-content: center;"><div style="text-align: center; padding: 24px 32px; background: #fff; border-radius: 8px; box-shadow: 0 4px 24px rgba(0,0,0,.12); min-width: 200px;"><span style="display: inline-block; width: 40px; height: 40px; border: 3px solid #e8e8e8; border-top-color: #337ab7; border-radius: 50%; animation: mf-spin 0.75s linear infinite; margin-bottom: 12px;"></span><span style="display: block; font-size: 14px; color: #555; font-weight: 500;">Loading Goals...</span></div></div>');

    // Add loader overlay to body
    $('body').append($loaderOverlay);

    // Fail-safe timeout for loader
    var loaderTimeout = setTimeout(function () {
        $('.selfasscycle-loader-overlay').remove();
    }, 30000);

    var SelectedEmpID = sessionStorage.getItem('EmployeeId');
    var selectedAppCycleId = $('#AppCycle :selected').val();

    // Get the selected cycle value - dropdown is already bound at this point
    var selectedCycleValue = $('#ddlSelfAssCycle').val();
    console.log('OnSelfAssesmentCycleChange: Selected cycle =', selectedCycleValue, 'AppraisalCycleId =', selectedAppCycleId);

    // Identify which tab is currently active
    var $tab = $('#mytabs'), $active = $tab.find('.tab-pane.active');
    var activeTabId = $active.attr('id');

    // Goal Modification button is only relevant for self (My Goals & Objectives) tab
    if (selectedCycleValue && selectedCycleValue !== '' && selectedCycleValue !== '0') {
        if (activeTabId === 'tab_a') {
            console.log('OnSelfAssesmentCycleChange: Calling ValidateAndShowGoalModificationButton (manual change, self tab)');
            ValidateAndShowGoalModificationButton();
        } else {
            // Hide the button on other tabs
            $('#btnRequestGoalModification').hide();
        }
    } else {
        console.warn('OnSelfAssesmentCycleChange: No valid cycle selected');
        $('#btnRequestGoalModification').hide();
    }

    // Branch logic based on active tab
    if (activeTabId === 'tab_a') {
        // Self view - reload employee's own KRA grid.
        // Do NOT call ValidateAndShowAddGoalButton() here before or after load: BindKRAGridContinue
        // already calls it and then applies Issue 19 rules (hide when status is not Initialized/Rejected).
        // Calling it again after the grid binds would overwrite that hide when usp_ValidateCanAddGoal returns true for the subcycle (e.g. H1).

        ShowMyKRAAsync(SelectedEmpID, 'E', selectedAppCycleId, function () {
            clearTimeout(loaderTimeout);
            $('.selfasscycle-loader-overlay').remove();
        });
    } else if (activeTabId === 'tab_b' || activeTabId === 'tab_c') {
        // Team / All Employee view - reload selected team member's KRA grid
        var teamMemberId = $('#ddlMyTeamList_KRA').val();

        if (!teamMemberId || teamMemberId === '' || teamMemberId === '0') {
            console.warn('OnSelfAssesmentCycleChange: No team member selected for team view');
            clearTimeout(loaderTimeout);
            $('.selfasscycle-loader-overlay').remove();
            return;
        }

        // Use async version to show KRA for subordinate
        ShowMyKRAAsync(teamMemberId, 'S', selectedAppCycleId, function () {
            // Remove loader after data loads
            clearTimeout(loaderTimeout);
            $('.selfasscycle-loader-overlay').remove();
        });
    } else {
        // Fallback - just remove loader
        clearTimeout(loaderTimeout);
        $('.selfasscycle-loader-overlay').remove();
    }
}


function GetAllActiveAppraisalCycle() {

    var d = new Date();
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'AppraisalCycle/GetAllActiveAppraisalCycle';
    AppraisalCycle = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    $('#AppCycle').empty();

    // Check if AppraisalCycle response is valid
    if (!AppraisalCycle || !AppraisalCycle.responseJSON || !AppraisalCycle.responseJSON.Result || !AppraisalCycle.responseJSON.Result.data) {
        console.error('Invalid AppraisalCycle response in GetAllActiveAppraisalCycle');
        return;
    }

    var CycleEndDate = '';
    $.each(AppraisalCycle.responseJSON.Result.data, function (index, data) {

        $('#AppCycle').append($("<option>").val(data.AppraisalCycleId).text(data.AppraisalCycleName));

    });

    $.each(AppraisalCycle.responseJSON.Result.data, function (index, data) {

        if (data.AppraisalCycleId == $('#AppCycle :selected').val()) {

            var enddate = formatDate_DMY(data.EndDate);
            $('#txtKRAEndDate').val(enddate);
        }

    });


}


function GetSelfAssesmentCycle() {

    
    var NavAppCycleId = '';
    if ($('#AppCycle :selected').val() != undefined) {
        NavAppCycleId = $('#AppCycle :selected').val();
    }
    else {
        NavAppCycleId = ddlAppCycle
    }

    //$("#AppCycle").val(NavAppCycleId);

    //var AppCycleId = $('#AppCycle :selected').val()
    var d = new Date();
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'AppraisalCycle/GetSelfAssesmentCycle?AppCycleId=' + NavAppCycleId;
    var AppraisalCycle = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    $('#ddlSelfAssCycle').empty();

    // Check if AppraisalCycle response is valid
    if (AppraisalCycle && AppraisalCycle.responseJSON && AppraisalCycle.responseJSON.Result && AppraisalCycle.responseJSON.Result.data) {
        $.each(AppraisalCycle.responseJSON.Result.data, function (index, data) {
            $('#ddlSelfAssCycle').append($("<option>").val(data.YearBreakCheck).text(data.AppraisalCycleName));
            // Footer Start/End dates come from EmployeeKRA (KRAFromDate/KRAToDate) when BindKRAGrid loads — not from self-assessment cycle rows
        });

        // Select the first option if available
        if ($('#ddlSelfAssCycle option').length > 0) {
            var firstOptionValue = $('#ddlSelfAssCycle option:first').val();
            $('#ddlSelfAssCycle').val(firstOptionValue);

            // IMPORTANT: Validate Goal Modification button after dropdown is bound
            setTimeout(function () {
                console.log('GetSelfAssesmentCycle: Dropdown bound, validating Goal Modification button');
                var currentCycle = $('#ddlSelfAssCycle').val();
                var appraisalCycleId = $('#AppCycle :selected').val() || NavAppCycleId;
                if (currentCycle && currentCycle !== '' && currentCycle !== '0') {
                    console.log('GetSelfAssesmentCycle: Calling ValidateAndShowGoalModificationButton after dropdown binding');
                    console.log('GetSelfAssesmentCycle: Cycle value =', currentCycle, 'AppraisalCycleId =', appraisalCycleId);
                    ValidateAndShowGoalModificationButton();
                } else {
                    console.warn('GetSelfAssesmentCycle: Cycle value not available after dropdown binding');
                    $('#btnRequestGoalModification').hide();
                }
            }, 150); // Increased delay slightly to ensure DOM is fully updated
        } else {
            $('#btnRequestGoalModification').hide();
            // If no data, reset the labels
            $('#lblStartDate').text('-');
            $('#lblEndDate').text('-');
        }
    } else {
        $('#btnRequestGoalModification').hide();
        // If no valid response, reset the labels
        $('#lblStartDate').text('-');
        $('#lblEndDate').text('-');
    }
}



$("#txtGoalWeightage").keypress(function (e) {

    if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
        return false;
    }
});

// Real-time validation for weightage textbox in modal
$(document).on('keyup input', '#txtGoalWeightageModal', function() {
    var weightage = $(this).val().trim();
    var $errorSpan = $('#weightageError');
    
    // Clear error if empty (will be caught by required field validation)
    if (weightage === '') {
        $errorSpan.hide().text('');
        return;
    }
    
    var weightageNum = parseFloat(weightage);
    
    // Check for negative values
    if (weightage.indexOf('-') !== -1 || weightageNum < 0) {
        $errorSpan.text('Negative values are not allowed').show();
        return;
    }
    
    // Check for zero
    if (weightageNum === 0) {
        $errorSpan.text('0 is not allowed').show();
        return;
    }
    
    // Check for minimum value (10)
    if (weightageNum > 0 && weightageNum < 10) {
        $errorSpan.text('Minimum value is 10').show();
        return;
    }
    
    // Check for maximum value (100)
    if (weightageNum > 100) {
        $errorSpan.text('Maximum value is 100').show();
        return;
    }
    
    // If all validations pass, hide error
    if (weightageNum >= 10 && weightageNum <= 100) {
        $errorSpan.hide().text('');
    }
});
function ShowEmployeeKRA(SelectedEmpID, SelectedEmployeeName, UserType, AppCycleId) {


    if (UserType == 'EI') { //If Employee then show his KRA
        EmpId = SelectedEmpID;
        //BindKRAGrid(EmpId, AppraisalCycleId);isSelfAssestbtnVisible
        loadEmployeeKRAStatus(SelectedEmpID, SelectedEmployeeName, AppCycleId);

    }
}

// Async version of ShowMyKRA with callback
function ShowMyKRAAsync(EmployeeId, UserType, AppCycleId, callback) {
    $('#btncpydiv').show();
    $('#btnKRAUpdate').show();
    $('#btnApproveTeam').css('display', 'flex').show();

    $("#KRAUpdatebtn").show()

    // Show training link when team member is selected
    if (EmployeeId != 0 && UserType == 'S') {
    }

    $('#tab_b #divValidationAlert_Team,#tab_c #divValidationAlert_Team').hide();
    $('#tab_b  #divValidationAlert,#tab_c #divValidationAlert_Team').hide();

    FillManagerList();

    if (EmployeeId != 0) {
        var NavAppCycleId = '';
        if ($('#AppCycle :selected').val() != undefined) {
            NavAppCycleId = $('#AppCycle :selected').val();
        }
        else {
            NavAppCycleId = AppCycleId || ddlAppCycle;
        }

        // Get Status using async AJAX
        var svrPath = CONFIG.get('SERVERNAME');
        var statusApiPath = svrPath + "StatusMaster/GetType?StatusType=" + statusFor;

        $.ajax({
            url: statusApiPath,
            type: 'GET',
            async: true,
            dataType: 'json',
            headers: CommonGetHeaderInfo(),
            success: function (result) {
                if (result && result.Success) {
                    KRAStatusMaster = result.Result;
                }

                if (UserType == 'E') { //If Employee then show his KRA
                    EmpId = EmployeeId;
                    // Get the selected cycle value - use .val() instead of :selected for better reliability
                    var selfAssCycleId = $('#ddlSelfAssCycle').val() || null;

                    // If dropdown doesn't have a value yet, try to get the first option
                    if (!selfAssCycleId && $('#ddlSelfAssCycle option').length > 0) {
                        selfAssCycleId = $('#ddlSelfAssCycle option:first').val();
                    }

                    // Bind KRA Grid using async call
                    BindKRAGridAsync(EmpId, NavAppCycleId, selfAssCycleId, null, function () {
                        loadKRAStatus();
                        if (callback) callback();
                    });
                } else if (UserType == 'S') {
                    // Handle subordinate case
                    ShowMyKRA(EmployeeId, UserType, AppCycleId);
                    if (callback) callback();
                } else {
                    if (callback) callback();
                }
            },
            error: function (xhr, status, error) {
                console.error('Error loading Status:', error);
                if (callback) callback();
            }
        });
    } else {
        if (callback) callback();
    }
}

function ShowMyKRA(EmployeeId, UserType, AppCycleId) {

    
    $('#btncpydiv').show();
    $('#btnKRAUpdate').show();
    $('#btnApproveTeam').css('display', 'flex').show();

    $("#KRAUpdatebtn").show()

    // Show training link when team member is selected
    if (EmployeeId != 0 && UserType == 'S') {
    }

    $('#tab_b #divValidationAlert_Team,#tab_c #divValidationAlert_Team').hide();
    $('#tab_b  #divValidationAlert,#tab_c #divValidationAlert_Team').hide();

    FillManagerList();

    if (EmployeeId != 0) {
        //if (AppCycleId == null || AppCycleId == '')
        //    AppCycleId = $('#AppCycle :selected').val();// sessionStorage.getItem('AppraisalCycleId');
        //AppraisalCycleId = AppCycleId;

        //var NavAppCycleId = '';
        if ($('#AppCycle :selected').val() != undefined) {
            AppraisalCycleId = $('#AppCycle :selected').val();
        }
        else {
            AppraisalCycleId = ddlAppCycle
        }
        KRAStatusMaster = GetStatus();
        if (UserType == 'E') { //If Employee then show his KRA
            EmpId = EmployeeId;

            BindKRAGrid(EmpId, AppraisalCycleId, $('#ddlSelfAssCycle :selected').val());
            loadKRAStatus();

        }
        if (UserType == 'S') { // If subordinate then show subordinates KRA
            window.teamMemberGoalsAllApproved = false;

            subEmpId = EmployeeId;
            // Hide footer when switching team member - it will be shown after DataTable binds
            var $tab = $('#mytabs'), $active = $tab.find('.tab-pane.active'), text = $active.find('p:hidden').text();
            var ActiveTabId = $active.attr("id");
            if (ActiveTabId == 'tab_b' || ActiveTabId == 'tab_c') {
                $('#' + ActiveTabId + ' #tblTeamMemberKRAListFooter').hide();
                $('#' + ActiveTabId + ' .consolidated-training-section').hide();
            } else {
                $('#tblTeamMemberKRAListFooter').hide();
                $('#tblTeamMemberKRAList_consolidatedTraining').hide();
            }
            // Show the table when a team member is selected
            if (ActiveTabId == 'tab_b' || ActiveTabId == 'tab_c') {
                $('#' + ActiveTabId + ' #tblTeamMemberKRAList').show();
            } else {
                $('#tblTeamMemberKRAList').show();
            }

            BindTMKRAGrid(subEmpId, AppraisalCycleId);

            // Show/hide edit form based on status
            var selectedStatusText = $('#ddlKRAStatusForTeam :selected').text().trim().toLowerCase();
            if (selectedStatusText == "submitted" || selectedStatusText == "not submitted") {
                $("#tblTeamKRAEdit").show();
            } else {
                $("#tblTeamKRAEdit").hide();
            }

            // Update button visibility based on dropdown selection (centralized logic)
            UpdateApproveRejectButtonVisibility();






        }
    } else {
        window.teamMemberGoalsAllApproved = false;
        // Hide table when no team member is selected
        $('#tblTeamMemberKRAList').hide();
        $('#tblTeamMemberKRAListFooter').hide();
        $('#trainingDetailsSectionTeam').hide();
        $('#tab_b #tblTeamMemberKRAList').hide();
        $('#tab_b #tblTeamMemberKRAListFooter').hide();
        $('#tab_b #trainingDetailsSectionTeam').hide();
        $('#tab_c #tblTeamMemberKRAList').hide();
        $('#tab_c #tblTeamMemberKRAListFooter').hide();
        $('#tblTeamMemberKRAList_consolidatedTraining').hide();
        $('#tab_b .consolidated-training-section').hide();
        $('#tab_c .consolidated-training-section').hide();
        // Also hide related buttons
        $('#btnDownloadAllAttachmentsTeam').hide();
        $('#tab_b #btnDownloadAllAttachmentsTeam').hide();
        $('#tab_c #btnDownloadAllAttachmentsTeam').hide();
        $('[id="btnAddNewGoalTeam"]').hide();
        $('#btnApproveKRA').hide();
        $('#btnRejectKRA').hide();
        $('#tab_b #btnApproveKRA').hide();
        $('#tab_b #btnRejectKRA').hide();
        $('#tab_c #btnApproveKRA').hide();
        $('#tab_c #btnRejectKRA').hide();
    }
    FillAppraisalCycle();

    $('#tblCopyKRA').hide();
    //$('#formTeamKRAEdit').hide();
    //if ($('#ddlKRAStatusForTeam').find(":selected").text() == 'Not Submitted' || ) {

    $('#formTeamKRAEdit').trigger("reset");

    $('#formTeamKRAEdit #ddlKRAStatus').val(2);// for dropdown submitted
    $("#tblTeamKRAEdit #btnKRAUpdate").val("Insert");
    //}

    // Check if AppraisalCycle response is valid
    if (!AppraisalCycle || !AppraisalCycle.responseJSON || !AppraisalCycle.responseJSON.Result || !AppraisalCycle.responseJSON.Result.data) {
        console.error('Invalid AppraisalCycle response in ShowMyKRA');
        return;
    }

    $.each(AppraisalCycle.responseJSON.Result.data, function (index, data) {


        if (ddlAppCycle != "") {
            if (data.AppraisalCycleId == ddlAppCycle) {

                var enddate = formatDate_DMY(data.EndDate);
                $('#tblTeamKRAEdit #txtKRAEndDate1').val(enddate);
            }
        }
        else {

            if (data.AppraisalCycleId == AppCycleId) {

                var enddate = formatDate_DMY(data.EndDate);
                $('#tblTeamKRAEdit #txtKRAEndDate1').val(enddate);
            }
        }

    });

    $('#tblTeamKRAEdit #txtKRAEndDate1').prop("disabled", true);

    // Use centralized function to update button visibility
    UpdateApproveRejectButtonVisibility();
}

/**API functions**/
function GetStatus() {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "StatusMaster/GetType?StatusType=" + statusFor;
    var result = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    if (result.responseJSON.Success)
        return result.responseJSON.Result;
    return null;
}
function GetKRA(EmployeeId, AppraisalCycleId, statusId, SelfAssCycleId) {
    if (statusId == null)
        statusId = 0;
    var svrPath = CONFIG.get('SERVERNAME');
    var selectedyear = 0;
    var empId = sessionStorage.EmployeeId;
    var apraisalCycleId = sessionStorage.AppraisalCycleId;
    var token = sessionStorage.TokenValue;
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue,
        "X-EmpNo": empId
    };
    var apiPath = svrPath + "EmployeeKRA/GetEmployeeKRA?AppraisalCycleId=" + AppraisalCycleId + "&ToEmployeeId=" + EmployeeId + "&StatusId=" + statusId + "&SelectedYear=" + selectedyear + "&SelfAssCycleId=" + SelfAssCycleId;
    EmpKRAData = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    return EmpKRAData;
}
function GetKRAForTeam(EmployeeId, AppraisalCycleId, SelfAssCycleId) {

    var empId = sessionStorage.EmployeeId;
    var apraisalCycleId = sessionStorage.AppraisalCycleId;
    var token = sessionStorage.TokenValue;
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue,
        "X-EmpNo": empId
    };
    var svrPath = CONFIG.get('SERVERNAME');
    // Cache-bust so tab_b always gets fresh data (e.g. after RM updates goal with training requirement)
    var apiPath = svrPath + "EmployeeKRA/GetTeamKRA?AppraisalCycleId=" + AppraisalCycleId + "&ToEmployeeId=" + EmployeeId + "&SelfAssCycleId=" + (SelfAssCycleId || '0') + "&_=" + new Date().getTime();
    EmpKRAData = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    return EmpKRAData;
}
function GetKRAbyId(KRAId) {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "EmployeeKRA/GetKRAById?id=" + KRAId
    EmpKRAData = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    return EmpKRAData;
}
function InsertKRA(employeeKRA) {
    var empId = sessionStorage.EmployeeId;
    var apraisalCycleId = sessionStorage.AppraisalCycleId;
    var token = sessionStorage.TokenValue;
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue,
        "X-EmpNo": empId
    };

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "EmployeeKRA/SubmitKRAOp";
    return CommonAjaxPOST_Array(apiPath, employeeKRA, CommonGetHeaderInfo());
}

function InsertKRAWithSP(employeeKRA) {
    var empId = sessionStorage.EmployeeId;
    var apraisalCycleId = sessionStorage.AppraisalCycleId;
    var token = sessionStorage.TokenValue;
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue,
        "X-EmpNo": empId
    };

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "EmployeeKRA/SubmitKRAOpWithSP";
    return CommonAjaxPOST_Array(apiPath, employeeKRA, CommonGetHeaderInfo());
}
function UpdateKRA(employeeKRA) {
    var empId = sessionStorage.EmployeeId;
    var apraisalCycleId = sessionStorage.AppraisalCycleId;
    var token = sessionStorage.TokenValue;
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue,
        "X-EmpNo": empId
    };

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "/EmployeeKRA/UpdateKRA";
    return CommonAjaxPOST_Array(apiPath, employeeKRA, CommonGetHeaderInfo());
}
function DeleteKRAbyId(KRAId) {
    var empId = sessionStorage.EmployeeId;
    var apraisalCycleId = sessionStorage.AppraisalCycleId;
    var token = sessionStorage.TokenValue;
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue,
        "X-EmpNo": empId
    };

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "/EmployeeKRA?KRAId=" + KRAId;
    return CommonAjaxPOSTwithurl(apiPath, CommonGetHeaderInfo());
}
function UpdateKRAStatus(AppraisalCycleId, ToEmployeeId, Action, ManagerId, SelfAssCycleId) {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "EmployeeKRA/SubmitKRA?AppraisalCycleId=" + AppraisalCycleId + "&ToEmployeeId=" + ToEmployeeId + "&KRAAction=" + Action + "&ManagerId=" + ManagerId;
    return CommonAjaxPOSTwithurl(apiPath, CommonGetHeaderInfo());
}

// Async version of BindKRAGrid with callback
function BindKRAGridAsync(EmployeeId, AppraisalCycleId, SelfAssCycleId, StatusId, callback) {
    // Use the existing BindKRAGrid but call it after async data load
    var statusIdValue = StatusId;
    if (statusIdValue == null || statusIdValue === undefined)
        statusIdValue = 0;

    var svrPath = CONFIG.get('SERVERNAME');
    var selectedyear = 0;
    var apiPath = svrPath + "EmployeeKRA/GetEmployeeKRA?AppraisalCycleId=" + AppraisalCycleId + "&ToEmployeeId=" + EmployeeId + "&StatusId=" + statusIdValue + "&SelectedYear=" + selectedyear + "&SelfAssCycleId=" + (SelfAssCycleId || '') + "&_t=" + new Date().getTime();

    $.ajax({
        url: apiPath,
        type: 'GET',
        async: true,
        dataType: 'json',
        headers: CommonGetHeaderInfo(),
        beforeSend: function () {
            // Loader will be shown by BindKRAGrid
        },
        success: function (result) {
            EmpKRAData = { responseJSON: result };
            // Call BindKRAGridContinue to process the data (since we already loaded it)
            // We need to create a loader container for BindKRAGridContinue
            var $loaderContainer = $('<div class="kra-grid-loader-container" style="position: relative; min-height: 300px; margin-bottom: 20px; width: 100%; z-index: 10000;"></div>');
            var $loader = $('<div class="kra-grid-loader" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; min-height: 300px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.95); z-index: 10000; border: 1px solid #ddd; border-radius: 4px;"><div style="text-align: center;"><i class="fa fa-spinner fa-spin" style="font-size: 24px; color: #337ab7;"></i><br/><span style="margin-top: 10px; display: block; font-size: 14px;">Loading Goals...</span></div></div>');
            $loaderContainer.append($loader);
            $('#tblKRAList').before($loaderContainer);

            var loaderTimeout = setTimeout(function () {
                $loaderContainer.remove();
                $('#tblKRAList').show();
                if ($('#tblKRAList').parent().hasClass('dataTables_wrapper')) {
                    $('#tblKRAList').parent().show();
                }
                AlertMessage('#divValidationAlert', 'Loading is taking longer than expected. Please try again.', 'D');
                if (callback) callback();
            }, 30000);
            
            // Hide table, wrapper, footer, and consolidated training
            $('#tblKRAList').hide();
            $('#tblKRAList_wrapper').hide();
            $('#tblKRAListFooter').hide();
            $('#tblKRAList_consolidatedTraining').hide();
            
            // Process the data using BindKRAGridContinue
            // Note: BindKRAGridContinue will remove the loader when done
            BindKRAGridContinue(EmployeeId, AppraisalCycleId, SelfAssCycleId, StatusId, $loaderContainer, loaderTimeout);

            // Call callback after a short delay to ensure DataTable is initialized
            setTimeout(function () {
                if (callback) callback();
            }, 100);
        },
        error: function (xhr, status, error) {
            console.error('Error loading KRA data:', error);
            AlertMessage('#divValidationAlert', 'Error loading data. Please try again.', 'D');
            if (callback) callback();
        }
    });
}

/*Table Load*/
function BindKRAGrid(EmployeeId, AppraisalCycleId, SelfAssCycleId, StatusId) {
    
    // Hide the table, wrapper, footer, and consolidated training first
    $('#tblKRAList').hide();
    $('#tblKRAList_wrapper').hide();
    $('#tblKRAListFooter').hide();
    $('#tblKRAList_consolidatedTraining').hide();
    
    // Show loader while loading KRA list
    var $loaderContainer = $('<div class="kra-grid-loader-container" style="position: relative; min-height: 300px; margin-bottom: 20px; width: 100%; z-index: 10000;"></div>');
    var $loader = $('<div class="kra-grid-loader" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; min-height: 300px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.95); z-index: 10000; border: 1px solid #ddd; border-radius: 4px;"><div style="text-align: center;"><i class="fa fa-spinner fa-spin" style="font-size: 24px; color: #337ab7;"></i><br/><span style="margin-top: 10px; display: block; font-size: 14px;">Loading Goals...</span></div></div>');
    $loaderContainer.append($loader);
    $('#tblKRAList').before($loaderContainer);

    // Fail-safe timeout for loader
    var loaderTimeout = setTimeout(function () {
        $loaderContainer.remove();
        $('#tblKRAList').show();
        if ($('#tblKRAList').parent().hasClass('dataTables_wrapper')) {
            $('#tblKRAList').parent().show();
        }
        AlertMessage('#divValidationAlert', 'Loading is taking longer than expected. Please try again.', 'D');
    }, 30000);

    var columntitle = "";
    var EditColumntitle = "";
    PermissableInsert = 0;
    OpSeqNo = 1;
    DevSeqNo = 1;
    StrategicSeqNo = 1;

    // Note: Approve/Reject buttons are only for team view (KRATab_B), not for employee's own view (KRATab_A)
    // So we don't need to hide them here as they shouldn't be visible in KRATab_A anyway
    //loading the main grid that displays the KRA of an employee
    isSubmitted = false; var com = false; var approved_check = 0; var submit_check = 0;
    var d = new Date();
    var selectedyear = '';

    // Use async AJAX call instead of synchronous GetKRA
    var statusIdValue = StatusId;
    if (statusIdValue == null || statusIdValue === undefined)
        statusIdValue = 0;

    var svrPath = CONFIG.get('SERVERNAME');
    var selectedyear = 0;
    var apiPath = svrPath + "EmployeeKRA/GetEmployeeKRA?AppraisalCycleId=" + AppraisalCycleId + "&ToEmployeeId=" + EmployeeId + "&StatusId=" + statusIdValue + "&SelectedYear=" + selectedyear + "&SelfAssCycleId=" + (SelfAssCycleId || '') + "&_t=" + new Date().getTime();

    $.ajax({
        url: apiPath,
        type: 'GET',
        async: true,
        dataType: 'json',
        headers: CommonGetHeaderInfo(),
        beforeSend: function () {
            // Loader already shown above - ensure it's visible
            $loaderContainer.show();
        },
        success: function (result) {
            clearTimeout(loaderTimeout);
            EmpKRAData = { responseJSON: result };

            // Continue with existing BindKRAGrid logic
            BindKRAGridContinue(EmployeeId, AppraisalCycleId, SelfAssCycleId, StatusId, $loaderContainer, loaderTimeout);
        },
        error: function (xhr, status, error) {
            clearTimeout(loaderTimeout);
            $loaderContainer.remove();
            $('#tblKRAList').show();
            if ($('#tblKRAList').parent().hasClass('dataTables_wrapper')) {
                $('#tblKRAList').parent().show();
            }
            // Show footer when table is shown (even on error, if table was previously visible)
            $('#tblKRAListFooter').css('display', 'flex').show();
            console.error('Error loading KRA data:', error);
            AlertMessage('#divValidationAlert', 'Error loading data. Please try again.', 'D');
        }
    });

    return; // Exit early, rest will be handled in BindKRAGridContinue
}

// Continue BindKRAGrid after async data load
//function BindKRAGridContinue(EmployeeId, AppraisalCycleId, SelfAssCycleId, StatusId, $loaderContainer, loaderTimeout) {
//    
//    var columntitle = "";
//    var EditColumntitle = "";
//    PermissableInsert = 0;
//    OpSeqNo = 1;
//    DevSeqNo = 1;
//    isSubmitted = false; var com = false; var approved_check = 0; var submit_check = 0;
//    var d = new Date();
//    var selectedyear = '';

//    // Note: Loader will be removed after DataTable is initialized or on error
//    // Don't remove it here as we need it to stay visible during DataTable initialization

//    if (!EmpKRAData || !EmpKRAData.responseJSON || !EmpKRAData.responseJSON.Success) {
//        // Remove loader on error
//        clearTimeout(loaderTimeout);
//        $loaderContainer.remove();
//        $('#tblKRAList').show();
//        if ($('#tblKRAList').parent().hasClass('dataTables_wrapper')) {
//            $('#tblKRAList').parent().show();
//        }
//        // Show footer when table is shown (even on error, if table was previously visible)
//        $('#tblKRAListFooter').css('display', 'flex').show();
//        AlertMessage('#divValidationAlert', 'Failed to load data. Please try again.', 'D');
//        return;
//    }

//    // This code is now in BindKRAGridContinue - removed to avoid duplication
//    // The async version will call BindKRAGridContinue which has all this logic
//}

// Continue BindKRAGrid after async data load
function BindKRAGridContinue(EmployeeId, AppraisalCycleId, SelfAssCycleId, StatusId, $loaderContainer, loaderTimeout) {

    var columntitle = "";
    var EditColumntitle = "";
    PermissableInsert = 0;
    OpSeqNo = 1;
    DevSeqNo = 1;
    StrategicSeqNo = 1;
    isSubmitted = false; var com = false; var approved_check = 0; var submit_check = 0;
    var d = new Date();
    var selectedyear = '';

    // Note: Loader will be removed after DataTable is initialized or on error
    // Don't remove it here as we need it to stay visible during DataTable initialization

    if (!EmpKRAData || !EmpKRAData.responseJSON || !EmpKRAData.responseJSON.Success) {
        // Remove loader on error
        clearTimeout(loaderTimeout);
        $loaderContainer.remove();
        $('#tblKRAList').show();
        if ($('#tblKRAList').parent().hasClass('dataTables_wrapper')) {
            $('#tblKRAList').parent().show();
        }
        // Show footer when table is shown (even on error, if table was previously visible)
        $('#tblKRAListFooter').css('display', 'flex').show();
        AlertMessage('#divValidationAlert', 'Failed to load data. Please try again.', 'D');
        return;
    }

    if (EmpKRAData.responseJSON.Result && EmpKRAData.responseJSON.Result.KRAData) {
        EmpKRAData.responseJSON.Result.KRAData.forEach(function (d, index) {
            if (d.KRAStatusId == 3 && d.Selfassesment == null) {
                columntitle = "Self Assessment";
            }

            if (d.KRAStatusId != 3 && d.KRAStatusId != 4 && d.KRAStatusId != 2) {
                EditColumntitle = "Edit";
            }
        });
    }

    if (EmpKRAData.responseJSON.Success) {
        if (EmpKRAData.responseJSON.Result.KRAData.length > 0) {
            // Table will be shown after DataTable initialization
            // Don't show it here - keep it hidden until DataTable is ready
            $('#KRAListGird').show();
            $('#tblKRAListFooter').show();
            $('#AssesmentCycledropdown').show();

            // Check if there are any attachments and show/hide download button accordingly
            CheckAndToggleDownloadAllAttachmentsButton(EmpKRAData.responseJSON.Result.KRAData);

        }
        else {
            // Remove loader when no data
            clearTimeout(loaderTimeout);
            $loaderContainer.remove();

            $('#tblKRAList').hide();
            $('#KRAListGird').hide();
            $('#tblKRAListFooter').hide();
            $('#tblKRAList_consolidatedTraining').hide();
            $('#AssesmentCycledropdown').hide();
            // Hide download button if no KRA data
            $('#btnDownloadAllAttachments').hide();
            // No goals: total weightage 0 (allow adding first goal)
            window.currentEmployeeTotalWeightage = 0;
            $('#lblStartDate').text('-');
            $('#lblEndDate').text('-');
        }

        var totalEmployeeWeightage = 0;
        $.each(EmpKRAData.responseJSON.Result.KRAData, function (index, data) {
            // Add Goal cap: exclude only Completed (4); Rejected (18) still counts toward 100%
            var empSt = parseInt(data.KRAStatusId, 10);
            if (!isNaN(empSt) && empSt === 4) {
                return;
            }
            totalEmployeeWeightage += parseFloat(data.Weightage || 0);
            if (data.Sequence >= DevSeqNo && data.GoalType == 'D')
                DevSeqNo = data.Sequence + 1;
            if (data.Sequence >= OpSeqNo && data.GoalType == 'O')
                OpSeqNo = data.Sequence + 1;
            if (data.Sequence >= StrategicSeqNo && data.GoalType == 'S')
                StrategicSeqNo = data.Sequence + 1;
            var status_result = $.grep(KRAStatusMaster, function (e) { return e.StatusId == data.KRAStatusId; });
            var statusDesc = (status_result.length > 0 && status_result[0]) ? status_result[0].StatusDescription : '';
            if (statusDesc == strKRAStatusCompleted) {
                com = true;
                isSubmitted = false;
                PermissableInsert += data.Weightage;
            }
            if (statusDesc == strKRAStatusApproved) {
                approved_check += data.Weightage;
            }
            if (statusDesc == strKRAStatusSubmitted)
                submit_check += data.Weightage;
            if (com != true) {
                if (statusDesc == strKRAStatusSubmitted || statusDesc == strKRAStatusApproved) {
                    isSubmitted = true;
                }
            }
        });
        // Store employee total weightage for Add Goal validation (block add when >= 100)
        window.currentEmployeeTotalWeightage = totalEmployeeWeightage;
        if (approved_check + submit_check == 100)
            isSubmitted = true;

        // Check if there are any Developmental goals to determine Training Requirements column visibility
        var hasDevelopmentalGoals = false;
        if (EmpKRAData.responseJSON.Result.KRAData && EmpKRAData.responseJSON.Result.KRAData.length > 0) {
            hasDevelopmentalGoals = EmpKRAData.responseJSON.Result.KRAData.some(function (kra) {
                var goalType = kra.GoalType;
                if (goalType && typeof goalType === 'string') {
                    goalType = goalType.trim().toUpperCase();
                    if (goalType === 'DEVELOPMENTAL' || goalType.startsWith('DEVELOPMENTAL')) {
                        return true;
                    }
                    return goalType === 'D';
                }
                return false;
            });
        }

        var kraRowsSelf = EmpKRAData.responseJSON.Result.KRAData || [];
        var showActionsColSelf = kraRowsSelf.some(function (r) { return kraSelfRowHasVisibleActions(r); });
        // Last column header: "Self Assessment" when any row shows the fill self-assessment control; otherwise "Actions"
        var kraSelfAssessmentHeaderApplies = kraRowsSelf.some(function (r) {
            if (!r) return false;
            var isH1Locked = r['IsH1Locked'] === true || r['IsH1Locked'] === 1 || r['IsH1Locked'] === '1';
            if (isH1Locked) return false;
            if (r['KRAStatusId'] == 3 && r['Selfassesment'] == null) {
                return !!fnGetButtonHTML(r);
            }
            return false;
        });

        // Tab_A (tblKRAList): Action Plan column only for appraisal cycles after 11
        var appCycleIdNum = parseInt(AppraisalCycleId, 10);
        if (isNaN(appCycleIdNum) && $('#AppCycle').length && $('#AppCycle').val()) {
            appCycleIdNum = parseInt($('#AppCycle').val(), 10);
        }
        var showActionPlanColSelf = !isNaN(appCycleIdNum) && appCycleIdNum > 11;

        $('#tblKRAList').DataTable({
            destroy: true,
            ordering: false, // 🚫 disable sorting completely
            data: EmpKRAData.responseJSON.Result.KRAData,
            aoColumns: [
                { mData: "KRAId", visible: false },
                { mData: "Sequence", visible: false, },
                //{
                //    mData: "GoalType", mRender: function (data, type, full) {
                //        var result = (data == 'O') ? 'Operational' : 'Developmental';
                //        return '<div style="text-align: center;">' + result + '</div>';
                //    }, width: "140px", className: "text-center"
                //},
                {
                    mData: "GoalType",
                    width: "11%",
                    className: "text-left",
                    mRender: function (data, type, full) {
                        var goalType = data || '';
                        var goalTypeNormalized = goalType.trim().toUpperCase();
                        if (goalTypeNormalized === 'O' || goalTypeNormalized.startsWith('OPERATIONAL')) {
                            goalTypeNormalized = 'O';
                        } else if (goalTypeNormalized === 'D' || goalTypeNormalized.startsWith('DEVELOPMENTAL')) {
                            goalTypeNormalized = 'D';
                        } else if (goalTypeNormalized === 'S' || goalTypeNormalized.startsWith('STRATEGIC')) {
                            goalTypeNormalized = 'S';
                        }

                        var goalTypeText = (goalTypeNormalized === 'O') ? 'Operational' : (goalTypeNormalized === 'D') ? 'Developmental' : 'Strategic Goal (AI-Themed)';

                        return '<div style="text-align: left; padding: 8px;">' + goalTypeText + '</div>';
                    }
                },

                {
                    mData: "GoalDescription",
                    width: "22%",
                    mRender: function (data, type, full) {
                        var goalHtml = data || '';
                        // Extract plain text from HTML for word count only
                        var goalText = $('<div>').html(goalHtml).text();
                        var fullHtml = goalHtml;
                        var displayHtml = '';

                        // Count words (approximate - split by spaces)
                        var words = goalText.split(/\s+/).filter(function (word) { return word.length > 0; });
                        var wordCount = words.length;
                        var kraId = full['KRAId'];
                        var uniqueId = 'goal-desc-' + kraId + '-' + Date.now();

                        if (wordCount > 10) {
                            // Show truncated HTML with Read More link
                            // Keep the HTML formatting intact
                            var truncatedWords = words.slice(0, 10).join(' ');
                            displayHtml = '<div class="truncated-content">' + goalHtml + '</div><a href="#" class="read-more-link" data-id="' + uniqueId + '" style="color: #337ab7; text-decoration: underline; cursor: pointer; display: block; margin-top: 5px;">Read more</a>';
                        } else {
                            displayHtml = goalHtml;
                        }

                        return '<div style="text-align: center; padding: 8px;" class="goal-description-content" data-id="' + uniqueId + '" data-full="' + escapeHtml(fullHtml) + '" data-wordcount="' + wordCount + '" data-truncated="' + (wordCount > 10 ? 'true' : 'false') + '">' + displayHtml + '</div>';
                    },
                    className: "text-center"
                },
                {
                    mData: "Measure",
                    width: "23%",
                    mRender: function (data, type, full) {
                        var measureHtml = data || '';
                        // Extract plain text from HTML for word count only
                        var measureText = $('<div>').html(measureHtml).text();
                        var fullHtml = measureHtml;
                        var displayHtml = '';

                        // Count words (approximate - split by spaces) - only count measure text
                        var words = measureText.split(/\s+/).filter(function (word) { return word.length > 0; });
                        var wordCount = words.length;
                        var kraId = full['KRAId'];
                        var uniqueId = 'measure-' + kraId + '-' + Date.now();

                        if (wordCount > 10) {
                            // Show truncated HTML with Read More link
                            // Keep the HTML formatting intact
                            var truncatedWords = words.slice(0, 10).join(' ');
                            displayHtml = '<div class="truncated-content">' + measureHtml + '</div><a href="#" class="read-more-link" data-id="' + uniqueId + '" style="color: #337ab7; text-decoration: underline; cursor: pointer; display: block; margin-top: 5px;">Read more</a>';
                        } else {
                            displayHtml = measureHtml;
                        }

                        return '<div style="text-align: center; padding: 8px;" class="measure-content" data-id="' + uniqueId + '" data-full="' + escapeHtml(fullHtml) + '" data-wordcount="' + wordCount + '" data-truncated="' + (wordCount > 10 ? 'true' : 'false') + '">' + displayHtml + '</div>';
                    },
                    className: "text-center"
                },
                {
                    mData: "ActionPlan",
                    visible: showActionPlanColSelf,
                    width: "22%",
                    mRender: function (data, type, full) {
                        var actionPlanHtml = data || '';
                        // Extract plain text from HTML for word count only
                        var actionPlanText = $('<div>').html(actionPlanHtml).text();
                        var fullHtml = actionPlanHtml;
                        var displayHtml = '';

                        // Count words (approximate - split by spaces)
                        var words = actionPlanText.split(/\s+/).filter(function (word) { return word.length > 0; });
                        var wordCount = words.length;
                        var kraId = full['KRAId'];
                        var uniqueId = 'action-plan-' + kraId + '-' + Date.now();

                        if (wordCount > 10) {
                            // Show truncated HTML with Read More link
                            var truncatedWords = words.slice(0, 10).join(' ');
                            displayHtml = '<div class="truncated-content">' + actionPlanHtml + '</div><a href="#" class="read-more-link" data-id="' + uniqueId + '" style="color: #337ab7; text-decoration: underline; cursor: pointer; display: block; margin-top: 5px;">Read more</a>';
                        } else {
                            displayHtml = actionPlanHtml || '<span style="color: #999;">Not specified</span>';
                        }

                        return '<div style="text-align: center; padding: 8px;" class="action-plan-content" data-id="' + uniqueId + '" data-full="' + escapeHtml(fullHtml) + '" data-wordcount="' + wordCount + '" data-truncated="' + (wordCount > 10 ? 'true' : 'false') + '">' + displayHtml + '</div>';
                    },
                    className: "text-center"
                },
                {
                    mData: "Weightage",
                    width: "11%",
                    mRender: function (data, type, full) {
                        return '<div>' + (data || '') + '</div>';
                    },
                    className: "text-center"
                },
                //{
                //    mData: "TrainingRequirements",
                //    width: "15%",
                //    visible: hasDevelopmentalGoals, // Show only if there are Developmental goals
                //    mRender: function (data, type, full) {
                //        // Check GoalType - Training Requirements are only applicable for Developmental goals
                //        var goalType = full['GoalType'];
                //        if (goalType && typeof goalType === 'string') {
                //            goalType = goalType.trim().toUpperCase();
                //            // Normalize GoalType to handle both 'O'/'D' and 'Operational'/'Developmental'
                //            if (goalType === 'OPERATIONAL' || goalType.startsWith('OPERATIONAL')) {
                //                goalType = 'O';
                //            } else if (goalType === 'DEVELOPMENTAL' || goalType.startsWith('DEVELOPMENTAL')) {
                //                goalType = 'D';
                //            } else {
                //                goalType = goalType.charAt(0).toUpperCase(); // Take first character
                //            }
                //        }

                //        // For Operational goals, return empty (column will be hidden)
                //        if (goalType === 'O') {
                //            return '';
                //        }

                //        // Get training requirements - could be from TrainingRequirements array or single TrainingRequirementName
                //        var trainingText = '';
                //        if (full['TrainingRequirements'] && Array.isArray(full['TrainingRequirements']) && full['TrainingRequirements'].length > 0) {
                //            // Multiple training requirements
                //            trainingText = full['TrainingRequirements'].map(function(tr) {
                //                return tr.TrainingRequirementName || tr.Name || 'NA';
                //            }).join(', ');
                //        } else if (full['TrainingRequirementName'] && full['TrainingRequirementName'].trim() !== '') {
                //            // Single training requirement (backward compatibility)
                //            trainingText = full['TrainingRequirementName'];
                //        } else {
                //            trainingText = 'NA';
                //        }

                //        if (trainingText === 'NA') {
                //            return '<div style="text-align: center; padding: 8px;">NA</div>';
                //        }

                //        // Count words for Read More/Read Less (5 words)
                //        var words = trainingText.split(/\s+/).filter(function(word) { return word.length > 0; });
                //        var wordCount = words.length;
                //        var kraId = full['KRAId'];
                //        var uniqueId = 'training-' + kraId + '-' + Date.now();

                //        if (wordCount > 5) {
                //            var truncatedWords = words.slice(0, 5).join(' ');
                //            var displayText = truncatedWords + '... <a href="#" class="read-more-link-training" data-id="' + uniqueId + '" data-full="' + escapeHtml(trainingText) + '" data-wordcount="' + wordCount + '" style="color: #337ab7; text-decoration: underline; cursor: pointer;">Read more</a>';
                //            return '<div style="text-align: center; padding: 8px;" class="training-content" data-id="' + uniqueId + '" data-full="' + escapeHtml(trainingText) + '" data-wordcount="' + wordCount + '">' + displayText + '</div>';
                //        } else {
                //            return '<div style="text-align: center; padding: 8px;" class="training-content" data-id="' + uniqueId + '" data-full="' + escapeHtml(trainingText) + '" data-wordcount="' + wordCount + '">' + trainingText + '</div>';
                //        }
                //    },
                //    className: "text-center"
                //},
                {
                    mRender: function (data, type, full) {
                        var actions = '';
                        var status_result = $.grep(KRAStatusMaster, function (e) { return e.StatusId == full['KRAStatusId']; });
                        var statusDesc = status_result.length > 0 ? status_result[0].StatusDescription : '';
                        var statusId = status_result.length > 0 ? status_result[0].StatusId : 0;

                        // Check if H1 goal is locked (H2 modification approved)
                        var isH1Locked = full['IsH1Locked'] === true || full['IsH1Locked'] === 1 || full['IsH1Locked'] === '1';

                        // If H1 goal is locked, don't show any action buttons
                        if (isH1Locked) {
                            return '<span class="text-muted" title="H1 goals are locked because H2 modification has been approved">Locked</span>';
                        }

                        // Edit button
                        if (statusDesc != strKRAStatusCompleted && statusId != 3 && statusId != 2) {
                            actions += '<button class="btn btn-info btn-xs btn-round" title="Edit" id="btnKRAEdit_' + full['KRAId'] + '" onclick="loadKRAEditTable(' + full['KRAId'] + ')" style="margin: 2px;"><span class="glyphicon glyphicon-edit"></span></button>';
                        }

                        // Delete button
                        if (statusDesc == strKRAStatusInitialised || statusDesc == strKRAStatusRejected) {
                            actions += '<button class="btn btn-danger btn-xs btn-round" title="Delete" id="btnKRADelete_' + full['KRAId'] + '" onclick="DeleteKRATable(' + full['KRAId'] + ')" style="margin: 2px;"><span class="glyphicon glyphicon-trash"></span></button>';
                        }

                        // Self Assessment button
                        if (full['KRAStatusId'] == 3 && full['Selfassesment'] == null) {
                            var button = fnGetButtonHTML(full);
                            if (button) {
                                actions += button;
                            }
                        }

                        return '<div style="text-align: center;">' + actions + '</div>';
                    },
                    width: "11%",
                    className: "text-center",
                    orderable: false,
                    visible: showActionsColSelf
                }
            ],
            // order: [[2, "desc"], [1, "asc"]], //order by Goal type, Sequence
            bFilter: false,
            paging: false,
            LengthChange: false,
            bInfo: false,
            autoWidth: false
        });

        if (showActionsColSelf) {
            $('#tblKRAList thead tr th').last().text(kraSelfAssessmentHeaderApplies ? 'Self Assessment' : 'Actions');
        }

        // Remove loader after DataTable is successfully initialized
        clearTimeout(loaderTimeout);
        $loaderContainer.remove();

        // Now show the table and its wrapper
        $('#tblKRAList').show();
        if ($('#tblKRAList').parent().hasClass('dataTables_wrapper')) {
            $('#tblKRAList').parent().show();
        }
        // Show footer after DataTable is initialized
        $('#tblKRAListFooter').css('display', 'flex').show();

        ClearKRAForm();
        $('#btnSubmitKRA').show();
        
        // Add Goal visibility set in ApplyAddGoalButtonVisibilityAfterGridLoad (after footer / status) so subcycle + row statuses stay in sync
        
        // IMPORTANT: Revalidate Goal Modification button when KRA list is loaded
        // This ensures the button visibility is updated based on current state
        // Only validate if we're viewing employee's own KRA (not team member view)
        // Use a small delay to ensure dropdowns are ready
        setTimeout(function () {
            var $ddlSelfAssCycle = $('#ddlSelfAssCycle');
            var selectedCycle = $ddlSelfAssCycle.val();
            var appraisalCycleId = $('#AppCycle :selected').val();

            // Only validate if dropdowns are ready and we have valid values
            if ($ddlSelfAssCycle.length > 0 && selectedCycle && selectedCycle !== '' && selectedCycle !== '0' && appraisalCycleId) {
                console.log('BindKRAGridContinue: KRA list loaded, revalidating Goal Modification button');
                console.log('BindKRAGridContinue: Cycle value =', selectedCycle, 'AppraisalCycleId =', appraisalCycleId);
                ValidateAndShowGoalModificationButton();
            } else {
                console.log('BindKRAGridContinue: Dropdowns not ready, hiding button');
                $('#btnRequestGoalModification').hide();
            }
        }, 200);

        if (isSubmitted) {
            $('#btnSubmitKRA').hide();
            $('#btnAddNewGoal').hide(); // Issue 19: Hide Add Goal when KRA is Submitted/Approved
            disableKRAForm();

            // Note: Removed alert message from here - it should only show when user tries to add a new KRA
            // The alert will be shown in SaveKRAFormModal when appropriate
        }
        if (EmpKRAData.responseJSON.Result.KRAData.length > 0) {
            if (EmpKRAData.responseJSON.Result.KRAData[0].ManagerId != null)
                $("#HdnKRAToSubmitManager").val(EmpKRAData.responseJSON.Result.KRAData[0].ManagerId);
            FillManagerList();
        }

        // Initialize Read More/Read Less handlers for Measure column
        initializeReadMoreHandlers();

        // Initialize Read More/Read Less handlers for Training Requirements column
        initializeTrainingReadMoreHandlers();

        // Render consolidated training requirements table below the KRA grid
        renderConsolidatedTrainingTable('#tblKRAList', EmpKRAData.responseJSON.Result.KRAData);
        
        // Populate status in footer
        if (EmpKRAData.responseJSON.Result.KRAData && EmpKRAData.responseJSON.Result.KRAData.length > 0) {
            ;
            var firstKRA = EmpKRAData.responseJSON.Result.KRAData[0];
            // Ensure KRAStatusMaster is loaded (may not be set when BindKRAGridContinue runs after async KRA load)
            if (!KRAStatusMaster || !Array.isArray(KRAStatusMaster) || KRAStatusMaster.length === 0) {
                KRAStatusMaster = GetStatus() || [];
            }
            // Support both PascalCase and camelCase from API (KRAStatusId/kraStatusId, StatusId/statusId, StatusDescription/statusDescription)
            var kraStatusId = firstKRA.KRAStatusId != null && firstKRA.KRAStatusId !== undefined ? firstKRA.KRAStatusId : firstKRA.kraStatusId;
            var status_result = $.grep(KRAStatusMaster, function (e) {
                var sid = e.StatusId != null && e.StatusId !== undefined ? e.StatusId : e.statusId;
                return sid == kraStatusId;
            });
            var statusText = (status_result.length > 0 && status_result[0]) ? (status_result[0].StatusDescription || status_result[0].statusDescription || 'NA') : 'NA';
           
           if (status_result[0].StatusId == 1) {
                statusText = 'Initialised';
            } else if (status_result[0].StatusId == 2) {
                statusText = 'Pending RM approval';
            }
           
            $('#lblKRAStatus').text(statusText);

            // Show/hide Copy Goal button based on KRAStatusId (only show when status is 1 - Initialized)
            if (kraStatusId == 1) {
                $('#btnCopyKRAOptions').show();
            } else {
                $('#btnCopyKRAOptions').hide();
                // Also hide the Copy KRA section if it's open
                $('#tblCopyKRA').hide();
            }
            
            // Footer dates from EmployeeKRA: earliest KRAFromDate, latest KRAToDate across all goals
            setKRAListFooterDatesFromGoals(EmpKRAData.responseJSON.Result.KRAData, '#lblStartDate', '#lblEndDate');
        } else {
            // If no KRA data, show copy options for new users
            $('#btnCopyKRAOptions').show();
            $('#lblStartDate').text('-');
            $('#lblEndDate').text('-');
        }
        
        ApplyAddGoalButtonVisibilityAfterGridLoad(EmpKRAData.responseJSON.Result.KRAData, isSubmitted);
        
        IsCopyKRA = 0;
    }
}
/** Parse date from API (ISO, /Date(ms)/, or Date) */
function parseEmployeeKRADate(raw) {
    if (raw == null || raw === '') return null;
    if (typeof raw === 'string' && raw.indexOf('/Date(') === 0) {
        var m = /\/Date\((-?\d+)\)\//.exec(raw);
        if (m) return new Date(parseInt(m[1], 10));
    }
    var d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
}

/**
 * Min KRAFromDate and max KRAToDate across EmployeeKRA goal rows (PascalCase or camelCase from API).
 */
function getKRADateRangeFromEmployeeGoals(kraDataArray) {
    var minFrom = null;
    var maxTo = null;
    if (!kraDataArray || !Array.isArray(kraDataArray) || kraDataArray.length === 0) {
        return { minFrom: null, maxTo: null };
    }
    for (var i = 0; i < kraDataArray.length; i++) {
        var row = kraDataArray[i];
        var fromRaw = row.KRAFromDate != null ? row.KRAFromDate : row.kraFromDate;
        var toRaw = row.KRAToDate != null ? row.KRAToDate : row.kraToDate;
        var fromD = parseEmployeeKRADate(fromRaw);
        var toD = parseEmployeeKRADate(toRaw);
        if (fromD) {
            if (!minFrom || fromD < minFrom) minFrom = fromD;
        }
        if (toD) {
            if (!maxTo || toD > maxTo) maxTo = toD;
        }
    }
    return { minFrom: minFrom, maxTo: maxTo };
}

/** Set footer labels from EmployeeKRA date range (selectors e.g. '#lblStartDate' or '#tab_b #lblTeamStartDate') */
function setKRAListFooterDatesFromGoals(kraDataArray, startSelector, endSelector) {
    var range = getKRADateRangeFromEmployeeGoals(kraDataArray);
    var $s = $(startSelector);
    var $e = $(endSelector);
    if (!$s.length || !$e.length) return;
    if (range.minFrom && range.maxTo) {
        $s.text(formatDate_DMY(range.minFrom));
        $e.text(formatDate_DMY(range.maxTo));
    } else if (range.minFrom) {
        $s.text(formatDate_DMY(range.minFrom));
        $e.text('-');
    } else if (range.maxTo) {
        $s.text('-');
        $e.text(formatDate_DMY(range.maxTo));
    } else {
        $s.text('-');
        $e.text('-');
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (text === null || text === undefined) {
        return '';
    }
    // Convert to string if it's not already
    text = String(text);
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}

// Helper function to unescape HTML
function unescapeHtml(text) {
    var map = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'"
    };
    return text.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, function (m) { return map[m]; });
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}
function loadKRAEditTable(KRAId) {
    $("#divValidationAlert").hide();
    var KRAResult = GetKRAbyId(KRAId);

    if (KRAResult.responseJSON.Success) {
        var EmpKRAData = KRAResult.responseJSON.Result;
        
        // The GetKRAById SP may convert ||| to commas.
        // Override training fields from the DataTable row (which preserves |||).
        OverrideTrainingFieldsFromDataTable(EmpKRAData, '#tblKRAList');
        
        var status_result = $.grep(KRAStatusMaster, function (e) { return e.StatusId == EmpKRAData.KRAStatusId; });

        if (status_result != null && status_result != '' && status_result.length > 0) {
            // Only allow editing if status is not Completed
            if (status_result[0].StatusDescription != strKRAStatusCompleted) {
                // Populate modal with data
                OpenEditGoalModal(EmpKRAData);
            } else {
                AlertMessage('#divValidationAlert', 'Cannot edit completed goals.', 'D');
            }
        }
    } else {
        AlertMessage('#divValidationAlert', strKRAErrorMsg, 'D');
    }
}
// Centralized function to initialize datepicker for start date field
// This ensures consistent behavior across all tabs
function InitializeStartDatePicker() {
    var $startDateInput = $('#txtKRAStartDateModal');

    if (!$startDateInput.length) {
        console.warn('txtKRAStartDateModal not found');
        return;
    }

    // Remove any existing datepicker completely
    if ($startDateInput.hasClass('hasDatepicker')) {
        try {
            $startDateInput.datepicker('destroy');
            $startDateInput.removeClass('hasDatepicker');
        } catch (e) {
            console.warn('Error destroying existing datepicker:', e);
        }
    }

    // Remove any existing event handlers
    $startDateInput.off('focus click');

    // Clear any existing value to start fresh
    // Don't clear if we're in edit mode (value will be set by the edit function)

    // Initialize datepicker with a fresh, clean approach
    $startDateInput.datepicker({
        dateFormat: 'dd-mm-yy',  // jQuery UI format
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        beforeShow: function (input, inst) {
            // Ensure readonly is maintained
            $(input).prop('readonly', true);
            return true;
        },
        onSelect: function (dateText, inst) {
            var $this = $(this);

            // CRITICAL: Explicitly set the value - this is the key fix
            $this.val(dateText);

            // Force a change event to ensure the value is recognized
            $this.trigger('change');

            // Get the selected date object for validation
            var selectedDate = $this.datepicker('getDate');

            // Validate against end date
            var endDateStr = $('#txtKRAEndDateModal').val();
            if (endDateStr && endDateStr.trim() !== '') {
                try {
                    var endDateParts = endDateStr.split('-');
                    if (endDateParts.length === 3) {
                        var endDate = new Date(
                            parseInt(endDateParts[2]),
                            parseInt(endDateParts[1]) - 1,
                            parseInt(endDateParts[0])
                        );
                        if (selectedDate && endDate && selectedDate > endDate) {
                            alert('Start date cannot be after end date.');
                            $this.val('');
                            $this.trigger('change');
                            return;
                        }
                    }
                } catch (e) {
                    console.warn('Error validating date:', e);
                }
            }

            console.log('Date selected and set:', dateText, 'Field value:', $this.val());
        },
        onClose: function (dateText, inst) {
            // Ensure value is set when calendar closes
            var $this = $(this);
            if (dateText && !$this.val()) {
                $this.val(dateText);
                $this.trigger('change');
            }
        }
    });

    // Also handle focus event to ensure calendar opens
    $startDateInput.on('focus', function () {
        if (!$(this).val()) {
            $(this).datepicker('show');
        }
    });

    // Handle click event to ensure calendar opens
    $startDateInput.on('click', function () {
        $(this).datepicker('show');
    });

    console.log('Start date picker initialized');
}

// Helper function to show modal with proper configuration (prevents closing on backdrop click)
function ShowAddGoalModal() {
    var $modal = $('#addGoalModal');

    // Modal should now always be available (it's in both Index.cshtml and _TeamMemberKRAList.cshtml)
    if ($modal.length === 0) {
        console.error('Add Goal Modal not found in DOM');
        // Last resort: wait a moment and try once more
        setTimeout(function () {
            $modal = $('#addGoalModal');
            if ($modal.length === 0) {
                console.error('Add Goal Modal still not found after delay');
                return false;
            } else {
                // Found it, show it
                $modal.modal({
                    backdrop: 'static',
                    keyboard: false,
                    show: true
                });
                setTimeout(function () {
                    if ($modal[0]) {
                        $modal[0].style.setProperty('display', 'block', 'important');
                        $modal[0].style.setProperty('z-index', '1060', 'important');
                    }
                    if (typeof InitializeStartDatePicker === 'function') {
                        InitializeStartDatePicker();
                    }
                }, 100);
            }
        }, 200);
        return false;
    }

    // Show modal with backdrop: 'static' to prevent closing on outside click
    // Only allow closing via X button or close button
    $modal.modal({
        backdrop: 'static',
        keyboard: false,
        show: true
    });

    // Force modal to be visible after showing (in case of CSS conflicts)
    setTimeout(function () {
        if ($modal[0]) {
            $modal[0].style.setProperty('display', 'block', 'important');
            $modal[0].style.setProperty('z-index', '1060', 'important');
        }

        // Datepicker will be initialized by the modal shown event handler
        // But we can also initialize it here as a fallback
        if (typeof InitializeStartDatePicker === 'function') {
            InitializeStartDatePicker();
        }
    }, 100);

    return true;
}

// Centralized function to manage Approve/Reject button visibility based on dropdown selection and loaded team member data
// When loaded goals are all Approved (KRAStatusId 3) or all Rejected (KRAStatusId 18), buttons must stay hidden even if dropdown says Submitted/Not Submitted
function UpdateApproveRejectButtonVisibility() {
    var selectedStatusValue = $("#ddlKRAStatusForTeam").val();
    var selectedStatusText = $("#ddlKRAStatusForTeam").find(":selected").text().toLowerCase().trim();

    // Determine visibility based on dropdown selection
    var shouldShowButtons = false;

    // Check for "Not Submitted" status (value -1 or text "not submitted")
    if (selectedStatusValue == '-1' || selectedStatusValue == -1 || selectedStatusText == 'not submitted') {
        shouldShowButtons = true;
    }
    // Check for "Submitted" status (value 2 or text "submitted")
    else if (selectedStatusValue == '2' || selectedStatusValue == 2 || selectedStatusText == 'submitted') {
        shouldShowButtons = true;
    }
    // Hide buttons for "Approved" status (value 3 or text "approved")
    else if (selectedStatusValue == '3' || selectedStatusValue == 3 || selectedStatusText == 'approved') {
        shouldShowButtons = false;
    }
    // Default: hide buttons if status is not recognized
    else {
        shouldShowButtons = false;
    }
    
    // If the currently loaded team member's goals are all Approved (3) or all Rejected (18), do not show Approve/Reject buttons
    // (e.g. RM switched back to a previously approved/rejected employee while dropdown still shows Submitted/Not Submitted)
    if (typeof window.loadedTeamMemberKRAAllApprovedOrRejected !== 'undefined' && window.loadedTeamMemberKRAAllApprovedOrRejected === true) {
        shouldShowButtons = false;
    }
    
    // Apply visibility to regular, tab_b, and tab_c buttons
    if (shouldShowButtons) {
        $('#btnApproveKRA').show();
        $('#btnRejectKRA').show();
        $('#tab_b #btnApproveKRA').show();
        $('#tab_b #btnRejectKRA').show();
        $('#tab_c #btnApproveKRA').show();
        $('#tab_c #btnRejectKRA').show();
    } else {
        $('#btnApproveKRA').hide();
        $('#btnRejectKRA').hide();
        $('#tab_b #btnApproveKRA').hide();
        $('#tab_b #btnRejectKRA').hide();
        $('#tab_c #btnApproveKRA').hide();
        $('#tab_c #btnRejectKRA').hide();
    }

    console.log('UpdateApproveRejectButtonVisibility: StatusValue=' + selectedStatusValue + ', StatusText=' + selectedStatusText + ', shouldShow=' + shouldShowButtons);

    // Team "Add Goal": hide when filter is Submitted/Approved, no member selected, or loaded goals are all Approved (3)
    var teamEmpVal = $('#ddlMyTeamList_KRA').val();
    var hideTeamAdd = (selectedStatusText === 'submitted' || selectedStatusText === 'approved')
        || !teamEmpVal || teamEmpVal === '0'
        || (typeof window.teamMemberGoalsAllApproved !== 'undefined' && window.teamMemberGoalsAllApproved === true);
    if (hideTeamAdd) {
        $('[id="btnAddNewGoalTeam"]').hide();
    }
}

function BindTMKRAGrid(EmployeeId, NavAppCycleId) {

    var SelfAssCycleId = $('#ddlSelfAssCycle :selected').val();

    if (SelfAssCycleId == undefined) {
        SelfAssCycleId = "0"
    }

    var hidereject = 0;
    //loading the main grid that displays the KRA of an employee
    var $tab = $('#mytabs'), $active = $tab.find('.tab-pane.active'), text = $active.find('p:hidden').text();
    var ActiveTabId = $active.attr("id");
    var TableName;
    var Approvebtn;
    var RejectBtn;

    var SubmitBtn;
    if (ActiveTabId == 'tab_b' || ActiveTabId == 'tab_c') {
        $('#' + ActiveTabId + ' #divValidationAlert_Team').hide();
        TableName = '#' + ActiveTabId + ' #tblTeamMemberKRAList';
        Approvebtn = '#' + ActiveTabId + ' #btnApproveKRA';
        RejectBtn = '#' + ActiveTabId + ' #btnRejectKRA';
        SubmitBtn = '#' + ActiveTabId + ' #btnSubmitKRATeam';
    }
    else {
        $('#divValidationAlert_Team').hide();
        TableName = '#tblTeamMemberKRAList';
        Approvebtn = '#btnApproveKRA';
        RejectBtn = '#btnRejectKRA';
        SubmitBtn = '#btnSubmitKRATeam';
    }
    
    // Hide the table and footer first - footer stays hidden until table is loaded
    $(TableName).hide();
    $(TableName + '_wrapper').hide(); // Hide DataTable wrapper if it exists
    if (ActiveTabId == 'tab_b' || ActiveTabId == 'tab_c') {
        $('#' + ActiveTabId + ' #tblTeamMemberKRAListFooter').hide();
        $('#' + ActiveTabId + ' .consolidated-training-section').hide();
    } else {
        $('#tblTeamMemberKRAListFooter').hide();
        $('#tblTeamMemberKRAList_consolidatedTraining').hide();
    }
    
    // Show loader while data is loading - use setTimeout to allow UI to update
    var $loader = $('<div class="kra-grid-loader" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; min-height: 300px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.95); z-index: 10000; border: 1px solid #ddd; border-radius: 4px;"><div style="text-align: center;"><i class="fa fa-spinner fa-spin" style="font-size: 24px; color: #337ab7;"></i><br/><span style="margin-top: 10px; display: block; font-size: 14px;">Loading Goals...</span></div></div>');

    // Create a container for the loader if it doesn't exist
    var $loaderContainer = $('<div class="kra-grid-loader-container" style="position: relative; min-height: 300px; width: 100%; z-index: 10000; display: block !important;"></div>');

    // Remove any existing loader first
    $('.kra-grid-loader-container').remove();

    // Insert loader container before the table
    if (ActiveTabId == 'tab_b' || ActiveTabId == 'tab_c') {
        $('#' + ActiveTabId + ' #tblTeamMemberKRAList').before($loaderContainer);
        $loaderContainer.append($loader);
    } else {
        $('#tblTeamMemberKRAList').before($loaderContainer);
        $loaderContainer.append($loader);
    }

    // Force the loader to be visible
    $loaderContainer.css('display', 'block');
    $loader.css('display', 'flex');

    var isMSubmitted = false, isApproved = true;

    NavAppCycleId = AppraisalCycleId;
    var status_submit = $.grep(KRAStatusMaster, function (e) { return e.StatusDescription == strKRAStatusSubmitted; });

    $('#spnEmpName').text("'" + $("#ddlMyTeamList_KRA option:selected").text().trim().split(" ")[0] + "'");

    // Use setTimeout to allow loader to render before making the synchronous call
    setTimeout(function () {
        // Ensure loader is still visible before making the call
        $loaderContainer.css('display', 'block');
        $loader.css('display', 'flex');

        // Make the API call - this is synchronous, but loader is already visible
        var result = GetKRAForTeam(EmployeeId, NavAppCycleId, SelfAssCycleId);

        // Store the result in a global variable for use in DownloadAllAttachmentsTeam (similar to TAB_A)
        EmpKRAData = result;

        // Check if result is valid
        if (!result || !result.responseJSON) {
            // Remove loader if API call failed
            $('.kra-grid-loader-container').remove();
            window.loadedTeamMemberKRAAllApprovedOrRejected = false;
            window.teamMemberGoalsAllApproved = false;
            window.currentTeamMemberTotalWeightage = 0;
            var _teamScopeErr = (ActiveTabId == 'tab_b' || ActiveTabId == 'tab_c') ? ('#' + ActiveTabId + ' ') : '';
            $(_teamScopeErr + '#lblTeamStartDate').text('-');
            $(_teamScopeErr + '#lblTeamEndDate').text('-');
            AlertMessage('#divValidationAlert_Team', 'Failed to load data. Please try again.', 'D');
            $(TableName).hide();
            var selectedEmployeeIdErr = getTeamKraTargetEmployeeIdForAddGoal();
            var appraisalCycleIdErr = $('#AppCycle :selected').val();
            var statusTextErr = $('#ddlKRAStatusForTeam').find(':selected').text().toLowerCase().trim();
            if (selectedEmployeeIdErr && selectedEmployeeIdErr !== '' && selectedEmployeeIdErr !== '0' && appraisalCycleIdErr && statusTextErr !== 'submitted' && statusTextErr !== 'approved') {
                ApplyAddGoalButtonVisibilityAfterGridLoadTeam([], false);
            } else {
                $('[id="btnAddNewGoalTeam"]').hide();
            }
            return;
        }

        if (result.responseJSON.Success) {
            var kraDataArray = result.responseJSON.Result.KRAData;
            if (kraDataArray != null) {
                $.each(kraDataArray, function (index, data) {
                    var status_result = $.grep(KRAStatusMaster, function (e) { return e.StatusId == data.KRAStatusId; });
                    if (status_result != null && status_result != '') {

                        if (status_result[0].StatusDescription == strKRAStatusSubmitted) {
                            isMSubmitted = true;
                            isApproved = false;
                        }
                    }

                    if (data.CreatedBy != data.ModifiedBy) {
                        $('#btnRejectKRA').hide();
                        hidereject = 1;
                    }
                });
                if (isMSubmitted || isApproved) {
                    // Check if table exists before initializing DataTable
                    var $table = $(TableName);
                    if ($table.length === 0) {
                        // Remove loader if table not found
                        $('.kra-grid-loader-container').remove();
                        console.error('Table not found: ' + TableName);
                        return;
                    }

                    // Validate data before initializing DataTable
                    if (!kraDataArray || !Array.isArray(kraDataArray) || kraDataArray.length === 0) {
                        console.warn('No data available for table: ' + TableName);
                        // Remove loader
                        $('.kra-grid-loader-container').remove();
                        window.loadedTeamMemberKRAAllApprovedOrRejected = false;
                        window.teamMemberGoalsAllApproved = false;
                        window.currentTeamMemberTotalWeightage = 0;
                        $(TableName).hide();
                        var _teamScopeEmpty = (ActiveTabId == 'tab_b' || ActiveTabId == 'tab_c') ? ('#' + ActiveTabId + ' ') : '';
                        $(_teamScopeEmpty + '#lblTeamStartDate').text('-');
                        $(_teamScopeEmpty + '#lblTeamEndDate').text('-');
                        var selectedEmployeeIdNd = getTeamKraTargetEmployeeIdForAddGoal();
                        var appraisalCycleIdNd = $('#AppCycle :selected').val();
                        var statusTextNoData = $('#ddlKRAStatusForTeam').find(':selected').text().toLowerCase().trim();
                        if (selectedEmployeeIdNd && selectedEmployeeIdNd !== '' && selectedEmployeeIdNd !== '0' && appraisalCycleIdNd && statusTextNoData !== 'submitted' && statusTextNoData !== 'approved') {
                            ApplyAddGoalButtonVisibilityAfterGridLoadTeam([], false);
                        } else {
                            $('[id="btnAddNewGoalTeam"]').hide();
                        }
                        return;
                    }

                    // Remove loader after data is loaded
                    $('.kra-grid-loader-container').remove();

                    // Show the table and its wrapper after loader is removed
                    $table.show();
                    if ($table.parent().hasClass('dataTables_wrapper')) {
                        $table.parent().show();
                    }

                    // Initialize Read More/Read Less handlers for Team Member KRA list
                    initializeReadMoreHandlers();

                    // Initialize Read More/Read Less handlers for Training Requirements column
                    initializeTrainingReadMoreHandlers();
                    
                    // Populate status in footer; dates from EmployeeKRA (min KRAFromDate, max KRAToDate)
                    var teamFooterScope = (ActiveTabId == 'tab_b' || ActiveTabId == 'tab_c') ? ('#' + ActiveTabId + ' ') : '';
                    if (kraDataArray && kraDataArray.length > 0) {
                        ;
                        var firstKRA = kraDataArray[0];
                        var status_result = $.grep(KRAStatusMaster, function (e) { return e.StatusId == firstKRA.KRAStatusId; });
                        var statusText = (status_result.length > 0) ? status_result[0].StatusDescription : 'NA';

                        if (status_result[0].StatusId == 1) {
                            statusText = 'Initialised';
                        } else if (status_result[0].StatusId == 2) {
                            statusText = 'Pending RM approval';
                        }
                        
                        $('#lblTeamKRAStatus').text(statusText);
                        
                        $(teamFooterScope + '#lblTeamKRAStatus').text(statusText);
                        setKRAListFooterDatesFromGoals(kraDataArray, teamFooterScope + '#lblTeamStartDate', teamFooterScope + '#lblTeamEndDate');
                    } else {
                        $(teamFooterScope + '#lblTeamStartDate').text('-');
                        $(teamFooterScope + '#lblTeamEndDate').text('-');
                    }

                // Hide Actions column when status filter is Approved (no actions for approved goals)
                var selectedStatusTextForCol = $('#ddlKRAStatusForTeam').find(':selected').text().toLowerCase().trim();
                var hideActionsColumn = (selectedStatusTextForCol === 'approved');
                var selectedStatusValueForActions = $("#ddlKRAStatusForTeam").val();
                var hasAnyTeamAction = (kraDataArray || []).some(function (r) { return kraTeamRowHasVisibleActions(r, selectedStatusValueForActions); });
                var showActionsColumn = !hideActionsColumn && hasAnyTeamAction;

                // Team grid: Action Plan column only when appraisal cycle id > 11 (same rule as Tab_A tblKRAList)
                var teamAppCycleNum = parseInt($('#AppCycle :selected').val(), 10);
                if (isNaN(teamAppCycleNum) && typeof AppraisalCycleId !== 'undefined' && AppraisalCycleId != null && AppraisalCycleId !== '') {
                    teamAppCycleNum = parseInt(AppraisalCycleId, 10);
                }
                if (isNaN(teamAppCycleNum) && $('#AppCycle').length && $('#AppCycle').val()) {
                    teamAppCycleNum = parseInt($('#AppCycle').val(), 10);
                }
                var showActionPlanColTeam = !isNaN(teamAppCycleNum) && teamAppCycleNum > 11;

                // Remove consolidated training div BEFORE destroying DataTable to avoid DOM conflicts
                var _scope = (ActiveTabId == 'tab_b' || ActiveTabId == 'tab_c') ? '#' + ActiveTabId + ' ' : '';
                $(_scope + '.consolidated-training-section').remove();

                // Destroy existing DataTable instance if it exists
                if ($.fn.DataTable.isDataTable(TableName)) {
                    try {
                        $table.DataTable().destroy();
                    } catch (e) {
                        // If destroy fails, forcefully unwrap the table
                        console.warn('DataTable destroy failed, recovering:', e.message);
                        var $wrapper = $table.closest('.dataTables_wrapper');
                        if ($wrapper.length) {
                            $table.insertBefore($wrapper);
                            $wrapper.remove();
                        }
                    }
                }

                    // Clear any existing table content
                    $table.find('tbody').empty();

                    // Initialize DataTable with error handling
                    try {
                        $table.DataTable({
                            destroy: true,
                            ordering: false,
                            data: kraDataArray,
                        columnDefs: [
                            { targets: 7, visible: showActionsColumn }
                        ],
                        aoColumns: [
                                { mData: "KRAId", visible: false },
                                { mData: "Sequence", visible: false },
                                //{
                                //    mData: "GoalType",
                                //    mRender: function (data, type, full) {
                                //        var result = '';
                                //        if (data == 'O') {
                                //            result = 'Operational';
                                //        } else if (data == 'D') {
                                //            result = 'Developmental';
                                //        } else {
                                //            result = data || '';
                                //        }
                                //        return '<div style="text-align: center;">' + result + '</div>';
                                //    },
                                //    width: "140px",
                                //    className: "text-center"
                                //},
                                {
                                    mData: "GoalType",
                                    width: "11%",
                                    className: "text-left",
                                    mRender: function (data, type, full) {

                                        // Normalize GoalType
                                        var goalType = data || '';
                                        var goalTypeNormalized = goalType.trim().toUpperCase();
                                        if (goalTypeNormalized === 'O' || goalTypeNormalized.startsWith('OPERATIONAL')) {
                                            goalTypeNormalized = 'O';
                                        } else if (goalTypeNormalized === 'D' || goalTypeNormalized.startsWith('DEVELOPMENTAL')) {
                                            goalTypeNormalized = 'D';
                                        } else if (goalTypeNormalized === 'S' || goalTypeNormalized.startsWith('STRATEGIC')) {
                                            goalTypeNormalized = 'S';
                                        }

                                        var goalTypeText = (goalTypeNormalized === 'O') ? 'Operational' : (goalTypeNormalized === 'D') ? 'Developmental' : 'Strategic Goal (AI-Themed)';

                                        return '<div style="text-align: left; padding: 8px;">' + goalTypeText + '</div>';
                                    }
                                },
                                {
                                    mData: "GoalDescription",
                                    width: "22%",
                                    mRender: function (data, type, full) {
                                        var goalText = data || '';
                                        var fullText = goalText;
                                        var displayText = '';

                                        // Count words (approximate - split by spaces)
                                        var words = goalText.split(/\s+/).filter(function (word) { return word.length > 0; });
                                        var wordCount = words.length;
                                        var kraId = full['KRAId'];
                                        var uniqueId = 'goal-desc-tm-' + kraId + '-' + Date.now();

                                        if (wordCount > 10) {
                                            // Show first 10 words with Read More
                                            var truncatedWords = words.slice(0, 10).join(' ');
                                            displayText = truncatedWords + '... <a href="#" class="read-more-link" data-id="' + uniqueId + '" data-full="' + escapeHtml(fullText) + '" style="color: #337ab7; text-decoration: underline; cursor: pointer;">Read more</a>';
                                        } else {
                                            displayText = fullText;
                                        }

                                        return '<div style="text-align: center; padding: 8px;" class="goal-description-content" data-id="' + uniqueId + '" data-full="' + escapeHtml(fullText) + '" data-wordcount="' + wordCount + '">' + displayText + '</div>';
                                    },
                                    className: "text-center"
                                },

                                {
                                    mData: "Measure",
                                    width: "23%",
                                    className: "text-center",
                                    mRender: function (data, type, full) {
                                        var measureText = data || '';
                                        var fullText = measureText;
                                        var displayText = '';

                                        // Count words (approximate - split by spaces) - only count measure text
                                        var words = measureText.split(/\s+/).filter(function (word) { return word.length > 0; });
                                        var wordCount = words.length;
                                        var kraId = full['KRAId'];
                                        var uniqueId = 'measure-tm-' + kraId + '-' + Date.now();

                                        if (wordCount > 10) {
                                            // Show first 10 words with Read More
                                            var truncatedWords = words.slice(0, 10).join(' ');
                                            displayText = truncatedWords + '... <a href="#" class="read-more-link" data-id="' + uniqueId + '" data-full="' + escapeHtml(fullText) + '" style="color: #337ab7; text-decoration: underline; cursor: pointer;">Read more</a>';
                                        } else {
                                            displayText = fullText;
                                        }

                                        return '<div style="text-align: center; padding: 8px;" class="measure-content" data-id="' + uniqueId + '" data-full="' + escapeHtml(fullText) + '" data-wordcount="' + wordCount + '">' + displayText + '</div>';
                                    },
                                },
                                {
                                    mData: "ActionPlan",
                                    visible: showActionPlanColTeam,
                                    width: "22%",
                                    mRender: function (data, type, full) {
                                        var actionPlanHtml = data || '';
                                        // Extract plain text from HTML for word count only
                                        var actionPlanText = $('<div>').html(actionPlanHtml).text();
                                        var fullHtml = actionPlanHtml;
                                        var displayHtml = '';

                                        // Count words (approximate - split by spaces)
                                        var words = actionPlanText.split(/\s+/).filter(function (word) { return word.length > 0; });
                                        var wordCount = words.length;
                                        var kraId = full['KRAId'];
                                        var uniqueId = 'action-plan-tm-' + kraId + '-' + Date.now();

                                        if (wordCount > 10) {
                                            // Show truncated HTML with Read More link
                                            var truncatedWords = words.slice(0, 10).join(' ');
                                            displayHtml = '<div class="truncated-content">' + actionPlanHtml + '</div><a href="#" class="read-more-link" data-id="' + uniqueId + '" style="color: #337ab7; text-decoration: underline; cursor: pointer; display: block; margin-top: 5px;">Read more</a>';
                                        } else {
                                            displayHtml = actionPlanHtml || '<span style="color: #999;">Not specified</span>';
                                        }

                                        return '<div style="text-align: center; padding: 8px;" class="action-plan-content" data-id="' + uniqueId + '" data-full="' + escapeHtml(fullHtml) + '" data-wordcount="' + wordCount + '" data-truncated="' + (wordCount > 10 ? 'true' : 'false') + '">' + displayHtml + '</div>';
                                    },
                                    className: "text-center"
                                },
                                {
                                    mData: "Weightage",
                                    width: "11%",
                                    mRender: function (data, type, full) {
                                        return '<div style="text-align: center; padding: 8px;">' + (data || '') + '</div>';
                                    },
                                    className: "text-center"
                                },
                                //{
                                //    mData: "TrainingRequirements",
                                //    width: "15%",
                                //    mRender: function (data, type, full) {
                                //        // Get training requirements - could be from TrainingRequirements array or single TrainingRequirementName
                                //        var trainingText = '';
                                //        if (full['TrainingRequirements'] && Array.isArray(full['TrainingRequirements']) && full['TrainingRequirements'].length > 0) {
                                //            // Multiple training requirements
                                //            trainingText = full['TrainingRequirements'].map(function(tr) {
                                //                return tr.TrainingRequirementName || tr.Name || 'NA';
                                //            }).join(', ');
                                //        } else if (full['TrainingRequirementName'] && full['TrainingRequirementName'].trim() !== '') {
                                //            // Single training requirement (backward compatibility)
                                //            trainingText = full['TrainingRequirementName'];
                                //        } else {
                                //            trainingText = 'NA';
                                //        }

                                //        if (trainingText === 'NA') {
                                //            return '<div style="text-align: center; padding: 8px;">NA</div>';
                                //        }

                                //        // Count words for Read More/Read Less (5 words)
                                //        var words = trainingText.split(/\s+/).filter(function(word) { return word.length > 0; });
                                //        var wordCount = words.length;
                                //        var kraId = full['KRAId'];
                                //        var uniqueId = 'training-tm-' + kraId + '-' + Date.now();

                                //        if (wordCount > 5) {
                                //            var truncatedWords = words.slice(0, 5).join(' ');
                                //            var displayText = truncatedWords + '... <a href="#" class="read-more-link-training" data-id="' + uniqueId + '" data-full="' + escapeHtml(trainingText) + '" data-wordcount="' + wordCount + '" style="color: #337ab7; text-decoration: underline; cursor: pointer;">Read more</a>';
                                //            return '<div style="text-align: center; padding: 8px;" class="training-content" data-id="' + uniqueId + '" data-full="' + escapeHtml(trainingText) + '" data-wordcount="' + wordCount + '">' + displayText + '</div>';
                                //        } else {
                                //            return '<div style="text-align: center; padding: 8px;" class="training-content" data-id="' + uniqueId + '" data-full="' + escapeHtml(trainingText) + '" data-wordcount="' + wordCount + '">' + trainingText + '</div>';
                                //        }
                                //    },
                                //    className: "text-center"
                                //},
                                {
                                    mRender: function (data, type, full) {
                                        var actions = '';
                                        var status_result = $.grep(KRAStatusMaster, function (e) { return e.StatusId == full['KRAStatusId']; });

                                        if (status_result.length > 0) {
                                            var statusDesc = status_result[0].StatusDescription;
                                            var statusId = status_result[0].StatusId;
                                            var selectedStatusValue = $("#ddlKRAStatusForTeam").val();
                                            var selectedEmployeeId = $('#ddlMyTeamList_KRA').val();

                                            // Check if H1 goal is locked (H2 modification approved)
                                            var isH1Locked = full['IsH1Locked'] === true || full['IsH1Locked'] === 1 || full['IsH1Locked'] === '1';

                                            // If H1 goal is locked, don't show any action buttons
                                            if (isH1Locked) {
                                                return '<span class="text-muted" title="H1 goals are locked because H2 modification has been approved">Locked</span>';
                                            }

                                            // Edit button
                                            if (statusDesc == strKRAStatusInitialised || statusDesc == strKRAStatusRejected ||
                                                (statusDesc == strKRAStatusSubmitted && (selectedStatusValue == '2' || selectedStatusValue == 2))) {
                                                var editTitle = (statusDesc == strKRAStatusSubmitted) ? 'Edit Goal & Training Requirements' : 'Edit';
                                                actions += '<button class="btn btn-info btn-xs btn-round" title="' + editTitle + '" id="btnKRAEditTeam_' + full['KRAId'] + '" onclick="loadKRATeamEditTable(' + full['KRAId'] + ', ' + selectedEmployeeId + ')" style="margin: 2px;"><span class="glyphicon glyphicon-edit"></span></button>';
                                            }

                                            // Delete button (only for Initialised or Rejected)
                                            if (statusDesc == strKRAStatusInitialised || statusDesc == strKRAStatusRejected) {
                                                actions += '<button class="btn btn-danger btn-xs btn-round" title="Delete" id="btnKRADeleteTeam_' + full['KRAId'] + '" onclick="DeleteKRATeamTable(' + full['KRAId'] + ', ' + selectedEmployeeId + ')" style="margin: 2px;"><span class="glyphicon glyphicon-trash"></span></button>';
                                            }
                                        }

                                        return '<div style="text-align: center; white-space: nowrap;">' + actions + '</div>';
                                    },
                                    width: "11%",
                                    className: "text-center",
                                    orderable: false,
                                    searchable: false,
                                    "title": "Actions"
                                }
                            ],
                            order: [[2, "desc"], [1, "asc"]], //order by Goal type, Sequence
                            bFilter: false,  //removes search filter
                            paging: false,  //removes paging header footer
                            LengthChange: false, //removes shwoing entries
                            bInfo: false,
                            autoWidth: false
                        });

                        // Show footer after DataTable is successfully initialized
                        if (ActiveTabId == 'tab_b' || ActiveTabId == 'tab_c') {
                            $('#' + ActiveTabId + ' #tblTeamMemberKRAListFooter').css('display', 'flex').show();
                        } else {
                            $('#tblTeamMemberKRAListFooter').css('display', 'flex').show();
                        }


                        // Check if there are any attachments and show/hide download button accordingly
                        // Call this after DataTable is fully initialized to ensure the button in the cloned header is accessible
                        // Use multiple timeouts to ensure DataTable has fully rendered the header
                        setTimeout(function () {
                            CheckAndToggleDownloadAllAttachmentsButtonTeam(kraDataArray);
                            // Call again after a longer delay to ensure button is visible after all DataTable operations
                            setTimeout(function () {
                                CheckAndToggleDownloadAllAttachmentsButtonTeam(kraDataArray);
                            }, 200);
                        }, 100);
                    } catch (error) {
                        // Remove loader on error
                        $('.kra-grid-loader-container').remove();
                        console.error('Error initializing DataTable:', error);
                        AlertMessage('#divValidationAlert_Team', 'Error loading table data. Please refresh the page.', 'D');
                        // Hide training section on DataTable error
                        if (ActiveTabId == 'tab_b' || ActiveTabId == 'tab_c') {
                            $('#' + ActiveTabId + ' #trainingDetailsSectionTeam').hide();
                        } else {
                            $('#trainingDetailsSectionTeam').hide();
                        }
                    }

                    // Render consolidated training requirements table AFTER DataTable init
                    renderConsolidatedTrainingTable(TableName, kraDataArray);

                    // Show/hide buttons based on status
                    var status_initialised = $.grep(KRAStatusMaster, function (e) { return e.StatusDescription == strKRAStatusInitialised; });
                    var hasInitialisedStatus = false;
                    var hasSubmittedStatus = false;
                    var totalWeightage = 0;

                    // Check status and calculate total weightage
                    $.each(kraDataArray, function (index, data) {
                        var status_result = $.grep(KRAStatusMaster, function (e) { return e.StatusId == data.KRAStatusId; });
                        if (status_result != null && status_result.length > 0) {
                            if (status_result[0].StatusDescription == strKRAStatusInitialised) {
                                hasInitialisedStatus = true;
                            }
                            if (status_result[0].StatusDescription == strKRAStatusSubmitted) {
                                hasSubmittedStatus = true;
                            }
                        }
                        // Add Goal cap: all statuses except Completed (4); Rejected (18) counts toward 100%
                        var sid = parseInt(data.KRAStatusId, 10);
                        if (!isNaN(sid) && sid !== 4) {
                            totalWeightage += parseFloat(data.Weightage || 0);
                        }
                    });
                    
                    // Set flag so UpdateApproveRejectButtonVisibility hides Approve/Reject when loaded goals are all Approved (3) or all Rejected (18)
                    var allApproved = kraDataArray.length > 0 && kraDataArray.every(function (d) { return parseInt(d.KRAStatusId, 10) === 3; });
                    var allRejected = kraDataArray.length > 0 && kraDataArray.every(function (d) { return parseInt(d.KRAStatusId, 10) === 18; });
                    window.loadedTeamMemberKRAAllApprovedOrRejected = (allApproved || allRejected);
                    window.teamMemberGoalsAllApproved = allApproved;
                    
                    // Store team member total weightage for Add Goal validation (block add when >= 100)
                    window.currentTeamMemberTotalWeightage = totalWeightage;
                    
                    // Update button visibility based on dropdown selection and loaded data (centralized logic)
                    UpdateApproveRejectButtonVisibility();

                    var isTeamSubmittedAddGoal = computeIsSubmittedForAddGoalFromKraRows(kraDataArray);
                    ApplyAddGoalButtonVisibilityAfterGridLoadTeam(kraDataArray, isTeamSubmittedAddGoal);

                    // Show/hide Submit button based on data status
                    if (isApproved) {
                        $(SubmitBtn).hide();
                    } else if (isMSubmitted || hasSubmittedStatus) {
                        $(SubmitBtn).hide();
                    } else if (hasInitialisedStatus) {
                        $(SubmitBtn).show(); // Show Submit for Not Submitted goals
                    } else {
                        $(SubmitBtn).show();
                    }
                } else {
                    // Remove loader if error
                    $('.kra-grid-loader-container').remove();
                window.loadedTeamMemberKRAAllApprovedOrRejected = false;
                window.teamMemberGoalsAllApproved = false;
                window.currentTeamMemberTotalWeightage = 0;
                AlertMessage('#divValidationAlert_Team', strKRANotSubmitted, 'D');
                $(TableName).hide();
                $(SubmitBtn).hide();
                    // Hide footer when there's an error
                    var _teamScopeHide1 = (ActiveTabId == 'tab_b' || ActiveTabId == 'tab_c') ? ('#' + ActiveTabId + ' ') : '';
                    $(_teamScopeHide1 + '#lblTeamStartDate').text('-');
                    $(_teamScopeHide1 + '#lblTeamEndDate').text('-');
                    if (ActiveTabId == 'tab_b' || ActiveTabId == 'tab_c') {
                        $('#' + ActiveTabId + ' #tblTeamMemberKRAListFooter').hide();
                        $('#' + ActiveTabId + ' .consolidated-training-section').hide();
                    } else {
                        $('#tblTeamMemberKRAListFooter').hide();
                        $('#tblTeamMemberKRAList_consolidatedTraining').hide();
                    }
                    // Hide download button if no data - CheckAndToggleDownloadAllAttachmentsButtonTeam will handle showing it if attachments exist
                    // Don't hide it here, let the function decide based on attachments
                    // Update button visibility based on dropdown
                    UpdateApproveRejectButtonVisibility();
                    var selectedEmployeeIdH = getTeamKraTargetEmployeeIdForAddGoal();
                    var appraisalCycleIdH = $('#AppCycle :selected').val();
                    var statusTextHasData = $('#ddlKRAStatusForTeam').find(':selected').text().toLowerCase().trim();
                    if (selectedEmployeeIdH && selectedEmployeeIdH !== '' && selectedEmployeeIdH !== '0' && appraisalCycleIdH && statusTextHasData !== 'submitted' && statusTextHasData !== 'approved') {
                        ApplyAddGoalButtonVisibilityAfterGridLoadTeam([], false);
                    } else {
                        $('[id="btnAddNewGoalTeam"]').hide();
                    }
                }
            } else {
                // Remove loader if no data
                $('.kra-grid-loader-container').remove();
                window.loadedTeamMemberKRAAllApprovedOrRejected = false;
                window.teamMemberGoalsAllApproved = false;
                window.currentTeamMemberTotalWeightage = 0;
                // No error message for empty data - just show Add Goal button
                $(TableName).hide();
                $(SubmitBtn).hide();
                // Hide footer when there's no data
                var _teamScopeHide2 = (ActiveTabId == 'tab_b' || ActiveTabId == 'tab_c') ? ('#' + ActiveTabId + ' ') : '';
                $(_teamScopeHide2 + '#lblTeamStartDate').text('-');
                $(_teamScopeHide2 + '#lblTeamEndDate').text('-');
                if (ActiveTabId == 'tab_b' || ActiveTabId == 'tab_c') {
                    $('#' + ActiveTabId + ' #tblTeamMemberKRAListFooter').hide();
                    $('#' + ActiveTabId + ' .consolidated-training-section').hide();
                } else {
                    $('#tblTeamMemberKRAListFooter').hide();
                    $('#tblTeamMemberKRAList_consolidatedTraining').hide();
                }
                // Hide download button if no data - CheckAndToggleDownloadAllAttachmentsButtonTeam will handle showing it if attachments exist
                // Don't hide it here, let the function decide based on attachments
                // Update button visibility based on dropdown
                UpdateApproveRejectButtonVisibility();
                var selectedEmployeeIdE = getTeamKraTargetEmployeeIdForAddGoal();
                var appraisalCycleIdE = $('#AppCycle :selected').val();
                var statusTextEmpty = $('#ddlKRAStatusForTeam').find(':selected').text().toLowerCase().trim();
                if (selectedEmployeeIdE && selectedEmployeeIdE !== '' && selectedEmployeeIdE !== '0' && appraisalCycleIdE && statusTextEmpty !== 'submitted' && statusTextEmpty !== 'approved') {
                    ApplyAddGoalButtonVisibilityAfterGridLoadTeam([], false);
                } else {
                    $('[id="btnAddNewGoalTeam"]').hide();
                }
            }
        }
    }, 100);
}
function fnGetButtonHTML(row) {
    if (row != undefined) {

        var KRAId = 0;
        var FromEmpId = 0;

        KRAId = row.KRAId;
        FromEmpId = row.EmployeeId;

        return '<button type="button" class="btn btn-warning btn-xs btn-round" ' +
            'data-KRAId="' + KRAId + '" data-FromEmpId="' + FromEmpId + '" ' +
            'onclick="fnShowFeedbackModal(this);"><span class="glyphicon glyphicon-pencil" title="Self Assessment"></span></button>';
    }
}

function kraSelfRowHasVisibleActions(full) {
    if (!full) return false;
    var status_result = $.grep(KRAStatusMaster, function (e) { return e.StatusId == full['KRAStatusId']; });
    var statusDesc = status_result.length > 0 ? status_result[0].StatusDescription : '';
    var statusId = status_result.length > 0 ? status_result[0].StatusId : 0;
    var isH1Locked = full['IsH1Locked'] === true || full['IsH1Locked'] === 1 || full['IsH1Locked'] === '1';
    if (isH1Locked) return true;
    if (statusDesc != strKRAStatusCompleted && statusId != 3 && statusId != 2) return true;
    if (statusDesc == strKRAStatusInitialised || statusDesc == strKRAStatusRejected) return true;
    if (full['KRAStatusId'] == 3 && full['Selfassesment'] == null) {
        var button = fnGetButtonHTML(full);
        if (button) return true;
    }
    return false;
}

function kraTeamRowHasVisibleActions(full, selectedStatusValue) {
    if (!full) return false;
    if (selectedStatusValue === undefined || selectedStatusValue === null) {
        selectedStatusValue = $("#ddlKRAStatusForTeam").val();
    }
    var status_result = $.grep(KRAStatusMaster, function (e) { return e.StatusId == full['KRAStatusId']; });
    if (status_result.length === 0) return false;
    var statusDesc = status_result[0].StatusDescription;
    var isH1Locked = full['IsH1Locked'] === true || full['IsH1Locked'] === 1 || full['IsH1Locked'] === '1';
    if (isH1Locked) return true;
    if (statusDesc == strKRAStatusInitialised || statusDesc == strKRAStatusRejected ||
        (statusDesc == strKRAStatusSubmitted && (selectedStatusValue == '2' || selectedStatusValue == 2))) return true;
    return false;
}

function fnShowFeedbackModal(objButton) {
    $(objButton.parentElement).siblings().removeClass('UnreadMessage');
    var url = $('#AssesmentModal').data('url');


    $.get(url, function (data) {
        window.selfAssessmentPendingFiles = [];
        $('#SelfAssesmentContent').html(data);
        $("#hdnKRAId").val($(objButton).attr('data-KRAId'));
        $("#hdnFromEmpId").val($(objButton).attr('data-FromEmpId'));

        $('#AssesmentModal').modal({
            show: true,
            keyboard: false,
            backdrop: 'static'
        });

        // Initialize Summernote editor for txtReply after modal content is loaded
        setTimeout(function () {
            $('#txtReply').summernote({
                height: 150,
                placeholder: 'Your Reply',
                fontNames: ['Arial', 'Arial Black', 'Courier New', 'Helvetica', 'Times New Roman', 'Verdana'],
                icons: {
                    'align': 'glyphicon glyphicon-align-left',
                    'alignCenter': 'glyphicon glyphicon-align-center',
                    'alignJustify': 'glyphicon glyphicon-align-justify',
                    'alignLeft': 'glyphicon glyphicon-align-left',
                    'alignRight': 'glyphicon glyphicon-align-right',
                    'indent': 'glyphicon glyphicon-indent-left',
                    'outdent': 'glyphicon glyphicon-indent-right',
                    'arrowsAlt': 'glyphicon glyphicon-fullscreen',
                    'bold': 'glyphicon glyphicon-bold',
                    'caret': 'glyphicon glyphicon-caret-down',
                    'circle': 'glyphicon glyphicon-record',
                    'close': 'glyphicon glyphicon-remove',
                    'code': 'glyphicon glyphicon-console',
                    'font': 'glyphicon glyphicon-font',
                    'frame': 'glyphicon glyphicon-stop',
                    'italic': 'glyphicon glyphicon-italic',
                    'link': 'glyphicon glyphicon-link',
                    'unlink': 'glyphicon glyphicon-scissors',
                    'magic': 'glyphicon glyphicon-tint',
                    'menuCheck': 'glyphicon glyphicon-check',
                    'minus': 'glyphicon glyphicon-minus',
                    'orderedlist': 'fa fa-list-ol',
                    'pencil': 'glyphicon glyphicon-pencil',
                    'picture': 'glyphicon glyphicon-picture',
                    'question': 'glyphicon glyphicon-question-sign',
                    'redo': 'fa fa-repeat',
                    'square': 'glyphicon glyphicon-unchecked',
                    'strikethrough': 'fa fa-strikethrough',
                    'subscript': 'glyphicon glyphicon-subscript',
                    'superscript': 'glyphicon glyphicon-superscript',
                    'table': 'glyphicon glyphicon-th',
                    'textHeight': 'glyphicon glyphicon-text-height',
                    'trash': 'glyphicon glyphicon-trash',
                    'underline': 'fa fa-underline',
                    'undo': 'fa fa-undo',
                    'unorderedlist': 'glyphicon glyphicon-list',
                    'video': 'glyphicon glyphicon-facetime-video'
                },
                toolbar: [
                    ['style', ['bold', 'italic', 'underline', 'strikethrough']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['view', ['undo', 'redo']]
                ],
                disableDragAndDrop: true,
                callbacks: {
                    onInit: function () {
                        // Reset toolbar button states after initialization
                        setTimeout(function () {
                            $('.note-editor .note-btn').removeClass('active');
                        }, 50);
                    },
                    onKeyup: function () {
                        var $hint = $('#hintReplyLength');
                        if (!$hint.length) return;
                        var isEmpty = $('#txtReply').summernote('isEmpty');
                        var len = isEmpty ? 0 : $('<div>').html($('#txtReply').summernote('code')).text().trim().length;
                        if (len > 2000) {
                            $hint.text('Maximum 2000 characters (currently ' + len + ')').removeClass('text-muted').addClass('text-danger');
                        } else {
                            $hint.text('Maximum 2000 characters').removeClass('text-danger').addClass('text-muted');
                        }
                    },
                    onChange: function () {
                        var $hint = $('#hintReplyLength');
                        if (!$hint.length) return;
                        var isEmpty = $('#txtReply').summernote('isEmpty');
                        var len = isEmpty ? 0 : $('<div>').html($('#txtReply').summernote('code')).text().trim().length;
                        if (len > 2000) {
                            $hint.text('Maximum 2000 characters (currently ' + len + ')').removeClass('text-muted').addClass('text-danger');
                        } else {
                            $hint.text('Maximum 2000 characters').removeClass('text-danger').addClass('text-muted');
                        }
                    },
                    onPaste: function (e) {
                        if (typeof window.pepSummernoteOnPastePlainTextOnly === 'function') {
                            window.pepSummernoteOnPastePlainTextOnly(e);
                        }
                        setTimeout(function () {
                            var $hint = $('#hintReplyLength');
                            if (!$hint.length) return;
                            var isEmpty = $('#txtReply').summernote('isEmpty');
                            var len = isEmpty ? 0 : $('<div>').html($('#txtReply').summernote('code')).text().trim().length;
                            if (len > 2000) {
                                $hint.text('Maximum 2000 characters (currently ' + len + ')').removeClass('text-muted').addClass('text-danger');
                            } else {
                                $hint.text('Maximum 2000 characters').removeClass('text-danger').addClass('text-muted');
                            }
                        }, 0);
                    }
                }
            });
            loadSelfAssessmentExistingAttachmentsIntoModal();
        }, 100);
    });
}

// Allowed file extensions for Self Assessment attachments (documents, images, email, text)
var selfAssessmentAllowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'gif', 'msg', 'eml', 'txt'];
var selfAssessmentMaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB per file
var selfAssessmentAllowedTypesUserMessage = 'Allowed: PDF; Word (.doc, .docx); Excel (.xls, .xlsx); PowerPoint (.ppt, .pptx); images (.jpg, .jpeg, .png, .gif); email (.msg, .eml); text (.txt). Max 10 MB per file.';

function isSelfAssessmentFileTypeAllowed(fileName) {
    if (!fileName || fileName.indexOf('.') === -1) return false;
    var ext = fileName.split('.').pop().toLowerCase();
    return selfAssessmentAllowedExtensions.indexOf(ext) !== -1;
}

function escapeHtmlAttrSelfAssessment(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function selfAssessmentPendingFileKey(file) {
    return file.name + '|' + file.size + '|' + file.lastModified;
}

function renderSelfAssessmentPendingFilesUI(pendingArr, fileInput, $pendingDiv, $countSpan) {
    var dt = new DataTransfer();
    pendingArr.forEach(function (f) {
        dt.items.add(f);
    });
    fileInput.files = dt.files;

    if (pendingArr.length === 0) {
        $countSpan.text('');
        $pendingDiv.empty();
        fileInput.value = '';
        return;
    }

    $countSpan.text('(' + pendingArr.length + ' file' + (pendingArr.length > 1 ? 's' : '') + ' to upload)');
    var parts = [];
    pendingArr.forEach(function (file, idx) {
        var shortRaw = file.name.length > 30 ? file.name.substring(0, 27) + '...' : file.name;
        var shortEsc = $('<div>').text(shortRaw).html();
        var sizeKb = (file.size / 1024).toFixed(2) + ' KB';
        parts.push(
            '<div class="sa-att-row-pending" style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin:6px 0;padding:4px 0;border-bottom:1px solid #eee;">' +
            '<span><i class="glyphicon glyphicon-paperclip"></i> ' + shortEsc + ' <span style="color:#888;">(' + sizeKb + ')</span></span>' +
            '<a href="javascript:void(0);" class="sa-remove-pending text-danger" data-pending-index="' + idx + '" title="Remove">' +
            '<i class="glyphicon glyphicon-remove" aria-hidden="true" style="font-size:12px;"></i>' +
            '</a>' +
            '</div>'
        );
    });
    $pendingDiv.html(parts.join(''));
}

function loadSelfAssessmentExistingAttachmentsIntoModal() {
    var $wrap = $('#selfAssessmentExistingWrap');
    var $container = $('#selfAssessmentExistingFiles');
    if (!$wrap.length || !$container.length) {
        return;
    }
    $container.empty();
    var kraId = parseInt($('#hdnKRAId').val(), 10);
    var employeeId = parseInt($('#hdnFromEmpId').val(), 10);
    var appraisalCycleId = parseInt($('#AppCycle :selected').val(), 10);
    if (!kraId || !employeeId || !appraisalCycleId) {
        $wrap.hide();
        return;
    }

    var selfAssCycleVal = $('#ddlSelfAssCycle :selected').val();
    var selfAssessmentCycleId = selfAssCycleVal ? parseInt(selfAssCycleVal, 10) : null;

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'EmployeeKRA/GetSelfAssessmentAttachmentsByEmployeeCycle?EmployeeId=' + employeeId + '&AppraisalCycleId=' + appraisalCycleId;
    if (selfAssessmentCycleId && !isNaN(selfAssessmentCycleId)) {
        apiPath += '&SelfAssessmentCycleId=' + selfAssessmentCycleId;
    }

    var xhr = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    var res = xhr.responseJSON;
    if (!res || res.Success !== true || !$.isArray(res.Result)) {
        $wrap.hide();
        return;
    }

    var forKra = res.Result.filter(function (a) {
        return parseInt(a.KRAId, 10) === kraId;
    });
    if (forKra.length === 0) {
        $wrap.hide();
        return;
    }

    var html = [];
    forKra.forEach(function (att) {
        var id = att.AttachmentId;
        var name = att.OriginalFileName || 'Attachment';
        var shortRaw = name.length > 40 ? name.substring(0, 37) + '...' : name;
        var shortEsc = $('<div>').text(shortRaw).html();
        var sizeKb = att.FileSize ? ' <span style="color:#888;">(' + (att.FileSize / 1024).toFixed(1) + ' KB)</span>' : '';
        html.push(
            '<div class="sa-att-row" style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin:6px 0;padding:4px 0;border-bottom:1px solid #eee;">' +
            '<span>' +
            '<a href="javascript:void(0);" class="download-sa-modal-attachment" data-attachment-id="' + id + '" data-file-name="' + escapeHtmlAttrSelfAssessment(name) + '">' +
            '<i class="glyphicon glyphicon-download"></i> ' + shortEsc + '</a>' + sizeKb +
            '</span>' +
            '<a href="javascript:void(0);" class="sa-remove-existing text-danger" data-attachment-id="' + id + '" title="Remove">' +
            '<i class="glyphicon glyphicon-remove" aria-hidden="true" style="font-size:12px;"></i>' +
            '</a>' +
            '</div>'
        );
    });
    $container.html(html.join(''));
    $wrap.show();
}

function downloadSelfAssessmentAttachmentFromModal(attachmentId, originalFileName) {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'EmployeeKRA/DownloadSelfAssessmentAttachment?AttachmentId=' + attachmentId;
    var fileName = originalFileName || 'attachment';
    if (typeof toastr !== 'undefined') {
        toastr.info('Downloading attachment...', '', { timeOut: 2000 });
    }
    fetch(apiPath, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue
        }
    })
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Download failed');
            }
            var contentDisposition = response.headers.get('Content-Disposition');
            if (contentDisposition) {
                var fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (fileNameMatch && fileNameMatch[1]) {
                    fileName = fileNameMatch[1].replace(/['"]/g, '');
                    try {
                        fileName = decodeURIComponent(fileName);
                    } catch (e) { /* use as is */ }
                }
            }
            return response.blob().then(function (blob) {
                return { blob: blob, fileName: fileName };
            });
        })
        .then(function (x) {
            var url = window.URL.createObjectURL(x.blob);
            var link = document.createElement('a');
            link.href = url;
            link.style.display = 'none';
            link.setAttribute('download', x.fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            if (typeof toastr !== 'undefined') {
                toastr.success('Attachment downloaded successfully');
            }
        })
        .catch(function () {
            if (typeof toastr !== 'undefined') {
                toastr.error('Failed to download attachment');
            }
        });
}

$(document).on('click', '.download-sa-modal-attachment', function (e) {
    e.preventDefault();
    var id = $(this).attr('data-attachment-id');
    var name = $(this).attr('data-file-name');
    if (id) {
        downloadSelfAssessmentAttachmentFromModal(id, name);
    }
});

$(document).on('click', '.sa-remove-pending', function (e) {
    e.preventDefault();
    e.stopPropagation();
    var idx = parseInt($(this).attr('data-pending-index'), 10);
    if (isNaN(idx) || !window.selfAssessmentPendingFiles) {
        return;
    }
    if (idx < 0 || idx >= window.selfAssessmentPendingFiles.length) {
        return;
    }
    window.selfAssessmentPendingFiles.splice(idx, 1);
    var fileInput = document.getElementById('fileSelfAssessmentAttachment');
    if (fileInput) {
        renderSelfAssessmentPendingFilesUI(window.selfAssessmentPendingFiles, fileInput, $('#selfAssessmentPendingFiles'), $('#selfAssessmentAttachmentCount'));
    }
});

$(document).on('click', '.sa-remove-existing', function (e) {
    e.preventDefault();
    e.stopPropagation();
    var id = $(this).attr('data-attachment-id');
    if (!id) {
        return;
    }
    if (!window.confirm('Remove this uploaded attachment? This cannot be undone.')) {
        return;
    }
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'EmployeeKRA/DeleteSelfAssessmentAttachment?AttachmentId=' + encodeURIComponent(id);
    var xhr = CommonAjaxDELETE(apiPath, CommonGetHeaderInfo());
    var res = xhr.responseJSON;
    if (xhr.status === 200 && res && res.Success === true) {
        $(this).closest('.sa-att-row').remove();
        if ($('#selfAssessmentExistingFiles').children().length === 0) {
            $('#selfAssessmentExistingWrap').hide();
        }
        if (typeof toastr !== 'undefined') {
            toastr.success('Attachment removed');
        }
    } else {
        var msg = 'Failed to remove attachment';
        if (res && (res.ErrorMessage || res.Message)) {
            msg = res.ErrorMessage || res.Message;
        }
        if (typeof toastr !== 'undefined') {
            toastr.error(msg);
        }
    }
});

// Real-time character counter for Self Assessment reply (Summernote editor)
$(document).on('summernote.keyup summernote.change', '#txtReply', function () {
    var $hint = $('#hintReplyLength');
    if (!$hint.length) return;
    var isEmpty = $('#txtReply').summernote('isEmpty');
    var len = isEmpty ? 0 : $('<div>').html($('#txtReply').summernote('code')).text().trim().length;
    if (len > 2000) {
        $hint.text('Maximum 2000 characters (currently ' + len + ')').removeClass('text-muted').addClass('text-danger');
    } else {
        $hint.text('Maximum 2000 characters').removeClass('text-danger').addClass('text-muted');
    }
});

// Setup file selection handler for self-assessment attachments (pending upload only; merges with prior picks)
$(document).on('change', '#fileSelfAssessmentAttachment', function () {
    var fileInput = this;
    var files = fileInput.files;
    var selectedFilesDiv = $('#selfAssessmentPendingFiles');
    var countSpan = $('#selfAssessmentAttachmentCount');
    var maxSize = selfAssessmentMaxFileSizeBytes;

    if (!files || files.length === 0) {
        return;
    }

    if (!window.selfAssessmentPendingFiles) {
        window.selfAssessmentPendingFiles = [];
    }

    var keys = {};
    window.selfAssessmentPendingFiles.forEach(function (f) {
        keys[selfAssessmentPendingFileKey(f)] = true;
    });

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var k = selfAssessmentPendingFileKey(file);
        if (keys[k]) {
            continue;
        }
        if (file.size === 0) {
            toastr.error('File "' + file.name + '" is empty (0 KB) and was not added.');
            continue;
        }
        if (!isSelfAssessmentFileTypeAllowed(file.name)) {
            toastr.error('File "' + file.name + '" is not allowed. ' + selfAssessmentAllowedTypesUserMessage);
            continue;
        }
        if (file.size > maxSize) {
            toastr.error('File "' + file.name + '" exceeds the 10 MB limit.');
            continue;
        }
        window.selfAssessmentPendingFiles.push(file);
        keys[k] = true;
    }

    renderSelfAssessmentPendingFilesUI(window.selfAssessmentPendingFiles, fileInput, selectedFilesDiv, countSpan);
});

//function to SUBMIT selfassessment to Specified KRA
function fnSendAssesment() {
    $('#btnSend').prop('disabled', true);
    CheckSessionTimeOut();

    // Get content from Summernote (note-codable textarea) or plain textarea
    var $txtReply = $('#txtReply');
    var Selfassesment = '';
    if ($txtReply.data('summernote') && typeof $.fn.summernote !== 'undefined') {
        try {
            Selfassesment = $txtReply.summernote('code') || '';
        } catch (e) {
            Selfassesment = $txtReply.val() || '';
        }
    } else {
        Selfassesment = $txtReply.val() || '';
    }
    var KRAId = $("#hdnKRAId").val();
    var fromEmployeeId = $("#hdnFromEmpId").val();

    var loggedinUser = sessionStorage.EmployeeId;
    var apprisalCycleId = $('#AppCycle :selected').val();// sessionStorage.AppraisalCycleId;
    var token = sessionStorage.TokenValue;

    // Required: Summernote empty state is HTML (e.g. <p><br></p>), not a blank string
    var replyPlain = $('<div>').html(Selfassesment).text().replace(/\u00a0/g, ' ').trim();
    var summernoteEmpty = false;
    if ($txtReply.data('summernote') && typeof $.fn.summernote !== 'undefined') {
        try {
            summernoteEmpty = $txtReply.summernote('isEmpty');
        } catch (e2) {
            summernoteEmpty = !replyPlain;
        }
    }
    if (summernoteEmpty || !replyPlain) {
        toastr.error('Comment cannot be empty.');
        $('#btnSend').prop('disabled', false);
        return false;
    }

    if (replyPlain.length > 2000) {
        toastr.error('Self assesment can not exceed 2000 characters.');
        $('#btnSend').prop('disabled', false);
        return false;
    }

    var svrPath = CONFIG.get('SERVERNAME');

    var apiPath = svrPath + "EmployeeKRA/PostSelfAssessment";

    var employeeSelfAssessment = {
        AppraisalCycleId: $('#AppCycle :selected').val(),// sessionStorage.getItem('AppraisalCycleId'),
        KRAId: KRAId,
        EmployeeId: fromEmployeeId,
        Selfassesment: Selfassesment,
        Measure: $('#ddlSelfAssCycle :selected').val() // we only use Measure variable to hold selfassessment Dropdown Id

    };

    $.ajax({
        url: apiPath,
        type: 'POST',
        data: JSON.stringify(employeeSelfAssessment),
        async: true,
        dataType: 'json',
        contentType: 'application/json',
        headers: CommonGetHeaderInfo(),
        success: function (result) {
            // Support both PascalCase and camelCase API response
            var isSuccess = result && (result.Success === true || result.success === true);
            if (isSuccess) {
                // Get SelfAssessmentId from result (support both PascalCase and camelCase)
                var resultData = result.Result || result.result;
                var selfAssessmentId = null;
                if (resultData && (resultData.SelfAssessmentId || resultData.selfAssessmentId)) {
                    selfAssessmentId = resultData.SelfAssessmentId || resultData.selfAssessmentId;
                } else if (resultData && (resultData.id !== undefined)) {
                    selfAssessmentId = resultData.id;
                }

                // Upload attachments if any files were selected
                
                // Upload attachments if any files were selected (only allowed types)
                var fileInput = document.getElementById('fileSelfAssessmentAttachment');
                var filesToUpload = [];
                if (fileInput && fileInput.files && fileInput.files.length > 0 && selfAssessmentId) {
                    for (var i = 0; i < fileInput.files.length; i++) {
                        var f = fileInput.files[i];
                        if (f.size === 0) {
                            toastr.error('File "' + f.name + '" is empty (0 KB) and was skipped.');
                            continue;
                        }
                        if (f.size > selfAssessmentMaxFileSizeBytes) {
                            toastr.error('File "' + f.name + '" exceeds the 10 MB limit and was skipped.');
                            continue;
                        }
                        if (isSelfAssessmentFileTypeAllowed(f.name)) {
                            filesToUpload.push(f);
                        } else {
                            toastr.error('File "' + f.name + '" is not allowed. ' + selfAssessmentAllowedTypesUserMessage);
                        }
                    }
                }

                // Upload all attachments
                if (filesToUpload.length > 0) {
                    var uploadCount = 0;
                    var uploadErrors = [];

                    filesToUpload.forEach(function (file, index) {
                        UploadSelfAssessmentAttachment(
                            selfAssessmentId,
                            KRAId,
                            fromEmployeeId,
                            apprisalCycleId,
                            $('#ddlSelfAssCycle :selected').val(),
                            file,
                            function (uploadSuccess, errorMsg) {
                                uploadCount++;
                                if (!uploadSuccess) {
                                    uploadErrors.push(file.name + ': ' + (errorMsg || 'Upload failed'));
                                }

                                // When all uploads complete
                                if (uploadCount === filesToUpload.length) {
                                    $('#btnSend').prop('disabled', false);
                                    
                                    // Clear file input
                                    if (fileInput) {
                                        fileInput.value = '';
                                        $('#selfAssessmentPendingFiles').empty();
                                        $('#selfAssessmentAttachmentCount').text('');
                                        window.selfAssessmentPendingFiles = [];
                                    }
                                    
                                    var message = uploadErrors.length > 0
                                        ? 'Self Assessment saved, but some attachments failed to upload: ' + uploadErrors.join('; ')
                                        : 'Self Assessment with attachments has been successfully submitted.';
                                    var hasUploadErrors = uploadErrors.length > 0;
                                    $('#AssesmentModal').modal('hide');
                                    // Show success message: in-page banner (use whichever validation div exists on this page)
                                    var alertSel = $('#divValidationAlert').length ? '#divValidationAlert' : '#divValidationAlert_Team';
                                    if (typeof AlertMessage === 'function') {
                                        AlertMessage(alertSel, message, hasUploadErrors ? 'D' : 'S');
                                    }
                                    setTimeout(function () {
                                        if (typeof toastr !== 'undefined') {
                                            if (hasUploadErrors) {
                                                toastr.error(message);
                                            } else {
                                                toastr.success(message);
                                            }
                                        }
                                    }, 450);
                                    
                                    // Refresh the grid to hide the Self Assessment button
                                    var selfAssCycleId = $('#ddlSelfAssCycle :selected').val();
                                    try {
                                        AppraisalCycleId = apprisalCycleId;
                                        BindKRAGrid(EmpId, apprisalCycleId, selfAssCycleId);
                                    } catch (e) {
                                        console.warn('BindKRAGrid after self assessment:', e);
                                    }
                                    
                                    // IMPORTANT: Revalidate Goal Modification button after Self Assessment is saved
                                    setTimeout(function () {
                                        console.log('fnSendAssesment: Self Assessment saved, revalidating Goal Modification button');
                                        ValidateAndShowGoalModificationButton();
                                    }, 300);
                                }
                            }
                        );
                    });
                } else {
                    // No attachments, proceed normally
                    var successMsg = 'Self Assessment has been successfully submitted.';
                    $('#btnSend').prop('disabled', false);
                    $('#AssesmentModal').modal('hide');
                    // Show success message: in-page banner (use whichever validation div exists on this page)
                    var alertSel = $('#divValidationAlert').length ? '#divValidationAlert' : '#divValidationAlert_Team';
                    if (typeof AlertMessage === 'function') {
                        AlertMessage(alertSel, successMsg, 'S');
                    }
                    setTimeout(function () {
                        if (typeof toastr !== 'undefined') {
                            toastr.success(successMsg);
                        }
                    }, 450);

                    // Refresh the grid to hide the Self Assessment button
                    var selfAssCycleId = $('#ddlSelfAssCycle :selected').val();
                    try {
                        AppraisalCycleId = apprisalCycleId;
                        BindKRAGrid(EmpId, apprisalCycleId, selfAssCycleId);
                    } catch (e) {
                        console.warn('BindKRAGrid after self assessment:', e);
                    }
                    
                    // IMPORTANT: Revalidate Goal Modification button after Self Assessment is saved
                    setTimeout(function () {
                        console.log('fnSendAssesment: Self Assessment saved, revalidating Goal Modification button');
                        ValidateAndShowGoalModificationButton();
                    }, 300);
                }
            } else {
                // Handle error response
                var errorMsg = 'Failed to submit Self Assessment. Please try again.';
                if (result && result.ErrorMessage) {
                    errorMsg = result.ErrorMessage;
                } else if (result && result.Result && result.Result.KRAData && result.Result.KRAData.length > 0) {
                    errorMsg = result.Result.KRAData[0].ErrorMessage || errorMsg;
                }
                toastr.error(errorMsg);
                $('#btnSend').prop('disabled', false);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error submitting Self Assessment:', error);
            var errorMsg = 'An error occurred while submitting Self Assessment. Please try again.';
            if (xhr.responseJSON && xhr.responseJSON.ErrorMessage) {
                errorMsg = xhr.responseJSON.ErrorMessage;
            }
            toastr.error(errorMsg);
            $('#btnSend').prop('disabled', false);
        },
        complete: function (xhr, statusText) {
            // Ensure button is re-enabled even if there was an error
            $('#btnSend').prop('disabled', false);
        }
    });

}
function loadEmployeeKRAStatus(SelectedEmpID, SelectedEmployeeName, AppCycleId) {

    $('#ddlKRAStatusForTeam').append($("<option>").val(2).text('Submitted'));
    $('#tblTeamKRAEdit').prop("disabled", true);

    // Store the employee ID globally so it can be auto-selected when dropdown is populated
    if (SelectedEmpID && SelectedEmpID != '0' && SelectedEmpID != '') {
        window.selectedEmployeeIdFromRedirect = SelectedEmpID;
        window.selectedEmployeeNameFromRedirect = SelectedEmployeeName;
        window.selectedAppCycleIdFromRedirect = AppCycleId;
    }

    // First, ensure AppCycle dropdown is set to the correct value
    if (AppCycleId && AppCycleId != '0' && AppCycleId != '') {
        // Wait for AppCycle dropdown to be populated, then set the value
        var checkAppCycle = setInterval(function () {
            if ($('#AppCycle option').length > 0) {
                clearInterval(checkAppCycle);
                // Set the AppCycle dropdown value
                $('#AppCycle').val(AppCycleId);
            }
        }, 100);

        // Clear interval after 5 seconds to avoid infinite loop
        setTimeout(function () {
            clearInterval(checkAppCycle);
        }, 5000);
    }

    // Add the employee directly to dropdown and select it immediately
    // This avoids the error if the API call fails
    setTimeout(function () {
        // Check if employee already exists in dropdown
        var existingOption = $("#ddlMyTeamList_KRA option[value='" + SelectedEmpID + "']");
        if (existingOption.length === 0) {
            // Add the employee option if it doesn't exist
            $("#ddlMyTeamList_KRA").append($("<option>").val(SelectedEmpID).text(SelectedEmployeeName));
        }

        // Select the employee in the dropdown
        $("#ddlMyTeamList_KRA").val(SelectedEmpID);

        // Load the KRA data directly using the AppCycleId parameter
        if ($("#ddlMyTeamList_KRA").val() == SelectedEmpID) {
            ShowMyKRA(SelectedEmpID, 'S', AppCycleId);
        }
    }, 300);

    // Then, try to populate the dropdown from API (but don't show error if it fails during initial load)
    // Set a flag to suppress error messages during initial load
    window.suppressTeamMemberLoadError = true;

    // Set the status dropdown to "Submitted" (value 2) to show employees with submitted KRAs
    $("#ddlKRAStatusForTeam").val(2);

    // Delay the trigger to ensure AppCycle dropdown is populated and has the correct value
    // Check multiple times until AppCycle is ready
    var checkCount = 0;
    var maxChecks = 20; // Check for up to 2 seconds (20 * 100ms)
    var checkInterval = setInterval(function () {
        checkCount++;

        // Check if AppCycle dropdown is populated
        var appCycleVal = $('#AppCycle :selected').val();
        var hasOptions = $('#AppCycle option').length > 0;

        // If dropdown has options but no value selected, try to set it
        if (hasOptions && (!appCycleVal || appCycleVal == '0' || appCycleVal == undefined)) {
            // Try to set the value from AppCycleId parameter
            if (AppCycleId && AppCycleId != '0' && AppCycleId != '' && AppCycleId != undefined) {
                if ($('#AppCycle option[value="' + AppCycleId + '"]').length > 0) {
                    $('#AppCycle').val(AppCycleId);
                    appCycleVal = AppCycleId;
                }
            }
        }

        // Use the AppCycleId parameter directly if dropdown is still not ready
        if (!appCycleVal || appCycleVal == '0' || appCycleVal == undefined) {
            appCycleVal = AppCycleId;
        }

        // Only trigger if we have a valid AppCycleId and dropdown is ready
        if (appCycleVal && appCycleVal != '0' && appCycleVal != '' && appCycleVal != undefined && hasOptions) {
            clearInterval(checkInterval);
            // Ensure AppCycle dropdown has the correct value
            if ($('#AppCycle option[value="' + appCycleVal + '"]').length > 0) {
                $('#AppCycle').val(appCycleVal);
            }
            // Trigger the change event to populate the team member dropdown
            $("#ddlKRAStatusForTeam").trigger('change');
        } else if (checkCount >= maxChecks) {
            // If AppCycle is not ready after max checks, just clear the suppress flag
            clearInterval(checkInterval);
            window.suppressTeamMemberLoadError = false;
            console.warn('AppCycle dropdown not ready after ' + maxChecks + ' checks, skipping team member load');
        }
    }, 100);
}

function loadKRAStatus() {

    $('#ddlKRAStatus').empty();
    $('#ddlKRAStatus').append($("<option>").val(0).text('Select Status:'));
    $.each(KRAStatusMaster, function (index, data) {

        $('#ddlKRAStatus').append($("<option>").val(data.StatusId).text(data.StatusDescription));
    });
    $('#ddlKRAStatusForTeam').empty();
    $('#ddlKRAStatusForTeam').append($("<option>").val(0).text('Select Status:'));
    $.each(KRAStatusMaster, function (index, data) {
        if ((data.StatusId == 2) || (data.StatusId == 3)) {
            $('#ddlKRAStatusForTeam').append($("<option>").val(data.StatusId).text(data.StatusDescription));
        }
    });
    $('#tblTeamKRAEdit #ddlKRAStatus').empty();
    $('#tblTeamKRAEdit #ddlKRAStatus').append($("<option>").val(0).text('Select Status:'));
    $.each(KRAStatusMaster, function (index, data) {

        $('#tblTeamKRAEdit #ddlKRAStatus').append($("<option>").val(data.StatusId).text(data.StatusDescription));
    });
    $('#ddlKRAStatusForTeam').append($("<option>").val(-1).text('Not Submitted'));
    var status_result = $.grep(KRAStatusMaster, function (e) { return e.StatusDescription == strKRAStatusInitialised; });


    if (status_result.length > 0)
        //alert(status_result[0].StatusId);
        $('#ddlKRAStatus').val(status_result[0].StatusId);
    $('#ddlKRAStatus').prop("disabled", true);
    $('#tblTeamKRAEdit #ddlKRAStatus').val(2);
    $('#tblTeamKRAEdit #ddlKRAStatus').prop("disabled", true);


}
function removeOptions(selectbox) {
    var i;
    for (i = selectbox.options.length - 1; i >= 0; i--) {
        selectbox.remove(i);
    }
}
function loadKRATeamEditTable(KRAId, employeeId) {

    // Use employeeId parameter if provided, otherwise get from dropdown
    if (!employeeId || employeeId === 0) {
        employeeId = $('#ddlMyTeamList_KRA').val();
    }

    if (!employeeId || employeeId === '' || employeeId === '0') {
        AlertMessage('#divValidationAlert_Team', 'Please select a team member.', 'D');
        return;
    }

    // Store employeeId for use in update
    $('#tblTeamKRAEdit').data('employeeId', employeeId);

    // Open the modal for editing
    var KRAResult = GetKRAbyId(KRAId);
    if (KRAResult.responseJSON.Success) {
        var EmpKRAData = KRAResult.responseJSON.Result;
        
        // The GetKRAById SP may convert ||| to commas.
        // Override training fields from the team goals DataTable (list API preserves |||).
        var _teamTblSelectors = [];
        var _activePaneId = $('.tab-pane.active').attr('id');
        if (_activePaneId === 'tab_b' || _activePaneId === 'tab_c') {
            _teamTblSelectors.push('#' + _activePaneId + ' #tblTeamMemberKRAList');
        }
        ['#tab_b #tblTeamMemberKRAList', '#tab_c #tblTeamMemberKRAList', '#tblTeamMemberKRAList'].forEach(function (s) {
            if (_teamTblSelectors.indexOf(s) < 0) _teamTblSelectors.push(s);
        });
        OverrideTrainingFieldsFromDataTable(EmpKRAData, _teamTblSelectors);
        
        // Open edit modal with data
        OpenEditGoalModalForTeam(EmpKRAData, employeeId);
    } else {
        AlertMessage('#divValidationAlert_Team', 'Error loading goal data.', 'D');
    }
}

// Legacy function - redirects to common function
function OpenEditGoalModalForTeam(EmpKRAData, employeeId) {
    OpenEditGoalModalCommon(EmpKRAData, 'team', employeeId);
}

// Delete function for team member goals
function DeleteKRATeamTable(KRAId, employeeId) {
    // Use employeeId parameter if provided, otherwise get from dropdown
    if (!employeeId || employeeId === 0) {
        employeeId = $('#ddlMyTeamList_KRA').val();
    }

    if (!employeeId || employeeId === '' || employeeId === '0') {
        AlertMessage('#divValidationAlert_Team', 'Please select a team member.', 'D');
        return false;
    }

    if (!confirm('Are you sure you want to delete this goal?')) {
        return false;
    }

    var loader = CreateLoaderWithFailSafe('Deleting goal...', 30000);

    var result = DeleteKRAbyId(KRAId);
    loader.remove();

    if (result && result.responseJSON && result.responseJSON.Success) {
        // Refresh team member's KRA grid
        var appraisalCycleId = $('#AppCycle :selected').val();
        BindTMKRAGrid(employeeId, appraisalCycleId);
        AlertMessage('#divValidationAlert_Team', strKRADeleteMsg, 'I');
        return true;
    } else {
        AlertMessage('#divValidationAlert_Team', strKRAErrorMsg, 'D');
        return false;
    }
}


/*Button Calls*/
function OnGoalTypeChange() {
    var goalType = $('#ddlGoalType').val().trim();
    if (goalType == 'O') {
        $('#lblKRASequence').text(OpSeqNo);
    } else if (goalType == 'S') {
        $('#lblKRASequence').text(StrategicSeqNo);
    } else {
        $('#lblKRASequence').text(DevSeqNo);
    }
}

function OnGoalTypeChangeModal() {
    var goalType = $('#ddlGoalTypeModal').val();
    if (goalType && typeof goalType === 'string') {
        goalType = goalType.trim().toUpperCase();
        // Normalize GoalType to handle 'O'/'D'/'S' and 'Operational'/'Developmental'/'Strategic'
        if (goalType === 'OPERATIONAL' || goalType.startsWith('OPERATIONAL')) {
            goalType = 'O';
        } else if (goalType === 'DEVELOPMENTAL' || goalType.startsWith('DEVELOPMENTAL')) {
            goalType = 'D';
        } else if (goalType === 'STRATEGIC GOAL (AI-THEMED)' || goalType.startsWith('STRATEGIC')) {
            goalType = 'S';
        } else {
            goalType = goalType.charAt(0).toUpperCase(); // Take first character
        }
    }
    console.log('OnGoalTypeChangeModal called with goalType:', goalType);

    if (goalType == 'O') {
        $('#lblKRASequence').val(OpSeqNo);
        // Hide training requirement field for Operational goals
        $('#trainingRequirementRow').hide();
        ClearTrainingRequirement();
    } else if (goalType == 'S') {
        $('#lblKRASequence').val(StrategicSeqNo);
        // Hide training requirement field for Strategic goals (same as Operational — training is D-only)
        $('#trainingRequirementRow').hide();
        ClearTrainingRequirement();
    } else if (goalType == 'D') {
        $('#lblKRASequence').val(DevSeqNo);
        $('#trainingRequirementRow').show();
        
        // Use the authoritative training data array, not hidden fields (which can be stale)
        var trainingData = GetTrainingDataArray();
        
        // Always show dropdown so users can add (more) training
        $('#ddlTrainingRequirement').show();
        $('#txtTrainingRequirementOther').hide();
        $('#btnAddTrainingOther').hide();
        $('#btnCancelTrainingOther').hide();
        
        if ($('#ddlTrainingRequirement option').length <= 6) {
            LoadTrainingRequirements();
        } else {
            InitializeTrainingRequirementSelect2();
        }
    } else {
        // No goal type selected
        $('#trainingRequirementRow').hide();
        ClearTrainingRequirement();
    }
}

// Unified function to open Add Goal Modal - works for both self and team modes
function OpenAddGoalModalCommon(mode) {

    try {
        mode = mode || 'self'; // Default to 'self' if not specified

        // For team mode, use common modal with team mode flag
        if (mode === 'team') {
            return OpenAddGoalModalManager();
        }

        // For self mode, use employee modal
        // CRITICAL: Clear ALL stored data before opening Add modal
        $('#addGoalModal').removeData('teamMemberId');
        $('#addGoalModal').removeData('isTeamMode');
        $('#addGoalModal').removeData('goalDescription');
        $('#addGoalModal').removeData('measure');
        $('#addGoalModal').removeData('actionPlan');
        $('#addGoalModal').removeData('isEditMode');

        // Clear form and set modal title
        ClearKRAFormModal();
        $('#addGoalModalLabel').text('Add New Goal');
        $('#btnSaveGoalModal').text('Save Goal');
        $('#hdnKRAId').val(''); // Clear KRA ID for new entry

        // Ensure training requirement section is hidden by default
        $('#trainingRequirementRow').hide();

        // Get start and end dates from AppraisalCycle if available, otherwise from localStorage
        var startDate = '';
        var endDate = '';
        if (AppraisalCycle && AppraisalCycle.responseJSON && AppraisalCycle.responseJSON.Result && AppraisalCycle.responseJSON.Result.data) {
            var selectedCycleId = $('#AppCycle :selected').val();
            if (selectedCycleId) {
                $.each(AppraisalCycle.responseJSON.Result.data, function (index, data) {
                    if (data.AppraisalCycleId == selectedCycleId) {
                        startDate = formatDate_DMY(data.StartDate);
                        endDate = formatDate_DMY(data.EndDate);
                        return false; // break the loop
                    }
                });
            }
        }

        // Fallback to localStorage if not found in AppraisalCycle
        if (!startDate && localStorage.getItem('AppraisalCycleStart')) {
            startDate = formatDate_DMY(localStorage.getItem('AppraisalCycleStart'));
        }
        if (!endDate && localStorage.getItem('AppraisalCycleEnd')) {
            endDate = formatDate_DMY(localStorage.getItem('AppraisalCycleEnd'));
        }

        // Set the dates (fields are hidden but still needed for backend)
        if (startDate) {
            $('#txtKRAStartDateModal').val(startDate);
        }
        if (endDate) {
            $('#txtKRAEndDateModal').val(endDate);
        }

        // Show modal - datepicker will be initialized by the modal shown event handler
        if (!ShowAddGoalModal()) {
            AlertMessage('#divValidationAlert', 'Modal not found. Please refresh the page.', 'D');
        }
    } catch (e) {
        console.error('Error in OpenAddGoalModalCommon:', e);
        AlertMessage('#divValidationAlert', 'Error opening modal: ' + e.message, 'D');
    }
}

// Manager-specific function to open Add Goal Modal - now uses common modal
function OpenAddGoalModalManager() {
    ;
    try {
        // Validate that a team member is selected
        var selectedEmployeeId = $('#ddlMyTeamList_KRA').val();
        if (!selectedEmployeeId || selectedEmployeeId === '' || selectedEmployeeId === '0') {
            AlertMessage('#divValidationAlert_Team', 'Please select a team member', 'D');
            return;
        }
        $('#addGoalModal').removeData('goalDescription');
        $('#addGoalModal').removeData('measure');
        $('#addGoalModal').removeData('actionPlan');
        $('#addGoalModal').removeData('isEditMode');
        // Clear form first so ClearKRAFormModal does not wipe team mode data we set next
        ClearKRAFormModal();
        // Store team member ID and team mode in modal data (after clear so they persist)
        $('#addGoalModal').data('teamMemberId', selectedEmployeeId);
        $('#addGoalModal').data('isTeamMode', true);
        
        // Set modal title (using common modal IDs)
        $('#addGoalModalLabel').text('Add New Goal for Team Member');
        $('#btnSaveGoalModal').text('Save Goal');
        $('#hdnKRAId').val(''); // Clear KRA ID for new entry

        // Ensure training requirement section is hidden by default
        $('#trainingRequirementRow').hide();

        // Get start and end dates from AppraisalCycle if available, otherwise from localStorage
        var startDate = '';
        var endDate = '';
        if (AppraisalCycle && AppraisalCycle.responseJSON && AppraisalCycle.responseJSON.Result && AppraisalCycle.responseJSON.Result.data) {
            var selectedCycleId = $('#AppCycle :selected').val();
            if (selectedCycleId) {
                $.each(AppraisalCycle.responseJSON.Result.data, function (index, data) {
                    if (data.AppraisalCycleId == selectedCycleId) {
                        startDate = formatDate_DMY(data.StartDate);
                        endDate = formatDate_DMY(data.EndDate);
                        return false; // break the loop
                    }
                });
            }
        }

        // Fallback to localStorage if not found in AppraisalCycle
        if (!startDate && localStorage.getItem('AppraisalCycleStart')) {
            startDate = formatDate_DMY(localStorage.getItem('AppraisalCycleStart'));
        }
        if (!endDate && localStorage.getItem('AppraisalCycleEnd')) {
            endDate = formatDate_DMY(localStorage.getItem('AppraisalCycleEnd'));
        }

        // Set the dates (fields are hidden but still needed for backend)
        if (startDate) {
            $('#txtKRAStartDateModal').val(startDate);
        }
        if (endDate) {
            $('#txtKRAEndDateModal').val(endDate);
        }

        // Show common modal
        if (!ShowAddGoalModal()) {
            AlertMessage('#divValidationAlert_Team', 'Modal not found. Please refresh the page.', 'D');
            return false;
        }

        return true;
    } catch (e) {
        console.error('Error in OpenAddGoalModalManager:', e);
        AlertMessage('#divValidationAlert_Team', 'Error opening modal: ' + e.message, 'D');
        return false;
    }
}

// Legacy function - redirects to common function
function OpenAddGoalModal() {
    OpenAddGoalModalCommon('self');
}

// Legacy function - redirects to common function
function OpenAddGoalModalTeam() {
    OpenAddGoalModalCommon('team');
}

// Unified function to open Edit Goal Modal - works for both self and team modes
function OpenEditGoalModalCommon(EmpKRAData, mode, employeeId) {
    try {
        mode = mode || 'self'; // Default to 'self' if not specified

        // Handle team mode - set team member data in modal
        if (mode === 'team') {
            if (employeeId) {
                $('#addGoalModal').data('teamMemberId', employeeId);
                $('#addGoalModal').data('isTeamMode', true);
            } else {
                // Try to get from dropdown if not provided
                var selectedEmployeeId = $('#ddlMyTeamList_KRA').val();
                if (selectedEmployeeId && selectedEmployeeId !== '' && selectedEmployeeId !== '0') {
                    $('#addGoalModal').data('teamMemberId', selectedEmployeeId);
                    $('#addGoalModal').data('isTeamMode', true);
                } else {
                    $('#addGoalModal').removeData('teamMemberId');
                    $('#addGoalModal').removeData('isTeamMode');
                }
            }
        } else {
            // For self mode, clear team mode flags
            $('#addGoalModal').removeData('teamMemberId');
            $('#addGoalModal').removeData('isTeamMode');
        }

        // Mark as edit mode
        $('#addGoalModal').data('isEditMode', true);

        // Store full KRA data in modal for later use (including AppraisalCycleId)
        $('#addGoalModal').data('kraData', EmpKRAData);

        // Store AppraisalCycleId in modal data for later use (especially important for manager screen)
        if (EmpKRAData.AppraisalCycleId) {
            $('#addGoalModal').data('appraisalCycleId', EmpKRAData.AppraisalCycleId);
            console.log('Stored AppraisalCycleId from EmpKRAData:', EmpKRAData.AppraisalCycleId);
        } else {
            // Try to get from dropdown or global variables as fallback
            var cycleId = $('#AppCycle :selected').val();
            if (!cycleId || cycleId === '' || cycleId === '0') {
                if (typeof AppraisalCycleId !== 'undefined' && AppraisalCycleId) {
                    cycleId = AppraisalCycleId;
                } else if (typeof ddlAppCycle !== 'undefined' && ddlAppCycle && ddlAppCycle !== '0') {
                    cycleId = ddlAppCycle;
                } else if (typeof ddlAppCycleId !== 'undefined' && ddlAppCycleId && ddlAppCycleId !== '0') {
                    cycleId = ddlAppCycleId;
                }
            }
            if (cycleId && cycleId !== '' && cycleId !== '0') {
                $('#addGoalModal').data('appraisalCycleId', cycleId);
                console.log('Stored AppraisalCycleId from fallback:', cycleId);
            } else {
                console.warn('Could not determine AppraisalCycleId when opening edit modal');
            }
        }
        
    // Populate modal with existing data
    $('#hdnKRAId').val(EmpKRAData.KRAId);
    $('#hdnKRAId').data('statusId', EmpKRAData.KRAStatusId); // Store status ID for later use
    var ow = parseFloat(EmpKRAData.Weightage);
    $('#hdnKRAId').data('originalWeightage', isNaN(ow) ? 0 : ow);
    $('#ddlGoalTypeModal').val(EmpKRAData.GoalType);
    $('#lblKRASequence').val(EmpKRAData.Sequence);
    // Store Summernote content in modal data - will be populated when modal is shown
    $('#addGoalModal').data('goalDescription', EmpKRAData.GoalDescription || '');
    $('#txtGoalWeightageModal').val(EmpKRAData.Weightage);
    $('#addGoalModal').data('measure', EmpKRAData.Measure || '');
    $('#addGoalModal').data('actionPlan', EmpKRAData.ActionPlan || '');

    // Issue 17: Set dates from the selected Appraisal cycle (not from KRA record), so H1/H2 assessment cycle dates are not shown.
    var cycleIdForDates = EmpKRAData.AppraisalCycleId || $('#AppCycle :selected').val();
    var editStartDate = '';
    var editEndDate = '';
    if (AppraisalCycle && AppraisalCycle.responseJSON && AppraisalCycle.responseJSON.Result && AppraisalCycle.responseJSON.Result.data && cycleIdForDates) {
        $.each(AppraisalCycle.responseJSON.Result.data, function (index, data) {
            if (data.AppraisalCycleId == cycleIdForDates && data.StartDate && data.EndDate) {
                editStartDate = formatDate_DMY(data.StartDate);
                editEndDate = formatDate_DMY(data.EndDate);
                return false;
            }
        });
    }
    if (editStartDate && editEndDate) {
        $('#txtKRAStartDateModal').val(editStartDate);
        $('#txtKRAEndDateModal').val(editEndDate);
    } else {
        var dt = new Date(EmpKRAData.KRAFromDate);
        $('#txtKRAStartDateModal').val(formatDate_DMY(dt));
        dt = new Date(EmpKRAData.KRAToDate);
        $('#txtKRAEndDateModal').val(formatDate_DMY(dt));
    }
    
    // Normalize GoalType to handle both 'O'/'D' and 'Operational'/'Developmental'
    var goalType = EmpKRAData.GoalType;
    if (goalType && typeof goalType === 'string') {
            goalType = goalType.trim().toUpperCase();
            if (goalType === 'OPERATIONAL' || goalType.startsWith('OPERATIONAL')) {
                goalType = 'O';
            } else if (goalType === 'DEVELOPMENTAL' || goalType.startsWith('DEVELOPMENTAL')) {
                goalType = 'D';
            } else if (goalType === 'STRATEGIC GOAL (AI-THEMED)' || goalType.startsWith('STRATEGIC')) {
                goalType = 'S';
            } else {
                goalType = goalType.charAt(0).toUpperCase(); // Take first character
            }
        }
    
    // Populate training requirement fields if GoalType is Developmental
    if (goalType === 'D') {
        $('#trainingRequirementRow').show();
        
        // Store training data for later use - ensure proper type conversion
        var trainingItemId = EmpKRAData.TrainingItemId;
        var trainingRequirementName = EmpKRAData.TrainingRequirementName;
        var trainingCategory = EmpKRAData.TrainingCategory; // Get TrainingCategory if available
        
        // Debug logging
        console.log('OpenEditGoalModalCommon - Training data:', {
            TrainingItemId: trainingItemId,
            TrainingItemIdType: typeof trainingItemId,
            TrainingRequirementName: trainingRequirementName,
            TrainingRequirementNameType: typeof trainingRequirementName,
            TrainingCategory: trainingCategory,
            EmpKRAData: EmpKRAData
        });
        
        // Check if training data already exists
        var hasTrainingData = false;
        if (trainingItemId !== null && trainingItemId !== undefined && trainingItemId !== '') {
            var testIds = SplitSafeField(typeof trainingItemId === 'string' ? trainingItemId : trainingItemId.toString());
            hasTrainingData = testIds.length > 0 && testIds.some(function(id) { return id.trim() !== ''; });
        }
        if (!hasTrainingData && trainingRequirementName && trainingRequirementName.trim() !== '') {
            hasTrainingData = true;
        }
        
        if (hasTrainingData) {
            // Clear any existing training list first (but don't hide it - we're about to populate it)
            var $table = $('#selectedTrainingList');
            var $container = $('#selectedTrainingListContainer');
            $table.empty();
            // Ensure table and container are visible before populating
            $table.css('display', 'table').show();
            $container.css('display', 'block').show();
            
            // Initialize empty training data array
            var trainingDataArray = [];
            
            // Split IDs and categories with comma fallback (always safe — numeric / keyword values)
            // Split names with ||| only; comma fallback only when count matches ID count
            var trainingIds = [];
            var trainingNames = [];
            var trainingCategories = [];
            
            if (trainingItemId !== null && trainingItemId !== undefined && trainingItemId !== '') {
                trainingIds = SplitSafeField(typeof trainingItemId === 'string' ? trainingItemId : trainingItemId.toString());
            }
            
            if (trainingCategory && trainingCategory.trim() !== '') {
                trainingCategories = SplitSafeField(trainingCategory);
            }
            
            var expectedCount = Math.max(trainingIds.length, trainingCategories.length);
            
            if (trainingRequirementName && trainingRequirementName.trim() !== '') {
                trainingNames = SplitTrainingNames(trainingRequirementName, expectedCount);
            }
            
            // Ensure all arrays have the same length (pad with empty strings if needed)
            var maxLength = Math.max(trainingIds.length, trainingNames.length, trainingCategories.length);
            while (trainingIds.length < maxLength) {
                trainingIds.push('0');
            }
            while (trainingNames.length < maxLength) {
                trainingNames.push('');
            }
            while (trainingCategories.length < maxLength) {
                trainingCategories.push('');
            }
            
            // Detect legacy comma-separated data (no ||| in IDs means old format)
            var isLegacyData = (trainingItemId && typeof trainingItemId === 'string' && !HasTrainingSeparator(trainingItemId) && trainingItemId.indexOf(',') >= 0);
            
            // Build training data array
            for (var i = 0; i < maxLength; i++) {
                var id = parseInt(trainingIds[i]) || 0;
                var name = trainingNames[i] || '';
                var category = trainingCategories[i] || '';
                
                // Include items with valid IDs even if name is empty (legacy data — names will be looked up from dropdown)
                if (name.trim() !== '' || (isLegacyData && (id > 0 || category !== ''))) {
                    if (id == 0 && !category) {
                        category = name;
                    }
                    
                    trainingDataArray.push({
                        trainingId: id.toString(),
                        trainingName: name.trim(),
                        trainingType: category || ''
                    });
                }
            }
            
            // Store training data array in modal
            SetTrainingDataArray(trainingDataArray);
            
            // Initialize DataTable with the training data
            InitializeSelectedTrainingListDataTable();
            
            // Store comma-separated values in hidden fields for backward compatibility
            $('#hdnTrainingItemId').val(trainingItemId || '0');
            $('#hdnTrainingRequirementName').val(trainingRequirementName || '');
            
            // Show dropdown so user can add more training
            var $dropdown = $('#ddlTrainingRequirement');
            $dropdown.show();
            $('#txtTrainingRequirementOther').hide();
            $('#btnAddTrainingOther').hide();
            $('#btnCancelTrainingOther').hide();
            
            // Callback to fill empty training names from dropdown (for legacy comma-separated data)
            var fillNamesFromDropdown = function() {
                if (!isLegacyData) return;
                var arr = GetTrainingDataArray();
                var updated = false;
                var $dd = $('#ddlTrainingRequirement');
                for (var k = 0; k < arr.length; k++) {
                    if ((!arr[k].trainingName || arr[k].trainingName.trim() === '') && parseInt(arr[k].trainingId) > 0) {
                        var $opt = $dd.find('option[value="' + arr[k].trainingId + '"]');
                        if ($opt.length > 0) {
                            arr[k].trainingName = $opt.text().trim();
                            updated = true;
                        }
                    }
                }
                if (updated) {
                    SetTrainingDataArray(arr);
                    InitializeSelectedTrainingListDataTable();
                }
            };
            
            // Ensure training requirements are loaded (if not already loaded)
            if ($('#ddlTrainingRequirement option').length <= 6) {
                LoadTrainingRequirements(fillNamesFromDropdown);
            } else {
                InitializeTrainingRequirementSelect2();
                fillNamesFromDropdown();
            }
            
            console.log('Training data exists - added to list, showing dropdown for additional training', {
                TrainingItemId: trainingItemId,
                TrainingItemIdType: typeof trainingItemId,
                TrainingRequirementName: trainingRequirementName,
                TrainingRequirementNameType: typeof trainingRequirementName,
                TrainingCategory: trainingCategory,
                EmpKRAData: EmpKRAData
            });
        } else {
            // No training data exists, load dropdown
            var $table = $('#selectedTrainingList');
            var $container = $('#selectedTrainingListContainer');
            $table.empty();
            
            // Clear training data array
            SetTrainingDataArray([]);
            
            // Clear stale hidden fields so shown.bs.modal and OnGoalTypeChangeModal
            // don't pick up values from a previously edited goal
            $('#hdnTrainingItemId').val('');
            $('#hdnTrainingRequirementName').val('');
            
            // Clear and hide DataTable
            if ($.fn.DataTable.isDataTable($table)) {
                $table.DataTable().destroy();
            }
            // In all cases, if TrainingRequirementName has actual content, training data exists
            // (covers "Others" / custom trainings where trainingItemId = 0)
            if (!hasTrainingData && trainingRequirementName && trainingRequirementName.trim() !== '') {
                hasTrainingData = true;
            }
            console.log('[OpenEditGoalModalCommon] hasTrainingData:', hasTrainingData, '| TrainingItemId:', trainingItemId, '| TrainingRequirementName:', trainingRequirementName);

            if (hasTrainingData) {
                // Clear any existing training list first (but don't hide it - we're about to populate it)
                var $table = $('#selectedTrainingList');
                var $container = $('#selectedTrainingListContainer');
                $table.empty();
                // Ensure table and container are visible before populating
                $table.css('display', 'table').show();
                $container.css('display', 'block').show();

                // Initialize empty training data array
                var trainingDataArray = [];

                // Parse separator-separated values for multiple training requirements
                var trainingIds = [];
                var trainingNames = [];
                var trainingCategories = [];

                if (trainingItemId !== null && trainingItemId !== undefined && trainingItemId !== '') {
                    // Check if it's separator-separated (multiple training requirements)
                    if (typeof trainingItemId === 'string' && HasTrainingSeparator(trainingItemId)) {
                        trainingIds = SplitTrainingData(trainingItemId);
                    } else {
                        trainingIds = [trainingItemId.toString()];
                    }
                }

                if (trainingRequirementName && trainingRequirementName.trim() !== '') {
                    // Check if it's separator-separated (multiple training requirements)
                    if (HasTrainingSeparator(trainingRequirementName)) {
                        trainingNames = SplitTrainingData(trainingRequirementName);
                    } else {
                        trainingNames = [trainingRequirementName];
                    }
                }

                // Parse TrainingCategory if available
                if (trainingCategory && trainingCategory.trim() !== '') {
                    if (HasTrainingSeparator(trainingCategory)) {
                        trainingCategories = SplitTrainingData(trainingCategory);
                    } else {
                        trainingCategories = [trainingCategory.trim()];
                    }
                }

                // Ensure all arrays have the same length (pad with empty strings if needed)
                var maxLength = Math.max(trainingIds.length, trainingNames.length, trainingCategories.length);
                while (trainingIds.length < maxLength) {
                    trainingIds.push('0');
                }
                while (trainingNames.length < maxLength) {
                    trainingNames.push('');
                }
                while (trainingCategories.length < maxLength) {
                    trainingCategories.push('');
                }

                // Build training data array
                for (var i = 0; i < maxLength; i++) {
                    var id = parseInt(trainingIds[i]) || 0;
                    var name = trainingNames[i] || '';
                    var category = trainingCategories[i] || '';

                    if (name.trim() !== '') {
                        // If training_id = 0 and category is not available, use name as category
                        if (id == 0 && !category) {
                            category = name;
                        }

                        // Add to training data array
                        trainingDataArray.push({
                            trainingId: id.toString(),
                            trainingName: name.trim(),
                            trainingType: category || ''
                        });
                    }
                }

                // Store training data array in modal
                SetTrainingDataArray(trainingDataArray);

                // Initialize DataTable with the training data
                InitializeSelectedTrainingListDataTable();

                // Store values in hidden fields for backward compatibility
                // IMPORTANT: Do NOT fall back to '0' - empty string signals "no training" to shown.bs.modal handler
                $('#hdnTrainingItemId').val(trainingItemId || '');
                $('#hdnTrainingRequirementName').val(trainingRequirementName || '');

                // Show dropdown so user can add more training
                var $dropdown = $('#ddlTrainingRequirement');
                $dropdown.show();
                $('#txtTrainingRequirementOther').hide();
                $('#btnAddTrainingOther').hide();
                $('#btnCancelTrainingOther').hide();

                // Ensure training requirements are loaded (if not already loaded)
                // Check for default option + 5 static options (Soft Skill, Compliance, Process, Domain, Other)
                if ($('#ddlTrainingRequirement option').length <= 6) {
                    LoadTrainingRequirements();
                } else {
                    // If already loaded, just initialize Select2
                    InitializeTrainingRequirementSelect2();
                }

                console.log('Training data exists - added to list, showing dropdown for additional training', {
                    TrainingItemId: trainingItemId,
                    TrainingRequirementName: trainingRequirementName,
                    TrainingIds: trainingIds,
                    TrainingNames: trainingNames,
                    TotalCount: maxLength
                });
            } else {
                // No training data exists, load dropdown
                var $table = $('#selectedTrainingList');
                var $container = $('#selectedTrainingListContainer');
                $table.empty();

                // Clear training data array
                SetTrainingDataArray([]);

                // Clear and hide DataTable
                if ($.fn.DataTable.isDataTable($table)) {
                    $table.DataTable().destroy();
                }
                $table.hide();
                $container.hide();

                $('#ddlTrainingRequirement').show();
                $('#txtTrainingRequirementOther').hide();
                $('#btnAddTrainingOther').hide();
                $('#btnCancelTrainingOther').hide();

                // Load training requirements dropdown
                LoadTrainingRequirements();
            }
        }
    } else if (goalType === 'O') {
        // GoalType is Operational - hide training requirement section and clear any existing data
        $('#trainingRequirementRow').hide();
        ClearTrainingRequirement();
    } else if (goalType === 'S') {
        // GoalType is Strategic Goal (AI-Themed) - hide training requirement section and clear any existing data
        $('#trainingRequirementRow').hide();
        ClearTrainingRequirement();
    } else {
        // No goal type or unknown - hide training requirement section
        $('#trainingRequirementRow').hide();
        ClearTrainingRequirement();
    }

        // Ensure GoalType dropdown is set correctly and trigger change event to update UI
        $('#ddlGoalTypeModal').val(goalType || EmpKRAData.GoalType);
        // Trigger change event to ensure UI is properly updated (hides/shows training requirement based on GoalType)
        $('#ddlGoalTypeModal').trigger('change');

        // Change modal title and button text (adjust for team mode)
        if (mode === 'team') {
            $('#addGoalModalLabel').text('Edit Goal for Team Member');
        } else {
            $('#addGoalModalLabel').text('Edit Goal');
        }
        $('#btnSaveGoalModal').text('Update Goal');

        $('#modalValidationAlert').hide().text('');

        // Show modal - datepicker will be initialized by the modal shown event handler
        if (!ShowAddGoalModal()) {
            var alertDiv = mode === 'team' ? '#divValidationAlert_Team' : '#divValidationAlert';
            AlertMessage(alertDiv, 'Modal not found. Please refresh the page.', 'D');
        }
    } catch (e) {
        console.error('Error in OpenEditGoalModalCommon:', e);
        var alertDiv = mode === 'team' ? '#divValidationAlert_Team' : '#divValidationAlert';
        AlertMessage(alertDiv, 'Error opening modal: ' + e.message, 'D');
    }
}

// Legacy function - redirects to common function
function OpenEditGoalModal(EmpKRAData) {
    OpenEditGoalModalCommon(EmpKRAData, 'self');
}

function SetupFileAttachmentHandler() {
    // Setup file attachment handler for modal (only once, using jQuery to prevent duplicates)
    // Use event delegation to ensure it works even if modal is dynamically added
    $(document).off('change.fileAttachment', '#fileAttachmentModal');
    $(document).on('change.fileAttachment', '#fileAttachmentModal', function (e) {
        const file = e.target.files[0];
        const attachmentFilename = $('.attachment-filename-modal');

        if (!attachmentFilename.length) {
            console.warn('Attachment filename element not found');
            return;
        }

        if (file) {
            let fileName = file.name;
            const displayName = fileName.length > 20 ? fileName.substring(0, 17) + '...' : fileName;

            // Update display immediately
            attachmentFilename.text(displayName);
            attachmentFilename.attr('title', file.name);
            attachmentFilename.css('color', '#000000'); // Black color for newly selected file

            // Validate file size
            const maxSize = 5 * 1024 * 1024; // 5MB limit
            if (file.size > maxSize) {
                alert('File size must be less than 5MB');
                e.target.value = '';
                attachmentFilename.text('No file selected');
                attachmentFilename.attr('title', '');
                attachmentFilename.css('color', '');
                return;
            }

            console.log('File selected:', file.name, 'Size:', file.size, 'bytes');
        } else {
            attachmentFilename.text('No file selected');
            attachmentFilename.attr('title', '');
            attachmentFilename.css('color', '');
        }
    });
}

function ClearKRAFormModal() {
    $('#hdnKRAId').val('');
    $('#hdnKRAId').removeData('statusId'); // Clear stored status ID
    $('#hdnKRAId').removeData('originalWeightage');
    $('#ddlGoalTypeModal').val('');
    $('#lblKRASequence').val(OpSeqNo);

    // Clear Summernote editors if they are initialized
    if ($('#txtGoalDescModal').data('summernote')) {
        $('#txtGoalDescModal').summernote('code', '');
    }
    if ($('#txtAreaMeasureModal').data('summernote')) {
        $('#txtAreaMeasureModal').summernote('code', '');
    }
    if ($('#txtActionPlanModal').data('summernote')) {
        $('#txtActionPlanModal').summernote('code', '');
    }

    $('#txtGoalWeightageModal').val('');
    // Clear weightage error message
    $('#weightageError').hide().text('');
    // Clear start date (editable field should be blank)
    $('#txtKRAStartDateModal').val('');
    // End date will be set when modal opens (readonly field)

    // Hide and clear training requirement section
    $('#trainingRequirementRow').hide();
    ClearTrainingRequirement();

    $('#modalValidationAlert').hide().text('');
    // Reset modal title and button text
    $('#addGoalModalLabel').text('Add New Goal');
    $('#btnSaveGoalModal').text('Save Goal');

    // CRITICAL: Clear all stored modal data to prevent carryover from edit to add
    $('#addGoalModal').removeData('teamMemberId');
    $('#addGoalModal').removeData('isTeamMode');
    $('#addGoalModal').removeData('goalDescription');
    $('#addGoalModal').removeData('measure');
    $('#addGoalModal').removeData('actionPlan');
    $('#addGoalModal').removeData('isEditMode');
}

// Clear training requirement fields
function ClearTrainingRequirement() {
    var $dropdown = $('#ddlTrainingRequirement');

    // Destroy Select2 if initialized
    if ($dropdown.hasClass('select2-hidden-accessible')) {
        try {
            $dropdown.select2('destroy');
        } catch (e) {
            console.warn('Error destroying Select2:', e);
        }
    }

    // Hide Select2 container
    HideTrainingRequirementSelect2Container();

    $dropdown.val('').hide();
    $('#txtTrainingRequirementOther').val('').hide();
    $('#hdnTrainingItemId').val('');
    $('#hdnTrainingRequirementName').val('');

    var $table = $('#selectedTrainingList');
    var $container = $('#selectedTrainingListContainer');
    $table.empty();

    // Clear training data array
    SetTrainingDataArray([]);

    // Clear and hide DataTable
    if ($.fn.DataTable.isDataTable($table)) {
        $table.DataTable().destroy();
    }
    $table.hide();
    $container.hide();

    // Show the Add button when clearing
    $('#btnAddTrainingRequirement').html('<i class="glyphicon glyphicon-plus"></i> Add').show();
    // Hide Cancel button
    $('#btnCancelTrainingOther').hide();
}

// Load trainings and certifications for dropdown from IPE_Training_List table
function LoadTrainingRequirements(callback) {
    var svrPath = CONFIG.get('SERVERNAME');
    // Load trainings from IPE_Training_List table
    // SERVERNAME already includes "api/", so just append the controller path
    var apiPath = svrPath + "Trainings/GetIPETrainingList";

    console.log('Loading training requirements from:', apiPath);

    CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (response) {
        console.log('Training requirements response:', response);

        var $dropdown = $('#ddlTrainingRequirement');
        $dropdown.empty();
        $dropdown.append($('<option></option>').val('').text('-- Select Training/Certification --'));

        // Add static options with value 0
        $dropdown.append($('<option></option>').val('0').text('Soft Skill'));
        $dropdown.append($('<option></option>').val('0').text('Compliance'));
        $dropdown.append($('<option></option>').val('0').text('Process'));
        $dropdown.append($('<option></option>').val('0').text('Domain'));
        $dropdown.append($('<option></option>').val('0').text('Other'));

        // Check if response has Result property
        if (response && response.Result) {
            if (Array.isArray(response.Result)) {
                console.log('Found', response.Result.length, 'training items');
                $.each(response.Result, function (index, item) {
                    // Check for both TrainingName (from stored procedure alias) and TrainingTitle (direct from DB)
                    var trainingName = item.TrainingName || item.TrainingTitle;
                    var trainingType = item.TrainingType || ''; // Get TrainingType from API response
                    if (item && trainingName) {
                        var $option = $('<option></option>')
                            .val(item.TrainingId)
                            .text(trainingName)
                            .data('training-type', trainingType); // Store TrainingType in data attribute
                        $dropdown.append($option);
                    }
                });
            } else {
                console.warn('Response.Result is not an array:', response.Result);
            }
        } else {
            console.warn('Response does not have Result property or Result is empty:', response);
        }

        console.log('Dropdown populated with', $dropdown.find('option').length, 'options');

        // Initialize Select2 for searchable dropdown, then call callback
        InitializeTrainingRequirementSelect2(function () {
            if (callback && typeof callback === 'function') {
                callback();
            }
        });
    }).fail(function (xhr, status, error) {
        console.error('Error loading training requirements:', error);
        console.error('XHR:', xhr);
        console.error('Status:', status);
        toastr.error('Failed to load training requirements');
        // Even on error, show the dropdown with static options
        var $dropdown = $('#ddlTrainingRequirement');
        $dropdown.empty();
        $dropdown.append($('<option></option>').val('').text('-- Select Training/Certification --'));
        $dropdown.append($('<option></option>').val('0').text('Soft Skill'));
        $dropdown.append($('<option></option>').val('0').text('Compliance'));
        $dropdown.append($('<option></option>').val('0').text('Process'));
        $dropdown.append($('<option></option>').val('0').text('Domain'));
        $dropdown.append($('<option></option>').val('0').text('Other'));

        // Initialize Select2 even on error, then call callback
        InitializeTrainingRequirementSelect2(function () {
            if (callback && typeof callback === 'function') {
                callback();
            }
        });
    });
}

// Helper function to hide Select2 container for training requirement dropdown
function HideTrainingRequirementSelect2Container() {
    var $dropdown = $('#ddlTrainingRequirement');

    // Close dropdown if open (prevents stray overlays capturing scroll)
    if ($dropdown.hasClass('select2-hidden-accessible')) {
        try {
            $dropdown.select2('close');
        } catch (e) {
            // ignore
        }
    }

    // Hide only THIS select2 container (Select2 renders a sibling span)
    var $select2Container = $dropdown.next('.select2');
    if ($select2Container.length > 0) {
        $select2Container.hide();
        $select2Container[0].style.setProperty('display', 'none', 'important');
    }

    // CRITICAL: Ensure modal body remains scrollable after Select2 interaction
    var $modalBody = $dropdown.closest('.modal-body');
    if ($modalBody.length > 0) {
        $modalBody.css({
            'overflow-y': 'auto',
            'pointer-events': 'auto'
        });
    }
}

// Initialize Select2 for searchable dropdown
function InitializeTrainingRequirementSelect2(callback) {
    var $dropdown = $('#ddlTrainingRequirement');

    // Wait for Select2 to be available (with retries)
    var maxRetries = 10;
    var retryCount = 0;
    var retryInterval = 100; // 100ms between retries

    function tryInitialize() {
        if (typeof $.fn.select2 === 'undefined') {
            retryCount++;
            if (retryCount < maxRetries) {
                // Wait a bit and try again
                setTimeout(tryInitialize, retryInterval);
                return;
            } else {
                // Max retries reached, use regular dropdown
                console.warn('Select2 is not available after ' + maxRetries + ' retries, using regular dropdown');
                // Ensure row is visible
                $('#trainingRequirementRow').css('display', 'block').show();
                $dropdown.show();
                if (callback && typeof callback === 'function') {
                    callback();
                }
                return;
            }
        }

        // Select2 is available, proceed with initialization
        initializeSelect2();
    }

    function initializeSelect2() {
        // CRITICAL: Ensure training requirement row is visible before initializing Select2
        $('#trainingRequirementRow').css('display', 'block').show();

        // Check if dropdown still exists in DOM (but don't require it to be visible yet)
        if (!$dropdown.length || !document.body.contains($dropdown[0])) {
            console.warn('Dropdown element not found or not in DOM, skipping Select2 initialization');
            if (callback && typeof callback === 'function') {
                callback();
            }
            return;
        }

        // Make dropdown visible if it's not already
        if (!$dropdown.is(':visible')) {
            $dropdown.css('display', 'block').show();
        }

        // Destroy existing Select2 instance if it exists
        if ($dropdown.hasClass('select2-hidden-accessible')) {
            try {
                // Remove all event handlers before destroying
                $dropdown.off('change select2:open select2:close');
                $dropdown.select2('destroy');
            } catch (e) {
                // Ignore destroy errors
                console.warn('Error destroying Select2:', e);
            }
        }

        // Wait a bit to ensure modal is fully rendered
        setTimeout(function () {
            // Ensure row is still visible
            $('#trainingRequirementRow').css('display', 'block').show();

            // Double-check dropdown still exists before initializing (but don't require visibility)
            if (!$dropdown.length || !document.body.contains($dropdown[0])) {
                console.warn('Dropdown element removed before Select2 initialization');
                if (callback && typeof callback === 'function') {
                    callback();
                }
                return;
            }

            // Make dropdown visible if it's not already
            if (!$dropdown.is(':visible')) {
                $dropdown.css('display', 'block').show();
            }

            try {
                // Initialize Select2 with dropdown rendered inside the modal.
                // This prevents Bootstrap modal focus/scroll issues caused by Select2 attaching to <body>.
                var $modal = $dropdown.closest('.modal');
                var select2Options = {
                    placeholder: '-- Select Training/Certification --',
                    allowClear: true,
                    width: '100%',
                    dropdownAutoWidth: false,
                    dropdownParent: $modal.length ? $modal : undefined
                };

                $dropdown.select2(select2Options);

                // Handle Select2 dropdown positioning and scroll behavior
                $dropdown.on('select2:open', function () {
                    var $select2Dropdown = $('.select2-dropdown');
                    var $select2Container = $('.select2-container--open');

                    if ($select2Dropdown.length && $select2Container.length) {
                        // Set high z-index to appear above modal footer
                        $select2Container.css('z-index', '99999');
                        $select2Dropdown.css('z-index', '99999');
                    }

                    // CRITICAL: Ensure modal body remains scrollable when dropdown opens
                    var $modalBody = $(this).closest('.modal-body');
                    if ($modalBody.length > 0) {
                        $modalBody.css({
                            'overflow-y': 'auto',
                            'pointer-events': 'auto'
                        });
                    }
                });

                // Handle Select2 close to ensure modal scroll is restored
                $dropdown.on('select2:close', function () {
                    var $modalBody = $(this).closest('.modal-body');
                    if ($modalBody.length > 0) {
                        $modalBody.css({
                            'overflow-y': 'auto',
                            'pointer-events': 'auto'
                        });
                    }
                });

                // Call callback after Select2 is initialized
                if (callback && typeof callback === 'function') {
                    callback();
                }
            } catch (e) {
                console.error('Error initializing Select2:', e);
                // If Select2 fails, fall back to regular dropdown (only if element still exists)
                if ($dropdown.length && document.body.contains($dropdown[0])) {
                    $dropdown.show();
                }
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        }, 100);
    }

    // Start the initialization attempt
    tryInitialize();
}

// Set training requirement value (used when editing)
function SetTrainingRequirementValue(trainingItemId, trainingRequirementName) {
    console.log('SetTrainingRequirementValue called with:', {
        trainingItemId: trainingItemId,
        trainingItemIdType: typeof trainingItemId,
        trainingRequirementName: trainingRequirementName
    });

    var $dropdown = $('#ddlTrainingRequirement');

    // Convert trainingItemId to number if it's a string
    var numericTrainingItemId = null;
    if (trainingItemId != null && trainingItemId !== undefined && trainingItemId !== '') {
        numericTrainingItemId = parseInt(trainingItemId);
        if (isNaN(numericTrainingItemId)) {
            numericTrainingItemId = null;
        }
    }

    console.log('Converted trainingItemId:', numericTrainingItemId);
    console.log('Dropdown options count:', $dropdown.find('option').length);
    console.log('Dropdown options:', $dropdown.find('option').map(function () {
        return { value: $(this).val(), text: $(this).text() };
    }).get());

    if (numericTrainingItemId && numericTrainingItemId > 0) {
        // Training selected from dropdown
        $('#hdnTrainingItemId').val(numericTrainingItemId);
        $('#hdnTrainingRequirementName').val(trainingRequirementName || '');

        // Check if the option exists in the dropdown
        var optionExists = $dropdown.find('option[value="' + numericTrainingItemId + '"]').length > 0;
        console.log('Option exists for value', numericTrainingItemId, ':', optionExists);

        if (!optionExists) {
            console.warn('Option not found in dropdown for TrainingItemId:', numericTrainingItemId);
            // Option doesn't exist, show the dropdown so user can see it's not selected
            $dropdown.show();
            $('#btnAddTrainingRequirement').show();
            return;
        }

        // Set value - use Select2 API if Select2 is initialized, otherwise use regular val()
        if ($dropdown.hasClass('select2-hidden-accessible')) {
            // Select2 is initialized, use Select2's API
            // Convert to string for Select2 (it expects string values)
            $dropdown.val(String(numericTrainingItemId)).trigger('change');
            console.log('Set Select2 value to:', String(numericTrainingItemId));

            // Verify the value was set
            setTimeout(function () {
                var currentValue = $dropdown.val();
                console.log('Select2 current value after setting:', currentValue);
            }, 100);
        } else {
            // Regular dropdown - convert to string for comparison
            $dropdown.val(String(numericTrainingItemId));
            console.log('Set dropdown value to:', String(numericTrainingItemId));

            // Verify the value was set
            var currentValue = $dropdown.val();
            console.log('Dropdown current value after setting:', currentValue);
        }

        // Get the selected text
        var selectedText = trainingRequirementName;
        if (!selectedText) {
            var selectedOption = $dropdown.find('option[value="' + numericTrainingItemId + '"]');
            if (selectedOption.length > 0) {
                selectedText = selectedOption.text();
            }
        }

        console.log('Selected text:', selectedText);

        // Add to list and show dropdown for additional training
        if (selectedText) {
            AddTrainingRequirementToList(numericTrainingItemId, selectedText);
        }
        $dropdown.show();
        $('#btnAddTrainingRequirement').html('<i class="glyphicon glyphicon-plus"></i> Add').show();

        console.log('Training requirement set - added to list, showing dropdown for additional training');
    } else if (trainingRequirementName && trainingRequirementName.trim() !== '') {
        // Others option selected
        console.log('Setting "Others" option with name:', trainingRequirementName);
        $('#hdnTrainingItemId').val(0);
        $('#hdnTrainingRequirementName').val(trainingRequirementName);

        // Add to list and show dropdown for additional training
        AddTrainingRequirementToList(0, trainingRequirementName);
        $dropdown.show();
        $('#btnAddTrainingRequirement').html('<i class="glyphicon glyphicon-plus"></i> Add').show();
    } else {
        // No training requirement set
        console.log('No training requirement set');
        ClearTrainingRequirement();
        $dropdown.show();
        // Show the Add button when no training is selected
        $('#btnAddTrainingRequirement').show();
    }
}

// Function to get training data array from modal
function GetTrainingDataArray() {
    var trainingData = $('#addGoalModal').data('trainingData');
    if (!trainingData || !Array.isArray(trainingData)) {
        trainingData = [];
        $('#addGoalModal').data('trainingData', trainingData);
    }
    return trainingData;
}

// Function to set training data array in modal
function SetTrainingDataArray(trainingData) {
    $('#addGoalModal').data('trainingData', trainingData || []);
}

/** Normalize goal type from modal / inline dropdown to single letter O, D, or S (matches server expectations). */
function NormalizeModalGoalType(raw) {
    if (raw === null || raw === undefined) return '';
    var g = String(raw).trim().toUpperCase();
    if (!g) return '';
    if (g === 'OPERATIONAL' || g.indexOf('OPERATIONAL') === 0) return 'O';
    if (g === 'DEVELOPMENTAL' || g.indexOf('DEVELOPMENTAL') === 0) return 'D';
    if (g === 'STRATEGIC GOAL (AI-THEMED)' || g.indexOf('STRATEGIC') === 0) return 'S';
    return g.charAt(0);
}

// Function to ensure training list table is visible (used after validation errors)
function EnsureTrainingListTableVisible() {
    var $table = $('#selectedTrainingList');
    var $container = $('#selectedTrainingListContainer');
    var trainingData = GetTrainingDataArray();

    // Only show if there's data
    if (trainingData && trainingData.length > 0) {
        $container.css({
            'display': 'block',
            'visibility': 'visible'
        }).show();

        $table.css({
            'display': 'table',
            'visibility': 'visible'
        }).show();

        console.log('Ensured training list table visibility after validation error');
    }
}

// Function to initialize/update the selectedTrainingList DataTable
function InitializeSelectedTrainingListDataTable() {
    ;
    var $table = $('#selectedTrainingList');
    var $container = $('#selectedTrainingListContainer');
    var $dropdown = $('#ddlTrainingRequirement');

    // Get training data from modal data attribute
    var trainingData = GetTrainingDataArray();

    // Destroy existing DataTable if it exists
    if ($.fn.DataTable.isDataTable($table)) {
        $table.DataTable().destroy();
    }

    // CRITICAL: Ensure modal body remains scrollable during DataTable operations
    var $modalBody = $table.closest('.modal-body');
    if ($modalBody.length > 0) {
        $modalBody.css({
            'overflow-y': 'auto',
            'pointer-events': 'auto'
        });
    }

    // Clear tbody
    $table.find('tbody').empty();

    if (trainingData.length > 0) {
        // Show container and table without removing inline styles
        $container.show();
        $table.show();

        // CRITICAL FIX: Close Select2 dropdown before initializing DataTable
        // This prevents the dropdown from blocking scroll when table appears
        if ($dropdown.hasClass('select2-hidden-accessible')) {
            try {
                $dropdown.select2('close');
            } catch (e) {
                console.warn('Error closing Select2:', e);
            }
        }

        // Initialize DataTable with training data
        // Do NOT use scrollY/scrollX - parent modal-body handles scrolling
        $table.DataTable({
            data: trainingData,
            destroy: true,
            paging: false,
            searching: false,
            ordering: false,
            info: false,
            autoWidth: false,
            dom: 't',  // Only show table, hide DataTable controls
            columns: [
                {
                    title: "Training Name",
                    data: "trainingName",
                    className: "text-center"
                },
                {
                    title: "Training Type",
                    data: "trainingType",
                    className: "text-center",
                    render: function (data, type, row) {
                        if (!data) {
                            return '-';
                        }
                        // Map TrainingCategory values to display text
                        var trainingCategory = data.toLowerCase();
                        if (trainingCategory === 'lp') {
                            return 'Learning path';
                        } else if (trainingCategory === 'course') {
                            return 'Course';
                        } else {
                            return data; // Return original value if not 'lp' or 'course'
                        }
                    }
                },
                {
                    title: "Action",
                    data: null,
                    className: "text-center",
                    orderable: false,
                    render: function (data, type, row, meta) {
                        // Use row INDEX (meta.row) for deletion - avoids HTML-encoding mismatch bugs
                        // that occur when training names contain special characters (&, ', etc.)
                        return '<a href="javascript:void(0);" onclick="RemoveTrainingRequirementFromListByIndex(' +
                            meta.row + ')" title="Remove" style="color: #d9534f; font-size: 16px; cursor: pointer; text-decoration: none;">' +
                            '<i class="glyphicon glyphicon-remove"></i>' +
                            '</a>';
                    }
                }
            ]
        });

        console.log('DataTable initialized with', trainingData.length, 'items.');
    } else {
        // Hide container if no data
        $container.hide();
        console.log('No training data, hiding container');
    }
}

// Helper function to add a training requirement to the list
function AddTrainingRequirementToList(trainingItemId, trainingName, categoryName, trainingType) {
    // Get current training data array
    var trainingData = GetTrainingDataArray();

    // Determine the training type to display
    var displayTrainingType = '';
    if (trainingItemId == 0 && categoryName) {
        // Custom training - use category name
        displayTrainingType = categoryName;
    } else if (trainingItemId > 0 && trainingType) {
        // Regular training - use TrainingType from database
        displayTrainingType = trainingType;
    }
    
    // Duplicate check only for items with a real ID (trainingItemId > 0).
    // Custom/Other entries (trainingItemId == 0) are always allowed.
    if (trainingItemId > 0) {
        for (var i = 0; i < trainingData.length; i++) {
            if (parseInt(trainingData[i].trainingId) == trainingItemId) {
                toastr.warning('This training requirement is already added');
                return;
            }
        }
    }
    
    // Add new training item to array
    trainingData.push({
        trainingId: trainingItemId.toString(),
        trainingName: trainingName,
        trainingType: displayTrainingType
    });

    // Save updated array
    SetTrainingDataArray(trainingData);

    // Initialize/update DataTable
    InitializeSelectedTrainingListDataTable();

    // Reset dropdown
    var $dropdown = $('#ddlTrainingRequirement');
    if ($dropdown.hasClass('select2-hidden-accessible')) {
        $dropdown.val(null).trigger('change');
    } else {
        $dropdown.val('');
        // Re-initialize Select2 if it was destroyed
        if ($dropdown.find('option').length > 2) {
            InitializeTrainingRequirementSelect2();
        }
    }
    $dropdown.show();
}

// Helper function to remove a training requirement from the list (legacy - kept for backward compatibility)
function RemoveTrainingRequirementFromList(button) {
    // This function is no longer used since we removed spans, but kept for any legacy code
    // The DataTable uses RemoveTrainingRequirementFromListByData instead
    console.warn('RemoveTrainingRequirementFromList called but spans are no longer used');
}

// Helper function to remove a training requirement from the list by INDEX (primary - used by DataTable)
// Uses row index from DataTables meta.row - immune to HTML-encoding / strict-equality mismatch issues
function RemoveTrainingRequirementFromListByIndex(rowIndex) {

    ; // Diagnostic: open browser DevTools to step through this
    var idx = parseInt(rowIndex);
    var trainingData = GetTrainingDataArray();

    console.log('[RemoveTrainingRequirementFromListByIndex] rowIndex:', idx, 'trainingData:', JSON.stringify(trainingData));

    if (isNaN(idx) || idx < 0 || idx >= trainingData.length) {
        console.error('[RemoveTrainingRequirementFromListByIndex] Invalid index:', idx, '(array length:', trainingData.length, ')');
        return;
    }

    // Remove the item at the given index (create a new array - do not mutate)
    var updatedData = trainingData.filter(function (item, i) { return i !== idx; });

    console.log('[RemoveTrainingRequirementFromListByIndex] updatedData after removal:', JSON.stringify(updatedData));

    SetTrainingDataArray(updatedData);

    // CRITICAL: When array is empty after removal, also clear the hidden fields.
    // If left as '0'/non-empty, the shown.bs.modal handler falsely detects existing training
    // and skips LoadTrainingRequirements(), leaving the dropdown in a broken state on re-open.
    if (updatedData.length === 0) {
        $('#hdnTrainingItemId').val('');
        $('#hdnTrainingRequirementName').val('');
        console.log('[RemoveTrainingRequirementFromListByIndex] Training array is now empty - cleared hidden fields');
    }

    InitializeSelectedTrainingListDataTable();
}

// Helper function to remove a training requirement from the list by data (legacy - kept for backward compatibility)
// NOTE: This function may silently fail when training names contain HTML-encoded characters.
// Use RemoveTrainingRequirementFromListByIndex instead.
function RemoveTrainingRequirementFromListByData(trainingId, trainingName) {
    ; // Diagnostic: if this is still being called, the render function was not updated
    var trainingData = GetTrainingDataArray();

    console.log('[RemoveTrainingRequirementFromListByData] trainingId:', trainingId, 'trainingName:', trainingName, 'trainingData:', JSON.stringify(trainingData));

    // Find and remove the matching training item
    var updatedData = [];
    for (var i = 0; i < trainingData.length; i++) {
        var item = trainingData[i];
        // Trim both sides to guard against whitespace differences
        var storedName = (item.trainingName || '').trim();
        var passedName = (trainingName || '').trim();
        var idMatch = String(item.trainingId) === String(trainingId);
        var nameMatch = storedName === passedName;

        console.log('[RemoveTrainingRequirementFromListByData] row', i, '- idMatch:', idMatch, 'nameMatch:', nameMatch, '| stored:', storedName, '| passed:', passedName);

        if (!(idMatch && nameMatch)) {
            updatedData.push(item);
        }
    }

    console.log('[RemoveTrainingRequirementFromListByData] updatedData:', JSON.stringify(updatedData));

    SetTrainingDataArray(updatedData);
    InitializeSelectedTrainingListDataTable();
}

// Handle dropdown change - auto-add when selection is made
function HandleTrainingRequirementDropdownChange() {
    var $dropdown = $('#ddlTrainingRequirement');
    var selectedValue = $dropdown.val();

    // CRITICAL: Ensure modal body is scrollable after dropdown interaction
    var $modalBody = $dropdown.closest('.modal-body');
    if ($modalBody.length > 0) {
        $modalBody.css({
            'overflow-y': 'auto',
            'pointer-events': 'auto'
        });
    }

    // If no value selected, return earlyzzz
    if (!selectedValue || selectedValue === '') {
        return;
    }

    // Check if any static option is selected (value is '0' or 0)
    // Static options: Soft Skill, Compliance, Process, Domain, Other
    // All static options work like "Others" - show textbox for custom name
    if (selectedValue === '0' || selectedValue === 0) {
        // Store the selected option text (Soft Skill, Compliance, etc.) for reference
        var selectedOptionText = $dropdown.find('option:selected').text();
        $('#txtTrainingRequirementOther').data('category', selectedOptionText);

        // CRITICAL FIX: DO NOT destroy Select2 - just hide the container
        // This keeps scroll working like .Net Developer selection
        var $select2Container = $dropdown.next('.select2');
        if ($select2Container.length > 0) {
            $select2Container.hide();
        }

        // Hide the original dropdown
        $dropdown.hide();

        // Show textbox for all static options with Add and Cancel buttons
        $('#txtTrainingRequirementOther').attr('placeholder', 'Enter ' + selectedOptionText.toLowerCase() + ' name').show().focus();
        $('#btnAddTrainingOther').show();
        $('#btnCancelTrainingOther').show();

        // Ensure scroll remains enabled (same as .Net Developer flow)
        if ($modalBody.length > 0) {
            $modalBody.css({
                'overflow-y': 'auto',
                'pointer-events': 'auto'
            });
        }
    } else {
        // Selected from dropdown (non-static option) - automatically add it to the list
        var selectedText = $dropdown.find('option:selected').text();
        var trainingItemId = parseInt(selectedValue);
        var trainingType = $dropdown.find('option:selected').data('training-type') || ''; // Get TrainingType from option data

        // Add to list with TrainingType (for training_id != 0)
        AddTrainingRequirementToList(trainingItemId, selectedText, null, trainingType);
    }
}

// Handle Add Training Requirement button click (legacy - kept for backward compatibility)
function HandleAddTrainingRequirement() {
    HandleTrainingRequirementDropdownChange();
}

// Handle Save for Others textbox (Enter key or focus out)
function HandleSaveTrainingOther() {
    var otherName = $('#txtTrainingRequirementOther').val().trim();

    if (!otherName || otherName === '') {
        toastr.warning('Please enter a training/certification name');
        return;
    }

    // Get the category (Soft Skill, Compliance, Process, Domain, Other) if stored
    var category = $('#txtTrainingRequirementOther').data('category') || '';

    // Add to list (0 indicates static option)
    // Pass the category name (dropdown text) as the third parameter
    // The name entered by user is the course name, category is the dropdown selection
    AddTrainingRequirementToList(0, otherName, category);

    // CRITICAL FIX: DO NOT destroy Select2 - just show it back (same as .Net Developer flow)
    // Hide Select2 container is no longer needed - just show dropdown
    var $dropdown = $('#ddlTrainingRequirement');

    // Reset and show dropdown again (Select2 stays intact)
    $dropdown.show();

    // Show Select2 container if hidden
    var $select2Container = $dropdown.next('.select2');
    if ($select2Container.length > 0) {
        $select2Container.show();
    }

    $('#txtTrainingRequirementOther').val('').removeData('category').attr('placeholder', 'Enter training/certification name').hide();
    $('#btnAddTrainingOther').hide();
    $('#btnCancelTrainingOther').hide();

    // CRITICAL: Restore modal scroll immediately (same as .Net Developer flow)
    var $modalBody = $dropdown.closest('.modal-body');
    if ($modalBody.length > 0) {
        $modalBody.css({
            'overflow-y': 'auto',
            'pointer-events': 'auto'
        });
    }

    // Reset dropdown value
    if ($dropdown.hasClass('select2-hidden-accessible')) {
        $dropdown.val(null).trigger('change');
    } else {
        $dropdown.val('');
    }
}

// Handle Remove Training button
function HandleRemoveTraining() {
    var $dropdown = $('#ddlTrainingRequirement');

    // Hide the selected training display
    $('#selectedTrainingDisplay').hide();

    // Destroy Select2 if initialized
    if ($dropdown.hasClass('select2-hidden-accessible')) {
        $dropdown.select2('destroy');
    }

    // Clear the training requirement data
    ClearTrainingRequirement();

    // Show the dropdown and Add button
    $dropdown.show();
    $('#btnAddTrainingRequirement').html('<i class="glyphicon glyphicon-plus"></i> Add').show();
    // Hide Cancel button
    $('#btnCancelTrainingOther').hide();

    // Ensure training requirements are loaded if not already loaded
    // Check for default option + 5 static options (Soft Skill, Compliance, Process, Domain, Other)
    if ($dropdown.find('option').length <= 6) {
        LoadTrainingRequirements();
    } else {
        // Re-initialize Select2 after showing if options are already loaded
        InitializeTrainingRequirementSelect2();
    }

    console.log('Training removed - showing dropdown');
}

function SaveKRAForm() {

    //if in submitted state or approved. prompt to complete in order to add new KRA's
    var isvalid = true;

    var kraEndDate = foramtDate_DMY2YMD($('#txtKRAEndDate').val());
    var btnKRAUpdate = $('#btnKRAUpdate').val();
    var kRAId = $('#hdnKRAId').val();
    var goalType = $('#ddlGoalType').val();
    var goalSequence = $('#lblKRASequence').text();
    var goalDescription = $('#txtGoalDesc').val();
    var weightage = $('#txtGoalWeightage').val().trim();
    var actionStep = '';//$('#txtAreaActionSteps').val();
    var measure = $('#txtAreaMeasure').val();
    var kraStartDate = foramtDate_DMY2YMD($('#txtKRAStartDate').val());
    var targetDate = kraEndDate; //$('#txtTargetDate').val();
    var status_result;
    $("#divValidationAlert").hide();
    if ($('#ddlGoalType').is('[disabled]')) {       //check if the fields are disabled
        if (kraEndDate.trim() == '') {
            AlertMessage('#divValidationAlert', strKRAEmptyFieldValidation, 'D');
            isvalid = false;
            return false;
        }
        if (isvalid) {
            status_result = $.grep(KRAStatusMaster, function (e) { return e.StatusDescription == strKRAStatusCompleted; });
        }
    } else {
        if (goalDescription.trim() == '' || weightage.trim() == '' || measure.trim() == '' || kraStartDate.trim() == '' || kraEndDate.trim() == '') {
            AlertMessage('#divValidationAlert', strKRAEmptyFieldValidation, 'D');
            isvalid = false;
            return false;
        } else {
            // Validate minimum weightage (10%)
            if (weightage < 10) {
                AlertMessage('#divValidationAlert', 'Weightage must be at least 10%', 'D');
                isvalid = false;
                return false;
            }
            
            if (PermissableInsert > 0) {
                if (weightage > PermissableInsert || weightage <= 0) {
                    AlertMessage('#divValidationAlert', strKRANumberRangeValidation + ' 0 to ' + PermissableInsert, 'D');
                    isvalid = false;
                    return false;
                }
            } else if (weightage > 100 || weightage <= 0) {
                AlertMessage('#divValidationAlert', strKRANumberRangeValidation + ' 0 to 100', 'D');
                isvalid = false;
                return false;
            }

            // Dates come from selected Appraisal cycle master; do not compare to session AppraisalCycleStart/End (mismatch with chosen cycle).
            //if (kraStartDate > localStorage.getItem('AppraisalCycleStart') || kraEndDate > localStorage.getItem('AppraisalCycleEnd')) {
            //    AlertMessage('#divValidationAlert', strKRADateValidation, 'D');
            //    isvalid = false;
            //    return false;
            //}
            if (isvalid) {
                status_result = $.grep(KRAStatusMaster, function (e) { return e.StatusDescription == strKRAStatusInitialised; });
            }
        }
    }
    if (isvalid) {
        var employeeKRA = {
            KRAId: kRAId,
            EmployeeId: sessionStorage.getItem('EmployeeId'),
            AppraisalCycleId: $('#AppCycle :selected').val(),  //sessionStorage.getItem('AppraisalCycleId'),
            KRAFromDate: kraStartDate,
            KRAToDate: kraEndDate,
            GoalType: goalType,
            Sequence: goalSequence,
            GoalDescription: goalDescription,
            Weightage: weightage,
            ActionStep: actionStep,
            ActionPlan: '', // ActionPlan field (legacy form doesn't have this field, so empty)
            Measure: measure,
            TargetDate: targetDate,
            KRAFromDate: kraStartDate,
            KRAToDate: kraEndDate,
            KRAStatusId: status_result[0].StatusId,
            KRASetId: 1
        };
        if (btnKRAUpdate == strKRAUpdate) {
            var modifiedbyId = { ModifiedBy: sessionStorage.getItem('EmployeeId') };
            $.extend(employeeKRA, modifiedbyId);
        }
        var Result;
        var SuccessMsg = '';
        if (btnKRAUpdate == strKRAUpdate) {
            Result = UpdateKRA(employeeKRA);
            SuccessMsg = strKRAUpdateMsg;
        }
        else {
            Result = InsertKRA(employeeKRA);
            SuccessMsg = strKRAInsertMsg;
        }
        if (Result.Success) {
            ClearKRAForm();

            var selfAssCycleId = $('#ddlSelfAssCycle :selected').val();
            BindKRAGrid(sessionStorage.getItem('EmployeeId'), AppraisalCycleId, selfAssCycleId);

            // IMPORTANT: Revalidate Goal Modification button after KRA is saved/updated
            // KRA data has changed, which may affect goal modification eligibility
            setTimeout(function () {
                console.log('SaveKRAForm: KRA saved, revalidating Goal Modification button');
                ValidateAndShowGoalModificationButton();
            }, 300);

            AlertMessage('#divValidationAlert', SuccessMsg, 'I');
        }
        else
            AlertMessage('#divValidationAlert', Result.Result[0].FieldName + ' - ' + Result.Result[0].ErrorMessage, 'D');
    }
}

// Completely rewritten SaveKRAFormModal function with better error handling and approach
function SaveKRAFormModal() {

    // Prevent multiple simultaneous calls
    if ($('#btnSaveGoalModal').prop('disabled')) {
        console.log('Save already in progress, ignoring duplicate call');
        return false;
    }

    try {
        // Do NOT hide the KRA list here - only hide when we actually send the API request (after all validations pass).
        // Otherwise validation errors (e.g. total weightage) would leave the list hidden after Cancel.
        
        // Clear any previous validation messages
        $('#modalValidationAlert').hide().text('');

        // Collect all form values
        var formData = {
            kRAId: $('#hdnKRAId').val(),
            goalType: $('#ddlGoalTypeModal').val(),
            goalSequence: $('#lblKRASequence').val(),
            goalDescription: $('#txtGoalDescModal').summernote('code').trim(), // Get HTML from Summernote
            weightage: $('#txtGoalWeightageModal').val().trim(),
            measure: $('#txtAreaMeasureModal').summernote('code').trim(), // Get HTML from Summernote
            actionPlan: $('#txtActionPlanModal').summernote('code').trim(), // Get HTML from Summernote
            startDateStr: $('#txtKRAStartDateModal').val().trim(),
            endDateStr: $('#txtKRAEndDateModal').val().trim()
        };

        console.log('Form data collected:', formData);

        var isUpdate = formData.kRAId && formData.kRAId !== '' && formData.kRAId !== '0';

        var effectiveGoalType = NormalizeModalGoalType(formData.goalType);

        // Validate required fields
        var validationErrors = [];

        // Check if Summernote editors have actual content (not just empty HTML tags)
        var goalDescPlainText = $('#txtGoalDescModal').summernote('isEmpty') ? '' : $('<div>').html(formData.goalDescription).text().trim();
        var measurePlainText = $('#txtAreaMeasureModal').summernote('isEmpty') ? '' : $('<div>').html(formData.measure).text().trim();
        var actionPlanPlainText = $('#txtActionPlanModal').summernote('isEmpty') ? '' : $('<div>').html(formData.actionPlan).text().trim();

        if (!goalDescPlainText) {
            validationErrors.push('Key Responsibility Area (KRA) is required');
        } else if (goalDescPlainText.length > 2000) {
            validationErrors.push('Key Responsibility Area (KRA) must not exceed 2000 characters');
        }
        if (!formData.weightage) {
            validationErrors.push('Weightage is required');
        }
        if (!measurePlainText) {
            validationErrors.push('Key Performance Indicators (KPIs) is required');
        } else if (measurePlainText.length > 2000) {
            validationErrors.push('Key Performance Indicators (KPIs) must not exceed 2000 characters');
        }
        if (!actionPlanPlainText) {
            validationErrors.push('Action Plan is required');
        } else if (actionPlanPlainText.length > 2000) {
            validationErrors.push('Action Plan must not exceed 2000 characters');
        }
        if (!effectiveGoalType) {
            validationErrors.push('Goal Type is required');
        }
        // Date validation removed - dates are auto-populated from AppraisalCycle
        // Get dates from AppraisalCycle if not in form data
        if (!formData.startDateStr) {
            // Try to get from AppraisalCycle
            var startDate = '';
            if (AppraisalCycle && AppraisalCycle.responseJSON && AppraisalCycle.responseJSON.Result && AppraisalCycle.responseJSON.Result.data) {
                var selectedCycleId = $('#AppCycle :selected').val();
                if (selectedCycleId) {
                    $.each(AppraisalCycle.responseJSON.Result.data, function (index, data) {
                        if (data.AppraisalCycleId == selectedCycleId) {
                            startDate = formatDate_DMY(data.StartDate);
                            return false; // break the loop
                        }
                    });
                }
            }
            if (startDate) {
                formData.startDateStr = startDate;
            }
        }
        if (!formData.endDateStr) {
            // Try to get from AppraisalCycle
            var endDate = '';
            if (AppraisalCycle && AppraisalCycle.responseJSON && AppraisalCycle.responseJSON.Result && AppraisalCycle.responseJSON.Result.data) {
                var selectedCycleId = $('#AppCycle :selected').val();
                if (selectedCycleId) {
                    $.each(AppraisalCycle.responseJSON.Result.data, function (index, data) {
                        if (data.AppraisalCycleId == selectedCycleId) {
                            endDate = formatDate_DMY(data.EndDate);
                            return false; // break the loop
                        }
                    });
                }
            }
            if (endDate) {
                formData.endDateStr = endDate;
            }
        }

        // Convert start date from dd-mm-yy to yyyy-MM-dd format
        var kraStartDate = '';
        if (formData.startDateStr) {
            var dateParts = formData.startDateStr.split('-');
            if (dateParts.length === 3) {
                // Handle 2-digit year (yy) - assume 20xx for years < 50, 19xx otherwise
                var year = parseInt(dateParts[2]);
                if (year < 100) {
                    year = year < 50 ? 2000 + year : 1900 + year;
                }
                kraStartDate = year + '-' +
                    ('0' + dateParts[1]).slice(-2) + '-' +
                    ('0' + dateParts[0]).slice(-2);
            } else {
                // Fallback to original conversion function if format doesn't match
                kraStartDate = foramtDate_DMY2YMD(formData.startDateStr);
            }
        }

        // Convert end date
        var kraEndDate = foramtDate_DMY2YMD(formData.endDateStr);

        // Show validation errors if any
        if (validationErrors.length > 0) {
            $('#modalValidationAlert').text(validationErrors[0]).show();
            ScrollToElement($('#modalValidationAlert'));
            // Ensure training list table remains visible even after validation error
            EnsureTrainingListTableVisible();
            return false;
        }

        // Validate weightage
        var weightageNum = parseFloat(formData.weightage);
        if (isNaN(weightageNum) || weightageNum <= 0) {
            $('#modalValidationAlert').text('Weightage must be a positive number').show();
            ScrollToElement($('#modalValidationAlert'));
            // Ensure training list table remains visible even after validation error
            EnsureTrainingListTableVisible();
            return false;
        }
        
        // Validate minimum weightage (10%)
        if (weightageNum < 10) {
            $('#modalValidationAlert').text('Weightage must be at least 10%').show();
            ScrollToElement($('#modalValidationAlert'));
            EnsureTrainingListTableVisible();
            return false;
        }

        if (PermissableInsert > 0) {
            if (weightageNum > PermissableInsert) {
                $('#modalValidationAlert').text(strKRANumberRangeValidation + ' 0 to ' + PermissableInsert).show();
                ScrollToElement($('#modalValidationAlert'));
                EnsureTrainingListTableVisible();
                return false;
            }
        } else if (weightageNum > 100) {
            $('#modalValidationAlert').text(strKRANumberRangeValidation + ' 0 to 100').show();
            ScrollToElement($('#modalValidationAlert'));
            EnsureTrainingListTableVisible();
            return false;
        }

        // Total weight (non-completed goals in grid) must not exceed 100% after this save
        var isTeamModeWeight = $('#addGoalModal').data('isTeamMode') === true;
        var baseTotalWeight = isTeamModeWeight
            ? ((typeof window.currentTeamMemberTotalWeightage !== 'undefined') ? parseFloat(window.currentTeamMemberTotalWeightage) : 0)
            : ((typeof window.currentEmployeeTotalWeightage !== 'undefined') ? parseFloat(window.currentEmployeeTotalWeightage) : 0);
        if (isNaN(baseTotalWeight)) {
            baseTotalWeight = 0;
        }
        var projectedTotalWeight = isUpdate
            ? (baseTotalWeight - (parseFloat($('#hdnKRAId').data('originalWeightage')) || 0) + weightageNum)
            : (baseTotalWeight + weightageNum);
        if (isNaN(projectedTotalWeight)) {
            projectedTotalWeight = weightageNum;
        }
        if (projectedTotalWeight > 100) {
            $('#modalValidationAlert').text('Total weightage cannot exceed 100%.').show();
            ScrollToElement($('#modalValidationAlert'));
            EnsureTrainingListTableVisible();
            return false;
        }

        // Dates are applied from the selected Appraisal cycle in master data below; skip localStorage cycle date checks.

        // Get AppraisalCycleId with fallback logic for manager screen
        var appraisalCycleId = null;

        // Try multiple sources in order of preference:
        // 1. From modal data (if stored when opening edit modal) - most reliable for manager screen
        if ($('#addGoalModal').data('appraisalCycleId')) {
            appraisalCycleId = $('#addGoalModal').data('appraisalCycleId');
        }

        // 2. From AppCycle dropdown (if available)
        if (!appraisalCycleId) {
            var dropdownValue = $('#AppCycle :selected').val();
            if (dropdownValue && dropdownValue !== '' && dropdownValue !== undefined && dropdownValue !== '0') {
                appraisalCycleId = dropdownValue;
            }
        }

        // 3. If this is an update, try to get from the KRA data (stored in hidden field or modal data)
        if (!appraisalCycleId && isUpdate) {
            // Try to get from KRA data if available
            var kraData = $('#addGoalModal').data('kraData');
            if (kraData && kraData.AppraisalCycleId) {
                appraisalCycleId = kraData.AppraisalCycleId;
            }
        }

        // 4. From global AppraisalCycleId variable
        if (!appraisalCycleId && typeof AppraisalCycleId !== 'undefined' && AppraisalCycleId) {
            appraisalCycleId = AppraisalCycleId;
        }

        // 5. From ddlAppCycle variable
        if (!appraisalCycleId && typeof ddlAppCycle !== 'undefined' && ddlAppCycle && ddlAppCycle !== '0') {
            appraisalCycleId = ddlAppCycle;
        }

        // 6. From ddlAppCycleId variable (if exists)
        if (!appraisalCycleId && typeof ddlAppCycleId !== 'undefined' && ddlAppCycleId && ddlAppCycleId !== '0') {
            appraisalCycleId = ddlAppCycleId;
        }

        // 7. Try to get from active tab's AppCycle (for manager tabs)
        if (!appraisalCycleId) {
            var $activeTab = $('#mytabs').find('.tab-pane.active');
            var activeTabId = $activeTab.attr('id');
            // Check if we're in manager tabs (tab_b or tab_c)
            if (activeTabId === 'tab_b' || activeTabId === 'tab_c') {
                // Try to get from the navigation AppCycle that's used in ApproveKRA
                var NavAppCycleId = '';
                if ($('#AppCycle :selected').val() != undefined) {
                    NavAppCycleId = $('#AppCycle :selected').val();
                } else if (typeof ddlAppCycle !== 'undefined' && ddlAppCycle) {
                    NavAppCycleId = ddlAppCycle;
                }
                if (NavAppCycleId && NavAppCycleId !== '' && NavAppCycleId !== '0') {
                    appraisalCycleId = NavAppCycleId;
                }
            }
        }

        // Final validation
        if (!appraisalCycleId || appraisalCycleId === '' || appraisalCycleId === undefined || appraisalCycleId === '0') {
            $('#modalValidationAlert').text('Please select an Appraisal Cycle.').show();
            ScrollToElement($('#modalValidationAlert'));
            EnsureTrainingListTableVisible();
            console.error('AppraisalCycleId not found. Tried dropdown, modal data, global variables, and KRA data.');
            return false;
        }

        // Convert to number if it's a string
        appraisalCycleId = parseInt(appraisalCycleId);
        if (isNaN(appraisalCycleId) || appraisalCycleId <= 0) {
            $('#modalValidationAlert').text('Please select an Appraisal Cycle.').show();
            ScrollToElement($('#modalValidationAlert'));
            EnsureTrainingListTableVisible();
            return false;
        }
        
        // Issue 17: KRA start/end dates must be from the selected Appraisal cycle, not Assessment cycle (H1/H2).
        // Override kraStartDate and kraEndDate with the selected Appraisal cycle's StartDate and EndDate.
        if (AppraisalCycle && AppraisalCycle.responseJSON && AppraisalCycle.responseJSON.Result && AppraisalCycle.responseJSON.Result.data) {
            $.each(AppraisalCycle.responseJSON.Result.data, function (index, data) {
                if (data.AppraisalCycleId == appraisalCycleId && data.StartDate && data.EndDate) {
                    var appStartDMY = formatDate_DMY(data.StartDate);
                    var appEndDMY = formatDate_DMY(data.EndDate);
                    kraStartDate = foramtDate_DMY2YMD(appStartDMY);
                    kraEndDate = foramtDate_DMY2YMD(appEndDMY);
                    return false; // break
                }
            });
        }
        
        // Check if this is for a team member (manager adding goal for team member)
        // First check modal data for isTeamMode flag (set when opening modal)
        var isTeamMode = $('#addGoalModal').data('isTeamMode') === true;
        var selectedTeamMemberId = null;

        // If team mode flag is set, get team member ID from modal data or dropdown
        if (isTeamMode) {
            selectedTeamMemberId = $('#addGoalModal').data('teamMemberId');
            if (!selectedTeamMemberId) {
                selectedTeamMemberId = $('#ddlMyTeamList_KRA').val();
            }
        } else {
            // Fallback: check dropdown (for backward compatibility)
            selectedTeamMemberId = $('#ddlMyTeamList_KRA').val();
            isTeamMode = selectedTeamMemberId && selectedTeamMemberId !== '' && selectedTeamMemberId !== '0';
        }

        // Validate: If trying to add new KRA when already submitted, show alert
        // This validation should only happen when adding a new KRA (not updating) and not in team mode
        if (!isUpdate && !isTeamMode && typeof isSubmitted !== 'undefined' && isSubmitted) {
            if (IsCopyKRA == 0) {
                $('#modalValidationAlert').text(strPrevKRAValidation).show();
                ScrollToElement($('#modalValidationAlert'));
                EnsureTrainingListTableVisible();
                return false;
            }
        }
        var teamMemberId = isTeamMode ? parseInt(selectedTeamMemberId) : null;
        var loggedInEmployeeId = parseInt(sessionStorage.getItem('EmployeeId'));

        // Determine EmployeeId - for team mode, use reportee's ID; otherwise use logged-in user's ID
        var employeeId;
        if (isTeamMode && teamMemberId && teamMemberId > 0) {
            employeeId = teamMemberId; // Reportee's ID from dropdown
        } else {
            employeeId = loggedInEmployeeId; // Employee's own ID
        }

        // CRITICAL VALIDATION: Ensure EmployeeId is NOT the manager's ID when in team mode
        if (isTeamMode && teamMemberId && employeeId === loggedInEmployeeId) {
            console.error('ERROR: EmployeeId is set to manager ID instead of reportee ID!');
            AlertMessage('#divValidationAlert_Team', 'Error: Cannot add goal. Please select a team member.', 'D');
            return false;
        }

        // Get training requirement data (only for Developmental goals)
        var trainingItemId = '';
        var trainingRequirementName = '';
        var trainingCategory = '';
        if (effectiveGoalType === 'D') {
            var trainingData = GetTrainingDataArray();
            var trainingItemIds = [];
            var trainingItemNames = [];
            var trainingCategories = [];

            for (var i = 0; i < trainingData.length; i++) {
                var item = trainingData[i];
                var parsedId = parseInt(item.trainingId) || 0;
                var parsedName = item.trainingName || '';
                var itemCategory = item.trainingType || '';

                if (parsedName.trim() !== '') {
                    trainingItemIds.push(parsedId);
                    trainingItemNames.push(parsedName);
                    trainingCategories.push(itemCategory || '');
                }
            }
            
            if (trainingItemIds.length > 0) {
                trainingItemId = trainingItemIds.join(TRAINING_SEPARATOR);
                trainingRequirementName = trainingItemNames.join(TRAINING_SEPARATOR);
                trainingCategory = trainingCategories.join(TRAINING_SEPARATOR);
            } else {
                // All training removed — send empty string so the SP clears the columns
                trainingItemId = '';
                trainingRequirementName = '';
                trainingCategory = '';
            }
            
            console.log('Training requirement data:', {
                trainingItemIds: trainingItemIds,
                trainingItemNames: trainingItemNames,
                trainingItemId: trainingItemId,
                trainingRequirementName: trainingRequirementName,
                totalCount: trainingItemIds.length
            });
        }

        // Build employeeKRA object
        var employeeKRA = {
            KRAId: isUpdate ? parseInt(formData.kRAId) : 0,
            EmployeeId: employeeId,
            AppraisalCycleId: appraisalCycleId,
            KRAFromDate: kraStartDate,
            KRAToDate: kraEndDate,
            GoalType: effectiveGoalType,
            Sequence: formData.goalSequence,
            GoalDescription: formData.goalDescription,
            Weightage: weightageNum,
            ActionStep: '',
            ActionPlan: formData.actionPlan,
            Measure: formData.measure,
            TargetDate: kraEndDate,
            KRASetId: 1,
            TrainingItemId: trainingItemId, // null for "Others", or valid training ID
            TrainingRequirementName: trainingRequirementName, // Required when TrainingItemId is null
            TrainingCategory: trainingCategory // Comma-separated categories for custom trainings (training_id = 0)
        };

        // Debug logging for the complete object
        console.log('EmployeeKRA object being sent:', JSON.stringify(employeeKRA, null, 2));

        // For team mode (manager adding goal for team member)
        if (isTeamMode && teamMemberId && teamMemberId > 0) {
            // CRITICAL: EmployeeId MUST be the reportee's ID (team member), NOT the manager's ID
            // Re-assert EmployeeId to ensure it's the reportee's ID from dropdown
            employeeKRA.EmployeeId = teamMemberId; // Reportee's ID from ddlMyTeamList_KRA dropdown
            employeeKRA.CreatedBy = loggedInEmployeeId; // Manager's ID (who created it)
            employeeKRA.ManagerId = loggedInEmployeeId; // Manager's ID
            employeeKRA.ModifiedBy = loggedInEmployeeId; // Manager's ID (who modified/created it)
            employeeKRA.flag = 1; // Flag to indicate team mode
        } else {
            // For regular mode (employee adding their own goal)
            employeeKRA.CreatedBy = loggedInEmployeeId; // Will be overridden by server to EmployeeId if not set
        }

        // Debug logging to verify EmployeeId is set correctly
        console.log('=== SaveKRAFormModal Debug ===');
        console.log('selectedTeamMemberId from dropdown:', selectedTeamMemberId);
        console.log('isTeamMode:', isTeamMode);
        console.log('teamMemberId (parsed):', teamMemberId);
        console.log('loggedInEmployeeId (Manager):', loggedInEmployeeId);
        console.log('employeeId (Reportee/Employee):', employeeId);
        console.log('EmployeeKRA.EmployeeId:', employeeKRA.EmployeeId);
        console.log('EmployeeKRA.CreatedBy:', employeeKRA.CreatedBy);
        console.log('EmployeeKRA.ModifiedBy:', employeeKRA.ModifiedBy);
        console.log('EmployeeKRA.ManagerId:', employeeKRA.ManagerId);
        console.log('EmployeeKRA.flag:', employeeKRA.flag);
        console.log('Full EmployeeKRA object:', JSON.stringify(employeeKRA, null, 2));

        // Get status - for updates, keep existing status; for inserts, use Initialised
        var status_result;
        if (isUpdate) {
            var existingStatusId = $('#hdnKRAId').data('statusId');
            if (existingStatusId) {
                status_result = $.grep(KRAStatusMaster, function (e) { return e.StatusId == existingStatusId; });
            }
            if (!status_result || status_result.length == 0) {
                status_result = $.grep(KRAStatusMaster, function (e) { return e.StatusDescription == strKRAStatusInitialised; });
            }
            employeeKRA.KRAStatusId = status_result[0].StatusId;
            employeeKRA.ModifiedBy = loggedInEmployeeId;
        } else {
            status_result = $.grep(KRAStatusMaster, function (e) { return e.StatusDescription == strKRAStatusInitialised; });
            employeeKRA.KRAStatusId = status_result[0].StatusId;
        }
        
        // Hide KRA list only when we are about to send the request (after all validations passed)
        $('#tblKRAList').hide();
        $('#tblKRAList_wrapper').hide();
        $('#tblKRAListFooter').hide();
        $('#tblKRAList_consolidatedTraining').hide();
        if ($('#KRAListGird').length) $('#KRAListGird').hide();
        
        // Show loader/spinner with fail-safe
        var loader = CreateLoaderWithFailSafe(isUpdate ? 'Updating Goal...' : 'Saving Goal...', 30000);

        // Disable save button to prevent multiple clicks
        $('#btnSaveGoalModal').prop('disabled', true);

        var SuccessMsg = isUpdate ? strKRAUpdateMsg : strKRAInsertMsg;
        var apiPath;

        if (isUpdate) {
            // Update existing record
            employeeKRA.ModifiedBy = sessionStorage.getItem('EmployeeId');
            var svrPath = CONFIG.get('SERVERNAME');
            apiPath = svrPath + "/EmployeeKRA/UpdateKRA";
        } else {
            // Insert new record
            var svrPath = CONFIG.get('SERVERNAME');
            apiPath = svrPath + "EmployeeKRA/SubmitKRAOpWithSP";
        }

        // Use async AJAX call for better UX
        $.ajax({
            url: apiPath,
            type: 'POST',
            data: JSON.stringify(employeeKRA),
            async: true,
            dataType: 'json',
            contentType: 'application/json',
            timeout: 60000, // 60 second timeout
            headers: CommonGetHeaderInfo(),
            success: function (result) {
                if (result && result.Success) {
                    // Get KRAId from response - for insert, it's in Result.Result.KRAId, for update use existing kRAId
                    var savedKRAId = null;
                    if (isUpdate) {
                        savedKRAId = formData.kRAId;
                    } else {
                        // For insert, check if Result.Result has KRAId
                        if (result.Result && typeof result.Result === 'object' && result.Result.KRAId) {
                            savedKRAId = result.Result.KRAId;
                        } else if (result.Result && typeof result.Result === 'number') {
                            savedKRAId = result.Result; // If it's just a number
                        }
                    }

                    // Note: Attachments are now handled in Self-Assessment, not in Goal Setting
                    // Removed attachment upload logic from goal setting

                    loader.remove();
                    $('#btnSaveGoalModal').prop('disabled', false);

                    ClearKRAFormModal();
                    $('#addGoalModal').modal('hide');

                    // Check if we're in team mode
                    if (isTeamMode && teamMemberId) {
                        // Refresh team member's KRA grid after a short delay (same as tab_a) so the update
                        // is committed and visible when we refetch; avoids training requirement not showing in tab_b
                        setTimeout(function () {
                            BindTMKRAGrid(teamMemberId, appraisalCycleId);
                        }, 800);
                        AlertMessage('#divValidationAlert_Team', SuccessMsg, 'I');
                    } else {
                        // Refresh employee's own KRA grid
                        // Remove consolidated training and destroy DataTable for clean refresh
                        $('#tblKRAList_consolidatedTraining').remove();
                        if ($.fn.DataTable.isDataTable('#tblKRAList')) {
                            try { $('#tblKRAList').DataTable().destroy(); } catch (e) { console.warn('DataTable destroy failed:', e.message); }
                        }

                        // Add delay to ensure API has processed the update and clear any cached data
                        setTimeout(function () {
                            console.log('Refreshing KRA grid after update, AppraisalCycleId:', appraisalCycleId);

                            // Clear any cached KRA data
                            EmpKRAData = null;

                            var employeeId = sessionStorage.getItem('EmployeeId');
                            var selfAssCycleId = $('#ddlSelfAssCycle :selected').val() || null;
                            var statusId = null; // Get all statuses

                            // Force refresh by calling BindKRAGrid
                            BindKRAGrid(employeeId, appraisalCycleId, selfAssCycleId, statusId);

                            // Re-validate Add Goal button visibility after save
                            ValidateAndShowAddGoalButton();
                            // NOTE: ValidateAndShowGoalModificationButton should NOT be called here
                            // It will be automatically called when the grid refreshes via BindKRAGrid
                            // which triggers OnSelfAssesmentCycleChange or OnAppraisalCycleChange
                        }, 800);
                        AlertMessage('#divValidationAlert', SuccessMsg, 'I');
                    }

                    // Clear team mode flags
                    $('#addGoalModal').removeData('teamMemberId');
                    $('#addGoalModal').removeData('isTeamMode');
                } else {
                    // API returned error - restore KRA list so user still sees their data
                    loader.remove();
                    $('#btnSaveGoalModal').prop('disabled', false);
                    if ($('#tblKRAList').length) {
                        if ($('#tblKRAList_wrapper').length) $('#tblKRAList_wrapper').show();
                        $('#tblKRAList').show();
                        if ($('#tblKRAListFooter').length) $('#tblKRAListFooter').show();
                        if ($('#KRAListGird').length) $('#KRAListGird').show();
                    }
                    if (result.Result && result.Result.length > 0) {
                        $('#modalValidationAlert').text(result.Result[0].FieldName + ' - ' + result.Result[0].ErrorMessage).show();
                        ScrollToElement($('#modalValidationAlert'));
                        EnsureTrainingListTableVisible();
                    } else {
                        $('#modalValidationAlert').text('An error occurred while saving the goal.').show();
                        ScrollToElement($('#modalValidationAlert'));
                        EnsureTrainingListTableVisible();
                    }
                }
            },
            error: function (xhr, status, error) {
                loader.remove();
                $('#btnSaveGoalModal').prop('disabled', false);
                if ($('#tblKRAList').length) {
                    if ($('#tblKRAList_wrapper').length) $('#tblKRAList_wrapper').show();
                    $('#tblKRAList').show();
                    if ($('#tblKRAListFooter').length) $('#tblKRAListFooter').show();
                    if ($('#KRAListGird').length) $('#KRAListGird').show();
                }
                var errorMsg = 'An error occurred while saving the goal. Please try again.';
                if (xhr.responseJSON && xhr.responseJSON.ErrorMessage) {
                    errorMsg = xhr.responseJSON.ErrorMessage;
                }
                // Display the error message
                $('#modalValidationAlert').text(errorMsg).show();
                ScrollToElement($('#modalValidationAlert'));
                EnsureTrainingListTableVisible();
            }
        });
    } catch (ex) {
        // Remove loader if it was created
        if (typeof loader !== 'undefined' && loader && loader.remove) {
            loader.remove();
        }
        $('#btnSaveGoalModal').prop('disabled', false);

        // Show datatables again on exception (they were hidden at the start of save)
        if ($('#tblKRAList').length) {
            if ($('#tblKRAList_wrapper').length) {
                $('#tblKRAList_wrapper').show();
            }
            if ($('#tblKRAListFooter').length) {
                $('#tblKRAListFooter').show();
            }
        }

        console.error('SaveKRAFormModal exception:', ex);
        $('#modalValidationAlert').text('An unexpected error occurred: ' + ex.message).show();
        ScrollToElement($('#modalValidationAlert'));
        EnsureTrainingListTableVisible();
        return false;
    }

    return false; // Prevent form submission
}

function SaveTeamKRAForm() {


    //if in submitted state or approved. prompt to complete in order to add new KRA's
    var isvalid = true;
    var kraEndDate = foramtDate_DMY2YMD($('#tblTeamKRAEdit #txtKRAEndDate1').val());
    var btnKRAUpdate = $('#tblTeamKRAEdit #btnKRAUpdate').val();
    var kRAId = $('#tblTeamKRAEdit #teamhdnKRAId').val();

    var goalType = NormalizeModalGoalType($('#tblTeamKRAEdit #ddlGoalType').val());
    var goalSequence = $('#tblTeamKRAEdit #lblKRASequence').text();
    var goalDescription = $('#tblTeamKRAEdit #txtGoalDesc').val();
    var weightage = $('#tblTeamKRAEdit #txtGoalWeightage').val().trim();
    var actionStep = '';//$('#txtAreaActionSteps').val();
    var measure = $('#tblTeamKRAEdit #txtAreaMeasure').val();
    var kraStartDate = foramtDate_DMY2YMD($('#tblTeamKRAEdit #txtKRAStartDate1').val());
    var targetDate = kraEndDate; //$('#txtTargetDate').val();
    var EmployeeId = $("#tblTeamKRAEdit #btnKRAUpdate").attr("hdnemployeeid");


    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = '';
    if ($('#AppCycle :selected').val() != undefined) {
        apiPath = svrPath + 'AppraisalCycle/AppraisalCycleWithId?Id=' + $('#AppCycle :selected').val();

    }
    else {
        apiPath = svrPath + 'AppraisalCycle/AppraisalCycleWithId?Id=' + ddlAppCycle;

    }

    var Cycleresult = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    var DBStartDate = formatDate_DMY(Cycleresult.responseJSON.Result.StartDate);
    var DBEndDate = formatDate_DMY(Cycleresult.responseJSON.Result.EndDate);



    var flag = 1;
    if (btnKRAUpdate == "Insert") {
        var kraeditinsert = 1;
        if ($('#ddlKRAStatusForTeam').find(":selected").text().toLowerCase() == 'not submitted') {

            flag = -1;

        }
    }


    else {
        kraeditinsert = 0;
    }
    var status_result;
    $("#tblTeamKRAEdit #divValidationAlert").hide();
    if ($('#tblTeamKRAEdit #ddlGoalType').is('[disabled]')) {       //check if the fields are disabled
        if (kraEndDate.trim() == '') {
            AlertMessage('#tblTeamKRAEdit #divValidationAlert', strKRAEmptyFieldValidation, 'D');
            isvalid = false;
            return false;
        }
        if (isvalid) {

            status_result = $.grep(KRAStatusMaster, function (e) {

                return e.StatusDescription == strKRAStatusSubmitted;
            });
        }
    } else {
        if (goalDescription.trim() == '' || weightage.trim() == '' || measure.trim() == '' || kraStartDate.trim() == '' || kraEndDate.trim() == '') {
            AlertMessage('#tblTeamKRAEdit #divValidationAlert', strKRAEmptyFieldValidation, 'D');
            isvalid = false;
            return false;
        } else {
            // Validate minimum weightage (10%)
            if (weightage < 10) {
                AlertMessage('#tblTeamKRAEdit #divValidationAlert', 'Weightage must be at least 10%', 'D');
                isvalid = false;
                return false;
            }
            
            if (PermissableInsert > 0) {
                if (weightage > PermissableInsert || weightage <= 0) {
                    AlertMessage('#tblTeamKRAEdit #divValidationAlert', strKRANumberRangeValidation + ' 0 to ' + PermissableInsert, 'D');
                    isvalid = false;
                    return false;
                }
            } else if (weightage > 100 || weightage <= 0) {
                AlertMessage('#tblTeamKRAEdit #divValidationAlert', strKRANumberRangeValidation + ' 0 to 100', 'D');
                isvalid = false;
                return false;
            }

            // Team G&O dates follow selected appraisal cycle master; skip vs DBStartDate/DBEndDate checks.
            //if (new Date(kraStartDate) < new Date(DBStartDate) || new Date(kraEndDate) < new Date(DBEndDate)) {
            //    AlertMessage('#tblTeamKRAEdit #divValidationAlert', strKRADateValidation, 'D');
            //    isvalid = false;
            //    return false;
            //}
            if (isvalid) {

                status_result = $.grep(KRAStatusMaster, function (e) {

                    return e.StatusDescription == strKRAStatusSubmitted;

                });


            }
        }
    }
    ;
    if (isvalid) {

        var NavAppCycle = '';
        if ($('#AppCycle :selected').val() != undefined) {
            NavAppCycle = $('#AppCycle :selected').val();
        }
        else {
            NavAppCycle = ddlAppCycle
        }



        var employeeKRA = {

            KRAId: kRAId,
            EmployeeId: EmployeeId,
            AppraisalCycleId: NavAppCycle, //sessionStorage.getItem('AppraisalCycleId'),
            KRAFromDate: kraStartDate,
            KRAToDate: kraEndDate,
            GoalType: goalType,
            Sequence: goalSequence,
            GoalDescription: goalDescription,
            Weightage: weightage,
            ActionStep: actionStep,
            ActionPlan: '', // ActionPlan field (legacy form doesn't have this field, so empty)
            Measure: measure,
            // SelfAsst:SelfAssesment,
            TargetDate: targetDate,
            KRAFromDate: kraStartDate,
            KRAToDate: kraEndDate,
            KRAStatusId: status_result[0].StatusId,
            KRASetId: 1,
            ManagerId: sessionStorage.getItem('EmployeeId'),
            flag: flag,
            CreatedBy: sessionStorage.getItem('EmployeeId')
            //subordinateupdate
        };
        if (goalType !== 'D') {
            employeeKRA.TrainingItemId = '';
            employeeKRA.TrainingRequirementName = '';
            employeeKRA.TrainingCategory = '';
        }
        if (btnKRAUpdate == strKRAUpdate) {
            var modifiedbyId = { ModifiedBy: sessionStorage.getItem('EmployeeId') };
            $.extend(employeeKRA, modifiedbyId);
        }
        var Result;
        var SuccessMsg = '';
        if (btnKRAUpdate == strKRAUpdate) {
            Result = UpdateKRA(employeeKRA);
            SuccessMsg = strKRAUpdateMsg;
            $('#KRAListGird').show();


        }
        else {
            Result = InsertKRA(employeeKRA);
            SuccessMsg = strKRAInsertMsg;
            $('#KRAListGird').show();

        }
        if (Result.Success) {

            //ClearKRAForm();
            ClearTeamKRAForm();

            BindTMKRAGrid(EmployeeId, NavAppCycle);
            AlertMessage('#tblTeamKRAEdit #divValidationAlert', SuccessMsg, 'I');
            $("#tblTeamKRAEdit").hide();
            //if ($('#tblTeamMemberKRAList >tbody >tr').length < 6 && $('#tblTeamMemberKRAList >tbody >tr').length > 0) {

            $("#tblTeamKRAEdit").show();
            //}

            //else {

            //    $("#tblTeamKRAEdit").hide();
            //}
            if ($('#ddlKRAStatusForTeam').find(":selected").text() == 'Approved') {
                $('#btnRejectKRA').hide();

            }



        }
        else
            AlertMessage('#tblTeamKRAEdit #divValidationAlert', Result.Result[0].FieldName + ' - ' + Result.Result[0].ErrorMessage, 'D');
    }

}
function ClearTeamKRAForm() {
    enableTeamKRAForm();
    $('#tblTeamKRAEdit #chkKRAStatus').hide();
    $('#tblTeamKRAEdit #ddlGoalType').val('O');
    $('#tblTeamKRAEdit #lblKRASequence').text(OpSeqNo);
    $('#tblTeamKRAEdit #teamhdnKRAId').val('');
    $('#tblTeamKRAEdit #txtGoalDesc').val('');
    $('#tblTeamKRAEdit #txtGoalDesc').focus();
    $('#tblTeamKRAEdit #txtGoalWeightage').val('');    //$('#txtAreaActionSteps').val('');
    $('#tblTeamKRAEdit #txtAreaMeasure').val('');
    $('#tblTeamKRAEdit #txtKRAStartDate1').val('');//$('#txtTargetDate').val(formatDate(new Date()));

    $('#tblTeamKRAEdit #txtKRAStartDate1').val('');
    //  $('#tblTeamKRAEdit #txtKRAEndDate1').val(sessionStorage.AppraisalCycleFrom);
    //  $('#tblTeamKRAEdit #KRAToSubmitManager').val('0');
    // $('#txtKRAStartDate').val(sessionStorage.getItem("AppraisalCycleStart"));
    // $('#txtKRAEndDate').val(sessionStorage.getItem("AppraisalCycleFrom"));
    //var status_result = $.grep(KRAStatusMaster, function (e) { return e.StatusDescription == strKRAStatusInitialised; });
    //$('#tblTeamKRAEdit #ddlKRAStatus').val(status_result[0].StatusId);
    $('#tblTeamKRAEdit #ddlKRAStatus').val(2);
    $('#tblTeamKRAEdit #ddlKRAStatus').prop("disabled", true);
    $('#tblTeamKRAEdit #btnKRAUpdate').val(strKRAInsert);

    $("#tblTeamKRAEdit #divValidationAlert").hide();
    if (isSubmitted) {
        disableKRAForm();
        // Note: Removed alert message from here - it should only show when user tries to add a new KRA
        // The alert will be shown in SaveKRAFormModal when appropriate
    }
}
function ClearKRAForm() {
    enableKRAForm();

    $('#chkKRAStatus').hide();
    $('#ddlGoalType').val('O');
    $('#lblKRASequence').text(OpSeqNo);
    $('#hdnKRAId').val('');
    $('#txtGoalDesc').val('');
    $('#txtGoalDesc').focus();
    $('#txtGoalWeightage').val('');    //$('#txtAreaActionSteps').val('');
    $('#txtAreaMeasure').val('');    //$('#txtTargetDate').val(formatDate(new Date()));
    $('#txtKRAStartDate').val('');
    //  $('#txtKRAEndDate').val(sessionStorage.AppraisalCycleFrom);  // added by kaushal for freeze end date
    // $('#KRAToSubmitManager').val('0');
    // $('#txtKRAStartDate').val(sessionStorage.getItem("AppraisalCycleStart"));
    // $('#txtKRAEndDate').val(sessionStorage.getItem("AppraisalCycleFrom"));
    var status_result = $.grep(KRAStatusMaster, function (e) { return e.StatusDescription == strKRAStatusInitialised; });
    $('#ddlKRAStatus').val(status_result[0].StatusId);
    $('#btnKRAUpdate').val(strKRAInsert);
    $("#divValidationAlert").hide();
    if (isSubmitted) {
        disableKRAForm();
        // Note: Removed alert message from here - it should only show when user tries to add a new KRA
        // The alert will be shown in SaveKRAFormModal when appropriate
    }
}
function DeleteKRATable(KRAId) {
    if (!confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
        return false;
    }
    $("#divValidationAlert").hide();
    EmpKRAData = DeleteKRAbyId(KRAId);
    if (EmpKRAData) {

        BindKRAGrid(sessionStorage.getItem('EmployeeId'), AppraisalCycleId, $('#ddlSelfAssCycle :selected').val());
        ClearKRAForm();
        $('KRAListGird').hide();
        AlertMessage('#divValidationAlert', strKRADeleteMsg, 'I');
        return true;
    } else {
        $('KRAListGird').show();
        AlertMessage('#divValidationAlert', strKRAErrorMsg, 'D');
        return false;
    }

}
function SubmitKRAForm() {
    var isvalid = true;
    var ManagerId = $("#HdnKRAToSubmitManager").val();
    if (ManagerId > 0) {
        if (!confirm('Are you sure you want to submit your Goals & Objectives? Once submitted, you will not be able to edit until your manager rejects.')) {
            return false;
        }
        // Show loader/spinner
        var $loader = $('<div class="kra-submit-loader" style="position: fixed; top: 60px; left: 53px; right: 0; bottom: 0; background: rgba(255,255,255,0.72); -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px); z-index: 2000; display: flex; align-items: center; justify-content: center;"><div style="text-align: center; padding: 24px 32px; background: #fff; border-radius: 8px; box-shadow: 0 4px 24px rgba(0,0,0,.12); min-width: 200px;"><span style="display: inline-block; width: 40px; height: 40px; border: 3px solid #e8e8e8; border-top-color: #337ab7; border-radius: 50%; animation: mf-spin 0.75s linear infinite; margin-bottom: 12px;"></span><span style="display: block; font-size: 14px; color: #555; font-weight: 500;">Submitting Goals & Objectives...</span></div></div>');
        $('body').append($loader);

        // Disable submit button to prevent multiple clicks
        $('#btnSubmitKRA').prop('disabled', true);

        // Use async AJAX call for better UX
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + "EmployeeKRA/SubmitKRA?AppraisalCycleId=" + $('#AppCycle :selected').val() + "&ToEmployeeId=" + sessionStorage.getItem("EmployeeId") + "&KRAAction=" + KRAACTION_SUBMIT + "&ManagerId=" + ManagerId;

        $.ajax({
            type: "POST",
            url: apiPath,
            async: true,
            datatype: "json",
            headers: CommonGetHeaderInfo(),
            success: function (result) {
                $loader.remove();
                $('#btnSubmitKRA').prop('disabled', false);

                if (result && result.Success) {
                    $('#tblKRAList').show();
                    $('#KRAListGird').show();
                    var selfAssCycleId = $('#ddlSelfAssCycle :selected').val();
                    BindKRAGrid(sessionStorage.getItem("EmployeeId"), AppraisalCycleId, selfAssCycleId);
                    ClearKRAForm();

                    // IMPORTANT: Revalidate Goal Modification button after KRA is submitted
                    // Submission status has changed, which may affect goal modification eligibility
                    setTimeout(function () {
                        console.log('SubmitKRAForm: KRA submitted, revalidating Goal Modification button');
                        ValidateAndShowGoalModificationButton();
                    }, 300);

                    AlertMessage('#divValidationAlert', 'Submit successful!', 'I');
                } else {
                    isvalid = false;
                    if (result && result.Result != null && result.Result.length > 0) {
                        var tbody = $("#tblKRAList tbody");
                        if (!(tbody.children().length == 1 && tbody.children().text() == "No data available in table")) {
                            AlertMessage('#divValidationAlert', result.Result[0].ErrorMessage, 'D');
                        }
                    } else {
                        var errorMsg = result && result.ErrorMessage ? result.ErrorMessage : 'Failed to submit Goals & Objectives.';
                        AlertMessage('#divValidationAlert', errorMsg, 'D');
                    }
                }
            },
            error: function (xhr, status, error) {
                $loader.remove();
                $('#btnSubmitKRA').prop('disabled', false);

                console.error('Error submitting KRA:', error);
                isvalid = false;
                var errorMsg = 'An error occurred while submitting Goals & Objectives. Please try again.';
                if (xhr.responseJSON && xhr.responseJSON.ErrorMessage) {
                    errorMsg = xhr.responseJSON.ErrorMessage;
                } else if (xhr.responseJSON && xhr.responseJSON.Result && xhr.responseJSON.Result.length > 0) {
                    errorMsg = xhr.responseJSON.Result[0].ErrorMessage;
                }
                AlertMessage('#divValidationAlert', errorMsg, 'D');
            }
        });
    }
    else {
        isvalid = false;
        AlertMessage('#divValidationAlert', "Select Manager to submit the G&Os", 'D');
    }
    return isvalid;
}

/*Manager - Submit KRA for Team Member*/
function SubmitKRAFormTeam() {
    var isvalid = true;
    var selectedTeamMemberId = $('#ddlMyTeamList_KRA').val();
    var loggedInEmployeeId = parseInt(sessionStorage.getItem('EmployeeId'));

    if (!selectedTeamMemberId || selectedTeamMemberId === '' || selectedTeamMemberId === '0') {
        isvalid = false;
        AlertMessage('#divValidationAlert_Team', 'Please select a team member.', 'D');
        return isvalid;
    }

    // Get appraisal cycle ID
    var appraisalCycleId = $('#AppCycle :selected').val();
    if (!appraisalCycleId || appraisalCycleId === '' || appraisalCycleId === '0') {
        appraisalCycleId = AppraisalCycleId || ddlAppCycle;
    }

    if (!appraisalCycleId || appraisalCycleId === '' || appraisalCycleId === '0') {
        isvalid = false;
        AlertMessage('#divValidationAlert_Team', 'Please select an appraisal cycle.', 'D');
        return isvalid;
    }
    
    if (!confirm('Are you sure you want to submit Goals & Objectives for this team member? Once submitted, the employee will not be able to edit until you approve or reject.')) {
        return isvalid;
    }
    
    // Show loader/spinner
    var $loader = $('<div class="kra-submit-loader" style="position: fixed; top: 60px; left: 53px; right: 0; bottom: 0; background: rgba(255,255,255,0.72); -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px); z-index: 2000; display: flex; align-items: center; justify-content: center;"><div style="text-align: center; padding: 24px 32px; background: #fff; border-radius: 8px; box-shadow: 0 4px 24px rgba(0,0,0,.12); min-width: 200px;"><span style="display: inline-block; width: 40px; height: 40px; border: 3px solid #e8e8e8; border-top-color: #337ab7; border-radius: 50%; animation: mf-spin 0.75s linear infinite; margin-bottom: 12px;"></span><span style="display: block; font-size: 14px; color: #555; font-weight: 500;">Submitting Goals & Objectives...</span></div></div>');
    $('body').append($loader);

    // Disable submit button to prevent multiple clicks
    $('#btnSubmitKRATeam').prop('disabled', true);

    // Use async AJAX call for better UX
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "EmployeeKRA/SubmitKRA?AppraisalCycleId=" + appraisalCycleId + "&ToEmployeeId=" + selectedTeamMemberId + "&KRAAction=" + KRAACTION_SUBMIT + "&ManagerId=" + loggedInEmployeeId;

    $.ajax({
        type: "POST",
        url: apiPath,
        async: true,
        datatype: "json",
        headers: CommonGetHeaderInfo(),
        success: function (result) {
            $loader.remove();
            $('#btnSubmitKRATeam').prop('disabled', false);

            if (result && result.Success) {
                // Refresh the team member's KRA grid
                BindTMKRAGrid(parseInt(selectedTeamMemberId), appraisalCycleId);
                AlertMessage('#divValidationAlert_Team', 'Submit successful!', 'I');
            } else {
                isvalid = false;
                if (result && result.Result != null && result.Result.length > 0) {
                    var errorMsg = result.Result[0].ErrorMessage || 'Failed to submit Goals & Objectives.';
                    AlertMessage('#divValidationAlert_Team', errorMsg, 'D');
                } else {
                    var errorMsg = result && result.ErrorMessage ? result.ErrorMessage : 'Failed to submit Goals & Objectives.';
                    AlertMessage('#divValidationAlert_Team', errorMsg, 'D');
                }
            }
        },
        error: function (xhr, status, error) {
            $loader.remove();
            $('#btnSubmitKRATeam').prop('disabled', false);

            console.error('Error submitting KRA:', error);
            isvalid = false;
            var errorMsg = 'An error occurred while submitting Goals & Objectives. Please try again.';
            if (xhr.responseJSON && xhr.responseJSON.ErrorMessage) {
                errorMsg = xhr.responseJSON.ErrorMessage;
            } else if (xhr.responseJSON && xhr.responseJSON.Result && xhr.responseJSON.Result.length > 0) {
                errorMsg = xhr.responseJSON.Result[0].ErrorMessage;
            }
            AlertMessage('#divValidationAlert_Team', errorMsg, 'D');
        }
    });

    return isvalid;
}

/** Total weightage for team member KRA grid (tab_b / tab_c). Uses DataTables row data when available — DOM nth-child was wrong (col 5 is KPIs, not Weightage). */
function sumTeamMemberKRAGridWeightage(activeTabId) {
    var sel = (activeTabId === 'tab_b' || activeTabId === 'tab_c') ? ('#' + activeTabId + ' #tblTeamMemberKRAList') : '#tblTeamMemberKRAList';
    var $tbl = $(sel);
    if (!$tbl.length) return 0;

    if ($.fn.DataTable.isDataTable($tbl)) {
        var sum = 0;
        $tbl.DataTable().rows({ search: 'applied' }).every(function () {
            var d = this.data();
            var w = parseFloat(d && d.Weightage != null && d.Weightage !== '' ? d.Weightage : 0, 10);
            if (!isNaN(w)) sum += w;
        });
        return sum;
    }

    var thindex = -1;
    $tbl.find('thead tr th').each(function () {
        var t = $(this).text().replace(/\s+/g, ' ').trim().toLowerCase();
        if (t.indexOf('weightage') >= 0 && t.indexOf('%') >= 0) {
            thindex = $(this).index();
            return false;
        }
    });
    if (thindex < 0) thindex = 6;

    var sumDom = 0;
    $tbl.find('tbody tr').each(function () {
        if ($(this).hasClass('child')) return;
        var txt = $(this).find('td').eq(thindex).text().trim();
        var w = parseFloat(txt.replace(/[^\d.\-]/g, ''), 10);
        if (!isNaN(w)) sumDom += w;
    });
    return sumDom;
}

/*Manager*/
function ApproveKRA() {
    if (!confirm('Are you sure you want to approve the Goals & Objectives for this team member? The employee will be notified.')) {
        return;
    }
    var $tab = $('#mytabs'), $active = $tab.find('.tab-pane.active'), text = $active.find('p:hidden').text();
    var ActiveTabId = $active.attr("id");



    var NavAppCycleId = '';
    if ($('#AppCycle :selected').val() != undefined) {
        NavAppCycleId = $('#AppCycle :selected').val();
    }
    else {
        NavAppCycleId = ddlAppCycle
    }


    var addd = 0;
    if (ActiveTabId === 'tab_b' || ActiveTabId === 'tab_c') {
        addd = sumTeamMemberKRAGridWeightage(ActiveTabId);
    }


    if (addd != 100) {
        if (ActiveTabId == "tab_c") {
            AlertMessage('#tab_c #divValidationAlert_Team', 'Total weightage should be 100 to finalize the Goals.', 'D');
        }
        else {

            $('#tab_b #divValidationAlert').hide();
            AlertMessage('#divValidationAlert_Team', 'Total weightage should be 100 to finalize the Goals.', 'D');


        }
    }

    else {
        // Show loader/spinner
        var $loader = $('<div class="kra-approve-loader" style="position: fixed; top: 60px; left: 53px; right: 0; bottom: 0; background: rgba(255,255,255,0.72); -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px); z-index: 2000; display: flex; align-items: center; justify-content: center;"><div style="text-align: center; padding: 24px 32px; background: #fff; border-radius: 8px; box-shadow: 0 4px 24px rgba(0,0,0,.12); min-width: 200px;"><span style="display: inline-block; width: 40px; height: 40px; border: 3px solid #e8e8e8; border-top-color: #337ab7; border-radius: 50%; animation: mf-spin 0.75s linear infinite; margin-bottom: 12px;"></span><span style="display: block; font-size: 14px; color: #555; font-weight: 500;">Approving Goals...</span></div></div>');
        $('body').append($loader);
        
        // Disable approve button during operation (all tabs to prevent multiple clicks)
        $('#btnApproveKRA, #tab_b #btnApproveKRA, #tab_c #btnApproveKRA').prop('disabled', true);
        
        // Use async AJAX for better UX
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + "EmployeeKRA/SubmitKRA?AppraisalCycleId=" + NavAppCycleId + "&ToEmployeeId=" + subEmpId + "&KRAAction=" + KRAACTION_APPROVE + "&ManagerId=" + sessionStorage.EmployeeId;

        $.ajax({
            url: apiPath,
            type: 'POST',
            headers: CommonGetHeaderInfo(),
            success: function (response) {
                $loader.remove();
                // Re-enable approve button only so user can retry on failure; on success we keep buttons hidden
                $('#btnApproveKRA, #tab_b #btnApproveKRA, #tab_c #btnApproveKRA').prop('disabled', false);
                
                if (response.Success) {
            var $tab = $('#mytabs'), $active = $tab.find('.tab-pane.active'), text = $active.find('p:hidden').text();
            var ActiveTabId = $active.attr("id");
            console.log(ActiveTabId);
            
            // Hide DataTable and buttons after successful approval (do not call UpdateApproveRejectButtonVisibility so they stay hidden)
            if (ActiveTabId == 'tab_b' || ActiveTabId == 'tab_c') {
                $('#' + ActiveTabId + ' #tblTeamMemberKRAList').hide();
                $('#' + ActiveTabId + ' #tblTeamMemberKRAListFooter').hide();
                $('#' + ActiveTabId + ' .consolidated-training-section').hide();
                $('#btnApproveKRA, #' + ActiveTabId + ' #btnApproveKRA, #btnRejectKRA, #' + ActiveTabId + ' #btnRejectKRA').hide();
                $('#btnDownloadAllAttachmentsTeam, #' + ActiveTabId + ' #btnDownloadAllAttachmentsTeam').hide();
                
                // Hide ALL alert divs BEFORE showing the message to prevent duplicate messages
                $('#tab_b #divValidationAlert_Team, #tab_c #divValidationAlert_Team, #divValidationAlert_Team').hide();
                
                // Show alert only once - use the active tab's alert div
                var alertSelector = '#' + ActiveTabId + ' #divValidationAlert_Team';
                AlertMessage(alertSelector, 'G&Os Approved!', 'I');
            }
            else {
                $('#tblTeamMemberKRAList').hide();
                $('#tblTeamMemberKRAListFooter').hide();
                $('#tblTeamMemberKRAList_consolidatedTraining').hide();
                $('#btnApproveKRA, #btnRejectKRA').hide();
                $('#btnDownloadAllAttachmentsTeam').hide();
                
                // Hide tab-specific alert divs before showing the default one
                $('#tab_b #divValidationAlert_Team, #tab_c #divValidationAlert_Team').hide();
                
                // Show alert only once - use the default alert div
                AlertMessage('#divValidationAlert_Team', 'G&Os Approved!', 'I');
            }
            // Hide Add Goal on all team tabs; refresh team dropdown so approved member drops off "Not Submitted" list (server SP excludes all-Approved)
            $('[id="btnAddNewGoalTeam"]').hide();
            setTimeout(function () {
                try {
                    $('#ddlKRAStatusForTeam').trigger('change');
                } catch (ex) {
                    console.warn('Post-approve team list refresh:', ex);
                }
            }, 0);
        }
        else {
            // Determine which alert div to use based on active tab
            var $tab = $('#mytabs'), $active = $tab.find('.tab-pane.active');
            var ActiveTabId = $active.attr("id");
            var alertSelector = '#divValidationAlert_Team';
            
            if (ActiveTabId == 'tab_b' || ActiveTabId == 'tab_c') {
                alertSelector = '#' + ActiveTabId + ' #divValidationAlert_Team';
                // Hide other alert divs
                if (ActiveTabId == 'tab_b') {
                    $('#tab_c #divValidationAlert_Team').hide();
                    $('#divValidationAlert_Team').hide();
                } else if (ActiveTabId == 'tab_c') {
                    $('#tab_b #divValidationAlert_Team').hide();
                    $('#divValidationAlert_Team').hide();
                }
            } else {
                // Hide tab-specific alert divs
                $('#tab_b #divValidationAlert_Team, #tab_c #divValidationAlert_Team').hide();
            }
            
            // Validation errors from ValidationsSubmit (API returns Result as array of ValidationsEntity: { FieldName, ErrorMessage })
            var errorMsg = 'Failed to approve Goals. Please try again.';
            if (response.Result != null && Array.isArray(response.Result) && response.Result.length > 0 && response.Result[0].ErrorMessage) {
                errorMsg = response.Result[0].ErrorMessage;
            } else if (response.Result != null && response.Result.KRAData && response.Result.KRAData.length > 0) {
                errorMsg = response.Result.KRAData[0].ErrorMessage || errorMsg;
            }
            AlertMessage(alertSelector, errorMsg, 'D');
            // Sync button visibility after failure so user can retry
            UpdateApproveRejectButtonVisibility();
        }
        $("#tblTeamKRAEdit").hide();
            },
            error: function (xhr, status, error) {
                $loader.remove();
                $('#btnApproveKRA, #tab_b #btnApproveKRA, #tab_c #btnApproveKRA').prop('disabled', false);
                
                // Determine which alert div to use based on active tab
                var $tab = $('#mytabs'), $active = $tab.find('.tab-pane.active');
                var ActiveTabId = $active.attr("id");
                var alertSelector = '#divValidationAlert_Team';

                if (ActiveTabId == 'tab_b' || ActiveTabId == 'tab_c') {
                    alertSelector = '#' + ActiveTabId + ' #divValidationAlert_Team';
                    // Hide other alert divs
                    if (ActiveTabId == 'tab_b') {
                        $('#tab_c #divValidationAlert_Team').hide();
                        $('#divValidationAlert_Team').hide();
                    } else if (ActiveTabId == 'tab_c') {
                        $('#tab_b #divValidationAlert_Team').hide();
                        $('#divValidationAlert_Team').hide();
                    }
                } else {
                    // Hide tab-specific alert divs
                    $('#tab_b #divValidationAlert_Team, #tab_c #divValidationAlert_Team').hide();
                }

                var errorMsg = 'Failed to approve Goals. Please try again.';
                var resp = xhr.responseJSON;
                if (resp && resp.Result && Array.isArray(resp.Result) && resp.Result.length > 0 && resp.Result[0].ErrorMessage) {
                    errorMsg = resp.Result[0].ErrorMessage;
                } else if (resp && resp.Result && resp.Result.KRAData && resp.Result.KRAData.length > 0) {
                    errorMsg = resp.Result.KRAData[0].ErrorMessage || errorMsg;
                } else if (resp && resp.ErrorMessage) {
                    errorMsg = resp.ErrorMessage;
                }
                AlertMessage(alertSelector, errorMsg, 'D');
            }
        });
    }
}
function RejectKRA() {
    if (!confirm('Are you sure you want to reject the Goals & Objectives for this team member? The employee will be notified and can edit and resubmit.')) {
        return;
    }
    // Show loader/spinner
    var $loader = $('<div class="kra-reject-loader" style="position: fixed; top: 60px; left: 53px; right: 0; bottom: 0; background: rgba(255,255,255,0.72); -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px); z-index: 2000; display: flex; align-items: center; justify-content: center;"><div style="text-align: center; padding: 24px 32px; background: #fff; border-radius: 8px; box-shadow: 0 4px 24px rgba(0,0,0,.12); min-width: 200px;"><span style="display: inline-block; width: 40px; height: 40px; border: 3px solid #e8e8e8; border-top-color: #337ab7; border-radius: 50%; animation: mf-spin 0.75s linear infinite; margin-bottom: 12px;"></span><span style="display: block; font-size: 14px; color: #555; font-weight: 500;">Rejecting Goals & Objectives...</span></div></div>');
    $('body').append($loader);

    // Disable reject button to prevent multiple clicks (all tabs)
    $('#btnRejectKRA, #tab_b #btnRejectKRA, #tab_c #btnRejectKRA').prop('disabled', true);
    
    var $tab = $('#mytabs'), $active = $tab.find('.tab-pane.active'), text = $active.find('p:hidden').text();
    var ActiveTabId = $active.attr("id");

    // Use async AJAX call for better UX with loader
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "EmployeeKRA/SubmitKRA?AppraisalCycleId=" + AppraisalCycleId + "&ToEmployeeId=" + subEmpId + "&KRAAction=" + KRAACTION_REJECT + "&ManagerId=" + sessionStorage.EmployeeId;
    
    var rejectSucceeded = false;
    $.ajax({
        type: "POST",
        url: apiPath,
        async: true,
        datatype: "json",
        headers: CommonGetHeaderInfo(),
        success: function (result) {
            // Check if the operation was successful
            if (result && result.Success) {
                rejectSucceeded = true;
                // Hide DataTable and buttons after successful rejection
    if (ActiveTabId == 'tab_b' || ActiveTabId == 'tab_c') {
                    $('#' + ActiveTabId + ' #tblTeamMemberKRAList').hide();
                    $('#' + ActiveTabId + ' #tblTeamMemberKRAListFooter').hide();
                    $('#' + ActiveTabId + ' .consolidated-training-section').hide();
                    $('#btnApproveKRA, #' + ActiveTabId + ' #btnApproveKRA, #btnRejectKRA, #' + ActiveTabId + ' #btnRejectKRA').hide();
                    $('#btnDownloadAllAttachmentsTeam, #' + ActiveTabId + ' #btnDownloadAllAttachmentsTeam').hide();
                    AlertMessage('#' + ActiveTabId + ' #divValidationAlert_Team', 'G&Os Rejected!', 'I');
                }
                else {
                    $('#tblTeamMemberKRAList').hide();
                    $('#tblTeamMemberKRAListFooter').hide();
                    $('#tblTeamMemberKRAList_consolidatedTraining').hide();
                    $('#btnApproveKRA, #btnRejectKRA').hide();
                    $('#btnDownloadAllAttachmentsTeam').hide();
                    $("#tblTeamKRAEdit").hide();
                    AlertMessage('#divValidationAlert_Team', 'G&Os Rejected!', 'I');
                }
            } else {
                // Show error message
                var errorMsg = 'Failed to reject Goals & Objectives';
                if (result && result.ErrorMessage) {
                    errorMsg = result.ErrorMessage;
                }
                AlertMessage('#divValidationAlert_Team', errorMsg, 'D');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error rejecting KRA:', error);
            var errorMsg = 'An error occurred while rejecting Goals & Objectives. Please try again.';
            if (xhr.responseJSON && xhr.responseJSON.ErrorMessage) {
                errorMsg = xhr.responseJSON.ErrorMessage;
            }
            AlertMessage('#divValidationAlert_Team', errorMsg, 'D');
        },
        complete: function () {
            // Hide loader
            $loader.remove();
            // Re-enable reject button only on failure so user can retry; on success buttons stay hidden/disabled
            if (!rejectSucceeded) {
                $('#btnRejectKRA, #tab_b #btnRejectKRA, #tab_c #btnRejectKRA').prop('disabled', false);
            }
        }
    });
}

/*Enable-Disable*/
function enableKRAForm() {
    $("#formKRAEdit :input").prop("disabled", false);
    $('#ddlKRAStatus').prop("disabled", true);
    $('#txtKRAEndDate').prop("disabled", true);
}
function enableTeamKRAForm() {
    $("#tblTeamKRAEdit #formKRAEdit :input").prop("disabled", false);
    $('#tblTeamKRAEdit #ddlKRAStatus').prop("disabled", true);
    $('#txtKRAEndDate').prop("disabled", true);

}
function disableKRAForm() {
    $("#formKRAEdit :input").prop("disabled", true);
    $("#ddlAppraisalCycleCopyKRA").prop("disabled", false);
    $("#btnCopyKRA").prop("disabled", false);

}

function UploadKRAAttachment(KRAId, AppraisalCycleId, file, employeeIdForUpload, callback) {
    if (!KRAId || !file) {
        console.error('UploadKRAAttachment: Missing KRAId or file', { KRAId: KRAId, file: file });
        if (callback) callback(false);
        AlertMessage('#divValidationAlert', 'File upload failed: Missing required parameters', 'D');
        return;
    }

    // CRITICAL: Use the provided employeeIdForUpload (which should be the team member's ID for team mode)
    // If not provided, fallback to logged-in user's ID (but server will correct this from KRA entity)
    var uploadEmployeeId = employeeIdForUpload || sessionStorage.getItem('EmployeeId');

    // Calculate timeout based on file size (minimum 60 seconds, add 1 second per MB)
    // For large files (5MB+), allow up to 120 seconds
    var fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    var baseTimeout = 60000; // 60 seconds base
    var sizeBasedTimeout = Math.ceil(fileSizeMB) * 1000; // 1 second per MB
    var uploadTimeout = Math.min(baseTimeout + sizeBasedTimeout, 120000); // Max 120 seconds
    var loaderTimeout = uploadTimeout + 10000; // Loader timeout is 10 seconds longer than AJAX timeout

    console.log('UploadKRAAttachment: File size', fileSizeMB + 'MB', 'Timeout:', uploadTimeout + 'ms', 'EmployeeId:', uploadEmployeeId);

    // Show loader with fail-safe timeout based on file size
    var uploadLoader = CreateLoaderWithFailSafe('Uploading attachment (' + fileSizeMB + 'MB)...', loaderTimeout);

    var formData = new FormData();
    formData.append('file', file);

    var svrPath = CONFIG.get('SERVERNAME');
    // CRITICAL: Use uploadEmployeeId (team member's ID for team mode, not manager's ID)
    var apiPath = svrPath + "EmployeeKRA/UploadAttachment?KRAId=" + KRAId + "&EmployeeId=" + uploadEmployeeId + "&AppraisalCycleId=" + AppraisalCycleId;

    console.log('UploadKRAAttachment: Starting upload', { KRAId: KRAId, AppraisalCycleId: AppraisalCycleId, fileName: file.name, fileSize: fileSizeMB + 'MB' });

    $.ajax({
        url: apiPath,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'json',
        timeout: uploadTimeout, // Dynamic timeout based on file size
        headers: CommonGetHeaderInfo(),
        success: function (response) {
            uploadLoader.remove();
            console.log('UploadKRAAttachment: Success response', response);
            // Response is already parsed as JSON
            // Format: { Success: true/false, Result: {...} } or { Success: false, ErrorCode: "...", ErrorMessage: "..." }
            if (response && response.Success) {
                if (callback) callback(true);
            } else {
                uploadLoader.remove();
                if (callback) callback(false);
                var errorMsg = 'Unknown error';
                if (response && response.ErrorMessage) {
                    errorMsg = response.ErrorMessage;
                } else if (response && response.Message) {
                    errorMsg = response.Message;
                } else if (response && response.Result && typeof response.Result === 'string') {
                    errorMsg = response.Result;
                }
                console.error('UploadKRAAttachment: Upload failed', { response: response, errorMsg: errorMsg });
                AlertMessage('#divValidationAlert', 'File upload failed: ' + errorMsg, 'D');
            }
        },
        error: function (xhr, status, error) {
            uploadLoader.remove();
            console.error('UploadKRAAttachment: AJAX error', { status: status, error: error, xhr: xhr, responseText: xhr.responseText });
            if (callback) callback(false);
            var errorMsg = error;
            // Try to parse error response
            if (xhr.responseJSON) {
                if (xhr.responseJSON.ErrorMessage) {
                    errorMsg = xhr.responseJSON.ErrorMessage;
                } else if (xhr.responseJSON.Message) {
                    errorMsg = xhr.responseJSON.Message;
                }
            } else if (xhr.responseText) {
                try {
                    var errorResponse = JSON.parse(xhr.responseText);
                    if (errorResponse.ErrorMessage) {
                        errorMsg = errorResponse.ErrorMessage;
                    } else if (errorResponse.Message) {
                        errorMsg = errorResponse.Message;
                    } else if (typeof errorResponse === 'string') {
                        errorMsg = errorResponse;
                    }
                } catch (e) {
                    // If parsing fails, use the response text or default error
                    if (xhr.responseText && xhr.responseText.length < 200) {
                        errorMsg = xhr.responseText;
                    }
                }
            }
            AlertMessage('#divValidationAlert', 'File upload error: ' + errorMsg, 'D');
        },
        timeout: function () {
            uploadLoader.remove();
            if (callback) callback(false);
            AlertMessage('#divValidationAlert', 'File upload timed out. Please try again.', 'D');
        }
    });
}

// Upload Self Assessment Attachment
function UploadSelfAssessmentAttachment(SelfAssessmentId, KRAId, EmployeeId, AppraisalCycleId, SelfAssessmentCycleId, file, callback) {
    if (!SelfAssessmentId || !file) {
        console.error('UploadSelfAssessmentAttachment: Missing SelfAssessmentId or file', { SelfAssessmentId: SelfAssessmentId, file: file });
        if (callback) callback(false, 'Missing required parameters');
        return;
    }
    if (file.size === 0) {
        if (callback) callback(false, 'Empty (0 KB) files cannot be uploaded.');
        return;
    }
    if (file.size > selfAssessmentMaxFileSizeBytes) {
        if (callback) callback(false, 'File exceeds the 10 MB limit.');
        return;
    }
    if (!isSelfAssessmentFileTypeAllowed(file.name)) {
        if (callback) callback(false, 'Invalid file type. ' + selfAssessmentAllowedTypesUserMessage);
        return;
    }

    // Calculate timeout based on file size (minimum 60 seconds, add 1 second per MB)
    var fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    var baseTimeout = 60000; // 60 seconds base
    var sizeBasedTimeout = Math.ceil(fileSizeMB) * 1000; // 1 second per MB
    var uploadTimeout = Math.min(baseTimeout + sizeBasedTimeout, 120000); // Max 120 seconds
    var loaderTimeout = uploadTimeout + 10000; // Loader timeout is 10 seconds longer than AJAX timeout

    console.log('UploadSelfAssessmentAttachment: File size', fileSizeMB + 'MB', 'Timeout:', uploadTimeout + 'ms');

    // Show loader with fail-safe timeout based on file size
    var uploadLoader = CreateLoaderWithFailSafe('Uploading attachment (' + fileSizeMB + 'MB)...', loaderTimeout);

    var formData = new FormData();
    formData.append('file', file);

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "EmployeeKRA/UploadSelfAssessmentAttachment?SelfAssessmentId=" + SelfAssessmentId +
        "&KRAId=" + KRAId + "&EmployeeId=" + EmployeeId + "&AppraisalCycleId=" + AppraisalCycleId +
        "&SelfAssessmentCycleId=" + (SelfAssessmentCycleId || '');

    console.log('UploadSelfAssessmentAttachment: Starting upload', { SelfAssessmentId: SelfAssessmentId, KRAId: KRAId, fileName: file.name, fileSize: fileSizeMB + 'MB' });

    $.ajax({
        url: apiPath,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        timeout: uploadTimeout,
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue,
            'X-EmpNo': sessionStorage.EmployeeId
        },
        success: function (response) {
            uploadLoader.remove();
            console.log('UploadSelfAssessmentAttachment: Success response', response);

            if (response && response.Success) {
                if (callback) callback(true);
            } else {
                var errorMsg = 'Upload failed';
                if (response && response.ErrorMessage) {
                    errorMsg = response.ErrorMessage;
                }
                console.error('UploadSelfAssessmentAttachment: Upload failed', { response: response, errorMsg: errorMsg });
                if (callback) callback(false, errorMsg);
            }
        },
        error: function (xhr, status, error) {
            uploadLoader.remove();
            console.error('UploadSelfAssessmentAttachment: AJAX error', { status: status, error: error, xhr: xhr, responseText: xhr.responseText });
            var errorMsg = error || 'Upload failed';
            // Try to parse error response
            if (xhr.responseJSON) {
                if (xhr.responseJSON.ErrorMessage) {
                    errorMsg = xhr.responseJSON.ErrorMessage;
                } else if (xhr.responseJSON.Message) {
                    errorMsg = xhr.responseJSON.Message;
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
                    if (xhr.responseText && xhr.responseText.length < 200) {
                        errorMsg = xhr.responseText;
                    }
                }
            }
            if (callback) callback(false, errorMsg);
        }
    });
}

function DownloadKRAAttachment(KRAId, attachmentPath) {
    if (!KRAId || KRAId === 0) {
        AlertMessage('#divValidationAlert', 'Invalid KRA ID for download.', 'D');
        return;
    }

    console.log('DownloadKRAAttachment called with KRAId:', KRAId, 'AttachmentPath:', attachmentPath);

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "EmployeeKRA/DownloadAttachment?KRAId=" + KRAId;

    // Show loading indicator
    var $loader = $('<div class="kra-download-loader" style="position: fixed; top: 60px; left: 53px; right: 0; bottom: 0; background: rgba(255,255,255,0.72); -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px); z-index: 2000; display: flex; align-items: center; justify-content: center;"><div style="text-align: center; padding: 24px 32px; background: #fff; border-radius: 8px; box-shadow: 0 4px 24px rgba(0,0,0,.12); min-width: 200px;"><span style="display: inline-block; width: 40px; height: 40px; border: 3px solid #e8e8e8; border-top-color: #337ab7; border-radius: 50%; animation: mf-spin 0.75s linear infinite; margin-bottom: 12px;"></span><span style="display: block; font-size: 14px; color: #555; font-weight: 500;">Downloading...</span></div></div>');
    $('body').append($loader);

    // Helper function to extract original filename from AttachmentPath
    function extractFileNameFromPath(path) {
        if (!path || path === '' || path === null) {
            return 'attachment';
        }

        var fileName = path;

        // Remove .enc extension if present
        if (fileName.endsWith('.enc')) {
            fileName = fileName.substring(0, fileName.length - 4);
        }

        // Remove timestamp (format: filename_YYYYMMDDHHMMSS.ext)
        var lastUnderscore = fileName.lastIndexOf('_');
        if (lastUnderscore > 0) {
            var beforeUnderscore = fileName.substring(0, lastUnderscore);
            var afterUnderscore = fileName.substring(lastUnderscore + 1);
            // Check if after underscore is a timestamp (14 digits)
            if (afterUnderscore.length > 14 && /^\d{14}/.test(afterUnderscore)) {
                var extension = afterUnderscore.substring(14); // Get extension after timestamp
                fileName = beforeUnderscore + extension;
            }
        }

        // If still no extension, try to get it from the original path
        if (fileName.indexOf('.') === -1 && path.indexOf('.') > -1) {
            // Extract extension from original path before .enc
            var pathWithoutEnc = path.endsWith('.enc') ? path.substring(0, path.length - 4) : path;
            var lastDot = pathWithoutEnc.lastIndexOf('.');
            if (lastDot > -1) {
                var ext = pathWithoutEnc.substring(lastDot);
                fileName = fileName + ext;
            }
        }

        return fileName || 'attachment';
    }

    // Use native XMLHttpRequest for blob downloads to avoid jQuery's JSON parsing
    var xhr = new XMLHttpRequest();
    xhr.open('GET', apiPath, true);
    xhr.responseType = 'blob';

    // Add authorization headers
    var headers = CommonGetHeaderInfo();
    for (var key in headers) {
        if (headers.hasOwnProperty(key)) {
            xhr.setRequestHeader(key, headers[key]);
        }
    }

    xhr.onload = function () {
        $loader.remove();

        if (xhr.status === 200) {
            // Get filename from Content-Disposition header first
            var contentDisposition = xhr.getResponseHeader('Content-Disposition');
            var fileName = null;

            if (contentDisposition) {
                // Try multiple patterns to extract filename
                // Pattern 1: filename="filename.ext" or filename=filename.ext
                var fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
                if (fileNameMatch && fileNameMatch[1]) {
                    fileName = fileNameMatch[1].replace(/['"]/g, ''); // Remove quotes
                } else {
                    // Pattern 2: filename*=UTF-8''filename.ext (RFC 5987)
                    fileNameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/i);
                    if (fileNameMatch && fileNameMatch[1]) {
                        fileName = decodeURIComponent(fileNameMatch[1]);
                    } else {
                        // Pattern 3: Simple filename=filename.ext
                        fileNameMatch = contentDisposition.match(/filename=([^;]+)/i);
                        if (fileNameMatch && fileNameMatch[1]) {
                            fileName = fileNameMatch[1].trim().replace(/['"]/g, '');
                        }
                    }
                }
            }

            // If no filename from header, extract from AttachmentPath
            if (!fileName || fileName === 'attachment' || fileName === '') {
                fileName = extractFileNameFromPath(attachmentPath);
            }

            console.log('Downloading file with filename:', fileName);

            // Get content type from response
            var contentType = xhr.getResponseHeader('Content-Type') || 'application/octet-stream';
            console.log('Content-Type from server:', contentType);

            // Validate that we received a blob response
            if (!xhr.response || !(xhr.response instanceof Blob)) {
                AlertMessage('#divValidationAlert', 'Invalid file response from server. The file may be corrupted.', 'D');
                return;
            }

            // Check blob size - if it's 0 or very small, something might be wrong
            if (xhr.response.size === 0) {
                AlertMessage('#divValidationAlert', 'Downloaded file is empty. The file may not have been decrypted correctly.', 'D');
                return;
            }

            console.log('Blob size:', xhr.response.size, 'bytes');

            // For image files, verify the blob is valid by checking the first few bytes (file signature)
            if (contentType.startsWith('image/')) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var arrayBuffer = e.target.result;
                    var uint8Array = new Uint8Array(arrayBuffer);
                    var isValidFile = true;
                    var validationMessage = '';

                    // Check PNG signature: 89 50 4E 47 0D 0A 1A 0A
                    if (contentType === 'image/png' && uint8Array.length >= 8) {
                        var pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
                        for (var i = 0; i < 8; i++) {
                            if (uint8Array[i] !== pngSignature[i]) {
                                isValidFile = false;
                                validationMessage = 'PNG file signature check failed. The file may not be properly decrypted.';
                                console.error('PNG signature mismatch. Expected:', pngSignature.slice(0, 8), 'Got:', Array.from(uint8Array.slice(0, 8)));
                                break;
                            }
                        }
                    }

                    // Check JPEG signature: FF D8 FF
                    if ((contentType === 'image/jpeg' || contentType === 'image/jpg') && uint8Array.length >= 3) {
                        if (uint8Array[0] !== 0xFF || uint8Array[1] !== 0xD8 || uint8Array[2] !== 0xFF) {
                            isValidFile = false;
                            validationMessage = 'JPEG file signature check failed. The file may not be properly decrypted.';
                            console.error('JPEG signature mismatch. Expected: [0xFF, 0xD8, 0xFF], Got:', Array.from(uint8Array.slice(0, 3)));
                        }
                    }

                    if (!isValidFile) {
                        console.error('File validation failed:', validationMessage);
                        AlertMessage('#divValidationAlert', 'Error: ' + validationMessage + ' Please contact support.', 'D');
                        return;
                    }

                    console.log('File signature validation passed - file appears to be properly decrypted');

                    // Create blob with proper MIME type and trigger download
                    var blob = new Blob([xhr.response], { type: contentType });
                    var url = window.URL.createObjectURL(blob);
                    var link = document.createElement('a');
                    link.href = url;
                    link.download = fileName;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    // Clean up the blob URL after a short delay
                    setTimeout(function () {
                        window.URL.revokeObjectURL(url);
                    }, 100);
                };
                reader.onerror = function () {
                    AlertMessage('#divValidationAlert', 'Error reading file content. The file may be corrupted.', 'D');
                };
                // Read first 16 bytes for signature validation
                reader.readAsArrayBuffer(xhr.response.slice(0, 16));
            } else {
                // For non-image files, create blob directly (PDF, DOC, etc.)
                var blob = new Blob([xhr.response], { type: contentType });
                var url = window.URL.createObjectURL(blob);
                var link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Clean up the blob URL after a short delay
                setTimeout(function () {
                    window.URL.revokeObjectURL(url);
                }, 100);
            }
        } else {
            // Handle error response - try to read blob as text to get error message
            var reader = new FileReader();
            reader.onload = function () {
                try {
                    var errorResponse = JSON.parse(reader.result);
                    var errorMsg = errorResponse.ErrorMessage || errorResponse.Message || 'File download failed';
                    AlertMessage('#divValidationAlert', 'File download error: ' + errorMsg, 'D');
                } catch (e) {
                    var errorMsg = 'File download failed';
                    if (xhr.status === 404) {
                        errorMsg = 'File not found. The attachment may have been deleted.';
                    } else if (xhr.status === 403) {
                        errorMsg = 'You do not have permission to download this file.';
                    } else if (xhr.status === 500) {
                        errorMsg = 'Server error occurred while downloading the file.';
                    }
                    AlertMessage('#divValidationAlert', 'File download error: ' + errorMsg, 'D');
                }
            };
            reader.onerror = function () {
                var errorMsg = 'File download failed';
                if (xhr.status === 404) {
                    errorMsg = 'File not found. The attachment may have been deleted.';
                } else if (xhr.status === 403) {
                    errorMsg = 'You do not have permission to download this file.';
                } else if (xhr.status === 500) {
                    errorMsg = 'Server error occurred while downloading the file.';
                }
                AlertMessage('#divValidationAlert', 'File download error: ' + errorMsg, 'D');
            };
            if (xhr.response instanceof Blob) {
                reader.readAsText(xhr.response);
            } else {
                var errorMsg = 'File download failed';
                if (xhr.status === 404) {
                    errorMsg = 'File not found. The attachment may have been deleted.';
                } else if (xhr.status === 403) {
                    errorMsg = 'You do not have permission to download this file.';
                } else if (xhr.status === 500) {
                    errorMsg = 'Server error occurred while downloading the file.';
                }
                AlertMessage('#divValidationAlert', 'File download error: ' + errorMsg, 'D');
            }
        }
    };

    xhr.onerror = function () {
        $loader.remove();
        AlertMessage('#divValidationAlert', 'Network error occurred while downloading the file. Please try again.', 'D');
    };

    xhr.ontimeout = function () {
        $loader.remove();
        AlertMessage('#divValidationAlert', 'Download timeout. Please try again.', 'D');
    };

    // Set timeout (30 seconds)
    xhr.timeout = 30000;

    // Send the request
    xhr.send();
}

/// <summary>
/// Check if there are any attachments in the KRA data and show/hide the download all attachments button for Team view
/// </summary>
function CheckAndToggleDownloadAllAttachmentsButtonTeam(kraData) {
    // For team view we always render a single header button with this ID in _TeamMemberKRAList.cshtml.
    // DataTables for team view does NOT use scroll headers, so we can safely target this ID directly.
    var $button = $('#btnDownloadAllAttachmentsTeam');

    // Hide by default
    $button.hide();

    if (!kraData || !Array.isArray(kraData) || kraData.length === 0) {
        console.log('CheckAndToggleDownloadAllAttachmentsButtonTeam: No KRA data available, button hidden');
        return;
    }

    // Check if any KRA has an attachment - match the pattern from DownloadAllAttachmentsTeam
    var hasAttachments = false;
    for (var i = 0; i < kraData.length; i++) {
        var attachmentPath = kraData[i].AttachmentPath;
        if (attachmentPath &&
            attachmentPath !== '' &&
            attachmentPath !== null &&
            attachmentPath !== undefined) {
            // Additional validation: check if it's not just whitespace or 'null' string
            var trimmedPath = String(attachmentPath).trim();
            if (trimmedPath !== '' && trimmedPath.toLowerCase() !== 'null') {
                hasAttachments = true;
                console.log('CheckAndToggleDownloadAllAttachmentsButtonTeam: Attachment found at index', i, 'path:', trimmedPath);
                break;
            }
        }
    }

    // Show or hide the button in the header based on whether attachments exist
    if (hasAttachments) {
        $button.show().css('display', 'inline-block');
        console.log('CheckAndToggleDownloadAllAttachmentsButtonTeam: Button shown - attachments found. Button present =', $button.length > 0);
    } else {
        console.log('CheckAndToggleDownloadAllAttachmentsButtonTeam: Button hidden - no valid attachments found');
    }
}

/// <summary>
/// Download all attachments for the selected team member in the current appraisal cycle
/// </summary>
function DownloadAllAttachmentsTeam() {
    var selectedEmployeeId = $('#ddlMyTeamList_KRA').val();
    if (!selectedEmployeeId || selectedEmployeeId === '' || selectedEmployeeId === '0') {
        AlertMessage('#divValidationAlert_Team', 'Please select a team member', 'D');
        return;
    }

    var appraisalCycleId = $('#AppCycle :selected').val();
    // Fallback to ddlAppCycle or AppraisalCycleId if dropdown value is not available
    if (!appraisalCycleId || appraisalCycleId === '' || appraisalCycleId === undefined || appraisalCycleId === '0' || appraisalCycleId === 0) {
        if (ddlAppCycle && ddlAppCycle !== 0) {
            appraisalCycleId = ddlAppCycle;
        } else if (AppraisalCycleId && AppraisalCycleId !== 0) {
            appraisalCycleId = AppraisalCycleId;
        } else if (EmpKRAData && EmpKRAData.responseJSON && EmpKRAData.responseJSON.Result && EmpKRAData.responseJSON.Result.KRAData && EmpKRAData.responseJSON.Result.KRAData.length > 0) {
            // Try to get AppraisalCycleId from the first KRA in the loaded data
            appraisalCycleId = EmpKRAData.responseJSON.Result.KRAData[0].AppraisalCycleId;
        } else {
            AlertMessage('#divValidationAlert_Team', 'Please select an Appraisal Cycle', 'D');
            return;
        }
    }

    // Final validation - ensure we have a valid AppraisalCycleId before making the API call
    if (!appraisalCycleId || appraisalCycleId === '' || appraisalCycleId === undefined || appraisalCycleId === '0' || appraisalCycleId === 0) {
        console.error('DownloadAllAttachmentsTeam: Invalid AppraisalCycleId', {
            dropdownValue: $('#AppCycle :selected').val(),
            ddlAppCycle: ddlAppCycle,
            AppraisalCycleId: AppraisalCycleId,
            EmpKRAData: EmpKRAData
        });
        AlertMessage('#divValidationAlert_Team', 'Please select an Appraisal Cycle', 'D');
        return;
    }

    console.log('DownloadAllAttachmentsTeam: Using AppraisalCycleId:', appraisalCycleId, 'for EmployeeId:', selectedEmployeeId);

    // Additional validation: Check if there are attachments before attempting download
    // Match the pattern from DownloadAllAttachments (TAB_A)
    var hasAttachments = false;
    if (EmpKRAData && EmpKRAData.responseJSON && EmpKRAData.responseJSON.Result && EmpKRAData.responseJSON.Result.KRAData) {
        var kraData = EmpKRAData.responseJSON.Result.KRAData;
        for (var i = 0; i < kraData.length; i++) {
            var attachmentPath = kraData[i].AttachmentPath;
            if (attachmentPath &&
                attachmentPath !== '' &&
                attachmentPath !== null &&
                attachmentPath !== undefined) {
                // Additional validation: check if it's not just whitespace or 'null' string
                var trimmedPath = String(attachmentPath).trim();
                if (trimmedPath !== '' && trimmedPath.toLowerCase() !== 'null') {
                    hasAttachments = true;
                    break;
                }
            }
        }
    }

    if (!hasAttachments) {
        AlertMessage('#divValidationAlert_Team', 'No attachments available to download', 'I');
        return;
    }

    var svrPath = CONFIG.get('SERVERNAME');
    // Include EmployeeId in the API call for team member downloads (matching TAB_A pattern)
    var apiPath = svrPath + "EmployeeKRA/DownloadAllAttachments?AppraisalCycleId=" + appraisalCycleId + "&EmployeeId=" + selectedEmployeeId;

    // Show loading indicator
    var $loader = $('<div class="kra-download-loader" style="position: fixed; top: 60px; left: 53px; right: 0; bottom: 0; background: rgba(255,255,255,0.72); -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px); z-index: 2000; display: flex; align-items: center; justify-content: center;"><div style="text-align: center; padding: 24px 32px; background: #fff; border-radius: 8px; box-shadow: 0 4px 24px rgba(0,0,0,.12); min-width: 200px;"><span style="display: inline-block; width: 40px; height: 40px; border: 3px solid #e8e8e8; border-top-color: #337ab7; border-radius: 50%; animation: mf-spin 0.75s linear infinite; margin-bottom: 12px;"></span><span style="display: block; font-size: 14px; color: #555; font-weight: 500;">Downloading ZIP...</span></div></div>');
    $('body').append($loader);

    // Use native XMLHttpRequest for blob downloads to avoid jQuery's JSON parsing
    var xhr = new XMLHttpRequest();
    xhr.open('GET', apiPath, true);
    xhr.responseType = 'blob';

    // Add authorization headers
    var headers = CommonGetHeaderInfo();
    for (var key in headers) {
        if (headers.hasOwnProperty(key)) {
            xhr.setRequestHeader(key, headers[key]);
        }
    }

    xhr.onload = function () {
        $loader.remove();

        if (xhr.status === 200) {
            // Get filename from Content-Disposition header
            var contentDisposition = xhr.getResponseHeader('Content-Disposition');
            var fileName = 'KRA_Attachments.zip';

            if (contentDisposition) {
                // Try multiple patterns to extract filename
                var fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
                if (fileNameMatch && fileNameMatch[1]) {
                    fileName = fileNameMatch[1].replace(/['"]/g, ''); // Remove quotes
                } else {
                    // Try RFC 5987 format: filename*=UTF-8''filename.ext
                    fileNameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/i);
                    if (fileNameMatch && fileNameMatch[1]) {
                        fileName = decodeURIComponent(fileNameMatch[1]);
                    } else {
                        // Simple filename=filename.ext
                        fileNameMatch = contentDisposition.match(/filename=([^;]+)/i);
                        if (fileNameMatch && fileNameMatch[1]) {
                            fileName = fileNameMatch[1].trim().replace(/['"]/g, '');
                        }
                    }
                }
            }

            // Validate that we received a blob response
            if (!xhr.response || !(xhr.response instanceof Blob)) {
                AlertMessage('#divValidationAlert_Team', 'Invalid ZIP file response from server. The file may be corrupted.', 'D');
                return;
            }

            // Check blob size - if it's 0 or very small, something might be wrong
            if (xhr.response.size === 0) {
                AlertMessage('#divValidationAlert_Team', 'Downloaded ZIP file is empty. There may be no attachments to download.', 'D');
                return;
            }

            console.log('ZIP download successful. Size:', xhr.response.size, 'bytes');

            // Create blob URL and trigger download
            var url = window.URL.createObjectURL(xhr.response);
            var link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the blob URL after a short delay
            setTimeout(function () {
                window.URL.revokeObjectURL(url);
            }, 100);
        } else {
            // Handle error response - try to read blob as text to get error message
            var reader = new FileReader();
            reader.onload = function () {
                try {
                    var errorResponse = JSON.parse(reader.result);
                    var errorMsg = errorResponse.ErrorMessage || errorResponse.Message || 'ZIP download failed';
                    AlertMessage('#divValidationAlert_Team', 'ZIP download error: ' + errorMsg, 'D');
                } catch (e) {
                    var errorMsg = 'ZIP download failed';
                    if (xhr.status === 404) {
                        errorMsg = 'ZIP file not found. There may be no attachments to download.';
                    } else if (xhr.status === 403) {
                        errorMsg = 'You do not have permission to download this ZIP file.';
                    } else if (xhr.status === 500) {
                        errorMsg = 'Server error occurred while downloading the ZIP file.';
                    }
                    AlertMessage('#divValidationAlert_Team', 'ZIP download error: ' + errorMsg, 'D');
                }
            };
            reader.onerror = function () {
                var errorMsg = 'ZIP download failed';
                if (xhr.status === 404) {
                    errorMsg = 'ZIP file not found. There may be no attachments to download.';
                } else if (xhr.status === 403) {
                    errorMsg = 'You do not have permission to download this ZIP file.';
                } else if (xhr.status === 500) {
                    errorMsg = 'Server error occurred while downloading the ZIP file.';
                }
                AlertMessage('#divValidationAlert_Team', 'ZIP download error: ' + errorMsg, 'D');
            };
            if (xhr.response instanceof Blob) {
                reader.readAsText(xhr.response);
            } else {
                var errorMsg = 'ZIP download failed';
                if (xhr.status === 404) {
                    errorMsg = 'ZIP file not found. There may be no attachments to download.';
                } else if (xhr.status === 403) {
                    errorMsg = 'You do not have permission to download this ZIP file.';
                } else if (xhr.status === 500) {
                    errorMsg = 'Server error occurred while downloading the ZIP file.';
                }
                AlertMessage('#divValidationAlert_Team', 'ZIP download error: ' + errorMsg, 'D');
            }
        }
    };

    xhr.onerror = function () {
        $loader.remove();
        AlertMessage('#divValidationAlert_Team', 'Network error occurred while downloading the ZIP file. Please try again.', 'D');
    };

    xhr.ontimeout = function () {
        $loader.remove();
        AlertMessage('#divValidationAlert_Team', 'ZIP download timeout. Please try again.', 'D');
    };

    // Set timeout (60 seconds for ZIP files, as they may be larger)
    xhr.timeout = 60000;

    // Send the request
    xhr.send();
}

/// <summary>
/// Check if there are any attachments in the KRA data and show/hide the download all attachments button
/// </summary>
function CheckAndToggleDownloadAllAttachmentsButton(kraData) {
    if (!kraData || kraData.length === 0) {
        $('#btnDownloadAllAttachments').hide();
        return;
    }

    // Check if any KRA has an attachment
    var hasAttachments = false;
    for (var i = 0; i < kraData.length; i++) {
        if (kraData[i].AttachmentPath &&
            kraData[i].AttachmentPath !== '' &&
            kraData[i].AttachmentPath !== null &&
            kraData[i].AttachmentPath !== undefined) {
            hasAttachments = true;
            break;
        }
    }

    // Show or hide the button in the header based on whether attachments exist
    if (hasAttachments) {
        $('#btnDownloadAllAttachments').show();
    } else {
        $('#btnDownloadAllAttachments').hide();
    }
}

function DownloadAllAttachments() {
    var appraisalCycleId = $('#AppCycle :selected').val();
    // Fallback to ddlAppCycle or AppraisalCycleId if dropdown value is not available
    if (!appraisalCycleId || appraisalCycleId === '' || appraisalCycleId === undefined || appraisalCycleId === '0' || appraisalCycleId === 0) {
        if (ddlAppCycle && ddlAppCycle !== 0) {
            appraisalCycleId = ddlAppCycle;
        } else if (AppraisalCycleId && AppraisalCycleId !== 0) {
            appraisalCycleId = AppraisalCycleId;
        } else if (EmpKRAData && EmpKRAData.responseJSON && EmpKRAData.responseJSON.Result && EmpKRAData.responseJSON.Result.KRAData && EmpKRAData.responseJSON.Result.KRAData.length > 0) {
            // Try to get AppraisalCycleId from the first KRA in the loaded data
            appraisalCycleId = EmpKRAData.responseJSON.Result.KRAData[0].AppraisalCycleId;
        } else {
            AlertMessage('#divValidationAlert', 'Please select an Appraisal Cycle', 'D');
            return;
        }
    }

    // Final validation - ensure we have a valid AppraisalCycleId before making the API call
    if (!appraisalCycleId || appraisalCycleId === '' || appraisalCycleId === undefined || appraisalCycleId === '0' || appraisalCycleId === 0) {
        console.error('DownloadAllAttachments: Invalid AppraisalCycleId', {
            dropdownValue: $('#AppCycle :selected').val(),
            ddlAppCycle: ddlAppCycle,
            AppraisalCycleId: AppraisalCycleId,
            EmpKRAData: EmpKRAData
        });
        AlertMessage('#divValidationAlert', 'Please select an Appraisal Cycle', 'D');
        return;
    }

    console.log('DownloadAllAttachments: Using AppraisalCycleId:', appraisalCycleId);

    // Additional validation: Check if there are attachments before attempting download
    var hasAttachments = false;
    if (EmpKRAData && EmpKRAData.responseJSON && EmpKRAData.responseJSON.Result && EmpKRAData.responseJSON.Result.KRAData) {
        var kraData = EmpKRAData.responseJSON.Result.KRAData;
        for (var i = 0; i < kraData.length; i++) {
            if (kraData[i].AttachmentPath &&
                kraData[i].AttachmentPath !== '' &&
                kraData[i].AttachmentPath !== null &&
                kraData[i].AttachmentPath !== undefined) {
                hasAttachments = true;
                break;
            }
        }
    }

    if (!hasAttachments) {
        AlertMessage('#divValidationAlert', 'No attachments available to download', 'I');
        return;
    }

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "EmployeeKRA/DownloadAllAttachments?AppraisalCycleId=" + appraisalCycleId;

    // Show loading indicator
    var $loader = $('<div class="kra-download-loader" style="position: fixed; top: 60px; left: 53px; right: 0; bottom: 0; background: rgba(255,255,255,0.72); -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px); z-index: 2000; display: flex; align-items: center; justify-content: center;"><div style="text-align: center; padding: 24px 32px; background: #fff; border-radius: 8px; box-shadow: 0 4px 24px rgba(0,0,0,.12); min-width: 200px;"><span style="display: inline-block; width: 40px; height: 40px; border: 3px solid #e8e8e8; border-top-color: #337ab7; border-radius: 50%; animation: mf-spin 0.75s linear infinite; margin-bottom: 12px;"></span><span style="display: block; font-size: 14px; color: #555; font-weight: 500;">Downloading ZIP...</span></div></div>');
    $('body').append($loader);

    // Use native XMLHttpRequest for blob downloads to avoid jQuery's JSON parsing
    var xhr = new XMLHttpRequest();
    xhr.open('GET', apiPath, true);
    xhr.responseType = 'blob';

    // Add authorization headers
    var headers = CommonGetHeaderInfo();
    for (var key in headers) {
        if (headers.hasOwnProperty(key)) {
            xhr.setRequestHeader(key, headers[key]);
        }
    }

    xhr.onload = function () {
        $loader.remove();

        if (xhr.status === 200) {
            // Get filename from Content-Disposition header
            var contentDisposition = xhr.getResponseHeader('Content-Disposition');
            var fileName = 'KRA_Attachments.zip';

            if (contentDisposition) {
                // Try multiple patterns to extract filename
                var fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
                if (fileNameMatch && fileNameMatch[1]) {
                    fileName = fileNameMatch[1].replace(/['"]/g, ''); // Remove quotes
                } else {
                    // Try RFC 5987 format: filename*=UTF-8''filename.ext
                    fileNameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/i);
                    if (fileNameMatch && fileNameMatch[1]) {
                        fileName = decodeURIComponent(fileNameMatch[1]);
                    } else {
                        // Simple filename=filename.ext
                        fileNameMatch = contentDisposition.match(/filename=([^;]+)/i);
                        if (fileNameMatch && fileNameMatch[1]) {
                            fileName = fileNameMatch[1].trim().replace(/['"]/g, '');
                        }
                    }
                }
            }

            // Validate that we received a blob response
            if (!xhr.response || !(xhr.response instanceof Blob)) {
                AlertMessage('#divValidationAlert', 'Invalid ZIP file response from server. The file may be corrupted.', 'D');
                return;
            }

            // Check blob size - if it's 0 or very small, something might be wrong
            if (xhr.response.size === 0) {
                AlertMessage('#divValidationAlert', 'Downloaded ZIP file is empty. There may be no attachments to download.', 'D');
                return;
            }

            console.log('ZIP download successful. Size:', xhr.response.size, 'bytes');

            // Create blob URL and trigger download
            var url = window.URL.createObjectURL(xhr.response);
            var link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the blob URL after a short delay
            setTimeout(function () {
                window.URL.revokeObjectURL(url);
            }, 100);
        } else {
            // Handle error response - try to read blob as text to get error message
            var reader = new FileReader();
            reader.onload = function () {
                try {
                    var errorResponse = JSON.parse(reader.result);
                    var errorMsg = errorResponse.ErrorMessage || errorResponse.Message || 'ZIP download failed';
                    AlertMessage('#divValidationAlert', 'ZIP download error: ' + errorMsg, 'D');
                } catch (e) {
                    var errorMsg = 'ZIP download failed';
                    if (xhr.status === 404) {
                        errorMsg = 'ZIP file not found. There may be no attachments to download.';
                    } else if (xhr.status === 403) {
                        errorMsg = 'You do not have permission to download this ZIP file.';
                    } else if (xhr.status === 500) {
                        errorMsg = 'Server error occurred while downloading the ZIP file.';
                    }
                    AlertMessage('#divValidationAlert', 'ZIP download error: ' + errorMsg, 'D');
                }
            };
            reader.onerror = function () {
                var errorMsg = 'ZIP download failed';
                if (xhr.status === 404) {
                    errorMsg = 'ZIP file not found. There may be no attachments to download.';
                } else if (xhr.status === 403) {
                    errorMsg = 'You do not have permission to download this ZIP file.';
                } else if (xhr.status === 500) {
                    errorMsg = 'Server error occurred while downloading the ZIP file.';
                }
                AlertMessage('#divValidationAlert', 'ZIP download error: ' + errorMsg, 'D');
            };
            if (xhr.response instanceof Blob) {
                reader.readAsText(xhr.response);
            } else {
                var errorMsg = 'ZIP download failed';
                if (xhr.status === 404) {
                    errorMsg = 'ZIP file not found. There may be no attachments to download.';
                } else if (xhr.status === 403) {
                    errorMsg = 'You do not have permission to download this ZIP file.';
                } else if (xhr.status === 500) {
                    errorMsg = 'Server error occurred while downloading the ZIP file.';
                }
                AlertMessage('#divValidationAlert', 'ZIP download error: ' + errorMsg, 'D');
            }
        }
    };

    xhr.onerror = function () {
        $loader.remove();
        AlertMessage('#divValidationAlert', 'Network error occurred while downloading the ZIP file. Please try again.', 'D');
    };

    xhr.ontimeout = function () {
        $loader.remove();
        AlertMessage('#divValidationAlert', 'ZIP download timeout. Please try again.', 'D');
    };

    // Set timeout (60 seconds for ZIP files, as they may be larger)
    xhr.timeout = 60000;

    // Send the request
    xhr.send();
}

function ScrollToElement($element) {
    if (!$element || !$element.length) {
        return;
    }

    // Wait a bit for the element to be visible (in case it was just shown)
    setTimeout(function () {
        if ($element.is(':visible')) {
            // Check if element is inside a modal
            var $modal = $element.closest('.modal');
            if ($modal.length && $modal.is(':visible')) {
                // Scroll the modal dialog itself to bring element into view
                var $modalDialog = $modal.find('.modal-dialog');
                if ($modalDialog.length) {
                    var elementTop = $element.position().top;
                    var modalScrollTop = $modal.scrollTop();
                    $modal.animate({
                        scrollTop: elementTop + modalScrollTop - 20
                    }, 500);
                }
            } else {
                // Scroll the entire page
                var elementOffset = $element.offset();
                if (elementOffset) {
                    $('html, body').animate({
                        scrollTop: elementOffset.top - 100 // Offset by 100px from top for better visibility
                    }, 500);
                }
            }

            // Focus on the element for screen readers (only if it's not already focusable)
            try {
                if (!$element.is(':focusable')) {
                    $element.attr('tabindex', '-1');
                }
                $element.focus();
            } catch (e) {
                // Ignore focus errors
            }
        }
    }, 150);
}

function AlertMessage($item, msg, type) {
    // If this is a divValidationAlert_Team message, hide ALL instances first to prevent duplicates
    if ($item.indexOf('divValidationAlert_Team') !== -1) {
        // Hide all alert divs with this ID across all tabs
        $('#divValidationAlert_Team, #tab_b #divValidationAlert_Team, #tab_c #divValidationAlert_Team').hide().empty();
    }

    // Use :first to ensure we only target the first matching element (in case of duplicate IDs)
    var $alert = $($item).first();

    // If no element found, return early
    if (!$alert.length) {
        console.warn('AlertMessage: Element not found for selector:', $item);
        return;
    }

    $alert.show();
    $alert.empty();
    $alert.append(msg + '<button class="close" data-hide="alert" aria-label="close">&times;</button>');
    $($item + " button").click(function (ev) {
        $alert.hide();
        ev.preventDefault();
        return false;
    });

    if (type == 'D') {
        $alert.removeClass('alert-success');
        $alert.addClass('alert-danger');
    } else {
        $alert.removeClass('alert-danger');
        $alert.addClass('alert-success');
    }

    // Scroll to the message element
    ScrollToElement($alert);

    // Auto-hide after 10 seconds for divValidationAlert_Team
    if ($item.indexOf('divValidationAlert_Team') !== -1) {
        setTimeout(function () {
            $alert.fadeOut('slow', function () {
                $alert.hide();
            });
        }, 10000); // 10 seconds
    }
}

$(document).on('keyup.autocomplete', '#searchEmpKRA', function () {
    var svrPath = CONFIG.get('SERVERNAME');

    if (sessionStorage.EmployeeRoleId == ROLE_DUWISEHR) {
        var apiPath = svrPath + "Search?name=" + $('#searchEmpKRA').val() + "&DUId=" + sessionStorage.HRDUId + "&type='A'";
    }
    else if (sessionStorage.EmployeeRoleId == LOCATION_ADMIN) {
        var apiPath = svrPath + "Search?EmpLoginID=" + sessionStorage.EmployeeId + "&Name=" + $('#searchEmpKRA').val() + "&LocationAdmin='A'";
    }
    else {
        var apiPath = svrPath + "Search/GetEmployeeByName?name=" + $('#searchEmpKRA').val();
    }
    var managerId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = CommonGetHeaderInfo();

    $(this).autocomplete({
        source: function (request, response) {
            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                url: apiPath,
                dataType: "json",
                headers: headerInfo,
                success: function (data) {
                    response($.map(data.Result, function (item) {
                        return {
                            label: CommonGetName(item.FirstName, item.LastName) + ' -' + item.NewEmployeeCode,
                            val: $.trim(item.EmployeeId)
                        }
                    }))
                },
                error: function (result) {
                    ;
                    toastr.error("User can not be found.");
                    $('#searchEmpKRA').val("");
                }
            });
        },
        select: function (e, i) {
            $("[id$=hdnsearchEmpKRA]").val(i.item.val);
            fillGridToApproveBySuperAdmin(i.item.val);
        },
        minLength: 3
    });
    $(".ui-autocomplete").css("z-index", "2147483647"); //use this to show autocomplete list when using popup like div
});

function fillGridToApproveBySuperAdmin(EmployeeId) {

    var AppraisalCycleId = $('#AppCycle :selected').val(); // sessionStorage.AppraisalCycleId;
    subEmpId = EmployeeId;
    //BindTMKRAGrid($("[id$=hdnsearchEmpKRA]").val(), 5)
    //loading the main grid that displays the KRA of an employee
    $('#tab_c #divValidationAlert_Team').hide();
    var isMSubmitted = false, isApproved = false;
    var status_submit = $.grep(KRAStatusMaster, function (e) {
        return e.StatusDescription == strKRAStatusSubmitted;
    });
    var result = GetKRAForTeam(EmployeeId, AppraisalCycleId);
    if (result.responseJSON.Success) {

        var EmpKRAData = result.responseJSON.Result.KRAData;
        if (EmpKRAData != null) {
            $.each(EmpKRAData, function (index, data) {
                var status_result = $.grep(KRAStatusMaster, function (e) {
                    return e.StatusId == data.KRAStatusId;
                });
                if (status_result != null && status_result != '') {
                    if (status_result[0].StatusDescription == strKRAStatusApproved) {
                        isApproved = true;
                    }
                    if (status_result[0].StatusDescription == strKRAStatusSubmitted) {
                        isMSubmitted = true;
                        isApproved = false;
                    }
                }
            });
            if (isMSubmitted || isApproved) {
                // Check if table exists before initializing DataTable
                var $table = $('#tab_c #tblTeamMemberKRAList');
                if ($table.length === 0) {
                    console.error('Table not found: #tab_c #tblTeamMemberKRAList');
                    return;
                }

                // Validate data before initializing DataTable
                if (!EmpKRAData || !Array.isArray(EmpKRAData) || EmpKRAData.length === 0) {
                    console.warn('No data available for table: #tab_c #tblTeamMemberKRAList');
                    $('#tab_c #tblTeamMemberKRAList').hide();
                    $('#tab_c .consolidated-training-section').hide();
                    return;
                }

                // Show the table
                $table.show();

                // Check if there are any attachments and show/hide download button accordingly
                CheckAndToggleDownloadAllAttachmentsButtonTeam(EmpKRAData);

                // Remove consolidated training div before destroying DataTable
                $('#tab_c .consolidated-training-section').remove();

                // Destroy existing DataTable instance if it exists
                if ($.fn.DataTable.isDataTable('#tab_c #tblTeamMemberKRAList')) {
                    try {
                        $table.DataTable().destroy();
                    } catch (e) {
                        console.warn('DataTable destroy failed, recovering:', e.message);
                        var $wrapper = $table.closest('.dataTables_wrapper');
                        if ($wrapper.length) {
                            $table.insertBefore($wrapper);
                            $wrapper.remove();
                        }
                    }
                }

                // Clear any existing table content
                $table.find('tbody').empty();

                // Initialize DataTable with error handling
                try {
                    $table.DataTable({
                        destroy: true,
                        data: EmpKRAData,
                        aoColumns: [
                            {
                                mData: "KRAId", visible: false
                            },
                            {
                                mData: "Sequence", visible: false
                            },
                            {
                                mData: "GoalType", mRender: function (data, type, full) {
                                    if (data == 'O') {
                                        return 'Operational';
                                    } else if (data == 'D') {
                                        return 'Developmental';
                                    } else {
                                        return data || '';
                                    }
                                }, width: "10%"
                        },
                        {
                            mData: "GoalDescription", width: "18%"
                        },
                        {
                            mData: "Weightage", width: "8%", className: "text-center"
                        },
                        {
                            mData: "Measure", width: "28%"
                        },
                        {
                            mData: "KRAFromDate", mRender: function (data, type, full) {
                                    if (!data) return '';
                                var dt = new Date(data);
                                return formatDate_DMY(dt);
                            }, width: "8%", className: "text-center"
                        },
                        {
                            mData: "KRAToDate", mRender: function (data, type, full) {
                                    if (!data) return '';
                                var dt = new Date(data);
                                return formatDate_DMY(dt);
                            }, width: "8%", className: "text-center"
                        },
                        {
                            mData: "KRAStatusId", mRender: function (data, type, full) {
                                var status_result = $.grep(KRAStatusMaster, function (e) {
                                    return e.StatusId == data;
                                });
                                if (status_result.length > 0)
                                    return status_result[0].StatusDescription;
                                else
                                    return 'NA'
                            }, width: "8%", className: "text-center"
                        },
                            {
                                mData: "AttachmentPath", mRender: function (data, type, full) {
                                    var hasAttachment = false;
                                    if (data !== null && data !== undefined && data !== '') {
                                        var trimmedData = String(data).trim();
                                        if (trimmedData !== '' && trimmedData.toLowerCase() !== 'null') {
                                            hasAttachment = true;
                                        }
                                    }

                                    if (hasAttachment) {
                                        var attachmentPath = full['AttachmentPath'] || data || '';
                                        return '<button class="btn btn-sm btn-success" title="Download Attachment" onclick="DownloadKRAAttachment(' + full['KRAId'] + ', \'' + attachmentPath.replace(/'/g, "\\'") + '\')" ><i class="glyphicon glyphicon-download"></i> Download</button>';
                                    } else {
                                        return '<span class="text-muted">No attachment</span>';
                                    }
                                }, width: "8%", className: "text-center", "title": "Attachments"
                            },
                            {
                                mData: null,
                                defaultContent: '',
                                orderable: false,
                                searchable: false
                            }
                    ],
                    order: [[2, "desc"], [1, "asc"]], //order by Goal type, Sequence
                    bFilter: false,  //removes search filter
                    paging: false,  //removes paging header footer
                    LengthChange: false, //removes shwoing entries
                    bInfo: false,
                    autoWidth: false
                });
                    // Render consolidated training requirements table below the tab_c KRA grid
                    renderConsolidatedTrainingTable('#tab_c #tblTeamMemberKRAList', EmpKRAData);
                }
                catch (error) {
                    console.error('Error initializing DataTable:', error);
                    AlertMessage('#tab_c #divValidationAlert_Team', 'Error loading table data. Please refresh the page.', 'D');
                    $('[id="btnAddNewGoalTeam"]').hide();
                }
                // Update button visibility based on dropdown selection (centralized logic)
                UpdateApproveRejectButtonVisibility();
                if ($.fn.DataTable.isDataTable('#tab_c #tblTeamMemberKRAList')) {
                    var isTeamSubmittedAddGoalTabC = computeIsSubmittedForAddGoalFromKraRows(EmpKRAData);
                    ApplyAddGoalButtonVisibilityAfterGridLoadTeam(EmpKRAData, isTeamSubmittedAddGoalTabC);
                }
            } else {
                AlertMessage('#tab_c #divValidationAlert_Team', strKRANotSubmitted, 'D');
                $('#tab_c #tblTeamMemberKRAList').hide();
                $('#tab_c .consolidated-training-section').hide();
                // Update button visibility based on dropdown selection
                UpdateApproveRejectButtonVisibility();
                var isSubTabC = computeIsSubmittedForAddGoalFromKraRows(EmpKRAData);
                ApplyAddGoalButtonVisibilityAfterGridLoadTeam(EmpKRAData || [], isSubTabC);
                // Hide download button if no data
                $('#btnDownloadAllAttachmentsTeam').hide();
            }
        } else {
            AlertMessage('#tab_c #divValidationAlert_Team', strKRANotFilled, 'D');
            $('#tab_c #tblTeamMemberKRAList').hide();
            $('#tab_c .consolidated-training-section').hide();
            // Update button visibility based on dropdown selection
            UpdateApproveRejectButtonVisibility();
            ApplyAddGoalButtonVisibilityAfterGridLoadTeam([], false);
            // Hide download button if no data
            $('#btnDownloadAllAttachmentsTeam').hide();
        }
    }
}

$("#ddlKRAStatusForTeam").change(function () {
    // Reset when status / team list reloads (avoid stale "all approved" hiding Add for next member)
    window.teamMemberGoalsAllApproved = false;

    // Hide the table when status dropdown changes
    $('#tblTeamMemberKRAList').hide();
    $('#tab_b #tblTeamMemberKRAList').hide();
    $('#tab_c #tblTeamMemberKRAList').hide();
    // Hide footer when status dropdown changes - it will be shown after DataTable binds
    $('#tblTeamMemberKRAListFooter').hide();
    $('#tab_b #tblTeamMemberKRAListFooter').hide();
    $('#tab_c #tblTeamMemberKRAListFooter').hide();
    $('#tblTeamMemberKRAList_consolidatedTraining').hide();
    $('#tab_b .consolidated-training-section').hide();
    $('#tab_c .consolidated-training-section').hide();
    // Also hide related buttons initially
    $('#btnDownloadAllAttachmentsTeam').hide();
    $('[id="btnAddNewGoalTeam"]').hide();
    
    // Use centralized function to update button visibility based on dropdown selection
    UpdateApproveRejectButtonVisibility();

    // Show loader while loading team members
    var $dropdownLoader = CreateLoaderWithFailSafe('Loading team members...', 30000);

    // Use setTimeout to allow loader to render before making the API call
    setTimeout(function () {
        //sessionStorage.getItem("AppraisalCycleId")
        var ManagerId = sessionStorage.getItem('EmployeeId');
        var svrPath = CONFIG.get('SERVERNAME');

        // Get AppraisalCycleId - use stored value from redirect if available, otherwise from dropdown
        var appraisalCycleId = $('#AppCycle :selected').val();
        if (!appraisalCycleId || appraisalCycleId == '0' || appraisalCycleId == undefined || appraisalCycleId == 'undefined') {
            // Fallback to stored value from redirect
            if (typeof window.selectedAppCycleIdFromRedirect !== 'undefined' && window.selectedAppCycleIdFromRedirect) {
                appraisalCycleId = window.selectedAppCycleIdFromRedirect;
            }
        }

        // Don't make API call if AppraisalCycleId is still not available
        if (!appraisalCycleId || appraisalCycleId == '0' || appraisalCycleId == undefined || appraisalCycleId == 'undefined') {
            console.warn('AppraisalCycleId is not available, skipping team member load');
            $dropdownLoader.remove();
            window.suppressTeamMemberLoadError = false;
            // Don't clear the dropdown if we're suppressing errors (initial load)
            if (!window.suppressTeamMemberLoadError) {
                // Only clear if this is a user-initiated change, not initial load
                return;
            }
            return;
        }

        var apiPath = svrPath + "/Team?KRAStatusId=" + $("#ddlKRAStatusForTeam").val() + "&AppraisalCycleId=" + appraisalCycleId + "&ManagerId=" + ManagerId;

        try {
            SubordinateList = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

            // Remove loader after API call completes
            $dropdownLoader.remove();

            // Only process if we got a successful response
            // This prevents clearing existing data if API call fails
            if (SubordinateList && SubordinateList.responseJSON && SubordinateList.responseJSON.Success) {
                // Only clear dropdown if we got a successful response
                $("#ddlMyTeamList_KRA").children().remove();
                var count = 0;

                if (SubordinateList.responseJSON.Result != null) {
                    $("#ddlMyTeamList_KRA").append($("<option>").val(0).text('Select a Team Member'));
                    $.each(SubordinateList.responseJSON.Result.data, function (index, data) {

                        $("#ddlMyTeamList_KRA").append($("<option>").val(data.EmployeeId).text(data.EmployeeName));
                        count++;
                    });
                }

                // After loading team members, check if we need to auto-select an employee
                // This handles the case when coming from EmployeeIndex with a specific employee
                if (typeof window.selectedEmployeeIdFromRedirect !== 'undefined' && window.selectedEmployeeIdFromRedirect) {
                    var employeeIdToSelect = window.selectedEmployeeIdFromRedirect;
                    var appCycleId = window.selectedAppCycleIdFromRedirect || $('#AppCycle :selected').val();
                    // Check if the employee exists in the dropdown
                    var optionExists = $("#ddlMyTeamList_KRA option[value='" + employeeIdToSelect + "']").length > 0;
                    if (optionExists) {
                        $("#ddlMyTeamList_KRA").val(employeeIdToSelect);
                        // Trigger change to load the KRA data
                        setTimeout(function () {
                            $("#ddlMyTeamList_KRA").trigger('change');
                        }, 100);
                    } else {
                        // If employee not in list, add it manually
                        if (typeof window.selectedEmployeeNameFromRedirect !== 'undefined' && window.selectedEmployeeNameFromRedirect) {
                            $("#ddlMyTeamList_KRA").append($("<option>").val(employeeIdToSelect).text(window.selectedEmployeeNameFromRedirect));
                            $("#ddlMyTeamList_KRA").val(employeeIdToSelect);
                            setTimeout(function () {
                                $("#ddlMyTeamList_KRA").trigger('change');
                            }, 100);
                        }
                    }
                    // Clear the stored values after using them
                    delete window.selectedEmployeeIdFromRedirect;
                    delete window.selectedEmployeeNameFromRedirect;
                    delete window.selectedAppCycleIdFromRedirect;
                }

                // Clear the suppress flag after successful load
                window.suppressTeamMemberLoadError = false;

                // After loading team members, update button visibility again to ensure it's correct
                UpdateApproveRejectButtonVisibility();

                return count;
            } else {
                // If API call failed, don't clear the dropdown - keep existing data
                console.warn('Team member API call failed or returned no success, keeping existing dropdown data');
                // Only show error if not suppressed
                if (!window.suppressTeamMemberLoadError) {
                    AlertMessage('#divValidationAlert_Team', 'Failed to load team members. Please try again.', 'D');
                } else {
                    window.suppressTeamMemberLoadError = false;
                }
                return 0;
            }
        } catch (error) {
            // Remove loader on error
            $dropdownLoader.remove();
            console.error('Error loading team members:', error);
            // Only show error if not suppressed (i.e., not during initial load from redirect)
            if (!window.suppressTeamMemberLoadError) {
                AlertMessage('#divValidationAlert_Team', 'Error loading team members. Please try again.', 'D');
            } else {
                // Clear the suppress flag even on error
                window.suppressTeamMemberLoadError = false;
            }
            return 0;
        }
    }, 50); // Small delay to allow loader to render
});

function FillManagerList() {

    // sessionStorage.getItem("AppraisalCycleId")
    var NavAppCycleId = '';
    if ($('#AppCycle :selected').val() != undefined) {
        NavAppCycleId = $('#AppCycle :selected').val();
    }
    else {
        NavAppCycleId = ddlAppCycle
    }
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "/EmployeeManagerMapping?AppraisalCycleId=" + NavAppCycleId + "&EmployeeId=" + sessionStorage.getItem("EmployeeId");
    var ManagerList = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    //$("#KRAToSubmitManager").children().remove();

    if (ManagerList.responseJSON.Success) {
        var count = 0;

        if (ManagerList.responseJSON.Result != null) {
            //$("#KRAToSubmitManager").append($("<option>").val(0).text('Select a Manager'));
            $.each(ManagerList.responseJSON.Result, function (index, data) {

                $("#HdnKRAToSubmitManager").val(data[0].ManagerId);
                $("#KRAToSubmitManager").val(data[0].ManagerName);
                // Update label instead of textbox
                $("#lblKRAToSubmitManager").text(data[0].ManagerName || '-');
                //$("#KRAToSubmitManager").text();

                //$("#KRAToSubmitManager").append($("<option>").val(data.ManagerId).text(data.ManagerName));
                count++;
            });
        }
        return count;
    } else {
        return 0;
    }
    //  $('#KRAToSubmitManager').val(0);
}

// Initialize Read More/Read Less handlers for Measure, Goal Description, and Goal Type (Training Requirement) columns
function initializeReadMoreHandlers() {
    // Remove existing handlers to prevent duplicates
    $(document).off('click', '.read-more-link');
    $(document).off('click', '.read-less-link');

    // Handle Read More click - works for Measure, Goal Description, Action Plan, and Goal Type (Training Requirement)
    $(document).on('click', '.read-more-link', function (e) {
        e.preventDefault();
        var $link = $(this);
        // Find the closest container (could be measure-content, goal-description-content, action-plan-content, or goal-type-content)
        var $container = $link.closest('.measure-content, .goal-description-content, .action-plan-content, .goal-type-content');
        var fullHtml = unescapeHtml($container.attr('data-full'));
        var uniqueId = $container.attr('data-id');
        var isTruncated = $container.attr('data-truncated') === 'true';

        // For Goal Type, preserve the "Training Req.:" label
        if ($container.hasClass('goal-type-content')) {
            var trainingLabel = '<b>Training Req.:</b> ';
            $container.html(trainingLabel + fullHtml + ' <a href="#" class="read-less-link" data-id="' + uniqueId + '" style="color: #337ab7; text-decoration: underline; cursor: pointer; display: block; margin-top: 5px;">Read less</a>');
        } else {
            // For Measure, Goal Description, and Action Plan - show full HTML content
            $container.html(fullHtml + ' <a href="#" class="read-less-link" data-id="' + uniqueId + '" style="color: #337ab7; text-decoration: underline; cursor: pointer; display: block; margin-top: 5px;">Read less</a>');
        }
    });

    // Handle Read Less click - works for Measure, Goal Description, Action Plan, and Goal Type (Training Requirement)
    $(document).on('click', '.read-less-link', function (e) {
        e.preventDefault();
        var $link = $(this);
        // Find the closest container (could be measure-content, goal-description-content, action-plan-content, or goal-type-content)
        var $container = $link.closest('.measure-content, .goal-description-content, .action-plan-content, .goal-type-content');
        var fullHtml = unescapeHtml($container.attr('data-full'));
        var uniqueId = $container.attr('data-id');
        var wordCount = parseInt($container.attr('data-wordcount')) || 0;
        var isTruncated = $container.attr('data-truncated') === 'true';

        if (isTruncated && wordCount > 10) {
            // For Goal Type, preserve the "Training Req.:" label
            if ($container.hasClass('goal-type-content')) {
                // Extract plain text for truncation
                var plainText = $('<div>').html(fullHtml).text();
                var words = plainText.split(/\s+/).filter(function (word) { return word.length > 0; });
                var truncatedWords = words.slice(0, 10).join(' ');
                var trainingLabel = '<b>Training Req.:</b> ';
                $container.html(trainingLabel + truncatedWords + '... <a href="#" class="read-more-link" data-id="' + uniqueId + '" style="color: #337ab7; text-decoration: underline; cursor: pointer; display: block; margin-top: 5px;">Read more</a>');
            } else {
                // For Measure, Goal Description, and Action Plan - show truncated HTML with read more
                $container.html('<div class="truncated-content">' + fullHtml + '</div><a href="#" class="read-more-link" data-id="' + uniqueId + '" style="color: #337ab7; text-decoration: underline; cursor: pointer; display: block; margin-top: 5px;">Read more</a>');
            }
        } else {
            // For Goal Type, preserve the "Training Req.:" label even when not truncated
            if ($container.hasClass('goal-type-content')) {
                var trainingLabel = '<b>Training Req.:</b> ';
                $container.html(trainingLabel + fullHtml);
            } else {
                $container.html(fullHtml);
            }
        }
    });
}

// Initialize Read More/Read Less handlers for Training Requirements column
function initializeTrainingReadMoreHandlers() {
    // Remove existing handlers to prevent duplicates
    $(document).off('click', '.read-more-link-training');
    $(document).off('click', '.read-less-link-training');

    // Handle Read More click for Training Requirements
    $(document).on('click', '.read-more-link-training', function (e) {
        e.preventDefault();
        var $link = $(this);
        var $container = $link.closest('.training-content');
        var fullText = unescapeHtml($container.attr('data-full'));
        var uniqueId = $container.attr('data-id');

        // Replace content with full text and Read Less link
        $container.html(fullText + ' <a href="#" class="read-less-link-training" data-id="' + uniqueId + '" style="color: #337ab7; text-decoration: underline; cursor: pointer;">Read less</a>');
    });

    // Handle Read Less click for Training Requirements
    $(document).on('click', '.read-less-link-training', function (e) {
        e.preventDefault();
        var $link = $(this);
        var $container = $link.closest('.training-content');
        var fullText = unescapeHtml($container.attr('data-full'));
        var uniqueId = $container.attr('data-id');
        var wordCount = parseInt($container.attr('data-wordcount')) || 0;

        if (wordCount > 5) {
            // Count words in training text only
            var words = fullText.split(/\s+/).filter(function (word) { return word.length > 0; });
            var truncatedWords = words.slice(0, 5).join(' ');

            // Replace content with truncated text and Read More link
            $container.html(truncatedWords + '... <a href="#" class="read-more-link-training" data-id="' + uniqueId + '" data-full="' + escapeHtml(fullText) + '" data-wordcount="' + wordCount + '" style="color: #337ab7; text-decoration: underline; cursor: pointer;">Read more</a>');
        } else {
            $container.html(fullText);
        }
    });
}

function FillAppraisalCycle() {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "AppraisalCycle/AppraisalCyclewithOutId";
    var AppraisalCycle = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    // Populate legacy dropdown (kept for backward compatibility)
    $('#ddlAppraisalCycleCopyKRA').empty();
    $('#ddlAppraisalCycleCopyKRA').append($("<option>").val(0).text('Select Appraisal Cycle to Copy G&Os'));

    if (AppraisalCycle && AppraisalCycle.responseJSON && AppraisalCycle.responseJSON.Result) {
        var resultData = AppraisalCycle.responseJSON.Result.data || AppraisalCycle.responseJSON.Result;
        if (Array.isArray(resultData)) {
            $.each(resultData, function (index, data) {
                $('#ddlAppraisalCycleCopyKRA').append($("<option>").val(data.AppraisalCycleId).text(data.AppraisalCycleName));
            });
        }
    }

    // Note: Modal dropdown is populated in OpenCopyKRAModal() function
}

// Legacy handler for old Copy KRA section (kept for backward compatibility)
$("#ddlAppraisalCycleCopyKRA").change(function () {
    var AppraisalCycleId = $("#ddlAppraisalCycleCopyKRA").val();
    IsCopyKRA = 1;
    // Only show btncpydiv when a valid appraisal cycle is selected (not 0)
    if (AppraisalCycleId != 0) {
        $('#btncpydiv').show();
        $('#btnKRAUpdate').show();
        $('#btnApproveTeam').css('display', 'flex').show();
        BindKRAGrid(sessionStorage.getItem("EmployeeId"), AppraisalCycleId, $('#ddlSelfAssCycle :selected').val(), 3);
    }
});

// New handler for Copy KRA Modal dropdown
$(document).on('change', '#ddlAppraisalCycleCopyKRAModal', function () {
    ;
    var selectedCycleId = $(this).val();
    if (selectedCycleId && selectedCycleId !== '0' && selectedCycleId !== '') {
        LoadKRAsForCopy(selectedCycleId);
    } else {
        // Reset modal content
        $('#copyKRAContent').hide();
        $('#copyKRANoData').hide();
        $('#btnCopyKRASubmit').hide();
    }
});

// Legacy Copy KRA button handler (kept for backward compatibility)
$("#btnCopyKRA").click(function () {
    var PreviousAppraisalCycleId = $("#ddlAppraisalCycleCopyKRA").val();
    var CurrentAppraisalCycleId = $('#AppCycle :selected').val();
    var EmployeeId = sessionStorage.EmployeeId;
    var statusId = 3;
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "EmployeeKRACopy/GetCopyKRA?PreviousAppraisalCycleId=" + PreviousAppraisalCycleId + "&CurrentAppraisalCycleId=" + CurrentAppraisalCycleId + "&EmployeeId=" + EmployeeId + "&statusId=" + statusId;
    var Result = CommonAjaxPOSTwithurl(apiPath, CommonGetHeaderInfo());
    if (Result.responseJSON.Success) {
        BindKRAGrid(sessionStorage.getItem("EmployeeId"), AppraisalCycleId, $('#ddlSelfAssCycle :selected').val());
        AlertMessage('#divValidationAlert', Result.responseJSON.Result, 'I');
        // Hide CopyKRA section and show link again after successful copy
        CancelCopyKRA();
    }
    else {
        AlertMessage('#divValidationAlert', Result.responseJSON.Result[0].ErrorMessage, 'D');
    }
});

// New Copy KRA Submit handler for modal
$(document).on('click', '#btnCopyKRASubmit', function () {
    SubmitCopyKRAs();
});

// ============================================
// REFERENCE GOAL REPOSITORY MODAL FUNCTIONS
// ============================================

// Reference Goal Repository button handler - Opens Reference Goal Repository modal
$(document).on('click', '#btnReferenceGoalRepository', function (e) {
    e.preventDefault();
    
    // Check access before showing modal
    ValidateReferenceGoalMasterAccessAndShowModal();
});

// Handle Reference Goal Master tab shown
$(document).on('shown.bs.tab', 'a[href="#refGoalMasterTab"]', function (e) {
    // Load Grade List first, then load Reference Goal Master
    LoadGradeList(function() {
        if (!window.referenceGoalsData || window.referenceGoalsData === null) {
            LoadReferenceGoalMaster();
        }
    });
});

// Handle Grade filter change in Reference Goal Master
$(document).on('change', '#ddlReferenceGoalGrade', function() {
    var selectedGradeId = $(this).val();
    LoadReferenceGoalMaster(selectedGradeId);
});

// Handle Previous Year's Goal tab shown
$(document).on('shown.bs.tab', 'a[href="#previousYearGoalTab"]', function (e) {
    // Load appraisal cycles when tab is shown
    var $dropdown = $('#ddlAppraisalCycleCopyKRAModalInline');
    if ($dropdown.find('option').length <= 1) {
        LoadAppraisalCyclesForInlineCopy();
    }
});

// Legacy handlers - kept for backward compatibility but no longer used
$(document).on('click', '#btnWantToCopyPreviousGoal', function (e) {
    e.preventDefault();
});

$(document).on('click', '#btnBackToOptions', function (e) {
    e.preventDefault();
});

$(document).on('click', '#btnReferenceGoalMaster', function (e) {
    e.preventDefault();
});

$(document).on('click', '#btnBackToOptionsFromGoalMaster', function (e) {
    e.preventDefault();
});

// Copy KRA button handler - Opens modal instead of showing section
$(document).on('click', '#btnCopyKRAOptions', function (e) {
    e.preventDefault();
    // Open the Copy KRA modal
    OpenCopyKRAModal();
});

// Legacy handler for linkCopyKRA (if it still exists)
$('#linkCopyKRA').click(function (e) {
    e.preventDefault();
    // Reset the dropdown to default state
    $('#ddlAppraisalCycleCopyKRA').val('0');
    $('#btncpydiv').show();
    // Show the Copy KRA section
    $('#tblCopyKRA').slideDown();
    // Show additional notes section
    $('#additionalNotesSection').show();
    // Hide the link when CopyKRA section is shown
    $(this).hide();
});

function CancelCopyKRA() {
    // Reset dropdown to default option (value 0)
    $('#ddlAppraisalCycleCopyKRA').val('0');
    // Clear additional notes
    $('#txtAdditionalNotes').val('');
    // Hide copy button div
    $('#btncpydiv').hide();
    // Hide additional notes section
    $('#additionalNotesSection').hide();
    // Slide up the Copy KRA section
    $('#tblCopyKRA').slideUp();
    // Show the button/link again
    $('#btnCopyKRAOptions').show();
    $('#linkCopyKRA').show();
}

// ============================================
// MANAGER-SPECIFIC MODAL FUNCTIONS
// ============================================

// Manager-specific function to clear form
function ClearKRAFormModalManager() {
    $('#hdnKRAIdManager').val('');
    $('#hdnKRAIdManager').removeData('statusId');
    $('#ddlGoalTypeModalManager').val('');
    $('#lblKRASequenceManager').val(OpSeqNo);
    $('#txtGoalDescModalManager').val('');
    $('#txtGoalWeightageModalManager').val('');
    $('#txtAreaMeasureModalManager').val('');
    $('#txtKRAStartDateModalManager').val('');

    ClearTrainingRequirementManager();

    $('#modalValidationAlertManager').hide().text('');
    $('#addGoalModalManagerLabel').text('Add New Goal');
    $('#btnSaveGoalModalManager').text('Save Goal');

    $('#addGoalModalManager').removeData('teamMemberId');
    $('#addGoalModalManager').removeData('isTeamMode');
}

// Manager-specific function to clear training requirement
function ClearTrainingRequirementManager() {
    var $dropdown = $('#ddlTrainingRequirementManager');

    if ($dropdown.hasClass('select2-hidden-accessible')) {
        try {
            $dropdown.select2('destroy');
        } catch (e) {
            console.warn('Error destroying Select2:', e);
        }
    }

    HideTrainingRequirementSelect2ContainerManager();

    $dropdown.val('').hide();
    $('#txtTrainingRequirementOtherManager').val('').removeData('category').attr('placeholder', 'Enter training/certification name').hide();
    $('#hdnTrainingItemIdManager').val('');
    $('#hdnTrainingRequirementNameManager').val('');
    $('#selectedTrainingListManager').empty().hide();
    $('#btnAddTrainingOtherManager').hide();
    $('#btnCancelTrainingOtherManager').hide();
}

// Manager-specific function to load training requirements
function LoadTrainingRequirementsManager(callback) {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Trainings/GetIPETrainingList";

    CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (response) {
        var $dropdown = $('#ddlTrainingRequirementManager');
        $dropdown.empty();
        $dropdown.append($('<option></option>').val('').text('-- Select Training/Certification --'));

        // Add static options with value 0
        $dropdown.append($('<option></option>').val('0').text('Soft Skill'));
        $dropdown.append($('<option></option>').val('0').text('Compliance'));
        $dropdown.append($('<option></option>').val('0').text('Process'));
        $dropdown.append($('<option></option>').val('0').text('Domain'));
        $dropdown.append($('<option></option>').val('0').text('Other'));

        if (response && response.Result) {
            if (Array.isArray(response.Result)) {
                $.each(response.Result, function (index, item) {
                    var trainingName = item.TrainingName || item.TrainingTitle;
                    var trainingType = item.TrainingType || ''; // Get TrainingType from API response
                    if (item && trainingName) {
                        var $option = $('<option></option>')
                            .val(item.TrainingId)
                            .text(trainingName)
                            .data('training-type', trainingType); // Store TrainingType in data attribute
                        $dropdown.append($option);
                    }
                });
            }
        }

        InitializeTrainingRequirementSelect2Manager(function () {
            if (callback && typeof callback === 'function') {
                callback();
            }
        });
    }).fail(function (xhr, status, error) {
        console.error('Error loading training requirements:', error);
        toastr.error('Failed to load training requirements');
        var $dropdown = $('#ddlTrainingRequirementManager');
        $dropdown.empty();
        $dropdown.append($('<option></option>').val('').text('-- Select Training/Certification --'));
        $dropdown.append($('<option></option>').val('0').text('Soft Skill'));
        $dropdown.append($('<option></option>').val('0').text('Compliance'));
        $dropdown.append($('<option></option>').val('0').text('Process'));
        $dropdown.append($('<option></option>').val('0').text('Domain'));
        $dropdown.append($('<option></option>').val('0').text('Other'));

        InitializeTrainingRequirementSelect2Manager(function () {
            if (callback && typeof callback === 'function') {
                callback();
            }
        });
    });
}

// Manager-specific function to hide Select2 container
function HideTrainingRequirementSelect2ContainerManager() {
    var $dropdown = $('#ddlTrainingRequirementManager');

    if ($dropdown.hasClass('select2-hidden-accessible')) {
        try {
            $dropdown.select2('close');
        } catch (e) {
            // ignore
        }
    }

    var $select2Container = $dropdown.next('.select2');
    if ($select2Container.length > 0) {
        $select2Container.hide();
        $select2Container[0].style.setProperty('display', 'none', 'important');
    }
}

// Manager-specific function to initialize Select2
function InitializeTrainingRequirementSelect2Manager(callback) {
    var $dropdown = $('#ddlTrainingRequirementManager');

    // Wait for Select2 to be available (with retries)
    var maxRetries = 20; // Increased retries for dashboard navigation
    var retryCount = 0;
    var retryInterval = 150; // 150ms between retries (slightly longer for script loading)

    function tryInitialize() {
        if (typeof $.fn.select2 === 'undefined') {
            retryCount++;
            if (retryCount < maxRetries) {
                // Try to load Select2 dynamically if it's not available
                if (retryCount === 5) {
                    // After 5 retries, try to load Select2 if script exists
                    loadSelect2IfAvailable();
                }
                // Wait a bit and try again
                setTimeout(tryInitialize, retryInterval);
                return;
            } else {
                // Max retries reached, use regular dropdown
                console.warn('Select2 is not available after ' + maxRetries + ' retries, using regular dropdown');
                // Ensure row is visible
                $('#trainingRequirementRowManager').css('display', 'block').show();
                $dropdown.show();
                if (callback && typeof callback === 'function') {
                    callback();
                }
                return;
            }
        }

        // Select2 is available, proceed with initialization
        initializeSelect2();
    }

    function loadSelect2IfAvailable() {
        // Check if Select2 script exists but hasn't loaded yet
        // This is a fallback - ideally Select2 should be loaded in the page
        if (typeof $.fn.select2 === 'undefined') {
            // Check if script tag exists
            var select2Script = $('script[src*="select2"]');
            if (select2Script.length === 0) {
                // Script not found, try to load it dynamically
                console.log('Attempting to load Select2 dynamically...');
                var script = document.createElement('script');
                script.src = '/Scripts/PEPScripts/select2.min.js';
                script.onload = function () {
                    console.log('Select2 loaded dynamically');
                    // Wait a bit for Select2 to fully initialize before trying to use it
                    setTimeout(function () {
                        if (typeof $.fn.select2 !== 'undefined' && $dropdown.length && document.body.contains($dropdown[0])) {
                            initializeSelect2();
                        }
                    }, 200);
                };
                script.onerror = function () {
                    console.warn('Failed to load Select2 dynamically');
                    // Fallback: show regular dropdown
                    if ($dropdown.length && document.body.contains($dropdown[0])) {
                        $dropdown.show();
                    }
                    if (callback && typeof callback === 'function') {
                        callback();
                    }
                };
                document.head.appendChild(script);

                // Also load CSS if not present
                if ($('link[href*="select2"]').length === 0) {
                    var link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = '/Scripts/PEPScripts/select2.min.css';
                    document.head.appendChild(link);
                }
            }
        }
    }

    function initializeSelect2() {
        // CRITICAL: Ensure training requirement row is visible before initializing Select2
        $('#trainingRequirementRowManager').css('display', 'block').show();

        // Check if dropdown still exists in DOM (but don't require it to be visible yet)
        if (!$dropdown.length || !document.body.contains($dropdown[0])) {
            console.warn('Dropdown element not found or not in DOM, skipping Select2 initialization');
            if (callback && typeof callback === 'function') {
                callback();
            }
            return;
        }

        // Make dropdown visible if it's not already
        if (!$dropdown.is(':visible')) {
            $dropdown.css('display', 'block').show();
        }

        // Destroy existing Select2 instance if it exists
        if ($dropdown.hasClass('select2-hidden-accessible')) {
            try {
                // Remove all event handlers before destroying
                $dropdown.off('change select2:open select2:close');
                $dropdown.select2('destroy');
            } catch (e) {
                console.warn('Error destroying Select2:', e);
            }
        }

        setTimeout(function () {
            // Ensure row is still visible
            $('#trainingRequirementRowManager').css('display', 'block').show();

            // Double-check dropdown still exists before initializing (but don't require visibility)
            if (!$dropdown.length || !document.body.contains($dropdown[0])) {
                console.warn('Dropdown element removed before Select2 initialization');
                if (callback && typeof callback === 'function') {
                    callback();
                }
                return;
            }

            // Make dropdown visible if it's not already
            if (!$dropdown.is(':visible')) {
                $dropdown.css('display', 'block').show();
            }

            try {
                var select2Options = {
                    placeholder: '-- Select Training/Certification --',
                    allowClear: true,
                    width: '300px'
                };

                var $modal = $('#addGoalModalManager');
                if ($modal.length > 0) {
                    select2Options.dropdownParent = $modal;
                }

                // Remove any existing change handlers to prevent duplicates
                $dropdown.off('change.select2TrainingManager');

                $dropdown.select2(select2Options);

                // Handle dropdown change - store category for static options (value 0)
                // Use namespaced event to prevent conflicts
                $dropdown.on('change.select2TrainingManager', function () {
                    // Check if element still exists
                    if (!$(this).length || !document.body.contains($(this)[0])) {
                        return;
                    }

                    var selectedValue = $(this).val();

                    // Check if any static option is selected (value is '0' or 0)
                    // Static options: Soft Skill, Compliance, Process, Domain, Other
                    if (selectedValue === '0' || selectedValue === 0) {
                        // Store the selected option text (Soft Skill, Compliance, etc.) for reference
                        var selectedOptionText = $(this).find('option:selected').text();
                        $('#txtTrainingRequirementOtherManager').data('category', selectedOptionText);

                        // Hide Select2 and show textbox
                        if ($(this).hasClass('select2-hidden-accessible')) {
                            try {
                                $(this).off('change.select2TrainingManager');
                                $(this).select2('destroy');
                            } catch (e) {
                                console.warn('Error destroying Select2:', e);
                            }
                        }
                        $(this).hide();
                        $('#txtTrainingRequirementOtherManager').attr('placeholder', 'Enter ' + selectedOptionText.toLowerCase() + ' name').show().focus();
                        $('#btnAddTrainingOtherManager').show();
                        $('#btnCancelTrainingOtherManager').show();
                    } else if (selectedValue && selectedValue !== '' && selectedValue !== '0') {
                        // Selected from dropdown (non-static option) - automatically add it to the list
                        var selectedText = $(this).find('option:selected').text();
                        var trainingItemId = parseInt(selectedValue);
                        var trainingType = $(this).find('option:selected').data('training-type') || ''; // Get TrainingType from option data

                        // Add to list with TrainingType (for training_id != 0)
                        AddTrainingRequirementToListManager(trainingItemId, selectedText, null, trainingType);
                    }
                });

                $dropdown.on('select2:open', function () {
                    var $select2Container = $('.select2-container--open');
                    if ($select2Container.length) {
                        $select2Container.css('z-index', '9999');
                    }
                });

                if (callback && typeof callback === 'function') {
                    callback();
                }
            } catch (e) {
                console.error('Error initializing Select2:', e);
                // Don't show dropdown if it was removed
                if ($dropdown.length && document.body.contains($dropdown[0])) {
                    $dropdown.show();
                }
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        }, 100);
    }

    // Start the initialization attempt
    tryInitialize();
}

// Manager-specific function to handle Add Training Requirement (legacy - now handled by dropdown change)
function HandleAddTrainingRequirementManager() {
    // Use common dropdown ID since we're using common modal
    var $dropdown = $('#ddlTrainingRequirement');
    var selectedValue = $dropdown.val();

    if (!selectedValue || selectedValue === '') {
        return;
    }

    // For non-static options, add directly to list
    if (selectedValue !== '0' && selectedValue !== 0) {
        var selectedText = $dropdown.find('option:selected').text();
        var trainingItemId = parseInt(selectedValue);
        var trainingType = $dropdown.find('option:selected').data('training-type') || '';

        // Add to list using common function
        AddTrainingRequirementToList(trainingItemId, selectedText, null, trainingType);
    }
    // Static options (value 0) are handled by the dropdown change event
}

// Manager-specific function to handle Save Training Other
function HandleSaveTrainingOtherManager() {
    // Use common textbox ID since we're using common modal
    var otherName = $('#txtTrainingRequirementOther').val().trim();

    if (!otherName || otherName === '') {
        toastr.warning('Please enter a training/certification name');
        return;
    }

    // Get the category (Soft Skill, Compliance, Process, Domain, Other) if stored
    var category = $('#txtTrainingRequirementOther').data('category') || '';

    // Add to list (0 indicates static option) using common function
    // Pass the category name (dropdown text) as the third parameter
    // The name entered by user is the course name, category is the dropdown selection
    AddTrainingRequirementToList(0, otherName, category);

    var $dropdown = $('#ddlTrainingRequirement');
    if ($dropdown.hasClass('select2-hidden-accessible')) {
        try {
            $dropdown.select2('destroy');
        } catch (e) {
            console.warn('Error destroying Select2:', e);
        }
    }
    HideTrainingRequirementSelect2Container();

    // Reset and show dropdown again
    $dropdown.show();
    $('#txtTrainingRequirementOther').val('').removeData('category').attr('placeholder', 'Enter training/certification name').hide();
    $('#btnAddTrainingOther').hide();
    $('#btnCancelTrainingOther').hide();

    // Re-initialize Select2 if options are loaded
    if ($dropdown.find('option').length > 2) {
        InitializeTrainingRequirementSelect2();
    }
}

// Manager-specific helper function to add a training requirement to the list
// Now uses the common function since we're using the common modal
function AddTrainingRequirementToListManager(trainingItemId, trainingName, categoryName, trainingType) {
    // Redirect to common function - works for both self and team modes
    return AddTrainingRequirementToList(trainingItemId, trainingName, categoryName, trainingType);
}

// Manager-specific helper function to remove a training requirement from the list
function RemoveTrainingRequirementFromListManager(button) {
    $(button).closest('.training-item').remove();

    // If no more training items, hide the list
    if ($('#selectedTrainingListManager .training-item').length === 0) {
        $('#selectedTrainingListManager').hide();
    }
}

// Manager-specific function to handle Remove Training (legacy - now using RemoveTrainingRequirementFromListManager)
function HandleRemoveTrainingManager() {
    // Clear all training requirements from list
    $('#selectedTrainingListManager').empty().hide();

    // Show dropdown
    var $dropdown = $('#ddlTrainingRequirementManager');

    // Destroy Select2 if it exists
    if ($dropdown.hasClass('select2-hidden-accessible')) {
        try {
            $dropdown.select2('destroy');
        } catch (e) {
            console.warn('Error destroying Select2:', e);
        }
    }

    // Show dropdown and reset UI
    $dropdown.show().val('');
    $('#txtTrainingRequirementOtherManager').val('').removeData('category').attr('placeholder', 'Enter training/certification name').hide();
    $('#btnAddTrainingOtherManager').hide();
    $('#btnCancelTrainingOtherManager').hide();

    // Re-initialize Select2 if dropdown has options
    // Check for default option + 5 static options (Soft Skill, Compliance, Process, Domain, Other)
    if ($('#ddlTrainingRequirementManager option').length <= 6) {
        LoadTrainingRequirementsManager(function () {
            InitializeTrainingRequirementSelect2Manager();
        });
    } else {
        InitializeTrainingRequirementSelect2Manager();
    }
}

// Manager-specific function for Goal Type Change
function OnGoalTypeChangeModalManager() {
    var goalType = $('#ddlGoalTypeModalManager').val();
    if (goalType && typeof goalType === 'string') {
        goalType = goalType.trim().toUpperCase();
        // Normalize GoalType to handle both 'O'/'D' and 'Operational'/'Developmental'
        if (goalType === 'OPERATIONAL' || goalType.startsWith('OPERATIONAL')) {
            goalType = 'O';
        } else if (goalType === 'DEVELOPMENTAL' || goalType.startsWith('DEVELOPMENTAL')) {
            goalType = 'D';
        }
        else if (goalType === 'Strategic Goal (AI-Themed)' || goalType.startsWith('Strategic')) {
            goalType = 'S'
        }
        else {
            goalType = goalType.charAt(0).toUpperCase(); // Take first character
        }
    }

    if (goalType == 'O') {
        $('#lblKRASequenceManager').val(OpSeqNo);
        $('#trainingRequirementRowManager').hide();
        ClearTrainingRequirementManager();
    } else if (goalType == 'S') {
        $('#lblKRASequenceManager').val(StrategicSeqNo);
        $('#trainingRequirementRowManager').hide();
        ClearTrainingRequirementManager();
    }
    else if (goalType == 'D') {
        $('#lblKRASequenceManager').val(DevSeqNo);
        $('#trainingRequirementRowManager').show();

        var existingTrainingItemId = $('#hdnTrainingItemIdManager').val();
        var existingTrainingName = $('#hdnTrainingRequirementNameManager').val();
        var hasExistingTraining = (existingTrainingItemId && existingTrainingItemId !== '' && existingTrainingItemId !== '0') ||
            (existingTrainingName && existingTrainingName.trim() !== '');

        // Clear any existing training list first
        $('#selectedTrainingListManager').empty().hide();

        if (hasExistingTraining) {
            // Check if there's exactly one "Other" training requirement (id = 0)
            // If so, show the textbox with the value populated for editing
            var isSingleOtherTraining = false;
            var singleOtherTrainingName = '';
            var singleOtherTrainingCategory = '';

            // Parse training data to check if it's a single "Other" training
            var trainingItemIdStr = (existingTrainingItemId !== null && existingTrainingItemId !== undefined) ? String(existingTrainingItemId) : '';
            var trainingRequirementNameStr = (existingTrainingName !== null && existingTrainingName !== undefined) ? String(existingTrainingName) : '';
            
            var trainingIds = [];
            var trainingNames = [];

            if (trainingItemIdStr !== '' && trainingItemIdStr !== 'null' && trainingItemIdStr !== 'undefined') {
                trainingIds = SplitSafeField(trainingItemIdStr);
            }

            // Parse TrainingCategory if available
            var trainingCategories = [];
            var existingTrainingCategory = $('#addGoalModalManager').data('trainingCategory');
            if (existingTrainingCategory && existingTrainingCategory !== '' && existingTrainingCategory !== 'null') {
                trainingCategories = SplitSafeField(existingTrainingCategory);
            }
            
            var expectedCount = Math.max(trainingIds.length, trainingCategories.length);
            
            if (trainingRequirementNameStr && trainingRequirementNameStr.trim() !== '' && trainingRequirementNameStr !== 'null') {
                trainingNames = SplitTrainingNames(trainingRequirementNameStr, expectedCount);
            }

            // Check if there's exactly one training and it's an "Other" type (id = 0)
            if (trainingIds.length === 1 && trainingNames.length === 1) {
                var firstId = parseInt(trainingIds[0]) || 0;
                var firstName = (trainingNames[0] || '').trim();
                var firstCategory = (trainingCategories.length > 0 ? trainingCategories[0] : '').trim();

                if (firstId == 0 && firstName !== '' && firstName !== 'null' && firstName !== 'undefined') {
                    isSingleOtherTraining = true;
                    singleOtherTrainingName = firstName;

                    // Get category from parsed array, modal data, stored data attribute, or use name as fallback
                    var modalCategory = $('#addGoalModalManager').data('trainingCategory');
                    var storedCategory = $('#txtTrainingRequirementOtherManager').data('category');
                    // Use category from parsed array if available, otherwise try other sources
                    if (firstCategory && firstCategory !== '') {
                        singleOtherTrainingCategory = firstCategory;
                    } else if (modalCategory && (HasTrainingSeparator(modalCategory) || modalCategory.indexOf(',') >= 0)) {
                        var categories = SplitSafeField(modalCategory);
                        singleOtherTrainingCategory = categories[0] || firstName;
                    } else {
                        singleOtherTrainingCategory = modalCategory || storedCategory || firstName;
                    }
                }
            }

            // Check if OpenEditGoalModalManager already set up the textbox
            var hasSingleOtherFromModal = $('#addGoalModalManager').data('hasSingleOtherTraining');
            if (hasSingleOtherFromModal) {
                console.log('OnGoalTypeChangeModalManager - Single "Other" training already set up by OpenEditGoalModalManager');
                // Get the values from modal data
                singleOtherTrainingName = $('#addGoalModalManager').data('singleOtherTrainingName') || singleOtherTrainingName;
                singleOtherTrainingCategory = $('#addGoalModalManager').data('singleOtherTrainingCategory') || singleOtherTrainingCategory;
                isSingleOtherTraining = true;
            }

            if (isSingleOtherTraining) {
                console.log('OnGoalTypeChangeModalManager - Showing textbox for single "Other" training:', {
                    name: singleOtherTrainingName,
                    category: singleOtherTrainingCategory
                });

                // Show textbox with the value for editing
                var $dropdown = $('#ddlTrainingRequirementManager');

                // Ensure training requirements are loaded first
                if ($('#ddlTrainingRequirementManager option').length <= 6) {
                    LoadTrainingRequirementsManager(function () {
                        setOtherTrainingForEditInGoalTypeChange(singleOtherTrainingName, singleOtherTrainingCategory);
                    });
                } else {
                    setOtherTrainingForEditInGoalTypeChange(singleOtherTrainingName, singleOtherTrainingCategory);
                }
            } else {
                // Multiple trainings or non-"Other" training
                // CRITICAL FIX: Check if training data array is already populated (from edit mode)
                // Do NOT add training if the array is already populated to prevent duplicates
                var trainingDataArray = GetTrainingDataArray();
                var isEditMode = $('#addGoalModal').data('isEditMode') === true;
                
                if (trainingDataArray && trainingDataArray.length > 0) {
                    // Training data array already populated (from edit modal) - just show dropdown
                    console.log('Training data array already populated in OnGoalTypeChangeModalManager - skipping add to prevent duplicates');
                } else if (existingTrainingName && existingTrainingName.trim() !== '') {
                    // Parse and add all training requirements to the list
                    var maxLength = Math.max(trainingIds.length, trainingNames.length);
                    for (var i = 0; i < maxLength; i++) {
                        var id = parseInt(trainingIds[i] || '0') || 0;
                        var name = (trainingNames[i] || '').trim();
                        if (name !== '' && name !== 'null' && name !== 'undefined') {
                            AddTrainingRequirementToListManager(id, name);
                        }
                    }
                    if (maxLength > 0) {
                        $('#selectedTrainingListManager').show();
                    }
                }

                // Show dropdown so user can add more
                $('#ddlTrainingRequirementManager').show();
                $('#txtTrainingRequirementOtherManager').hide();
                $('#btnAddTrainingOtherManager').hide();
                $('#btnCancelTrainingOtherManager').hide();

                // Ensure training requirements are loaded
                if ($('#ddlTrainingRequirementManager option').length <= 6) {
                    LoadTrainingRequirementsManager();
                } else {
                    InitializeTrainingRequirementSelect2Manager();
                }
            }
        } else {
            $('#ddlTrainingRequirementManager').show();
            $('#txtTrainingRequirementOtherManager').hide();
            $('#btnAddTrainingOtherManager').hide();
            $('#btnCancelTrainingOtherManager').hide();

            // Check for default option + 5 static options (Soft Skill, Compliance, Process, Domain, Other)
            if ($('#ddlTrainingRequirementManager option').length <= 6) {
                LoadTrainingRequirementsManager();
            } else {
                InitializeTrainingRequirementSelect2Manager();
            }
        }
    } else {
        $('#trainingRequirementRowManager').hide();
        ClearTrainingRequirementManager();
    }
}

// Helper function to set up "Other" training for editing in GoalType change handler
function setOtherTrainingForEditInGoalTypeChange(trainingName, trainingCategory) {
    var $dropdown = $('#ddlTrainingRequirementManager');

    // Find the matching category option in the dropdown
    // Category can be: Soft Skill, Compliance, Process, Domain, or Other
    var categoryToMatch = trainingCategory || trainingName;
    var matchingOption = null;

    // Try to find exact match first
    $dropdown.find('option').each(function () {
        var optionText = $(this).text().trim();
        if (optionText === categoryToMatch) {
            matchingOption = $(this);
            return false; // break
        }
    });

    // If no exact match, try case-insensitive match
    if (!matchingOption) {
        $dropdown.find('option').each(function () {
            var optionText = $(this).text().trim();
            if (optionText.toLowerCase() === categoryToMatch.toLowerCase()) {
                matchingOption = $(this);
                return false; // break
            }
        });
    }

    // If still no match, default to "Other"
    if (!matchingOption) {
        $dropdown.find('option').each(function () {
            if ($(this).text().trim() === 'Other') {
                matchingOption = $(this);
                return false; // break
            }
        });
    }

    // Set the dropdown value and show textbox
    if (matchingOption) {
        var categoryText = matchingOption.text().trim();

        // Store category in data attribute
        $('#txtTrainingRequirementOtherManager').data('category', categoryText);

        // Set dropdown value
        if ($dropdown.hasClass('select2-hidden-accessible')) {
            // Destroy Select2 first
            try {
                $dropdown.off('change.select2TrainingManager');
                $dropdown.select2('destroy');
            } catch (e) {
                console.warn('Error destroying Select2:', e);
            }
        }

        // Set the value directly (all static options have value '0')
        $dropdown.val('0');

        // Hide dropdown and show textbox with value
        $dropdown.hide();
        $('#txtTrainingRequirementOtherManager')
            .val(trainingName)
            .attr('placeholder', 'Enter ' + categoryText.toLowerCase() + ' name')
            .show();
        $('#btnAddTrainingOtherManager').show();
        $('#btnCancelTrainingOtherManager').css('display', 'inline-block').show();

        console.log('OnGoalTypeChangeModalManager - Set "Other" training for edit:', {
            name: trainingName,
            category: categoryText,
            textboxVisible: $('#txtTrainingRequirementOtherManager').is(':visible')
        });
    } else {
        // Fallback: just show textbox with value
        $dropdown.hide();
        $('#txtTrainingRequirementOtherManager')
            .val(trainingName)
            .data('category', trainingCategory || 'Other')
            .attr('placeholder', 'Enter training/certification name')
            .show();
        $('#btnAddTrainingOtherManager').show();
        $('#btnCancelTrainingOtherManager').css('display', 'inline-block').show();
    }
}

// Manager-specific function to initialize start date picker
function InitializeStartDatePickerManager() {
    var $startDateInput = $('#txtKRAStartDateModalManager');
    var $endDateInput = $('#txtKRAEndDateModalManager');

    if ($startDateInput.length === 0) {
        console.warn('Start date input not found for manager modal');
        return;
    }

    // Destroy existing datepicker if it exists
    if ($startDateInput.hasClass('hasDatepicker')) {
        $startDateInput.datepicker('destroy');
    }

    // Get end date from readonly field
    var endDateStr = $endDateInput.val();
    var maxDate = null;

    if (endDateStr) {
        var endDateParts = endDateStr.split('-');
        if (endDateParts.length === 3) {
            var year = parseInt(endDateParts[2]);
            if (year < 100) {
                year = year < 50 ? 2000 + year : 1900 + year;
            }
            maxDate = new Date(year, parseInt(endDateParts[1]) - 1, parseInt(endDateParts[0]));
        }
    }

    // Initialize datepicker
    $startDateInput.datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
        maxDate: maxDate,
        onSelect: function (selectedDate) {
            // Ensure start date is not after end date
            if (maxDate && new Date(selectedDate) > maxDate) {
                toastr.warning('Start date cannot be after end date');
                $startDateInput.val('');
            }
        }
    });
}

// Manager-specific function to open Edit Goal Modal
function OpenEditGoalModalManager(EmpKRAData, employeeId) {
    try {
        // Use the common OpenEditGoalModalCommon function with team mode
        // This ensures all the DataTable and training logic is in sync
        return OpenEditGoalModalCommon(EmpKRAData, 'team', employeeId);
    } catch (e) {
        console.error('Error in OpenEditGoalModalManager:', e);
        AlertMessage('#divValidationAlert_Team', 'Error opening edit modal: ' + e.message, 'D');
        return false;
    }
}

// Legacy function - kept for backward compatibility but now redirects to common function
function OpenEditGoalModalManager_Legacy(EmpKRAData, employeeId) {
    try {
        if (employeeId) {
            $('#addGoalModal').data('teamMemberId', employeeId);
            $('#addGoalModal').data('isTeamMode', true);
        } else {
            $('#addGoalModal').removeData('teamMemberId');
            $('#addGoalModal').removeData('isTeamMode');
        }

        $('#addGoalModal').data('isEditMode', true);
        $('#addGoalModal').data('kraData', EmpKRAData);

        if (EmpKRAData.AppraisalCycleId) {
            $('#addGoalModal').data('appraisalCycleId', EmpKRAData.AppraisalCycleId);
        } else {
            var cycleId = $('#AppCycle :selected').val();
            if (!cycleId || cycleId === '' || cycleId === '0') {
                if (typeof AppraisalCycleId !== 'undefined' && AppraisalCycleId) {
                    cycleId = AppraisalCycleId;
                } else if (typeof ddlAppCycle !== 'undefined' && ddlAppCycle && ddlAppCycle !== '0') {
                    cycleId = ddlAppCycle;
                } else if (typeof ddlAppCycleId !== 'undefined' && ddlAppCycleId && ddlAppCycleId !== '0') {
                    cycleId = ddlAppCycleId;
                }
            }
            if (cycleId && cycleId !== '' && cycleId !== '0') {
                $('#addGoalModal').data('appraisalCycleId', cycleId);
            }
        }

        $('#hdnKRAId').val(EmpKRAData.KRAId);
        $('#hdnKRAId').data('statusId', EmpKRAData.KRAStatusId);
        var owTeam = parseFloat(EmpKRAData.Weightage);
        $('#hdnKRAId').data('originalWeightage', isNaN(owTeam) ? 0 : owTeam);
        $('#ddlGoalTypeModal').val(EmpKRAData.GoalType);
        $('#lblKRASequence').val(EmpKRAData.Sequence);
        $('#txtGoalDescModal').val(EmpKRAData.GoalDescription);
        $('#txtGoalWeightageModal').val(EmpKRAData.Weightage);
        $('#txtAreaMeasureModal').val(EmpKRAData.Measure);

        var dt = new Date(EmpKRAData.KRAFromDate);
        $('#txtKRAStartDateModal').val(formatDate_DMY(dt));
        dt = new Date(EmpKRAData.KRAToDate);
        $('#txtKRAEndDateModal').val(formatDate_DMY(dt));

        // Normalize GoalType to handle both 'O'/'D' and 'Operational'/'Developmental'
        var goalType = EmpKRAData.GoalType;
        if (goalType && typeof goalType === 'string') {
            goalType = goalType.trim().toUpperCase();
            if (goalType === 'OPERATIONAL' || goalType.startsWith('OPERATIONAL')) {
                goalType = 'O';
            } else if (goalType === 'DEVELOPMENTAL' || goalType.startsWith('DEVELOPMENTAL')) {
                goalType = 'D';
            } else {
                goalType = goalType.charAt(0).toUpperCase(); // Take first character
            }
        }

        if (goalType === 'D') {
            $('#trainingRequirementRowManager').show();

            var trainingItemId = EmpKRAData.TrainingItemId;
            var trainingRequirementName = EmpKRAData.TrainingRequirementName;
            var trainingCategory = EmpKRAData.TrainingCategory; // Get TrainingCategory if available

            // Convert to strings for consistent processing
            var trainingItemIdStr = (trainingItemId !== null && trainingItemId !== undefined) ? String(trainingItemId) : '';
            var trainingRequirementNameStr = (trainingRequirementName !== null && trainingRequirementName !== undefined) ? String(trainingRequirementName) : '';
            var trainingCategoryStr = (trainingCategory !== null && trainingCategory !== undefined) ? String(trainingCategory) : '';

            // Debug logging
            console.log('OpenEditGoalModalManager - Training data:', {
                TrainingItemId: trainingItemId,
                TrainingItemIdStr: trainingItemIdStr,
                TrainingItemIdType: typeof trainingItemId,
                TrainingRequirementName: trainingRequirementName,
                TrainingRequirementNameStr: trainingRequirementNameStr,
                TrainingRequirementNameType: typeof trainingRequirementName,
                TrainingCategory: trainingCategory,
                TrainingCategoryStr: trainingCategoryStr,
                EmpKRAData: EmpKRAData
            });
            
            // Check if training data exists
            var hasTrainingData = false;
            if (trainingItemIdStr !== '' && trainingItemIdStr !== 'null' && trainingItemIdStr !== 'undefined') {
                var testIds = SplitSafeField(trainingItemIdStr).filter(function(id) { return id.trim() !== '' && id.trim() !== 'null'; });
                hasTrainingData = testIds.length > 0;
            }
            if (!hasTrainingData && trainingRequirementNameStr && trainingRequirementNameStr.trim() !== '' && trainingRequirementNameStr !== 'null') {
                hasTrainingData = true;
            }
            
            // Clear existing training list first
            $('#selectedTrainingListManager').empty();

            if (hasTrainingData) {
                var trainingIds = [];
                var trainingNames = [];
                var trainingCategories = [];

                if (trainingItemIdStr !== '' && trainingItemIdStr !== 'null' && trainingItemIdStr !== 'undefined') {
                    trainingIds = SplitSafeField(trainingItemIdStr);
                }
                
                if (trainingCategoryStr && trainingCategoryStr.trim() !== '' && trainingCategoryStr !== 'null') {
                    trainingCategories = SplitSafeField(trainingCategoryStr);
                }
                
                var expectedCount = Math.max(trainingIds.length, trainingCategories.length);
                
                if (trainingRequirementNameStr && trainingRequirementNameStr.trim() !== '' && trainingRequirementNameStr !== 'null') {
                    trainingNames = SplitTrainingNames(trainingRequirementNameStr, expectedCount);
                }

                console.log('OpenEditGoalModalManager - Parsed arrays:', {
                    trainingIds: trainingIds,
                    trainingNames: trainingNames,
                    trainingCategories: trainingCategories
                });

                // Ensure all arrays have the same length (pad with empty strings if needed)
                var maxLength = Math.max(trainingIds.length, trainingNames.length, trainingCategories.length);
                while (trainingIds.length < maxLength) {
                    trainingIds.push('0');
                }
                while (trainingNames.length < maxLength) {
                    trainingNames.push('');
                }
                while (trainingCategories.length < maxLength) {
                    trainingCategories.push('');
                }

                console.log('OpenEditGoalModalManager - After padding, maxLength:', maxLength, {
                    trainingIds: trainingIds,
                    trainingNames: trainingNames,
                    trainingCategories: trainingCategories
                });

                // Add all training requirements to the list
                var $list = $('#selectedTrainingListManager');
                if ($list.length === 0) {
                    console.error('OpenEditGoalModalManager - selectedTrainingListManager element not found!');
                    return;
                }

                var itemsAdded = 0;
                for (var i = 0; i < maxLength; i++) {
                    var id = parseInt(trainingIds[i]) || 0;
                    var name = (trainingNames[i] || '').trim();
                    var category = (trainingCategories[i] || '').trim();

                    console.log('OpenEditGoalModalManager - Processing item', i, ':', {
                        id: id,
                        name: name,
                        category: category,
                        nameLength: name.length
                    });

                    if (name !== '' && name !== 'null' && name !== 'undefined') {
                        // If training_id = 0 and category is not available, use name as category
                        if (id == 0 && !category) {
                            category = name;
                        }

                        // Add to list with category stored in data attribute
                        var categoryAttr = (id == 0 && category) ? ' data-training-category="' + escapeHtml(category) + '"' : '';
                        var trainingItemHtml = '<span class="training-item label label-info" data-training-id="' + id + '" data-training-name="' + escapeHtml(name) + '"' + categoryAttr +
                            ' style="font-size: 12px; padding: 5px 8px; margin-right: 5px; margin-bottom: 5px; display: inline-block; cursor: default;">' +
                            escapeHtml(name) +
                            ' <button type="button" onclick="RemoveTrainingRequirementFromListManager(this)" style="background: transparent; border: none; color: #fff; padding: 0; margin-left: 5px; cursor: pointer; font-size: 14px; line-height: 1;" title="Remove">' +
                            '<i class="glyphicon glyphicon-remove"></i>' +
                            '</button>' +
                            '</span>';
                        $list.append(trainingItemHtml);
                        itemsAdded++;
                        console.log('OpenEditGoalModalManager - Added training item:', name, 'HTML length:', trainingItemHtml.length);
                    }
                }

                if (itemsAdded > 0) {
                    $list.show();
                    console.log('OpenEditGoalModalManager - Training list shown with', itemsAdded, 'items. Container visible:', $list.is(':visible'), 'Container HTML:', $list.html().substring(0, 200));
                } else {
                    console.warn('OpenEditGoalModalManager - No training items were added to the list!', {
                        maxLength: maxLength,
                        trainingIds: trainingIds,
                        trainingNames: trainingNames
                    });
                }

                // Store comma-separated values in hidden fields for backward compatibility
                $('#hdnTrainingItemIdManager').val(trainingItemId || '0');
                $('#hdnTrainingRequirementNameManager').val(trainingRequirementName || '');
                // Store TrainingCategory in modal data for later use
                $('#addGoalModalManager').data('trainingCategory', trainingCategory || '');

                // Check if there's exactly one "Other" training requirement (id = 0)
                // If so, show the textbox with the value populated for editing
                var $dropdown = $('#ddlTrainingRequirementManager');
                var hasSingleOtherTraining = false;
                var singleOtherTrainingName = '';
                var singleOtherTrainingCategory = '';

                if (itemsAdded === 1 && maxLength === 1) {
                    var firstId = parseInt(trainingIds[0]) || 0;
                    var firstName = (trainingNames[0] || '').trim();
                    var firstCategory = (trainingCategories[0] || '').trim();

                    console.log('OpenEditGoalModalManager - Checking for single "Other" training:', {
                        itemsAdded: itemsAdded,
                        maxLength: maxLength,
                        firstId: firstId,
                        firstName: firstName,
                        firstCategory: firstCategory,
                        firstNameLength: firstName.length,
                        isIdZero: (firstId == 0),
                        isNameValid: (firstName !== '' && firstName !== 'null' && firstName !== 'undefined')
                    });

                    if (firstId == 0 && firstName !== '' && firstName !== 'null' && firstName !== 'undefined') {
                        hasSingleOtherTraining = true;
                        singleOtherTrainingName = firstName;
                        singleOtherTrainingCategory = firstCategory || firstName;
                        console.log('OpenEditGoalModalManager - Single "Other" training found:', {
                            name: singleOtherTrainingName,
                            category: singleOtherTrainingCategory,
                            hasSingleOtherTraining: hasSingleOtherTraining
                        });
                    } else {
                        console.log('OpenEditGoalModalManager - Not a single "Other" training:', {
                            firstId: firstId,
                            firstName: firstName,
                            condition1: (firstId == 0),
                            condition2: (firstName !== '' && firstName !== 'null' && firstName !== 'undefined')
                        });
                    }
                } else {
                    console.log('OpenEditGoalModalManager - Not checking for single "Other" training:', {
                        itemsAdded: itemsAdded,
                        maxLength: maxLength,
                        condition: (itemsAdded === 1 && maxLength === 1)
                    });
                }

                // Helper function to set up "Other" training for editing
                function setOtherTrainingForEdit(trainingName, trainingCategory) {
                    console.log('setOtherTrainingForEdit called with:', {
                        trainingName: trainingName,
                        trainingCategory: trainingCategory
                    });

                    var $dropdown = $('#ddlTrainingRequirementManager');

                    // Find the matching category option in the dropdown
                    // Category can be: Soft Skill, Compliance, Process, Domain, or Other
                    var categoryToMatch = trainingCategory || trainingName;
                    var matchingOption = null;

                    console.log('setOtherTrainingForEdit - Looking for category:', categoryToMatch);

                    // Try to find exact match first
                    $dropdown.find('option').each(function () {
                        var optionText = $(this).text().trim();
                        if (optionText === categoryToMatch) {
                            matchingOption = $(this);
                            return false; // break
                        }
                    });

                    // If no exact match, try case-insensitive match
                    if (!matchingOption) {
                        $dropdown.find('option').each(function () {
                            var optionText = $(this).text().trim();
                            if (optionText.toLowerCase() === categoryToMatch.toLowerCase()) {
                                matchingOption = $(this);
                                return false; // break
                            }
                        });
                    }

                    // If still no match, default to "Other"
                    if (!matchingOption) {
                        $dropdown.find('option').each(function () {
                            if ($(this).text().trim() === 'Other') {
                                matchingOption = $(this);
                                return false; // break
                            }
                        });
                    }

                    // Set the dropdown value and trigger change if Select2 is initialized
                    if (matchingOption) {
                        var categoryText = matchingOption.text().trim();
                        var categoryValue = matchingOption.val();

                        // Store category in data attribute
                        $('#txtTrainingRequirementOtherManager').data('category', categoryText);

                        // Set dropdown value
                        if ($dropdown.hasClass('select2-hidden-accessible')) {
                            // Destroy Select2 first
                            try {
                                $dropdown.off('change.select2TrainingManager');
                                $dropdown.select2('destroy');
                            } catch (e) {
                                console.warn('Error destroying Select2:', e);
                            }
                        }

                        // Set the value directly (all static options have value '0')
                        $dropdown.val('0');

                        // Hide dropdown and show textbox with value
                        $dropdown.hide();
                        var $textbox = $('#txtTrainingRequirementOtherManager');
                        $textbox
                            .val(trainingName)
                            .attr('placeholder', 'Enter ' + categoryText.toLowerCase() + ' name')
                            .css('display', 'block')
                            .show();
                        $('#btnAddTrainingOtherManager').show();
                        $('#btnCancelTrainingOtherManager').css('display', 'inline-block').show();

                        console.log('OpenEditGoalModalManager - Set "Other" training for edit:', {
                            name: trainingName,
                            category: categoryText,
                            textboxValue: $textbox.val(),
                            textboxVisible: $textbox.is(':visible'),
                            textboxDisplay: $textbox.css('display'),
                            textboxLength: $textbox.length,
                            parentVisible: $textbox.parent().is(':visible'),
                            rowVisible: $('#trainingRequirementRowManager').is(':visible')
                        });
                    } else {
                        // Fallback: just show textbox with value
                        console.log('setOtherTrainingForEdit - No matching option found, using fallback');
                        $dropdown.hide();
                        var $textbox = $('#txtTrainingRequirementOtherManager');
                        $textbox
                            .val(trainingName)
                            .data('category', trainingCategory || 'Other')
                            .attr('placeholder', 'Enter training/certification name')
                            .css('display', 'block')
                            .show();
                        $('#btnAddTrainingOtherManager').show();
                        $('#btnCancelTrainingOtherManager').css('display', 'inline-block').show();

                        console.log('setOtherTrainingForEdit - Fallback textbox set:', {
                            textboxValue: $textbox.val(),
                            textboxVisible: $textbox.is(':visible'),
                            textboxDisplay: $textbox.css('display')
                        });
                    }
                }

                console.log('OpenEditGoalModalManager - hasSingleOtherTraining check:', {
                    hasSingleOtherTraining: hasSingleOtherTraining,
                    singleOtherTrainingName: singleOtherTrainingName,
                    singleOtherTrainingCategory: singleOtherTrainingCategory
                });

                if (hasSingleOtherTraining) {
                    console.log('OpenEditGoalModalManager - Hiding list and showing textbox for single "Other" training');
                    // Store flag in modal data so GoalType change handler knows about it
                    $('#addGoalModalManager').data('hasSingleOtherTraining', true);
                    $('#addGoalModalManager').data('singleOtherTrainingName', singleOtherTrainingName);
                    $('#addGoalModalManager').data('singleOtherTrainingCategory', singleOtherTrainingCategory);

                    // Hide the training list since we'll show it in the textbox
                    $list.hide();

                    // Ensure training requirements are loaded first
                    var dropdownOptionCount = $('#ddlTrainingRequirementManager option').length;
                    console.log('OpenEditGoalModalManager - Dropdown option count:', dropdownOptionCount);

                    if (dropdownOptionCount <= 6) {
                        console.log('OpenEditGoalModalManager - Loading training requirements...');
                        LoadTrainingRequirementsManager(function () {
                            console.log('OpenEditGoalModalManager - Training requirements loaded, setting up textbox');
                            // After loading, set the dropdown to the appropriate category and show textbox
                            setOtherTrainingForEdit(singleOtherTrainingName, singleOtherTrainingCategory);
                        });
                    } else {
                        console.log('OpenEditGoalModalManager - Training requirements already loaded, setting up textbox');
                        // Already loaded, set dropdown and show textbox
                        setOtherTrainingForEdit(singleOtherTrainingName, singleOtherTrainingCategory);
                    }
                } else {
                    console.log('OpenEditGoalModalManager - Not a single "Other" training, showing dropdown and list');
                    // Clear the flag
                    $('#addGoalModalManager').removeData('hasSingleOtherTraining');
                    $('#addGoalModalManager').removeData('singleOtherTrainingName');
                    $('#addGoalModalManager').removeData('singleOtherTrainingCategory');

                    // Show dropdown so user can add more training
                    $dropdown.show();
                    $('#txtTrainingRequirementOtherManager').hide();
                    $('#btnAddTrainingOtherManager').hide();
                    $('#btnCancelTrainingOtherManager').hide();

                    // Ensure training requirements are loaded (if not already loaded)
                    // Check for default option + 5 static options (Soft Skill, Compliance, Process, Domain, Other)
                    if ($('#ddlTrainingRequirementManager option').length <= 6) {
                        LoadTrainingRequirementsManager();
                    } else {
                        // If already loaded, just initialize Select2
                        InitializeTrainingRequirementSelect2Manager();
                    }
                }
            } else {
                $('#selectedTrainingListManager').empty().hide();
                $('#ddlTrainingRequirementManager').show();
                $('#txtTrainingRequirementOtherManager').hide();
                $('#btnAddTrainingOtherManager').hide();
                $('#btnCancelTrainingOtherManager').hide();
                LoadTrainingRequirementsManager();
            }
        } else if (goalType === 'O') {
            // GoalType is Operational - hide training requirement section and clear any existing data
            $('#trainingRequirementRowManager').hide();
            ClearTrainingRequirementManager();
        } else {
            // No goal type or unknown - hide training requirement section
            $('#trainingRequirementRowManager').hide();
            ClearTrainingRequirementManager();
        }

        // Ensure GoalType dropdown is set correctly and trigger change event to update UI
        $('#ddlGoalTypeModalManager').val(goalType || EmpKRAData.GoalType);

        // If we have a single "Other" training, delay the change event to ensure our setup completes first
        // Otherwise, trigger change event immediately to ensure UI is properly updated
        var hasSingleOther = $('#addGoalModalManager').data('hasSingleOtherTraining');
        if (hasSingleOther) {
            console.log('OpenEditGoalModalManager - Delaying GoalType change event for single "Other" training');
            // Delay the change event to allow textbox setup to complete
            setTimeout(function () {
                $('#ddlGoalTypeModalManager').trigger('change');
            }, 300);
        } else {
            // Trigger change event to ensure UI is properly updated (hides/shows training requirement based on GoalType)
            $('#ddlGoalTypeModalManager').trigger('change');
        }

        $('#addGoalModalManagerLabel').text('Edit Goal');
        $('#btnSaveGoalModalManager').text('Update Goal');

        $('#addGoalModalManager').modal({
            backdrop: 'static',
            keyboard: false,
            show: true
        });

        setTimeout(function () {
            if ($('#addGoalModalManager')[0]) {
                $('#addGoalModalManager')[0].style.setProperty('display', 'block', 'important');
                $('#addGoalModalManager')[0].style.setProperty('z-index', '1060', 'important');
            }
            if (typeof InitializeStartDatePickerManager === 'function') {
                InitializeStartDatePickerManager();
            }
        }, 100);

        return true;
    } catch (e) {
        console.error('Error in OpenEditGoalModalManager:', e);
        AlertMessage('#divValidationAlert_Team', 'Error opening edit modal: ' + e.message, 'D');
        return false;
    }
}

// Manager-specific function to save KRA form - now uses common save function
function SaveKRAFormModalManager() {
    console.log('SaveKRAFormModalManager called - redirecting to common save function');
    // Simply call the common save function - it will detect team mode from modal data
    return SaveKRAFormModal();
}

// Legacy manager save function - kept for reference but no longer used
function SaveKRAFormModalManager_Legacy() {
    console.log('SaveKRAFormModalManager_Legacy called');

    if ($('#btnSaveGoalModal').prop('disabled')) {
        console.log('Save already in progress, ignoring duplicate call');
        return false;
    }

    try {
        $('#modalValidationAlertManager').hide().text('');

        var formData = {
            kRAId: $('#hdnKRAIdManager').val(),
            goalType: $('#ddlGoalTypeModalManager').val(),
            goalSequence: $('#lblKRASequenceManager').val(),
            goalDescription: $('#txtGoalDescModalManager').val().trim(),
            weightage: $('#txtGoalWeightageModalManager').val().trim(),
            measure: $('#txtAreaMeasureModalManager').val().trim(),
            startDateStr: $('#txtKRAStartDateModalManager').val().trim(),
            endDateStr: $('#txtKRAEndDateModalManager').val().trim()
        };

        var validationErrors = [];

        if (!formData.goalDescription) {
            validationErrors.push('Key Responsibility Area (KRA) is required');
        }
        if (!formData.weightage) {
            validationErrors.push('Weightage is required');
        }
        if (!formData.measure) {
            validationErrors.push('Key Performance Indicators (KPIs) is required');
        }
        if (!formData.goalType) {
            validationErrors.push('Goal Type is required');
        }
        // Date validation removed - dates are auto-populated from AppraisalCycle
        // Get dates from AppraisalCycle if not in form data
        if (!formData.startDateStr) {
            // Try to get from AppraisalCycle
            var startDate = '';
            if (AppraisalCycle && AppraisalCycle.responseJSON && AppraisalCycle.responseJSON.Result && AppraisalCycle.responseJSON.Result.data) {
                var selectedCycleId = $('#AppCycle :selected').val();
                if (selectedCycleId) {
                    $.each(AppraisalCycle.responseJSON.Result.data, function (index, data) {
                        if (data.AppraisalCycleId == selectedCycleId) {
                            startDate = formatDate_DMY(data.StartDate);
                            return false; // break the loop
                        }
                    });
                }
            }
            if (startDate) {
                formData.startDateStr = startDate;
            }
        }
        if (!formData.endDateStr) {
            // Try to get from AppraisalCycle
            var endDate = '';
            if (AppraisalCycle && AppraisalCycle.responseJSON && AppraisalCycle.responseJSON.Result && AppraisalCycle.responseJSON.Result.data) {
                var selectedCycleId = $('#AppCycle :selected').val();
                if (selectedCycleId) {
                    $.each(AppraisalCycle.responseJSON.Result.data, function (index, data) {
                        if (data.AppraisalCycleId == selectedCycleId) {
                            endDate = formatDate_DMY(data.EndDate);
                            return false; // break the loop
                        }
                    });
                }
            }
            if (endDate) {
                formData.endDateStr = endDate;
            }
        }

        var kraStartDate = '';
        if (formData.startDateStr) {
            var dateParts = formData.startDateStr.split('-');
            if (dateParts.length === 3) {
                var year = parseInt(dateParts[2]);
                if (year < 100) {
                    year = year < 50 ? 2000 + year : 1900 + year;
                }
                kraStartDate = year + '-' +
                    ('0' + dateParts[1]).slice(-2) + '-' +
                    ('0' + dateParts[0]).slice(-2);
            } else {
                kraStartDate = foramtDate_DMY2YMD(formData.startDateStr);
            }
        }

        var kraEndDate = foramtDate_DMY2YMD(formData.endDateStr);

        if (validationErrors.length > 0) {
            $('#modalValidationAlertManager').text(validationErrors[0]).show();
            ScrollToElement($('#modalValidationAlertManager'));
            return false;
        }

        var weightageNum = parseFloat(formData.weightage);
        if (isNaN(weightageNum) || weightageNum <= 0) {
            $('#modalValidationAlertManager').text('Weightage must be a positive number').show();
            ScrollToElement($('#modalValidationAlertManager'));
            return false;
        }

        // Get AppraisalCycleId from multiple sources
        var appraisalCycleId = $('#addGoalModalManager').data('appraisalCycleId');
        if (!appraisalCycleId || appraisalCycleId === '' || appraisalCycleId === '0') {
            var kraData = $('#addGoalModalManager').data('kraData');
            if (kraData && kraData.AppraisalCycleId) {
                appraisalCycleId = kraData.AppraisalCycleId;
            } else {
                appraisalCycleId = $('#AppCycle :selected').val();
            }
        }

        if (!appraisalCycleId || appraisalCycleId === '' || appraisalCycleId === '0') {
            if (typeof AppraisalCycleId !== 'undefined' && AppraisalCycleId) {
                appraisalCycleId = AppraisalCycleId;
            } else if (typeof ddlAppCycle !== 'undefined' && ddlAppCycle && ddlAppCycle !== '0') {
                appraisalCycleId = ddlAppCycle;
            } else if (typeof ddlAppCycleId !== 'undefined' && ddlAppCycleId && ddlAppCycleId !== '0') {
                appraisalCycleId = ddlAppCycleId;
            }
        }

        if (!appraisalCycleId || appraisalCycleId === '' || appraisalCycleId === '0') {
            $('#modalValidationAlertManager').text('Please select an Appraisal Cycle.').show();
            ScrollToElement($('#modalValidationAlertManager'));
            return false;
        }

        // Get Training Requirement data (only for Developmental goals)
        // Collect all training requirements and store as comma-separated values
        var trainingItemId = null;
        var trainingRequirementName = null;
        var trainingCategory = null;
        if (formData.goalType === 'D') {
            // Get all training requirements from the list
            var trainingItemIds = [];
            var trainingItemNames = [];
            var trainingCategories = [];
            $('#selectedTrainingListManager .training-item').each(function () {
                var itemId = $(this).attr('data-training-id');
                var itemName = $(this).attr('data-training-name');
                var itemCategory = $(this).attr('data-training-category'); // Get category if available
                if (itemId !== undefined && itemName !== undefined) {
                    var parsedId = parseInt(itemId) || 0;
                    var parsedName = unescapeHtml(itemName);
                    trainingItemIds.push(parsedId);
                    trainingItemNames.push(parsedName);
                    // For training_id = 0, store the category (which is the category name like "Soft Skill", "Compliance", etc.)
                    // For training_id > 0, store the TrainingType from database (stored in data-training-category)
                    if (parsedId == 0 && itemCategory) {
                        // Custom training - use the category name
                        trainingCategories.push(unescapeHtml(itemCategory));
                    } else if (parsedId == 0) {
                        // Fallback: if category not stored, use empty string
                        trainingCategories.push('');
                    } else if (itemCategory) {
                        // Regular training - use TrainingType from database
                        trainingCategories.push(unescapeHtml(itemCategory));
                    } else {
                        // No category available
                        trainingCategories.push('');
                    }
                }
            });
            
            if (trainingItemIds.length > 0) {
                trainingItemId = trainingItemIds.join(TRAINING_SEPARATOR);
                trainingRequirementName = trainingItemNames.join(TRAINING_SEPARATOR);
                trainingCategory = trainingCategories.join(TRAINING_SEPARATOR);
            } else {
                // All training removed — send empty string so the SP clears the columns
                trainingItemId = '';
                trainingRequirementName = '';
                trainingCategory = '';
            }
            
            console.log('Manager Training requirement data:', {
                trainingItemIds: trainingItemIds,
                trainingItemNames: trainingItemNames,
                trainingCategories: trainingCategories,
                trainingItemId: trainingItemId,
                trainingRequirementName: trainingRequirementName,
                trainingCategory: trainingCategory,
                totalCount: trainingItemIds.length
            });
        }

        // Get team member ID if in team mode
        var teamMemberId = $('#addGoalModalManager').data('teamMemberId');
        var isEditMode = $('#addGoalModalManager').data('isEditMode');
        var loggedInEmployeeId = parseInt(sessionStorage.getItem('EmployeeId'));
        var employeeId = teamMemberId ? parseInt(teamMemberId) : loggedInEmployeeId;

        // Disable save button to prevent multiple submissions
        $('#btnSaveGoalModalManager').prop('disabled', true);

        // Get status - for updates, keep existing status; for inserts, use Initialised
        var statusId = 1; // Default to Initialised
        if (isEditMode && formData.kRAId && formData.kRAId !== '') {
            var existingStatusId = $('#hdnKRAIdManager').data('statusId');
            if (existingStatusId) {
                statusId = existingStatusId;
            }
        }

        // Prepare KRA data object (same structure as employee modal)
        var employeeKRA = {
            KRAId: formData.kRAId ? parseInt(formData.kRAId) : 0,
            EmployeeId: employeeId, // Team member's ID when manager is adding/editing
            AppraisalCycleId: parseInt(appraisalCycleId),
            KRAFromDate: kraStartDate,
            KRAToDate: kraEndDate,
            GoalType: formData.goalType,
            Sequence: parseInt(formData.goalSequence) || 1,
            GoalDescription: formData.goalDescription,
            Weightage: weightageNum,
            Measure: formData.measure,

            ActionStep: '',
            TargetDate: kraEndDate,
            KRASetId: 1,
            KRAStatusId: statusId,
            TrainingItemId: trainingItemId,
            TrainingRequirementName: trainingRequirementName,
            TrainingCategory: trainingCategory
        };

        // For team mode (manager adding/editing goal for team member)
        if (teamMemberId && teamMemberId > 0) {
            employeeKRA.CreatedBy = loggedInEmployeeId; // Manager's ID
            employeeKRA.ManagerId = loggedInEmployeeId; // Manager's ID
            employeeKRA.ModifiedBy = loggedInEmployeeId; // Manager's ID
            employeeKRA.flag = 1; // Flag to indicate team mode
        } else {
            employeeKRA.CreatedBy = loggedInEmployeeId;
        }

        // For updates, set ModifiedBy
        if (isEditMode && formData.kRAId && formData.kRAId !== '') {
            employeeKRA.ModifiedBy = loggedInEmployeeId;
        }

        console.log('Manager saving KRA:', JSON.stringify(employeeKRA, null, 2));

        // Show loader/spinner with fail-safe
        var loader = CreateLoaderWithFailSafe(isUpdate ? 'Updating Goal...' : 'Saving Goal...', 30000);

        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = '';
        var isUpdate = isEditMode && formData.kRAId && formData.kRAId !== '';

        if (isUpdate) {
            apiPath = svrPath + 'EmployeeKRA/UpdateKRA';
        } else {
            apiPath = svrPath + 'EmployeeKRA/SubmitKRAOpWithSP';
        }

        $.ajax({
            url: apiPath,
            type: 'POST',
            data: JSON.stringify(employeeKRA),
            async: true,
            dataType: 'json',
            contentType: 'application/json',
            timeout: 60000,
            headers: CommonGetHeaderInfo(),
            success: function (result) {
                loader.remove();
                $('#btnSaveGoalModalManager').prop('disabled', false);

                if (result && result.Success) {
                    $('#addGoalModalManager').modal('hide');
                    toastr.success(isUpdate ? 'Goal updated successfully!' : 'Goal saved successfully!');

                    // Refresh the appropriate grid
                    if (teamMemberId) {
                        BindTMKRAGrid(teamMemberId, appraisalCycleId);
                    } else {
                        var selfAssCycleId = $('#ddlSelfAssCycle :selected').val();
                        BindKRAGrid(sessionStorage.getItem('EmployeeId'), appraisalCycleId, selfAssCycleId);

                        // IMPORTANT: Revalidate Goal Modification button after KRA is saved/updated via modal
                        // KRA data has changed, which may affect goal modification eligibility
                        setTimeout(function () {
                            console.log('SaveKRAFormModalManager: KRA saved via modal, revalidating Goal Modification button');
                            ValidateAndShowGoalModificationButton();
                        }, 300);
                    }
                } else {
                    var errorMsg = 'An error occurred while saving the goal.';
                    if (result && result.Result && result.Result.length > 0 && result.Result[0].ErrorMessage) {
                        errorMsg = result.Result[0].ErrorMessage;
                    }
                    $('#modalValidationAlertManager').text(errorMsg).show();
                    ScrollToElement($('#modalValidationAlertManager'));
                }
            },
            error: function (xhr, status, error) {
                loader.remove();
                $('#btnSaveGoalModalManager').prop('disabled', false);
                console.error('Error saving goal:', error);
                var errorMsg = 'An error occurred while saving the goal. Please try again.';
                if (xhr.responseJSON && xhr.responseJSON.ErrorMessage) {
                    errorMsg = xhr.responseJSON.ErrorMessage;
                }
                $('#modalValidationAlertManager').text(errorMsg).show();
                ScrollToElement($('#modalValidationAlertManager'));
            }
        });

        return true;
    } catch (e) {
        // Remove loader if it was created
        if (typeof loader !== 'undefined' && loader && loader.remove) {
            loader.remove();
        }
        console.error('Error in SaveKRAFormModalManager:', e);
        $('#btnSaveGoalModalManager').prop('disabled', false);
        $('#modalValidationAlertManager').text('Error: ' + e.message).show();
    }
}

// ============================================
// COPY KRA MODAL FUNCTIONS
// ============================================

/**
 * Opens the Copy KRA modal and populates the appraisal cycle dropdown
 */
function OpenCopyKRAModal() {
    ;
    try {
        // Reset modal state
        $('#ddlAppraisalCycleCopyKRAModal').val('0');
        $('#copyKRAContent').hide();
        $('#copyKRANoData').hide();
        $('#copyKRALoader').hide();
        $('#btnCopyKRASubmit').hide();
        $('#tblCopyKRAListBody').empty();

        // Show modal first
        $('#copyKRAModal').modal('show');

        // Populate appraisal cycle dropdown (exclude current cycle) - use async AJAX
        var currentCycleId = $('#AppCycle :selected').val();
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + "AppraisalCycle/AppraisalCyclewithOutId";

        // Clear dropdown and add default option
        $('#ddlAppraisalCycleCopyKRAModal').empty();
        $('#ddlAppraisalCycleCopyKRAModal').append($("<option>").val('0').text('-- Loading... --'));

        // Use async AJAX to populate dropdown
        $.ajax({
            url: apiPath,
            type: 'GET',
            dataType: 'json',
            headers: CommonGetHeaderInfo(),
            success: function (response) {
                // Clear and reset dropdown
                $('#ddlAppraisalCycleCopyKRAModal').empty();
                $('#ddlAppraisalCycleCopyKRAModal').append($("<option>").val('0').text('-- Select Appraisal Cycle to Copy G&Os --'));

                // Handle response structure - check both Result.data and Result (same as FillAppraisalCycle)
                if (response && response.Success && response.Result) {
                    var resultData = response.Result.data || response.Result;
                    if (Array.isArray(resultData) && resultData.length > 0) {
                        $.each(resultData, function (index, data) {
                            // Exclude current cycle
                            if (data.AppraisalCycleId != currentCycleId) {
                                $('#ddlAppraisalCycleCopyKRAModal').append($("<option>").val(data.AppraisalCycleId).text(data.AppraisalCycleName));
                            }
                        });
                    } else {
                        console.warn('No appraisal cycles found or invalid data structure:', response);
                    }
                } else {
                    console.warn('Invalid API response:', response);
                }
            },
            error: function (xhr, status, error) {
                console.error('Error loading appraisal cycles:', error);
                $('#ddlAppraisalCycleCopyKRAModal').empty();
                $('#ddlAppraisalCycleCopyKRAModal').append($("<option>").val('0').text('-- Error loading cycles --'));
                if (typeof toastr !== 'undefined') {
                    toastr.error('Error loading appraisal cycles. Please try again.');
                }
            }
        });
    } catch (e) {
        console.error('Error opening Copy KRA modal:', e);
        if (typeof toastr !== 'undefined') {
            toastr.error('Error opening Copy KRA modal: ' + e.message);
        } else {
            alert('Error opening Copy KRA modal: ' + e.message);
        }
    }
}

// Reset modal when closed
$(document).on('hidden.bs.modal', '#copyKRAModal', function () {
    $('#ddlAppraisalCycleCopyKRAModal').val('0');
    $('#copyKRAContent').hide();
    $('#copyKRANoData').hide();
    $('#copyKRALoader').hide();
    $('#btnCopyKRASubmit').hide();
    $('#tblCopyKRAListBody').empty();
});

// Reset referenceGoalRepositoryModal when closed
$(document).on('hidden.bs.modal', '#referenceGoalRepositoryModal', function () {
    // Switch back to first tab
    $('#referenceGoalTabs a[href="#refGoalMasterTab"]').tab('show');

    // Reset inline copy section
    $('#ddlAppraisalCycleCopyKRAModalInline').val('0');
    $('#copyKRAContentInline').hide();
    $('#copyKRANoDataInline').hide();
    $('#copyKRALoaderInline').hide();
    $('#tblCopyKRAListBodyInline').empty();

    // Reset reference goal master section completely
    $('#referenceGoalMasterTabs').html('');
    $('#referenceGoalMasterTabContent').html('');
    $('#referenceGoalMasterContent').hide();
    $('#referenceGoalMasterNoData').hide();
    $('#referenceGoalMasterLoader').hide();
    
    // Reset grade dropdown to "Select Grade" (default)
    $('#ddlReferenceGoalGrade').val('');

    // Clear stored data
    if (window.referenceGoalsData) {
        delete window.referenceGoalsData;
    }
    window.referenceGoalsData = null;
});

// Validate Reference Goal Master Access and show modal with appropriate tabs
function ValidateReferenceGoalMasterAccessAndShowModal() {
    var employeeId = sessionStorage.getItem('EmployeeId');
    var svrPath = CONFIG.get('SERVERNAME');
    var validateApiPath = svrPath + 'EmployeeKRA/ValidateReferenceGoalMasterAccess?EmployeeId=' + employeeId;
    
    $.ajax({
        url: validateApiPath,
        type: 'GET',
        dataType: 'json',
        headers: CommonGetHeaderInfo(),
        success: function (response) {
            if (response && response.Success) {
                var resultData = response.Result && (response.Result.Data || response.Result.data);
                
                if (resultData && resultData.length > 0) {
                    var accessData = resultData[0];
                    var isAccessible = accessData.IsReferenceGoalMasterAccessable;
                    
                    // Show/hide tabs based on access flag
                    if (isAccessible === 0 || isAccessible === '0' || isAccessible === false) {
                        // Hide Reference Goal Master tab, show only Previous Year's Goal tab
                        $('#refGoalMasterTabLink').parent().hide();
                        $('#previousYearGoalTabLink').parent().addClass('active');
                        $('#refGoalMasterTab').removeClass('active');
                        $('#previousYearGoalTab').addClass('active');
                        
                        // Open modal
                        $('#referenceGoalRepositoryModal').modal('show');
                        
                        // Load appraisal cycles for Previous Year's Goal tab
                        var $dropdown = $('#ddlAppraisalCycleCopyKRAModalInline');
                        if ($dropdown.find('option').length <= 1) {
                            LoadAppraisalCyclesForInlineCopy();
                        }
                    } else {
                        // Show both tabs (Reference Goal Master is accessible)
                        $('#refGoalMasterTabLink').parent().show();
                        $('#refGoalMasterTabLink').parent().addClass('active');
                        $('#previousYearGoalTabLink').parent().removeClass('active');
                        $('#refGoalMasterTab').addClass('active');
                        $('#previousYearGoalTab').removeClass('active');
                        
                        // Open modal
                        $('#referenceGoalRepositoryModal').modal('show');
                        
                        // Load Grade List first, then load Reference Goal Master data
                        LoadGradeList(function() {
                            LoadReferenceGoalMaster();
                        });
                    }
                } else {
                    // No data returned, show error
                    if (typeof toastr !== 'undefined') {
                        toastr.error('Unable to validate access. Please try again.');
                    } else {
                        alert('Unable to validate access. Please try again.');
                    }
                }
            } else {
                // API call failed, show error
                if (typeof toastr !== 'undefined') {
                    toastr.error('Unable to validate access. Please try again.');
                } else {
                    alert('Unable to validate access. Please try again.');
                }
            }
        },
        error: function (xhr, status, error) {
            console.error('Error validating reference goal master access:', error);
            if (typeof toastr !== 'undefined') {
                toastr.error('Error validating access. Please try again.');
            } else {
                alert('Error validating access. Please try again.');
            }
        }
    });
}

// Load Grade List for Reference Goal filter
function LoadGradeList(callback) {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'EmployeeKRA/GetGradeList';
    
    $.ajax({
        url: apiPath,
        type: 'GET',
        headers: CommonGetHeaderInfo(),
        success: function(result) {
            if (result && result.Success && result.Result.length) {
                var $dropdown = $('#ddlReferenceGoalGrade');
                $dropdown.empty();
                
                // Add "Select Grade" option as default
                $dropdown.append($('<option>').val('').text('Select Grade'));
                
                // Populate dropdown with grades
                $.each(result.Result, function(index, grade) {
                    $dropdown.append($('<option>').val(grade.GRADEID).text(grade.GRADENAME));
                });
                
                // Set dropdown to "Select Grade" by default (don't auto-select employee's grade)
                $dropdown.val('');
                
                if (callback && typeof callback === 'function') {
                    callback();
                }
            } else {
                $('#ddlReferenceGoalGrade').empty().append($('<option>').val('').text('Select Grade'));
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading grade list:', error);
            $('#ddlReferenceGoalGrade').empty().append($('<option>').val('').text('Select Grade'));
            if (callback && typeof callback === 'function') {
                callback();
            }
        }
    });
}

// Load Reference Goal Master data
function LoadReferenceGoalMaster(selectedGradeId) {
    // If no grade specified, get from dropdown
    if (!selectedGradeId || selectedGradeId === undefined) {
        selectedGradeId = $('#ddlReferenceGoalGrade').val();
    }
  
    
    try {
        // Clear any existing data first
        $('#referenceGoalMasterTabs').html('');
        $('#referenceGoalMasterTabContent').html('');
        $('#referenceGoalMasterContent').hide();
        $('#referenceGoalMasterNoData').hide();

        // Clear stored data
        if (window.referenceGoalsData) {
            delete window.referenceGoalsData;
        }
        window.referenceGoalsData = null;

        // Show loader
        $('#referenceGoalMasterLoader').show();

        var employeeId = sessionStorage.getItem('EmployeeId');
        var svrPath = CONFIG.get('SERVERNAME');

        // First, get employee's grade and unit from ValidateReferenceGoalMasterAccess
        var validateApiPath = svrPath + 'EmployeeKRA/ValidateReferenceGoalMasterAccess?EmployeeId=' + employeeId;

        $.ajax({
            url: validateApiPath,
            type: 'GET',
            dataType: 'json',
            headers: CommonGetHeaderInfo(),
            success: function (validateResponse) {

                // Check for both capital 'Data' and lowercase 'data' properties
                var resultData = validateResponse.Result && (validateResponse.Result.Data || validateResponse.Result.data);

                if (validateResponse && validateResponse.Success && resultData && resultData.length > 0) {

                    var empData = resultData[0];
                    
                    // Check if user has access to Reference Goal Master
                    var isAccessible = empData.IsReferenceGoalMasterAccessable;
                    if (isAccessible === 0 || isAccessible === '0' || isAccessible === false) {
                        $('#referenceGoalMasterLoader').hide();
                        $('#referenceGoalMasterNoData').hide();
                        if (typeof toastr !== 'undefined') {
                            toastr.warning('You do not have access to Reference Goal Master.');
                        } else {
                            alert('You do not have access to Reference Goal Master.');
                        }
                        return;
                    }
                    
                    var gradeId = selectedGradeId || empData.EMP_GRADEID; // Use selected grade or employee's grade
                    var empUnitId = empData.Emp_DeliveryStatus; // Get employee unit id

                    // Now call GetReferenceGoalMaster with the selected grade and employee unit id
                    var goalMasterApiPath = svrPath + 'EmployeeKRA/GetReferenceGoalMaster?empunitid=' + (empUnitId || 'null')+'&GradeId=' + gradeId;
                   

                    $.ajax({
                        url: goalMasterApiPath,
                        type: 'GET',
                        dataType: 'json',
                        headers: CommonGetHeaderInfo(),
                        success: function (goalsResponse) {
                            $('#referenceGoalMasterLoader').hide();

                            if (goalsResponse && goalsResponse.Success && goalsResponse.Result &&
                                goalsResponse.Result.Data && goalsResponse.Result.Data.length > 0) {

                                var goals = goalsResponse.Result.Data;

                                // Group goals by TileName (which now comes from backend)
                                var groupedGoals = {};
                                $.each(goals, function (index, goal) {
                                    var tileName = goal.TileName; // Fallback for backward compatibility
                                    var key = tileName; // Use TileName as key
                                    if (!groupedGoals[key]) {
                                        groupedGoals[key] = {
                                            tileName: tileName,
                                            gradeName: goal.GRADE_NAME || 'Unknown Grade',
                                            jfName: goal.JFName || 'Unknown Job Function',
                                            goals: []
                                        };
                                    }
                                    groupedGoals[key].goals.push(goal);
                                });

                                // Build tabs HTML
                                var tabsHtml = '<div style="display: flex; flex-wrap: wrap; gap: 10px;">';
                                var isFirst = true;

                                $.each(groupedGoals, function (key, groupData) {
                                    var tabId = 'tab_' + key.replace(/[^a-zA-Z0-9]/g, '_');
                                    var displayName = groupData.tileName; // Use TileName from backend
                                    var activeClass = isFirst ? 'active' : '';

                                    tabsHtml += '<div class="reference-goal-tab ' + activeClass + '" data-tab-key="' + escapeHtml(key) + '" ';
                                    tabsHtml += 'style="cursor: pointer; padding: 12px 20px; border: 2px solid #1976d2; border-radius: 4px; ';
                                    tabsHtml += 'background: ' + (isFirst ? '#1976d2' : 'white') + '; ';
                                    tabsHtml += 'color: ' + (isFirst ? 'white' : '#1976d2') + '; ';
                                    tabsHtml += 'font-weight: bold; transition: all 0.3s;">';
                                    tabsHtml += escapeHtml(displayName);
                                    tabsHtml += '<div style="font-size: 11px; margin-top: 4px; font-weight: normal; ';
                                    tabsHtml += 'color: ' + (isFirst ? 'rgba(255,255,255,0.8)' : '#666') + ';">';
                                    tabsHtml += 'Click here to copy in your G&O';
                                    tabsHtml += '</div>';
                                    tabsHtml += '</div>';

                                    isFirst = false;
                                });

                                tabsHtml += '</div>';
                                $('#referenceGoalMasterTabs').html(tabsHtml);

                                // Store grouped goals globally for tab click events
                                window.referenceGoalsData = groupedGoals;

                                // Show first tab content by default
                                var firstKey = Object.keys(groupedGoals)[0];
                                ShowReferenceGoalTabContent(firstKey);

                                $('#referenceGoalMasterContent').show();
                            } else {
                                $('#referenceGoalMasterNoData').show();
                            }
                        },
                        error: function (xhr, status, error) {
                            $('#referenceGoalMasterLoader').hide();
                            console.error('Error loading reference goals:', error);
                            if (typeof toastr !== 'undefined') {
                                toastr.error('Error loading reference goals. Please try again.');
                            } else {
                                alert('Error loading reference goals. Please try again.');
                            }
                        }
                    });
                } else {
                    $('#referenceGoalMasterLoader').hide();
                    $('#referenceGoalMasterNoData').show();
                    if (typeof toastr !== 'undefined') {
                        toastr.warning('Unable to retrieve your grade and unit information.');
                    }
                }
            },
            error: function (xhr, status, error) {
                $('#referenceGoalMasterLoader').hide();
                console.error('Error validating access:', error);
                if (typeof toastr !== 'undefined') {
                    toastr.error('Error validating access. Please try again.');
                } else {
                    alert('Error validating access. Please try again.');
                }
            }
        });
    } catch (e) {
        $('#referenceGoalMasterLoader').hide();
        console.error('Error in LoadReferenceGoalMaster:', e);
        if (typeof toastr !== 'undefined') {
            toastr.error('Error loading reference goals: ' + e.message);
        } else {
            alert('Error loading reference goals: ' + e.message);
        }
    }
}

// Handle tab click to show specific Grade-JobFamily goals
$(document).on('click', '.reference-goal-tab', function () {
    var tabKey = $(this).data('tab-key');

    // Update active state
    $('.reference-goal-tab').css({
        'background': 'white',
        'color': '#1976d2'
    }).find('div').css('color', '#666');

    $(this).css({
        'background': '#1976d2',
        'color': 'white'
    }).find('div').css('color', 'rgba(255,255,255,0.8)');

    // Show content for this tab
    ShowReferenceGoalTabContent(tabKey);
});

// Show goals table for selected tab
function ShowReferenceGoalTabContent(tabKey) {
    if (!window.referenceGoalsData || !window.referenceGoalsData[tabKey]) {
        $('#referenceGoalMasterTabContent').html('<p style="text-align: center; color: #999; padding: 20px;">No data available.</p>');
        return;
    }

    var groupData = window.referenceGoalsData[tabKey];
    var groupGoals = groupData.goals;

    // Build table HTML with note OUTSIDE the bordered container
    var html = '';
    
    // Add note OUTSIDE and ABOVE the table container
    html += '<div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin-bottom: 20px; border-left: 4px solid #ccc;">';
    html += '<p style="margin: 0 0 8px 0; color: #555; font-size: 14px; line-height: 1.6;"><strong>Note:</strong></p>';
    html += '<ul style="margin: 0; padding-left: 22px; color: #555; font-size: 14px; line-height: 1.6;">';
    html += '<li style="margin-bottom: 8px;">Reference goals are available for most Delivery and Studio roles; those for remaining roles, including Enabling and Sales functions, will be added soon.</li>';
    html += '<li>If you cannot find a relevant G&amp;O, refer to last year\'s G&amp;Os. Please also submit this <a href="#" id="linkSubmitCustomGoalForm" style="color: #0056b3; text-decoration: underline; font-weight: bold; cursor: pointer;">form</a> to help us review your inputs for us to work on role-aligned reference goals for next year.</li>';
    html += '</ul>';
    html += '</div>';
    
    // Table container with border
    html += '<div style="margin-top: 15px; padding: 20px; border: 2px solid #1976d2; border-radius: 8px; background: white;">';

    // Add goals table
    html += '<div style="overflow-x: auto;">';
    html += '<table class="table table-bordered" style="margin-bottom: 0; background: white;">';
    html += '<thead style="background: #5b8fc7; color: white;">';
    html += '<tr>';
    html += '<th style="width: 10%; text-align: center; vertical-align: middle;">Goal Type</th>';
    html += '<th style="width: 25%; text-align: center; vertical-align: middle;">Key Responsibility Area (KRA)</th>';
    html += '<th style="width: 30%; text-align: center; vertical-align: middle;">Key Performance Indicators (KPIs)</th>';
    html += '<th style="width: 30%; text-align: center; vertical-align: middle;">Action Plan</th>';
    html += '<th style="width: 10%; text-align: center; vertical-align: middle;">Weightage (%)</th>';
    html += '</tr>';
    html += '</thead>';
    html += '<tbody>';

    $.each(groupGoals, function (index, goal) {
        var goalTypeName = goal.GoalTypeName || goal.GoalType || 'N/A';
        var kra = goal.KRA || 'N/A';
        var kpis = goal.KPIsText || 'N/A';
        var actionPlan = goal.ActionPlan || '';
        var weightage = goal.Weightage || '0';

        // Determine row background color (alternating)
        var rowBg = (index % 2 === 0) ? '#e8f0f9' : '#ffffff';

        html += '<tr style="background: ' + rowBg + ';">';
        html += '<td style="vertical-align: top; text-align: center; padding: 12px;">';
        html += '<strong>' + escapeHtml(goalTypeName) + '</strong>';
        html += '</td>';
        html += '<td style="vertical-align: top; padding: 12px;">' + kra + '</td>';
        html += '<td style="vertical-align: top; padding: 12px;">' + kpis + '</td>';
        html += '<td style="vertical-align: top; padding: 12px;">' + (actionPlan || '<span style="color: #999;">Not specified</span>') + '</td>';
        html += '<td style="vertical-align: top; text-align: center; padding: 12px;">' + escapeHtml(weightage) + '</td>';
        html += '</tr>';
    });

    html += '</tbody>';
    html += '</table>';
    html += '</div>'; // End table container

    // Add copy button at bottom
    html += '<div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 2px solid #e0e0e0;">';
    html += '<button type="button" class="btn btn-primary" id="btnCopyReferenceGoals" data-tab-key="' + escapeHtml(tabKey) + '" ';
    html += 'style="padding: 10px 30px; font-size: 14px; font-weight: bold;">';
    html += '<i class="glyphicon glyphicon-copy" style="margin-right: 8px;"></i>Click here to copy in your G&O';
    html += '</button>';
    html += '</div>';

    html += '</div>'; // End main container

    $('#referenceGoalMasterTabContent').html(html);
}

// Handle copy button click - Copy goals directly with 0 weightage
$(document).on('click', '#btnCopyReferenceGoals', function () {
    var tabKey = $(this).data('tab-key');

    if (!window.referenceGoalsData || !window.referenceGoalsData[tabKey]) {
        toastr.error('No data to copy.');
        return;
    }

    var groupData = window.referenceGoalsData[tabKey];
    var groupGoals = groupData.goals;
    var employeeId = sessionStorage.getItem('EmployeeId');
    var appraisalCycleId = $('#AppCycle :selected').val();
    var selfAssCycleId = $('#ddlSelfAssCycle :selected').val();

    if (!appraisalCycleId || appraisalCycleId === '0') {
        toastr.error('Please select an appraisal cycle first.');
        return;
    }

    // Get cycle start and end dates
    var selectedCycle = $('#AppCycle :selected');
    var cycleStartDate = selectedCycle.data('startdate');
    var cycleEndDate = selectedCycle.data('enddate');

    // If data attributes not available, get from AppraisalCycle global variable
    if ((!cycleStartDate || !cycleEndDate) && AppraisalCycle && AppraisalCycle.responseJSON && AppraisalCycle.responseJSON.Result && AppraisalCycle.responseJSON.Result.data) {
        var cycleData = AppraisalCycle.responseJSON.Result.data.find(function (c) {
            return c.AppraisalCycleId == appraisalCycleId;
        });
        if (cycleData) {
            cycleStartDate = cycleData.StartDate || cycleData.CycleStartDate;
            cycleEndDate = cycleData.EndDate || cycleData.CycleEndDate;
        }
    }

    // Format dates to YYYY-MM-DD for SQL Server compatibility
    var kraFromDate = cycleStartDate ? formatDate(cycleStartDate) : formatDate(new Date());
    var kraToDate = cycleEndDate ? formatDate(cycleEndDate) : formatDate(new Date());

    // Build KRA array for database insertion with actual weightage from reference goal
    var kraArray = [];
    $.each(groupGoals, function (index, goal) {
        var goalType = goal.GoalType || goal.GoalTypeName || 'O';

        // Normalize goal type to single letter
        if (goalType === 'Strategic') goalType = 'S';
        else if (goalType === 'Operational') goalType = 'O';
        else if (goalType === 'Developmental') goalType = 'D';
        else if (goalType.length > 1) goalType = goalType.charAt(0).toUpperCase();

        // Get weightage from reference goal (use actual value, not 0)
        var weightage = parseFloat(goal.Weightage) || 0;

        var kraObj = {
            GoalType: goalType,
            GoalDescription: goal.KRA || '',
            Weightage: weightage,  // Use actual weightage from reference goal
            Measure: goal.KPIsText || '',
            ActionPlan: goal.ActionPlan || '',
            KRAFromDate: kraFromDate,
            KRAToDate: kraToDate,
            AppraisalCycleId: parseInt(appraisalCycleId),
            EmployeeId: parseInt(employeeId),
            ToEmployeeId: parseInt(employeeId),
            KRAStatusId: 1,
            CreatedBy: parseInt(employeeId),
            TrainingRequirementName: goalType === 'D' ? (goal.TrainingRequirement || '') : '',
            TrainingItemId: 0,
            flag: 0
        };

        kraArray.push(kraObj);
    });

    // Store kraArray for later use in confirmation
    window.pendingReferenceGoalsCopy = {
        kraArray: kraArray,
        employeeId: employeeId,
        appraisalCycleId: appraisalCycleId,
        selfAssCycleId: selfAssCycleId,
        totalGoals: groupGoals.length
    };

    // Call the submission function without override first (to check validation)
    SubmitReferenceGoalsCopy(false);
});

// Function to submit reference goals copy (with or without override)
function SubmitReferenceGoalsCopy(overrideExisting) {
    ;
    if (!window.pendingReferenceGoalsCopy) {
        toastr.error('No pending goals to copy.');
        return;
    }

    var kraArray = window.pendingReferenceGoalsCopy.kraArray;
    var employeeId = window.pendingReferenceGoalsCopy.employeeId;
    var appraisalCycleId = window.pendingReferenceGoalsCopy.appraisalCycleId;
    var selfAssCycleId = window.pendingReferenceGoalsCopy.selfAssCycleId;

    // Show loader
    var loader = CreateLoaderWithFailSafe('Copying goals...', 30000);

    // Submit all KRAs in one batch request
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'EmployeeKRA/SubmitKRAOpBatch?overrideExisting=' + overrideExisting;

    $.ajax({
        url: apiPath,
        type: 'POST',
        data: JSON.stringify(kraArray),
        contentType: 'application/json',
        dataType: 'json',
        headers: CommonGetHeaderInfo(),
        success: function (result) {
            loader.remove();
            ;
            if (result && result.Success) {
                var insertedCount = result.Result.InsertedCount || window.pendingReferenceGoalsCopy.totalGoals;
                var message = result.Result.Message || (insertedCount + ' goal(s) copied successfully with weightage!');
                toastr.success(message);

                // Clear pending copy data
                window.pendingReferenceGoalsCopy = null;

                // Close modals
                $('#overrideGoalsConfirmationModal').modal('hide');
                $('#referenceGoalRepositoryModal').modal('hide');

                // Refresh KRA list to show saved goals
                BindKRAGrid(employeeId, appraisalCycleId, selfAssCycleId, null);
            } else {
                // Handle validation errors
                if (result.Result && Array.isArray(result.Result)) {
                    // Check if any validation has CanOverride flag
                    var canOverrideValidation = result.Result.find(function (v) {
                        return v.CanOverride === true;
                    });

                    if (canOverrideValidation && !overrideExisting) {
                        // Show confirmation modal for override
                        $('#overrideGoalsConfirmationModal').modal('show');
                    } else {
                        // Display validation errors (cannot override or other errors)
                        var errorMessages = result.Result.map(function (validation) {
                            return validation.ErrorMessage || validation.Message;
                        }).join('<br/>');
                        toastr.error(errorMessages || 'Validation failed. Please check your input.');
                        
                        // Clear pending copy data if cannot override
                        window.pendingReferenceGoalsCopy = null;
                    }
                } else {
                    toastr.error(result.Message || 'Failed to copy goals. Please try again.');
                    window.pendingReferenceGoalsCopy = null;
                }
            }
        },
        error: function (xhr, status, error) {
            loader.remove();
            console.error('Error copying goals:', error);

            // Try to parse error response for validation messages
            if (xhr.responseJSON && xhr.responseJSON.Result && Array.isArray(xhr.responseJSON.Result)) {
                // Check if any validation has CanOverride flag
                var canOverrideValidation = xhr.responseJSON.Result.find(function (v) {
                    return v.CanOverride === true;
                });

                if (canOverrideValidation && !overrideExisting) {
                    // Show confirmation modal for override
                    $('#overrideGoalsConfirmationModal').modal('show');
                } else {
                    var errorMessages = xhr.responseJSON.Result.map(function (validation) {
                        return validation.ErrorMessage || validation.Message;
                    }).join('<br/>');
                    toastr.error(errorMessages || 'Error copying goals. Please try again.');
                    window.pendingReferenceGoalsCopy = null;
                }
            } else {
                toastr.error('Error copying goals. Please try again.');
                window.pendingReferenceGoalsCopy = null;
            }
        }
    });
}

// Handle confirmation modal Yes button click
$(document).on('click', '#btnConfirmOverrideGoals', function () {
    ;
    // Call submission with override = true
    SubmitReferenceGoalsCopy(true);
});

// Clear pending data when confirmation modal is closed without confirming
$(document).on('hidden.bs.modal', '#overrideGoalsConfirmationModal', function () {
    // Only clear if not proceeding (user clicked No or X)
    if (window.pendingReferenceGoalsCopy) {
        console.log('Override cancelled by user');
    }
});


// Load appraisal cycles for inline copy dropdown
function LoadAppraisalCyclesForInlineCopy() {
    try {
        var currentCycleId = $('#AppCycle :selected').val();
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + "AppraisalCycle/AppraisalCyclewithOutId";

        // Clear dropdown and add loading option
        $('#ddlAppraisalCycleCopyKRAModalInline').empty();
        $('#ddlAppraisalCycleCopyKRAModalInline').append($('<option>').val('0').text('-- Loading... --'));

        $.ajax({
            url: apiPath,
            type: 'GET',
            dataType: 'json',
            headers: CommonGetHeaderInfo(),
            success: function (response) {
                $('#ddlAppraisalCycleCopyKRAModalInline').empty();
                $('#ddlAppraisalCycleCopyKRAModalInline').append($('<option>').val('0').text('-- Select Appraisal Cycle --'));

                if (response && response.Success && response.Result) {
                    var resultData = response.Result.data || response.Result;
                    if (Array.isArray(resultData) && resultData.length > 0) {
                        $.each(resultData, function (index, data) {
                            if (data.AppraisalCycleId != currentCycleId) {
                                $('#ddlAppraisalCycleCopyKRAModalInline').append($('<option>').val(data.AppraisalCycleId).text(data.AppraisalCycleName));
                            }
                        });
                    } else {
                        console.warn('No appraisal cycles found or invalid data structure:', response);
                    }
                } else {
                    console.warn('Invalid API response:', response);
                }
            },
            error: function (xhr, status, error) {
                console.error('Error loading appraisal cycles:', error);
                $('#ddlAppraisalCycleCopyKRAModalInline').empty();
                $('#ddlAppraisalCycleCopyKRAModalInline').append($('<option>').val('0').text('-- Error loading cycles --'));
                if (typeof toastr !== 'undefined') {
                    toastr.error('Error loading appraisal cycles. Please try again.');
                }
            }
        });
    } catch (e) {
        console.error('Error loading appraisal cycles:', e);
    }
}

// Handle inline dropdown change
$(document).on('change', '#ddlAppraisalCycleCopyKRAModalInline', function () {
    var previousCycleId = $(this).val();
    if (previousCycleId && previousCycleId != '0') {
        LoadKRAsForCopyInline(previousCycleId);
    } else {
        $('#copyKRAContentInline').hide();
        $('#copyKRANoDataInline').hide();
        $('#btnCopyKRASubmitInline').hide();
    }
});

// Load KRAs for inline copy section
function LoadKRAsForCopyInline(previousCycleId) {
    try {
        // Show loader, hide content
        $('#copyKRALoaderInline').show();
        $('#copyKRAContentInline').hide();
        $('#copyKRANoDataInline').hide();
        $('#btnCopyKRASubmitInline').hide();
        $('#tblCopyKRAListBodyInline').empty();

        var EmployeeId = sessionStorage.getItem('EmployeeId');
        var svrPath = CONFIG.get('SERVERNAME');

        // Use SAME API as popup version - exact same parameters
        var apiPath = svrPath + "EmployeeKRA/GetKRAsForCopy?AppraisalCycleId=" + previousCycleId +
            "&ToEmployeeId=" + EmployeeId;

        $.ajax({
            url: apiPath,
            type: 'GET',
            dataType: 'json',
            headers: CommonGetHeaderInfo(),
            success: function (result) {
                $('#copyKRALoaderInline').hide();

                // Use SAME response structure check as popup version
                if (result && result.Success && result.Result && result.Result.KRAData && result.Result.KRAData.length > 0) {
                    // Display KRAs in modal - SAME AS POPUP
                    var kraList = result.Result.KRAData;
                    var tbody = $('#tblCopyKRAListBodyInline');
                    tbody.empty();

                    $.each(kraList, function (index, kra) {
                        var goalTypeText = (kra.GoalType === 'O' || kra.GoalType === 'Operational') ? 'Operational' : 'Developmental';
                        var goalDesc = kra.GoalDescription || 'N/A';
                        var weightage = kra.Weightage || 0;
                        var measure = kra.Measure || 'N/A';

                        // Truncate long descriptions - SAME AS POPUP
                        if (goalDesc.length > 100) {
                            goalDesc = goalDesc.substring(0, 97) + '...';
                        }
                        if (measure.length > 100) {
                            measure = measure.substring(0, 97) + '...';
                        }

                        var row = '<tr>' +
                            '<td>' + escapeHtml(goalTypeText) + '</td>' +
                            '<td title="' + $('<div>').html(kra.GoalDescription || '').text() + '">' + goalDesc + '</td>' +
                            '<td>' + weightage + '%</td>' +
                            '<td title="' + $('<div>').html(kra.Measure || '').text() + '">' + measure + '</td>' +
                            '</tr>';
                        tbody.append(row);
                    });

                    // Show content and submit button
                    $('#copyKRAContentInline').show();
                    $('#btnCopyKRASubmitInline').show();
                } else {
                    // No KRAs found - SAME AS POPUP
                    $('#copyKRANoDataInline').show();
                    if (typeof toastr !== 'undefined') {
                        toastr.info('No Goals & Objectives found for the selected cycle.');
                    }
                }
            },
            error: function (xhr, status, error) {
                $('#copyKRALoaderInline').hide();
                console.error('Error loading KRAs for copy:', error);
                if (typeof toastr !== 'undefined') {
                    toastr.error('Error loading Goals & Objectives. Please try again.');
                } else {
                    alert('Error loading Goals & Objectives. Please try again.');
                }
            }
        });
    } catch (e) {
        $('#copyKRALoaderInline').hide();
        console.error('Error in LoadKRAsForCopyInline:', e);
        if (typeof toastr !== 'undefined') {
            toastr.error('Error loading Goals & Objectives: ' + e.message);
        } else {
            alert('Error loading Goals & Objectives: ' + e.message);
        }
    }
}

// Handle inline copy submit
$(document).on('click', '#btnCopyKRASubmitInline', function () {
    ;
    try {
        // Use SAME logic as popup version
        var PreviousAppraisalCycleId = $('#ddlAppraisalCycleCopyKRAModalInline').val();
        var CurrentAppraisalCycleId = $('#AppCycle :selected').val();
        var EmployeeId = sessionStorage.getItem('EmployeeId');
        var statusId = 3;

        if (!PreviousAppraisalCycleId || PreviousAppraisalCycleId == '0') {
            if (typeof toastr !== 'undefined') {
                toastr.warning('Please select an appraisal cycle.');
            } else {
                alert('Please select an appraisal cycle.');
            }
            return;
        }

        // Disable submit button during copy
        $('#btnCopyKRASubmitInline').prop('disabled', true).text('Copying...');

        var svrPath = CONFIG.get('SERVERNAME');
        // Use SAME API as popup version - exact same endpoint and parameters
        var apiPath = svrPath + "EmployeeKRACopy/GetCopyKRA?PreviousAppraisalCycleId=" + PreviousAppraisalCycleId +
            "&CurrentAppraisalCycleId=" + CurrentAppraisalCycleId +
            "&EmployeeId=" + EmployeeId +
            "&statusId=" + statusId;

        $.ajax({
            url: apiPath,
            type: 'POST',
            dataType: 'json',
            headers: CommonGetHeaderInfo(),
            success: function (result) {
                ;
                $('#btnCopyKRASubmitInline').prop('disabled', false).text('Copy Selected G&Os');

                if (result && result.Success) {
                    // Close modal
                    $('#referenceGoalRepositoryModal').modal('hide');

                    // Refresh KRA grid - SAME AS POPUP
                    var AppraisalCycleId = $('#AppCycle :selected').val();
                    BindKRAGrid(sessionStorage.getItem("EmployeeId"), AppraisalCycleId, $('#ddlSelfAssCycle :selected').val());

                    // Show success message
                    if (typeof toastr !== 'undefined') {
                        toastr.success(result.Result || 'Goals & Objectives copied successfully.');
                    } else {
                        AlertMessage('#divValidationAlert', result.Result || 'Goals & Objectives copied successfully.', 'I');
                    }
                } else {
                    // Handle error - SAME AS POPUP
                    var errorMsg = 'Error copying Goals & Objectives.';
                    if (result && result.Result) {
                        if (Array.isArray(result.Result) && result.Result.length > 0) {
                            errorMsg = result.Result[0].ErrorMessage || errorMsg;
                        } else if (typeof result.Result === 'string') {
                            errorMsg = result.Result;
                        }
                    }

                    if (typeof toastr !== 'undefined') {
                        toastr.error(errorMsg);
                    } else {
                        alert(errorMsg);
                    }
                }
            },
            error: function (xhr, status, error) {
                $('#btnCopyKRASubmitInline').prop('disabled', false).text('Copy Selected G&Os');
                console.error('Error copying KRAs:', error);
                if (typeof toastr !== 'undefined') {
                    toastr.error('Error copying Goals & Objectives. Please try again.');
                } else {
                    alert('Error copying Goals & Objectives. Please try again.');
                }
            }
        });
    } catch (e) {
        $('#btnCopyKRASubmitInline').prop('disabled', false).text('Copy Selected G&Os');
        console.error('Error in SubmitCopyKRAs:', e);
        if (typeof toastr !== 'undefined') {
            toastr.error('Error copying Goals & Objectives: ' + e.message);
        } else {
            alert('Error copying Goals & Objectives: ' + e.message);
        }
    }
});

/**
 * Loads KRAs for the selected cycle in the Copy KRA modal
 */
function LoadKRAsForCopy(previousCycleId) {
    ;

    try {
        // Show loader, hide content
        $('#copyKRALoader').show();
        $('#copyKRAContent').hide();
        $('#copyKRANoData').hide();
        $('#btnCopyKRASubmit').hide();
        $('#tblCopyKRAListBody').empty();

        var EmployeeId = sessionStorage.getItem('EmployeeId');
        var svrPath = CONFIG.get('SERVERNAME');

        // Simplified API call - only pass AppraisalCycleId and ToEmployeeId
        // Use new GetKRAsForCopy endpoint specifically created for Copy KRA functionality
        var apiPath = svrPath + "EmployeeKRA/GetKRAsForCopy?AppraisalCycleId=" + previousCycleId +
            "&ToEmployeeId=" + EmployeeId;

        $.ajax({
            url: apiPath,
            type: 'GET',
            dataType: 'json',
            headers: CommonGetHeaderInfo(),
            success: function (result) {
                ;
                $('#copyKRALoader').hide();

                if (result && result.Success && result.Result && result.Result.KRAData && result.Result.KRAData.length > 0) {
                    // Display KRAs in modal with checkboxes
                    var kraList = result.Result.KRAData;
                    var tbody = $('#tblCopyKRAListBody');
                    tbody.empty();

                    $.each(kraList, function (index, kra) {
                        var goalTypeText = (kra.GoalType === 'O' || kra.GoalType === 'Operational') ? 'Operational' : 'Developmental';
                        var goalDesc = kra.GoalDescription || 'N/A';
                        var weightage = kra.Weightage || 0;
                        var measure = kra.Measure || 'N/A';

                        // Truncate long descriptions
                        if (goalDesc.length > 100) {
                            goalDesc = goalDesc.substring(0, 97) + '...';
                        }
                        if (measure.length > 100) {
                            measure = measure.substring(0, 97) + '...';
                        }

                        var row = '<tr>' +
                            '<td>' + escapeHtml(goalTypeText) + '</td>' +
                            '<td title="' + escapeHtml(kra.GoalDescription || '') + '">' + escapeHtml(goalDesc) + '</td>' +
                            '<td style="text-align: center;">' + weightage + '%</td>' +
                            '<td title="' + escapeHtml(kra.Measure || '') + '">' + escapeHtml(measure) + '</td>' +
                            '</tr>';
                        tbody.append(row);
                    });

                    // Show content and submit button
                    $('#copyKRAContent').show();
                    $('#btnCopyKRASubmit').show();
                } else {
                    // No KRAs found - show message and use toastr
                    $('#copyKRANoData').show();
                    if (typeof toastr !== 'undefined') {
                        toastr.info('No Goals & Objectives found for the selected cycle.');
                    }
                }
            },
            error: function (xhr, status, error) {
                $('#copyKRALoader').hide();
                console.error('Error loading KRAs for copy:', error);
                if (typeof toastr !== 'undefined') {
                    toastr.error('Error loading Goals & Objectives. Please try again.');
                } else {
                    alert('Error loading Goals & Objectives. Please try again.');
                }
            }
        });
    } catch (e) {
        $('#copyKRALoader').hide();
        console.error('Error in LoadKRAsForCopy:', e);
        if (typeof toastr !== 'undefined') {
            toastr.error('Error loading Goals & Objectives: ' + e.message);
        } else {
            alert('Error loading Goals & Objectives: ' + e.message);
        }
    }
}

/**
 * Submits all KRAs for copying to current cycle (all KRAs are copied)
 */
function SubmitCopyKRAs() {
    ;
    try {
        // All KRAs in the table will be copied - no need to check for selected items

        var PreviousAppraisalCycleId = $('#ddlAppraisalCycleCopyKRAModal').val();
        var CurrentAppraisalCycleId = $('#AppCycle :selected').val();
        var EmployeeId = sessionStorage.getItem('EmployeeId');
        var statusId = 3;

        // Disable submit button during copy
        $('#btnCopyKRASubmit').prop('disabled', true).text('Copying...');

        var svrPath = CONFIG.get('SERVERNAME');
        // Note: The current API copies all approved KRAs. We may need to update it to accept specific KRA IDs
        // For now, we'll use the existing API which copies all approved KRAs from the previous cycle
        var apiPath = svrPath + "EmployeeKRACopy/GetCopyKRA?PreviousAppraisalCycleId=" + PreviousAppraisalCycleId +
            "&CurrentAppraisalCycleId=" + CurrentAppraisalCycleId +
            "&EmployeeId=" + EmployeeId +
            "&statusId=" + statusId;

        $.ajax({
            url: apiPath,
            type: 'POST',
            dataType: 'json',
            headers: CommonGetHeaderInfo(),
            success: function (result) {
                
                $('#btnCopyKRASubmit').prop('disabled', false).text('Copy Selected G&Os');

                if (result && result.Success) {
                    // Close modal
                    $('#copyKRAModal').modal('hide');

                    // Refresh KRA grid
                    var AppraisalCycleId = $('#AppCycle :selected').val();
                    BindKRAGrid(sessionStorage.getItem("EmployeeId"), AppraisalCycleId, $('#ddlSelfAssCycle :selected').val());

                    // Show success message
                    if (typeof toastr !== 'undefined') {
                        toastr.success(result.Result || 'Goals & Objectives copied successfully.');
                    } else {
                        AlertMessage('#divValidationAlert', result.Result || 'Goals & Objectives copied successfully.', 'I');
                    }
                } else {
                    var errorMsg = 'Error copying Goals & Objectives.';
                    if (result && result.Result) {
                        if (Array.isArray(result.Result) && result.Result.length > 0) {
                            errorMsg = result.Result[0].ErrorMessage || errorMsg;
                        } else if (typeof result.Result === 'string') {
                            errorMsg = result.Result;
                        }
                    }

                    if (typeof toastr !== 'undefined') {
                        toastr.error(errorMsg);
                    } else {
                        alert(errorMsg);
                    }
                }
            },
            error: function (xhr, status, error) {
                $('#btnCopyKRASubmit').prop('disabled', false).text('Copy Selected G&Os');
                console.error('Error copying KRAs:', error);
                if (typeof toastr !== 'undefined') {
                    toastr.error('Error copying Goals & Objectives. Please try again.');
                } else {
                    alert('Error copying Goals & Objectives. Please try again.');
                }
            }
        });
    } catch (e) {
        $('#btnCopyKRASubmit').prop('disabled', false).text('Copy Selected G&Os');
        console.error('Error in SubmitCopyKRAs:', e);
        if (typeof toastr !== 'undefined') {
            toastr.error('Error copying Goals & Objectives: ' + e.message);
        } else {
            alert('Error copying Goals & Objectives: ' + e.message);
        }
    }
}

// =============================================
// Custom Reference Goal Functions
// =============================================

// Handle click on custom goal tab
$(document).on('click', '.custom-goal-tab', function () {
    // Don't change tab styling for custom tab

    // Open custom reference goal modal
    OpenCustomReferenceGoalModal();
});

// Handle click on "form" link in the note to open custom reference goal modal
$(document).on('click', '#linkSubmitCustomGoalForm', function (e) {
    e.preventDefault();
    
    // Open custom reference goal modal
    OpenCustomReferenceGoalModal();
});

/** Bootstrap 3 removes body.modal-open for every hide(), including stacked modals — restore when parent stays open. */
function kraRestoreBootstrapModalBodyAfterStackedClose() {
    var $open = $('.modal.in');
    if (!$open.length) return;
    $('body').addClass('modal-open');
    var fullWindowWidth = window.innerWidth;
    if (!fullWindowWidth) {
        var documentElementRect = document.documentElement.getBoundingClientRect();
        fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left);
    }
    var bodyIsOverflowing = document.body.clientWidth < fullWindowWidth;
    if (bodyIsOverflowing) {
        var scrollDiv = document.createElement('div');
        scrollDiv.className = 'modal-scrollbar-measure';
        document.body.appendChild(scrollDiv);
        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        document.body.removeChild(scrollDiv);
        $('body').css('padding-right', scrollbarWidth + 'px');
    } else {
        $('body').css('padding-right', '');
    }
    var $parentModal = $('#referenceGoalRepositoryModal');
    if ($parentModal.length && $parentModal.hasClass('in')) {
        try {
            var dm = $parentModal.data('bs.modal');
            if (dm && typeof dm.handleUpdate === 'function') {
                dm.handleUpdate();
            }
        } catch (ignore) { }
    }
}

// Open Custom Reference Goal Modal
function OpenCustomReferenceGoalModal() {
    try {
        // Clear form
        $('#customReferenceGoalForm')[0].reset();
        $('#txtCustomRoleDescription').val('');
        $('#txtCustomProjectDetails').val('');
        // Make the field editable initially
        $('#txtCustomProjectDetails').prop('readonly', false);

        // Tear down Select2 so a stale instance cannot fight with a new load (avoids hangs / lost selections)
        var $ddl = $('#ddlCustomSkillsUsed');
        if ($ddl.data('select2')) {
            try { $ddl.select2('destroy'); } catch (ignore) { }
        }
        $ddl.empty();
        $ddl.off('.kraSkillsGuard');

        // Init skills after modal is visible so Select2 dropdownParent is laid out; avoids focus/backdrop glitches
        $('#customReferenceGoalModal').off('shown.bs.modal.kraCustomRef').one('shown.bs.modal.kraCustomRef', function () {
            LoadSubSkills();
        });

        // Static backdrop: only explicit Close / X / successful Submit dismisses (see Index.cshtml data-backdrop)
        $('#customReferenceGoalModal').modal({
            backdrop: 'static',
            keyboard: false
        });
        $('#customReferenceGoalModal').modal('show');

        // Get and set employee project name - leave empty if not available
        GetEmployeeProjectName(sessionStorage.EmployeeId, function (projectName) {
            if (projectName) {
                $('#txtCustomProjectDetails').val(projectName);
                $('#txtCustomProjectDetails').prop('readonly', true);
            }
        });

        // Show modal with static backdrop - prevents closing on outside click
        $('#customReferenceGoalModal').modal({
            backdrop: 'static',
            keyboard: false
        });
    } catch (e) {
        console.error('Error opening custom reference goal modal:', e);
        if (typeof toastr !== 'undefined') {
            toastr.error('Error opening modal: ' + e.message);
        }
    }
}

// Get Employee Project Name from API
function GetEmployeeProjectName(employeeId, callback) {
    try {
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + 'EmployeeKRA/GetEmployeeProjectName';

        $.ajax({
            url: apiPath,
            type: 'GET',
            data: { EmployeeId: employeeId },
            dataType: 'json',
            headers: CommonGetHeaderInfo(),
            success: function (response) {
                console.log('GetEmployeeProjectName Response:', response);
                if (response && response.Success && response.ProjectName) {
                    if (callback && typeof callback === 'function') {
                        callback(response.ProjectName);
                    }
                } else {
                    console.log('Project name not found in response');
                    if (callback && typeof callback === 'function') {
                        callback('');
                    }
                }
            },
            error: function (xhr, status, error) {
                console.error('Error fetching project name:', error);
                if (callback && typeof callback === 'function') {
                    callback('');
                }
            }
        });
    } catch (e) {
        console.error('Exception in GetEmployeeProjectName:', e);
        if (callback && typeof callback === 'function') {
            callback('');
        }
    }
}

// Load sub-skills for dropdown
function LoadSubSkills() {
    try {
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + 'EmployeeKRA/GetAllSubSkills';

        window._kraLoadSubSkillsSeq = (window._kraLoadSubSkillsSeq || 0) + 1;
        var requestSeq = window._kraLoadSubSkillsSeq;

        if (window._kraLoadSubSkillsXhr && typeof window._kraLoadSubSkillsXhr.abort === 'function') {
            try { window._kraLoadSubSkillsXhr.abort(); } catch (ignore) { }
        }

        window._kraLoadSubSkillsXhr = $.ajax({
            url: apiPath,
            type: 'GET',
            dataType: 'json',
            headers: CommonGetHeaderInfo(),
            success: function (result) {
                if (requestSeq !== window._kraLoadSubSkillsSeq) {
                    return;
                }

                console.log('GetAllSubSkills Response:', result);

                // Handle DataTable response structure
                var skills = [];
                if (result && result.Success && result.Result) {
                    // Check if Result has Data property (DataSet structure)
                    if (result.Result.Data && Array.isArray(result.Result.Data)) {
                        skills = result.Result.Data;
                    }
                    // Or if Result is directly an array
                    else if (Array.isArray(result.Result)) {
                        skills = result.Result;
                    }
                }

                if (skills.length > 0) {
                    var $ddl = $('#ddlCustomSkillsUsed');
                    if ($ddl.data('select2')) {
                        try { $ddl.select2('destroy'); } catch (ignore) { }
                    }
                    $ddl.empty();
                    // Empty first option only — required for Select2 multi placeholder; must not have text or it becomes a selectable “tag”
                    $ddl.append('<option></option>');

                    $.each(skills, function (index, skill) {
                        var option = $('<option></option>')
                            .val(skill.SkillId)
                            .text(skill.Skill);
                        $ddl.append(option);
                    });

                    var _kraSkillStripInternal = false;
                    function kraStripPlaceholderSkillSelection() {
                        if (_kraSkillStripInternal) return;
                        var raw = $ddl.val();
                        if (raw === null || typeof raw === 'undefined') return;
                        var arr = $.isArray(raw) ? raw.slice() : (raw === '' ? [] : [raw]);
                        var cleaned = $.grep(arr, function (id) {
                            return id !== '' && id != null && String(id).trim() !== '';
                        });

                       $ddl.val(cleaned.length ? cleaned : null).trigger('change.select2');
                        if (cleaned.length === arr.length) return;
                        _kraSkillStripInternal = true;
                        try {
                            $ddl.val(cleaned.length ? cleaned : null).trigger('change');
                        } finally {
                            _kraSkillStripInternal = false;
                        }
                        
                    }

                    $ddl.select2({
                        placeholder: 'Select skills used',
                        allowClear: false,
                        width: '100%',
                        dropdownParent: $('#customReferenceGoalModal'),
                        closeOnSelect: false
                    });

                    $ddl.off('.kraSkillsGuard');
                    $ddl.on('select2:selecting.kraSkillsGuard', function (e) {
                        var d = e.params && e.params.data;
                        if (d && (d.id === '' || d.id == null)) {
                            e.preventDefault();
                        }
                    });
                    $ddl.on('change.kraSkillsGuard', kraStripPlaceholderSkillSelection);

                    // Ensure Select2 container is visible
                    $('#ddlCustomSkillsUsed').next('.select2-container').show();
                } else {
                    if (typeof toastr !== 'undefined') {
                        toastr.warning('No skills found. Please contact administrator.');
                    }
                }
            },
            error: function (xhr, status, error) {
                if (status === 'abort') return;
                console.error('Error loading sub-skills:', error);
                if (typeof toastr !== 'undefined') {
                    toastr.error('Error loading skills. Please try again.');
                }
            },
            complete: function (jqXHR) {
                if (window._kraLoadSubSkillsXhr === jqXHR) {
                    window._kraLoadSubSkillsXhr = null;
                }
            }
        });
    } catch (e) {
        console.error('Error in LoadSubSkills:', e);
        if (typeof toastr !== 'undefined') {
            toastr.error('Error loading skills: ' + e.message);
        }
    }
}

// Submit Custom Reference Goal
$(document).on('click', '#btnSubmitCustomReferenceGoal', function () {
    try {
        // Validate form
        var roleDescription = $('#txtCustomRoleDescription').val().trim();
        var skillsUsed = $('#ddlCustomSkillsUsed').val() || [];
        skillsUsed = $.grep(skillsUsed, function (id) {
            return id != null && String(id).trim() !== '';
        });
        var projectDetails = $('#txtCustomProjectDetails').val().trim();

        if (!roleDescription) {
            if (typeof toastr !== 'undefined') {
                toastr.warning('Please provide your role description.');
            } else {
                alert('Please provide your role description.');
            }
            $('#txtCustomRoleDescription').focus();
            return;
        }

        if (!skillsUsed || skillsUsed.length === 0) {
            if (typeof toastr !== 'undefined') {
                toastr.warning('Please select at least one skill.');
            } else {
                alert('Please select at least one skill.');
            }
            $('#ddlCustomSkillsUsed').focus();
            return;
        }

        if (!projectDetails) {
            if (typeof toastr !== 'undefined') {
                toastr.warning('Please provide account/project details.');
            } else {
                alert('Please provide account/project details.');
            }
            $('#txtCustomProjectDetails').focus();
            return;
        }

        // Prepare data
        var employeeId = parseInt(sessionStorage.getItem('EmployeeId'));
        var appraisalCycleId = parseInt($('#AppCycle').val());

        var customGoalData = {
            EmployeeId: employeeId,
            AppraisalCycleId: appraisalCycleId,
            RoleDescription: roleDescription,
            SkillsUsed: skillsUsed.join(','), // Convert array to comma-separated string
            ProjectDetails: projectDetails,
            CreatedBy: employeeId
        };

        // Disable submit button
        $('#btnSubmitCustomReferenceGoal').prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> Submitting...');

        // Call API
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + 'EmployeeKRA/InsertCustomReferenceGoal';

        $.ajax({
            url: apiPath,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(customGoalData),
            headers: CommonGetHeaderInfo(),
            success: function (result) {
                $('#btnSubmitCustomReferenceGoal').prop('disabled', false).html('Submit');

                if (result && result.Success) {
                    // Close modals
                    $('#customReferenceGoalModal').modal('hide');
                    $('#referenceGoalRepositoryModal').modal('hide');

                    // Show success message
                    if (typeof toastr !== 'undefined') {
                        toastr.success('Custom reference goal created successfully!');
                    } else {
                        alert('Custom reference goal created successfully!');
                    }
                } else {
                    // Handle error - check multiple possible error message locations
                    var errorMsg = 'Error creating custom goal.';
                    if (result && result.ErrorMessage) {
                        errorMsg = result.ErrorMessage;
                    } else if (result && result.Result && result.Result.Message) {
                        errorMsg = result.Result.Message;
                    } else if (result && result.Message) {
                        errorMsg = result.Message;
                    }

                    if (typeof toastr !== 'undefined') {
                        toastr.error(errorMsg);
                    } else {
                        alert(errorMsg);
                    }
                }
            },
            error: function (xhr, status, error) {
                $('#btnSubmitCustomReferenceGoal').prop('disabled', false).html('Submit');
                console.error('Error submitting custom reference goal:', error);
                if (typeof toastr !== 'undefined') {
                    toastr.error('Error submitting custom goal. Please try again.');
                } else {
                    alert('Error submitting custom goal. Please try again.');
                }
            }
        });
    } catch (e) {
        $('#btnSubmitCustomReferenceGoal').prop('disabled', false).html('Submit');
        console.error('Error in submit custom reference goal:', e);
        if (typeof toastr !== 'undefined') {
            toastr.error('Error: ' + e.message);
        } else {
            alert('Error: ' + e.message);
        }
    }
});

// Close custom reference goal modal only (parent Reference Goal Repository stays open)
$(document).on('click', '#btnCloseCustomReferenceGoal, #btnCloseCustomReferenceGoalHeader', function (e) {
    e.preventDefault();
    e.stopPropagation();
    $('#customReferenceGoalModal').modal('hide');
});

// Reset custom reference goal modal when closed
$(document).on('hidden.bs.modal', '#customReferenceGoalModal', function () {
    $('#customReferenceGoalForm')[0].reset();
    $('#txtCustomRoleDescription').val('');
    $('#txtCustomProjectDetails').val('');
    // Make the field editable again when modal is reset
    $('#txtCustomProjectDetails').prop('readonly', false);

    // Destroy Select2 and clear
    if ($('#ddlCustomSkillsUsed').data('select2')) {
        $('#ddlCustomSkillsUsed').select2('destroy');
    }
    $('#ddlCustomSkillsUsed').empty();

    // After child modal closes, BS3 strips modal-open/scrollbar from body even if Reference Goal Repository stays open
    setTimeout(function () {
        kraRestoreBootstrapModalBodyAfterStackedClose();
    }, 0);
});







