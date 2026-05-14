
var allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'xls', 'xlsx', 'doc', 'docx', 'msg', 'txt', 'eml'];

var FRoleId = -1;


var PermissableInsert = 0;
var PIP_SUBMITByManager = 1; // Pending on HRBP
var RM_to_share_moreInfo_on_PIP_initiation = 2; // Referred back by HRBP to RM
var PIP_Re_SUBMITByManager = 3 // Re-submit by manager once ReferredBack By HRBP
var PIP_RejectByHRBP = 4; // Closed by HRBP by Rejection action
var PIP_ApproveByHRBP = 5; //RM to fill PIP Form
var PIPDocumentSignoffpendingOnHRBP = 6; // HRBP to sign off PIP Form
var PIPReferbackToRM = 7;
var PIP_Document_to_be_shared_with_employee = 8;
var PIP_in_progress = 9;
var PIP_Successfully_Completed = 10;
var PIP_Unsuccessful = 11;
var PIP_Extended = 12;


var PIPDiscussionDateRange = '';
let isSubmitting = false;
let isSubmitting1 = false;



$(document).ready(function () {

    if ((sessionStorage.LocationId == '3' || sessionStorage.LocationId == '76') && sessionStorage.IsHRBP == false) {

        window.location.href = '/Error/NotAuthorized';
    }

    $('#addProblemIssue').click(function () {

        $('#btnAddPIPDetails').text('Add PIP parameter');
        $("#hdnPIP_ParameterID").val(0);
        $("#hdnPIP_PIPID").val($("#hdnsPIPID").val());
        $("#hdnPIP_PEPEmpID").val($("#hdnsPEPEmpID").val());
        $("#hdnPIP_StatusId").val($("#hdnsStatusId").val());



        $("#txtProblemIssue").val('');
        $("#txtDeliverables").val('');
        $("#txtProgressMeasurement").val('');
        $('#btnAddPIPDetails').prop('disabled', false);

        $('#addPIPPopup').modal('show');

    })

    var table = $('#tableaddResponse').DataTable();


    $('#ddlAspireReportee').select2({
        placeholder: "Select an option",
        allowClear: true

    });
    if (SelectionRoleId == 1) {

        EmployeePIPView();
    }

    if (SelectionRoleId == 2) {

        $('#PIPReporteeDDLDiv').show();
        GetMgr();
        $('#PIPFilterDiv').show();

    } else {
        $('#PIPReporteeDDLDiv').hide();

        $('#PIPFilterDiv').hide();
    }


    BindPIPEmpList();

    $(document).on("click", ".browse", function () {
        var file1 = $(this)
            .parent()
            .parent()
            .parent()
            .find(".file");
        file1.trigger("click");
    });
    $(document).on("change", ".file", function () {
        $(this)
            .parent()
            .find(".form-control")
            .val(
                $(this)
                    .val()
                    .replace(/C:\\fakepath\\/i, "")
            );
    });

    function sanitizeFileName(fileName) {
        return fileName.replace(/[^a-z0-9\.\-]/gi, '_').toLowerCase();
    }






    $('#btnAddDoc').on("click", function () {



        if ($(this).is(':disabled')) {
            e.preventDefault(); // Prevent the default action
            return false; // Stop the execution of further code
        }


        $('#btnAddDoc').prop('disabled', true)

        //var rowIndex = $("#uploadDocfile").get(0).files;
        var options = { "backdrop": "static", keyboard: true };
        var fileAttachement = $("#uploadDocfile").get(0).files;



        if ($('#txtPIPReason').val().trim().length == 0) {

            toastr.error("PIP Reason must be added.");
            $('#btnAddDoc').prop('disabled', false)


            return false;
        }


        var formData = new FormData();

        formData.append("SelectedEmpID", parseInt($('#hdnPEPEmpID').val()));
        formData.append("LoginEmpId", sessionStorage.EmployeeId);

        //formData.append("PIPId", parseInt($('#hdnPIPIdNumber').val()));



        if (fileAttachement.length > 0 && $("#hdnPIPId").val() == 0) {

            var fileName = (fileAttachement[0].name).toLowerCase();
            var fileExtension = fileName.substr((fileName.lastIndexOf('.') + 1));


            // Loop through each file
            for (var i = 0; i < fileAttachement.length; i++) {
                var fileName = fileAttachement[i].name;

                if (fileAttachement[i].size > 10000000) {
                    $("#error").html("Please keep file attachement size upto 10MB for : " + fileName);
                    $('#errorMsg').modal(options);
                    $('#errorMsg').modal('show');
                    $('#btnAddDoc').prop('disabled', false)

                    $('.loader-div').hide();

                    return false;
                }
                // Check if the file extension is valid

                if (fileName.indexOf(',') > -1) {
                    $("#error").html('Comma (,) should not be allowed in filename.');
                    $('#errorMsg').modal(options);
                    $('#errorMsg').modal('show');
                    $('.loader-div').hide();
                    $('#btnAddDoc').prop('disabled', false)

                    $('.loader-div').hide();

                    return false;
                }
                if (fileName.indexOf('\'') > -1) {
                    $("#error").html('Apostrophe is not allowed in file name.');
                    $('#errorMsg').modal(options);
                    $('#errorMsg').modal('show');
                    $('#btnAddDoc').prop('disabled', false)

                    $('.loader-div').hide();
                    return false;
                }


                if (!validateFileExtension(fileName)) {
                    $("#error").html('Invalid file extension for file: ' + fileName);
                    $('#errorMsg').modal(options);
                    $('#errorMsg').modal('show');
                    $('#btnAddDoc').prop('disabled', false)

                    $('.loader-div').hide();

                    return false;
                    // Clear the file input to prevent invalid files from being uploaded
                    //$('#fileInput').val('');
                    //return;
                } else {


                    formData.append("Attachment", sanitizeFileName(fileAttachement[i].name));
                    formData.append("file", fileAttachement[i], sanitizeFileName(fileAttachement[i].name));



                }
            }


            formData.append("PIPId", parseInt($("#hdnPIPId")));
            formData.append("PIPReason", $('#txtPIPReason').val());

            formData.append("Action", PIP_SUBMITByManager);


            var svrPath = CONFIG.get('SERVERNAME');
            var urlPath = svrPath + "PIP/UploadDocFile";

            $.ajax({
                datatype: "json",
                url: urlPath,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    if (response == 2) {
                        $('#addPIPDoc').modal('hide');
                        toastr.success("Documents uploaded successfully.")

                        $('#divSEmpID').css('display', 'none');
                        BindPIPEmpList();

                        $('.loader-div').hide();
                    }
                    else if (response == 1) {
                        toastr.error("Documents already uploaded with same name.");
                        $('#btnAddDoc').prop('disabled', false)

                        $('.loader-div').hide();
                    }
                    else {
                        toastr.error("There is error in file upload.");
                        $('#btnAddDoc').prop('disabled', false)

                        $('.loader-div').hide();
                    }
                    // Handle success response
                },
                error: function (xhr, status, error) {
                    console.log(error);
                    $('#btnAddDoc').prop('disabled', false)

                    $('.loader-div').hide();
                    // Handle error
                }
            });

        }
        else if (parseInt($("#hdnPIPId").val()) > 0) {


            if (fileAttachement.length > 0) {

                var fileName = (fileAttachement[0].name).toLowerCase();
                var fileExtension = fileName.substr((fileName.lastIndexOf('.') + 1));


                // Loop through each file
                for (var i = 0; i < fileAttachement.length; i++) {
                    var fileName = fileAttachement[i].name;

                    if (fileAttachement[i].size > 10000000) {
                        $("#error").html("Please keep file attachement size upto 10MB for : " + fileName);
                        $('#errorMsg').modal(options);
                        $('#errorMsg').modal('show');
                        $('#btnAddDoc').prop('disabled', false)

                        $('.loader-div').hide();

                        return false;
                    }
                    // Check if the file extension is valid

                    if (fileName.indexOf(',') > -1) {
                        $("#error").html('Comma (,) should not be allowed in filename.');
                        $('#errorMsg').modal(options);
                        $('#errorMsg').modal('show');
                        $('#btnAddDoc').prop('disabled', false)

                        $('.loader-div').hide();

                        return false;
                    }
                    if (fileName.indexOf('\'') > -1) {
                        $("#error").html('Apostrophe is not allowed in file name.');
                        $('#errorMsg').modal(options);
                        $('#errorMsg').modal('show');
                        $('#btnAddDoc').prop('disabled', false)

                        $('.loader-div').hide();

                        return false;
                    }


                    if (!validateFileExtension(fileName)) {
                        $("#error").html('Invalid file extension for file: ' + fileName);
                        $('#errorMsg').modal(options);
                        $('#errorMsg').modal('show');
                        $('#btnAddDoc').prop('disabled', false)

                        $('.loader-div').hide();

                        return false;
                    } else {


                        formData.append("Attachment", sanitizeFileName(fileAttachement[i].name));
                        formData.append("file", fileAttachement[i], sanitizeFileName(fileAttachement[i].name));

                    }
                }
            } else {


                formData.append("Attachment", '');
                formData.append("file", '');

            }


            formData.append("Action", PIP_Re_SUBMITByManager);

            formData.append("PIPId", parseInt($("#hdnPIPId").val()));
            formData.append("PIPReason", $('#txtPIPReason').val());



            var svrPath = CONFIG.get('SERVERNAME');
            var urlPath = svrPath + "PIP/UploadDocFile";

            $.ajax({
                datatype: "json",
                url: urlPath,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    if (response == 2) {
                        toastr.success("Documents uploaded successfully.")
                        $('#addPIPDoc').modal('hide');
                        $('#divSEmpID').css('display', 'none');
                        BindPIPEmpList();
                        $('#btnAddDoc').prop('disabled', false)


                        $('.loader-div').hide();

                    }
                    else if (response == 1) {
                        toastr.error("Documents already uploaded with same name.");
                        $('#btnAddDoc').prop('disabled', false)

                        $('.loader-div').hide();

                    }
                    else {
                        toastr.error("There is error in file upload.");
                        $('#btnAddDoc').prop('disabled', false)

                        $('.loader-div').hide();

                    }
                    // Handle success response
                },
                error: function (xhr, status, error) {
                    $('#btnAddDoc').prop('disabled', false)

                    $('.loader-div').hide();


                    console.log(error);
                    // Handle error
                }
            });

        }
        else {
            toastr.error("Documents must be uploaded.");
            $('#btnAddDoc').prop('disabled', false)

            $('.loader-div').hide();


        }
        // Handle file upload (you can upload file using AJAX)
        //// For demonstration purpose, just console log the file details
        //console.log("File uploaded for row " + rowIndex + ": ", file);
    });


    $('#btnPIPApprove').on("click", function () {

        if ($(this).is(':disabled')) {
            e.preventDefault(); // Prevent the default action
            return false; // Stop the execution of further code
        }

        $('#confirmPIPHRBPApprove').modal('show');



    });

    $('#yesHRBPConfirm').on("click", function () {

        var EmpId = sessionStorage.EmployeeId;
        var SEmpId = $("#hdnPEPEmpID").val();
        var hdnPIPId = $("#hdnPIPIds").val();
        $('#btnPIPApprove').prop('disabled', true);
        $('#btnDocumentInAdequate').prop('disabled', true);
        Approve_InAdequateAction(EmpId, SEmpId, hdnPIPId, PIP_ApproveByHRBP); //Initiation Request Approved by HRBP

    });



    $('#InadequatebyHRBP').on("click", function () {


        if ($(this).is(':disabled')) {
            e.preventDefault(); // Prevent the default action
            return false; // Stop the execution of further code
        }

        var EmpId = sessionStorage.EmployeeId;
        var SEmpId = $("#hdnPEPEmpID").val();
        var hdnPIPId = $("#hdnPIPIds").val();
        $('#btnDocumentInAdequate').prop('disabled', true);
        $('#btnPIPApprove').prop('disabled', true);

        Approve_InAdequateAction(EmpId, SEmpId, hdnPIPId, RM_to_share_moreInfo_on_PIP_initiation); // Initiation Request Not Approved by HRBP or Document InAdequate


    })

    $('#btnDisApprovePIPbyHRBP').on("click", function () {


        if ($(this).is(':disabled')) {
            e.preventDefault(); // Prevent the default action
            return false; // Stop the execution of further code
        }

        var EmpId = sessionStorage.EmployeeId;
        var SEmpId = $("#hdnPEPEmpID").val();
        var hdnPIPId = $("#hdnPIPIds").val();
        $('#btnDocumentInAdequate').prop('disabled', true);
        $('#btnPIPApprove').prop('disabled', true);

        Approve_InAdequateAction(EmpId, SEmpId, hdnPIPId, PIP_RejectByHRBP); // Initiation Request Not Approved by HRBP or Document InAdequate


    })


    $('#btnDocumentInAdequate').on("click", function () {

        //  $('#divrejectionReason').css('display', 'block');

        if ($(this).is(':disabled')) {
            e.preventDefault(); // Prevent the default action
            return false; // Stop the execution of further code
        }

        if ($('#txtHRBPPIPRejectReason').val().trim().length == 0) {

            toastr.error("Please provide reason in the remarks section.");
            return false;
        }
        $('#InAdequatePIPbyHRBP').modal('show');



    });

    $('#btnPIPDisapprove').on("click", function () {

        //  $('#divrejectionReason').css('display', 'block');

        if ($(this).is(':disabled')) {
            e.preventDefault(); // Prevent the default action
            return false; // Stop the execution of further code
        }

        if ($('#txtHRBPPIPRejectReason').val().trim().length == 0) {

            toastr.error("Please provide reason in the remarks section.");
            return false;
        }
        $('#DisApprovePIPbyHRBP').modal('show');


    });


    function EmployeePIPView() {

        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath1 = svrPath + "PIP/PIP_GetEmployeeAllPIPDetailsByEmpID?SEmpID=" + sessionStorage.EmployeeId

        var columns = [];
        $.ajax({
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            type: 'Get',
            url: apiPath1,
            async: false,
            success: function (result) {

                // Clear the existing content
                $("#accordion").empty();
                if (result.Success == true) {
                    $.each(result.Result.data, function (index, item) {

                        var panelId = 'panel' + index;
                        var collapseId = 'collapse' + index;

                        // Create panel for each item using single quotes and template literals for data injection
                        var panelHtml =
                            '<div class="panel panel-default" id="' + panelId + '">' +
                            '<div class="panel-heading">' +
                            '<h4 class="panel-title">' +
                            '<a data-toggle="collapse" data-target="#' + collapseId + '" href="#' + collapseId + '" data-parent="#accordion">';

                        if (item.Sno == 1) {
                            panelHtml += 'Current PIP : (' + item.PIPStartDate + ' - ' + item.PIPEnddate + ')';
                        }
                        else { panelHtml += 'Previous PIP : (' + item.PIPStartDate + ' - ' + item.PIPEnddate + ')'; }

                        panelHtml += '</a>' +
                            '</h4>' +
                            '</div>' +
                            '<div id="' + collapseId + '" class="panel-collapse collapse ' + (index === 0 ? 'in' : '') + '">' +
                            '<div class="panel-body">' +
                            '<div class="row">' +
                            '<div class="col-md-6">' +
                            '<span class="text-label"><b>Employee Name: </b></span>' +
                            '<label class="text-label">' + item.EmployeeName + '</label>' +
                            '</div>' +
                            '</div></br>' +
                            '<div class="row">' +
                            '<div class="col-md-3">' +
                            '<div class="form-group">' +
                            '<label class="control-label text-label">PIP Discussion Date</label>' +
                            '<input type="text" class="form-control" value="' + item.PIPDiscussionDateRange + '" readonly>' +
                            '</div>' +
                            '</div>' +
                            '<div class="col-md-3">' +
                            '<div class="form-group">' +
                            '<label class="text-label">Start Date</label>' +
                            '<input type="text" class="form-control" value="' + item.PIPStartDate + '" readonly>' +
                            '</div>' +
                            '</div>' +
                            '<div class="col-md-3">' +
                            '<div class="form-group">' +
                            '<label class="text-label">End Date</label>' +
                            '<input type="text" class="form-control" value="' + item.PIPEnddate + '" readonly>' +
                            '</div>' +
                            '</div>' +
                            '<div class="col-md-3">' +
                            '<div class="form-group">' +
                            '<label class="text-label">PIP Duration</label>' +
                            '<input type="text" class="form-control" value="' + item.PIPTotalDays + '" readonly>' +
                            '</div>' +
                            '</div>';
                        if (item.PIPStatus > PIP_in_progress) {
                            panelHtml += '<div class="col-md-3">' +
                                '<div class="form-group">' +
                                '<label class="text-label">Total PIP Extension</label>' +
                                '<input type="text" class="form-control" value="' + item.TotalPIPExtension + '" readonly>' +
                                '</div>' +
                                '</div>'
                        }
                        panelHtml += '</a>' + '<div class="col-md-3">' +
                            '<div class="form-group">' +
                            '<label class="text-label">PIP Status</label>' +
                            '<input type="text" class="form-control" value="' + item.StatusName + '" readonly>' +
                            '</div>' +
                            '</div>' +
                            '<div class="col-md-3">' +
                            '<div class="form-group">' +
                            '<label class="text-label">Issued By RM</label>' +
                            '<input type="text" class="form-control" value="' + item.IssuedByRM + '" readonly>' +
                            '</div>' +
                            '</div>' +
                            '<div class="col-md-3">' +
                            '<div class="form-group">' +
                            '<label class="text-label">HRBP Approver</label>' +
                            '<input type="text" class="form-control" value="' + item.HRBPApprover + '" readonly>' +
                            '</div>' +
                            '</div>' +
                            '</div>';


                        var svrPath = CONFIG.get('SERVERNAME');
                        var apiPath1 = svrPath + "PIP/PIP_GetEmployeeSavedParameterDetailsByPIPId?PIPId=" + item.PIPId + "&SEmpID=" + sessionStorage.EmployeeId

                        var tableHtml = '';
                        var columns = [];
                        $.ajax({
                            contentType: 'application/json; charset=utf-8',
                            dataType: 'json',
                            type: 'Get',
                            url: apiPath1,
                            async: false,
                            success: function (result) {

                                debugger;

                                var data;
                                if (result.Success == true) {
                                    data = result.Result.data;

                                } else { data = result; }

                                if (data[0].ProblemIssue != null) {

                                    tableHtml = '<div class="row" ><div class="col-md-12 tableviewfeedback"> <table style="width:100%" id="tableviewfeedback_' + panelId + '" class="display"><thead><tr>' +
                                        '<th style="width:5%;">S.No</th>' +

                                        '<th  style="width:28%;">Problem/Issue</th>' +
                                        '<th  style="width:28%;">Deliverables</th>' +
                                        '<th  style="width:29%;">Progress Measurement</th>';
                                    if (item.FeedbackCount > 0) {
                                        tableHtml += '<th class="GiveFeed"  style="width:11%;">View Feedback</th>';
                                    }
                                    tableHtml += '</tr></thead><tbody>';

                                    var rowcount = item.FeedbackCount;
                                    data.forEach(function (item) {
                                        tableHtml += '<tr>' +
                                            '<td>' + item.Sno + '</td>' +
                                            '<td>' + item.ProblemIssue + '</td>' +
                                            '<td>' + item.Deliverables + '</td>' +
                                            '<td>' + item.ProgressMeasurement + '</td>';
                                        if (rowcount > 0) {
                                            tableHtml += '<td style="text-align:center;"><a href="#" title="View Given feedback by RM" class="Givefeed" data-toggle="modal" onclick="BindViewFeedbackToEmp(' + item.ParameterId + '); return false;"><i class="fa fa-eye"></i></a></td>';
                                        }

                                        tableHtml += '</tr>';
                                    });

                                    tableHtml += '</tbody></table></div></div>';
                                }
                            }
                        });
                        var Note = '';
                        if ((sessionStorage.LocationId == '1' || sessionStorage.LocationId == '2' || sessionStorage.LocationId == '4' || sessionStorage.LocationId == '5' || sessionStorage.LocationId == '15' || sessionStorage.LocationId == '79' || sessionStorage.LocationId == '80')) {
                            Note = '</br><div class="row"><div class="col-md-12"><b>Note : If incase, despite the effort put in, your performance is not satisfactory by the end of the PIP period, this PIP form would be considered as a notice of separation from the company and the PIP start date would be considered as the start date of your notice period.</b></div></div>'
                        }
                        else if ((sessionStorage.LocationId == '6' || sessionStorage.LocationId == '8' || sessionStorage.LocationId == '9')) {

                            Note = '</br><div class="row"><div class="col-md-12"><b>Note : If incase, despite the effort put in, your performance is not satisfactory by the end of the PIP period, your notice period would begin from the very next working day of the PIP End Date.</b></div></div>'

                        }
                        else if ((sessionStorage.LocationId == '75')) {
                            Note = '</br><div class="row"><div class="col-md-12"><b>Note : If, despite your efforts, your performance does not meet the required standards by the end of the PIP period, this PIP form will be treated as formal notice of termination, with the last day of the PIP being your final working day at the organization.</b></div></div>'
                        }
                        else if ((sessionStorage.LocationId == '13')) {
                            Note = '</br><div class="row"><div class="col-md-12"><b>Note : At the end of the Performance Improvement Plan (PIP), your overall performance during the PIP period will be reviewed, your manager and HRBP will inform you of their decision regarding further cooperation.</b></div></div>'

                        }
                        // Append each panel to the accordion
                        $("#accordion").append(panelHtml + tableHtml + Note + '</div></div></div>');

                        // Initialize DataTable
                        $("#tableviewfeedback_" + panelId).DataTable({
                            paging: true,
                            searching: true,
                            ordering: true,
                            info: true
                        });
                    });
                } else {

                    var noRecordsHtml =
                        '<div class="alert alert-info" role="alert">' +
                        '<strong>No records found!</strong> There are no PIP records to display at the moment.' +
                        '</div>';

                    $('#accordion').append(noRecordsHtml);
                }
            },
            error: function (err) {
                console.error("Error fetching employee data:", err);
            }

        });




    }


    function Approve_InAdequateAction(EmpId, SEmpId, PIPId, Action) {

        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath1 = svrPath + "PIP/PutActionbyHRBP";

        //var employeePIPDetail = [];


        var EmpPIPDetail = {
            LoginEmpId: EmpId,
            SelectEmpId: SEmpId,
            PIPId: PIPId,
            Action: Action,
            PIPRejectionReason: $('#txtHRBPPIPRejectReason').val(),

        };

        //employeePIPDetail.push(PIPdata);

        var columns = [];
        $.ajax({
            url: apiPath1,
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(EmpPIPDetail),
            async: true,
            headers: CommonGetHeaderInfo(),
            success: function (result) {

                if (result.Success == true) {
                    if (Action == 5) {

                        toastr.success("Initiation request approved successfully.");

                        $('#HRBPActionPopup').modal('hide');

                    }
                    else {
                        if (Action == 4) {

                            toastr.success("Initiation request rejected successfully.")

                            $('#HRBPActionPopup').modal('hide');

                        }
                        if (Action == 2) {

                            toastr.success("Initiation request referred back successfully.")

                            $('#HRBPActionPopup').modal('hide');

                        }
                    }
                } else {
                    toastr.warning("There is some issue in approve/reject process.");

                    $('#btnPIPApprove').prop('disabled', false);
                    $('#btnDocumentInAdequate').prop('disabled', false);
                }

                BindPIPEmpList();
            },
            error: function (xhr, statusText, errorThrown) {

                $('#btnPIPApprove').prop('disabled', false);
                $('#btnDocumentInAdequate').prop('disabled', false);


            }

        });
    }



    $('#btnPIPApproveByRole').click(function () {

        var EmpId = sessionStorage.EmployeeId;
        var SEmpId = $("#hdnsPEPEmpID").val();
        var StatusId = $("#hdnsStatusId").val();
        var PIPId = $("#hdnsPIPID").val();



        if ($('#ddlPIPDuration').val() == -1 && StatusId == PIP_ApproveByHRBP) {

            toastr.error("PIP duration must be selected.");
            $('#ddlPIPDuration').focus();
            isSubmitting = false;
            return false;
        }

        if (SelectionRoleId == 2 && (StatusId == PIP_ApproveByHRBP || StatusId == PIP_Document_to_be_shared_with_employee)) {


            if (StatusId == PIP_ApproveByHRBP) {
                $('#confirm').modal('show');
            }
            else {
                $('#submittoemployee').modal('show');

            }


        } else {

            ActionPIPForm();
        }

        $("#yes").click(function () {



            if (isSubmitting) {
                event.preventDefault();
                return false;
            }
            // isSubmitting = true;
            ActionPIPForm();

        });




        $("#EmployeeSubmitYes").click(function () {

            if (isSubmitting) {
                event.preventDefault();
                return false;
            }
            ActionPIPForm();
            $('#submittoemployee').modal('hide');
        });


        $("#EmployeeSubmitNo").click(function () {

            $('#submittoemployee').modal('hide');

        });


        function ActionPIPForm() {



            if (isSubmitting) {
                event.preventDefault();
                return false;
            }
            isSubmitting = true;


            if ($('#ddlPIPDuration').val() == -1 && StatusId == PIP_ApproveByHRBP) {

                toastr.error("PIP duration must be selected.");
                $('#ddlPIPDuration').focus();
                isSubmitting = false;
                return false;
            }
            else {

                if ($('#tableaddResponse').DataTable().data().count() == 1) {

                    toastr.error("Minimum 2 PIP parameters are needed.");
                    isSubmitting = false;
                    return false;

                }

                else if ($('#tableaddResponse').DataTable().data().count() == 0) {

                    toastr.error("Problem-Issue/Deliverables/Progress Measuremnt must be added. Click on Add PIP button and fill.");
                    isSubmitting = false;
                    return false;

                } else {

                    if (SelectionRoleId == 2) {  // RM Role

                        if (StatusId == PIP_Document_to_be_shared_with_employee) {
                            if ($('#txtdiscussionDate').val() == '') {

                                toastr.error("PIP Discussion date must be filled.");
                                $('#txtdiscussionDate').focus();
                                isSubmitting = false;
                                return false;

                            } else {
                                // now send to employee to view the details of PIP and also PIP wll be start
                                PutPIPDocApproveProcess(EmpId, SEmpId, PIPId, $('#ddlPIPDuration').val(), PIP_in_progress);


                            } //Submit to Employee acknoweldgement of PIP pending
                        }
                        else {
                            PutPIPDocApproveProcess(EmpId, SEmpId, PIPId, $('#ddlPIPDuration').val(), PIPDocumentSignoffpendingOnHRBP); // from RM to  Submit HRBP for approval 

                        }

                    }

                    else if (SelectionRoleId == 4) { //HRBP Role
                        PutPIPDocApproveProcess(EmpId, SEmpId, PIPId, $('#ddlPIPDuration').val(), PIP_Document_to_be_shared_with_employee); //from HRBP to PIP Document to be shared with employee 

                    }
                    else if (SelectionRoleId == 1) { //Employee Role
                        PutPIPDocApproveProcess(EmpId, SEmpId, PIPId, $('#ddlPIPDuration').val(), PIP_in_progress); //from HRBP to PIP Document to be shared with employee 

                    }
                }
            }
        }

    });



    //$('#txtPIPReason, #RM_txtHRBPPIPRejectReason').on('keyup', function (e) {

    //    var text_max = parseInt($('#txtPIPReason').attr('maxLength'));

    //    var text_length = $('#txtPIPReason').val().length;
    //    var text_remaining = text_max - text_length;

    //    var text = $(this).val();
    //    var searchChars = ['<', '>', '=']; // Characters to search for

    //    // Iterate over each character in the textarea
    //    for (var i = 0; i < text.length; i++) {
    //        var char = text[i];
    //        // Check if the character is in the searchChars array
    //        if (searchChars.includes(char)) {
    //            $(e.target).addClass('csstxtarea');
    //            toastr.error("Special characters < , > and = are not allowed and !,@,#,$,%,^,&,*,(,),?,/,},{,[,],~,:,; are allowed. \n For security reasons, please refrain from using special characters in your input. Special characters may pose a risk to the system's security. Kindly remove any special characters and try again. Thank you for your understanding.")
    //            var txtValue = $(this).val();
    //            $(this).val(txtValue.replace(/[\<\>=]+/g, ''));
    //            // You can perform any action here, like highlighting the character
    //        } else {
    //            $(e.target).removeClass('csstxtarea');
    //            $(this).removeClass('csstxtarea');

    //        }
    //    }

    //    $('#txtReasonRemaining').html(': ' + text_remaining + ' characters remaining.');

    //    if (text_remaining == 500) {
    //        $('#txtReasonRemaining').hide();
    //    } else {
    //        $('#txtReasonRemaining').show();
    //    }
    //});


    function PutPIPDocApproveProcess(EmpId, SEmpId, PIPId, PIPDuration, Action) {




        var discussionDate = '01/01/1990'

        if (parseInt($("#hdnsStatusId").val()) == PIP_Document_to_be_shared_with_employee) {
            discussionDate = $('#txtdiscussionDate').val();
        }


        var PIPActualStartDate = '01/01/1990';

        if ($('#startDate').val() != '') {
            PIPActualStartDate = $('#startDate').val();
        }


        var svrPath = CONFIG.get('SERVERNAME'); // PIP_DocApproveProcess Cycle ID Paramater will be add there .. This is must in case of extension
        var apiPath2 = svrPath + "PIP/PutPIPDocApproveProcess?LoginEmpId=" + EmpId + "&SelectEmpId=" + SEmpId + "&PIPDuration=" + PIPDuration + "&PIPDiscussionDate=" + discussionDate + "&PIPActualStartDate=" + PIPActualStartDate + "&PIPId=" + PIPId + "&Action=" + Action + "&RoleId=" + SelectionRoleId;


        //$('#btnPIPApproveByRole').prop('disabled', true);



        //event.preventDefault(); // Prevent the default form submission
        //var $submitBtn = $('#btnPIPApproveByRole');
        //if ($submitBtn.prop('disabled')) {
        //    return; // If the button is already disabled, do nothing
        //}
        //$submitBtn.prop('disabled', true); // Disable the button


        var columns = [];
        $.ajax({
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            type: 'POST',
            url: apiPath2,
            async: false,
            success: function (result) {

                debugger;
                if (result.Success == true) {
                    if (SelectionRoleId == 2) {

                        if (Action == PIPDocumentSignoffpendingOnHRBP) {

                            toastr.success("PIP details submitted successfully for HRBP approval.");

                        } else {

                            toastr.success("PIP Form successfully sent to employee");
                            // toastr.success("PIP approved successfully.");

                        }

                        $('#AddDocFeedbackPopup').modal('hide');
                        $('#confirm').modal('hide');


                    }
                    else if (SelectionRoleId != 2) {

                        toastr.success("PIP approved successfully.");

                        $('#AddDocFeedbackPopup').modal('hide');
                        $('#confirm').modal('hide');

                    }

                    else {
                        toastr.error("There is some issue in approve/reject process.")

                        isSubmitting = false;
                    }


                } else {
                    toastr.error("There is some issue in approve/reject process.");
                    isSubmitting = false;
                }

                BindPIPEmpList();
                //$submitBtn.prop('disabled', false);


            },
            error: function (xhr, statusText, errorThrown) {

                //$submitBtn.prop('disabled', false);
                isSubmitting = false;
            }
        });
    }



    $('body').on('click', 'a.downloadfile', function () {

        var filenames = '';
        var EmpId = '';

        filenames = $(this).find('i').attr('data-attr');
        EmpId = $(this).find('i').attr('data-id');

        if (filenames == undefined) {

            filenames = $("#filename").text();
            EmpId = $("#hdnPEPEmpID").val();
        }

        event.preventDefault();
        var filearray = filenames.split(',');

        $.each(filearray, function (key, value) {


            var svrPath = CONFIG.get('SERVERNAME');
            var urlPath = svrPath + "PIP/GetFile?EmpId=" + EmpId + "&filename=" + encodeURIComponent(value);

            $.ajax({
                datatype: "json",
                url: urlPath,
                type: 'GET',
                xhrFields: {
                    responseType: 'blob' // Important
                },
                success: function (response, jqXHR) {


                    var a = document.createElement('a');
                    var url = window.URL.createObjectURL(response);
                    a.href = url;
                    a.download = value; // Use the original filename and extension
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a); // Clean up the DOM

                },
                error: function (xhr, status, error) {
                    console.log(error);
                    // Handle error
                }
            });



        })
    })

    $('body').on('click', 'a.popupdownloadfile', function () {

        //$("#hdnPEPEmpID").val(PEmpID);
        //$("#hdnStatusId").val(StatusId);
        ////$("#hdnPIPAttachement").val(Docfiles);
        //$("#filenamehrbp").text(Docfiles);


        var filenames = $("#filenamehrbp").text();
        var EmpId = $("#hdnPEPEmpID").val();
        //alert(filenames);

        event.preventDefault();
        var filearray = filenames.split(',');

        $.each(filearray, function (key, value) {


            var svrPath = CONFIG.get('SERVERNAME');
            var urlPath = svrPath + "PIP/GetFile?EmpId=" + EmpId + "&filename=" + encodeURIComponent(value);

            $.ajax({
                datatype: "json",
                url: urlPath,
                type: 'GET',
                xhrFields: {
                    responseType: 'blob' // Important
                },
                success: function (response, jqXHR) {


                    var a = document.createElement('a');
                    var url = window.URL.createObjectURL(response);
                    a.href = url;
                    a.download = value; // Use the original filename and extension
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a); // Clean up the DOM

                },
                error: function (xhr, status, error) {
                    console.log(error);
                    // Handle error
                }
            });



        })
    })



    $('#ddlPIPDuration').on('change', function () {


        $('#hdnPIPDuration').val($('#ddlPIPDuration').val())

    })


    $('#ddlAspireReportee').on('change', function () {

        var EmpId = $("#ddlAspireReportee").val().toString();

        if (EmpId != "0") {
            BindPIPEmpListByEmpId(EmpId)

        } else {
            $('#divSEmpID').css('display', 'none');
        }

    });


    $('#btnAddPIPDetails').click(function () {


        if ($(this).is(':disabled')) {
            e.preventDefault(); // Prevent the default action
            return false; // Stop the execution of further code
        }


        $('#btnAddPIPDetails').prop('disabled', true);

        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + "PIP/SavePIPMeasurementAgainstEmployee";

        var PIPData = {

            ParamterId: $("#hdnPIP_ParameterID").val(),
            PIPId: $("#hdnPIP_PIPID").val(),
            LoginEmpId: sessionStorage.EmployeeId,
            SelectEmpID: $('#hdnPIP_PEPEmpID').val(),
            ProgressIssue: $('#txtProblemIssue').val(),
            Deliverables: $('#txtDeliverables').val(),
            ProgressMeasuremnt: $('#txtProgressMeasurement').val(),
            CreatedBy: sessionStorage.EmployeeId
        };

        var valid = 0;
        if ($('#txtProblemIssue').val().trim() == 0) {

            toastr.error("Problem/Issues text field must be filled.");
            $('#txtProblemIssue').focus();
            valid = 1;
            $('#btnAddPIPDetails').prop('disabled', false);
            return false;
        }

        if ($('#txtDeliverables').val().trim() == 0) {

            toastr.error("Deliverables text field must be filled.");
            $('#txtDeliverables').focus();
            valid = 1;
            $('#btnAddPIPDetails').prop('disabled', false);
            return false;
        }


        if ($('#txtProgressMeasurement').val().trim() == 0) {

            toastr.error("Progress Measurement text field must be filled.");
            $('#txtProgressMeasurement').focus();
            valid = 1
            $('#btnAddPIPDetails').prop('disabled', false);
            return false;
        }

        if (valid == 0) {
            $.ajax({
                url: apiPath,
                type: 'POST',
                data: JSON.stringify(PIPData),
                async: false,
                dataType: 'json',
                contentType: 'application/json',
                headers: CommonGetHeaderInfo(),
                success: function (result) {

                    msg = 'PIP parameters details added successfully.';
                    //$('#btnAddNormAppriasalCycleGradeMapping').prop('disabled', false);

                    if (result.Success) {
                        toastr.success(msg);
                        // BindEmployeePIPParamtersDetails($('#hdnPIP_PEPEmpID').val(), $("#hdnPIP_PIPID").val())
                        $('#addPIPPopup').modal('hide');
                        $('#txtProblemIssue').val('');
                        $('#txtDeliverables').val('');
                        $('#txtProgressMeasurement').val('');

                    }
                    else {
                        toastr.error("There is some error !!.");
                        $('#btnAddPIPDetails').prop('disabled', false);
                    }

                    BindEmployeePIPParamtersDetails($('#hdnPIP_PEPEmpID').val(), $("#hdnPIP_PIPID").val());


                    if ($('#hdnPIPDuration').val() == 0 || $('#hdnPIPDuration').val() == -1) {

                        $('#ddlPIPDuration').val(-1);
                    } else {
                        $('#ddlPIPDuration').val($('#hdnPIPDuration').val());
                    }

                    $('#btnPIPApproveByRole').show();

                },
                complete: function (xhr, statusText) {

                },
                error: function (xhr, statusText, errorThrown) {

                    $('#btnAddPIPDetails').prop('disabled', false);
                }
            });
        }

    });
    $('#feedbackSubmitYes').click(function () {

        if ($(this).is(':disabled')) {
            e.preventDefault(); // Prevent the default action
            return false; // Stop the execution of further code
        }

        SaveAndSubmitFeedback(2)
        $('#confirmFeedbackSubmit').modal('hide');
    });
    $('#feedbackSubmitNo').click(function () {


        $('#confirmFeedbackSubmit').modal('hide');
    });


    $('#btnAddPIPFeedback').click(function () {

        debugger;
        $('#confirmFeedbackSubmit').modal('show');

    });

    $('#btnSavePIPFeedback').click(function () {


        if ($(this).is(':disabled')) {
            e.preventDefault(); // Prevent the default action
            return false; // Stop the execution of further code
        }
        SaveAndSubmitFeedback(1)
    });



    function SaveAndSubmitFeedback(Action) {


        if ($(this).is(':disabled')) {
            e.preventDefault(); // Prevent the default action
            return false; // Stop the execution of further code
        }


        $('#feedbackSubmitYes').prop('disabled', true)


        $('#btnSavePIPFeedback').prop('disabled', true)

        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + "PIP/AddPIPWeeklyFeedback";

        CheckSessionTimeOut();
        var flagKRA = 0;

        var EmployeeId = sessionStorage.ManagerEmpId;

        var table = $('#tableParameters').DataTable();
        var numero = $('#tableParameters').dataTable().fnGetNodes().length;
        var vFeedback;
        var vWeekId;
        var FeedbackArray = [];
        var data = $('#tableParameters').DataTable().rows().data();

        var m = 0;
        var n = 0;
        var p = 1;

        if (numero != 0) {
            for (i = 1; i <= numero; i++) {
                m = p;
                n = i + i;

                vWeekId = $($('#tableParameters tr:nth-child(' + n + ') input:hidden')).val();// $($('table tr:nth-child(' + n + ') input:hidden')).val();

                vFeedback = $($('table tr:nth-child(' + n + ') textArea')).val();

                if (vFeedback == "") {
                    flagKRA = 1;
                    toastr.error("Please give feedback for all parameters.");
                    $('#btnAddPIPFeedback').prop('disabled', false);
                    $('#feedbackSubmitYes').prop('disabled', false);
                    $('#btnSavePIPFeedback').prop('disabled', false)
                    return false;
                }

                n = 0;
                p = p + 2;
                var RMFeedback = '';
                if (vFeedback != '') {
                    $.each(data, function (index, jsonFeedback) {
                        if (jsonFeedback.WeekId == vWeekId) {
                            RMFeedback = {
                                LoginEmpId: sessionStorage.EmployeeId,
                                WeekId: vWeekId,
                                Feedback: vFeedback,

                            }
                            FeedbackArray.push(RMFeedback);
                        }
                    });
                }

            }
        }


        if (FeedbackArray.length > 0 && flagKRA != 1) {

            $.ajax({
                url: apiPath,
                type: 'POST',
                data: JSON.stringify({ FeedbackArray: FeedbackArray, PIPId: $('#hdnPIPFeed').val(), LoginEmpId: sessionStorage.EmployeeId, WeekNo: $('#hdnPIPWeek').val(), Status: Action }),
                async: false,
                dataType: 'json',
                contentType: 'application/json',
                headers: CommonGetHeaderInfo(),
                success: function (result) {
                    Result = result;

                    if (Action == 1) {
                        msg = 'Feedback saved successfully.';

                    }
                    else {

                        msg = 'Feedback submitted successfully.';
                    }

                    if (Result.Success) {
                        toastr.success(msg);
                        $('#addPIPParamFeedback').modal('hide');
                        $('#tableParameters td textarea').val(" ");
                    }
                    else {
                        toastr.error(Result.ErrorMessage);
                    }

                    BindEmployeePIPParamtersDetails($('#hdnsPEPEmpID').val(), $("#hdnsPIPID").val());


                },
                complete: function (xhr, statusText) {


                },
                error: function (xhr, statusText, errorThrown) {
                    $('#btnAddPIPFeedback').prop('disabled', false);
                    $('#feedbackSubmitYes').prop('disabled', false);
                    $('#btnSavePIPFeedback').prop('disabled', false)

                }
            });
        }
    }

    //function SaveFeedback() {

    //    $('#btnAddPIPFeedback').prop('disabled', true);
    //    CheckSessionTimeOut();
    //    var flagKRA = 0;
    //    var EmployeeId = sessionStorage.ManagerEmpId;
    //    var table = $('#tableParameters').DataTable();
    //    var numero = $('#tableParameters').dataTable().fnGetNodes().length;
    //    var vFeedback;
    //    var vWeekId;
    //    var FeedbackArray1 = [];
    //    var data = $('#tableParameters').DataTable().rows().data();

    //    var m = 0;
    //    var n = 0;
    //    var p = 1;
    //    if (numero != 0) {
    //        for (i = 1; i <= numero; i++) {
    //            m = p;
    //            n = i + i;

    //            vWeekId = $($('table tr:nth-child(' + n + ') input:hidden')).val();

    //            vFeedback = $($('table tr:nth-child(' + n + ') textArea')).val();

    //            if (vFeedback == "") {
    //                flagKRA = 1;
    //                toastr.error("Please give feedback for all Parameters");
    //                $('#btnAddPIPFeedback').prop('disabled', false);
    //                return false;
    //            }

    //            n = 0;
    //            p = p + 2;
    //            if (vFeedback != '') {
    //                $.each(data, function (index, jsonFeedback) {
    //                    if (jsonFeedback.WeekId == vWeekId) {
    //                        var RMFeedback = {
    //                            EmployeeId: sessionStorage.EmployeeId,
    //                            WeekId: vWeekId,
    //                            Feedback: vFeedback,

    //                        }
    //                        FeedbackArray1.push(EmployeeId);
    //                    }
    //                });
    //            }

    //        }
    //    }
    //    if (FeedbackArray1.length > 0 && flagKRA != 1) {

    //        if (Result.Success) {
    //            toastr.success('Feedback Submitted Successfullly.');
    //            $('#btnAddPIPFeedback').prop('disabled', false);
    //        }

    //        else {
    //            toastr.error(Result.ErrorMessage);
    //            $('#btnAddPIPFeedback').prop('disabled', false);
    //        }
    //    }
    //    else {
    //        //alert("Please give feedback for all Goals & Objectives.");
    //        $('#btnAddPIPFeedback').prop('disabled', false);
    //    }

    //    return flag = (flagKRA == 1) ? '1' : '0';

    //}

});



let isReferBack = false
$('#btnPIPReferbackToRM').click(function () {

    var EmpId = sessionStorage.EmployeeId;
    var SEmpId = $("#hdnsPEPEmpID").val();
    var StatusId = $("#hdnsStatusId").val();
    var PIPId = $("#hdnsPIPID").val();

    if (isReferBack) {
        event.preventDefault();
        return false;
    }
    isReferBack = true;

    if (StatusId == PIPDocumentSignoffpendingOnHRBP) {


        $('#ModaldReferBackconfirm').modal('show');
        isReferBack = false;
    }


    $("#ReferBackConfrm").click(function () {

        PIPReferBackToPM();
    });

    let IsReferBack = false;

    function PIPReferBackToPM() {

        if (IsReferBack) {
            event.preventDefault();
            return false;
        }
        IsReferBack = true;


        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath2 = svrPath + "PIP/PIPReferBackToPM?LoginEmpId=" + EmpId + "&SelectedEmpId=" + $('#hdnsPEPEmpID').val() + "&PIPId=" + PIPId + "&StatusId=" + PIPReferbackToRM;

        var columns = [];
        $.ajax({
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            type: 'POST',
            url: apiPath2,
            async: false,
            success: function (result) {

                if (result.Success == true) {

                    toastr.success("PIP refer back to RM successfully.");
                    $('#btnPIPReferbackToRM').hide();
                    $('#btnPIPApproveByRole').hide();
                    BindPIPEmpList();

                } else { toastr.error("There is some issue in reject process."); IsReferBack = false; }


            },

            error: function (xhr, statusText, errorThrown) {

                IsReferBack = false;
            }
        });

    }


});


function BindPIPEmpListByEmpId(EmpId) {

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath1 = svrPath + "PIP/GetEmpPIPDetailbyEmpId?SelectEmpId=" + EmpId

    var columns = [];
    $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'Get',
        url: apiPath1,
        async: false,
        success: function (result) {

            $('#tblSelectEmpPIPList').DataTable({
                "processing": true, // for show progress bar
                "serverSide": false, // for process server side
                "filter": false, // this is for disable filter (search box)
                "orderMulti": false, // for disable multiple column at once
                "bLengthChange": false,
                "bDestroy": true,
                "searching": false,
                info: false,
                "data": result.Result.data,
                "columnDefs": [
                    { "orderable": false, "targets": "_all" } // Disable sorting on the first column
                ],
                aoColumns: [

                    {

                        "render": function (data, type, row, meta) {
                            return "<span>" + row.EmpName + " - " + row.EmpID + "</span><span><input type='hidden' id='hdnEmpID' name='hdnEmpID value='" + row.EmpID + "'/></span>";
                        },
                        "sWidth": "6%"
                    },

                    //{

                    //    "render": function (data, type, row, meta) {
                    //        return "<span>" + row.EmpName + "</span>";
                    //    },
                    //    "sWidth": "6%"
                    //},
                    {

                        "render": function (data, type, row, meta) {
                            return "<span>" + row.EmpGrade + "</span>";
                        },
                        "sWidth": "6%"
                    },
                    {

                        "render": function (data, type, row, meta) {
                            return "<span>" + row.EmpProject + "</span>";
                        },
                        "sWidth": "6%"
                    },
                    {

                        "render": function (data, type, row, meta) {
                            return "<span>" + row.PIPReason + "</span>";
                        },
                        "sWidth": "6%"
                    },
                    {

                        "render": function (data, type, full) {


                            if ((full.PIPStatusId == 0 || full.PIPStatusId == 4) && SelectionRoleId == 2) {


                                return "<button class='fa fa-sign-in' title='Initiate PIP' data-toggle='modal' onclick='ShowUploadDocPopUp(`" + full['PIPDocFiles'] + "`," + full.PEPEmpID + "," + full.PIPStatusId + "," + 0 + ",`" + full['EmpName'] + "`," + full.EmpID.trim() + ",`" + full['PIPReason'] + "`)';></button>";

                            } else {
                                return "-";
                            }
                        },
                        "sWidth": "6%"
                    },


                    {

                        "render": function (data, type, row, meta) {
                            return "<span>" + row.PIPStartDate + "</span>";
                        },
                        "sWidth": "6%"
                    },
                    {

                        "render": function (data, type, row, meta) {
                            return "<span>" + row.PIPEndDate + "</span>";
                        },
                        "sWidth": "6%"
                    },
                    {

                        "render": function (data, type, row, meta) {
                            return "<span>" + row.PIPStatus + "</span>";
                        },
                        "sWidth": "6%"
                    },
                    {

                        "render": function (data, type, full) {


                            if (full.PIPStatusId != 0 && SelectionRoleId == 2) {

                                return "<a title='Download attach file' class='downloadfile' href='#'><i class='fa fa-download' data-id='" + full.PEPEmpID + "' data-attr='" + full.PIPDocFiles.trim() + "' aria-hidden='true'></i> file attached : " + full.PIPDocFiles.split(',').length + "</a>";


                            }
                            else {

                                return "-";

                            }
                            //return "<span><input type='file' class='file-upload' id='FileDoc' data-row='1'></span>";
                        },
                        "sWidth": "6%"
                    },
                ],
                "deferRender": true
            });


            var dt = $('#tblSelectEmpPIPList').DataTable();


            dt.column(5).visible(false);
            dt.column(6).visible(false);

        }
    })



    $('#divSEmpID').css('display', 'block');
}


function GetMgr() {

    //var appraisalCycleId = $('#ddlRptAppCycle :selected').val();//sessionStorage.AppraisalCycleId;
    //var managerId = sessionStorage.EmployeeId;

    var ddlId = $("#ddlAspireReportee");
    var token = sessionStorage.TokenValue;
    var svrPath = CONFIG.get('SERVERNAME');
    var locationId = sessionStorage.LocationId;
    var role = sessionStorage.EmployeeRoleId;
    var apiPath = '';
    apiPath = svrPath + "PIP/GetEmpListbyRM?RMID=" + sessionStorage.EmployeeId

    CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (data) {

        debugger;
        if (data.Success == false) {
            // alert(data.ErrorCode + '\n' + data.ErrorMessage);
            return false;
        }
        else {
            $(ddlId).empty();
            var name = "";
            var newOption = "";

            newOption = '<option value="0">--Select--</option>';
            $(ddlId).append(newOption);


            $.each(data.Result.data, function (i, data) {
                name = CommonGetName(data.FirstName, data.LastName) + '-' + data.NewEmployeeCode;
                // bind the dropdown list using json result              
                $('<option>',
                    {
                        value: data.EmployeeId,
                        text: name
                    }).html(name).appendTo(ddlId);
            });

        }

    });

}

function validateFileExtension(fileName) {
    var ext = fileName.split('.').pop().toLowerCase();
    return allowedExtensions.includes(ext);
}

$('#ddlFilter').change(function () {

    BindPIPEmpList();


})

function BindPIPEmpList() {

    var svrPath = CONFIG.get('SERVERNAME');

    var apiPath1 = svrPath + "PIP/GetEmpPIPDetailbyRoleId?LoginId=" + sessionStorage.EmployeeId + "&RoleId=" + SelectionRoleId + "&FilterId=" + $('#ddlFilter').val()

    var columns = [];

    $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'Get',
        url: apiPath1,
        async: false,
        beforeSend: function (xhr, opts) {
            $('.loader-div').show();
        },
        success: function (result) {

            var table = $('#tblEmpPIPList').DataTable();

            // Clear all data in the DataTable
            table.clear().draw();

            $('#tblEmpPIPList').DataTable({
                "processing": true, // for show progress bar
                "serverSide": false, // for process server side
                "filter": true, // this is for disable filter (search box)
                "orderMulti": false, // for disable multiple column at once
                "sPaginationType": "full_numbers",
                "iDisplayLength": 10,
                "bLengthChange": true,
                "bDestroy": true,
                "searching": true,
                info: false,
                "data": result.Result.data,
                "columnDefs": [
                    { "orderData": [], "targets": 0 }, //TURN OFF DEFAULT SORTING OF TABLE
                    { "orderable": false, "targets": 0 }  //TURN OFF SORTABLILITY FOR COLUMN 1
                ],
                language: {
                    emptyTable: "No data available in the table" // Custom message
                },
                "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-right"ip>>>',
                dom: '<"row"<"col-sm-6"Bl><"col-sm-6"f>>' + '<"row"<"col-sm-12"<"table-responsive"tr>>>' + '<"row"<"col-sm-5"i><"col-sm-7"p>>',
                aoColumns: [

                    {
                        "render": function (data, type, row, meta) {

                            return "<a class='table-icon fa fa-history' href='#' title='History' data-id=" + row.PIPId + " onclick='ViewPIPHistory(" + row.PIPId + ")'></a>";

                        }
                        , "orderable": false
                        , width: "5%"
                    },



                    {
                        "render": function (data, type, full) {


                            return "<span>" + full.EmpName + " - " + full.EmpID + "</span>";

                        },
                        "sWidth": "6%"
                    },
                    {

                        "render": function (data, type, row, meta) {
                            return "<span>" + row.EmpGrade + "</span>";
                        },
                        "sWidth": "6%"
                    },
                    {

                        "render": function (data, type, row, meta) {
                            return "<span>" + row.EmpProject + "</span>";
                        },
                        "sWidth": "6%"
                    },
                    {

                        "render": function (data, type, row, meta) {
                            return "<span>" + row.PIPReason + "</span>";
                        },
                        "sWidth": "6%"
                    },
                    {

                        "render": function (data, type, row, meta) {
                            return "<span>" + row.PIPStartDate + "</span>";
                        },
                        "sWidth": "6%"
                    },
                    {

                        "render": function (data, type, row, meta) {
                            return "<span>" + row.PIPEndDate + "</span>";
                        },
                        "sWidth": "6%"
                    },

                    {

                        "render": function (data, type, full) {



                            return "<span>" + full.PIPStatus + "</span>";

                        },

                        "sWidth": "6%"
                    },
                    {

                        "render": function (data, type, full) {

                            return "<a title='Download attach file' class='downloadfile' href='#'><i class='fa fa-download' data-id='" + full.PEPEmpID + "' data-attr='" + full.PIPDocFiles.trim() + "' aria-hidden='true'></i> file attached : " + full.PIPDocFiles.split(',').length + "</a>";


                        },
                        "sWidth": "6%"
                    },
                    {

                        "render": function (data, type, full) {


                            if ((full.PEPManagerId == sessionStorage.EmployeeId && SelectionRoleId == 2) || (SelectionRoleId == 3 || SelectionRoleId == 1 || SelectionRoleId == 4)) {

                                if ((full.PIPStatusId == PIP_SUBMITByManager || full.PIPStatusId == PIP_Re_SUBMITByManager || full.PIPStatusId == PIP_RejectByHRBP || full.PIPStatusId == RM_to_share_moreInfo_on_PIP_initiation) && (SelectionRoleId == 2 || SelectionRoleId == 3)) {

                                    return "<button class='btn-link table-icon glyphicon glyphicon-pencil' title='Show & Submit PIP Doc' data-toggle='modal' onclick='ShowUploadDocPopUp(`" + full['PIPDocFiles'] + "`," + full.PEPEmpID + "," + full.PIPStatusId + "," + full.PIPId + ",`" + full['EmpName'] + "`," + full.EmpID + ",`" + full['PIPReason'] + "`,`" + full['PIPRejectionReason'] + "`)';></button>";

                                }
                                else if ((full.PIPStatusId == PIP_ApproveByHRBP || full.PIPStatusId == RM_to_share_moreInfo_on_PIP_initiation || full.PIPStatusId == PIP_RejectByHRBP || full.PIPStatusId == PIP_SUBMITByManager || full.PIPStatusId == PIP_Re_SUBMITByManager) && SelectionRoleId == 4) {
                                    return "<button class='btn-link table-icon glyphicon glyphicon-pencil' title='view & approve PIP Doc' data-toggle='modal' onclick='ShowUploadDocHRBPPopUp(`" + full['PIPDocFiles'] + "`," + full.PEPEmpID + "," + full.PIPStatusId + "," + full.PIPId + ",`" + full['EmpName'] + "`," + full.EmpID + ",`" + full['PIPRejectionReason'] + "`)';></button>";
                                }
                                else if ((full.PIPStatusId >= PIP_ApproveByHRBP && (SelectionRoleId == 2 || SelectionRoleId == 3 || SelectionRoleId == 4))) {

                                    return "<button class='btn-link table-icon glyphicon glyphicon-pencil' title='view & add PIP Doc' href='#' data-toggle='modal' onclick='AddDocPopUp(`" + full['PIPDocFiles'] + "`," + full.PEPEmpID + "," + full.PIPStatusId + "," + full.PIPId + " , `" + full['EmpName'] + "`," + full.EmpID + "," + full.PIPId + ")';></button>";
                                }

                            } else {

                                return "<span> - </span>";

                            }

                        },
                        "sWidth": "6%"
                    },
                ],
                // Add rowCallback to change row color based on StatusId and RoleId
                "rowCallback": function (row, data, index) {
                    var statusId = data.PIPStatusId;
                    var roleId = SelectionRoleId; // Assuming SelectionRoleId is your RoleId

                    // Example logic for different color codes based on StatusId and RoleId
                    if ((statusId != PIP_Successfully_Completed && statusId != PIP_Unsuccessful && statusId != PIP_SUBMITByManager && statusId != PIPDocumentSignoffpendingOnHRBP) && roleId == 2) {
                        $(row).css('background-color', 'lightgray');
                    } else if ((statusId == PIP_SUBMITByManager || statusId == PIPDocumentSignoffpendingOnHRBP) && roleId == 4) {
                        $(row).css('background-color', 'lightgray');
                    } else {
                        $(row).css('background-color', 'white'); // Default color
                    }
                },

                "deferRender": true
            });


            var dt = $('#tblEmpPIPList').DataTable();

            // Show or hide the column based on its class
            dt.columns().every(function () {
                var column = this;
                var className = $(column.header()).attr('class'); // Get the class of the column
                if (SelectionRoleId == 1) {

                    //if (className && className.includes('PIPAction')) {
                    //    column.visible(false); // hide the column
                    //}
                    if (className && className.includes('PIPDoc')) {
                        column.visible(false); // hide the column
                    }
                } else {

                    if (className && className.includes('PIPAction')) {
                        column.visible(true); // show the column
                    }
                    if (className && className.includes('PIPDoc')) {
                        column.visible(true); // show the column
                    }
                }
            });


            $('.loader-div').hide();

        }, complete: function (xhr, statusText) {
            $(".loader-div").hide();

        },
        error: function (xhr, statusText, errorThrown) {
            $(".loader-div").hide();

        }
    })


}


function ViewPIPHistory(PIPid) {

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath1 = svrPath + "PIP/GetActionHistory?PIPId=" + PIPid

    var options = { "backdrop": "static", keyboard: true };
    var $buttonClicked = $(this);

    if (PIPid > 0) {
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: apiPath1,
            async: false,
            datatype: "json",
            success: function (response) {
                $("#tblActionHistory").DataTable({
                    "dom": 'lBfrtip',
                    buttons: [
                        {
                            extend: 'excelHtml5',
                            text: 'Export to Excel',
                            title: 'History Details',
                            download: 'open',
                            orientation: 'landscape',
                            exportOptions: {
                                columns: [0, 1, 2, 3, 4, 5, 6]
                            }
                        }],
                    "data": response.Result.data,
                    "destroy": true,
                    "sPaginationType": "full_numbers",
                    "iDisplayLength": 10,
                    "bLengthChange": false,
                    "bDestroy": true,
                    "searching": false,
                    info: false,
                    "oLanguage": {
                        "oPaginate": {
                            "sNext": '<a href="#"><span class="glyphicon glyphicon-triangle-right"></span></a>',
                            "sPrevious": '<a href="#"><span class="glyphicon glyphicon-triangle-left"></span></a>',
                            "sLast": '<a href="#"><span class="glyphicon glyphicon-step-forward"></span></a>',
                            "sFirst": '<a href="#"><span class="glyphicon glyphicon-step-backward"></span></a>'
                        }
                    },
                    aoColumns: [
                        {
                            "render": function (data, type, row, meta) {
                                return row.RowNumber;
                            }
                        },
                        {
                            "render": function (data, type, row, meta) {
                                return row.Action;
                            }
                        },

                        {
                            "render": function (data, type, row, meta) {
                                return row.Modifiedby;
                            }
                        },
                        {
                            "render": function (data, type, row, meta) {
                                return row.ModifiedOn;
                            }
                        },
                        {
                            "render": function (data, type, row, meta) {
                                return row.FromStatus;
                            }
                        },
                        {
                            "render": function (data, type, row, meta) {
                                return row.ToStatus;
                            },
                        },


                        {
                            "render": function (data, type, row, meta) {
                                return row.Remarks;
                            }
                        }

                    ],
                });
                $('#ViewHistoryDetails').modal('show');
            },
            error: function (error) {
                var options = { "backdrop": "static", keyboard: true };
                $("#error").html("There is some error! Try again later.");
                $('#errorMsg').modal(options);
                $('#errorMsg').modal('show');
            }
        });
    }

}


function ShowUploadDocPopUp(Docfiles, PEPEmpID, StatusId, PIPId, SelectedName, SelectEmpID, PIPReason, PIPRejectReason) {
    UploadSupportingPIPDoc(Docfiles, PEPEmpID, StatusId, PIPId, SelectedName, SelectEmpID, PIPReason, PIPRejectReason);
}

function ShowUploadDocHRBPPopUp(Docfiles, PEPEmpID, StatusId, PIPId, SelectedEmpName, SelectedEmpID) {
    ShowUploadDocHRBPPopUp(Docfiles, PEPEmpID, StatusId, PIPId, SelectedEmpName, SelectedEmpID);
}

function AddDocPopUp(Docfiles, PEmpID, StatusId, PIPId, EmpName, EmpID, PIPID) {

    debugger;
    $("#hdnsPIPID").val(PIPId);
    $("#hdnsPEPEmpID").val(PEmpID);
    $("#hdnsStatusId").val(StatusId);

    //$("#lblEmpId").text(EmpID);
    $("#lblEmpName").text(EmpName + '-' + EmpID);

    BindEmployeePIPParamtersDetails(PEmpID, PIPId)



    if (StatusId != RM_to_share_moreInfo_on_PIP_initiation && StatusId != PIP_SUBMITByManager) {

        $('#divdisplaycheckfirst').css('display', 'block');

    } else {
        $('#divdisplaycheckfirst').css('display', 'none');
    }

    if (StatusId >= PIP_Document_to_be_shared_with_employee && SelectionRoleId == 2) {


        $('#divdisplaychecksecond').css('display', 'block');

    }
    else {
        $('#divdisplaychecksecond').css('display', 'none');
    }



    if ((StatusId == PIP_ApproveByHRBP || StatusId == PIPReferbackToRM) && SelectionRoleId == 2) {
        $('#addProblemIssue').show();

    } else { $('#addProblemIssue').hide(); }

    if (((StatusId == PIPReferbackToRM || StatusId == PIP_ApproveByHRBP) && SelectionRoleId == 2) || (SelectionRoleId == 4 && StatusId == PIPDocumentSignoffpendingOnHRBP) || ((StatusId == PIP_Document_to_be_shared_with_employee && SelectionRoleId == 2))) {

        $('#btnPIPFinalAction').hide();
        $('#btnPIPApproveByRole').show();
        isSubmitting = false;
        if (SelectionRoleId == 4) {
            $('#btnPIPReferbackToRM').show();

            $('#btnPIPApproveByRole').text('Approve');
        } else { $('#btnPIPReferbackToRM').hide(); }

    } else { $('#btnPIPApproveByRole').hide(); $('#btnPIPReferbackToRM').hide(); }

    //  $('#AcknowNote').hide();
    if (StatusId == PIP_Document_to_be_shared_with_employee && SelectionRoleId == 2) {
        isSubmitting = false;
        $('#btnPIPApproveByRole').text('Submit PIP Document to Employee');
        $('#btnPIPApproveByRole').show();
    }


    //if ((StatusId == PIPDocumentSignoffpendingOnHRBP && SelectionRoleId == 4)) {
    //    $('#btnPIPApproveByRole').text('Approve');
    //}


    $('#AddDocFeedbackPopup').modal('show');


}

function BindEmployeePIPParamtersDetails(PEmpID, PIPId) {

    // Cycle Id Will be add here to identity the Cycle term


    BindPIPResultList(PIPId);
    BindExtensionList(PIPId);
    $('#btnPIPApproveByRole').hide();
    $('#btnPIPFinalAction').hide();
    $('#btnPIPReferbackToRM').hide();



    $('#ddlPIPExtension').val(-1);
    $('#ddlPIPResult').val(-1);

    $('#ddlPIPDuration').prop('disabled', false);

    $('#PIPResultdiv').css('display', 'none');
    $('#PIPExtensiontdiv').css('display', 'none');


    $('#lblIssueBy').text('')
    $('#lblHRBPapprover').text('')


    $('#IssueByRM').css('display', 'none');

    $('#HRapproved').css('display', 'none');






    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath1 = svrPath + "PIP/PIP_GetEmployeeSavedParameterDetailsByPIPId?PIPId=" + PIPId + "&SEmpID=" + PEmpID

    var columns = [];
    $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'Get',
        url: apiPath1,
        async: false,
        success: function (result) {

            var data;
            if (result.Success == true) {
                data = result.Result.data;

            } else { data = result.Result.data; }

            $('.txtdiscussionDate').datepicker('add');
            debugger;
            if (result.Success == true) {


                if (parseInt($("#hdnsStatusId").val()) > PIP_in_progress) { // this value should be set after PIP in progress and when Last week has been enabled



                    // Initialize a variable to keep track of whether the value is found
                    var isFound = false;

                    $('#ddlPIPResult').val(-1);
                    // Iterate through each option in the dropdown
                    $('#ddlPIPResult').find('option').each(function () {
                        if ($(this).val() == parseInt($("#hdnsStatusId").val())) {
                            $('#ddlPIPResult').val(parseInt($("#hdnsStatusId").val()))
                            return false; // Break out of the loop once the value is found
                        }
                    });

                    if (parseInt($('#ddlPIPResult').val()) == PIP_Extended) {

                        $('#ddlPIPExtension').val(result.Result.data[0].CurrentPIPExtension);
                    } else {
                        $('#ddlPIPExtension').val(-1);
                    }
                }

                if (result.Result.data[0].PIPTotalDays != null && result.Result.data[0].PIPTotalDays != 0) {
                    if (parseInt((result.Result.data[0].PIPTotalDays).split('-')[1]) > 0) {

                        $('#lblduration').text('First PIP Duration');
                        $('#PIPExtensionNumber').css('display', 'block');
                        $('#PIPDurationDet').css('display', 'block');
                        $('#txttotalextn').val((result.Result.data[0].PIPTotalDays).split('-')[1]);
                        $('#txtTotalPIPDuration').val((result.Result.data[0].PIPTotalDays).split('-')[0]);

                    } else {
                        $('#lblduration').text('PIP Duration');
                        $('#PIPExtensionNumber').css('display', 'none');
                        $('#PIPDurationDet').css('display', 'none');

                    }
                } else {

                    $('#lblduration').text('PIP Duration');
                    $('#PIPExtensionNumber').css('display', 'none');
                    $('#PIPDurationDet').css('display', 'none');
                }

                if ($('#hdnPIPDuration').val() != 0 && $('#hdnPIPDuration').val() != -1) {
                    $('#ddlPIPDuration').val($('#ddlPIPDuration').val());
                } else if (result.Result.data[0].PIPDurationId != -1) {

                    $('#ddlPIPDuration').val(result.Result.data[0].PIPDurationId)

                    $('#hdnPIPDuration').val(result.Result.data[0].PIPDurationId)
                } else {

                    $('#ddlPIPDuration').val(-1);
                }

                $('#startDate').val(result.Result.data[0].PIPStartDate)
                $('#endDate').val(result.Result.data[0].PIPEnddate)

                PIPDiscussionDateRange = result.Result.data[0].PIPDiscussionDateRange;

                $('#txtdiscussionDate').val(result.Result.data[0].PIPDiscussionDateRange)


                var mindateforemployeewise = '';
                var parts = PIPDiscussionDateRange.split('/');

                // Rearrange the parts to 'yyyy-mm-dd' format>0)

                if (parts[0].length > 0) {
                    var mindateforemployeewise = parts[2] + '-' + (parts[0].length === 1 ? '0' + parts[0] : parts[0]) + '-' + (parts[1].length === 1 ? '0' + parts[1] : parts[1]);
                } else {

                    mindateforemployeewise = new Date();
                }


                //$(".KRADatePicks").datepicker({
                //    format: 'yyyy-mm-dd',
                //    beforeShowDay: function (date) {
                //        var day = date.getDay();
                //        // Disable Saturdays (6) and Sundays (0)
                //        return [(day != 0 && day != 6)];
                //    },
                //    minDate: new Date(mindateforemployeewise),
                //    maxDate: new Date()
                //});


                $(".KRADatePicks").datepicker({
                    format: 'yyyy-mm-dd',
                    maxDate: new Date()
                });

                $('#lblTotaldurationtext').text(result.Result.data[0].PIPTotalDays)

                if (result.Result.data[0].PIPStartDate != '') {
                    $("#txtdiscussionDate").datepicker("option", "disabled", true);
                } else {
                    $("#txtdiscussionDate").datepicker("option", "disabled", false);

                    var interval = parseInt($('#ddlPIPDuration').val());

                    if (interval == 1) { interval = 29 } else if (interval == 2) { interval = 59 } else if (interval == 3) { interval = 89 } else if (interval == -1) {

                    }

                    if (interval != -1) {
                        var today = new Date(new Date())

                        var endDate = new Date(today);
                        endDate.setDate(today.getDate() + interval);

                        var FromDate = ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2) + '-' + today.getFullYear();

                        var ToDate = ('0' + (endDate.getMonth() + 1)).slice(-2) + '-' + ('0' + endDate.getDate()).slice(-2) + '-' + endDate.getFullYear();


                        //var TempEndDate = endDate;


                        var svrPath = CONFIG.get('SERVERNAME');
                        var apiPath2 = svrPath + "PIP/GetPIPEndateExceptHoliday_Weekends?PIPId=" + $('#hdnsPIPID').val() + "&PIPEnddate=" + ToDate;

                        $.ajax({
                            datatype: "json",
                            url: apiPath2,
                            type: 'GET',
                            processData: false,
                            contentType: false,
                            success: function (response) {
                                if (response.Success == true) {

                                    if (interval != -1) {

                                        var endDate = new Date(response.Result.data[0].ValidPIPEndDate);


                                        var ToDate = ('0' + (endDate.getMonth() + 1)).slice(-2) + '-' + ('0' + endDate.getDate()).slice(-2) + '-' + endDate.getFullYear();


                                        $('#endDate').val(ToDate);
                                    } else {
                                        $('#endDate').val('');
                                    }
                                }
                                else { toastr.error("There is some error to fetch PIP End date. Please connect with IPAG team.") }

                            },
                            error: function (xhr, status, error) {
                                console.log(error);
                                // Handle error
                            }
                        });

                        //var ToDate = ('0' + (endDate.getMonth() + 1)).slice(-2) + '-' + ('0' + endDate.getDate()).slice(-2) + '-' + endDate.getFullYear();


                        if (interval != -1) {
                            $("#txtdiscussionDate").val(FromDate);
                            $('#startDate').val(FromDate);
                            //  $('#endDate').val(ToDate);
                        } else {
                            $("#txtdiscussionDate").val('');
                            $('#startDate').val('');
                            //  $('#endDate').val('');
                        }
                    }


                }

                if (result.Result.data[0].PIPDurationId == -1) {

                    $('#ddlPIPDuration').prop('disabled', false);
                } else {

                    if ((parseInt($("#hdnsStatusId").val()) == PIPReferbackToRM || parseInt($("#hdnsStatusId").val()) == PIP_ApproveByHRBP) && (SelectionRoleId == 2)) {
                        $('#ddlPIPDuration').prop('disabled', false);

                    } else { $('#ddlPIPDuration').prop('disabled', true); }

                }



                if (result.Result.data[0].IssuedByRM.length > 0) {
                    $('#IssueByRM').css('display', 'block');
                    $('#lblIssueBy').text(result.Result.data[0].IssuedByRM)
                }

                if (result.Result.data[0].HRBPApprover.length > 0) {
                    $('#HRapproved').css('display', 'block');
                    $('#lblHRBPapprover').text(result.Result.data[0].HRBPApprover)
                }



                var today = new Date();


                if ((today >= new Date(result.Result.data[0].PIPEnddate)) && SelectionRoleId != 1 && parseInt($("#hdnsStatusId").val()) >= PIP_in_progress) {


                    if ((parseInt($("#hdnsStatusId").val()) == PIP_in_progress) && SelectionRoleId == 2) {
                        $('#PIPResultdiv').css('display', 'block');
                        $('#btnPIPFinalAction').show();
                    } else if ((parseInt($("#hdnsStatusId").val()) == PIP_Extended) && SelectionRoleId == 2) {

                        $('#PIPResultdiv').css('display', 'block');
                        $('#btnPIPFinalAction').show();
                    }

                    isSubmitting1 = false;
                    if ((parseInt($('#ddlPIPResult').val()) == PIP_Extended)) {
                        $('#PIPExtensiontdiv').css('display', 'block');
                        $('#PIPTotalDays').css('display', 'block');


                    } else {
                        $('#PIPExtensiontdiv').css('display', 'none');
                        $('#PIPTotalDays').css('display', 'none');
                    }
                    //   $('#PIPExtensiontdiv').css('display', 'block');
                    $('#ddlPIPExtension').prop('disabled', false);
                    $('#ddlPIPResult').prop('disabled', false);

                } else {
                    $('#PIPResultdiv').css('display', 'none');
                    $('#PIPTotalDays').css('display', 'none');
                    $('#btnPIPFinalAction').hide();
                    $('#PIPExtensiontdiv').css('display', 'none');
                    $('#PIPTotalDays').css('display', 'none');
                    $('#ddlPIPExtension').prop('disabled', true);
                    $('#ddlPIPResult').prop('disabled', true);
                }

            } else {

                $('#PIPResultdiv').css('display', 'none');
                $('#btnPIPFinalAction').hide();
                $('#PIPExtensiontdiv').css('display', 'none');
                $('#PIPTotalDays').css('display', 'none');
                $('#ddlPIPExtension').prop('disabled', true);
                $('#ddlPIPResult').prop('disabled', true);

            }




            if ((parseInt($("#hdnsStatusId").val()) == PIP_Extended)) {

                $('#PIPResultdiv').css('display', 'block');
                if ($('#ddlPIPResult').val() == PIP_Extended) {
                    $('#PIPExtensiontdiv').css('display', 'block');
                    $('#PIPTotalDays').css('display', 'block');
                }

            } else if (parseInt($("#hdnsStatusId").val()) == PIP_Unsuccessful || parseInt($("#hdnsStatusId").val()) == PIP_Successfully_Completed) {
                $('#PIPResultdiv').css('display', 'block');
                $('#btnPIPFinalAction').hide();
                $('#PIPExtensiontdiv').css('display', 'none');
                $('#PIPTotalDays').css('display', 'none');
                $('#ddlPIPExtension').prop('disabled', true);
                $('#ddlPIPResult').prop('disabled', true);
            }

            if (data[0].ProblemIssue != null) {
                $('#tableaddResponse').DataTable({
                    "processing": true, // for show progress bar
                    "serverSide": false, // for process server side
                    "filter": false, // this is for disable filter (search box)
                    "orderMulti": false, // for disable multiple column at once
                    "bLengthChange": false,
                    "bDestroy": true,
                    "searching": false,
                    info: false,
                    "pageLength": 5,
                    "data": data,
                    "columnDefs": [
                        { "orderable": false, "targets": "_all" } // Disable sorting on the first column
                    ],
                    aoColumns: [

                        {

                            "render": function (data, type, row, meta) {
                                return "<span>" + row.Sno + "</span><span><input type='hidden' id='hdnParameterId' name='hdnParameterId value='" + row.ParameterId + "'/></span>";
                            },
                            "sWidth": "6%"
                        },

                        {

                            "render": function (data, type, row, meta) {
                                return "<span>" + row.ProblemIssue + "</span>";
                            },
                            "sWidth": "6%"
                        },
                        {

                            "render": function (data, type, row, meta) {
                                return "<span>" + row.Deliverables + "</span>";
                            },
                            "sWidth": "6%"
                        },
                        {

                            "render": function (data, type, row, meta) {
                                return "<span>" + row.ProgressMeasurement + "</span>";
                            },
                            "sWidth": "6%"
                        },

                        {

                            "render": function (data, type, row, meta) {
                                return "<a title='View Given feedback by RM' class='Givefeed' data-toggle='modal' onclick='ViewGiveFeedback(" + row.ParameterId + ")';>  <i class='fa fa-eye'></i></a>";
                            },
                            "sWidth": "6%"
                        },
                        {

                            "render": function (data, type, row, meta) {

                                if ((row.PIPStatus == PIP_ApproveByHRBP || row.PIPStatus == PIPReferbackToRM) && SelectionRoleId == 2) { //Initiation Request Approved by HRBP and Now Pending to RM for Add Issues and Measurement Against Employee 
                                    return "<button class='btn-link table-icon glyphicon glyphicon-pencil AddFeed' title='Edit' data-toggle='modal' onclick='EditClick(" + row.ParameterId + ")';></button><button data-toggle='modal'  title='Delete' class='table-icon text-danger' onclick='DeleteClick(" + row.ParameterId + ")' ;><i class='glyphicon glyphicon-remove'></button>";
                                }
                                else if ((row.PIPStatus == PIP_Extended || row.PIPStatus == PIP_in_progress) && SelectionRoleId == 2 && row.WeekId != 0) { //Initiation Request Approved by HRBP and Now Pending to RM for Add Issues and Measurement Against Employee 

                                    //var NextWeek = parseInt((row.WeekNo)) + (1);

                                    var SecondButton = "";
                                    if ((row.WeekId).split(',')[1] != undefined) {
                                        SecondButton = "<button class='btn-link table-icon AddFeed action-column' title='Add Feedback' data-toggle='modal' onclick='AddFeedbackClick(" + ((row.WeekId).split(',')[1]) + "," + PIPId + ")';>Save/Submt Feedback For Week " + ((row.WeekId).split(',')[1]) + "</button>";

                                    }

                                    return "<button class='btn-link table-icon AddFeed action-column' title='Add Feedback' data-toggle='modal' onclick='AddFeedbackClick(" + ((row.WeekId).split(',')[0]) + "," + PIPId + ")';>Save/Submt Feedback For Week " + ((row.WeekId).split(',')[0]) + "</button>" + SecondButton;


                                }
                                else { return "-"; }
                            },
                            "sWidth": "6%"
                        },
                    ],
                    "deferRender": true
                });


                var dt = $('#tableaddResponse').DataTable();

                // Show or hide the column based on its class
                dt.columns().every(function () {
                    var column = this;
                    var className = $(column.header()).attr('class'); // Get the class of the column
                    if ((parseInt($("#hdnsStatusId").val()) >= PIP_in_progress && new Date(result.Result.data[0].PIPStartDate) <= new Date()) || (SelectionRoleId == 2 && ($("#hdnsStatusId").val() == PIP_ApproveByHRBP || $("#hdnsStatusId").val() == PIPReferbackToRM))) {

                        if (parseInt($("#hdnsStatusId").val()) >= PIP_in_progress) {
                            if (className && className.includes('GiveFeed')) {
                                column.visible(true); // Show the column
                            }
                        } else {
                            if (className && className.includes('GiveFeed')) {
                                column.visible(false); // Hide the column
                            }

                        }

                        if (className.includes('AddFeed') && SelectionRoleId != 2) {
                            column.visible(false); // hide the column
                        }
                        //if (className.includes('GiveFeed') && SelectionRoleId != 2 && parseInt($("#hdnsStatusId").val()) <= Employee_acknoweldgement_of_PIP_pending) {
                        //    column.visible(false); // hide the column
                        //}


                    } else {


                        if (className && className.includes('GiveFeed')) {
                            column.visible(false); // Hide the column
                        }
                        if (className && className.includes('AddFeed')) {
                            column.visible(false); // Hide the column
                        }

                    }
                });


                var rows = $('#tableaddResponse tr');  // Select all rows in your table
                var previousActionCell = null;

                rows.each(function (index, row) {
                    var actionCell = $(row).find('td:last');  // Select the last column (Action column)

                    if (previousActionCell && (actionCell.html() === previousActionCell.html()) && (parseInt($("#hdnsStatusId").val())) >= PIP_in_progress) {
                        // If the Action cell content is the same as the previous one, remove this cell
                        actionCell.remove();  // Remove the repeated cell
                        $(previousActionCell).attr('rowspan', (parseInt($(previousActionCell).attr('rowspan') || 1) + 1));  // Increase rowspan count
                    } else {
                        previousActionCell = actionCell;  // Store the current action cell to compare for the next iteration
                    }
                });
                //// For the last row
                //if (previous !== null) {
                //    $('#tableaddResponse tbody tr:last').find('.action-column').attr('rowspan', rowspan);
                //}

            } else {

                $('#tableaddResponse tbody').html('<tr><td colspan="5" class="text-center">No data available</td></tr>');
            }

            if (SelectionRoleId == 4 && $("#hdnsStatusId").val() == PIPDocumentSignoffpendingOnHRBP) {
                $('#btnPIPFinalAction').show();
            } else { } //$('#btnPIPFinalAction').hide(); }

        }
    })
}



function BindExtensionList(PIPId) {

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath1 = svrPath + 'PIP/PIP_GetEligibleExtension?PIPId=' + PIPId;
    $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'Get',
        url: apiPath1,
        async: false,
        success: function (result) {


            $('#ddlPIPExtension').empty();


            var newOption = "";

            newOption = '<option value="-1" selected>--Select--</option>';
            $('#ddlPIPExtension').append(newOption);

            $.each(result.Result.data, function (index, data) {

                $('#ddlPIPExtension').append("<option value=" + data.PeriodId + ">" + data.PeriodName + "</option>");


            });
        }

    });


}

function BindPIPResultList(PIPId) {

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath1 = svrPath + 'PIP/PIP_GetPIPResultValues?PIPId=' + PIPId;
    $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'Get',
        url: apiPath1,
        async: false,
        success: function (result) {


            $('#ddlPIPResult').empty();


            var newOption = "";

            newOption = '<option value="-1">--Select--</option>';
            $('#ddlPIPResult').append(newOption);


            $.each(result.Result.data, function (index, data) {

                $('#ddlPIPResult').append("<option value=" + data.PIPResulId + ">" + data.PIPResult + "</option>");


            });
        }

    });
}



$('#ddlPIPResult').on('change', function (e) {

    if ($('#ddlPIPResult').val() == PIP_Extended) {

        $('#PIPExtensiontdiv').css('display', 'block');
    }
    else { $('#PIPExtensiontdiv').css('display', 'none'); }
});

$('#ddlWeek').on('change', function (e) {

    BindViewFeedback($('#hdnParameterID').val());
});

function ViewGiveFeedback(ParameterId) {


    //  BindWeekList(ParameterId);

    $('#hdnParameterID').val(ParameterId)

    BindViewFeedback(ParameterId);

}

function ViewGiveFeedbackToEmp(ParameterId) {


    //  BindWeekList(ParameterId);

    $('#hdnParameterID').val(ParameterId)

    BindViewFeedbackToEmp(ParameterId);

}
function BindViewFeedbackToEmp(ParameterId) {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath1 = svrPath + "PIP/PIP_GetFeedbackByParamId?ParameterId=" + ParameterId;

    var columns = [];
    $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'Get',
        url: apiPath1,
        async: false,
        success: function (result) {

            $('#ShowGivenFeedbackToEmp').modal('show');

            $('#tablegivenFeedbackToEmp').DataTable({
                "processing": true, // for show progress bar
                "serverSide": false, // for process server side
                "filter": false, // this is for disable filter (search box)
                "orderMulti": false, // for disable multiple column at once
                "bLengthChange": false,
                "bDestroy": true,
                "searching": false,
                info: false,
                "pageLength": 5,
                "data": result.Result.data,
                "columnDefs": [
                    { "orderable": false, "targets": "_all" } // Disable sorting on the first column
                ],
                aoColumns: [


                    {

                        "render": function (data, type, row, meta) {
                            return "<span>(" + row.WeekNo + "). " + row.DaysPeriod + "</span>";
                        },
                        "sWidth": "6%"
                    },
                    {

                        "render": function (data, type, row, meta) {
                            return "<span>" + row.ProblemIssue + "</span>";
                        },
                        "sWidth": "6%"
                    },
                    {

                        "render": function (data, type, row, meta) {
                            return "<span>" + row.Deliverables + "</span>";
                        },
                        "sWidth": "6%"
                    },
                    {

                        "render": function (data, type, row, meta) {
                            return "<span>" + row.ProgressMeasurement + "</span>";
                        },
                        "sWidth": "6%"
                    },

                    {

                        "render": function (data, type, row, meta) {
                            return "<span>" + row.Feedback + "</span>";
                        },
                        "sWidth": "6%"
                    },
                    //{

                    //    "render": function (data, type, row, meta) {
                    //        return "<span>" + row.DaysPeriod + "</span>";
                    //    },
                    //    "sWidth": "6%"
                    //},
                ],
                "deferRender": true
            });

        }
    });

}

function BindViewFeedback(ParameterId) {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath1 = svrPath + "PIP/PIP_GetFeedbackByParamId?ParameterId=" + ParameterId;

    var columns = [];
    $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'Get',
        url: apiPath1,
        async: false,
        success: function (result) {
            debugger
            $('#ShowGivenFeedback').modal('show');

            $('#tablegivenFeedback').DataTable({
                "processing": true, // for show progress bar
                "serverSide": false, // for process server side
                "filter": false, // this is for disable filter (search box)
                "orderMulti": false, // for disable multiple column at once
                "bLengthChange": false,
                "bDestroy": true,
                "searching": false,
                info: false,
                "pageLength": 5,
                "data": result.Result.data,
                "columnDefs": [
                    { "orderable": false, "targets": "_all" } // Disable sorting on the first column
                ],
                aoColumns: [


                    {

                        "render": function (data, type, row, meta) {
                            return "<span>(" + row.WeekNo + "). " + row.DaysPeriod + "</span>";
                        },
                        "sWidth": "6%"
                    },
                    {

                        "render": function (data, type, row, meta) {
                            return "<span>" + row.ProblemIssue + "</span>";
                        },
                        "sWidth": "6%"
                    },
                    {

                        "render": function (data, type, row, meta) {
                            return "<span>" + row.Deliverables + "</span>";
                        },
                        "sWidth": "6%"
                    },
                    {

                        "render": function (data, type, row, meta) {
                            return "<span>" + row.ProgressMeasurement + "</span>";
                        },
                        "sWidth": "6%"
                    },

                    {

                        "render": function (data, type, row, meta) {
                            return "<span>" + row.Feedback + "</span>";
                        },
                        "sWidth": "6%"
                    },
                    //{

                    //    "render": function (data, type, row, meta) {
                    //        return "<span>" + row.DaysPeriod + "</span>";
                    //    },
                    //    "sWidth": "6%"
                    //},
                ],
                "deferRender": true
            });

        }
    });

}

function EditClick(ParamId) {

    Edit(ParamId)
}

function AddFeedbackClick(WeekId, PIPId) {

    $('#btnAddPIPFeedback').prop('disabled', false);
    $('#feedbackSubmitYes').prop('disabled', false);
    $('#btnSavePIPFeedback').prop('disabled', false)

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath2 = svrPath + "PIP/PIP_CheckMandatoryWeekFill?PIPId=" + PIPId + "&WeekId=" + WeekId;


    $("#hdnCheckPIPId").val(PIPId);
    $("#hdnCheckWeekNo").val(WeekId);

    var columns = [];
    $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'Get',
        url: apiPath2,
        async: false,
        success: function (result) {

            debugger;
            var perviousweek = parseInt(WeekId) - 1

            if (result.Success == true) {

                $('#weekmodalmessage').text('please click on “Add Week ' + perviousweek + ' feedback” to complete the feedback for Week ' + perviousweek + ' before filling the feedback for Week ' + WeekId + '.');


                $("#hdnCheckPIPId").val(PIPId);
                $("#hdnCheckWeekNo").val(WeekId);

                $('#ModaldWeekfbconfirm').modal('show');

            } else {

                WeekFeedback(PIPId, WeekId);
            }


        }

    });

    $('#WeekFbConfrm').click(function () {

        WeekFeedback($("#hdnCheckPIPId").val(), $("#hdnCheckWeekNo").val());

    });

    function WeekFeedback(PIPId, WeekNo) {


        $('#hdnPIPFeed').val(PIPId);

        $('#hdnPIPWeek').val(WeekNo);

        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath1 = svrPath + "PIP/PIP_GetParamterDetailByParamId?PIPId=" + PIPId + "&WeekNo=" + WeekNo;

        var columns = [];
        $.ajax({
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            type: 'Get',
            url: apiPath1,
            async: false,
            success: function (result) {

                debugger;

                if (result.Result.data.length > 0) {
                    $('#Weekval').text(result.Result.data[0].Week);
                }
                $('#tableParameters tbody').empty();

                $('#tableParameters').DataTable({
                    "processing": true, // for show progress bar
                    "serverSide": false, // for process server side
                    "filter": false, // this is for disable filter (search box)
                    "orderMulti": false, // for disable multiple column at once
                    "bLengthChange": false,
                    "bDestroy": true,
                    "searching": false,
                    info: false,
                    "pageLength": 5,
                    "data": result.Result.data,
                    "columnDefs": [
                        { "orderable": false, "targets": "_all" } // Disable sorting on the first column
                    ],
                    aoColumns: [
                        { mData: "ProblemIssue", label: "ProblemIssue" },
                        { mData: "Deliverables", label: "Deliverables" },
                        { mData: "ProgressMeasurement", label: "ProgressMeasurement" }

                    ],

                    order: [[2, "desc"], [1, "asc"]], //order by Goal type, Sequence
                    bFilter: false, //removes search filter
                    "bSort": false,
                    paging: false,  //removes paging header footer
                    LengthChange: false, //removes shwoing entries
                    bInfo: false,
                    "initComplete": function (settings, json) {

                        var TextAreaArray = [];

                        settings.aoData.forEach(function (index, value) {

                            TextAreaArray.push(index._aData)
                            console.log()

                        })

                        setTimeout(function () {
                            // Step 1: Remove previously inserted feedback rows
                            $('#tableParameters tbody tr.feedback-row').remove();

                            $('#tableParameters tbody tr').each(function (i, value) {

                                if (i < TextAreaArray.length) {
                                    var WeekId = TextAreaArray[i].WeekId;

                                    $(this).after('<tr class="feedback-row"><td colspan="6"><span>RM feedback <span id="txtfeedRemaining_' + WeekId + '"> </div></span><textarea style="width:100%"  type="text" id="txtFeedback_' + WeekId + '"    name="Feedback"  class="form-control" maxlength="1200">' + TextAreaArray[i].Feedback + '</textarea></div><input type="hidden" id="hdnWeekId" name="hdnWeekId" value="' + WeekId + '"/></td></tr>');
                                }
                            });

                        }, 500)
                    }
                });

            }
        });


        var table = $('#tableParameters').DataTable();

        $('#tableParameters th').eq(3).text('Week ' + WeekId);

        // Redraw the DataTable to reflect changes
        table.columns.adjust().draw();

        $('#addPIPParamFeedback').modal('show');



        AddFeedback(WeekId)
    }
}

function AddFeedback(WeekId) {


    $('#hdnPIP_WeekID').val(WeekId);

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath1 = svrPath + "PIP/PIP_GetEmpSavedFeedbackDetByWeekId?WeekId=" + WeekId

    var WeekNo = WeekId;
    if (WeekNo > 0) {
        $.ajax({
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            type: 'Get',
            url: apiPath1,
            async: false,
            success: function (result) {
                if (result.Success == true) {

                    if (result.Result.data.length > 0) {
                        $("#txtPIPfeedback").val(result.Result.data[0].Feedback);
                    }

                }
            },
            error: function (error) {
                var options = { "backdrop": "static", keyboard: true };
                $("#error").html("There is some error. Try again later!");
                $('#errorMsg').modal(options);
                $('#errorMsg').modal('show');
            }
        })
    }

    //$('#addPIPParamFeedback').modal('show');
}


function DeleteClick(ParamId) {

    Delete(ParamId)
}

function Edit(ParameterId) {

    $('#btnAddPIPDetails').prop('disabled', false);
    $('#btnAddPIPDetails').text('Update PIP parameter');

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath1 = svrPath + "PIP/PIP_GetEmployeeSavedParameterDetailsByParameterId?ParameterId=" + ParameterId

    var ParameterId = ParameterId;
    if (ParameterId > 0) {
        $.ajax({
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            type: 'Get',
            url: apiPath1,
            async: false,
            success: function (result) {
                if (result.Success == true) {

                    $("#hdnPIP_ParameterID").val(result.Result.data[0].ParameterId),
                        $("#hdnPIP_PIPID").val(result.Result.data[0].PIPId),

                        $("#txtProblemIssue").val(result.Result.data[0].ProblemIssue);
                    $("#txtDeliverables").val(result.Result.data[0].Deliverables);
                    $("#txtProgressMeasurement").val(result.Result.data[0].ProgressMeasurement);

                    if ((result.Result.data[0].PIPStatus == PIP_ApproveByHRBP) || (result.Result.data[0].PIPStatus == PIPReferbackToRM)) {

                        $("#txtProblemIssue").prop('disabled', false);
                        $("#txtDeliverables").prop('disabled', false);
                        $("#txtProgressMeasurement").prop('disabled', false);

                    } else {

                        $("#txtProblemIssue").prop('disabled', true);
                        $("#txtDeliverables").prop('disabled', true);
                        $("#txtProgressMeasurement").prop('disabled', true);


                    }

                    $('#addPIPPopup').modal('show');
                }
            },
            error: function (error) {
                var options = { "backdrop": "static", keyboard: true };
                $("#error").html("There is some error. Try again later!");
                $('#errorMsg').modal(options);
                $('#errorMsg').modal('show');
            }
        })
    }
}


function Delete(ParameterId) {

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath1 = svrPath + "PIP/PIP_DeleteEmployeeSavedParamDetByParameterId?ParamId=" + ParameterId

    var ParameterId = ParameterId;
    if (ParameterId > 0) {
        $.ajax({
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            type: 'POST',
            url: apiPath1,
            async: false,
            success: function (result) {
                if (result.Success == true) {


                    toastr.success("Row deleted successfully.");
                    BindEmployeePIPParamtersDetails($("#hdnsPEPEmpID").val(), $("#hdnsPIPID").val())

                    if ($('#hdnPIPDuration').val() == 0 || $('#hdnPIPDuration').val() == -1) {

                        $('#ddlPIPDuration').val(-1);
                    } else {
                        $('#ddlPIPDuration').val($('#hdnPIPDuration').val());
                    }

                    $('#btnPIPApproveByRole').show();


                } else {
                    toastr.error("There is some issue in delete action.");
                }
            },
            error: function (error) {
                var options = { "backdrop": "static", keyboard: true };
                $("#error").html("There is some error. Try again later!");
                $('#errorMsg').modal(options);
                $('#errorMsg').modal('show');
            }
        })
    }
}



function ShowUploadDocHRBPPopUp(Docfiles, PEmpID, StatusId, PIPId, SelectedEmpName, SelectedEmpID, PIPRejectionReason) {

    $("#hdnPEPEmpID").val(PEmpID);
    $("#hdnStatusId").val(StatusId);
    $("#hdnPIPIds").val(PIPId);
    $("#filenamehrbp").text(Docfiles);

    if (StatusId == PIP_SUBMITByManager) {
        $('#txtHRBPPIPRejectReason').text('');

    } if (StatusId == PIP_Re_SUBMITByManager && SelectionRoleId == 4) {
        $('#txtHRBPPIPRejectReason').text('');

    }
    else {
        $('#txtHRBPPIPRejectReason').text(PIPRejectionReason);

    }


    $('#txtHRBPSelectEmployeeName').text(SelectedEmpName + ' - ' + SelectedEmpID);

    if (StatusId == PIP_ApproveByHRBP) {
        $('#btnDocumentInAdequate').hide();
        $('#btnPIPDisapprove').hide();


        $('#btnPIPApprove').hide();
        $('#txtHRBPPIPRejectReason').prop('disabled', true);
        $('#btnDocumentInAdequate').prop('disabled', true);
        $('#btnPIPDisapprove').prop('disabled', true);
        $('#btnPIPApprove').prop('disabled', true);

    } else {
        if ((SelectionRoleId == 4 && StatusId == PIP_SUBMITByManager)) {
            $('#btnDocumentInAdequate').show();
            $('#btnPIPApprove').show();
            $('#btnPIPDisapprove').hide();
            $('#txtHRBPPIPRejectReason').val('');
            $('#txtHRBPPIPRejectReason').prop('disabled', false);
            $('#btnDocumentInAdequate').prop('disabled', false);
            $('#btnPIPApprove').prop('disabled', false);
            $('#btnPIPDisapprove').prop('disabled', false);

        }
        else if (SelectionRoleId == 4 && (StatusId == PIP_Re_SUBMITByManager)) {
            $('#btnDocumentInAdequate').hide();
            $('#btnPIPApprove').show();
            $('#btnPIPDisapprove').show();
            $('#btnPIPDisapprove').prop('disabled', false);
            $('#txtHRBPPIPRejectReason').prop('disabled', false);
            $('#btnDocumentInAdequate').prop('disabled', true);
            $('#btnPIPApprove').prop('disabled', false);

        }
        else if (SelectionRoleId == 4 && (StatusId == RM_to_share_moreInfo_on_PIP_initiation || StatusId == PIP_ApproveByHRBP || StatusId == PIP_RejectByHRBP)) {
            $('#btnDocumentInAdequate').hide();
            $('#btnPIPApprove').hide();
            $('#btnPIPDisapprove').hide();
            $('#btnPIPDisapprove').prop('disabled', true);
            $('#txtHRBPPIPRejectReason').prop('disabled', true);
            $('#btnDocumentInAdequate').prop('disabled', true);
            $('#btnPIPApprove').prop('disabled', true);

        }
    }


    $('#HRBPActionPopup').modal('show');

}


$("#uploadDocfile").on("change", function (e) {

    var fileAttachement = $("#uploadDocfile").get(0).files

    //if (fileAttachement.length > 10) {

    //    $("#error").html("Maximum 5 files can be uploaded at a time.");
    //    $('#errorMsg').modal(options);
    //    $('#errorMsg').modal('show');

    //    return false;
    //}
    var filesNames = [];

    if (fileAttachement.length > 0) {
        var fileName = (fileAttachement[0].name).toLowerCase();
        var fileExtension = fileName.substr((fileName.lastIndexOf('.') + 1));

        // Loop through each file
        for (var i = 0; i < fileAttachement.length; i++) {
            filesNames.push(fileAttachement[i].name);

        }
    }

    $("#filename").text(filesNames.join(","));
    $("#txtAttachedDoc").val($("#filename").text());

});

function UploadSupportingPIPDoc(Docfiles, PEmpID, StatusId, PIPid, SelectedName, SelectedEmpID, PIPReason, PIPRejectReason) {

    $("#hdnPEPEmpID").val(PEmpID);
    $("#hdnStatusId").val(StatusId);
    $("#hdnPIPId").val(PIPid);
    //$("#hdnPIPIdNumber").val(PIPId);

    $("#filename").text(Docfiles);
    $("#txtAttachedDoc").val($("#filename").text());

    $('#txtPIPReason').val(PIPReason);


    $('#RM_txtHRBPPIPRejectReason').prop('disabled', true);
    if (StatusId == RM_to_share_moreInfo_on_PIP_initiation) {

        $('#divRM_rejectionReason').css('display', 'block');
        $('#RM_txtHRBPPIPRejectReason').val(PIPRejectReason);


    } else {
        $('#divRM_rejectionReason').css('display', 'none');
    }

    $("#txtSelectEmployeeName").text(SelectedName + ' - ' + SelectedEmpID);

    //$("input[type='file']").prop("files", $("#filename").text());



    $('#addPIPDoc').modal('show');

    debugger;
    if (StatusId == PIP_ApproveByHRBP || StatusId == PIP_SUBMITByManager || StatusId == PIP_RejectByHRBP || StatusId == PIP_Re_SUBMITByManager) { // Initiation Request Pending on HRBP and // Initiation Request Approved by HRBP
        $('#BtnFooter').css('display', 'none');
        $('#txtPIPReason').prop('disabled', true);
        $('#uploadDocfile').prop('disabled', true)

    } else {
        $('#BtnFooter').css('display', 'block');
        $('#txtPIPReason').prop('disabled', false);
        $('#uploadDocfile').prop('disabled', false);
        $('#btnAddDoc').prop('disabled', false);
    }


}


$('#btnPIPFinalAction').click(function () {

    if (isSubmitting1) {
        event.preventDefault();
        return false;
    }
    isSubmitting1 = true;

    if ($('#ddlPIPResult').val() == -1) {

        toastr.error("PIP Result dropdown must be selected.");
        $('#ddlPIPResult').focus();
        isSubmitting1 = false;
        return false;
    }

    if ($('#ddlPIPResult').val() == PIP_Extended) {

        if ($('#ddlPIPExtension').val() == -1) {
            toastr.error("PIP Extension dropdown must be selected.");
            $('#ddlPIPExtension').focus();
            isSubmitting1 = false;
            return false;
        }
    }



    var svrPath = CONFIG.get('SERVERNAME');

    var apiPath1 = svrPath + "PIP/PIP_SubmitFinalResult?PIPId=" + $('#hdnsPIPID').val() + "&PIPResultId=" + $('#ddlPIPResult').val() + "&PIPExtension=" + $('#ddlPIPExtension').val() + "&PIPSubmitBy=" + sessionStorage.EmployeeId + "&SelectEmpID=" + $('#hdnsPEPEmpID').val()

    // $('#btnPIPFinalAction').prop('disabled', true); // Disable the button


    //event.preventDefault(); // Prevent the default form submission
    //var $submitBtn = $('#btnPIPFinalAction');
    //if ($submitBtn.prop('disabled')) {
    //    isSubmitting1 = false;
    //    return; // If the button is already disabled, do nothing
    //}
    //$submitBtn.prop('disabled', true); // Disable the button

    $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'POST',
        url: apiPath1,
        async: false,
        success: function (result) {
            if (result.Success == true) {



                if ($('#ddlPIPResult').val() == PIP_Extended) {

                    toastr.success("PIP extend successfully.");

                } else if ($('#ddlPIPResult').val() == PIP_Successfully_Completed) {

                    toastr.success("PIP process successfully completed.");

                }
                else if ($('#ddlPIPResult').val() == PIP_Unsuccessful) {

                    toastr.success("PIP marked as unsuccessful.");

                }



                $('#AddDocFeedbackPopup').modal('hide');
                BindPIPEmpList();
                //$submitBtn.prop('disabled', false); // Disable the butto


            }
            else if (result.Result == -2) {

                toastr.error("PIP result can only be selected after the mandatory feedback is filled. Please submit the feedback for respective week.");
                // $submitBtn.prop('disabled', false); // Disable the butto
                isSubmitting1 = false;
                return;
            }
            else {
                toastr.error("There is some issue in PIP action.");
                // $submitBtn.prop('disabled', false); // Disable the butto
                isSubmitting1 = false;

                return;
            }
        },
        error: function (error) {
            $submitBtn.prop('disabled', false); // Disable the butto
            var options = { "backdrop": "static", keyboard: true };
            isSubmitting1 = false;
            $("#error").html("There is some error. Try again later!");
            $('#errorMsg').modal(options);
            $('#errorMsg').modal('show');
        }
    })

});

//$('#btnPIPFinalAction').one('click', clickHandler);




