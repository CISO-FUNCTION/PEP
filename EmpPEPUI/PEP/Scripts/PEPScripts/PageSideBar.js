$(document).ready(function () {

    // alert('Hi');
    fnGetMenu();
    $('[data-toggle="tooltip"]').tooltip();
});


//Following function is used to get menus rolewise
function fnGetMenu() {

    debugger
    var role = sessionStorage.EmployeeRoleId;
    var isHRBP = sessionStorage.IsHRBP
    var isRatingAdmin = sessionStorage.IsRatingAdmin
    var ratingTabVisible = sessionStorage.RatingTabVisible
    //  sessionStorage.IsPracticeLead

    $.ajax({
        type: 'GET',
        async: false,
        cache: false,
        url: "/PageSideBar/GetRole",
        data: { RoleId: role, RatingTabVisible: ratingTabVisible, IsRatingAdmin: isRatingAdmin, IsHRBP: isHRBP },
        success: function (data) {

            // debugger; 

        },
        error: function () {


        }
    });

}