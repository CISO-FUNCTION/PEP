using System.Web.Mvc;

namespace EmpPEP.UI.Common
{
    /// <summary>
    /// Sets Content-Security-Policy (Path A: no scripts) and passes nonce to the Error view
    /// so inline &lt;style&gt; is allowed. Use instead of HandleErrorAttribute for unauthenticated error page.
    /// </summary>
    public class CspHandleErrorAttribute : HandleErrorAttribute
    {
        public override void OnException(ExceptionContext filterContext)
        {
            if (filterContext.ExceptionHandled || !filterContext.HttpContext.IsCustomErrorEnabled)
            {
                return;
            }

            string nonce = CspHelper.GenerateNonce();
            filterContext.Controller.ViewData["Nonce"] = nonce;
            filterContext.HttpContext.Response.AppendHeader("Content-Security-Policy", CspHelper.BuildCspNoScript(nonce));

            base.OnException(filterContext);
        }
    }
}
