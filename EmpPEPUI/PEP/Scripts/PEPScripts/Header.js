// Inject mf-spin keyframes globally so CSS ring spinners work on all pages
(function() {
    if (!document.getElementById('mf-spin-keyframes')) {
        var style = document.createElement('style');
        style.id = 'mf-spin-keyframes';
        style.textContent = '@keyframes mf-spin { to { transform: rotate(360deg); } }';
        document.head.appendChild(style);
    }
})();

// Build HTML snippet showing training requirements attached to a feedback entry (if any).
// Defined globally in Header.js so it is available on Feedback, Manager Feedback, and notification pages.
function buildTrainingDisplayHtml(entry) {
    var names = entry.TrainingRequirementName;
    if (!names || names.toString().trim() === '') return '';
    var sep = '|||';
    var nameArr = names.indexOf(sep) >= 0 ? names.split(sep) : [names];
    var catArr = [];
    if (entry.TrainingCategory) {
        catArr = entry.TrainingCategory.indexOf(sep) >= 0 ? entry.TrainingCategory.split(sep) : [entry.TrainingCategory];
    }
    var html = '<div style="margin-top:6px;padding:5px 8px;background:#f0f7ff;border-left:3px solid #337ab7;border-radius:3px;font-size:12px;">';
    html += '<strong style="color:#337ab7;">Training Requirement:</strong><ul style="margin:2px 0 0 16px;padding:0;list-style:disc;">';
    for (var j = 0; j < nameArr.length; j++) {
        var n = nameArr[j].trim();
        if (!n) continue;
        var cat = (catArr[j] || '').trim();
        html += '<li>' + n + (cat ? ' <span style="color:#888;">(' + cat + ')</span>' : '') + '</li>';
    }
    html += '</ul></div>';
    return html;
}

$(window).on("load", function () {

    setTimeout(function () {

        if (sessionStorage.IsDelegatorManager == 1) {

            $('#sidebar li').has('a:contains(Delegator Feedback)').remove();
        }
    }, 1000);
});
// Intercept sidebar clicks and show loader
$(document).on('click', '#sidebar a, .sidebar a', function(e) {
    var href = $(this).attr('href');
    
    // Skip if it's javascript:void or # links
    if (!href || href === '#' || href.indexOf('javascript:') === 0) {
        return;
    }
    
    // Skip external links
    if (href.indexOf('http') === 0 && href.indexOf(window.location.hostname) === -1) {
        return;
    }
    
    // Show full-page loader
    var $pageLoader = $('<div id="sidebar-page-loader" style="position: fixed; top: 60px; left: 53px; right: 0; bottom: 0; background: rgba(255,255,255,0.72); -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px); z-index: 2000; display: flex; align-items: center; justify-content: center;"><div style="text-align: center; padding: 24px 32px; background: #fff; border-radius: 8px; box-shadow: 0 4px 24px rgba(0,0,0,.12); min-width: 200px;"><span style="display: inline-block; width: 40px; height: 40px; border: 3px solid #e8e8e8; border-top-color: #337ab7; border-radius: 50%; animation: mf-spin 0.75s linear infinite; margin-bottom: 12px;"></span><span style="display: block; font-size: 14px; color: #555; font-weight: 500;">Loading page...</span></div></div>');
    $('body').append($pageLoader);
    
    // Store loader in sessionStorage so it can be removed on next page load
    sessionStorage.setItem('showPageLoader', 'true');
});

// Remove loader when page loads (if it was set)
$(window).on('load', function() {
    if (sessionStorage.getItem('showPageLoader') === 'true') {
        $('#sidebar-page-loader').remove();
        sessionStorage.removeItem('showPageLoader');
    }
});

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
    $(document).on('keypress', function (e) {

        var txtValue = $(this).val();

        if (e.target.id == 'txtReply') {
            $(this).val(txtValue.replace(/[\<\>=]+/g, ''));

            var ascii = e.which || e.keyCode;

            if (ascii === 60 || ascii === 61 || ascii === 62) {

                $(e.target).addClass('csstxtarea');
                toastr.error("Special characters < , > and = are not allowed and !,@,#,$,%,^,&,*,(,),?,/,},{,[,],~,:,; are allowed. \n For security reasons, please refrain from using special characters in your input. Special characters may pose a risk to the system's security. Kindly remove any special characters and try again. Thank you for your understanding.")
                return false;
            }
            else {
                $(e.target).removeClass('csstxtarea');
                $(this).removeClass('csstxtarea');

            }
        }

    });


    if (sessionStorage.length == 0) {
        window.location.href = "/Account/Login";
    }

    CheckSessionTimeOut();
    $("#divNotification").hide();
    $("#divKRANotification").hide();
    $("#liKRA").removeClass("profile-active");
    $("#liFeedback").removeClass("profile-active");
    fnFillHeader();
    fnToggleSideMenu();
    fnLoadMenu();
    BindNotifications();
    BindKRANotifications();

//    var dt = new Date();
//    $("#lblCopyRightp").text("©" + dt.getFullYear() + " Infogain Corporation. All rights reserved.");
//});
// Initialize GlobalAppConfig and bind copyright text
//GlobalAppConfig.init(function () {
//    var copyRight = GlobalAppConfig.getcopyRight();
//    if (copyRight) {
//        $("#lblCopyRightp").html(copyRight);
//    } else {
//        // Fallback to default if no copyright text found
//        var dt = new Date();
//        $("#lblCopyRightp").text("©" + dt.getFullYear() + "  Corporation. All rights reserved.");
//    }
//});
});

function fnFillHeader() {
    var name3 = sessionStorage.FirstName + " " + sessionStorage.LastName

    $("#spnUserName").text(name3);
    if (sessionStorage.LatestFeebackDate === "Feedback Not given") {
        $("#spnFeedbackDate").text("Feedback Not Given")
    }
    else {
        if (sessionStorage.LatestFeebackDate == "null")
            $("#spnFeedbackDate").text("Feedback Not Given")
        else {
            var ds = sessionStorage.LatestFeebackDate; //25-10-2017 11:06:28
            //var first = ds.split(" ")[0];
            //var day = first.split("-")[0];
            //var month = first.split("-")[1];
            //var year = first.split("-")[2];
            //var second_p = ds.split(" ")[1];
            //var hour = second_p.split(":")[0];
            //var minute = second_p.split(":")[1];
            //var second = second_p.split(":")[2];

            //var dt = new Date(year, month, day, hour, minute, second);
            var dt = new Date(ds);
            $("#spnFeedbackDate").text(formatDate_DMY(dt));
        }
    }
    $("#EmpDesig").append(sessionStorage.EmployeeDesignationName);
    var mgrname = sessionStorage.ManagerName;
    if (mgrname.trim().length < 0 || mgrname == "null")
        mgrname = "--";
    $("#EmpMgr").append(mgrname);
    $("#EmpNo").append(sessionStorage.NewEmployeeCode);
    //$("#EmpDOJ").append(sessionStorage.JoiningDate).toString("dd-MMM-yyyy");
    $("#EmpLocation").append(sessionStorage.LocationName);
}

function fnToggleSideMenu() {
    var currMenu = $("#hdnSelectedMenu").val();
    $('#sidebar ul li').removeClass('active');
    $('#' + currMenu).addClass('active');
}

function fnLoadMenu() {

    //var role = sessionStorage.EmployeeRoleId;
    //var isHRBP = sessionStorage.IsHRBP;
    //var isRatingAdmin = sessionStorage.IsRatingAdmin;
    //var ratingTabVisible = sessionStorage.RatingTabVisible;

    var empId = sessionStorage.EmployeeId;
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "PageSideBar?EmpId=" + encodeURIComponent(empId);
    var xhr = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    if (!xhr || xhr.status < 200 || xhr.status >= 300 || !xhr.responseText) {
        $("#sidebar-wrapper").html('');
        return;
    }

    $.ajax({
        type: 'POST',
        async: false,
        cache: false,
        url: "/PageSideBar/Index",
        contentType: 'application/json; charset=utf-8',
        data: xhr.responseText,
        success: function (data) {
            $("#sidebar-wrapper").html('');
            $("#sidebar-wrapper").html(data);
        },
        error: function () {
        }
    });
}

function BindKRANotifications() {
    var appraisalCycleId = sessionStorage.AppraisalCycleId;
    var ToEmployeeId = sessionStorage.EmployeeId;
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Notifications?AppraisalCycleId=" + appraisalCycleId + "&ToEmployeeId=" + ToEmployeeId + '&NotificationsType=KRA';
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue,
        "X-EmpNo": sessionStorage.EmployeeId,
    };

    var NotificationsStr = CommonAjaxGET(apiPath, headerInfo);

    var Notifications = JSON.parse(NotificationsStr.responseText)
    var count = 0;
    if (Notifications.Success) {
        var NotificationCount = Notifications.Result.length;
        if (NotificationCount > 0) {
            $("#divKRANotification").show();
            $("#liKRA").addClass("profile-active");
        }
        $("#divKRANotification").html(NotificationCount);
        $.each(Notifications.Result, function (index, item) {
            var row = '';
            row = '<tr><td>' + item.FromEmployeeName + '</td><td>' + item.Feedback + '</td></tr>';
            $('#tblMyKRANotifications').append(row);
            row = '';
            count++;
        });
    } else {
        //if (Notifications.ErrorCode == "SessionTimeOut" || Notifications.ErrorCode=="Unauthorized") {
        //    CommonErrorHandling(Notifications.ErrorCode);
        //}
    }
}

function BindNotifications() {
    var appraisalCycleId = sessionStorage.AppraisalCycleId;
    var ToEmployeeId = sessionStorage.EmployeeId;
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Notifications?AppraisalCycleId=" + appraisalCycleId + "&ToEmployeeId=" + ToEmployeeId;
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue,
        "X-EmpNo": sessionStorage.EmployeeId,
    };

    var NotificationsStr = CommonAjaxGET(apiPath, headerInfo);

    var Notifications = JSON.parse(NotificationsStr.responseText)
    var count = 0;
    if (Notifications.Success) {
        var NotificationCount = Notifications.Result.length;
        if (NotificationCount > 0) {
            $("#divNotification").show();
            $("#liFeedback").addClass("profile-active");
        }
        $("#divNotification").html(NotificationCount);
        $.each(Notifications.Result, function (index, item) {

            var threadRootId = (item.ParentFeedBackId != null && item.ParentFeedBackId > 0) ? item.ParentFeedBackId : item.FeedBackId;
            var safeFeedback = $('<div/>').text(item.Feedback || '').html();
            var safeName = $('<div/>').text(item.FromEmployeeName || '').html();
            var safeToName = $('<div/>').text(item.ToEmployeeName || '').html();
            var row = '<tr role="button" tabindex="0" class="notification-feedback-row" style="cursor:pointer" ' +
            'data-feedbackid="' + item.FeedBackId + '" ' +
            'data-fromempid="' + item.FromEmployeeId + '" data-fromempname="' + safeName + '" ' +
            'data-toempid="' + item.ToEmployeeId + '" data-toempname="' + safeToName + '" ' +
            'data-feedback="' + safeFeedback + '" ' +
            'data-parentfeedbackid="' + threadRootId + '" ' +
            'onclick="fnShowFeedbackModalNotification(this);">' +
            '<td>' + safeName + '</td><td>' + safeFeedback + '</td></tr>';
            $('#tblMyNotifications').append(row);
            count++;
        });
    }
    //else {
    //    if (Notifications.ErrorCode == "SessionTimeOut" || Notifications.ErrorCode == "Unauthorized") {
    //        CommonErrorHandling(Notifications.ErrorCode);
    //    }
    //}
}

function fnShowFeedbackModalNotification(objButton) {
    var $tr = $(objButton).closest('tr');
    $tr.find('td').removeClass('UnreadMessage');
    $tr.remove();
    var url = $('#feedbackModalNotification').data('url');
    var Count = $("#divNotification").html();
    Count = Count - 1;
    if (Count > 0) {
        $("#divNotification").show();

    }
    else {
        $("#divNotification").hide();
        $("#liFeedback").removeClass("profile-active");
    }
    $("#divNotification").html(Count);
    $.get(url, function (data) {
        $('#feedbackContentNotifications').html(data);
        $("#txtFeedback").val($(objButton).attr('data-feedback'));
        $("#hdnParentFeedbackId").val($(objButton).attr('data-parentfeedbackid'));
        $("#dvFrom").show();
        $("#dvFeedback").hide();
        $("#spnFeedBackFrom").text($(objButton).attr('data-fromEmpName'));
        $("#spnFeedBackTo").text($(objButton).attr('data-toempname'));
        $("#hdnFromEmpId").val($(objButton).attr('data-fromempid'));

        fnFillFeedbackTrailNotification();
        $('#feedbackModalNotification').modal({
            show: true,
            keyboard: false

        });

    });
}
function RemoveScript(elementId) {
    // If elementId is provided, use it; otherwise default to txtReply for backward compatibility
    var elementSelector = elementId ? '#' + elementId : '#txtReply';
    var element = $(elementSelector);
    
    if (element.length > 0) {
        var txtValue = element.val();
        if (txtValue !== undefined && txtValue !== null) {
            element.val(txtValue.replace(/[\<\>'=]+/g, ''));
        }
    }
}


function fnFillFeedbackTrailNotification() {
    var empId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = {
       'Authorization': 'Bearer ' + sessionStorage.TokenValue,
        "X-EmpNo": empId
    };

    var parentfeedbackid = $("#hdnParentFeedbackId").val();
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Feedback?Id=" + parentfeedbackid + "&list=true";
    var svrPathToUpdate = svrPath + "Feedback?FeedbackId=" + parentfeedbackid + "&ParentId=" + parentfeedbackid + "&UserId=" + empId;

    CommonAjaxGET(apiPath, headerInfo).done(function (feedbackData) {
        if (feedbackData.Success == false) {
            //if (feedbackData.ErrorCode == "SessionTimeOut" || feedbackData.ErrorCode=="Unauthorized") 
            //    CommonErrorHandling(feedbackData.ErrorCode);
            //else
            return false;
        }
        var feedbackList = feedbackData.Result.employeeFeedbackEntity.data || feedbackData.Result.employeeFeedbackEntity;
        var empCount = 0;
        for (var i = 0; i < feedbackList.length; i++) {
            var entry = feedbackList[i];
            var dvfeedbackdata = '<div class="col-sm-8 leftbox">';

            if (empId == entry.FromEmployeeId) {
                empCount++;
                dvfeedbackdata = '<div class="col-sm-8 rightbox">';
            }

            var content = entry.Feedback || '';
            if (typeof buildTrainingDisplayHtml === 'function') {
                var trainingHtml = buildTrainingDisplayHtml(entry);
                if (trainingHtml) content += trainingHtml;
            }

            $("#dvFromTo").append(dvfeedbackdata + content + '<span class="name"></span></div>');

            if (empCount == feedbackData.Result.FeedbackLimit) {
                $("#dvSendReply").hide();
            }
        }
    });

    // Only make request if we have valid feedback IDs
    if (parentfeedbackid && parentfeedbackid > 0 && empId && empId > 0) {
        $.ajax({
            type: "POST", // Changed from PUT to POST since controller uses [HttpPost]
            url: svrPathToUpdate,
            cache: false,
            dataType: "json",
            headers: headerInfo,
            success: function (result) {
                data = result;
                //alert('Feedback given successfully');
            },
            error: function (xhr, statusText, errorThrown) {
                // Only log if it's not a 404 (not found) or 405 (method not allowed) as they may be expected
                if (xhr.status !== 404 && xhr.status !== 405) {
                    console.error("Error updating feedback seen status - statusCode: " + xhr.status + ", statusText: " + statusText);
                }
            }
        });
    }
}

function fnSendFeedback() {

    var feedbackText = $("#txtReply").val();
    var toEmployeeId = $("#hdnFromEmpId").val();

    var loggedinUser = sessionStorage.EmployeeId;
    var apprisalCycleId = sessionStorage.AppraisalCycleId;
    var token = sessionStorage.TokenValue;

    if (feedbackText.trim() == '') {
        toastr.error('Reply cannot be empty.')
        return false;
    }

    var parentfeedbackid = 0;
    if (isNaN($("#hdnParentFeedbackId").val()) || $("#hdnParentFeedbackId").val() == "null" || $("#hdnParentFeedbackId").val() == '') {
        parentfeedbackid = 0;
        toastr.error('No Parent Feedback id found.');
        return false;
    }
    else {
        parentfeedbackid = $("#hdnParentFeedbackId").val();
    }

    var params = 'FromEmployeeId=' + loggedinUser + '&ToEmployeeId=' + toEmployeeId + '&AppraisalCycleId=' + apprisalCycleId + '&ActionTypeId=' + 2 +
        '&Feedback=' + feedbackText + '&ParentFeedbackId=' + parentfeedbackid;

    //if (parentfeedbackid != 0) {
    //    params = params + '&ParentFeedbackId=' + parentfeedbackid;
    //}

    var svrPath = CONFIG.get('SERVERNAME');
    var apiURL = svrPath + "Feedback/PostSaveFeedback?" + params;


    var employeefeedbackEntity = {
        AppraisalCycleId: apprisalCycleId,
        FromEmployeeId: loggedinUser,
        ToEmployeeId: toEmployeeId,
        ActionTypeId: 2,
        Feedback: feedbackText,
        ParentFeedBackId: parseInt(parentfeedbackid, 10)
    };

    var headerInfo = {
       'Authorization': 'Bearer ' + sessionStorage.TokenValue,
        "X-EmpNo": loggedinUser
    };

    $.ajax({
        url: apiURL,
        type: "POST",
        data: JSON.stringify(employeefeedbackEntity),
        async: true,
        dataType: 'json',
        contentType: "application/json",
        headers: CommonGetHeaderInfo(),
        success: function (result) {

            data = result;
            if (!result || result.Success !== true) {
                toastr.error((result && result.ErrorMessage) ? result.ErrorMessage : 'Could not save your reply.');
                return;
            }
            // Manager Feedback uses #feedbackModal; notifications use #feedbackModalNotification
            $('#feedbackModal, #feedbackModalNotification').modal('hide');
            $('#txtReply').val('');
            toastr.success('Your reply was sent successfully.');
            if (typeof fnBindFeebackGivenKRAList === 'function' && $('#tblFeedbackGivenKRA').length && $('#ddlPreviousRMs').length) {
                var prevRm = $('#ddlPreviousRMs').val();
                if (prevRm && prevRm !== '0') { fnBindFeebackGivenKRAList(); }
            }

            // Email notification on reply disabled — mail content was inaccurate

        },
        error: function (xhr, statusText, errorThrown) {

            alert('Error while sending feedback....');
            console.log("statusCode : " + xhr.status + "statusText : " + statusText);
        }
    });

}





$('#liKRA').click(function (event) {
    $("#liKRA").addClass("profile-active");
    $("#liFeedback").removeClass("profile-active");
    event.preventDefault();
});
$('#liFeedback').click(function (event) {
    $("#liFeedback").addClass("profile-active");
    $("#liKRA").removeClass("profile-active");
    event.preventDefault();
});

$("#tblMyKRANotifications").click(function () {
    //Update is Seen
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "EmployeeKRA?EmployeeId=" + sessionStorage.EmployeeId + "&AppraisalCycleId=" + sessionStorage.AppraisalCycleId;
    return CommonAjaxPUT(apiPath, CommonGetHeaderInfo());
});

// Assigns dynamic height to wrapper according to the height of the sidebar menu
$(window).on("load", function () {
    $("#wrapper").css("height", $("#sidebar-wrapper").height() + 3)
})

function clearsessions() {
    debugger;
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Login";
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue,
        "X-EmpNo": sessionStorage.EmployeeId,
    };
    var NotificationsStr = CommonAjaxDELETE(apiPath, headerInfo);
    var i = sessionStorage.length;
    while (i--) {
        var key = sessionStorage.key(i);
        sessionStorage.removeItem(key);
    }
}

function hasSessionExpired() {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Login";
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue,
        "X-EmpNo": sessionStorage.EmployeeId,
    };
    var result = CommonAjaxGET(apiPath, headerInfo);
    var sessionExpired = JSON.parse(result.responseText);
    if (!sessionExpired.Success) {
        clearsessions();
        alert(sessionExpired.Result);
        location.reload();
    }

}
