var statusFor = 'KRA';
var strKRAUpdate;
LoadUploadKRAMasterCtrl();
function LoadUploadKRAMasterCtrl() {
    $('#txtKRAStartDate').val(sessionStorage.getItem("AppraisalCycleStart"));
    $('#txtKRAEndDate').val(sessionStorage.getItem("AppraisalCycleFrom"));

    BindKRASetforMaster();
    AttachDatePicker();
}


$("#txtGoalWeightage").keypress(function (e) {

    if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
        return false;
    }
});

function BindKRASetforMaster() {

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "UploadKRAMaster";
    KRASet = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    $('#ddlKRAUploadSet').empty();
    $('#ddlKRAUploadSet').append($("<option>").val(0).text('Select:'));
    $.each(KRASet.responseJSON.Result, function (index, data) {
        $('#ddlKRAUploadSet').append($("<option>").val(data.UploadKRASetID).text(data.KRASetName));
    });
}

$("#ddlKRAUploadSet").change(function (e) {

    BindKRAUploadList();
});

function BindKRAUploadList() {

    $('#divValidationAlert_Team').hide();
    $('#divValidationAlert').hide();

    PermissableInsert = 0;
    OpSeqNo = 1;
    DevSeqNo = 1;
    var KRASetId = $('#ddlKRAUploadSet').val();
    //loading the main grid that displays the KRA of an employee
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + "UploadKRAMaster?KRASetId=" + KRASetId + '&IsSet="Y"';
        KRABySetId = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
   
        if (KRABySetId.responseJSON.Success) {
        $('#tblKRAList').DataTable({
            destroy: true,
            data: KRABySetId.responseJSON.Result,
            aoColumns: [
                { mData: "UploadKRASetID", visible: false, },
                {
                    mData: "GoalType", mRender: function (data, type, full) {
                        if (data == 'O') {
                            return 'Operational';
                        } else {
                            return 'Developmental';
                        }
                    }
                },
                { mData: "GoalDescription" },
                { mData: "Weightage" },
               
                { mData: "Measure", width:"40%" },
               
                {
                    mData: "KRAFromDate", mRender: function (data, type, full) {
                        var dt = new Date(data);
                        return formatDate_DMY(dt);
                    }
                },
                {
                    mData: "KRAToDate", mRender: function (data, type, full) {
                        var dt = new Date(data);
                        return formatDate_DMY(dt);
                    }
                },
                {
                    mRender: function (data, type, full) {
                        var setbutton = '<button class="btn btn-info  btn-xs btn-round" title="Edit" id="btnKRAEdit_' + full['UploadKRAId'] + '" onclick="loadKRAEditTable(' + full['UploadKRAId'] + ')" ><span class="glyphicon glyphicon-edit"></span></button>';
                        return setbutton;
                    }
                },
                {
                    mRender: function (data, type, full) {
                        var setbutton = '<button class="btn btn-danger btn-xs btn-round" title="Delete" id="btnKRADelete_' + full['UploadKRAId'] + '" onclick="DeleteUploadKRA(' + full['UploadKRAId'] + ')"><span class="glyphicon glyphicon-trash"></span></button>';
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
        }
        else
        {
            var table = $('#tblKRAList').DataTable();
            table
                 .clear()
                 .draw();
        }
}

function SaveKRAUploadForm() {
    //if in submitted state or approved. prompt to complete in order to add new KRA's
    //debugger;
    var strKRAUpdate = "";
    var isvalid = true;
    var kraEndDate = foramtDate_DMY2YMD($('#txtKRAEndDate').val());
    var btnKRAUpdate = $('#btnKRAUpdate').val();
    var UploadKRAId = $('#hdnUploadKRAId').val();
    var goalType = $('#ddlGoalType').val();
    var goalDescription = $('#txtGoalDesc').val();
    var weightage = $('#txtGoalWeightage').val().trim();
    var actionStep = '';//$('#txtAreaActionSteps').val();
    var measure = $('#txtAreaMeasure').val();
    var kraStartDate = foramtDate_DMY2YMD($('#txtKRAStartDate').val());
    var targetDate = kraEndDate; //$('#txtTargetDate').val();
    var UploadKRASetId = $('#ddlKRAUploadSet').val();
    $("#divValidationAlert").hide();
    if ($('#ddlGoalType').is('[disabled]')) {       //check if the fields are disabled
        if (kraEndDate.trim() == '') {
            AlertMessage('#divValidationAlert', 'Please fill all fields', 'D');
            isvalid = false;
            return false;
        }
        
    } else {
        if (goalDescription.trim() == '' || weightage.trim() == '' || measure.trim() == '' || kraStartDate.trim() == '' || kraEndDate.trim() == '') {
            AlertMessage('#divValidationAlert', 'Please fill all fields', 'D');
            isvalid = false;
            return false;
        } else {
            //if (PermissableInsert > 0) {
            //    if (weightage > PermissableInsert || weightage <= 0) {
            //        AlertMessage('#divValidationAlert', strKRANumberRangeValidation + ' 0 to ' + PermissableInsert, 'D');
            //        isvalid = false;
            //        return false;
            //    }
            //} else if (weightage > 100 || weightage <= 0) {
            //    AlertMessage('#divValidationAlert', strKRANumberRangeValidation + ' 0 to 100', 'D');
            //    isvalid = false;
            //    return false;
            //}
            if (measure.length > 996) {
                var diff = measure.length - 996;
                AlertMessage(strMeasure + ' ' + 'exceeds character count. Characters to reduce : ' + diff, 'D');
                isvalid = false;
                return false;
            }
            // Upload KRA dates tied to cycle selection; skip localStorage AppraisalCycle range check.
            //if (kraStartDate > localStorage.getItem('AppraisalCycleStart') || kraEndDate > localStorage.getItem('AppraisalCycleEnd')) {
            //    AlertMessage('#divValidationAlert', 'Please enter dates betweeen', 'D');
            //    isvalid = false;
            //    return false;
            //}
           
        }
    }
    if (isvalid) {
        var KRAToUpload = {
            UploadKRAId: UploadKRAId,
            AppraisalCycleId: sessionStorage.getItem('AppraisalCycleId'),
            KRAFromDate: kraStartDate,
            KRAToDate: kraEndDate,
            GoalType: goalType,
            Sequence: 1,
            GoalDescription: goalDescription,
            Weightage: weightage,
            ActionStep: actionStep,
            Measure: measure,
            TargetDate: targetDate,
            KRAFromDate: kraStartDate,
            KRAToDate: kraEndDate,
            UploadKRASetID: UploadKRASetId
        };
        
        var Result;
        var SuccessMsg = '';
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + "UploadKRAMasterPost";

        if (btnKRAUpdate == 'Update') {
            Result = CommonAjaxPUT_Array(apiPath, KRAToUpload, CommonGetHeaderInfo());
            SuccessMsg = Result.Result;
        }
        else { // Insert KRAToUpload 
                Result = CommonAjaxPOST_Array(apiPath, KRAToUpload, CommonGetHeaderInfo());
                SuccessMsg = Result.Result;
        }
        if (Result.Success) {
            ClearUploadKRAForm();
            BindKRAUploadList();
            AlertMessage('#divValidationAlert', SuccessMsg, 'I');
        }
        else
            AlertMessage('#divValidationAlert', Result.Result[0].ErrorMessage, 'D');
    }
}

function loadKRAEditTable(UploadKRAId) {
    $("#divValidationAlert").hide();

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "UploadKRAMaster?id=" + UploadKRAId

    var KRAResult = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    if (KRAResult.responseJSON.Success) {
        var EmpKRAData = KRAResult.responseJSON.Result;
    
                $('#ddlGoalType').val(EmpKRAData.GoalType);
                $('#lblKRASequence').text(EmpKRAData.Sequence);
                $('#hdnUploadKRAId').val(EmpKRAData.UploadKRAId);
                $('#txtGoalDesc').val(EmpKRAData.GoalDescription);
                $('#txtGoalWeightage').val(EmpKRAData.Weightage);
                $('#txtAreaMeasure').val(EmpKRAData.Measure);
                var dt = new Date(EmpKRAData.KRAFromDate);
                $('#txtKRAStartDate').val(formatDate_DMY(dt));
                dt = new Date(EmpKRAData.KRAToDate);
                $('#txtKRAEndDate').val(formatDate_DMY(dt));
                strKRAUpdate = "Update";
                $('#btnKRAUpdate').val(strKRAUpdate);
                
                
    }
    else {
        AlertMessage('#divValidationAlert', strKRAErrorMsg, 'D');
    }
}


function DeleteUploadKRA(UploadKRAId) {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "/UploadKRAMasterPost?UploadKRAId=" + UploadKRAId;
    

    $("#divValidationAlert").hide();
    EmpKRAData = CommonAjaxDELETE(apiPath, CommonGetHeaderInfo());
    if (EmpKRAData) {
        BindKRAUploadList();
        ClearUploadKRAForm();
        AlertMessage('#divValidationAlert', strKRADeleteMsg, 'I');
        return true;
    } else {
        AlertMessage('#divValidationAlert', strKRAErrorMsg, 'D');
        return false;
    }

}


function ClearUploadKRAForm() {
      $('#ddlGoalType').val('O');

    $('#hdnUploadKRAId').val('');
    $('#txtGoalDesc').val('');
    $('#txtGoalDesc').focus();
    $('#txtGoalWeightage').val('');    
    $('#txtAreaMeasure').val('');    
    $('#txtKRAStartDate').val(sessionStorage.getItem("AppraisalCycleStart"));
    $('#txtKRAEndDate').val(sessionStorage.getItem("AppraisalCycleFrom"));
    strKRAInsert = 'Insert';
    $('#btnKRAUpdate').val(strKRAInsert);
    $("#divValidationAlert").hide();
    
}