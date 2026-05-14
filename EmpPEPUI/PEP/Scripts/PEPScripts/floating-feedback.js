$(document).ready(function () {


    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-center",
        "preventDuplicates": true,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
    $('#btnFeedbackReq').show();

    $(".floating-feedback").on("click", function () {

        $(".feedback-container").show("slide", {
            direction: "right"
        }, 100);


        $(".floating-feedback").hide();
    });

    $(".feedback-close").on("click", function () {
        $(".feedback-container").hide("slide", {
            direction: "right"
        }, 100);
        fnResetTextFields();
        $(".floating-feedback").show();
    });

    $(".profile-active").on("click", function () {
        $(this).find("ul").toggleClass("active");
    });

    $(".hamburger").on("click", function () {
        $("#sidebar-wrapper").toggleClass("active");
    });

    $("#main").on("click", function () {
        $(".profile-active ul").removeClass("active");
    });
    if (sessionStorage.EmployeeType == 'C') {
        $('#group1').children("input[type='radio']:last").hide();
        $('#group1').find('span:last').hide();
    }
});

//Following event is attached to textbox with the id searchEmp 
//to implement autocomplete functionality.
//$(document).on('keyup.autocomplete', '#searchEmp', function () {
$('#searchEmp').on('keyup.autocomplete', function () {

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Search/GetEmployeeByName?Name=" + document.getElementById('searchEmp').value;
    var managerId = sessionStorage.EmployeeId;
    CheckSessionTimeOut();

    $(this).autocomplete({
        source: function (request, response) {
            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                url: apiPath,
                dataType: "json",
                headers: CommonGetHeaderInfo(),
                success: function (data) {
                    response($.map(data.Result, function (item) {
                        var name3 = CommonGetName(item.FirstName, item.LastName);
                        return {
                            label: name3 + ' -' + item.NewEmployeeCode,
                            val: $.trim(item.EmployeeId),
                            valMgr: $.trim(item.EmployeeManagerId)
                        }
                    }))
                },
                error: function (result) {
                    toastr.error("User can not be found.");
                }
            });
        },
        select: function (e, i) {
            $("[id$=hdnsearchEmp]").val(i.item.val);
            $("[id$=hdnsearchManagerID]").val(i.item.valMgr);
        },
        minLength: 3
    });
    $(".ui-autocomplete").css("z-index", "2147483647"); //use this to show autocomplete list when using popup like div
});

function fnFeedbackRequest() {
    if ($("#searchEmp").val().trim() == '') {
        toastr.error('Please select the employee whom you want to give feedback\\request feedback.');
        return false;
    }

    if (sessionStorage.EmployeeId == $("#hdnsearchEmp").val()) {
        toastr.error('You can not send feedback\\request to your self. \nPlease choose a different user.');
        return false;
    }

    if ($("#txtComments").val().trim() == '') {
        toastr.error('Comment cannot be empty.');
        return false;
    }

    fnSaveFeedback();
}

//function to save request in database
function fnSaveFeedback() {
    CheckSessionTimeOut();
    var feedbackText = $("#txtComments").val();
    var toEmployeeId = $("#hdnsearchEmp").val();
    var actionTypeId = $('input[name=group1]:checked').val();
    var EmployeeMgrID = $("#hdnsearchManagerID").val();
    var loggedinUser = sessionStorage.EmployeeId;
    var apprisalCycleId = sessionStorage.AppraisalCycleId;

    //var params = 'FromEmployeeId=' + loggedinUser + '&ToEmployeeId=' + toEmployeeId + '&AppraisalCycleId=' + apprisalCycleId + '&ActionTypeId=' + actionTypeId + '&Feedback=' + feedbackText;
    var svrPath = CONFIG.get('SERVERNAME');
    var employeefeedbackByMail = {
        AppraisalCycleId: apprisalCycleId,
        FromEmployeeId: sessionStorage.EmployeeId,
        ToEmployeeId: toEmployeeId,
        Feedback: feedbackText,
        ActionTypeId: actionTypeId,

    };
    var webAPIURL = svrPath + 'Feedback/PostSaveFeedback';
    if (actionTypeId == undefined) {
        toastr.error("Select feedback type.");
    }
    else {
        $.ajax({
            url: webAPIURL,
            type: "POST",
            data: JSON.stringify(employeefeedbackByMail),
            async: true,
            dataType: 'json',
            contentType: "application/json",
            headers: CommonGetHeaderInfo(),
            success: function (result) {

                if (actionTypeId == 1) {
                    // Email notification on feedback disabled — mail content was inaccurate
                    toastr.success('Feedback given successfully !!.');
                }
                if (actionTypeId == 3) {
                    toastr.success('Feedback request sent.');
                    // Email notification on feedback request disabled — mail content was inaccurate
                }
                $(".floating-feedback").show();
                fnResetTextFields();
                fnclosefreetextfeedback();
            },
            error: function (xhr, statusText, errorThrown) {

                toastr.error('Error while sending/requesting feedback....');
                console.log("statusCode : " + xhr.status + "statusText : " + statusText);
            }
        });
    }
    //if (data != null && data.Success == false) {
    //    alert("Error while sending feedback......");
    //}
}

function fnclosefreetextfeedback() {
    $(".feedback-container").hide("slide", {
        direction: "right"
    }, 1000);
}

function fnResetTextFields() {
    $("#txtComments").val('');
    $("#searchEmp").val('');
    $("#hdnsearchEmp").val('');
    $("#hdnsearchManagerID").val('');
    $('input:radio[name=group1]:checked').prop('checked', false);
}