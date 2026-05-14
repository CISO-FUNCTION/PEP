using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.IO;
using System.Web.Configuration;

namespace EmpPEP.UI.Controllers
{
    public class DashboardController : Controller
    {
        //
        // GET: /Dashboard/
        [HttpGet]

        public ActionResult Index()
        {
            @ViewBag.SelectedMenu = "dashboard";
            return View();
        }
        public ActionResult EmployeeDashboard()
        {
            @ViewBag.SelectedMenu = "dashboard";
            return View("EmployeeDashboard");
        }
        public ActionResult ViewAll(string Id)
        {
            @ViewBag.SelectedMenu = "dashboard";
            ViewBag.Color = Id;
            return View("ViewAllFBByManager");
        }
        public ActionResult ViewAvgRating(string Id, string EmployeeName)
        {
            @ViewBag.SelectedMenu = "dashboard";
            ViewBag.ToEmployeeId = Id;
            @ViewBag.EmpoyeeName = EmployeeName;
            return View("ViewAgvRatingsToManager");
        }
        [HttpPost]
        public ActionResult ViewAvgRating(FormCollection employee)
        {
            @ViewBag.SelectedMenu = "dashboard";
            ViewBag.EmployeeId = employee["Id"].ToString();
            @ViewBag.EmployeeName = employee["Name"].ToString();
            @ViewBag.YearCycle = employee["YearCycle"].ToString();
            return View("ViewAgvRatingsToManager");
        }

        public ActionResult DownloadPEPDocuments(string path)
        {
            string myFilePath = path;
            string ext = Path.GetExtension(myFilePath);
            string fileName = Path.GetFileName(path);
            //var FileLocation = WebConfigurationManager.AppSettings["HRPolicyFileLoc"];


            FileStream fs = new FileStream(Server.MapPath(fileName).Replace("Dashboard", "Templates"), FileMode.Open, FileAccess.Read);


            return File(fs, "application/" + ext, fileName);
        }

    }
}
