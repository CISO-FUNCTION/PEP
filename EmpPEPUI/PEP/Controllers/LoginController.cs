using System;
using System.Collections.Generic;
using EmpPEP.UI.Models;
using EmpPEP.UI.Common;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Configuration;
using System.Web.Security;
using System.Web.SessionState;

namespace EmpPEP.UI.Controllers
{
    public class LoginController : Controller
    {
        [OverrideActionFilters]
        // GET: Login
        public ActionResult Index()
        {
            string nonce = CspHelper.GenerateNonce();
            ViewBag.Nonce = nonce;
            string[] connectSrcExtra = null;
            var apiBase = ConfigurationManager.AppSettings["PEPService"];
            if (!string.IsNullOrWhiteSpace(apiBase))
            {
                try
                {
                    var uri = new Uri(apiBase);
                    string origin = uri.GetLeftPart(UriPartial.Authority);
                    connectSrcExtra = new[] { origin };
                }
                catch { /* leave connect-src as 'self' only */ }
            }
            Response.AppendHeader("Content-Security-Policy", CspHelper.BuildCspWithScript(nonce, connectSrcExtra));

            if (ConfigurationManager.AppSettings["Environment"] == "Production")
            {
                return Redirect("https://login.microsoftonline.com/common/oauth2/v2.0/authorize?prompt=select_account&response_type=code&client_id=" + ConfigurationManager.AppSettings["ClientID"].ToString() + "&redirect_uri=" + ConfigurationManager.AppSettings["LoginRedirection"].ToString() + "&scope=openid%20profile%20email");
            }
            else
            {
              return View();
            }
            //return View();
        }

        [OverrideActionFilters]
        public ActionResult RedirectToHome(string code)
        {
            return View("Index");
        }

        [OverrideActionFilters]
        [HttpGet]
        public JsonResult RemoveSessionId()
        {

            Response.Cookies.Add(new HttpCookie("ASP.NET_SessionId", ""));
            return Json("", JsonRequestBehavior.AllowGet);
        }

        [OverrideActionFilters]
        [HttpGet]
        public JsonResult setSession(EmpDetails empObj)
        {

            Session["UserInfo"] = empObj;
            Session["LoginTime"] = DateTime.Now.ToString("h:mm:ss tt");
            Session["LoginDateTime"] = DateTime.Now;

            return Json("", JsonRequestBehavior.AllowGet);
        }

        [OverrideActionFilters]
        [HttpPost]
        public JsonResult setSessionORG(string orgConfigs)
        {
            try
            {
                if (string.IsNullOrEmpty(orgConfigs))
                {
                    return Json(new { success = false, message = "No configuration data provided" }, JsonRequestBehavior.AllowGet);
                }

                // Deserialize the JSON string to a dictionary
                var configs = Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<string, string>>(orgConfigs);

                if (configs != null && configs.Count > 0)
                {
                    // Store all configuration values in session
                    Session["OrgConfigs"] = configs;

                    // Store individual commonly used values for quick access
                    if (configs.ContainsKey("ORG_Logo_White_URL"))
                        Session["OrgLogo"] = configs["ORG_Logo_White_URL"];

                    if (configs.ContainsKey("ORG_SHORT_NAME"))
                        Session["OrgShortName"] = configs["ORG_SHORT_NAME"];

                    if (configs.ContainsKey("ORG_FULL_NAME"))
                        Session["OrgFullName"] = configs["ORG_FULL_NAME"];

                    if (configs.ContainsKey("COPYRIGHT_TEXT"))
                        Session["CopyRight"] = configs["COPYRIGHT_TEXT"];

                    if (configs.ContainsKey("ORG_NAME"))
                        Session["OrgName"] = configs["ORG_NAME"];

                    if (configs.ContainsKey("ORG_Logo_black"))
                        Session["OrgLogoBlack"] = configs["ORG_Logo_black"];

                    if (configs.ContainsKey("ORG_Account"))
                        Session["OrgAccountSmallLetter"] = configs["ORG_Account"];

                    if (configs.ContainsKey("Pep_URL"))
                        Session["PepURL"] = configs["Pep_URL"];

                    if (configs.ContainsKey("Org_FaviconUrl"))
                        Session["OrgFaviconUrl"] = configs["Org_FaviconUrl"];

                    if (configs.ContainsKey("ORG_FACEBOOK_URL"))
                        Session["OrgFacebookUrl"] = configs["ORG_FACEBOOK_URL"];

                    if (configs.ContainsKey("ORG_FACEBOOK_ICON_URL"))
                        Session["OrgFacebookIcon"] = configs["ORG_FACEBOOK_ICON_URL"];

                    if (configs.ContainsKey("ORG_LINKEDIN_URL"))
                        Session["OrgLinkedinUrl"] = configs["ORG_LINKEDIN_URL"];

                    if (configs.ContainsKey("ORG_LINKEDIN_ICON_URL"))
                        Session["OrgLinkedinIcon"] = configs["ORG_LINKEDIN_ICON_URL"];

                    if (configs.ContainsKey("ORG_TWITTER_URL"))
                        Session["OrgTwitterUrl"] = configs["ORG_TWITTER_URL"];

                    if (configs.ContainsKey("ORG_TWITTER_ICON_URL"))
                        Session["OrgTwitterIcon"] = configs["ORG_TWITTER_ICON_URL"];

                    if (configs.ContainsKey("ORG_YOUTUBE_URL"))
                        Session["OrgYoutubeUrl"] = configs["ORG_YOUTUBE_URL"];

                    if (configs.ContainsKey("ORG_YOUTUBE_ICON_URL"))
                        Session["OrgYoutubeIcon"] = configs["ORG_YOUTUBE_ICON_URL"];

                    return Json(new { success = true, message = "Organization configuration stored in session successfully" }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { success = false, message = "No configuration data found" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error storing configuration: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        [OverrideActionFilters]
        [HttpGet]
        public ActionResult clearSession()
        {
            if (Session["UserInfo"] != null)
            {
                TempData.Clear();

                Response.Cache.SetCacheability(HttpCacheability.NoCache);
                Response.Cache.SetExpires(DateTime.Now.AddSeconds(-1));
                Response.Cache.SetNoStore();
                FormsAuthentication.SignOut();

                Session.RemoveAll();
                //Session.Abandon();
                SessionIDManager manager = new SessionIDManager();
                string newSessionId = manager.CreateSessionID(System.Web.HttpContext.Current);
                Response.Cookies.Add(new HttpCookie("ASP.NET_SessionId", newSessionId));
            }
            return RedirectToAction("Index");
            // return Json("", JsonRequestBehavior.AllowGet);
        }

        [OverrideActionFilters]
        [HttpGet]
        public string GetEnvironment()
        {
            return ConfigurationManager.AppSettings["Environment"];
        }

        public JsonResult checkSession()
        {
            return Json(new { message = "false" }, JsonRequestBehavior.AllowGet);
        }

    }
}
