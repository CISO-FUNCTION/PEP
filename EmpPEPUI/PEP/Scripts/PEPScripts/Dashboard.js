
// Helper function to show/hide dashboard loader
function ShowDashboardLoader(show) {
    if (show) {
        $('#dashboardLoader').show();
        $('#dashboardContent').hide();
    } else {
        $('#dashboardLoader').hide();
        $('#dashboardContent').show();
    }
}

$(document).ready(function () {

    $('#btnFeedbackReq').show();

    // Show loader and hide content initially
    ShowDashboardLoader(true);

    GetAllActiveAppraisalCycle();
    //BindFeedbacks('R', '#tblFeedbackNotGiven');
    //BindFeedbacks('B', '#tblKRANotSubmitted');
    //BindFeedbacks('G', '#tblFeedbackGtThan');

    //BindFeedbacks('Y', '#tblFeedbackLessThan');

    //BindFeedbacks('N', '#tblKRANotApproved');
    //BindFeedbacks('S', '#tblEmployeeSelfassessmentList');
    //BindFeedbacks('L', '#tblMyEmployeesSkipLevel');


    ///////// added by balmeek

    ///////Added by kaushal on 22 Dec 2024


    // Use setTimeout to ensure loader is visible before starting operations
    setTimeout(function() {
        var AppCycleId = $('#DBAppCycle :selected').val()
        var d = new Date();
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + 'AppraisalCycle/GetSelfAssesmentCycle?AppCycleId=' + AppCycleId;

        var AppraisalCycle = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

        $('#tblFeedbackNotGiven > #tblFeedbackNotGiven_head >tr').remove();
        $('#tblFeedbackNotGiven > tbody >tr').remove();
        BindFeedbacks('R', '#tblFeedbackNotGiven', AppraisalCycle);

        $('#tblKRANotSubmitted > tbody >tr').remove();
        BindFeedbacks('B', '#tblKRANotSubmitted', AppraisalCycle);

        $('#tblFeedbackGtThan > #tblFeedbackGtThan_head >tr').remove();
        $('#tblFeedbackGtThan > tbody >tr').remove();
        BindFeedbacks('G', '#tblFeedbackGtThan', AppraisalCycle);

        $('#tblFeedbackLessThan > tbody >tr').remove();
        BindFeedbacks('Y', '#tblFeedbackLessThan', AppraisalCycle);

        $('#tblKRANotApproved > tbody >tr').remove();
        BindFeedbacks('N', '#tblKRANotApproved', AppraisalCycle);


        $('#tblSelfAssessment > #tblSelfAssessment_head >tr').remove();
        $('#tblSelfAssessment > tbody >tr').remove();
        BindFeedbacks('S', '#tblEmployeeSelfassessmentList', AppraisalCycle);


        BindFeedbacks('P', '#tblPIPSummary');

        $('#tblMyEmployeesSkipLevel > #tblEmployeesSkipLevel_head >tr').remove();
        $('#tblMyEmployeesSkipLevel > tbody >tr').remove();

        ///////////////////////


        BindFeedbacks('L', '#tblMyEmployeesSkipLevel', AppraisalCycle);

        restoreDashboardYearAfterManagerFeedback();

        GetMyEmployeeList();
        
        // Fail-safe timeout - loader will be hidden by GetMyEmployeeList when async ops complete
        // But set a maximum timeout as backup
        setTimeout(function() {
            if ($('#dashboardLoader').is(':visible')) {
                ShowDashboardLoader(false);
            }
        }, 15000); // 15 second fail-safe
    }, 100); // Small delay to ensure loader is rendered

    setTimeout(function () {
        $('#tblFeedbackNotGiven_href').on('click', function (e) {
            e.preventDefault();

            var url = "/Dashboard/ViewAll?Id=3";
            $('#tblFeedbackNotGiven_hrefhidden').attr('href', url.concat('&param=' + $('#ddlFeedbackSubCycle').val() + '&param2=' + $('#DBAppCycle').val()));
            document.getElementById('tblFeedbackNotGiven_hrefhidden').click()
        })
    }, 500)


    setTimeout(function () {
        $('#tblFeedbackGtThan_href').on('click', function (e) {
            e.preventDefault();

            var url = "/Dashboard/ViewAll?Id=1";
            $('#tblFeedbackGtThan_hrefhidden').attr('href', url.concat('&param=' + $('#ddlFeedbackSubCycle1').val() + '&param2=' + $('#DBAppCycle').val()));
            document.getElementById('tblFeedbackGtThan_hrefhidden').click()
        })
    }, 500)

    setTimeout(function () {
        $('#KRANotSubmittedViewAll').on('click', function (e) {
            e.preventDefault();

            var url = "/Dashboard/ViewAll?Id=4";
            $('#KRANotSubmittedViewAll_hrefhidden').attr('href', url.concat('&param=' + $('#ddlFeedbackSubCycle1').val() + '&param2=' + $('#DBAppCycle').val()));
            document.getElementById('KRANotSubmittedViewAll_hrefhidden').click()
        })
    }, 500)

    setTimeout(function () {
        $('#KRANotApprovedkViewAll').on('click', function (e) {
            e.preventDefault();

            var url = "/Dashboard/ViewAll?Id=5";
            $('#KRANotApprovedkViewAll_hrefhidden').attr('href', url.concat('&param=' + $('#ddlFeedbackSubCycle1').val() + '&param2=' + $('#DBAppCycle').val()));
            document.getElementById('KRANotApprovedkViewAll_hrefhidden').click()
        })
    }, 500)

    setTimeout(function () {
        $('#EmployeeselfassessmentViewAll_href').on('click', function (e) {
            e.preventDefault();

            var url = "/Dashboard/ViewAll?Id=6";
            $('#EmployeeselfassessmentViewAll_hrefHidden').attr('href', url.concat('&param=' + $('#ddlFeedbackSubCycleAssesment').val() + '&param2=' + $('#DBAppCycle').val()));
            document.getElementById('EmployeeselfassessmentViewAll_hrefHidden').click()
        })
    }, 500)

    // $('#tblFeedbackNotGiven_href').attr('href', $('#tblFeedbackNotGiven_href').attr('href').concat(''))
});


function OnDBAppraisalCycleChange() {

    // Show loader when cycle changes
    ShowDashboardLoader(true);
    
    // Small delay to ensure loader is visible
    setTimeout(function() {
        var AppCycleId = $('#DBAppCycle :selected').val()
        var d = new Date();
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + 'AppraisalCycle/GetSelfAssesmentCycle?AppCycleId=' + AppCycleId;
        var AppraisalCycle = CommonAjaxGET(apiPath, CommonGetHeaderInfo());


        $('#tblFeedbackNotGiven > #tblFeedbackNotGiven_head >tr').remove();
        $('#tblFeedbackNotGiven > tbody >tr').remove();
        BindFeedbacks('R', '#tblFeedbackNotGiven', AppraisalCycle);

        //$('#tblKRANotSubmitted > thead >tr').remove();
        $('#tblKRANotSubmitted > tbody >tr').remove();
        BindFeedbacks('B', '#tblKRANotSubmitted', AppraisalCycle);

        $('#tblFeedbackGtThan > #tblFeedbackGtThan_head >tr').remove();
        $('#tblFeedbackGtThan > tbody >tr').remove();
        BindFeedbacks('G', '#tblFeedbackGtThan', AppraisalCycle);

        $('#tblFeedbackLessThan > tbody >tr').remove();
        BindFeedbacks('Y', '#tblFeedbackLessThan', AppraisalCycle);

        //$('#tblKRANotApproved > thead >tr').remove();
        $('#tblKRANotApproved > tbody >tr').remove();
        BindFeedbacks('N', '#tblKRANotApproved', AppraisalCycle);



        $('#tblSelfAssessment > #tblSelfAssessment_head >tr').remove();
        $('#tblSelfAssessment > tbody >tr').remove();
        BindFeedbacks('S', '#tblEmployeeSelfassessmentList', AppraisalCycle);


        $('#tblMyEmployeesSkipLevel > #tblEmployeesSkipLevel_head >tr').remove();
        $('#tblMyEmployeesSkipLevel > tbody >tr').remove();
        BindFeedbacks('L', '#tblMyEmployeesSkipLevel', AppraisalCycle);
        
        // GetMyEmployeeList will hide the loader when its async operations complete
        GetMyEmployeeList();
        
        // Fail-safe timeout for cycle change
        setTimeout(function() {
            if ($('#dashboardLoader').is(':visible')) {
                ShowDashboardLoader(false);
            }
        }, 15000);
    }, 100); // Small delay to ensure loader is rendered

    setTimeout(function () {
        $('#tblFeedbackNotGiven_href').on('click', function (e) {
            e.preventDefault();
            var url = "/Dashboard/ViewAll?Id=3";
            $('#tblFeedbackNotGiven_hrefhidden').attr('href', url.concat('&param=' + $('#ddlFeedbackSubCycle').val() + '&param2=' + $('#DBAppCycle').val()));
            document.getElementById('tblFeedbackNotGiven_hrefhidden').click()
        })
    }, 500)


    setTimeout(function () {
        $('#tblFeedbackGtThan_href').on('click', function (e) {
            e.preventDefault();
            var url = "/Dashboard/ViewAll?Id=1";
            $('#tblFeedbackGtThan_hrefhidden').attr('href', url.concat('&param=' + $('#ddlFeedbackSubCycle1').val() + '&param2=' + $('#DBAppCycle').val()));
            document.getElementById('tblFeedbackGtThan_hrefhidden').click()
        })
    }, 500)

    setTimeout(function () {
        $('#EmployeeselfassessmentViewAll_href').on('click', function (e) {
            e.preventDefault();
            var url = "/Dashboard/ViewAll?Id=6";
            $('#EmployeeselfassessmentViewAll_hrefHidden').attr('href', url.concat('&param=' + $('#ddlFeedbackSubCycleAssesment').val() + '&param2=' + $('#DBAppCycle').val()));
            document.getElementById('EmployeeselfassessmentViewAll_hrefHidden').click()
        })
    }, 500)

    setTimeout(function () {
        $('#KRANotSubmittedViewAll').on('click', function (e) {
            e.preventDefault();
            var url = "/Dashboard/ViewAll?Id=4";
            $('#KRANotSubmittedViewAll_hrefhidden').attr('href', url.concat('&param=' + $('#ddlFeedbackSubCycle1').val() + '&param2=' + $('#DBAppCycle').val()));
            document.getElementById('KRANotSubmittedViewAll_hrefhidden').click()
        })
    }, 500)

    setTimeout(function () {
        $('#KRANotApprovedkViewAll').on('click', function (e) {
            e.preventDefault();
            var url = "/Dashboard/ViewAll?Id=5";
            $('#KRANotApprovedkViewAll_hrefhidden').attr('href', url.concat('&param=' + $('#ddlFeedbackSubCycle1').val() + '&param2=' + $('#DBAppCycle').val()));
            document.getElementById('KRANotApprovedkViewAll_hrefhidden').click()
        })
    }, 500)

}

/** After Manager Feedback submit redirect: re-apply half-year / perform-cycle on sub-dropdowns and refresh R/G widgets. */
function restoreDashboardYearAfterManagerFeedback() {
    var yb = sessionStorage.getItem('dashboardRestoreYearBreakCheck');
    if (!yb) return;
    sessionStorage.removeItem('dashboardRestoreYearBreakCheck');
    function setYearIfPresent(selectSelector) {
        var $el = $(selectSelector);
        if (!$el.length) return;
        var $o = $el.find('option').filter(function () {
            return String($(this).val()) === String(yb);
        });
        if ($o.length) {
            $el.val($o.first().val());
        }
    }
    setYearIfPresent('#ddlFeedbackSubCycle');
    setYearIfPresent('#ddlFeedbackSubCycle1');
    setYearIfPresent('#ddlFeedbackSubCycleAssesment');
    setYearIfPresent('#ddlFeedbackSkipLevel');
    if (typeof BindFeedbackGivenNot === 'function') {
        BindFeedbackGivenNot('R', '#tblFeedbackNotGiven');
        BindFeedbackGivenNot('G', '#tblFeedbackGtThan');
    }
}


function GetAllActiveAppraisalCycle() {

    var d = new Date();
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'AppraisalCycle/GetAllActiveAppraisalCycle';
    AppraisalCycle = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    $('#DBAppCycle').empty();

    $.each(AppraisalCycle.responseJSON.Result.data, function (index, data) {

        $('#DBAppCycle').append($("<option>").val(data.AppraisalCycleId).text(data.AppraisalCycleName));

    });

    try {
        var restoreCycleId = sessionStorage.getItem('dashboardRestoreAppraisalCycleId');
        if (restoreCycleId) {
            var $optCycle = $('#DBAppCycle option').filter(function () {
                return String($(this).val()) === String(restoreCycleId);
            });
            if ($optCycle.length) {
                $('#DBAppCycle').val($optCycle.first().val());
            }
            sessionStorage.removeItem('dashboardRestoreAppraisalCycleId');
        }
    } catch (eDb) { /* ignore */ }

    //$.each(AppraisalCycle.responseJSON.Result.data, function (index, data) {

    //    if (data.AppraisalCycleId == $('#AppCycle :selected').val()) {

    //        var enddate = formatDate_DMY(data.EndDate);
    //        $('#txtKRAEndDate').val(enddate);
    //    }

    //});


}

function FillAppraisalHalfyearCycleFeedback(AppraisalCycle) {

    //One

    //var AppCycleId = $('#DBAppCycle :selected').val()
    //var d = new Date();
    //var svrPath = CONFIG.get('SERVERNAME');
    //var apiPath = svrPath + 'AppraisalCycle/GetSelfAssesmentCycle?AppCycleId=' + AppCycleId;
    //var AppraisalCycle = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    $('#ddlFeedbackSubCycle').empty();
    $.each(AppraisalCycle.responseJSON.Result.data, function (index, data) {
        $('#ddlFeedbackSubCycle').append($("<option>").val(data.YearBreakCheck).text(data.AppraisalCycleName));

    });

}
function FillAppraisalHalfyearCycleAssessment(AppraisalCycle) {
    //Two
    //var AppCycleId = $('#DBAppCycle :selected').val()
    //var d = new Date();
    //var svrPath = CONFIG.get('SERVERNAME');
    //var apiPath = svrPath + 'AppraisalCycle/GetSelfAssesmentCycle?AppCycleId=' + AppCycleId;
    //var AppraisalCycle = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    $('#ddlFeedbackSubCycleAssesment').empty();
    $.each(AppraisalCycle.responseJSON.Result.data, function (index, data) {
        $('#ddlFeedbackSubCycleAssesment').append($("<option>").val(data.YearBreakCheck).text(data.AppraisalCycleName));
    });
}

function FillHalfyearCycleSkipLevel(AppraisalCycle) {

    //Three
    //var AppCycleId = $('#DBAppCycle :selected').val()
    //var d = new Date();
    //var svrPath = CONFIG.get('SERVERNAME');
    //var apiPath = svrPath + 'AppraisalCycle/GetSelfAssesmentCycle?AppCycleId=' + AppCycleId;
    //var AppraisalCycle = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    $('#ddlFeedbackSkipLevel').empty();
    $.each(AppraisalCycle.responseJSON.Result.data, function (index, data) {
        $('#ddlFeedbackSkipLevel').append($("<option>").val(data.YearBreakCheck).text(data.AppraisalCycleName));

    });

}


function FillAppraisalHalfyearCycleFeedback1(AppraisalCycle) {
    
    // Four
    //var AppCycleId = $('#DBAppCycle :selected').val()
    //var d = new Date();
    //var svrPath = CONFIG.get('SERVERNAME');
    //var apiPath = svrPath + 'AppraisalCycle/GetSelfAssesmentCycle?AppCycleId=' + AppCycleId;
    //var AppraisalCycle = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    $('#ddlFeedbackSubCycle1').empty();
    $.each(AppraisalCycle.responseJSON.Result.data, function (index, data) {
        $('#ddlFeedbackSubCycle1').append($("<option>").val(data.YearBreakCheck).text(data.AppraisalCycleName));

    });


}

function GetMyEmployeeList() {

    var managerId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;
    var apprisalCycleId = $('#DBAppCycle :selected').val();// sessionStorage.AppraisalCycleId;
    var selectedCycleAssessment = $('#ddlFeedbackSubCycleAssesment :selected').val();

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'ManagerDashboard?ManagerId=' + managerId + '&AppraisalCycleId=' + apprisalCycleId + '&SelectSubcycle=' + selectedCycleAssessment + '&selfAssesment=show';
    
    // Track async operations
    var asyncOperations = 0;
    var totalAsyncOps = 2; // Two async calls in this function
    
    var checkAllComplete = function() {
        asyncOperations++;
        if (asyncOperations >= totalAsyncOps) {
            // All async operations complete, hide loader
            setTimeout(function() {
                ShowDashboardLoader(false);
            }, 300);
        }
    };
    
    CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (data) {
        FillMyEmployeesList(data, selectedCycleAssessment, apprisalCycleId);
        checkAllComplete();
    }).fail(function() {
        checkAllComplete();
    });

    var selectEmpSKipLevel = $('#ddlFeedbackSkipLevel :selected').val();
    var apiPath = svrPath + 'ManagerDashboard?ManagerId=' + managerId + '&AppraisalCycleId=' + apprisalCycleId + '&SelectSubcycle=' + selectEmpSKipLevel;
    CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (data) {
        FillMyEmployeesListSkipLevel(data, apprisalCycleId);
        checkAllComplete();
    }).fail(function() {
        checkAllComplete();
    });

    //var apiPath = svrPath + 'Team?id=' + managerId + '&AppraisalCycleId=' + apprisalCycleId + '&viewAwardsMode=show';
    //CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (data) {
    //    FillMyTeamAwards(data);
    //  });


}

function FillMyEmployeesList(SubordinateListEmployee, selectedCycleAssessment, apprisalCycleId) {

    var count = 0;

    if (SubordinateListEmployee.Success) {
        var InnerText = '';
        var TotalCount = '';
        var TotalCount = SubordinateListEmployee.Result.data.length;
        if (TotalCount > 0) {
            $("#myEmpsCountSelfAssesment").text(' ' + TotalCount);
        }

    }
    else {
        $("#myEmpsCountSelfAssesment").text('  0');
    }

    if (SubordinateListEmployee.Success) {

        $.each(SubordinateListEmployee.Result.data, function (index, item) {

            if (count < 5) {
                var row = '';
                var empid = item.EmployeeId;
                var selfstatus = '';
                if (item.Selfassesment == 1) {

                    selfstatus = 'Submitted';
                } else {

                    selfstatus = 'Not Submitted';
                }
                var Name = '';

                Name = item.FirstName + " " + item.LastName;


                if (item.Selfassesment == 1) {
                    row = '<tr><td colspan="4"><form action="/Feedback/ViewSelfAssessmentFeedback" method="Post" id="S' + empid + '"><a href=":javascript" title="' + Name + '" onclick="document.getElementById(\'S' + empid + '\').submit();event.preventDefault();">' + Name + " - " + item.NewEmployeeCode + '</a><input type="hidden" id="Id" name="Id" value="' + empid + '"><input type="hidden" id="Name" name="Name" value="' + Name + '"><input type="hidden" id="selectedCycleAssessment" name="selectedCycleAssessment" value="' + selectedCycleAssessment + '"><input type="hidden" id="ddlAppCycleId" name="ddlAppCycleId" value="' + apprisalCycleId + '"> </form></td><td>' + selfstatus + '</td></tr>';
                }
                else {
                    row = '<tr><td colspan="3">' + "" + item.FirstName + " " + item.LastName + ' - ' + item.NewEmployeeCode + '</td><td colspan="2">' + selfstatus + '</td></tr>';

                }

                $('#tblSelfAssessment').append(row);
                row = '';
                count = count + 1;
            }

        });
        if (SubordinateListEmployee.Result.data.length > 5) {
            $('#EmployeeselfassessmentViewAll').css("display", "block");
        }
        else {
            $('#EmployeeselfassessmentViewAll').css("display", "none");
        }

    }
    else {

        var row = '';
        if (count == 0) {
            for (var i = 0; i < (4 - count); i++) {

                row = '<tr><td  colspan="3">' + "-" + '</td><td></td><td></td></tr>';
                $('#tblSelfAssessment').append(row);
                row = '';
            }
        }
        row = '<tr ><td colspan="3">' + "No data available." + '</td><td></td><td></td></tr>';

        $('#tblSelfAssessment').append(row);
        row = '';

        $('#EmployeeselfassessmentViewAll').css("display", "none");
    }
    if (count < 5 && count != 0) {
        for (var i = 0; i < (5 - count); i++) {

            row = '<tr><td colspan="5">' + "-" + '</td></tr>';
            $('#tblSelfAssessment').append(row);
            row = '';
        }
    }
}

function FillMyEmployeesListSkipLevel(SubordinateListSkipLevel, apprisalCycleId) {

    if (SubordinateListSkipLevel.Success) {
        $("#myEmpsCountSkipLevel").text('(' + SubordinateListSkipLevel.Result.data.length + ')');
    }
    else {
        $("#myEmpsCountSkipLevel").text(' 0');
    }

    var count = 1;

    if (SubordinateListSkipLevel.Success) {
        row = "<tr><td colspan='4'><b>Employee Name</b></td><td colspan='1'><b>Reporting Manager</b></td><td colspan='1'><b>Status</b></td><td colspan='2'></td></tr>"
        $('#tblMyEmployeesSkipLevel').append(row);
        row = '';
        var selectedyear = '';
        var selectedyeartext = '';

        selectedyear = $('#ddlFeedbackSkipLevel :selected').val();
        selectedyeartext = $('#ddlFeedbackSkipLevel :selected').val();
        $.each(SubordinateListSkipLevel.Result.data, function (index, item) {

            var row = '';
            // var empId = 0;
            //   var ename = item.FirstName;

            var empId = item.ToEmployeeId;
            var ename = item.FirstName;

            var FeedbackCheck = item.KRA;

            var FeedbackStatus = '';

            if (FeedbackCheck == 1) {
                FeedbackStatus = "Given";
            }
            else {
                FeedbackStatus = "Not Given";
            }


            row = '<tr><td colspan="4"><form>' + ename + '</td><td colspan="1">' + item.RN + '</form><td colspan="1">' + FeedbackStatus + ' </td></td><td colspan="2"><form action="/Feedback/ManagerFeebackSkipLevel" method="Post" id="L' + empId + '"><a href=":javascript" onclick="event.preventDefault();document.getElementById(\'L' + empId + '\').submit();">View/Give Feedback</a><input type="hidden" id="Id" name="Id" value="' + empId + '"><input type="hidden" id="Name" name="Name" value="' + ename + '"><input type="hidden" id="selectedyear" name="selectedyear" value="' + selectedyear + '"><input type="hidden" id="ddlAppCycleId" name="ddlAppCycleId" value="' + apprisalCycleId + '"></form></td></tr>';

            $('#tblMyEmployeesSkipLevel').append(row);
            row = '';

        });

    }
    else {

        count = 0
    }


    var row = '';
    if (count == 0) {
        row = '<tr><td colspan="6">' + "No data available." + '</td><td></td><td></td></tr>';
        $('#tblMyEmployeesSkipLevel').append(row);
        row = '';
    }
}

//$("#tblMyEmployeesSkipLevel").DataTable({
//    data: SubordinateListSkipLevel.Result.data,
//    "sPaginationType": "full_numbers",
//    "iDisplayLength":30,
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
//       {
//           "render": function (data, type, row, meta) {
//               return row.FirstName;
//           },
//           "width": "60%" //new code added

//       },
//        {
//            "render": function (data, type, row, meta) {
//                return row.RN;
//            },
//            "width": "30%" //new code added

//        },
//    {
//        "render": function (data, type, row, meta) {
//            var empId = row.ToEmployeeId;
//            var ename = CommonGetName(row.FirstName, row.LastName);

//            var link = '<form action="/Feedback/ManagerFeebackSkipLevel" method="Post" id="E' + empId + '"><a href=":javascript" onclick="event.preventDefault();document.getElementById(\'E' + empId + '\').submit();">View|Give Feedback</a><input type="hidden" id="Id" name="Id" value="' + empId + '"><input type="hidden" id="Name" name="Name" value="' + ename + '"></form>';
//            return link;
//        },
//        "aoColumnDefs": [{
//            'bSortable': true,
//            'aTargets': [0]
//        }]

//    }
//    ]

//});



function FillMyTeamAwards(awardsList) {
    if (awardsList.Success) {
        $("#myTeamCount").text('(' + awardsList.Result.length + ')');
    }

    $("#tblMyTeamAwrds").DataTable({
        data: awardsList.Result,
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
                    return CommonGetName(row.FirstName, row.LastName);
                },
                "width": "60%" //new code added
            },
            {
                "render": function (data, type, row, meta) {
                    var empAwardDate = GetAwardDate(row);
                    return empAwardDate;
                },
                "orderable": false  //new code added 
            }
        ]
    });

}

function GetAwardDate(row) {
    var awardDateString = row.AwardDate.replace("T", "-")
    var award_date = new Date(awardDateString.replace(/-/g, "/"));
    var empAwardDate = award_date.toLocaleString("en-us", { month: "long" }) + ' ' + award_date.getFullYear();
    return empAwardDate;
}

// Helper function to show/hide box-specific loader
function ShowBoxLoader(boxId, show) {
    var boxElement = null;
    
    // Map Color to box ID
    if (boxId === 'R' || boxId === 'DivNotGiven') {
        boxElement = $('#DivNotGiven');
    } else if (boxId === 'G' || boxId === 'DivGtThan5') {
        boxElement = $('#DivGtThan5');
    } else if (boxId === 'S' || boxId === 'DivselfAssesment') {
        boxElement = $('#DivselfAssesment');
    } else if (boxId === 'L' || boxId === 'dvMyEmployeesListSkipLevel') {
        boxElement = $('#dvMyEmployeesListSkipLevel');
    } else {
        // Try to find by ID directly
        boxElement = $('#' + boxId);
    }
    
    if (boxElement.length === 0) {
        console.warn('Box element not found for:', boxId, 'Tried selectors:', 
            boxId === 'R' ? '#DivNotGiven' : 
            boxId === 'G' ? '#DivGtThan5' : 
            boxId === 'S' ? '#DivselfAssesment' : 
            boxId === 'L' ? '#dvMyEmployeesListSkipLevel' : '#' + boxId);
        return;
    }
    
    // Ensure the box has position: relative for absolute loader positioning
    if (boxElement.css('position') === 'static') {
        boxElement.css('position', 'relative');
    }
    
    var loaderId = 'boxLoader_' + boxId;
    var existingLoader = boxElement.find('#' + loaderId);
    
    if (show) {
        if (existingLoader.length === 0) {
            var loaderHtml = '<div id="' + loaderId + '" class="box-loader" style="display: flex;">' +
                '<div class="loader-content">' +
                '<i class="fa fa-spinner fa-spin"></i>' +
                '<span>Loading...</span>' +
                '</div>' +
                '</div>';
            boxElement.append(loaderHtml);
            console.log('Loader created for box:', boxId, 'Element:', boxElement.length, 'Box ID:', boxElement.attr('id'));
        } else {
            existingLoader.show();
            console.log('Loader shown for box:', boxId);
        }
    } else {
        if (existingLoader.length > 0) {
            existingLoader.hide();
            console.log('Loader hidden for box:', boxId);
        } else {
            console.warn('Loader not found to hide for box:', boxId);
        }
    }
}

function BindFeedbackGivenNot(Color, TableId) {
    console.log('BindFeedbackGivenNot called with Color:', Color, 'TableId:', TableId);
    
    // Show box-specific loader immediately
    ShowBoxLoader(Color, true);
    console.log('Loader shown for Color:', Color);
    
    // Fail-safe timeout - hide loader after maximum time
    var failSafeTimeout = setTimeout(function() {
        console.warn('Fail-safe timeout reached for Color:', Color);
        ShowBoxLoader(Color, false);
    }, 15000); // 15 second fail-safe

    // Small delay to ensure loader is visible before API call
    setTimeout(function() {
        var selectedyear = '';
        var selectedyeartext = '';
        if (Color == 'R') {
            selectedyear = $('#ddlFeedbackSubCycle :selected').val();
            selectedyeartext = $('#ddlFeedbackSubCycle :selected').text();
            console.log('R - selectedyear:', selectedyear, 'selectedyeartext:', selectedyeartext);
        }
        if (Color == 'G') {
            selectedyear = $('#ddlFeedbackSubCycle1 :selected').val();
            selectedyeartext = $('#ddlFeedbackSubCycle1 :selected').text();
            console.log('G - selectedyear:', selectedyear, 'selectedyeartext:', selectedyeartext);
        }

        var appraisalCycleId = $('#DBAppCycle :selected').val();
        var FromEmployeeId = sessionStorage.EmployeeId;
        var svrPath = CONFIG.get('SERVERNAME');

        if (Color == 'R' || Color == 'G') {
            try {
                var apiPath = svrPath + "ManagerDashboard?AppraisalCycleId=" + appraisalCycleId + "&FromEmployeeId=" + FromEmployeeId + "&ActionTypeId=1&Color=" + Color + "&selectedyear=" + selectedyear;
                console.log('Calling API:', apiPath);
                var FeedbackLessThan = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
                console.log('API Response:', FeedbackLessThan);
                
                // Process response after a small delay to ensure loader was visible
                setTimeout(function() {
                    processFeedbackResponseForRG(Color, TableId, FeedbackLessThan, selectedyear, appraisalCycleId, failSafeTimeout);
                }, 100);
            } catch (error) {
                console.error('Error calling ManagerDashboard API:', error);
                clearTimeout(failSafeTimeout);
                ShowBoxLoader(Color, false);
                return;
            }
        }
        
    }, 100); // End of setTimeout for R/G colors
    
    // Handle S and L colors (outside setTimeout since they use async calls)
    if (Color == 'S') {
        // Small delay to ensure loader is visible
        setTimeout(function() {
            var managerIds = sessionStorage.EmployeeId;
            var apprisalCycleId = $('#DBAppCycle :selected').val();
            var selectedCycleAssessment = $('#ddlFeedbackSubCycleAssesment :selected').val();
            var svrPath = CONFIG.get('SERVERNAME');
            var apiPath = svrPath + 'ManagerDashboard?ManagerId=' + managerIds + '&AppraisalCycleId=' + apprisalCycleId + '&SelectSubcycle=' + selectedCycleAssessment + '&selfAssesment=show';
            var failSafeTimeoutS = failSafeTimeout; // Capture timeout for this scope
            
            console.log('S - Calling API:', apiPath);
            var response = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
            console.log('S - API Response:', response);
            
            // Process response after a small delay to ensure loader was visible
            setTimeout(function() {
                try {
                    var data = null;
                    if (response && response.responseJSON) {
                        data = response.responseJSON;
                    } else if (response && response.responseText) {
                        try {
                            data = JSON.parse(response.responseText);
                        } catch (e) {
                            console.error('Error parsing response:', e);
                        }
                    } else {
                        data = response;
                    }
                    
                    if (data && data.Success) {
                        $("#tblSelfAssessment tbody").html('');
                        FillMyEmployeesList(data, selectedCycleAssessment, apprisalCycleId);

                        var count = data.Result.data.length;
                        if (count > 5) {
                            $('#EmployeeselfassessmentViewAll_href').css("display", "block");
                        }
                        else {
                            $('#EmployeeselfassessmentViewAll_href').css('display', "none");
                        }
                    } else {
                        console.error('S - API call failed or no success');
                        $("#tblSelfAssessment tbody").html('<tr><td colspan="5">No data available.</td></tr>');
                    }
                } catch (error) {
                    console.error('S - Error processing response:', error);
                    $("#tblSelfAssessment tbody").html('<tr><td colspan="5">Error loading data.</td></tr>');
                }
                
                // Hide loader after data is loaded
                clearTimeout(failSafeTimeoutS);
                ShowBoxLoader(Color, false);
            }, 100);
        }, 100);
    }
    
    if (Color == 'L') {
        // Small delay to ensure loader is visible
        setTimeout(function() {
            var managerIdSKipLvl = sessionStorage.EmployeeId;
            var apprisalCycleId = $('#DBAppCycle :selected').val();
            var selectEmpSKipLevel = $('#ddlFeedbackSkipLevel :selected').val();
            var svrPath = CONFIG.get('SERVERNAME');
            var apiPath = svrPath + 'ManagerDashboard?ManagerId=' + managerIdSKipLvl + '&AppraisalCycleId=' + apprisalCycleId + '&SelectSubcycle=' + selectEmpSKipLevel;
            var failSafeTimeoutL = failSafeTimeout; // Capture timeout for this scope
            
            console.log('L - Calling API:', apiPath);
            var response = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
            console.log('L - API Response:', response);
            
            // Process response after a small delay to ensure loader was visible
            setTimeout(function() {
                try {
                    var data = null;
                    if (response && response.responseJSON) {
                        data = response.responseJSON;
                    } else if (response && response.responseText) {
                        try {
                            data = JSON.parse(response.responseText);
                        } catch (e) {
                            console.error('Error parsing response:', e);
                        }
                    } else {
                        data = response;
                    }
                    
                    if (data && data.Success) {
                        $("#tblMyEmployeesSkipLevel tbody").html('');
                        FillMyEmployeesListSkipLevel(data, apprisalCycleId);
                    } else {
                        console.error('L - API call failed or no success');
                        $("#tblMyEmployeesSkipLevel tbody").html('<tr><td colspan="8">No data available.</td></tr>');
                    }
                } catch (error) {
                    console.error('L - Error processing response:', error);
                    $("#tblMyEmployeesSkipLevel tbody").html('<tr><td colspan="8">Error loading data.</td></tr>');
                }
                
                // Hide loader after data is loaded
                clearTimeout(failSafeTimeoutL);
                ShowBoxLoader(Color, false);
            }, 100);
        }, 100);
    }
}

// Helper function to process feedback response for R and G colors
function processFeedbackResponseForRG(Color, TableId, FeedbackLessThan, selectedyear, appraisalCycleId, failSafeTimeout) {
    var count = 0;
    
    if (FeedbackLessThan && FeedbackLessThan.responseJSON && FeedbackLessThan.responseJSON.Success) {
            var div = 'div';
            if (Color == "R") {
                $("#tblFeedbackNotGiven tbody").html('');
                if (Color == 'R') {
                    var InnerText = '';
                    TotalCount = FeedbackLessThan.responseJSON.Result.FeedbackCount.data.length;
                    if (TotalCount > 0) {

                        $("#myEmpsCountfeednotgiven").text(' ' + TotalCount);
                        InnerText = '<h5>Feedback not Given</h5>';
                        $('#tblFeedbackNotGiven tr').find('th:nth-child(1),th:nth-child(1)').html(InnerText);
                    }
                    else {
                        $("#myEmpsCountfeednotgiven").text(' ' + TotalCount);
                        InnerText = '<h5>Feedback not Given</h5>';
                        $('#tblFeedbackNotGiven tr').find('th:nth-child(1),th:nth-child(1)').html(InnerText);
                    }

                }
            }
            if (Color == "G") {
                $("#tblFeedbackGtThan tbody").html('');
            }
            $.each(FeedbackLessThan.responseJSON.Result.FeedbackCount.data, function (index, item) {

                if (count < 5) {
                    var row = '';
                    var empId = item.ToEmployeeId;
                    var ename = item.FirstName.trim();
                    if (Color == 'R') {
                        row = '<tr><td colspan="3"><form action="/Feedback/ManagerFeeback" method="Post" id="R' + empId + '"><a href=":javascript" title="Feedback give to ' + ename + '" onclick="document.getElementById(\'R' + empId + '\').submit();event.preventDefault();">' + ename + '</a><input type="hidden" id="Id" name="Id" value="' + empId + '"><input type="hidden" id="Name" name="Name" value="' + ename + '"><input type="hidden" id="selectedyear" name="selectedyear" value="' + selectedyear + '"> <input type="hidden" id="appraisalCycleId" name="appraisalCycleId" value="' + appraisalCycleId + '"></form></tr>';


                    }
                    else if (Color == 'G') {

                        row = '<tr><td  colspan="2"><form action="/Feedback/GiveManagerFeedback" method="Post" id="V' + empId + '"><a href=":javascript" title="View Feedback" onclick="document.getElementById(\'V' + empId + '\').submit();event.preventDefault();">' + ename + '</a><input type="hidden" id="Id" name="Id" value="' + empId + '"><input type="hidden" id="Name" name="Name" value="' + ename + '"><input type="hidden" id="YearCycle" name="YearCycle" value="' + selectedyear + '"><input type="hidden" id="appraisalCycleId" name="appraisalCycleId" value="' + appraisalCycleId + '"></form></td>';
                           // < td colspan = "1" > <form action="/Feedback/ManagerFeeback" method="Post" id="G' + empId + '"><a href=":javascript" title="Give more feedback" onclick="document.getElementById(\'G' + empId + '\').submit();event.preventDefault();">Give more feedback</a><input type="hidden" id="Id" name="Id" value="' + empId + '"><input type="hidden" id="Name" name="Name" value="' + ename + '"> <input type="hidden" id="selectedyear" name="selectedyear" value="' + selectedyear + '"><input type="hidden" id="appraisalCycleId" name="appraisalCycleId" value="' + appraisalCycleId + '"></form></td></tr>';
                    }

                    else { }
                    if (Color == "R") {
                        $("#tblFeedbackNotGiven tbody").append(row);
                    }
                    if (Color == "G") {
                        $("#tblFeedbackGtThan tbody").append(row);
                    }

                    row = '';
                    count = count + 1;
                }

            });

            // $("#tblFeedbackNotGiven tbody").html(row);
            if (Color != 'N' && Color != 'B') {

                var j = 1;
                if (count < 6) {
                    for (var i = 0; i < (5 - count); i++) {
                        var row = '';
                        row = '<tr><td>' + "-" + '</td><td></td><td></td></tr>';
                        $(TableId).append(row);
                        row = '';
                        j++;
                    }

                }

                if (j == 5 && count == 0) {
                    row = '<tr><td>' + "No data available." + '</td><td></td><td></td></tr>';
                    $(TableId).append(row);
                    row = '';
                }
            }
            
            // Calculate TotalCount and update View All links
            var TotalCount = 0;
            if (FeedbackLessThan.responseJSON.Result != undefined) {
                TotalCount = FeedbackLessThan.responseJSON.Result.FeedbackCount.data.length;
            }
            
            if (Color == 'R') {
                if (TotalCount > 5) {
                    $('#tblFeedbackNotGiven_href').css("display", "block");
                }
                else {
                    $('#tblFeedbackNotGiven_href').css('display', "none");
                }
            }
            if (Color == 'G') {
                if (TotalCount > 5) {
                    $('#tblFeedbackGtThan_href').css("display", "block");
                }
                else {
                    $('#tblFeedbackGtThan_href').css('display', "none");
                }
                
                // Update count for G
                if (TotalCount > 0) {
                    $("#myEmpsCountGtThan").text(' ' + TotalCount);
                }
                else {
                    $("#myEmpsCountGtThan").text(' 0');
                }
            }
            
            // Hide loader after data is loaded
            clearTimeout(failSafeTimeout);
            ShowBoxLoader(Color, false);
            console.log('Loader hidden for Color:', Color);

        }
        else {
            console.error('API call failed or no response');
            // Show empty state
            if (Color == 'R') {
                $("#tblFeedbackNotGiven tbody").html('<tr><td colspan="3">No data available.</td></tr>');
            }
            if (Color == 'G') {
                $("#tblFeedbackGtThan tbody").html('<tr><td colspan="3">No data available.</td></tr>');
            }
            
            // Hide loader even if no data
            clearTimeout(failSafeTimeout);
            ShowBoxLoader(Color, false);
            console.log('Loader hidden for Color (no data):', Color);
        }
}
function BindFeedbacks(Color, TableId, AppraisalCycle) {

    // $("#tblFeedbackNotGiven").remove(row);
  

    if (Color == 'G') {

        $("#tblFeedbackGtThan_head").append('<tr valign="top"><td colspan="3"><span style="color: #77b430">Feedback Given</span><select class="form-control" style="width: 60%;float:right;" id="ddlFeedbackSubCycle1"  onchange=BindFeedbackGivenNot("G","#tblFeedbackGtThan")></select></td></tr>');
        FillAppraisalHalfyearCycleFeedback1(AppraisalCycle);
    }
    if (Color == 'R') {

        $("#tblFeedbackNotGiven_head").append('<tr valign="top"><td colspan="3"><span style="color: #F44336">Feedback not Given</span><select class="form-control" style="width: 60%;float:right;" id="ddlFeedbackSubCycle"  onchange=BindFeedbackGivenNot("R","#tblFeedbackNotGiven")></select></td></tr>');
        FillAppraisalHalfyearCycleFeedback(AppraisalCycle);
    }
    if (Color == 'S') {
        $("#tblSelfAssessment_head").append('<tr valign="top"><td colspan="5"><span style="color: #e0d872">Self-Assessment Detail</span><select class="form-control" style="width: 57%;float:right;" id="ddlFeedbackSubCycleAssesment"  onchange=BindFeedbackGivenNot("S","#tblSelfAssessment")></select></td></tr>');
        FillAppraisalHalfyearCycleAssessment(AppraisalCycle);
        return false;
    }
    if (Color == 'P') {
        $("#tblPIPSummary_head").append('<tr valign="top"><td colspan="5"><span style="color: #77b430">PIP Detail</span></td></tr>');
        //return false;
    }


    if (Color == 'L') {

        $("#tblEmployeesSkipLevel_head").append('<tr valign="top"><td colspan="4"><span style="color: #000000">Skip Level Employee</span></td><td colspan="4"><select class="form-control" style="width: 60%;float:right;" id="ddlFeedbackSkipLevel"  onchange=BindFeedbackGivenNot("L","#tblMyEmployeesSkipLevel")></select></td></tr>');
        FillHalfyearCycleSkipLevel(AppraisalCycle);
        return false;

    }
    var selectedyear = '';
    var selectedyeartext = '';

    if (Color == 'R') {
        selectedyear = $('#ddlFeedbackSubCycle :selected').val();
        selectedyeartext = $('#ddlFeedbackSubCycle :selected').val();

    }
    if (Color == 'G') {
        selectedyear = $('#ddlFeedbackSubCycle1 :selected').val();
        selectedyeartext = $('#ddlFeedbackSubCycle1 :selected').val();
    }


    var appraisalCycleId = $('#DBAppCycle :selected').val();// sessionStorage.AppraisalCycleId;
    var FromEmployeeId = sessionStorage.EmployeeId;
    var svrPath = CONFIG.get('SERVERNAME');

    var apiPath = '';

    if (Color != 'B' && Color != 'Y' && Color != 'N' && Color != 'P') {


        apiPath = svrPath + "ManagerDashboard?AppraisalCycleId=" + appraisalCycleId + "&FromEmployeeId=" + FromEmployeeId + "&ActionTypeId=1&Color=" + Color + "&selectedyear=" + selectedyear;
        FeedbackLessThan = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

        var count = 0;

        if (FeedbackLessThan.responseJSON.Success) {
            $.each(FeedbackLessThan.responseJSON.Result.FeedbackCount.data, function (index, item) {

                if (count < 5) {
                    var row = '';
                    var empId = item.ToEmployeeId;
                    var ename = item.FirstName.trim();
                    if (Color == 'R') {
                        row = '<tr><td  colspan="3"><form action="/Feedback/ManagerFeeback" method="Post" id="R' + empId + '"><a href=":javascript"  title="Feedback give to ' + ename + '" onclick="document.getElementById(\'R' + empId + '\').submit();event.preventDefault();">' + ename + '</a><input type="hidden" id="Id" name="Id" value="' + empId + '"><input type="hidden" id="Name" name="Name" value="' + ename + '"> <input type="hidden" id="selectedyear" name="selectedyear" value="' + selectedyear + '"><input type="hidden" id="appraisalCycleId" name="appraisalCycleId" value="' + appraisalCycleId + '">    </form></tr>';
                    }
                    else {
                        row = '<tr><td  colspan="2"><form action="/Feedback/GiveManagerFeedback" method="Post" id="V' + empId + '"><a title="View Feedback" href=":javascript" onclick="document.getElementById(\'V' + empId + '\').submit();event.preventDefault();">' + ename + '</a><input type="hidden" id="Id" name="Id" value="' + empId + '"><input type="hidden" id="Name" name="Name" value="' + ename + '"><input type="hidden" id="YearCycle" name="YearCycle" value="' + selectedyear + '"><input type="hidden" id="appraisalCycleId" name="appraisalCycleId" value="' + appraisalCycleId + '">  </form></td>';
                           // < td colspan = "1" > <form action="/Feedback/ManagerFeeback" method="Post" id="G' + empId + '"><a href=":javascript" title="Give more feedback" onclick="document.getElementById(\'G' + empId + '\').submit();event.preventDefault();">Give more feedback</a><input type="hidden" id="Id" name="Id" value="' + empId + '"><input type="hidden" id="Name" name="Name" value="' + ename + '"> <input type="hidden" id="selectedyear" name="selectedyear" value="' + selectedyear + '"><input type="hidden" id="appraisalCycleId" name="appraisalCycleId" value="' + appraisalCycleId + '"> </form></td></tr>';
                    }
                    $(TableId).append(row);
                    row = '';
                    count = count + 1;
                }

            });
            if (Color != 'N' && Color != 'B') {
                var j = 1;
                if (count < 6 && count != 0) {
                    for (var i = 0; i < (5 - count); i++) {
                        var row = '';
                        row = '<tr><td>' + "-" + '</td><td></td><td></td></tr>';
                        $(TableId).append(row);
                        row = '';
                        j++;
                    }

                }
                if (count == 0) {
                    for (var i = 0; i < 4; i++) {
                        var row = '';
                        row = '<tr><td>' + "-" + '</td><td></td><td></td></tr>';
                        $(TableId).append(row);
                        row = '';

                    }
                    row = '<tr><td>' + "No data available." + '</td><td></td><td></td></tr>';
                    $(TableId).append(row);
                    row = '';
                }

            }
            if (Color == 'R') {

                var InnerText = '';
                var TotalCount = FeedbackLessThan.responseJSON.Result.FeedbackCount.data.length;
                $("#myEmpsCountfeednotgiven").text(' ' + TotalCount);

                //}
                //else {

                //    $("#myEmpsCountGtThan").text(' ' + TotalCount);
                //}
            }
            if (Color == 'G') {
                var InnerText = '';
                var TotalCount = '';

                var TotalCount = FeedbackLessThan.responseJSON.Result.FeedbackCount.data.length;


                if (TotalCount > 0) {
                    $("#myEmpsCountGtThan").text(' ' + TotalCount);
                    InnerText = '<h5>Feedback Given</h5>';
                    $('#tblFeedbackGtThan tr').find('th:nth-child(1),th:nth-child(1)').html(InnerText);
                    $('#tblFeedbackGtThan tr:eq(1)').colSpan = "3";
                }
                else {
                    $("#myEmpsCountGtThan").text(' 0');
                    InnerText = '<h5>Feedback Given</h5>';
                    $('#tblFeedbackGtThan tr').find('th:nth-child(1),th:nth-child(1)').html(InnerText);
                }
            }

        }
        else {
            if (Color != 'N' && Color != 'B') {
                if (count < 5) {
                    for (var i = 0; i < (4 - count); i++) {
                        var row = '';
                        row = '<tr><td>' + "-" + '</td><td></td><td></td></tr>';
                        $(TableId).append(row);
                        row = '';
                    }
                }
            }


            if (Color == 'G') {

                var InnerText = '';
                $('#tblFeedbackGtThan tr').find('th:nth-child(1),th:nth-child(1)').html(InnerText);
            }
            //if (Color == 'Y') {

            //    var InnerText = '<h3></h3>Given less than ' + MinMaxCounter + ' times';
            //    $('#tblFeedbackLessThan tr').find('th:nth-child(1),th:nth-child(1)').html(InnerText);
            //}

        }
    }

    /// closed if else loop

    var TotalCount = 0;
    if (FeedbackLessThan.responseJSON.Success) {
        TotalCount = FeedbackLessThan.responseJSON.Result.FeedbackCount.data.length;
    }

    if (Color == 'R') {

        if (TotalCount > 5) {
            $('#tblFeedbackNotGiven_href').css('display', "block");
        }
        else {
            $('#tblFeedbackNotGiven_href').css('display', "none");
        }
    }
    if (Color == 'G') {
        if (TotalCount > 5) {
            $('#tblFeedbackGtThan_href').css('display', 'block');
        }
        else {
            $('#tblFeedbackGtThan_href').css('display', "none");
        }
    }
    if (Color == 'B') {
        var apiPath = svrPath + "/Team?KRAStatusId=-1&AppraisalCycleId=" + $('#DBAppCycle :selected').val() + "&ManagerId=" + FromEmployeeId;

        KRANotSubmitted = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
        var count = 0;
        if (KRANotSubmitted.responseJSON.Success) {
            $("#myEmpsCountNotsubmitted").text(' ' + KRANotSubmitted.responseJSON.Result.data.length);
            InnerText = '<h5>Goals and Objectives not submitted</h5>';
            $('#tblKRANotSubmitted tr').find('th:nth-child(1),th:nth-child(1)').html(InnerText);
        }
        else {
            $("#myEmpsCountNotsubmitted").text(' 0');
            // InnerText = '<h5>Goals and Objectives not submitted-No of Emp:(0) </h5>';

            //   InnerText = '<h5>Goals and Objectives not submitted</h5> <div style="text-align: rigth;color: black;font-size: medium";><h5>No of Employee: 0 </h5></div>';

            //  $('#tblKRANotSubmitted tr').find('th:nth-child(1),th:nth-child(1)').html(InnerText);
            InnerText = '<h5>Goals and Objectives not submitted</h5>';
            $('#tblKRANotSubmitted tr').find('th:nth-child(1),th:nth-child(1)').html(InnerText);
        }

        if (KRANotSubmitted.responseJSON.Success) {
            $.each(KRANotSubmitted.responseJSON.Result.data, function (index, item) {
                if (count < 5) {
                    var row = '';
                    var empId = 0;
                    var ename = item.EmployeeName;
                    if (Color == 'B') {

                        row = '<tr><td colspan="5"><form>' + ename + '</form></td></tr>';
                    }
                    //if (count <= 6) {
                    //    row = '<tr><td colspan="2"><div style="text-align: rigth;color: black;font-size: medium";><h5>No of Employee: ' + KRANotSubmitted.responseJSON.Result.length + '</h5></div></td><td colspan="1"></td></tr>';
                    //}
                    $(TableId).append(row);
                    row = '';
                    count = count + 1;
                }
            });

        }
        else {

            //row = '<tr> No data </tr>';

            //$(TableId).append(row);
            //row = '';
            count = 0
        }
        if (count < 6 && count != 0) {
            for (var i = 0; i < (5 - count); i++) {
                var row = '';
                row = '<tr><td colspan="3">' + "-" + '</td><td></td><td></td></tr>';
                $(TableId).append(row);
                row = '';
            }

        }
        else if (count == 0) {
            var row = '';
            var j = 1;
            for (var i = 0; i < 4; i++) {
                row = '<tr><td colspan="3">' + "-" + '</td><td></td><td></td></tr>';
                $(TableId).append(row);
                row = '';
                j++;
            }
            if (j == 5) {
                row = '<tr><td colspan="3">' + "No data available." + '</td><td></td><td></td></tr>';
                $(TableId).append(row);
                row = '';
            }
        }
        else { }
        var TotalCount = 0;
        if (KRANotSubmitted.responseJSON.Success) {
            TotalCount = KRANotSubmitted.responseJSON.Result.data.length;
        }
        if (Color == 'B') {
            if (TotalCount > 5) {
                $('#KRANotSubmittedViewAll').css("display", "block");
            }
            else {
                $('#KRANotSubmittedViewAll').css("display", "none");
            }
        }
    }
    if (Color == 'N') {
        var apiPath = svrPath + "/Team?KRAStatusId=2&AppraisalCycleId=" + $('#DBAppCycle :selected').val() + "&ManagerId=" + FromEmployeeId;
        KRANotApproved = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
        var count = 0;
        var InnerText = '';
        if (KRANotApproved.responseJSON.Success) {

            $("#myEmpsCountNotApproved").text(' ' + KRANotApproved.responseJSON.Result.data.length);
            InnerText = '<h5>Goals and Objectives pending for approval</h5>';
            $('#tblKRANotApproved tr').find('th:nth-child(1),th:nth-child(1)').html(InnerText);
        }
        else {
            $("#myEmpsCountNotApproved").text(' 0');
            InnerText = '<h5>Goals and Objectives pending for approval</h5>';
            $('#tblKRANotApproved tr').find('th:nth-child(1),th:nth-child(1)').html(InnerText);
        }

        if (KRANotApproved.responseJSON.Success) {
            $.each(KRANotApproved.responseJSON.Result.data, function (index, item) {
                if (count < 5) {

                    var row = '';
                    var empId = item.EmployeeId;
                    var ename = item.EmployeeName;
                    var arr = ename.split('-');
                    arr = arr[1].trim();
                    if (Color == 'N') {
                        row = '<tr><td colspan="5"><form action="/KRA/EmployeeIndex" method="Post" id="R' + arr + '"><a  title="Goals & objectives approve to ' + ename + '"  href=":javascript" onclick="document.getElementById(\'R' + arr + '\').submit();event.preventDefault();">' + ename + '</a><input type="hidden" id="Id" name="Id" value="' + empId + '"><input type="hidden" id="ename" name="ename" value="' + ename + '"><input type="hidden" id="AppraisalCycleId" name="AppraisalCycleId" value="' + $('#DBAppCycle :selected').val() + '"></form></tr>';

                        //   row = '<tr><td><form>' + ename + '</form></td></tr>';
                    }
                    $(TableId).append(row);
                    row = '';
                    count = count + 1;
                }
            });

        }
        else {
            count = 0;
        }

        if (count < 6 && count != 0) {
            for (var i = 0; i < (5 - count); i++) {
                var row = '';
                row = '<tr><td  colspan="3">' + "-" + '</td><td></td><td></td></tr>';
                $(TableId).append(row);
                row = '';
            }
        }
        else if (count == 0) {
            var row = '';
            var j = 1;
            for (var i = 0; i < 4; i++) {
                row = '<tr><td colspan="3">' + "-" + '</td><td></td><td></td></tr>';
                $(TableId).append(row);
                row = '';
                j++;
            }
            if (j == 5) {
                row = '<tr><td colspan="3">' + "No data available." + '</td><td></td><td></td></tr>';
                $(TableId).append(row);
                row = '';
            }
        }
        else { }
        var TotalCount = 0;
        if (KRANotApproved.responseJSON.Success) {
            TotalCount = KRANotApproved.responseJSON.Result.data.length;
        }
        if (Color == 'N') {
            if (TotalCount > 5) {
                $('#KRANotApprovedkViewAll').css("display", "block");
            }
            else {
                $('#KRANotApprovedkViewAll').css("display", "none");
            }
        }
    }

    if (Color == 'P') {
        return
        debugger;
        var apiPath = svrPath + "/PIP/PIP_ResultDashboard?ManagerId=" + sessionStorage.EmployeeId;
        TeamPIPDetails = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
        var count = 0;

        if (TeamPIPDetails.responseJSON.Result.PIPData[0].IsPIPVisible == 1) {

            $('#DivPIPSummary').css('display', 'block');
           // $('#tblPIPSummary > #tblPIPSummary_head >tr').remove();

        } else {

            $('#DivPIPSummary').css('display', 'none');
        }

        if (TeamPIPDetails.responseJSON.Success) {
            $.each(TeamPIPDetails.responseJSON.Result.data, function (index, item) {
                if (count < 5) {

                    var row = '';
                    var PIPCount = item.PIPCount;
                    var PIPResult = item.PIPResult;

                    if (Color == 'P') {
                        row = '<tr><td colspan="5">' + PIPCount + ' - ' + PIPResult + '</td></tr>';

                    }
                    $(TableId).append(row);
                    row = '';
                    count = count + 1;
                }
            });

        }
        else {
            count = 0;
        }

        if (count < 6 && count != 0) {
            for (var i = 0; i < (6 - count); i++) {
                var row = '';
                row = '<tr><td  colspan="3">' + "-" + '</td><td></td><td></td></tr>';
                $(TableId).append(row);
                row = '';
            }
        }
        else if (count == 0) {
            var row = '';
            var j = 1;
            for (var i = 0; i < 4; i++) {
                row = '<tr><td colspan="3">' + "-" + '</td><td></td><td></td></tr>';
                $(TableId).append(row);
                row = '';
                j++;
            }
            if (j == 5) {
                row = '<tr><td colspan="3">' + "No data available." + '</td><td></td><td></td></tr>';
                $(TableId).append(row);
                row = '';
            }
        }
        else { }

    }
}


$("#btnSearchEmp").click(function () {
    GetEmpBySearch();
});
function GetEmpBySearch() {

    var managerId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;
    var appraisalCycleId = $('#DBAppCycle :selected').val();// sessionStorage.AppraisalCycleId;

    var svrPath = CONFIG.get('SERVERNAME');
    var serachString = $("#txtSearchByName").val();
    var apiPath = svrPath + 'Search?ManagerId=' + managerId + '&Name=' + serachString + '&AppraisalCycleId=' + appraisalCycleId;

    CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (data) {
        if (data.Success == false) {
            // alert(data.ErrorCode + '\n' + data.ErrorMessage);
            return false;
        }

        FillMyEmployeesList(data);
    });


}
