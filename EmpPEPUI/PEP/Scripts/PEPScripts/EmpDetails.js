$(document).ready(function () {
    GetEmpDetailByDomainId();
    GetPreviousManagers();
    //var webAPIURL = 'http://localhost:54652/api/EmployeeMaster/GetEmployeeDetailsByDomainId/domain';
  //  var webAPIURL1 = 'http://localhost:54652/api/EmployeeMaster/GetPreviousManager/mgr';
});
function GetEmpDetailByDomainId() {
   // alert(localStorage.getItem("DomainId"));
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + "EmployeeMaster/GetEmployeeDetailsByDomainId/domain?domainId=" + localStorage.getItem("DomainId");
        var employeeDetails;// = { domainId: localStorage.getItem("DomainId") };
       
        data = CommonAjaxPOST(apiPath, employeeDetails);
        var a = new Date((data[0].FromDate)).toDateString();
            $("#lblEmpValue").text(data[0].FirstName + ' ' + data[0].LastName);
            $("#lblEmpDesValue").text(data[0].EmployeeDesignationName);
            $("#lblEmpMgrValue").text(data[0].ManagerName);
            $("#lblEmpMgrHistoryValue").text(a);
            $("#lblEmpLastFeedaback").text();
        }
       
    function GetPreviousManagers() {
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + "EmployeeMaster/GetPreviousManager/mgr";
       
        $('.pop').popover({
            html: true,
            content: function () {

               
                var data = '';
                var content_id = "content-id-" + $.now();

                $.ajax({
                    type: 'Get',
                    url: apiPath,
                    cache: false,
                  
                    data: { EmpNo: localStorage.getItem("EmployeeId") }
                }).done(function (d) {
                    for (i = 0; i < d.length; i++) {

                                    data = data + d[i] + ',';
                            }
                            data = data.substr(0, data.length - 1);
                            $('#' + content_id).html(data);
                });

                return '<div id="' + content_id + '">Loading...</div>';

                //PreviousManager = CommonAjaxPOST(apiPath, employeeMgr)
                //$.ajax({
                //    type: 'POST',
                //    url: apiPath,
                //    data: { EmpNo: localStorage.getItem("EmployeeId") },
                //    cache: false,
                 
                //})
                //    .done(function (d) {

                //        for (i = 0; i < d.length; i++) {

                //            data = data + d[i] + ',';
                //    }
                //    data = data.substr(0, data.length - 1);
                //    $('#' + content_id).html(data);
                //});

                //return '<div id="' + content_id + '">Loading...</div>';



            }



        });
    }
          
       
