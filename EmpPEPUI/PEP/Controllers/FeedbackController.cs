using EmpPEP.UI.Common;
using EmpPEP.UI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace EmpPEP.UI.Controllers
{
    public class FeedbackController : Controller
    {
        //
        // GET: /Feedback/

        public ActionResult Index()
        {
            @ViewBag.EmployeeId = 0;
            @ViewBag.DashValue2 = 0;
            @ViewBag.DashboardValue = 0;
            @ViewBag.SelectedMenu = "feedback";
            @ViewBag.AppraisalCycleId = 0;
            return View();
        }

        [EncryptedActionParameterAttribute]
        public ActionResult ManagerFeeback(int Id, string Name)
        {
            @ViewBag.SelectedMenu = "feedback";
            ViewBag.EmployeeId = Id;
            @ViewBag.DashboardValue = 4;
            @ViewBag.EmployeeName = Name.ToString();
            return View("AddManagersFeedbackHome");
        }
        [HttpPost]
        public ActionResult ManagerFeeback(FormCollection employee)
        {
            @ViewBag.SelectedMenu = "feedback";
            ViewBag.EmployeeId = employee["Id"].ToString();
            @ViewBag.EmployeeName = employee["Name"].ToString();
            @ViewBag.selectedyear = employee["selectedyear"].ToString();
            @ViewBag.ddlAppCycleId = employee["appraisalCycleId"].ToString();
            ViewBag.DashboardValue = 3;
            return View("AddManagersFeedbackHome");
        }

        [EncryptedActionParameterAttribute]
        public ActionResult ManagerFeebackSkipLevel(int Id, string Name)
        {
            @ViewBag.SelectedMenu = "feedback";
            ViewBag.EmployeeId = Id;
            @ViewBag.DashboardValue = 0;
            @ViewBag.EmployeeName = Name.ToString();
            return View("AddManagerFeebackSkipLevel");
        }
        [HttpPost]
        public ActionResult ManagerFeebackSkipLevel(FormCollection employee)
        {
            @ViewBag.SelectedMenu = "feedback";
            @ViewBag.DashboardValue = 5;
            @ViewBag.DashboardValue1 = 6;
            ViewBag.EmployeeId = employee["Id"].ToString();
            @ViewBag.EmployeeName = employee["Name"].ToString();
            @ViewBag.selectedyear = employee["selectedyear"].ToString();
            @ViewBag.ddlAppCycleId = employee["ddlAppCycleId"].ToString();
            return View("AddManagerFeebackSkipLevel");
        }
        [HttpPost]
        public ActionResult GiveManagerFeedback(FormCollection employee)
        {
            @ViewBag.SelectedMenu = "dashboard";
            @ViewBag.DashboardValue = 1;
            @ViewBag.EmployeeId = employee["Id"].ToString();
            @ViewBag.EmployeeName = employee["Name"].ToString();
            @ViewBag.YearCycle = employee["YearCycle"].ToString();
            @ViewBag.ddlAppCycleId = employee["appraisalCycleId"].ToString();
            return PartialView("_ViewUpdateGivenFeedback");
        }
        [HttpPost]
        public ActionResult ViewSelfAssessmentFeedback(FormCollection employee)
        {
            @ViewBag.SelectedMenu = "dashboard";
            @ViewBag.DashboardValue = 2;
            @ViewBag.EmployeeId = employee["Id"].ToString();
            @ViewBag.SubCycleCheckSelfAssest= employee["selectedCycleAssessment"].ToString();
            @ViewBag.EmployeeName = employee["Name"].ToString();
            @ViewBag.ddlAppCycleId = employee["ddlAppCycleId"].ToString();
            return PartialView("ViewSelfAssessment");
        }
        //GetFeedbackModal
        [HttpGet]
        public ActionResult GetFeedbackModal()
        {
            return PartialView("_Feedback");
        }

        [HttpGet]
        public ActionResult GetViewOtherFeedbackModal()
        {
            return PartialView("_MyFeedbackOther");
        }
    }
}
