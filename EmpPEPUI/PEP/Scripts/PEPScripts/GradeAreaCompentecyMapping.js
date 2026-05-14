function LoadGradeAreaCompetencyCtrl() {
    FillAppraisalCycle();
    FillArea();
    FillCompetencies();

    $('.selectGCFill').on('change', function () {

        FillGrid();
    });

    $("#btnSubmitGradeAreaCompetency").click(function () {
        SaveGradeAreaCompetency();
    });
}

function FillAppraisalCycle() {
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "AppraisalCycle/AppraisalCyclewithOutId";


    var AppraisalCycle = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    $('#ddlAppraisalCycle').empty();
    $('#ddlAppraisalCycle').append($("<option>").val(0).text('Select'));
    $.each(AppraisalCycle.responseJSON.Result, function (index, data) {
        $('#ddlAppraisalCycle').append($("<option>").val(data.AppraisalCycleId).text(data.AppraisalCycleName));
    });
}
function FillArea() {
    $('#ddlArea').empty();
    $('#ddlArea').append($("<option>").val(1).text('Behavioural Competency'));
}

function FillCompetencies() {
    //debugger;
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "QuestionaryMaster";

    var Competiencies = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    $('#ddlCompetencyNew').empty();
    $('#ddlCompetencyNew').append($("<option>").val(0).text('Select'));
    $.each(Competiencies.responseJSON.Result, function (index, data) {
        $('#ddlCompetencyNew').append($("<option>").val(data.QuestionaireId).text(data.Question));
    });
   
}

function FillGrid() {
    //debugger;
    var appraisalCycleId = $('select#ddlAppraisalCycle option:selected').val();
    var areaId = 1;// behaioural competency 
    var questionId = $('select#ddlCompetencyNew option:selected').val();
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "GradeAreaQuestionMapping?AppraisalCycleId=" + appraisalCycleId+"&AreaId="+areaId+"&QuestionId="+questionId;

   
    if (appraisalCycleId > 0 && questionId>0)
        var CompetienciesForGrid = CommonAjaxGET(apiPath, CommonGetHeaderInfo());

    if (CompetienciesForGrid.responseJSON.Success) {
        $('#tblGradeAreaCompetency').show();
        $('#tblGradeAreaCompetency').DataTable({
            destroy: true,
            data: CompetienciesForGrid.responseJSON.Result,
            aoColumns: [
                { mData: "EmployeeGradeName", label: "Employee Grade" },
                {
                    mRender: function (data, type, full) {

                        var setslider = '<div id="DivExpectedPointG">';
                        if (full.ExpectedPoint == 1) {
                            setslider = setslider + '<input type="radio"  name="r' + full.EmployeeGradeID + '" value="1" checked="checked"/>1 ';
                        }
                        else {
                            setslider = setslider + '<input type="radio"  name="r' + full.EmployeeGradeID + '" value="1" />1 ';
                        }
                        if (full.ExpectedPoint == 2) {
                            setslider = setslider + '<input type="radio"  name="r' + full.EmployeeGradeID + '" value="2" checked="checked"/>2 ';
                        }
                        else {
                            setslider = setslider + '<input type="radio"  name="r' + full.EmployeeGradeID + '" value="2"/>2 ';
                        }
                        if (full.ExpectedPoint == 3)
                        {
                            setslider = setslider + '<input type="radio" name="r' + full.EmployeeGradeID + '" value="3" checked="checked"/>3 ';
                        }
                        else{
                            setslider = setslider + '<input type="radio" name="r' + full.EmployeeGradeID + '" value="3"/>3 ';
                        }
                        if (full.ExpectedPoint == 4) {
                            setslider = setslider + '<input type="radio"  name="r' + full.EmployeeGradeID + '" value="4" checked="checked"/>4 ';
                        }
                        else {
                            setslider = setslider + '<input type="radio"  name="r' + full.EmployeeGradeID + '" value="4"/>4 ';
                        }
                        if (full.ExpectedPoint == 5) {
                            setslider = setslider + '<input type="radio"  name="r' + full.EmployeeGradeID + '" value="5" checked="checked"/>5 ';
                        }
                        else
                        {
                            setslider = setslider + '<input type="radio"  name="r' + full.EmployeeGradeID + '" value="5"/>5 ';
                        }
                        if (full.ExpectedPoint == 0) {
                            setslider = setslider + '<input type="radio"  name="r' + full.EmployeeGradeID + '" value="0" checked="checked"/> None';
                        }
                        else {
                            setslider = setslider + '<input type="radio" name="r' + full.EmployeeGradeID + '" value="0"/>None ';
                        }
                        
                        setslider = setslider + '<input type="hidden" id="hdnExpected" name="hdnExpected" value=' + full.ExpectedPoint + '/>';
                        setslider = setslider + '<input type="hidden" id="hdnEmployeeGradeID" name="hdnEmployeeGradeID" value=' + full.EmployeeGradeID + '/>';
                        setslider = setslider + '<input type="hidden" id="hdnGradeAreaQuestionMappingID" name="hdnGradeAreaQuestionMappingID" value=' + full.GradeAreaQuestionMappingID + '/>'
                        setslider = setslider + '</div>';
                        return setslider;
                    }
                },
            ],
           
            bFilter: false,  //removes search filter
            paging: false,  //removes paging header footer
            LengthChange: false, //removes shwoing entries
            bInfo: false,

        });

    }
        
}

function SaveGradeAreaCompetency() {

        var table = $('#tblGradeAreaCompetency').DataTable();
        var numero = $('#tblGradeAreaCompetency').dataTable().fnGetNodes().length;
        var vQuestionId = $('select#ddlCompetencyNew option:selected').val();
        var vAppraisalCycleId = $('select#ddlAppraisalCycle option:selected').val();
        var FeedbackArray = [];
        var data = $('#tblGradeAreaCompetency').DataTable().rows().data();
        if (numero != 0) {
            for (i = 1; i <= numero; i++) {
                var employeeGradeId = $($($('table tr:nth-child(' + i + ') td:nth-child(2) div:nth-child(1) input:hidden'))[1]).val();
                var vGradeAreaQuestionMappingID = $($($('table tr:nth-child(' + i + ') td:nth-child(2) div:nth-child(1) input:hidden'))[2]).val();
                var vRating = 0;
                if ($($($('table tr:nth-child(' + i + ') td:nth-child(2) input:radio'))[0]).is(':checked'))
                {
                    vRating = 1;
                }
                else if ($($($('table tr:nth-child(' + i + ') td:nth-child(2) input:radio'))[1]).is(':checked')) {
                    vRating = 2;
                }
                else if ($($($('table tr:nth-child(' + i + ') td:nth-child(2) input:radio'))[2]).is(':checked')) {
                    vRating = 3;
                }
                else if ($($($('table tr:nth-child(' + i + ') td:nth-child(2) input:radio'))[3]).is(':checked')) {
                    vRating = 4;
                }
                else if ($($($('table tr:nth-child(' + i + ') td:nth-child(2) input:radio'))[4]).is(':checked')) {
                    vRating = 5;
                }
                else if ($($($('table tr:nth-child(' + i + ') td:nth-child(2) input:radio'))[5]).is(':checked')) {
                    vRating = -1;
                }
                if ((vRating != '') &&(vRating != 'null/')) {
                    //debugger;
                            var GradeAreaQuestionMappingEntity = {
                                GradeAreaQuestionMappingID: vGradeAreaQuestionMappingID.replace('/',''),
                                AppraisalCycleId: vAppraisalCycleId,
                                AreaID: 1,
                                QuestionID: vQuestionId,
                                EmployeeGradeID: employeeGradeId.replace('/', ''),
                                ExpectedPoint: vRating,
                                IsActive:1,
                            }
                            FeedbackArray.push(GradeAreaQuestionMappingEntity);
                }
            }

            if (FeedbackArray.length > 0) {
                var svrPath = CONFIG.get('SERVERNAME');
                var apiPath = svrPath + '/GradeAreaQuestionMapping/';
           
                var Result = CommonAjaxPOST_Array(apiPath, FeedbackArray, CommonGetHeaderInfo());
                if (Result.Success) {
                    alert(Result.Result);
                   

                }
                else {
                    alert(Result.ErrorMessage);
                }
            }
            else {
                alert("Please give expected Rating for grades.");
            }

        }
    }

