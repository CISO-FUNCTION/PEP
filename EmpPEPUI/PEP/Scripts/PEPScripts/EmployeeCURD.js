//--------------------------------------------------------------------------------------------------------------------------------Document.ready-//
$(document).ready(function () {
    var currentPage = 0;
    ViewEmployee();
    RegisterAllEvents();
    pagination();
});

function ViewEmployee() {
    var employees = CommonAjaxPOST("http://localhost:62193/Employee/GetEmployees");

    var items = "";
    
    $.each(employees, function (i, val) {
        items += "<tr id='" + val.employeeID + "'>";
        items += "<td id='tdEmployeeID'>" + val.employeeID + "</td>";
        items += "<td >" + val.firstName + "</td>";
        items += "<td>" + val.lastName + "</td>";
        items += "<td>" + val.employeeCode + "</td>";
        items += "<td>" + val.age + "</td>";
        items += "<td>" + val.gender + "</td>";

        items += "<td>" + val.dob + "</td>";
        items += "<td>" + val.doj + "</td>";
        items += "<td>" + val.salary + "</td>";
        items += "<td>" + val.departmentName + "</td>";
        items += "<td>" + val.designationName + "</td>";

        items += "<td><input type='button' value='Edit' class='edit' id='edit' Name='tr" + val.employeeID + "'/></td>";
        items += "<td><input type='button' value='Delete' class='delete'  id='Delete' Name='tr" + val.employeeID + "'/></td>";

       items +="</tr>";
   });
   $("#tbodyEmployee").html(items);
}
function RegisterAllEvents() {

    $("#AddNew").click(function myfunction() {
        var Name = this.name;
        var employeeID = 0;
        var employee = CommonAjaxPOST("http://localhost:62193/Employee/Add?EmployeeID=" + employeeID);
        if (employee != undefined) {
            var index = $(this).closest("tr").index();
            $('#tableEmployee > tbody > tr').eq(index).after(employee);
            
        }
    });


    $(document).on("click", ".edit", function (e) {
        var Name = this.name;
        var employeeID = $(this).closest("tr").find("#tdEmployeeID").text();
        var employee = CommonAjaxPOST("http://localhost:62193/Employee/Edit?EmployeeID=" + employeeID);
        if (employee != undefined) {
            var index = $(this).closest("tr").index();
            $('#tableEmployee > tbody > tr').eq(index).after(employee);
            $(this).closest("tr").addClass('hidden');
        }
    });

    $(document).on("click", ".delete", function (e) {
        var employeeID = $(this).closest("tr").find("#tdEmployeeID").text();
        var result = CommonAjaxPOST("http://localhost:62193/Employee/Delete?EmployeeID=" + employeeID);
        if(result)
            $(this).closest("tr").remove();
    });

    $(document).on("click", "#Cancel", function (e) {
        $(this).closest("tr").remove();
        $('#tableEmployee').find('tr').removeClass('hidden');
    });
    $(document).on("click", "#Update", function (e) {
        
        var employee = Save('U');
        var result = CommonAjaxPOST("http://localhost:62193/Employee/Update", employee);
        if(result)
        {
            $('#tableEmployee').removeData();
            ViewEmployee();
            pagination();
        }
    });
    $(document).on("click", "#Save", function (e) {
        if (Validation()) {
            var employee = Save('I');
            var result = CommonAjaxPOST("http://localhost:62193/Employee/Insert", employee);
            if (result) {
                $('#tableEmployee').removeData();
                ViewEmployee();
                pagination();
            }
        }
    });

    $(document).on("keypress", ".numeric", function (e) {
        e = (e) ? e : window.event;
        var charCode = (e.which) ? e.which : e.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    });
}
function Save(Mode) {
    var EmployeeID = 0;
    if (Mode == 'U')
        EmployeeID = $("#EmployeeID").val();

    var employee = {
        EmployeeID: EmployeeID,
        FirstName: $("#FirstName").val(),
        LastName: $("#LastName").val(),
        EmployeeCode: $("#EmployeeCode").val(),
        age: $("#Age").val(),
        Salary: $("#Salary").val(),
        DOJ: $("#DOJ").val(),
        DOB: $("#DOB").val(),
        Gender: $("#Gender").val(),
        DepartmentID: $("#DepartmentID").val(),
        DesignationID: $("#DesignationID").val(),
    }
    return employee;
}
function Validation() {
    if ($("#FirstName").val() == "") {
        $("#FirstName").addClass("errorClass");
        return false;
    }
    if ($("#EmployeeCode").val() == "") {
        $("#EmployeeCode").addClass("errorClass");
        return false;
    }

}


function pagination() {

    jQuery('#pagination').empty();
    jQuery('#pagination').append("<a>First</a> ");
    jQuery('#pagination').append("<a>Previous</a> ");
    var req_num_row = 2;
    var $tr = jQuery('tbody tr');
    var total_num_row = $tr.length;
    var num_pages = 0;
    if (total_num_row % req_num_row == 0) {
        num_pages = total_num_row / req_num_row;
    }
    if (total_num_row % req_num_row >= 1) {
        num_pages = total_num_row / req_num_row;
        num_pages++;
        num_pages = Math.floor(num_pages++);
    }
    for (var i = 1; i <= num_pages; i++) {
        jQuery('#pagination').append("<a > " + i + "</a> ");
    }

    jQuery('#pagination').append("<a>Next</a> ");
    jQuery('#pagination').append("<a>Last</a> ");
    $tr.each(function (i) {
        jQuery(this).hide();
        if (i + 1 <= req_num_row) {
            $tr.eq(i).show();
        }

    });
    

    jQuery('#pagination a').click(function (e) {
        e.preventDefault();
        $tr.hide();
        
        var page = jQuery(this).text();
        if (page == 'First')
            page = 1;
        if (page == 'Last') 
            page = num_pages;
        if (page == 'Next' && num_pages > currentPage)
            page = parseInt(currentPage) + 1;
        else if (page == 'Next' && num_pages == currentPage)
            page = num_pages;
        if (page == 'Previous' && currentPage > 1)
            page = parseInt(currentPage)-1;
        if (page == 'Previous' && currentPage == 1)
            page =  1;
        currentPage = page;

        var temp = page - 1;
        var start = temp * req_num_row;
        
        for (var i = 0; i < req_num_row; i++) {
            $tr.eq(start + i).show();
        }
    });
}
