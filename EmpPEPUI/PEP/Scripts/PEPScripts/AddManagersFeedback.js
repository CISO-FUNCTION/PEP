

$("#btnUpdateEditableCompitency").on('click', function () {
    //EditableCompetencySave();
});
$("#btnSubmitBC").click(function () {
    // SaveBCasDraft(0);
    //  SaveBC();

});


$("#btnSubmitKRA").click(function () {
    SaveKRAasDraft(0);
    SaveKRA();

});

var arr = [];

/** ViewSelfAssessmentFeedback: show Action Plan when selectedCycleAssessment last 4 digits > 2025 (e.g. 122026). */
function selfAssessmentShowActionPlanFromCycle() {
    if (typeof SubCycleCheckSelfAssest === 'undefined' || SubCycleCheckSelfAssest === null) {
        return false;
    }
    var v = String(SubCycleCheckSelfAssest);
    if (v.length < 4) return false;
    var y = parseInt(v.slice(-4), 10);
    return !isNaN(y) && y > 2025;
}

$('#ddlyearFeedback').change(function (e) {
    //  BindEmployeeBC();
    // Reload ManagerFeedbackCards when year changes
    if (typeof ManagerFeedbackCards !== 'undefined' && ManagerFeedbackCards.loadGoalsAndDrafts) {
        ManagerFeedbackCards.loadGoalsAndDrafts();
    }
    BindEmployeeKRA();
    BindPreviousRM();
})

var ddlAppCycle = '';
$(document).ready(function () {

    // Check if BtnFeedbackSaveSubmit is visible, if yes show trainingLink
    if ($('#BtnFeedbackSaveSubmit').is(':visible') || $('#BtnFeedbackSaveSubmit').css('display') !== 'none') {
        $('#BtnFeedbackSaveSubmit').show();
        var empName = $("#EmployeeName").text().trim().split(" ")[0];
        $('#spnEmpName').text(empName);
    } else {
        $('#BtnFeedbackSaveSubmit').show();
        var empName = $("#EmployeeName").text().trim().split(" ")[0];
        $('#spnEmpName').text(empName);
    }
    
    $('#DivSubmitSkipLevel').show();

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

    // Full-page loader (AddManagersFeedbackHome #managerFeedbackPageLoader) — used by cards + Previous RM tab
    if ($('#managerFeedbackPageLoader').length) {
        window.showManagerFeedbackPageLoader = function (message) {
            var $el = $('#managerFeedbackPageLoader');
            $el.find('.mf-loader-text').text(message || 'Loading...');
            $el.stop(true, true).css({ display: 'flex', opacity: 0 }).animate({ opacity: 1 }, 160);
        };
        window.hideManagerFeedbackPageLoader = function () {
            var $el = $('#managerFeedbackPageLoader');
            $el.stop(true, true).animate({ opacity: 0 }, 160, function () {
                $el.css('display', 'none');
            });
        };
        window.showManagerFeedbackPageLoader('Loading feedback...');
    }

    $(document).on('keyup', function (e) {

        $('textarea').each(function () {


            var txtValue = $(this).val();

            $(this).val(txtValue.replace(/[\<\>=]+/g, ''));


            var ascii = e.which || e.keyCode;

            if (ascii === 60 || ascii === 61 || ascii === 62) {

                $(e.target).addClass('csstxtarea');
                toastr.error("Special characters < and >  are not allowed. \n For security reasons, please refrain from using special characters in your input. Special characters may pose a risk to the system's security. Kindly remove any special characters and try again. Thank you for your understanding.")
                return false;
            }
            else {
                $(e.target).removeClass('csstxtarea');
                $(this).removeClass('csstxtarea');

            }
        });

    });




    ddlAppCycle = ddlAppCycleId;

    var SubCycleCheckSelfAssest = '';
    var DashValue = DashboardValue;

    if (DashValue == 2) {
        var SubCycleCheckSelfAssest = SubCycleCheckSelfAssest;

    }
    var GselectyearNotGiven = 0;
    var GselectyearSkipLevel = 0;
    if (DashValue == 3) {

        GselectyearNotGiven = parseInt(Gselectedyear);
    }

    if (DashValue == 5) {

        GselectyearSkipLevel = parseInt(Gselectedyear);
    }


    if (DashValue == 5) {
        FillAppraisalHalfCycle(GselectyearSkipLevel);
        if (typeof window.hideManagerFeedbackPageLoader === 'function' && !$('#goalsCardsContainer').length) {
            window.hideManagerFeedbackPageLoader();
        }
    }
    else {
        FillAppraisalHalfyearCycle();

        FillAppraisalHalfyearCycleFeedback(GselectyearNotGiven);
        // Defer so the browser can paint the page loader before synchronous AJAX (CommonAjaxGET)
        setTimeout(function () {
            BindEmployeeKRA(DashValue);
            BindPreviousRM();
            if (typeof window.hideManagerFeedbackPageLoader === 'function' && !$('#goalsCardsContainer').length) {
                window.hideManagerFeedbackPageLoader();
            }
        }, 30);
    }
    //BindEmployeeBC();


    $("body").on("click", ".starRate li a", function () {
        var CurrentRating = $(this).text();
        $(this).parents(".starRate").find("a").removeClass("active");
        $(this).addClass("active").parents(".starRate").find(".selectedRating").val($(this).attr("value"));
        $($($($(this).parent()).parent()).children()).each(function (index, item) {
            if ($(item.children).attr("value") <= CurrentRating) {
                $(item.children).addClass('active');
            }
        });

    });
    //fnBindFeebackGivenKRAList();
    $('#feedbackTabs a').click(function (e) {
        e.preventDefault()
        $("#hdnSelectedFeedbackTab").val($(this).attr('href'));
    })


    $("#btnSaveDraft").click(function () {
        // Check if ManagerFeedbackCards is active - if so, skip old handler
        if (typeof ManagerFeedbackCards !== 'undefined' && ManagerFeedbackCards.goals && ManagerFeedbackCards.goals.length > 0) {
            console.log('ManagerFeedbackCards is active, skipping old SaveBCasDraft handler');
            return;
        }
        SaveBCasDraft(1);
    });
    $("#btnKRASaveDraft").click(function () {
        // Check if ManagerFeedbackCards is active - if so, skip old handler
        if (typeof ManagerFeedbackCards !== 'undefined' && ManagerFeedbackCards.goals && ManagerFeedbackCards.goals.length > 0) {
            console.log('ManagerFeedbackCards is active, skipping old SaveKRAasDraft handler');
            return;
        }
        SaveKRAasDraft(1);
    });

    $("#DivExpectedPoint").click(function (e) {
        e.stopPropagation();
    });

    //$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    //    var target = $(e.target).attr("href") // create by kaushal saini

    //    var table = $('#tblManagerFeedbackKRAList').DataTable();
    //    var numero = $('#tblManagerFeedbackKRAList').dataTable().fnGetNodes().length;

    //    if (target === "#tab_a") {
    //        if (numero != 0) {
    //            for (i = 1; i <= numero; i++) {
    //                vFeedback = $($('table tr:nth-child(' + i + ') td:nth-child(7) textarea')).val();
    //                vRating = $($('table tr:nth-child(' + i + ') td:nth-child(6) div:nth-child(1) input:hidden')).val();
    //                if (vFeedback == "" || vRating == 0) {
    //                    alert('Please fill Goals & Objectives field/Rating first.');
    //                    return;
    //                }
    //            }
    //        }
    //    }
    //});

    //$("#textarea").keypress(function () {

    //    var txtValue = $(this).val();
    //    $(this).val(txtValue.replace(/[\<\>'=]+/g, ''));
    //});

    fnLimitFeedbackText();


});


function fnLimitFeedbackText(KRAId) {

    //;
    //var text_max = parseInt($('#txtFeedback_' + KRAId).attr('maxLength'));



    //$('#txtfeedbRemaining_' + KRAId).html(text_max + ' characters remaining');

    $('#txtFeedback_' + KRAId).keypress(function (e) {
        var text_max = parseInt($('#txtFeedback_' + KRAId).attr('maxLength'));

        var text_length = $('#txtFeedback_' + KRAId).val().length;
        var text_remaining = text_max - text_length;

        var txtValue = $('#txtFeedback_' + KRAId).val();
        $('#txtFeedback_' + KRAId).val(txtValue.replace(/[\<\>'=]+/g, ''));

        var txtValue = $(this).val();

        $(this).val(txtValue.replace(/[\<\>=]+/g, ''));


        var ascii = e.which || e.keyCode;

        if (ascii === 60 || ascii === 61 || ascii === 62) {

            $(e.target).addClass('csstxtarea');
            toastr.error("Special characters < and >  are not allowed. \n For security reasons, please refrain from using special characters in your input. Special characters may pose a risk to the system's security. Kindly remove any special characters and try again. Thank you for your understanding.")
            return false;
        }
        else {
            $(e.target).removeClass('csstxtarea');
            $(this).removeClass('csstxtarea');

        }
        $('#txtfeedRemaining_' + KRAId).html(': ' + text_remaining + ' characters remaining.');

        if (text_remaining == 1600) {
            $('#txtfeedRemaining_' + KRAId).hide();
        } else {
            $('#txtfeedRemaining_' + KRAId).show();
        }


    });
}
function FillAppraisalHalfyearCycle() {
    var d = new Date();
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "AppraisalCycle/PerformCycle?performCycleCheck=" + formatDate(d) + "&Type=2";
    var AppraisalCycle = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    $('#ddlyear').empty();
    $.each(AppraisalCycle.responseJSON.Result, function (index, data) {
        $('#ddlyear').append($("<option>").val(data.YearBreakCheck).text(data.AppraisalCycleName));
    });
}




function FillAppraisalHalfyearCycleFeedback(GselectyearNotGiven) {

    var d = new Date();
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'AppraisalCycle/GetSelfAssesmentCycle?AppCycleId=' + ddlAppCycle;
    var AppraisalCycle = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    $('#ddlyearFeedback').empty();
    $.each(AppraisalCycle.responseJSON.Result.data, function (index, data) {
        $('#ddlyearFeedback').append($("<option>").val(data.YearBreakCheck).text(data.AppraisalCycleName));

        if (GselectyearNotGiven != 0)
            $('#ddlyearFeedback option[value="' + GselectyearNotGiven + '"]').attr("selected", "selected");

    });


}
//function FillAppraisalHalfyearCycleFeedback(GselectyearNotGiven) {

//    var d = new Date();
//    var svrPath = CONFIG.get('SERVERNAME');
//    var apiPath = svrPath + "AppraisalCycle?performCycleCheck=" + formatDate(d) + "&Type=2"
//    var AppraisalCycle = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
//    $('#ddlyearFeedback').empty();
//    $.each(AppraisalCycle.responseJSON.Result, function (index, data) {
//        $('#ddlyearFeedback').append($("<option>").val(data.YearBreakCheck).text(data.AppraisalCycleName));
//        if (GselectyearNotGiven != 0)
//            $('#ddlyearFeedback option[value="' + GselectyearNotGiven + '"]').attr("selected", "selected");
//    });


//}


function FillAppraisalHalfCycle(GselectyearSkipLevel) {


    var d = new Date();
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + 'AppraisalCycle/GetSelfAssesmentCycle?AppCycleId=' + ddlAppCycle;
    var AppraisalCycle = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    $('#ddlyearSkiplevel').empty();
    $.each(AppraisalCycle.responseJSON.Result, function (index, data) {
        $('#ddlyearSkiplevel').append($("<option>").val(data.YearBreakCheck).text(data.AppraisalCycleName));

        if (GselectyearNotGiven != 0)
            $('#ddlyearSkiplevel option[value="' + GselectyearSkipLevel + '"]').attr("selected", "selected");

    });

    //var d = new Date();
    //var svrPath = CONFIG.get('SERVERNAME');
    //var apiPath = svrPath + "AppraisalCycle?performCycleCheck=" + formatDate(d) + "&Type=2";
    //var AppraisalCycle = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    //$('#ddlPerformycle').empty();
    //$.each(AppraisalCycle.responseJSON.Result, function (index, data) {
    //    $('#ddlPerformycle').append($("<option>").val(data.YearBreakCheck).text(data.AppraisalCycleName));
    //});


    //$('#ddlyearSkiplevel').empty();
    //$.each(AppraisalCycle.responseJSON.Result, function (index, data) {
    //    $('#ddlyearSkiplevel').append($("<option>").val(data.YearBreakCheck).text(data.AppraisalCycleName));
    //    if (GselectyearSkipLevel != 0)
    //        $('#ddlyearSkiplevel option[value="' + GselectyearSkipLevel + '"]').attr("selected", "selected");
    //});
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
function SaveBCasDraft(SubmitCheck) {

    var StatusIDFlag;
    var flag = 0;
    var apraisalCycleId = sessionStorage.AppraisalCycleId;
    var selectedyear = $('#ddlyearFeedback :selected').val();
    var empId = sessionStorage.EmployeeId;
    CheckSessionTimeOut();
    var ToEmployeeId = GToEmployeeId;
    var table = $('#tblManagerFeedbackBCList').DataTable();
    var numero = $('#tblManagerFeedbackBCList').dataTable().fnGetNodes().length;
    var vFeedback;
    var vRating;
    var vKRAId;
    var FeedbackArray = [];
    var svrPath = CONFIG.get('SERVERNAME');
    //var apiPath = svrPath + '/ManagerFeedback/';

    var apiPath = svrPath + "Feedback?AppraisalCycleId=" + apraisalCycleId + "&ToEmployeeId=" + ToEmployeeId + "&FromEmployeeId=" + empId +
        "&ActionTypeId=1&ParentFeedBackId=" + 0 + "&AreaID=6&SelectedYear=" + selectedyear;

    var EmpBCDraftDataCheck = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    if (EmpBCDraftDataCheck.responseJSON.Success == true) {
        StatusIDFlag = 101;
    }
    else {
        StatusIDFlag = 100;
    }
    var VfeedbackId = 0;
    var arr;
    var data = $('#tblManagerFeedbackBCList').DataTable().rows().data();
    if (numero != 0) {
        for (i = 1; i <= numero; i++) {
            vQuestionaireId = $($('table tr:nth-child(' + i + ') td:nth-child(1) input:hidden')).val();
            arr = $($('table tr:nth-child(' + i + ') td:nth-child(4) input:hidden')).val();
            GradeAreaQuestionMappingID = $($('table tr:nth-child(' + i + ') td:nth-child(4) input:hidden')).val();
            if (StatusIDFlag == 101) {
                arr = $($('table tr:nth-child(' + i + ') td:nth-child(4) input:hidden')).val();
                VfeedbackId = (arr).split('#')[1];
                GradeAreaQuestionMappingID = (arr).split('#')[0];
            }
            vFeedback = $($('table tr:nth-child(' + i + ') td:nth-child(4) textarea')).val();
            vRating = $($('table tr:nth-child(' + i + ') td:nth-child(3) div:nth-child(1) input:hidden')).val();
            if (vFeedback == "") {
                vFeedback = null
            }
            if (vRating == 0 || vRating == null || vRating == "null") {
                vRating = null;
            }


            $.each(data, function (index, jsonFeedback) {
                if (jsonFeedback.QuestionaireId == vQuestionaireId) {
                    var EmployeeFeedback = {
                        AppraisalCycleId: sessionStorage.AppraisalCycleId,
                        FromEmployeeId: sessionStorage.EmployeeId,
                        ToEmployeeId: ToEmployeeId,
                        ActionTypeId: 1,
                        AreaID: 1,
                        GradeAreaQuestionMappingID: jsonFeedback.GradeAreaQuestionMappingID,
                        QuestionaireId: jsonFeedback.QuestionaireId,
                        Feedback: vFeedback,
                        FeedBackId: VfeedbackId,
                        Rating: vRating,
                        PerformCycleCheck: selectedyear,
                        StatusID: StatusIDFlag            // statusId 100 indicate for Save As Draft 
                    }
                    FeedbackArray.push(EmployeeFeedback);
                }
            });

        }

    }
    if (FeedbackArray.length == 0 && SubmitCheck == 1) {
        toastr.error("Please give feedback atleast one Competency.");
        return false;
    }
    if (EmpBCDraftDataCheck.responseJSON.Success == true) {
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + '/ManagerFeedback/';
        CommonAjaxPOSTWithHeader(apiPath, FeedbackArray, CommonGetHeaderInfo());
    }
    if (FeedbackArray.length > 0 && SubmitCheck == 1) {
        var Result;
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + '/ManagerFeedback/';
        Result = CommonAjaxPOST_Array(apiPath, FeedbackArray, CommonGetHeaderInfo());
        toastr.success('Feedback Saved as Draft');

    }
    else if (SubmitCheck == 0 && FeedbackArray.length == 0) {
        // alert("Please give feedback for all behavioural competency.");
    }
    else if (EmpBCDraftDataCheck.responseJSON.Success == false && SubmitCheck == 1) {
        //
    }
    else {
        //alert("Please give feedback for all G&Os.");
    }

}
function SaveKRAasDraft(SubmitCheck) {
    $('#btnSubmitKRA').prop('disabled', true);

    var flag = 0;
    var AppraisalCycleId = ddlAppCycle;
    var selectedyear = $('#ddlyearFeedback :selected').val();
    var empId = sessionStorage.EmployeeId;
    CheckSessionTimeOut();
    var EmployeeId = GToEmployeeId;
    var table = $('#tblManagerFeedbackKRAList').DataTable();
    var numero = $('#tblManagerFeedbackKRAList').dataTable().fnGetNodes().length;

    var vFeedback;
    var vRating;
    var vKRAId;
    var FeedbackArray = [];
    var svrPath = CONFIG.get('SERVERNAME');

    var apiPath = svrPath + "Feedback?AppraisalCycleId=" + AppraisalCycleId + "&ToEmployeeId=" + EmployeeId + "&FromEmployeeId=" + empId +
        "&ActionTypeId=1&ParentFeedBackId=" + 0 + "&AreaID=7&SelectedYear=" + selectedyear;
    var EmpKRADraftDataCheck = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    if (EmpKRADraftDataCheck.responseJSON.Success == true) {
        StatusIDFlag = 101;
    }
    else {
        StatusIDFlag = 100;
    }
    var VfeedbackId;
    var arr;
    var data = $('#tblManagerFeedbackKRAList').DataTable().rows().data();
    var m = 0;
    var n = 0;
    var p = 1;
    if (numero != 0) {
        for (i = 1; i <= numero; i++) {

            m = p;
            n = i + i;

            vKRAId = $($('table tr:nth-child(' + m + ') input:hidden')).val();
            //vKRAId = $($('table tr:nth-child(' + i + ') td:nth-child(7) input:hidden')).val();
            if (StatusIDFlag == 101) {
                arr = $($('table tr:nth-child(' + n + ') input:hidden')).val();
                //arr = $($('table tr:nth-child(' + i + ') td:nth-child(7) input:hidden')).val();
                VfeedbackId = (arr).split('#')[1];
                vKRAId = (arr).split('#')[0];
            }
            else {
                arr = $($('table tr:nth-child(' + n + ') input:hidden')).val();
                //arr = $($('table tr:nth-child(' + i + ') td:nth-child(7) input:hidden')).val();
                VfeedbackId = (arr).split('#')[1];
                vKRAId = (arr).split('#')[0];
            }
            vFeedback = $($('table tr:nth-child(' + n + ') textarea')).val();
            //vFeedback = $($('table tr:nth-child(' + i + ') td:nth-child(7) textarea')).val();
            // vRating = $($('table tr:nth-child(' + m + ') td:nth-child(6) div:nth-child(1) input:hidden')).val();
            vRating = null;
            if (vFeedback == "") {
                if (SubmitCheck == 1) {
                    flag = 1;
                    toastr.error("Please give feedback for all Goals & Objectives.");
                    $('#btnSubmitKRA').prop('disabled', false);
                    return;
                }
            }
            if (vRating == 0 || vRating == null || vRating == "null") {
                vRating = null;
            }
            n = 0;
            p = p + 2;
            if (vFeedback != '') {
                $.each(data, function (index, jsonFeedback) {
                    if (jsonFeedback.KRAId == vKRAId) {
                        var EmployeeFeedback1 = {
                            AppraisalCycleId: ddlAppCycle,
                            FromEmployeeId: sessionStorage.EmployeeId,
                            ToEmployeeId: EmployeeId,
                            ActionTypeId: 1,
                            AreaID: 2,
                            QuestionaireId: jsonFeedback.KRAId,
                            Feedback: vFeedback,
                            FeedbackId: VfeedbackId,
                            Rating: vRating,
                            PerformCycleCheck: selectedyear,
                            StatusID: StatusIDFlag            // statusId 100 indicate for Save As Draft 
                        }
                        FeedbackArray.push(EmployeeFeedback1);
                    }
                });
            }


        }
    }

    if (EmpKRADraftDataCheck.responseJSON.Success == true) {
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + 'ManagerFeedback/SubmitUpdateFeedback';
        CommonAjaxPOST_Array(apiPath, FeedbackArray, CommonGetHeaderInfo());
    }
    if (FeedbackArray.length > 0 && flag != 1 && SubmitCheck == 1) {
        var Result;
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + 'ManagerFeedback/SubmitUpdateFeedback/';
        Result = CommonAjaxPOST_Array(apiPath, FeedbackArray, CommonGetHeaderInfo());

        if (Result.Success) {
            toastr.success('Feedback Saved as Draft')
            BindEmployeeKRA(3);
            $('#btnSubmitKRA').prop('disabled', false);
        }
        else {
            toastr.error(Result.ErrorMessage);
        }
    }
    else if (SubmitCheck == 0) {
        $('#btnSubmitKRA').prop('disabled', false);
        //alert("Please give feedback for all G&Os.");
    }
    else if (SubmitCheck == 1) {
        $('#btnSubmitKRA').prop('disabled', false);
    }
    else {
        // alert("Please give feedback for all G&Os.");
        $('#btnSubmitKRA').prop('disabled', false);
    }

}
function BindEmployeeKRA(DashValue) {
    // Check if ManagerFeedbackCards is being used - if so, skip the old table binding
    if (typeof ManagerFeedbackCards !== 'undefined' && ManagerFeedbackCards.goals && ManagerFeedbackCards.goals.length > 0) {
        return;
    }

    var ToEmployeeId = GToEmployeeId;
    var appraisalCycleId = ddlAppCycle;
    var selectedyear = $('#ddlyearFeedback :selected').val();

    // ViewSelfAssessmentFeedback page has no ddlyearFeedback dropdown — use SubCycleCheckSelfAssest
    if (DashValue == 2 && typeof SubCycleCheckSelfAssest !== 'undefined') {
        selectedyear = SubCycleCheckSelfAssest;
    }

    if (!ToEmployeeId || ToEmployeeId == 0 || !appraisalCycleId || appraisalCycleId == '' || selectedyear === undefined || selectedyear === null || String(selectedyear) === '') {
        $('#selfAssessmentLoader').fadeOut(200);
        return;
    }

    CheckSessionTimeOut();

    var empId = sessionStorage.EmployeeId;
    var KRAStatusId = 3;
    var apiPath = "";
    var svrPath = CONFIG.get('SERVERNAME');

    if (DashValue == 2) {
        apiPath = svrPath + "Feedback?AppraisalCycleId=" + appraisalCycleId + "&ToEmployeeId=" + ToEmployeeId + "&FromEmployeeId=" + empId +
            "&ActionTypeId=1&ParentFeedBackId=" + 0 + "&AreaID=9&SelectedYear=" + SubCycleCheckSelfAssest
    }
    else {
        apiPath = svrPath + "Feedback?AppraisalCycleId=" + appraisalCycleId + "&ToEmployeeId=" + ToEmployeeId + "&FromEmployeeId=" + empId +
            "&ActionTypeId=1&ParentFeedBackId=" + 0 + "&AreaID=7&SelectedYear=" + selectedyear;
    }

    var EmpKRADraftData = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    apiPath = svrPath + "EmployeeKRA/GetEmployeeKRA?AppraisalCycleId=" + appraisalCycleId + "&ToEmployeeId=" + ToEmployeeId + "&StatusId=" + KRAStatusId + "&SelectedYear=" + selectedyear + "&SelfAssCycleId=" + selectedyear;

    var EmpKRAData = CommonAjaxGET(apiPath, CommonGetHeaderInfo());


    var newObj = [];

    if (EmpKRADraftData.responseJSON.Success == true) {
        EmpKRAData.responseJSON.Result.data.forEach(function (data, index) {
            console.log(data.GradeAreaQuestionMappingID)
            var feedback1;
            //var feedback1 = EmpKRADraftData.responseJSON.Result.find(function (d) {
            //    return d.QuestionaireId == data.KRAId
            //})

            EmpKRADraftData.responseJSON.Result.data.forEach(function (d, index) {
                if (d.QuestionaireId == data.KRAId) {
                    feedback1 = d;
                }
            })
            if (feedback1) {
                data.Feedback = feedback1.Feedback;
                data.FeedBackId = feedback1.FeedBackId;
                data.Rating = feedback1.Rating;
                data.Selfassesment = feedback1.Selfassesment;
                // Self-assessment date: API uses FeedbackDate; SelfassessmentTableDetail source is CreatedOn
                data.FeedbackDate = feedback1.FeedbackDate || feedback1.feedbackDate || feedback1.CreatedOn || feedback1.createdOn;
            }
            if (!data.FeedbackDate && (data.CreatedOn || data.createdOn)) {
                data.FeedbackDate = data.CreatedOn || data.createdOn;
            }
            newObj.push(data)
            if (feedback1) { console.log(feedback1.Feedback); }
        });

        if (DashValue == 2) {
            CreateKRASelfAssessmentTable(newObj);
            $('#selfAssessmentLoader').fadeOut(200);
        }
        else {

            CreateKRATable(newObj);
        }


        $('#btnSubmitKRA').show();
        $('#btnKRASaveDraft').show();
    }
    else {
        if (EmpKRAData.responseJSON.Result != null) {

            CreateKRATable(EmpKRAData.responseJSON.Result.data);

            CreateKRASelfAssessmentTable(EmpKRAData.responseJSON.Result.data)
            $('#selfAssessmentLoader').fadeOut(200);
            $('#btnSubmitKRA').show();

            $('#btnKRASaveDraft').show();
        }
        else {
            CreateKRATable([]);

            CreateKRASelfAssessmentTable([]);
            $('#selfAssessmentLoader').fadeOut(200);
            $('#btnSubmitKRA').hide();
            $('#btnKRASaveDraft').hide();
        }
    }

    function CreateKRATable(dataSet) {

        if (dataSet) {

            $('#tblManagerFeedbackKRAList').show();
            var GetHoverValues = CommonAjaxGET(svrPath + "QuestionaryMaster?AreaId=2&Type=KRA", CommonGetHeaderInfo());

            $('#tblManagerFeedbackKRAList').DataTable({
                destroy: true,
                data: dataSet,
                aoColumns: [
                    { mData: "KRAId", label: "KRAId", visible: false, },
                    { mData: "GoalType", label: "Goal Type", width: "10%" },
                    { mData: "GoalDescription", label: "Goal Description", width: "20%" },
                    { mData: "Weightage", label: "Weightage", width: "8%" },
                    {
                        mData: "Measure", 
                        label: "Measure",
                        width: "31%",
                        mRender: function (data, type, full) {
                            var measureText = data || '';
                            var fullText = measureText;
                            var displayText = '';
                            
                            // Count words (split by spaces)
                            var words = measureText.split(/\s+/).filter(function(word) { return word.length > 0; });
                            var wordCount = words.length;
                            var kraId = full['KRAId'];
                            var uniqueId = 'measure-fb-' + kraId + '-' + Date.now();
                            
                            if (wordCount > 10) {
                                // Show first 10 words with Read More
                                var truncatedWords = words.slice(0, 10).join(' ');
                                displayText = truncatedWords + '... <a href="#" class="read-more-link-fb" data-id="' + uniqueId + '" data-full="' + escapeHtmlFeedback(fullText) + '" style="color: #337ab7; text-decoration: underline; cursor: pointer;">Read more</a>';
                            } else {
                                displayText = fullText;
                            }
                            
                            return '<div style="text-align: left; padding: 8px;" class="measure-content-fb" data-id="' + uniqueId + '" data-full="' + escapeHtmlFeedback(fullText) + '" data-wordcount="' + wordCount + '">' + displayText + '</div>';
                        }
                    },
                    {
                        mData: "Selfassesment",
                        label: "Self Assessment",
                        width: "31%",
                        mRender: function (data, type, full) {
                            var selfAssessText = data || '';
                            
                            if (selfAssessText === null || selfAssessText === '' || selfAssessText === 'null') {
                                return '<div style="text-align: left; padding: 8px;">N/A</div>';
                            }
                            
                            var fullText = selfAssessText;
                            var displayText = '';
                            
                            // Count words (split by spaces)
                            var words = selfAssessText.split(/\s+/).filter(function(word) { return word.length > 0; });
                            var wordCount = words.length;
                            var kraId = full['KRAId'];
                            var uniqueId = 'selfassess-fb-' + kraId + '-' + Date.now();
                            
                            if (wordCount > 10) {
                                // Show first 10 words with Read More
                                var truncatedWords = words.slice(0, 10).join(' ');
                                displayText = truncatedWords + '... <a href="#" class="read-more-link-fb" data-id="' + uniqueId + '" data-full="' + escapeHtmlFeedback(fullText) + '" style="color: #337ab7; text-decoration: underline; cursor: pointer;">Read more</a>';
                            } else {
                                displayText = fullText;
                            }
                            
                            return '<div style="text-align: left; padding: 8px;" class="selfassess-content-fb" data-id="' + uniqueId + '" data-full="' + escapeHtmlFeedback(fullText) + '" data-wordcount="' + wordCount + '">' + displayText + '</div>';
                        }
                    }
                    //{
                    //    mData: "Rating",
                    //    mRender: function (data, type, full) {
                    //        var setslider = "";
                    //        if (GetHoverValues.responseJSON.Success) {
                    //            var hValues = GetHoverValues.responseJSON.Result;
                    //            var setslider = '<div class="starRate" id="divKRAStars"><ul><li><a href="#" value="5"  class="' + (5 <= full.Rating ? 'active' : '') + '" title="' + hValues[0].Rate5 + '"><span>5</span><b></b></a></li><li><a href="#" value="4"  class="' + (4 <= full.Rating ? 'active' : '') + '" title="' + hValues[0].Rate4 + '"><span>4</span></a></li><li><a href="#" value="3"  class="' + (3 <= full.Rating ? 'active' : '') + '" title="' + hValues[0].Rate3 + '"><span>3</span></a></li>  <li><a href="#" value="2"  class="' + (2 <= full.Rating ? 'active' : '') + '" title="' + hValues[0].Rate2 + '"><span>2</span></a></li>  <li><a href="#" value="1"  class="' + (1 <= full.Rating ? 'active' : '') + '" title="' + hValues[0].Rate1 + '"><span>1</span></a></li></ul><input type="hidden" id="hdnRatings" value="' + full.Rating + '" name="hdnRatings" class="selectedRating"/></div>';

                    //        } else {
                    //            var setslider = '<div class="starRate" id="divKRAStars"><ul><li><a href="#" value="5"><span>5</span><b></b></a></li><li><a href="#" value="4"><span>4</span></a></li><li><a href="#" value="3"><span>3</span></a></li>  <li><a href="#" value="2"><span>2</span></a></li>  <li><a href="#" value="1"><span>1</span></a></li></ul><input type="hidden" id="hdnRatings" name="hdnRatings" class="selectedRating"/></div>';
                    //        }
                    //        return setslider;
                    //    }
                    //}
                    //},
                    //{
                    //    mData: "Feedback", "aTargets": [5],
                    //    mRender: function (data, type, full) {
                    //        if (full.Feedback != undefined) {
                    //            var setTestArea = '<textarea  type="text" id="txtFeedback"  name="Feedback"  class="form-control" maxlength="600"/>' + full.Feedback + '</textarea></div><input type="hidden" id="hdnKRAId" name="hdnKRAId" value="' + full.KRAId + "#" + full.FeedBackId + '"/>'
                    //            return setTestArea;
                    //        } else {
                    //            var setTestArea = '<textarea  type="text" id="txtFeedback"  name="Feedback"  class="form-control" maxlength="600"/></textarea></div><input type="hidden" id="hdnKRAId" name="hdnKRAId" value="' + full.KRAId + '"/>'
                    //            return setTestArea;

                    //        }
                    //    }
                    //}
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
                        $('#tblManagerFeedbackKRAList tbody tr').each(function (i, value) {

                            var FeedBack = TextAreaArray[i].Feedback;
                            var KRAId = TextAreaArray[i].KRAId;

                            if (FeedBack != undefined || FeedBack != null) {
                                $(this).after('<tr><td colspan="6"><span>RM feedback   <span id="txtfeedRemaining_' + KRAId + '"></div></span><textarea onkeyup="fnLimitFeedbackText(' + KRAId + ')" style="width:100%"  type="text" id="txtFeedback_' + KRAId + '"   name="Feedback"  class="form-control" maxlength="1200">' + FeedBack + '</textarea></div><input type="hidden" id="hdnKRAId" name="hdnKRAId" value="' + KRAId + "#" + TextAreaArray[i].FeedBackId + '"/></td></tr>');

                            } else {
                                $(this).after('<tr><td colspan="6"><span>RM feedback <span id="txtfeedRemaining_' + KRAId + '"> </div></span><textarea onkeyup="fnLimitFeedbackText(' + KRAId + ')" style="width:100%"  type="text" id="txtFeedback_' + KRAId + '"    name="Feedback"  class="form-control" maxlength="1200"></textarea></div><input type="hidden" id="hdnKRAId" name="hdnKRAId" value="' + KRAId + '"/></td></tr>');
                            }
                        });
                        
                        // Initialize Read More/Read Less handlers for Feedback screen
                        initializeReadMoreHandlersFeedback();

                    }, 500)
                }

            });

        }
    }
    function CreateKRASelfAssessmentTable(dataSet) {

        if (dataSet) {

            $('#tblEmployeeSelfassessmentList').show();
            
            var showSaActionPlan = selfAssessmentShowActionPlanFromCycle();
            if ($('#thSelfAssessmentActionPlan').length) {
                $('#thSelfAssessmentActionPlan').toggle(showSaActionPlan);
            }

            // Helper: build truncated HTML cell with Read More / Read Less (same pattern as KRAList)
            function buildReadMoreCell(htmlContent, kraId, prefix, wordThreshold) {
                var plainText = $('<div>').html(htmlContent || '').text().trim();
                if (!plainText) {
                    return '<span style="color:#999;">—</span>';
                }
                var words = plainText.split(/\s+/).filter(function (w) { return w.length > 0; });
                var wordCount = words.length;
                var uniqueId = prefix + '-' + kraId + '-' + Date.now();
                var escapedFull = escapeHtmlFeedback(htmlContent);
                var cssClass = prefix + '-content-sa';

                if (wordCount > wordThreshold) {
                    return '<div class="' + cssClass + ' ' + cssClass + '-wrap" data-id="' + uniqueId + '" data-full="' + escapedFull + '" data-wordcount="' + wordCount + '" data-truncated="true">' +
                               '<div class="truncated-content">' + htmlContent + '</div>' +
                               '<a href="#" class="read-more-link-sa" data-id="' + uniqueId + '">Read more</a>' +
                           '</div>';
                }
                return '<div class="' + cssClass + '-wrap" data-id="' + uniqueId + '" data-full="' + escapedFull + '" data-wordcount="' + wordCount + '" data-truncated="false">' +
                           htmlContent +
                       '</div>';
            }

            $('#tblEmployeeSelfassessmentList').DataTable({
                destroy: true,
                data: dataSet,
                ordering: false,
                aoColumns: [
                    // Goal Type - badge
                    {
                        mData: "GoalType",
                        width: "105px",
                        sWidth: "105px",
                        mRender: function (data) {
                            var t = (data || '').trim().toUpperCase();
                            var label, cls;
                            if (t === 'O' || t.indexOf('OPER') === 0) {
                                label = 'Operational'; cls = 'badge-operational';
                            } else if (t === 'D' || t.indexOf('DEV') === 0) {
                                label = 'Developmental'; cls = 'badge-developmental';
                            } else {
                                label = 'Strategic'; cls = 'badge-strategic';
                            }
                            return '<span class="goal-type-badge ' + cls + '">' + label + '</span>';
                        },
                        className: "text-left"
                    },

                    // Key Responsibility Area (KRA) - GoalDescription with Read More
                    {
                        mData: "GoalDescription",
                        mRender: function (data, type, full) {
                            return buildReadMoreCell(data, full.KRAId, 'goal-desc-sa', 10);
                        },
                        className: "text-left"
                    },

                    // Key Performance Indicators (KPIs) - Measure with Read More
                    {
                        mData: "Measure",
                        mRender: function (data, type, full) {
                            return buildReadMoreCell(data, full.KRAId, 'measure-sa', 10);
                        },
                        className: "text-left"
                    },

                    // Action Plan with Read More (column only for cycle year > 2025)
                    {
                        mData: "ActionPlan",
                        visible: showSaActionPlan,
                        mRender: function (data, type, full) {
                            return buildReadMoreCell(data, full.KRAId, 'action-plan-sa', 10);
                        },
                        className: "text-left"
                    },

                    // Weightage
                    {
                        mData: "Weightage",
                        width: "80px",
                        sWidth: "80px",
                        mRender: function (data) {
                            return '<div style="text-align:center;">' + (data || '—') + '</div>';
                        },
                        className: "text-center"
                    },

                    // Self-Assessment
                    {
                        mData: "Selfassesment",
                        mRender: function (data, type, full) {
                            if (data != null && data !== '') {
                                return '<div class="self-assessment-text">' + data + '</div>';
                            }
                            return '<span style="color:#999;">N/A</span>';
                        },
                        className: "text-left"
                    },

                    // Date
                    {
                        mData: "FeedbackDate",
                        width: "90px",
                        sWidth: "90px",
                        mRender: function (data) {
                            if (!data) { return '—'; }
                            var dt = new Date(data);
                            return '<div style="text-align:center; white-space:nowrap;">' + formatDate_DMY(dt) + '</div>';
                        },
                        className: "text-center"
                    }
                ],
                bFilter: false,
                paging: false,
                LengthChange: false,
                bInfo: false,
                autoWidth: false
            });

            // Wire up Read More / Read Less for this table
            initializeReadMoreHandlersFeedback();

            // ViewSelfAssessmentFeedback: EmployeeKRA (goal setting) trainings only — no manager-feedback block on this page
            if (typeof DashboardValue !== 'undefined' && DashboardValue == 2) {
                if (typeof appendKraGoalSettingConsolidatedTraining === 'function') {
                    appendKraGoalSettingConsolidatedTraining(dataSet, '#tblEmployeeSelfassessmentList');
                }
            }
        }
    }

    // Read More / Read Less handlers scoped to the self-assessment table
    function initializeReadMoreHandlersFeedback() {
        // Remove existing handlers to prevent duplicates
        $(document).off('click.saReadMore', '.read-more-link-sa');
        $(document).off('click.saReadMore', '.read-less-link-sa');

        // Read More — show full HTML content
        $(document).on('click.saReadMore', '.read-more-link-sa', function (e) {
            e.preventDefault();
            var uniqueId = $(this).data('id');
            var $wrap = $('[data-id="' + uniqueId + '"]').closest('[data-full]');
            if (!$wrap.length) { $wrap = $('[data-id="' + uniqueId + '"]'); }
            var fullHtml = unescapeHtmlFeedback($wrap.attr('data-full'));
            $wrap.html(
                fullHtml +
                '<a href="#" class="read-less-link-sa" data-id="' + uniqueId + '">Read less</a>'
            );
        });

        // Read Less — restore truncated view
        $(document).on('click.saReadMore', '.read-less-link-sa', function (e) {
            e.preventDefault();
            var uniqueId = $(this).data('id');
            var $wrap = $('[data-id="' + uniqueId + '"]').closest('[data-full]');
            if (!$wrap.length) { $wrap = $('[data-id="' + uniqueId + '"]'); }
            var fullHtml = unescapeHtmlFeedback($wrap.attr('data-full'));
            $wrap.html(
                '<div class="truncated-content">' + fullHtml + '</div>' +
                '<a href="#" class="read-more-link-sa" data-id="' + uniqueId + '">Read more</a>'
            );
        });
    }
}




function EditableCompetencySave() {
    CheckSessionTimeOut();
    var textflag = 0;
    var table = $('#tblFeedbackGivenCompetency').DataTable();
    var numero = $('#tblFeedbackGivenCompetency').dataTable().fnGetNodes().length;
    var vFeedback;
    var vKRAId;
    var FeedbackArray = [];
    var data = $('#tblFeedbackGivenCompetency').DataTable().rows().data();
    if ($(".checkbox_compentency").is(":checked") != true) {
        toastr.info('Please select atleast one row.');
        return false;
    }
    if (numero != 0) {
        $.each(arr, function (index, jsonFeedback) {
            var FeedBackId = jsonFeedback.split('#')[0];
            var QuestionaireId = jsonFeedback.split('#')[1];
            var ToEmployeeId = jsonFeedback.split('#')[2];
            var vFeedback = $('#' + FeedBackId).val()
            if (vFeedback == "") {
                textflag = 1;
                alert('Please give feedback for given Competency.');
                return false;
            }


            var EmployeeFeedback = {

                FromEmployeeId: sessionStorage.EmployeeId,
                ToEmployeeId: ToEmployeeId,
                AppraisalCycleId: sessionStorage.AppraisalCycleId,
                ActionTypeId: 1,
                Feedback: (vFeedback == undefined) ? "null" : vFeedback,
                FeedBackId: FeedBackId,
                IsIgnore: 1,
                QuestionaireId: QuestionaireId,
                AreaID: 1
            }
            FeedbackArray.push(EmployeeFeedback);

        })
        if (FeedbackArray.length > 0 && textflag != 1) {
            var svrPath = CONFIG.get('SERVERNAME');
            var apiPath = svrPath + '/Feedback/';
            var Result = CommonAjaxPOSTWithHeader(apiPath, FeedbackArray, CommonGetHeaderInfo());
            if (Result.Success) {
                toastr.success(Result.Result);
                window.location.reload();
                //$('a[href$="tab_feedbackgiven"]').click();
                //fnBindFeebackGivenCompetencyList();
            }
            else {
                toastr.error(Result.ErrorMessage);
            }
        }
        else if (vFeedback != "") {
            //  alert("Please select atleast one row.");
        }
        else { }
    }
}

function BindEmployeeBC() {
    CheckSessionTimeOut();
    var AppraisalCycleId = sessionStorage.AppraisalCycleId;
    var selectedyear = $('#ddlyearFeedback :selected').val();
    var empId = sessionStorage.EmployeeId;
    var EmployeeGradeID = 0;
    var EmployeeId = GToEmployeeId;
    var AreaID = 1;

    //?AppraisalCycleId=" + appraisalCycleId + "&ToEmployeeId=" + ToEmployeeId + "&StatusId=" + KRAStatusId;
    var svrPath = CONFIG.get('SERVERNAME');

    var apiPath = svrPath + "Feedback?AppraisalCycleId=" + AppraisalCycleId + "&ToEmployeeId=" + EmployeeId + "&FromEmployeeId=" + empId +
        "&ActionTypeId=1&ParentFeedBackId=" + 0 + "&AreaID=6&SelectedYear=" + selectedyear;
    var EmpBCDraftData = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    var apiPath1 = svrPath + "/GradeAreaQuestionMapping?AppraisalCycleId=" + AppraisalCycleId + "&EmployeeGradeID=" + EmployeeGradeID + "&EmployeeId=" + EmployeeId + "&AreaID=" + AreaID;
    var EmpBCData = CommonAjaxGET(apiPath1, CommonGetHeaderInfo());

    var newObj = [];
    if (EmpBCDraftData.responseJSON.Success == true) {
        EmpBCData.responseJSON.Result.forEach(function (data, index) {
            console.log(data.GradeAreaQuestionMappingID)
            var feedback1;
            //var feedback1 = EmpBCDraftData.responseJSON.Result.find(function (d) {
            //    return d.GradeQuestionMasterId == data.GradeAreaQuestionMappingID
            //})
            EmpBCDraftData.responseJSON.Result.forEach(function (d, index) {
                if (d.GradeQuestionMasterId == data.GradeAreaQuestionMappingID) {
                    feedback1 = d;
                }
            })
            data.Feedback = feedback1.Feedback
            data.FeedBackId = feedback1.FeedBackId
            data.Rating = feedback1.Rating
            newObj.push(data)
            console.log(feedback1.Feedback)
        });
        CreateBCTable(newObj);
    }
    else {
        if (EmpBCData.responseJSON.Result != null) {
            CreateBCTable(EmpBCData.responseJSON.Result);
        }
    }

    //var numero = $('#tblManagerFeedbackBCList').dataTable().fnGetNodes().length;
    //if (numero.length == 0 || numero.length == undefined) {
    //    $('#btnSaveDraft').hide();
    //}
    //else {
    //    $('#btnSaveDraft').show();
    //}
    function CreateBCTable(dataSet) {

        $('#tblManagerFeedbackBCList').show();
        $('#tblManagerFeedbackBCList').DataTable({
            destroy: true,
            data: dataSet,
            // dataDraft:EmpBCDraftData.responseJSON.Result,
            aoColumns: [
                {
                    mRender: function (data, type, full) {
                        var setslider = '<div>' + full.Question + '</div><input type="hidden" id="hdnQuestionaireId" name="hdnQuestionaireId" value="' + full.QuestionaireId + '"/>';
                        return setslider;
                    }
                },
                {
                    mRender: function (data, type, full) {

                        var setslider = '<div id="DivExpectedPoint" class="starRate"><ul>';

                        if (full.ExpectedPoint == '5')
                            setslider = setslider + '<li> <a href="#" value="5" class="active"><span>5</span></a></li>';
                        else
                            setslider = setslider + '<li> <a href="#"  value="5"><span>5</span></a></li>';

                        if (full.ExpectedPoint == '4')
                            setslider = setslider + '<li><a href="#" value="4" class="active"><span>4</span></a></li>';
                        else
                            setslider = setslider + '<li><a href="#" value="4"><span>4</span></a></li>';

                        if (full.ExpectedPoint == '3') {
                            setslider = setslider + '<li><a href="#" value="3"class="active"><span>3</span></a></li>';
                        }
                        else
                            setslider = setslider + '<li><a href="#" value="3"><span>3</span></a></li>';

                        if (full.ExpectedPoint == '2') {
                            setslider = setslider + '<li><a href="#"  class="active" value="2"><span>2</span></a></li>';
                        }
                        else
                            setslider = setslider + '<li><a href="#" value="2"><span>2</span></a></li>';

                        if (full.ExpectedPoint == '1')
                            setslider = setslider + '<li><a href="#"  class="active" value="1"><span>1</span></a></li>';
                        else
                            setslider = setslider + '<li><a href="#" value="1"><span>1</span></a></li>';


                        setslider = setslider + '</ul><input type="hidden" id="hdnExpected" name="hdnExpected" value=' + full.ExpectedPoint + '/></div>';


                        return setslider;
                    }
                },
                {

                    mRender: function (data, type, full) {
                        if (full.Feedback != null || full.Feedback == null) {
                            var setslider = '<div class="starRate" id="divBCStars"><ul><li><a href="#" value="5"  class="' + (5 <= full.Rating ? 'active' : '') + '" title= "' + full.Rate5 + '"><span>5</span><b></b></a></li><li><a href="#" value="4"  class="' + (4 <= full.Rating ? 'active' : '') + '" title= "' + full.Rate4 + '"><span>4</span></a></li><li><a href="#" value="3"  class="' + (3 <= full.Rating ? 'active' : '') + '" title= "' + full.Rate3 + '"><span>3</span></a></li>  <li><a href="#" value="2"  class="' + (2 <= full.Rating ? 'active' : '') + '" title= "' + full.Rate2 + '"><span>2</span></a></li>  <li><a href="#" value="1"  class="' + (1 <= full.Rating ? 'active' : '') + '"  title= "' + full.Rate1 + '"><span>1</span></a></li></ul><input type="hidden" id="hdnActual" value="' + full.Rating + '" name="hdnActual" class="selectedRating"/></div>';
                            return setslider;
                        } else {
                            var setslider = '<div class="starRate" id="divBCStars"><ul><li><a href="#" value="5" title= "' + full.Rate5 + '"><span>5</span><b></b></a></li><li><a href="#" value="4" title= "' + full.Rate4 + '"><span>4</span></a></li><li><a href="#" value="3" title= "' + full.Rate3 + '"><span>3</span></a></li>  <li><a href="#" value="2" title= "' + full.Rate2 + '"><span>2</span></a></li>  <li><a href="#" value="1" title= "' + full.Rate1 + '"><span>1</span></a></li></ul><input type="hidden" id="hdnActual" name="hdnActual" class="selectedRating"/></div>';
                            return setslider;
                        }
                    }
                },
                {
                    mRender: function (data, type, full) {

                        if (full.Feedback != null) {
                            var setTestArea = '<textarea  type="text" id="' + full.GradeAreaQuestionMappingID + '" name="Feedback"   class="form-control" rows="4" maxlength="800"/>' + full.Feedback + '</textarea></div><input type="hidden" id="hdnGradeAreaQuestionMappingID" name="hdnGradeAreaQuestionMappingID" value="' + full.GradeAreaQuestionMappingID + "#" + full.FeedBackId + '"/>'
                            return setTestArea;
                        }
                        else {

                            var setTestArea = '<textarea  type="text" id="' + full.GradeAreaQuestionMappingID + '" name="Feedback"   class="form-control" rows="4" maxlength="800"/></textarea></div><input type="hidden" id="hdnGradeAreaQuestionMappingID" name="hdnGradeAreaQuestionMappingID" value="' + full.GradeAreaQuestionMappingID + '"/>'
                            return setTestArea;

                        }
                    }
                }
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {

                $('#DivExpectedPoint a', nRow).each(function (index, item) {
                    if (item.text <= aData.ExpectedPoint) {
                        $(item).addClass('active');
                    }
                });
            },
            order: [[2, "desc"], [1, "asc"]], //order by Goal type, Sequence
            bFilter: false,  //removes search filter
            paging: false,  //removes paging header footer
            LengthChange: false, //removes shwoing entries
            bInfo: false,

        });
    }
}

function SaveBC() {
    var flag = 0;
    var ddlPerformycle = $('#ddlyearFeedback :selected').val();
    CheckSessionTimeOut();
    var ToEmployeeId = GToEmployeeId;
    var table = $('#tblManagerFeedbackBCList').DataTable();
    var numero = $('#tblManagerFeedbackBCList').dataTable().fnGetNodes().length;
    var vFeedback;
    var vKRAId;
    var FeedbackArray = [];
    var data = $('#tblManagerFeedbackBCList').DataTable().rows().data();
    if (numero != 0) {
        for (i = 1; i <= numero; i++) {
            vQuestionaireId = $($('table tr:nth-child(' + i + ') td:nth-child(1) input:hidden')).val();
            GradeAreaQuestionMappingID = $($('table tr:nth-child(' + i + ') td:nth-child(4) input:hidden')).val();
            vFeedback = $($('table tr:nth-child(' + i + ') td:nth-child(4) textarea')).val();
            vRating = $($('table tr:nth-child(' + i + ') td:nth-child(3) div:nth-child(1) input:hidden')).val();
            if (vFeedback == "" || vRating == 0) {
                flag = 1;
            }
            if (vFeedback == "") {
                vFeedback = null
            }
            if (vRating == 0 || vRating == null || vRating != '' || vRating == "null") {
                vRating = null;
            }
            $.each(data, function (index, jsonFeedback) {
                if (jsonFeedback.QuestionaireId == vQuestionaireId) {
                    var EmployeeFeedback = {
                        FeedBackId: 0,
                        AppraisalCycleId: sessionStorage.AppraisalCycleId,
                        FromEmployeeId: sessionStorage.EmployeeId,
                        ToEmployeeId: ToEmployeeId,
                        ActionTypeId: 1,
                        AreaID: 1,
                        GradeAreaQuestionMappingID: jsonFeedback.GradeAreaQuestionMappingID,
                        QuestionaireId: jsonFeedback.QuestionaireId,
                        Feedback: vFeedback,
                        Rating: vRating,
                        PerformCycleCheck: ddlPerformycle
                    }
                    FeedbackArray.push(EmployeeFeedback);
                }
            });

        }
    }

    if (FeedbackArray.length == 0) {
        alert("Please give feedback atleast one Competency.");
        return false;
    }
    else {
        // return false;
    }
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + '/ManagerFeedback/';

    if (FeedbackArray.length > 0) {
        var Result = CommonAjaxPOST_Array(apiPath, FeedbackArray, CommonGetHeaderInfo());
        if (Result.Success) {
            toastr.success('Feedback submitted !');
            $('#tblManagerFeedbackBCList td textarea').val(' ');
            $('#divBCStars a').removeClass('active');
        }
        else {
            toastr.error(Result.ErrorMessage);
        }
    }

}
function SaveKRA() {
    $('#btnSubmitKRA').prop('disabled', true);
    var ddlPerformycle = $('#ddlyearFeedback :selected').val();
    CheckSessionTimeOut();
    var flagKRA = 0;
    var ToEmployeeId = GToEmployeeId;
    var SkipLevelManagerID = sessionStorage.ManagerEmpId;
    var table = $('#tblManagerFeedbackKRAList').DataTable();
    var numero = $('#tblManagerFeedbackKRAList').dataTable().fnGetNodes().length;
    var vFeedback;
    var vKRAId;
    var arrGoalsObj;
    var FeedbackArray1 = [];
    var data = $('#tblManagerFeedbackKRAList').DataTable().rows().data();

    var m = 0;
    var n = 0;
    var p = 1;
    if (numero != 0) {
        for (i = 1; i <= numero; i++) {
            m = p;
            n = i + i;

            arrGoalsObj = $($('table tr:nth-child(' + n + ') input:hidden')).val();
            //arrGoalsObj = $($('table tr:nth-child(' + i + ') td:nth-child(7) input:hidden')).val();
            vKRAId = (arrGoalsObj).split('#')[0];
            vFeedback = $($('table tr:nth-child(' + n + ') textArea')).val();
            //vFeedback = $($('table tr:nth-child(' + i + ') td:nth-child(7) textArea')).val();
            //vRating = $($('table tr:nth-child(' + m + ') td:nth-child(6) div:nth-child(1) input:hidden')).val();
            vRating = null;
            if (vFeedback == "") {
                flagKRA = 1;
                toastr.error("Please give feedback for all Goals & Objectives.");
                $('#btnSubmitKRA').prop('disabled', false);
                return false;
            }
            if (vRating == 0 || vRating == null || vRating == "null") {
                vRating = null;
            }
            n = 0;
            p = p + 2;
            if (vFeedback != '') {
                $.each(data, function (index, jsonFeedback) {
                    if (jsonFeedback.KRAId == vKRAId) {
                        var EmployeeFeedback = {
                            FeedBackId: 0,
                            AppraisalCycleId: ddlAppCycle,
                            FromEmployeeId: sessionStorage.EmployeeId,
                            ToEmployeeId: ToEmployeeId,
                            ActionTypeId: 1,
                            AreaID: 2,
                            QuestionaireId: jsonFeedback.KRAId,
                            Feedback: vFeedback,
                            Rating: vRating,
                            PerformCycleCheck: ddlPerformycle
                        }
                        FeedbackArray1.push(EmployeeFeedback);
                    }
                });
            }

        }
        //$('#btnSend').prop('disabled', true);
    }
    if (FeedbackArray1.length > 0 && flagKRA != 1) {
        var svrPath = CONFIG.get('SERVERNAME');
        
        // Set StatusID to indicate this is final submission (not draft)
        // StatusID != 100 means it's a final submission
        for (var i = 0; i < FeedbackArray1.length; i++) {
            FeedbackArray1[i].StatusID = null; // or any value != 100 to indicate final submission
        }

        // First, try to delete draft feedback if exists (optional - don't fail if it doesn't exist)
        // Use the same pattern as other API calls in this file
        try {
            var apiPathDraftDelete = svrPath + 'ManagerFeedback/DraftDelete';
            var DraftDeleteResult = CommonAjaxPOST_Array(apiPathDraftDelete, FeedbackArray1, CommonGetHeaderInfo());
            // Continue even if draft delete fails - it's optional
            // Only log if there's an actual error response
            if (DraftDeleteResult && DraftDeleteResult.responseJSON && !DraftDeleteResult.responseJSON.Success) {
                console.log('Draft delete returned error (continuing anyway):', DraftDeleteResult.responseJSON.ErrorMessage);
            }
        } catch (e) {
            // Ignore errors from draft delete - it's optional
            console.log('Draft delete failed or not needed (continuing anyway):', e);
        }

        // Then, insert final feedback
        var apiPath = svrPath + 'ManagerFeedback/SubmitUpdateFeedback';
        var Result = CommonAjaxPOST_Array(apiPath, FeedbackArray1, CommonGetHeaderInfo());

        // Handle response - check if it's a direct result or wrapped in responseJSON
        var finalResult = Result;
        if (Result && Result.responseJSON) {
            finalResult = Result.responseJSON;
        }

        if (finalResult && finalResult.Success) {
            toastr.success('Feedback Submitted!');
            $('#btnSend').prop('disabled', false);
            $('#tblManagerFeedbackKRAList td textarea').val(" ");
            $('#divKRAStars a').removeClass('active');
            // Email notification on feedback submit disabled — mail content was inaccurate
            var url = "/Dashboard/Index"
            window.location.href = url;
        }
        else {
            var errorMsg = 'Error while submitting feedback. Please try again.';
            if (finalResult && finalResult.ErrorMessage) {
                errorMsg = finalResult.ErrorMessage;
            } else if (Result && Result.status && Result.status >= 400) {
                errorMsg = 'Server error: ' + (Result.statusText || 'Please try again.');
            }
            toastr.error(errorMsg);
            $('#btnSubmitKRA').prop('disabled', false);
        }
    }
    else {
        //alert("Please give feedback for all Goals & Objectives.");
        $('#btnSubmitKRA').prop('disabled', false);
    }


    return flag = (flagKRA == 1) ? '1' : '0';

}
function fnShowFeedbackOtherModal() {

    var url = $('#feedbackOtherModal').data('url');

    $.get(url, function (data) {
        $('#feedbackOtherContent').html(data);
        fnBindMyFeebackOtherList();
        $('#feedbackOtherModal').modal({
            show: true,
            keyboard: false,
            backdrop: 'static'
        });
    });
}

function fnBindMyFeebackOtherList() {
    CheckSessionTimeOut();
    var empId = sessionStorage.EmployeeId;
    var ToEmployeeId = GToEmployeeId;
    var apraisalCycleId = sessionStorage.AppraisalCycleId;
    var token = sessionStorage.TokenValue;
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Feedback?AppraisalCycleId=" + apraisalCycleId + "&ToEmployeeId=" + ToEmployeeId + "&FromEmployeeId=0&ActionTypeId=1";
    CommonAjaxGET(apiPath, CommonGetHeaderInfo()).done(function (feedbackData) {
        if (feedbackData.Success == false) {
            console.log("BindMyFeebackOtherList-" + feedbackData.ErrorCode + " " + feedbackData.ErrorMessage);
        }

        $("#tblMyFeedbackOther").DataTable({
            data: feedbackData.Result,
            "bPaginate": true,
            "bFilter": false,
            "bInfo": false,
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
                { mData: "FromName" },
                { mData: "Feedback" }

            ]
        });
        $('#tblMyFeedbackOther td:nth-child(3), #tblMyFeedbackOther th:nth-child(3)').hide();
    });
}

//by sourabh
function BindPreviousRM() {

    $("#ddlPreviousRMs option").remove();
    $("#ddlPreviousRMs").append($("<option></option>").val('0').html('---Select---'));

    var EmployeeId = GToEmployeeId;
    if (!EmployeeId || EmployeeId == 0) {
        return;
    }
    var svrPath = CONFIG.get('SERVERNAME');
    // Explicit route (attribute routing): api/ManagerFeedback/PreviousRMsByEmployee
    var apiPath = svrPath + "ManagerFeedback/PreviousRMsByEmployee?EmployeeId=" + EmployeeId;

    EmpBCData = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    if (EmpBCData.responseJSON.Success == true) {
        $("#aPreviousRMFeedback").css("display", "block");
        var data = EmpBCData.responseJSON.Result;

        $.each(data, function (index, value) {
            $("#ddlPreviousRMs").append($("<option></option>").val((data[index].EmployeeId)).html(data[index].EmployeeName));
        })
    }
}

function onDdlPreviousRMsChange() {
    var selectedRM = $('#ddlPreviousRMs').val();
    if (!selectedRM || selectedRM === '0') {
        $('#tblFeedbackGivenKRA').DataTable().clear().draw();
        return;
    }

    if (typeof window.showManagerFeedbackPageLoader === 'function') {
        window.showManagerFeedbackPageLoader('Loading feedback...');
    }

    setTimeout(function () {
        fnBindFeebackGivenKRAList();
        if ($('#pnlCompetencyFeedbackGiven').is(':visible')) {
            fnBindFeebackGivenCompetencyList();
        }
        if (typeof window.hideManagerFeedbackPageLoader === 'function') {
            window.hideManagerFeedbackPageLoader();
        }
    }, 30);
}

// Helper function to escape HTML for Feedback screen
function escapeHtmlFeedback(text) {
    if (!text) return '';
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Helper function to unescape HTML for Feedback screen
function unescapeHtmlFeedback(text) {
    if (!text) return '';
    var map = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'"
    };
    return text.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, function(m) { return map[m]; });
}

// Initialize Read More/Read Less handlers for Feedback screen
function initializeReadMoreHandlersFeedback() {
    // Remove existing handlers to prevent duplicates
    $(document).off('click', '.read-more-link-fb');
    $(document).off('click', '.read-less-link-fb');
    
    // Handle Read More click
    $(document).on('click', '.read-more-link-fb', function(e) {
        e.preventDefault();
        var $link = $(this);
        var $container = $link.closest('.measure-content-fb, .selfassess-content-fb');
        var fullText = unescapeHtmlFeedback($container.attr('data-full'));
        var uniqueId = $container.attr('data-id');
        
        // Replace content with full text and Read Less link
        $container.html(fullText + ' <a href="#" class="read-less-link-fb" data-id="' + uniqueId + '" style="color: #337ab7; text-decoration: underline; cursor: pointer;">Read less</a>');
    });
    
    // Handle Read Less click
    $(document).on('click', '.read-less-link-fb', function(e) {
        e.preventDefault();
        var $link = $(this);
        var $container = $link.closest('.measure-content-fb, .selfassess-content-fb');
        var fullText = unescapeHtmlFeedback($container.attr('data-full'));
        var uniqueId = $container.attr('data-id');
        var wordCount = parseInt($container.attr('data-wordcount')) || 0;
        
        if (wordCount > 10) {
            // Count words
            var words = fullText.split(/\s+/).filter(function(word) { return word.length > 0; });
            var truncatedWords = words.slice(0, 10).join(' ');
            
            // Replace content with truncated text and Read More link
            $container.html(truncatedWords + '... <a href="#" class="read-more-link-fb" data-id="' + uniqueId + '" data-full="' + escapeHtmlFeedback(fullText) + '" style="color: #337ab7; text-decoration: underline; cursor: pointer;">Read more</a>');
        } else {
            $container.html(fullText);
        }
    });
}

//Following function is used to bind the KRA list for employee (_FeedbackGivenKRA.cshtml)
// Handle R&R and Training Status Modal
$(document).ready(function() {
    $(document).off('click', '#lnkViewRRAndTraining');
    $(document).on('click', '#lnkViewRRAndTraining', function() {
        $('#modalRRAndTraining').modal('show');
        
        // Activate Training tab by default
        $('#modalRRAndTraining').on('shown.bs.modal', function() {
            // Remove active class from all tabs and tab panes
            $('#modalRRAndTraining .nav-tabs li').removeClass('active');
            $('#modalRRAndTraining .tab-pane').removeClass('active');
            
            // Activate Training tab
            $('a[href="#tabTrainingStatus"]').parent('li').addClass('active');
            $('#tabTrainingStatus').addClass('active');
            
            // Load Training Status data by default
            LoadTrainingStatusData();
        });
        
        // Load R&R data when R&R tab is clicked
        $('a[href="#tabRR"]').off('shown.bs.tab').on('shown.bs.tab', function() {
            LoadRRData();
        });
        
        // Load Training Status when Training tab is clicked
        $('a[href="#tabTrainingStatus"]').off('shown.bs.tab').on('shown.bs.tab', function() {
            LoadTrainingStatusData();
        });
    });
});

// Function to load R&R (Rewards and Recognitions) data
function LoadRRData() {
    try {
        //var appraisalCycleId = sessionStorage.AppraisalCycleId || ddlAppCycleId || 0;
        var appraisalCycleId = ddlAppCycleId || 0;
        
        // Extract NewEmployeeCode from EmployeeName span (after "-" symbol)
        var employeeNameText = $('#EmployeeName').text().trim();
        var newEmployeeCode = '';
        
        if (employeeNameText && employeeNameText.indexOf('-') !== -1) {
            // Get text after the "-" symbol
            var parts = employeeNameText.split('-');
            if (parts.length > 1) {
                // Take everything after the first "-" and trim trailing spaces
                newEmployeeCode = parts.slice(1).join('-').trim();
            }
        }
        
        if (!newEmployeeCode || newEmployeeCode === '') {
            $('#tblRRList tbody').html('<tr><td colspan="4" style="text-align:center; padding:20px;">Employee code not available. Please check EmployeeName format.</td></tr>');
            return;
        }
        
        // Get R&R data using NewEmployeeCode
        var svrPath = CONFIG.get('SERVERNAME');
        var headerInfo = CommonGetHeaderInfo();
        var apiPath = svrPath + 'Rating/GetEmployeeAspireAwards?NewEmployeeCode=' + encodeURIComponent(newEmployeeCode) + '&AppraisalCycleId=' + appraisalCycleId;
        
        // Show loading
        $('#tblRRList tbody').html('<tr><td colspan="4" style="text-align:center; padding:20px;">Loading...</td></tr>');
        
        var response = CommonAjaxGET(apiPath, headerInfo);
        
        response.done(function(data) {
            // Destroy existing DataTable if it exists
            if ($.fn.DataTable.isDataTable('#tblRRList')) {
                $('#tblRRList').DataTable().destroy();
            }
            
            $('#tblRRList tbody').empty();
            
            var tableData = [];
            if (data && data.Success && data.Result && data.Result.length > 0) {
                $.each(data.Result, function (index, item) {
                    
                    tableData.push([
                        (index + 1),
                        (item.AwardName || 'N/A'),
                        (item.AwardType || 'N/A'),                       
                        (item.Month && item.Year ? item.Month + ' ' + item.Year : 'N/A')
                        //,
                        //(item.Description || 'N/A')
                    ]);
                });
            }
            
            if (tableData.length > 0) {
                // Initialize DataTable
                $('#tblRRList').DataTable({
                    data: tableData,
                    destroy: true,
                    paging: true,
                    searching: true,
                    ordering: true,
                    info: true,
                    pageLength: 10,
                    columns: [
                        { title: "Sr. No." },
                        { title: "Award Name" },
                        { title: "Award Type" },
                        { title: "Award Date" }
                    ]
                });
            } else {
                $('#tblRRList tbody').html('<tr><td colspan="4" style="text-align:center; padding:20px;">No Recognition Received</td></tr>');
            }
        }).fail(function(error) {
            console.error('Error loading R&R data:', error);
            $('#tblRRList tbody').html('<tr><td colspan="4" style="text-align:center; padding:20px; color:red;">Error loading data. Please try again.</td></tr>');
        });
    } catch (error) {
        console.error('Error in LoadRRData:', error);
        $('#tblRRList tbody').html('<tr><td colspan="4" style="text-align:center; padding:20px; color:red;">Error loading data</td></tr>');
    }
}

// Function to load Training Status data
function LoadTrainingStatusData() {
    try {
        debugger
        //var appraisalCycleId = sessionStorage.AppraisalCycleId || ddlAppCycleId || 0;
        var appraisalCycleId = ddlAppCycleId || 0;
        
        if (!appraisalCycleId || appraisalCycleId === 0) {
            $('#tblTrainingStatusList tbody').html('<tr><td colspan="7" style="text-align:center; padding:20px;">Appraisal Cycle not available</td></tr>');
            return;
        }
        
        // Extract NewEmployeeCode from EmployeeName span (after "-" symbol)
        var employeeNameText = $('#EmployeeName').text().trim();
        var newEmployeeCode = '';
        
        if (employeeNameText && employeeNameText.indexOf('-') !== -1) {
            // Get text after the "-" symbol
            var parts = employeeNameText.split('-');
            if (parts.length > 1) {
                // Take everything after the first "-" and trim trailing spaces
                newEmployeeCode = parts.slice(1).join('-').trim();
            }
        }
        
        if (!newEmployeeCode || newEmployeeCode === '') {
            $('#tblTrainingStatusList tbody').html('<tr><td colspan="7" style="text-align:center; padding:20px;">Employee code not available. Please check EmployeeName format.</td></tr>');
            return;
        }
        
        var svrPath = CONFIG.get('SERVERNAME');
        var headerInfo = CommonGetHeaderInfo();
        
        // Use new API endpoint for DailyTrainingsData
        var apiPath = svrPath + 'Reports/GetTrainingStatusFromDailyTrainingsData?AppraisalCycleId=' + appraisalCycleId + '&NewEmployeeCode=' + encodeURIComponent(newEmployeeCode);
        
        // Show loading
        $('#tblTrainingStatusList tbody').html('<tr><td colspan="7" style="text-align:center; padding:20px;">Loading...</td></tr>');
        
        var response = CommonAjaxGET(apiPath, headerInfo);
        
        response.done(function(data) {
            $('#tblTrainingStatusList tbody').empty();
            
            var trainingData = null;
            if (data && data.responseJSON) {
                if (data.responseJSON.Result && Array.isArray(data.responseJSON.Result)) {
                    trainingData = data.responseJSON.Result;
                } else if (data.responseJSON.Result && data.responseJSON.Result.data && Array.isArray(data.responseJSON.Result.data)) {
                    trainingData = data.responseJSON.Result.data;
                }
            } else if (data && data.Result && Array.isArray(data.Result)) {
                trainingData = data.Result;
            } else if (Array.isArray(data)) {
                trainingData = data;
            }
            
            // Destroy existing DataTable if it exists
            if ($.fn.DataTable.isDataTable('#tblTrainingStatusList')) {
                $('#tblTrainingStatusList').DataTable().destroy();
            }
            
            $('#tblTrainingStatusList tbody').empty();
            
            var tableData = [];
            if (trainingData && trainingData.length > 0) {
                $.each(trainingData, function(index, item) {
                    // Get progress percentage from ProgressPercentage (fixed field name)
                    var progressPercentage = 'N/A';
                    if (item.ProgressPercentage !== null && item.ProgressPercentage !== undefined && item.ProgressPercentage !== '') {
                        var progressValue = item.ProgressPercentage.toString().trim();
                        // Remove % if already present
                        if (progressValue.endsWith('%')) {
                            progressValue = progressValue.substring(0, progressValue.length - 1);
                        }
                        // Handle 0% correctly
                        if (progressValue !== '' && !isNaN(progressValue)) {
                            var numValue = parseFloat(progressValue);
                            if (numValue >= 0 && numValue <= 100) {
                                progressPercentage = numValue + '%';
                            } else {
                                progressPercentage = item.ProgressPercentage.toString();
                            }
                        } else if (progressValue === '0' || progressValue === 0) {
                            progressPercentage = '0%';
                        } else {
                            progressPercentage = item.ProgressPercentage.toString();
                        }
                    }
                    
                    // Get learning status (Status column removed, only Learning Status shown)
                    var learningStatus = item.LearningStatus || item.Status || 'N/A';
                    
                    // Format CreatedDate consistently
                    var createdDate = 'N/A';
                    if (item.CreatedDate && item.CreatedDate !== 'N/A' && item.CreatedDate !== '') {
                        try {
                            var createdDateObj = new Date(item.CreatedDate);
                            if (!isNaN(createdDateObj.getTime())) {
                                createdDate = formatDate_DMY(createdDateObj);
                            } else {
                                createdDate = item.CreatedDate;
                            }
                        } catch (e) {
                            createdDate = item.CreatedDate;
                        }
                    }

                    // Format CompletionDate (new column) - show "-" if not completed
                    var completionDate = '-';
                    if (item.CompletionDate && item.CompletionDate !== '' && item.CompletionDate !== 'N/A') {
                        try {
                            var completionDateObj = new Date(item.CompletionDate);
                            if (!isNaN(completionDateObj.getTime())) {
                                completionDate = formatDate_DMY(completionDateObj);
                            } else {
                                completionDate = item.CompletionDate;
                            }
                        } catch (e2) {
                            completionDate = item.CompletionDate;
                        }
                    }
                    
                    // Columns: TrainingType, TrainingName, Progress, LearningStatus, RequestedBy, CreatedDate, CompletionDate
                    tableData.push([
                        (item.TrainingType || 'N/A'),
                        (item.TrainingName || 'N/A'),
                        progressPercentage,
                        learningStatus,
                        (item.RequestedBy || 'N/A'),
                        createdDate,
                        completionDate
                    ]);
                });
            }
            
            if (tableData.length > 0) {
                // Initialize DataTable with new Completion Date column
                $('#tblTrainingStatusList').DataTable({
                    data: tableData,
                    destroy: true,
                    paging: true,
                    searching: true,
                    ordering: true,
                    info: true,
                    pageLength: 10,
                    columns: [
                        { title: "Training Type" },
                        { title: "Training Name" },
                        { title: "Progress Percentage" },
                        { title: "Learning Status" },
                        { title: "Requested From" },
                        { title: "Created Date" },
                        { title: "Completion Date" }
                    ]
                });
            } else {
                $('#tblTrainingStatusList tbody').html('<tr><td colspan="7" style="text-align:center; padding:20px;">No training data available</td></tr>');
            }
        }).fail(function(error) {
            console.error('Error loading Training Status data:', error);
            $('#tblTrainingStatusList tbody').html('<tr><td colspan="6" style="text-align:center; padding:20px; color:red;">Error loading data. Please try again.</td></tr>');
        });
    } catch (error) {
        console.error('Error in LoadTrainingStatusData:', error);
        $('#tblTrainingStatusList tbody').html('<tr><td colspan="7" style="text-align:center; padding:20px; color:red;">Error loading data</td></tr>');
    }
}

// Helper function to escape HTML for Feedback screen
function escapeHtmlFeedback(text) {
    if (!text) return '';
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Helper function to unescape HTML for Feedback screen
function unescapeHtmlFeedback(text) {
    if (!text) return '';
    var map = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'"
    };
    return text.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, function(m) { return map[m]; });
}

// Initialize Read More/Read Less handlers for Feedback screen
function initializeReadMoreHandlersFeedback() {
    // Remove existing handlers to prevent duplicates
    $(document).off('click', '.read-more-link-fb');
    $(document).off('click', '.read-less-link-fb');
    
    // Handle Read More click
    $(document).on('click', '.read-more-link-fb', function(e) {
        e.preventDefault();
        var $link = $(this);
        var $container = $link.closest('.measure-content-fb, .selfassess-content-fb');
        var fullText = unescapeHtmlFeedback($container.attr('data-full'));
        var uniqueId = $container.attr('data-id');
        
        // Replace content with full text and Read Less link
        $container.html(fullText + ' <a href="#" class="read-less-link-fb" data-id="' + uniqueId + '" style="color: #337ab7; text-decoration: underline; cursor: pointer;">Read less</a>');
    });
    
    // Handle Read Less click
    $(document).on('click', '.read-less-link-fb', function(e) {
        e.preventDefault();
        var $link = $(this);
        var $container = $link.closest('.measure-content-fb, .selfassess-content-fb');
        var fullText = unescapeHtmlFeedback($container.attr('data-full'));
        var uniqueId = $container.attr('data-id');
        var wordCount = parseInt($container.attr('data-wordcount')) || 0;
        
        if (wordCount > 10) {
            // Count words
            var words = fullText.split(/\s+/).filter(function(word) { return word.length > 0; });
            var truncatedWords = words.slice(0, 10).join(' ');
            
            // Replace content with truncated text and Read More link
            $container.html(truncatedWords + '... <a href="#" class="read-more-link-fb" data-id="' + uniqueId + '" data-full="' + escapeHtmlFeedback(fullText) + '" style="color: #337ab7; text-decoration: underline; cursor: pointer;">Read more</a>');
        } else {
            $container.html(fullText);
        }
    });
}

function fnBindFeebackGivenKRAList() {

    var previousRM = $('#ddlPreviousRMs').val();
    var EmployeeId = GToEmployeeId;
    var empId = sessionStorage.EmployeeId;
    //var apraisalCycleId = sessionStorage.AppraisalCycleId;
    var apraisalCycleId = ddlAppCycle;
    var token = sessionStorage.TokenValue;
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };
    var svrPath = CONFIG.get('SERVERNAME');
    // Issue 34: Must use api/ManagerFeedback/PreviousRMFeedback (6 params). Plain api/ManagerFeedback?... does not match any route → 404.
    var apiPath = svrPath + "ManagerFeedback/PreviousRMFeedback?AppraisalCycleId=" + apraisalCycleId + "&ToEmployeeId=" + EmployeeId + "&FromEmployeeId=" + previousRM +
        "&ActionTypeId=1&ParentFeedBackId=" + 0 + "&AreaID=2";
    CommonAjaxGET(apiPath, headerInfo).done(function (kraData) {

        if (kraData.Success == false) {
            console.log("fnBindFeebackGivenKRAList-" + kraData.ErrorCode + " " + kraData.ErrorMessage);
        }
        //$("#tblFeedbackGivenKRA").html('<thead><tr><th>To Employee</th><th>Goals</th><th>Feedback</th><th>Date</th><th>View</th></tr></thead><tbody></tbody>');
        $("#tblFeedbackGivenKRA").html('<thead><tr><th>To Employee</th><th>Goals</th><th>Feedback</th><th>Date</th></tr></thead><tbody></tbody>');
        $("#tblFeedbackGivenKRA").DataTable({
            data: (kraData && kraData.Result) ? kraData.Result : [],
            destroy: true,
            "bPaginate": true,
            "bFilter": true,
            "bInfo": false,
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
                { mData: "ToEmployeeName" },
                { mData: "Question" },
                { mData: "Feedback" },
                {
                    mData: "FeedbackDate", "render": function (data, type, row, meta) {
                        var dt = new Date(data);
                        return formatDate_DMY(dt);
                    }
                },
                //{
                //    "render": function (data, type, row, meta) {
                //        var button = fnGetButtonHTML(row);
                //        return button;
                //    }
                //}
            ]
            ,
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                if ((aData.IsSeen == "0") && (aData.LastFeedbackGivenBy != sessionStorage.EmployeeId)) { // display unread messages in green color
                    //$('td', nRow).addClass('UnreadMessage');
                }

            }
        });

        if (typeof renderFeedbackGivenConsolidatedTraining === 'function') {
            var rows = (kraData && kraData.Result) ? kraData.Result : [];
            renderFeedbackGivenConsolidatedTraining(EmployeeId, rows);
        }

    });
}

function fnBindFeebackGivenCompetencyList() {
    var previousRM = $('#ddlPreviousRMs').val();
    var EmployeeId = GToEmployeeId;
    var empId = sessionStorage.EmployeeId;
    var apraisalCycleId = sessionStorage.AppraisalCycleId;
    var token = sessionStorage.TokenValue;
    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "ManagerFeedback/PreviousRMFeedback?AppraisalCycleId=" + apraisalCycleId + "&ToEmployeeId=" + EmployeeId + "&FromEmployeeId=" + previousRM +
        "&ActionTypeId=1&ParentFeedBackId=" + 0 + "&AreaID=1";

    CommonAjaxGET(apiPath, headerInfo).done(function (kraData) {

        if (kraData.Success == false) {
            console.log("fnBindFeebackGivenCompetencyList-" + kraData.ErrorCode + " " + kraData.ErrorMessage);
            var table = $('#tblFeedbackGivenCompetency').DataTable();

            table.clear();
        }
        $("#tblFeedbackGivenCompetency").html('<thead><tr><th>To Employee</th><th>Goals</th><th>Feedback</th><th>Date</th><th>View</th></tr></thead><tbody></tbody>');

        $("#tblFeedbackGivenCompetency").DataTable({
            data: (kraData && kraData.Result) ? kraData.Result : [],
            destroy: true,
            "bPaginate": true,
            "bFilter": true,
            "bInfo": false,
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
                { mData: "ToEmployeeName" },
                { mData: "Question" },
                { mData: "Feedback" },
                {
                    mData: "FeedbackDate", "render": function (data, type, row, meta) {
                        var dt = new Date(data);
                        return formatDate_DMY(dt);
                    }
                },
                {
                    "render": function (data, type, row, meta) {
                        var button = fnGetButtonHTML(row);
                        return button;
                    }
                }
            ]
            ,
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                if ((aData.IsSeen == "0") && (aData.LastFeedbackGivenBy != sessionStorage.EmployeeId)) { // display unread messages in green color
                    //$('td', nRow).addClass('UnreadMessage');
                }

            }
        });
    });
}

function fnEscapeHtmlAttr_ManagerFB(val) {
    if (val === null || val === undefined) return '';
    return String(val)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function fnGetButtonHTML(row) {
    if (row != undefined) {

        var feedbackId = 0;
        var fromEmpId = 0;
        var fromEmpName = '';
        var toEmpId = 0;
        var toEmpName = '';
        var feedback = '';

        feedbackId = row.FeedBackId;
        fromEmpId = row.FromEmployeeId;
        toEmpId = row.ToEmployeeId;
        feedback = row.Feedback;
        var threadRootFeedbackId = (row.ParentFeedBackId != null && row.ParentFeedBackId > 0) ? row.ParentFeedBackId : row.FeedBackId;

        switch (row.AreaID) {
            case 1:
            case 2:
                fromEmpName = row.FromEmployeeName;
                toEmpName = row.ToEmployeeName;
                break;
            default:
                fromEmpName = row.FromName;
                toEmpName = row.ToName;
        }

        return '<button type="button" class="btn btn-warning btn-xs btn-round" ' +
            'data-feedbackid="' + feedbackId + '" ' +
            'data-fromempid="' + fromEmpId + '" data-fromempname="' + fnEscapeHtmlAttr_ManagerFB(fromEmpName) + '" ' +
            'data-toempid="' + toEmpId + '" data-toempname="' + fnEscapeHtmlAttr_ManagerFB(toEmpName) + '" ' +
            'data-feedback="' + fnEscapeHtmlAttr_ManagerFB(feedback) + '" ' +
            'data-parentfeedbackid="' + threadRootFeedbackId + '" ' +
            'onclick="fnShowFeedbackModal(this);"><span class="glyphicon glyphicon-eye-open"></span></button>';
    }
}

function fnShowFeedbackModal(objButton) {
    $(objButton.parentElement).siblings().removeClass('UnreadMessage');
    var url = $('#feedbackModal').data('url');

    var selectedTab = $("#hdnSelectedFeedbackTab").val();
    $.get(url, function (data) {
        $('#feedbackContent').html(data);

        $("#txtFeedback").val($(objButton).attr('data-feedback'));
        $("#hdnParentFeedbackId").val($(objButton).attr('data-parentfeedbackid'));
        $("#spnFeedBackFrom").text($(objButton).attr('data-fromEmpName'));
        $("#spnFeedBackTo").text($(objButton).attr('data-toempname'));
        $("#hdnFromEmpId").val($(objButton).attr('data-fromempid'));

        fnFillFeedbackTrail();

        var Count = $("#divNotification").html();
        Count = Count - 1;
        if (Count > 0) {
            $("#divNotification").show();
        }
        else {
            $("#divNotification").hide();
        }
        $("#divNotification").html(Count);
        $('#feedbackModal').modal({
            show: true,
            keyboard: false,
            backdrop: 'static'
        });

        //fnLimitFeedbackText();
    });
}

function fnFillFeedbackTrail() {

    var empId = sessionStorage.EmployeeId;
    var token = sessionStorage.TokenValue;

    var headerInfo = {
        'Authorization': 'Bearer ' + sessionStorage.TokenValue, // Add the token to the Authorization header,
        'X-EmpNo': sessionStorage.EmployeeId
    };

    var parentfeedbackid = $("#hdnParentFeedbackId").val();
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Feedback?Id=" + parentfeedbackid + "&list=true";
    var svrPathToUpdate = svrPath + "Feedback?FeedbackId=" + parentfeedbackid + "&ParentId=" + parentfeedbackid + "&UserId=" + empId;

    CommonAjaxGET(apiPath, headerInfo).done(function (feedbackData) {
        if (feedbackData.Success == false) {
            // Only log if it's not a "NotFound" error (expected when no data)
            if (feedbackData.ErrorCode !== "NotFound" && feedbackData.ErrorCode !== "Not Found") {
                console.log("BindFeebackRequestPendingList" + feedbackData.ErrorCode + ' ' + feedbackData.ErrorMessage);
            }
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
        }
        if (feedbackList.length > 0) {
            $("#dvFeedback").hide();
        }
    });
}
