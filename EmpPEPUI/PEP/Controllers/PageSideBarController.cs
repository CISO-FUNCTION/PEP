using EmpPEP.UI.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace EmpPEP.UI.Controllers
{
    public class PageSideBarController : Controller
    {
        //
        // GET: /PageSideBar/
        HttpClient client;
        //The URL of the WEB API Service        

        string url = System.Configuration.ConfigurationManager.AppSettings["PEPService"];

        /// <summary>
        /// Parses the JSON body returned by GET api/PageSideBar?EmpId=... (Result.Table1 from serialized DataSet).
        /// </summary>
        private static List<SideBarMenu> ParseSideBarMenusFromApiJson(string empResponse)
        {
            var list = new List<SideBarMenu>();
            if (string.IsNullOrWhiteSpace(empResponse))
                return list;
            try
            {
                var json = JObject.Parse(empResponse);
                var resultToken = json["Result"];
                if (resultToken == null || resultToken["Table1"] == null)
                    return list;
                var partialJsonString = JsonConvert.SerializeObject(resultToken["Table1"]);
                var parsed = JsonConvert.DeserializeObject<List<SideBarMenu>>(partialJsonString);
                if (parsed != null)
                    list = parsed;
            }
            catch
            {
                // return empty list
            }
            return list;
        }

        /// <summary>
        /// Renders the sidebar from the raw API response (client calls api/PageSideBar, then POSTs the body here).
        /// </summary>
        [HttpPost]
        [ValidateInput(false)]
        public ActionResult Index()
        {
            string empResponse;
            using (var reader = new StreamReader(Request.InputStream, Encoding.UTF8))
                empResponse = reader.ReadToEnd();

            var sideBarSubMenuItemList = ParseSideBarMenusFromApiJson(empResponse);
            ViewBag.SelectedMenuAndActiveSubMenu = sideBarSubMenuItemList;
            return PartialView("_SidebarMenu", sideBarSubMenuItemList);
        }

        [HttpGet]
        //[ChildActionOnly]
        public async Task<ActionResult> Index(int? EmpId)
        {

            // ViewBag.Role = RoleId;
            //if (RoleId == null)
            //    RoleId = 3;
            List<SideBarMenu> SideBarSubMenuItemList = new List<SideBarMenu>();

            // If EmpId not provided (e.g. client sent empty before sessionStorage set), fallback to Session
            if (!EmpId.HasValue || EmpId.Value == 0)
            {
                if (Session["UserInfo"] != null)
                {
                    var userInfo = Session["UserInfo"] as EmpDetails;
                    if (userInfo != null)
                        EmpId = userInfo.EmployeeId;
                }
                if (!EmpId.HasValue || EmpId.Value == 0)
                {
                    var sid = Session["EmployeeMainId"];
                    if (sid != null)
                        EmpId = Convert.ToInt32(sid);
                }
            }

            // Do not call API without a valid EmpId (avoids "Error retrieving sidebar menus")
            if (!EmpId.HasValue || EmpId.Value == 0)
            {
                ViewBag.SelectedMenuAndActiveSubMenu = SideBarSubMenuItemList;
                return PartialView("_SidebarMenu", SideBarSubMenuItemList);
            }

            using (var client = new HttpClient())
            {
                //Passing service base url  
                client.BaseAddress = new Uri(url);
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls |
                                       SecurityProtocolType.Tls11 |
                                       SecurityProtocolType.Tls12;
                client.DefaultRequestHeaders.Clear();
                //Define request data format  
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                try
                {
                    //Sending request to find web api REST service resource GetAllEmployees using HttpClient  
                    HttpResponseMessage Res = await client.GetAsync("api/PageSideBar?EmpId=" + EmpId.Value);
                    //await Task.Delay(5000);

                    //Checking the response is successful or not which is sent using HttpClient  
                    if (Res.IsSuccessStatusCode)
                    {
                        //Storing the response details recieved from web api   
                        var EmpResponse = Res.Content.ReadAsStringAsync().Result;
                        SideBarSubMenuItemList = ParseSideBarMenusFromApiJson(EmpResponse);
                    }
                    //  string test = HttpContext.Session["IsDelegatorManager"].ToString();
                    //returning the employee list to view  
                    ViewBag.SelectedMenuAndActiveSubMenu = SideBarSubMenuItemList;
                    return PartialView("_SidebarMenu", SideBarSubMenuItemList);
                    //return null;
                }
                catch
                {
                    return PartialView("_SidebarMenu", SideBarSubMenuItemList);
                }
            }


        }

        //[HttpGet]
        //[ChildActionOnly]
        //public ActionResult GetRole(int RoleId)
        //{
        //    List<SideBarMenu> SideBarSubMenuItemList = new List<SideBarMenu>();
        //    ViewBag.MyMenu = "Test Menu link";
        //    return PartialView("_SidebarMenu", SideBarSubMenuItemList);
        //}

    }


}
