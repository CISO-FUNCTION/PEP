$(document).ready(function () {
    $("#UploadKRA_chkAll").hide();
    $("#spnUploadKRA_chkAll").hide();
    BindKRASetGradeWise();
    LoadGradeForKRAUpload();
    $("#btnUploadKRA_GetKRAtoUpload").click(function () {
        $('#divUploadKRA_UploadValidationAlert').hide();
        BindKRAToUploadGradeWise();
    });
    $("#btnApproveUploadKRAGW").click(function () {
        $('#divUploadKRA_UploadValidationAlert').hide();
        ApproveKRAToUploadGradeWise();
    });
    $('#ddlUploadKRA_Grade').change(function () {
        $('#divUploadKRA_UploadValidationAlert').hide();
        GetEmployeesByGradeID();
    });
});

function LoadGradeForKRAUpload(){
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "EmployeeGradeMaster";
    var GradeMasterUP = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    $('#ddlUploadKRA_Grade').append($("<option>").val(0).text('Select:'));
    $.each(GradeMasterUP.responseJSON.Result, function (index, data) {
        $('#ddlUploadKRA_Grade').append($("<option>").val(data.EmployeeGradeId).text(data.EmployeeGradeName));
    });
}

function GetEmployeesByGradeID() {
    var gradeId=$('#ddlUploadKRA_Grade').val();
    var svrPath = CONFIG.get('SERVERNAME');
    var DUId = 0;
   if (sessionStorage.EmployeeRoleId == 7)
       DUId = sessionStorage.HRDUId;
   var apiPath = '';
    if(DUId==0)
        apiPath = svrPath + "EmployeeGradeMaster?gradeId=" + gradeId + "&appraisalcycleid=" + +sessionStorage.AppraisalCycleId;
   else
        apiPath = svrPath + "EmployeeGradeMaster?gradeId=" + gradeId + "&appraisalcycleid=" + +sessionStorage.AppraisalCycleId+"&DuId="+DUId;

    $('[name="employeesgw"]').remove();
    $('#UploadKRA_ChkLstEmployee').empty();
    $("#UploadKRA_chkAll").hide();
    $("#spnUploadKRA_chkAll").hide();

    Employees = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    if (Employees.responseJSON.Success) {
        if (Employees.responseJSON.Result.length > 0) {
            $("#UploadKRA_chkAll").show();
            $("#spnUploadKRA_chkAll").show();
        }
        else {
            $("#UploadKRA_chkAll").hide();
            $("#spnUploadKRA_chkAll").hide();
        }

        $.each(Employees.responseJSON.Result, function (index, data) {
            $('#UploadKRA_ChkLstEmployee').append($("<input type=\"checkbox\"  name=\"employeesgw\" value='" + data.EmployeeId + "'>" + data.EmployeeName + " - " + data.NewEmployeeCode + " <br>"));

        });
    }
    else {
        AlertMessage("#divUploadKRA_UploadValidationAlert", "No Employees with pending G&Os", "S");
    }
}

function BindKRASetGradeWise() {

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "UploadKRAMaster";
    KRASet = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    $('#ddlUploadKRA_KRASet').append($("<option>").val(0).text('Select:'));
    $.each(KRASet.responseJSON.Result, function (index, data) {
        $('#ddlUploadKRA_KRASet').append($("<option>").val(data.UploadKRASetID).text(data.KRASetName));
    });
}
function BindKRAToUploadGradeWise() {
    AppraisalCycleId = sessionStorage.getItem('AppraisalCycleId');
    var KRASetId = $('#ddlUploadKRA_KRASet').val().trim();
    var IsSet = 'Y'
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "UploadKRAMaster?KRASetId=" + KRASetId + '&IsSet="' + IsSet + '"';
    if (KRASetId > 0) {
        var result = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
        if (result.responseJSON.Success) {
            var result = result.responseJSON.Result;
            $("#tblUploadKRAListGW").show();
            $("#tblUploadKRAListGW").DataTable({
                destroy: true,
                data: result,
                aoColumns: [
                    { mData: "UploadKRASetID", visible: false, },
                    { mData: "GoalType", width: "10%" },
                    { mData: "GoalDescription", width: "20%" },
                    { mData: "Weightage", width: "10%" },
                    { mData: "Measure", width: "40%" },
                    {
                        mData: "KRAFromDate", mRender: function (data, type, full) {
                            var dt = new Date(data);
                            return formatDate_DMY(dt);
                        }, width: "10%"
                    },
                    {
                        mData: "KRAToDate", mRender: function (data, type, full) {
                            var dt = new Date(data);
                            return formatDate_DMY(dt);
                        }, width: "10%"
                    }

                ],
                order: [[2, "desc"], [1, "asc"]], //order by Goal type, Sequence
                bFilter: false,  //removes search filter
                paging: false,  //removes paging header footer
                LengthChange: false, //removes shwoing entries
                bInfo: false,
                autoWidth: false
            });
        }
        $('#btnApproveUploadKRAGW').show();
    }
    else {
        AlertMessage("#divUploadKRA_UploadValidationAlert", "Please select G&Os Set", "D");;
    }

}

function ApproveKRAToUploadGradeWise() {

    var UploadKRAArray = [];
    var svrPath = CONFIG.get('SERVERNAME');
    $('#divUploadKRAEmployeeList :checked').each(function () {
        var UploadKRAEmployeeSetEntity = {
            KRASetId: $('#ddlUploadKRA_KRASet').val().trim(),
            EmployeeId: $(this).val(),
            ApprovedBy: sessionStorage.getItem('EmployeeId'),
            AppraisalCycleId: sessionStorage.getItem('AppraisalCycleId')
        }
        UploadKRAArray.push(UploadKRAEmployeeSetEntity);
    });

    if (UploadKRAArray.length > 0) {
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + '/UploadKRAMaster/';

        var headerInfo = {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            "X-EmpNo": sessionStorage.EmployeeId == undefined ? 2717 : sessionStorage.EmployeeId,
        };

        var Result = CommonAjaxPOST_Array(apiPath, UploadKRAArray, headerInfo);
        if (Result.Success) {
            AlertMessage("#divUploadKRA_UploadValidationAlert", "G&Os Uploaded successfully", "S");
        }
    }
    else {
        AlertMessage("#divUploadKRA_UploadValidationAlert", "No Data to Upload, Select Grade, Select Employees and G&Os set to Upload the G&Os for Multiple  Employees", "D");
    }

    //Clear All controls
    $('#ddlUploadKRA_KRASet').val('0');
    //$('#btnApproveUploadKRAGW').hide();
    $("[id$=hdnUploadKRA_GradeId]").val('0');
    $("#ddlUploadKRA_Grade").val('0');
    $('[name="employeesgw"]').remove();
    $('#UploadKRA_ChkLstEmployee').empty();
    $('#tblUploadKRAListGW').hide();
    $("#UploadKRA_chkAll").hide();
    $("#spnUploadKRA_chkAll").hide();

}


$('#UploadKRA_chkAll').change(function () {
    if ($(this).is(":checked")) {
        $('#divUploadKRAEmployeeList :checkbox').each(function () {
            $(this).attr("checked", "checked");
        });
    }
    else {
        $('#divUploadKRAEmployeeList :checkbox').each(function () {
            $(this).removeAttr("checked", "checked");
        });
    }

});
