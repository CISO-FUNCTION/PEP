using System;
using System.Collections.Generic;
using System.Web;
using System.Web.Mvc;
using System.Configuration;

namespace EmpPEP.UI.Common
{
    public class CheckSession : ActionFilterAttribute
    {
        public CheckSession()
        {

        }
        public override void OnActionExecuted(ActionExecutedContext actionExecutedContext)
        {
            //Trace.WriteLine(string.Format("Action Method {0} executed at {1}", actionExecutedContext.ActionContext.ActionDescriptor.ActionName, DateTime.Now.ToShortDateString()), "Web API Logs");
        }

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            HttpSessionStateBase session = filterContext.HttpContext.Session;
            Controller controller = filterContext.Controller as Controller;
            string actionname = controller.RouteData.Values["action"].ToString();

            if (controller != null)
            {
                if ((session != null && session["UserInfo"] == null) || session == null)
                {
                    if (filterContext.HttpContext.Request.IsAjaxRequest())
                    {
                        filterContext.Result = new JsonResult
                        {
                            Data = new
                            {
                                message = "out"
                            },
                            JsonRequestBehavior = JsonRequestBehavior.AllowGet
                        };
                    }
                    else
                    {


                        filterContext.Result =
                        new RedirectToRouteResult(new System.Web.Routing.RouteValueDictionary
                            {
                            {"action","Index"},
                            {"controller","Login"},
                                {"returnUrl",filterContext.HttpContext.Request.RawUrl}
                                });

                        return;
                        //base.OnActionExecuting(filterContext);
                        //filterContext.HttpContext.Response.Redirect("~/Login/Logout");
                    }
                }
            }

        }

    }
}