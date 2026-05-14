using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace EmpPEP.UI.Controllers
{
    public class DelegatorFeedbackController : Controller
    {
        //
        // GET: /DelegatorFeedback/

        public ActionResult Index()
        {
            @ViewBag.DashValue = 8;
            return View();
        }

    }
}
