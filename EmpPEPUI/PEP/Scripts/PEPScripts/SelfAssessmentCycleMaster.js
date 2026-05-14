// Self Assessment Cycle Master Management JavaScript

// Load controller for Self Assessment Cycle Master tab
function LoadSelfAssessmentCycleMasterCtrl() {
    LoadAppraisalCycleDropdown();
}

// Load Appraisal Cycle dropdown - Only Active Cycles (IsActive = 1)
function LoadAppraisalCycleDropdown() {
    var svrPath = CONFIG.get('SERVERNAME');
    // Ensure API path includes 'api/' prefix if not already present
    var apiPath = svrPath;
    if (!apiPath.endsWith('/')) {
        apiPath += '/';
    }
    if (!apiPath.includes('/api/')) {
        apiPath += 'api/';
    }
    apiPath += "AppraisalCycle/GetActiveAppraisalCycles";
    
    // Use CommonAjaxGET which handles authentication properly
    var result = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    
    // Handle response from CommonAjaxGET (synchronous call)
    if (result && result.status && result.status >= 400) {
        console.error('Error loading Appraisal Cycles - HTTP Status:', result.status);
        AlertMessage('#divSAC_ValidationAlert', 'Error loading Appraisal Cycles. Please try again.', 'D');
        return;
    }
    
    var response = null;
    if (result && result.responseJSON) {
        response = result.responseJSON;
    } else if (result && typeof result === 'object' && result.Success !== undefined) {
        response = result;
    } else {
        console.error('Error loading Appraisal Cycles - Invalid response:', result);
        AlertMessage('#divSAC_ValidationAlert', 'Error loading Appraisal Cycles. Invalid response.', 'D');
        return;
    }
    
    if (response && response.Success) {
        $('#ddlSelfAssessmentAppraisalCycle').empty();
        $('#ddlSelfAssessmentAppraisalCycle').append($('<option>').val(0).text('-- Select Appraisal Cycle --'));
        
        if (response.Result && response.Result.length > 0) {
            $.each(response.Result, function (index, item) {
                $('#ddlSelfAssessmentAppraisalCycle').append(
                    $('<option>').val(item.AppraisalCycleId).text(item.AppraisalCycleName)
                );
            });
        } else {
            $('#ddlSelfAssessmentAppraisalCycle').append(
                $('<option>').val(0).text('No Active Appraisal Cycles Available')
            );
        }
    } else {
        console.error('Error in response:', response);
        var errorMsg = 'Error loading Appraisal Cycles';
        if (response && response.Result && response.Result.ErrorMessage) {
            errorMsg = response.Result.ErrorMessage;
        }
        AlertMessage('#divSAC_ValidationAlert', errorMsg, 'D');
    }
}

// Load Self Assessment Cycles for selected Appraisal Cycle
function LoadSelfAssessmentCycles() {
    var appraisalCycleId = $('#ddlSelfAssessmentAppraisalCycle').val();
    
    if (!appraisalCycleId || appraisalCycleId == 0) {
        $('#tblSelfAssessmentCycleMaster tbody').html(
            '<tr><td colspan="6" style="text-align:center; padding:20px;">Please select an Appraisal Cycle</td></tr>'
        );
        return;
    }
    
    var svrPath = CONFIG.get('SERVERNAME');
    // Ensure API path includes 'api/' prefix if not already present
    var apiPath = svrPath;
    if (!apiPath.endsWith('/')) {
        apiPath += '/';
    }
    if (!apiPath.includes('/api/')) {
        apiPath += 'api/';
    }
    apiPath += "AppraisalCycle/GetSelfAssessmentCycleDetails?AppraisalCycleId=" + appraisalCycleId;
    
    // Use CommonAjaxGET which handles authentication properly
    var result = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    
    // Handle response from CommonAjaxGET (synchronous call)
    if (result && result.status && result.status >= 400) {
        console.error('Error loading Self Assessment Cycles - HTTP Status:', result.status);
        AlertMessage('#divSAC_ValidationAlert', 'Error loading Self Assessment Cycles', 'D');
        $('#tblSelfAssessmentCycleMaster tbody').html(
            '<tr><td colspan="6" style="text-align:center; padding:20px; color:red;">Error loading data</td></tr>'
        );
        return;
    }
    
    var response = null;
    if (result && result.responseJSON) {
        response = result.responseJSON;
    } else if (result && typeof result === 'object' && result.Success !== undefined) {
        response = result;
    } else {
        console.error('Error loading Self Assessment Cycles - Invalid response:', result);
        AlertMessage('#divSAC_ValidationAlert', 'Error loading Self Assessment Cycles', 'D');
        $('#tblSelfAssessmentCycleMaster tbody').html(
            '<tr><td colspan="6" style="text-align:center; padding:20px; color:red;">Error loading data</td></tr>'
        );
        return;
    }
    
    if (response && response.Success && response.Result) {
        BindSelfAssessmentCycleGrid(response.Result);
    } else {
        $('#tblSelfAssessmentCycleMaster tbody').html(
            '<tr><td colspan="6" style="text-align:center; padding:20px;">No Self Assessment cycles found</td></tr>'
        );
    }
}

// Bind Self Assessment Cycle grid
function BindSelfAssessmentCycleGrid(data) {
    if ($.fn.DataTable.isDataTable('#tblSelfAssessmentCycleMaster')) {
        $('#tblSelfAssessmentCycleMaster').DataTable().destroy();
    }
    
    $('#tblSelfAssessmentCycleMaster tbody').empty();
    
    if (data && data.length > 0) {
        $('#tblSelfAssessmentCycleMaster').DataTable({
            destroy: true,
            data: data,
            columns: [
                {
                    data: "AppraisalCycleName",
                    render: function (data, type, full) {
                        // Show AppraisalCycleName (from AppraisalCycleMaster via AppraisalCycleYearbreakupDetail join)
                        return data || 'N/A';
                    }
                },
                {
                    data: "StartDate",
                    render: function (data, type, full) {
                        if (data) {
                            var dt = new Date(data);
                            return formatDate_DMY(dt);
                        }
                        return 'N/A';
                    }
                },
                {
                    data: "EndDate",
                    render: function (data, type, full) {
                        if (data) {
                            var dt = new Date(data);
                            return formatDate_DMY(dt);
                        }
                        return 'N/A';
                    }
                },
                {
                    data: "IsClosed",
                    render: function (data, type, full) {
                        if (data === true || data === 1 || data === '1') {
                            return '<span class="label label-danger">Closed</span>';
                        }
                        return '<span class="label label-success">Open</span>';
                    }
                },
                {
                    data: "ClosedDate",
                    render: function (data, type, full) {
                        if (data) {
                            var dt = new Date(data);
                            return formatDate_DMY(dt);
                        }
                        return 'N/A';
                    }
                },
                {
                    data: null,
                    className: "text-left",
                    render: function (data, type, full) {
                        var buttons = '';
                        if (full.IsClosed === true || full.IsClosed === 1 || full.IsClosed === '1') {
                            // Show Reopen button
                            buttons = '<button class="btn btn-warning btn-xs" title="Reopen Cycle" onclick="OpenReopenCycleModal(' +
                                full.Id + ', \'' + full.AppraisalCycleName + '\', \'' + full.YearBreakCheck + '\')">' +
                                '<span class="glyphicon glyphicon-unlock"></span> Reopen</button>';
                        } else {
                            // Show Close button
                            buttons = '<button class="btn btn-danger btn-xs" title="Close Cycle" onclick="OpenCloseCycleModal(' +
                                full.Id + ', \'' + full.AppraisalCycleName + '\', \'' + full.YearBreakCheck + '\')">' +
                                '<span class="glyphicon glyphicon-lock"></span> Close</button>';
                        }
                        return buttons;
                    }
                }
            ],
            order: [[0, "desc"]], // Order by AppraisalCycleName descending
            bFilter: false,  // Remove search filter
            paging: false,  // Disable pagination
            bInfo: false,  // Remove "Showing X to Y of Z entries" info
            bLengthChange: false,  // Remove "Show X entries" dropdown
            autoWidth: false,
            scrollX: false  // Disable horizontal scrolling
        });
    } else {
        $('#tblSelfAssessmentCycleMaster tbody').html(
            '<tr><td colspan="6" style="text-align:center; padding:20px;">No Self Assessment cycles found</td></tr>'
        );
    }
}

// Open Close Cycle Modal
function OpenCloseCycleModal(id, cycleName, yearBreakCheck) {
    $('#hdnCloseCycleId').val(id);
    $('#lblCloseCycleName').text(cycleName);
    $('#lblCloseYearBreakCheck').text(yearBreakCheck);
    $('#modalCloseCycle').modal('show');
}

// Confirm Close Cycle
function ConfirmCloseCycle() {
    var id = $('#hdnCloseCycleId').val();
    var svrPath = CONFIG.get('SERVERNAME');
    // Ensure API path includes 'api/' prefix if not already present
    var apiPath = svrPath;
    if (!apiPath.endsWith('/')) {
        apiPath += '/';
    }
    if (!apiPath.includes('/api/')) {
        apiPath += 'api/';
    }
    apiPath += "AppraisalCycle/CloseSelfAssessmentCycle";
    
    var data = {
        Id: parseInt(id),
        ClosedBy: parseInt(sessionStorage.EmployeeId || sessionStorage.getItem('EmployeeId') || 0)
    };
    
    $.ajax({
        url: apiPath,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        headers: CommonGetHeaderInfo(),
        success: function (response) {
            if (response && response.Success) {
                $('#modalCloseCycle').modal('hide');
                AlertMessage('#divSAC_ValidationAlert', 'Cycle closed successfully', 'I');
                LoadSelfAssessmentCycles(); // Reload grid
            } else {
                AlertMessage('#divSAC_ValidationAlert', response && response.Result ? response.Result.ErrorMessage : 'Error closing cycle', 'D');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error closing cycle:', { status: status, error: error, responseText: xhr.responseText });
            AlertMessage('#divSAC_ValidationAlert', 'Error closing cycle', 'D');
        }
    });
}

// Open Reopen Cycle Modal
function OpenReopenCycleModal(id, cycleName, yearBreakCheck) {
    $('#hdnReopenCycleId').val(id);
    $('#lblReopenCycleName').text(cycleName);
    $('#lblReopenYearBreakCheck').text(yearBreakCheck);
    $('#modalReopenCycle').modal('show');
}

// Confirm Reopen Cycle
function ConfirmReopenCycle() {
    var id = $('#hdnReopenCycleId').val();
    var svrPath = CONFIG.get('SERVERNAME');
    // Ensure API path includes 'api/' prefix if not already present
    var apiPath = svrPath;
    if (!apiPath.endsWith('/')) {
        apiPath += '/';
    }
    if (!apiPath.includes('/api/')) {
        apiPath += 'api/';
    }
    apiPath += "AppraisalCycle/ReopenSelfAssessmentCycle";
    
    var data = {
        Id: parseInt(id)
    };
    
    $.ajax({
        url: apiPath,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        headers: CommonGetHeaderInfo(),
        success: function (response) {
            if (response && response.Success) {
                $('#modalReopenCycle').modal('hide');
                AlertMessage('#divSAC_ValidationAlert', 'Cycle reopened successfully', 'I');
                LoadSelfAssessmentCycles(); // Reload grid
            } else {
                AlertMessage('#divSAC_ValidationAlert', response && response.Result ? response.Result.ErrorMessage : 'Error reopening cycle', 'D');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error reopening cycle:', { status: status, error: error, responseText: xhr.responseText });
            AlertMessage('#divSAC_ValidationAlert', 'Error reopening cycle', 'D');
        }
    });
}

