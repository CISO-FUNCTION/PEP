using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace EmpPEP.UI.Controllers
{
    public class KRAController : Controller
    {
        //
        // GET: /KRA/

        public ActionResult Index()
        {
            @ViewBag.SelectedMenu = "kra";
            return View();
        }
        public ActionResult EmployeeIndex(FormCollection employee)
        {
            string[] s = employee["ename"].ToString().Split('-');
            @ViewBag.EmployeeName = s[0];
            @ViewBag.EmployeeId = Convert.ToInt32(employee["Id"]);
            Session["EmployeeMainId"] = Convert.ToInt32(employee["Id"]);
            @ViewBag.AppraisalCycleId = (employee["AppraisalCycleId"]);
            @ViewBag.SelectedMenuPage = "1";
            return View();
        }
        public ActionResult TeamIndex()
        {
            return View();
        }
        //GetAssesmentModal
        [HttpGet]
        public ActionResult GetAssesmentModal()
        {
            return PartialView("_SelfAssesment");
        }

    }
}
