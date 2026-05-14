$(document).ready(function () {
    $("#chkAll").hide();
    $("#spnchkAll").hide();
    BindKRASet();
    $("#btnGetKRAtoUpload").click(function () {
        $('#divUploadValidationAlert').hide();
        BindKRAToUpload();
    });
    $("#btnApproveUploadKRA").click(function () {
        $('#divUploadValidationAlert').hide();
        ApproveKRAToUpload();
    });
});


$(document).on('keyup.autocomplete', '#txtProjects', function () {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "ProjectMaster?AppraisalCycleId=" + sessionStorage.AppraisalCycleId + "&ProjectName=" + $("#txtProjects").val();
    var managerId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;
    $('#divUploadValidationAlert').hide();
    var headerInfo = {
       'Authorization': 'Bearer ' + sessionStorage.TokenValue,
        "X-EmpNo": managerId
    };

    $(this).autocomplete({
        source: function (request, response) {
            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                url: apiPath,
                dataType: "json",
                headers: headerInfo,
                success: function (data) {
                    response($.map(data.Result, function (item) {
                        return {
                            label: item.ProjectName,
                            val: $.trim(item.ProjectId)
                        }
                    }))
                },
                error: function (result) {
                    AlertMessage("#divUploadValidationAlert", "Project not be found", "D");;
                    //alert("Project not be found");
                }
            });
        },
        select: function (e, i) {
            $("[id$=hdnProjectId]").val(i.item.val);
            GetEmployeesByProjectID(i.item.val);
        },
        minLength: 3
    });

});
function GetEmployeesByProjectID(projectId) {

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "ProjectMaster?AppraisalCycleId=" + sessionStorage.AppraisalCycleId + "&ProjectId=" + projectId;

    $('[name="employees"]').remove();
    $('#ChkLstEmployee').empty();
    $("#chkAll").hide();
    $("#spnchkAll").hide();

    Employees = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    if (Employees.responseJSON.Success) {
        if (Employees.responseJSON.Result.length > 0) {
            $("#chkAll").show();
            $("#spnchkAll").show();
        }
        else {
            $("#chkAll").hide();
            $("#spnchkAll").hide();
        }

        $.each(Employees.responseJSON.Result, function (index, data) {
            $('#ChkLstEmployee').append($("<input type=\"checkbox\"  name=\"employees\" value='" + data.EmployeeId + "'>" + data.EmployeeName + " <br>"));

        });
    }
    else {
        AlertMessage("#divUploadValidationAlert", "No Employees with pending G&Os.", "D");;
        //alert("No Employees with pending KRAs.");
    }
}

function BindKRASet() {

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "UploadKRAMaster";
    KRASet = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    $('#ddlKRASet').append($("<option>").val(0).text('Select:'));
    $.each(KRASet.responseJSON.Result, function (index, data) {
        $('#ddlKRASet').append($("<option>").val(data.UploadKRASetID).text(data.KRASetName));
    });
}
function BindKRAToUpload() {
    AppraisalCycleId = sessionStorage.getItem('AppraisalCycleId');
    var KRASetId = $('#ddlKRASet').val().trim();
    var IsSet = 'Y'
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "UploadKRAMaster?KRASetId=" + KRASetId + '&IsSet="' + IsSet + '"';
    if (KRASetId > 0) {
        var result = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
        if (result.responseJSON.Success) {
            var result = result.responseJSON.Result;
            $('#tblUploadKRAList').show();
            $("#tblUploadKRAList").DataTable({
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
        $('#btnApproveUploadKRA').show();
    }
    else {
        AlertMessage("#divUploadValidationAlert", "Please select G&Os Set", "D");;
        //alert("Please select KRA Set");
    }

}

function ApproveKRAToUpload() {

    var UploadKRAArray = [];
    var svrPath = CONFIG.get('SERVERNAME');
    $('#divEmployeeList :checked').each(function () {
        var UploadKRAEmployeeSetEntity = {
            KRASetId: $('#ddlKRASet').val().trim(),
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
            //alert(Result.Result);
            AlertMessage("#divUploadValidationAlert", Result.Result, "S");;
            //Clear All controls
            $('#ddlKRASet').val('0');
            $('#btnApproveUploadKRA').hide();
            $("[id$=hdnProjectId]").val('0');
            $("#txtProjects").val('');
            $('[name="employees"]').remove();
            $('#ChkLstEmployee').empty();
            var table = $('#tblUploadKRAList').DataTable();
            table.clear()
            table.draw();
            $("#chkAll").hide();
            $("#spnchkAll").hide();
        }
        //Clear All controls
        $('#ddlKRASet').val('0');
        $('#btnApproveUploadKRA').hide();
        $("[id$=hdnProjectId]").val('0');
        $("#txtProjects").val('');
        $('[name="employees"]').remove();
        $('#ChkLstEmployee').empty();
        $('#tblUploadKRAList').hide();
        $("#chkAll").hide();
        $("#spnchkAll").hide();
    }
    else {
        AlertMessage("#divUploadValidationAlert", "No Data to Upload, Select Project, Select Employees and G&Os set to Upload the G&Os for Multiple  Employees", "D");;
        //alert("No Data to Upload, Select Project, Select Employees and KRA set to Upload the KRA for Multiple  Employees");
        //Clear All controls
        $('#ddlKRASet').val('0');
        $("[id$=hdnProjectId]").val('0');
        $("#txtProjects").val('');
        $('[name="employees"]').remove();
        $('#ChkLstEmployee').empty();
        $("#chkAll").hide();
        $("#spnchkAll").hide();
        $('#tblUploadKRAList').hide();
    }



}


$('#chkAll').change(function () {
    if ($(this).is(":checked")) {
        $('#divEmployeeList :checkbox').each(function () {
            $(this).attr("checked", "checked");
        });
    }
    else {
        $('#divEmployeeList :checkbox').each(function () {
            $(this).removeAttr("checked", "checked");
        });
    }

});
