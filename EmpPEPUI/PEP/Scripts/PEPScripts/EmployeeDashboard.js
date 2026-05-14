$(document).ready(function () {
    GetEmployeeRatingChart();
    BindEmployeeStrengthWeakness();
});

function GetEmployeeRatingChart() {
    var rating_type = ['Expected', 'Actual'];
    var rating_actual = [];
    var rating_expected = [];
    var tick_value = [];//    var actual_color = [];    var expected_color = [];
    var Question = [];
    var appraisalCycleId = sessionStorage.AppraisalCycleId;
    var employeeId = sessionStorage.EmployeeId;
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Reports?AppraisalCycleId=" + appraisalCycleId + "&ToEmployeeId=" + employeeId + "&ActionTypeId=1&AreaId=1";
    var res = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    var getGraphInfo = JSON.parse(res.responseText);
    if (getGraphInfo.Success) {
        var i = 'A';
        $.each(getGraphInfo.Result, function (index, item) {
            rating_actual.push(item.ActualPoint);            //actual_color.push("#027997");
            rating_expected.push(item.ExpectedPoint);            //expected_color.push("#F3CBBF");
            tick_value.push(i); //item.QuestionaireId
            Question.push(item.Question);
//            $('#divEmpChart_legends table>tbody').append('<tr class="jqplot-table-legend"><td class="jqplot-table-legend jqplot-table-legend-label" style="padding-top: 0px;">' + i + ' - ' + item.Question + '</td></tr>');
            i = String.fromCharCode(i.charCodeAt(i.length - 1) + 1)

        });
    } else {
    }
    
    var ticks = tick_value;

    var plot2 = $.jqplot('divEmpChart', [rating_expected, rating_actual], {
        title: 'Performance Evaluation Chart',
        seriesDefaults: { renderer: $.jqplot.BarRenderer, pointLabels: { show: true } },
        series: [{ label: rating_type[0], color: "#027997" }, { label: rating_type[1], color: "#ed7709" }],
        axes: {
            xaxis: {
                tickOptions: { angle: -30, showGridline: false },
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticks,
                fontSize: '10pt',
                labelRenderer: $.jqplot.canvasAxisLabelRenderer,
                tickRenderer: $.jqplot.canvasAxisTickRenderer
            },
            yaxis: {
                tickOptions: { show: false },
                rendererOptions: { drawBaseline: false },
                min:0,
                max:6
            }
        },
        legend: {
            renderer: $.jqplot.enhancedLegendRenderer,
            placement: 'outside',
            show: false
        },
        highlighter: {
            show: true,
            sizeAdjust: 1,
            tooltipLocation: 'n',
            fadeTooltip: true,
            tooltipOffset : 3,
            tooltipContentEditor: function (str, seriesIndex, pointIndex, jqPlot) {
                return '<div class="pep-jqplot-highlighter jqplot-highlighter">' + Question[pointIndex] + ' - ' + rating_type[seriesIndex] + '</div>';
            }
        },
    });
}
function BindEmployeeStrengthWeakness() {
    //debugger;
    var appraisalCycleId = sessionStorage.AppraisalCycleId;
    var FromEmployeeId = 0;
    var ToEmployeeId = sessionStorage.EmployeeId;
    var svrPath = CONFIG.get('SERVERNAME');
    var apiPath = svrPath + "Reports?AppraisalCycleId=" + appraisalCycleId + "&FromEmployeeId=" + FromEmployeeId + "&ToEmployeeId=" + ToEmployeeId + "&ActionTypeId=1&AreaId=1";
    var res = CommonAjaxGET(apiPath, CommonGetHeaderInfo());
    var StrengthWeakness = JSON.parse(res.responseText);
    var count = 0;
    if (StrengthWeakness.Success) {
        $.each(StrengthWeakness.Result, function (index, item) {
            var row = '';
            if (item.StrengthWeakness == 1) {
                row = '<tr><td class="strength"><B>' + item.Question + '</B></td></tr>';
            }
            else if (item.StrengthWeakness == 2) {
                row = '<tr><td class="weakness"><B>' + item.Question + '</B></td></tr>';
            }
            else {
                row = '<tr><td><B>' + item.Question + '</B></td></tr>';
            }
            $('#tblStrenghtWeakness').append(row);

            row = '';
            count++;
        });
    }
}
