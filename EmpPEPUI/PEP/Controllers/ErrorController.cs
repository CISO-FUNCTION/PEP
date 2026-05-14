using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using EmpPEP.UI.Common;

namespace EmpPEP.UI.Controllers
{
    // GET: Error
    [OverrideActionFilters]
    public class ErrorController : Controller
    {

        [OverrideActionFilters]
        public ActionResult NotAuthorized()
        {
            string nonce = CspHelper.GenerateNonce();
            ViewBag.Nonce = nonce;
            Response.AppendHeader("Content-Security-Policy", CspHelper.BuildCspNoScript(nonce));
            return View();
        }

        //public ActionResult Index()
        //{
        //    return View("~/Shared/Error");
        //}
        //public ActionResult NotFound()
        //{
        //    Response.StatusCode = 404;  //you may want to set this to 200
        //    return View("NotFound");
        //}
        //public ActionResult NotAuthorized()
        //{
        //    return View("NotAuthorized");
        //}

    }
}