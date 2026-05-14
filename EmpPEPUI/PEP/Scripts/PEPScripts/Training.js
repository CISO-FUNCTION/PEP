$(function () {
    $("#fromDate").datepicker();
    $("#toDate").datepicker();
    fnBindMyTrainingList();
});

function fnShowDatePicker(datepickerId) {
    $("#" + datepickerId).datepicker('show');
}

function ShowTrainingRequest() {
    fnBindTraining();
    fnShowTrainingtModal();
}

function fnBindTraining() {
    var trainingTypes = TRAININGTYPEDATA.get('TRAININGTYPE');
    $('#ddlTrainingType').html('');
    $('#ddlTrainingType').append($('<option></option>').val(0).html('Please Select'));
    $.each(trainingTypes, function (i) {
        $('#ddlTrainingType').append($('<option></option>').val(trainingTypes[i].ID).html(trainingTypes[i].Name));
    });
}

function fnGetTrainingSubType(id) {
    id = $('#ddlTrainingType').val();
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Training/GetAllTrainingTypes?&id=" + id;
    CommonAjaxGET(apiPath).done(function (data) {
        $('#ddlTrainingSubType').html('');
        $('#ddlTrainingSubType').append($('<option></option>').val(0).html('Please Select'));
        $.each(data, function (i) {
            $('#ddlTrainingSubType').append($('<option></option>').val(data[i].TrainingItemId).html(data[i].TrainingItemName));
        });
    });
}

function fnShowTrainingtModal() {
    $('#trainingReqModal').modal({
        show: true,
        keyboard: false,
        backdrop: 'static'
    });
}

function fnSendTrainingRequest() {
    if (!fnValidateTrainingRequest()) {
        return false;
    }

    fnSaveTrainingRequest();
}

function fnValidateTrainingRequest() {
    var result = $('#ddlTrainingType').val() !== '0' && $('#ddlTrainingSubType').val() !== '0'; //&& $('#fromDate').val() !== '' && $('#toDate').val() !== '';

    if ($('#ddlTrainingType').val() === '0') {
        fnAddError('#ddlTrainingType');
    }
    else {
        fnRemoveError('#ddlTrainingType');
    }

    if ($('#ddlTrainingSubType').val() === '0') {
        fnAddError('#ddlTrainingSubType');
    }
    else {
        fnRemoveError('#ddlTrainingSubType');
    }

    if ($('#fromDate').val() === '') {
        fnAddError('#fromDate');
    }
    else {
        fnRemoveError('#fromDate');
    }

    if ($('#toDate').val() === '') {
        fnAddError('#toDate');
    }
    else {
        fnRemoveError('#toDate');
    }

    return result;
}

function fnSaveTrainingRequest() {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Training/SendTrainingRequest";

    var objTrainingRequest = {};
    objTrainingRequest.TrainingItemId = $('#ddlTrainingSubType').val();
    objTrainingRequest.AppraisalCycleId = 4;
    objTrainingRequest.EmployeeId = 1;
    objTrainingRequest.ActionTypeid = 4;
    objTrainingRequest.TrainingStatusId = 5;
    objTrainingRequest.SuggestedStartDate = '2017-03-15';
    objTrainingRequest.SuggestedEndDate = '2017-03-16';
    objTrainingRequest.ActualEndDate = '2017-03-16';
    objTrainingRequest.ParentTrainingId = $('#ddlTrainingType').val();

    employeeData = CommonAjaxPOST(apiPath, objTrainingRequest);

    if (employeeData.hasOwnProperty("statusCode")) {
        if (employeeData.statusCode != "200") {
            console.log('Erorr while send training request');
        }
    }
}

function fnAddError(control) {
    $(control).closest('div.form-group').addClass('has-error');
}

function fnRemoveError(control) {
    $(control).closest('div.form-group').removeClass('has-error');
}

function fnBindMyTrainingList() {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Training/GetMyTrainingList?&empid=1";

    CommonAjaxGET(apiPath).done(function (trainingData) {
        $("#tblMyTrainingList").DataTable({
            data: trainingData,
            "bPaginate": false,
            "bFilter": false,
            "bInfo": false,
            aoColumns: [
            { mData: "TrainingType" },
            { mData: "Training" },
            { mData: "SuggestedStartDate" },
            { mData: "SuggestedEndDate" },
            { mData: "Status" }
            ]
        });


    });
}