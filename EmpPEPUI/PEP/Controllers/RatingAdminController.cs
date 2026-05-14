using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace EmpPEP.UI.Controllers
{
    public class RatingAdminController : Controller
    {
        //
        // GET: /RatingAdmin/

        public ActionResult Index()
        {
          //  @ViewBag.accessType = data;
            return View();
        }

        public ActionResult ChooseRole()
        {
            return View();
        }


        [HttpPost]
        public ActionResult ProcessAccess(string accessType)
        {

            // return Json(new { redirectTo = Url.Action("Index", "RatingAdmin", new { data = ViewBag.accessType }) });
            if (accessType == "1" || accessType == "2")
            {
              //  ViewBag.AccessType = accessType;
                Session["AccessType"] = accessType;
                return Json(new { redirectTo = Url.Action("Index", "RatingAdmin") });


            }
            else
            {
                return Json(new { redirectTo = Url.Action("Index", "Rating") });

            }
            //else if (accessType == "2")
            //{
            //    ViewBag.accessType = "2";
            //    return Json(new { redirectTo = Url.Action("Index", "RatingAdmin", new { data = ViewBag.accessType }) });
            //}
            //else
            //{
            //    return Json(new { redirectTo = Url.Action("Index", "Rating") });
            //}
        }

    }
}
