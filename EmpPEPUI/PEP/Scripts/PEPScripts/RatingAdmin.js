///*const { debug } = require("request");

if (typeof getRatingPagesAppraisalCycleId !== 'function') {
    console.error('[PEP] RatingAppraisalCycleContext.js must load before RatingAdmin.js; using sessionStorage.AppraisalCycleId only.');
    window.getRatingPagesAppraisalCycleId = function () { return sessionStorage.AppraisalCycleId; };
}

var ddlAppCycle = '';
var BE = 0, ME = 0, EE = 0, EE1 = 0;
var MBE = 0, MME = 0, MEE = 0, MEE1 = 0;
var FBE = 0, FME = 0, FEE = 0, FEE1 = 0;
//////////////////////////////////////////////////


var STab_BE = 0, STab_ME = 0, STab_EE = 0, STab_EE1 = 0;
var STab_MBE = 0, STab_MME = 0, STab_MEE = 0, STab_MEE1 = 0;
var STab_FBE = 0, STab_FME = 0, STab_FEE = 0, STab_FEE1 = 0;

//////////////////////////////////////////////////



var MainData = [];
var rawData = [];
var rawDataOverallNorm = [];
var ratingPromotionOverallData = [];
var ratingPromotionRawData = [];
var notgiven = 0;
var TotalSpan = 0;
var data = [];
var notUpdatedData = [];
var approvedReportees = [];
var gradeList = [];
var btnvisibleFlag = 0;
var dictGrade = {};
var dictGroupAccount = {};
var currentVisibilityRatingObj = undefined;
var sortedGradeKeys;
var sortedAccountKeys = [];
var allGradeList = [];
var normAppraisalCycleGradeData = [];
var promotionGradeConfigurtionData = [];
var RecordsCountPerPage = 100;
var TotalReporteesSpanCount = 0;


$(document).ready(function () {

    currentAppraisalCycleId = getRatingPagesAppraisalCycleId();

    $('[data-toggle="tooltip"]').tooltip();

    $("#close-filter-HRBPAdmin").click(function () {
        $(".filter-top-sec-item-HRBPAdmin").slideToggle('slow');
        $("#open-filter-HRBPAdmin").show('slow');
        $("#close-filter-HRBPAdmin").hide('slow');
    });
    $("#open-filter-HRBPAdmin").click(function () {
        $(".filter-top-sec-item-HRBPAdmin").slideToggle('slow');
        $("#open-filter-HRBPAdmin").hide('slow');
        $("#close-filter-HRBPAdmin").show('slow');
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

    $("#btnUpdateNormConf").click(function () {
        SaveRatingVisibility();
    });

    $('#ddllocation_HRBPAdminNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150,

    });
    $('#ddllocation_HRBPAdminPromo').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgender_HRBPAdminPromo').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgender_HRBPAdminNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlDeliveryStatus_HRBP').multiselect({
        includeSelectAllOption: true,
        enableFiltering: false,
        enableCaseInsensitiveFiltering: false,
        maxHeight: 150
    });

    BindCriticalityPriority_HRBP();

    $('#ddlDeliveryStatus_Norm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: false,
        enableCaseInsensitiveFiltering: false,
        maxHeight: 150
    });

    $('#ddlPromotion_HRBP').multiselect({
        includeSelectAllOption: true,
        enableFiltering: false,
        enableCaseInsensitiveFiltering: false,
        maxHeight: 150
    });

    $('#ddlPromotion_PNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: false,
        enableCaseInsensitiveFiltering: false,
        maxHeight: 150
    });



    ////////////////////////////////////////////////////////////////////////////////


    $('#ddlgrade_GDLDept_head').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150,
        nonSelectedText: 'None selected'
    });
    $('#ddllocation_GDLDept_head').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });
    $('#ddlgroupaccount_GDLDept_head').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });
    $('#ddlgender').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });
    $('#ddlEmployeeStatus_HRBP').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    if (SelectionAccessType == 1) {
        $('.spnRole').text('Admin');
        $('#UploadSection').css('display', 'block');
    } else {
        $('.spnRole').text('HRBP');
        $('#UploadSection').css('display', 'none');
    }
    /////////////////////////////////////////////////////////////////////////////////////////
    $(window).scroll(function () {

        if ($(this).scrollTop() > 100) {
            $('.btn-fixedon-scroll').fadeIn();
        }
        else {
            $('.btn-fixedon-scroll').fadeOut();
        }
    });


    // HRBP and Admin View
    //$('#ddlGDLDept_head').multiselect({
    //    includeSelectAllOption: true,
    //    maxHeight: 150
    //}
    //$('#ddlRMSpan_head').multiselect({
    //    includeSelectAllOption: true,
    //    maxHeight: 150
    //});

    BindGDL_RMList();

    //$('#ddllocation_GDLDept_head').multiselect({
    //    includeSelectAllOption: true,
    //    enableFiltering: true,
    //    enableCaseInsensitiveFiltering: true,
    //    maxHeight: 150
    //});



    //BindAllGrade();
    //BindAppraisalCycleGradeMappingGrid();
    BindActiveAppraisalCycle();

    //$("#dtNormStartDate").datepicker({

    //    minDate: '0',
    //    dateFormat: 'dd-mm-yy'

    //});

    SetUpNormDatePicker();


    $("#dtNormStartDate").datepicker({

        dateFormat: "dd-mm-yy", // You can change the format
        minDate: 0 // Disables all past dates including yesterday
        //dateFormat: "dd-mm-yy",
        //onSelect: function (selectedDate) {
        //    var minEndDate = $(this).datepicker("getDate");
        //  $("#dtNormEndDate").datepicker("option", "minDate", minEndDate);

    });

    $("#dtNormEndDate").datepicker({
        minDate: 0,
        dateFormat: "dd-mm-yy"
    });

    $("#btnAddNormAppriasalCycleGradeMapping").click(function () {
        InsertNormAppraisalCycleGradeMapping();
    });
    $("#btnAddNormRoleMapping").click(function () {
        AddUpdateRoleMapping();
    });

    //setTimeout(BindReporteeRatings, 500);

    BindReporteeRatings();

    HRBPAdmin_RatingGivenNotGivenDetails();


    BindHRBPAdminNormalizationOverallData();
    BindHRBPMaleFemaleNormalization();
    // HRBPAdminBellCurve();
    NormHRBPAdminBellCurve();



    //changeBackgroundColor();

    BindHRBPAdminOverAllPromotionSummary();
    BindHRBPAdminOverAllMaleFemalePromotionSummary();
    bindChartPromotion();

    //BindGroupAccount();

    // BindGradeNorm();
    //  BindGroupAccountNorm();

    // BindGradePromo();
    BindGroupAccountPromo();

    // BindRatingVisibility();
    // BindPromotionGradeConfiguration();
    $("#divFilters").show();

    //new Added by balmeek
    BindAppraisalCycleRoleMappingGrid();
    BindRolesByApprCycle();
    BindEmpDeliveryDropDowns();




});

$("#input1").on("change", function (e) {

    var file = e.target.files[0];
    // input canceled, return
    if (!file) return;

    var FR = new FileReader();
    FR.onload = function (e) {
        var data = new Uint8Array(e.target.result);
        var workbook = XLSX.read(data, { type: 'array' });
        var firstSheet = workbook.Sheets[workbook.SheetNames[0]];

        // header: 1 instructs xlsx to create an 'array of arrays'
        resultJson = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        // data preview
        //var output = document.getElementById('result');
        //output.innerHTML = JSON.stringify(resultJson, null, 2);

    };
    FR.readAsArrayBuffer(file);

});

$("#input1").click(function () {
    if ($("#input1").val() != "") {
        $("#input1").val(null);
    }
});

$("#input2").on("change", function (e) {

    var file = e.target.files[0];
    // input canceled, return
    if (!file) return;

    var FR = new FileReader();
    FR.onload = function (e) {
        var data = new Uint8Array(e.target.result);
        var workbook = XLSX.read(data, { type: 'array' });
        var firstSheet = workbook.Sheets[workbook.SheetNames[0]];

        // header: 1 instructs xlsx to create an 'array of arrays'
        resultJson = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        // data preview
        //var output = document.getElementById('result');
        //output.innerHTML = JSON.stringify(resultJson, null, 2);

    };
    FR.readAsArrayBuffer(file);
    console.log(resultJson);
});

$("#input2").click(function () {
    if ($("#input2").val() != "") {
        $("#input2").val(null);
    }
});

$("#uploadRatingProm").click(function () {
    $("#tblUnsavedData").css('display', 'none');
    if ($("#input1").val() != "") {
        if (resultJson.length > 1) {
            var srno = 1;
            var excelData = [];
            var sortedData = [];
            var finalData = [];
            var notUpdatedData = [];
            var validData = [];
            var index = [];

            //remove the first index wich contains column names
            resultJson.shift();

            //remove all indexes from resultJson where data is empty or blank
            for (var i = 0; i < resultJson.length; i++) {
                if (resultJson[i].length == 0) {
                    resultJson.splice(i, 1);
                }
            }

            for (var i = 0; i < resultJson.length; i++) {
                for (var j = 0; j < rawData.length; j++) {

                    if ((rawData[j].AspireEmployeeId)?.trim() == resultJson[i][0]) {
                        if (String(resultJson[i][9])?.trim() !== String(rawData[j].Rating)?.trim() ||
                            String(resultJson[i][10])?.trim() !== String(rawData[j].RecoPromo)?.trim()) {
                            excelData.push(resultJson[i]);
                            index.push(i);
                            break;
                        }
                    }
                }
            }

            for (var i = 1; i < resultJson.length; i++) {
                if (index.includes(i)) {
                    //do nothing
                }
                else if (typeof resultJson[i][0] === 'undefined') {
                    RatingList = {
                        SrNo: srno++,
                        EmployeeName: resultJson[i][1] || '',
                        Gender: resultJson[i][2] || '',
                        Grade: resultJson[i][3] || '',
                        Location: resultJson[i][4] || '',
                        Rating: resultJson[i][9] || '',
                        ReccomendedforProm: resultJson[i][10] || '',
                        RecommendedDesignation: resultJson[i][11] || '',
                        Comments: resultJson[i][18] || '',
                        Error: 'Employee id is missing'
                    };
                    notUpdatedData.push(RatingList);
                }
            }

            for (var i = 0; i < excelData.length; i++) {
                if (typeof excelData[i][9] === 'undefined' || typeof excelData[i][10] === 'undefined') {
                    if (typeof excelData[i][9] === 'undefined') {
                        RatingList = {
                            SrNo: srno++,
                            EmployeeName: excelData[i][1] || '',
                            Gender: excelData[i][2] || '',
                            Grade: excelData[i][3] || '',
                            Location: excelData[i][4] || '',
                            Rating: excelData[i][9] || '',
                            ReccomendedforProm: excelData[i][10] || '',
                            RecommendedDesignation: excelData[i][11] || '',
                            Comments: excelData[i][18] || '',
                            Error: 'Rating value is missing'
                        };
                        notUpdatedData.push(RatingList);
                    }
                    else if (typeof excelData[i][10] === 'undefined') {
                        RatingList = {
                            SrNo: srno++,
                            EmployeeName: excelData[i][1] || '',
                            Gender: excelData[i][2] || '',
                            Grade: excelData[i][3] || '',
                            Location: excelData[i][4] || '',
                            Rating: excelData[i][9] || '',
                            ReccomendedforProm: excelData[i][10] || '',
                            RecommendedDesignation: excelData[i][11] || '',
                            Comments: excelData[i][18] || '',
                            Error: 'Promotion Recommendation value is missing'
                        };
                        notUpdatedData.push(RatingList);
                    }

                }

                else if ((excelData[i][9] == 'ME(60%)' || excelData[i][9] == 'EE(25%)' || excelData[i][9] == 'BE(10%)' || excelData[i][9] == 'EE(5%)')
                    && (excelData[i][10].toLowerCase() == 'yes' || excelData[i][10].toLowerCase() == 'no')) {

                    validData.push(excelData[i]);

                }
                else {
                    RatingList = {
                        SrNo: srno++,
                        EmployeeName: excelData[i][1] || '',
                        Gender: excelData[i][2] || '',
                        Grade: excelData[i][3] || '',
                        Location: excelData[i][4] || '',
                        Rating: excelData[i][9] || '',
                        ReccomendedforProm: excelData[i][10] || '',
                        RecommendedDesignation: excelData[i][11] || '',
                        Comments: excelData[i][18] || '',
                        Error: 'Invalid input. Please input valid Rating/ promotion value.'
                    };
                    notUpdatedData.push(RatingList);
                }
            }

            for (var i = 0; i < validData.length; i++) {
                for (var j = 0; j < rawData.length; j++) {
                    if ((rawData[j].AspireEmployeeId).trim() == validData[i][0])
                        sortedData.push(rawData[j]);

                }
            }



            var IRecoForpromotion = 0;
            var ICurrentRating = 0;
            var IComments = '';
            var Id;
            var RatingArray = [];
            var RatingList;
            var ToEmployeeId;
            var RecDesignation = 0;

            for (var i = 0; i < sortedData.length; i++) {
                finalData.push(sortedData[i]);
            }

            var RowNo = 0;

            for (i = 0; i < finalData.length; i++) {
                for (j = 0; j < validData.length; j++) {
                    if (validData[j][0] == finalData[i].AspireEmployeeId.trim()) {


                        if (validData[j][9] == 'EE(5%)') {
                            ICurrentRating = 'NA==';
                        }
                        else
                            if (validData[j][9] == 'BE(10%)') {
                                ICurrentRating = 'Mw==';
                            }
                            else
                                if (validData[j][9] == 'ME(60%)') {
                                    ICurrentRating = 'Mg==';
                                }
                                else
                                    if (validData[j][9] == 'EE(25%)') {
                                        ICurrentRating = 'MQ==';
                                    }
                                    else
                                        ICurrentRating = 0;



                        if (validData[j][10].toLowerCase() == 'yes') {
                            IRecoForpromotion = 1;
                        }
                        else if (validData[j][10].toLowerCase() == 'no') {
                            IRecoForpromotion = 2;
                        }
                        else {
                            IRecoForpromotion = 0;
                        }
                        IComments = validData[j][18];
                    }
                }
                ToEmployeeId = finalData[i].PEPEmployeeId;
                //  hdnDeliveryUnit = finalData[i].DeliveryUnit;
                Id = finalData[i].Id;


                if (ICurrentRating != 0 && IRecoForpromotion != 0) {
                    RowNo++;
                    RatingList = {
                        Id: Id,
                        RowNo: RowNo,
                        AppraisalCycleId: getRatingPagesAppraisalCycleId(),
                        RatingGivenBy: sessionStorage.EmployeeId,
                        PEPEmployeeId: ToEmployeeId,  //PEPEmployeeId
                        Rating: ICurrentRating,
                        RecoForpromotion: IRecoForpromotion,
                        //   RecommendedDesignation: RecDesignation,
                        Comments: IComments,
                        IsDesignationUpdate: 0,
                        //IsDesignationUpdate: RecDesignation > 0 ? 1 : 0,
                    };
                    RatingArray.push(RatingList);
                }


            }


            console.log(RatingArray);
            if (RatingArray.length > 0) {

                var svrPath = CONFIG.get('SERVERNAME');
                var apiPath = svrPath + '/RatingAdmin/UploadDataFromExcel';
                var msg = 'Rating Saved as Draft';
                var Result = CommonAjaxPOST_Array(apiPath, RatingArray, CommonGetHeaderInfo());
                $('#btnSubmitrating').prop('disabled', false);
                BindReporteeRatings();
                changeBackgroundColor();


                if (Result.success) {

                    if (finalData.length > 0 && notUpdatedData.length == 0) {
                        toastr.success('Records for ' + finalData.length + ' employee has been Uploaded').delay(6000);
                    }
                    else if (finalData.length > 0 && notUpdatedData.length > 0) {
                        toastr.warning('Records for ' + finalData.length + ' employee has been Uploaded. ' + notUpdatedData.length + ' record not uploaded. Please refer below table for Reasons').delay(6000);
                    }
                    else if (notUpdatedData.length > 0) {
                        toastr.error('Record Upload failed, Please refer below table for Reasons').delay(6000);
                        $('#dataModal').modal('show');
                        $('#divDisplayData').css('display', 'flex');
                        $('#lblFailed').text('Note:Records for ' + notUpdatedData.length + ' employee got failed, Please Refer below table for reasons:');
                    }

                }
                else {
                    if (notUpdatedData.length > 0) {
                        toastr.error('Record Upload failed, Please refer below table for Reasons').delay(6000);
                        $('#dataModal').modal('show');
                        $('#divDisplayData').css('display', 'flex');
                        $('#lblFailed').text('Note:Records for ' + notUpdatedData.length + ' employee got failed, Please Refer below table for reasons:');
                    }
                    else {
                        toastr.error('There is some problem please contact Admin');
                    }
                }
            }
            else if (RatingArray.length == 0 && notUpdatedData.length == 0) {
                toastr.warning("Uploaded file has nothing to be updated, Please check and upload again");
            }
            else {
                if (notUpdatedData.length > 0) {
                    toastr.error('Record Upload failed, Please refer below table for Reasons').delay(6000);
                    $('#dataModal').modal('show');
                    $('#divDisplayData').css('display', 'flex');
                    $('#lblFailed').text('Note:Records for ' + notUpdatedData.length + ' employee got failed, Please Refer below table for reasons:');
                }
                else {
                    toastr.error('There is some problem, please contact IPAG');
                }
            }


            if (notUpdatedData.length > 0) {
                bindUnsavedGrid(notUpdatedData);
            }
        }
        else {
            toastr.error("Uploaded file is empty please recheck and upload again.");
        }
    }

    else {
        toastr.error("Please select a file to upload.");
    }

    $("#input1").val(null);
});

$("#uploadDesignations").click(function () {
    $("#tblUnsavedData").css('display', 'none');
    if ($("#input2").val() != "") {
        if (resultJson.length > 1) {
            var srno = 1;
            var excelData = [];
            var sortedData = [];
            var finalData = [];
            var notUpdatedData = [];
            var validData = [];
            var index = [];

            //remove the first index wich contains column names
            resultJson.shift();

            //remove all indexes from resultJson where data is empty or blank
            for (var i = 0; i < resultJson.length; i++) {
                if (resultJson[i].length == 0) {
                    resultJson.splice(i, 1);
                }
            }

            for (var i = 0; i < resultJson.length; i++) {
                for (var j = 0; j < rawData.length; j++) {

                    if ((rawData[j].AspireEmployeeId)?.trim() == resultJson[i][0]) {
                        if (String(resultJson[i][11])?.trim() !== String(rawData[j].RecDesignation)?.trim()) {
                            excelData.push(resultJson[i]);
                            index.push(i);
                            break;
                        }
                    }
                }
            }


            for (var i = 1; i < resultJson.length; i++) {
                if (index.includes(i)) {
                    //do nothing
                }
                else if (typeof resultJson[i][0] === 'undefined') {
                    RatingList = {
                        SrNo: srno++,
                        EmployeeName: resultJson[i][1] || '',
                        Gender: resultJson[i][2] || '',
                        Grade: resultJson[i][3] || '',
                        Location: resultJson[i][4] || '',
                        Rating: resultJson[i][9] || '',
                        ReccomendedforProm: resultJson[i][10] || '',
                        RecommendedDesignation: resultJson[i][11] || '',
                        Comments: resultJson[i][18] || '',
                        Error: 'Employee id is missing'
                    };
                    notUpdatedData.push(RatingList);
                }
            }

            var svrPath = CONFIG.get('SERVERNAME');
            var apiPath = svrPath + 'RatingAdmin/GetValidRecommendedDesignations';

            var RecommendedDesignations = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

            var RecommendedDesignationsList = RecommendedDesignations.responseJSON.Result.data;

            for (var i = 0; i < excelData.length; i++) {
                if (typeof excelData[i][11] === 'undefined') {

                    RatingList = {
                        SrNo: srno++,
                        EmployeeName: excelData[i][1] || '',
                        Gender: excelData[i][2] || '',
                        Grade: excelData[i][3] || '',
                        Location: excelData[i][4] || '',
                        Rating: excelData[i][9] || '',
                        ReccomendedforProm: excelData[i][10] || '',
                        RecommendedDesignation: excelData[i][11] || '',
                        Comments: excelData[i][18] || '',
                        Error: 'Recommended Designation value is missing'
                    };
                    notUpdatedData.push(RatingList);
                }

                else if (RecommendedDesignationsList.filter(item => item.Designation.toLowerCase() === excelData[i][11].toLowerCase()).length > 0) {

                    validData.push(excelData[i]);

                }
                else if (RecommendedDesignationsList.filter(item => item.Designation.toLowerCase() === excelData[i][11].toLowerCase()).length <= 0) {

                    RatingList = {
                        SrNo: srno++,
                        EmployeeName: excelData[i][1] || '',
                        Gender: excelData[i][2] || '',
                        Grade: excelData[i][3] || '',
                        Location: excelData[i][4] || '',
                        Rating: excelData[i][9] || '',
                        ReccomendedforProm: excelData[i][10] || '',
                        RecommendedDesignation: excelData[i][11] || '',
                        Comments: excelData[i][18] || '',
                        Error: 'Invalid input. Please input valid Designation.'
                    };
                    notUpdatedData.push(RatingList);
                }
                else {
                    RatingList = {
                        SrNo: srno++,
                        EmployeeName: excelData[i][1] || '',
                        Gender: excelData[i][2] || '',
                        Grade: excelData[i][3] || '',
                        Location: excelData[i][4] || '',
                        Rating: excelData[i][9] || '',
                        ReccomendedforProm: excelData[i][10] || '',
                        RecommendedDesignation: excelData[i][11] || '',
                        Comments: excelData[i][18] || '',
                        Error: 'Invalid input.'
                    };
                    notUpdatedData.push(RatingList);
                }
            }

            for (var i = 0; i < validData.length; i++) {
                for (var j = 0; j < rawData.length; j++) {
                    if ((rawData[j].AspireEmployeeId).trim() == validData[i][0])
                        sortedData.push(rawData[j]);

                }
            }



            var IRecoForpromotion = 0;
            var ICurrentRating = 0;
            var IComments = '';
            var Id;
            var RatingArray = [];
            var RatingList;
            var ToEmployeeId;
            var RecDesignation = 0;

            for (var i = 0; i < sortedData.length; i++) {
                finalData.push(sortedData[i]);
            }

            var RowNo = 0;

            for (i = 0; i < finalData.length; i++) {
                for (j = 0; j < validData.length; j++) {
                    if (validData[j][0] == finalData[i].AspireEmployeeId.trim()) {

                        var result = RecommendedDesignationsList.filter(item => item.Designation.toLowerCase() === validData[j][11].toLowerCase());
                        if (result.length > 0) {
                            RecDesignation = result[0].Id;
                        }
                        ICurrentRating = 0;
                        IRecoForpromotion = 0;
                        IComments = validData[j][18];
                    }
                }
                ToEmployeeId = finalData[i].PEPEmployeeId;
                //  hdnDeliveryUnit = finalData[i].DeliveryUnit;
                Id = finalData[i].Id;


                if (RecDesignation != 0) {
                    RowNo++;
                    RatingList = {
                        Id: Id,
                        RowNo: RowNo,
                        AppraisalCycleId: getRatingPagesAppraisalCycleId(),
                        RatingGivenBy: sessionStorage.EmployeeId,
                        PEPEmployeeId: ToEmployeeId,  //PEPEmployeeId
                        Rating: ICurrentRating,
                        RecoForpromotion: IRecoForpromotion,
                        RecommendedDesignation: RecDesignation,
                        Comments: IComments,
                        IsDesignationUpdate: RecDesignation > 0 ? 1 : 0,
                    };
                    RatingArray.push(RatingList);
                }


            }

            console.log(RatingArray);
            if (RatingArray.length > 0) {

                var svrPath = CONFIG.get('SERVERNAME');
                var apiPath = svrPath + '/RatingAdmin/UploadDataFromExcel';
                var msg = 'Rating Saved as Draft';
                var Result = CommonAjaxPOST_Array(apiPath, RatingArray, CommonGetHeaderInfo());
                $('#btnSubmitrating').prop('disabled', false);
                BindReporteeRatings();
                changeBackgroundColor();


                if (Result.success) {

                    if (finalData.length > 0 && notUpdatedData.length == 0) {
                        toastr.success('Records for ' + finalData.length + ' employee has been Uploaded').delay(6000);
                    }
                    else if (finalData.length > 0 && notUpdatedData.length > 0) {
                        toastr.warning('Records for ' + finalData.length + ' employee has been Uploaded. ' + notUpdatedData.length + ' record not uploaded. Please refer below table for Reasons').delay(6000);
                    }
                    else if (notUpdatedData.length > 0) {
                        toastr.error('Record Upload failed, Please refer below table for Reasons').delay(6000);
                        $('#dataModal').modal('show');
                        $('#divDisplayData').css('display', 'flex');
                        $('#lblFailed').text('Note:Records for ' + notUpdatedData.length + ' employee got failed, Please Refer below table for reasons:');
                    }

                }
                else {
                    if (notUpdatedData.length > 0) {
                        toastr.error('Record Upload failed, Please refer below table for Reasons').delay(6000);
                        $('#dataModal').modal('show');
                        $('#divDisplayData').css('display', 'flex');
                        $('#lblFailed').text('Note:Records for ' + notUpdatedData.length + ' employee got failed, Please Refer below table for reasons:');
                    }
                    else {
                        toastr.error('There is some problem please contact Admin');
                    }
                }
            }
            else if (RatingArray.length == 0 && notUpdatedData.length == 0) {
                toastr.warning("Uploaded file has nothing to be updated, Please check and upload again");
            }
            else {
                if (notUpdatedData.length > 0) {
                    toastr.error('Record Upload failed, Please refer below table for Reasons').delay(6000);
                    $('#dataModal').modal('show');
                    $('#divDisplayData').css('display', 'flex');
                    $('#lblFailed').text('Note:Records for ' + notUpdatedData.length + ' employee got failed, Please Refer below table for reasons:');
                }
                else {
                    toastr.error('There is some problem, please contact IPAG');
                }
            }


            if (notUpdatedData.length > 0) {
                bindUnsavedGrid(notUpdatedData);
            }
        }
        else {
            toastr.error("Uploaded file is empty please recheck and upload again.");
        }
    }

    else {
        toastr.error("Please select a file to upload.");
    }

    $("#input2").val(null);
});


function BindGender() {


    var dictEmpGender = {};
    var sortedEmpGenderKeys = [];

    var dictEmpGenderST = {};
    var sortedEmpGenderKeysST = [];

    $.each(rawData, function (index, data) {

        if (dictEmpGender[data.Gender] == undefined) {

            if (data.Gender == 'Male') {
                dictEmpGender["Male"] = 'Male';
            } else if (data.Gender == 'Female') {
                dictEmpGender["Female"] = 'Female';
            }
        }
    }

    );

    $.each(rawData, function (index, data) {

        if (dictEmpGenderST[data.Gender] == undefined) {

            if (data.Gender == 'Male') {
                dictEmpGenderST["Male"] = 'M';
            } else if (data.Gender == 'Female') {
                dictEmpGenderST["Female"] = 'F';
            }
        }
    }

    );

    sortedEmpGenderKeysST = Object.keys(dictEmpGenderST).sort();

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

    ////////////////////////////////////////////////////////


    $('#ddlgender_HRBPAdminNorm').empty();

    for (let t = 0; t < sortedEmpGenderKeysST.length; t++) {
        $('#ddlgender_HRBPAdminNorm').append($("<option>").val(dictEmpGenderST[sortedEmpGenderKeysST[t]]).text(sortedEmpGenderKeysST[t]));

    }

    $('#ddlgender_HRBPAdminNorm').multiselect('destroy');

    $('#ddlgender_HRBPAdminNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgender_HRBPAdminNorm').multiselect('refresh');



    ////////////////////////////////////////////////////////////

    $('#ddlgender_HRBPAdminPromo').empty();

    for (let t = 0; t < sortedEmpGenderKeysST.length; t++) {
        $('#ddlgender_HRBPAdminPromo').append($("<option>").val(dictEmpGenderST[sortedEmpGenderKeysST[t]]).text(sortedEmpGenderKeysST[t]));

    }

    $('#ddlgender_HRBPAdminPromo').multiselect('destroy');

    $('#ddlgender_HRBPAdminPromo').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgender_HRBPAdminPromo').multiselect('refresh');



}


function Bind_ddllocation() {

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

    $('#ddllocation_GDLDept_head').empty();

    for (let t = 0; t < sortedLocationKeys.length; t++) {
        if (sortedLocationKeys[t] != 'C') {
            $('#ddllocation_GDLDept_head').append($("<option>").val(dictLocation[sortedLocationKeys[t]]).text(sortedLocationKeys[t]));
        }
    }

    $('#ddllocation_GDLDept_head').multiselect('destroy');

    $('#ddllocation_GDLDept_head').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddllocation_GDLDept_head').multiselect('refresh');


    /////////////////////////////////////////////////


    $('#ddllocation_HRBPAdminNorm').empty();

    for (let t = 0; t < sortedLocationKeys.length; t++) {

        $('#ddllocation_HRBPAdminNorm').append($("<option>").val(dictLocation[sortedLocationKeys[t]]).text(sortedLocationKeys[t]));

    }

    $('#ddllocation_HRBPAdminNorm').multiselect('destroy');

    $('#ddllocation_HRBPAdminNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddllocation_HRBPAdminNorm').multiselect('refresh');

    ////////////////////////////////////////////////////////////


    $('#ddllocation_HRBPAdminPromo').empty();

    for (let t = 0; t < sortedLocationKeys.length; t++) {

        $('#ddllocation_HRBPAdminPromo').append($("<option>").val(dictLocation[sortedLocationKeys[t]]).text(sortedLocationKeys[t]));

    }

    $('#ddllocation_HRBPAdminPromo').multiselect('destroy');

    $('#ddllocation_HRBPAdminPromo').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddllocation_HRBPAdminPromo').multiselect('refresh');

    //////////////////////////////////////////////////////
}

function filterData(filter, TableName) {
    if (TableName == 'tblHRBPAdminView') {
        $('.loader-div').show();
    }
    var sortedData = [];
    if (TableName == 'tblHRBPAdminView') {
        if (filter == 'BE') {
            rawData = MainData;
            $('.animation').removeClass('animation');
            $('.filterBE').closest('button').addClass('animation');

            filter = 'BE(10%)';
        }
        else if (filter == 'ME') {
            rawData = MainData;
            $('.animation').removeClass('animation');
            $('.filterME').closest('button').addClass('animation');
            filter = 'ME(60%)';
        }
        else if (filter == 'EE') {
            rawData = MainData;
            $('.animation').removeClass('animation');
            $('.filterEE').closest('button').addClass('animation');
            filter = 'EE(25%)';
        }
        else if (filter == 'EE1') {
            rawData = MainData;
            $('.animation').removeClass('animation');
            $('.filterEE1').closest('button').addClass('animation');
            filter = 'EE(5%)';
        }
        else if (filter == 'All') {
            rawData = MainData;
            $('.animation').removeClass('animation');
            $('.filterAll').closest('button').addClass('animation');
        }
        else if (filter == 'Not') {
            rawData = MainData;
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
            $('.filterReset').closest('button').addClass('animation');

            ResultDropdownFilter();
            $('.loader-div').show();
            // Refetch with no filters so table shows full data; table will update in BindReporteeRatings success
            BindReporteeRatings();
            return;
        }

    } else {

        if (filter == 'BE') {
            $('.animation').removeClass('animation');
            $('.MR_filterBE').closest('button').addClass('animation');

            filter = 'BE(10%)';
        }
        else if (filter == 'ME') {
            $('.animation').removeClass('animation');
            $('.MR_filterME').closest('button').addClass('animation');
            filter = 'ME(60%)';
        }
        else if (filter == 'EE') {
            $('.animation').removeClass('animation');
            $('.MR_filterEE').closest('button').addClass('animation');
            filter = 'EE(25%)';
        }
        else if (filter == 'EE1') {
            $('.animation').removeClass('animation');
            $('.MR_filterEE1').closest('button').addClass('animation');
            filter = 'EE1(5%)';
        }
        else if (filter == 'All') {
            $('.animation').removeClass('animation');
            $('.MR_filterAll').closest('button').addClass('animation');
        }
        else if (filter == 'Not') {
            $('.animation').removeClass('animation');
            $('.MR_filterNot').closest('button').addClass('animation');
            filter = '0';
        }
        else if (filter == 'RM') {
            $('.animation').removeClass('animation');
            $('.MR_RM').closest('button').addClass('animation');
            filter = 'RM';
        } else if (filter == 'Total') {
            $('.animation').removeClass('animation');
            $('.MR_Total').closest('button').addClass('animation');
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
            if (filerDataSource[i].RatingGivenBy != '0') {
                sortedData.push(filerDataSource[i]);
            }
        } else if (filter == 'RM') {

            if (filerDataSource[i].RMName == sessionStorage.EmployeeId.trim()) {

                sortedData.push(filerDataSource[i]);
            }
        }
        else if (filter == 'Total') {
            sortedData.push(filerDataSource[i]);
        }
        else if (filter == '0') {
            if (filerDataSource[i].RatingGivenBy == '0') {
                sortedData.push(filerDataSource[i]);
            }
        } else {
            if (filerDataSource[i].Rating == filter) {
                sortedData.push(filerDataSource[i]);
            }
        }
    }



    // For tblHRBPAdminView, use common binding function
    if (TableName == 'tblHRBPAdminView') {
        BindHRBPAdminTable(sortedData);
        rawData = sortedData;
        $('.loader-div').hide();
        return; // Exit early for tblHRBPAdminView
    }
    
    // For other tables (tblApprovedReporteeList), use the old logic
    var table = $('#' + TableName).DataTable();
    table.clear();

    let colArr = [
        {
            "render": function (data, type, row, meta) {
                return "<span>" + row.EmployeeName.split('!')[1] + "</span></span>";
            },
            "sWidth": "6%"
        },
        {
            "render": function (data, type, row, meta) {
                return "<span>" + row.EmployeeName.split('!')[0] + "</span><span><input type='hidden' id='hdnRatingValue' name='hdnRatingValue' value='" + row.RatingValue + "'/></span>";
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
                return "<span>" + row.LocationName + "</span><span><input type='hidden' id='hdnRowStatus' name='hdnLocationID' value='" + row.LocationID + "'/></span>";
            },
            "sWidth": "6%"
        },
        {
            "render": function (data, type, row, meta) {
                return "<span>" + row.AccountGroup + "</span><span><input type='hidden' id='hdnAccountGroup' name='hdnRowStatus' value='" + row.AccountGroup + "'/></span>";
            },
            "sWidth": "6%"
        },
        {
            "render": function (data, type, row, meta) {
                return "<span>" + row.DeliveryStatus + "</span><span><input type='hidden' id='hdnDeliveryStatus' name='hdnDeliveryStatus' value='" + row.DeliveryStatus + "'/></span>";
            },
            "sWidth": "5%"
        },
        { mData: "PrevRating" },
        {
            mData: "LastpromotionDate",
            "sWidth": "12%"
        },
        {
            "render": function (data, type, row, meta) {
                return "<span>" + row.Rating + "</span><span><input type='hidden' id='hdnRatingGivenBy' name='hdnRatingGivenBy' value='" + row.RatingGivenBy + "'/></span>";
            },
            "sWidth": "6%"
        },
        {
            data: "RecoPromo",
            render: renderPromotionnDropdown,
            width: "4%"
        },
        {
            "render": function (data, type, row, meta) {
                return "<span>" + row.RecDesignation + "</span><span><input type='hidden' id='hdnByRoleId' name='hdnId' value='" + row.ByRoleId + "'/></span>";
            },
        },
        {
            "render": function (data, type, row, meta) {
                return "<span>" + row.RecDesigConsent + "</span>";
            },
        },
        {
            "render": function (data, type, row, meta) {
                return "<span>" + row.PromotionTrack + "</span>";
            },
        },
        {
            "render": function (data, type, row, meta) {
                return "<span>" + row.TalentCube + "</span>";
            },
        },
    ];

    if (TableName != 'tblApprovedReporteeList') {
        colArr.push({
            "render": function (data, type, row, meta) {
                return "<a class='table-icon fa fa-history' style='margin-right:4px;' title='History'  data-id=" + row.PEPEmployeeId + " onclick='AdminViewClaimHistory(" + row.PEPEmployeeId + ")'></a><span>" + row.CurrentStatus + "</span><span><input type='hidden' id='hdnNextApproverId' name='hdnNextApproverId' value='" + row.NextApproverId + "'/></span>";
            },
            "sWidth": "6%"
        });
        colArr.push(
            {
                "render": function (data, type, row, meta) {
                    return "<span>" + row.Inputter + "</span>";
                },
                "sWidth": "26%"
            },
            {
                "render": function (data, type, row, meta) {
                    return "<span>" + row.Reviewer + "</span>";
                },
                "sWidth": "10%"
            },
            {
                "render": function (data, type, row, meta) {
                    return "<span>" + row.Approver + "</span>";
                },
                "sWidth": "10%"
            },
            {
                mRender: function (data, type, full) {
                    return '<div data-toggle="tooltip" class="Description" title="' + full["Comment"] + '">' + full["Comment"] + '</div>';
                },
                className: "Description"
            }
        );
    }

    $('#' + TableName).DataTable({
        "dom": 'lBfrtip',
        buttons: [
            {
                extend: 'excelHtml5',
                text: 'Export to Excel',
                title: 'Employees Rating and Promotion Details',
                orientation: 'landscape',
                exportOptions: {
                    format: {
                        body: function (data, row, column, node) {
                            const $html = $('<div>').html(data);
                            const $select = $html.find('select');
                            
                            if ($select.length > 0) {
                                return $select.find('option:selected').text().trim();
                            }
                            
                            return $html.text().trim();
                        }
                    }
                }
            }
        ],
        data: sortedData,
        "sPaginationType": "full_numbers",
        "iDisplayLength": RecordsCountPerPage,
        "bLengthChange": true,
        "bDestroy": true,
        info: true,
        "searching": true,
        "paging": true,
        "ordering": true,
        "columnDefs": [
            { "orderData": [], "targets": 0 },
            { "orderable": false, "targets": 0 }
        ],
        aoColumns: colArr,
        "deferRender": true
    });

    rawData = sortedData;
}


function renderPromotionnDropdown(data, type, row) {

    var dropdownHtml = '';
    var bgColor = '';



    // Set background color based on IsEligibleforpromotion
    if (row.IsEligibleForPromotion == "3") {
        if ((row.Prevrating == 'BE(10%)' || row.Rating == 'BE(10%)') && row.RecoForPromotion == "1") {
            bgColor = "border: 2px solid red;"; // Not Eligible - Red
        }
        else {
            bgColor = "border: 2px solid green;";  // Eligible - Green
        }
    } else {
        if (row.RecoPromo == "1") {
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



    return dropdownHtml;
}


function InputFormfilterschange(source) {
    $('.loader-div').show();
    if (source == 'GDL') {
        setTimeout(BindRMByGDL, 500);
        // BindRMByGDL();
    } else if (source == 'DP') {
        setTimeout(BindRMByDP, 500);
        // BindRMByDP();
    }
    BindReporteeRatings();
    FirstScreenfilterschange(false);
    setTimeout(HRBPAdmin_RatingGivenNotGivenDetails, 500);
}

function CriticalityFilterChange_HRBP() {
    $('.loader-div').show();
    BindReporteeRatings();
    FirstScreenfilterschange(false);
    setTimeout(HRBPAdmin_RatingGivenNotGivenDetails, 500);
}

function Promofilterschange(source) {

    if (source == 'GDL' || source == 'DP') {
        BindEmpDeliveryDropDowns();
    }
    if (source == 'GDL') {
        setTimeout(BindRMByGDL_Promo, 500);
    } else if (source == 'DP') {
        setTimeout(BindRMByDP_Promo, 500);
    }

    BindHRBPAdminOverAllPromotionSummary();
    setTimeout(BindHRBPAdminOverAllMaleFemalePromotionSummary, 500);
    setTimeout(bindChartPromotion, 500);

    //setTimeout(BindGradePromo, 500);
    //setTimeout(BindGroupAccountPromo, 500)
    //setTimeout(BindGender, 500);

    $('.loader-div').show();
    // BindGradePromo();

}

function ResultDropdownFilter() {
    // Clear all filters in filtersDropDiv_GDLDept_head without triggering change (avoids multiple refetches)
    $('#ddlGDLDept_head').val(null);
    $('#ddlGDLDept_head').multiselect('refresh');

    $('#ddlDPSpan_head').val(null);
    $('#ddlDPSpan_head').multiselect('refresh');

    $('#ddlRMSpan_head').val(null);
    $('#ddlRMSpan_head').multiselect('refresh');

    $('#ddlgrade_GDLDept_head').val(null);
    $('#ddlgrade_GDLDept_head').multiselect('refresh');

    $('#ddlgroupaccount_GDLDept_head').val(null);
    $('#ddlgroupaccount_GDLDept_head').multiselect('refresh');

    $('#ddlgender').val(null);
    $('#ddlgender').multiselect('refresh');

    $('#ddlEmployeeStatus_HRBP').val(null);
    $('#ddlEmployeeStatus_HRBP').multiselect('refresh');

    $('#ddlDeliveryStatus_HRBP').val(null);
    $('#ddlDeliveryStatus_HRBP').multiselect('refresh');

    $('#ddlPromotion_HRBP').val(null);
    $('#ddlPromotion_HRBP').multiselect('refresh');

    if ($("#ddlCriticalityPriority_HRBP").length) {
        $("#ddlCriticalityPriority_HRBP").val(null);
        $("#ddlCriticalityPriority_HRBP").multiselect("deselectAll", false);
        $("#ddlCriticalityPriority_HRBP").multiselect("refresh");
    }

    $('#ddllocation_GDLDept_head').val(null);
    $('#ddllocation_GDLDept_head').multiselect('refresh');
}
function BindGDL_RMList() {

    var LoginEmployeeId = sessionStorage.EmployeeId;
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'RatingAdmin/GetGDLRMList?DropdownValue=' + 1 + '&GDLId=' + 0 + '&DPId=' + 0;


    var ddlGDLhead = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    $('#ddlGDLDept_head').empty();


    $.each(ddlGDLhead.responseJSON.Result, function (index, data) {
        $('#ddlGDLDept_head').append($("<option>").val(data.RMID).text(data.RMNAME));

    });
    $('#ddlGDLDept_head').multiselect({
        includeSelectAllOption: true,
        maxHeight: 150,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true
    });

    // $("#ddlGDLDept_head").val(["116935"]);
    $("#ddlGDLDept_head").multiselect('refresh');

    $('#ddlGDLDept_headNorm').empty();

    //$("#ddlGDLDept_headNorm").append($("<option></option>").val('0').html('None seleted'));

    $.each(ddlGDLhead.responseJSON.Result, function (index, data) {
        $('#ddlGDLDept_headNorm').append($("<option>").val(data.RMID).text(data.RMNAME));

    });

    $('#ddlGDLDept_headNorm').multiselect({
        includeSelectAllOption: true,
        maxHeight: 150,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true
    });

    $('#ddlGDLDept_headPromo').empty();

    //$("#ddlGDLDept_headPromo").append($("<option></option>").val('0').html('None seleted'));

    $.each(ddlGDLhead.responseJSON.Result, function (index, data) {
        $('#ddlGDLDept_headPromo').append($("<option>").val(data.RMID).text(data.RMNAME));

    });

    $('#ddlGDLDept_headPromo').multiselect({
        includeSelectAllOption: true,
        maxHeight: 150,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true
    });
    /// Bind RM Dropdown
    var apiPath1 = svrPath + 'RatingAdmin/GetGDLRMList?DropdownValue=' + 2 + '&GDLId=' + 0 + '&DPId=' + 0;

    var ddlRMList = CommonAjaxGET(apiPath1, CommonGetHeaderInfo());

    BindRMByGDL();



    var selectedEmployees = $("#ddlGDLDept_headNorm").val();


    if (selectedEmployees.indexOf("-1") != -1) {
        selectedEmployees[selectedEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    }
    var GDLId = selectedEmployees.toString();

    if (GDLId == "") {
        GDLId = 0;
    }


    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath1 = svrPath + 'RatingAdmin/GetGDLRMList?DropdownValue=' + 3 + '&GDLId=' + GDLId + '&DPId=' + 0;

    var ddlRMList = CommonAjaxGET(apiPath1, CommonGetHeaderInfo());


    $('#ddlDPSpan_headNorm').multiselect('destroy');

    $('#ddlDPSpan_headNorm').empty();


    if (ddlRMList && ddlRMList.responseJSON && ddlRMList.responseJSON.Success) {
        $.each(ddlRMList.responseJSON.Result, function (index, data) {
            $('#ddlDPSpan_headNorm').append($("<option>").val(data.RMID).text(data.RMNAME));

        });
        $('#ddlDPSpan_headNorm').multiselect({
            includeSelectAllOption: true,
            maxHeight: 150,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true
        });
    }
    $('#ddlDPSpan_headNorm').multiselect('refresh');

    //$('#ddlRMSpan_headPromo').empty();


    //$.each(ddlRMList.responseJSON.Result, function (index, data) {
    //    $('#ddlRMSpan_headPromo').append($("<option>").val(data.RMID).text(data.RMNAME));

    //});

    //$('#ddlRMSpan_headPromo').multiselect({
    //    includeSelectAllOption: true,
    //    maxHeight: 150,
    //    enableFiltering: true,
    //    enableCaseInsensitiveFiltering: true
    //});



    $('#ddlDPSpan_headPromo').multiselect('destroy');

    $('#ddlDPSpan_headPromo').empty();


    if (ddlRMList && ddlRMList.responseJSON && ddlRMList.responseJSON.Success) {
        $.each(ddlRMList.responseJSON.Result, function (index, data) {
            $('#ddlDPSpan_headPromo').append($("<option>").val(data.RMID).text(data.RMNAME));

        });
        $('#ddlDPSpan_headPromo').multiselect({
            includeSelectAllOption: true,
            maxHeight: 150,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true
        });
    }
    $('#ddlDPSpan_headPromo').multiselect('refresh');

}

function BindRMByGDL() {

    var selectedEmployees = $("#ddlGDLDept_head").val();


    if (selectedEmployees.indexOf("-1") != -1) {
        selectedEmployees[selectedEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    }
    var GDLId = selectedEmployees.toString();


    if (GDLId == "") {
        GDLId = 0;
    }


    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath1 = svrPath + 'RatingAdmin/GetGDLRMList?DropdownValue=' + 3 + '&GDLId=' + GDLId + '&DPId=' + 0;

    var ddlRMList = CommonAjaxGET(apiPath1, CommonGetHeaderInfo());

    $('#ddlDPSpan_head').multiselect('destroy');
    $('#ddlDPSpan_head').empty();

    if (ddlRMList && ddlRMList.responseJSON && ddlRMList.responseJSON.Success) {
        $.each(ddlRMList.responseJSON.Result, function (index, data) {
            $('#ddlDPSpan_head').append($("<option>").val(data.RMID).text(data.RMNAME));

        });
        $('#ddlDPSpan_head').multiselect({
            includeSelectAllOption: true,
            maxHeight: 150,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true
        });
    }
    $('#ddlDPSpan_head').multiselect('refresh');

    var selectedDPEmployees = $("#ddlDPSpan_head").val();


    if (selectedDPEmployees.indexOf("-1") != -1) {
        selectedDPEmployees[selectedDPEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    }
    var DPId = selectedDPEmployees.toString();


    if (DPId == "") {
        DPId = 0;
    }


    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath1 = svrPath + 'RatingAdmin/GetGDLRMList?DropdownValue=' + 2 + '&GDLId=' + GDLId + '&DPId=' + DPId;

    var ddlRMList = CommonAjaxGET(apiPath1, CommonGetHeaderInfo());

    $('#ddlRMSpan_head').multiselect('destroy');

    $('#ddlRMSpan_head').empty();


    if (ddlRMList && ddlRMList.responseJSON && ddlRMList.responseJSON.Success) {
        $.each(ddlRMList.responseJSON.Result, function (index, data) {
            $('#ddlRMSpan_head').append($("<option>").val(data.RMID).text(data.RMNAME));

        });
        $('#ddlRMSpan_head').multiselect({
            includeSelectAllOption: true,
            maxHeight: 150,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true
        });
    }
    $('#ddlRMSpan_head').multiselect('refresh');

    ///////////////////////////////////////////////////////////////////////////////////////////

    $('#ddlRMSpan_headNorm').multiselect('destroy');
    $('#ddlRMSpan_headNorm').empty();


    if (ddlRMList && ddlRMList.responseJSON && ddlRMList.responseJSON.Success) {
        $.each(ddlRMList.responseJSON.Result, function (index, data) {
            $('#ddlRMSpan_headNorm').append($("<option>").val(data.RMID).text(data.RMNAME));

        });
        $('#ddlRMSpan_headNorm').multiselect({
            includeSelectAllOption: true,
            maxHeight: 150,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true
        });
    }
    $('#ddlRMSpan_headNorm').multiselect('refresh');


    ///////////////////////////////////////////////////////////////////////////////////////////////

    $('#ddlRMSpan_headPromo').multiselect('destroy');
    $('#ddlRMSpan_headPromo').empty();

    if (ddlRMList && ddlRMList.responseJSON && ddlRMList.responseJSON.Success) {
        $.each(ddlRMList.responseJSON.Result, function (index, data) {
            $('#ddlRMSpan_headPromo').append($("<option>").val(data.RMID).text(data.RMNAME));

        });
        $('#ddlRMSpan_headPromo').multiselect({
            includeSelectAllOption: true,
            maxHeight: 150,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true
        });
    }
    $('#ddlRMSpan_headPromo').multiselect('refresh');

    //////////////////////////////////////////////////////////////////////////////////////////////



}



function BindRMByDP() {



    $('#ddlRMSpan_head').multiselect('destroy');


    var selectedEmployees = $("#ddlGDLDept_head").val();


    if (selectedEmployees.indexOf("-1") != -1) {
        selectedEmployees[selectedEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    }
    var GDLId = selectedEmployees.toString();

    if (GDLId == "") {
        GDLId = 0;
    }


    var selectedDPEmployees = $("#ddlDPSpan_head").val();


    if (selectedDPEmployees.indexOf("-1") != -1) {
        selectedDPEmployees[selectedDPEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    }
    var DPId = selectedDPEmployees.toString();

    $('#ddlRMSpan_head').multiselect('destroy');

    if (DPId == "") {
        DPId = 0;
    }


    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath1 = svrPath + 'RatingAdmin/GetGDLRMList?DropdownValue=' + 2 + '&GDLId=' + GDLId + '&DPId=' + DPId;

    var ddlRMList = CommonAjaxGET(apiPath1, CommonGetHeaderInfo());

    $('#ddlRMSpan_head').empty();

    //$("#ddlRMSpan_head").append($("<option></option>").val('0').html('None selected'));

    if (ddlRMList && ddlRMList.responseJSON && ddlRMList.responseJSON.Success) {
        $.each(ddlRMList.responseJSON.Result, function (index, data) {
            $('#ddlRMSpan_head').append($("<option>").val(data.RMID).text(data.RMNAME));

        });
        $('#ddlRMSpan_head').multiselect({
            includeSelectAllOption: true,
            maxHeight: 150,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true
        });
    }
    $('#ddlRMSpan_head').multiselect('refresh');


}

function BindRMByDP_Norm() {



    $('#ddlRMSpan_headNorm').multiselect('destroy');


    var selectedEmployees = $("#ddlGDLDept_headNorm").val();


    if (selectedEmployees.indexOf("-1") != -1) {
        selectedEmployees[selectedEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    }
    var GDLId = selectedEmployees.toString();

    if (GDLId == "") {
        GDLId = 0;
    }


    var selectedDPEmployees = $("#ddlDPSpan_headNorm").val();


    if (selectedDPEmployees.indexOf("-1") != -1) {
        selectedDPEmployees[selectedDPEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    }
    var DPId = selectedDPEmployees.toString();

    $('#ddlRMSpan_headNorm').multiselect('destroy');

    if (DPId == "") {
        DPId = 0;
    }


    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath1 = svrPath + 'RatingAdmin/GetGDLRMList?DropdownValue=' + 2 + '&GDLId=' + GDLId + '&DPId=' + DPId;

    var ddlRMList = CommonAjaxGET(apiPath1, CommonGetHeaderInfo());

    $('#ddlRMSpan_headNorm').empty();

    //$("#ddlRMSpan_head").append($("<option></option>").val('0').html('None selected'));

    if (ddlRMList && ddlRMList.responseJSON && ddlRMList.responseJSON.Success) {
        $.each(ddlRMList.responseJSON.Result, function (index, data) {
            $('#ddlRMSpan_headNorm').append($("<option>").val(data.RMID).text(data.RMNAME));

        });
        $('#ddlRMSpan_headNorm').multiselect({
            includeSelectAllOption: true,
            maxHeight: 150,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true
        });
    }
    $('#ddlRMSpan_headNorm').multiselect('refresh');


}

function BindRMByDP_Promo() {



    $('#ddlRMSpan_headPromo').multiselect('destroy');


    var selectedEmployees = $("#ddlGDLDept_headPromo").val();


    if (selectedEmployees.indexOf("-1") != -1) {
        selectedEmployees[selectedEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    }
    var GDLId = selectedEmployees.toString();

    if (GDLId == "") {
        GDLId = 0;
    }


    var selectedDPEmployees = $("#ddlDPSpan_headPromo").val();


    if (selectedDPEmployees.indexOf("-1") != -1) {
        selectedDPEmployees[selectedDPEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    }
    var DPId = selectedDPEmployees.toString();

    $('#ddlRMSpan_headPromo').multiselect('destroy');

    if (DPId == "") {
        DPId = 0;
    }


    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath1 = svrPath + 'RatingAdmin/GetGDLRMList?DropdownValue=' + 2 + '&GDLId=' + GDLId + '&DPId=' + DPId;

    var ddlRMList = CommonAjaxGET(apiPath1, CommonGetHeaderInfo());

    $('#ddlRMSpan_headPromo').empty();

    //$("#ddlRMSpan_head").append($("<option></option>").val('0').html('None selected'));

    if (ddlRMList && ddlRMList.responseJSON && ddlRMList.responseJSON.Success) {
        $.each(ddlRMList.responseJSON.Result, function (index, data) {
            $('#ddlRMSpan_headPromo').append($("<option>").val(data.RMID).text(data.RMNAME));

        });
        $('#ddlRMSpan_headPromo').multiselect({
            includeSelectAllOption: true,
            maxHeight: 150,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true
        });
    }
    $('#ddlRMSpan_headPromo').multiselect('refresh');


}


function BindRMByGDL_NORM() {

    let GDLId = $('#ddlGDLDept_headNorm').val();


    //var selectedGDLEmployees = '';

    //if (selectedGDLEmployees.indexOf("-1") != -1) {
    //    selectedGDLEmployees[selectedGDLEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    //}
    //GDLId = selectedGDLEmployees.toString();


    //if (GDLId == "") {
    //    GDLId = 0;
    //}
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath1 = svrPath + 'RatingAdmin/GetGDLRMList?DropdownValue=' + 3 + '&GDLId=' + GDLId + '&DPId=' + 0;

    var ddlRMList = CommonAjaxGET(apiPath1, CommonGetHeaderInfo());

    $('#ddlDPSpan_headNorm').multiselect('destroy');
    $('#ddlDPSpan_headNorm').empty();

    if (ddlRMList && ddlRMList.responseJSON && ddlRMList.responseJSON.Success) {
        $.each(ddlRMList.responseJSON.Result, function (index, data) {
            $('#ddlDPSpan_headNorm').append($("<option>").val(data.RMID).text(data.RMNAME));

        });
        $('#ddlDPSpan_headNorm').multiselect({
            includeSelectAllOption: true,
            maxHeight: 150,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true
        });
    }
    $('#ddlDPSpan_headNorm').multiselect('refresh');

    var selectedDPEmployees = $("#ddlDPSpan_headNorm").val();


    if (selectedDPEmployees.indexOf("-1") != -1) {
        selectedDPEmployees[selectedDPEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    }
    var DPId = selectedDPEmployees.toString();


    if (DPId == "") {
        DPId = 0;
    }


    //var svrPath = CONFIG.get('SERVERNAME');
    //var apiPath1 = svrPath + 'RatingAdmin/GetGDLRMList?DropdownValue=' + 2 + '&GDLId=' + GDLId + '&DPId=' + DPId;

    //var ddlRMList = CommonAjaxGET(apiPath1, CommonGetHeaderInfo());

    //$('#ddlRMSpan_head').multiselect('destroy');

    //$('#ddlRMSpan_head').empty();


    //if (ddlRMList && ddlRMList.responseJSON && ddlRMList.responseJSON.Success) {
    //    $.each(ddlRMList.responseJSON.Result, function (index, data) {
    //        $('#ddlRMSpan_head').append($("<option>").val(data.RMID).text(data.RMNAME));

    //    });
    //    $('#ddlRMSpan_head').multiselect({
    //        includeSelectAllOption: true,
    //        maxHeight: 150,
    //        enableFiltering: true,
    //        enableCaseInsensitiveFiltering: true
    //    });
    //}
    //$('#ddlRMSpan_head').multiselect('refresh');


    $('#ddlRMSpan_headNorm').multiselect('destroy');

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath1 = svrPath + 'RatingAdmin/GetGDLRMList?DropdownValue=' + 2 + '&GDLId=' + GDLId + '&DPId=' + DPId;

    var ddlRMList = CommonAjaxGET(apiPath1, CommonGetHeaderInfo());

    $('#ddlRMSpan_headNorm').empty();

    //$("#ddlRMSpan_headNorm").append($("<option></option>").val('0').html('None selected'));

    if (ddlRMList && ddlRMList.responseJSON && ddlRMList.responseJSON.Success) {
        $.each(ddlRMList.responseJSON.Result, function (index, data) {
            $('#ddlRMSpan_headNorm').append($("<option>").val(data.RMID).text(data.RMNAME));

        });
        $('#ddlRMSpan_headNorm').multiselect({
            includeSelectAllOption: true,
            maxHeight: 150,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true
        });
    }
    $('#ddlRMSpan_headNorm').multiselect('refresh');
}
function BindRMByGDL_Promo() {

    let GDLId = $('#ddlGDLDept_headPromo').val();


    //var selectedGDLEmployees = '';

    //if (selectedGDLEmployees.indexOf("-1") != -1) {
    //    selectedGDLEmployees[selectedGDLEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    //}
    //GDLId = selectedGDLEmployees.toString();


    //if (GDLId == "") {
    //    GDLId = 0;
    //}

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath1 = svrPath + 'RatingAdmin/GetGDLRMList?DropdownValue=' + 3 + '&GDLId=' + GDLId + '&DPId=' + 0;

    var ddlRMList = CommonAjaxGET(apiPath1, CommonGetHeaderInfo());

    $('#ddlDPSpan_headPromo').multiselect('destroy');
    $('#ddlDPSpan_headPromo').empty();

    if (ddlRMList && ddlRMList.responseJSON && ddlRMList.responseJSON.Success) {
        $.each(ddlRMList.responseJSON.Result, function (index, data) {
            $('#ddlDPSpan_headPromo').append($("<option>").val(data.RMID).text(data.RMNAME));

        });
        $('#ddlDPSpan_headPromo').multiselect({
            includeSelectAllOption: true,
            maxHeight: 150,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true
        });
    }
    $('#ddlDPSpan_headPromo').multiselect('refresh');

    var selectedDPEmployees = $("#ddlDPSpan_headPromo").val();


    if (selectedDPEmployees.indexOf("-1") != -1) {
        selectedDPEmployees[selectedDPEmployees.indexOf("-1")] = sessionStorage.EmployeeId;
    }
    var DPId = selectedDPEmployees.toString();


    if (DPId == "") {
        DPId = 0;
    }

    $('#ddlRMSpan_headPromo').multiselect('destroy');
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath1 = svrPath + 'RatingAdmin/GetGDLRMList?DropdownValue=' + 2 + '&GDLId=' + GDLId + '&DPId=' + 0;

    var ddlRMList = CommonAjaxGET(apiPath1, CommonGetHeaderInfo());

    $('#ddlRMSpan_headPromo').empty();

    //$("#ddlRMSpan_headPromo").append($("<option></option>").val('0').html('None selected'));

    if (ddlRMList && ddlRMList.responseJSON && ddlRMList.responseJSON.Success) {
        $.each(ddlRMList.responseJSON.Result, function (index, data) {
            $('#ddlRMSpan_headPromo').append($("<option>").val(data.RMID).text(data.RMNAME));

        });
        $('#ddlRMSpan_headPromo').multiselect({
            includeSelectAllOption: true,
            maxHeight: 150,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true
        });
    }
    $('#ddlRMSpan_headPromo').multiselect('refresh');
}


//function filterschange(source) {


//}

function filterschangeNorm(source) {
    //if (source == 'GDL' || source == 'DP') {
    //    BindEmpDeliveryDropDowns();
    //}
    //if (source == 'GDL') {
    //    setTimeout(BindRMByGDL_NORM, 500);
    //} else if (source == 'DP') {
    //    setTimeout(BindRMByDP_Norm, 500);
    //}
    //;
    BindHRBPAdminNormalizationOverallData();
    setTimeout(BindHRBPMaleFemaleNormalization, 500);
    setTimeout(NormHRBPAdminBellCurve, 500);
    //BindGradeNorm();
    //BindGroupAccountNorm();
    //BindGender();

    $('.loader-div').show();
    //BindHRBPAdminNormalizationOverallData();
    //BindHRBPMaleFemaleNormalization();
    //NormHRBPAdminBellCurve();
    // BindGradeNorm();


}

$('#ddlgrade_GDLDept_head').on('change', function () {

    var gradearray = [];
    var filterData = [];

    var ddlgrade = $("#ddlgrade_GDLDept_head").val().toString();

    gradearray = ddlgrade.split(',');

    for (let j = 0; j < rawData.length; j++) {
        for (let k = 0; k < gradearray.length; k++) {
            if (rawData[j].GradeID == gradearray[k]) {
                filterData.push(rawData[j]);
            }
        }
    }

    if (gradearray.length > 0 && gradearray[0].length > 0) {
        BindTableForFilters(filterData)
    } else {
        BindTableForFilters(rawData)
    }


});

$('#ddlEmployeeStatus_HRBPAdminNorm').on('change', function () {
    var filterData = [];

    var employeeStatus = $("#ddlEmployeeStatus_HRBPAdminNorm").val();

    if (employeeStatus != 'All') {
        for (let j = 0; j < rawData.length; j++) {
            if (rawData[j].EmployeeStatus == employeeStatus) {
                filterData.push(rawData[j]);
            }
        }
        BindTableForFilters(filterData);
    } else {
        BindTableForFilters(rawData);
    }


    $('#ddlEmployeeStatus_HRBPAdminNorm').multiselect('destroy');

    $('#ddlEmployeeStatus_HRBPAdminNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlEmployeeStatus_HRBPAdminNorm').multiselect('refresh');


});


$('#ddlApprCycleHRAdminPromoConf').on('change', function () {
    var AppraisalCycleId = $('#ddlApprCycleHRAdminPromoConf').val();
    if (AppraisalCycleId <= 0) {
        //toastr.error('Please select appraisal cycle');
        $("#tblAppCycleGradePromoConf").DataTable().clear().draw();
        return false;
    }
    BindPromotionGradeConfiguration();
});


$('#ddllocation_GDLDept_head').on('change', function () {

    var locationarray = [];
    var filterData = [];

    var ddllocation = $("#ddllocation_GDLDept_head").val().toString();

    locationarray = ddllocation.split(',');

    for (let j = 0; j < rawData.length; j++) {
        for (let k = 0; k < locationarray.length; k++) {
            if (rawData[j].LocationID == locationarray[k]) {
                filterData.push(rawData[j]);
            }
        }
    }
    if (locationarray.length > 0 && locationarray[0].length > 0) {
        BindTableForFilters(filterData)
    } else {
        BindTableForFilters(rawData)
    }

});

$('#ddlgroupaccount_GDLDept_head').on('change', function () {

    var Groupaccountarray = [];
    var filterData = [];

    var ddlGroupaccount = $("#ddlgroupaccount_GDLDept_head").val().toString();

    Groupaccountarray = ddlGroupaccount.split(',');

    for (let j = 0; j < rawData.length; j++) {
        for (let k = 0; k < Groupaccountarray.length; k++) {
            if (rawData[j].AccountGroupId == Groupaccountarray[k]) {
                filterData.push(rawData[j]);
            }
        }
    }
    if (Groupaccountarray.length > 0 && Groupaccountarray[0].length > 0) {
        BindTableForFilters(filterData)
    } else {
        BindTableForFilters(rawData)
    }

});

$('#ddlApprCycleHRAdminConf').on('change', function () {
    BindRatingVisibility();
});

function BindGradePromo() {

    $.each(ratingPromotionRawData, function (index, data) {
        if (dictGrade[data.Grade] == undefined) {
            dictGrade[data.Grade] = data.GradeId;
        }
    });

    sortedGradeKeys = Object.keys(dictGrade).sort();

    $('#ddlgrade_HRBPAdminPromo').empty();

    for (let t = 0; t < sortedGradeKeys.length; t++) {
        $('#ddlgrade_HRBPAdminPromo').append($("<option>").val(dictGrade[sortedGradeKeys[t]]).text(sortedGradeKeys[t]));
    }

    $('#ddlgrade_HRBPAdminPromo').multiselect('destroy');

    $('#ddlgrade_HRBPAdminPromo').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgrade_HRBPAdminPromo').multiselect('refresh');
}

function BindActiveAppraisalCycle() {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'AppraisalCycle/GetAllActiveAppraisalCycle';
    AppraisalCycle = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    //$('#ddlApprCycleHRAdmin').empty();
    //$('#ddlApprCycleHRAdmin').append($("<option>").val(0).text("Select Appraisal Cycle"));
    $('#ddlApprCycleHRAdminRole').empty();
    $('#ddlApprCycleHRAdminRole').append($("<option>").val(0).text("Select Appraisal Cycle"));

    var result = AppraisalCycle.responseJSON.Result.data;

    if (result) {
        var appCycleArr = [];
        //$.each(normAppraisalCycleGradeData, function (index, data) { appCycleArr.push(data.AppraisalCycleId); });

        //var sortedData = result.data.filter(r => appCycleArr.indexOf(r.AppraisalCycleId) == -1);

        //$.each(sortedData, function (index, data) {

        //    $('#ddlApprCycleHRAdmin').append($("<option>").val(data.AppraisalCycleId).text(data.AppraisalCycleName));

        //});
        $.each(result, function (index, data) {

            $('#ddlApprCycleHRAdminRole').append($("<option>").val(data.AppraisalCycleId).text(data.AppraisalCycleName));

        });


        //$('#ddlApprCycleHRAdminConf').empty();
        //$('#ddlApprCycleHRAdminConf').append($("<option>").val(0).text("Select Appraisal Cycle"));

        //$.each(result, function (index, data) {

        //    $('#ddlApprCycleHRAdminConf').append($("<option>").val(data.AppraisalCycleId).text(data.AppraisalCycleName));

        //});

        //$('#ddlApprCycleHRAdminConf').val(currentAppraisalCycleId);


        //$('#ddlApprCycleHRAdminPromoConf').empty();
        //$('#ddlApprCycleHRAdminPromoConf').append($("<option>").val(0).text("Select Appraisal Cycle"));

        //$.each(result, function (index, data) {

        //    $('#ddlApprCycleHRAdminPromoConf').append($("<option>").val(data.AppraisalCycleId).text(data.AppraisalCycleName));

        //});

        //$('#ddlApprCycleHRAdminPromoConf').val(currentAppraisalCycleId);
    }
}

function BindAllGrade() {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'Rating/GetGradeList';
    var ddlgradeList = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    if (ddlgradeList && ddlgradeList.responseJSON && ddlgradeList.responseJSON.Result) {
        allGradeList = ddlgradeList.responseJSON.Result;
        allGradeList = allGradeList.filter(g => g.GRADENAME.indexOf('C') == -1);
        $('#ddlGradeApprCycleHRAdmin').empty();
        $('#ddlGradeApprCycleHRAdmin').append($("<option>").val(0).text("Select Grade"));
        $.each(allGradeList, function (index, data) {
            $('#ddlGradeApprCycleHRAdmin').append($("<option>").val(data.GRADEID).text(data.GRADENAME));
        });

        $('#ddlGradeHRAdminPromoConf').empty();
        $('#ddlGradeHRAdminPromoConf').append($("<option>").val(0).text("Select Grade"));
        $.each(allGradeList, function (index, data) {
            $('#ddlGradeHRAdminPromoConf').append($("<option>").val(data.GRADEID).text(data.GRADENAME));
        });
    }
}

function BindRatingVisibility() {
    currentVisibilityRatingObj = undefined;
    $('.loader-div').show();

    setTimeout(() => {
        let AppraisalCycleId = $('#ddlApprCycleHRAdminConf').val();

        if (AppraisalCycleId <= 0) {
            $("#chkRatingVisibleConfNo").prop("checked", true)
            $('.loader-div').hide();
            return;
        }

        let svrPath = CONFIG.get('SERVERNAME');
        let apiPath = svrPath + 'RatingAdmin/GetAdminNormRatingVisibility?AppraisalCycleId=' + getRatingPagesAppraisalCycleId();

        var result = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

        if (result && result.responseJSON && result.responseJSON.Result && result.responseJSON.Result[0]) {
            currentVisibilityRatingObj = result.responseJSON.Result[0];
            var IsRatingVisible = result.responseJSON.Result[0].IsRatingVisible;
            if (IsRatingVisible) {
                $("#chkRatingVisibleConfYes").prop("checked", true)
            } else {
                $("#chkRatingVisibleConfNo").prop("checked", true)
            }
        } else {
            toastr.error('Failed to fetch the data');
            $("#chkRatingVisibleConfNo").prop("checked", true)
        }

        $('.loader-div').hide();
    }, 100);
}

function BindPromotionGradeConfiguration() {
    promotionGradeConfigurtionData = [];
    $('.loader-div').show();

    setTimeout(() => {
        let AppraisalCycleId = $('#ddlApprCycleHRAdminPromoConf').val();

        if (AppraisalCycleId <= 0) {
            $('.loader-div').hide();
            return;
        }

        let svrPath = CONFIG.get('SERVERNAME');
        let apiPath = svrPath + 'RatingAdmin/GetPromotionGradeConfiguration?AppraisalCycleId=' + getRatingPagesAppraisalCycleId();
        var result = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

        if (result && result.responseJSON && result.responseJSON.Result && result.responseJSON.Result.length > 0) {
            promotionGradeConfigurtionData = result.responseJSON.Result;

            $("#tblAppCycleGradePromoConf").DataTable({
                data: result.responseJSON.Result,
                "sPaginationType": "full_numbers",
                "iDisplayLength": RecordsCountPerPage,
                "bLengthChange": true,
                "bDestroy": true,
                "searching": false,
                info: false,
                ordering: false,
                paging: false,
                "columnDefs": [
                    { "orderData": [], "targets": 0 }, //TURN OFF DEFAULT SORTING OF TABLE
                    { "orderable": false, "targets": 0 }  //TURN OFF SORTABLILITY FOR COLUMN 1
                ],
                "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
                dom: '<"row"<"col-sm-6"Bl><"col-sm-6"f>>' + '<"row"<"col-sm-12"<"table-responsive"tr>>>' + '<"row"<"col-sm-5"i><"col-sm-7"p>>',
                aoColumns: [
                    {
                        "render": function (data, type, row, meta) {
                            return "<span>" + (Number(meta.row) + 1) + "</span>";
                        },
                        "sWidth": "5%"
                    },
                    {
                        "render": function (data, type, row, meta) {
                            return "<span>" + row.AppraisalCycleName + "</span><span><input type='hidden' id='hdnApprCycleIdPromoConf" + row.Id + "' value='" + row.AppraisalCycleId + "'/></span>";
                        },
                        "sWidth": "15%"
                    },
                    {
                        "render": function (data, type, row, meta) {
                            return "<span id='spnGrade" + row.Id + "'>" + row.GradeName + "</span><span><input type='hidden' id='hdnGradeIdPromoConf" + row.Id + "' value='" + row.GradeId + "'/></span>";
                        },
                        "sWidth": "15%"
                    },
                    //{
                    //    data: "GradeId",
                    //    render: renderGradeDropdownPromoConf,
                    //    width: "9%"
                    //},
                    {
                        "render": function (data, type, row, meta) {
                            return "<input type='number' id='txtPromoPer" + row.Id + "' value='" + row.PromotionPercentage + "'/>";
                        },
                        "sWidth": "9%"
                    },
                    {
                        "render": function (data, type, row, meta) {
                            return "<input type='number' id='txtPromoMalePer" + row.Id + "' value='" + row.MalePercentage + "'/>";
                        },
                        "sWidth": "9%"
                    },
                    {
                        "render": function (data, type, row, meta) {
                            return "<input type='number' id='txtPromoFemalePer" + row.Id + "' value='" + row.FemalePercentage + "'/>";
                        },
                        "sWidth": "9%"
                    },
                    {
                        "render": function (data, type, row, meta) {
                            return "<input type='number' id='txtPromoOthersPer" + row.Id + "' value='" + row.OthersPercentage + "'/>";
                        },
                        "sWidth": "9%"
                    },
                    {
                        "render": function (data, type, row, meta) {
                            return "<button id='btn" + row.Id + "' class='btn btn-primary' onclick='UpdatePromotionGradePercentage(" + row.Id + ")' >Update</button>";
                        },
                        "sWidth": "6%"
                    }
                ],
                "deferRender": true
            });
        } else {
            $("#tblAppCycleGradePromoConf").DataTable().clear().draw();
        }

        $('#ddlGradeHRAdminPromoConf').empty();
        $('#ddlGradeHRAdminPromoConf').append($("<option>").val(0).text("Select Grade"));

        var grades = [];

        $.each(promotionGradeConfigurtionData, function (index, data) {
            grades.push(data.GradeId);
        })

        var sortedGradeData = allGradeList.filter(r => grades.indexOf(r.GRADEID) == -1);

        $.each(sortedGradeData, function (index, data) {
            $('#ddlGradeHRAdminPromoConf').append($("<option>").val(data.GRADEID).text(data.GRADENAME));
        });

        $('.loader-div').hide();
    }, 100);
}

function UpdatePromotionGradePercentage(Id) {
    if (Id <= 0) {
        return;
    }

    var AppraisalCycleId = 0;
    var GradeId = 0;
    var GradeName = '';
    var PromotionPercentage = 0;
    var MalePercentage = 0;
    var FemalPercantage = 0;
    var OthersPercentage = 0;
    var IsActive = true;
    var CreatedBy = 0;
    var ModifiedBy = sessionStorage.EmployeeId;


    AppraisalCycleId = $("#hdnApprCycleIdPromoConf" + Id).val();
    GradeId = $("#hdnGradeIdPromoConf" + Id).val();
    PromotionPercentage = $("#txtPromoPer" + Id).val();
    MalePercentage = $("#txtPromoMalePer" + Id).val();
    FemalPercantage = $("#txtPromoFemalePer" + Id).val();
    OthersPercentage = $("#txtPromoOthersPer" + Id).val();
    GradeName = $("#spnGrade" + Id).text();

    if (PromotionPercentage == undefined || PromotionPercentage == "" || PromotionPercentage <= 0) {
        toastr.error('Promotion percentage should not be empty or zero');
        PromotionPercentage = 0;
        //$("#txtPromoPer" + Id).val(0);
        return;
    }

    if (MalePercentage == "" || MalePercentage == undefined) {
        MalePercentage = 0;
        $("#txtPromoMalePer" + Id).val(0);
    }

    if (FemalPercantage == "" || FemalPercantage == undefined) {
        FemalPercantage = 0;
        $("#txtPromoFemalePer" + Id).val(0);
    }

    if (OthersPercentage == "" || OthersPercentage == undefined) {
        OthersPercentage = 0;
        $("#txtPromoOthersPer" + Id).val(0);
    }

    if (PromotionPercentage != (Number(MalePercentage) + Number(FemalPercantage) + Number(OthersPercentage))) {
        toastr.error('Sum of Male, Female and Others percentage is not matching with the Promotion Percentage');
        return;
    }

    //if (AppraisalCycleId < currentAppraisalCycleId) {
    //    toastr.error('Updation of past appraisal cycle is not allowed');
    //    return;
    //}

    SavePromotionGradeConfiguration(Id, AppraisalCycleId, GradeId, GradeName, PromotionPercentage, MalePercentage, FemalPercantage, OthersPercentage, IsActive, CreatedBy, ModifiedBy);
}

function AddPromotionGradePercentage() {
    var Id = 0;
    var AppraisalCycleId = 0;
    var GradeId = 0;
    var GradeName = '';
    var PromotionPercentage = 0;
    var MalePercentage = 0;
    var FemalPercantage = 0;
    var OthersPercentage = 0;
    var IsActive = true;
    var CreatedBy = sessionStorage.EmployeeId;
    var ModifiedBy = null;

    AppraisalCycleId = $("#ddlApprCycleHRAdminPromoConf").val();
    GradeId = $("#ddlGradeHRAdminPromoConf").val();
    PromotionPercentage = $("#txtPromotionPer").val();
    MalePercentage = $("#txtPromotionMalePer").val();
    FemalPercantage = $("#txtPromotionFemalePer").val();
    OthersPercentage = $("#txtPromotionOthersPer").val();
    GradeName = $("#ddlGradeHRAdminPromoConf option:selected").text();

    if (AppraisalCycleId == undefined || AppraisalCycleId <= 0) {
        toastr.error('Please select appraisal cycle');
        return;
    }

    if (GradeId == undefined || GradeId <= 0) {
        toastr.error("Please select Grade.");
        return;
    }

    if (PromotionPercentage == undefined || PromotionPercentage == "" || PromotionPercentage <= 0) {
        toastr.error('Promotion percentage should not be empty or zero');
        PromotionPercentage = 0;
        return;
    }

    if (MalePercentage == "" || MalePercentage == undefined) {
        MalePercentage = 0;
    }

    if (FemalPercantage == "" || FemalPercantage == undefined) {
        FemalPercantage = 0;
    }

    if (OthersPercentage == "" || OthersPercentage == undefined) {
        OthersPercentage = 0;
    }

    if (PromotionPercentage != (Number(MalePercentage) + Number(FemalPercantage) + Number(OthersPercentage))) {
        toastr.error('Sum of Male, Female and Others percentage is not matching with the Promotion Percentage');
        return;
    }

    //if (AppraisalCycleId < currentAppraisalCycleId) {
    //    toastr.error('Can not add record for past appraisal cycle');
    //    return;
    //}

    SavePromotionGradeConfiguration(Id, AppraisalCycleId, GradeId, GradeName, PromotionPercentage, MalePercentage, FemalPercantage, OthersPercentage, IsActive, CreatedBy, ModifiedBy);
}

function BindAppraisalCycleGradeMappingGrid() {
    $('.animation').removeClass('animation');

    var empId = sessionStorage.EmployeeId;
    //    var apraisalCycleId = $('#ddlRating :selected').val();
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "RatingAdmin/GetNormalisationAppraisalCycleGradeMapping";

    var result = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    if (result && result.responseJSON && result.responseJSON.Result) {
        normAppraisalCycleGradeData = result.responseJSON.Result;

        $("#tblAppCycleGradeMapping").DataTable({
            data: result.responseJSON.Result,
            "sPaginationType": "full_numbers",
            "iDisplayLength": RecordsCountPerPage,
            "bLengthChange": true,
            "bDestroy": true,
            "searching": false,
            info: false,
            ordering: false,
            paging: false,
            "columnDefs": [
                { "orderData": [], "targets": 0 }, //TURN OFF DEFAULT SORTING OF TABLE
                { "orderable": false, "targets": 0 }  //TURN OFF SORTABLILITY FOR COLUMN 1
            ],
            "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
            dom: '<"row"<"col-sm-6"Bl><"col-sm-6"f>>' + '<"row"<"col-sm-12"<"table-responsive"tr>>>' + '<"row"<"col-sm-5"i><"col-sm-7"p>>',
            aoColumns: [
                {
                    "render": function (data, type, row, meta) {
                        return "<span>" + (Number(meta.row) + 1) + "</span><span><input type='hidden' id='hdnAppCycleGradeMappingId" + +row.Id + + "' name='hdnAppCycleGradeMappingId' value='" + row.Id + "'/></span>";
                    },
                    "sWidth": "5%"
                },
                {
                    "render": function (data, type, row, meta) {
                        return "<span>" + row.AppraisalCycleName + "</span><span><input type='hidden' id='hdnApprCycleId" + row.Id + "' name='hdnApprCycleId' value='" + row.AppraisalCycleId + "'/></span>";
                    },
                    "sWidth": "15%"
                },
                {
                    data: "GradeId",
                    render: renderGradeDropdown,
                    width: "9%"
                },
                {
                    "render": function (data, type, row, meta) {

                        var dt = '';
                        if (row.NormalisationStartDate) {
                            dt = formatDate_DMY(new Date(row.NormalisationStartDate));
                        }
                        //return '<input id="dtNormStartDate' + row.Id + '" class="input-exitSmall form-control NormStartDate" value="' + dt + '" ' + ((row.NormalisationStartDate != undefined) ? "disabled" : "") + ' />';
                        return '<input id="dtNormStartDate' + row.Id + '" class="input-exitSmall form-control NormStartDate" value="' + dt + '" />';
                    },
                    "sWidth": "10%"
                },
                //{
                //    "className": "text-center",
                //    "render": function (data, type, row, meta) {
                //        return '<input id="chkRatingVisible' + row.Id + '" class="form-check-input" type="checkbox" ' + ((row.IsRatingVisible == true) ? "checked" : "") + ' style="scale:1.4;" />';
                //    },
                //    "sWidth": "11%"
                //},
                {
                    "render": function (data, type, row, meta) {
                        //return "<button id='btn" + row.Id + "' class='btn btn-primary' onclick='UpdateNormAppraisalCycleGradeMapping(" + row.Id + ")'" + ((row.NormalisationStartDate != undefined) ? "disabled" : "") + " >Update</button>";
                        return "<button id='btn" + row.Id + "' class='btn btn-primary' onclick='UpdateNormAppraisalCycleGradeMapping(" + row.Id + ")' >Update</button>";
                    },
                    "sWidth": "6%"
                }
            ],
            "deferRender": true
        });
    }
    $("#loading-overlay").hide(); // Show loading image
}

function renderGradeDropdown(data, type, row) {
    //var gradeHTML = '<div class="input-group input-append date id="dv' + row.Id + '" style="margin: 0 auto;"><select id="ddlDynamicGrade' + row.Id + '" class="form-control currRating" ' + ((row.NormalisationStartDate != undefined) ? "disabled" : "") + '><option value="0">Select Grade</option>';
    var gradeHTML = '<div class="input-group id="dv' + row.Id + '" style="margin: 0 auto;"><select id="ddlDynamicGrade' + row.Id + '" class="form-control"><option value="0">Select Grade</option>';

    $.each(allGradeList, function (index, data) {
        if (row.GradeId == data.GRADEID) {
            gradeHTML += '<option value="' + data.GRADEID + '" selected>' + data.GRADENAME + '</option>';
        } else {
            gradeHTML += '<option value="' + data.GRADEID + '">' + data.GRADENAME + '</option>';
        }
    });
    gradeHTML += '</select></div>';
    return gradeHTML;
}

function renderGradeDropdownPromoConf(data, type, row) {
    //var gradeHTML = '<div class="input-group input-append date id="dv' + row.Id + '" style="margin: 0 auto;"><select id="ddlDynamicGrade' + row.Id + '" class="form-control currRating" ' + ((row.NormalisationStartDate != undefined) ? "disabled" : "") + '><option value="0">Select Grade</option>';
    var gradeHTML = '<div class="input-group id="dv' + row.Id + '" style="margin: 0 auto;"><select id="ddlDynamicGradePromoConf' + row.Id + '" class="form-control"><option value="0">Select Grade</option>';

    $.each(allGradeList, function (index, data) {
        if (row.GradeId == data.GRADEID) {
            gradeHTML += '<option value="' + data.GRADEID + '" selected>' + data.GRADENAME + '</option>';
        } else {
            gradeHTML += '<option value="' + data.GRADEID + '">' + data.GRADENAME + '</option>';
        }
    });
    gradeHTML += '</select></div>';
    return gradeHTML;
}

function InsertNormAppraisalCycleGradeMapping() {
    var Id = 0;
    var AppraisalCycleId = $("#ddlApprCycleHRAdmin").val();

    //if (AppraisalCycleId < currentAppraisalCycleId) {
    //    toastr.error('Past appraisal cycle is not allowed');
    //    return;
    //}

    var GradeId = $("#ddlGradeApprCycleHRAdmin").val();
    var NormStartDate = $("#dtNormStartDate").val();

    if (NormStartDate != "") {
        NormStartDate = foramtDate_DMY2YMD(NormStartDate);
    }

    var IsRatingVisible = $("#chkRatingVisible").is(":checked");

    var NormEndDate = null;
    var IsActive = true;
    var CreatedBy = sessionStorage.EmployeeId;
    var ModifiedBy = null;

    if (AppraisalCycleId == undefined || AppraisalCycleId <= 0) {
        toastr.error("Please select Appraisal Cycle.");
        return;
    }

    if (GradeId == undefined || GradeId <= 0) {
        toastr.error("Please select Grade.");
        return;
    }

    if (NormStartDate == "") {
        NormStartDate = null;
    }

    SaveNormAppraisalCycleGradeMapping(Id, AppraisalCycleId, GradeId, NormStartDate, NormEndDate, IsActive, IsRatingVisible, CreatedBy, ModifiedBy);
}

function UpdateNormAppraisalCycleGradeMapping(Id) {
    var AppraisalCycleId = $("#hdnApprCycleId" + Id).val();

    //if (AppraisalCycleId < currentAppraisalCycleId) {
    //    toastr.error('Updation of past appraisal cycle is not allowed');
    //    return;
    //}

    var GradeId = $("#ddlDynamicGrade" + Id).val();
    var NormStartDate = $("#dtNormStartDate" + Id).val();

    if (NormStartDate != "") {
        NormStartDate = foramtDate_DMY2YMD(NormStartDate);
    }
    var NormEndDate = null;
    var IsActive = true;
    var IsRatingVisible = $("#chkRatingVisible" + Id).is(":checked");
    var CreatedBy = 0;
    var ModifiedBy = sessionStorage.EmployeeId;

    if (AppraisalCycleId == undefined || AppraisalCycleId <= 0) {
        toastr.error("Please select Appraisal Cycle.");
        return;
    }

    if (GradeId == undefined || GradeId <= 0) {
        toastr.error("Please select Grade.");
        return;
    }

    if (NormStartDate == "") {
        NormStartDate = null;
    }

    SaveNormAppraisalCycleGradeMapping(Id, AppraisalCycleId, GradeId, NormStartDate, NormEndDate, IsActive, IsRatingVisible, CreatedBy, ModifiedBy);
}

function SaveNormAppraisalCycleGradeMapping(Id, AppraisalCycleId, GradeId, NormalisationStartDate, NormalisationEndDate, IsActive, IsRatingVisible, CreatedBy, ModifiedBy) {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "RatingAdmin/SaveNormalisationAppraisalCycleGradeMapping";

    var requestData = {
        Id: Id,
        AppraisalCycleId: AppraisalCycleId,
        GradeId: GradeId,
        NormalisationStartDate: NormalisationStartDate,
        NormalisationEndDate: NormalisationEndDate,
        IsActive: IsActive,
        IsRatingVisible: IsRatingVisible,
        CreatedBy: CreatedBy,
        ModifiedBy: ModifiedBy
    };

    $.ajax({
        url: apiPath,
        type: 'POST',
        data: JSON.stringify(requestData),
        async: true,
        dataType: 'json',
        headers: CommonGetHeaderInfo(),
        contentType: 'application/json',
        beforeSend: function (xhr, opts) {
            // alert()
            $('.loader-div').show();

        },
        headers: CommonGetHeaderInfo(),
        success: function (result) {
            Result = result;

            msg = 'Appraisal Cycle Configuration Updated!';
            $('#btnAddNormAppriasalCycleGradeMapping').prop('disabled', false);

            if (Result.Success) {
                toastr.success(msg);
            }
            else {
                toastr.error(Result.ErrorMessage);
            }

            BindAppraisalCycleGradeMappingGrid();
            BindActiveAppraisalCycle();
            SetUpNormDatePicker();
            $("#ddlApprCycleHRAdmin").val(0);
            $("#ddlGradeApprCycleHRAdmin").val(0);
            $("#dtNormStartDate").val("");
            $("#chkRatingVisible").removeAttr('checked');
            $('.loader-div').hide();
        },
        complete: function (xhr, statusText) {

            if (data === null || data === "") {
                data = {
                    "statusCode": xhr.status, "statusText": statusText
                };
            }
        },
        error: function (xhr, statusText, errorThrown) {
            data = {
                "statusCode": xhr.status, "statusText": statusText, "error": "error"
            };
        }
    });
}

function SaveRatingVisibility() {

    var AppraisalCycleId = $("#ddlApprCycleHRAdminConf").val();

    if (AppraisalCycleId <= 0) {
        toastr.error('Please select appraisal cycle');
        return;
    }

    //if (AppraisalCycleId < currentAppraisalCycleId) {
    //    toastr.error('Updation of past appraisal cycle is not allowed');
    //    return;
    //}

    if (!currentVisibilityRatingObj) {
        toastr.error('No data available to update');
        return;
    }

    var Id = currentVisibilityRatingObj.Id;

    var NormStartDate = null;
    var NormEndDate = null;

    var IsActive = true;
    var IsRatingVisible = $("#chkRatingVisibleConfYes").prop("checked");
    var CreatedBy = sessionStorage.EmployeeId;
    var ModifiedBy = sessionStorage.EmployeeId;

    if (AppraisalCycleId == undefined || AppraisalCycleId <= 0) {
        toastr.error("Please select Appraisal Cycle.");
        return;
    }

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "RatingAdmin/SaveNormalisationRatingVisibility";

    var requestData = {
        Id: Id,
        AppraisalCycleId: AppraisalCycleId,
        NormalisationStartDate: NormStartDate,
        NormalisationEndDate: NormEndDate,
        IsActive: IsActive,
        IsRatingVisible: IsRatingVisible,
        CreatedBy: CreatedBy,
        ModifiedBy: ModifiedBy
    };

    $.ajax({
        url: apiPath,
        type: 'POST',
        data: JSON.stringify(requestData),
        async: true,
        dataType: 'json',
        headers: CommonGetHeaderInfo(),
        contentType: 'application/json',
        beforeSend: function (xhr, opts) {
            // alert()
            $('.loader-div').show();

        },
        headers: CommonGetHeaderInfo(),
        success: function (result) {
            Result = result;

            msg = 'Rating Visibility Configuration Updated!';
            //$('#btnAddNormAppriasalCycleGradeMapping').prop('disabled', false);

            if (Result.Success) {
                toastr.success(msg);
            }
            else {
                toastr.error(Result.ErrorMessage);
            }

            BindRatingVisibility();
            //BindActiveAppraisalCycle();
            //SetUpNormDatePicker();
            //$("#ddlApprCycleHRAdmin").val(0);
            //$("#ddlGradeApprCycleHRAdmin").val(0);
            //$("#dtNormStartDate").val("");
            //$("#chkRatingVisible").removeAttr('checked');
            $('.loader-div').hide();
        },
        complete: function (xhr, statusText) {

            if (data === null || data === "") {
                data = {
                    "statusCode": xhr.status, "statusText": statusText
                };
            }
        },
        error: function (xhr, statusText, errorThrown) {
            data = {
                "statusCode": xhr.status, "statusText": statusText, "error": "error"
            };
        }
    });
}

function SavePromotionGradeConfiguration(Id, AppraisalCycleId, GradeId, GradeName, PromotionPercentage, MalePercentage, FemalePercentage, OthersPercentage, IsActive, CreatedBy, ModifiedBy) {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "RatingAdmin/SavePromotionGradeConfiguration";

    var requestData = {
        Id: Id,
        AppraisalCycleId: AppraisalCycleId,
        GradeId: GradeId,
        GradeeName: GradeName,
        PromotionPercentage: PromotionPercentage,
        MalePercentage: MalePercentage,
        FemalePercentage: FemalePercentage,
        OthersPercentage: OthersPercentage,
        IsActive: IsActive,
        CreatedBy: CreatedBy,
        ModifiedBy: ModifiedBy
    };

    $.ajax({
        url: apiPath,
        type: 'POST',
        data: JSON.stringify(requestData),
        async: true,
        dataType: 'json',
        headers: CommonGetHeaderInfo(),
        contentType: 'application/json',
        beforeSend: function (xhr, opts) {
            // alert()
            $('.loader-div').show();

        },
        headers: CommonGetHeaderInfo(),
        success: function (result) {
            Result = result;

            msg = 'Promotion Grade Configuration Updated!';

            if (Result.Success) {
                toastr.success(msg);
            }
            else {
                toastr.error(Result.ErrorMessage);
            }

            //$("#ddlApprCycleHRAdminPromoConf").val(currentAppraisalCycleId);
            $("#ddlGradeHRAdminPromoConf").val('0');
            $("#txtPromotionPer").val('');
            $("#txtPromotionMalePer").val('');
            $("#txtPromotionFemalePer").val('');
            $("#txtPromotionOthersPer").val('')
            $('.loader-div').hide();

            BindPromotionGradeConfiguration();
        },
        complete: function (xhr, statusText) {

            if (data === null || data === "") {
                data = {
                    "statusCode": xhr.status, "statusText": statusText
                };
            }
        },
        error: function (xhr, statusText, errorThrown) {
            data = {
                "statusCode": xhr.status, "statusText": statusText, "error": "error"
            };
        }
    });
}

$(document).on('keydown', 'input[type=number]', function (e) {
    if (e.key == '.' || e.key == '-') {
        return false;
    }
});

function SetUpNormDatePicker() {

    $.each(normAppraisalCycleGradeData, function (index, data) {
        $("#dtNormStartDate" + data.Id).datepicker({
            minDate: '0',
            dateFormat: 'dd-mm-yy'
        });
    });
}

function SetUpNormEnDDatePicker() {
    $.each(normAppraisalCycleGradeData, function (index, data) {
        $("#dtNormEndDate" + data.Id).datepicker({
            minDate: '0',
            dateFormat: 'dd-mm-yy'
        });
    });
}

function BindHRBPAdminOverAllMaleFemalePromotionSummary() {

    var empId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    var RoleId = SelectionAccessType;

    var GDLHeadSpan = $("#ddlGDLDept_headPromo").val().toString();

    var DPSpan = $("#ddlDPSpan_headPromo").val().toString();
    var RMSpan = $("#ddlRMSpan_headPromo").val().toString();

    var GradeId = $("#ddlgrade_HRBPAdminPromo").val().toString();
    var LocationId = $("#ddllocation_HRBPAdminPromo").val().toString();
    var GroupAccountId = $("#ddlgroupaccount_HRBPAdminPromo").val().toString();
    var Gender = $("#ddlgender_HRBPAdminPromo").val().toString();

    var EmpStatus = $("#ddlEmployeeStatus_HRBPAdminPromo").val().toString();

    var DeliveryStatus = $("#ddlDeliveryStatus_Prom").val().toString();


    if (GDLHeadSpan == "") {
        GDLHeadSpan = 0;
    }
    if (DPSpan == "") {
        DPSpan = 0;
    }

    if (RMSpan == "") {
        RMSpan = 0;
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
    if (DeliveryStatus == "") {
        DeliveryStatus = 0;
    }
    var RoleId = SelectionAccessType;
    empData = {
        AppraisalCycleId: getRatingPagesAppraisalCycleId(), // current AppraisalCycleId
        LoginEmployeeId: sessionStorage.EmployeeId, // ReferBack By
        GDLHeadSpan: GDLHeadSpan,  //PEPEmployeeId
        DPSpan: DPSpan,  // Rating Given By.
        RMSpan: RMSpan,
        GradeId: GradeId,
        LocationId: LocationId,
        GroupAccountId: GroupAccountId,
        Gender: Gender,
        EmpStatus: EmpStatus,
        Role: RoleId,
        DeliveryStatus: DeliveryStatus
    };


    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "RatingAdmin/GetRatingMaleFemalePromotionDetails";

    // var apiPath = svrPath + "RatingAdmin/GetRatingMaleFemalePromotionDetails?AppraisalCycleId=" + 9 + "&LogEmpID=" + empId + "&GDLList=" + GDLHeadSpan + "&DPList=" + DPSpan + "&RMList=" + RMSpan + "&GradeId=" + GradeId + "&LocationId=" + LocationId + "&GroupAccountId=" + GroupAccountId + "&Gender=" + Gender + "&EmpStatus=" + EmpStatus + "&Role=" + RoleId;

    $('#tblHRBPAdminMFPromotionSummary tbody tr:gt(1)').remove();

    CommonAjaxPostForNormalization(apiPath, empData, headerInfo).done(function (ratingPromotionOverallData) {


        if (ratingPromotionOverallData.Success == true) {

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


                //  MaleCurrentorgDistrubution = ((d.MaleCount / MaleTotal) * 100).toFixed(2).replace(".00", "");


                if (isNaN((d.MaleCount / MaleTotal) * 100)) {
                    MaleCurrentorgDistrubution = 0;
                } else {
                    MaleCurrentorgDistrubution = ((d.MaleCount / MaleTotal) * 100).toFixed(2).replace(".00", "");
                    Male_CurrentOrgDist = parseFloat(Male_CurrentOrgDist) + ((d.MaleCount / MaleTotal) * 100);

                }

                //   MaleCurrentorgDistrubution += parseFloat(MaleCurrentorgDistrubution);
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

                //For Others
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
                    Others_FinalApproved = parseFloat(Others_FinalApproved) + parseFloat(OthersApprovedRatio);
                } else {
                    OthersApprovedRatio = ((d.OthersApprovedCount / d.OthersCount) * 100).toFixed(2).replace(".00", "");
                    Others_FinalApproved = parseFloat(Others_FinalApproved) + parseFloat(((d.OthersApprovedCount / d.OthersCount) * 100));
                }

                if (isNaN((d.MaleApprovedCount / d.MaleCount) * 100)) {
                    MaleApprovedRatio = 0;
                    Male_FinalApprovedPer = parseFloat(Male_FinalApprovedPer) + MaleApprovedRatio;
                } else {
                    MaleApprovedRatio = ((d.MaleApprovedCount / d.MaleCount) * 100).toFixed(2).replace(".00", "");
                    Male_FinalApprovedPer = parseFloat(Male_FinalApprovedPer) + parseFloat(((d.MaleApprovedCount / d.MaleCount) * 100));
                }

                if (isNaN((d.FemaleApprovedCount / d.FemaleCount) * 100)) {
                    FemaleApprovedRatio = 0;
                    Female_FinalApprovedPer = Female_FinalApprovedPer + FemaleApprovedRatio;

                } else {
                    FemaleApprovedRatio = ((d.FemaleApprovedCount / d.FemaleCount) * 100).toFixed(2).replace(".00", "");

                    Female_FinalApprovedPer = Female_FinalApprovedPer + ((d.FemaleApprovedCount / d.FemaleCount) * 100);
                }
                //  Male_CurrentOrgDist = Male_CurrentOrgDist + MaleCurrentorgDistrubution;
                Male_PromoRecoReceived = (parseInt(Male_PromoRecoReceived) + parseInt(d.MaleRecommendationForPromotion)).toFixed(2).replace(".00", "");;
                //Male_Ratio = Male_Ratio + Maleratio;
                Male_FinalApproved = parseFloat(Male_FinalApproved) + parseFloat(d.MaleApprovedCount);
                //Male_FinalApprovedPer = Male_FinalApprovedPer + FemaleApprovedRatio;

                // Female_CurrentOrgDist = parseFloat(Female_CurrentOrgDist) + parseFloat(FemaleCurrentorgDistrubution);
                Female_PromoRecoReceived = parseFloat(Female_PromoRecoReceived) + parseFloat(d.FeMaleRecommendationForPromotion);
                Female_Ratio = parseFloat(Female_Ratio) + parseFloat(Femaleratio);
                Female_FinalApproved = parseFloat(Female_FinalApproved) + parseFloat(d.FemaleApprovedCount);
                Female_FinalApprovedPer = parseFloat(Female_FinalApprovedPer) + parseFloat(FemaleApprovedRatio);

                Others_PromoRecoReceived = parseFloat(Others_PromoRecoReceived) + parseFloat(d.OthersRecommendationForPromotion);
                Others_Ratio = parseFloat(Others_Ratio) + parseFloat(Othersratio);
                Others_FinalApproved = parseFloat(Others_FinalApproved) + parseFloat(d.OthersApprovedCount);
                Others_FinalApprovedPer = parseFloat(Others_FinalApprovedPer) + parseFloat(OthersApprovedRatio);

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

                cols += '<td style="text-align: center;">' + d.OthersCount + '</td>';
                cols += '<td style="text-align: center;">' + OthersCurrentorgDistrubution + '</td>';

                cols += '<td style="text-align: center;">' + d.OthersRecommendationForPromotion + '</td>';
                cols += '<td style="text-align: center;">' + Othersratio + '</td>';

                cols += '<td style="text-align: center;">' + d.OthersApprovedCount + '</td>';
                cols += '<td style="text-align: center;">' + OthersApprovedRatio + '</td>';


                newRow1.append(cols);
                $("#tblHRBPAdminMFPromotionSummary").append(newRow1);

            })


            var cols = "";
            var newRow1 = $("<tr>");


            Male_CurrentOrgDist = Male_CurrentOrgDist.toFixed(2).replace(".00", "");
            cols += '<td><b>Total<b/></td>';

            Male_Ratio = (Male_PromoRecoReceived / MaleTotal) * 100;
            Female_Ratio = (Female_PromoRecoReceived / FemaleTotal) * 100;

            Male_FinalApproved = Male_FinalApproved.toFixed(2).replace(".00", "");
            Male_FinalApprovedPer = parseFloat(Male_FinalApprovedPer).toFixed(2).replace(".00", "");
            Female_CurrentOrgDist = parseFloat(Female_CurrentOrgDist).toFixed(2).replace(".00", "");

            Male_Ratio = parseFloat(Male_Ratio).toFixed(2).replace(".00", "");
            Female_Ratio = parseFloat(Female_Ratio).toFixed(2).replace(".00", "");

            Female_FinalApprovedPer = parseFloat(Female_FinalApprovedPer).toFixed(2).replace(".00", "");

            if (isNaN(Male_Ratio)) {
                Male_Ratio = 0;
            }
            if (isNaN(Female_Ratio)) {
                Female_Ratio = 0;
            }


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

            cols += '<td style="text-align: center;"><b>' + OthersTotal + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + Others_CurrentOrgDist + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + Others_PromoRecoReceived + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + Others_Ratio + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + Others_FinalApproved + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + Others_FinalApprovedPer + '<b/></td>';

            newRow1.append(cols);
            $("#tblHRBPAdminMFPromotionSummary").append(newRow1);
        }
        else
            $(".loader-div").hide();
    });
}


function BindHRBPAdminOverAllPromotionSummary() {

    var empId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };


    var RoleId = SelectionAccessType;

    var GDLHeadSpan = $("#ddlGDLDept_headPromo").val().toString();

    var DPSpan = $("#ddlDPSpan_headPromo").val().toString();
    var RMSpan = $("#ddlRMSpan_headPromo").val().toString();

    var GradeId = $("#ddlgrade_HRBPAdminPromo").val().toString();
    var LocationId = $("#ddllocation_HRBPAdminPromo").val().toString();
    var GroupAccountId = $("#ddlgroupaccount_HRBPAdminPromo").val().toString();
    var Gender = $("#ddlgender_HRBPAdminPromo").val().toString();

    var EmpStatus = $("#ddlEmployeeStatus_HRBPAdminPromo").val().toString();

    var DeliveryStatus = $("#ddlDeliveryStatus_Prom").val().toString();


    if (GDLHeadSpan == "") {
        GDLHeadSpan = 0;
    }
    if (DPSpan == "") {
        DPSpan = 0;
    }

    if (RMSpan == "") {
        RMSpan = 0;
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
    if (DeliveryStatus == "") {
        DeliveryStatus = 0;
    }
    var RoleId = SelectionAccessType;
    empData = {
        AppraisalCycleId: getRatingPagesAppraisalCycleId(), // current AppraisalCycleId
        LoginEmployeeId: sessionStorage.EmployeeId, // ReferBack By
        GDLHeadSpan: GDLHeadSpan,  //PEPEmployeeId
        DPSpan: DPSpan,  // Rating Given By.
        RMSpan: RMSpan,
        GradeId: GradeId,
        LocationId: LocationId,
        GroupAccountId: GroupAccountId,
        Gender: Gender,
        EmpStatus: EmpStatus,
        Role: RoleId,
        DeliveryStatus: DeliveryStatus
    };

    var svrPath = CONFIG.get('SERVERNAME');

    var apiPath = svrPath + "RatingAdmin/GetRatingPromotionDetails";

    //var apiPath = svrPath + "RatingAdmin/GetRatingPromotionDetails?AppraisalCycleId=" + 9 + "&LogEmpID=" + empId + "&GDLList=" + GDLHeadSpan + "&DPList=" + DPSpan + "&RMList=" + RMSpan + "&GradeId=" + GradeId + "&LocationId=" + LocationId + "&GroupAccountId=" + GroupAccountId + "&Gender=" + Gender + "&EmpStatus=" + EmpStatus + "&Role=" + RoleId;

    //$('#tblHRBPAdminPromotionSummary tbody tr:gt(1)').remove();
    $('#tblHRBPAdminPromotionSummary tbody').html('');

    CommonAjaxPostForNormalization(apiPath, empData, headerInfo).done(function (ratingPromotionOverallData) {

        if (ratingPromotionOverallData.Success == true) {


            var Total = 0;
            var PromotionPer = 0;
            var CurrentorgDistrubutionTotal = 0;

            var TotalIdealNo = 0;
            var TotalProRecoReceived = 0;
            var TotalRatio = 0;
            var TotalDiff = 0;
            var TotalFinalApproved = 0;
            var TotalFinalApprovedPer = 0;
            var TotalPromotoionPercentage = 0;

            ratingPromotionRawData = ratingPromotionOverallData.Result;

            BindGradePromo();

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

                //  CurrentorgDistrubution = ((d.TotalCount / Total) * 100).toFixed(2).replace(".00", "");


                if (isNaN((d.TotalCount / Total) * 100)) {
                    CurrentorgDistrubution = 0;
                } else {
                    CurrentorgDistrubution = ((d.TotalCount / Total) * 100).toFixed(2).replace(".00", "");
                }

                CurrentorgDistrubutionTotal += parseFloat(((d.TotalCount / Total) * 100));
                IdealNumber = ((d.TotalCount * d.PromotoionPercentage) / 100).toFixed(2).replace(".00", "");;

                if (isNaN((d.RecommendationForPromotion / d.RecommendationForPromotion) * 100)) {
                    ratio = 0;
                    TotalRatio = (TotalRatio + ratio);
                } else {
                    ratio = ((d.RecommendationForPromotion / d.TotalCount) * 100).toFixed(2).replace(".00", "");
                    TotalRatio = (TotalRatio + ((d.RecommendationForPromotion / d.TotalCount) * 100));
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
                TotalPromotoionPercentage = (TotalPromotoionPercentage + parseFloat(d.PromotoionPercentage));

                cols += '<td style="text-align: center;">' + d.Grade + '</td>';
                cols += '<td style="text-align: center;">' + d.TotalCount + '</td>';
                cols += '<td style="text-align: center;">' + CurrentorgDistrubution + '</td>';
                cols += '<td style="text-align: center;">' + (d.PromotoionPercentage) + '</td>';
                cols += '<td style="text-align: center;">' + IdealNumber + '</td>';
                cols += '<td style="text-align: center;">' + d.RecommendationForPromotion + '</td>';
                cols += '<td style="text-align: center;">' + ratio + '</td>';

                if (parseFloat(difference) > 0) {
                    cols += '<td style="text-align: center;" class="diffcol">' + difference + '</td>';
                } else {

                    cols += '<td style="text-align: center;">' + difference + '</td>';
                }

                cols += '<td style="text-align: center;">' + d.ApprovedCount + '</td>';
                cols += '<td style="text-align: center;">' + approvedpercentage + '</td>';


                newRow1.append(cols);
                $("#tblHRBPAdminPromotionSummary").append(newRow1);

            })

            var cols = "";
            var newRow1 = $("<tr>");
            TotalRatio = (TotalProRecoReceived / Total) * 100;
            TotalIdealNo = TotalIdealNo.toFixed(2).replace(".00", "");
            CurrentorgDistrubutionTotal = CurrentorgDistrubutionTotal.toFixed(2).replace(".00", "");
            TotalPromotoionPercentage = TotalPromotoionPercentage.toFixed(2).replace(".00", "");

            cols += '<td style="text-align: center;"><b>Total<b/></td>';
            cols += '<td style="text-align: center;"><b>' + Total + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + CurrentorgDistrubutionTotal + '<b/></td>';
            cols += '<td style="text-align: center;"><b>  9% <b/></td> ';
            cols += '<td style="text-align: center;"><b>' + TotalIdealNo + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + TotalProRecoReceived + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + TotalRatio.toFixed(2).replace(".00", ""); + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + TotalDiff + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + TotalFinalApproved + '<b/></td>';
            cols += '<td style="text-align: center;"><b>' + TotalFinalApprovedPer + '<b/></td>';

            newRow1.append(cols);
            $("#tblHRBPAdminPromotionSummary").append(newRow1);

        }
    });
}


function bindChartPromotion() {
    var grades = [];
    var TotalEmployees = [];
    var ApprovedforPromotion = [];
    var RecommendationForPromotion = [];
    var empId = sessionStorage.EmployeeId;
    var svrPath = CONFIG.get('SERVERNAME');

    var GDLHeadSpan = $("#ddlGDLDept_headPromo").val().toString();

    var DPSpan = $("#ddlDPSpan_headPromo").val().toString();
    var RMSpan = $("#ddlRMSpan_headPromo").val().toString();

    var GradeId = $("#ddlgrade_HRBPAdminPromo").val().toString();
    var LocationId = $("#ddllocation_HRBPAdminPromo").val().toString();
    var GroupAccountId = $("#ddlgroupaccount_HRBPAdminPromo").val().toString();
    var Gender = $("#ddlgender_HRBPAdminPromo").val().toString();

    var EmpStatus = $("#ddlEmployeeStatus_HRBPAdminPromo").val().toString();
    var DeliveryStatus = $("#ddlDeliveryStatus_Prom").val().toString();


    if (GDLHeadSpan == "") {
        GDLHeadSpan = 0;
    }
    if (DPSpan == "") {
        DPSpan = 0;
    }

    if (RMSpan == "") {
        RMSpan = 0;
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
    if (DeliveryStatus == "") {
        DeliveryStatus = 0;
    }

    var RoleId = SelectionAccessType;
    empData = {
        AppraisalCycleId: getRatingPagesAppraisalCycleId(), // current AppraisalCycleId
        LoginEmployeeId: sessionStorage.EmployeeId, // ReferBack By
        GDLHeadSpan: GDLHeadSpan,  //PEPEmployeeId
        DPSpan: DPSpan,  // Rating Given By.
        RMSpan: RMSpan,
        GradeId: GradeId,
        LocationId: LocationId,
        GroupAccountId: GroupAccountId,
        Gender: Gender,
        EmpStatus: EmpStatus,
        Role: RoleId,
        DeliveryStatus: DeliveryStatus
    };

    var apiPath = svrPath + "RatingAdmin/GetDataforPromotionGraph";

    //var apiPath = svrPath + "RatingAdmin/GetDataforPromotionGraph?AppraisalCycleId=" + 9 + "&LogEmpID=" + empId + "&GDLList=" + GDLHeadSpan + "&DPList=" + DPSpan + "&RMList=" + RMSpan + "&GradeId=" + GradeId + "&LocationId=" + LocationId + "&GroupAccountId=" + GroupAccountId + "&Gender=" + Gender + "&EmpStatus=" + EmpStatus + "&Role=" + 1;

    $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'POST',
        headers: CommonGetHeaderInfo(),
        data: JSON.stringify(empData),
        url: apiPath,
        async: false,

        success: function (data) {
            //setting  data from result to variables
            if (data && data.Result && data.Result.length > 0) {

                for (var i = 0; i < data.Result.length; i++) {
                    grades[i] = data.Result[i].Grade;
                    TotalEmployees[i] = data.Result[i].TotalEmployees;
                    ApprovedforPromotion[i] = data.Result[i].ApprovedforPromotion;
                    RecommendationForPromotion[i] = data.Result[i].RecommendationForPromotion;
                }
            } else {
                console.warn('bindChartPromotion: No data returned or invalid response structure');
                // Initialize with empty arrays
                grades = [];
                TotalEmployees = [];
                ApprovedforPromotion = [];
                RecommendationForPromotion = [];
            }

        },
        error: function (response) {
            console.error('bindChartPromotion error:', response);
            alert('Failed to load promotion chart data.');
        }
    });
    Highcharts.chart("hrbpAdmin_prom_chart", {

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
            text: "Approved Promotions"
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
        series: [{
            type: "column",
            name: "Ideal no of Employees",
            data: TotalEmployees,
        },
        {
            type: "column",
            name: "Recommended for Promotion",
            data: RecommendationForPromotion,
        },
        {
            type: "column",
            name: "Approved for Promotion",
            data: ApprovedforPromotion,
        }

        ]
    });

    $(".loader-div").hide();

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
        //window.location.href = uri + base64(format(template, ctx))
        document.getElementById(ButtonId).href = uri + base64(format(template, ctx));
        document.getElementById(ButtonId).download = name + '.xls';
        // document.getElementById("btnDownload").click();
    }
})()

//function ViewClaimHistory(EmpId) {

//    var options = { "backdrop": "static", keyboard: true };
//    var $buttonClicked = $(this);
//    //  var ClaimID = EmpId;
//    var LoginempId = sessionStorage.EmployeeId;
//    var token = sessionStorage.TokenValue;

//    var headerInfo = {
//       'Authorization': 'Bearer ' + sessionStorage.TokenValue,
//        "X-EmpNo": LoginempId
//    };

//    var svrPath = CONFIG.get('SERVERNAME');
//    var apiPath = svrPath + "Rating/GetRatingHistory?AppraisalCycleId=" + 8 + "&EmpID=" + EmpId;

//    CommonAjaxGET(apiPath, headerInfo).done(function (ratingHistoryData) {

//        if (ratingHistoryData.Success == true) {

//            $("#tblActionHistory").DataTable({
//                "dom": 'lBfrtip',
//                buttons: [
//                {
//                    extend: 'excelHtml5',
//                    text: 'Export to Excel',
//                    title: 'History Details',
//                    download: 'open',
//                    orientation: 'landscape',
//                    exportOptions: {
//                        columns: [0, 1, 2, 3, 4, 5, 6]
//                    }
//                }],
//                "data": ratingHistoryData.Result,
//                "destroy": true,
//                "sPaginationType": "full_numbers",
//                "iDisplayLength": RecordsCountPerPage,
//                "bLengthChange": false,
//                "bDestroy": true,
//                "searching": false,
//                info: false,
//                "oLanguage": {
//                    "oPaginate": {
//                        "sNext": '<a href="#"><span class="glyphicon glyphicon-triangle-right"></span></a>',
//                        "sPrevious": '<a href="#"><span class="glyphicon glyphicon-triangle-left"></span></a>',
//                        "sLast": '<a href="#"><span class="glyphicon glyphicon-step-forward"></span></a>',
//                        "sFirst": '<a href="#"><span class="glyphicon glyphicon-step-backward"></span></a>'
//                    }
//                },
//                aoColumns: [
//                    {
//                        "render": function (data, type, row, meta) {
//                            return row.SrNo;
//                        }
//                    },
//                {
//                    "render": function (data, type, row, meta) {
//                        return row.GivenBy;
//                    }
//                }, {
//                    "render": function (data, type, row, meta) {
//                        return row.Rating;
//                    }
//                },
//                {
//                    "render": function (data, type, row, meta) {
//                        return row.Givendate;
//                    },
//                },
//                {
//                    "render": function (data, type, row, meta) {
//                        return row.Action;
//                    }
//                },
//                {
//                    "render": function (data, type, row, meta) {
//                        return row.Comments;
//                    }
//                }],
//            });
//            $('#ViewNTHistoryDetails').modal('show');

//        }
//    });


//}


function BindHRBPMaleFemaleNormalization() {
    var empId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };


    var RoleId = SelectionAccessType;

    var GDLHeadSpan = $('#ddlGDLDept_headNorm').val().toString();

    var DPSpan = $('#ddlDPSpan_headNorm').val().toString();
    var RMSpan = $('#ddlRMSpan_headNorm').val().toString();

    var GradeId = $("#ddlgrade_HRBPAdminNorm").val().toString();
    var LocationId = $("#ddllocation_HRBPAdminNorm").val().toString();
    var GroupAccountId = $("#ddlgroupaccount_HRBPAdminNorm").val().toString();
    var Gender = $("#ddlgender_HRBPAdminNorm").val().toString();
    var EmpStatus = $("#ddlEmployeeStatus_HRBPAdminNorm").val().toString();
    var DeliveryStatus = $("#ddlDeliveryStatus_Norm").val().toString();

    var Promotion = $("#ddlPromotion_PNorm").val().toString();

    if (GDLHeadSpan == "") {
        GDLHeadSpan = 0;
    }

    if (DPSpan == "") {
        DPSpan = 0;
    }
    if (RMSpan == "") {
        RMSpan = 0;
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
    if (DeliveryStatus == "") {
        DeliveryStatus = 0;
    }

    if (Promotion == "") {
        Promotion = 0;
    }


    var RoleId = SelectionAccessType;
    empData = {
        AppraisalCycleId: getRatingPagesAppraisalCycleId(), // current AppraisalCycleId
        LoginEmployeeId: sessionStorage.EmployeeId, // ReferBack By
        GDLHeadSpan: GDLHeadSpan,  //PEPEmployeeId
        DPSpan: DPSpan,  // Rating Given By.
        RMSpan: RMSpan,
        GradeId: GradeId,
        LocationId: LocationId,
        GroupAccountId: GroupAccountId,
        Gender: Gender,
        EmpStatus: EmpStatus,
        Role: RoleId,
        DeliveryStatus: DeliveryStatus,
        Promotion: Promotion
    };

    $('#HRBPAdminNormalizationMaleFemaletbl tbody tr:gt(2)').remove();

    var svrPath = CONFIG.get('SERVERNAME');

    var apiPath = svrPath + "RatingAdmin/GetMaleFemaleNormalization";

    //    var apiPath = svrPath + "RatingAdmin/GetMaleFemaleNormalization?EMPID=" + empId + "&AppraisalCycleId=" + 9 + "&GDLList=" + GDLHeadSpan + "&DPList=" + DPSpan + "&RMList=" + RMSpan + "&GradeId=" + GradeId + "&LocationId=" + LocationId + "&GroupAccountId=" + GroupAccountId + "&Gender=" + Gender + "&EmpStatus=" + EmpStatus + "&Role=" + RoleId;

    CommonAjaxPostForNormalization(apiPath, empData, headerInfo).done(function (ratingNormData) {

        if (ratingNormData.Success == true) {

            let Arr = ratingNormData;

            let outputArray = [];

            // Count variable is used to add the
            // new unique value only once in the
            // outputArray.
            let count = 0;

            // Start variable is used to set true
            // if a repeated duplicate value is
            // encontered in the output array.
            let start = false;

            for (let j = 0; j < Arr.Result.length; j++) {
                for (let k = 0; k < outputArray.length; k++) {
                    if (Arr.Result[j].Grade == outputArray[k]) {
                        start = true;
                    }
                }
                count++;
                if (count == 1 && start == false) {
                    outputArray.push(Arr.Result[j].Grade);
                }
                start = false;
                count = 0;
            }

            //  console.log(outputArray);
            //ratingNormData.Result.forEach(function (d, index) {


            var Male_Total = 0;
            var Male_TotalEE1 = 0;
            var Male_TotalEE = 0;
            var Male_TotalME = 0;
            var Male_TotalBE = 0;

            var Female_Total = 0;
            var Female_TotalEE1 = 0;
            var Female_TotalEE = 0;
            var Female_TotalME = 0;
            var Female_TotalBE = 0;


            for (let j = 0; j < outputArray.length; j++) {


                var GradeWiseMaleCount = 0;
                var GradeWiseFemaleCount = 0;
                var EE1Male = 0;
                var EEMale = 0;
                var MEMale = 0;
                var BEMale = 0;
                var EE1FeMale = 0;
                var EEFeMale = 0;
                var MEFeMale = 0;
                var BEFeMale = 0;

                for (let k = 0; k < Arr.Result.length; k++) {

                    if (outputArray[j] == Arr.Result[k].Grade) {
                        GradeWiseMaleCount += Arr.Result[k].MaleCurrentCount;
                        GradeWiseFemaleCount += Arr.Result[k].FemaleCurrentCount;


                        if (Arr.Result[k].Rating == 'BE') {
                            BEMale = Arr.Result[k].MaleCurrentCount
                            BEFeMale = Arr.Result[k].FemaleCurrentCount;
                        }
                        if (Arr.Result[k].Rating == 'ME') {
                            MEMale = Arr.Result[k].MaleCurrentCount
                            MEFeMale = Arr.Result[k].FemaleCurrentCount;
                        }
                        if (Arr.Result[k].Rating == 'EE') {
                            EEMale = Arr.Result[k].MaleCurrentCount
                            EEFeMale = Arr.Result[k].FemaleCurrentCount;
                        }
                        if (Arr.Result[k].Rating == 'EE1') {
                            EE1Male = Arr.Result[k].MaleCurrentCount
                            EE1FeMale = Arr.Result[k].FemaleCurrentCount;
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
                cols += '<td style="text-align: center;">' + 0 + '</td>';
                cols += '<td style="text-align: center;">' + 0 + '</td>';
                cols += '<td style="text-align: center;">' + 0 + '</td>';
                cols += '<td style="text-align: center;">' + 0 + '</td>';
                cols += '<td style="text-align: center;">' + 0 + '</td>';

                newRow.append(cols);
                $("#HRBPAdminNormalizationMaleFemaletbl").append(newRow);
            }


            var newRow2 = $("<tr>");
            var cols2 = "";
            cols2 += '<td  style="text-align: center;">Total</td>';

            cols2 += '<td  style="text-align: center;">' + Male_Total + '</td>';
            cols2 += '<td  style="text-align: center;">' + Male_TotalEE1 + '</td>';
            cols2 += '<td  style="text-align: center;">' + Male_TotalEE + '</td>';
            cols2 += '<td  style="text-align: center;">' + Male_TotalME + '</td>';
            cols2 += '<td  style="text-align: center;">' + Male_TotalBE + '</td>';

            cols2 += '<td  style="text-align: center;">' + Female_Total + '</td>';
            cols2 += '<td  style="text-align: center;">' + Female_TotalEE1 + '</td>';
            cols2 += '<td  style="text-align: center;">' + Female_TotalEE + '</td>';
            cols2 += '<td  style="text-align: center;">' + Female_TotalME + '</td>';
            cols2 += '<td  style="text-align: center;">' + Female_TotalBE + '</td>';

            cols2 += '<td  style="text-align: center;">' + 0 + '</td>';
            cols2 += '<td  style="text-align: center;">' + 0 + '</td>';
            cols2 += '<td  style="text-align: center;">' + 0 + '</td>';
            cols2 += '<td  style="text-align: center;">' + 0 + '</td>';
            cols2 += '<td  style="text-align: center;">' + 0 + '</td>';

            newRow2.append(cols2);
            $("#HRBPAdminNormalizationMaleFemaletbl").append(newRow2);
            //outputArray.Result.forEach(function (a, index) {


            //    ratingNormData.Result.forEach(function (b, index) {

            //        var newRow = $("<tr>");
            //        var cols = "";
            //        cols += '<td><b>Expected Count (EC)</b></td>';

            //        newRow.append(cols);
            //        $("#NormalizationMaleFemaletbl").append(newRow);

            //    })
            //});


            //})
        }
    });
}

function BindHRBPAdminNormalizationOverallData() {

    var empId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    var RoleId = SelectionAccessType;


    var GDLHeadSpan = $('#ddlGDLDept_headNorm').val().toString();

    var DPSpan = $('#ddlDPSpan_headNorm').val().toString();
    var RMSpan = $('#ddlRMSpan_headNorm').val().toString();

    var GradeId = $("#ddlgrade_HRBPAdminNorm").val().toString();
    var LocationId = $("#ddllocation_HRBPAdminNorm").val().toString();
    var GroupAccountId = $("#ddlgroupaccount_HRBPAdminNorm").val().toString();
    var Gender = $("#ddlgender_HRBPAdminNorm").val().toString();
    var EmpStatus = $("#ddlEmployeeStatus_HRBPAdminNorm").val().toString();
    var DeliveryStatus = $("#ddlDeliveryStatus_Norm").val().toString();
    var Promotion = $("#ddlPromotion_PNorm").val().toString();



    if (GDLHeadSpan == "") {
        GDLHeadSpan = 0;
    }

    if (DPSpan == "") {
        DPSpan = 0;
    }
    if (RMSpan == "") {
        RMSpan = 0;
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
    if (DeliveryStatus == "") {
        DeliveryStatus = 0;
    }

    if (Promotion == "") {
        Promotion = 0;
    }


    var RoleId = SelectionAccessType;
    empData = {
        AppraisalCycleId: getRatingPagesAppraisalCycleId(), // current AppraisalCycleId
        LoginEmployeeId: sessionStorage.EmployeeId, // ReferBack By
        GDLHeadSpan: GDLHeadSpan,  //PEPEmployeeId
        DPSpan: DPSpan,  // Rating Given By.
        RMSpan: RMSpan,
        GradeId: GradeId,
        LocationId: LocationId,
        GroupAccountId: GroupAccountId,
        Gender: Gender,
        EmpStatus: EmpStatus,
        Role: RoleId,
        DeliveryStatus: DeliveryStatus,
        Promotion: Promotion
    };
    $('#HRBPAdminNormalizationtbl tbody tr:gt(1)').remove();
    var svrPath = CONFIG.get('SERVERNAME');

    var apiPath = svrPath + "RatingAdmin/GetRatingOverallData";

    //    var apiPath = svrPath + "RatingAdmin/GetRatingOverallData?EMPID=" + empId + "&AppraisalCycleId=" + 9 + "&GDLList=" + GDLHeadSpan + "&DPList=" + DPSpan + "&RMList=" + RMSpan + "&GradeId=" + GradeId + "&LocationId=" + LocationId + "&GroupAccountId=" + GroupAccountId + "&Gender=" + Gender + "&EmpStatus=" + EmpStatus + "&Role=" + RoleId;



    CommonAjaxPostForNormalization(apiPath, empData, headerInfo).done(function (ratingOverallData) {


        if (ratingOverallData.Success == true) {
            let Arr = ratingOverallData;
            rawDataOverallNorm = ratingOverallData;

            BindGradeNorm()

            let outputArray = [];

            let count = 0;

            let start = false

            for (let j = 0; j < Arr.Result.length; j++) {
                for (let k = 0; k < outputArray.length; k++) {
                    if (Arr.Result[j].GRADE == outputArray[k]) {
                        start = true;
                    }
                }
                count++;
                if (count == 1 && start == false) {
                    outputArray.push(Arr.Result[j].GRADE);
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

                var TotalEachPer = 0;
                var TotalPer = 0;



                for (let k = 0; k < Arr.Result.length; k++) {

                    if (outputArray[j] == Arr.Result[k].GRADE) {

                        if (TotalCount == 0) {
                            TotalCount += Arr.Result[k].TotalCount;
                        }
                        if (Arr.Result[k].Rating == 'ME') {
                            ME_CurrentCount += Arr.Result[k].CurrentCount;
                            //if (TotalCount == 0) {
                            //    TotalCount += Arr.Result[k].TotalCount;
                            //}

                        }
                        if (Arr.Result[k].Rating == 'EE') {

                            EE_CurrentCount += Arr.Result[k].CurrentCount;
                            //if (TotalCount == 0) {
                            //    TotalCount += Arr.Result[k].TotalCount;
                            //}

                        }
                        if (Arr.Result[k].Rating == 'EE1') {
                            EE1_CurrentCount += Arr.Result[k].CurrentCount;
                            //if (TotalCount == 0) {
                            //    TotalCount += Arr.Result[k].TotalCount;
                            //}


                        }
                        if (Arr.Result[k].Rating == 'BE') {

                            BE_CurrentCount += Arr.Result[k].CurrentCount;
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



                        // TotalCount = (EE1_TotalCount + EE_TotalCount + ME_TotalCount + BE_TotalCount)
                        CurrentCount = (EE1_CurrentCount + EE_CurrentCount + ME_CurrentCount + BE_CurrentCount);
                        t5 = TotalCount - CurrentCount;

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
                cols += '<td style="text-align: center;">' + TotalEachPer + '</td>';



                newRow1.append(cols);
                $("#HRBPAdminNormalizationtbl").append(newRow1);

            }

            PerTotalEE1 = ((RatingGivenTotalEE1 / TotalCountGrade) * 100).toFixed(2).replace(".00", "");
            PerTotalEE = ((RatingGivenTotalEE / TotalCountGrade) * 100).toFixed(2).replace(".00", "");
            PerTotalME = ((RatingGivenTotalME / TotalCountGrade) * 100).toFixed(2).replace(".00", "");
            PerTotalBE = ((RatingGivenTotalBE / TotalCountGrade) * 100).toFixed(2).replace(".00", "");

            TotalPer = ((OverallGiven / TotalCountGrade) * 100);


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
            cols2 += '<td style="text-align: center;"><b>' + TotalPer.toFixed(2).replace(".00", "");; + '<b/></td>';


            newRow2.append(cols2);
            $("#HRBPAdminNormalizationtbl").append(newRow2);

            //  MyReporteeBellCurve();
        }
    });
}

function HRBPAdmin_RatingGivenNotGivenDetails() {
    var total = 0;
    var empId = sessionStorage.EmployeeId;
    var svrPath = CONFIG.get('SERVERNAME');


    var GDLHeadSpan = $("#ddlGDLDept_head").val().toString();
    var DPSpan = $("#ddlDPSpan_head").val().toString();
    var RMSpan = $("#ddlRMSpan_head").val().toString();
    var GradeId = $("#ddlgrade_GDLDept_head").val().toString();
    var LocationId = $("#ddllocation_GDLDept_head").val().toString();
    var GroupAccountId = $("#ddlgroupaccount_GDLDept_head").val().toString();
    var Gender = $("#ddlEmployeeStatus_HRBPAdminNorm").val().toString();
    var EmpStatus = $("#ddlEmployeeStatus_HRBPAdminNorm").val().toString();
    var DeliveryStatus = $("#ddlDeliveryStatus_Norm").val().toString();
    var Promotion = $("#ddlPromotion_PNorm").val().toString();

    if (GDLHeadSpan == "") {
        GDLHeadSpan = 0;
    }
    if (RMSpan == "") {
        RMSpan = 0;
    }
    if (DPSpan == "") {
        DPSpan = 0;
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
    if (DeliveryStatus == "") {
        DeliveryStatus = 0;
    }
    if (Promotion == "") {
        Promotion = 0;
    }

    var RoleId = SelectionAccessType;

    var RoleId = SelectionAccessType;
    empData = {
        AppraisalCycleId: getRatingPagesAppraisalCycleId(), // current AppraisalCycleId
        LoginEmployeeId: sessionStorage.EmployeeId, // ReferBack By
        GDLHeadSpan: GDLHeadSpan,  //PEPEmployeeId
        DPSpan: DPSpan,  // Rating Given By.
        RMSpan: RMSpan,
        GradeId: GradeId,
        LocationId: LocationId,
        GroupAccountId: GroupAccountId,
        Gender: Gender,
        EmpStatus: EmpStatus,
        Role: RoleId,
        DeliveryStatus: DeliveryStatus,
        Promotion: Promotion
    };

    var apiPath = svrPath + "RatingAdmin/GetDataForChart";

    //var apiPath = svrPath + "RatingAdmin/GetDataForChart?EMPID=" + empId + "&AppraisalCycleId=" + getRatingPagesAppraisalCycleId() + "&GDLList=" + GDLHeadSpan + "&DPList=" + DPSpan + "&RMList=" + RMSpan + "&GradeId=" + GradeId + "&LocationId=" + LocationId + "&GroupAccountId=" + GroupAccountId + "&Gender=" + Gender + "&EmpStatus=" + EmpStatus + "&Role=" + RoleId;

    $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'POST',
        url: apiPath,
        headers: CommonGetHeaderInfo(),
        data: JSON.stringify(empData),
        async: true,
        success: function (data) {
            $(".loader-div").hide();
            //setting  data from result to variables

            if (data.Result.length > 0) {
                BE = data.Result[0].BE;
                ME = data.Result[0].ME;
                EE = data.Result[0].EE;
                EE1 = data.Result[0].EE1;

                MBE = data.Result[1].BE;
                MME = data.Result[1].ME;
                MEE = data.Result[1].EE;
                MEE1 = data.Result[1].EE1;

                FBE = data.Result[2].BE;
                FME = data.Result[2].ME;
                FEE = data.Result[2].EE;
                FEE1 = data.Result[2].EE1;

                //OBE = data.Result[3].BE;
                //OME = data.Result[3].ME;
                //OEE = data.Result[3].EE;
                //OEE1 = data.Result[3].EE1;

                notgiven = data.Result[3].EE;

                $('#filtersDiv').css('display', 'block');
                $('#EEspan').text(EE);
                $('#MEspan').text(ME);
                $('#BEspan').text(BE);
                $('#EE1span').text(EE1);
                // $('#Notspan').text(notgiven);
                total = EE + ME + BE + EE1;
                // $('#Totalspan').text(total);


                $('#NotGiven').text(notgiven);
                total = EE + ME + BE + EE1;
                $('#Given').text(total);


            }
        },
        error: function (response) {
            $(".loader-div").hide();
            alert(1);
        }
    });

    //var totalEmp = total + notgiven;
    //var idealData = [(totalEmp * 0.05).toFixed(2), (totalEmp * 0.25).toFixed(2), (totalEmp * 0.6).toFixed(2), (totalEmp * 0.1).toFixed(2)];
    //// console.log(idealData);
    //Highcharts.chart("chart_divHRBPAdmin", {

    //    legend: {
    //        align: 'left',
    //        verticalAlign: 'top',
    //        x: 110,
    //        y: 90,
    //        floating: false,
    //        borderWidth: 1,
    //        backgroundColor:
    //            Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF'
    //    },
    //    credits: {
    //        enabled: false
    //    },
    //    tooltip: {
    //        shared: true
    //    },
    //    title: {
    //        text: "Given Ratings"
    //    },
    //    xAxis: {
    //        categories: [
    //             "EE(5%)",
    //             "EE(25%)",
    //            "ME(60%)",
    //            "BE(10%)"
    //        ]
    //    },
    //    yAxis: {
    //        title: {
    //            text: "No of Employees"
    //        }
    //    },

    //    responsive: {
    //        rules: [
    //            {
    //                condition: {
    //                    maxWidth: 500,
    //                    callback() {
    //                        return true;
    //                    }
    //                }
    //            }
    //        ]
    //    },

    //    plotOptions: {
    //        spline: {
    //            dataLabels: {
    //                enabled: true
    //            },

    //            marker: {
    //                enabled: true,
    //                symbol: "circle",
    //                radius: 5,
    //                states: {
    //                    hover: {
    //                        enabled: true
    //                    }
    //                }
    //            }
    //        },

    //    },
    //    series: [
    //        {
    //            type: "spline",
    //            name: "Ideal No. of Employees",
    //            data: [parseFloat(idealData[0]), parseFloat(idealData[1]), parseFloat(idealData[2]), parseFloat(idealData[3])],
    //        },
    //        {
    //            type: "spline",
    //            name: "Rating Given No. of Employees",
    //            data: [EE1, EE, ME, BE],
    //        },

    //        {
    //            type: "column",
    //            name: "Male Count",
    //            data: [MEE1, MEE, MME, MBE],

    //        },
    //        {
    //            type: "column",
    //            name: "Female Count",
    //            data: [FEE1, FEE, FME, FBE],

    //        },
    //          {

    //              type: "column",

    //              name: "Others Count",

    //              data: [0, 0, 0, 0],

    //          }
    //    ]
    //});


}



function NormHRBPAdminBellCurve() {
    var totalgiven = 0;
    var empId = sessionStorage.EmployeeId;
    var svrPath = CONFIG.get('SERVERNAME');



    var GDLHeadSpan = $('#ddlGDLDept_headNorm').val().toString();

    var DPSpan = $('#ddlDPSpan_headNorm').val().toString();
    var RMSpan = $('#ddlRMSpan_headNorm').val().toString();

    var GradeId = $("#ddlgrade_HRBPAdminNorm").val().toString();
    var LocationId = $("#ddllocation_HRBPAdminNorm").val().toString();
    var GroupAccountId = $("#ddlgroupaccount_HRBPAdminNorm").val().toString();
    var Gender = $("#ddlgender_HRBPAdminNorm").val().toString();
    var EmpStatus = $("#ddlEmployeeStatus_HRBPAdminNorm").val().toString();
    var DeliveryStatus = $("#ddlDeliveryStatus_Norm").val().toString();
    var Promotion = $("#ddlPromotion_PNorm").val().toString();


    if (GDLHeadSpan == "") {
        GDLHeadSpan = 0;
    }

    if (DPSpan == "") {
        DPSpan = 0;
    }
    if (RMSpan == "") {
        RMSpan = 0;
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
    if (DeliveryStatus == "") {
        DeliveryStatus = 0;
    }

    if (Promotion == "") {
        Promotion = 0;
    }

    var RoleId = SelectionAccessType;


    var RoleId = SelectionAccessType;
    empData = {
        AppraisalCycleId: getRatingPagesAppraisalCycleId(), // current AppraisalCycleId
        LoginEmployeeId: sessionStorage.EmployeeId, // ReferBack By
        GDLHeadSpan: GDLHeadSpan,  //PEPEmployeeId
        DPSpan: DPSpan,  // Rating Given By.
        RMSpan: RMSpan,
        GradeId: GradeId,
        LocationId: LocationId,
        GroupAccountId: GroupAccountId,
        Gender: Gender,
        EmpStatus: EmpStatus,
        Role: RoleId,
        DeliveryStatus: DeliveryStatus,
        Promotion: Promotion
    };

    var apiPath = svrPath + "RatingAdmin/GetDataForChart"

    //var apiPath = svrPath + "RatingAdmin/GetDataForChart?EMPID=" + empId + "&AppraisalCycleId=" + 9 + "&GDLList=" + GDLHeadSpan + "&DPList=" + DPSpan + "&RMList=" + RMSpan + "&GradeId=" + GradeId + "&LocationId=" + LocationId + "&GroupAccountId=" + GroupAccountId + "&Gender=" + Gender + "&EmpStatus=" + EmpStatus + "&Role=" + RoleId;

    $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'POST',
        data: JSON.stringify(empData),
        headers: CommonGetHeaderInfo(),
        url: apiPath,
        async: false,

        success: function (data) {
            $(".loader-div").hide();
            //setting  data from result to variables

            if (data && data.Result && data.Result.length > 0) {
                STab_BE = data.Result[0].BE;
                STab_ME = data.Result[0].ME;
                STab_EE = data.Result[0].EE;
                STab_EE1 = data.Result[0].EE1;

                STab_MBE = data.Result[1].BE;
                STab_MME = data.Result[1].ME;
                STab_MEE = data.Result[1].EE;
                STab_MEE1 = data.Result[1].EE1;

                STab_FBE = data.Result[2].BE;
                STab_FME = data.Result[2].ME;
                STab_FEE = data.Result[2].EE;
                STab_FEE1 = data.Result[2].EE1;

                if (data.Result.length > 3) {
                    notgiven = data.Result[3].EE;
                } else {
                    notgiven = 0;
                }


                STab_OBE = 0;
                STab_OME = 0;
                STab_OEE = 0;
                STab_OEE1 = 0;

                $('#filtersDiv').css('display', 'block');
                //$('#EEspan').text(EE);
                //$('#MEspan').text(ME);
                //$('#BEspan').text(BE);
                //$('#EE1span').text(EE1);

                $('#NotGiven').text(notgiven);
                totalgiven = STab_EE + STab_ME + STab_BE + STab_EE1;
                $('#Given').text(totalgiven);

                TotalSpan = totalgiven + notgiven;

            }
        },
        error: function (response) {
            $(".loader-div").hide();
            alert(2);
        }
    });
    var totalEmp = TotalSpan;
    var idealData = [(totalEmp * 0.05).toFixed(2), (totalEmp * 0.25).toFixed(2), (totalEmp * 0.6).toFixed(2), (totalEmp * 0.1).toFixed(2)];
    //  console.log(idealData);
    Highcharts.chart("chart_divHRBPAdmin", {

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
            text: "Given Ratings"
        },
        xAxis: {
            categories: [
                "EE(5%)",
                "EE(25%)",
                "ME(60%)",
                "BE(10%)"
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
                data: [STab_EE1, STab_EE, STab_ME, STab_BE],
            },

            {
                type: "column",
                name: "Male Count",
                data: [STab_MEE1, STab_MEE, STab_MME, STab_MBE],

            },
            {
                type: "column",
                name: "Female Count",
                data: [STab_FEE1, STab_FEE, STab_FME, STab_FBE],

            },
            {

                type: "column",

                name: "Others Count",

                data: [0, 0, 0, 0],

            }
        ]
    });


}

function BindGroupAccount() {

    var arr = [];


    rawData.forEach(function (value, index) {
        //   console.log(value.AccountGroupID)
        if (arr.length >= 1) {
            var findindex = arr.findIndex(function (el) {
                return el.id == value.AccountGroupId;
            })
            if (findindex == -1) {
                arr.push({ id: value.AccountGroupId, value: value.AccountGroup })
            }
        } else {

            arr.push({ id: value.AccountGroupId, value: value.AccountGroup })
        }

    })


    sortedAccountKeys = Object.values(arr).sort();
    // console.log(sortedAccountKeys)


    $('#ddlgroupaccount_GDLDept_head').empty();
    $('#ddlgroupaccount_GDLDept_head').multiselect('destroy');

    for (let t = 0; t < sortedAccountKeys.length; t++) {

        $('#ddlgroupaccount_GDLDept_head').append($("<option>").val(sortedAccountKeys[t].id).text(sortedAccountKeys[t].value));

    }

    $('#ddlgroupaccount_GDLDept_head').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgroupaccount_GDLDept_head').multiselect('refresh');

}

function BindEmployeeStatus() {

    var dictEmpStatus = {};
    var sortedEmpStatuseKeys = [];
    $.each(rawData, function (index, data) {
        if (dictEmpStatus[data.EmployeeStatus] == undefined) {

            if (data.EmployeeStatus == 'A') {
                dictEmpStatus["Active"] = data.EmployeeStatus;
            } else if (data.EmployeeStatus == 'R') {
                dictEmpStatus["Resigned"] = data.EmployeeStatus;
            } else {
                dictEmpStatus["Exited"] = data.EmployeeStatus;
            }
        }
    }
    );

    sortedEmpStatuseKeys = Object.keys(dictEmpStatus).sort();

    $('#ddlEmployeeStatus_HRBP').empty();

    for (let t = 0; t < sortedEmpStatuseKeys.length; t++) {
        $('#ddlEmployeeStatus_HRBP').append($("<option>").val(dictEmpStatus[sortedEmpStatuseKeys[t]]).text(sortedEmpStatuseKeys[t]));

    }

    $('#ddlEmployeeStatus_HRBP').multiselect('destroy');

    $('#ddlEmployeeStatus_HRBP').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlEmployeeStatus_HRBP').multiselect('refresh');

    //////////////////////////////////////////////////////////////////////////////////

    $('#ddlEmployeeStatus_HRBPAdminNorm').empty();

    for (let t = 0; t < sortedEmpStatuseKeys.length; t++) {
        $('#ddlEmployeeStatus_HRBPAdminNorm').append($("<option>").val(dictEmpStatus[sortedEmpStatuseKeys[t]]).text(sortedEmpStatuseKeys[t]));

    }

    $('#ddlEmployeeStatus_HRBPAdminNorm').multiselect('destroy');

    $('#ddlEmployeeStatus_HRBPAdminNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlEmployeeStatus_HRBPAdminNorm').multiselect('refresh');
    ///////////////////////////////////////////////////////////////

    $('#ddlEmployeeStatus_HRBPAdminPromo').empty();

    for (let t = 0; t < sortedEmpStatuseKeys.length; t++) {
        $('#ddlEmployeeStatus_HRBPAdminPromo').append($("<option>").val(dictEmpStatus[sortedEmpStatuseKeys[t]]).text(sortedEmpStatuseKeys[t]));

    }

    $('#ddlEmployeeStatus_HRBPAdminPromo').multiselect('destroy');

    $('#ddlEmployeeStatus_HRBPAdminPromo').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlEmployeeStatus_HRBPAdminPromo').multiselect('refresh');
}


function BindEmployeeStatusApproverScreen() {

    var dictEmpStatus = {};
    var sortedEmpStatuseKeys = [];
    $.each(rawData, function (index, data) {
        if (dictEmpStatus[data.EmployeeStatus] == undefined) {

            if (data.EmployeeStatus == 'A') {
                dictEmpStatus["Active"] = data.EmployeeStatus;
            } else if (data.EmployeeStatus == 'R') {
                dictEmpStatus["Resigned"] = data.EmployeeStatus;
            } else {
                dictEmpStatus["Exited"] = data.EmployeeStatus;
            }
        }
    }
    );

    sortedEmpStatuseKeys = Object.keys(dictEmpStatus).sort();

    $('#ddlEmployeeStatus_HRBP').empty();

    for (let t = 0; t < sortedEmpStatuseKeys.length; t++) {
        $('#ddlEmployeeStatus_HRBP').append($("<option>").val(dictEmpStatus[sortedEmpStatuseKeys[t]]).text(sortedEmpStatuseKeys[t]));

    }

    $('#ddlEmployeeStatus_HRBP').multiselect('destroy');

    $('#ddlEmployeeStatus_HRBP').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlEmployeeStatus_HRBP').multiselect('refresh');


}

function BindCriticalityPriority_HRBP(onlyIfEmpty) {
    var $ddl = $('#ddlCriticalityPriority_HRBP');
    if (!$ddl.length) return;
    if (onlyIfEmpty === true && $ddl.find('option').length > 0) return;
    var savedSelection = $ddl.val();
    if (savedSelection && !Array.isArray(savedSelection)) savedSelection = [savedSelection];
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "/Rating/GetCriticalityPriorityForDropdown";
    CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (criticalityPriorityData) {
        var dataArray = null;
        if (criticalityPriorityData && criticalityPriorityData.Success === true && criticalityPriorityData.Result) {
            dataArray = criticalityPriorityData.Result.data || (Array.isArray(criticalityPriorityData.Result) ? criticalityPriorityData.Result : null);
        }
        if (!dataArray || dataArray.length === 0) return;
        var dictCriticalityPriority = {};
        var sortedCriticalityPriorityKeys = [];
        $.each(dataArray, function (index, data) {
            var displayText = (data.DisplayText != null && data.DisplayText !== undefined) ? data.DisplayText : (data.DisplayText || data.Text || data.Name || String(data.Id));
            if (dictCriticalityPriority[displayText] === undefined) {
                dictCriticalityPriority[displayText] = data.Id;
            }
        });
        sortedCriticalityPriorityKeys = Object.keys(dictCriticalityPriority).sort();
        $ddl.empty();
        for (var t = 0; t < sortedCriticalityPriorityKeys.length; t++) {
            var val = dictCriticalityPriority[sortedCriticalityPriorityKeys[t]];
            var text = sortedCriticalityPriorityKeys[t];
            $ddl.append($("<option>").val(val).text(text));
        }
        $ddl.multiselect('destroy');
        $ddl.multiselect({
            includeSelectAllOption: true,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true,
            maxHeight: 150
        });
        if (savedSelection && savedSelection.length > 0) {
            $ddl.val(savedSelection);
            $ddl.multiselect('select', savedSelection);
        }
        $ddl.multiselect('refresh');
    });
}

function BindGrade() {

    var arr = [];

    rawData.forEach(function (value, index) {
        // console.log(value.GradeID)
        if (arr.length >= 1) {
            var findindex = arr.findIndex(function (el) {
                return el.id == value.GradeID;
            })
            if (findindex == -1) {
                arr.push({ id: value.GradeID, value: value.GradeName })
            }
        } else {

            arr.push({ id: value.GradeID, value: value.GradeName })
        }

    })

    sortedAccountKeys = Object.values(arr).sort();
    //  console.log(sortedAccountKeys)


    $('#ddlgrade_GDLDept_head').empty();
    $('#ddlgrade_GDLDept_head').multiselect('destroy');

    for (let t = 0; t < sortedAccountKeys.length; t++) {

        $('#ddlgrade_GDLDept_head').append($("<option>").val(sortedAccountKeys[t].id).text(sortedAccountKeys[t].value));

    }

    $('#ddlgrade_GDLDept_head').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150,
        nonSelectedText: 'None selected'
    });

    $('#ddlgrade_GDLDept_head').multiselect('refresh');


}

function BindGroupAccountNorm() {
    var arr = [];

    rawData.forEach(function (value, index) {
        // console.log(value.AccountGroupID)
        if (arr.length >= 1) {
            var findindex = arr.findIndex(function (el) {
                return el.id == value.AccountGroupId;
            })
            if (findindex == -1) {
                arr.push({ id: value.AccountGroupId, value: value.AccountGroup })
            }
        } else {

            arr.push({ id: value.AccountGroupId, value: value.AccountGroup })
        }

    })

    sortedAccountKeys = Object.values(arr).sort();
    // console.log(sortedAccountKeys)


    $('#ddlgroupaccount_HRBPAdminNorm').empty();
    $('#ddlgroupaccount_HRBPAdminNorm').multiselect('destroy');

    for (let t = 0; t < sortedAccountKeys.length; t++) {

        $('#ddlgroupaccount_HRBPAdminNorm').append($("<option>").val(sortedAccountKeys[t].id).text(sortedAccountKeys[t].value));

    }

    $('#ddlgroupaccount_HRBPAdminNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgroupaccount_HRBPAdminNorm').multiselect('refresh');


    //var LoginEmployeeId = sessionStorage.EmployeeId;
    //var svrPath = CONFIG.get('SERVERNAME');
    //var apiPath = svrPath + 'Rating/GetAccountList';
    //var ddlgroupaccount = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    //$('#ddlgroupaccount_HRBPAdminNorm').empty();

    //$.each(ddlgroupaccount.responseJSON.Result, function (index, data) {
    //    $('#ddlgroupaccount_HRBPAdminNorm').append($("<option>").val(data.GROUPID).text(data.GROUPNAME));

    //});


    //$('#ddlgroupaccount_HRBPAdminNorm').multiselect('destroy');

    //$('#ddlgroupaccount_HRBPAdminNorm').multiselect({
    //    includeSelectAllOption: true,
    //    enableFiltering: true,
    //    enableCaseInsensitiveFiltering: true,
    //    maxHeight: 150
    //});

    //$('#ddlgroupaccount_HRBPAdminNorm').multiselect('refresh');


}

//function BindGradeNorm() {
//    $.each(rawData, function (index, data) {
//        if (dictGrade[data.GRADE] == undefined) {
//            dictGrade[data.GRADE] = data.GradeId;
//        }
//    }
//    );

//    sortedGradeKeys = Object.keys(dictGrade).sort();

//    $('#ddlgradeHRBPAdminPromo').empty();

//    for (let t = 0; t < sortedGradeKeys.length; t++) {
//        if (sortedGradeKeys[t] != 'C') {
//            $('#ddlgradeHRBPAdminPromo').append($("<option>").val(dictGrade[sortedGradeKeys[t]]).text(sortedGradeKeys[t]));
//        }
//    }
//    $('#ddlgradeHRBPAdminPromo').multiselect({
//        includeSelectAllOption: true,
//        enableFiltering: true,
//        enableCaseInsensitiveFiltering: true,
//        maxHeight: 150
//    });

//}


function BindGroupAccountPromo() {

    var LoginEmployeeId = sessionStorage.EmployeeId;
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'Rating/GetAccountList';
    var ddlgroupaccount = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    $('#ddlgroupaccount_HRBPAdminPromo').empty();

    $.each(ddlgroupaccount.responseJSON.Result, function (index, data) {
        $('#ddlgroupaccount_HRBPAdminPromo').append($("<option>").val(data.GROUPID).text(data.GROUPNAME));

    });

    $('#ddlgroupaccount_HRBPAdminPromo').multiselect('destroy');

    $('#ddlgroupaccount_HRBPAdminPromo').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgroupaccount_HRBPAdminPromo').multiselect('refresh');


}

function BindGradeNorm() {

    var arr = [];

    rawDataOverallNorm.Result.forEach(function (value, index) {

        if (arr.length >= 1) {
            var findindex = arr.findIndex(function (el) {
                return el.id == value.GradeId;
            })
            if (findindex == -1) {
                arr.push({ id: value.GradeId, value: value.GRADE })
            }
        } else {

            arr.push({ id: value.GradeId, value: value.GRADE })
        }

    })

    sortedGradeKeys = Object.values(arr).sort();
    //console.log(sortedGradeKeys)


    $('#ddlgrade_HRBPAdminNorm').empty();
    $('#ddlgrade_HRBPAdminNorm').multiselect('destroy');

    for (let t = 0; t < sortedGradeKeys.length; t++) {

        $('#ddlgrade_HRBPAdminNorm').append($("<option>").val(sortedGradeKeys[t].id).text(sortedGradeKeys[t].value));

    }

    $('#ddlgrade_HRBPAdminNorm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlgrade_HRBPAdminNorm').multiselect('refresh');

    //$.each(rawDataOverallNorm, function (index, data) {
    //    if (dictGrade[data.GRADE] == undefined) {
    //        dictGrade[data.GRADE] = data.GradeId;
    //    }
    //}
    //);

    //sortedGradeKeys = Object.keys(dictGrade).sort();

    //$('#ddlgrade_HRBPAdminNorm').empty();

    //for (let t = 0; t < sortedGradeKeys.length; t++) {
    //    $('#ddlgrade_HRBPAdminNorm').append($("<option>").val(dictGrade[sortedGradeKeys[t]]).text(sortedGradeKeys[t]));

    //}


    //$('#ddlgrade_HRBPAdminNorm').multiselect('destroy');

    //$('#ddlgrade_HRBPAdminNorm').multiselect({
    //    includeSelectAllOption: true,
    //    enableFiltering: true,
    //    enableCaseInsensitiveFiltering: true,
    //    maxHeight: 150
    //});

    //$('#ddlgrade_HRBPAdminNorm').multiselect('refresh');
}

// ==================================================================================
// Shared Column Definitions and Common Binding Function for RatingAdmin DataTable
// ==================================================================================

/**
 * Common function to bind/initialize tblHRBPAdminView DataTable
 * This ensures consistent initialization across all places
 * @param {Array} tableData - The data array to bind to the table
 * @param {boolean} initializeColumnVisibility - Whether to initialize column visibility dropdown (default: false, just apply visibility)
 */
function BindHRBPAdminTable(tableData) {
    // Ensure tableData is an array
    if (!Array.isArray(tableData)) {
        tableData = [];
    }
    
    // Destroy existing table if it exists
    var $table = $("#tblHRBPAdminView");
    if ($.fn.DataTable.isDataTable($table)) {
        $table.DataTable().destroy();
    }
    
    // Clear tbody but keep thead structure
    $table.find('tbody').empty();
    
    // Initialize DataTable with shared column definitions
    window.tblHRBPAdminView = $table.DataTable({
        "dom": 'lBfrtip',
        buttons: [
            {
                extend: 'excelHtml5',
                text: 'Export to Excel',
                title: 'Employees Rating and Promotion Details',
                orientation: 'landscape',
                exportOptions: {
                    format: {
                        body: function (data, row, column, node) {
                            // Convert string to jQuery object to extract selected option
                            const $html = $('<div>').html(data);
                            const $select = $html.find('select');
                            
                            if ($select.length > 0) {
                                // Extract selected text only
                                return $select.find('option:selected').text().trim();
                            }
                            
                            // Fallback to text stripping HTML if not a select dropdown
                            return $html.text().trim();
                        }
                    }
                }
            }
        ],
        data: tableData,
        "sPaginationType": "full_numbers",
        "iDisplayLength": RecordsCountPerPage,
        "bLengthChange": true,
        "bDestroy": true,
        "searching": true,
        "paging": true,
        "ordering": true,
        info: true,
        "columnDefs": [
            { "orderData": [], "targets": 0 },
            { "orderable": false, "targets": 0 }
        ],
        aoColumns: GetHRBPAdminColumnDefinitions(),
        "deferRender": true,
        initComplete: function (settings, json) {
            // Table is fully initialized, apply column visibility
            // Use a small delay to ensure table is fully rendered
            setTimeout(function() {
                // Check if column visibility dropdown is already initialized
                var $dropdown = $('#ddlColumnVisibilityAdmin');
                if ($dropdown.length > 0 && $dropdown.find('option').length > 0) {
                    // Dropdown is initialized, just apply visibility
                    UpdateTableColumnVisibilityAdmin();
                } else {
                    // Dropdown not initialized yet, initialize it (which will also apply visibility)
                    InitializeColumnVisibilityDropdownAdmin();
                }
            }, 150);
        }
    });
    
    return window.tblHRBPAdminView;
}

/**
 * Get standard 26 column definitions for tblHRBPAdminView
 * Column order matches HTML headers exactly:
 * 0: EmployeeId, 1: Employee Name, 2: Gender, 3: Grade, 4: Location, 5: Group Account,
 * 6: Delivery/Non-delivery, 7: FY-24 Rating, 8: Last Promotion Date, 9: FY-25 Rating,
 * 10: FY-25 Promotion, 11: Reco. Designation, 12: Reco. Designation Consent, 13: Promotion Track,
 * 14: Talent Cube, 15: Action History, 16: Inputter, 17: Reviewer, 18: Approver, 19: Comments,
 * 20: Criticality Reasons, 21: Criticality Priority, 22: Attrition Risk, 23: Attrition Risk Reason,
 * 24: Immediate Backup Name, 25: Successor Name
 */
function GetHRBPAdminColumnDefinitions() {
    return [
        {
            // Column 0: EmployeeId
            "render": function (data, type, row, meta) {
                return "<span>" + row.EmployeeName.split('!')[1] + "</span></span>";
            },
            "sWidth": "6%",
            "name": "EmployeeId"
        },
        {
            // Column 1: Employee Name
            "render": function (data, type, row, meta) {
                return "<span>" + row.EmployeeName.split('!')[0] + "</span><span><input type='hidden' id='hdnRatingValue' name='hdnRatingValue' value='" + row.RatingValue + "'/></span>";
            },
            "sWidth": "6%",
            "name": "EmployeeName"
        },
        {
            // Column 2: Gender
            "render": function (data, type, row, meta) {
                return "<span>" + row.Gender + "</span><span><input type='hidden' id='hdnRowStatus' name='hdnRowStatus' value='" + row.RowStatus + "'/></span>";
            },
            "sWidth": "5%",
            "name": "Gender"
        },
        {
            // Column 3: Grade
            "render": function (data, type, row, meta) {
                return "<span>" + row.GradeName + "</span><span><input type='hidden' id='hdnGradeID' name='hdnGradeID' value='" + row.GradeID + "'/></span>";
            },
            "sWidth": "5%",
            "name": "Grade"
        },
        {
            // Column 4: Location
            "render": function (data, type, row, meta) {
                return "<span>" + row.LocationName + "</span><span><input type='hidden' id='hdnLocationID' name='hdnLocationID' value='" + row.LocationID + "'/></span>";
            },
            "sWidth": "5%",
            "name": "Location"
        },
        {
            // Column 5: Group Account
            "render": function (data, type, row, meta) {
                return "<span>" + row.AccountGroup + "</span><span><input type='hidden' id='hdnAccountGroup' name='hdnAccountGroup' value='" + row.AccountGroup + "'/></span>";
            },
            "sWidth": "5%",
            "name": "GroupAccount"
        },
        {
            // Column 6: Delivery/Non-delivery
            "render": function (data, type, row, meta) {
                return "<span>" + row.DeliveryStatus + "</span><span><input type='hidden' id='hdnDeliveryStatus' name='hdnDeliveryStatus' value='" + row.DeliveryStatus + "'/></span>";
            },
            "sWidth": "5%",
            "name": "DeliveryStatus"
        },
        {
            // Column 7: FY-24 Rating (PrevRating)
            mData: "PrevRating",
            "name": "PrevRating"
        },
        {
            // Column 8: Last Promotion Date
            mData: "LastpromotionDate",
            "sWidth": "20%",
            "name": "LastpromotionDate"
        },
        {
            // Column 9: FY-25 Rating
            "render": function (data, type, row, meta) {
                return "<span>" + row.Rating + "</span><span><input type='hidden' id='hdnRatingGivenBy' name='hdnRatingGivenBy' value='" + row.RatingGivenBy + "'/></span>";
            },
            "sWidth": "6%",
            "name": "Rating"
        },
        {
            // Column 10: FY-25 Promotion (RecoPromo)
            data: "RecoPromo",
            render: renderPromotionnDropdown,
            width: "4%",
            "name": "RecoPromo"
        },
        {
            // Column 11: Reco. Designation
            "render": function (data, type, row, meta) {
                return "<span>" + row.RecDesignation + "</span><span><input type='hidden' id='hdnByRoleId' name='hdnId' value='" + row.ByRoleId + "'/></span>";
            },
            "name": "RecDesignation"
        },
        {
            // Column 12: Reco. Designation Consent
            "render": function (data, type, row, meta) {
                return "<span>" + row.RecDesigConsent + "</span>";
            },
            "name": "RecDesigConsent"
        },
        {
            // Column 13: Promotion Track
            "render": function (data, type, row, meta) {
                return "<span>" + row.PromotionTrack + "</span>";
            },
            "name": "PromotionTrack"
        },
        {
            // Column 14: Talent Cube
            "render": function (data, type, row, meta) {
                return "<span>" + row.TalentCube + "</span>";
            },
            "name": "TalentCube"
        },
        {
            // Column 15: Action History
            "render": function (data, type, row, meta) {
                return "<a class='table-icon fa fa-history' style='margin-right:4px;' title='History'  data-id=" + row.PEPEmployeeId + " onclick='AdminViewClaimHistory(" + row.PEPEmployeeId + ")'></a><span>" + row.CurrentStatus + "</span>";
            },
            "sWidth": "6%",
            "name": "ActionHistory"
        },
        {
            // Column 16: Inputter
            "render": function (data, type, row, meta) {
                return "<span>" + row.Inputter + "</span>";
            },
            "sWidth": "26%",
            "name": "Inputter"
        },
        {
            // Column 17: Reviewer
            "render": function (data, type, row, meta) {
                return "<span>" + row.Reviewer + "</span>";
            },
            "sWidth": "10%",
            "name": "Reviewer"
        },
        {
            // Column 18: Approver
            "render": function (data, type, row, meta) {
                return "<span>" + row.Approver + "</span>";
            },
            "sWidth": "10%",
            "name": "Approver"
        },
        {
            // Column 19: Comments
            mRender: function (data, type, full) {
                return '<div data-toggle="tooltip" class="Description" title="' + full["Comment"] + '">' + full["Comment"] + '</div>';
            },
            className: "Description",
            "name": "Comments"
        },
        {
            // Column 20: Criticality Reasons
            "render": function (data, type, row, meta) {
                return "<span>" + (row.CriticalityReasons || '--') + "</span>";
            },
            "sWidth": "8%",
            "name": "CriticalityReasons"
        },
        {
            // Column 21: Criticality Priority
            "render": function (data, type, row, meta) {
                return "<span>" + (row.CriticalityPriority || '--') + "</span>";
            },
            "sWidth": "6%",
            "name": "CriticalityPriority"
        },
        {
            // Column 22: Attrition Risk
            "render": function (data, type, row, meta) {
                return "<span>" + (row.AttritionRisk || '--') + "</span>";
            },
            "sWidth": "6%",
            "name": "AttritionRisk"
        },
        {
            // Column 23: Attrition Risk Reason
            "render": function (data, type, row, meta) {
                var reason = row.AttritionRiskReason || '--';
                return '<div data-toggle="tooltip" class="Description" title="' + reason + '">' + reason + '</div>';
            },
            "sWidth": "10%",
            className: "Description",
            "name": "AttritionRiskReason"
        },
        {
            // Column 24: Immediate Backup Name
            "render": function (data, type, row, meta) {
                return "<span>" + (row.ImmediateBackup || '--') + "</span>";
            },
            "sWidth": "8%",
            "name": "ImmediateBackup"
        },
        {
            // Column 25: Successor Name
            "render": function (data, type, row, meta) {
                return "<span>" + (row.SuccessorName || '--') + "</span>";
            },
            "sWidth": "8%",
            "name": "SuccessorName"
        }
    ];
}

function BindReporteeRatings() {
    $('.loader-div').show();
    //    $("#ddlEmployeeStatus_HRBPAdminNorm").val("All");

    $('.animation').removeClass('animation');

    var empId = sessionStorage.EmployeeId;
    //    var apraisalCycleId = $('#ddlRating :selected').val();
    var token = sessionStorage.TokenValue;

    var ReferbackCheck = 0;
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };


    var _g = $('#ddlGDLDept_head').val();
    var GDLId = (_g != null && _g.length) ? (Array.isArray(_g) ? _g.join(',') : String(_g)) : "0";

    var _d = $('#ddlDPSpan_head').val();
    var DPId = (_d != null && _d.length) ? (Array.isArray(_d) ? _d.join(',') : String(_d)) : "0";

    var _r = $('#ddlRMSpan_head').val();
    var InputterId = (_r != null && _r.length) ? (Array.isArray(_r) ? _r.join(',') : String(_r)) : "0";


    if (GDLId == undefined || GDLId == "") {
        GDLId = "0";
        $('#btnAdminApproved').hide();
        $('#btnShowToEmp').hide();

    } else {

        $('#btnAdminApproved').hide();
        $('#btnShowToEmp').hide();
    }

    if (DPId == undefined || DPId == "") {
        DPId = "0";
    }

    if (InputterId == undefined || InputterId == "") {
        InputterId = "0";
    } else {

        $('#btnAdminApproved').hide();
        $('#btnShowToEmp').hide();
    }

    var CriticalityPriorityId = ($("#ddlCriticalityPriority_HRBP").length && $("#ddlCriticalityPriority_HRBP").val()) ? $("#ddlCriticalityPriority_HRBP").val().toString() : "0";

    //var RoleId = 0;
    //if ((window.location.search).split('=')[1] == '1' && sessionStorage.IsRatingAdmin == 'true') {
    //    RoleId = 1
    //} else if ((window.location.search).split('=')[1] == '2') { RoleId = 2 } else { RoleId = 0 }

    var RoleId = SelectionAccessType;

    //var RatingAdminInfoArray = [];

    EmployeeDataForAdmin = {
        AppraisalCycleId: getRatingPagesAppraisalCycleId(), // current AppraisalCycleId
        LoginEmployeeId: sessionStorage.EmployeeId, // ReferBack By
        GDLId: GDLId,  //PEPEmployeeId
        DPId: DPId,  // Rating Given By.
        InputterId: InputterId,
        Role: RoleId,
        CriticalityPriorityId: CriticalityPriorityId
    };


    // RatingAdminInfoArray.push(RatingAdminInfo);
    var svrPath = CONFIG.get('SERVERNAME');
    //var apiPath = svrPath + "RatingAdmin?AppraisalCycleId=" + getRatingPagesAppraisalCycleId() + "&LoginEmployeeId=" + sessionStorage.EmployeeId + "&GDLId=" + GDLId + "&DPId=" + DPId + "&InputterId=" + InputterId + "&Role=" + RoleId;
    var apiPath = svrPath + "/RatingAdmin/GetRatingsByRole";

    $.ajax({
        url: apiPath,
        type: "POST",
        data: JSON.stringify(EmployeeDataForAdmin),
        async: true,
        dataType: 'json',
        headers: headerInfo,
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr, opts) {
            //$('.loader-div').show();
        },

        success: function (ratingData) {

            if (ratingData.Success == false) {
                //    console.log("tblEmpRating-" + ratingData.ErrorCode + ' ' + ratingData.ErrorMessage)
                var table = $('#tblHRBPAdminView').DataTable();

                table.clear();

            }
            else {
                var resultData = null;
                if (ratingData && ratingData.Result) {
                    resultData = ratingData.Result.data || (Array.isArray(ratingData.Result) ? ratingData.Result : null);
                }
                if (resultData !== null) {
                    rawData = resultData;
                    MainData = rawData;
                    // Only repopulate filter dropdowns when we have data; otherwise keep existing options so filters are not cleared when result is empty (e.g. strict Criticality filter)
                    if (rawData.length > 0) {
                        BindGroupAccount();
                        BindGrade();
                        BindGender();
                        Bind_ddllocation();
                        BindEmployeeStatus();
                        BindGroupAccountNorm();
                        BindDeliveryStatus_HRBP();
                    }
                    // Bind Criticality dropdown only when empty (e.g. first load), so applying Criticality filter does not wipe the selection after refetch
                    BindCriticalityPriority_HRBP(true);
                } else {
                    console.warn('BindReporteeRatings: No data returned or invalid response structure');
                    rawData = [];
                    MainData = [];
                }
            }


            if (ratingData.Success && ratingData.Result) {
                var countData = ratingData.Result.data || (Array.isArray(ratingData.Result) ? ratingData.Result : []);
                TotalReporteesSpanCount = Array.isArray(countData) ? countData.length : 0;
            } else {
                TotalReporteesSpanCount = 0;
            }

            var ReporteesortedData = [];

            for (var i = 0; i < rawData.length; i++) {
                if (rawData[i].RMName == sessionStorage.EmployeeId) {
                    ReporteesortedData.push(rawData[i]);
                }

                //if (rawData[i].RowStatus == 3 && rawData[i].CurrentStatus != 'Final Approved') {
                //    ReferbackCheck = 1;
                //}
            }

            // Referred Back to GDL rights only given to leena

            if ((sessionStorage.EmployeeId == 5521 || sessionStorage.EmployeeId == 9407) && $('#ddlGDLDept_head :selected').val() != '0' && RoleId == 1 && DPId == "0" && InputterId == "0" && ($("#ddlGDLDept_head option:selected").length) == 1) {
                $('#btnReferback').hide();
                $('#btnAdminApproved').show();
                //$('#btnShowToEmp').show();

            } else {
                $('#btnReferback').hide();
                $('#btnAdminApproved').hide();
                $('#btnShowToEmp').hide();
            }

            $('#ReporteeNo').text(ReporteesortedData.length);

            // Use common binding function
            // The initComplete callback in BindHRBPAdminTable will handle column visibility initialization
            BindHRBPAdminTable(Array.isArray(rawData) ? rawData : []);

            $('.loader-div').hide();
        }, error: function (xhr, ajaxOptions, thrownError) {
            $('.loader-div').hide();
            alert('Failed to retrieve data.');
        }


    });

    //CommonAjaxGET(apiPath, headerInfo).done(function (ratingData) {


    //});



}

$("#btnReferback").click(function () {
    ReferBackRating();
});
$("#btnAdminApproved").click(function () {
    AdminApproved();
});

$("#btnShowToEmp").click(function () {
    ShowToEmpApproved();
});

function ShowToEmpApproved() {

    var flag = 0;
    var empId = sessionStorage.EmployeeId;

    var Id;
    var AspireEmployeeId;
    var RatingArray = [];


    var hdnRMName = 0;
    var hdnNextApproverId = 0;
    var hdnSLRatingGivenBy = 0;
    var RatingList = {};


    var table = $('#tblHRBPAdminView').DataTable();
    var allRows = table.rows().nodes().to$();

    if (TotalReporteesSpanCount > 0 && (allRows != undefined) && allRows.length > 0 && TotalReporteesSpanCount == allRows.length) {
        var element;
        var isValid = true;
        var check = 0;

        $.each(allRows, function (index, row) {

            ToEmployeeId = 0;
            hdnRMName = 0;
            hdnRowStatus = 0;
            hdnNextApproverId = 0;
            hdnFinalApprover = 0;
            Id = 0;
            finalstatus = 0;
            hdnSLRatingGivenBy = 0;

            var currentRow = $(row);



            element = currentRow.find('td:nth-child(13) input:hidden');
            if (element) {
                ToEmployeeId = element.val();
            }

            element = currentRow.find('td:nth-child(1) input:hidden');
            if (element) {
                hdnRMName = element.val();
            }

            element = currentRow.find('td:nth-child(2) input:hidden');
            if (element) {
                hdnRowStatus = element.val();
            }

            element = currentRow.find('td:nth-child(10) input:hidden');
            if (element) {
                hdnRatingGivenBy = element.val();
            }

            element = currentRow.find('td:nth-child(6) input:hidden');
            if (element) {
                hdnFinalApprover = element.val();
            }

            element = currentRow.find('td:nth-child(7) input:hidden');
            if (element) {
                Id = element.val();
            }

            element = currentRow.find('td:nth-child(9) input:hidden');
            if (element) {
                hdnSLRatingGivenBy = element.val();
            }

            if (hdnRowStatus != 3) {
                isValid = false;
                return false;
            }

            if (hdnRowStatus == 3) {
                RatingList = {
                    AppraisalCycleId: getRatingPagesAppraisalCycleId(), // current AppraisalCycleId
                    ModifiedBy: sessionStorage.EmployeeId, // ReferBack By
                    PEPEmployeeId: ToEmployeeId,  //PEPEmployeeId
                    RatingGivenBy: hdnRatingGivenBy,  // Rating Given By.
                    Id: Id // existing row id
                };
                RatingArray.push(RatingList);
                check = 1;
            }
        });

        if (!isValid) {
            toastr.error("Rating cannot be visible to Emlpoyee,All Employe Rating should be approved by GDL/Function-Head.");
            return;
        }
    }
    else {
        toastr.error("All employee rating is not selected.");
        return;
    }

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "/RatingAdmin/ShowToEmpApproved"

    var msg = '';

    if (check == 1) {
        msg = 'Now selected GDL span employee will be able to see his/her given ratings.';
    } else {
        msg = 'No Record found for Approved.';
    }

    $.ajax({
        url: apiPath,
        type: 'POST',
        data: JSON.stringify(RatingArray),
        async: true,
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function (xhr, opts) {
            //  $('.loader-div').show();
        },
        headers: CommonGetHeaderInfo(),
        success: function (result) {
            Result = result;

            $(".loader-div").hide();
            if (check == 1) {
                toastr.success(msg);
                BindReporteeRatings();
                //changeBackgroundColor();
            }
            else {
                toastr.error(msg);
            }

            $('.loader-div').hide();
        },
        complete: function (xhr, statusText) {
            if (data === null || data === "") {
                data = {
                    "statusCode": xhr.status, "statusText": statusText
                };
            }
        },
        error: function (xhr, statusText, errorThrown) {
            $(".loader-div").hide();
            data = {
                "statusCode": xhr.status, "statusText": statusText, "error": "error"
            };
        }
    });

}


function AdminApproved() {

    var flag = 0;
    var empId = sessionStorage.EmployeeId;

    var Id;
    var AspireEmployeeId;
    var RatingArray = [];


    var hdnRMName = 0;
    var hdnNextApproverId = 0;
    var hdnSLRatingGivenBy = 0;
    var RatingList = {};


    var table = $('#tblHRBPAdminView').DataTable();
    var allRows = table.rows().nodes().to$();

    if (TotalReporteesSpanCount > 0 && (allRows != undefined) && allRows.length > 0 && TotalReporteesSpanCount == allRows.length) {
        var element;
        var isValid = true;
        var check = 0;

        $.each(allRows, function (index, row) {

            ToEmployeeId = 0;
            hdnRMName = 0;
            hdnRowStatus = 0;
            hdnNextApproverId = 0;
            hdnFinalApprover = 0;
            Id = 0;
            finalstatus = 0;
            hdnSLRatingGivenBy = 0;
            ByRoleId = 0;
            var currentRow = $(row);



            element = currentRow.find('td #hdnEmployeeId');
            if (element) {
                ToEmployeeId = element.val();
            }

            element = currentRow.find('td #hdnId');
            if (element) {
                Id = element.val();
            }

            element = currentRow.find('td #hdnRowStatus');
            if (element) {
                hdnRowStatus = element.val();
            }

            element = currentRow.find('td #hdnByRoleId');
            if (element) {
                ByRoleId = element.val();
            }



            //element = currentRow.find('td:nth-child(14) input:hidden');
            //if (element) {
            //    ToEmployeeId = element.val();
            //}


            //element = currentRow.find('td:nth-child(14) input:hidden');
            //if (element) {
            //    ToEmployeeId = element.val();
            //}

            //element = currentRow.find('td:nth-child(1) input:hidden');
            //if (element) {
            //    hdnRMName = element.val();
            //}

            //element = currentRow.find('td:nth-child(2) input:hidden');
            //if (element) {
            //    hdnRowStatus = element.val();
            //}

            //element = currentRow.find('td:nth-child(11) input:hidden');
            //if (element) {
            //    hdnRatingGivenBy = element.val();
            //}

            //element = currentRow.find('td:nth-child(6) input:hidden');
            //if (element) {
            //    hdnFinalApprover = element.val();
            //}

            //element = currentRow.find('td:nth-child(8) input:hidden');
            //if (element) {
            //    Id = element.val();
            //}

            //element = currentRow.find('td:nth-child(10) input:hidden');
            //if (element) {
            //    hdnSLRatingGivenBy = element.val();
            //}



            if (hdnRowStatus == "2" && ByRoleId != 3) {

                isValid = false;
                return false;
            }

            if (hdnRowStatus == "2" && ByRoleId == 3) {
                RatingList = {
                    AppraisalCycleId: getRatingPagesAppraisalCycleId(), // current AppraisalCycleId
                    ModifiedBy: sessionStorage.EmployeeId, // ReferBack By
                    PEPEmployeeId: ToEmployeeId,  //PEPEmployeeId
                    Id: Id // existing row id
                };
                RatingArray.push(RatingList);
                check = 1;
            }
        });

        if (!isValid) {
            toastr.error("Rating cannot be approved, Rating should be approved by GDL/Function-Head.");
            return;
        }
    }
    else {
        toastr.error("All employee rating is not selected.");
        return;
    }

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "/RatingAdmin/AdminRatingApproved"

    var msg = '';

    if (check == 1) {
        msg = 'Rating Approved Successfully by HR-Admin.';
    } else {
        msg = 'No Record found for Approved.';
    }

    $.ajax({
        url: apiPath,
        type: 'POST',
        data: JSON.stringify(RatingArray),
        async: true,
        dataType: 'json',
        headers: CommonGetHeaderInfo(),
        contentType: 'application/json',
        beforeSend: function (xhr, opts) {
            //  $('.loader-div').show();
        },
        headers: CommonGetHeaderInfo(),
        success: function (result) {
            Result = result;

            $(".loader-div").hide();
            if (check == 1) {
                toastr.success(msg);
                BindReporteeRatings();
                //changeBackgroundColor();
            }
            else {
                toastr.error(msg);
            }

            $('.loader-div').hide();
        },
        complete: function (xhr, statusText) {
            if (data === null || data === "") {
                data = {
                    "statusCode": xhr.status, "statusText": statusText
                };
            }
        },
        error: function (xhr, statusText, errorThrown) {
            $(".loader-div").hide();
            data = {
                "statusCode": xhr.status, "statusText": statusText, "error": "error"
            };
        }
    });

}

function ReferBackRating() {

    //  $(".loader-div").show();
    var flag = 0;
    var empId = sessionStorage.EmployeeId;
    //CheckSessionTimeOut();
    //var table = $('#tblHRBPAdminView').DataTable();
    //var numero = $('#tblHRBPAdminView').dataTable().fnGetNodes().length;

    var IRecoForpromotion;
    var ICurrentRating;
    var IComments;
    var Id;
    var AspireEmployeeId;
    var RatingArray = [];


    var hdnRMName = 0;
    var hdnNextApproverId = 0;
    var hdnSLRatingGivenBy = 0;
    var RatingList = {};


    var table = $('#tblHRBPAdminView').DataTable();
    var allRows = table.rows().nodes().to$();

    var element;
    var isValid = true;
    var check = 0;
    var ReferbackValid = 0;

    $.each(allRows, function (index, row) {
        hdnRowStatus = 0;
        finalstatus = 0;
        hdnSLastratingGivenBy = 0;
        hdnLastratingGivenBy = 0;

        var currentRow = $(row);

        element = currentRow.find('td #hdnRowStatus');

        if (element) {
            hdnRowStatus = element.val();

            if (hdnRowStatus == 4) {
                toastr.error("Selected approver span already referred back to approver.");
                ReferbackValid = 1;
                return false;
            }
            if (hdnRowStatus == 4) {
                toastr.error("Selected approver span cannot be refer back.Ratings already referredback to respective reviewers. ");
                ReferbackValid = 1;
                return false;
            }
        }
    });

    if (ReferbackValid == 0) {
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + "/RatingAdmin/RatingReferBack"

        var msg = '';

        ReferbackData = {
            AppraisalCycleId: getRatingPagesAppraisalCycleId(), // current AppraisalCycleId
            LoginEmployeeId: sessionStorage.EmployeeId, // ReferBack By
            GDLHeadSpan: $('#ddlGDLDept_head :selected').val()  //PEPEmployeeId
        };

        $.ajax({
            url: apiPath,
            type: 'POST',
            data: JSON.stringify(ReferbackData),
            async: true,
            dataType: 'json',
            headers: CommonGetHeaderInfo(),
            contentType: 'application/json',
            beforeSend: function (xhr, opts) {
                //  $('.loader-div').show();
            },
            headers: CommonGetHeaderInfo(),
            success: function (result) {
                Result = result;

                $(".loader-div").hide();
                ;
                if (result.Success == true) {

                    toastr.success('Rating ReferredBack to Approver Successfully.');
                    BindReporteeRatings();
                    SendMailAfterReferBackAction();
                }
                else {
                    toastr.error('There is some issues in records.');
                }

            },
            complete: function (xhr, statusText) {
                if (data === null || data === "") {
                    data = {
                        "statusCode": xhr.status, "statusText": statusText
                    };
                }
            },
            error: function (xhr, statusText, errorThrown) {
                $(".loader-div").hide();
                data = {
                    "statusCode": xhr.status, "statusText": statusText, "error": "error"
                };
            }
        });
    }

}


function SendMailAfterReferBackAction() {


    var Role = '';

    var employeedata = {
        EmpId: sessionStorage.EmployeeId,
        action: 'Referback',
        Role: 'A',
        selectedEmployees: $('#ddlGDLDept_head :selected').val()
    };
    var svrPath = CONFIG.get('SERVERNAME');
    var apiURL = svrPath + "RatingAdmin/SendMailAfterAction";


    $.ajax({
        url: apiURL,
        type: 'POST',
        data: JSON.stringify(employeedata),
        async: true,
        dataType: 'json',
        contentType: 'application/json',
        headers: CommonGetHeaderInfo(),
        success: function (result) {
            if (result.Result == 1)
                toastr.success('Mail has been sent to Approver.');
        },
        complete: function (xhr, statusText) {

            if (data === null || data === "") {
                data = {
                    "statusCode": xhr.status, "statusText": statusText
                };
            }
        },
        error: function (xhr, statusText, errorThrown) {

            data = {
                "statusCode": xhr.status, "statusText": statusText, "error": "error"
            };
        }
    });
}


function renderCurrentRatingtDropdown(data, type, row) {
    //var svrPath = CONFIG.get('SERVERNAME');
    //var apiPath = svrPath + "Rating/GetRatingList";
    var dropdownHtml = '';
    //id = "${row.EmployeeId}"
    if (row.RowStatus == 1 && row.Id != 0) {
        buttoncheck = 2;
    }

    if (row.RowStatus == 3) {
        dropdownHtml = `<div class="input-group input-append date  id="" style="margin: 0 auto;"> <select class='form-control currRating' id="${row.PEPEmployeeId}" disabled>`;

    }
    else {

        dropdownHtml = `<div class="input-group input-append date id="" style="margin: 0 auto;"> <select class='form-control currRating' id="${row.PEPEmployeeId}">`;

    }


    if (row.CurrentRating == "0") {

        dropdownHtml += `<option value="0" selected>--Select--</option><option value="2002">EE(5%)</option><option value="1002">EE(25%)</option><option value="1003">ME(60%)</option><option value="1004">BE(10%)</option>`;
    } else {
        if (row.CurrentRating == "1002") {

            dropdownHtml += `<option value="0">--Select--</option><option value="2002" selected>EE(5%)</option><option value="1002" selected>EE(25%)</option><option value="1003">ME(60%)</option><option value="1004">BE(10%)</option>`;
        } else if (row.CurrentRating == "1003") {
            dropdownHtml += `<option value="0">--Select--</option><option value="2002" selected>EE(5%)</option><option value="1002">EE(25%)</option><option value="1003" selected>ME(60%)</option><option value="1004">BE(10%)</option>`;

        }
        else if (row.CurrentRating == "1004") {
            dropdownHtml += `<option value="0">--Select--</option><option value="2002" selected>EE(5%)</option><option value="1002">EE(25%)</option><option value="1003" >ME(60%)</option><option value="1004" selected>BE(10%)</option>`;

        }
        else if (row.CurrentRating == "2002") {
            dropdownHtml += `<option value="0">--Select--</option><option value="2002" selected>EE(5%)</option><option value="1002">EE(25%)</option><option value="1003" >ME(60%)</option><option value="1004">BE(10%)</option>`;

        }
    }

    dropdownHtml += `</select></div>`;

    return dropdownHtml;
}

function renderPrevRatingtDropdown(data, type, row) {


    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating/GetRatingList";

    //id = "${row.EmployeeId}"

    var dropdownHtml = `<div class="input-group input-append date id="" style="width: 135px;" > <select class='form-control rating'  id="${row.PEPEmployeeId}" disabled>`;
    $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'Get',
        headers: CommonGetHeaderInfo(),
        url: apiPath,
        async: false,
        success: function (data) {
            var dropdownOptions = data;

            dropdownHtml += `<option value="0">--Select--</option>`;

            if (dropdownOptions.Result.length > 0) {

                dropdownOptions.Result.forEach(option => {
                    const selected = option === data ? 'selected' : '';

                    if (row.PrevRating == option.Id) {

                        dropdownHtml += `<option  value="${option.Id}" selected>${option.Rating}</option>`;
                    } else {

                        dropdownHtml += `<option value="${option.Id}">${option.Rating}</option>`;
                    }
                });
                dropdownHtml += `</select></div>`;

            }

        },
        error: function (response) {
            alert(response);
        }
    });


    return dropdownHtml;
}

function renderPromotiontDropdown(data, type, row) {


    //var svrPath = CONFIG.get('SERVERNAME');
    //var apiPath = svrPath + "Rating/GetRatingList";

    //id = "${row.EmployeeId}"

    var dropdownHtml = '';
    if (row.RowStatus == 4 && row.SLastratingGivenBy == sessionStorage.EmployeeId) {
        dropdownHtml = `<div class="input-group input-append date id="" style="margin: 0 auto;" > <select class='form-control rating' id="${row.PEPEmployeeId}">`;

    } else {
        if (row.RowStatus == 3 || row.RowStatus == 4) {
            dropdownHtml = `<div class="input-group input-append date id="" style="margin: 0 auto;" > <select class='form-control rating' id="${row.PEPEmployeeId}" disabled>`;
        }
        else {

            dropdownHtml = `<div class="input-group input-append date id="" style="margin: 0 auto;" > <select class='form-control rating' id="${row.PEPEmployeeId}">`;

        }

    }
    dropdownHtml += `<option value="0">--Select--</option>`;

    if (row.RecoForPromotion == "0") {

        dropdownHtml += `<option value="1">Yes</option><option value="2">No</option>`;
    } else {
        if (row.RowStatus == 3) {

            if (row.RecoForPromotion == "1") {

                dropdownHtml += `<option value="1" selected>Yes</option><option value="2">No</option>`;
            } else if (row.RecoForPromotion == "2") {

                dropdownHtml += `<option value="1">Yes</option><option value="2" selected>No</option>`;
            }
        } else {
            dropdownHtml += `<option value="1">Yes</option><option value="2">No</option>`;
        }
    }


    dropdownHtml += `</select></div>`;



    return dropdownHtml;
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

function formatDate_DMY(date) {

    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [day, month, year].join('-');
}

function foramtDate_DMY2YMD(date) {
    var newdate = date.split("-").reverse().join("-");
    return formatDate(newdate);
}


function AdminViewClaimHistory(EmpId) {

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
    var apiPath = svrPath + "Rating/GetRatingHistory?AppraisalCycleId=" + getRatingPagesAppraisalCycleId() + "&EmpID=" + EmpId + "&LogEmpId=" + sessionStorage.EmployeeId;

    CommonAjaxGET(apiPath, headerInfo).done(function (ratingHistoryData) {

        if (ratingHistoryData.Success == true) {

            $("#tblActionHistoryAdmin").DataTable({
                //"dom": 'lBfrtip',
                //buttons: [
                //{
                //    extend: 'excelHtml5',
                //    text: 'Export to Excel',
                //    title: 'History Details',
                //    download: 'open',
                //    orientation: 'landscape',
                //    exportOptions: {
                //        columns: [0, 1, 2, 3, 4, 5, 6]
                //    }
                //}],
                "data": ratingHistoryData.Result,
                "destroy": true,
                "sPaginationType": "full_numbers",
                "iDisplayLength": RecordsCountPerPage,
                "bLengthChange": false,
                "bDestroy": true,
                "searching": false,
                info: false,
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

            $('#ViewAdminNTHistoryDetails').modal('show');

        }
    });


}


function showHRBPAdminBellCurve() {

    //var totalemp = BE + ME + EE + EE1 + notgiven;
    var title = '';
    //var ddlReporteeValue = 0;
    //var ddlReporteeValueText = 0;

    var totalemp = STab_BE + STab_ME + STab_EE + STab_EE1;
    var title = '';
    //var ddlReporteeValue = $('#ddlGDLDept_headNorm :selected').val();
    //var ddlReporteeValueText = $('#ddlGDLDept_headNorm :selected').text();


    //if (ddlReporteeValue != '0') {
    //    title = 'Bell Curve (Total no. of Employees of in Span : ' + TotalSpan + ')';
    //}
    //else {
    //    title = 'Bell Curve (Total no. of Employees in your HRBP/Admin span :' + totalemp + ')'
    //}

    title = 'Bell Curve (Total no. of Employees as per selected filters : ' + TotalSpan + ')';


    $('#myModalHRBPAdmin').modal('show');
    Highcharts.chart("bellcurve_hrbpadmin", {

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
                data: [0, STab_EE1, STab_EE, STab_ME, STab_BE, 0],
            },


        ]
    });

}


function changeBackgroundColor() {

    $('.currRating').each(function () {

        if ($(this).val() == '1002') {
            $(this).closest('td').css('background-color', '#52c34b');
        }
        else if ($(this).val() == '1003') {
            $(this).closest('td').css('background-color', '#FFD966');
        }
        else if ($(this).val() == '1004') {
            $(this).closest('td').css('background-color', '#f55858');
        }
        else if ($(this).val() == '2002') {
            $(this).closest('td').css('background-color', '#7ab750');
        }
        else {
            $(this).closest('td').css('background-color', 'white');
        }
    });

}


var FilterrawData = [];

function FirstScreenfilterschange(hideLoaderWhenDone) {
    $('.loader-div').show();
    var FilterrawData = rawData.slice(); // Clone rawData to avoid modifying original

    var filters = [
        { dropdown: "#ddlgender", key: "Gender" },
        { dropdown: "#ddllocation_GDLDept_head", key: "LocationID" },
        { dropdown: "#ddlgrade_GDLDept_head", key: "GradeID" },
        { dropdown: "#ddlgroupaccount_GDLDept_head", key: "AccountGroupId" },
        { dropdown: "#ddlEmployeeStatus_HRBP", key: "EmployeeStatus" },
        { dropdown: "#ddlDeliveryStatus_HRBP", key: "DeliveryStatus" }


    ];

    var appliedFilters = false;

    filters.forEach(filter => {
        var selectedValues = $(filter.dropdown).val();

        if (selectedValues && selectedValues.length > 0) {
            appliedFilters = true;
            let filterArray = selectedValues.map(String); // Convert all values to string for comparison

            // console.log(`Filtering by ${filter.key}:`, filterArray); // Debugging log

            // Apply the filter
            FilterrawData = FilterrawData.filter(item => filterArray.includes(String(item[filter.key])));
        }
    });



    var promotionarray = [];

    if ($("#ddlPromotion_HRBP option:selected").length > 0) {

        appliedFilters = true;
        var filterData = [];

        var ddlPromotion = $("#ddlPromotion_HRBP").val().toString();

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

    //console.log("Final Filtered Data:", FilterrawData); // Debugging log

    // Bind filtered data if any filters were applied; otherwise, use rawData
    BindTableForFilters(appliedFilters ? FilterrawData : rawData);

    if (hideLoaderWhenDone !== false) {
        $('.loader-div').hide();
    }
}

function BindTableForFilters(filterData) {
    // Use common binding function
    // Ensure filterData is an array
    if (!Array.isArray(filterData)) {
        filterData = [];
    }
    
    BindHRBPAdminTable(filterData);
}

function BindAppraisalCycleRoleMappingGrid() {

    $('.animation').removeClass('animation');

    var empId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "RatingAdmin/GetAppraisalCycleRoleMapping";

    var result = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    if (result && result.responseJSON && result.responseJSON.Result && result.responseJSON.Result.data) {
        normAppraisalCycleGradeData = result.responseJSON.Result.data;
        BindFilteredAppraisalCycleRoleMappingGrid(normAppraisalCycleGradeData);
    } else {
        console.warn('GetAppraisalCycleRoleMapping: No data returned or invalid response structure');
        normAppraisalCycleGradeData = [];
    }
    $("#loading-overlay").hide(); // Show loading image
}

function BindRolesByApprCycle() {
    var empId = sessionStorage.EmployeeId;
    var apraisalCycleId = $('#ddlApprCycleHRAdminRole :selected').val();
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header
        'X-EmpNo': sessionStorage.EmployeeId
    };

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "RatingAdmin/BindRolesByApprCycle?AppraisalCycleId=" + apraisalCycleId;

    var result = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    $('#ddlUserTpeHRAdmin').empty();

    if (result && result.responseJSON && result.responseJSON.Result) {
        var roles = result.responseJSON.Result;

        if (roles.length === 1) {
            // If there is only one role, add it without "Select Role"
            $('#ddlUserTpeHRAdmin').append($("<option>").val(roles[0].Id).text(roles[0].Value));
        } else if (roles.length > 1) {
            // If there are multiple roles, first add "Select Role" then the roles
            $('#ddlUserTpeHRAdmin').append($("<option>").val(0).text("Select Role"));

            $.each(roles, function (index, data) {
                $('#ddlUserTpeHRAdmin').append($("<option>").val(data.Id).text(data.Value));
            });
        }
    }
    BindStartDateByRole();
    FilterAppraisalCycle(apraisalCycleId);


}
function BindStartDateByRole() {

    var empId = sessionStorage.EmployeeId;
    var appraisalCycleId = $('#ddlApprCycleHRAdminRole :selected').val();
    var role = $("#ddlUserTpeHRAdmin").val();
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header
        'X-EmpNo': sessionStorage.EmployeeId
    };

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "RatingAdmin/BindStartDateByRole?AppraisalCycleId=" + appraisalCycleId + "&Role=" + role;

    var result = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    if (result && result.responseJSON && result.responseJSON.Success) {
        var data = result.responseJSON.Result;

        if (data.StartDate && data.EndDate) {
            // If data is present, bind the Start and End Date
            var startDate = formatDate_DMY(new Date(data.StartDate));
            var endDate = formatDate_DMY(new Date(data.EndDate));


            var apiDate = new Date();
            $("#dtNormStartDate").datepicker("option", "minDate", apiDate);
            $("#dtNormEndDate").datepicker("option", "minDate", apiDate);

            $("#dtNormStartDate").val(startDate);
            $("#dtNormEndDate").val(endDate);

            // Change button text to "Update"
            $("#btnAddNormRoleMapping").text("Update");
        }
        else if (data.StartDate) {
            var apiDate = new Date();
            $("#dtNormStartDate").val("");
            $("#dtNormEndDate").val("");
            $("#dtNormStartDate").datepicker("option", "minDate", apiDate);
            $("#dtNormEndDate").datepicker("option", "minDate", apiDate);
        }
        else {
            // No data found, set default values
            var apiDate = new Date();
            $("#dtNormStartDate").val("");
            $("#dtNormEndDate").val("");
            $("#dtNormStartDate").datepicker("option", "minDate", apiDate);
            $("#dtNormEndDate").datepicker("option", "minDate", apiDate);

            // Change button text to "Add"
            $("#btnAddNormRoleMapping").text("Add");
        }

        //$("#dtNormStartDate").datepicker("option", "minDate", new Date());

        //$("#dtNormEndDate").datepicker("option", "minDate", new Date());
        //if (role == 1) {
        //    $("#dtNormStartDate").datepicker("option", "minDate", new Date());
        //}

    } else {
        console.error("API response is missing or incorrect:", result);
    }
}
$('#dtNormEndDate').on('change', function () {
    var SDate = $('#dtNormStartDate').val();
    var EDate = $('#dtNormEndDate').val();

    // Check if both dates exist before comparison
    if (SDate && EDate) {
        // Remove 'new' before parseDate and fix the date creation
        var d1 = parseDate(SDate);
        var d2 = parseDate(EDate);

        if (d2.getTime() < d1.getTime()) {
            toastr.error('End Date cannot be less than Start Date.');
            $('#dtNormEndDate').val('');
        }
    }
});

function parseDate(input) {
    var parts = input.split('-');
    // Check if the split resulted in proper date parts
    if (parts.length === 3) {
        // parts[0] = day, parts[1] = month (1-based, so -1 for Date object), parts[2] = year
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return null; // Return null for invalid dates
}

//$('#dtNormEndDate').on('change', function () {

//    ;
//    var SDate = $('#dtNormStartDate').val()
//    var EDate = $('#dtNormEndDate').val()

//    var d1 = new parseDate(SDate);
//    var d2 = new parseDate(EDate);

//    if (d2.getTime() < d1.getTime()) {
//        toastr.error('End Date cannot be less than to Start Date.');
//        $('#dtNormEndDate').val('');
//    }
//});

//function parseDate(input) {
//    var parts = input.split('/');
//    // parts[2] = year, parts[1] = month - 1 (0-based), parts[0] = day
//    return new Date(parts[2], parts[1] - 1, parts[0]);
//}
function AddUpdateRoleMapping() {
    var Id = 0;
    var AppraisalCycleId = $("#ddlApprCycleHRAdminRole").val();

    if (AppraisalCycleId == undefined || AppraisalCycleId <= 0) {
        toastr.error("Please select Appraisal Cycle.");
        return;
    }

    //if (AppraisalCycleId < currentAppraisalCycleId) {
    //    toastr.error('Past Appraisal Cycle is not allowed.');
    //    return;
    //}

    var Role = $("#ddlUserTpeHRAdmin").val();
    if (Role == undefined || Role <= 0) {
        toastr.error("Please select Role.");
        return;
    }

    var NormStartDate = $("#dtNormStartDate").val();
    var NormEndDate = $("#dtNormEndDate").val();

    if (NormStartDate != "") {
        NormStartDate = foramtDate_DMY2YMD(NormStartDate);
    }
    else {
        toastr.error("Please select Start Date.");
        return;
    }
    if (NormEndDate != "") {
        NormEndDate = foramtDate_DMY2YMD(NormEndDate);
    }
    else {
        toastr.error("Please select End Date.");
        return;
    }
    var today = new Date();
    var Sdate = new Date(NormStartDate);
    var Edate = new Date(NormEndDate);
    //if (Sdate < today || Edate < today) {
    //    toastr.error("Start and End Date should be a future date.");
    //    return;
    //}

    var IsActive = $("#ddlIsAciveHRAdmin").val();



    var ActionBy = sessionStorage.EmployeeId;




    SaveNormRoleMapping(Id, AppraisalCycleId, Role, NormStartDate, NormEndDate, IsActive, ActionBy);
}

function SaveNormRoleMapping(Id, AppraisalCycleId, Role, NormStartDate, NormEndDate, IsActive, ActionBy) {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "RatingAdmin/SaveNormalisationRoleMapping";

    var requestData = {
        Id: Id,
        AppraisalCycleId: AppraisalCycleId,
        RoleId: Role,
        NormalisationStartDate: NormStartDate,
        NormalisationEndDate: NormEndDate,
        IsActive: IsActive,
        ActionBy: ActionBy
    };


    $.ajax({
        url: apiPath,
        type: 'POST',
        data: JSON.stringify(requestData),
        async: true,
        dataType: 'json',
        headers: CommonGetHeaderInfo(),
        contentType: 'application/json',
        beforeSend: function (xhr, opts) {
            // alert()
            $('.loader-div').show();

        },
        headers: CommonGetHeaderInfo(),
        success: function (result) {

            Result = result;
            if ($("#btnAddNormRoleMapping").text().trim() === "Update") {
                msg = 'Role Configuration has been Updated!';
            } else {
                msg = 'Role Configuration Added!';
            }
            $('#btnAddNormAppriasalCycleGradeMapping').prop('disabled', false);

            if (Result.Success) {
                toastr.success(msg);
            }
            else {
                toastr.error(Result.ErrorMessage);
            }

            BindActiveAppraisalCycle();
            BindAppraisalCycleRoleMappingGrid();
            BindRolesByApprCycle();
            $("#ddlApprCycleHRAdmin").val(0);
            $("#ddlUserTpeHRAdmin").val(0);
            $("#dtNormStartDate").val("");
            $("#dtNormEndDate").val("");
            $("#ddlIsAciveHRAdmin").val('1');
            $('.loader-div').hide();
            $("#btnAddNormRoleMapping").text("Add");

        },
        complete: function (xhr, statusText) {

            if (data === null || data === "") {
                data = {
                    "statusCode": xhr.status, "statusText": statusText
                };
            }
        },
        error: function (xhr, statusText, errorThrown) {
            data = {
                "statusCode": xhr.status, "statusText": statusText, "error": "error"
            };
        }
    });
}

var statusList = [
    { id: 1, status: "Active" },
    { id: 0, status: "Inactive" }
];
function renderStatusDropdown(data, type, row) {
    //var statusHTML = '<div class="input-group input-append date id="dv' + row.Id + '" style="margin: 0 auto;"><select id="ddlDynamicstatus' + row.Id + '" class="form-control currRating" ' + ((row.NormalisationStartDate != undefined) ? "disabled" : "") + '><option value="0">Select status</option>';
    var statusHTML = '<div class="input-group id="dv' + row.Id + '" style="margin: 0 auto;"><select id="ddlDynamicstatus' + row.Id + '" class="form-control">';

    $.each(statusList, function (index, data) {

        if (row.IsActive == data.id) {
            statusHTML += '<option value="' + data.id + '" selected>' + (data.id == 1 ? "Active" : "Inactive") + '</option>';
        } else {
            statusHTML += '<option value="' + data.id + '">' + (data.id == 1 ? "Active" : "Inactive") + '</option>';
        }
    });
    statusHTML += '</select></div>';
    return statusHTML;
}

function UpdateNormAppraisalCycleGradeMapping(Id) {

    var AppraisalCycleId = $("#hdnApprCycleId" + Id).val();

    //if (AppraisalCycleId < currentAppraisalCycleId) {
    //    toastr.error('Updation of past appraisal cycle is not allowed');
    //    return;
    //}

    var GradeId = $("#ddlDynamicGrade" + Id).val();
    var NormStartDate = $("#dtNormStartDate" + Id).val();

    if (NormStartDate != "") {
        NormStartDate = foramtDate_DMY2YMD(NormStartDate);
    }
    var NormEndDate = null;
    var IsActive = true;
    var IsRatingVisible = $("#chkRatingVisible" + Id).is(":checked");
    var CreatedBy = 0;
    var ModifiedBy = sessionStorage.EmployeeId;

    if (AppraisalCycleId == undefined || AppraisalCycleId <= 0) {
        toastr.error("Please select Appraisal Cycle.");
        return;
    }

    if (GradeId == undefined || GradeId <= 0) {
        toastr.error("Please select Grade.");
        return;
    }

    if (NormStartDate == "") {
        NormStartDate = null;
    }

    SaveNormAppraisalCycleGradeMapping(Id, AppraisalCycleId, GradeId, NormStartDate, NormEndDate, IsActive, IsRatingVisible, CreatedBy, ModifiedBy);
}

function FilterAppraisalCycle(appraisalCycleId) {
    if (!normAppraisalCycleGradeData) return;

    var filteredData;

    // If appraisalCycleId is 0, load all data; otherwise, filter it
    if (appraisalCycleId == 0) {
        filteredData = normAppraisalCycleGradeData;
    }
    else {
        filteredData = normAppraisalCycleGradeData.filter(function (item) {
            return item.AppraisalCycleId == appraisalCycleId;
        });
    }

    // Rebind the DataTable with the filtered (or full) data
    BindFilteredAppraisalCycleRoleMappingGrid(filteredData);
}

function BindFilteredAppraisalCycleRoleMappingGrid(filteredData) {
    $("#tblAppCycleRoleMapping").DataTable().clear().destroy();

    $("#tblAppCycleRoleMapping").DataTable({
        data: filteredData,
        "sPaginationType": "full_numbers",
        "iDisplayLength": RecordsCountPerPage,
        "bLengthChange": true,
        "bDestroy": true,
        "searching": false,
        info: false,
        ordering: false,
        paging: false,
        "columnDefs": [
            { "orderData": [], "targets": 0 },
            { "orderable": false, "targets": 0 }
        ],
        "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
        dom: '<"row"<"col-sm-6"Bl><"col-sm-6"f>>' +
            '<"row"<"col-sm-12"<"table-responsive"tr>>>' +
            '<"row"<"col-sm-5"i><"col-sm-7"p>>',
        aoColumns: [
            {
                "render": function (data, type, row, meta) {
                    return "<span>" + (Number(meta.row) + 1) + "</span><span><input type='hidden' id='hdnAppCycleRoleMappingId" + row.Id + "' name='hdnAppCycleGradeMappingId' value='" + row.Id + "'/></span>";
                },
                "sWidth": "5%"
            },
            {
                "render": function (data, type, row, meta) {
                    return "<span>" + row.AppraisalCycleName + "</span><span><input type='hidden' id='hdnApprCycleId" + row.Id + "' name='hdnApprCycleId' value='" + row.AppraisalCycleId + "'/></span>";
                },
                "sWidth": "15%"
            },
            {
                "render": function (data, type, row, meta) {
                    return "<span>" + row.RoleName + "</span><span><input type='hidden' id='hdnRoleId" + row.Id + "' name='hdnRoleId' value='" + row.RoleId + "'/></span>";
                },
                "sWidth": "15%"
            },
            {
                "render": function (data, type, row, meta) {
                    var dt = row.NormalisationStartDate ? formatDate_DMY(new Date(row.NormalisationStartDate)) : '';
                    return "<span>" + dt + "</span>";
                },
                "sWidth": "10%"
            },
            {
                "render": function (data, type, row, meta) {
                    var dt = row.NormalisationEndDate ? formatDate_DMY(new Date(row.NormalisationEndDate)) : '';
                    return "<span>" + dt + "</span>";
                },
                "sWidth": "10%"
            },
        ],
        "deferRender": true
    });
}

function BindEmpDeliveryDropDowns() {
    var dictEmpDeliveryStatus = {};
    var sortedEmpDeliveryStatusKeys = [];

    // Define the delivery statuses
    var rawData = [
        { id: "Delivery", status: "Delivery" },
        { id: "Non-Delivery", status: "Non-Delivery" }
    ];

    // Populate dictionary with unique statuses
    $.each(rawData, function (index, data) {
        if (dictEmpDeliveryStatus[data.id] == undefined) {
            dictEmpDeliveryStatus[data.id] = data.status;
        }
    });

    // Sort the delivery statuses
    sortedEmpDeliveryStatusKeys = Object.keys(dictEmpDeliveryStatus).sort();



    // Empty the dropdown before appending options
    $('#ddlDeliveryStatus_Norm').empty();

    // Append sorted options to the dropdown
    for (let t = 0; t < sortedEmpDeliveryStatusKeys.length; t++) {
        $('#ddlDeliveryStatus_Norm').append(
            $("<option>").val(sortedEmpDeliveryStatusKeys[t]).text(dictEmpDeliveryStatus[sortedEmpDeliveryStatusKeys[t]])
        );
    }

    // Initialize multiselect plugin
    $('#ddlDeliveryStatus_Norm').multiselect('destroy');
    $('#ddlDeliveryStatus_Norm').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });
    $('#ddlDeliveryStatus_Norm').multiselect('refresh');

    // Empty the dropdown before appending options
    $('#ddlDeliveryStatus_Prom').empty();

    // Append sorted options to the dropdown
    for (let t = 0; t < sortedEmpDeliveryStatusKeys.length; t++) {
        $('#ddlDeliveryStatus_Prom').append(
            $("<option>").val(sortedEmpDeliveryStatusKeys[t]).text(dictEmpDeliveryStatus[sortedEmpDeliveryStatusKeys[t]])
        );
    }

    // Initialize multiselect plugin
    $('#ddlDeliveryStatus_Prom').multiselect('destroy');
    $('#ddlDeliveryStatus_Prom').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });
    $('#ddlDeliveryStatus_Prom').multiselect('refresh');



}

function BindDeliveryStatus_HRBP() {

    var arr = [];

    rawData.forEach(function (value, index) {
        // console.log(value.GradeID)
        if (arr.length >= 1) {
            var findindex = arr.findIndex(function (el) {
                return el.id == value.DeliveryStatus;
            })
            if (findindex == -1) {
                arr.push({ id: value.DeliveryStatus, value: value.DeliveryStatus })
            }
        } else {

            arr.push({ id: value.DeliveryStatus, value: value.DeliveryStatus })
        }

    })

    sortedAccountKeys = Object.values(arr).sort();
    //  console.log(sortedAccountKeys)


    $('#ddlDeliveryStatus_HRBP').empty();
    $('#ddlDeliveryStatus_HRBP').multiselect('destroy');

    for (let t = 0; t < sortedAccountKeys.length; t++) {

        $('#ddlDeliveryStatus_HRBP').append($("<option>").val(sortedAccountKeys[t].id).text(sortedAccountKeys[t].value));

    }

    $('#ddlDeliveryStatus_HRBP').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 150
    });

    $('#ddlDeliveryStatus_HRBP').multiselect('refresh');


}

function bindUnsavedGrid(unsavedData) {

    $("#dataModal").modal('show');
    $("#tblUnsavedData").css('display', 'block');
    var table = $('#tblUnsavedData').DataTable();

    table.clear();
    $("#tblUnsavedData").DataTable({
        data: unsavedData,
        ordering: false,
        paging: false,
        "bDestroy": true,
        "searching": false,
        info: true,
        "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
        dom: '<"row"<"col-sm-6"Bl><"col-sm-6"f>>' + '<"row"<"col-sm-12"<"table-responsive"tr>>>' + '<"row"<"col-sm-5"i><"col-sm-7"p>>',
        aoColumns: [
            { mData: "SrNo" },
            { mData: "EmployeeName" },
            { mData: "Gender" },
            { mData: "Grade" },
            { mData: "Location" },
            { mData: "Rating" },
            { mData: "ReccomendedforProm" },
            { mData: "RecommendedDesignation" },
            { mData: "Comments" },
            { mData: "Error" },

        ],
        "deferRender": true
    });
}

// Initialize Column Visibility Dropdown - loads configuration and user preferences from backend
// ==================================================================================
// Column Visibility Functions for RatingAdmin - RECREATED FROM SCRATCH
// ==================================================================================

/**
 * Initialize column visibility dropdown for RatingAdmin page
 * Completely recreated to ensure proper functionality
 */
function InitializeColumnVisibilityDropdownAdmin() {
    console.log('InitializeColumnVisibilityDropdownAdmin - Starting fresh initialization');
    
    var $dropdown = $('#ddlColumnVisibilityAdmin');
    
    // Check if dropdown exists in DOM
    if ($dropdown.length === 0) {
        console.error('Column visibility dropdown not found in page');
        return;
    }
    
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPathPreferences = svrPath + "Rating/GetUserColumnPreferences?EmployeeId=" + sessionStorage.EmployeeId + "&PageType=RatingAdmin";
    
    // Get user preferences from backend
    CommonAjaxGET(apiPathPreferences, CommonGetHeaderInfo()).done(function (response) {
        if (!response || !response.Result) {
            console.error('Failed to load user preferences:', response);
            toastr.error('Failed to load your column preferences');
            return;
        }
        
        var userPreferences = response.Result;
        console.log('Loaded user preferences:', userPreferences.length, 'columns');
        
        // Destroy existing multiselect if it exists
        try {
            if ($dropdown.data('multiselect')) {
                $dropdown.multiselect('destroy');
            }
        } catch (e) {
            console.log('Multiselect destroy skipped:', e);
        }

        // Clear dropdown
        $dropdown.empty();
        
        // Initialize column visibility data structure
        window.columnVisibilityDataAdmin = {
            mandatoryColumns: [],
            optionalColumns: [],
            allColumns: [],
            // Direct mapping: DataTable index (0-based) -> ColumnId
            dataTableToColumnIdMap: {},
            // Reverse mapping: ColumnId -> DataTable index (0-based)
            columnIdToDataTableMap: {}
        };
        
        // Populate dropdown with columns
        $.each(userPreferences, function (index, column) {
            var isSelected = column.IsVisible === true || column.IsVisible === 1;
            var isOptional = column.IsOptional === true || column.IsOptional === 1;
            
            // CRITICAL: Map database ColumnIndex (1-based) to DataTable column index (0-based)
            // DataTable index = Database ColumnIndex - 1
            var dataTableIndex = column.ColumnIndex - 1;
            
            // Store mappings
            window.columnVisibilityDataAdmin.dataTableToColumnIdMap[dataTableIndex] = column.ColumnId;
            window.columnVisibilityDataAdmin.columnIdToDataTableMap[column.ColumnId] = dataTableIndex;
            
            // Create option element
            var $option = $('<option></option>')
                .attr('value', column.ColumnId)
                .attr('data-column-id', column.ColumnId)
                .attr('data-column-index', column.ColumnIndex) // Database ColumnIndex (1-based)
                .attr('data-datatable-index', dataTableIndex) // DataTable index (0-based)
                .attr('data-is-optional', isOptional ? '1' : '0')
                .text(column.ColumnName)
                .prop('selected', isSelected);
            
            // Disable mandatory columns so they cannot be unchecked
            if (!isOptional) {
                $option.prop('disabled', true);
                window.columnVisibilityDataAdmin.mandatoryColumns.push(column.ColumnId);
            } else {
                window.columnVisibilityDataAdmin.optionalColumns.push(column.ColumnId);
            }
            
            window.columnVisibilityDataAdmin.allColumns.push({
                columnId: column.ColumnId,
                columnIndex: column.ColumnIndex,
                dataTableIndex: dataTableIndex,
                isOptional: isOptional,
                isSelected: isSelected,
                columnName: column.ColumnName
            });
            
            $dropdown.append($option);
        });

        // Initialize multiselect WITHOUT default Select All option
        $dropdown.multiselect({
            includeSelectAllOption: false,
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
                var isOptional = $option.attr('data-is-optional') === '1';
                
                // Prevent unchecking mandatory columns
                if (!checked && !isOptional) {
                    toastr.warning('This column is mandatory and cannot be hidden.');
                    $option.prop('selected', true);
                    $dropdown.multiselect('refresh');
                    return false;
                }
                
                // Validate minimum selection
                var selectedCount = $('#ddlColumnVisibilityAdmin option:selected').length;
                if (selectedCount < 1) {
                    toastr.warning('At least one column must be visible.');
                    $option.prop('selected', true);
                    $dropdown.multiselect('refresh');
                    return false;
                }
                
                // Update table visibility immediately
                UpdateTableColumnVisibilityAdmin();
                
                // Save preferences to backend
                SaveColumnPreferencesAdmin();
            },
            onDropdownShown: function(event) {
                // Add custom buttons inside the dropdown
                var $multiselectContainer = $dropdown.next('.btn-group');
                var $dropdownMenu = $multiselectContainer.find('.multiselect-container');
                
                // Remove existing buttons if they exist
                $dropdownMenu.find('.column-visibility-buttons').remove();
                
                // Create button container
                var $buttonContainer = $('<div class="column-visibility-buttons" style="padding: 8px; border-top: 1px solid #ddd; background-color: #f9f9f9; text-align: center;"></div>');
                
                // Create Show All button
                var $showAllBtn = $('<button type="button" class="btn btn-sm btn-primary" id="btnSelectAllColumnsAdmin" style="margin-right: 5px; padding: 4px 12px; font-size: 11px; width: 48%;">Show All</button>');
                
                // Create Reset button
                var $resetBtn = $('<button type="button" class="btn btn-sm btn-default" id="btnResetColumnsAdmin" style="padding: 4px 12px; font-size: 11px; width: 48%;">Reset</button>');
                
                // Append buttons to container
                $buttonContainer.append($showAllBtn).append($resetBtn);
                
                // Append container to dropdown menu
                $dropdownMenu.append($buttonContainer);
                
                // Setup Show All button - selects all columns
                $showAllBtn.off('click').on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Select all columns (mandatory are already selected and disabled)
                    $('#ddlColumnVisibilityAdmin option').each(function() {
                        if (!$(this).prop('disabled')) {
                            $(this).prop('selected', true);
                        }
                    });
                    
                    $dropdown.multiselect('refresh');
                    UpdateTableColumnVisibilityAdmin();
                    SaveColumnPreferencesAdmin();
                    toastr.success('All columns are now visible');
                    
                    return false;
                });
                
                // Setup Reset button - shows only mandatory columns
                $resetBtn.off('click').on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Reset: Only select mandatory columns (hide all optional)
                    $('#ddlColumnVisibilityAdmin option').each(function() {
                        var $option = $(this);
                        var isOptional = $option.attr('data-is-optional') === '1';
                        
                        if (!isOptional) {
                            $option.prop('selected', true);
                        } else {
                            $option.prop('selected', false);
                        }
                    });
                    
                    $dropdown.multiselect('refresh');
                    UpdateTableColumnVisibilityAdmin();
                    SaveColumnPreferencesAdmin();
                    toastr.success('Column visibility reset to mandatory columns only');
                    
                    return false;
                });
            }
        });

        // Rebuild to ensure proper rendering
        $dropdown.multiselect('rebuild');
        
        // Apply initial column visibility based on user preferences
        setTimeout(function() {
            UpdateTableColumnVisibilityAdmin();
        }, 100);
        
        console.log('Column visibility dropdown initialized successfully');
        console.log('Column mappings:', window.columnVisibilityDataAdmin.dataTableToColumnIdMap);
        
    }).fail(function(error) {
        console.error('Error loading user preferences:', error);
        toastr.error('Failed to load your column preferences');
    });
}

/**
 * Save user's column preferences to backend
 * Completely recreated to ensure proper saving
 */
function SaveColumnPreferencesAdmin() {
    var selectedOptions = $('#ddlColumnVisibilityAdmin option:selected');
    var selectedColumnIds = [];
    
    // Save ALL selected columns (both mandatory and optional) to track user preferences
    $.each(selectedOptions, function(index, option) {
        var $option = $(option);
        var columnId = $option.attr('data-column-id') || $option.val();
        if (columnId) {
            selectedColumnIds.push(parseInt(columnId));
        }
    });
    
    console.log('Saving column preferences. Selected ColumnIds:', selectedColumnIds);
    
    if (selectedColumnIds.length === 0) {
        console.warn('No columns to save');
        return;
    }
    
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Rating/SaveUserColumnPreferences?EmployeeId=" + sessionStorage.EmployeeId + "&PageType=RatingAdmin";
    var headerInfo = CommonGetHeaderInfo();
    
    // Backend expects wrapper object { VisibleColumnIds: "1,2,3,4" } for reliable [FromBody] binding in Web API 2
    var columnIdsString = selectedColumnIds.join(',');
    var requestBody = { VisibleColumnIds: columnIdsString };
    console.log('Sending column preferences to backend:', requestBody);
    
    $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'POST',
        url: apiPath,
        headers: headerInfo,
        data: JSON.stringify(requestBody),
        success: function (response) {
            console.log('Save preferences response:', response);
            if (response && response.Success) {
                // Silent success - don't show toastr for every change
                console.log('Column preferences saved successfully');
            } else {
                console.error('Failed to save preferences:', response);
                // Don't show error toastr on every change, just log it
            }
        },
        error: function (xhr, statusText, errorThrown) {
            console.error('Error saving preferences:', xhr.status, statusText, errorThrown);
            
            // Handle 401 Unauthorized - token expired
            if (xhr.status === 401) {
                console.warn('Authentication token expired. Preferences will be saved on next login.');
            } else {
                // Only show error for non-401 errors, and only occasionally
                console.error('Error saving column preferences: ' + xhr.status);
            }
        }
    });
}

/**
 * Update table column visibility based on dropdown selection
 * Completely recreated with direct DataTable index mapping
 */
function UpdateTableColumnVisibilityAdmin() {
    // Get table reference - try both window reference and direct lookup
    var table = window.tblHRBPAdminView;
    var $tableElement = $('#tblHRBPAdminView');
    
    // If window reference doesn't exist or is invalid, try to get it from the element
    if (!table || !$.fn.DataTable.isDataTable($tableElement)) {
        if ($.fn.DataTable.isDataTable($tableElement)) {
            table = $tableElement.DataTable();
            window.tblHRBPAdminView = table; // Update window reference
        } else {
            console.log('Table not found or not initialized, skipping column visibility update');
            return;
        }
    }
    
    // Verify table is still valid
    if (!table || typeof table.columns !== 'function') {
        console.log('Table is invalid, skipping column visibility update');
        return;
    }

    var selectedOptions = $('#ddlColumnVisibilityAdmin option:selected');
    
    // Validate minimum column selection
    if (selectedOptions.length < 1) {
        console.warn('No columns selected, skipping visibility update');
        return;
    }
    
    // Get selected ColumnIds
    var selectedColumnIds = [];
    $.each(selectedOptions, function(index, option) {
        var columnId = $(option).attr('data-column-id') || $(option).val();
        if (columnId) {
            selectedColumnIds.push(parseInt(columnId));
        }
    });
    
    // Get total number of columns in the table
    var totalColumns = table.columns().count();
    
    if (totalColumns === 0) {
        console.warn('Table has no columns, skipping visibility update');
        return;
    }
    
    console.log('Updating column visibility. Selected ColumnIds:', selectedColumnIds);
    console.log('Total columns in table:', totalColumns);
    console.log('DataTable to ColumnId mapping:', window.columnVisibilityDataAdmin.dataTableToColumnIdMap);
    
    // Update visibility for ALL columns based on selection
    var updatedCount = 0;
    var visibilityLog = [];
    
    // Collect all visibility changes first, then apply them
    var visibilityChanges = [];
    
    for (var dataTableIndex = 0; dataTableIndex < totalColumns; dataTableIndex++) {
        try {
            // Verify column exists and is accessible
            var column = table.column(dataTableIndex);
            if (!column) {
                console.warn('Column ' + dataTableIndex + ' does not exist');
                continue;
            }
            
            // Check if column has the visible function
            if (typeof column.visible !== 'function') {
                console.warn('Column ' + dataTableIndex + ' does not have visible function');
                continue;
            }
            
            // Get the ColumnId for this DataTable column from our mapping
            var columnId = window.columnVisibilityDataAdmin && window.columnVisibilityDataAdmin.dataTableToColumnIdMap 
                ? window.columnVisibilityDataAdmin.dataTableToColumnIdMap[dataTableIndex] 
                : undefined;
            
            // Check if this column's ColumnId is in the selected list
            var shouldBeVisible = false;
            if (columnId !== undefined && !isNaN(columnId)) {
                shouldBeVisible = selectedColumnIds.indexOf(columnId) !== -1;
            } else {
                // If no mapping exists, hide the column (it's not in the dropdown)
                shouldBeVisible = false;
            }
            
            // Log criticality columns specifically (DataTable positions 20-25)
            if (dataTableIndex >= 20 && dataTableIndex <= 25) {
                var columnNames = ['Criticality Reasons', 'Criticality Priority', 'Attrition Risk', 
                                  'Attrition Risk Reason', 'Immediate Backup Name', 'Successor Name'];
                var colName = columnNames[dataTableIndex - 20] || 'Unknown';
                visibilityLog.push('DT[' + dataTableIndex + '] ColId[' + columnId + '] ' + colName + ': ' + (shouldBeVisible ? 'VISIBLE' : 'HIDDEN'));
            }
            
            // Store the change
            visibilityChanges.push({
                index: dataTableIndex,
                visible: shouldBeVisible,
                column: column
            });
            updatedCount++;
        } catch (e) {
            console.warn('Column ' + dataTableIndex + ' could not be accessed:', e);
        }
    }
    
    // Apply all visibility changes in a batch (without redrawing)
    for (var i = 0; i < visibilityChanges.length; i++) {
        try {
            var change = visibilityChanges[i];
            // Set visibility without redrawing (false parameter)
            change.column.visible(change.visible, false);
        } catch (e) {
            console.warn('Could not set visibility for column ' + change.index + ':', e);
        }
    }
    
    // Log criticality column visibility changes
    if (visibilityLog.length > 0) {
        console.log('Criticality columns visibility update:', visibilityLog);
    }
    
    if (updatedCount === 0) {
        console.warn('No columns were updated. Table may not be fully initialized.');
        return;
    }

    // Adjust the table layout and redraw with data
    // Use a small delay to ensure DOM is updated
    try {
        setTimeout(function() {
            try {
                var $tableElement = $('#tblHRBPAdminView');
                if (!$tableElement.length || !$.fn.DataTable.isDataTable($tableElement)) {
                    console.warn('Table element not found or not a DataTable');
                    return;
                }
                
                // Check if table has data
                var tableData = table.rows().data();
                if (tableData.length === 0) {
                    console.warn('Table has no data, skipping redraw');
                    return;
                }
                
                // Adjust column widths first, then redraw with data
                table.columns.adjust();
                
                // Redraw the table with existing data (false = don't reset paging)
                table.draw(false);
                
                console.log('Table columns adjusted and redrawn with data');
            } catch (e) {
                console.warn('Could not adjust table columns:', e);
                // Try a simple redraw as fallback
                try {
                    if (table && typeof table.draw === 'function') {
                        table.draw(false);
                    }
                } catch (e2) {
                    console.error('Could not redraw table:', e2);
                }
            }
        }, 200);
    } catch (e) {
        console.warn('Error in column visibility update:', e);
    }
}


