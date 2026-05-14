$(function () {

    $(document).on("click", ".popover .close", function () {
        $(this).parents(".popover").popover('hide');
    });

});


    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var currentTab = $(e.target).text(); // get current tab
        var LastTab = $(e.relatedTarget).text(); // get last tab
        $(".current-tab span").html(currentTab);
        $(".last-tab span").html(LastTab);
        if(e.target.id=="tabfeedbackGiven")
        {
            $('#feedbackGiven table tr:eq(0) th:eq(2)').text("To Employee");
        }
        if (e.target.id == "tabPendingFeedback") {
            BindPendingFeedbackGrid(0, EMP_CONFIG.get('EmployeeId'), 3, '#pendingFeedback table')
        }

        if (e.target.id == "TabRequestFeedback") {
            BindPendingFeedbackGrid(EMP_CONFIG.get('EmployeeId'),0 ,3, '#requestFeedback table')
        }
    });

    $("#divMyFeedbackArea input[name='Area']").click(function () {
        if ($('.nav-tabs .active > a').attr('id') == 'tabMyFeedback') {

            if ($('input:radio[name=Area]:checked').val() == 2) 
                $('#myFeedback table tr:eq(0) th:eq(1)').text("Measure");
            else
                $('#myFeedback table tr:eq(0) th:eq(1)').text("Competence");

            BindFeedbackGrid($('input:radio[name=Area]:checked').val(), 0, EMP_CONFIG.get('EmployeeId'), 1, '#myFeedback table');
        }
        if ($('.nav-tabs .active > a').attr('id') == 'tabfeedbackGiven') {

            if ($('input:radio[name=Area]:checked').val() == 2) 
                $('#feedbackGiven table tr:eq(0) th:eq(1)').text("Measure");
            else
                $('#feedbackGiven table tr:eq(0) th:eq(1)').text("Competence");

            BindFeedbackGrid($('input:radio[name=Area]:checked').val(), EMP_CONFIG.get('EmployeeId'), 0, 1, '#feedbackGiven table');
        }
    });


function BindFeedbackGrid(areaId, fromEmployeeId, toEmployeeId, actionTypeId,TabId) {
    var employeeFeedback = {
        AppraisalCycleId: EMP_CONFIG.get('AppraisalCycleId'),
        ToEmployeeId:toEmployeeId,
        AreaId: areaId,
        FromEmployeeId:fromEmployeeId,
        ActionTypeId: actionTypeId,
        ParentFeedBackId: 0
    };
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "/Feedback/GetEmployeeFeedback";
    FeedbackData = CommonAjaxPOST(apiPath, employeeFeedback);
    var TabName=
    $(TabId).dataTable().fnDestroy();

    $(TabId).DataTable({
        data: FeedbackData,
        "bPaginate": false,
        "bFilter": false,
        "bInfo": false,
        aoColumns: [
            { mData: "AreaName" },
            { mData: "Question" },
            { mData: "FromEmployeeName" },
            { mData: "Feedback" },
             {
                 mData: "FeedBackId", "render": function (data, type, full, meta) {
                     return '<a href="">View</a>';
                 }
             }
        ]
    });
    
}

function BindPendingFeedbackGrid(fromEmployeeId, toEmployeeId, actionTypeId, TabId) {
    var employeeFeedback = {
        AppraisalCycleId: EMP_CONFIG.get('AppraisalCycleId'),
        ToEmployeeId: toEmployeeId,
        AreaId: 0,
        FromEmployeeId: fromEmployeeId,
        ActionTypeId: actionTypeId,
        ParentFeedBackId: 0
    };
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "/Feedback/GetEmployeeFeedback";
    FeedbackData = CommonAjaxPOST(apiPath, employeeFeedback);
    var TabName =
    $(TabId).dataTable().fnDestroy();

    $(TabId).DataTable({
        data: FeedbackData,
        "bPaginate": false,
        "bFilter": false,
        "bInfo": false,
        aoColumns: [
            { mData: "FromEmployeeName" },
            { mData: "Feedback" },
            { mData: "FeedBackId", "render": function ( data, type, full, meta ) {
                return '<a href="">View</a>';}}
        ]
    });
    //$('#tblEmployeeFeedbackList').dataTable({ bFilter: false, bInfo: false });
    //$('#tblEmployeeFeedbackList').dataTable({ searching: false, paging: false });

}

//Following event is attached to textbox with the id searchEmp 
//to implement autocomplete functionality.
$(document).on('keyup.autocomplete', '#searchEmp', function () {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "EmployeeMaster/GetEmployeByName?name=" + document.getElementById('searchEmp').value;

    $(this).autocomplete({
        source: function (request, response) {
            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                url: apiPath,
                dataType: "json",
                success: function (data) {
                    response($.map(data, function (item) {
                        var nm=CommonGetName(item.FirstName, item.LastName)
                        return {
                            label: nm,
                            val: $.trim(item.EmployeeId)
                        }
                    }))
                },
                error: function (result) {
                    alert("Error......");
                }
            });
        },
        select: function (e, i) {
            $("[id$=hdnsearchEmp]").val(i.item.val);
        },
        minLength: 3
    });
    //$(".ui-autocomplete").css("z-index", "2147483647");
});

function ShowRequest() {
    //$('#searchEmp').popover({
    //    trigger: 'manual',
    //    placement: 'top',
    //    html: true,
    //    title: function () {
    //        return 'Employee: <a href="#" class="close" data-dismiss="alert">×</a>'
    //    },
    //    content: function () {
    //        return 'Please select employee. Employee is Madatory!'
    //    }
    //});

    //if ($("#searchEmp").val().trim() == '') {
    //    $('#searchEmp').popover('show');
    //    return false;
    //}

    fnShowRequestModal();

    //following is commented because as per the discussion
    //Area dropdown is not needed on request screen.
    //GetAreaMaster();
}

function fnShowRequestModal() {
    //$('#requestModal').modal('show');

    $('#requestModal').modal({
        show: true,
        keyboard: false,
        backdrop: 'static'
    });
}

//Function to get area master and populate area drop down list
function GetAreaMaster() {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "/AreaMaster/GetAllAreas";
    CommonAjaxGET(apiPath).done(function (master) {
        $('#ddlArea').html('');
        $('#ddlArea').append($('<option></option>').val(0).html('Please Select'));
        $.each(master, function (i) {
            $('#ddlArea').append($('<option></option>').val(master[i].AreaID).html(master[i].AreaName));
        });
    });
}

//function to save request in database
function fnSendRequest() {
 

    var formData = {};
    formData.ToEmployeeId = $("#hdnsearchEmp").val();
    formData.Feedback = $("#txtComments").val();

    if (formData.Feedback.trim() == '') {
        alert('Comment cannot be empty.');
        return false;
    }

    var svrPath = CONFIG.get('SERVERNAME');
    var webAPIURL = svrPath + '/Feedback/SaveFeedback';

    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: webAPIURL,
        data: JSON.stringify(formData),
        dataType: "json",
        success: function (data) {
          
            alert("Request Sent");
        },
        error: function (result) {
         
            alert("Error......");
        }
    });

}