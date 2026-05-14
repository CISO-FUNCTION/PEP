

$(document).ready(function () {

    $('#DivUpdateDelegator').show();


    if (sessionStorage.EmployeeRoleId == 1) {
        window.location.href = "/Error/NotAuthorized";
    } else {
        if (sessionStorage.EmployeeRoleId == 3) {


            $("#dvManagerWise").show();
            $("#dvEmployeeWise").hide();
            $("#mgrWiseLoad").hide();
            $("#radioButtonDelegation").hide();
            GetSubByMgr();
        }
        else {
            $("#dvEmployeeWise").show();
            $("#dvManagerWise").hide();
        }
        $("#chk_selectall").click(function () {
            $(".chk_delegatee").prop('checked', $(this).prop('checked'));
        });

        $(document).on('change', '.chk_delegatee', function () {
            if (!$(this).prop("checked")) {
                jQuery('span', $('#uniform-chk_selectall')).removeClass("checked");
                $('#chk_selectall').removeAttr("checked");
            }
        });
        GetMgr();
        $("#changeApprover").hide();


        $("#UpdateDelegator").click(function () {
            var empids = [];
            var i = 0;
            $('input[name="radio_delegatee"]:checked').each(function () {
                i++;
            });

            if (i > 0) {
                $("#txtDelegator").autocomplete({

                    source: function (request, response) { GetDelegatorName(request, response) },
                    select: function (e, i) {
                        $("[id$=hdnsearchEmp]").val(i.item.val);
                    },
                    minLength: 3
                });
                $("#modalUpdateDelegator").show();
                $("#delegatorName").autocomplete("option", "appendTo", "#modalUpdateDelegator");


            } else {
                alert('Select atleast one option');
            }


        });

        $("#btnCancelDelegator").click(function () {

            cancelModalUpdateDelegator();
            // GetSubByMgr();
        });
        $("#btnCancelmodalDelegatorUpdateMessages").click(function () {
            cancelModalUpdateDelegatorMeassges();
            if (sessionStorage.EmployeeRoleId == 3) {
                GetSubByMgr();
            }
            else {
                var radioButtonId = $('input[name=options]:checked').attr("id");
                if (radioButtonId == 'rbMgrWise')
                    GetSubByMgr();
            }
        }
        );
        $('#btnEditDelegator').click(function () {
            var empids = [];
            var i = 0;
            $('input[name="chk_delegatee"]:checked').each(function () {
                i++;
            });

            if (i > 0) {
                $("#txtDelegator").autocomplete({

                    source: function (request, response) { GetDelegatorName(request, response) },
                    select: function (e, i) {
                        $("[id$=hdnsearchEmp]").val(i.item.val);
                    },
                    minLength: 3
                });
                $("#modalUpdateDelegator").show();
                $("#delegatorName").autocomplete("option", "appendTo", "#modalUpdateDelegator");


            } else {
                alert('Select atleast one option');
            }



        });

        $("#btnUpdateDelegator").click(function () {
            debugger;
            var radioButtonId = $('input[name=options]:checked').attr("id");
            var delegatorName = $("#delegatorName").val();
            if (delegatorName.trim() != '') {
                debugger;
                if (radioButtonId == 'rbMgrWise' || sessionStorage.EmployeeRoleId == 3) {
                    msg = '';

                    var empids = [];

                    var empCodes = [];
                    var i = 0;

                    $("#tableDelegationDetails tbody  tr").each(function () {
                        var td = $(this).find('td');
                        var chkValue = $(this).find(":checked");
                        if (chkValue.length >= 1) {


                            var empNo = $(this).find(":checked").attr('id');
                            var empCode = td[1].innerHTML + ' ' + td[2].innerHTML;
                            empids[i] = empNo;
                            // empids.push(empCode);
                            empCodes[i] = empCode;
                            i++;
                        }
                    });
                    var fromEmp = "";

                    fromEmp = sessionStorage.EmployeeId;

                    var approverCode = $("#hdnDelegator").val();

                    if (approverCode != '')
                        if (approverCode.length > 1)
                            $.each(empids, function (index, value) {
                                var empNo = value;

                                var empCode = empCodes[index];
                                UpdateDelegator(fromEmp, empNo, approverCode, empCode);

                            });
                    if (msg.length > 0) {
                        document.getElementById('tableMessage').innerHTML = msg;
                        $("#modalDelegatorUpdateMessages").show();
                        cancelModalUpdateDelegator();
                        //  GetSubByMgr();
                        $("#chk_selectall").prop('checked', false);
                    }
                }
                if (radioButtonId == 'rbEmpWise') {
                    msg = '';
                    var empCode = $("#txtEmpName").val();

                    var empids = [];
                    var i = 0;
                    $('input[name="radio_delegatee"]:checked').each(function () {

                        var empNo = $(this).attr('id');

                        empids[i] = empNo;
                        i++;
                    });
                    var fromEmp = "";

                    fromEmp = sessionStorage.EmployeeId;

                    var approverCode = $("#hdnDelegator").val();

                    if (approverCode != '')
                        if (approverCode.length > 1)
                            $.each(empids, function (index, value) {
                                var empNo = value;

                                UpdateDelegator(fromEmp, empNo, approverCode, empCode);

                            });
                    if (msg.length > 0) {
                        document.getElementById('tableMessage').innerHTML = msg;
                        $("#modalDelegatorUpdateMessages").show();
                        cancelModalUpdateDelegator();
                        //    GetSubByMgr();

                    }
                }
            }
            else {
                alert("Enter Delegator");
                $("#delegatorName").focus();
                return false;
            }
        });
        $("#SearchEmpDetails").click(function () {
            var searchVal = $("#txtEmpName").val().trim();
            if (searchVal === "") {
                $("#txtEmpName").focus();
                alert("Enter Employee Name or Employee ID");
                return false;
            }
            // If user typed a numeric employee ID, use it directly (no need to select from autocomplete)
            if (/^\d+$/.test(searchVal)) {
                $("#hdnsearchEmp").val(searchVal);
            } else {
                // Search by name: must have selected from autocomplete so hdnsearchEmp is set
                if ($("#hdnsearchEmp").val() === "" || $("#hdnsearchEmp").val() == null) {
                    $("#txtEmpName").focus();
                    alert("Select an employee from the list, or enter Employee ID and search.");
                    return false;
                }
            }
            if ($("#hdnsearchEmp").val() == sessionStorage.EmployeeId) {
                $("#txtEmpName").focus();
                alert("You cannot change your own Delegator");
                $("#txtEmpName").val("");
                $("#hdnsearchEmp").val("");
                return false;
            }
            GetEmpBySearch();
            $("#changeApprover").show();
        });
        debugger;
        $("#txtEmpName").autocomplete({

            source: function (request, response) { GetEmpName(request, response); },
            select: function (e, i) {
                $("[id$=hdnsearchEmp]").val(i.item.val);
            },
            minLength: 3
        });
        debugger;
        $("#txtDelegator").autocomplete({

            source: function (request, response) { GetDelegatorName(request, response); },
            select: function (e, i) {
                $("[id$=hdnDelegator]").val(i.item.val);
            },
            minLength: 3
        });

        $("#delegatorName").autocomplete({

            source: function (request, response) { GetDelegatorName(request, response); },
            select: function (e, i) {
                $("[id$=hdnDelegator]").val(i.item.val);

            },
            minLength: 3
        });
        $("#btnSearchSub").click(function () {
            if ($("#ddlMgr").val() == 0) {
                $("#ddlMgr").focus();
                alert("Select a Manager");
                return false;
            }
            else
                GetSubByMgr();
        });

        $("#rbMgrWise").change(function () {
            $("#txtEmpName").val("");
            $("#txtDelegator").val("");
            $("#changeApprover").hide();
            $("#valueEmpNo").val("");
            $("#valueEmpName").val("");
            $("#valueMgr").val("");
            $("#dvManagerWise").show();
            $("#dvEmployeeWise").hide();
            $("#modalDelegatorUpdateMessages").hide();
        });

        $("#rbEmpWise").change(function () {
            $("#dvManagerWise").hide();
            $("#dvEmployeeWise").show();
            $("#modalDelegatorUpdateMessages").hide();
        });


        $("#btnDeleteDelegatorEmpWise").click(function () {
            //var i = 0;
            var i = 0;
            $('input[name="radio_delegatee"]:checked').each(function () {
                i++;
            });
            if (i > 0) {
                // $('input[name="radio_delegatee"]').attr('checked', true);

                msg = '';
                var empCode = $("#txtEmpName").val().indexOf('-') >= 0 ? $("#txtEmpName").val().split('-')[1] : $("#txtEmpName").val();

                var empids = [];
                var i = 0;
                $('input[name="radio_delegatee"]:checked').each(function () {

                    var empNo = $(this).attr('id');

                    empids[i] = empNo;
                    i++;
                });
                var fromEmp = "";

                fromEmp = sessionStorage.EmployeeId;

                var approverCode = 0;

                $.each(empids, function (index, value) {
                    var empNo = value;

                    DeleteDelegator(fromEmp, empNo, approverCode, $("#txtEmpName").val());

                });
                if (msg.length > 0) {
                    document.getElementById('tableMessage').innerHTML = msg;
                    $("#modalDelegatorUpdateMessages").show();


                }
            }
            else {
                alert('Select atleast one option');
            }

        });

        $("#btnDeleteDelegatorMgrWise").click(function () {
            var i = 0;
            $('input[name="chk_delegatee"]:checked').each(function () {
                i++;
            });
            if (i > 0) {


                msg = '';

                var empids = [];

                var empCodes = [];
                var i = 0;

                $("#tableDelegationDetails tbody  tr").each(function () {
                    var td = $(this).find('td');
                    var chkValue = $(this).find(":checked");
                    if (chkValue.length >= 1) {


                        var empNo = $(this).find(":checked").attr('id');
                        var empCode = td[1].innerHTML + '-' + td[2].innerHTML;
                        empids[i] = empNo;
                        // empids.push(empCode);
                        empCodes[i] = empCode;
                        i++;
                    }
                });
                var fromEmp = "";

                fromEmp = sessionStorage.EmployeeId;

                var approverCode = 0;


                $.each(empids, function (index, value) {
                    var empNo = value;
                    //$.each(empCodes, function (index, value) {
                    var empCode = empCodes[index];
                    DeleteDelegator(fromEmp, empNo, approverCode, empCode);

                    // });
                });
                if (msg.length > 0) {
                    document.getElementById('tableMessage').innerHTML = msg;
                    $("#modalDelegatorUpdateMessages").show();
                    $("#chk_selectall").prop('checked', false);
                    // cancelModalUpdateDelegatorMeassges();


                    // GetSubByMgr();
                }

            }

            else {
                alert('Select atleast one option');
            }
        });
    }
});
function GetEmpBySearch() {

    var managerId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;
    var appraisalCycleId = sessionStorage.AppraisalCycleId;

    var svrPath = CONFIG.get('SERVERNAME');
    // var searchString = $("#txtEmpName").val().split('-')[1];
    var searchString = $("#hdnsearchEmp").val();
    var apiPath = svrPath + 'EmployeeMaster?EmployeeId=' + searchString + '&AppraisalCycleId=' + appraisalCycleId + '&extra1=""';

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };
    CommonAjaxGET(apiPath, headerInfo).done(function (data) {
        if (data.Success == false) {

            return false;
        }
        else {
            $("#tableDelegationDetailsEmpWise").DataTable({


                destroy: true,
                data: data.Result,
                "sPaginationType": "full_numbers",
                "iDisplayLength": 10,
                "bLengthChange": false,
                "oLanguage": {
                    "oPaginate": {
                        "sNext": '<a href="#"><span class="glyphicon glyphicon-triangle-right"></span></a>',
                        "sPrevious": '<a href="#"><span class="glyphicon glyphicon-triangle-left"></span></a>',
                        "sLast": '<a href="#"><span class="glyphicon glyphicon-step-forward"></span></a>',
                        "sFirst": '<a href="#"><span class="glyphicon glyphicon-step-backward"></span></a>'
                    }
                },

                "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
                aoColumns: [

                    {
                        mRender: function (data, type, full) {

                            return '<input type="radio" class=radio_delegatee name=radio_delegatee id=' + full["EmpMgrMappingId"] + '' + (data == 'True' ? 'checked' : '') + ' /> <input type="hidden" id="hdnManagerId" name="hdnManagerId" value="' + full.ManagerEmpId + '"/>';

                        }
                    },


                    {
                        mData: "ManagerName",
                        "sClass": "left",
                        "mRender": function (data, type, full) {
                            return full.ManagerName;
                        }
                    },
                    {
                        mData: "DelegatorName",
                        "sClass": "left",
                        "mRender": function (data, type, full) {
                            if (full.DelegatorName == null)
                                return "-";
                            else
                                return full.DelegatorName + ' ' + full.DelegatorEmpId;
                        }
                    },
                ]

            });


        }
    });


}
function GetEmpName(request, response) {

    if (sessionStorage.EmployeeRoleId == 5) {
        //source: function (request, response) {
        var managerId = sessionStorage.EmployeeId;
        var token = sessionStorage.TokenValue;
        var svrPath = CONFIG.get('SERVERNAME');
        var locationId = 0;
        debugger;
        var apiPath = svrPath + 'Search/GetEmployeeByName?Name=' + request.term + '&LocationId=' + locationId;;

        var headerInfo = {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        };

        CommonAjaxGET(apiPath, headerInfo).done(function (data) {
            if (data.Success == false) {

                return false;
            }
            else {
                response($.map(data.Result, function (item) {

                    return { label: CommonGetName(item.FirstName, item.LastName) + "-" + item.NewEmployeeCode, val: $.trim(item.EmployeeId) };
                }))
            }



        });
    }
    if (sessionStorage.EmployeeRoleId == 4) {

        var locationId = sessionStorage.LocationId;
        var managerId = sessionStorage.EmployeeId;
        var token = sessionStorage.TokenValue;
        var svrPath = CONFIG.get('SERVERNAME');

        var apiPath = svrPath + 'Search?Name=' + request.term + '&LocationId=' + locationId + '&EmpLoginId=' + sessionStorage.EmployeeId;;

        var headerInfo = {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        };

        CommonAjaxGET(apiPath, headerInfo).done(function (data) {
            if (data.Success == false) {
                // alert(data.ErrorCode + '\n' + data.ErrorMessage);
                return false;
            }
            else {
                response($.map(data.Result, function (item) {
                    return { label: CommonGetName(item.FirstName, item.LastName) + "-" + item.NewEmployeeCode, val: $.trim(item.EmployeeId) };
                }))
            }



        });
    }
    if (sessionStorage.EmployeeRoleId == 3) {
        var managerId = sessionStorage.EmployeeId;
        var token = sessionStorage.TokenValue;
        var appraisalCycleId = sessionStorage.AppraisalCycleId;

        var svrPath = CONFIG.get('SERVERNAME');

        var apiPath = svrPath + 'Search?ManagerId=' + managerId + '&Name=' + request.term + '&AppraisalCycleId=' + appraisalCycleId;

        var headerInfo = {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        };

        CommonAjaxGET(apiPath, headerInfo).done(function (data) {
            if (data.Success == false) {
                // alert(data.ErrorCode + '\n' + data.ErrorMessage);
                return false;
            }
            else {
                response($.map(data.Result, function (item) {

                    return { label: CommonGetName(item.FirstName, item.LastName) + "-" + item.NewEmployeeCode, val: $.trim(item.EmployeeId) };

                }))
            }



        });
    }
    if (sessionStorage.EmployeeRoleId == 7) { //added Janice 27/03/2018
        var managerId = sessionStorage.EmployeeId;
        var token = sessionStorage.TokenValue;
        var appraisalCycleId = sessionStorage.AppraisalCycleId;

        var svrPath = CONFIG.get('SERVERNAME');

        var apiPath = svrPath + 'Search?name=' + request.term + '&DUId=' + sessionStorage.HRDUId + "&type='A'";
        var headerInfo = {
            'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
            'X-EmpNo': sessionStorage.EmployeeId
        };

        CommonAjaxGET(apiPath, headerInfo).done(function (data) {
            if (data.Success == false) {
                // alert(data.ErrorCode + '\n' + data.ErrorMessage);
                return false;
            }
            else {
                response($.map(data.Result, function (item) {

                    return { label: CommonGetName(item.FirstName, item.LastName) + "-" + item.NewEmployeeCode, val: $.trim(item.EmployeeId) };

                }))
            }



        });
    }
}
function UpdateDelegator(fromEmp, forEmp, toEmp, empCode) {


    var token = sessionStorage.TokenValue;
    var appraisalCycleId = sessionStorage.AppraisalCycleId;

    var svrPath = CONFIG.get('SERVERNAME');


    var apiPath = svrPath + 'Delegator/UpdateDelegator?AppraisalCycleId=' + appraisalCycleId + '&FromEmployeeId=' + fromEmp + '&EmpMgrMapId=' + forEmp + '&ToEmployeeId=' + toEmp + '&Action=U';

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    //CommonAjaxGET(apiPath, headerInfo).done(function (data) 
    CommonAjaxPOSTwithurl(apiPath, headerInfo).done(function (data) {
        {
            if (data.Success == false) {
                $("#txtEmpName").val("");
                $("#txtDelegator").val("");
                $("#changeApprover").hide();
                $("#valueEmpNo").val("");
                $("#valueEmpName").val("");
                $("#valueMgr").val("");

                msg += "<tr><td>" + data.Result[0].ErrorMessage + "</td><td>" + empCode + "</td></tr>";

                return false;
            }
            else {
                msg += "<tr><td>Successfully Updated for </td><td>" + empCode + " </td></tr>";

                //   GetSubByMgr();

                $("#txtEmpName").val("");
                $("#txtDelegator").val("");
                $("#changeApprover").hide();
                $("#valueEmpNo").val("");
                $("#valueEmpName").val("");
                $("#valueMgr").val("");


            }
        }
    });


}

function DeleteDelegator(fromEmp, forEmp, toEmp, empCode) {


    var token = sessionStorage.TokenValue;
    var appraisalCycleId = sessionStorage.AppraisalCycleId;

    var svrPath = CONFIG.get('SERVERNAME');


    var apiPath = svrPath + 'Delegator/UpdateDelegator?AppraisalCycleId=' + appraisalCycleId + '&FromEmployeeId=' + fromEmp + '&EmpMgrMapId=' + forEmp + '&ToEmployeeId=' + toEmp + '&Action=D';

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    // CommonAjaxPUT(apiPath, headerInfo).done(function (data)
    CommonAjaxPOSTwithurl(apiPath, headerInfo).done(function (data) {
        if (data.Success == false) {
            $("#txtEmpName").val("");
            $("#txtDelegator").val("");
            $("#changeApprover").hide();
            $("#valueEmpNo").val("");
            $("#valueEmpName").val("");
            $("#valueMgr").val("");
            if (data.Result.length > 0) {
                msg += "<tr><td>" + data.Result[0].ErrorMessage + "</td><td>" + empCode + "</td></tr>";
            } else {
                msg += "<tr><td>Oops some error for </td><td>" + empCode + "</td></tr>";
            }



            return false;
        }
        else {
            msg += "<tr><td>Successfully Deleted for </td><td>" + empCode + " </td></tr>";

            //  GetSubByMgr();

            $("#txtEmpName").val("");
            $("#txtDelegator").val("");
            $("#changeApprover").hide();
            $("#valueEmpNo").val("");
            $("#valueEmpName").val("");
            $("#valueMgr").val("");


        }
    });


}

function GetDelegatorName(request, response) {

    var managerId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;
    var svrPath = CONFIG.get('SERVERNAME');
    var locationId = 0;
    var apiPath = svrPath + 'Search/GetEmployeeByName?Name=' + request.term + '&LocationId=' + locationId;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    CommonAjaxGET(apiPath, headerInfo).done(function (data) {
        if (data.Success == false) {
            return false;
        }
        else {
            response($.map(data.Result, function (item) {
                return { label: CommonGetName(item.FirstName, item.LastName) + "-" + item.NewEmployeeCode, val: $.trim(item.EmployeeId) };
            }))
        }



    });

}
function GetMgr() {

    debugger;
    var appraisalCycleId = sessionStorage.AppraisalCycleId;
    var managerId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;
    var svrPath = CONFIG.get('SERVERNAME');
    var locationId = sessionStorage.LocationId;
    var role = sessionStorage.EmployeeRoleId;
    if (role == 5)
        locationId = 0;
    var apiPath = svrPath + 'EmployeeMaster?AppraisalCycleId=' + appraisalCycleId + '&LocationId=' + locationId;

    if (role == 4) {
        apiPath = svrPath + 'EmployeeMaster?AppraisalCycleId=' + appraisalCycleId + '&EmpLoginId=' + sessionStorage.EmployeeId + '&LocationId=' + locationId;
    }

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    CommonAjaxGET(apiPath, headerInfo).done(function (data) {
        if (data.Success == false) {
            return false;
        }
        else {
            var name = "";
            var newOption = $('<option value="0">--Select--</option>');
            $('#ddlMgr').append(newOption);
            $.each(data.Result, function (i, data) {
                name = data.FirstName + ' ' + data.LastName + '-' + data.NewEmployeCode;
                $('<option>',
                    {
                        value: data.EmployeeId,
                        text: name
                    }).html(name).appendTo("#ddlMgr");
            });
        }



    });

}
function GetSubByMgr() {

    debugger;
    var managerId = "";
    if (sessionStorage.EmployeeRoleId == 3) {
        managerId = sessionStorage.EmployeeId;
    }
    else
        managerId = $("#ddlMgr").val();
    var token = sessionStorage.TokenValue;
    var apprisalCycleId = sessionStorage.AppraisalCycleId;

    var svrPath = CONFIG.get('SERVERNAME');
    var Mode = "delegator";
    var apiPath = svrPath + 'Team?id=' + managerId + '&AppraisalCycleId=' + apprisalCycleId + '&viewAwardsMode=' + Mode;
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    CommonAjaxGET(apiPath, headerInfo).done(function (data) {
        FillMyEmployeesList(data);
    });


}
function FillMyEmployeesList(SubordinateList) {
    if (SubordinateList.Success == true || SubordinateList.ErrorCode == "NotFound") {
        if (SubordinateList.ErrorCode == 'NotFound') {
            SubordinateList.Result = null;
            $('#tableDelegationDetails').hide();
            $('#tableDelegationDetails_info').hide();
            $('#tableDelegationDetails_paginate').hide();
            $('#tableDelegationDetails_filter').hide();
        } else {
            $('#tableDelegationDetails').show();
            $('#tableDelegationDetails_info').show();
            $('#tableDelegationDetails_paginate').show();
            $('#tableDelegationDetails_filter').show();
            $("#tableDelegationDetails").DataTable({
                destroy: true,
                data: SubordinateList.Result,
                "sPaginationType": "full_numbers",
                "iDisplayLength": 10,
                "bLengthChange": false,
                "oLanguage": {
                    "oPaginate": {
                        "sNext": '<a href="#"><span class="glyphicon glyphicon-triangle-right"></span></a>',
                        "sPrevious": '<a href="#"><span class="glyphicon glyphicon-triangle-left"></span></a>',
                        "sLast": '<a href="#"><span class="glyphicon glyphicon-step-forward"></span></a>',
                        "sFirst": '<a href="#"><span class="glyphicon glyphicon-step-backward"></span></a>'
                    },
                    "sEmptyTable": "No Subordinaes Found"
                },

                "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
                aoColumns: [
                    {
                        mRender: function (data, type, full) {

                            return '<input type="checkbox" class=chk_delegatee name=chk_delegatee id=' + full["EmpMgrMappingId"] + '' + (data == 'True' ? 'checked' : '') + ' /><input type="hidden" id="hdnEmployeeIdGrid" name="hdnEmployeeIdGrid" value="' + full.EmployeeId + '"/>';

                        }
                    },


                    {
                        mData: "FirstName",
                        "sClass": "left",
                        "mRender": function (data, type, full) {
                            var nm = CommonGetName(full.FirstName, full.LastName)
                            return nm + '-' + full.NewEmployeeCode;
                        }
                    },
                    { mData: "ManagerName" },
                    { mData: "DelegatorName" }
                ]

            });
        }
    }
    else {
        if (SubordinateList.ErrorCode == "Unauthorized") {
            alert("You will be logged out");
            window.location.href = "/Account/Login";
        }

        // return false;

    }



}
function cancelModalUpdateDelegator() {
    $('#delegatorName').val('');
    $('#modalUpdateDelegator').hide();
}
function cancelModalUpdateDelegatorMeassges() {

    $('#modalDelegatorUpdateMessages').hide();
}



