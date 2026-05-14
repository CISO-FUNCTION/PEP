$(document).ready(function () {

    $('#ddlMgrGOFS').select2({
        placeholder: "Select an option",
        allowClear: true,
        dropdownParent: $('#divSelectMgrGOFS')
    });
    $('#ddlMgrListForKRA').select2({
        placeholder: "Select an option",
        allowClear: true
        
    });
    $('#ddlEmpGOFS').select2({
        placeholder: "Select an option",
        allowClear: true

    });
    $('#ddlMgrListForKRA').select2({
        placeholder: "Select an option",
        allowClear: true,
        dropdownParent: $('#divSelectMgrFB')
    });
    $('#ddlEmpForKRA').select2({
        placeholder: "Select an option",
        allowClear: true

    });
    
    

    $('#DivManagerStatusReport').show();
    $('#DivKRAReport').show();

        
    GetAllActiveAppraisalCycle();
    // GetSubActiveAppraisalCycle(0); // Removed - dropdown doesn't exist yet

    $('#ddlEmpListForfeedback').select2({
        placeholder: "Select an option",
        allowClear: true

    });
    if (sessionStorage.EmployeeRoleId == 1) {
        window.location.href = "/Error/NotAuthorized";
    } else {

        if (sessionStorage.EmployeeRoleId == 5) {
            var newOption1 = '<option value="#divWeightage"> Weighted Score Calculation Report </option>';
            $('#ddlReport').append(newOption1);
            var newOption2 = '<option value="#divFBReport">Feedback Report</option>';
            $('#ddlReport').append(newOption2);
            var newOption6 = '<option value="#divFBSelfAssetmentStatusReport">Feedback & SelfAssessment Status Report</option>';
            $('#ddlReport').append(newOption6);
            var newOption3 = '<option value="#divRatingCalReport">Rating Calculation Report</option>';
            $('#ddlReport').append(newOption3);
            var newOption5 = '<option value="#divDUWiseManagerFeedbackReport">DUWise Manager Feedback Report</option>';
            $('#ddlReport').append(newOption5);
            var newOption6 = '<option value="#divFBReportEmpWise">Employee Wise Feedback Report</option>';
            $('#ddlReport').append(newOption6);
            var newOption9 = '<option value="#divGoalModificationSummary">Goal Modification Summary</option>';
            $('#ddlReport').append(newOption9);
            var newOption8 = '<option value="#divTrainingRequestReport">Training Request Report</option>';
            $('#ddlReport').append(newOption8);
            var newOption7 = '<option value="#divGOFSReport">G&O Wise Feedback & SelfAssessment Report</option>';
            $('#ddlReport').append(newOption7);
        }
        if (sessionStorage.EmployeeRoleId == 7) {
            var newOption5 = '<option value="#divDUWiseManagerFeedbackReport">DUWise Manager Feedback Report</option>';
            $('#ddlReport').append(newOption5);
        }

        if (sessionStorage.EmployeeRoleId == 3) {
            $("#ddlReport option[value='#divFBReport']").remove();

            var newOption9 = '<option value="#divTrainingRequestReportForManager">Training Request Report</option>';
            $('#ddlReport').append(newOption9);
        }

        if (sessionStorage.EmployeeRoleId == 4) {

            var newOptionLoca = '<option value="#divFBReport">Feedback Report</option>';
            $('#ddlReport').append(newOptionLoca);
            var newOption9 = '<option value="#divGoalModificationSummary">Goal Modification Summary</option>';
            $('#ddlReport').append(newOption9);
        }



        $("#ddlReport").change(function () {
            clearControls();

            hideControls();
            var reportType = $("#ddlReport").val();

            if (reportType == 0) {
                $("#ddlReport").focus();
                hideControls();
                $("#AppcycleDiv").hide();
                alert('Select a Report');
            }
            if (reportType == '#divManagerStatus') {
                ALLReport();
                $("#AppcycleDiv").show();

                if (sessionStorage.EmployeeRoleId == 3) {


                    $("#ddlMgrDiv").hide();
                    GetStatus();
                }
                else {
                    GetMgr('Select', ddlMgrList);
                    GetStatus();
                }

                
                $("#divManagerStatus").show();

                var appraisalCycleId = $('#ddlRptAppCycle :selected').val();
                
                if (!appraisalCycleId || appraisalCycleId == 0) {
                    $('#ddlHalfAppCycle').empty();
                    $('#ddlHalfAppCycle').append($("<option>").val(0).text("--Select--"));
                    return;
                }

                var svrPath = CONFIG.get('SERVERNAME');
                var apiPath = svrPath + 'AppraisalCycle/GetSelfAssesmentCycle?AppCycleId=' + appraisalCycleId;
                
                // Use .done() to handle the async response properly
                CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (data) {
                    if (data.Success == false) {
                        console.error('GetSelfAssesmentCycle: API returned Success=false', data);
                $('#ddlHalfAppCycle').empty();
                $('#ddlHalfAppCycle').append($("<option>").val(0).text("--Select--"));
                        return;
                    }
                    
                    // Handle both array and object responses
                    var resultArray = null;
                    
                    if (Array.isArray(data.Result)) {
                        resultArray = data.Result;
                    } else if (data.Result && typeof data.Result === 'object') {
                        if (data.Result.Table1 && Array.isArray(data.Result.Table1)) {
                            resultArray = data.Result.Table1;
                        } else if (data.Result.data && Array.isArray(data.Result.data)) {
                            resultArray = data.Result.data;
                        } else if (data.Result.Tables && Array.isArray(data.Result.Tables) && data.Result.Tables.length > 0 && Array.isArray(data.Result.Tables[0])) {
                            resultArray = data.Result.Tables[0];
                        } else {
                            for (var key in data.Result) {
                                if (Array.isArray(data.Result[key])) {
                                    resultArray = data.Result[key];
                                    break;
                                }
                            }
                        }
                    }
                    
                    if (!resultArray || !Array.isArray(resultArray) || resultArray.length === 0) {
                        console.error('GetSelfAssesmentCycle: Could not find valid array in data.Result', data);
                        $('#ddlHalfAppCycle').empty();
                        $('#ddlHalfAppCycle').append($("<option>").val(0).text("--Select--"));
                        return;
                    }
                    
                    $('#ddlHalfAppCycle').empty();
                    $('#ddlHalfAppCycle').append($("<option>").val(0).text("--Select--"));
                    $.each(resultArray, function (index, item) {
                        var value = item.AppraisalCycleId || item.Id || item.YearBreakCheck || item.value;
                        var text = item.AppraisalCycleName || item.Name || item.text;
                        if (value && text) {
                            $('#ddlHalfAppCycle').append($("<option>").val(value).text(text));
                        }
                    });
                }).fail(function(xhr, status, error) {
                    console.error('GetSelfAssesmentCycle: AJAX error', error);
                    $('#ddlHalfAppCycle').empty();
                    $('#ddlHalfAppCycle').append($("<option>").val(0).text("--Select--"));
                });



            }
            if (reportType == '#divEmpStrengthWeakness') {
                $("#AppcycleDiv").show();
                $("#divSelectMgr").show();
                $("#ddlEmp").empty();
                GetMgr('Select', ddlMgrEmpSW);
                if (sessionStorage.EmployeeRoleId == 3) {

                    GetSubByMgr('All', ddlEmp);
                    $("#divSelectMgr").hide();
                }


                $("#divEmpStrengthWeakness").show();
            }

            if (reportType == '#divKRADefaulterEmployee') {
                ALLReport();
                $("#AppcycleDiv").show();

                $("#divMrKRA").show();
                $("#ddlMgrListForKRA").empty();
                GetMgr('Select', ddlMgrListForKRA);

                $("#divKRADefaulterEmployee").show();
                if (sessionStorage.EmployeeRoleId == 3) {
                    $("#ddlMgrListForKRA").hide();
                    $("#spnManagerKRA").hide();
                    $("#btnEditTemplate").hide();
                    $("#divSelectMgrFB").hide();
                    GetSubByMgr('All', ddlEmpForKRA)

                }
                else {
                    $("#ddlMgrListForKRA").show();
                    $("#spnManagerKRA").show();
                    $("#btnEditTemplate").show();
                    $("#divSelectMgrFB").show();

                }
            }
    
            if (reportType == '#divWeightage') {

                $('#divWeightageCalculation').show();
                GetMgr('Select', ddlMgrWeightageCalculation);

                // GetSubByMgr('All', ddlEmpWeightageCalculation);
                $("#divWeightage").show();

            }
            if (reportType == '#divGOFSReport') {
                GetAllActiveAppraisalCycle()
                //location.reload();
               // $('#ddlReport').val('#divGOFSReport').trigger('change');
                $("#AppcycleDiv").show();
                $('#divGOFS').show();
                $('#ddlEmpGOFS').empty();
                GetMgr('Select',ddlMgrGOFS);

                // Populate sub-cycle dropdown if appraisal cycle is already selected
                var selectedCycleId = $('#ddlRptAppCycle :selected').val();
                if (selectedCycleId && selectedCycleId != 0) {
                    GetSubActiveAppraisalCycle(selectedCycleId);
                }

                // GetSubByMgr('All', ddlEmpWeightageCalculation);
                $("#divGOFSReport").show();

            }
            if (reportType == '#divMSChart') {

                $("#AppcycleDiv").show();

                if (sessionStorage.EmployeeRoleId == 3) {
                    $("#divSelectMgrFB").hide();
                }
                else {
                    GetMgr('Select', ddlMgrMSChart);
                }
                $("#divMSChart").show();
            }

            if (reportType == '#divFBSelfAssetmentStatusReport') {

                $("#AppcycleDiv").show();

                $("#divFBSelfAssetmentStatusReport").show();

                var appraisalCycleId = $('#ddlRptAppCycle :selected').val()

                var svrPath = CONFIG.get('SERVERNAME');
                var apiPath = svrPath + 'AppraisalCycle/GetSelfAssesmentCycle?AppCycleId=' + appraisalCycleId;
                var AppraisalCycle = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
                $('#ddlHalfAppCycle1').empty();
                $('#ddlHalfAppCycle1').append($("<option>").val(0).text("--Select--"));
                $.each(AppraisalCycle.responseJSON.Result.data, function (index, data) {
                    $('#ddlHalfAppCycle1').append($("<option>").val(data.AppraisalCycleId).text(data.AppraisalCycleName));

                    // $('#ddlHalfAppCycle1').append($("<option>").val(data.YearBreakCheck).text(data.AppraisalCycleName));
                });


            }


            if (reportType == '#divFBReport') {


                $("#AppcycleDiv").hide();

                $('#divFBReport').show();
                $(".KRADatePicks").datepicker({
                    dateFormat: "dd-mm-yy", changeMonth: true,
                    changeYear: true
                }).datepicker("setDate", "0");
                $(".KRADatePicks").datepicker({
                    format: 'dd-MM-yyyy',
                    autoclose: true,
                    changeMonth: true,
                    changeYear: true
                }).datepicker("setDate", "0");

                var dt = new Date();
                $('#dtFromFBReport').val(formatDate_DMY(dt));
                $('#dtToFBReport').val(formatDate_DMY(dt));

            }

            if (reportType == '#divFBReportEmpWise') {

                //var appraisalCycleId = $('#ddlRptAppCycle :selected').val()
                $("#AppcycleDiv").hide();

                $(".KRADatePicks").datepicker({
                    dateFormat: "dd-mm-yy", changeMonth: true,
                    changeYear: true
                }).datepicker("setDate", "0");
                $(".KRADatePicks").datepicker({
                    format: 'dd-mm-yy',
                    autoclose: true,
                    changeMonth: true,
                    changeYear: true
                }).datepicker("setDate", "0");

                GetMgr('Select', ddlEmpListForfeedback);
                var dt = new Date();
                $('#dtFromFBReport').val(formatDate_DMY(dt));
                $('#dtToFBReport').val(formatDate_DMY(dt));
                $("#divFBReportEmpWise").show();

            }
            else {
                $("#divFBReportEmpWise").hide();
            }


            if (reportType == '#divRatingCalReport') {
                $("#AppcycleDiv").show();
                $('#divRatingCalculation').show();
                GetMgr('Select', ddlMgrRatingCalculation);
                $("#divRatingCalReport").show();
            }
            if (reportType == '#divDUWiseManagerFeedbackReport') {
                $("#AppcycleDiv").show();

                if (sessionStorage.EmployeeRoleId == 5) {
                    //$("#divDWRpt_DU").hide();
                    GetDU('#ddlDWRpt_DU');
                }
                else {
                    $("#ddlDWRpt_DU").show();
                    GetDU('#ddlDWRpt_DU');
                }
                $("#divDUWiseManagerFeedbackReport").show();
                $("#btnGetDWRpt").click();
            }
            
            if (reportType == '#divGoalModificationSummary') {
                $("#AppcycleDiv").show();
                
                $(".KRADatePicks").datepicker({
                    dateFormat: "dd-mm-yy",
                    changeMonth: true,
                    changeYear: true,
                    autoclose: true
                });
                
                $("#divGoalModificationSummary").show();
            }

            if (reportType == '#divGoalModificationSummaryForManager') {
                $("#AppcycleDiv").show();
                
                $(".KRADatePicks").datepicker({
                    dateFormat: "dd-mm-yy",
                    changeMonth: true,
                    changeYear: true,
                    autoclose: true
                });
                
                $("#divGoalModificationSummaryForManager").show();
            }

            if (reportType == '#divTrainingRequestReport') {
                $("#AppcycleDiv").show();
                $("#divTrainingRequestReport").show();
                $("#DivTrainingRequestReport").show(); // Show the button container
                // Clear any existing data
                $('#tblTrainingRequestReport tbody').empty();
            }

            if (reportType == '#divTrainingRequestReportForManager') {
                $("#AppcycleDiv").show();
                $("#divTrainingRequestReportForManager").show();
                $("#DivTrainingRequestReportForManager").show(); // Show the button container
                // Clear any existing data
                $('#tblTrainingRequestReportForManager tbody').empty();
            }

            if (reportType == '#divNormalizationReport') {
                $("#AppcycleDiv").show();
                $("#divNormalizationReport").show();
                $("#DivNormalizationReportButtons").show();
                
                // Style the loader to be smaller
                $('#imgLoadNormalization').css({
                    'width': '50px',
                    'height': '50px',
                    'display': 'none',
                    'margin': '20px auto'
                });
                
                // Initialize table if needed
                if (!$.fn.DataTable.isDataTable('#tblNormalizationReport')) {
                    $('#tblNormalizationReport').DataTable({
                        data: [],
                        columns: [
                            { data: "Emp ID", defaultContent: "", title: "Emp ID" },
                            { data: "Emp Name", defaultContent: "", title: "Emp Name" },
                            { data: "Grade", defaultContent: "", title: "Grade" },
                            { data: "Past RMs", defaultContent: "", title: "Past RMs" },
                            { data: "Group Account", defaultContent: "", title: "Group Account" },
                            { data: "Talent Cube", defaultContent: "", title: "Talent Cube" },
                            { data: "Location", defaultContent: "", title: "Location" },
                            { data: "Gender", defaultContent: "", title: "Gender" },
                            { data: "Total Exp.", defaultContent: "", title: "Total Exp." },
                            { data: "Infogain Exp.", defaultContent: "", title: "Infogain Exp." },
                            { data: "FY-24 Rating", defaultContent: "", title: "FY-24 Rating" },
                            { data: "FY-25 Rating", defaultContent: "", title: "FY-25 Rating" },
                            { data: "Last Promotion Date", defaultContent: "", title: "Last Promotion Date" },
                            { data: "FY-26 Rating", defaultContent: "", title: "FY-26 Rating" },
                            { data: "FY-26 Promotion Reco.", defaultContent: "", title: "FY-26 Promotion Reco." },
                            { data: "Promotion Track", defaultContent: "", title: "Promotion Track" },
                            { data: "Reco. Designation", defaultContent: "", title: "Reco. Designation" },
                            { data: "Reco. Designation Consent", defaultContent: "", title: "Reco. Designation Consent" },
                            { data: "Criticality", defaultContent: "", title: "Criticality" },
                            { data: "Criticality Reason", defaultContent: "", title: "Criticality Reason" },
                            { data: "Attrition Risk", defaultContent: "", title: "Attrition Risk" },
                            { data: "Immediate Backup Name", defaultContent: "", title: "Immediate Backup Name" },
                            { data: "Successor Name (Long Term)", defaultContent: "", title: "Successor Name (Long Term)" },
                            { data: "Comments", defaultContent: "", title: "Comments" },
                            { data: "Action Status", defaultContent: "", title: "Action Status" }
                        ],
                        destroy: true,
                        paging: true,
                        searching: true,
                        info: true,
                        pageLength: 10,
                        lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
                        language: {
                            emptyTable: "No data available. Please select an Appraisal Cycle and click 'View Report'.",
                            zeroRecords: "No matching records found",
                            loadingRecords: "Loading...",
                            processing: "Processing..."
                        }
                    });
                } else {
                    // Clear existing data if already initialized
                    $('#tblNormalizationReport').DataTable().clear().draw();
                }
                
                // Auto-load data if Appraisal Cycle is already selected
                var appraisalCycleId = $('#ddlRptAppCycle :selected').val();
                if (appraisalCycleId && appraisalCycleId != 0) {
                    LoadNormalizationReport();
                }
            }
        });

        $("#ddlMgrList").customselect();
        $("#ddlMgrListForKRA").customselect();
    }
});

function ALLReport() {
    $('#divGOFSReport').css('display', 'none');
    $('#divKRADefaulterEmployee').css('display', 'none');
    $('#divManagerStatus').css('display', 'none');
    

}
function GetAllActiveAppraisalCycle() {

    var d = new Date();
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'AppraisalCycle/GetAllActiveAppraisalCycle';
    AppraisalCycle = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    $('#ddlRptAppCycle').empty();

    $.each(AppraisalCycle.responseJSON.Result.data, function (index, data) {

        $('#ddlRptAppCycle').append($("<option>").val(data.AppraisalCycleId).text(data.AppraisalCycleName));

    });
    //var reportType = $("#ddlReport").val();
    //if (reportType == '#divGOFSReport') {
    //    var firstAppraisalCycleId = $('#ddlRptAppCycle option:first').val();
    //    GetSubActiveAppraisalCycle(firstAppraisalCycleId);
    //}
}
function GetSubActiveAppraisalCycle(appraisalCycleId) {

    var appraisalCycleId = $('#ddlRptAppCycle :selected').val()

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'AppraisalCycle/GetGOSelfAssesmentCycle?AppCycleId=' + appraisalCycleId;
    var AppraisalCycle = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    $('#ddlCBGOFS').empty();
    $('#ddlCBGOFS').append($("<option>").val(0).text("--Select--"));
    $('#ddlCBGOFS').append($("<option>").val(-1).text("All"));
    if (AppraisalCycle.responseJSON && AppraisalCycle.responseJSON.Result) {
        $.each(AppraisalCycle.responseJSON.Result, function (index, data) {
            $('#ddlCBGOFS').append($("<option>").val(data.AppraisalCycleId).text(data.AppraisalCycleName));
        });
    }

}

$('#ddlRptAppCycle').change(function (e) {
    var reportType = $("#ddlReport").val();
    if (reportType == '#divGOFSReport') {
        var appraisalCycleId = $('#ddlRptAppCycle :selected').val()

        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + 'AppraisalCycle/GetGOSelfAssesmentCycle?AppCycleId=' + appraisalCycleId;
        var AppraisalCycle = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
        $('#ddlCBGOFS').empty();
        $('#ddlCBGOFS').append($("<option>").val(0).text("--Select--"));
        $('#ddlCBGOFS').append($("<option>").val(-1).text("All"));
        $.each(AppraisalCycle.responseJSON.Result, function (index, data) {
            $('#ddlCBGOFS').append($("<option>").val(data.AppraisalCycleId).text(data.AppraisalCycleName));
        });
    }

    var appraisalCycleId = $('#ddlRptAppCycle :selected').val();
    
    if (!appraisalCycleId || appraisalCycleId == 0) {
        $('#ddlHalfAppCycle').empty();
        $('#ddlHalfAppCycle').append($("<option>").val(0).text("--Select--"));
        $('#ddlHalfAppCycle1').empty();
        $('#ddlHalfAppCycle1').append($("<option>").val(0).text("--Select--"));
        return;
    }

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'AppraisalCycle/GetSelfAssesmentCycle?AppCycleId=' + appraisalCycleId;
    
    // Use .done() to handle the async response properly
    CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (data) {
        if (data.Success == false) {
            console.error('GetSelfAssesmentCycle: API returned Success=false', data);
    $('#ddlHalfAppCycle').empty();
    $('#ddlHalfAppCycle').append($("<option>").val(0).text("--Select--"));
            $('#ddlHalfAppCycle1').empty();
            $('#ddlHalfAppCycle1').append($("<option>").val(0).text("--Select--"));
            return;
        }
        
        // Handle both array and object responses
        var resultArray = null;
        
        if (Array.isArray(data.Result)) {
            resultArray = data.Result;
        } else if (data.Result && typeof data.Result === 'object') {
            // Check for common DataSet serialization formats
            if (data.Result.Table1 && Array.isArray(data.Result.Table1)) {
                resultArray = data.Result.Table1;
            } else if (data.Result.data && Array.isArray(data.Result.data)) {
                resultArray = data.Result.data;
            } else if (data.Result.Tables && Array.isArray(data.Result.Tables) && data.Result.Tables.length > 0 && Array.isArray(data.Result.Tables[0])) {
                resultArray = data.Result.Tables[0];
            } else {
                // Try to find first array property
                for (var key in data.Result) {
                    if (Array.isArray(data.Result[key])) {
                        resultArray = data.Result[key];
                        break;
                    }
                }
            }
        }
        
        if (!resultArray || !Array.isArray(resultArray) || resultArray.length === 0) {
            console.error('GetSelfAssesmentCycle: Could not find valid array in data.Result', data);
            $('#ddlHalfAppCycle').empty();
            $('#ddlHalfAppCycle').append($("<option>").val(0).text("--Select--"));
            $('#ddlHalfAppCycle1').empty();
            $('#ddlHalfAppCycle1').append($("<option>").val(0).text("--Select--"));
            return;
        }
        
        // Populate ddlHalfAppCycle
        $('#ddlHalfAppCycle').empty();
        $('#ddlHalfAppCycle').append($("<option>").val(0).text("--Select--"));
        $.each(resultArray, function (index, item) {
            // Handle different property names that might be used
            var value = item.AppraisalCycleId || item.Id || item.YearBreakCheck || item.value;
            var text = item.AppraisalCycleName || item.Name || item.text;
            if (value && text) {
                $('#ddlHalfAppCycle').append($("<option>").val(value).text(text));
            }
        });

        // Populate ddlHalfAppCycle1 for FBSelfAssetmentStatusReport
    var reportType = $("#ddlReport").val();
        if (reportType == '#divFBSelfAssetmentStatusReport') {
        $('#ddlHalfAppCycle1').empty();
        $('#ddlHalfAppCycle1').append($("<option>").val(0).text("--Select--"));
            $.each(resultArray, function (index, item) {
                var value = item.AppraisalCycleId || item.Id || item.YearBreakCheck || item.value;
                var text = item.AppraisalCycleName || item.Name || item.text;
                if (value && text) {
                    $('#ddlHalfAppCycle1').append($("<option data-YearBreakCheck='" + item.YearBreakCheck + "'>").val(value).text(text));
                }
            });
        }
        
        // Auto-load Normalization Report if it's currently selected
        if (reportType == '#divNormalizationReport') {
            LoadNormalizationReport();
        }
    }).fail(function(xhr, status, error) {
        console.error('GetSelfAssesmentCycle: AJAX error', error);
        $('#ddlHalfAppCycle').empty();
        $('#ddlHalfAppCycle').append($("<option>").val(0).text("--Select--"));
        $('#ddlHalfAppCycle1').empty();
        $('#ddlHalfAppCycle1').append($("<option>").val(0).text("--Select--"));
    });

});


function formatDate_DMYReport(date) {

    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [month, day, year].join('/');
}

//var svrPath = CONFIG.get('SERVERNAME');
//var apiPath = svrPath + 'AppraisalCycle/GetAllActiveAppraisalCycle';
//AppraisalCycle = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
//$('#AppCycle').empty();

//var CycleEndDate = '';
//$.each(AppraisalCycle.responseJSON.Result, function (index, data) {

//    $('#AppCycle').append($("<option>").val(data.AppraisalCycleId).text(data.AppraisalCycleName));

//});

//$(".KRADatePicks").datepicker({
//    format: 'dd-MM-yyyy'
//}).datepicker("setDate", "0");

//var dt = new Date();

//$.each(AppraisalCycle.responseJSON.Result, function (index, data) {

//    if (data.AppraisalCycleId == $('#AppCycle :selected').val()) {

//        var enddate = formatDate_DMY(data.EndDate);
//        $('#txtKRAEndDate').val(enddate);
//    }

//});



function UpdateEmailFormat() {

    var Body = $('#txtbody').val();
    var svrPath = CONFIG.get('SERVERNAME');
    //var apiPath = svrPath + "EmailTemplateMaster?Id=1&Body=" + Body;
    // var Result = CommonAjaxPUT(apiPath, CommonGetHeaderInfo());
    $.ajax({
        url: svrPath + "EmailTemplateMaster/UpdateTemplate",
        type: "POST",
        data: JSON.stringify({ Id: 1, Body: $('#txtbody').val() }),
        contentType: "application/json",
        headers: CommonGetHeaderInfo(),
        success: function (response) {
            alert("Template updated successfully!");
        },
        error: function (xhr) {
            alert("Error: " + xhr.responseText);
        }
    });
}

$("#btnGetMgrStatusReport").click(function () {

    ShowMgrStatusReport();

});
$("#ddlMgrList").change(function () {
    GetStatus();

});
function hideControls() {
    $("#divManagerStatus").hide();
    $("#divEmpStrengthWeakness").hide();
    $("#divMrKRA").hide();
    $("#divMrKRA").hide();
    $('#divWeightageCalculation').hide();
    $('#divMSChart').hide();
    $('#divFBReport').hide();
    $("#divRatingCalculation").hide();
    $("#divDUWiseManagerFeedbackReport").hide();
    $("#divGoalModificationSummary").hide();
    $("#divGoalModificationSummaryForManager").hide();
    $("#divTrainingRequestReport").hide();
    $("#DivTrainingRequestReport").hide(); // Hide the button container
    $("#divTrainingRequestReportForManager").hide();
    $("#DivTrainingRequestReportForManager").hide(); // Hide the manager button container
    $("#divNormalizationReport").hide();
    $("#DivNormalizationReportButtons").hide(); // Hide the normalization report button container

    $('#divGOFSReport').hide();
    $('#divKRADefaulterEmployee').hide();
    
}

function GetMgr(startText, ddlId) {
    var appraisalCycleId = $('#ddlRptAppCycle :selected').val();//sessionStorage.AppraisalCycleId;
    var managerId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;
    var svrPath = CONFIG.get('SERVERNAME');
    var locationId = sessionStorage.LocationId;
    var role = sessionStorage.EmployeeRoleId;
    var apiPath = '';
    if (role == 5) {
        locationId = 0;
    }
    if (role == 6) {
        apiPath = svrPath + 'Team?id=' + managerId + '&AppraisalCycleId=' + appraisalCycleId + '&viewAwardsMode=';
    }
    else if (role == 7) {
        apiPath = svrPath + 'EmployeeMaster?type="A"&AppraisalCycleId=' + appraisalCycleId + '&DUId=' + sessionStorage.HRDUId;
    }
    else if (role == 4) {
        apiPath = svrPath + 'EmployeeMaster?AppraisalCycleId=' + appraisalCycleId + '&EmpLoginId=' + sessionStorage.EmployeeId + '&LocationId=' + locationId;
    }
    else {
        if (ddlId.id == "ddlEmpListForfeedback") {
            apiPath = svrPath + "EmployeeMaster";
        }
        else {
            if (ddlId.id == "ddlMgrGOFS" || ddlId.id=="ddlMgrListForKRA") {
                apiPath = svrPath + 'EmployeeMaster?LocationId=' + locationId +'&Report=GOFS';
            }
            else {
                apiPath = svrPath + 'EmployeeMaster?AppraisalCycleId=' + appraisalCycleId + '&LocationId=' + locationId;
            }
        }
    }

    //CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (data) {
    //    if (data.Success == false) {
    //        return null;
    //    }
    //    else
    //        return data.Result;
    //});
    CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (data) {
        if (data.Success == false) {
            // alert(data.ErrorCode + '\n' + data.ErrorMessage);
            return false;
        }
        else {
            $(ddlId).empty();
            var name = "";
            var newOption = "";
            var reportType = $("#ddlReport").val();

            if (reportType == '#divWeightage' || reportType == '#divKRADefaulterEmployee' || reportType == '#divManagerStatus' || reportType == '#divGOFSReport') {//IM

                newOption = '<option value="0">--' + startText + '--</option><option value="-1">' + "All" + '</option>';
            }
            else {
                newOption = '<option value="0">--' + startText + '--</option>';
            }

            $(ddlId).append(newOption);


            $.each(data.Result, function (i, data) {
                name = CommonGetName(data.FirstName, data.LastName) + '-' + data.NewEmployeCode;
                // bind the dropdown list using json result              
                $('<option>',
                    {
                        value: data.EmployeeId,
                        text: name
                    }).html(name).appendTo(ddlId);
            });

        }

    });

}
function GetStatus() {
    $('#ddlStatus').empty();
    var token = sessionStorage.TokenValue;
    var svrPath = CONFIG.get('SERVERNAME');
    var appraisalCycleId = $('#ddlRptAppCycle :selected').val();//sessionStorage.AppraisalCycleId;
    var managerId = sessionStorage.EmployeeId;
    var From = "";
    if (sessionStorage.EmployeeRoleId == 3)
        From = managerId;
    else
        From = $("#ddlMgrList").val();
    var apiPath = svrPath + "ManagerDashboard?AppraisalCycleId=" + appraisalCycleId + "&FromEmployeeId=" + From + "&ActionTypeId=1";


    CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (data) {
        if (data.Success == false) {
            return false;
        }
        else {
            // Validate that data.Result exists
            if (!data.Result) {
                console.error('GetStatus: data.Result is undefined', data);
                if (typeof AlertMessage === 'function') {
                    AlertMessage('#divValidationAlert', 'Error loading status data. Please try again.', 'D');
                } else if (typeof toastr !== 'undefined') {
                    toastr.error('Error loading status data. Please try again.');
                }
                return false;
            }
            
            // Handle both array and object responses
            // DataSet from API might be serialized as an object with Tables property or as an array
            var resultArray = null;
            
            if (Array.isArray(data.Result)) {
                // Result is already an array
                resultArray = data.Result;
            } else if (data.Result && typeof data.Result === 'object') {
                // Result is an object - try to find the array in common DataSet serialization formats
                // Check for Table1, Tables[0], or first property that is an array
                if (data.Result.Table1 && Array.isArray(data.Result.Table1)) {
                    resultArray = data.Result.Table1;
                } else if (data.Result.Tables && Array.isArray(data.Result.Tables) && data.Result.Tables.length > 0 && Array.isArray(data.Result.Tables[0])) {
                    resultArray = data.Result.Tables[0];
                } else {
                    // Try to find first array property
                    for (var key in data.Result) {
                        if (Array.isArray(data.Result[key])) {
                            resultArray = data.Result[key];
                            break;
                        }
                    }
                }
            }
            
            if (!resultArray || !Array.isArray(resultArray) || resultArray.length === 0) {
                console.error('GetStatus: Could not find valid array in data.Result', data);
                if (typeof AlertMessage === 'function') {
                    AlertMessage('#divValidationAlert', 'Error loading status data. Please try again.', 'D');
                } else if (typeof toastr !== 'undefined') {
                    toastr.error('Error loading status data. Please try again.');
                }
                return false;
            }
            
            // Now safely check if MinMaxCounter exists
            if (!resultArray[0] || !resultArray[0].MinMaxCounter) {
                console.error('GetStatus: Missing MinMaxCounter in result array', resultArray);
                if (typeof AlertMessage === 'function') {
                    AlertMessage('#divValidationAlert', 'Error loading status data. Please try again.', 'D');
                } else if (typeof toastr !== 'undefined') {
                    toastr.error('Error loading status data. Please try again.');
                }
                return false;
            }

            var name = "";
            var minMaxCounter = resultArray[0].MinMaxCounter;

            var All = $('<option value="A">--All--</option>');
            var greaterThan = $('<option value="G">Given more than ' + minMaxCounter + '</option>');
            var lessThan = $('<option value="Y">Given less than ' + minMaxCounter + ' and Greater than 0</option>');
            var notGiven = $('<option value="R">Not given </option>');
            $('#ddlStatus').append(All);
            $('#ddlStatus').append(greaterThan);
            $('#ddlStatus').append(lessThan);
            $('#ddlStatus').append(notGiven);

        }



    });
}
function ShowMgrStatusReport() {

    $('#tblMgrStatus').DataTable().clear().draw();
    var managerId = "";
    if (sessionStorage.EmployeeRoleId == 3)
        managerId = sessionStorage.EmployeeId;
    else
        managerId = $("#ddlMgrList").val();
    if (managerId == 0) {
        alert('Select a manager');
        return false;
    }
    var token = sessionStorage.TokenValue;
    var apprisalCycleId = $('#ddlRptAppCycle :selected').val()//sessionStorage.AppraisalCycleId;

    var SubCycle = "";
    SubCycle = $('#ddlHalfAppCycle :selected').val()

    if (SubCycle == 0) {
        alert('Select a sub-cycle');
        return false;
    }

    var vSign = $("#ddlStatus").val();


    //if (sessionStorage.EmployeeRoleId == 5 && managerId == 0 && vSign == 'A') {
    //    alert('Select a status');
    //} else {

    var svrPath = CONFIG.get('SERVERNAME');

    var apiPath = '';
    var LoginEmpId = sessionStorage.EmployeeId;
    if (sessionStorage.EmployeeRoleId == 4) {


        apiPath = svrPath + 'Reports?AppraisalCycleId=' + apprisalCycleId + '&SubCycle=' + SubCycle + '&FromEmployeeId=' + managerId + '&LoginEmpId=' + LoginEmpId + '&LocationAdmin=4&ActionTypeId=1&VSign=' + vSign;

    }
    else {
        apiPath = svrPath + 'Reports?AppraisalCycleId=' + apprisalCycleId + '&SubCycle=' + SubCycle + '&FromEmployeeId=' + managerId + '&LoginEmpId=' + LoginEmpId + '&LocationAdmin=0&ActionTypeId=1&VSign=' + vSign;

    }
    var data = CommonAjaxGET(apiPath, CommonGetHeaderInfo());




    FillMyEmployeesList(data);
    //}

}
function FillMyEmployeesList(SubordinateList) {

    $("#tblMgrStatus").DataTable({
        destroy: true,
        data: SubordinateList.responseJSON.Result,
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
        dom: '<"row"<"col-sm-6"Bl><"col-sm-6"f>>' + '<"row"<"col-sm-12"<"table-responsive"tr>>>' + '<"row"<"col-sm-5"i><"col-sm-7"p>>',
        aoColumns: [
            {
                mData: "NewEmployeeCode", width: "10%",
            },
            {
                mData: "EmployeeName", width: "10%",
            },
            {
                mData: "ManagerName", width: "10%",
            },
            {
                mData: "LocationName", width: "10%",
            },
            {
                mData: "EmployeeDesignationName", width: "10%",
            },
            {
                mData: "ProjectName", width: "15%",
            },
            {
                mData: "KRA", width: "10%",
            },

            //Commented for hide behavioural competencies start
            //{
            //    mData: "Behavioural_Competency", width: "15%",
            //},
            //Commented for hide behavioural competencies end
            {
                mData: "TeamCount", width: "10%",
            },
        ],
        paging: false,

    });

    $('#tblMgrStatus_length').hide();
    $("#tblMgrStatus_info").hide();
    $("#tblMgrStatus_paginate").hide();

}

//Employee Strength/Weakness report
function GetSubByMgr(startText, ddlId) {
    if ($("#ddlReport").val() == '#divGOFSReport')
        $('#GOFS_Reportee').show();
    if ($("#ddlReport").val() == '#divKRADefaulterEmployee')
        $('#KRA_Reportee').show();
    var managerId = "";
    if (sessionStorage.EmployeeRoleId == 3) {
        managerId = sessionStorage.EmployeeId;
    }
    else {
        if ($("#ddlMgrEmpSW").val() == 0)
            managerId = 0;
        else
            managerId = $("#ddlMgrEmpSW").val();

    }
    if ((sessionStorage.EmployeeRoleId == 5) && ($("#ddlReport").val() == '#divWeightage')) {
        if ($("#ddlMgrWeightageCalculation").val() == 0)
            managerId = 0;
        else
            managerId = $("#ddlMgrWeightageCalculation").val();
    }
    if ((sessionStorage.EmployeeRoleId == 5) && ($("#ddlReport").val() == '#divGOFSReport')) {
        //if ($("#ddlMgrGOFS").val() == -1) { --Commented as per ask to leena
        //    //var name = "";
        //    var newOption = '<option value="0">--' + startText + '--</option>';
        //    $(ddlId).append(newOption);
        //    return;
        //}
        if ($("#ddlMgrGOFS").val() == 0)
            managerId = 0;
        else
            managerId = $("#ddlMgrGOFS").val();
    }
    if ((sessionStorage.EmployeeRoleId == 5) && ($("#ddlReport").val() == '#divKRADefaulterEmployee')) {
        //if ($("#ddlMgrGOFS").val() == -1) { --Commented as per ask to leena
        //    //var name = "";
        //    var newOption = '<option value="0">--' + startText + '--</option>';
        //    $(ddlId).append(newOption);
        //    return;
        //}
        if ($("#ddlMgrListForKRA").val() == 0)
            managerId = 0;
        else
            managerId = $("#ddlMgrListForKRA").val();
    }

    var token = sessionStorage.TokenValue;
    var apprisalCycleId = $('#ddlRptAppCycle :selected').val()//sessionStorage.AppraisalCycleId;
    var role = sessionStorage.EmployeeRoleId;
    btnGetEmpStrengthWeaknessReport
    var svrPath = CONFIG.get('SERVERNAME');
    var LocationId = sessionStorage.LocationId;
    if (role == 5)
        LocationId = 0;
    var apipath = "";
    if ($("#ddlMgrWeightageCalculation").val() == -1) {
        //var all = JSON.stringify(selected);
        //console.log(all);
        apiPath = svrPath + 'Team/GetAllEmployee?LocationId=' + LocationId + '&AppraisalCycleId=' + apprisalCycleId;
        console.log(apiPath);
    }
    else {
        if (($("#ddlReport").val() == '#divGOFSReport') || ($("#ddlReport").val() == '#divKRADefaulterEmployee'))
            apiPath = svrPath + 'Team?id=' + managerId + '&AppraisalCycleId=' + apprisalCycleId + '&report=GOFS';
        else
        apiPath = svrPath + 'Team?id=' + managerId + '&AppraisalCycleId=' + apprisalCycleId + '&viewAwardsMode=';
    }



    CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (data) {
        if (data.Success == false) {
            if($("#ddlReport").val() == '#divGOFSReport')
                $('#GOFS_Reportee').hide();
            if ($("#ddlReport").val() == '#divKRADefaulterEmployee')
                $('#KRA_Reportee').hide();
            return false;
        }
        else {
            if ($("#ddlReport").val() == '#divGOFSReport')
                $('#GOFS_Reportee').show();
            if ($("#ddlReport").val() == '#divKRADefaulterEmployee')
                $('#KRA_Reportee').show();
            var name = "";
            var newOption = '<option value="0">--' + startText + '--</option>';
            $(ddlId).append(newOption);


            $.each(data.Result, function (i, data) {
                name = CommonGetName(data.FirstName, data.LastName) + '-' + data.NewEmployeeCode;
                // bind the dropdown list using json result              
                $('<option>',
                    {
                        value: data.EmployeeId,
                        text: name
                    }).html(name).appendTo(ddlId);
            });
        }
    });

}
$("#ddlMgrEmpSW").change(function () {
    $("#ddlEmp").empty();
    GetSubByMgr('All', ddlEmp);

});

$("#ddlMgrWeightageCalculation").change(function () {
    $("#ddlEmpWeightageCalculation").empty();
    GetSubByMgr('All', ddlEmpWeightageCalculation);;

});
$("#ddlMgrGOFS").change(function () {
    $("#ddlEmpGOFS").empty();
    GetSubByMgr('All', ddlEmpGOFS);

});

$("#ddlMgrListForKRA").change(function () { //30jan
    $("#ddlEmpForKRA").empty();
    GetSubByMgr('All', ddlEmpForKRA);

});

function GetEmpStrengthWeakness() {
    // clearControls();
    var managerId, toEmp = "";
    if (sessionStorage.EmployeeRoleId == 3) {
        managerId = sessionStorage.EmployeeId;
    }
    else
        managerId = $("#ddlMgrEmpSW").val();
    if ($("#ddlEmp").val() == 0)
        toEmp = 0;
    else
        toEmp = $("#ddlEmp").val() != null ? $("#ddlEmp").val() : 0;
    if (managerId == 0)
        alert('Select a manager');
    else {

        var token = sessionStorage.TokenValue;
        var apprisalCycleId = $('#ddlRptAppCycle :selected').val()// sessionStorage.AppraisalCycleId;

        var svrPath = CONFIG.get('SERVERNAME');

        var apiPath = svrPath + 'Reports?AppraisalCycleId=' + apprisalCycleId + '&FromEmployeeId=' + managerId + '&ToEmployeeId=' + toEmp + '&ActionTypeId=1&AreaId=1&ForManager=0';
        var headerInfo = {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue,
            "X-EmpNo": sessionStorage.EmployeeId
        };

        $('#tblEmpStrngthWeakness').DataTable().clear().draw();

        CommonAjaxGET(apiPath, headerInfo).done(function (data) {
            if (data) {
                $("#tblEmpStrngthWeakness").DataTable({
                    destroy: true,
                    data: data.Result,
                    "bPaginate": false,
                    aoColumns: [
                        {
                            mData: "NewEmployeeCode",
                        },
                        {
                            mData: "EmployeeName",
                        },
                        {
                            mData: "Question",
                        },
                        //{
                        //    mData: "SW",
                        //},
                        {
                            mRender: function (data, type, full) {
                                if (full.SW == 1) {
                                    return "Strength";
                                } else {
                                    return " ";
                                }
                            },
                        },
                        {
                            mRender: function (data, type, full) {
                                if (full.SW == 2) {
                                    return "Development Areas";
                                } else {
                                    return " ";
                                }
                            },
                        },
                        {
                            mRender: function (data, type, full) {
                                if (full.SW != 1 && full.SW != 2) {
                                    return "Feedback not given";
                                } else {
                                    return " ";
                                }
                            },
                        },
                    ],

                    "info": false,

                    "createdRow": function (row, data, index) {
                        //var value3 = "", value4 = "", value5="";
                        if (data.SW == 2) {
                            $('td', row).eq(2).addClass('weakness');
                            // value4="Development Areas";
                        }
                        else if (data.SW == 1) {
                            $('td', row).eq(2).addClass('strength');
                            //value3="Strength";
                        }
                        //else {
                        //    value5="Feedback not given";
                        //}
                        //$('td', row).eq(2).addClass('weakness');
                        //$('td', row).eq(3).html(value3);
                        //$('td', row).eq(4).html(value4);
                        //$('td', row).eq(5).html(value5);
                    }

                });

            }

            else {
                alert('No Records');


            }


        });
        $('#tblEmpStrngthWeakness_length').hide();
        $("#tblEmpStrngthWeakness_info").hide();
        $("#tblEmpStrngthWeakness_paginate").hide();
    }
}
$("#btnGetEmpStrengthWeaknessReport").click(function () {
    GetEmpStrengthWeakness();
});

$("#btnExportToExcelReport").click(function () {
    var dt = new Date();
    ExportCode('tblMgrStatus', 'ManagerStatusReport_' + formatDate_DMYHM(dt) + '.xls');
});

$("#btnExportToExcelSWReport").click(function () {
    var dt = new Date();
    ExportCode('tblEmpStrngthWeakness', 'EmpStrngthWeaknessReport_' + formatDate_DMYHM(dt) + '.xls');
});

$("#btnExportToExcelKRADefaulterReport").click(function () {
    var dt = new Date();
    //ExportCode('tblKRADefaulter', 'KRADefaultersListReport_' + formatDate_DMYHM(dt) + '.xls');
    ExportCode1('tblKRADefaulter', 'Report_' + formatDate_DMYHM(dt) + '.xls');

        
});

// Update ExportCode to include table headers in Excel export
function ExportCode1(tableid, filename) {
    var tab = document.getElementById(tableid); // id of table
    var tab_text = "<table border='2px'>";
    var j = 0;

    //// Add table header
    //if (tab.tHead && tab.tHead.rows.length > 0) {
    //    tab_text += "<thead>";
    //    for (var h = 0; h < tab.tHead.rows.length; h++) {
    //        tab_text += "<tr>" + tab.tHead.rows[h].innerHTML + "</tr>";
    //    }
    //    tab_text += "</thead>";
    //} else if (tab.rows.length > 0) {
    //    // Fallback: use first row as header if thead is not present
    //    tab_text += "<thead><tr>" + tab.rows[0].innerHTML + "</tr></thead>";
    //    j = 1; // skip first row in tbody
    //}

    
    var headers = tab.querySelectorAll("thead tr");
    if (headers.length > 0) {
        tab_text += "<thead>";
        headers.forEach(function (row) {
            tab_text += "<tr>";
            row.querySelectorAll("th").forEach(function (cell) {
                tab_text += "<th>" + cell.innerText + "</th>";
            });
            tab_text += "</tr>";
        });
        tab_text += "</thead>";

        // SKIP header rows in tbody
        j = headers.length;
    } else if (tab.rows.length > 0) {
        // Fallback: use first row as header if thead is not present
        tab_text += "<thead><tr>";
        var firstRowCells = tab.rows[0].cells;
        for (var i = 0; i < firstRowCells.length; i++) {
            tab_text += "<th>" + firstRowCells[i].innerText + "</th>";
        }
        tab_text += "</tr></thead>";
        j = 1; // skip first row in body
    }


    // Add table body
    tab_text += "<tbody>";
    for (; j < tab.rows.length; j++) {
        var cells = tab.rows[j].cells;
        var rowHtml = '';
        for (var c = 0; c < cells.length; c++) {
            var cellContent = (cells[c].innerText || '')
                .replace(/\r?\n|\r/g, ' &nbsp; ')//using innerText becoz of html br, p etc. tags row merging issue in excel
                .trim();
            rowHtml += '<td>' + cellContent + '</td>';
        }
        tab_text += "<tr>" + rowHtml + "</tr>";

        //tab_text += "<tr>" + tab.rows[j].innerHTML + "</tr>";
    }
    tab_text += "</tbody></table>";

    tab_text = tab_text.replace(/<A[^>]*>|<\/A>/g, "");//remove if u want links in your table
    tab_text = tab_text.replace(/<img[^>]*>/gi, ""); // remove if u want images in your table
    tab_text = tab_text.replace(/<input[^>]*>|<\/input>/gi, ""); // removes input params

    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
        txtArea1.document.open("txt/html", "replace");
        txtArea1.document.write(tab_text);
        txtArea1.document.close();
        txtArea1.focus();
        sa = txtArea1.document.execCommand("SaveAs", true, filename);
        return (sa);
    } else {
        download(tab_text, filename, "application/vnd.ms-excel");
    }
}

$("#btnRatingCalculationExportToExcel").click(function () {
    var managerId = $("#ddlMgrRatingCalculation").val();
    //var svrPath = CONFIG.get('SERVERNAME');
    //var apiPath = svrPath + 'Reports?AppraisalCycleId=' + sessionStorage.AppraisalCycleId + "&ManagerEmployeeId=" + managerId + "&ActionTypeId=1";
    var headerInfo = CommonGetHeaderInfo();

    //CommonAjaxGET(apiPath, headerInfo).done(function (data) {
    //    if (data) {
    //        var res = btoa(data.Result);

    //        var ua = window.navigator.userAgent;
    //        var msie = ua.indexOf("MSIE ");
    //        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
    //        {
    //            txtArea1.document.open("txt/html", "replace");
    //            txtArea1.document.write(res);
    //            txtArea1.document.close();
    //            txtArea1.focus();
    //            sa = txtArea1.document.execCommand("SaveAs", true, "RatingReport.xls");
    //        }
    //        else                 //other browser not tested on IE 11
    //            sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(res));
    //    }
    //});
    //$("#btnRatingCalculationExportToExcel").hide();
    $("#imgLoad").show();
    $(':input[id="btnRatingCalculationExportToExcel"]').prop('disabled', true);
    $.ajax({
        type: 'POST',
        url: '/Reports/GetRatingReport?AppraisalCycleId=' + $('#ddlRptAppCycle :selected').val() + '&ManagerEmployeeId=' + managerId + '&ActionTypeId=1',
        async: true,
        headers: headerInfo,
        //data: '{ "AppraisalCycleId": '+sessionStorage.AppraisalCycleId+', ManagerEmployeeId=' + managerId + ', ActionTypeId=1}',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (data) {
            if (!data.errorMessage) {
                window.open('\Download?file=' + data.fileName);
            }
            else {
                // alert(data.Message);
                alert('File Not Found');
            }
            $("#imgLoad").hide();
            $(':input[id="btnRatingCalculationExportToExcel"]').prop('disabled', false);
        },
        error: function (data) {
            alert('File Not Found');
            $("#imgLoad").hide();
            $(':input[id="btnRatingCalculationExportToExcel"]').prop('disabled', false);
        }
    });
});

$("#btnWeightageCalculationExportToExcel").click(function () {
    //////$("#tblEmpWeightageCalculation").table2excel({
    //////    name: "Table2Excel",
    //////    filename: "WeightageCalculationReport",
    //////    fileext: ".xls"
    //////});
    var tab_text = "<table border='2px'><tr bgcolor='#87AFC6'>";
    var textRange; var j = 0;
    tab = document.getElementById('tblEmpWeightageCalculation'); // id of table


    for (j = 0; j < tab.rows.length; j++) {
        tab_text = tab_text + tab.rows[j].innerHTML + "</tr>";
        //tab_text=tab_text+"</tr>";
    }

    tab_text = tab_text + "</table>";
    tab_text = tab_text.replace(/<A[^>]*>|<\/A>/g, "");//remove if u want links in your table
    tab_text = tab_text.replace(/<img[^>]*>/gi, ""); // remove if u want images in your table
    tab_text = tab_text.replace(/<input[^>]*>|<\/input>/gi, ""); // reomves input params

    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
    {
        txtArea1.document.open("txt/html", "replace");
        txtArea1.document.write(tab_text);
        txtArea1.document.close();
        txtArea1.focus();
        sa = txtArea1.document.execCommand("SaveAs", true, "WeightageCalculationReport.xls");
    }
    else                 //other browser not tested on IE 11
        sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(tab_text));


    return (sa);
});

$("#btnExportToExcelFBSelfAssesmentStatusReport").click(function () {
    var dt = new Date();
    ExportCode('tblFBSelfassesmentStatusRpt', 'FeedbackSelfassesmentStatusRpt' + formatDate_DMYHM(dt) + '.xls');
});


$("#btnFBSelfAssesmentStatusReport").click(function () {



    var apprisalCycleId = $('#ddlRptAppCycle :selected').val()//sessionStorage.AppraisalCycleId;
    //var apprisalSubCycleId = $('#ddlHalfAppCycle1 :selected').val()//sessionStorage.AppraisalCycleId;
    var apprisalSubCycleId = $('#ddlHalfAppCycle1 :selected').data('yearbreakcheck');

    if (apprisalSubCycleId == 0) {
        alert('Select a Sub-Cycle');
        return false;
    }
    var svrPath = CONFIG.get('SERVERNAME');

    apiPath = svrPath + 'Reports/Get?AppraisalSubCycleId=' + apprisalSubCycleId;

    var FBSelfStatusRpt = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    $('#tblFBSelfassesmentStatusRpt').DataTable().clear().draw();


    $("#tblFBSelfassesmentStatusRpt").DataTable({
        destroy: true,
        data: FBSelfStatusRpt.responseJSON.Result,
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
        dom: '<"row"<"col-sm-6"Bl><"col-sm-6"f>>' + '<"row"<"col-sm-12"<"table-responsive"tr>>>' + '<"row"<"col-sm-5"i><"col-sm-7"p>>',
        aoColumns: [
            {
                mData: "RmID",
            },
            {
                mData: "RmName",
            },
            {
                mData: "EmpID",
            },
            {
                mData: "EmpName",
            },
            {
                mData: "EmpGrade",
            },
            {
                mData: "EmpDU",
            },
            {
                mData: "EmpAccountName",
            },
            {
                mData: "EmpLocation",
            },
            {
                mData: "SelfAssementGiven",
            },
            {
                mData: "FeedbackGiven",
            },


        ],
        'order': [[1, 'asc']],
        paging: false,

    });


    $('#tblFBSelfassesmentStatusRpt_length').hide();
    $("#tblFBSelfassesmentStatusRpt_info").hide();
    $("#tblFBSelfassesmentStatusRpt_paginate").hide();

});

$("#btnKRADefaulterReport").click(function () {
    $('.LoaderSection').show();
    var managerId = "";
    var apiPath = "";
    if (sessionStorage.EmployeeRoleId == 3) {
        managerId = sessionStorage.EmployeeId;
    }
    else {
        managerId = $("#ddlMgrListForKRA").val();
    }


    if (managerId == 0) {
        alert('Select a manager');
        $('.LoaderSection').hide();
    } else {
        var apprisalCycleId = $('#ddlRptAppCycle :selected').val()//sessionStorage.AppraisalCycleId;
       // $('.LoaderSection').show();
        var svrPath = CONFIG.get('SERVERNAME');
        if (managerId == "-1") {
            managerId = 0;
        }
        var repotee = $("#ddlEmpForKRA").val();
        //if (managerId == "-1") {

        //    apiPath = svrPath + 'Reports/GetAllEmployee?AppraisalCycleId=' + apprisalCycleId + '&ManagerId=' + managerId + '&LocationId=0&EmpLoginId=' + sessionStorage.EmployeeId;
        //}
        //else {
        //apiPath = svrPath + 'Reports?AppraisalCycleId=' + apprisalCycleId + '&ManagerId=' + managerId + '&LocationId=0&EmpLoginId=' + sessionStorage.EmployeeId; old
        apiPath = svrPath + 'Reports?AppraisalCycleId=' + apprisalCycleId + '&ManagerId=' + managerId + '&LocationId=0&EmpLoginId=' + repotee;

        //}
        
        var KRADefaulters = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
        setTimeout(function () {//Im
        KRADefaulters.done(function (data) {//im
        
            if (data.Result === 'Not Found') {
                alert("Data Not Found");
                $('#tblKRADefaulter').DataTable().clear().draw();
                $('.LoaderSection').hide();
                return;
            }
            $('#tblKRADefaulter').DataTable().clear().draw();
        $("#tblKRADefaulter").DataTable({
            destroy: true,
            scrollY: "300px",
            scrollX: true,
            scrollCollapse: true,
            data: data.Result,//KRADefaulters.responseJSON.Result,
            //scrollX: true,
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
            dom: '<"row"<"col-sm-6"Bl><"col-sm-6"f>>' + '<"row"<"col-sm-12"<"table-responsive"tr>>>' + '<"row"<"col-sm-5"i><"col-sm-7"p>>',

            aoColumns: [
                {
                    mData: "EmailAddress", 'render': function (data, type, full, meta) {
                        return '<input type="checkbox" name="id[]" value="' + $('<div/>').text(full.EmailAddress).html() + '">';
                    }
                },
                {
                    //mData: "NewEmployeeCode",
                    mData: "EmployeeCode",
                    
                },
                {
                    //mData: "EmployeeName",
                    mData: "EmployeeName",

                },
                {
                    //mData: "ManagersName",
                    mData: "ManagerName",
                },
                {
                    //mData: "ManagersName",
                    mData: "ManagerEmployeeCode",
                },
                {
                    //mData: "LocationName",
                    mData: "LocationName",
                },
                {
                    //mData: "EmployeeDesignationName",
                    mData: "EmployeeDesignationName",
                },
                {
                    //mData: "EmployeeGradeName",
                    mData: "EmployeeGradeName",
                },
                {
                    
                    mData: "AppraisalCycleName",
                },
                {

                    mData: "GoalSubmitted",
                },
                {

                    mData: "GoalSubmittedOn",
                },
                {

                    mData: "GoalApproved",
                },
                {

                    mData: "GoalApprovedOn",
                },
                {

                    mData: "ApprovedBy",
                },

                {

                    mData: "ApprovedID",
                },

                {

                    mData: "EmployeeStatus",
                },



            ],
            'order': [[1, 'asc']],
            paging: false,

        });


        
        $('.LoaderSection').hide();
    }).fail(function () {
        $('.LoaderSection').hide();
        console.log("Fail");
        // alert('Error loading data');
    });
        }, 0);  // 🔧 Give browser a tick to render loader
        $('#tblKRADefaulter_length').hide();
        $("#tblKRADefaulter_info").hide();
        $("#tblKRADefaulter_paginate").hide();
    }
});

$("#btnGetWeightageCalculation").click(function () {

    var managerId = "";
    var toEmployeeId = "";
    if (sessionStorage.EmployeeRoleId == 5) {
        managerId = $("#ddlMgrWeightageCalculation").val();
        toEmployeeId = $("#ddlEmpWeightageCalculation").val();
        if (managerId == 0) {
            alert('Select a manager');
        } else {
            if (managerId == "-1") {
                managerId = 0;
            }
            var apprisalCycleId = $('#ddlRptAppCycle :selected').val();// sessionStorage.AppraisalCycleId;

            var svrPath = CONFIG.get('SERVERNAME');
            var apiPath = svrPath + 'Reports/Get?AppraisalCycleId=' + apprisalCycleId + '&FromEmployeeId=' + managerId + '&ToEmployeeId=' + toEmployeeId + '&ActionTypeId=1&Type=R';

            var WeightageCalculation = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
            var table = $('#tblEmpWeightageCalculation').DataTable();


            $('#tblEmpWeightageCalculation').DataTable().clear().draw();

            console.log(WeightageCalculation.responseJSON.Result);
            $("#tblEmpWeightageCalculation").show();
            $("#tblEmpWeightageCalculation").DataTable({
                destroy: true,
                data: WeightageCalculation.responseJSON.Result,

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
                dom: '<"row"<"col-sm-6"Bl><"col-sm-6"f>>' + '<"row"<"col-sm-12"<"table-responsive"tr>>>' + '<"row"<"col-sm-5"i><"col-sm-7"p>>',

                aoColumns: [
                    {
                        mData: "EmployeeName",
                    },
                    {
                        mData: "NewEmployeeCode",
                    },
                    {
                        mData: "EmailAddress",
                    },
                    {
                        mData: "ManagersName",
                    },
                    {
                        mData: "LocationName",
                    },
                    {
                        mData: "EmployeeDesignationName",
                    },
                    {
                        mData: "EmployeeGradeName",
                    },

                    {
                        mData: "KRAScore",
                    },
                    {
                        mData: "CompetencyScore",
                    },
                    {
                        mData: "WeightedScore",
                    }
                    //},

                    //{
                    //    "render": function (data, type, row, meta) {
                    //        var button = fnGetDetButtonHTML(row);
                    //        return button;
                    //    }
                    //}

                ],
                'order': [[1, 'asc']],
                paging: false,

            });

        }
        $('#tblEmpWeightageCalculation_length').hide();
        $("#tblEmpWeightageCalculation_info").hide();
        $("#tblEmpWeightageCalculation_paginate").hide();
    }
});
$("#btnGetGOFS").click(function () {

    var managerId = "";
    var toEmployeeId = "";
    if (sessionStorage.EmployeeRoleId == 5) {
        managerId = $("#ddlMgrGOFS").val();
        toEmployeeId = $("#ddlEmpGOFS").val();
        if (managerId == 0) {
            alert('Select a manager');
            return;
        } else {
            if (managerId == "-1") {
                managerId = 0;
            }
            if(toEmployeeId === null || toEmployeeId === -1)
            {
                toEmployeeId = 0;
            }
            var apprisalCycleId = $('#ddlRptAppCycle :selected').val();// sessionStorage.AppraisalCycleId;
            var CycleType = $('#ddlCBGOFS :selected').val(); 
            var svrPath = CONFIG.get('SERVERNAME');
            var apiPath = svrPath + 'Reports/Get?AppraisalCycleId=' + apprisalCycleId + '&FromEmployeeId=' + managerId + '&ToEmployeeId=' + toEmployeeId + '&CycleType=' + CycleType ;
            $('.LoaderSection').show();

            setTimeout(function () {//Im
            var GOSFData = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
            GOSFData.done(function (data) {

                
           
            var table = $('#tblEmpGOFS').DataTable();

                if (data.Result === 'Not Found') {
                    alert("Data Not Found");
                    $('#tblEmpGOFS').DataTable().clear().draw();
                    $('.LoaderSection').hide();
                    
                    return;
                }
            $('#tblEmpGOFS').DataTable().clear().draw();

            //console.log(GOSFData.responseJSON.Result);
            $("#tblEmpGOFS").show();
            $("#tblEmpGOFS").DataTable({
                destroy: true,
                scrollY: "300px",
                scrollX: true,
                scrollCollapse: true,
                data: data.Result,//GOSFData.responseJSON.Result,

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
                dom: '<"row"<"col-sm-6"Bl><"col-sm-6"f>>' + '<"row"<"col-sm-12"<"table-responsive"tr>>>' + '<"row"<"col-sm-5"i><"col-sm-7"p>>',

                aoColumns: [

                    {
                        mData: "AppraisalCycle",
                    },
                    {
                        mData: "AppraisalCycleName",
                    },
                    {
                        mData: "EmployeeCode",
                    },
                    {
                        mData: "EmployeeName",
                    },
                    {
                        mData: "GoalType",
                    },
                    {
                        mData: "GoalDescription",
                    },
                    {
                        mData: "GoalMeasure",
                    },
                    {
                        mData: "ActionPlan",
                    },
                    {
                        mData: "Weightage",
                    },
                    {
                        mData: "GoalApproved",
                    },
                    {
                        mData: "SelfAssesment",
                    },
                    {
                        mData: "SelfReview_Date",
                    },
                    {
                        mData: "FeedbackStatus",
                    },
                    {
                        mData: "Feedback",
                    },
                    {
                        mData: "Feedback_Date",
                    },
                    {
                        mData: "FeedbackGiven_By",
                    },
                    {
                        mData: "FeedbackGiven_By_EmpID",
                    },
                    {
                        mData: "EmployeeStatus",
                    }
                    //    "render": function (data, type, row, meta) {
                    //        var button = fnGetDetButtonHTML(row);
                    //        return button;
                    //    }
                    //}

                ],
                'order': [[1, 'asc']],
                paging: false,

            });
                $('.LoaderSection').hide();
            }).fail(function () {
                $('.LoaderSection').hide();
                console.log("Fail");
               // alert('Error loading data');
            });

            }, 0);  // 🔧 Give browser a tick to render loader
        }
        //$('#tblEmpWeightageCalculation_length').hide();
        //$("#tblEmpWeightageCalculation_info").hide();
        //$("#tblEmpWeightageCalculation_paginate").hide();
    }
});

$("#btnGOFSExportToExcel").click(function () {
    var dt = new Date();
    //ExportCode('tblKRADefaulter', 'KRADefaultersListReport_' + formatDate_DMYHM(dt) + '.xls');
    ExportCode1('tblEmpGOFS', 'G&OFeedbackSelfAccessment_' + formatDate_DMYHM(dt) + '.xls');

    // Update ExportCode to include table headers in Excel export
});


$('#chkAll').on('click', function () {
    // Get all rows with search applied
    var table = $("#tblKRADefaulter").DataTable();
    var rows = table.rows({ 'search': 'applied' }).nodes();
    // Check/uncheck checkboxes for all rows in the table
    $('input[type="checkbox"]', rows).prop('checked', this.checked);
});

$('#btnSendMail').on('click', function myfunction() {
    var EmailIds;
    var table = $("#tblKRADefaulter").DataTable();

    table.$('input[type="checkbox"]').each(function () {
        // If checkbox is checked
        if (this.checked) {
            if (EmailIds == undefined) {
                EmailIds = this.value;
            }
            else {
                EmailIds = EmailIds + ',' + this.value;
            }
        }

    });
    if (EmailIds == undefined) {
        alert("Please ensure that atleast one record is selected.");
    } else {
        // Code to Send Mail   EmailTemplateMasterController
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + '/EmailTemplateMaster/';
        //debugger;
        var Result = CommonAjaxPOST_Array(apiPath, EmailIds, CommonGetHeaderInfo());
        //alert(Result.Result);
    }
});

$('#btnEditTemplate').on('click', function myfunction() {

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + '/EmailTemplateMaster?Id=1';
    var url = $('#modelEditEmailFormat').data('url');
    $.get(url, function (data) {
        $('#EmailFormatContent').html(data);

        var TemplateDetails = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
        $('#txtbody').text(TemplateDetails.responseJSON.Result.Body);

        $('#modelEditEmailFormat').modal({
            show: true,
            keyboard: false

        });

    });
});

function clearControls() {



    $('#tblFBSelfassesmentStatusRpt').DataTable().clear().draw();
    $('#tblFBSelfassesmentStatusRpt_length').hide();
    $("#tblFBSelfassesmentStatusRpt_info").hide();
    $("#tblFBSelfassesmentStatusRpt_paginate").hide();

    $('#tblMgrStatus').DataTable().clear().draw();
    $('#tblMgrStatus_length').hide();
    $("#tblMgrStatus_info").hide();
    $("#tblMgrStatus_paginate").hide();
    $("#ddlMgrList").val("0");
    $("#ddlStatus").val("0");

    $('#tblEmpStrngthWeakness').DataTable().clear().draw();
    $('#tblEmpStrngthWeakness_length').hide();
    $("#tblEmpStrngthWeakness_info").hide();
    $("#tblEmpStrngthWeakness_paginate").hide();
    $("#ddlMgrEmpSW").val("0");
    $("#ddlEmp").val("0");


    $('#tblKRADefaulter').DataTable().clear().draw();
    $('#tblKRADefaulter_length').hide();
    $("#tblKRADefaulter_info").hide();
    $("#tblKRADefaulter_paginate").hide();
    $("#ddlMgrListForKRA").val("0");


    $('#tblEmpWeightageCalculation').DataTable().clear().draw();
    $('#tblEmpWeightageCalculation_length').hide();
    $("#tblEmpWeightageCalculation_info").hide();
    $("#tblEmpWeightageCalculation_paginate").hide();
    $("#ddlMgrWeightageCalculation").val("0");
    $("#ddlEmpWeightageCalculation").val("0");

    $("#ddlMgrMSChart").val("0");
    $('#divMSchaart_wrapper').hide();

    $('#tblFBReport').DataTable().clear().draw();
    $('#tblFBReport_length').hide();
    $("#tblFBReport_info").hide();
    $("#tblFBReport_paginate").hide();

    $('#tblDWRpt').DataTable().clear().draw();
    $('#tblDWRpt_length').hide();
    $("#tblDWRpt_info").hide();
    $("tblDWRpts_paginate").hide();
    $("#ddlDWRpt_DU").val("0");


    $('#tblEmpGOFS').DataTable().clear().draw();
    $('#tblEmpGOFS_length').hide();
    $("#tblEmpGOFS_info").hide();
    $("#tblEmpGOFS_paginate").hide();
    $("#ddlCBGOFS").val("0");
    $("#ddlMgrGOFS").val("0");
    $("#ddlEmpGOFS").val("0");
    $("#ddlMgrListForKRA").val("0");
    $("#ddlEmpForKRA").val("0");

}

function fnGetDetButtonHTML(row) {
    if (row != undefined) {
        var EmployeeDetails = row["EmployeeName"];
        var apprisalCycleId = $('#ddlRptAppCycle :selected').val()// sessionStorage.AppraisalCycleId;

        return '<button type="button" class="btn btn-warning btn-xs btn-round" ' +
            'data-employeeid="' + EmployeeDetails + '" ' +
            'data-appraisalcycleid="' + apprisalCycleId + '" ' +
            'onclick="fnWBDModal(this);"><span class="glyphicon glyphicon-eye-open"></span></button>';
    }
}

function fnWBDModal(objButton) {
    var managerId = $("#ddlMgrWeightageCalculation").val();
    var toEmployeeId = $("#ddlEmpWeightageCalculation").val();
    var apprisalCycleId = $('#ddlRptAppCycle :selected').val()// sessionStorage.AppraisalCycleId;
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'Reports/Get?AppraisalCycleId=' + apprisalCycleId + '&FromEmployeeId=' + managerId + '&ToEmployeeId=' + toEmployeeId + '&ActionTypeId=1&Type=Breakdown';

    var WeightageBDCalculation = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    var url = $('#WeightageBreakDownModal').data('url');
    $.get(url, function (data) {
        $('#WBDContent').html(data);
        $("#spnEmpCode").text($(objButton).attr('data-employeeid'));
        SetWBD(WeightageBDCalculation.responseJSON.Result);
        $('#WeightageBreakDownModal').modal({
            show: true,
            keyboard: false,
            backdrop: 'static'
        });
    });
}

function SetWBD(data) {

    var reporttable = "<tr><th>KRA Weightage (%)</th>";
    var KRAIDs = new Array();
    $.each(data, function (i, val) {
        if (val.AreaId == 2 && $.inArray(val.KRAId, KRAIDs) != -1) {
            reporttable += "<th>" + val.Weightage + "</th>";
            KRAIDs.push(val.KRAId);
        }
    });
    reporttable += "</tr>";
    reporttable += "<tr><th>Behavioural Score</th>";
    var BehS = new Array();
    $.each(data, function (i, val) {
        if (val.AreaId == 1 && $.inArray(val.QuestionaireID, BehS) != -1) {
            reporttable += "<th>" + val.QuestionaireID + "</th>";
            BehS.push(val.QuestionaireID);
        }
    });
    //var prevMgr = "";
    //var flag = 0;
    //$.each(data, function (i, val) {
    //    if (val.AreaId == 2) {

    //    }
    //    if (val.MgrName != prevMgr) {
    //        reporttable += "<tr><td>Feedback Score - " + val.MgrName + "-" + formatDate_DMY(val.CreatedOn) + "</td>";
    //        prevMgr = val.MgrName;
    //    }
    //        flag = 1;
    //        if (val.AreaId == 2 && val.MgrName == prevMgr && flag==1) {
    //            $.each(data, function (i, val) {
    //                reporttable += "<td>" + val.Rating + "</td>";
    //            });
    //        } else {
    //            reporttable += "</tr>"
    //        }

    //});


    $('#tblEmpWeightageBreakDown').append(reporttable);
}

function GetMSChart(ManagerEId) {
    var type = ['KRA'];
    var kra = [];
    //var competency = [];
    var tick_value = [];//    var actual_color = [];    var expected_color = [];
    //var Question = [];
    var appraisalCycleId = $('#ddlRptAppCycle :selected').val();//sessionStorage.AppraisalCycleId;
    var employeeId = ManagerEId;
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Reports?ManagerEmployeeId=" + employeeId + "&AppraisalCycleId=" + appraisalCycleId;
    var res = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    var getGraphInfo = JSON.parse(res.responseText);
    if (getGraphInfo.Success) {
        $.each(getGraphInfo.Result, function (index, item) {
            kra.push(item.KRA_per);            //actual_color.push("#027997");
            //            competency.push(item.Beh_per);            //expected_color.push("#F3CBBF");
            tick_value.push(item.EmployeeName); //item.QuestionaireId
            //Question.push(item.NewEmployeeCode);
            //            $('#divEmpChart_legends table>tbody').append('<tr class="jqplot-table-legend"><td class="jqplot-table-legend jqplot-table-legend-label" style="padding-top: 0px;">' + i + ' - ' + item.Question + '</td></tr>');
            //i = String.fromCharCode(i.charCodeAt(i.length - 1) + 1)

        });
        $('#divMSchaart_wrapper').show();

        var ticks = tick_value;
        //var parentheight = $('#divMSchaart_wrapper').height() * 0.96;
        $('#divMSchaart_wrapper').width($('#main').width() - 40);
        var no_of_ticks = tick_value.length;
        var widthv = $('#divMSchaart_wrapper').width() - 10;
        if (no_of_ticks > 10) {
            widthv = 100 * no_of_ticks;
        }

        $('#chartFB').width(widthv);
        var plot2 = $.jqplot('chartFB', [kra], {
            width: widthv,
            height: '300px',
            title: '% Completion for Goals & Objectives',
            seriesDefaults: {
                renderer: $.jqplot.BarRenderer, pointLabels: { show: true }//,
                //rendererOptions: {
                //    barDirection: 'horizontal'
                //}
            },
            series: [{ label: ' % ' + type[0], color: "#027997" }, { label: ' % ' + type[1], color: "#ed7709" }],
            axes: {
                xaxis: {
                    tickOptions: { angle: -40, showGridline: false },
                    renderer: $.jqplot.CategoryAxisRenderer,
                    ticks: ticks,
                    fontSize: '10pt',
                    labelRenderer: $.jqplot.canvasAxisLabelRenderer,
                    tickRenderer: $.jqplot.canvasAxisTickRenderer
                },
                yaxis: {
                    tickOptions: { show: true },
                    rendererOptions: { drawBaseline: true },
                    min: 0,
                    max: 100
                }
            },
            legend: {
                renderer: $.jqplot.enhancedLegendRenderer,
                placement: 'outsideGrid',
                location: 's',
                show: true
            },
            highlighter: {
                show: true,
                sizeAdjust: 1,
                tooltipLocation: 'n',
                fadeTooltip: true,
                tooltipOffset: 3,
                tooltipContentEditor: function (str, seriesIndex, pointIndex, jqPlot) {
                    var per = str.split(',');
                    return '<div class="pep-jqplot-highlighter jqplot-highlighter">' + per[1] + '%' + '</div>';
                }
            },
        }).replot();

    }
    else {
        $('#divMSchaart_wrapper').hide();
        alert('No records found');
    }
}

$("#btnManagerFeedbackChart").click(function () {

    var managerId = "";
    if (sessionStorage.EmployeeRoleId == 3)
        managerId = sessionStorage.EmployeeId;
    else
        managerId = $("#ddlMgrMSChart").val();
    if (managerId == 0) {
        alert('Select a manager');
    } else {
        GetMSChart(managerId);
    }
});
$("#btnExportToExcelMFBChartReport").click(function () {

    //$('#chartFB').jqplotSaveImage()
    //after creating your plot do
    var managername = "";
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
    {
        // $('#chartFB').jqplotSaveImage();
        alert('This functionality is not supported in IE, please use another browser to save the image.');
        //var imgData = $('#chartFB').jqplotToImageStr({});
        //var imgElem = $('<img/>').attr('src', imgData);
        //imgElem.style.display = 'block';
        //imgElem.style.width = 200 + "px";
        //imgElem.style.height = 200 + "px";
        ////$('#imgChart1').append(imgElem);
        //var url = imgElem.getAttribute('src');
        //window.open(url, 'Image', 'width=imgElem.stylewidth,height=imgElem.style.height,resizable=1');
        //var largeImage = document.getElementById('largeImage');
        //largeImage.style.display = 'block';
        //largeImage.style.width = 200 + "px";
        //largeImage.style.height = 200 + "px";
        //var url = largeImage.getAttribute('src');
        //window.open(url, 'Image', 'width=largeImage.stylewidth,height=largeImage.style.height,resizable=1');
    } else {
        var imgData = $('#chartFB').jqplotToImageStr({});
        download(imgData, "FBChart_" + Date.now().toString() + '.png', "image/png");
    }
    //download('data:application/octet-stream;base64,' + imgData,"FBChart","image/png");

});

$('#btnFBReport').click(function () {
    GetFeedbackReport();
});
$('#btnExportToExcelFBReport').click(function () {
    if (GetFeedbackReport()) {
        var dt = new Date();
        ExportCode('tblFBReport', 'FBReport_' + formatDate_DMYHM(dt) + '.xls');
    }
});

$('#btnFBEmpReport').click(function () {
    GetEmpWiseFeedbackReport();
});
$('#btnExportToExcelFBEmpReport').click(function () {
    if (GetEmpWiseFeedbackReport()) {
        var dt = new Date();
        ExportCode('tblFBEmpReport', 'FBReport_' + formatDate_DMYHM(dt) + '.xls');
    }
});

function GetEmpWiseFeedbackReport() {

    var dt_startfb = foramtDate_DMY2YMD($('#dtFromFBEmpReport').val().trim());
    var dt_s = new Date(dt_startfb);
    var dt_endfb = foramtDate_DMY2YMD($('#dtToFBEmpReport').val().trim());
    var dt_e = new Date(dt_endfb);


    var selectEmpId = "";

    selectEmpId = $("#ddlEmpListForfeedback").val();
    if (selectEmpId == 0) {
        alert('Select a employee.');
        return false;
    }

    var fbtype = $('#ddlFBStatus').val();
    if (dt_startfb == "" || dt_endfb == "" || dt_s > dt_e) {
        alert('Please enter the correct dates.');
        return false;
    }
    else {
        var token = sessionStorage.TokenValue;
        var svrPath = CONFIG.get('SERVERNAME');

        var apiPath = svrPath + 'Reports/GetSelectEmpfeedback?Type=' + fbtype + '&EmpLoginID=' + sessionStorage.EmployeeId + '&SelectdEmpID=' + selectEmpId + '&StartDate=' + dt_startfb + '&EndDate=' + dt_endfb;
        var headerInfo = {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue,
            "X-EmpNo": sessionStorage.EmployeeId
        };

        $('#tblFBEmpReport').DataTable().clear().draw();

        CommonAjaxGET(apiPath, headerInfo).done(function (data) {
            if (data) {
                $("#tblFBEmpReport").DataTable({
                    destroy: true,
                    data: data.Result,
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
                    dom: '<"row"<"col-sm-6"Bl><"col-sm-6"f>>' + '<"row"<"col-sm-12"<"table-responsive"tr>>>' + '<"row"<"col-sm-5"i><"col-sm-7"p>>',
                    aoColumns: [
                        {
                            mData: "FBDate", mRender: function (data, type, full) {
                                var dt = new Date(data);
                                return formatDate_DMYHM(dt);
                            }, width: "16%"
                        },
                        {
                            mRender: function (data, type, full) {
                                return full["FromEmpName"];
                            }
                        },
                        {
                            mRender: function (data, type, full) {
                                return full["FromNewEmployeeCode"];
                            }
                        },
                        {
                            mRender: function (data, type, full) {
                                return full["ToEmpName"];
                            }
                        },
                        {
                            mRender: function (data, type, full) {
                                return full["ToNewEmployeeCode"];
                            }
                        },

                        {
                            mData: "Area",
                        },

                        {
                            mRender: function (data, type, full) {
                                return full["Goal"];
                            }
                        },
                        
                        {
                            mRender: function (data, type, full) {
                                return full["Measure"];
                            }
                        },
                        {
                            mRender: function (data, type, full) {
                                return full["ActionPlan"];
                            }
                        },
                        {
                            mRender: function (data, type, full) {
                                return full["Weightage"];
                            }
                        },
                        {
                            mRender: function (data, type, full) {
                                return full["Rating"];
                            }
                        },
                        {
                            mRender: function (data, type, full) {
                                return full["Feedback"];
                            }
                        },

                    ],
                    "info": false,
                    paging: false,
                    "fnInitComplete": function () {
                        this.fnAdjustColumnSizing(true);
                    }
                });

            }
            else {
                alert('No Records');
            }
        });
        $('#tblFBEmpReport_length').hide();
        $("#tblFBEmpReportt_info").hide();
        $("#tblFBEmpReport_paginate").hide();
        return true;
    }
}

function GetFeedbackReport() {
    var dt_startfb = foramtDate_DMY2YMD($('#dtFromFBReport').val().trim());
    var dt_s = new Date(dt_startfb);
    var dt_endfb = foramtDate_DMY2YMD($('#dtToFBReport').val().trim());
    var dt_e = new Date(dt_endfb);


    var fbtype = $('#ddlFBStatus').val();
    if (dt_startfb == "" || dt_endfb == "" || dt_s > dt_e) {
        alert('Please enter the correct dates.');
        return false;
    }
    else {
        var token = sessionStorage.TokenValue;
        var svrPath = CONFIG.get('SERVERNAME');

        var apiPath = svrPath + 'Reports?Type=' + fbtype + '&EmpLoginID=' + sessionStorage.EmployeeId + '&StartDate=' + dt_startfb + '&EndDate=' + dt_endfb;
        var headerInfo = {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue,
            "X-EmpNo": sessionStorage.EmployeeId
        };

        $('#tblFBReport').DataTable().clear().draw();

        CommonAjaxGET(apiPath, headerInfo).done(function (data) {
            if (data) {
                $("#tblFBReport").DataTable({
                    destroy: true,
                    data: data.Result,
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
                    dom: '<"row"<"col-sm-6"Bl><"col-sm-6"f>>' + '<"row"<"col-sm-12"<"table-responsive"tr>>>' + '<"row"<"col-sm-5"i><"col-sm-7"p>>',
                    aoColumns: [
                        {
                            mData: "FBDate", mRender: function (data, type, full) {
                                var dt = new Date(data);
                                return formatDate_DMYHM(dt);
                            }, width: "16%"
                        },
                        {
                            mRender: function (data, type, full) {
                                return full["FromEmpName"];
                            }
                        },
                        {
                            mRender: function (data, type, full) {
                                return full["FromNewEmployeeCode"];
                            }
                        },
                        {
                            mRender: function (data, type, full) {
                                return full["ToEmpName"];
                            }
                        },
                        {
                            mRender: function (data, type, full) {
                                return full["ToNewEmployeeCode"];
                            }
                        },

                        {
                            mData: "Area",
                        },

                        {
                            mRender: function (data, type, full) {
                                return full["Goal"];
                            }
                        },
                        {
                            mRender: function (data, type, full) {
                                return full["Measure"];
                            }
                        },
                        {
                            mRender: function (data, type, full) {
                                return full["ActionPlan"];
                            }
                        },
                        {
                            mRender: function (data, type, full) {
                                return full["Weightage"];
                            }
                        },
                        {
                            mRender: function (data, type, full) {
                                return full["Rating"];
                            }
                        },
                        {
                            mRender: function (data, type, full) {
                                return full["Feedback"];
                            }
                        },

                    ],
                    "info": false,
                    paging: false,
                    "fnInitComplete": function () {
                        this.fnAdjustColumnSizing(true);
                    }
                });
            }
            else {
                alert('No Records');
            }
        });
        $('#tblFBReport_length').hide();
        $("#tblFBReport_info").hide();
        $("#tblFBReport_paginate").hide();
        return true;
    }
}
function ExportCode(tableid, filename) {

    var tab_text = "<table border='2px'><tr bgcolor='#87AFC6'>";
    var textRange; var j = 0;
    tab = document.getElementById(tableid); // id of table


    for (j = 0; j < tab.rows.length; j++) {
        if (j == 0)
            tab_text = tab_text + tab.rows[j].innerHTML + "</tr>";
        else
            tab_text = tab_text + "<tr>" + tab.rows[j].innerHTML + "</tr>";
    }

    //for (j = 0 ; j < tab.rows.length ; j++) {
    //    tab_text = tab_text + tab.rows[j].innerHTML + "</tr>";
    //}

    tab_text = tab_text + "</table>";
    tab_text = tab_text.replace(/<A[^>]*>|<\/A>/g, "");//remove if u want links in your table
    tab_text = tab_text.replace(/<img[^>]*>/gi, ""); // remove if u want images in your table
    tab_text = tab_text.replace(/<input[^>]*>|<\/input>/gi, ""); // reomves input params

    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
    {
        txtArea1.document.open("txt/html", "replace");
        txtArea1.document.write(tab_text);
        txtArea1.document.close();
        txtArea1.focus();
        sa = txtArea1.document.execCommand("SaveAs", true, filename);
        return (sa);
    }
    else {                //other browser not tested on IE 11
        download(tab_text, filename, "application/vnd.ms-excel");
        //sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(tab_text));
        // return (sa);
    }
}

//added by Janice 27March2018
//function GetDU(ddlD) {
//    $(ddlD).empty();
//    var token = sessionStorage.TokenValue;
//    var svrPath = CONFIG.get('SERVERNAME');
//    var appraisalCycleId = sessionStorage.AppraisalCycleId;

//    if (sessionStorage.EmployeeRoleId == 7)
//        DUId = sessionStorage.HRDUId;
//    else
//        DUId = 0;
//    var apiPath = svrPath + 'DeliveryUnit';
//    var lstDUMaster = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
//    if (DUId == 0) {
//        $(ddlD).append($("<option>").val(0).text("All"));
//        if (lstDUMaster.responseJSON.Success) {
//            $.each(lstDUMaster.responseJSON.Result, function (index, data) {
//                $(ddlD).append($("<option>").val(data.DeliveryUnitID).text(data.DeliveryUnit));
//            });
//        }
//    } else {
//        if (lstDUMaster.responseJSON.Success) {
//            $.each(lstDUMaster.responseJSON.Result, function (index, data) {
//                if (DUId == data.DeliveryUnitID)
//                    $(ddlD).append($("<option>").val(data.DeliveryUnitID).text(data.DeliveryUnit));
//            });
//        }
//    }

//}
function GetDU(ddlD) {

    $(ddlD).empty();
    var DUId = "";
    var token = sessionStorage.TokenValue;
    var svrPath = CONFIG.get('SERVERNAME');
    var appraisalCycleId = $('#ddlRptAppCycle :selected').val();//sessionStorage.AppraisalCycleId;
    console.log(sessionStorage.EmployeeRoleId);
    if (sessionStorage.EmployeeRoleId == 7) {
        var apiPath1 = svrPath + 'DeliveryUnit?EmployeeId=' + sessionStorage.EmployeeId;

        var lstHRDU = CommonAjaxGET(apiPath1, CommonGetHeaderInfo());

        console.log(lstHRDU);
        DUId = 100;
        // DUId = sessionStorage.HRDUId;

    } else {
        DUId = 0;
    }

    var apiPath = svrPath + 'DeliveryUnit';

    var lstDUMaster = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    if (DUId == 0) {
        $(ddlD).append($("<option>").val(0).text("All"));
        if (lstDUMaster.responseJSON.Success) {
            $.each(lstDUMaster.responseJSON.Result, function (index, data) {
                $(ddlD).append($("<option>").val(data.DeliveryUnitID).text(data.DeliveryUnit));
            });
        }
    } else {


        if (lstDUMaster.responseJSON.Success) {
            $.each(lstDUMaster.responseJSON.Result, function (index, data) {
                $.each(lstHRDU.responseJSON.Result, function (index, data1) {
                    if (data1.DUId == data.DeliveryUnitID)
                        $(ddlD).append($("<option>").val(data.DeliveryUnitID).text(data.DeliveryUnit));
                });
            });
            console.log(ddlD);
        }
    }

}
$("#btnGetDWRpt").click(function () {
    ShowDWRpt();
});
function ShowDWRpt() {

    $('#tblDWRpt').DataTable().clear().draw();
    var apprisalCycleId = $('#ddlRptAppCycle :selected').val();//sessionStorage.AppraisalCycleId;
    var duId = $("#ddlDWRpt_DU").val();
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'Reports?Type="A"&DUId=' + duId + '&AppraisalCycleId=' + apprisalCycleId;
    var datalist = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    if (datalist.responseJSON.Success) {
        $("#tblDWRpt").DataTable({

            destroy: true,
            data: datalist.responseJSON.Result,

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
            dom: '<"row"<"col-sm-6"Bl><"col-sm-6"f>>' + '<"row"<"col-sm-12"<"table-responsive"tr>>>' + '<"row"<"col-sm-5"i><"col-sm-7"p>>',
            aoColumns: [
                {
                    mData: "DeliveryUnit", width: "10%",
                },
                {
                    mData: "AccountName", width: "15%",
                },
                {
                    mData: "NewEmployeeCode", width: "10%",
                },
                {
                    mData: "RMname", width: "10%",
                },
                {
                    mData: "DESIGNATION", width: "10%",
                },
                {
                    //mData: "TeamSizeL1", width: "10%",
                    "render": function (data, type, row, meta) {
                        var EmployeeDetails = row["EmployeeId"];
                        var EmployeeName = row["RMname"];
                        var apprisalCycleId = $('#ddlRptAppCycle :selected').val();// sessionStorage.AppraisalCycleId;
                        return '<button type="button" class="btn btn-default btn-xs btn-round" ' +
                            'data-employeeid="' + EmployeeDetails + '" ' +
                            'data-employeename="' + EmployeeName + '" ' +
                            'data-appraisalcycleid="' + apprisalCycleId + '" ' +
                            'onclick="fnDUTotalModal(this,1);">' + row["TeamSizeL1"] + '</button>';
                    }, width: "5%"
                },
                {
                    //mData: "NoOfTeamMembersFBGiven", width: "10%",
                    "render": function (data, type, row, meta) {
                        var EmployeeDetails = row["EmployeeId"];
                        var EmployeeName = row["RMname"];
                        var apprisalCycleId = $('#ddlRptAppCycle :selected').val();//;//sessionStorage.AppraisalCycleId;
                        return '<button type="button" class="btn btn-info btn-xs btn-round" ' +
                            'data-employeeid="' + EmployeeDetails + '" ' +
                            'data-employeename="' + EmployeeName + '" ' +
                            'data-appraisalcycleid="' + apprisalCycleId + '" ' +
                            'onclick="fnDUTotalModal(this,2);">' + row["NoOfTeamMembersFBGiven"] + '</button>';
                    }, width: "10%"
                },
                {
                    //mData: "PercentOfTeamFBGiven", width: "10%",
                    "render": function (data, type, row, meta) {
                        var percentageFB = row["PercentOfTeamFBGiven"];
                        return percentageFB + '%';
                    }, width: "10%"
                }
            ],
            paging: true,

        });


        $('#tblDWRpt_length').show();
        $("#tblDWRpt_info").show();
        $("#tblDWRpt_paginate").show();
        return true;
    } else {
        return false;
    }
}
$('#btnExportToExcelDWRpt').click(function () {


    if (ShowDWRpt()) {
        $("#tblDWRpt").DataTable({

            destroy: true,
            paging: false
        });
        $('#tblDWRpt_length').hide();
        $("#tblDWRpt_info").hide();
        $("#tblDWRpt_paginate").hide();
        var dt = new Date();
        ExportCode('tblDWRpt', 'DUWiseManagerWiseFBReport_' + formatDate_DMYHM(dt) + '.xls');
        $("#tblDWRpt").DataTable({
            bLengthChange: false,
            destroy: true,
            paging: true,
            sDom: '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
            dom: '<"row"<"col-sm-6"Bl><"col-sm-6"f>>' + '<"row"<"col-sm-12"<"table-responsive"tr>>>' + '<"row"<"col-sm-5"i><"col-sm-7"p>>',
        });
        $('#tblDWRpt_length').show();
        $("#tblDWRpt_info").show();
        $("#tblDWRpt_paginate").show();
    }
});
function fnDUTotalModal(objButton, type) {
    var managerId = $(objButton).attr('data-employeeid');
    console.log(managerId);
    var apprisalCycleId = $('#ddlRptAppCycle :selected').val();// sessionStorage.AppraisalCycleId;
    var svrPath = CONFIG.get('SERVERNAME');
    var Dtype = 'TeamSize';
    if (type == 2)
        Dtype = 'FBGiven';
    var apiPath = svrPath + 'Reports/Get?subordinate="Y"&ManagerEmployeeId=' + managerId + '&AppraisalCycleId=' + apprisalCycleId + '&Type=' + Dtype;

    var subList = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    if (subList.responseJSON.Success) {
        var url = $('#DUSubOrdinateRModal').data('url');
        $.get(url, function (data) {
            $('#DUSRContent').html(data);
            $("#spnEmpName").text($(objButton).attr('data-employeename'));
            SetSReport(subList.responseJSON.Result);
            $('#DUSubOrdinateRModal').modal({
                show: true,
                keyboard: false,
                backdrop: 'static'
            });
        });
    }
}
function SetSReport(datalist) {
    $("#tblDWMSubordinateReport").DataTable({
        destroy: true,
        data: datalist,
        //"oLanguage": {
        //    "oPaginate": {
        //        "sNext": '<a href="#"><span class="glyphicon glyphicon-triangle-right"></span></a>',
        //        "sPrevious": '<a href="#"><span class="glyphicon glyphicon-triangle-left"></span></a>',
        //        "sLast": '<a href="#"><span class="glyphicon glyphicon-step-forward"></span></a>',
        //        "sFirst": '<a href="#"><span class="glyphicon glyphicon-step-backward"></span></a>'
        //    }
        //},
        //"sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
        //dom: '<"row"<"col-sm-6"Bl><"col-sm-6"f>>' + '<"row"<"col-sm-12"<"table-responsive"tr>>>' + '<"row"<"col-sm-5"i><"col-sm-7"p>>',
        aoColumns: [
            {
                mData: "DeliveryUnit", width: "10%",
            },
            {
                mData: "NewEmployeeCode", width: "10%",
            },
            {
                mData: "EmployeeName", width: "10%",
            },
            {
                mData: "DESIGNATION", width: "10%",
            }
        ],
        bFilter: false,  //removes search filter
        LengthChange: false, //removes shwoing entries
        bInfo: false,
        paging: false,  //removes paging header footer
        "bAutoWidth": false //because it was auto-setting width to 0 for modal
    });
    $('#tblDWMSubordinateReport_length').hide();
    $("#tblDWMSubordinateReport_info").hide();
}
$(document).delegate("#btnSRExportToExcel", "click", function (event) {
    var dt = new Date();
    var PMName = $('#hdntxtduwMgrName').val();
    ExportCode('tblDWMSubordinateReport', 'DUFBSubordinateReport_' + PMName + '_' + formatDate_DMYHM(dt) + '.xls');
});
// Goal Modification Summary Report Handlers
$('#btnGoalModReport').click(function () {
    // Show loader
    var $loaderContainer = $('<div class="report-loader-container" style="position: relative; min-height: 300px; margin: 20px 0; width: 100%; z-index: 10000;"></div>');
    var $loader = $('<div class="report-loader" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; min-height: 300px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.95); z-index: 10000; border: 1px solid #ddd; border-radius: 4px;"><div style="text-align: center;"><i class="fa fa-spinner fa-spin" style="font-size: 24px; color: #337ab7;"></i><br/><span style="margin-top: 10px; display: block; font-size: 14px;">Loading report...</span></div></div>');
    $loaderContainer.append($loader);
    $('#tblGoalModificationSummary').before($loaderContainer);
    $('#tblGoalModificationSummaryBody').html('<tr><td colspan="12" style="text-align:center; padding:20px;">Loading...</td></tr>');
    
    GetGoalModificationSummaryReport();
});

$('#btnExportToExcelGoalModReport').click(function () {
    // Show export loader
    var $exportLoader = $('<div class="export-loader" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10000; background: rgba(255,255,255,0.95); padding: 20px; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);"><div style="text-align: center;"><i class="fa fa-spinner fa-spin" style="font-size: 24px; color: #337ab7;"></i><br/><span style="margin-top: 10px; display: block; font-size: 14px;">Exporting report...</span></div></div>');
    $('body').append($exportLoader);
    
    setTimeout(function() {
        if (GetGoalModificationSummaryReport()) {
            var dt = new Date();
            ExportCode('tblGoalModificationSummary', 'GoalModificationSummary_' + formatDate_DMYHM(dt) + '.xls');
        }
        $exportLoader.remove();
    }, 100);
});

function GetGoalModificationSummaryReport() {
    var status = $('#ddlGoalModStatus').val();
    var appraisalCycleId = $('#ddlRptAppCycle :selected').val();

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'Reports/GetGoalModificationSummary?dummy=1';
    
    if (appraisalCycleId && appraisalCycleId != 0) {
        apiPath += '&AppraisalCycleId=' + appraisalCycleId;
    }
    
    if (status) {
        apiPath += '&Status=' + status;
    }

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    var GoalModList = CommonAjaxGET(apiPath, headerInfo);
    
    // Remove loader
    $('.report-loader-container').remove();

    if (GoalModList.status == 200 && GoalModList.responseJSON.Success) {
        var data = GoalModList.responseJSON.Result;
        
        if (data && data.length > 0) {
            var totalRequests = data.length;
            var approvedCount = data.filter(x => x.Status === 'Approved').length;
            var rejectedCount = data.filter(x => x.Status === 'Rejected').length;
            var pendingCount = data.filter(x => x.Status === 'Pending').length;
            var uniqueEmployees = [...new Set(data.map(x => x.EmployeeId))].length;
            
            $('#statTotalRequests').text(totalRequests);
            $('#statApproved').text(approvedCount);
            $('#statRejected').text(rejectedCount);
            $('#statPending').text(pendingCount);
            $('#statUniqueEmployees').text(uniqueEmployees);
            
            var avgRequests = (data.reduce((sum, x) => sum + x.RequestCount, 0) / totalRequests).toFixed(2);
            $('#statAvgRequestCount').text(avgRequests);
            $('#divGoalModSummaryStats').show();
            
            var tbody = $('#tblGoalModificationSummaryBody');
            tbody.empty();
            
            $.each(data, function (index, item) {
                var statusClass = '';
                if (item.Status === 'Approved') statusClass = 'text-success';
                else if (item.Status === 'Rejected') statusClass = 'text-danger';
                else if (item.Status === 'Pending') statusClass = 'text-warning';
                
                var requestDate = item.CreatedDate ? formatDate_DMY(new Date(item.CreatedDate)) : '';
                var approvedDate = item.ApprovedDate ? formatDate_DMY(new Date(item.ApprovedDate)) : '';
                
                var row = '<tr>' +
                    '<td>' + item.SrNo + '</td>' +
                    '<td>' + requestDate + '</td>' +
                    '<td>' + (item.EmployeeCode || '') + '</td>' +
                    '<td>' + (item.EmployeeName || '') + '</td>' +
                    '<td>' + (item.AppraisalCycleName || '') + '</td>' +
                    '<td class=\"' + statusClass + '\"><strong>' + item.Status + '</strong></td>' +
                    '<td>' + item.RequestCount + '</td>' +
                    '<td>' + (item.LocationName || '') + '</td>' +
                    '<td>' + (item.EmployeeDesignationName || '') + '</td>' +
                    '<td>' + (item.ApprovedByName || '') + '</td>' +
                    '<td>' + approvedDate + '</td>' +
                    '<td>' + (item.RejectionReason || '') + '</td>' +
                    '</tr>';
                tbody.append(row);
            });
            
            return true;
        } else {
            // No data found
            $('#divGoalModSummaryStats').hide();
            $('#tblGoalModificationSummaryBody').empty();
            var noDataRow = '<tr><td colspan="12" style="text-align:center; padding:20px; color:#999; font-size:16px;">' +
                '<i class="fa fa-info-circle" style="font-size:24px; margin-bottom:10px;"></i><br/>' +
                'No records found for the selected criteria.</td></tr>';
            $('#tblGoalModificationSummaryBody').append(noDataRow);
            return false;
        }
    } else if (GoalModList.status == 204) {
        // No content - handle gracefully
        $('#divGoalModSummaryStats').hide();
        $('#tblGoalModificationSummaryBody').empty();
        var noDataRow = '<tr><td colspan="12" style="text-align:center; padding:20px; color:#999; font-size:16px;">' +
            '<i class="fa fa-info-circle" style="font-size:24px; margin-bottom:10px;"></i><br/>' +
            'No goal modification requests found for the selected filters.</td></tr>';
        $('#tblGoalModificationSummaryBody').append(noDataRow);
        return false;
    } else {
        // No data or error - show no data message
        $('#divGoalModSummaryStats').hide();
        $('#tblGoalModificationSummaryBody').empty();
        var noDataRow = '<tr><td colspan="12" style="text-align:center; padding:20px; color:#999; font-size:16px;">' +
            '<i class="fa fa-info-circle" style="font-size:24px; margin-bottom:10px;"></i><br/>' +
            'No data available for the selected filters.</td></tr>';
        $('#tblGoalModificationSummaryBody').append(noDataRow);
        return false;
    }
}

// Goal Modification Summary Report for Manager Handlers
$('#btnGoalModReportForManager').click(function () {
    // Show loader
    var $loaderContainer = $('<div class="report-loader-container" style="position: relative; min-height: 300px; margin: 20px 0; width: 100%; z-index: 10000;"></div>');
    var $loader = $('<div class="report-loader" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; min-height: 300px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.95); z-index: 10000; border: 1px solid #ddd; border-radius: 4px;"><div style="text-align: center;"><i class="fa fa-spinner fa-spin" style="font-size: 24px; color: #337ab7;"></i><br/><span style="margin-top: 10px; display: block; font-size: 14px;">Loading report...</span></div></div>');
    $loaderContainer.append($loader);
    $('#tblGoalModificationSummaryForManager').before($loaderContainer);
    $('#tblGoalModificationSummaryForManagerBody').html('<tr><td colspan="12" style="text-align:center; padding:20px;">Loading...</td></tr>');
    
    GetGoalModificationSummaryReportForManager();
});

$('#btnExportToExcelGoalModReportForManager').click(function () {
    // Show export loader
    var $exportLoader = $('<div class="export-loader" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10000; background: rgba(255,255,255,0.95); padding: 20px; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);"><div style="text-align: center;"><i class="fa fa-spinner fa-spin" style="font-size: 24px; color: #337ab7;"></i><br/><span style="margin-top: 10px; display: block; font-size: 14px;">Exporting report...</span></div></div>');
    $('body').append($exportLoader);
    
    setTimeout(function() {
        if (GetGoalModificationSummaryReportForManager()) {
            var dt = new Date();
            ExportCode('tblGoalModificationSummaryForManager', 'GoalModificationSummaryForManager_' + formatDate_DMYHM(dt) + '.xls');
        }
        $exportLoader.remove();
    }, 100);
});

function GetGoalModificationSummaryReportForManager() {
    var status = $('#ddlGoalModStatusForManager').val();
    var appraisalCycleId = $('#ddlRptAppCycle :selected').val();

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'Reports/GetGoalModificationSummaryForManager?dummy=1';
    
    if (appraisalCycleId && appraisalCycleId != 0) {
        apiPath += '&AppraisalCycleId=' + appraisalCycleId;
    }
    
    if (status) {
        apiPath += '&Status=' + status;
    }

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    var GoalModList = CommonAjaxGET(apiPath, headerInfo);
    
    // Remove loader
    $('.report-loader-container').remove();

    if (GoalModList.status == 200 && GoalModList.responseJSON.Success) {
        var data = GoalModList.responseJSON.Result;
        
        if (data && data.length > 0) {
            var totalRequests = data.length;
            var approvedCount = data.filter(x => x.Status === 'Approved').length;
            var rejectedCount = data.filter(x => x.Status === 'Rejected').length;
            var pendingCount = data.filter(x => x.Status === 'Pending').length;
            var uniqueEmployees = [...new Set(data.map(x => x.EmployeeId))].length;
            
            $('#statTotalRequestsForManager').text(totalRequests);
            $('#statApprovedForManager').text(approvedCount);
            $('#statRejectedForManager').text(rejectedCount);
            $('#statPendingForManager').text(pendingCount);
            $('#statUniqueEmployeesForManager').text(uniqueEmployees);
            
            var avgRequests = (data.reduce((sum, x) => sum + x.RequestCount, 0) / totalRequests).toFixed(2);
            $('#statAvgRequestCountForManager').text(avgRequests);
            $('#divGoalModSummaryStatsForManager').show();
            
            var tbody = $('#tblGoalModificationSummaryForManagerBody');
            tbody.empty();
            
            $.each(data, function (index, item) {
                var statusClass = '';
                if (item.Status === 'Approved') statusClass = 'text-success';
                else if (item.Status === 'Rejected') statusClass = 'text-danger';
                else if (item.Status === 'Pending') statusClass = 'text-warning';
                
                var requestDate = item.CreatedDate ? formatDate_DMY(new Date(item.CreatedDate)) : '';
                var approvedDate = item.ApprovedDate ? formatDate_DMY(new Date(item.ApprovedDate)) : '';
                
                var row = '<tr>' +
                    '<td>' + item.SrNo + '</td>' +
                    '<td>' + requestDate + '</td>' +
                    '<td>' + (item.EmployeeCode || '') + '</td>' +
                    '<td>' + (item.EmployeeName || '') + '</td>' +
                    '<td>' + (item.AppraisalCycleName || '') + '</td>' +
                    '<td class=\"' + statusClass + '\"><strong>' + item.Status + '</strong></td>' +
                    '<td>' + item.RequestCount + '</td>' +
                    '<td>' + (item.LocationName || '') + '</td>' +
                    '<td>' + (item.EmployeeDesignationName || '') + '</td>' +
                    '<td>' + (item.ApprovedByName || '') + '</td>' +
                    '<td>' + approvedDate + '</td>' +
                    '<td>' + (item.RejectionReason || '') + '</td>' +
                    '</tr>';
                tbody.append(row);
            });
            
            return true;
        } else {
            // No data found
            $('#divGoalModSummaryStatsForManager').hide();
            $('#tblGoalModificationSummaryForManagerBody').empty();
            var noDataRow = '<tr><td colspan="12" style="text-align:center; padding:20px; color:#999; font-size:16px;">' +
                '<i class="fa fa-info-circle" style="font-size:24px; margin-bottom:10px;"></i><br/>' +
                'No records found for the selected criteria.</td></tr>';
            $('#tblGoalModificationSummaryForManagerBody').append(noDataRow);
            return false;
        }
    } else if (GoalModList.status == 204) {
        // No content - handle gracefully
        $('#divGoalModSummaryStatsForManager').hide();
        $('#tblGoalModificationSummaryForManagerBody').empty();
        var noDataRow = '<tr><td colspan="12" style="text-align:center; padding:20px; color:#999; font-size:16px;">' +
            '<i class="fa fa-info-circle" style="font-size:24px; margin-bottom:10px;"></i><br/>' +
            'No goal modification requests found for your team members.</td></tr>';
        $('#tblGoalModificationSummaryForManagerBody').append(noDataRow);
        return false;
    } else {
        // No data or error - show no data message
        $('#divGoalModSummaryStatsForManager').hide();
        $('#tblGoalModificationSummaryForManagerBody').empty();
        var noDataRow = '<tr><td colspan="12" style="text-align:center; padding:20px; color:#999; font-size:16px;">' +
            '<i class="fa fa-info-circle" style="font-size:24px; margin-bottom:10px;"></i><br/>' +
            'No data available for the selected filters.</td></tr>';
        $('#tblGoalModificationSummaryForManagerBody').append(noDataRow);
        return false;
    }
}

// Normalization Report - Reusable function to load data
function LoadNormalizationReport() {
    var appraisalCycleId = $('#ddlRptAppCycle :selected').val();
    
    if (!appraisalCycleId || appraisalCycleId == 0) {
        // Don't show warning if called automatically - only if user clicks button
        return;
    }
    
    // Show smaller, better positioned loading indicator
    $('#imgLoadNormalization').css({
        'width': '50px',
        'height': '50px',
        'display': 'block',
        'margin': '20px auto'
    }).show();
    
    var svrPath = CONFIG.get('SERVERNAME');
    var loginEmpId = sessionStorage.EmployeeId || '';
    var apiPath = svrPath + 'Reports/GetNormalizationReport?AppraisalCycleId=' + appraisalCycleId + (loginEmpId ? '&LoginEmpId=' + loginEmpId : '');
    
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue,
        'X-EmpNo': sessionStorage.EmployeeId
    };
    
    CommonAjaxGET(apiPath, headerInfo).done(function (response) {
        $('#imgLoadNormalization').hide();
        
        if (response && response.Success) {
            var data = response.Result || [];
            
            // Check if DataTable is initialized
            if ($.fn.DataTable.isDataTable('#tblNormalizationReport')) {
                var table = $('#tblNormalizationReport').DataTable();
                table.clear();
                
                if (data && data.length > 0) {
                    // Add data to table
                    table.rows.add(data);
                    table.draw();
                    if (typeof toastr !== 'undefined') {
                        toastr.success('Report loaded successfully. Showing ' + data.length + ' record(s).');
                    }
                } else {
                    table.draw();
                    if (typeof toastr !== 'undefined') {
                        toastr.info('No data found for the selected Appraisal Cycle.');
                    }
                }
            } else {
                // Initialize DataTable with proper column mapping
                $('#tblNormalizationReport').DataTable({
                    data: data,
                    columns: [
                        { data: "Emp ID", defaultContent: "", title: "Emp ID" },
                        { data: "Emp Name", defaultContent: "", title: "Emp Name" },
                        { data: "Grade", defaultContent: "", title: "Grade" },
                        { data: "Past RMs", defaultContent: "", title: "Past RMs" },
                        { data: "Group Account", defaultContent: "", title: "Group Account" },
                        { data: "Talent Cube", defaultContent: "", title: "Talent Cube" },
                        { data: "Location", defaultContent: "", title: "Location" },
                        { data: "Gender", defaultContent: "", title: "Gender" },
                        { data: "Total Exp.", defaultContent: "", title: "Total Exp." },
                        { data: "Infogain Exp.", defaultContent: "", title: "Infogain Exp." },
                        { data: "FY-24 Rating", defaultContent: "", title: "FY-24 Rating" },
                        { data: "FY-25 Rating", defaultContent: "", title: "FY-25 Rating" },
                        { data: "Last Promotion Date", defaultContent: "", title: "Last Promotion Date" },
                        { data: "FY-26 Rating", defaultContent: "", title: "FY-26 Rating" },
                        { data: "FY-26 Promotion Reco.", defaultContent: "", title: "FY-26 Promotion Reco." },
                        { data: "Promotion Track", defaultContent: "", title: "Promotion Track" },
                        { data: "Reco. Designation", defaultContent: "", title: "Reco. Designation" },
                        { data: "Reco. Designation Consent", defaultContent: "", title: "Reco. Designation Consent" },
                        { data: "Criticality", defaultContent: "", title: "Criticality" },
                        { data: "Criticality Reason", defaultContent: "", title: "Criticality Reason" },
                        { data: "Attrition Risk", defaultContent: "", title: "Attrition Risk" },
                        { data: "Immediate Backup Name", defaultContent: "", title: "Immediate Backup Name" },
                        { data: "Successor Name (Long Term)", defaultContent: "", title: "Successor Name (Long Term)" },
                        { data: "Comments", defaultContent: "", title: "Comments" },
                        { data: "Action Status", defaultContent: "", title: "Action Status" }
                    ],
                    destroy: true,
                    paging: true,
                    searching: true,
                    info: true,
                    pageLength: 10,
                    lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
                    language: {
                        emptyTable: "No data available. Please select an Appraisal Cycle and click 'View Report'.",
                        zeroRecords: "No matching records found",
                        loadingRecords: "Loading...",
                        processing: "Processing..."
                    }
                });
                
                if (data && data.length > 0) {
                    if (typeof toastr !== 'undefined') {
                        toastr.success('Report loaded successfully. Showing ' + data.length + ' record(s).');
                    }
                } else {
                    if (typeof toastr !== 'undefined') {
                        toastr.info('No data found for the selected Appraisal Cycle.');
                    }
                }
            }
        } else {
            var errorMsg = 'Error loading report: ' + (response.ErrorMessage || 'Unknown error');
            if (typeof toastr !== 'undefined') {
                toastr.error(errorMsg);
            } else {
                alert(errorMsg);
            }
        }
    }).fail(function (xhr, status, error) {
        $('#imgLoadNormalization').hide();
        var failMsg = 'Failed to load report. Please try again.';
        if (typeof toastr !== 'undefined') {
            toastr.error(failMsg);
        } else {
            alert(failMsg);
        }
        console.error('GetNormalizationReport error:', error);
    });
}

// Normalization Report Handlers
$('#btnGetNormalizationReport').click(function () {
    var appraisalCycleId = $('#ddlRptAppCycle :selected').val();
    
    if (!appraisalCycleId || appraisalCycleId == 0) {
        toastr.warning('Please select an Appraisal Cycle.');
        return;
    }
    
    LoadNormalizationReport();
});

$('#btnExportToExcelNormalizationReport').click(function () {
    var appraisalCycleId = $('#ddlRptAppCycle :selected').val();
    
    if (!appraisalCycleId || appraisalCycleId == 0) {
        toastr.warning('Please select an Appraisal Cycle.');
        return;
    }
    
    if (!$.fn.DataTable.isDataTable('#tblNormalizationReport')) {
        toastr.warning('Please load the report first before exporting.');
        return;
    }
    
    var table = $('#tblNormalizationReport').DataTable();
    var data = table.rows({ search: 'applied' }).data();
    
    if (!data || data.length === 0) {
        toastr.warning('No data to export. Please load the report first.');
        return;
    }
    
    // Build Excel table from DataTable API so headers are included (scrollX can hide thead in DOM)
    var headers = [];
    var keys = [];
    table.columns().every(function () {
        headers.push($(this.header()).text().trim());
        var src = this.dataSrc();
        keys.push(typeof src === 'number' ? headers.length - 1 : src);
    });
    
    var tab_text = "<table border='2px'><tr bgcolor='#87AFC6'>";
    for (var h = 0; h < headers.length; h++) {
        tab_text += "<th>" + (headers[h] ? String(headers[h]).replace(/</g, '&lt;').replace(/>/g, '&gt;') : '') + "</th>";
    }
    tab_text += "</tr>";
    
    for (var i = 0; i < data.length; i++) {
        tab_text += "<tr>";
        var row = data[i];
        for (var k = 0; k < keys.length; k++) {
            var val = row[keys[k]];
            var cell = (val != null && val !== '') ? String(val).replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
            tab_text += "<td>" + cell + "</td>";
        }
        tab_text += "</tr>";
    }
    tab_text += "</table>";
    
    var dt = new Date();
    var filename = 'NormalizationReport_' + formatDate_DMYHM(dt) + '.xls';
    download(tab_text, filename, "application/vnd.ms-excel");
});
