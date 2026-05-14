using EmpPEP.UI.Common;
using EmpPEP.UI.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace EmpPEP.UI.Controllers
{
    public class ReportsController : Controller
    {
        string Baseurl = ConfigurationManager.AppSettings["PEPService"].ToString();
        //
        // GET: /Reports/

        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public ActionResult RenderEmailFormatpopup()
        {
            return PartialView("_EmailFormating");
        }

        [HttpGet]
        public ActionResult GetWeightageBDModal()
        {
            return PartialView("_WeightedScoreCalculation_BreakDown");
        }

        [HttpPost]
        public async Task<JsonResult> GetRatingReport(string AppraisalCycleId, string ManagerEmployeeId, string ActionTypeId)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    //Passing service base url  
                    client.BaseAddress = new Uri(Baseurl);
                    ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls |
                                       SecurityProtocolType.Tls11 |
                                       SecurityProtocolType.Tls12;
                    client.DefaultRequestHeaders.Clear();
                    //Define request data format  
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                    var headrs = Request.Headers;
                   
                    client.DefaultRequestHeaders.Add("X-EmpNo", headrs.GetValues("X-EmpNo").First());
                    client.DefaultRequestHeaders.Add("X-Token", headrs.GetValues("X-Token").First());
                    //Sending request to find web api REST service resource GetAllEmployees using HttpClient  
                    HttpResponseMessage Res = await client.GetAsync("api/Reports?AppraisalCycleId=" + AppraisalCycleId + "&ManagerEmployeeId=" + ManagerEmployeeId + "&ActionTypeId=" + ActionTypeId);
                    DownloadReport EmpInfo = null;
                    //Checking the response is successful or not which is sent using HttpClient 
                    string ReportResponse = "";
                    if (Res.IsSuccessStatusCode)
                    {
                        //Storing the response details recieved from web api   
                        ReportResponse = Res.Content.ReadAsStringAsync().Result;

                        //Deserializing the response recieved from web api and storing into the Employee list  
                        if (ReportResponse.Length > 0)
                        {
                            EmpInfo = JsonConvert.DeserializeObject<DownloadReport>(ReportResponse);
                            if (EmpInfo.Success)
                            {
                                string fullPath = Path.Combine(Server.MapPath("~/temp1"), EmpInfo.Result.fileName);
                                if (System.IO.File.Exists(fullPath))
                                {
                                    System.IO.File.Delete(fullPath);
                                }
                                using (var exportData = new MemoryStream())
                                {
                                    exportData.Write(EmpInfo.Result.fileObject, 0, EmpInfo.Result.fileObject.Length);
                                    FileStream file = new FileStream(fullPath, FileMode.Create, FileAccess.Write);
                                    exportData.WriteTo(file);
                                    file.Close();
                                }
                                return Json(new { fileName = EmpInfo.Result.fileName, errorMessage = false });
                            }
                        }
                    }
                    return Json(new { fileName = "", errorMessage = true });                    //returning the employee list to view  
                    //  return File(EmpInfo.Result.fileObject, EmpInfo.Result.mimeType, EmpInfo.Result.fileName); 
                }
            }
            catch (Exception ex)
            {
                return Json(new { errorMessage = true, Message=ex.Message+ex.StackTrace+ex.InnerException }); 
            }
        }

        [HttpGet]
        [DeleteFileAttribute]
        public ActionResult Download(string file)
        {
            try
            {
                string fullPath = Path.Combine(Server.MapPath("~/temp1"), file);
                return File(fullPath, "application/vnd.ms-excel", file);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpGet]
        public ActionResult GetDUFBSubRModal()
        {
            return PartialView("_DUWiseManagerFeedbackSubReport");
        }
    }
}
