// Goal Modification Request JavaScript

var GoalModification = {
    
    // Initialize
    init: function() {
        GoalModification.bindEvents();
        GoalModification.loadReasons(); // Load reasons on page load
    },

    // Bind events
    bindEvents: function() {
        $('#btnSubmitModificationRequest').on('click', GoalModification.submitModificationRequest);
    },

    // Load modification reasons from API
    loadReasons: function() {
        var svrPath = CONFIG.get('SERVERNAME');
        
        $('#reasonLoader').show();
        
        $.ajax({
            type: "GET",
            url: svrPath + "GoalModification/GetActiveReasons",
            headers: {
                "Authorization": 'Bearer ' + sessionStorage.TokenValue,
                "X-EmpNo": sessionStorage.EmployeeId
            },
            success: function(response) {
                $('#reasonLoader').hide();
                
                if (response.Success && response.Result) {
                    var dropdown = $('#modificationReason');
                    dropdown.empty();
                    dropdown.append('<option value="">-- Select Reason --</option>');
                    
                    $.each(response.Result, function(index, reason) {
                        dropdown.append(
                            $('<option></option>')
                                .attr('value', reason.ReasonId)
                                .text(reason.ReasonText)
                        );
                    });
                } else {
                    console.error('Failed to load reasons');
                    // Fallback to default reasons if API fails
                    GoalModification.loadDefaultReasons();
                }
            },
            error: function(xhr, status, error) {
                $('#reasonLoader').hide();
                console.error('Error loading reasons:', error);
                // Fallback to default reasons if API fails
                GoalModification.loadDefaultReasons();
            }
        });
    },

    // Fallback: Load default reasons if API fails
    loadDefaultReasons: function() {
        var dropdown = $('#modificationReason');
        dropdown.empty();
        dropdown.append('<option value="">-- Select Reason --</option>');
        dropdown.append('<option value="1">Role change</option>');
        dropdown.append('<option value="2">Account/Project change</option>');
        dropdown.append('<option value="3">Typo correction</option>');
        dropdown.append('<option value="4">Goals no longer relevant</option>');
        dropdown.append('<option value="5">Change in business priorities</option>');
        dropdown.append('<option value="6">Other</option>');
    },

    // Show modification modal
    showModificationModal: function(appraisalCycleId, cycle) {
        // Store current cycle info
        $('#hdnCurrentCycle').val(cycle);
        $('#hdnCurrentAppraisalCycleId').val(appraisalCycleId);
        
        // Reset form
        $('#modificationReason').val('');
        $('#modificationErrorMsg').hide();
        
        // Get the actual cycle ID (YearBreakCheck value like "112025" or "122025")
        // The cycle parameter should already be the actual cycle ID from dropdown
        // If not, get it from dropdown as fallback
        var actualCycleId = cycle;
            actualCycleId = $('#ddlSelfAssCycle').val();
        
        // Check if H2 warning should be shown first (pass actual cycle ID like "122025" or "112025")
        GoalModification.checkH2Warning(appraisalCycleId, actualCycleId);
    },

    // Check if H2 cycle change warning should be shown
    checkH2Warning: function(appraisalCycleId, cycle) {
        var employeeId = sessionStorage.EmployeeId;
        var svrPath = CONFIG.get('SERVERNAME');
        
        console.log('Checking H2 warning...');
        console.log('Employee ID:', employeeId);
        console.log('Appraisal Cycle ID:', appraisalCycleId);
        console.log('Cycle:', cycle);
        
        $.ajax({
            type: "GET",
            url: svrPath + "GoalModification/ShouldShowH2Warning",
            data: {
                employeeId: employeeId,
                appraisalCycleId: appraisalCycleId,
                cycle: cycle
            },
            headers: {
                "Authorization": 'Bearer ' + sessionStorage.TokenValue,
                "X-EmpNo": sessionStorage.EmployeeId
            },
            success: function(response) {
                console.log('H2 Warning API Response:', response);
                if (response.Success && response.Result && response.Result.ShouldShowWarning) {
                    // Show warning modal
                    GoalModification.showH2WarningModal(appraisalCycleId, cycle);
                } else {
                    // No warning needed, proceed with normal flow
                    GoalModification.checkCanRequestModification(appraisalCycleId);
                }
            },
            error: function(xhr, status, error) {
                console.error('Error checking H2 warning:', error);
                // On error, proceed with normal flow (don't block user)
                GoalModification.checkCanRequestModification(appraisalCycleId);
            }
        });
    },

    // Show H2 warning modal
    showH2WarningModal: function(appraisalCycleId, cycle) {
        // Store cycle info for later use
        $('#hdnCurrentCycle').val(cycle);
        $('#hdnCurrentAppraisalCycleId').val(appraisalCycleId);
        
        // Unbind previous events and bind new ones
        $('#btnH2WarningYes').off('click').on('click', function() {
            $('#h2CycleWarningModal').modal('hide');
            // Proceed with normal goal modification flow
            GoalModification.checkCanRequestModification(appraisalCycleId);
        });
        
        $('#btnH2WarningNo').off('click').on('click', function() {
            $('#h2CycleWarningModal').modal('hide');
        });
        
        // Show the warning modal
        $('#h2CycleWarningModal').modal('show');
    },

    // Check if employee can request modification
    // Goals are set once per yearly appraisal cycle
    checkCanRequestModification: function (appraisalCycleId) {
        var employeeId = sessionStorage.EmployeeId;
        var svrPath = CONFIG.get('SERVERNAME');
        
        console.log('Checking modification eligibility...');
        console.log('Employee ID:', employeeId);
        console.log('Appraisal Cycle ID:', appraisalCycleId);
        console.log('Server Path:', svrPath);
        console.log('Token:', sessionStorage.TokenValue ? 'Present' : 'Missing');
        
        $.ajax({
            type: "GET",
            url: svrPath + "GoalModification/CanRequestModification",
            data: {
                employeeId: employeeId,
                appraisalCycleId: appraisalCycleId
            },
            headers: {
                "Authorization": 'Bearer ' + sessionStorage.TokenValue,
                "X-EmpNo": sessionStorage.EmployeeId
            },
            success: function (response) {
                debugger
                console.log('API Response:', response);
                if (response.Success) {
                    if (response.Result.ValidationMessage) {
                        // Show validation error
                        toastr.warning(response.Result.ValidationMessage);
                        return;
                    }
                    
                    if (response.Result.HasPendingRequest) {
                        // Hide the request button if there's a pending request
                        toastr.info('You have a pending goal modification request. Please wait for manager approval.');
                        return;
                    }
                    
                    if (response.Result.CanRequest) {
                        // Show modification modal
                        $('#goalModificationModal').modal('show');
                    } else {
                        // Show limit exceeded modal or message
                        toastr.warning('Goal modification limit reached. Contact your HRBP for further changes.');
                    }
                } else {
                    console.error('API returned error:', response.ErrorMessage);
                    toastr.error(response.ErrorMessage || 'Failed to check modification eligibility');
                }
            },
            error: function(xhr, status, error) {
                console.error('AJAX Error:', {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    responseText: xhr.responseText,
                    error: error
                });
                
                var errorMsg = 'Error checking modification eligibility';
                if (xhr.responseJSON && xhr.responseJSON.ErrorMessage) {
                    errorMsg = xhr.responseJSON.ErrorMessage;
                } else if (xhr.responseText) {
                    try {
                        var resp = JSON.parse(xhr.responseText);
                        if (resp.ErrorMessage) errorMsg = resp.ErrorMessage;
                    } catch (e) {
                        console.error('Could not parse error response');
                    }
                }
                
                toastr.error(errorMsg);
            }
        });
    },

    // Submit modification request
    submitModificationRequest: function() {
        var reasonId = $('#modificationReason').val();
        var cycle = $('#hdnCurrentCycle').val();
        var appraisalCycleId = $('#hdnCurrentAppraisalCycleId').val();
        var employeeId = sessionStorage.EmployeeId;
        var svrPath = CONFIG.get('SERVERNAME');

        // Validation
        if (!reasonId) {
            $('#modificationErrorMsg').text('Please select a reason for modification').show();
            return;
        }

        // Disable button to prevent double submission
        $('#btnSubmitModificationRequest').prop('disabled', true).text('Submitting...');

        var requestData = {
            EmployeeId: parseInt(employeeId),
            AppraisalCycleId: parseInt(appraisalCycleId),
            Cycle: cycle,
            ReasonId: parseInt(reasonId)
        };

        $.ajax({
            type: "POST",
            url: svrPath + "GoalModification/SubmitRequest",
            data: JSON.stringify(requestData),
            contentType: "application/json",
            headers: {
                "Authorization": 'Bearer ' + sessionStorage.TokenValue,
                "X-EmpNo": sessionStorage.EmployeeId
            },
            success: function(response) {
                $('#btnSubmitModificationRequest').prop('disabled', false).text('Yes');
                
                if (response.Success) {
                    $('#goalModificationModal').modal('hide');
                    toastr.success('Goal modification request submitted successfully. Your manager will be notified.');
                    
                    // Update manager pending count
                    if (typeof GoalModificationManager !== 'undefined' && GoalModificationManager.updatePendingCount) {
                        GoalModificationManager.updatePendingCount();
                    }
                    
                    // Refresh KRA list after a short delay
                    setTimeout(function() {
                        ShowMyKRA(employeeId, 'E', appraisalCycleId);
                    }, 2000);
                } else {
                    $('#modificationErrorMsg').text(response.ErrorMessage || 'Failed to submit request').show();
                }
            },
            error: function(xhr, status, error) {
                $('#btnSubmitModificationRequest').prop('disabled', false).text('Yes');
                var errorMessage = 'Error submitting modification request';
                
                if (xhr.responseJSON && xhr.responseJSON.ErrorMessage) {
                    errorMessage = xhr.responseJSON.ErrorMessage;
                }
                
                $('#modificationErrorMsg').text(errorMessage).show();
            }
        });
    },

    // Determine current cycle (H1 or H2) based on date
    getCurrentCycle: function(appraisalCycleId) {
        // This should be based on the appraisal cycle dates
        // For now, we'll use a simple logic based on current month
        var currentMonth = new Date().getMonth() + 1; // 1-12
        
        if (currentMonth >= 1 && currentMonth <= 6) {
            return 'H1';
        } else {
            return 'H2';
        }
    },

    // Get request history for employee
    getRequestHistory: function(employeeId, appraisalCycleId, cycle) {
        var svrPath = CONFIG.get('SERVERNAME');
        
        $.ajax({
            type: "GET",
            url: svrPath + "GoalModification/GetRequestHistory",
            data: {
                employeeId: employeeId,
                appraisalCycleId: appraisalCycleId,
                cycle: cycle
            },
            headers: {
                "Authorization": 'Bearer ' + sessionStorage.TokenValue,
                "X-EmpNo": sessionStorage.EmployeeId
            },
            success: function(response) {
                if (response.Success) {
                    GoalModification.displayRequestHistory(response.Result);
                } else {
                    console.log('Failed to get request history');
                }
            },
            error: function(xhr, status, error) {
                console.log('Error getting request history');
            }
        });
    },

    // Display request history
    displayRequestHistory: function(requests) {
        // This can be implemented to show history in a separate section/modal
        console.log('Request History:', requests);
    }
};

// Initialize on document ready
$(document).ready(function() {
    GoalModification.init();
});
