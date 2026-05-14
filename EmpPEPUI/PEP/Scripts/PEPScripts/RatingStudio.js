var ddlAppCycle = '';
var BE = 0, ME = 0, EE = 0, EE1 = 0;
var MBE = 0, MME = 0, MEE = 0, MEE1 = 0;
var FBE = 0, FME = 0, FEE = 0, FEE1 = 0;

var BE_STab = 0, ME_STab = 0, EE_STab = 0, EE1_STab = 0;
var MBE_STab = 0, MME_STab = 0, MEE_STab = 0, MEE1_STab = 0;
var FBE_STab = 0, FME_STab = 0, FEE_STab = 0, FEE1_STab = 0;



var BE_STab_PNorm = 0, ME_STab_PNorm = 0, EE_STab_PNorm = 0, EE1_STab_PNorm = 0;
var MBE_STab_PNorm = 0, MME_STab_PNorm = 0, MEE_STab_PNorm = 0, MEE1_STab_PNorm = 0;
var FBE_STab_PNorm = 0, FME_STab_PNorm = 0, FEE_STab_PNorm = 0, FEE1_STab_PNorm = 0;


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
var OBE = 0, OME = 0, OEE = 0, OEE1 = 0;

var dictCurrentPageState = {};
var clickedDDLReporteeValue = '';
var clickedDDLGradeValue = '';
var clickedDDLLocationValue = '';

var clickedEmployeeStatusDDLValue = '';
var clickedDDLgenderValue = '';
var searchValue = '';
var eventSource = '';

/** Same sentinel as Ratings.js — include in criticalityPriorityIds CSV for employees with no criticality set. */
var STUDIO_NOT_CRITICAL_PRIORITY = '__NOT_CRITICAL__';

/** Query suffix for practice-norm studio APIs; reads #ddlCriticalityPriorityNorm_PNorm. */
function studioPnormCriticalityQuerySuffix() {
    var $ddl = $('#ddlCriticalityPriorityNorm_PNorm');
    if (!$ddl.length) {
        return '&criticalityPriorityIds=';
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
        return '&criticalityPriorityIds=';
    }
    var nc = STUDIO_NOT_CRITICAL_PRIORITY;
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
        return '&criticalityPriorityIds=';
    }
    var notCriticalChosen = selectedSet[nc] === true;
    var idParts = vals.filter(function (v) { return String(v) !== nc; }).map(function (x) { return String(x); });
    if (notCriticalChosen) {
        idParts.push(nc);
    }
    return '&criticalityPriorityIds=' + encodeURIComponent(idParts.join(','));
}

var GlobalRatingArray = [];

var GlobalsaveType = [];
var globalcheck;
var globalRowStatus;
var globalfinalSelectedEmployees;

//BindGradePractice();
//BindOverAllPromotionSummary_PracticeView();
//BindOverAllMaleFemalePromotionSummary_PracticeView();
//bindChart_PracticeView();


$(document).ready(function () {

    BindRole();



    $('[data-toggle="tooltip"]').tooltip();

    $("#close-filter-studio").click(function () {
        $(".filter-top-sec-item-studio").slideToggle('slow');
        $("#open-filter-studio").show('slow');
        $("#close-filter-studio").hide('slow');
    });
    $("#open-filter-studio").click(function () {
        $(".filter-top-sec-item-studio").slideToggle('slow');
        $("#open-filter-studio").hide('slow');
        $("#close-filter-studio").show('slow');
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


    setTimeout(BindPracticeList, 500);

    //setTimeout(BindNormalizationOverallDataOnInstertionScreen, 500);
    setTimeout(BindReporteeRatings, 500);

    setTimeout(BindNormalizationOverallData_StudioView, 500);
    setTimeout(BindMaleFemaleNormalization_StudioView, 500);
    setTimeout(BellCurve_StudioView, 500);

    setTimeout(RatingFilterTab, 500);

    setTimeout(BindGradePractice, 500);
    setTimeout(BindOverAllPromotionSummary_PracticeView, 500);
    setTimeout(BindOverAllMaleFemalePromotionSummary_PracticeView, 500);
    setTimeout(bindChart_PracticeView, 500);

    // setTimeout(BindDropdown, 500);

    BindDropdown();
    $("#divFilters").show();


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
    $('#ddlPromotion_PNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });
    $('#ddlgenderPractice').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });
    $('#ddlEmpStatusPractice').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    genderChangesforGeoWise();
});


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
    var apiPath = svrPath + "Rating/GetRatingHistory?AppraisalCycleId=" + sessionStorage.AppraisalCycleId + "&EmpID=" + EmpId + "&LogEmpId=" + sessionStorage.EmployeeId;

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
                            columns: [0, 1, 2, 3, 4, 5]
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
                        }
                    },
                    {
                        "render": function (data, type, row, meta) {
                            return row.GivenBy;
                        }
                    },
                    {
                        "render": function (data, type, row, meta) {
                            return row.Rating;
                        }
                    },
                    {
                        "render": function (data, type, row, meta) {
                            return row.RecoPromotion;
                        }
                    },
                    {
                        "render": function (data, type, row, meta) {
                            return row.Givendate;
                        },
                    },
                    {
                        "render": function (data, type, row, meta) {
                            return row.Action;
                        }
                    },
                    {
                        "render": function (data, type, row, meta) {
                            return row.Comments;
                        }
                    }],
            });
            $('#ViewNTHistoryDetails').modal('show');

        }
    });

}

function BindRole() {

    $('#ddlRoleStudio').empty();
    var ddldata;
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating/GetRoleList?AppraisalId=" + sessionStorage.AppraisalCycleId + "&LoginEmpId=" + sessionStorage.EmployeeId;

    CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (dropdownData) {
        if (dropdownData.Success === true && dropdownData.Result.length > 0) {
            ddldata = dropdownData.Result;

            var $dropdown = $("#ddlRoleStudio"); // Change to your actual dropdown ID
            $dropdown.empty(); // Clear existing options

            $.each(ddldata, function (index, item) {

                var isEnabled = (item.IsEnabled === 1) ? 1 : 0; // Convert to 1 (Yes) or 0 (No)
                if (isEnabled == 1) {
                    EnableRoleId = item.Roleid
                }

                $dropdown.append(`<option value="${item.Roleid}">${item.RoleName}</option>`);
            });
        }
    });

    $('#ddlRoleStudio').val('4');
}
$('#ddlRoleStudio').on('change', function () {


    if ($('#ddlRoleStudio').val() == 4) {


        //window.location.href = "https://pep.infogain.com/RatingStudio/Index"; // Redirects to internal URL
        // Use session variable instead of hardcoded URL // Redirects to internal URL*/
        var redirectUrl = (typeof pepUrl !== 'undefined' && pepUrl) ? pepUrl : '';
        window.location.href = redirectUrl + "/RatingStudio/Index";


    } else {

        localStorage.setItem("selectedRoleByStudio", $(this).val());
        /*window.location.href = "https://pep.infogain.com/Rating/Index"; // Redirects to internal URL*/
        // Use session variable instead of hardcoded URL // Redirects to internal URL*/
        var redirectUrl = (typeof pepUrl !== 'undefined' && pepUrl) ? pepUrl : '';
        window.location.href = redirectUrl + "/Rating/Index";

    }
});


$('#ddlPracticeGridView').on('change', function (e) {

    setTimeout(BindReporteeRatings, 500);
    // setTimeout(BindNormalizationOverallDataOnInstertionScreen, 500);
    setTimeout(RatingFilterTab, 500);

    $('.loader-div').show();
});

$('#ddlReporteePractice').on('change', function (e) {

    setTimeout(BindGradePractice, 500);
    setTimeout(BindOverAllPromotionSummary_PracticeView, 500);
    setTimeout(BindOverAllMaleFemalePromotionSummary_PracticeView, 500);
    setTimeout(bindChart_PracticeView, 500);

    $('.loader-div').show();
});



$('#ddlReporteePractice_Norm').on('change', function (e) {

    setTimeout(BindGradePractice, 500);
    setTimeout(BindNormalizationOverallData_StudioView, 500);
    setTimeout(BindMaleFemaleNormalization_StudioView, 500);
    setTimeout(BellCurve_StudioView, 500);

    $('.loader-div').show();
});


function bindChart_PracticeView() {

    var grades = [];
    var TotalEmployees = [];
    var ApprovedforPromotion = [];
    var RecommendationForPromotion = [];
    var empId = sessionStorage.EmployeeId;
    var svrPath = CONFIG.get('SERVERNAME');

    var IPractice = $("#ddlReporteePractice").val().toString();
    var GradeId = $("#ddlgradePractice").val().toString();
    var LocationId = $("#ddllocationPractice").val().toString();
    var GroupAccountId = $("#ddlgroupaccountPractice").val().toString();
    var Gender = 0;
    var EmpStatus = 0;

    if (IPractice == "") {
        IPractice = 0;
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

    var apiPath = svrPath + "Rating/GetDataforPracticeLeadWisePromotionGraph?AppraisalCycleId=" + sessionStorage.AppraisalCycleId + "&LogEmpID=" + empId + "&Practice=" + IPractice + "&GradeId=" + GradeId + "&LocationId=" + LocationId + "&GroupAccountId=" + GroupAccountId + "&Gender=" + Gender + "&EmpStatus=" + EmpStatus;

    $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'Get',
        url: apiPath,
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        },
        async: false,

        beforeSend: function (xhr, opts) {
            // $('.loader-div').show();
        },
        success: function (data) {
            //setting  data from result to variables

            $('.loader-div').hide();
            if (data.Result.length > 0) {

                for (var i = 0; i < data.Result.length; i++) {
                    grades[i] = data.Result[i].Grade;
                    TotalEmployees[i] = data.Result[i].TotalEmployees;
                    ApprovedforPromotion[i] = data.Result[i].ApprovedforPromotion;
                    RecommendationForPromotion[i] = data.Result[i].RecommendationForPromotion;
                }
            }

        },
        error: function (response) {
            $('.loader-div').hide();
            alert(response + '3');
        }
    });

    Highcharts.chart("practice_chart", {

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
        series: [
            {
                type: "line",
                name: "Ideal no of Employees",
                data: TotalEmployees,
            },
            {
                type: "line",
                name: "Recommended for Promotion",
                data: RecommendationForPromotion,
            },
            {
                type: "line",
                name: "Approved for Promotion",
                data: ApprovedforPromotion,
            }

        ]
    });

}


function BindOverAllPromotionSummary_PracticeView() {

    //if (sessionStorage.IsPracticeLead != 'true')
    //    return;

    var empId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };


    var Ipractice = $("#ddlReporteePractice").val().toString();
    var GradeId = $("#ddlgradePractice").val().toString();
    var LocationId = $("#ddllocationPractice").val().toString();
    var GroupAccountId = $("#ddlgroupaccountPractice").val().toString();
    var Gender = 0;
    var EmpStatus = 0;

    if (Ipractice == "") {
        Ipractice = 0;
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

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating/GetRatingPracticeLeadWisePromotionDetails?AppraisalCycleId=" + sessionStorage.AppraisalCycleId + "&LogEmpID=" + empId + "&Practice=" + Ipractice + "&GradeId=" + GradeId + "&LocationId=" + LocationId + "&GroupAccountId=" + GroupAccountId + "&Gender=" + Gender + "&EmpStatus=" + EmpStatus;

    $('#tblPromotionSummaryPractice tbody tr:gt(0)').remove();

    $.ajax({
        type: "GET",
        url: apiPath,
        headers: headerInfo,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function (xhr, opts) {
            $('.loader-div').show();
        },

        success: function (ratingPromotionOverallData) {
            if (ratingPromotionOverallData.Success == true) {

                var a = $('#ddlgradePractice').val();
                if (a.length == 0) {
                    BindGradePractice(ratingPromotionOverallData.Result);
                }

                var Total = 0;
                var PromotionPer = 0;
                var CurrentorgDistrubutionTotal = 0;

                var TotalIdealNo = 0;
                var TotalProRecoReceived = 0;
                var TotalRatio = 0;
                var TotalDiff = 0;
                var TotalFinalApproved = 0;
                var TotalFinalApprovedPer = 0;

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

                    //CurrentorgDistrubution = ((d.TotalCount / Total) * 100).toFixed(2).replace(".00", "");

                    if (isNaN((d.TotalCount / Total) * 100)) {
                        CurrentorgDistrubution = 0;
                    } else {
                        CurrentorgDistrubution = ((d.TotalCount / Total) * 100);//.toFixed(2).replace(".00", "");
                        CurrentorgDistrubutionTotal = parseFloat(CurrentorgDistrubutionTotal) + ((d.TotalCount / Total) * 100);

                    }

                    //  CurrentorgDistrubutionTotal += parseFloat(CurrentorgDistrubution);
                    IdealNumber = ((d.TotalCount * d.PromotoionPercentage) / 100).toFixed(2).replace(".00", "");;

                    if (isNaN((d.RecommendationForPromotion / d.RecommendationForPromotion) * 100)) {
                        ratio = 0;
                        TotalRatio = (TotalRatio + ratio);
                    } else {
                        ratio = ((d.RecommendationForPromotion / d.RecommendationForPromotion) * 100).toFixed(2).replace(".00", "");
                        TotalRatio = (TotalRatio + ((d.RecommendationForPromotion / d.RecommendationForPromotion) * 100));
                    }
                    difference = (d.RecommendationForPromotion - IdealNumber).toFixed(2).replace(".00", "");;

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

                    CurrentorgDistrubution = CurrentorgDistrubution.toFixed(2).replace(".00", "");

                    cols += '<td style="text-align: center;">' + d.Grade + '</td>';
                    cols += '<td style="text-align: center;">' + d.TotalCount + '</td>';
                    cols += '<td style="text-align: center;">' + CurrentorgDistrubution + '</td>';
                    cols += '<td style="text-align: center;">' + (d.PromotoionPercentage) + '</td>';
                    cols += '<td style="text-align: center;">' + IdealNumber + '</td>';
                    cols += '<td style="text-align: center;">' + d.RecommendationForPromotion + '</td>';
                    cols += '<td style="text-align: center;">' + ratio + '</td>';
                    cols += '<td style="text-align: center;">' + difference + '</td>';
                    cols += '<td style="text-align: center;">' + d.ApprovedCount + '</td>';
                    cols += '<td style="text-align: center;">' + approvedpercentage + '</td>';


                    newRow1.append(cols);
                    $("#tblPromotionSummaryPractice").append(newRow1);

                })

                var cols = "";
                var newRow1 = $("<tr>");

                TotalIdealNo = TotalIdealNo.toFixed(2).replace(".00", "");
                CurrentorgDistrubutionTotal = CurrentorgDistrubutionTotal.toFixed(2).replace(".00", "");

                cols += '<td style="text-align: center;"><b>Total<b/></td>';
                cols += '<td style="text-align: center;"><b>' + Total + '<b/></td>';
                cols += '<td style="text-align: center;"><b>' + CurrentorgDistrubutionTotal + '<b/></td>';
                cols += '<td style="text-align: center;"><b> 9%<b/></td>';
                cols += '<td style="text-align: center;"><b>' + TotalIdealNo + '<b/></td>';
                cols += '<td style="text-align: center;"><b>' + TotalProRecoReceived + '<b/></td>';
                cols += '<td style="text-align: center;"><b>' + TotalRatio + '<b/></td>';

                if (parseFloat(TotalDiff) > 0) {
                    cols += '<td style="text-align: center;" class="diffcol"><b>' + TotalDiff + '<b/></td>';
                } else { cols += '<td style="text-align: center;"><b>' + TotalDiff + '<b/></td>'; }
                cols += '<td style="text-align: center;"><b>' + TotalFinalApproved + '<b/></td>';
                cols += '<td style="text-align: center;"><b>' + TotalFinalApprovedPer + '<b/></td>';

                newRow1.append(cols);
                $("#tblPromotionSummaryPractice").append(newRow1);

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            $('.loader-div').hide();
            alert('Failed to retrieve data.');
        }
    });
}

function BindOverAllMaleFemalePromotionSummary_PracticeView() {

    //if (sessionStorage.IsPracticeLead != 'true')
    //    return;
    var empId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    var Ipractice = $("#ddlReporteePractice").val().toString();
    var GradeId = $("#ddlgradePractice").val().toString();
    var LocationId = $("#ddllocationPractice").val().toString();
    var GroupAccountId = $("#ddlgroupaccountPractice").val().toString();
    var Gender = 0;
    var EmpStatus = 0;

    if (Ipractice == "") {
        Ipractice = 0;
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

    ;

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating/GetRatingMaleFemalePracticeLeadWisePromotionDetails?AppraisalCycleId=" + sessionStorage.AppraisalCycleId + "&LogEmpID=" + empId + "&Practice=" + Ipractice + "&GradeId=" + GradeId + "&LocationId=" + LocationId + "&GroupAccountId=" + GroupAccountId + "&Gender=" + Gender + "&EmpStatus=" + EmpStatus;

    $('#tblMFPromotionSummaryPractice tbody tr:gt(1)').remove();

    $.ajax({
        type: "GET",
        url: apiPath,
        headers: headerInfo,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function (xhr, opts) {
            /* $('.loader-div').show();*/
        },
        success: function (ratingPromotionOverallData) {
            if (ratingPromotionOverallData.Success == true) {
                //$('.loader-div').hide();
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

                    // MaleCurrentorgDistrubution = ((d.MaleCount / MaleTotal) * 100).toFixed(2).replace(".00", "");


                    if (isNaN((d.MaleCount / MaleTotal) * 100)) {
                        MaleCurrentorgDistrubution = 0;
                        //  Male_CurrentOrgDist = parseFloat(Male_CurrentOrgDist) + parseFloat(MaleCurrentorgDistrubution);
                    } else {
                        MaleCurrentorgDistrubution = ((d.MaleCount / MaleTotal) * 100);
                        // Male_CurrentOrgDist = parseFloat(Male_CurrentOrgDist) + parseFloat(MaleCurrentorgDistrubution);
                        Male_CurrentOrgDist = parseFloat(Male_CurrentOrgDist) + ((d.MaleCount / MaleTotal) * 100);
                    }

                    //if (isNaN((d.MaleCount / MaleTotal) * 100)) {
                    //    MaleCurrentorgDistrubution = 0;
                    //} else {
                    //    MaleCurrentorgDistrubution = ((d.MaleCount / MaleTotal) * 100).toFixed(2).replace(".00", "");
                    //    Male_CurrentOrgDist = parseFloat(Male_CurrentOrgDist) + ((d.MaleCount / MaleTotal) * 100);

                    //}




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

                    /// For Others
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
                        Others_FinalApprovedPer = Others_FinalApprovedPer + OthersApprovedRatio;

                    } else {
                        OthersApprovedRatio = ((d.OthersApprovedCount / d.OthersCount) * 100).toFixed(2).replace(".00", "");

                        Others_FinalApprovedPer = Others_FinalApprovedPer + ((d.OthersApprovedCount / d.OthersCount) * 100);
                    }
                    Others_PromoRecoReceived = parseInt(Others_PromoRecoReceived) + parseInt(d.OthersRecommendationForPromotion);
                    Others_Ratio = parseFloat(Others_Ratio) + parseFloat(Othersratio);
                    Others_FinalApproved = parseFloat(Others_FinalApproved) + parseFloat(d.OthersApprovedCount);
                    Others_FinalApprovedPer = parseFloat(Others_FinalApprovedPer) + parseFloat(OthersApprovedRatio);

                    if (isNaN((d.MaleApprovedCount / d.MaleCount) * 100)) {
                        MaleApprovedRatio = 0;
                        Male_FinalApproved = Male_FinalApproved + MaleApprovedRatio;
                    } else {
                        MaleApprovedRatio = ((d.MaleApprovedCount / d.MaleCount) * 100).toFixed(2).replace(".00", "");
                        Male_FinalApproved = Male_FinalApproved + ((d.MaleApprovedCount / d.MaleCount) * 100);
                    }

                    if (isNaN((d.FemaleApprovedCount / d.FemaleCount) * 100)) {
                        FemaleApprovedRatio = 0;
                        Female_FinalApprovedPer = Female_FinalApprovedPer + FemaleApprovedRatio;

                    } else {
                        FemaleApprovedRatio = ((d.FemaleApprovedCount / d.FemaleCount) * 100).toFixed(2).replace(".00", "");

                        Female_FinalApprovedPer = Female_FinalApprovedPer + ((d.FemaleApprovedCount / d.FemaleCount) * 100);
                    }




                    //   Male_CurrentOrgDist = parseFloat(Male_CurrentOrgDist) + parseFloat(MaleCurrentorgDistrubution);
                    Male_PromoRecoReceived = (parseInt(Male_PromoRecoReceived) + parseInt(d.MaleRecommendationForPromotion)).toFixed(2).replace(".00", "");;
                    //Male_Ratio = Male_Ratio + Maleratio;
                    // Male_FinalApproved = Male_FinalApproved + d.MaleApprovedCount;
                    //Male_FinalApprovedPer = Male_FinalApprovedPer + FemaleApprovedRatio;

                    // Female_CurrentOrgDist = parseFloat(Female_CurrentOrgDist) + parseFloat(FemaleCurrentorgDistrubution);
                    Female_PromoRecoReceived = parseInt(Female_PromoRecoReceived) + parseInt(d.FeMaleRecommendationForPromotion);
                    Female_Ratio = parseFloat(Female_Ratio) + parseFloat(Femaleratio);
                    Female_FinalApproved = parseFloat(Female_FinalApproved) + parseFloat(d.FemaleApprovedCount);
                    Female_FinalApprovedPer = parseFloat(Female_FinalApprovedPer) + parseFloat(FemaleApprovedRatio);

                    MaleCurrentorgDistrubution = MaleCurrentorgDistrubution.toFixed(2).replace(".00", "");

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


                    //others
                    cols += '<td style="text-align: center;">' + d.OthersCount + '</td>';
                    cols += '<td style="text-align: center;">' + OthersCurrentorgDistrubution + '</td>';

                    cols += '<td style="text-align: center;">' + d.OthersRecommendationForPromotion + '</td>';
                    cols += '<td style="text-align: center;">' + Othersratio + '</td>';

                    cols += '<td style="text-align: center;">' + d.OthersApprovedCount + '</td>';
                    cols += '<td style="text-align: center;">' + OthersApprovedRatio + '</td>';

                    newRow1.append(cols);
                    $("#tblMFPromotionSummaryPractice").append(newRow1);

                })


                var cols = "";
                var newRow1 = $("<tr>");

                cols += '<td> <b>Total<b/></td>';

                Male_CurrentOrgDist = Male_CurrentOrgDist.toFixed(2).replace(".00", "");
                Female_CurrentOrgDist = Female_CurrentOrgDist.toFixed(2).replace(".00", "");
                Male_FinalApproved = Male_FinalApproved.toFixed(2).replace(".00", "");
                Male_FinalApprovedPer = Male_FinalApprovedPer.toFixed(2).replace(".00", "");
                Others_FinalApprovedPer = Others_FinalApprovedPer.toFixed(2).replace(".00", "");

                Female_FinalApprovedPer = Female_FinalApprovedPer.toFixed(2).replace(".00", "");

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

                //others
                cols += '<td style="text-align: center;"><b>' + OthersTotal + '<b/></td>';
                cols += '<td style="text-align: center;"><b>' + Others_CurrentOrgDist + '<b/></td>';
                cols += '<td style="text-align: center;"><b>' + Others_PromoRecoReceived + '<b/></td>';
                cols += '<td style="text-align: center;"><b>' + Others_Ratio + '<b/></td>';
                cols += '<td style="text-align: center;"><b>' + Others_FinalApproved + '<b/></td>';
                cols += '<td style="text-align: center;"><b>' + Others_FinalApprovedPer + '<b/></td>';

                newRow1.append(cols);
                $("#tblMFPromotionSummaryPractice").append(newRow1);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            $('.loader-div').hide();
            alert('Failed to retrieve data.');
        }
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
}

function BindGradePractice(gradeData) {

    var dictGrade = {};
    var sortedGradeKeys = [];
    $.each(gradeData, function (index, data) {
        if (dictGrade[data.Grade] == undefined) {
            dictGrade[data.Grade] = data.GradeId;
        }
    }
    );

    sortedGradeKeys = Object.keys(dictGrade).sort();

    $('#ddlgradePractice').empty();

    for (let t = 0; t < sortedGradeKeys.length; t++) {
        if (sortedGradeKeys[t] != 'C') {
            $('#ddlgradePractice').append($("<option>").val(dictGrade[sortedGradeKeys[t]]).text(sortedGradeKeys[t]));
        }
    }

    $('#ddlgradePractice').multiselect('destroy');

    $('#ddlgradePractice').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgradePractice').multiselect('refresh');



    $('#ddlgradeNorm_PNorm').empty();

    for (let t = 0; t < sortedGradeKeys.length; t++) {
        if (sortedGradeKeys[t] != 'C') {
            $('#ddlgradeNorm_PNorm').append($("<option>").val(dictGrade[sortedGradeKeys[t]]).text(sortedGradeKeys[t]));
        }
    }

    $('#ddlgradeNorm_PNorm').multiselect('destroy');

    $('#ddlgradeNorm_PNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgradeNorm_PNorm').multiselect('refresh');

}

function BellCurve_StudioView() {
    var total;
    ;
    var empId = sessionStorage.EmployeeId;
    var svrPath = CONFIG.get('SERVERNAME');

    /*    var IReportee = $("#ddlReporteeNorm").val().toString();*/
    var GradeId = $("#ddlgradeNorm_PNorm").val().toString();
    var LocationId = $("#ddllocationNorm_PNorm").val().toString();
    var GroupAccountId = $("#ddlgroupaccountNorm_PNorm").val().toString();
    var Gender = $("#ddlgenderNorm_PNorm").val().toString();
    var EmpStatus = $("#ddlEmployeeStatusNorm_PNorm").val().toString();
    var Promotion = $("#ddlPromotion_PNorm").val().toString();


    var Ipractice = $("#ddlReporteePractice_Norm").val().toString();

    if (Ipractice == "") {
        Ipractice = 0;
    }
    //var selectedEmployees = [];
    //if (selectedEmployees.indexOf("-1") != -1) {
    //    selectedEmployees[selectedEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    //}
    //var IReportee = selectedEmployees.toString();

    if (Ipractice == "") {
        Ipractice = 0;
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



    var apiPath = svrPath + "Rating/GetDataForChartStudioView?EMPID=" + empId + "&AppraisalCycleId=" + sessionStorage.AppraisalCycleId + "&Practice=" + Ipractice + "&GradeId=" + GradeId + "&LocationId=" + LocationId + "&GroupAccountId=" + GroupAccountId + "&Gender=" + Gender + "&EmpStatus=" + EmpStatus + "&Promotion=" + Promotion + "&RoleId=0" + studioPnormCriticalityQuerySuffix();
    var total_PNorm = 0;
    $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'Get',
        url: apiPath,
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        },
        async: false,

        success: function (data) {
            $(".loader-div").hide();
            //setting  data from result to variables

            if (data.Result.data.length > 0) {
                //BE_STab_PNorm = data.Result.data[0].BE;
                //ME_STab_PNorm = data.Result.data[0].ME;
                //EE_STab_PNorm = data.Result.data[0].EE;
                //EE1_STab_PNorm = data.Result.data[0].EE1;
                //MBE_STab_PNorm = data.Result.data[0].BE;
                //MME_STab_PNorm = data.Result.data[0].ME;
                //MEE_STab_PNorm = data.Result.data[0].EE;
                //MEE1_STab_PNorm = data.Result.data[0].EE1;
                //FBE_STab_PNorm = data.Result.data[0].BE;
                //FME_STab_PNorm = data.Result.data[0].ME;
                //FEE_STab_PNorm = data.Result.data[0].EE;
                //FEE1_STab_PNorm = data.Result.data[0].EE1;
                //notgiven_PNorm = data.Result.data[3].EE;
                BE_STab_PNorm = data.Result.data[0].BE;
                ME_STab_PNorm = data.Result.data[0].ME;
                EE_STab_PNorm = data.Result.data[0].EE;
                EE1_STab_PNorm = data.Result.data[0].EE1;
                MBE_STab_PNorm = data.Result.data[1].BE;
                MME_STab_PNorm = data.Result.data[1].ME;
                MEE_STab_PNorm = data.Result.data[1].EE;
                MEE1_STab_PNorm = data.Result.data[1].EE1;
                FBE_STab_PNorm = data.Result.data[2].BE;
                FME_STab_PNorm = data.Result.data[2].ME;
                FEE_STab_PNorm = data.Result.data[2].EE;
                FEE1_STab_PNorm = data.Result.data[2].EE1;
                notgiven_PNorm = data.Result.data[3].EE;
                $('#filtersDiv').css('display', 'block');
                $('#EEspan').text(EE_STab_PNorm);
                $('#MEspan').text(ME_STab_PNorm);
                $('#BEspan').text(BE_STab_PNorm);
                $('#EE1span').text(EE1_STab_PNorm);
                $('#Notspan').text(notgiven_PNorm);
                total_PNorm = EE_STab_PNorm + ME_STab_PNorm + BE_STab_PNorm + EE1_STab_PNorm;
                $('#Totalspan').text(total_PNorm);

                TotalSpan_PNorm = total_PNorm + notgiven_PNorm;

                GlobalTotalNotGiven_PNorm = notgiven_PNorm;

                GlobalTotalGiven_PNorm = total_PNorm;
            }
        },
        error: function (response) {


            $(".loader-div").hide();
            alert(response + '5');
        }
    });
    var totalEmp = total_PNorm + notgiven_PNorm;
    var idealData = [(totalEmp * 0.05).toFixed(2), (totalEmp * 0.25).toFixed(2), (totalEmp * 0.6).toFixed(2), (totalEmp * 0.1).toFixed(2)];
    //console.log(idealData);

    if ([1, 2, 4, 5, 16, 11, 10, 23].includes(parseInt(sessionStorage.LocationId))) {
        Highcharts.chart("chart_div_PNorm", {

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
                    data: [EE1_STab_PNorm, EE_STab_PNorm, ME_STab_PNorm, BE_STab_PNorm],
                },
                {
                    type: "column",
                    name: "Male Count",
                    data: [MEE1_STab_PNorm, MEE_STab_PNorm, MME_STab_PNorm, MBE_STab_PNorm],
                },
                {
                    type: "column",
                    name: "Female Count",
                    data: [FEE1_STab_PNorm, FEE_STab_PNorm, FME_STab_PNorm, FBE_STab_PNorm],
                },
                {
                    type: "column",
                    name: "Others Count",
                    data: [0, 0, 0, 0],
                },
            ]
        });
    }
    else {
        Highcharts.chart("chart_div_PNorm", {

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
                    data: [EE1_STab_PNorm, EE_STab_PNorm, ME_STab_PNorm, BE_STab_PNorm],
                },

            ]
        });
    }


}

function showBellCurve_StudioView() {

    //var totalemp = BE + ME + EE + EE1 + notgiven;

    var totalemp = BE_STab_PNorm + ME_STab_PNorm + EE_STab_PNorm + EE1_STab_PNorm;
    var title = '';

    //var ddlReporteeValue = $('#ddlReporteeNorm').val().toString();
    //var ddlReporteeValueText = $('#ddlReporteeNorm :selected').text();

    //// var TotalSpan = GlobalTotalNotGiven + GlobalTotalGiven;

    //if (ddlReporteeValue != '') {

    //    if (($("#ddlReporteeNorm option").length == $("#ddlReporteeNorm option:selected").length)) {

    //        title = 'Bell Curve (Total no. of employees as per selected span : ' + TotalSpan + ')'
    //    } else {

    //        if (GlobalTotalGiven == 0) {
    //            title = 'Bell Curve (Total no. of employees as per selected span : ' + TotalSpan + ')'
    //        } else {
    //            title = 'Bell Curve (Total no. of employees as per selected span : ' + TotalSpan + ')'
    //        }

    //    }

    //}
    //else {
    title = 'Bell Curve (Total no. of employees in your selected studio span :' + TotalSpan_PNorm + ')'
    //    }

    $('#myModal_PNorm').modal('show');
    Highcharts.chart("bellcurve_PNorm", {

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
                data: [0, EE1_STab_PNorm, EE_STab_PNorm, ME_STab_PNorm, BE_STab_PNorm, 0],
            },


        ]
    });

}

function BindMaleFemaleNormalization_StudioView() {
    var empId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };
    ///var IReportee = $('#ddlReporteeNorm :selected').val(); //$("#ddlReporteeNorm").val().toString();

    // var IReportee = $("#ddlReporteeNorm").val().toString();
    var GradeId = $("#ddlgradeNorm_PNorm").val().toString();
    var LocationId = $("#ddllocationNorm_PNorm").val().toString();
    var GroupAccountId = $("#ddlgroupaccountNorm_PNorm").val().toString();
    var Gender = $("#ddlgenderNorm_PNorm").val().toString();
    var EmpStatus = $("#ddlEmployeeStatusNorm_PNorm").val().toString();
    var Promotion = $("#ddlPromotion_PNorm").val().toString();



    var Ipractice = $("#ddlReporteePractice_Norm").val().toString();

    if (Ipractice == "") {
        Ipractice = 0;
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

    $('#NormalizationMaleFemaletbl_PNorm tbody tr:gt(2)').remove();

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating/GetMaleFemaleNormalizationStudioView?EMPID=" + empId + "&AppraisalCycleId=" + sessionStorage.AppraisalCycleId + "&Practice=" + Ipractice + "&GradeId=" + GradeId + "&LocationId=" + LocationId + "&GroupAccountId=" + GroupAccountId + "&Gender=" + Gender + "&EmpStatus=" + EmpStatus + "&Promotion=" + Promotion + "&RoleId=0" + studioPnormCriticalityQuerySuffix();

    CommonAjaxGET(apiPath, headerInfo).done(function (ratingNormData) {

        if (ratingNormData.Success == true) {

            let Arr = ratingNormData.Result.data;

            let outputArray = [];

            // Count variable is used to add the
            // new unique value only once in the
            // outputArray.
            let count = 0;

            // Start variable is used to set true
            // if a repeated duplicate value is
            // encontered in the output array.
            let start = false;

            for (let j = 0; j < Arr.length; j++) {
                for (let k = 0; k < outputArray.length; k++) {
                    if (Arr[j].Grade == outputArray[k]) {
                        start = true;
                    }
                }
                count++;
                if (count == 1 && start == false) {
                    outputArray.push(Arr[j].Grade);
                }
                start = false;
                count = 0;
            }



            var Male_Total = 0;
            var Male_TotalEE1 = 0;
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

                for (let k = 0; k < Arr.length; k++) {

                    if (outputArray[j] == Arr[k].Grade) {
                        GradeWiseMaleCount += Arr[k].MaleCurrentCount;
                        GradeWiseFemaleCount += Arr[k].FemaleCurrentCount;
                        GradeWiseOthersCount += Arr[k].OthersCurrentCount;

                        if (Arr[k].Rating == 'BE') {
                            BEMale = Arr[k].MaleCurrentCount
                            BEFeMale = Arr[k].FemaleCurrentCount;
                            BEOthers = Arr[k].OthersCurrentCount;
                        }
                        if (Arr[k].Rating == 'ME') {
                            MEMale = Arr[k].MaleCurrentCount
                            MEFeMale = Arr[k].FemaleCurrentCount;
                            MEOthers = Arr[k].OthersCurrentCount;
                        }
                        if (Arr[k].Rating == 'EE') {
                            EEMale = Arr[k].MaleCurrentCount
                            EEFeMale = Arr[k].FemaleCurrentCount;
                            EEOthers = Arr[k].OthersCurrentCount;
                        }
                        if (Arr[k].Rating == 'EE1') {
                            EE1Male = Arr[k].MaleCurrentCount
                            EE1FeMale = Arr[k].FemaleCurrentCount;
                            EE1Others = Arr[k].OthersCurrentCount;
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
                $("#NormalizationMaleFemaletbl_PNorm").append(newRow);
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
            $("#NormalizationMaleFemaletbl_PNorm").append(newRow2);

        }
    });
}

function BindNormalizationOverallData_StudioView() {

    var empId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    ;
    //  var IReportee = $('#ddlReporteeNorm :selected').val();// $("#ddlReporteeNorm").val().toString();


    //  var IReportee = $("#ddlReporteeNorm").val().toString();

    var Ipractice = $("#ddlReporteePractice_Norm").val().toString();
    var GradeId = $("#ddlgradeNorm_PNorm").val().toString();
    var LocationId = $("#ddllocationNorm_PNorm").val().toString();
    var GroupAccountId = $("#ddlgroupaccountNorm_PNorm").val().toString();
    var Gender = $("#ddlgenderNorm_PNorm").val().toString();
    var EmpStatus = $("#ddlEmployeeStatusNorm_PNorm").val().toString();
    var Promotion = $("#ddlPromotion_PNorm").val().toString();

    //var selectedEmployees = $("#ddlReporteeNorm").val();


    //if (selectedEmployees.indexOf("-1") != -1) {
    //    selectedEmployees[selectedEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    //}
    //var IReportee = selectedEmployees.toString();



    if (Ipractice == "") {
        Ipractice = 0;
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


    $('#Normalizationtbl_PNorm tbody tr:gt(1)').remove();
    var svrPath = CONFIG.get('SERVERNAME');


    var apiPath = svrPath + "Rating/GetRatingOverallDataStudioView?AppraisalCycleId=" + sessionStorage.AppraisalCycleId + "&EMPID=" + empId + "&Practice=" + Ipractice + "&GradeId=" + GradeId + "&LocationId=" + LocationId + "&GroupAccountId=" + GroupAccountId + "&Gender=" + Gender + "&EmpStatus=" + EmpStatus + "&Promotion=" + Promotion + "&RoleId=0" + studioPnormCriticalityQuerySuffix();

    CommonAjaxGET(apiPath, headerInfo).done(function (ratingOverallData) {

        if (ratingOverallData.Success == true) {

            let Arr = ratingOverallData.Result.data;
            rawDataOverallNormStudio = ratingOverallData.Result.data;

            // BindGradePractice(ratingOverallData.Result);
            let outputArray = [];

            let count = 0;

            let start = false

            for (let j = 0; j < Arr.length; j++) {
                for (let k = 0; k < outputArray.length; k++) {
                    if (Arr[j].GRADE == outputArray[k]) {
                        start = true;
                    }
                }
                count++;
                if (count == 1 && start == false) {
                    outputArray.push(Arr[j].GRADE);
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



                for (let k = 0; k < Arr.length; k++) {

                    if (outputArray[j] == Arr[k].GRADE) {

                        if (TotalCount == 0) {
                            TotalCount += Arr[k].TotalCount;
                        }
                        if (Arr[k].Rating == 'ME') {
                            ME_CurrentCount += Arr[k].CurrentCount;
                            //if (TotalCount == 0) {
                            //    TotalCount += Arr.Result[k].TotalCount;
                            //}

                        }
                        if (Arr[k].Rating == 'EE') {

                            EE_CurrentCount += Arr[k].CurrentCount;
                            //if (TotalCount == 0) {
                            //    TotalCount += Arr.Result[k].TotalCount;
                            //}

                        }
                        if (Arr[k].Rating == 'EE1') {
                            EE1_CurrentCount += Arr[k].CurrentCount;
                            //if (TotalCount == 0) {
                            //    TotalCount += Arr.Result[k].TotalCount;
                            //}


                        }
                        if (Arr[k].Rating == 'BE') {

                            BE_CurrentCount += Arr[k].CurrentCount;
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
                $("#Normalizationtbl_PNorm").append(newRow1);

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
            $("#Normalizationtbl_PNorm").append(newRow2);
        }
    });
}


function Practicefilterschange() {

    //BindOverAllPromotionSummary_PracticeView();
    //if (sessionStorage.EmployeeId == 7049)
    //    return;

    var empId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    ;

    var Ipractice = $("#ddlReporteePractice").val().toString();
    var GradeId = $("#ddlgradePractice").val().toString();
    var LocationId = $("#ddllocationPractice").val().toString();
    var GroupAccountId = $("#ddlgroupaccountPractice").val().toString();
    var Gender = $("#ddlgenderPractice").val().toString();;
    var EmpStatus = $("#ddlEmpStatusPractice").val().toString();;

    if (Ipractice == "") {
        Ipractice = 0;
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

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating/GetRatingPracticeLeadWisePromotionDetails?AppraisalCycleId=" + sessionStorage.AppraisalCycleId + "&LogEmpID=" + empId + "&Practice=" + Ipractice + "&GradeId=" + GradeId + "&LocationId=" + LocationId + "&GroupAccountId=" + GroupAccountId + "&Gender=" + Gender + "&EmpStatus=" + EmpStatus;

    $('#tblPromotionSummaryPractice tbody tr:gt(0)').remove();

    $.ajax({
        type: "GET",
        url: apiPath,
        headers: headerInfo,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function (xhr, opts) {
            $('.loader-div').show();
        },

        success: function (ratingPromotionOverallData) {
            if (ratingPromotionOverallData.Success == true) {

                var a = $('#ddlgradePractice').val();
                if (a.length == 0) {
                    BindGradePractice(ratingPromotionOverallData.Result);
                }

                var Total = 0;
                var PromotionPer = 0;
                var CurrentorgDistrubutionTotal = 0;

                var TotalIdealNo = 0;
                var TotalProRecoReceived = 0;
                var TotalRatio = 0;
                var TotalDiff = 0;
                var TotalFinalApproved = 0;
                var TotalFinalApprovedPer = 0;

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

                    //CurrentorgDistrubution = ((d.TotalCount / Total) * 100).toFixed(2).replace(".00", "");

                    if (isNaN((d.TotalCount / Total) * 100)) {
                        CurrentorgDistrubution = 0;
                    } else {
                        CurrentorgDistrubution = ((d.TotalCount / Total) * 100);//.toFixed(2).replace(".00", "");
                        CurrentorgDistrubutionTotal = parseFloat(CurrentorgDistrubutionTotal) + ((d.TotalCount / Total) * 100);

                    }

                    //  CurrentorgDistrubutionTotal += parseFloat(CurrentorgDistrubution);
                    IdealNumber = ((d.TotalCount * d.PromotoionPercentage) / 100).toFixed(2).replace(".00", "");;

                    if (isNaN((d.RecommendationForPromotion / d.RecommendationForPromotion) * 100)) {
                        ratio = 0;
                        TotalRatio = (TotalRatio + ratio);
                    } else {
                        ratio = ((d.RecommendationForPromotion / d.RecommendationForPromotion) * 100).toFixed(2).replace(".00", "");
                        TotalRatio = (TotalRatio + ((d.RecommendationForPromotion / d.RecommendationForPromotion) * 100));
                    }
                    difference = (d.RecommendationForPromotion - IdealNumber).toFixed(2).replace(".00", "");;

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

                    CurrentorgDistrubution = CurrentorgDistrubution.toFixed(2).replace(".00", "");

                    cols += '<td style="text-align: center;">' + d.Grade + '</td>';
                    cols += '<td style="text-align: center;">' + d.TotalCount + '</td>';
                    cols += '<td style="text-align: center;">' + CurrentorgDistrubution + '</td>';
                    cols += '<td style="text-align: center;">' + (d.PromotoionPercentage) + '</td>';
                    cols += '<td style="text-align: center;">' + IdealNumber + '</td>';
                    cols += '<td style="text-align: center;">' + d.RecommendationForPromotion + '</td>';
                    cols += '<td style="text-align: center;">' + ratio + '</td>';
                    cols += '<td style="text-align: center;">' + difference + '</td>';
                    cols += '<td style="text-align: center;">' + d.ApprovedCount + '</td>';
                    cols += '<td style="text-align: center;">' + approvedpercentage + '</td>';


                    newRow1.append(cols);
                    $("#tblPromotionSummaryPractice").append(newRow1);

                })

                var cols = "";
                var newRow1 = $("<tr>");

                TotalIdealNo = TotalIdealNo.toFixed(2).replace(".00", "");
                CurrentorgDistrubutionTotal = CurrentorgDistrubutionTotal.toFixed(2).replace(".00", "");

                cols += '<td style="text-align: center;"><b>Total<b/></td>';
                cols += '<td style="text-align: center;"><b>' + Total + '<b/></td>';
                cols += '<td style="text-align: center;"><b>' + CurrentorgDistrubutionTotal + '<b/></td>';
                cols += '<td style="text-align: center;"><b> 9%<b/></td>';
                cols += '<td style="text-align: center;"><b>' + TotalIdealNo + '<b/></td>';
                cols += '<td style="text-align: center;"><b>' + TotalProRecoReceived + '<b/></td>';
                cols += '<td style="text-align: center;"><b>' + TotalRatio + '<b/></td>';

                if (parseFloat(TotalDiff) > 0) {
                    cols += '<td style="text-align: center;" class="diffcol"><b>' + TotalDiff + '<b/></td>';
                } else { cols += '<td style="text-align: center;"><b>' + TotalDiff + '<b/></td>'; }
                cols += '<td style="text-align: center;"><b>' + TotalFinalApproved + '<b/></td>';
                cols += '<td style="text-align: center;"><b>' + TotalFinalApprovedPer + '<b/></td>';

                newRow1.append(cols);
                $("#tblPromotionSummaryPractice").append(newRow1);
                BindOverAllMaleFemalePromotionSummary_PracticeView();
                bindChart_PracticeView();
                // bindChart_PracticeView();
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            $('.loader-div').hide();
            alert('Failed to retrieve data.');
        }






    }
    );


}


function PracticeNormfilterschange() {


    var empId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    // $('#ddlReporteeNorm :selected').val();

    var IPractice = $("#ddlReporteePractice_Norm").val().toString();
    var GradeId = $("#ddlgradeNorm_PNorm").val().toString();
    var LocationId = $("#ddllocationNorm_PNorm").val().toString();
    var GroupAccountId = $("#ddlgroupaccountNorm_PNorm").val().toString();
    var Gender = $("#ddlgenderNorm_PNorm").val().toString();
    var EmpStatus = $("#ddlEmployeeStatusNorm_PNorm").val().toString();
    var Promotion = $("#ddlPromotion_PNorm").val().toString();



    if (IPractice == "") {
        IPractice = 0;
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

    $('#Normalizationtbl_PNorm tbody tr:gt(1)').remove();
    var svrPath = CONFIG.get('SERVERNAME');



    var apiPath = svrPath + "Rating/GetRatingOverallDataStudioView?AppraisalCycleId=" + sessionStorage.AppraisalCycleId + "&EMPID=" + empId + "&Practice=" + IPractice + "&GradeId=" + GradeId + "&LocationId=" + LocationId + "&GroupAccountId=" + GroupAccountId + "&Gender=" + Gender + "&EmpStatus=" + EmpStatus + "&Promotion=" + Promotion + '&RoleId=0' + studioPnormCriticalityQuerySuffix();

    $.ajax({
        type: "GET",
        url: apiPath,
        headers: headerInfo,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function (xhr, opts) {
            $('.loader-div').show();
        },

        success: function (ratingOverallData) {
            if (ratingOverallData.Success == true) {

                let Arr = ratingOverallData.Result.data;
                rawDataOverallNormStudio = ratingOverallData.Result.data;


                // BindGradePractice(ratingOverallData.Result);
                let outputArray = [];

                let count = 0;

                let start = false

                for (let j = 0; j < Arr.length; j++) {
                    for (let k = 0; k < outputArray.length; k++) {
                        if (Arr[j].GRADE == outputArray[k]) {
                            start = true;
                        }
                    }
                    count++;
                    if (count == 1 && start == false) {
                        outputArray.push(Arr[j].GRADE);
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



                    for (let k = 0; k < Arr.length; k++) {

                        if (outputArray[j] == Arr[k].GRADE) {

                            if (TotalCount == 0) {
                                TotalCount += Arr[k].TotalCount;
                            }
                            if (Arr[k].Rating == 'ME') {
                                ME_CurrentCount += Arr[k].CurrentCount;
                                //if (TotalCount == 0) {
                                //    TotalCount += Arr.Result[k].TotalCount;
                                //}

                            }
                            if (Arr[k].Rating == 'EE') {

                                EE_CurrentCount += Arr[k].CurrentCount;
                                //if (TotalCount == 0) {
                                //    TotalCount += Arr.Result[k].TotalCount;
                                //}

                            }
                            if (Arr[k].Rating == 'EE1') {
                                EE1_CurrentCount += Arr[k].CurrentCount;
                                //if (TotalCount == 0) {
                                //    TotalCount += Arr.Result[k].TotalCount;
                                //}


                            }
                            if (Arr[k].Rating == 'BE') {

                                BE_CurrentCount += Arr[k].CurrentCount;
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
                    $("#Normalizationtbl_PNorm").append(newRow1);

                }

                PerTotalEE1 = ((RatingGivenTotalEE1 / TotalCountGrade) * 100).toFixed(2).replace(".00", "");
                PerTotalEE = ((RatingGivenTotalEE / TotalCountGrade) * 100).toFixed(2).replace(".00", "");
                PerTotalME = ((RatingGivenTotalEE1 / TotalCountGrade) * 100).toFixed(2).replace(".00", "");
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
                $("#Normalizationtbl_PNorm").append(newRow2);

                //  MyReporteeBellCurve();
            }
        },

        error: function (xhr, ajaxOptions, thrownError) {
            $('.loader-div').hide();
            alert('Failed to retrieve data.');
        }

    });


    BindMaleFemaleNormalization_StudioView();


    BellCurve_StudioView();


}


function BindPracticeList() {

    var LoginEmployeeId = sessionStorage.EmployeeId;
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'Rating/GetPracticeList?LoginEmployeeId=' + LoginEmployeeId;
    var ddlpracticelist = CommonAjaxGET(apiPath, CommonGetHeaderInfo());


    //  $("#ddlReporteePractice").val(["-1"]);
    $("#ddlReporteePractice").multiselect('refresh');

    $('#ddlReporteePractice').empty();

    $('#ddlReporteePractice').multiselect('destroy');



    $.each(ddlpracticelist.responseJSON.Result.data, function (index, data) {
        $('#ddlReporteePractice').append($("<option>").val(data.PracticeId).text(data.PracticeName));

    });

    $('#ddlReporteePractice').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $("#ddlReporteePractice option").prop("selected", true);
    $("#ddlReporteePractice").multiselect('refresh');



    $("#ddlReporteePractice_Norm").multiselect('refresh');

    $('#ddlReporteePractice_Norm').empty();

    $('#ddlReporteePractice_Norm').multiselect('destroy');


    $.each(ddlpracticelist.responseJSON.Result.data, function (index, data) {
        $('#ddlReporteePractice_Norm').append($("<option>").val(data.PracticeId).text(data.PracticeName));

    });

    $('#ddlReporteePractice_Norm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $("#ddlReporteePractice_Norm option").prop("selected", true);
    $("#ddlReporteePractice_Norm").multiselect('refresh');

    var apiPathCrit = svrPath + 'Rating/GetCriticalityPriorityForDropdown';
    CommonAjaxGET(apiPathCrit, CommonGetHeaderInfo()).done(function (criticalityPriorityData) {
        if (criticalityPriorityData.Success === true && criticalityPriorityData.Result && criticalityPriorityData.Result.data) {
            var dictCriticalityPriority = {};
            $.each(criticalityPriorityData.Result.data, function (index, data) {
                if (data && data.DisplayText != null && dictCriticalityPriority[data.DisplayText] === undefined) {
                    dictCriticalityPriority[data.DisplayText] = data.Id;
                }
            });
            var sortedCriticalityPriorityKeys = Object.keys(dictCriticalityPriority).sort();
            $('#ddlCriticalityPriorityNorm_PNorm').empty();
            $('#ddlCriticalityPriorityNorm_PNorm').append($('<option>').val(STUDIO_NOT_CRITICAL_PRIORITY).text('Not Critical'));
            for (var t = 0; t < sortedCriticalityPriorityKeys.length; t++) {
                var val = dictCriticalityPriority[sortedCriticalityPriorityKeys[t]];
                var text = sortedCriticalityPriorityKeys[t];
                $('#ddlCriticalityPriorityNorm_PNorm').append($('<option>').val(val).text(text));
            }
            if ($('#ddlCriticalityPriorityNorm_PNorm').length) {
                $('#ddlCriticalityPriorityNorm_PNorm').multiselect('destroy');
                $('#ddlCriticalityPriorityNorm_PNorm').multiselect({
                    includeSelectAllOption: true,
                    enableFiltering: true,
                    enableCaseInsensitiveFiltering: true,
                    maxHeight: 150
                });
                $('#ddlCriticalityPriorityNorm_PNorm').multiselect('refresh');
            }
        }
    });


    $("#ddlPracticeGridView").multiselect('refresh');

    $('#ddlPracticeGridView').empty();

    $('#ddlPracticeGridView').multiselect('destroy');


    $.each(ddlpracticelist.responseJSON.Result.data, function (index, data) {
        $('#ddlPracticeGridView').append($("<option>").val(data.PracticeId).text(data.PracticeName));

    });

    $('#ddlPracticeGridView').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $("#ddlPracticeGridView option").prop("selected", true);
    $("#ddlPracticeGridView").multiselect('refresh');



}

function BindDropdown() {

    var ddldata;
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating/GetDataForDropdown?AppraisalCycleId=" + sessionStorage.AppraisalCycleId + "&LoginEmployeeId=" + sessionStorage.EmployeeId + "&RoleId=" + $("#ddlRole").val();

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

    $('#ddlgenderNorm_PNorm').empty();

    for (let t = 0; t < sortedEmpGenderKeys.length; t++) {
        $('#ddlgenderNorm_PNorm').append($("<option>").val(dictEmpGender[sortedEmpGenderKeys[t]]).text(sortedEmpGenderKeys[t]));

    }

    $('#ddlgenderNorm_PNorm').multiselect('destroy');

    $('#ddlgenderNorm_PNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgenderNorm_PNorm').multiselect('refresh');

    ////////////////////////////////////////

    //$('#ddlgenderNorm_PNorm').empty();

    //for (let t = 0; t < sortedEmpGenderKeys.length; t++) {
    //    $('#ddlgenderNorm_PNorm').append($("<option>").val(dictEmpGender[sortedEmpGenderKeys[t]]).text(sortedEmpGenderKeys[t]));

    //}

    //$('#ddlgenderNorm_PNorm').multiselect('destroy');

    //$('#ddlgenderNorm_PNorm').multiselect({
    //    includeSelectAllOption: true,
    //    enableFiltering: true,
    //    enableCaseInsensitiveFiltering: true,
    //    maxHeight: 150
    //});

    //$('#ddlgenderNorm_PNorm').multiselect('refresh');


    var dictLocation = {};
    var sortedLocationKeys = [];

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

    ////////////////////////////////////////////////////////////////////////
    //Binding Group Account Dropdown

    ;
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

//function BindNormalizationOverallDataOnInstertionScreen() {

//    ;
//    var empId = sessionStorage.EmployeeId;
//    var token = sessionStorage.TokenValue;

//    var headerInfo = {
//        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
//        'X-EmpNo': sessionStorage.EmployeeId
//    };

//    //var IReportee = $('#ddlReportee').val().toString();// $("#ddlReporteeNorm").val().toString();
//    var practice = $("#ddlPracticeGridView").val().toString();


//    //if (selectedEmployees.indexOf("-1") != -1) {
//    //    selectedEmployees[selectedEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
//    //}
//    //var IReportee = selectedEmployees.toString();

//    var GradeId = $("#ddlgrade").val().toString();
//    var LocationId = $("#ddllocation").val().toString();
//    var GroupAccountId = $("#ddlgroupaccount").val().toString();
//    var Gender = $("#ddlgender").val().toString();
//    var EmpStatus = $("#ddlEmployeeStatus").val().toString();
//    var Promotion = $("#ddlPromotion").val().toString();


//    if (practice == "") {
//        practice = 0;
//    }
//    if (GradeId == "") {
//        GradeId = 0;
//    }
//    if (LocationId == "") {
//        LocationId = 0;
//    } if (GroupAccountId == "") {
//        GroupAccountId = 0;
//    }
//    if (Gender == "") {
//        Gender = 0;
//    }
//    if (EmpStatus == "") {
//        EmpStatus = 0;
//    }
//    if (Promotion == "") {
//        Promotion = 0;
//    }



//    //$('#CompleteSpanNormalizationtbl tbody tr:gt(1)').remove();


//    var svrPath = CONFIG.get('SERVERNAME');

//    var apiPath = svrPath + "Rating/GetRatingOverallDataStudioView?AppraisalCycleId=" + sessionStorage.AppraisalCycleId + "&EMPID=" + empId + "&Practice=" + practice + "&GradeId=" + GradeId + "&LocationId=" + LocationId + "&GroupAccountId=" + GroupAccountId + "&Gender=" + Gender + "&EmpStatus=" + EmpStatus + "&Promotion=" + Promotion + "&RoleId=0";

//    //CommonAjaxGET(apiPath, headerInfo).done(function (ratingOverallData) {

//    //if (rawDataOverallNorm.Success == true) {
//    //let Arr = rawDataOverallNorm;


//    $.ajax({
//        type: "GET",
//        url: apiPath,
//        headers: headerInfo,
//        contentType: "application/json; charset=utf-8",
//        dataType: "json",
//        beforeSend: function (xhr, opts) {
//            $('.loader-div').show();
//        },

//        success: function (ratingOverallData) {
//            if (ratingOverallData.Success == true) {

//                $('#CompleteSpanNormalizationtblPractice tbody').html('');
//                $('.loader-div').hide();
//                let Arr = ratingOverallData;
//                //    rawData = ratingOverallData;
//                let outputArray = [];

//                let count = 0;

//                let start = false;

//                for (let j = 0; j < Arr.Result.length; j++) {
//                    for (let k = 0; k < outputArray.length; k++) {
//                        if (Arr.Result[j].GRADE == outputArray[k]) {
//                            start = true;
//                        }
//                    }
//                    count++;
//                    if (count == 1 && start == false) {
//                        outputArray.push(Arr.Result[j].GRADE);
//                    }
//                    start = false;
//                    count = 0;
//                }

//                // console.log(outputArray);

//                var TotalCountGrade = 0;

//                var idealTotalEE1 = 0.0;
//                var idealTotalEE = 0;
//                var idealTotalME = 0;
//                var idealTotalBE = 0;

//                var RatingGivenTotalEE1 = 0;
//                var RatingGivenTotalEE = 0;
//                var RatingGivenTotalME = 0;
//                var RatingGivenTotalBE = 0;


//                var DiffTotalEE1 = 0;
//                var DiffTotalEE = 0;
//                var DiffTotalME = 0;
//                var DiffTotalBE = 0;

//                var PerTotalEE1 = 0;
//                var PerTotalEE = 0;
//                var PerTotalME = 0;
//                var PerTotalBE = 0;

//                var OverallTotalCount = 0;
//                var OverallGiven = 0;
//                var OverallDiff = 0;


//                for (let j = 0; j < outputArray.length; j++) {

//                    var GradewiseTotalCount = 0;
//                    var GradewiseEECurrentCount = 0;
//                    var GradewiseEE1CurrentCount = 0;
//                    var GradewiseBECurrentCount = 0;
//                    var GradewiseMECurrentCount = 0;

//                    var ME_CurrentCount = 0;
//                    var BE_CurrentCount = 0;
//                    var EE_CurrentCount = 0;
//                    var EE1_CurrentCount = 0;

//                    var ME_CurrentCountOverall = 0;
//                    var BE_CurrentCountOverall = 0;
//                    var EE_CurrentCountOverall = 0;
//                    var EE1_CurrentCountOverall = 0;

//                    var ME_TotalCount = 0;
//                    var BE_TotalCount = 0;
//                    var EE_TotalCount = 0;
//                    var EE1_TotalCount = 0;

//                    //  var OverallTotalCount = 0;
//                    var TotalCount = 0;
//                    var CurrentCount = 0;
//                    var t1 = 0;
//                    var t2 = 0;
//                    var t3 = 0;
//                    var t4 = 0;
//                    var t5 = 0;


//                    var t1_Per = 0;
//                    var t2_Per = 0;
//                    var t3_Per = 0;
//                    var t4_Per = 0;
//                    var t5_Per = 0;

//                    var idealEE1 = 0;
//                    var idealEE = 0;
//                    var idealME = 0;
//                    var idealBE = 0;

//                    var TotalEachPer = 0;
//                    var TotalPer = 0;


//                    for (let k = 0; k < Arr.Result.length; k++) {

//                        if (outputArray[j] == Arr.Result[k].GRADE) {

//                            if (TotalCount == 0) {
//                                TotalCount += Arr.Result[k].TotalCount;
//                            }
//                            if (Arr.Result[k].Rating == 'ME') {
//                                ME_CurrentCount += Arr.Result[k].CurrentCount;
//                                //if (TotalCount == 0) {
//                                //    TotalCount += Arr.Result[k].TotalCount;
//                                //}

//                            }
//                            if (Arr.Result[k].Rating == 'EE') {

//                                EE_CurrentCount += Arr.Result[k].CurrentCount;
//                                //if (TotalCount == 0) {
//                                //    TotalCount += Arr.Result[k].TotalCount;
//                                //}

//                            }
//                            if (Arr.Result[k].Rating == 'EE1') {
//                                EE1_CurrentCount += Arr.Result[k].CurrentCount;
//                                //if (TotalCount == 0) {
//                                //    TotalCount += Arr.Result[k].TotalCount;
//                                //}


//                            }
//                            if (Arr.Result[k].Rating == 'BE') {

//                                BE_CurrentCount += Arr.Result[k].CurrentCount;
//                                //if (TotalCount == 0) {
//                                //    TotalCount += Arr.Result[k].TotalCount;
//                                //}
//                            }


//                            idealEE1 = ((TotalCount * 5) / 100).toFixed(2).replace(".00", "");
//                            idealEE = ((TotalCount * 25) / 100).toFixed(2).replace(".00", "");
//                            idealME = ((TotalCount * 60) / 100).toFixed(2).replace(".00", "");
//                            idealBE = ((TotalCount * 10) / 100).toFixed(2).replace(".00", "");

//                            t1 = (idealEE1 - EE1_CurrentCount).toFixed(2).replace(".00", "");
//                            t2 = (idealEE - EE_CurrentCount).toFixed(2).replace(".00", "");
//                            t3 = (idealME - ME_CurrentCount).toFixed(2).replace(".00", "");
//                            t4 = (idealBE - BE_CurrentCount).toFixed(2).replace(".00", "");


//                            //t1_Per = (t1 / 100).toFixed(2).replace(".00", "");

//                            //t2_Per = (t2 / 100).toFixed(2).replace(".00", "");

//                            //t3_Per = (t3 / 100).toFixed(2).replace(".00", "");

//                            //t4_Per = (t4 / 100).toFixed(2).replace(".00", "");

//                            // TotalCount = (EE1_TotalCount + EE_TotalCount + ME_TotalCount + BE_TotalCount)
//                            CurrentCount = (EE1_CurrentCount + EE_CurrentCount + ME_CurrentCount + BE_CurrentCount);
//                            t5 = TotalCount - CurrentCount;

//                            //EE1_CurrentCountOverall += EE1_CurrentCount;
//                            //EE_CurrentCountOverall += EE_CurrentCount;
//                            //BE_CurrentCountOverall += BE_CurrentCount;
//                            //MM_CurrentCountOverall += MM_CurrentCount;


//                        }
//                    }

//                    TotalCountGrade = TotalCountGrade + TotalCount;

//                    idealTotalEE1 = (idealTotalEE1 + parseFloat(idealEE1));
//                    idealTotalEE = (idealTotalEE + parseFloat(idealEE));
//                    idealTotalME = (idealTotalME + parseFloat(idealME));
//                    idealTotalBE = (idealTotalBE + parseFloat(idealBE));

//                    RatingGivenTotalEE1 = (RatingGivenTotalEE1 + parseFloat(EE1_CurrentCount));
//                    RatingGivenTotalEE = (RatingGivenTotalEE + parseFloat(EE_CurrentCount));
//                    RatingGivenTotalME = (RatingGivenTotalME + parseFloat(ME_CurrentCount));
//                    RatingGivenTotalBE = (RatingGivenTotalBE + parseFloat(BE_CurrentCount));

//                    DiffTotalEE1 = (DiffTotalEE1 + parseFloat(t1));
//                    DiffTotalEE = (DiffTotalEE + parseFloat(t2));
//                    DiffTotalME = (DiffTotalME + parseFloat(t3));
//                    DiffTotalBE = (DiffTotalBE + parseFloat(t4));

//                    PerTotalEE1 = (PerTotalEE1 + parseFloat(t1_Per));
//                    PerTotalEE = (PerTotalEE + parseFloat(t2_Per));
//                    PerTotalME = (PerTotalME + parseFloat(t3_Per));
//                    PerTotalBE = (PerTotalBE + parseFloat(t4_Per));

//                    OverallTotalCount = (OverallTotalCount + parseFloat(TotalCount));
//                    OverallGiven = (OverallGiven + parseFloat(CurrentCount));
//                    OverallDiff = (OverallDiff + parseFloat(t5));


//                    t1_Per = ((EE1_CurrentCount / TotalCount) * 100).toFixed(2).replace(".00", "");

//                    t2_Per = ((EE_CurrentCount / TotalCount) * 100).toFixed(2).replace(".00", "");

//                    t3_Per = ((ME_CurrentCount / TotalCount) * 100).toFixed(2).replace(".00", "");

//                    t4_Per = ((BE_CurrentCount / TotalCount) * 100).toFixed(2).replace(".00", "");

//                    TotalEachPer = ((CurrentCount / TotalCount) * 100).toFixed(2).replace(".00", "");;



//                    var newRow1 = $("<tr>");
//                    var cols = "";
//                    cols += '<td>' + outputArray[j] + '</td>';
//                    cols += '<td style="text-align: center;">' + TotalCount + '</td>';
//                    cols += '<td style="text-align: center;">' + idealEE1 + '</td>';
//                    cols += '<td style="text-align: center;">' + EE1_CurrentCount + '</td>';

//                    if (parseFloat(t1) < 0) {
//                        cols += '<td style="text-align: center;" title="Ideal Nos-Rating Given" class="diffcol">' + t1 + '</td>';
//                    } else {

//                        cols += '<td style="text-align: center;" title="Ideal Nos-Rating Given">' + t1 + '</td>';
//                    }

//                    cols += '<td style="text-align: center;" title="Difference/100">' + t1_Per + '</td>';
//                    cols += '<td style="text-align: center;">' + idealEE + '</td>';
//                    cols += '<td style="text-align: center;">' + EE_CurrentCount + '</td>';
//                    if (parseFloat(t2) < 0) {
//                        cols += '<td style="text-align: center;" title="Ideal Nos-Rating Given" class="diffcol">' + t2 + '</td>';
//                    } else {

//                        cols += '<td style="text-align: center;" title="Ideal Nos-Rating Given">' + t2 + '</td>';
//                    }
//                    cols += '<td style="text-align: center;" title="Difference/100">' + t2_Per + '</td>';
//                    cols += '<td style="text-align: center;">' + idealME + '</td>';
//                    cols += '<td style="text-align: center;">' + ME_CurrentCount + '</td>';
//                    if (parseFloat(t3) < 0) {
//                        cols += '<td style="text-align: center;" title="Ideal Nos-Rating Given" class="diffcol">' + t3 + '</td>';
//                    } else {

//                        cols += '<td style="text-align: center;" title="Ideal Nos-Rating Given">' + t3 + '</td>';
//                    }
//                    cols += '<td style="text-align: center;" title="Difference/100">' + t3_Per + '</td>';
//                    cols += '<td style="text-align: center;">' + idealBE + '</td>';
//                    cols += '<td style="text-align: center;">' + BE_CurrentCount + '</td>';

//                    if (parseFloat(t4) < 0) {
//                        cols += '<td style="text-align: center;" title="Ideal Nos-Rating Given" class="diffcol">' + t4 + '</td>';
//                    } else {

//                        cols += '<td style="text-align: center;" title="Ideal Nos-Rating Given">' + t4 + '</td>';
//                    }

//                    cols += '<td style="text-align: center;" title="Difference/100">' + t4_Per + '</td>';
//                    cols += '<td style="text-align: center;">' + TotalCount + '</td>';
//                    cols += '<td style="text-align: center;">' + CurrentCount + '</td>';
//                    cols += '<td style="text-align: center;">' + t5 + '</td>';
//                    //cols += '<td style="text-align: center;">' + TotalEachPer + '</td>';

//                    newRow1.append(cols);
//                    $("#CompleteSpanNormalizationtblPractice").append(newRow1);

//                }


//                PerTotalEE1 = ((RatingGivenTotalEE1 / TotalCountGrade) * 100).toFixed(2).replace(".00", "");
//                PerTotalEE = ((RatingGivenTotalEE / TotalCountGrade) * 100).toFixed(2).replace(".00", "");
//                PerTotalME = ((RatingGivenTotalME / TotalCountGrade) * 100).toFixed(2).replace(".00", "");
//                PerTotalBE = ((RatingGivenTotalBE / TotalCountGrade) * 100).toFixed(2).replace(".00", "");

//                if (isNaN(PerTotalEE1)) {
//                    PerTotalEE1 = 0;
//                }
//                if (isNaN(PerTotalEE)) {
//                    PerTotalEE = 0;
//                }
//                if (isNaN(PerTotalME)) {
//                    PerTotalME = 0;
//                }
//                if (isNaN(PerTotalBE)) {
//                    PerTotalBE = 0;
//                }

//                //TotalPer = ((OverallGiven / TotalCountGrade) * 100);

//                var newRow2 = $("<tr>");
//                var cols2 = "";
//                cols2 += '<td><b>Total<b/></td>';
//                cols2 += '<td style="text-align: center;"><b>' + TotalCountGrade.toFixed(2).replace(".00", "");; + '<b/></td>';
//                cols2 += '<td style="text-align: center;"><b>' + idealTotalEE1.toFixed(2).replace(".00", "");; + '<b/></td>';
//                cols2 += '<td style="text-align: center;"><b>' + RatingGivenTotalEE1.toFixed(2).replace(".00", "");; + '<b/></td>';
//                //cols2 += '<td style="text-align: center;">' + DiffTotalEE1.toFixed(2).replace(".00", "");; + '</td>';

//                if (parseFloat(DiffTotalEE1) < 0) {
//                    cols2 += '<td style="text-align: center;" class="diffcol"><b>' + DiffTotalEE1.toFixed(2).replace(".00", "");; + '<b/></td>';
//                } else {

//                    cols2 += '<td style="text-align: center;"><b>' + DiffTotalEE1.toFixed(2).replace(".00", "");; + '<b/></td>';
//                }
//                cols2 += '<td style="text-align: center;"><b>' + PerTotalEE1 + '<b/></td>';
//                cols2 += '<td style="text-align: center;"><b>' + idealTotalEE.toFixed(2).replace(".00", "");; + '<b/></td>';
//                cols2 += '<td style="text-align: center;"><b>' + RatingGivenTotalEE.toFixed(2).replace(".00", "");; + '<b/></td>';
//                if (parseFloat(DiffTotalEE) < 0) {
//                    cols2 += '<td style="text-align: center;" class="diffcol"><b>' + DiffTotalEE.toFixed(2).replace(".00", "");; + '<b/></td>';
//                } else {

//                    cols2 += '<td style="text-align: center;"><b>' + DiffTotalEE.toFixed(2).replace(".00", "");; + '<b/></td>';
//                }
//                cols2 += '<td style="text-align: center;"><b>' + PerTotalEE + '<b/></td>';

//                cols2 += '<td style="text-align: center;"><b>' + idealTotalME.toFixed(2).replace(".00", "");; + '<b/></td>';
//                cols2 += '<td style="text-align: center;"><b>' + RatingGivenTotalME.toFixed(2).replace(".00", "");; + '<b/></td>';

//                if (parseFloat(DiffTotalME) < 0) {
//                    cols2 += '<td style="text-align: center;" class="diffcol"><b>' + DiffTotalME.toFixed(2).replace(".00", "");; + '<b/></td>';
//                } else {

//                    cols2 += '<td style="text-align: center;"><b>' + DiffTotalME.toFixed(2).replace(".00", "");; + '<b/></td>';
//                }

//                cols2 += '<td style="text-align: center;"><b>' + PerTotalME + '<b/></td>';

//                cols2 += '<td style="text-align: center;"><b>' + idealTotalBE.toFixed(2).replace(".00", "");; + '<b/></td>';
//                cols2 += '<td style="text-align: center;"><b>' + RatingGivenTotalBE.toFixed(2).replace(".00", "");; + '<b/></td>';

//                if (parseFloat(DiffTotalBE) < 0) {
//                    cols2 += '<td style="text-align: center;" class="diffcol"><b>' + DiffTotalBE.toFixed(2).replace(".00", "");; + '<b/></td>';
//                } else {

//                    cols2 += '<td style="text-align: center;"><b>' + DiffTotalBE.toFixed(2).replace(".00", "");; + '<b/></td>';
//                }

//                cols2 += '<td style="text-align: center;"><b>' + PerTotalBE + '<b/></td>';


//                cols2 += '<td style="text-align: center;"><b>' + OverallTotalCount.toFixed(2).replace(".00", "");; + '<b/></td>';
//                cols2 += '<td style="text-align: center;"><b>' + OverallGiven.toFixed(2).replace(".00", "");; + '<b/></td>';
//                cols2 += '<td style="text-align: center;"><b>' + OverallDiff.toFixed(2).replace(".00", "");; + '<b/></td>';



//                newRow2.append(cols2);
//                $("#CompleteSpanNormalizationtblPractice").append(newRow2);
//            }
//        },
//        error: function (xhr, ajaxOptions, thrownError) {
//            ;
//            $('.loader-div').hide();
//            toastr.error('Failed to retrieve data.');
//        }
//    });
//}



var FilterrawData = [];


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

function FirstScreenfilterschange() {


    //BindNormalizationOverallDataOnInstertionScreen();

    /*    var filterData = [];*/

    //if (FilterrawData.length == 0) {
    //    FilterrawData = rawData;
    //}

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
                        filterData.push(rawData[j]);
                    }
                }
            }
        } else {
            for (let j = 0; j < FilterrawData.length; j++) {
                for (let k = 0; k < gradearray.length; k++) {
                    if (FilterrawData[j].GradeID == gradearray[k]) {
                        filterData.push(FilterrawData[j]);
                    }
                }
            }
        }
        FilterrawData = filterData;
    }

    var genderarray = [];

    ;
    if ($("#ddlgender option:selected").length > 0) {

        var filterData = [];


        var ddlgender = $("#ddlgender").val().toString();

        genderarray = ddlgender.split(',');

        if (FilterrawData.length == 0) {
            for (let j = 0; j < rawData.length; j++) {
                for (let k = 0; k < genderarray.length; k++) {
                    if (rawData[j].Gender == genderarray[k]) {
                        filterData.push(rawData[j]);
                    }
                }
            }
        } else {

            for (let j = 0; j < FilterrawData.length; j++) {
                for (let k = 0; k < genderarray.length; k++) {
                    if (FilterrawData[j].Gender == genderarray[k]) {
                        filterData.push(FilterrawData[j]);
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
                        filterData.push(rawData[j]);
                    }
                }
            }
        } else {

            for (let j = 0; j < FilterrawData.length; j++) {
                for (let k = 0; k < locationarray.length; k++) {
                    if (FilterrawData[j].LocationID == locationarray[k]) {
                        filterData.push(FilterrawData[j]);
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
                        filterData.push(rawData[j]);
                    }
                }
            }
        } else {

            for (let j = 0; j < FilterrawData.length; j++) {
                for (let k = 0; k < Groupaccountarray.length; k++) {
                    if (FilterrawData[j].AccountGroupId == Groupaccountarray[k]) {
                        filterData.push(FilterrawData[j]);
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
                        filterData.push(rawData[j]);
                    }
                }
            }
        } else {

            for (let j = 0; j < FilterrawData.length; j++) {
                for (let k = 0; k < EmpStatusarray.length; k++) {
                    if (FilterrawData[j].EmployeeStatus == EmpStatusarray[k]) {
                        filterData.push(FilterrawData[j]);
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


    if ((promotionarray.length > 0 && promotionarray[0].length > 0) || (gradearray.length > 0 && gradearray[0].length > 0) || (genderarray.length > 0 && genderarray[0].length > 0) || (locationarray.length > 0 && locationarray[0].length > 0) || (Groupaccountarray.length > 0 && Groupaccountarray[0].length > 0) || (EmpStatusarray.length > 0 && EmpStatusarray[0].length > 0)) {
        BindTableForFilters(FilterrawData)
    } else {
        BindTableForFilters(rawData)
    }

}

function BindTableForFilters(filterData) {
    var table = $('#tblEmpRatingList').DataTable();
    table.clear();

    //  rawData = filterData;

    $("#tblEmpRatingList").DataTable({

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

                    return "<a class='lnkRMHistory' style='margin-right:4px; cursor:pointer; text-decoration:underline;'  title='RM History'  data-id=" + row.PEPEmployeeId + " onclick='ViewRMHistory(" + row.PEPEmployeeId + ")'>View</a>";
                },
                "sWidth": "6%"
            },
            {
                "render": function (data, type, row, meta) {
                    return "<span>" + row.Gender + "</span>";
                },
                "sWidth": "5%"
            },
            {
                "render": function (data, type, row, meta) {
                    return "<span>" + row.GradeName + "</span><span><input type='hidden' id='hdnGradeID' name='hdnGradeID' value='" + row.GradeID + "'/></span>";
                },
                "sWidth": "5%"
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
                    return "<span>" + row.TalentCube + "</span>";
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
                mData: "LastpromotionDate",
                "sWidth": "20%"
            },
            {
                data: "CurrentRating",
                render: renderCurrentRatinggDropdown,
                "sWidth": "6%"
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

                    var Status = '--';


                    if (row.RowStatus == 1 && row.CurrentRating == "0") {
                        Status = "Not Initiated"
                    }
                    else if (row.RowStatus == 1) {
                        Status = "Saved in Draft"
                    }
                    else if ((row.RowStatus == 2 && row.ByRoleId != 3) || (row.RowStatus == 3 && $('#ddlRoleStudio').val() == 1)) {
                        Status = "Submitted"
                    }
                    else if ((row.RowStatus == 2) && (row.ByRoleId == 3)) {
                        Status = "Pending Management Approval";
                    }
                    else if (row.RowStatus == 3 && ($('#ddlRoleStudio').val() == 2 || $('#ddlRoleStudio').val() == 3)) {

                        Status = "Referred back by Approver";

                    }
                    else if (row.RowStatus == 5) {
                        Status = "Approved";

                    }

                    if (($('#ddlRoleStudio').val() == 2 || $('#ddlRoleStudio').val() == 3) && row.RowStatus == 5) {
                        return "<a class='table-icon fa fa-history lnkHistory' style='margin-right:4px;' title='History'  data-id=" + row.PEPEmployeeId + " onclick='ViewClaimHistory(" + row.PEPEmployeeId + ")'></a><span>" + Status + "</span><span><input type='hidden' id='hdnNextApproverId' name='hdnNextApproverId' value='" + row.NextApproverId + "'/></span>";
                    }
                    else if ($('#ddlRoleStudio').val() == 4) {
                        return "<a class='table-icon fa fa-history lnkHistory' style='margin-right:4px;' title='History'  data-id=" + row.PEPEmployeeId + " onclick='ViewClaimHistory(" + row.PEPEmployeeId + ")'></a><span>" + Status + "</span><span><input type='hidden' id='hdnNextApproverId' name='hdnNextApproverId' value='" + row.NextApproverId + "'/></span>";
                    }
                    else {
                        return "<span class='lnkHistory' data-id=" + row.PEPEmployeeId + ">" + Status + "</span><span><input type='hidden' id='hdnNextApproverId' name='hdnNextApproverId' value='" + row.NextApproverId + "'/></span>";
                    }
                },
                "sWidth": "6%"
            },
            {
                mRender: function (data, type, full) {
                    var btn;


                    if (EnableRoleId == $('#ddlRoleStudio').val()) {

                        if (full["RowStatus"] == "5") {

                            btn = '<div data-toggle="tooltip" class="Description" title="' + full["comment"] + '">' + full["comment"] + '</div>';
                        } else {
                            btn = "<textarea  maxlength='500'  type='text' value='" + full["comment"] + "'  class='form-control' rows='3' column='1'  id=" + full["PEPEmployeeId"] + " />" + full["comment"] + "</textarea><span><input type='hidden' id='hdnEmployeeId' name='hdnEmployeeId' value='" + + full["PEPEmployeeId"] + "'/></span>";

                        }

                    } else {
                        btn = '<div data-toggle="tooltip" class="Description" title="' + full["comment"] + '">' + full["comment"] + '</div>';

                    }

                    return btn;
                }
                , className: "Description"
            },

            //{
            //    "render": function (data, type, row, meta) {

            //        var btn;


            //        if (EnableRoleId == $('#ddlRole').val()) {
            //            btn = "<textarea maxlength='500'  type='text' value='" + row.comment + "'  class='form-control' rows='3' column='1' id=" + row.PEPEmployeeId + " />" + row.comment + "</textarea><span><input type='hidden' id='hdnEmployeeId' name='hdnEmployeeId' value='" + row.PEPEmployeeId + "'/></span>";
            //        } else {

            //            btn = "<textarea maxlength='500' disabled  type='text' value='" + row.comment + "'  class='form-control' rows='3' column='1' id=" + row.PEPEmployeeId + " />" + row.comment + "</textarea><span><input type='hidden' id='hdnEmployeeId' name='hdnEmployeeId' value='" + row.PEPEmployeeId + "'/></span>";
            //        }


            //        return btn;
            //    },
            //    "sWidth": "26%"
            //},
        ],
        "deferRender": false,
        initComplete: function (settings, json) {


            var ShowGenderLocation = [];
            ShowGenderLocation = ['1', '2', '4', '5', '9', '10', '11', '15', '16', '23'];

            var table = $('#tblEmpRatingList').DataTable();
            if (ShowGenderLocation.includes(sessionStorage.LocationId)) {
                table.column(2).visible(true);
                $('.hide-this').show();
            } else {
                table.column(2).visible(false);
                $('.hide-this').hide();

            }




        }
    });

}


function BindReporteeRatings() {
    btnvisibleFlag = 0;
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

    var Practice = $("#ddlPracticeGridView").val().toString();


    //if (selectedEmployees.indexOf("-1") != -1) {
    //    selectedEmployees[selectedEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    //}
    //var reporteeIds = selectedEmployees.toString();

    //if (selectedEmployees.length == $("#ddlPracticeGridView option").length) {
    //    allSelected = true;
    //}

    /*    var reporteeIds = selectedEmployees.toString();*/
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating/PracticeGridView?AppraisalCycleId=" + sessionStorage.AppraisalCycleId + "&Practice=" + Practice + "&LogEmpID=" + sessionStorage.EmployeeId;


    // $("#loading-overlay").show(); // Show loading image


    CommonAjaxGET(apiPath, headerInfo).done(function (ratingData) {
        if (ratingData.Success == false) {

            //  console.log("tblEmpRating-" + ratingData.ErrorCode + ' ' + ratingData.ErrorMessage)
            var table = $('#tblEmpRatingList').DataTable();

            table.clear();
        }
        else {
            rawData = ratingData.Result.data;
        }

        if (allSelected && ratingData.Success) {
            TotalReporteesSpanCount = ratingData.Result.data.length;
        }

        //if (IsRatingGiventoEmployees == 1) // when all employees rating already completed.
        //{
        //    TotalReporteesSpanCount = ratingData.Result.length;
        //}

        if (ratingData.Success) {
            ReporteesSpanCountForReferback = ratingData.Result.data.length;
        }

        BindGrade();
        BindGroupAccount();
        BindGender();
        BindLocation();
        BindEmpStatus();

        var ReporteesortedData = [];

        for (var i = 0; i < rawData.length; i++) {
            if (rawData[i].RMName == sessionStorage.EmployeeId) {
                ReporteesortedData.push(rawData[i]);
            }

        }



        $('#ReporteeNo').text(ReporteesortedData.length);


        var selectedEmployees = $("#ddlPracticeGridView").val();



        $("#tblEmpRatingList").DataTable({
            data: ratingData.Result.data,
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
                        return "<span>" + row.Gender + "</span><input type='hidden' id='hdnGradeLevel' name='hdnGradeLevel' value='" + row.GradeLevel + "'/></span>";
                    },
                    "sWidth": "5%"
                },
                {
                    "render": function (data, type, row, meta) {
                        return "<span>" + row.GradeName + "</span><span><input type='hidden' id='hdnGradeID' name='hdnGradeID' value='" + row.GradeID + "'/></span>";
                    },
                    "sWidth": "5%"
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
                        return "<span>" + row.TalentCube + "</span>";
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
                        //   var dt = new Date(data);
                        return "<span>" + row.LastpromotionDate + "</span ><span><input type='hidden' id='hdnSLastratingGivenBy' name='hdnSLastratingGivenBy' value='" + row.SLastRatingGivenBy + "' /></span>";
                    },
                    "sWidth": "20%"
                },
                {
                    data: "CurrentRating",
                    render: renderCurrentRatinggDropdown,
                    "sWidth": "6%"
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

                        var Status = '--';

                        if (row.RowStatus == 1 && row.CurrentRating == "0") {
                            Status = "Not Initiated"
                        }
                        else if (row.RowStatus == 1) {
                            Status = "Saved in Draft"
                        }
                        else if ((row.RowStatus == 2 && row.ByRoleId != 3) || (row.RowStatus == 3 && $('#ddlRoleStudio').val() == 1)) {
                            Status = "Submitted"
                        }
                        else if ((row.RowStatus == 2) && (row.ByRoleId == 3)) {
                            Status = "Pending Management Approval"
                            RecoDesig = true;
                        }
                        else if (row.RowStatus == 3 && ($('#ddlRoleStudio').val() == 2 || $('#ddlRoleStudio').val() == 3)) {

                            Status = "Referred back by Approver"
                        }
                        else if (row.RowStatus == 5) {
                            Status = "Approved"
                        }

                        if (($('#ddlRoleStudio').val() == 2 || $('#ddlRoleStudio').val() == 3) && row.RowStatus == 5) {

                            return "<a class='table-icon fa fa-history lnkHistory' style='margin-right:4px;' title='History'  data-id=" + row.PEPEmployeeId + " onclick='ViewClaimHistory(" + row.PEPEmployeeId + ")'></a><span>" + Status + "</span><span><input type='hidden' id='hdnNextApproverId' name='hdnNextApproverId' value='" + row.NextApproverId + "'/></span>";
                        }
                        else if ($('#ddlRoleStudio').val() == 4) {

                            return "<a class='table-icon fa fa-history lnkHistory' style='margin-right:4px;' title='History'  data-id=" + row.PEPEmployeeId + " onclick='ViewClaimHistory(" + row.PEPEmployeeId + ")'></a><span>" + Status + "</span><span><input type='hidden' id='hdnNextApproverId' name='hdnNextApproverId' value='" + row.NextApproverId + "'/></span>";
                        }
                        else {
                            return "<span class='lnkHistory' data-id=" + row.PEPEmployeeId + " >" + Status + "</span><span><input type='hidden' id='hdnNextApproverId' name='hdnNextApproverId' value='" + row.NextApproverId + "'/></span>";
                        }
                    },
                    "sWidth": "6%"
                },
                {
                    mRender: function (data, type, full) {
                        var btn;


                        btn = '<div data-toggle="tooltip" class="Description" title="' + full["comment"] + '">' + full["comment"] + '</div>';



                        return btn;
                    }
                    , className: "Description"
                },

            ],
            "deferRender": false
        });


        var ShowGenderLocation = [];

        var ShowGenderLocation = [];
        ShowGenderLocation = ['1', '2', '4', '5', '9', '10', '11', '15', '16', '23'];

        var table = $('#tblEmpRatingList').DataTable();
        if (ShowGenderLocation.includes(sessionStorage.LocationId)) {
            table.column(2).visible(true);
            $('.hide-this').show();
        } else {
            table.column(2).visible(false);
            $('.hide-this').hide();

        }

        $('.loader-div').hide();
    });







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



    $("#loading-overlay").hide(); // Show loading image
}

function genderChangesforGeoWise() {

    ;
    var ShowGenderLocation = [];
    ShowGenderLocation = ['1', '2', '4', '5', '9', '10', '11', '15', '16', '23'];


    var dt = $('#tblEmpRatingList').DataTable();

    if (ShowGenderLocation.includes(sessionStorage.LocationId)) {
        $('#divGender').css('display', 'inline-block');

        $('#divGenderNorm_PNorm').css('display', 'inline-block');
        $('#divGenderPromoPractice').css('display', 'inline-block');
        $('#NormalizationMaleFemaletbl_PNorm').css('display', 'inline-block');

        $('.divMaleFemaleTable').css('display', 'inline-block');
        $('#tblMFPromotionSummaryPractice').css('display', 'inline-block');


        //BellCurve();



    } else {

        // showBellCurve_StudioView();
    }
}
function RatingFilterTab() {


    var total = 0;
    var empId = sessionStorage.EmployeeId;
    var svrPath = CONFIG.get('SERVERNAME');

    var Ipractice = $("#ddlReporteePractice_Norm").val().toString();

    var GradeId = $("#ddlgrade").val().toString();
    var LocationId = $("#ddllocation").val().toString();
    var GroupAccountId = $("#ddlgroupaccount").val().toString();
    var Gender = $("#ddlgender").val().toString();
    var EmpStatus = $("#ddlEmployeeStatus").val().toString();
    var Promotion = $("#ddlPromotion").val().toString();


    if (Ipractice == "") {
        Ipractice = 0;
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

    var apiPath = svrPath + "Rating/GetDataForChartStudioView?EMPID=" + empId + "&AppraisalCycleId=" + sessionStorage.AppraisalCycleId + "&Practice=" + Ipractice + "&GradeId=" + GradeId + "&LocationId=" + LocationId + "&GroupAccountId=" + GroupAccountId + "&Gender=" + Gender + "&EmpStatus=" + EmpStatus + "&Promotion=" + Promotion + "&RoleId=0" + studioPnormCriticalityQuerySuffix();

    $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'Get',
        url: apiPath,
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        },
        async: false,

        success: function (data) {
            $(".loader-div").hide();

            ;
            //setting  data from result to variables
            if (data.Result.data.length > 0) {
                //BE = data.Result[0].BE;
                //ME = data.Result[0].ME;
                //EE = data.Result[0].EE;
                //EE1 = data.Result[0].EE1;
                //MBE = data.Result[1].BE;
                //MME = data.Result[1].ME;
                //MEE = data.Result[1].EE;
                //MEE1 = data.Result[1].EE1;
                //FBE = data.Result[2].BE;
                //FME = data.Result[2].ME;
                //FEE = data.Result[2].EE;
                //FEE1 = data.Result[2].EE1;
                //notgiven = data.Result[3].EE;
                //$('#filtersDiv').css('display', 'block');
                //$('#EEspan').text(EE);
                //$('#MEspan').text(ME);
                //$('#BEspan').text(BE);
                //$('#EE1span').text(EE1);
                //$('#Notspan').text(notgiven);
                //total = EE + ME + BE + EE1;
                //$('#TotalSpan').text(total);

                //;

                BE_STab_PNorm = data.Result.data[0].BE;
                ME_STab_PNorm = data.Result.data[0].ME;
                EE_STab_PNorm = data.Result.data[0].EE;
                EE1_STab_PNorm = data.Result.data[0].EE1;
                MBE_STab_PNorm = data.Result.data[1].BE;
                MME_STab_PNorm = data.Result.data[1].ME;
                MEE_STab_PNorm = data.Result.data[1].EE;
                MEE1_STab_PNorm = data.Result.data[1].EE1;
                FBE_STab_PNorm = data.Result.data[2].BE;
                FME_STab_PNorm = data.Result.data[2].ME;
                FEE_STab_PNorm = data.Result.data[2].EE;
                FEE1_STab_PNorm = data.Result.data[2].EE1;
                notgiven_PNorm = data.Result.data[3].EE;
                $('#filtersDiv').css('display', 'block');
                $('#Notspan').text(notgiven_PNorm);
                total = EE_STab_PNorm + ME_STab_PNorm + BE_STab_PNorm + EE1_STab_PNorm;
                $('#TotalSpan').text(total);
            }
        },
        error: function (response) {
            $(".loader-div").hide();
            debugger;
            alert(response + '1');
        }
    });
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


function renderPromotiontDropdown(data, type, row) {



    var dropdownHtml = '';


    dropdownHtml = `<div class="input-group input-append date id="" style="margin: 0 auto;"> <select class='form-control rating ddlPromoClass'  id="${row.PEPEmployeeId}" disabled>`;



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

    var dropdownHtml = '';

    dropdownHtml = `<div class="input-group input-append CurrPromotion date" style="margin: 0 auto;">
<select class='form-control rating ddlPromoClass' id="promo_${row.PEPEmployeeId}_${row.IsEligibleForPromotion}_${row.PrevRating}" style="${bgColor}"  disabled>`;


    if (row.RecoForPromotion == "1") {
        dropdownHtml += `<option value="0">--Select--</option><option value="1" selected>Yes</option><option value="2">No</option>`;
    } else if (row.RecoForPromotion == "2") {
        dropdownHtml += `<option value="0">--Select--</option><option value="1">Yes</option><option value="2" selected>No</option>`;
    } else {
        dropdownHtml += `<option value="0" selected>--Select--</option><option value="1">Yes</option><option value="2" selected>No</option>`;
    }

    dropdownHtml += `</select></div>`;

    //dropdownHtml = `<div class="form-control  CurrPromotion date"  style="margin: 0 auto;${bgColor}"  >`;

    //if (row.RecoForPromotion == "1") {
    //    dropdownHtml = "Yes";
    //} else if (row.RecoForPromotion == "2") {
    //    dropdownHtml = "No";
    //} else {
    //    dropdownHtml = "No";
    //}

    //dropdownHtml += `</div>`;


    return dropdownHtml;
}


function renderPromotionTrackDropdown(data, type, row) {

    var dropdownHtml;

    if (row.RecoForPromotion == 1) {

        if (row.PromotionTrack == 1) {
            dropdownHtml = "NA";
        } else if (row.PromotionTrack == 2) {
            dropdownHtml = "Individual Track";
        }
        else if (row.PromotionTrack == 3) {
            dropdownHtml = "Management Track";
        }
        else if (row.PromotionTrack == 4) {
            dropdownHtml = "Architect Track";
        }
    } else {

        dropdownHtml = "NA";
    }

    return dropdownHtml;
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

    ////////////////////////////////////////


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


    ///////////////////////////////////////

}

function BindLocation() {


    //Binding Location Dropdowns

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




    ////////////////////////////////////////


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


    $('#ddlgenderNorm_PNorm').empty();

    for (let t = 0; t < sortedEmpGenderKeys.length; t++) {
        $('#ddlgenderNorm_PNorm').append($("<option>").val(dictEmpGender[sortedEmpGenderKeys[t]]).text(sortedEmpGenderKeys[t]));

    }

    $('#ddlgenderNorm_PNorm').multiselect('destroy');

    $('#ddlgenderNorm_PNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgenderNorm_PNorm').multiselect('refresh');




    $('#ddlgenderPractice').empty();

    for (let t = 0; t < sortedEmpGenderKeys.length; t++) {
        $('#ddlgenderPractice').append($("<option>").val(dictEmpGender[sortedEmpGenderKeys[t]]).text(sortedEmpGenderKeys[t]));

    }

    $('#ddlgenderPractice').multiselect('destroy');

    $('#ddlgenderPractice').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgenderPractice').multiselect('refresh');
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
}


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


function filterData(filter, TableName) {


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


    var sortedData = [];
    if (TableName == 'tblEmpRatingList') {
        if (filter == 'BE') {
            $('.animation').removeClass('animation');
            $('.filterBE').closest('button').addClass('animation');

            filter = '3';
        }
        else if (filter == 'ME') {
            $('.animation').removeClass('animation');
            $('.filterME').closest('button').addClass('animation');
            filter = '2';
        }
        else if (filter == 'EE') {
            $('.animation').removeClass('animation');
            $('.filterEE').closest('button').addClass('animation');
            filter = '1';
        }
        else if (filter == 'EE1') {
            $('.animation').removeClass('animation');
            $('.filterEE1').closest('button').addClass('animation');
            filter = '4';
        }
        else if (filter == 'All') {
            $('.animation').removeClass('animation');
            $('.filterAll').closest('button').addClass('animation');
        }
        else if (filter == 'Not') {
            $('.animation').removeClass('animation');
            $('.filterNot').closest('button').addClass('animation');
            filter = '0';
        }
        else if (filter == 'RM') {
            $('.animation').removeClass('animation');
            $('.RM').closest('button').addClass('animation');
            filter = 'RM';
        }
        else if (filter == 'Total') {
            $('.animation').removeClass('animation');
            //$('.MR_Total').closest('td').addClass('animation');
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

                var Status = '--';

                if (row.RowStatus == 1 && row.CurrentRating == "0") {
                    Status = "Not Initiated"
                }
                else if (row.RowStatus == 1) {
                    Status = "Saved in Draft"
                }
                else if ((row.RowStatus == 2 && row.ByRoleId != 3) || (row.RowStatus == 3 && $('#ddlRoleStudio').val() == 1)) {
                    Status = "Submitted"
                }
                else if ((row.RowStatus == 2) && (row.ByRoleId == 3)) {
                    Status = "Pending Management Approval"
                }
                else if (row.RowStatus == 3 && ($('#ddlRoleStudio').val() == 2 || $('#ddlRoleStudio').val() == 3)) {

                    Status = "Referred back by Approver"

                }
                else if (row.RowStatus == 5) {
                    Status = "Approved"
                }
                return Status;
            },
            "sWidth": "6%"
        }
    );
    colArr.push(

        {

            mRender: function (data, type, full) {
                var btn;

                btn = '<div data-toggle="tooltip" class="Description" title="' + full["comment"] + '">' + full["comment"] + '</div>';

                return btn;
            }
            , className: "Description"

        }

    );


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
        "columnDefs": [
            { "orderData": [], "targets": 0 }, //TURN OFF DEFAULT SORTING OF TABLE
            { "orderable": false, "targets": 0 }  //TURN OFF SORTABLILITY FOR COLUMN 1
        ],
        "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
        dom: '<"row"<"col-sm-6"Bl><"col-sm-6"f>>' + '<"row"<"col-sm-12"<"table-responsive"tr>>>' + '<"row"<"col-sm-5"i><"col-sm-7"p>>',
        aoColumns: colArr,
        "deferRender": false,
        initComplete: function (settings, json) {

            var ShowGenderLocation = [];
            ShowGenderLocation = ['1', '2', '4', '5', '9', '10', '11', '15', '16', '23'];

            var table = $('#tblEmpRatingList').DataTable();
            if (ShowGenderLocation.includes(sessionStorage.LocationId)) {
                table.column(2).visible(true);
                $('.hide-this').show();
            } else {
                table.column(2).visible(false);
                $('.hide-this').hide();

            }

        }
    });
    //changeBackgroundColor();





}

