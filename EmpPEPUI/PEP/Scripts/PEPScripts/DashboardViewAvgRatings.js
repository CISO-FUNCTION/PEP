$(document).ready(function () {

    BindEmployeeKRAAvgRating();
    //  BindEmployeeBCAvgRating();
});
function BindEmployeeKRAAvgRating() {
    debugger;
    //loading the main grid that displays the KRA of an employee
    //  var selectedyear = $('#ddlFeedbackSubCycle :selected').val();
    var appraisalCycleId = sessionStorage.AppraisalCycleId;
    var fromEmployeeId = sessionStorage.EmployeeId;
    var ToEmployeeId = GToEmployeeId;
    var selectedyear = parseInt(GToYearCycle);
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "managerdashboard?AppraisalCycleId=" + appraisalCycleId + "&FromEmployeeId=" + fromEmployeeId + "&ToEmployeeId=" + ToEmployeeId + "&ActionTypeId=1&AreaId=2&selectedyear=" + selectedyear;
    EmpKRAData = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    debugger;
    if (EmpKRAData.responseJSON.Success) {
        $('#tblViewAvgRatingKRA').show();
        $('#tblViewAvgRatingKRA').DataTable({
            destroy: true,
            data: EmpKRAData.responseJSON.Result,
            aoColumns: [
                { mData: "Question", label: "Goal Description" },
                { mData: "ExpectedPoint", label: "Measure" },
                 { mData: "Selfassesment", label: "Selfassesment" },
                { mData: "Feedback", label: "Feedback" },
                {
                    mData: "FeedbackDate", "render": function (data, type, row, meta) {
                        var dt = new Date(data);
                        return formatDate_DMY(dt);
                    },
                    "sWidth": "15%"
                }
                //{mData: "Rating",
                //    mRender: function (data, type, full) {
                //            var setslider = '<div id="DivAvgRatingKRA" class="starRate"><ul>';
                //            if (full.AvgRatings == '5')
                //                setslider = setslider + '<li> <a href="#" class="active" value="5"><span>5</span><b></b></a></li>';
                //            else
                //                setslider = setslider + '<li> <a href="#" class="test" value="5"><span>5</span><b></b></a></li>';
                //            if (full.AvgRatings == '4')
                //                setslider = setslider + '<li><a href="#" class="active" value="4"><span>4</span></a></li>';
                //            else
                //                setslider = setslider + '<li><a href="#" value="4"><span>4</span></a></li>';
                //            if (full.AvgRatings == '3')
                //                setslider = setslider + '<li><a href="#" class="active" value="3"><span>3</span></a></li>';
                //            else
                //                setslider = setslider + '<li><a href="#" value="3"><span>3</span></a></li>';
                //            if (full.AvgRatings == '2')
                //                setslider = setslider + '<li><a href="#"  class="active" value="2"><span>2</span></a></li>';
                //            else
                //                setslider = setslider + '<li><a href="#" value="2"><span>2</span></a></li>';
                //            if (full.AvgRatings == '1')
                //                setslider = setslider + '<li><a href="#"  class="active" value="1"><span>1</span></a></li>';
                //            else
                //                setslider = setslider + '<li><a href="#" value="1"><span>1</span></a></li>';

                //            setslider = setslider + '</div>';

                //            return setslider;
                //    }
                //}
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {

                $('#DivAvgRatingKRA a', nRow).each(function (index, item) {
                    if (item.text <= aData.AvgRatings) {
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
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}
//function BindEmployeeBCAvgRating() {
//    //loading the main grid that displays the KRA of an employee
//    var AppraisalCycleId = sessionStorage.AppraisalCycleId;
//    var EmployeeGradeID = sessionStorage.EmployeeGradeId;
//    var ToEmployeeId = GToEmployeeId;
//    var FromEmployeeId = sessionStorage.EmployeeId;

//    //debugger;
//    var svrPath = CONFIG.get('SERVERNAME');
//    var apiPath = svrPath + "/managerdashboard?AppraisalCycleId=" + AppraisalCycleId + "&FromEmployeeId=" + FromEmployeeId + "&ToEmployeeId=" + ToEmployeeId + "&ActionTypeId=1&AreaId=1";
//    ///managerdashboard?AppraisalCycleId=4&FromEmployeeId=2201&ToEmployeeId=2413&ActionTypeId=1&AreaId=1
//    //debugger;
//    EmpBCData = CommonAjaxGET(apiPath, CommonGetHeaderInfo());



//    //Commented for hide behavioural competencies start

//    //if (EmpBCData.responseJSON.Success != null) {
//    //    $('#tblViewAvgRatingBC').show();
//    //    $('#tblViewAvgRatingBC').DataTable({
//    //        destroy: true,
//    //        data: EmpBCData.responseJSON.Result,
//    //        aoColumns: [
//    //            { mData: "Question", label: "Competencies" }, 
//    //            {
//    //                mRender: function (data, type, full) {

//    //                    var setslider = '<div id="DivExpectedPoint" class="starRate"><ul>';
//    //                    if (full.ExpectedPoint === '5')
//    //                        setslider = setslider + '<li> <a href="#" class="active" value="5"><span>5</span><b></b></a></li>';
//    //                    else
//    //                        setslider = setslider + '<li> <a href="#" class="test" value="5"><span>5</span><b></b></a></li>';
//    //                    if (full.ExpectedPoint === '4')
//    //                        setslider = setslider + '<li><a href="#" class="active" value="4"><span>4</span></a></li>';
//    //                    else
//    //                        setslider = setslider + '<li><a href="#" value="4"><span>4</span></a></li>';
//    //                    if (full.ExpectedPoint === '3')
//    //                        setslider = setslider + '<li><a href="#" class="active" value="3"><span>3</span></a></li>';
//    //                    else
//    //                        setslider = setslider + '<li><a href="#" value="3"><span>3</span></a></li>';
//    //                    if (full.ExpectedPoint === '2')
//    //                        setslider = setslider + '<li><a href="#"  class="active" value="2"><span>2</span></a></li>';
//    //                    else
//    //                        setslider = setslider + '<li><a href="#" value="2"><span>2</span></a></li>';
//    //                    if (full.ExpectedPoint === '1')
//    //                        setslider = setslider + '<li><a href="#"  class="active" value="1"><span>1</span></a></li>';
//    //                    else
//    //                        setslider = setslider + '<li><a href="#" value="1"><span>1</span></a></li>';

//    //                    setslider = setslider + '</ul></div>';

//    //                    return setslider;
//    //                }
//    //            },
//    //            {

//    //                mRender: function (data, type, full) {
//    //                    var setslider = '<div id="DivActualAvgPoint" class="starRate"><ul>';
//    //                    if (full.AvgRatings == '5')
//    //                        setslider = setslider + '<li> <a href="#" class="active" value="5"><span>5</span><b></b></a></li>';
//    //                    else
//    //                        setslider = setslider + '<li> <a href="#" class="test" value="5"><span>5</span><b></b></a></li>';
//    //                    if (full.AvgRatings == '4')
//    //                        setslider = setslider + '<li><a href="#" class="active" value="4"><span>4</span></a></li>';
//    //                    else
//    //                        setslider = setslider + '<li><a href="#" value="4"><span>4</span></a></li>';
//    //                    if (full.AvgRatings == '3')
//    //                        setslider = setslider + '<li><a href="#" class="active" value="3"><span>3</span></a></li>';
//    //                    else
//    //                        setslider = setslider + '<li><a href="#" value="3"><span>3</span></a></li>';
//    //                    if (full.AvgRatings == '2')
//    //                        setslider = setslider + '<li><a href="#"  class="active" value="2"><span>2</span></a></li>';
//    //                    else
//    //                        setslider = setslider + '<li><a href="#" value="2"><span>2</span></a></li>';
//    //                    if (full.AvgRatings == '1')
//    //                        setslider = setslider + '<li><a href="#"  class="active" value="1"><span>1</span></a></li>';
//    //                    else
//    //                        setslider = setslider + '<li><a href="#" value="1"><span>1</span></a></li>';

//    //                    setslider = setslider + '</ul></div>';
//    //                    return setslider;
//    //                }
//    //            },
//    //        ],
//    //        "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {

//    //            $('#DivExpectedPoint a', nRow).each(function (index, item) {
//    //                if (item.text <= aData.ExpectedPoint) {
//    //                    $(item).addClass('active');
//    //                }
//    //            });
//    //            $('#DivActualAvgPoint a', nRow).each(function (index, item1) {
//    //                if (item1.text <= aData.AvgRatings) {
//    //                    $(item1).addClass('active');
//    //                }
//    //            });
//    //        },
//    //        order: [[2, "desc"], [1, "asc"]], //order by Goal type, Sequence
//    //        bFilter: false,  //removes search filter
//    //        paging: false,  //removes paging header footer
//    //        LengthChange: false, //removes shwoing entries
//    //        bInfo: false,

//    //    });

//    //}

//    //Commented for hide behavioural competencies end
//}