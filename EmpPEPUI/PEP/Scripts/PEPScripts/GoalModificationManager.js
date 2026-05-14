// Goal Modification Manager Approval JavaScript

var GoalModificationManager = {
    
    // Initialize
    init: function() {
        GoalModificationManager.bindEvents();
        GoalModificationManager.initializeManagerTab();
    },

    // Bind events
    bindEvents: function() {
        $('#btnConfirmApprove').on('click', GoalModificationManager.approveRequest);
        $('#btnConfirmReject').on('click', GoalModificationManager.rejectRequest);

        // Bulk action buttons
        $('#btnBulkApprove').on('click', function () {
            GoalModificationManager.bulkUpdateRequests('Approve');
        });

        $('#btnBulkReject').on('click', function () {
            GoalModificationManager.bulkUpdateRequests('Reject');
        });

        // Select / deselect all
        $(document).on('change', '#chkSelectAllRequests', function () {
            var isChecked = $(this).is(':checked');
            $('#tbodyGoalModificationRequests .chk-request-select').prop('checked', isChecked);
            GoalModificationManager.updateBulkButtonsVisibility();
        });

        // Individual row checkbox change
        $(document).on('change', '#tbodyGoalModificationRequests .chk-request-select', function () {
            GoalModificationManager.syncSelectAllCheckbox();
            GoalModificationManager.updateBulkButtonsVisibility();
        });
        
        // Tab click event - load data when tab is shown (listen on tab pane, not just link)
        $('#tab_f').on('shown.bs.tab', function(e) {
            GoalModificationManager.loadPendingRequests();
        });
        
        // Also listen on the tab link itself
        $('#KRATab_F a').on('shown.bs.tab', function(e) {
            GoalModificationManager.loadPendingRequests();
        });
        
        // Listen for tab activation via hash change (when URL has #tab_f)
        $(window).on('hashchange', function() {
            if (window.location.hash === '#tab_f') {
                setTimeout(function() {
                    if ($('#tab_f').hasClass('active')) {
                        GoalModificationManager.loadPendingRequests();
                    }
                }, 100);
            }
        });
    },

    // Initialize manager tab - always show and fetch count
    initializeManagerTab: function() {
        // Always show the tab
        $('#KRATab_F').show();
        
        // Fetch the count on page load
        GoalModificationManager.updatePendingCount();
        
        // Check if tab_f should be loaded (from URL hash or if already active)
        var checkAndLoadTab = function() {
            var hash = window.location.hash;
            var activeTab = $('#tab_f');
            var tabLink = $('#KRATab_F a');
            
            // Check if URL hash points to tab_f
            if (hash === '#tab_f' || hash === 'tab_f') {
                // Wait a bit for tab activation to complete, then load
                setTimeout(function() {
                    if (activeTab.length && activeTab.hasClass('active')) {
                        console.log('Loading Goal Modification requests (from hash)');
                        GoalModificationManager.loadPendingRequests();
                    } else {
                        // Tab not active yet, try again
                        setTimeout(function() {
                            if (activeTab.hasClass('active')) {
                                console.log('Loading Goal Modification requests (delayed)');
                                GoalModificationManager.loadPendingRequests();
                            }
                        }, 500);
                    }
                }, 200);
            } else if (activeTab.length && activeTab.hasClass('active')) {
                // Tab is already active (e.g., from sessionStorage)
                console.log('Loading Goal Modification requests (already active)');
                GoalModificationManager.loadPendingRequests();
            }
        };
        
        // Wait for document ready and tab initialization to complete
        $(document).ready(function() {
            // Check after document ready
            setTimeout(checkAndLoadTab, 100);
            // Also check after a longer delay to ensure all initialization is complete
            setTimeout(checkAndLoadTab, 500);
        });
    },

    // Update pending request count from API
    updatePendingCount: function() {
        var svrPath = CONFIG.get('SERVERNAME');

        $.ajax({
            type: "GET",
            url: svrPath + "GoalModification/GetPendingRequestCount",
            headers: {
                "Authorization": 'Bearer ' + sessionStorage.TokenValue,
                "X-EmpNo": sessionStorage.EmployeeId
            },
            success: function(response) {
                if (response.Success && response.Result) {
                    var count = response.Result.Count || 0;
                    
                    // Update badge
                    if (count > 0) {
                        $('#badgeModificationCount').text(count).show();
                        // Add blinking class if there are pending requests
                        $('#badgeModificationCount').addClass('badge-blink');
                    } else {
                        $('#badgeModificationCount').hide().removeClass('badge-blink');
                    }
                    
                    console.log('Updated pending count:', count);
                }
            },
            error: function(xhr, status, error) {
                console.error('Error fetching pending count:', error);
                // Hide badge on error
                $('#badgeModificationCount').hide().removeClass('badge-blink');
            }
        });
    },

    // Load pending requests for manager
    loadPendingRequests: function() {
        var svrPath = CONFIG.get('SERVERNAME');
        
        // Show loading
        $('#tbodyGoalModificationRequests').html(
            '<tr><td colspan="7" class="text-center"><i class="fa fa-spinner fa-spin"></i> Loading requests...</td></tr>'
        );

        $.ajax({
            type: "GET",
            url: svrPath + "GoalModification/GetPendingRequests",
            headers: {
                "Authorization": 'Bearer ' + sessionStorage.TokenValue,
                "X-EmpNo": sessionStorage.EmployeeId
            },
            success: function(response) {
                if (response.Success) {
                    GoalModificationManager.displayRequests(response.Result);
                } else {
                    $('#tbodyGoalModificationRequests').html(
                        '<tr><td colspan="7" class="text-center text-danger">Error loading requests</td></tr>'
                    );
                }
            },
            error: function(xhr, status, error) {
                console.error('Error loading pending requests:', error);
                $('#tbodyGoalModificationRequests').html(
                    '<tr><td colspan="7" class="text-center text-danger">Error loading requests</td></tr>'
                );
            }
        });
    },

    // Display requests in table
    displayRequests: function(requests) {
        console.log('Displaying requests:', requests);
        
        if (!requests || requests.length === 0) {
            $('#tbodyGoalModificationRequests').html(
                '<tr><td colspan="6" class="text-center text-muted">No pending requests</td></tr>'
            );
            $('#badgeModificationCount').hide().removeClass('badge-blink');
            // Hide bulk buttons when no data
            $('#btnBulkApprove, #btnBulkReject').hide();
            $('#chkSelectAllRequests').prop('checked', false);
            return;
        }

        var html = '';
        $.each(requests, function(index, request) {
            var requestDate = new Date(request.CreatedDate).toLocaleDateString();
            var statusClass = request.Status === 'Pending' ? 'status-pending' : 
                            request.Status === 'Approved' ? 'status-approved' : 'status-rejected';
            
            // Handle null values
            var employeeName = request.EmployeeName && request.EmployeeName.trim() ? request.EmployeeName : 'N/A';
            var reason = request.Reason || 'Reason not found';
            
            html += '<tr data-request-id="' + request.RequestId + '">';
            // Selection checkbox (only for pending requests)
            html += '<td class="text-center">';
            if (request.Status === 'Pending') {
                html += '<input type="checkbox" class="chk-request-select" data-request-id="' + request.RequestId + '" />';
            }
            html += '</td>';
            html += '<td>' + employeeName + '</td>';
            // Cycle column removed - goals are set once per yearly appraisal cycle, not twice (H1/H2)
            html += '<td>' + reason + '</td>';
            html += '<td class="text-center">' + requestDate + '</td>';
            html += '<td class="text-center"><span class="' + statusClass + '">' + request.Status + '</span></td>';
            html += '<td class="text-center">';
            
            if (request.Status === 'Pending') {
                html += '<button class="btn btn-sm btn-success" onclick="GoalModificationManager.showApprovalModal(' + request.RequestId + ')" title="Approve">';
                html += '<i class="fa fa-check"></i> Approve';
                html += '</button> ';
                html += '<button class="btn btn-sm btn-danger" onclick="GoalModificationManager.showRejectionModal(' + request.RequestId + ')" title="Reject">';
                html += '<i class="fa fa-times"></i> Reject';
                html += '</button>';
            } else {
                html += '<span class="text-muted">No action required</span>';
            }
            
            html += '</td>';
            html += '</tr>';
        });

        $('#tbodyGoalModificationRequests').html(html);
        
        // Update badge count and add blinking class if there are any pending requests
        var pendingCount = requests.filter(function(r) { return r.Status === 'Pending'; }).length;
        if (pendingCount > 0) {
            $('#badgeModificationCount').text(pendingCount).show().addClass('badge-blink');
        } else {
            $('#badgeModificationCount').hide().removeClass('badge-blink');
        }

        // Reset bulk selection controls and button visibility
        $('#chkSelectAllRequests').prop('checked', false);
        GoalModificationManager.updateBulkButtonsVisibility();
    },

    // Sync "Select All" checkbox based on individual selections
    syncSelectAllCheckbox: function () {
        var $all = $('#tbodyGoalModificationRequests .chk-request-select');
        if ($all.length === 0) {
            $('#chkSelectAllRequests').prop('checked', false);
            return;
        }
        var allChecked = true;
        $all.each(function () {
            if (!this.checked) {
                allChecked = false;
                return false;
            }
        });
        $('#chkSelectAllRequests').prop('checked', allChecked);
    },

    // Show/hide bulk action buttons based on selection
    updateBulkButtonsVisibility: function () {
        var selectedCount = $('#tbodyGoalModificationRequests .chk-request-select:checked').length;
        if (selectedCount > 0) {
            $('#btnBulkApprove, #btnBulkReject').show();
        } else {
            $('#btnBulkApprove, #btnBulkReject').hide();
        }
    },

    // Bulk approve/reject selected requests
    bulkUpdateRequests: function (actionType) {
        var selectedIds = [];
        $('#tbodyGoalModificationRequests .chk-request-select:checked').each(function () {
            var id = parseInt($(this).data('request-id'));
            if (!isNaN(id)) {
                selectedIds.push(id);
            }
        });

        if (selectedIds.length === 0) {
            toastr.warning('Please select at least one request to ' + actionType.toLowerCase() + '.');
            return;
        }

        if (actionType === 'Reject') {
            // Use existing rejection modal to capture a common reason for all selected requests
            $('#hdnRejectRequestId').val('');
            $('#txtRejectionReason').val('');
            $('#rejectionErrorMsg').hide();
            $('#rejectionModal').data('bulk-ids', selectedIds);
            $('#rejectionModal').modal('show');
        } else if (actionType === 'Approve') {
            // Use approval modal for confirmation (same note as single approval)
            $('#hdnApproveRequestId').val('');
            $('#approvalModal').data('bulk-ids', selectedIds);
            $('#approvalModal').modal('show');
        }
    },

    // Execute bulk update via existing single-request endpoints (sequentially)
    executeBulkUpdate: function (actionType, requestIds, rejectionReason, onComplete) {
        var svrPath = CONFIG.get('SERVERNAME');
        var endpoint = actionType === 'Approve' ? 'ApproveRequest' : 'RejectRequest';
        var successCount = 0;
        var failCount = 0;
        var index = 0;

        var processNext = function () {
            if (index >= requestIds.length) {
                // Build a user-friendly summary message, e.g. "Approved 2 request(s)" or "Rejected 2 request(s)"
                var verb = (actionType === 'Approve') ? 'Approved' : 'Rejected';
                var msg = verb + ' ' + successCount + ' request(s)';
                if (failCount > 0) {
                    msg += ' (' + failCount + ' failed)';
                }
                toastr.success(msg);
                GoalModificationManager.loadPendingRequests();
                GoalModificationManager.updatePendingCount();

                if (typeof onComplete === 'function') {
                    onComplete();
                }
                return;
            }

            var id = requestIds[index++];
            var data = (actionType === 'Approve')
                ? JSON.stringify({ requestId: id })
                : JSON.stringify({ requestId: id, rejectionReason: rejectionReason || '' });

            $.ajax({
                type: "POST",
                url: svrPath + "GoalModification/" + endpoint,
                data: data,
                contentType: "application/json",
                headers: {
                    "Authorization": 'Bearer ' + sessionStorage.TokenValue,
                    "X-EmpNo": sessionStorage.EmployeeId
                },
                complete: function (xhr) {
                    if (xhr.responseJSON && xhr.responseJSON.Success) {
                        successCount++;
                    } else {
                        failCount++;
                    }
                    processNext();
                }
            });
        };

        processNext();
    },

    // Show approval modal
    showApprovalModal: function(requestId) {
        // Clear any bulk selection data
        $('#approvalModal').removeData('bulk-ids');
        $('#hdnApproveRequestId').val(requestId);
        $('#approvalModal').modal('show');
    },

    // Show rejection modal
    showRejectionModal: function(requestId) {
        $('#hdnRejectRequestId').val(requestId);
        $('#txtRejectionReason').val('');
        $('#rejectionErrorMsg').hide();
        $('#rejectionModal').modal('show');
    },

    // Approve request (single or bulk)
    approveRequest: function() {
        var svrPath = CONFIG.get('SERVERNAME');
        var bulkIds = $('#approvalModal').data('bulk-ids');
        var isBulk = Array.isArray(bulkIds) && bulkIds.length > 0;

        $('#btnConfirmApprove').prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> Approving...');

        if (isBulk) {
            // Bulk approval path
            GoalModificationManager.executeBulkUpdate('Approve', bulkIds, null, function () {
                $('#approvalModal').modal('hide');
                $('#approvalModal').removeData('bulk-ids');
                $('#btnConfirmApprove').prop('disabled', false).html('<i class="fa fa-check"></i> Approve');
            });
            return;
        }

        // Single approval path
        var requestId = $('#hdnApproveRequestId').val();

        $.ajax({
            type: "POST",
            url: svrPath + "GoalModification/ApproveRequest",
            data: JSON.stringify({ requestId: parseInt(requestId) }),
            contentType: "application/json",
            headers: {
                "Authorization": 'Bearer ' + sessionStorage.TokenValue,
                "X-EmpNo": sessionStorage.EmployeeId
            },
            success: function(response) {
                $('#btnConfirmApprove').prop('disabled', false).html('<i class="fa fa-check"></i> Approve');
                
                if (response.Success) {
                    $('#approvalModal').modal('hide');
                    toastr.success('Request approved successfully. Employee has been notified.');
                    
                    // Reload requests and update count
                    setTimeout(function() {
                        GoalModificationManager.loadPendingRequests();
                        GoalModificationManager.updatePendingCount();
                    }, 1000);
                } else {
                    toastr.error(response.ErrorMessage || 'Failed to approve request');
                }
            },
            error: function(xhr, status, error) {
                $('#btnConfirmApprove').prop('disabled', false).html('<i class="fa fa-check"></i> Approve');
                
                var errorMsg = 'Error approving request';
                if (xhr.responseJSON && xhr.responseJSON.ErrorMessage) {
                    errorMsg = xhr.responseJSON.ErrorMessage;
                }
                toastr.error(errorMsg);
            }
        });
    },

    // Reject request (single or bulk)
    rejectRequest: function() {
        var reason = $('#txtRejectionReason').val().trim();
        var svrPath = CONFIG.get('SERVERNAME');
        var bulkIds = $('#rejectionModal').data('bulk-ids');
        var isBulk = Array.isArray(bulkIds) && bulkIds.length > 0;

        // Validation
        if (!reason) {
            $('#rejectionErrorMsg').text('Please provide a reason for rejection').show();
            return;
        }

        $('#btnConfirmReject').prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> Rejecting...');
        $('#rejectionErrorMsg').hide();

        if (isBulk) {
            // Bulk reject via existing helper
            GoalModificationManager.executeBulkUpdate('Reject', bulkIds, reason, function () {
                $('#rejectionModal').modal('hide');
                $('#rejectionModal').removeData('bulk-ids');
                $('#btnConfirmReject').prop('disabled', false).html('<i class="fa fa-times"></i> Reject');
            });
            return;
        }

        // Single reject path
        var requestId = $('#hdnRejectRequestId').val();
        var requestData = {
            requestId: parseInt(requestId),
            rejectionReason: reason
        };
        
        $.ajax({
            type: "POST",
            url: svrPath + "GoalModification/RejectRequest",
            data: JSON.stringify(requestData),
            contentType: "application/json",
            headers: {
                "Authorization": 'Bearer ' + sessionStorage.TokenValue,
                "X-EmpNo": sessionStorage.EmployeeId
            },
            success: function(response) {
                $('#btnConfirmReject').prop('disabled', false).html('<i class="fa fa-times"></i> Reject');
                
                if (response.Success) {
                    $('#rejectionModal').modal('hide');
                    toastr.success('Request rejected successfully. Employee has been notified.');
                    
                    // Reload requests and update count
                    setTimeout(function() {
                        GoalModificationManager.loadPendingRequests();
                        GoalModificationManager.updatePendingCount();
                    }, 1000);
                } else {
                    $('#rejectionErrorMsg').text(response.ErrorMessage || 'Failed to reject request').show();
                }
            },
            error: function(xhr, status, error) {
                $('#btnConfirmReject').prop('disabled', false).html('<i class="fa fa-times"></i> Reject');
                
                var errorMsg = 'Error rejecting request';
                if (xhr.responseJSON && xhr.responseJSON.ErrorMessage) {
                    errorMsg = xhr.responseJSON.ErrorMessage;
                }
                $('#rejectionErrorMsg').text(errorMsg).show();
            }
        });
    }
};

// Initialize on document ready
$(document).ready(function() {
    GoalModificationManager.init();
});
