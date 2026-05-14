using System;
using System.Web.Http;
using System.Web.Mvc;
using PEPApi.Areas.HelpPage.ModelDescriptions;
using PEPApi.Areas.HelpPage.Models;

namespace PEPApi.Areas.HelpPage.Controllers
{
    /// <summary>
    /// The controller that will handle requests for the help page.
    /// </summary>
    public class HelpController : Controller
    {
        private const string ErrorViewName = "Error";

        public HelpController()
            : this(GlobalConfiguration.Configuration)
        {
        }

        public HelpController(HttpConfiguration config)
        {
            Configuration = config;
        }

        public HttpConfiguration Configuration { get; private set; }

        // All Help page requests redirect to Unauthorized action
        public ActionResult Index()
        {
            return RedirectToAction("Unauthorized");
        }

        public ActionResult Api(string apiId)
        {
            return RedirectToAction("Unauthorized");
        }

        public ActionResult ResourceModel(string modelName)
        {
            return RedirectToAction("Unauthorized");
        }

        // Unauthorized action - displays 401 error
        public ActionResult Unauthorized()
        {
            Response.StatusCode = 401;
            Response.StatusDescription = "Unauthorized";
            return Content("<html><head><title>401 - Unauthorized</title></head><body style='font-family: Arial, sans-serif; text-align: center; padding: 50px;'><h1>401 - Unauthorized Access</h1><p>You are not authorized to access this page.</p><p>API documentation is not publicly available.</p></body></html>", "text/html");
        }
    }
}