var AppraisalTypeMaster;

/*Page Load*/
var DUHR_id = 7;

function LoadQuestionnaireMasterCtrl() {
    GetAllQuestionnaires();
    LoadAreaDdls();
    fnLimitText($("#txtQuestion"), $("#txtQuestionRemaining"))
}
function LoadAppraisalCycleMasterCtrl() {
    AttachDatePicker();
    LoadCompanyDdls();
    LoadAppraisalType();
    BindAppraisalCycleGrid();
    LoadStatus();
}
function LoadEmployeeAwardCtrl() {
    BindEmployeeAwardsGrid()
   AttachDatePicker();
    AttachSearchAutoComplete('#txtEA_EmployeeNames', 'hdnEA_EmployeeId');
}
function LoadEmployeeRoleCtrl() {
    LoadEmployeeRoles();
    //AttachSearchAutoComplete('#txtER_EmployeeNames', 'hdnER_EmployeeId');
  //  BindEmployeeRoleGrid();
}

function LoadGeneralSetupCtrl() {
    LoadGeneralSetting();
}

function LoadGeneralSetting() {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'GeneralSetup?FeedbackLimitId=1&PieChartParameterId=1';
    var Result = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    if(Result.responseJSON.Success)
    {
        $('#txtFeedbacklimit').val(Result.responseJSON.Result.FeedbackLimit.FeedbackFlowLimit);
        $('#txtPiechartParameter').val(Result.responseJSON.Result.PieChart.Number);

        $("#hdnFeedbackLimitId").val(Result.responseJSON.Result.FeedbackLimit.FeedbackLimitID);
        $("#hdnPieChartParameter").val(Result.responseJSON.Result.PieChart.Id);
    }
}
function SaveGeneralSetUp() {
    var svrPath = CONFIG.get('SERVERNAME');
    var FeedbackLimitId = $("#hdnFeedbackLimitId").val();
    var FeedbackLimitValue = $('#txtFeedbacklimit').val();
    var PieChartParameterId = $("#hdnPieChartParameter").val();
    var PieChartParameterValue = $('#txtPiechartParameter').val();
    var EmployeeId = sessionStorage.EmployeeId;
    if (FeedbackLimitValue.trim() == "" || PieChartParameterValue.trim() == "") {
        alert("All fields need to be filled.");
        $('#txtFeedbacklimit').focus();
    } else {
        var apiPath = svrPath + "GeneralSetup?FeedbackLimitId=" + FeedbackLimitId + "&FeedbackLimitValue=" + FeedbackLimitValue + "&PieChartParameterId=" + PieChartParameterId + "&PieChartParameterValue=" + PieChartParameterValue + "&EmployeeId=" + EmployeeId;
        var Result = CommonAjaxPUT(apiPath, CommonGetHeaderInfo());
       // alert(Result.responseJSON.Result);
    }
};

/**API functions**/
function GetMasterValues(ControllerName) {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + ControllerName;
    var result = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    if (result.responseJSON.Success)
        return result.responseJSON.Result;
    return null;
}
function InsertMasterValue(MasterValue, ControllerName) {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + ControllerName;

    debugger;
    return CommonAjaxPOST_Array(apiPath, MasterValue, CommonGetHeaderInfo());
}
function UpdateMasterValue(MasterValue, ControllerName) {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "/" + ControllerName;
    //var test = encodeURI(apiPath);
    //alert(test);
    return CommonAjaxPUT_Array(apiPath, MasterValue, CommonGetHeaderInfo());
}
function DeleteMasterValue(MasterValue, ControllerName) {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "/" + ControllerName + "?id=" + MasterValue;
    return CommonAjaxDELETE(apiPath, CommonGetHeaderInfo());
}

/*DDLs*/
function LoadCompanyDdls() {
    $('.PEPCompanyMasterDDL').empty();
    $('.PEPCompanyMasterDDL').append($("<option>").val(0).text('All'));
    //var CompanyMaster = GetMasterValues("CompanyMaster");
    //$.each(CompanyMaster, function (index, data) {
    //    $('.PEPCompanyMasterDDL').append($("<option>").val(data.CompanyId).text(data.CompanyName));
    //});
}
function LoadAppraisalType() {
    $('#ddlAppraisalCycleType').empty();
    AppraisalTypeMaster = GetMasterValues("AppraisalTypeMaster");
    //var companyWiseAT = $.grep(AppraisalTypeMaster, function (e) { return e.CompanyId == CompanyId; });
    console.log(AppraisalTypeMaster);
    if (AppraisalTypeMaster != null) {
        $.each(AppraisalTypeMaster, function (index, data) {
            $('#ddlAppraisalCycleType').append($("<option>").val(data.AppraisalTypeId).text(data.AppraisalTypeName));
        });
    } else {
        $('#ddlAppraisalCycleType').append($("<option>").val(0).text('Not Set'));
    }
}
function LoadStatus() {
    $('#ddlAppCycleStatus').empty();
    var type = "APPRAISALCYCLE";
    var lstStatusMaster = GetMasterValues("StatusMaster/GetType?StatusType=" + type);
    $('#ddlAppCycleStatus').append($("<option>").val(0).text("Select a Status:"));
    if (lstStatusMaster.length != 0) {
        $.each(lstStatusMaster, function (index, data) {
            $('#ddlAppCycleStatus').append($("<option>").val(data.StatusId).text(data.StatusDescription));
        });
    } else {
        $('#ddlAppCycleStatus').append($("<option>").val(0).text('Not Set'));
    }
}
function LoadEmployeeList() {
    //$("#txtEA_EmployeeNames").autocomplete({
    //    source: function (request, response) { GetEmpName(request, response); }
    //});

}
function LoadEmployeeRoles() {
    $('#ddlER_EmployeeRole').empty();
    var lstStatusMaster = GetMasterValues("EmployeeRoleMaster");
    $('#ddlER_EmployeeRole').append($("<option>").val(0).text("Select a Role:"));
    if (lstStatusMaster.length != 0) {
        $.each(lstStatusMaster, function (index, data) {
            $('#ddlER_EmployeeRole').append($("<option>").val(data.EmployeeRoleId).text(data.EmployeeRoleName));
        });
    } else {
        $('#ddlER_EmployeeRole').append($("<option>").val(0).text('Not Set'));
    }
}
function LoadDU() {
    $('#ddlER_DU').show();
    $('#ddlER_DU').empty();
    var lstStatusMaster = GetMasterValues("DeliveryUnit");
    $('#ddlER_DU').append($("<option>").val(0).text("Select a delivery unit:"));
    if (lstStatusMaster.length != 0) {
        $.each(lstStatusMaster, function (index, data) {
            $('#ddlER_DU').append($("<option>").val(data.DeliveryUnitID).text(data.DeliveryUnit));
        });
    } else {
        $('#ddlER_DU').append($("<option>").val(0).text('Not Set'));
    }
}
function OnAppraisalCycleStatusChange() {
    var appcyclestatusId = $('#ddlAppCycleStatus').val();
    if (!appcyclestatusId || appcyclestatusId === '0') {
        return;
    }
    var statusMaster = GetMasterValues("StatusMaster/GetKRAById?Id=" + appcyclestatusId);
    if (!statusMaster || !statusMaster.StatusDescription) {
        return;
    }
    if (statusMaster.StatusDescription == 'Cancelled' || statusMaster.StatusDescription == 'Completed') {
        $('#chkIsActive')[0].checked = false;
    } else {
        $('#chkIsActive')[0].checked = true;
    }
}
function onRoleChange() {
    var RoleId=$('#ddlER_EmployeeRole').val();
    if (RoleId == DUHR_id) {
        $('#ddlER_DU').show();
        var path = 'DeliveryUnit?Type=' + 'HR' + '&EmployeeId=' + $('#hdnER_EmployeeId').val();
        var duhr = GetMasterValues(path);
        LoadDU();
        if (duhr != null) {
            $('#ddlER_DU').show();
            $('#ddlER_DU').val(duhr.DUId);
        } 
    } else {
        $('#ddlER_DU').val(0);
        $('#ddlER_DU').hide();
    }
}

/*Tables*/
function BindAppraisalCycleGrid() {
    var lstAppraisalCycleMaster = GetMasterValues("AppraisalCycle/AppraisalCycleWithProcedure?Id=0&procedure=''");
    if (lstAppraisalCycleMaster != null) {
        $('#tblAppraisalCycleMaster').show();
        $('#tblAppraisalCycleMaster').DataTable({
            destroy: true,
            data: lstAppraisalCycleMaster,
            aoColumns: [
                { mData: "CompanyName", visible: false },
                { mData: "AppraisalTypeName", visible: false },
                { mData: "AppraisalCycleName" },
                { mData: "AppraisalCycleDesc" },
                {
                    mData: "StartDate", mRender: function (data, type, full) {
                        var dt = new Date(data);
                        return formatDate_DMY(dt);
                    }
                },
                {
                    mData: "EndDate", mRender: function (data, type, full) {
                        var dt = new Date(data);
                        return formatDate_DMY(dt);
                    }
                },
                { mData: "StatusDescription" },
                { mData: "IsActive" },
                {
                    mRender: function (data, type, full) {
                        var setbutton = '<button class="btn btn-info  btn-xs btn-round" title="Edit" id="btnACEdit_'
                            + full['AppraisalCycleId'] + '" onclick="EditAppraisalCycle(' + full['AppraisalCycleId']
                            + ')" ><span class="glyphicon glyphicon-edit"></span></button>';
                        return setbutton;
                    }
                }
               
            ],
            order: [[2, "desc"], [1, "asc"]], //order by Goal type, Sequence
            bFilter: false,  //removes search filter
            paging: false,  //removes paging header footer
            LengthChange: false, //removes shwoing entries
            bInfo: false,
            autoWidth: false
        });
    } else {
        $('#tblAppraisalCycleMaster').hide();
    }
}
function EditAppraisalCycle(AC_Id) {
    $("#divAC_ValidationAlert").hide();
    var AC_Result = GetMasterValues("AppraisalCycle/AppraisalCycleWithProcedure?Id=" + AC_Id + "&procedure=''");
    if (AC_Result != null) {
        var AC_ResultData = AC_Result[0];
        //$('#ddlAppraisalCycleCompany').val(AC_ResultData.CompanyId);
        $('#ddlAppraisalCycleType').val(AC_ResultData.AppraisalTypeId);//LoadAppraisalType(AC_ResultData.CompanyId)
        $('#txtAppCycleName').val(AC_ResultData.AppraisalCycleName);
        $('#txtAppCycleDesc').val(AC_ResultData.AppraisalCycleDesc);
        $('#hdnAppCycleId').val(AC_ResultData.AppraisalCycleId);
        var dt = new Date(AC_ResultData.StartDate);
        $('#txtAppCycleStartDate').val(formatDate_DMY(dt));
        dt = new Date(AC_ResultData.EndDate);
        $('#txtAppCycleEndDate').val(formatDate_DMY(dt));
        $('#ddlAppCycleStatus').val(AC_ResultData.StatusId);
        if (AC_ResultData.IsActive == 1)
            $('#chkIsActive')[0].checked = true;
        else
            $('#chkIsActive')[0].checked = false;
        $('#btnAC_UpSert').val(strUpdate);
    } else {
        AlertMessage('#divAC_ValidationAlert', strErrorMsg, 'D');
    }
}
function BindEmployeeAwardsGrid() {
    var ea_filtertype = 'ALL';
    var ea_id = 0;
    var ea_procedure = 'true';
    if (sessionStorage.EmployeeRoleId == 3) {
        ea_filtertype = 'MANAGER';
        ea_id = sessionStorage.EmployeeId;
    }
    if (sessionStorage.EmployeeRoleId == 4) {
        ea_filtertype = 'LOCATION';
        ea_id = sessionStorage.LocationId;
    }
    var controllerpath = 'EmployeeAward/?filtertype=' + ea_filtertype + '&id=' + ea_id + '&procedure=' + ea_procedure;
    var lstEmployeeAwards = GetMasterValues(controllerpath);
    if (lstEmployeeAwards != null) {
        $('#tblEA_Master').show();
        $('#tblEA_Master').DataTable({
            destroy: true,
            data: lstEmployeeAwards,
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
                { mData: "EmployeeName" },
                { mData: "Heading" },
                { mData: "Description" },
                {
                    mData: "AwardDate", mRender: function (data, type, full) {
                        return formatDate_DMY(new Date(data));
                    }, width:"10%"
                },
                { mData: "ManagerName" },
                { mData: "LocationName" },
                {
                    mRender: function (data, type, full) {
                        var dt_start = new Date(full["AppraisalStartDate"]);
                        var dt_end = new Date(full["AppraisalEndDate"]);
                        return formatDate_DMY(dt_start) + ' to ' + formatDate_DMY(dt_end);
                    }
                },
                {
                    mRender: function (data, type, full) {
                        var setbutton = '<button class="btn btn-info  btn-xs btn-round" title="Edit" id="btnEAEdit_'
                            + full['AwardId'] + '" onclick="EditEmployeeAward(' + full['AwardId']
                            + ')" ><span class="glyphicon glyphicon-edit"></span></button><button class="btn btn-danger  btn-xs btn-round pull-right" title="Delete" id="btnEADelete_'
                            + full['AwardId'] + '" onclick="DeleteEmployeeAward(' + full['AwardId']
                            + ')" ><span class="glyphicon glyphicon-trash"></span></button>';
                        return setbutton;
                    }, width:"6%"
                }
            ],
            order: [[3, "desc"], [0, "asc"]]
        });
    } else {
        $('#tblEA_Master').hide();
    }
}
function EditEmployeeAward(AwardId) {
    $("#divEA_ValidationAlert").hide();
    var ea_filtertype = 'AWARD';
    var ea_id = AwardId;
    var ea_procedure='true';
    var controllerpath = 'EmployeeAward/?filtertype=' + ea_filtertype + '&id=' + ea_id + '&procedure=' + ea_procedure;
    var EA_Result = GetMasterValues(controllerpath);
    if (EA_Result != null) {
        var EA_ResultData = EA_Result[0];
        $('#txtEA_EmployeeNames').val(EA_ResultData.EmployeeName);//LoadAppraisalType(AC_ResultData.CompanyId)
        $('#txtEA_EmployeeNames').prop('readonly', true);
        $('#hdnEA_EmployeeId').val(EA_ResultData.EmployeeId);
        $('#hdnEA_AwardId').val(EA_ResultData.AwardId);
        $('#txtEA_AwardHeading').val(EA_ResultData.Heading);
        $('#txtEA_AwardDescription').val(EA_ResultData.Description);
        $('#txtEA_AwardDate').val(formatDate_DMY(new Date(EA_ResultData.AwardDate)));
        $('#btnEA_UpSert').val(strUpdate);
    } else {
        AlertMessage('#divEA_ValidationAlert', strErrorMsg, 'D');
    }
}


$("#txtER_EmployeeNames").autocomplete({
    source: function (request, response) { GetEmpName(request, response); },
    select: function (e, i) {
            $("[id$=hdnER_EmployeeId]").val(i.item.val);
            GetEmployeeRole();
    },
    minLength: 3
});
$("#txtER_EmployeeNames").on("input propertychange", function () {
    $("[id$=hdnER_EmployeeId]").val("");
});


/*Button*/
function SaveAppraisalCycle() {
    var isvalid = true;
    var AC_Id = $('#hdnAppCycleId').val().trim();
    var AC_CompanyId = $('#ddlAppraisalCycleCompany').val();
    var AC_AppTypeId = $('#ddlAppraisalCycleType').val();
    var AC_Name = $('#txtAppCycleName').val().trim();
    var AC_Desc = $('#txtAppCycleDesc').val().trim();
    var AC_StartDate = $('#txtAppCycleStartDate').val().trim();
    var AC_EndDate = $('#txtAppCycleEndDate').val().trim();
    var AC_StatusId = $('#ddlAppCycleStatus').val().trim();
    var AC_IsActive = $('#chkIsActive')[0].checked ? 1 : 0;
    var btnAC_UpSert = $('#btnAC_UpSert').val().trim();
    var status_result;

    if (AC_Name == '' || AC_Desc == '' || AC_StartDate == '' || AC_EndDate == '' || AC_StatusId==0) {
        AlertMessage('#divAC_ValidationAlert', strEmptyFieldValidation, 'D');
        isvalid = false;
        return false;
    } else {
        AC_StartDate = foramtDate_DMY2YMD($('#txtAppCycleStartDate').val().trim());
        AC_EndDate = foramtDate_DMY2YMD($('#txtAppCycleEndDate').val().trim());
    }

    if (isvalid) {
        var appCycleM = {
            AppraisalCycleId: AC_Id,
            CompanyId: AC_CompanyId,
            AppraisalTypeId: AC_AppTypeId,
            AppraisalCycleName: AC_Name,
            AppraisalCycleDesc: AC_Desc,
            StartDate: AC_StartDate,
            EndDate: AC_EndDate,
            IsActive: AC_IsActive,
            StatusId: AC_StatusId
        };

        var Result;
        var SuccessMsg = '';
        if (btnAC_UpSert == strUpdate) {
            var modifiedbyId = { ModifiedBy: sessionStorage.getItem('EmployeeId') };
            $.extend(appCycleM, modifiedbyId);
            Result = UpdateMasterValue(appCycleM, "AppraisalCycle");
            SuccessMsg = strUpdateSuccess;
        }
        else {
            var createdbyId = { CreatedBy: sessionStorage.getItem('EmployeeId') };
            $.extend(appCycleM, createdbyId);
            Result = InsertMasterValue(appCycleM, "AppraisalCycle");
            debugger;
            SuccessMsg = strInsertSuccess;
        }
        if (Result.Success) {
            BindAppraisalCycleGrid();
            AlertMessage('#divAC_ValidationAlert', SuccessMsg, 'I');
            ClearForm('AC');
        }
        else
            AlertMessage('#divAC_ValidationAlert', 'Error in ' + Result.Result.FieldName + ' Field - ' + Result.Result.ErrorMessage, 'D');
    }
}
function SaveEmployeeAwards() {
    var isvalid = true;
    var EA_AwardId = $('#hdnEA_AwardId').val().trim();
    var EA_EmployeeId = $('#hdnEA_EmployeeId').val().trim();
    var EA_AwardHeading = $('#txtEA_AwardHeading').val().trim();
    var EA_AwardDescription = $('#txtEA_AwardDescription').val().trim();
    var EA_AwardDate = $('#txtEA_AwardDate').val().trim();
    var btnEA_UpSert = $('#btnEA_UpSert').val().trim();
    var status_result;

    if (EA_EmployeeId == '' || EA_AwardHeading == '' || EA_AwardDescription == '' || EA_AwardDate == '') {
        AlertMessage('#divEA_ValidationAlert', strEmptyFieldValidation, 'D');
        isvalid = false;
        return false;
    } else {
        EA_AwardDate = foramtDate_DMY2YMD(EA_AwardDate);
    }

    if (isvalid) {
        var employeeAward = {
            EmployeeId: EA_EmployeeId,
            Heading: EA_AwardHeading,
            Description: EA_AwardDescription,
            AwardDate: EA_AwardDate
        };

        var Result;
        var SuccessMsg = '';
        if (btnEA_UpSert == strUpdate) {
            var awardId = { AwardId: EA_AwardId };
            $.extend(employeeAward, awardId);
            Result = UpdateMasterValue(employeeAward, "EmployeeAward");
            SuccessMsg = strUpdateSuccess;
        }
        else {
            //var createdbyId = { CreatedBy: sessionStorage.getItem('EmployeeId') };
            //$.extend(employeeAward, createdbyId);
            Result = InsertMasterValue(employeeAward, "EmployeeAward");
            SuccessMsg = strInsertSuccess;
        }
        if (Result.Success) {
            BindEmployeeAwardsGrid();
            ClearForm('EA');
            AlertMessage('#divEA_ValidationAlert', SuccessMsg, 'I');
        }
        else
            AlertMessage('#divEA_ValidationAlert', 'Error in ' + Result.Result.FieldName + ' Field - ' + Result.Result.ErrorMessage, 'D');
    }
}
function DeleteEmployeeAward(Id) {
     $("#divEA_ValidationAlert").hide();
     EmpAward = DeleteMasterValue(Id,'EmployeeAward');
     if (EmpAward) {
        BindEmployeeAwardsGrid();
        ClearForm('EA');
        AlertMessage('#divEA_ValidationAlert', strDeleteMsg, 'I');
        return true;
    } else {
        AlertMessage('#divValidationAlert', strErrorMsg, 'D');
        return false;
    }
}
function SaveEmployeeRole() {
    var isvalid = true; 
    var ER_EmployeeId = $('#hdnER_EmployeeId').val().trim();
    var ER_EmployeeRoleId = $('#ddlER_EmployeeRole').val().trim();
    var btnER_Update = $('#btnER_Update').val().trim();
    var status_result;

    //if (ER_EmployeeId == '' || ER_EmployeeRoleId == 0) {
    //    AlertMessage('#divER_ValidationAlert', "Ensure that all fields are filled correctly", 'D');
    //    isvalid = false;
    //    return false;
    //}
    var SubOrdinateCount = IsSubordinateReporting();
    if ((SubOrdinateCount.responseJSON.Success) && (ER_EmployeeRoleId==1))
    {
        AlertMessage('#divER_ValidationAlert', "Role can not be changed, Subordinates are reporting to selected manager ", 'D');
        isvalid = false;
        return false;
    }

 

    if (isvalid) {
        var employeeRole = {};
        var Result;
        var SuccessMsg = '';
        if (ER_EmployeeRoleId != DUHR_id) {
            Result = UpdateMasterValue(employeeRole, "EmployeeMaster?ToEmployeeId=" + ER_EmployeeId + "&ByEmployeeId=" + sessionStorage.EmployeeId + "&RoleId=" + ER_EmployeeRoleId);
        } else {
            
            var  DUId = $('#ddlER_DU').val();
            Result = UpdateMasterValue(employeeRole, "EmployeeMaster?ToEmployeeId=" + ER_EmployeeId + "&ByEmployeeId=" + sessionStorage.EmployeeId + "&RoleId=" + ER_EmployeeRoleId + "&multi=1"+ "&DUId=" + DUId);
            //var DUArrayList = [];
            //$('#ddlER_DU :checked').each(function () {
            //    var DUArray = {
            //        ToEmployeeId: ER_EmployeeId,
            //        ByEmployeeId: sessionStorage.EmployeeId,
            //        RoleId: ER_EmployeeRoleId,
            //        DUId: $(this).val(),
            //        employeeRole:employeeRole
            //    }
            //    DUArrayList.push(DUArray);
            //});
            //if (UploadKRAArray.length > 0) {
            //    var svrPath = CONFIG.get('SERVERNAME');
            //    var apiPath = svrPath + '/UploadKRAMaster/';
            //    Result = UpdateMasterValue(DUArrayList, EmployeeMaster);
        }
        SuccessMsg = strUpdateSuccess;
        if (Result.Success) {
            ClearForm('ER');
            AlertMessage('#divER_ValidationAlert', SuccessMsg, 'I');
          //  BindEmployeeRoleGrid();
        }
        else
            AlertMessage('#divER_ValidationAlert', 'Error in ' + Result.Result.FieldName + ' Field - ' + Result.Result.ErrorMessage, 'D');
    }
}


/*Enable-Disable*/
function enableForm($formname) {
    $($formname + ":input").prop("disabled", false);
}
function disableForm($formname) {
    $($formname + ":input").prop("disabled", true);
}

/*Misc*/
function AttachDatePicker() {
    $(".DatePicks").datepicker({
        dateFormat: 'dd-mm-yy'
    });
}
function AttachSearchAutoComplete($textbox, hdntextbox_name) {
    $(document).on('keyup.autocomplete', $textbox, function () {
        $("#" + hdntextbox_name).val('');
        var svrPath = CONFIG.get('SERVERNAME');
        var locationId = 0;
        if (sessionStorage.EmployeeRoleId == 4)
            locationId = sessionStorage.LocationId;
        var apiPath = svrPath + 'Search?Name=' + $($textbox).val() + '&LocationId=' + locationId; //var apiPath = svrPath + "Search?name=" + $($textbox).val();
        var adminId = sessionStorage.EmployeeId;
        var token = sessionStorage.TokenValue;
        var headerInfo = CommonGetHeaderInfo();
        $(this).autocomplete({
            source: function (request, response) {
                $.ajax({
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    url: apiPath,
                    dataType: "json",
                    headers: headerInfo,
                    success: function (data) {
                        //if (hdntextbox_name == 'hdnER_EmployeeId') {
                        //    response($.map(data.Result, function (item) {
                        //        return {
                        //            label: item.FirstName + ' ' + item.LastName + ' -' + item.NewEmployeeCode,
                        //            val: $.trim(item.EmployeeId + '-' + item.EmployeeRoleId)
                        //        }
                        //    }));
                        //} else {
                        response($.map(data.Result, function (item) {
                            var nm = CommonGetName(item.FirstName, item.LastName);
                                return {
                                    label: nm + ' -' + item.NewEmployeeCode,
                                    val: $.trim(item.EmployeeId)
                                }
                            }));
                        //}
                    },
                    error: function (result) {
                        $("#" + hdntextbox_name).val('');
                    }
                });
            },
            select: function (e, i) {
                //if (hdntextbox_name == 'hdnER_EmployeeId') {
                //    var split_value = i.item.val;
                //    var emp_arr_1 = split_value.split('-');
                //    $("[id$=" + hdntextbox_name + "]").val(emp_arr_1[0]);
                //    $('#ddlER_EmployeeRole').val(emp_arr_1[1]);
                //} else {
                    $("[id$=" + hdntextbox_name + "]").val(i.item.val);
                //}
            },
            minLength: 3
        });
        $(".ui-autocomplete").css("z-index", "2147483647"); //use this to show autocomplete list when using popup like div
    });
}
function AlertMessage($item, msg, type) {
    var $alert = $($item);
    $alert.show();
    $alert.empty();
    $alert.append(msg + '<button class="close" data-hide="alert" aria-label="close">&times;</button>');

    $($item + " button").click(function (ev) {
        $alert.hide();
        ev.preventDefault();
        return false;
    });

    if (type == 'D') {
        $alert.removeClass('alert-success');
        $alert.addClass('alert-danger');
    } else {
        $alert.removeClass('alert-danger');
        $alert.addClass('alert-success');
    }

}
function ClearForm(MasterType) {
    switch (MasterType) {
        case 'AC':
            $('#ddlAppraisalCycleCompany').val(0);
            LoadAppraisalType(0)
            $('#txtAppCycleName').val('');
            $('#txtAppCycleDesc').val('');
            $('#hdnAppCycleId').val('');
            var dt = new Date();
            $('#txtAppCycleStartDate').val('');
            $('#txtAppCycleEndDate').val('');
            $('#ddlAppCycleStatus').val(0);
            $('#chkIsActive')[0].checked = true;
            $('#btnAC_UpSert').val(strInsert);
            $('#divAC_ValidationAlert').hide();
            break;
        case 'QM':
            $(".PEPAreaMasterDDL").val($(".PEPAreaMasterDDL option:first").val());
            //$(".PEPAreaMasterDDL").val(0);
            $("#txtQuestion").val('');
            $("#txtRate1").val('');
            $("#txtRate2").val('');
            $("#txtRate3").val('');
            $("#txtRate4").val('');
            $("#txtRate5").val('');
            $('#hdnQuestionnaireId').val('');
            $('.isActive').prop('checked', 'checked');
            $('#divQM_ValidationAlert').hide();
            $('#btnQM_UpSert').val(strInsert);
            fnLimitText($("#txtQuestion"), $("#txtQuestionRemaining"));
            break;
        case 'EA':
            $('#hdnEA_AwardId').val('');
            $('#txtEA_EmployeeNames').val('');
            $('#txtEA_EmployeeNames').prop('readonly', false);
            $('#hdnEA_EmployeeId').val('');
            $('#txtEA_AwardHeading').val('');
            $('#txtEA_AwardDescription').val('');
            var dt = new Date();
            $('#txtEA_AwardDate').val('');
            $('#btnEA_UpSert').val(strInsert);
            $('#divEA_ValidationAlert').hide();
            break;
        case 'ER':
            $("#txtER_EmployeeNames").val('');
            $("#hdnER_EmployeeId").val('');
            $("#ddlER_EmployeeRole").val(0);
            $('#divER_ValidationAlert').hide();
            $('#ddlER_DU').val(0);
            $('#ddlER_DU').hide();
            break;
        case 'GS':
            $("#txtFeedbacklimit").val('');
            $("#txtPiechartParameter").val('');

            break;
        default:
            break;
    }
}


function GetAllQuestionnaires() {

    var lstQuestionMaster = GetMasterValues("QuestionaryMaster");
    if (lstQuestionMaster != null) {
        $("#tblQuestionnaireMaster").DataTable({
            destroy: true,
            data: lstQuestionMaster,
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
                     mData: "AreaName", "mRender": function (data, type, full) {
                         if (full["AreaID"] == 1)
                             return "Behavioural Competencies";
                         else
                             return "G&Os";
                     }
                 },
                 { mData: "Question" },
                 { mData: "Rate1" },
                 { mData: "Rate2" },
                 { mData: "Rate3" },
                 { mData: "Rate4" },
                 { mData: "Rate5" },
                 {
                    mData: "IsActive",
                    "sClass": "left",
                    "mRender": function (data, type, full) {
                        if (full["IsActive"] == 1)
                            return "Yes";
                        else
                            return "No";
                 }
                },
             {
                 mRender: function (data, type, full) {
                     var setbutton = '<button class="btn btn-info  btn-xs btn-round" title="Edit" id="btnQuestionEdit_' + full['QuestionaireId'] + '" onclick="loadQuestionnaireEditTable(' + full['QuestionaireId'] + ')" ><span class="glyphicon glyphicon-edit"></span></button>';
                     return setbutton;
                 }
             },
                    {
                        mRender: function (data, type, full) {
                            var setbutton = '<button class="btn btn-danger btn-xs btn-round" title="Delete" id="btnQuestionDelete_' + full['QuestionaireId'] + '" onclick="DeleteQuestionnaireTable(' + full['QuestionaireId'] + ')"><span class="glyphicon glyphicon-trash"></span></button>';
                            return setbutton;
                        }
                    }
            ]

        });

    }
    else {
       //F $('#tblQuestionnaireMaster').hide();
    }
}
function DeleteQuestionnairebyId(QuestionnaireId) {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "/QuestionaryMaster?QuestionnaireId=" + QuestionnaireId;
    return CommonAjaxDELETE(apiPath, CommonGetHeaderInfo());
}
function DeleteQuestionnaireTable(QuestionnaireId) {
    $("#divQM_ValidationAlert").hide();
    var QuestionnaireData = DeleteQuestionnairebyId(QuestionnaireId);
    if (QuestionnaireData) {
        GetAllQuestionnaires();
        //  BindKRAGrid(sessionStorage.getItem('EmployeeId'), AppraisalCycleId);
        // ClearKRAForm();
        AlertMessage('#divQM_ValidationAlert', strKRADeleteMsg, 'I');
        return true;
    } else {
        AlertMessage('#divQM_ValidationAlert', strKRAErrorMsg, 'D');
        return false;
    }

}
function GetQuestionnairebyId(QuestionnaireId) {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "/QuestionaryMaster?id=" + QuestionnaireId;
    var QuestionnnaireData;
    QuestionnnaireData =



        (apiPath, CommonGetHeaderInfo());
    return QuestionnnaireData;
}
function loadQuestionnaireEditTable(QuestionnaireId) {
    $("#divQM_ValidationAlert").hide();
    var QuestionnaireResult = GetQuestionnairebyId(QuestionnaireId);
    if (QuestionnaireResult.responseJSON.Success) {
        var QuestionnaireData = QuestionnaireResult.responseJSON.Result;
        $('#txtQuestion').val(QuestionnaireData.Question);
        $('#hdnQuestionnaireId').val(QuestionnaireId);
        $('#txtRate1').val(QuestionnaireData.Rate1);
        $('#txtRate2').val(QuestionnaireData.Rate2);
        $('#txtRate3').val(QuestionnaireData.Rate3);
        $('#txtRate4').val(QuestionnaireData.Rate4);
        $('#txtRate5').val(QuestionnaireData.Rate5);
        var isactive = QuestionnaireData.IsActive;
        if (isactive == 1)
            $('.isActive').prop('checked', true);
        else
            $('.isActive').prop('checked', false);
        $('#btnQM_UpSert').val(strUpdate);
        var selectedValue = QuestionnaireData.AreaID;
        $('.PEPAreaMasterDDL').val(selectedValue);
        fnLimitText($("#txtQuestion"), $("#txtQuestionRemaining"));
    } else {
        AlertMessage('#divQM_ValidationAlert', strKRAErrorMsg, 'D');
    }
}
function LoadAreaDdls() {
    $('.PEPAreaMasterDDL').empty();
    var AreaMaster = GetMasterValues("AreaMaster");
    $.each(AreaMaster, function (index, data) {
        $('.PEPAreaMasterDDL').append($("<option>").val(data.AreaID).text(data.AreaName));
    });
}
function SaveQuestionMaster() {
    var isvalid = true;
    var isActiveValue = 0;

    if ($('.isActive').is(":checked")) {
        isActiveValue = 1;
    }
    else
        isActiveValue = 0;

    var QM_IsActive = isActiveValue;
    var btnQM_UpSert = $('#btnQM_UpSert').val().trim();
    var status_result;

    if (isvalid) {
        var questionMaster = {
            QuestionnaireId: $('#hdnQuestionnaireId').val().trim(),
            Question: $('#txtQuestion').val().trim(),
            QuestionTypeId: $('#ddlAreaQM').val(),
            QuestionDesc1:  $('#txtQuestion').val().trim(),
            IsActive: QM_IsActive,
            AreaID: $('#ddlAreaQM').val(),
            Rate1: $('#txtRate1').val().trim(),
            Rate2: $('#txtRate2').val().trim(),
            Rate3: $('#txtRate3').val().trim(),
            Rate4: $('#txtRate4').val().trim(),
            Rate5: $('#txtRate5').val().trim(),
        };

        var Result;
        var SuccessMsg = '';
        if (btnQM_UpSert == strUpdate) {
            var modifiedbyId = { ModifiedBy: sessionStorage.getItem('EmployeeId') };
            $.extend(questionMaster, modifiedbyId);
            Result = UpdateMasterValue(questionMaster, "QuestionaryMaster");
            SuccessMsg = strUpdateSuccess;
        }
        else {
            var createdbyId = { CreatedBy: sessionStorage.getItem('EmployeeId') };
            $.extend(questionMaster, createdbyId);
            Result = InsertMasterValue(questionMaster, "QuestionaryMaster");
            SuccessMsg = strInsertSuccess;
        }
        if (Result.Success) {
            GetAllQuestionnaires();
            AlertMessage('#divQM_ValidationAlert', SuccessMsg, 'I');
            ClearForm('QM');
        }
        else
            AlertMessage('#divQM_ValidationAlert', 'Error in ' + Result.Result.FieldName + ' Field - ' + Result.Result.ErrorMessage, 'D');
    }
}

function fnLimitText(ActualTextId, RemainingTextId) {
    var text_max = 0;
    if (ActualTextId.val().length == 0)
        text_max = parseInt(ActualTextId.attr('maxLength'));
    else
        text_max = parseInt(ActualTextId.attr('maxLength')) - ActualTextId.val().length;

    RemainingTextId.html(text_max + ' characters remaining');

    ActualTextId.keyup(function () {
        var text_length = ActualTextId.val().length;
        var text_remaining = text_max - text_length;

        RemainingTextId.html(text_remaining + ' characters remaining');
    });
}

function GetEmpName(request, response) {
        var managerId = sessionStorage.EmployeeId;
        var token = sessionStorage.TokenValue;
        var svrPath = CONFIG.get('SERVERNAME');
        var locationId = 0;
        var apiPath = svrPath + 'Search?Name=' + request.term + '&LocationId=' + locationId;;

        var headerInfo = {
           'Authorization': 'Bearer ' + sessionStorage.TokenValue,
            "X-EmpNo": managerId
        };
        CommonAjaxGET(apiPath, headerInfo).done(function (data) {
            if (data.Success == false) {

                return false;
            }
            else {
                response($.map(data.Result, function (item) {
                    var nm = CommonGetName(item.FirstName, item.LastName);
                    return { label: nm + "-" + item.NewEmployeeCode, val: $.trim(item.EmployeeId) };
                }))
            }

        });
    }
function  GetEmployeeRole()
{
  
   
    var path = 'EmployeeRoleMaster?filtertype=' + 'EMPLOYEE' + '&id=' + $('#hdnER_EmployeeId').val();
    var lstEmployeeRoles = GetMasterValues(path);
    var RoleId = lstEmployeeRoles[0].EmployeeRoleId;
  
    $('#ddlER_EmployeeRole').val(RoleId);
    if (RoleId == DUHR_id)
    {
        $('#ddlER_DU').show();
        var path = 'DeliveryUnit?Type='+'HR'+'&EmployeeId=' + $('#hdnER_EmployeeId').val();
        var duhr = GetMasterValues(path);
        console.log(duhr);
        LoadDU();

      
        if (duhr != null) {
            $('#ddlER_DU').show();
         
            $.each(duhr, function (index, data) {
               
            $('#ddlER_DU').find("option[value=" + data.DUId + "]").attr("selected", "selected")
            $('#ddlER_DU').val();
                



            });


           
        }
    }
}

function IsSubordinateReporting() {

    var managerId = $('#hdnER_EmployeeId').val();

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'ManagerDashboard?ManagerId=' + managerId + '&AppraisalCycleId=' + sessionStorage.AppraisalCycleId;
    return CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    

}

