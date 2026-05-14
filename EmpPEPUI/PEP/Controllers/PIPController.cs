using PEP.App_Start;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace PEP.Controllers
{
    public class PIPController : Controller
    {
        [OutputCache(Duration = 0, NoStore = true)]
        [NoCache]
        public ActionResult SelectRole()
        {
            return View();
        }
        //
        // GET: /PIP/
        [OutputCache(Duration = 0, NoStore = true)]
        [NoCache]
        public ActionResult Index()
        {
            return View();
        }

        [OutputCache(Duration = 0, NoStore = true)]
        [NoCache]
        public ActionResult Employee()
        {
            return View();
        }

        [HttpPost]
        public ActionResult PIPRoleView(string RoleId)
        {
            //  ViewBag.AccessType = accessType;
            Session["RoleId"] = RoleId;
            if (RoleId == "1")
            { return Json(new { redirectTo = Url.Action("Employee", "PIP") }); }
            else
            {
                return Json(new { redirectTo = Url.Action("Index", "PIP") });
            }

        }
    }
}