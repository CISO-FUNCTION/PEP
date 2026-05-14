using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.Security;

namespace PEP.App_Start
{
    public class NoCacheAttribute : ActionFilterAttribute
    {

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            HttpContext ctx = HttpContext.Current;

            if (ctx.Session["UserInfo"] == null)
            {

                FormsAuthentication.SignOut();
                filterContext.Result =
               new RedirectToRouteResult(new RouteValueDictionary
                 {
                   { "Controller", "Login" },
                 { "Action", "clearSession" }
                  });

            }


            base.OnActionExecuting(filterContext);

        }
    }
}