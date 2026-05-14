// Helper function to show/hide ViewAll loader
function ShowViewAllLoader(show) {
    if (show) {
        $('#viewAllLoader').show();
        $('#tblFeedbackAll').hide();
    } else {
        $('#viewAllLoader').hide();
        $('#tblFeedbackAll').show();
    }
}

$(document).ready(function () {
    debugger;
    
    // Show loader initially
    ShowViewAllLoader(true);
    
    Color = '';
    if (GColor == 1) {
        Color = "G";
        $("#tblFeedbackAll").addClass('tbl-success');
    }
    if (GColor == 2) {
        Color = "Y";
        $("#tblFeedbackAll").addClass('tbl-warning');
    }
    if (GColor == 3) {
        Color = "R";

        $("#tblFeedbackAll").addClass('tbl-danger');
    }

    if (GColor == 4) {
        Color = "B";
        $("#tblFeedbackAll").addClass('tbl-danger');
        //  BindFeedbackNotSubmitted(Color);
    }

    if (GColor == 5) {
        Color = "N";
        $("#tblFeedbackAll").addClass('tbl-danger');
        //  BindFeedbackNotSubmitted(Color);
    }
    if (GColor == 6) {
        Color = "S";
        $("#tblFeedbackAll").addClass('tbl-Yellow');
        //  BindFeedbackNotSubmitted(Color);
    }
    
    // Small delay to ensure loader is visible
    setTimeout(function() {
        BindFeedbacksAll(Color);
    }, 100);

    function BindFeedbacksAll(Color) {
        try {
            debugger;
            var selectedyear = '';
            var appraisalCycleId = parseInt(window.location.search.split('=')[3]);
            if (isNaN(appraisalCycleId)) {
                console.error('Invalid appraisalCycleId from URL');
                throw new Error('Invalid appraisalCycleId');
            }
            
            if (Color == "R") {
                selectedyear = parseInt(window.location.search.split('=')[2])
            }
            if (Color == "G") {
                selectedyear = parseInt(window.location.search.split('=')[2])
            }
            var FromEmployeeId = sessionStorage.EmployeeId;
            if (!FromEmployeeId) {
                console.error('EmployeeId not found in sessionStorage');
                throw new Error('EmployeeId not found');
            }
            
            var svrPath = CONFIG.get('SERVERNAME');
            if (Color != 'B' && Color != 'N' && Color != 'S') {
                var apiPath = svrPath + "ManagerDashboard?AppraisalCycleId=" + appraisalCycleId + "&FromEmployeeId=" + FromEmployeeId + "&ActionTypeId=1&Color=" + Color + "&selectedyear=" + selectedyear;
                try {
                    DashBoardFeedback = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
                } catch (apiError) {
                    console.error('API call failed:', apiError);
                    throw apiError;
                }
            }
            var count = 0;
            if (Color != 'B' && Color != 'N' && Color != 'S') {
                // Handle response - check both responseJSON and responseText
                var responseData = null;
                if (DashBoardFeedback) {
                    if (DashBoardFeedback.responseJSON) {
                        responseData = DashBoardFeedback.responseJSON;
                    } else if (DashBoardFeedback.responseText) {
                        try {
                            responseData = JSON.parse(DashBoardFeedback.responseText);
                        } catch (e) {
                            console.error('Error parsing response:', e);
                        }
                    } else {
                        // Try to get response directly if it's already parsed
                        responseData = DashBoardFeedback;
                    }
                }
                
                console.log('DashBoardFeedback response:', DashBoardFeedback);
                console.log('Parsed responseData:', responseData);
                
                if (responseData && responseData.Success) {
                $.each(responseData.Result.FeedbackCount.data, function (index, item) {
                    var row = '';
                    var empId = item.ToEmployeeId;
                    var ename = item.FirstName.trim();
                    if (Color == 'R') {
                        //Commented for hide behavioural competencies start
                        //row = '<tr><td><form action="/Feedback/ManagerFeeback" method="Post" id="C' + empId + '"><a href=":javascript" onclick="document.getElementById(\'C' + empId + '\').submit();event.preventDefault();">' + ename + '</a><input type="hidden" id="Id" name="Id" value="' + empId + '"><input type="hidden" id="Name" name="Name" value="' + ename + '"></form></td><td>' + item.KRA + '</td><td>' + item.Behavioural_Competency + '</td></tr>';
                        //Commented for hide behavioural competencies end
                        row = '<tr><td colspan="3"><form action="/Feedback/ManagerFeeback" method="Post" id="C' + empId + '"><a href=":javascript" title="Give feedback to ' + ename + '" onclick="document.getElementById(\'C' + empId + '\').submit();event.preventDefault();">' + ename + '</a><input type="hidden" id="Id" name="Id" value="' + empId + '"><input type="hidden" id="Name" name="Name" value="' + ename + '"><input type="hidden" id="selectedyear" name="selectedyear" value="' + selectedyear + '"><input type="hidden" id="appraisalCycleId" name="appraisalCycleId" value="' + appraisalCycleId + '"></form></tr>';

                        $('#tblFeedbackAll').append(row);
                        row = '';
                        count++;
                    }
                    else if (Color == "G") {

                        row = '<tr><td  colspan="3"><form action="/Feedback/GiveManagerFeedback" method="Post" id="D' + empId + '"><a href=":javascript" title="View Feedback" onclick="document.getElementById(\'D' + empId + '\').submit();event.preventDefault();">' + ename + '</a><input type="hidden" id="Id" name="Id" value="' + empId + '"><input type="hidden" id="Name" name="Name" value="' + ename + '"><input type="hidden" id="YearCycle" name="YearCycle" value="' + selectedyear + '"><input type="hidden" id="appraisalCycleId" name="appraisalCycleId" value="' + appraisalCycleId + '"></form></td>';
                           // < td colspan = "1" > <form action="/Feedback/ManagerFeeback" method="Post" id="R' + empId + '"><a href=":javascript" title="Give more feedback" onclick="document.getElementById(\'R' + empId + '\').submit();event.preventDefault();">Give more feedback</a><input type="hidden" id="Id" name="Id" value="' + empId + '"><input type="hidden" id="Name" name="Name" value="' + ename + '"> <input type="hidden" id="selectedyear" name="selectedyear" value="' + selectedyear + '"><input type="hidden" id="appraisalCycleId" name="appraisalCycleId" value="' + appraisalCycleId + '"></form></td></tr>';
                        $('#tblFeedbackAll').append(row);
                        row = '';
                        count++;
                    }
                    else { }

                });
                // var TeamCount = FeedbackLessThan.responseJSON.Result.TeamCount[0].TeamCount;
                // var MinMaxCounter = FeedbackLessThan.responseJSON.Result.TeamCount[0].MinMaxCounter;
                // var Per = 0;
                //  if (TeamCount != 0)
                //    Per = ((100 * parseInt(count)) / parseInt(TeamCount)).toFixed(2);
                if (Color == 'G') {
                    var InnerText = 'Feedback Given';
                    $('#tblFeedbackAll tr').find('th:nth-child(1),th:nth-child(1)').html(InnerText);
                    $('#tblFeedbackAll thead th').attr('colspan', '4')
                }
                if (Color == 'Y') {
                    //  var InnerText = '<h3><B>' + Per + '% </B></h3>Given less than ' + MinMaxCounter + ' times';
                    //  $('#tblFeedbackAll tr').find('th:nth-child(1),th:nth-child(1)').html(InnerText);
                }
                if (Color == 'R') {
                    var InnerText = 'Feedback not Given';
                    $('#tblFeedbackAll tr').find('th:nth-child(1),th:nth-child(1)').html(InnerText);
                    $('#tblFeedbackAll thead th').attr('colspan', '3')
                }
                
            }
        }
        if (Color == 'B') {
            debugger
            var apiPath = svrPath + "/Team?KRAStatusId=-1&AppraisalCycleId=" + appraisalCycleId + "&ManagerId=" + FromEmployeeId;
            try {
                KRANotSubmittedEmp = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
            } catch (apiError) {
                console.error('API call failed:', apiError);
                throw apiError;
            }

            var count = 0;
            // Handle response - check both responseJSON and responseText
            var responseDataB = null;
            if (KRANotSubmittedEmp && KRANotSubmittedEmp.responseJSON) {
                responseDataB = KRANotSubmittedEmp.responseJSON;
            } else if (KRANotSubmittedEmp && KRANotSubmittedEmp.responseText) {
                try {
                    responseDataB = JSON.parse(KRANotSubmittedEmp.responseText);
                } catch (e) {
                    console.error('Error parsing response:', e);
                }
            }
            
            if (responseDataB && responseDataB.Success) {
                $.each(responseDataB.Result.data, function (index, item) {
                    var row = '';
                    var empId = 0;
                    var ename = item.EmployeeName;
                    if (Color == 'B') {
                        row = '<tr><td colspan="3"><form>' + ename + '</form></td></tr>';
                    }

                    $('#tblFeedbackAll').append(row);
                    row = '';
                    count++;

                });

            }

            var InnerText = 'Team\'s PEP Status-Goals and Objectives not submitted';
            $('#tblFeedbackAll tr').find('th:nth-child(1),th:nth-child(1)').html(InnerText);
            $('#tblFeedbackAll thead th').attr('colspan', '3')
        }
        else if (Color == 'N') {

            var apiPath = svrPath + "/Team?KRAStatusId=2&AppraisalCycleId=" + appraisalCycleId + "&ManagerId=" + FromEmployeeId;
            try {
                KRANotSubmittedEmp = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
            } catch (apiError) {
                console.error('API call failed:', apiError);
                throw apiError;
            }

            var count = 0;
            // Handle response - check both responseJSON and responseText
            var responseDataN = null;
            if (KRANotSubmittedEmp && KRANotSubmittedEmp.responseJSON) {
                responseDataN = KRANotSubmittedEmp.responseJSON;
            } else if (KRANotSubmittedEmp && KRANotSubmittedEmp.responseText) {
                try {
                    responseDataN = JSON.parse(KRANotSubmittedEmp.responseText);
                } catch (e) {
                    console.error('Error parsing response:', e);
                }
            }
            
            if (responseDataN && responseDataN.Success) {

                $.each(responseDataN.Result.data, function (index, item) {
                    var row = '';
                    // var empId = 0;
                    var empId = item.EmployeeId;
                    var ename = item.EmployeeName;
                    var arr = ename.split('-');
                    arr = arr[1].trim();
                    if (Color == 'N') {
                        //   row = '<tr><td><form>' + ename + '</form></td></tr>';
                        //row = '<tr><td><form action="/KRA/EmployeeIndex" method="Post" id="R' + empId + '"><a href=":javascript" onclick="document.getElementById(\'R' + empId + '\').submit();event.preventDefault();">' + ename + '</a><input type="hidden" id="Id" name="Id" value="' + empId + '"><input type="hidden" id="Name" name="Name" value="' + ename + '"></form></tr>';
                        row = '<tr><td colspan="5"><form action="/KRA/EmployeeIndex" method="Post" id="R' + arr + '"><a href=":javascript" title="Goals & Objectives approve to ' + ename + '" onclick="document.getElementById(\'R' + arr + '\').submit();event.preventDefault();">' + ename + '</a><input type="hidden" id="Id" name="Id" value="' + empId + '"><input type="hidden" id="ename" name="ename" value="' + ename + '"><input type="hidden" id="YearCycle" name="YearCycle" value="' + selectedyear + '"><input type="hidden" id="appraisalCycleId" name="appraisalCycleId" value="' + appraisalCycleId + '"></form></tr>';

                    }

                    $('#tblFeedbackAll').append(row);
                    row = '';
                    count++;

                });

            }
        }

        else if (Color == 'S') {

            debugger;
            var selectedCycleAssessment = '';
            selectedCycleAssessment = parseInt(window.location.search.split('=')[2])

            var svrPath = CONFIG.get('SERVERNAME');
            var apiPath = svrPath + 'ManagerDashboard?ManagerId=' + FromEmployeeId + '&AppraisalCycleId=' + appraisalCycleId + '&SelectSubcycle=' + selectedCycleAssessment + '&selfAssesment=show';

            try {
                SelfassmentData = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
            } catch (apiError) {
                console.error('API call failed:', apiError);
                throw apiError;
            }
            debugger;
            var count = 0;
            // Handle response - check both responseJSON and responseText
            var responseDataS = null;
            if (SelfassmentData && SelfassmentData.responseJSON) {
                responseDataS = SelfassmentData.responseJSON;
            } else if (SelfassmentData && SelfassmentData.responseText) {
                try {
                    responseDataS = JSON.parse(SelfassmentData.responseText);
                } catch (e) {
                    console.error('Error parsing response:', e);
                }
            }
            
            if (responseDataS && responseDataS.Success) {

                $.each(responseDataS.Result.data, function (index, item) {
                    var row = '';
                    if (item.Selfassesment == 1) {
                        selfstatus = 'Submitted';
                    } else {
                        selfstatus = 'Not Submitted';
                    }
                    var Name = '';
                    Name = item.FirstName + " " + item.LastName;

                    var empid = item.EmployeeId;

                    if (item.Selfassesment == 1) {

                        row = '<tr><td colspan="5"><form action="/Feedback/ViewSelfAssessmentFeedback" method="Post" id="S' + empid + '"><a href=":javascript" title="' + Name + '" onclick="document.getElementById(\'S' + empid + '\').submit();event.preventDefault();">' + Name + " - " + item.NewEmployeeCode + '</a><input type="hidden" id="Id" name="Id" value="' + empid + '"><input type="hidden" id="Name" name="Name" value="' + Name + '"><input type="hidden" id="selectedCycleAssessment" name="selectedCycleAssessment" value="' + selectedCycleAssessment + '"><input type="hidden" id="ddlAppCycleId" name="ddlAppCycleId" value="' + appraisalCycleId + '"></form></td><td>' + selfstatus + '</td></tr>';
                    }
                    else {
                        row = '<tr><td colspan="5">' + "" + Name + ' - ' + item.NewEmployeeCode + '</td><td>' + selfstatus + '</td></tr>';

                    }

                    $('#tblFeedbackAll').append(row);
                    row = '';
                    count++;

                });
            }
        }

        else { }

        if (Color == 'N') {
            var InnerText = 'Team\'s PEP Status-Goals & objectives Pending for Approval';
            $('#tblFeedbackAll tr').find('th:nth-child(1),th:nth-child(1)').html(InnerText);
            $('#tblFeedbackAll thead th').attr('colspan', '5')
        }

        if (Color == 'S') {
            var InnerText = 'Self-Assessment Submit Detail';
            $('#tblFeedbackAll tr').find('th:nth-child(1),th:nth-child(1)').html(InnerText);
            $('#tblFeedbackAll thead th').attr('colspan', '6')
        }
        } catch (error) {
            console.error('Error in BindFeedbacksAll:', error);
        } finally {
            // Always hide loader and show table after all data loading is complete
            // Small delay to ensure DOM updates are complete
            setTimeout(function() {
                ShowViewAllLoader(false);
            }, 300);
        }
        
        // Fail-safe timeout - hide loader after maximum time
        setTimeout(function() {
            if ($('#viewAllLoader').is(':visible')) {
                ShowViewAllLoader(false);
            }
        }, 15000); // 15 second fail-safe
    }


});