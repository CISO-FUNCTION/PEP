/*
Team Member details
*/

//api call
function GetSubordiantesByManagerId() {
    var ManagerId = sessionStorage.getItem('EmployeeId');
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "/Team?id=" + ManagerId + "&AppraisalCycleId=" + sessionStorage.getItem("AppraisalCycleId");
    SubordinateList = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    return SubordinateList;
}
function GetTeamMemberStats() {
    var teamFeedback = {
        FromEmployeeId: localStorage.getItem('EmployeeId')
    };
    var employee = {};
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "/Feedback/GetTeamFeedbackStatistics/";
    var FeedbackData = CommonAjaxPOST(apiPath, teamFeedback);
    return FeedbackData;
}

//populate div
function FillSubordinateDiv() {
    $('#divMgrSubordinateList').empty();
    SubordinateList = GetSubordiantesByManagerId(); 
    if (SubordinateList.responseJSON.Success) {
        var li_script = '<ul style="list-style-type: none;">';
        var count = 0;
        $.each(SubordinateList.responseJSON.Result, function (index, data) {
            li_script += '<li ><a href="#' + data.EmployeeId + '">' + data.FirstName;
            if (data.MiddleName != "" && data.MiddleName != null) {
                li_script += ' ' + data.MiddleName ;
            }
            if (data.LastName != "" && data.LastName != null) {
                li_script += ' ' + data.LastName ;
            }
            li_script += '</a></li>';
            count++;
        });
        li_script += '</ul>';
        $('#divMgrSubordinateList').append(li_script);
        return count;
    } else {
        return 0;
    }
}
function FillTeamMemberFBStatsDiv() {
    $('#divTeamMemberFBStats').empty();
    FeedbackData = GetTeamMemberStats();
    var li_script = '';
    if (FeedbackData != null && FeedbackData != '')
        if (FeedbackData.length > 0) {
            $.each(FeedbackData, function (index, data) {
                li_script += '<label>' + data.TeamFBStatsHeader + ' ' + data.TeamFBStatsCount;
                li_script += '</label><br/>';
            });
            $('#divTeamMemberFBStats').append(li_script);
        }
}
//used to load subordinates - KRA Screen // Commented by Deepa we have to load the team member depending on KRA Status. done is KRAOperations.js


//function FillSubordinateListForKRA() {    
//    SubordinateList = GetSubordiantesByManagerId();
//    if (SubordinateList.responseJSON.Success) {        
//        var count = 0;
//        $("#ddlMyTeamList_KRA").children().remove();
//        if (SubordinateList.responseJSON.Result != null) {
//            $("#ddlMyTeamList_KRA").append($("<option>").val(0).text('Select a Team Member'));
//            $.each(SubordinateList.responseJSON.Result, function (index, data) {
//                var sub_emp_code = data.EmployeeId;
//                var emp_name = data.FirstName;
//                if (data.MiddleName != "" && data.MiddleName != null) {
//                    emp_name += ' ' + data.MiddleName + ' ';
//                }
//                emp_name += ' ' + data.LastName;
//                $("#ddlMyTeamList_KRA").append($("<option>").val(sub_emp_code).text(emp_name + ' - ' + data.NewEmployeeCode));
//                count++;
//            });
//        }
//        return count;
//    } else {
//        return 0;
//    }
//}