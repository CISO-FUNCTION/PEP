using System.Web.Http;
using System.Web.Mvc;

namespace PEPApi.Areas.HelpPage
{
    public class HelpPageAreaRegistration : AreaRegistration
    {
        public override string AreaName
        {
            get
            {
                return "HelpPage";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context)
        {
            // SECURITY: Help page disabled - redirect to unauthorized page
            context.MapRoute(
                "HelpPage_Unauthorized",
                "Help/{action}/{apiId}",
                new { controller = "Help", action = "Unauthorized", apiId = UrlParameter.Optional });
        }
    }
}