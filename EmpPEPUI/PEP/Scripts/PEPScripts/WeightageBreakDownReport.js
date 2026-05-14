$(document).ready(
    function () {
        var managerId = "";
        var toEmployeeId = "";
        if (sessionStorage.EmployeeRoleId == 5) {
            managerId = $("#ddlMgrWeightageCalculation").val();
            toEmployeeId = $("#ddlEmpWeightageCalculation").val();

            var apprisalCycleId = sessionStorage.AppraisalCycleId;
            var svrPath = CONFIG.get('SERVERNAME');
            var apiPath = svrPath + 'Reports/Get?AppraisalCycleId=' + apprisalCycleId + '&FromEmployeeId=' + managerId + '&ToEmployeeId=' + toEmployeeId + '&ActionTypeId=1&Type=Breakdown';

            var WeightageBreakDown = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

            reporttable = "<tr><td>KRA Weightage</td>";
            $.each(data.Result.Weightage, function (i, val) {
                reporttable += "<td>"+val+"</td>";
            });
            reporttable += "</tr>";
            reporttable = "<tr><td>FeedbackScore Weightage</td>";

            $.each(data.Result, function (i, val) {
                if (val.AreaId == 2) {
                    reporttable += "<td>" + val.Weightage + "<input type='hidden' id='KRAID' /></td>";
                }
            });
            reporttable += "</tr>";


        }
    });