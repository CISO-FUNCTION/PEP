
var token = '';
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}
$(document).ready(function () {
    var dt = new Date();
    $("#lblCopyRight").text("©" + dt.getFullYear() + " Infogain Corporation. All rights reserved.");
    document.getElementById("btnLogin").addEventListener("click", function (e) {
        e.preventDefault();
        fnLogin();
    });
    document.getElementById("txtPassword").addEventListener("keyup", function (event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            document.getElementById("btnLogin").click();
        }
    });

    var QueryString = document.location.search.substr(1).split('&');
    var queries = {};
    if (QueryString != undefined) {
        $.each(QueryString, function (c, q) {
            var i = q.split('=');
            if (i[1] != undefined) {
                queries[i[0].toString()] = i[1].toString();
                for (var x = 2; x < i.length; x++) {
                    queries[i[0].toString()] = queries[i[0].toString()] + "=";
                }
            }
        });
    }
    //if (queries != null && queries.PID != undefined) {
    //    if (sessionStorage != null && sessionStorage.EmployeeId != undefined) {
    //        window.location.href = "/Dashboard/Index?PID=" + queries.PID;
    //    }
    //}
    $("#txtPassword").keypress(function (e) {

        if (e.keyCode == 13) {
            fnLogin();
        }
    });
    //  token = queries.token;
    if ((token != undefined && token != ""))
        fnLoginWithToken()

    var AppURL = CONFIG.get('APPLICATIONURL');
    var env;
    $.ajax({
        url: AppURL + '/Login/GetEnvironment',
        async: false,
        datatype: "string",
        type: 'GET',
        success: function (result) {
            env = result;
            console.log(env);
        },
        error: function () {
            //debugger;
        }

    });
    if (env.toUpperCase() == 'PRODUCTION')
        getLoginDetails(queries.code);
    fnLogin();

});

function getQueryStrings() {
    var assoc = {};
    var decode = function (s) { return decodeURIComponent(s.replace(/\+/g, " ")); };
    var queryString = location.search.substring(1);
    var keyValues = queryString.split('&');

    for (var i in keyValues) {
        var key = keyValues[i].split('=');
        if (key.length > 1) {
            assoc[decode(key[0])] = decode(key[1]);
        }
    }

    return assoc;
}

function fnLoginWithToken() {
    //var EmpLoginEntity = {};
    //EmpLoginEntity.token = token;
    //getLoginDetails(EmpLoginEntity);

    var EmpLoginEntity = {};
    EmpLoginEntity.token = token;
    getformLoginDetails(EmpLoginEntity);
}

function fnLogin() {

    if (ValidationLogin()) {
        var EmpLoginEntity = {};
        EmpLoginEntity.userName = $("#txtUserName").val();
        EmpLoginEntity.Password = $("#txtPassword").val();
        getformLoginDetails(EmpLoginEntity);
    }

}

function getformLoginDetails(EmpLoginEntity) {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "/Login/Post/";

    var AppURL = CONFIG1.get('APPURL');
    var AppPath = AppURL + "Dashboard/Index/";
    var data = LoginPOST(apiPath, EmpLoginEntity);
    console.log(data);
    if (!data || !data.Result) {
        $("#divLoginAlerts").empty().append('<p class="login-error">Unable to connect. Please check your connection or try again.</p>').show();
        return;
    }
    if (data.Result.EmpDetails && data.Result.EmpDetails.data && data.Result.EmpDetails.data[0] !== undefined) {
        data.Result.EmpDetails = data.Result.EmpDetails.data[0];
    }
    if (data.Success == true) {
        //////debugger;
        // data.Result.EmpDetails = null;
        if (data.Result.EmpDetails == null || data.Result.EmpDetails == "") {
            window.location.href = "/Error/NotAuthorized/";
        }
        else {


            setSession(data);

            $.each(data.Result.EmpDetails, function (key, val) {
                sessionStorage.setItem(key, val);
            });
            var logintimestamp = new Date();
            sessionStorage.setItem("LoginTime", logintimestamp);
            $.each(data.Result.LoginDetails, function (name, value) {
                sessionStorage.setItem(name, value);
            });
            sessionStorage.setItem("LatestFeebackDate", data.Result.LatestFeebackDate);
            sessionStorage.setItem("AppraisalCycleId", data.Result.AppraisalCycleId);

            var setAppraisalCycleValue = GetAppraisalCycle(data.Result.AppraisalCycleId);
            if (setAppraisalCycleValue != null) {
                var startdate = formatDate_DMY(setAppraisalCycleValue.StartDate);
                var enddate = formatDate_DMY(setAppraisalCycleValue.EndDate);
                sessionStorage.setItem("AppraisalCycleStart", startdate);
                sessionStorage.setItem("AppraisalCycleFrom", enddate);
            }

            if (sessionStorage.EmployeeRoleId == 1) {
                //$("#dvLoginButton").attr("data-url", '/Dashboard/EmployeeDashboard');
                $("#dvLoginButton").attr("data-url", '/Feedback/Index');
                location.href = $("#dvLoginButton").data('url');
            }
            else {

                if (sessionStorage.EmployeeRoleId == 7) {
                    var path = 'DeliveryUnit?Type=' + 'HR' + '&EmployeeId=' + sessionStorage.EmployeeId;
                    var svrPath = CONFIG.get('SERVERNAME');
                    var apiPath = svrPath + path;
                    var result = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
                    console.log(result);
                    if (result.responseJSON.Success) {
                        sessionStorage.setItem("HRDUId", result.responseJSON.Result[0].DUId);
                    }
                }
                $("#dvLoginButton").attr("data-url", '/Dashboard/Index');
                location.href = $("#dvLoginButton").data('url');
            }



            //var QueryString = document.location.search.substr(1).split('&');
            //var queries = {};
            //if (QueryString != undefined) {
            //    $.each(QueryString, function (c, q) {
            //        var i = q.split('=');
            //        if (i[1] != undefined) {
            //            queries[i[0].toString()] = i[1].toString();
            //            for (var x = 2; x < i.length; x++) {
            //                queries[i[0].toString()] = queries[i[0].toString()] + "=";
            //            }
            //        }
            //    });
            //}
            //if (queries != null && queries.PID != undefined) {
            //    window.location.href = "/Dashboard/Index?PID=" + queries.PID;
            //} else {
            //    window.location.href = "/Dashboard/Index";
            //}
        }

    }
    else {
        if (data.ErrorCode != null) {
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
        else {
            $("#pLoginValidation").empty();
            $("#pLoginValidation").show();
            $("#pLoginValidation").append('<p class="login-error">Invalid Username or Password </p>');
        }
    }
}

function getLoginDetails(code) {
    debugger;
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "/Login/GetSSO/";

    var AppURL = CONFIG1.get('APPURL');
    var AppPath = AppURL + "Dashboard/Index/";
    console.log(AppPath);
    var data = LoginGetSSO(apiPath, code);
    debugger
    data.Result.EmpDetails = data.Result.EmpDetails.data[0];
    if (data.Success == true) {

        if (data.Result.EmpDetails == null || data.Result.EmpDetails == "") {

            alert('You are not authorized to access this page. Please connect with HR team for required access.');
        }
        else {
            $.each(data.Result.EmpDetails, function (key, val) {
                sessionStorage.setItem(key, val);
            });


            setSession(data);


            var logintimestamp = new Date();
            sessionStorage.setItem("LoginTime", logintimestamp);
            $.each(data.Result.LoginDetails, function (name, value) {
                sessionStorage.setItem(name, value);
            });
            sessionStorage.setItem("LatestFeebackDate", data.Result.LatestFeebackDate);
            sessionStorage.setItem("AppraisalCycleId", data.Result.AppraisalCycleId);

            var setAppraisalCycleValue = GetAppraisalCycle(data.Result.AppraisalCycleId);
            if (setAppraisalCycleValue != null) {
                var startdate = formatDate_DMY(setAppraisalCycleValue.StartDate);
                var enddate = formatDate_DMY(setAppraisalCycleValue.EndDate);
                sessionStorage.setItem("AppraisalCycleStart", startdate);
                sessionStorage.setItem("AppraisalCycleFrom", enddate);
            }

            if (sessionStorage.EmployeeRoleId == 1) {
                //$("#dvLoginButton").attr("data-url", '/Dashboard/EmployeeDashboard');
                $("#dvLoginButton").attr("data-url", '/Feedback/Index');
                location.href = $("#dvLoginButton").data('url');
            }
            else {

                if (sessionStorage.EmployeeRoleId == 7) {
                    var path = 'DeliveryUnit?Type=' + 'HR' + '&EmployeeId=' + sessionStorage.EmployeeId;
                    var svrPath = CONFIG.get('SERVERNAME');
                    var apiPath = svrPath + path;
                    var result = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
                    console.log(result);
                    if (result.responseJSON.Success) {
                        sessionStorage.setItem("HRDUId", result.responseJSON.Result[0].DUId);
                    }
                }
                $("#dvLoginButton").attr("data-url", '/Dashboard/Index');
                location.href = $("#dvLoginButton").data('url');
            }

        }



        //var QueryString = document.location.search.substr(1).split('&');
        //var queries = {};
        //if (QueryString != undefined) {
        //    $.each(QueryString, function (c, q) {
        //        var i = q.split('=');
        //        if (i[1] != undefined) {
        //            queries[i[0].toString()] = i[1].toString();
        //            for (var x = 2; x < i.length; x++) {
        //                queries[i[0].toString()] = queries[i[0].toString()] + "=";
        //            }
        //        }
        //    });
        //}
        //if (queries != null && queries.PID != undefined) {
        //    window.location.href = "/Dashboard/Index?PID=" + queries.PID;
        //} else {
        //    window.location.href = "/Dashboard/Index";
        //}
    }
    else {
        if (data.ErrorCode != null) {
            var ErrorLogEntity = {};
            ErrorLogEntity.EmployeeId = data.ErrorMessage.error.EmployeeId;
            ErrorLogEntity.Module = data.ErrorMessage.error.Module;
            ErrorLogEntity.Controller = data.ErrorMessage.error.Controller;
            ErrorLogEntity.Action = data.ErrorMessage.error.Action;
            ErrorLogEntity.Timestamp = data.ErrorMessage.error.Timestamp;
            ErrorLogEntity.Error = data.ErrorMessage.error.Error;

            var svrPath = CONFIG.get('SERVERNAME');
            var apiPath = svrPath + "/Error/Post/";
            var data = LoginError(apiPath, ErrorLogEntity);
            //var data = CommonAjaxPOST(apiPath, ErrorLogEntity);
            debugger;
            setTimeout(function () {
                window.location.href = "http://localhost:54601/Error/NotAuthorized/";
            }, 500)

        }
        else {
            setTimeout(function () {
                window.location.href = "http://localhost:54601/Error/NotAuthorized/";
            }, 500)
        }
    }
}

//// ✅ ADD THIS NEW FUNCTION TO UPDATE FAVICON
//function updateFavicon(faviconUrl) {
//    // Method 1: Update existing link element
//    var link = document.getElementById('dynamicFavicon');
//    if (link) {
//        link.href = faviconUrl;
//    }

//    // Method 2: Force browser to reload favicon (more reliable)
//    var head = document.getElementsByTagName('head')[0];

//    // Remove old favicon links
//    var oldLinks = document.querySelectorAll('link[rel*="icon"]');
//    oldLinks.forEach(function (oldLink) {
//        head.removeChild(oldLink);
//    });
//}
function setSession(data) {

    var _data = data;
    var AppURL = CONFIG.get('APPLICATIONURL');// CONFIG.get('APPLICATIONURL');
    $.ajax({
        url: AppURL + '/Login/RemoveSessionId',
        async: false,
        datatype: "json",
        type: 'GET',
        success: function (result) {
            // setLoginCount(_data);
            //debugger;
        },
        error: function () {
            //debugger;
        }

    });
    $.ajax({
        url: AppURL + '/Login/setSession',
        async: false,
        datatype: "json",
        type: 'GET',
        data: data.Result.EmpDetails,
        success: function (result) {
            // setLoginCount(_data);
            //debugger;
        },
        error: function () {
            //debugger;
        }

    });

    // Initialize GlobalAppConfig and set organization session
    //GlobalAppConfig.init(function () {
    //    // Get all configs from GlobalAppConfig
    //    var allConfigs = GlobalAppConfig.getAll();

    //    if (allConfigs) {
    //        // Convert configs object to JSON string
    //        var configsJson = JSON.stringify(allConfigs);

    //        // Send to server to store in session
    //        $.ajax({
    //            url: AppURL + '/Login/setSessionORG',
    //            type: 'POST',
    //            contentType: 'application/x-www-form-urlencoded',
    //            data: { orgConfigs: configsJson },
    //            async: false,
    //            datatype: "json",
    //            success: function (result) {
    //                console.log('Organization session set:', result);
    //                //// ✅ UPDATE FAVICON DYNAMICALLY AFTER SESSION IS SET
    //                //if (allConfigs['Org_FaviconUrl']) {
    //                //    updateFavicon(allConfigs['Org_FaviconUrl']);
    //                //}
    //            },
    //            error: function (xhr, status, error) {
    //                console.error('Error setting organization session:', error);
    //            }
    //        });
    //    }
    //});
}



function ValidationLogin() {
    if ($("#txtUserName").val() == "" && $("#txtPassword").val() == "") {
        $("#divLoginAlerts").empty();
        $("#divLoginAlerts").append('<p class="login-error">Please Enter Username and Password</p>');
        $("#divLoginAlerts").show();
        //  alert("Enter UserName")
        return false;
    }
    if ($("#txtUserName").val() == "") {
        $("#divLoginAlerts").empty();
        $("#divLoginAlerts").show();
        $("#divLoginAlerts").append('<p class="login-error">Enter Username</p>');
        return false;
    }
    if ($("#txtPassword").val() == "") {
        $("#divLoginAlerts").empty();
        $("#divLoginAlerts").show();
        $("#divLoginAlerts").append('<p class="login-error">Enter Password</p>');
        return false;
    }
    return true;
}

function GetAppraisalCycle(AppraisalCycleId) {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "AppraisalCycle/AppraisalCycleWithId?Id=" + AppraisalCycleId;
    var result = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    if (result.responseJSON.Success)
        return result.responseJSON.Result;
    return null;
}

//moved from login.aspx to here (discussed with Balmeek)
$(document).ready(function () {
    var shortName;
    // GlobalAppConfig.reload();
    //alert();
    // Initialize config before using it
    //GlobalAppConfig.init(function () {
    //    // Update logo
    //    var logoUrl = GlobalAppConfig.getOrgLogo_Login();
    //    if (logoUrl) {
    //        $('.iglogo img').attr('src', logoUrl);
    //    }
    //    shortName = GlobalAppConfig.getShortOrgName();

    //    var faviconUrl = GlobalAppConfig.getFaviconUrl();
    //    if (faviconUrl) {
    //        $('#faviconLink').attr('href', faviconUrl);
    //    } else {
    //        // Fallback to default favicon
    //        $('#faviconLink').attr('href', '');
    //    }
    //    shortName = GlobalAppConfig.getShortOrgName();


    //    // Update copyright
    //    var dt = new Date();
    //    var copyRight = GlobalAppConfig.getcopyRight();
    //    //$("#lblCopyRight").text("©" + dt.getFullYear() + " " + orgName + " Corporation. All rights reserved.");
    //    $("#lblCopyRight").text(copyRight);
    //});
    //var dt = new Date();
    //$("#lblCopyRight").text("©" + dt.getFullYear() + " Infogain Corporation. All rights reserved.");
    document.getElementById("txtPassword")
        .addEventListener("keyup", function (event) {
            event.preventDefault();
            if (event.keyCode === 13) {
                document.getElementById("btnLogin").click();
            }
        });
});