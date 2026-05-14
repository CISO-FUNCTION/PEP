// ========================================
// RATINGADMIN COLUMN VISIBILITY FUNCTIONS
// ========================================
// Copy these functions to PEP/Scripts/PEPScripts/RatingAdmin.js
// Then add the initialization call after tblHRBPAdminView DataTable is created

// Global variables for mandatory and optional columns
var mandatoryColumnsAdmin = [0, 1]; // EmployeeId and Employee Name are mandatory
var optionalColumnsAdmin = [];

// ========================================
// FUNCTION 1: Initialize Column Visibility Dropdown
// ========================================
function InitializeColumnVisibilityDropdownAdmin() {
    // Get column configuration from API
    $.ajax({
        url: '/api/Rating/GetColumnConfiguration?PageType=RatingAdmin',
        type: 'GET',
        headers: CommonGetHeaderInfo(),
        success: function (response) {
            if (response && response.length > 0) {
                var dropdownOptions = [];
                
                response.forEach(function (column) {
                    dropdownOptions.push({
                        label: column.ColumnName,
                        value: column.ColumnId,
                        title: column.ColumnName,
                        disabled: !column.IsOptional // Disable mandatory columns
                    });
                    
                    // Track optional columns for validation
                    if (column.IsOptional) {
                        optionalColumnsAdmin.push(column.ColumnId);
                    }
                });
                
                // Initialize bootstrap multiselect
                $('#ddlColumnVisibilityAdmin').multiselect({
                    enableFiltering: true,
                    enableCaseInsensitiveFiltering: true,
                    includeSelectAllOption: true,
                    selectAllText: 'Select All',
                    nonSelectedText: 'Select Columns',
                    numberDisplayed: 2,
                    maxHeight: 400,
                    buttonWidth: '100%',
                    templates: {
                        filter: '<li class="multiselect-item filter"><div class="input-group"><input class="form-control multiselect-search" type="text" placeholder="Search columns..."></div></li>',
                        filterClearBtn: '<span class="input-group-btn"><button class="btn btn-default multiselect-clear-filter" type="button"><i class="glyphicon glyphicon-remove-circle"></i></button></span>'
                    },
                    onChange: function (option, checked, select) {
                        // Prevent unchecking mandatory columns
                        var columnId = parseInt($(option).val());
                        if (mandatoryColumnsAdmin.indexOf(columnId) !== -1 && !checked) {
                            return false;
                        }
                        
                        // Get all selected column IDs
                        var selectedColumns = $('#ddlColumnVisibilityAdmin').val() || [];
                        
                        // Validate at least one optional column is selected
                        var hasOptionalSelected = selectedColumns.some(function (id) {
                            return optionalColumnsAdmin.indexOf(parseInt(id)) !== -1;
                        });
                        
                        if (!hasOptionalSelected && optionalColumnsAdmin.length > 0) {
                            alert('At least one optional column must be visible.');
                            return false;
                        }
                        
                        // Update table visibility
                        UpdateTableColumnVisibilityAdmin();
                        
                        // Save preferences
                        SaveColumnPreferencesAdmin();
                    },
                    onSelectAll: function () {
                        UpdateTableColumnVisibilityAdmin();
                        SaveColumnPreferencesAdmin();
                    },
                    onDeselectAll: function () {
                        // Don't allow deselecting all - keep mandatory columns
                        var mandatoryValues = mandatoryColumnsAdmin.map(function (colIndex) {
                            return $('#ddlColumnVisibilityAdmin option').filter(function () {
                                var colId = parseInt($(this).val());
                                return mandatoryColumnsAdmin.indexOf(colId) !== -1;
                            }).val();
                        });
                        $('#ddlColumnVisibilityAdmin').multiselect('select', mandatoryValues);
                        
                        UpdateTableColumnVisibilityAdmin();
                        SaveColumnPreferencesAdmin();
                    }
                });
                
                // Populate dropdown options
                $('#ddlColumnVisibilityAdmin').empty();
                dropdownOptions.forEach(function (option) {
                    var optionElement = $('<option></option>')
                        .val(option.value)
                        .text(option.label)
                        .attr('title', option.title);
                    
                    if (option.disabled) {
                        optionElement.prop('disabled', true);
                    }
                    
                    $('#ddlColumnVisibilityAdmin').append(optionElement);
                });
                
                $('#ddlColumnVisibilityAdmin').multiselect('rebuild');
                
                // Load user preferences
                LoadUserColumnPreferencesAdmin();
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading column configuration:', error);
        }
    });
}

// ========================================
// FUNCTION 2: Load User Column Preferences
// ========================================
function LoadUserColumnPreferencesAdmin() {
    var employeeId = $('#hdnLoginEmpID').val();
    
    if (!employeeId) {
        console.error('Employee ID not found');
        return;
    }
    
    $.ajax({
        url: '/api/Rating/GetUserColumnPreferences?EmployeeId=' + employeeId + '&PageType=RatingAdmin',
        type: 'GET',
        headers: CommonGetHeaderInfo(),
        success: function (response) {
            if (response && response.length > 0) {
                var visibleColumnIds = [];
                
                response.forEach(function (column) {
                    if (column.IsVisible) {
                        visibleColumnIds.push(column.ColumnId);
                    }
                });
                
                // Set selected values in multiselect
                $('#ddlColumnVisibilityAdmin').multiselect('select', visibleColumnIds);
                
                // Update table column visibility based on preferences
                UpdateTableColumnVisibilityAdmin();
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading user preferences:', error);
            
            // If error, select all mandatory columns by default
            var mandatoryColumnIds = [];
            $('#ddlColumnVisibilityAdmin option:disabled').each(function () {
                mandatoryColumnIds.push(parseInt($(this).val()));
            });
            $('#ddlColumnVisibilityAdmin').multiselect('select', mandatoryColumnIds);
            UpdateTableColumnVisibilityAdmin();
        }
    });
}

// ========================================
// FUNCTION 3: Save Column Preferences
// ========================================
function SaveColumnPreferencesAdmin() {
    var employeeId = $('#hdnLoginEmpID').val();
    var selectedColumnIds = $('#ddlColumnVisibilityAdmin').val() || [];
    
    if (!employeeId) {
        console.error('Employee ID not found');
        return;
    }
    
    // Filter out mandatory columns - only save optional columns
    var optionalSelectedIds = selectedColumnIds.filter(function (id) {
        var colId = parseInt(id);
        return mandatoryColumnsAdmin.indexOf(colId) === -1;
    });
    
    // Convert to comma-separated string
    var visibleColumnIds = optionalSelectedIds.join(',');
    
    $.ajax({
        url: '/api/Rating/SaveUserColumnPreferences?EmployeeId=' + employeeId + '&PageType=RatingAdmin',
        type: 'POST',
        headers: CommonGetHeaderInfo(),
        contentType: 'application/json',
        data: JSON.stringify(visibleColumnIds),
        success: function (response) {
            console.log('Column preferences saved successfully');
        },
        error: function (xhr, status, error) {
            // Handle 401 Unauthorized gracefully
            if (xhr.status === 401) {
                console.warn('Session expired. Preferences not saved.');
            } else {
                console.error('Error saving column preferences:', error);
            }
        }
    });
}

// ========================================
// FUNCTION 4: Update Table Column Visibility
// ========================================
function UpdateTableColumnVisibilityAdmin() {
    if (!window.tblHRBPAdminView) {
        console.error('tblHRBPAdminView DataTable not initialized');
        return;
    }
    
    var selectedColumnIds = $('#ddlColumnVisibilityAdmin').val() || [];
    
    // Get the mapping of ColumnId to ColumnIndex from the dropdown options
    var columnMapping = {};
    $('#ddlColumnVisibilityAdmin option').each(function () {
        var columnId = parseInt($(this).val());
        var columnIndex = $(this).index();
        columnMapping[columnId] = columnIndex;
    });
    
    // Update visibility for all columns (0-19 for RatingAdmin)
    for (var i = 0; i <= 19; i++) {
        var columnId = null;
        
        // Find the ColumnId for this column index
        for (var id in columnMapping) {
            if (columnMapping[id] === i) {
                columnId = parseInt(id);
                break;
            }
        }
        
        if (columnId !== null) {
            var isVisible = selectedColumnIds.indexOf(columnId.toString()) !== -1;
            
            // Mandatory columns always visible
            if (mandatoryColumnsAdmin.indexOf(i) !== -1) {
                isVisible = true;
            }
            
            try {
                var column = window.tblHRBPAdminView.column(i);
                if (column) {
                    column.visible(isVisible);
                }
            } catch (e) {
                console.warn('Error setting visibility for column ' + i + ':', e);
            }
        }
    }
}

// ========================================
// INTEGRATION INSTRUCTIONS
// ========================================
/*
 * TO INTEGRATE INTO RatingAdmin.js:
 * 
 * 1. Copy all 4 functions above (InitializeColumnVisibilityDropdownAdmin, 
 *    LoadUserColumnPreferencesAdmin, SaveColumnPreferencesAdmin, 
 *    UpdateTableColumnVisibilityAdmin) and the global variables
 * 
 * 2. Paste them at the end of the RatingAdmin.js file
 * 
 * 3. Find where tblHRBPAdminView DataTable is initialized (around line 5985)
 *    Look for this pattern:
 *    
 *    window.tblHRBPAdminView = $('#tblHRBPAdminView').DataTable({
 *        // ... configuration ...
 *        drawCallback: function (settings) {
 *            // ... existing code ...
 *        }
 *    });
 * 
 * 4. After the DataTable initialization, add this line:
 *    
 *    // Initialize column visibility dropdown for RatingAdmin
 *    InitializeColumnVisibilityDropdownAdmin();
 * 
 * 5. The complete integration should look like:
 *    
 *    window.tblHRBPAdminView = $('#tblHRBPAdminView').DataTable({
 *        // ... existing DataTable configuration ...
 *    });
 *    
 *    // Initialize column visibility dropdown for RatingAdmin
 *    InitializeColumnVisibilityDropdownAdmin();
 * 
 * 6. Save the file and test
 */
