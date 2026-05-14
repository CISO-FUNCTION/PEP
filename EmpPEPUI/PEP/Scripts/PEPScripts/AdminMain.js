$(document).ready(function () {
    if (sessionStorage.EmployeeRoleId == 1) {
        window.location.href = "/Error/NotAuthorized";
    } else {
        LoadAppraisalCycleMasterCtrl();
    }
    //  LoadGradeAreaCompetencyCtrl();
    // LoadQuestionnaireMasterCtrl();
    // LoadEmployeeAwardCtrl();
    // LoadEmployeeRoleCtrl();
});



$("#upload").on("click", function () {
    debugger;
    var regex = /^([a-zA-Z0-9\s_\\.\-:()])+(.csv|.xls)$/;
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "/EmployeeMaster/BulkUpload/";
    var empid = sessionStorage.EmployeeId;//JSON.parse(sessionStorage.EmployeeId);
    var message = "";
    var EmpRatingFile = new Array();

    var fileExtension = ['csv', 'xls'];
    if ($("#fileInput").val() != "") {

        if ($.inArray($("#fileInput").val().split('.').pop().toLowerCase(), fileExtension) == 0) {
            if (typeof (FileReader) != "undefined") {
                var reader = new FileReader();
                reader.readAsText($("#fileInput")[0].files[0]);
                reader.onload = function (e) {
                    var rows = e.target.result.split("\r\n");
                    console.log(rows);
                    for (var i = 1; i < rows.length; i++) {
                        var cells = rows[i].split(",");
                        if (cells.length > 1) {
                            var EmpRating = {};


                            if (JSON.parse(JSON.stringify(cells[0])) != null)
                                //if (JSON.parse(cells[0]) != null)
                            {
                                EmpRating.AppraisalCycleName = JSON.parse(JSON.stringify(cells[0]).trim()); //JSON.parse(cells[0]);
                            }
                            else {
                                alert("Please enter AppraisalCycleName in sheet");
                                return;
                            }
                            if (JSON.parse(JSON.stringify(cells[1])) != null)
                                //if (JSON.parse(cells[0]) != null)
                            {
                                EmpRating.EmployeeId = JSON.parse(JSON.stringify(cells[1]).trim()); //JSON.parse(cells[0]);
                            }
                            else {
                                alert("Please enter EmpID in sheet");
                                return;
                            }
                            if (JSON.parse(JSON.stringify(cells[2])) != null) {
                                EmpRating.Rating = JSON.parse(JSON.stringify(cells[2]).trim());// JSON.parse(cells[1]);
                            }
                            else {
                                alert("Please enter Rating in sheet");
                                return;
                            }

                            EmpRating.CreatedBy = empid;
                            EmpRating.ModifiedBy = empid;
                            EmpRatingFile.push(EmpRating);
                        }
                    }

                    console.log(EmpRatingFile);
                    debugger;
                    if (EmpRatingFile.length > 0) {
                        var data = CommonAjaxPOST_Array(apiPath, EmpRatingFile);
                        console.log(data);
                        //  debugger;
                        if (data.Result == 1) {
                            alert("Employee Rating Uploaded Successfully");
                            $("#fileInput").val("");
                        }
                        else if (data.Result == 2) {
                            alert("Group of EmpId,AppraisalCycleName column value should be unique in excel sheet.Please verify the excel sheet.");

                        }
                        else if (data.Result == 3) {
                            alert("De-Activated employee rating cannot be upload.Please verify the excel sheet.");

                        }
                        else if (data.Result == 4) {
                            alert("Rating Code should be matched with given excel format.Please verify the excel sheet.");

                        }
                        else if (data.Result == 5) {
                            alert("AppraisalCycleName isn't matched with given excel format.Please verify the excel sheet.");

                        }
                        else if (data.Success == false || data.Result == 0) {
                            alert("Excel format should be same with given excel format.Please verify the excel sheet.");
                        }

                        $("#fileInput").val("");
                    }

                }
            }
        }
        else {
            alert("Only formats are allowed : " + fileExtension.join(', '));
            //  $("#fileInput").val("");
        }
    }
    else {
        alert("Please select a file to upload.");
    }



});




$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    var target = $(e.target).attr("href") // activated tab

    if (target === "#tab_a") {
        LoadAppraisalCycleMasterCtrl();
    }
    else if (target === "#tab_b") {
        LoadQuestionnaireMasterCtrl();

    }
    else if (target === "#tab_c") {
        LoadGradeAreaCompetencyCtrl();
    }
    else if (target === "#tab_d") {
        LoadEmployeeAwardCtrl();
    }
    else if (target === "#tab_e") {
        LoadEmployeeRoleCtrl();
    }
    else if (target === "#tab_f") {
        LoadUploadKRAMasterCtrl();
    }
    else if (target === "#tab_g") {
        LoadGeneralSetupCtrl();
    }
    else if (target === "#tab_i") {
        LoadSelfAssessmentCycleMasterCtrl();
    }

});