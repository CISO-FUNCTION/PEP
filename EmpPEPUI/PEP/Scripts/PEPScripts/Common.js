//$(document).keydown(function (event) {

//    if (event.keyCode == 123) {
//        return false;
//    }
//    else if (event.ctrlKey && event.shiftKey && event.keyCode == 73) {
//        return false;
//    }
//});


//toastr.options = {
//    "closeButton": true,
//    "debug": false,
//    "newestOnTop": false,
//    "progressBar": true,
//    "positionClass": "toast-top-center",
//    "preventDuplicates": true,
//    "onclick": null,
//    "showDuration": "300",
//    "hideDuration": "1000",
//    "timeOut": "5000",
//    "extendedTimeOut": "1000",
//    "showEasing": "swing",
//    "hideEasing": "linear",
//    "showMethod": "fadeIn",
//    "hideMethod": "fadeOut"
//}
$(document).on("contextmenu", function (e) {
    e.preventDefault();
});
function CommonAjaxGET(url, header) {

    //if (!header) {
    //    header = {};  // If no headers are provided, initialize an empty object
    //}
    //header['Authorization'] = 'Bearer ' + sessionStorage.TokenValue;

    //CheckSessionTimeOut();
    var data;
    return $.ajax({
        url: url,
        async: false,
        datatype: "json",
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        },
        success: function (result) {

            data = result;
        },
        error: function (xhr, statusText, errorThrown) {
          
            data = {
                "statusCode": xhr.status, "statusText": statusText, "error": errorThrown
            };
        }
    });

}
function CommonAjaxPostForNormalization(url, empData, header) {



    CheckSessionTimeOut();
    //if (!header) {
    //    header = {};  // If no headers are provided, initialize an empty object
    //}
    //header['Authorization'] = 'Bearer ' + sessionStorage.TokenValue;
    var data;
    return $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: "json",
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        },
        type: 'POST',
        cache: false,
        url: url,
        data: JSON.stringify(empData),
        async: true,
        success: function (result) {

            data = result;
        },
        error: function (xhr, statusText, errorThrown) {

            data = {
                "statusCode": xhr.status, "statusText": statusText, "error": errorThrown
            };
        }

    });

}


function CommonAjaxGetForNormalization(url, Request, header) {


    CheckSessionTimeOut();

    var data;
    return $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: "json",
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        },
        type: 'POST',
        cache: false,
        url: url,
        data: JSON.stringify(Request),
        async: true,
        success: function (result) {

            data = result;
        },
        error: function (xhr, statusText, errorThrown) {

            data = {
                "statusCode": xhr.status, "statusText": statusText, "error": errorThrown
            };
        }

    });

}

function CommonAjaxPOSTwithurl(url, header) {

    CheckSessionTimeOut();
   
    var data;
    return $.ajax({
        type: "POST",
        url: url,
        async: false,
        datatype: "json",
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        },
        success: function (result) {

            data = result;
        },
        error: function () {

            data = null;
        }
    });
}

function CommonAjaxPOSTWithHeader(url, obj, header) {

    CheckSessionTimeOut();
  
    var data;
    $.ajax({
        type: "POST",
        url: url,
        data: obj,
        cache: false,
        datatype: "application/json",
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        },
        success: function (result) {

            data = result;
        },
        error: function (xhr, statusText, errorThrown) {

            data = {
                "statusCode": xhr.status, "statusText": statusText, "error": errorThrown
            };
        }
    });

    return data;
}

function CommonAjaxPOST_Array(url, obj, header) {

    CheckSessionTimeOut();
 
    var data;
    $.ajax({
        url: url,
        type: 'POST',
        data: JSON.stringify(obj),
        async: false,
        dataType: 'json',
        contentType: 'application/json',
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        },
        success: function (result) {

            data = result;
        },
        complete: function (xhr, statusText) {

            if (data === undefined || data === null || data === "") {
                data = {
                    Success: false,
                    "statusCode": xhr.status,
                    "statusText": statusText,
                    ErrorMessage: xhr.status === 404 ? 'Service not found (404). Check API URL.' : ('Request failed (' + xhr.status + ')')
                };
            }
        },
        error: function (xhr, statusText, errorThrown) {

            data = {
                Success: false,
                "statusCode": xhr.status,
                "statusText": statusText,
                ErrorMessage: (xhr.responseJSON && xhr.responseJSON.Message) ? xhr.responseJSON.Message : (errorThrown || statusText || 'Request error')
            };
        }
    });

    return data;
}

function CommonAjaxPOSTAsync(url, obj, onComplete) {
    CheckSessionTimeOut();
    $(".loader").show();
    var data;
    $.ajax({
        type: "POST",
        url: url,
        data: obj,
        async: true,
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        },
        datatype: "json",
        success: function (result) {
            data = result;

        },
        complete: function (xhr, statusText) {
            if (data == null || data == "") {
                data = {
                    "statusCode": xhr.status, "statusText": statusText
                };
            }
            if (onComplete != null) onComplete(data);
            $(".loader").hide();
        },
        error: function (result) {

        }

    });

    return data;
}

function Common_AjaxGET(url, paramObj) {

    CheckSessionTimeOut();
   
    var resultData;
    $.ajax({
        url: url,
        async: false,
        data: paramObj,
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        },
        success: function (result) {

            resultData = result;
        },
        datatype: "json"
    });
    return resultData;
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

function formatDate_DMYHM(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),
        hours = '' + d.getHours(),
        mins = '' + d.getMinutes();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if (hours.length < 2) hours = '0' + hours;
    if (mins.length < 2) mins = '0' + mins;
    var dt1 = [day, month, year].join('-');
    return dt1 + ' ' + hours + ':' + mins;
}
function CommonGetName(firstName, lastName) {
    var empname = firstName;
    if (lastName != "null" && lastName != null)
        empname += ' ' + lastName;
    return empname;
}
function CommonAjaxPOST(url, obj) {

    CheckSessionTimeOut();
    var data;
    $.ajax({
        type: "POST",
        url: url,
        data: obj,
        async: false,
        datatype: "application/json",
        success: function (result) {

            data = result;
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

    return data;
}

function CommonAjaxGETwithSSO(url, paramlogin) {

    CheckSessionTimeOut();
    var data;
    $.ajax({
        type: "GET",
        url: url,
        data: { code: paramlogin },
        async: false,
        datatype: "application/json",
        success: function (result) {

            data = result;
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

    return data;
}

function LoginPOST(url, obj) {
   
    //CheckSessionTimeOut();
    var data;
    $.ajax({
        type: "POST",
        url: url,
        data: obj,
        async: false,
        datatype: "application/json",
        success: function (result) {

            data = result;
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

    return data;
}
function LoginGetSSO(url, obj) {

    //CheckSessionTimeOut();
    url = url + "?paramcode=" + obj;
    var data;
    $.ajax({
        type: "GET",
        url: url,
        //data: { 'paramcode': obj },
        async: false,
        datatype: "application/json",
        success: function (result) {

            data = result;
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

    return data;
}


function CommonAjaxPUT_Array(url, obj, header) {

    var data;
    CheckSessionTimeOut();

    $.ajax({
        url: url,
        type: 'PUT',
        data: JSON.stringify(obj),
        async: false,
        dataType: 'json',
        contentType: 'application/json',
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        },
        success: function (result) {

            data = result;
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

    return data;
}

function CommonAjaxDELETE(url, header) {

    CheckSessionTimeOut();
    var data;
    return $.ajax({
        type: "DELETE",
        url: url,
        async: false,
        datatype: "json",
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        },
        success: function (result) {

            data = result;
        },
        error: function () {

            data = null;
        }
    });
}

function CommonAjaxPUT(url, header) {

    var data;
   
    return $.ajax({
        url: url,
        type: "PUT",
        async: false,
        datatype: "json",
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        },
        success: function (result) {

            data = result;
        },
        error: function () {

            data = null;
        }
    });
}

function CommonAjaxPUTforSession(url, header) {
    CheckSessionTimeOut();
   
    var data;
    return $.ajax({
        url: url,
        type: "POST",
        async: false,
        datatype: "jsonP",
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        },
        success: function (result) {

            data = result;
        },
        error: function () {

            data = null;
        }
    });
}
function CommonGetHeaderInfo() {
    
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    return headerInfo;
}

function CommonGetAddManagersFeedbackKRAName(firstName, lastName) {
    var empname = firstName;
    if (lastName != "null" && lastName != null)
        empname += ' ' + lastName;
    return empname;
}

function CommonErrorHandling(errorcode) {

    if (errorcode == "Unauthorized")
        window.location.href = "\Login\Index";
    if (errorcode == "SessionTimeOut") {
        clearsessions();
        alert('Your session has timed out. Please login again.');
        location.reload();
    }
}


function clearsessions() {


    if (sessionStorage.EmployeeId == null || sessionStorage.EmployeeId == 'undefined') {
        window.location.href = "/";
    }
    else {
       

        var EmployeeId = sessionStorage.EmployeeId;//JSON.parse(sessionStorage.EmployeeId);
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + "/Login/UpdateLogin?EmployeeId=" + EmployeeId;
        var data = CommonAjaxPUTforSession(apiPath);
        if (data.responseJSON.Success == true) {
            $.ajax({
                url: CONFIG.get('APPLICATIONURL') + 'Login/clearSession',
                async: false,
                datatype: "json",
                type: 'GET',
                success: function (result) {

                    // //debugger;
                },
                error: function () {

                    // //debugger;
                }

            });
            window.location.href = "/";
        }
        if (data.responseJSON.ErrorCode != null) {
            var ErrorLogEntity = {};
            ErrorLogEntity.EmployeeId = data.ErrorMessage.error.EmployeeId;
            ErrorLogEntity.Module = data.ErrorMessage.error.Module;
            ErrorLogEntity.Controller = data.ErrorMessage.error.Controller;
            ErrorLogEntity.Action = data.ErrorMessage.error.Action;
            ErrorLogEntity.Timestamp = data.ErrorMessage.error.Timestamp;
            ErrorLogEntity.Error = data.ErrorMessage.error.Error;

            var svrPath = CONFIG.get('SERVERNAME');
            var apiPath = svrPath + "/Error/Post/";
            var data = CommonAjaxPOST(apiPath, ErrorLogEntity);
        }
    }

}
//function CheckSessionTimeOut() {

//    var expiration = new Date(sessionStorage.LoginTime);
//    var now = new Date();
//    expiration.setMinutes(expiration.getMinutes() + 120);
//    if (now.getTime() > expiration.getTime()) {
//        var svrPath = CONFIG.get('SERVERNAME');
//        var apiPath = svrPath + "Login";
//        var headerInfo = CommonGetHeaderInfo();
//        $.ajax({
//            type: "DELETE",
//            url: apiPath,
//            async: false,
//            datatype: "json",
//            headers: headerInfo,
//            success: function (result) {
//                data = result;
//            },
//            error: function () {
//                data = null;
//            }
//        });

//        alert('Your session has timed out. Please login again.');
//        var i = sessionStorage.length;
//        while (i--) {
//            var key = sessionStorage.key(i);
//            sessionStorage.removeItem(key);
//        }
//        window.location.href = "/Account/Login";
//    } else {
//        var logintimestamp = new Date();
//        sessionStorage.setItem("LoginTime", logintimestamp);
//    }
//}

function CheckSessionTimeOut() {

    if (sessionStorage.EmployeeId == null || sessionStorage.EmployeeId == undefined) {
        window.location.href = "/";
    }
    else {
        var expiration = sessionStorage.LoginTime;

        if (typeof expiration === 'string') {

            var data;
            var apiPath = "/Login/checkSession";
            $.ajax({
                url: apiPath,
                type: "POST",
                async: false,
                datatype: "json",

                success: function (result) {

                    data = result;
                },
                error: function () {

                    data = false;
                }
            });


            //if (now.getTime() > d.getTime()) {
            if (data.message == 'out') {
                // clearsessions();
                var EmployeeId = sessionStorage.EmployeeId;//JSON.parse(sessionStorage.EmployeeId);

                var svrPath = CONFIG.get('SERVERNAME');
                var apiPath = svrPath + "/Login/UpdateLogin?EmployeeId=" + EmployeeId;
                // var data = CommonAjaxPUT(apiPath);
                var data;
                $.ajax({
                    url: apiPath,
                    type: "POST",
                    async: false,
                    datatype: "json",

                    success: function (result) {
                        alert('Your session has timed out. Please login again.')
                        data = result;
                    },
                    error: function () {

                        data = null;
                    }
                });


                var i = sessionStorage.length;
                while (i--) {
                    var key = sessionStorage.key(i);
                    sessionStorage.removeItem(key);
                }
                //setTimeout(function () {
                // ShowAlertMessage('Your session has timed out. Please login again.');
                window.location.href = "/";
                //}, 3000);

            } else {
                var logintimestamp = new Date();
                sessionStorage.setItem("LoginTime", logintimestamp);
                //$.get(CONFIG.get('APPLICATIONURL') + "Home/PartialCurrentUsers", function (data) {
                //    $('#active-users').html(data)
                //})
            }
        }
    }
}


function LoginError(url, obj) {

    //CheckSessionTimeOut();
    var data;
    $.ajax({
        type: "POST",
        url: url,
        data: obj,
        async: false,
        datatype: "application/json",
        success: function (result) {

            data = result;
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
                "statusCode": xhr.status, "statusText": statusText, "error": "error", "ValidMessage": xhr.responseJSON.ModelState
            };
        }
    });

    return data;
}


