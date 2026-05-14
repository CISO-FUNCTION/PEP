// ===================================================================
// COLUMN VISIBILITY FUNCTIONS FOR RATINGADMIN PAGE
// Add these functions to RatingAdmin.js file
// Call InitializeColumnVisibilityDropdownAdmin() after the table is loaded
// ===================================================================

// Global variables for RatingAdmin column visibility
var mandatoryColumnsAdmin = [];
var optionalColumnsAdmin = [];

// Initialize column visibility dropdown for RatingAdmin page
function InitializeColumnVisibilityDropdownAdmin() {
    console.log('InitializeColumnVisibilityDropdownAdmin started');
    
    var $dropdown = $('#ddlColumnVisibilityAdmin');
    
    if ($dropdown.length === 0) {
        console.error('Column visibility dropdown not found');
        return;
    }
    
    console.log('Column visibility dropdown found, loading configuration...');
    
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating/GetColumnConfiguration?PageType=RatingAdmin";
    
    $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        url: apiPath,
        headers: CommonGetHeaderInfo(),
        success: function (response) {
            if (response && response.Success && response.Result && response.Result.length > 0) {
                var columns = response.Result;
                
                // Clear dropdown
                $dropdown.empty();
                mandatoryColumnsAdmin = [];
                optionalColumnsAdmin = [];
                
                // Populate dropdown with columns
                $.each(columns, function(index, column) {
                    var isOptional = column.IsOptional === true || column.IsOptional === 1;
                    
                    // Create option
                    var $option = $('<option></option>')
                        .attr('value', column.ColumnId)
                        .attr('data-columnid', column.ColumnId)
                        .attr('data-column-index', column.ColumnIndex)
                        .attr('data-is-optional', isOptional ? '1' : '0')
                        .text(column.ColumnName);
                    
                    // Disable non-optional columns (they cannot be hidden)
                    if (!isOptional) {
                        $option.prop('disabled', true);
                        mandatoryColumnsAdmin.push(column.ColumnId);
                    } else {
                        optionalColumnsAdmin.push(column.ColumnId);
                    }
                    
                    $dropdown.append($option);
                });
                
                // Load user preferences and select columns
                LoadUserColumnPreferencesAdmin();
                
                // Initialize multiselect
                $dropdown.multiselect({
                    includeSelectAllOption: true,
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
                        var isOptional = $option.attr('data-is-optional') === 'true' || $option.attr('data-is-optional') === '1';
                        
                        // Prevent unchecking mandatory columns (though they should be disabled)
                        if (!checked && !isOptional) {
                            toastr.warning('This column is mandatory and cannot be hidden.');
                            $option.prop('selected', true);
                            $dropdown.multiselect('refresh');
                            return false;
                        }
                        
                        // Check if trying to deselect when only mandatory columns are left
                        var selectedCount = $('#ddlColumnVisibilityAdmin option:selected').length;
                        var mandatoryCount = mandatoryColumnsAdmin.length;
                        
                        if (!checked && selectedCount <= mandatoryCount) {
                            toastr.warning('At least one optional column must be visible (mandatory columns are always shown).');
                            $option.prop('selected', true);
                            $dropdown.multiselect('refresh');
                            return false;
                        }
                        
                        // Update table visibility
                        UpdateTableColumnVisibilityAdmin();
                        
                        // Save preferences to backend
                        SaveColumnPreferencesAdmin();
                    },
                    onSelectAll: function () {
                        UpdateTableColumnVisibilityAdmin();
                        SaveColumnPreferencesAdmin();
                    },
                    onDeselectAll: function() {
                        toastr.warning('Cannot hide all columns. Mandatory columns must remain visible.');
                        // Keep mandatory columns selected
                        $.each(mandatoryColumnsAdmin, function(index, columnId) {
                            $('#ddlColumnVisibilityAdmin option[value="' + columnId + '"]').prop('selected', true);
                        });
                        // Also select first optional column
                        if (optionalColumnsAdmin.length > 0) {
                            $('#ddlColumnVisibilityAdmin option[value="' + optionalColumnsAdmin[0] + '"]').prop('selected', true);
                        }
                        $dropdown.multiselect('refresh');
                        
                        UpdateTableColumnVisibilityAdmin();
                        SaveColumnPreferencesAdmin();
                        return false;
                    }
                });
                
                console.log('Column visibility dropdown initialized successfully');
            }
        },
        error: function (error) {
            console.error('Error loading column configuration:', error);
            toastr.error('Failed to load column configuration');
        }
    });
}

// Load user's saved column preferences for RatingAdmin
function LoadUserColumnPreferencesAdmin() {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating/GetUserColumnPreferences?EmployeeId=" + sessionStorage.EmployeeId + "&PageType=RatingAdmin";
    
    $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        url: apiPath,
        headers: CommonGetHeaderInfo(),
        success: function (response) {
            if (response && response.Success && response.Result && response.Result.length > 0) {
                var preferences = response.Result;
                
                // Select columns based on user preferences
                $.each(preferences, function(index, pref) {
                    var isVisible = pref.IsVisible === true || pref.IsVisible === 1;
                    var $option = $('#ddlColumnVisibilityAdmin option[value="' + pref.ColumnId + '"]');
                    
                    if ($option.length > 0) {
                        $option.prop('selected', isVisible);
                    }
                });
                
                // Refresh multiselect and update table
                $('#ddlColumnVisibilityAdmin').multiselect('refresh');
                UpdateTableColumnVisibilityAdmin();
            }
        },
        error: function (error) {
            console.error('Error loading user preferences:', error);
            // On error, select only mandatory columns
            $('#ddlColumnVisibilityAdmin option').prop('selected', false);
            $.each(mandatoryColumnsAdmin, function(index, columnId) {
                $('#ddlColumnVisibilityAdmin option[value="' + columnId + '"]').prop('selected', true);
            });
            $('#ddlColumnVisibilityAdmin').multiselect('refresh');
            UpdateTableColumnVisibilityAdmin();
        }
    });
}

// Save user's column preferences to backend for RatingAdmin
function SaveColumnPreferencesAdmin() {
    var selectedOptions = $('#ddlColumnVisibilityAdmin option:selected');
    var selectedColumnIds = [];
    
    // Only save optional columns (exclude disabled mandatory columns)
    $.each(selectedOptions, function(index, option) {
        var $option = $(option);
        var isOptional = $option.attr('data-is-optional') === 'true' || $option.attr('data-is-optional') === '1';
        
        // Only include optional columns in preferences
        if (isOptional) {
            var columnId = $option.attr('data-columnid') || $option.val();
            selectedColumnIds.push(columnId);
        }
    });
    
    console.log('Saving optional column preferences (Admin):', selectedColumnIds);
    
    // If no optional columns selected, don't save (user has only mandatory columns visible)
    if (selectedColumnIds.length === 0) {
        console.log('No optional columns selected, skipping save');
        return;
    }
    
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating/SaveUserColumnPreferences?EmployeeId=" + sessionStorage.EmployeeId + "&PageType=RatingAdmin";
    
    var headerInfo = CommonGetHeaderInfo();
    
    // Convert array to comma-separated string and wrap in quotes for [FromBody] string parameter
    var columnIdsString = selectedColumnIds.join(',');
    console.log('Sending column IDs string (Admin):', columnIdsString);
    
    $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'POST',
        url: apiPath,
        headers: headerInfo,
        data: JSON.stringify(columnIdsString),
        success: function (response) {
            console.log('Save preferences response (Admin):', response);
            if (response && response.Success) {
                // Silent success - don't show toastr for every change
                console.log('Column preferences updated successfully (Admin)');
            } else {
                console.error('Failed to save preferences (Admin):', response);
                toastr.error('Failed to save column preferences');
            }
        },
        error: function (xhr, statusText, errorThrown) {
            console.error('Error saving preferences (Admin):', xhr.status, statusText, errorThrown);
            
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

// Update table column visibility based on dropdown selection for RatingAdmin
function UpdateTableColumnVisibilityAdmin() {
    var table = $('#tblHRBPAdminView').DataTable();
    
    if (!table) {
        console.log('Table not found, skipping column visibility update');
        return;
    }

    var selectedOptions = $('#ddlColumnVisibilityAdmin option:selected');
    
    // Validate minimum column selection
    if (selectedOptions.length < 1) {
        toastr.warning('At least one column must be visible.');
        return;
    }
    
    // Get selected column indexes from data attributes
    var selectedIndexes = [];
    $.each(selectedOptions, function(index, option) {
        var columnIndex = parseInt($(option).attr('data-column-index'));
        if (!isNaN(columnIndex)) {
            selectedIndexes.push(columnIndex);
        }
    });
    
    console.log('Selected column indexes (Admin):', selectedIndexes);
    
    // Update visibility for all columns (0-19 for RatingAdmin)
    for (var i = 0; i <= 19; i++) {
        var column = table.column(i);
        if (column && column.visible) {
            var shouldBeVisible = selectedIndexes.indexOf(i) !== -1;
            column.visible(shouldBeVisible);
        }
    }
}

// ===================================================================
// INTEGRATION INSTRUCTIONS:
// 1. Add these functions to RatingAdmin.js file
// 2. Call InitializeColumnVisibilityDropdownAdmin() after tblHRBPAdminView DataTable is initialized
// 3. Add this line after the DataTable initialization (around line 5985 in RatingAdmin.js):
//    InitializeColumnVisibilityDropdownAdmin();
// ===================================================================
