using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace EmpPEP.UI.Controllers
{
    public class DelegatorController : Controller
    {
        //
        // GET: /Delegator/

        public ActionResult Index()
        {
            @ViewBag.DashValue1 = 8;
            return View();
        }

    }
}
