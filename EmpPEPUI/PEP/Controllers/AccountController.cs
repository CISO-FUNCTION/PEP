using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace EmpPEP.UI.Controllers
{

    public class AccountController : Controller
    {
        public ActionResult Login()
        {
            return View();
        }

    }
}


//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Web;
//using System.Web.Mvc;
//using System.Configuration;

//namespace EmpPEP.UI.Controllers
//{
//    public class AccountController : Controller
//    {
//        //
//        // GET: /Account/
//        public ActionResult RedirectToHome(string code)
//        {
//            if (code != "")
//            {
//                return View("~/Views/Account/Login.cshtml");

//            }
//            else
//            {
//                return View("~/Views/Shared/Error.cshtml");
//            }
//        }
//        public ActionResult Login()
//        {

//            if (ConfigurationManager.AppSettings["Environment"] == "Production" && Session["DomainId"] != null)
//            {
//                return Redirect("https://login.microsoftonline.com/common/oauth2/v2.0/authorize?" + (ConfigurationManager.AppSettings["SSOPrompt"] == "" ? "" : (ConfigurationManager.AppSettings["SSOPrompt"] + "&")) + "response_type=code&client_id=" + ConfigurationManager.AppSettings["ClientID"].ToString() + "&redirect_uri=" + ConfigurationManager.AppSettings["LoginRedirection"].ToString() + "&scope=openid%20profile%20email");
//            }
//            else if (Session["DomainId"] == null)
//            {

//                return Redirect("https://login.microsoftonline.com/common/oauth2/v2.0/authorize?prompt=select_account&response_type=code&client_id=" + ConfigurationManager.AppSettings["ClientID"].ToString() + "&redirect_uri=" + ConfigurationManager.AppSettings["LoginRedirection"].ToString() + "&scope=openid%20profile%20email");

//            }
//            else
//            {
//                return Redirect("~/Views/Shared/Error.cshtml");
//            }

//        }





//    }
//}
