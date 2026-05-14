using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using EmpPEP.BusinessEntities;
using EmpPEP.BusinessLayer;
using EmpPEP.Framework.Log4Net;
using EmpPEP.WebApi.Common;
using Microsoft.Reporting.WebForms;
using System.Configuration;
using Newtonsoft.Json;

namespace EmpPEP.WebApi.Controllers
{

    [AuthorizeAttribute]
    public class ReportsController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(FeedbackController));

        [HttpGet]

        // [ReportAuthorization]
        //[AuthenticateUser]
        public HttpResponseMessage GetManagerFeedbackStatusReport(int AppraisalCycleId, int SubCycle, int FromEmployeeId, int LoginEmpId, int LocationAdmin, int ActionTypeId, string VSign)
        {
            try
            {
                ReportsBL reportsBL = new ReportsBL();
                var result = reportsBL.GetManagerFeedbackStatusReport(AppraisalCycleId, SubCycle, FromEmployeeId, LoginEmpId, LocationAdmin, ActionTypeId, VSign);

                if (result.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetManagerFeedbackStatusReport", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }

        [HttpGet]

        public HttpResponseMessage Get(int AppraisalCycleId, int FromEmployeeId, int ToEmployeeId, int ActionTypeId, int AreaId)
        {
            try
            {
                ReportsBL reportsBL = new ReportsBL();
                var result = reportsBL.GetStrengthWeaknessForEmployeeReport(AppraisalCycleId, FromEmployeeId, ToEmployeeId, ActionTypeId, AreaId);

                if (result.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetManagerFeedbackStatusReport", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }
        //GetStrengthWeaknessForManagerReport
        [HttpGet]

        // [ReportAuthorization]
        public HttpResponseMessage get(int AppraisalCycleId, int FromEmployeeId, int ToEmployeeId, int ActionTypeId, int AreaId, int ForManager)
        {
            try
            {
                ReportsBL reportsBL = new ReportsBL();
                var result = reportsBL.GetStrengthWeaknessForManagerReport(AppraisalCycleId, FromEmployeeId, ToEmployeeId, ActionTypeId, AreaId);

                if (result.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetManagerFeedbackStatusReport", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }


        ////GetCompetenciesAvgRatingsForGraph 
        //[HttpGet]

        //public HttpResponseMessage Get(int AppraisalCycleId, int ToEmployeeId, int ActionTypeId, int AreaId)
        //{
        //    try
        //    {
        //        ReportsBL reportsBL = new ReportsBL();
        //        var result = reportsBL.GetCompetenciesAvgRatingsForGraph(AppraisalCycleId, ToEmployeeId, ActionTypeId, AreaId);

        //        if (result.Count > 0)
        //        {
        //            return ResponseMessages.CreateResponseMessage(true, result);
        //        }
        //        else
        //            return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");

        //    }
        //    catch (Exception ex)
        //    {
        //        logService.Fatal("EmpPEP.WebApi", "GetCompetenciesAvgRatingsForGraph", ex.Message);
        //        return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
        //    }
        //}


        [HttpGet]

        public HttpResponseMessage Get(int AppraisalSubCycleId)
        {
            try
            {
                ReportsBL reportsBL = new ReportsBL();
                var result = reportsBL.GetFeedbackSelfAssessmentStatusReport(AppraisalSubCycleId);

                if (result.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetCompetenciesAvgRatingsForGraph", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }

        [HttpGet]

        // [ReportAuthorization]
        public HttpResponseMessage get(int AppraisalCycleId, int ManagerId, int LocationId, int EmpLoginId)
        {
            try
            {
                ReportsBL reportsBL = new ReportsBL();
                var result = reportsBL.GetKRADefaulterEmployeeReport1(AppraisalCycleId, ManagerId, LocationId, EmpLoginId);
                //var result1 = reportsBL.GetKRADefaulterEmployeeReport(AppraisalCycleId, ManagerId, LocationId, EmpLoginId);

                if (result.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                    return ResponseMessages.CreateResponseMessage(true, "Not Found");
                //return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetManagerFeedbackStatusReport", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }

        /// <summary>
        /// Get Training Request Report for Admin
        /// Uses DataSet for data retrieval and serializes DataTable to JSON
        /// </summary>
        [HttpGet]
        public HttpResponseMessage GetTrainingRequestReport(int AppraisalCycleId)
        {
            try
            {
                TrainingMasterBL trainingBL = new TrainingMasterBL();
                var result = trainingBL.GetTrainingRequestReport(AppraisalCycleId); // This now returns a DataSet

                if (result != null && result.Tables.Count > 0 && result.Tables[0].Rows.Count > 0)
                {
                    // Serialize DataTable to JSON
                    string json = JsonConvert.SerializeObject(result.Tables[0]);
                    return Request.CreateResponse(HttpStatusCode.OK, new { Success = true, Result = JsonConvert.DeserializeObject<List<dynamic>>(json) });
                }
                else
                {
                    return Request.CreateResponse(HttpStatusCode.OK, new { Success = true, Result = new List<dynamic>() });
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetTrainingRequestReport", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        /// <summary>
        /// Get Training Request Report for Manager
        /// Uses DataSet for data retrieval and serializes DataTable to JSON
        /// Filters by manager's team members only
        /// </summary>
        [HttpGet]
        public HttpResponseMessage GetTrainingRequestReportForManager(int AppraisalCycleId, int ManagerId)
        {
            try
            {
                TrainingMasterBL trainingBL = new TrainingMasterBL();
                var result = trainingBL.GetTrainingRequestReportForManager(AppraisalCycleId, ManagerId); // This now returns a DataSet

                if (result != null && result.Tables.Count > 0 && result.Tables[0].Rows.Count > 0)
                {
                    // Serialize DataTable to JSON
                    string json = JsonConvert.SerializeObject(result.Tables[0]);
                    return Request.CreateResponse(HttpStatusCode.OK, new { Success = true, Result = JsonConvert.DeserializeObject<List<dynamic>>(json) });
                }
                else
                {
                    return Request.CreateResponse(HttpStatusCode.OK, new { Success = true, Result = new List<dynamic>() });
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetTrainingRequestReportForManager", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        /// <summary>
        /// Get Training Status from bsc.dbo.DailyTrainingsData for Feedback screen
        /// Uses DataSet for data retrieval and serializes DataTable to JSON
        /// </summary>
        [HttpGet]
        public HttpResponseMessage GetTrainingStatusFromDailyTrainingsData(int AppraisalCycleId, string NewEmployeeCode)
        {
            try
            {
                if (string.IsNullOrEmpty(NewEmployeeCode))
                {
                    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Employee code is required.");
                }

                TrainingMasterBL trainingBL = new TrainingMasterBL();
                var result = trainingBL.GetTrainingStatusFromDailyTrainingsData(AppraisalCycleId, NewEmployeeCode);

                if (result != null && result.Tables.Count > 0 && result.Tables[0].Rows.Count > 0)
                {
                    // Serialize DataTable to JSON
                    string json = JsonConvert.SerializeObject(result.Tables[0]);
                    return Request.CreateResponse(HttpStatusCode.OK, new { Success = true, Result = JsonConvert.DeserializeObject<List<dynamic>>(json) });
                }
                else
                {
                    return Request.CreateResponse(HttpStatusCode.OK, new { Success = true, Result = new List<dynamic>() });
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetTrainingStatusFromDailyTrainingsData", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        //rating Calculation Report
        [HttpGet]

        //[ReportAuthorization]
        public HttpResponseMessage Get(int AppraisalCycleId, int FromEmployeeId, int ToEmployeeId, int ActionTypeId, string Type)
        {
            try
            {
                var headers = Request.Headers;
                int hdrEmployeeId = Convert.ToInt32(headers.GetValues("X-EmpNo").First());
                ReportsBL reportsBL = new ReportsBL();
                EmployeeMasterBL empBL = new EmployeeMasterBL();
                if (empBL.IsSuperAdmin(hdrEmployeeId, AppraisalCycleId))
                {
                    if (Type == "Breakdown")
                    {
                        var result = reportsBL.GetWeightedScoreBreakDownReport(AppraisalCycleId, FromEmployeeId, ToEmployeeId, ActionTypeId);

                        if (result.Count > 0)
                        {
                            return ResponseMessages.CreateResponseMessage(true, result);
                        }
                        else
                            return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
                    }
                    else
                    {
                        var result = reportsBL.GetWeightedScoreCalculationReport(AppraisalCycleId, FromEmployeeId, ToEmployeeId, ActionTypeId);

                        if (result.Count > 0)
                        {
                            return ResponseMessages.CreateResponseMessage(true, result);
                        }
                        else
                            return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
                    }

                }
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.Unauthorized.ToString(), "You are not authorized");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetManagerFeedbackStatusReport", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.GetBaseException() + " Message: " +
                    ex.Message + " StackTrace: " + ex.StackTrace + " InnerException: " + ex.InnerException);
            }
        }

        [HttpGet]

        //[ReportAuthorization]
        public HttpResponseMessage Get(int AppraisalCycleId, int FromEmployeeId, int ToEmployeeId,int CycleType)
        {
            try
            {
                var headers = Request.Headers;
                int hdrEmployeeId = Convert.ToInt32(headers.GetValues("X-EmpNo").First());
                ReportsBL reportsBL = new ReportsBL();
                EmployeeMasterBL empBL = new EmployeeMasterBL();
                if (empBL.IsSuperAdmin(hdrEmployeeId, AppraisalCycleId))
                {

                    var result = reportsBL.GetGOSelfAssessmentFeedbackTrackerReport(AppraisalCycleId, FromEmployeeId, ToEmployeeId, CycleType);

                    if (result.Count > 0)
                    {
                        return ResponseMessages.CreateResponseMessage(true, result);
                    }
                    else
                        return ResponseMessages.CreateResponseMessage(true, "Not Found");
                    //return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
                }


                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.Unauthorized.ToString(), "You are not authorized");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetManagerFeedbackStatusReport", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.GetBaseException() + " Message: " +
                    ex.Message + " StackTrace: " + ex.StackTrace + " InnerException: " + ex.InnerException);
            }
        }

        [HttpGet]

        // [ReportAuthorization]
        public HttpResponseMessage Get(string AppraisalCycleId, string ManagerEmployeeId, string ActionTypeId)
        {
            try
            {
                var headers = Request.Headers;
                int hdrEmployeeId = Convert.ToInt32(headers.GetValues("X-EmpNo").First());
                ReportsBL reportsBL = new ReportsBL();
                EmployeeMasterBL empBL = new EmployeeMasterBL();
                if (empBL.IsSuperAdmin(hdrEmployeeId, Convert.ToInt32(AppraisalCycleId)))
                {
                    ReportViewer rptPrintPreview = new ReportViewer();
                    rptPrintPreview.ProcessingMode = ProcessingMode.Remote;
                    rptPrintPreview.ServerReport.ReportServerUrl = new Uri(ConfigurationManager.AppSettings["ReportServerUrl"]);
                    rptPrintPreview.ServerReport.ReportPath = string.Format("{0}/{1}", ConfigurationManager.AppSettings["ReportPath"], "SubordinateRatingCaltn");

                    ReportParameter[] rptParams = new ReportParameter[3];
                    rptParams[0] = new ReportParameter("AppraisalCycleId", AppraisalCycleId.ToString());
                    rptParams[1] = new ReportParameter("FromEmployeeId", ManagerEmployeeId.ToString());
                    rptParams[2] = new ReportParameter("ActionTypeId", ActionTypeId.ToString());
                    rptPrintPreview.ServerReport.SetParameters(rptParams);

                    string format = "Excel", devInfo = @"<DeviceInfo><Toolbar>True</Toolbar></DeviceInfo>";
                    string mimeType = "", encoding = "", fileNameExtn = "";
                    string[] streams = null;
                    Warning[] warnings = null;
                    byte[] bytes = null;

                    bytes = rptPrintPreview.ServerReport.Render(format, devInfo, out mimeType, out encoding, out fileNameExtn, out streams, out warnings);
                    //String result = System.Convert.ToBase64String(bytes);
                    string filename = "RatingCalculation" + DateTime.Now.ToString("_ddMMMyyyy") + "." + fileNameExtn;
                    if (bytes.Length > 0)
                        return ResponseMessages.CreateResponseMessage(true, new { fileObject = bytes, mimeType = mimeType, fileName = filename });
                    else
                        return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NoContent.ToString(), "No Content");
                }
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.Unauthorized.ToString(), "You are not authorized");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetRatingCalculationReport", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }

        [HttpGet]

        // [ReportAuthorization]
        public HttpResponseMessage Get(int ManagerEmployeeId, int AppraisalCycleId)
        {
            try
            {
                ReportsBL reportsBL = new ReportsBL();
                var result = reportsBL.GetManagerFeedbackStatusReportForGraph(ManagerEmployeeId, AppraisalCycleId);

                if (result.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetManagerFeedbackStatusReport", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }

        [HttpGet]

        // [ReportAuthorization]
        [Route("api/Reports/GetAllEmployee")]
        public HttpResponseMessage GetAllEmployee(int AppraisalCycleId, int ManagerId, int LocationId, int EmpLoginId)
        {
            EmployeeMasterBL empMasterBL = new EmployeeMasterBL();
            //var mgrList = empMasterBL.GetManager(AppraisalCycleId, LocationId);


            try
            {
                List<GetKRADefaulterEmployeeResultEntity> allstSubordinates = new List<GetKRADefaulterEmployeeResultEntity>();

                if (ManagerId == -1)
                {
                    List<GetKRADefaulterEmployeeResultEntity> lstSubordinates1 = new List<GetKRADefaulterEmployeeResultEntity>();
                    ReportsBL reportsBLs = new ReportsBL();
                    lstSubordinates1 = reportsBLs.GetKRADefaulterEmployeeReport(AppraisalCycleId, ManagerId, LocationId, EmpLoginId);
                    allstSubordinates.AddRange(lstSubordinates1);
                }
                //else
                //{

                //    foreach (var item in mgrList)
                //    {

                //        int managerId = item.EmployeeId;
                //        EmployeeMasterBL empBL = new EmployeeMasterBL();
                //        List<GetKRADefaulterEmployeeResultEntity> lstSubordinates = new List<GetKRADefaulterEmployeeResultEntity>();
                //        if (empBL.IsManager(managerId))
                //        {
                //            ReportsBL reportsBL = new ReportsBL();
                //            lstSubordinates = reportsBL.GetKRADefaulterEmployeeReport(AppraisalCycleId, managerId, LocationId);
                //            allstSubordinates.AddRange(lstSubordinates);
                //        }

                //    }
                //}

                if (allstSubordinates.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, allstSubordinates);
                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");

            }

            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetManagerFeedbackStatusReport", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }

            // return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(),"");
        }

        [HttpGet]

        // [ReportAuthorization]
        public HttpResponseMessage Get(string Type, int EmpLoginID, DateTime StartDate, DateTime EndDate)
        {
            try
            {
                ReportsBL reportsBL = new ReportsBL();
                var result = reportsBL.GetFeedbackReport(Type, EmpLoginID, StartDate, EndDate);
                if (result.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetFeedbackReport", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }

        [HttpGet]

        //  [ReportAuthorization]
        [Route("api/Reports/GetSelectEmpfeedback")]
        public HttpResponseMessage GetSelectEmpfeedback(string Type, int EmpLoginID, int SelectdEmpID, DateTime StartDate, DateTime EndDate)
        {
            try
            {
                ReportsBL reportsBL = new ReportsBL();
                var result = reportsBL.GetSelectEmpFeedbackReport(Type, EmpLoginID, SelectdEmpID, StartDate, EndDate);
                if (result.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetFeedbackReport", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }

        [HttpGet]

        //  [ReportAuthorization]
        public HttpResponseMessage Get(string Type, int DUId, int AppraisalCycleId)
        {
            try
            {
                ReportsBL reportsBL = new ReportsBL();
                var result = reportsBL.GetDUWiseManagerFeedbackReport(DUId, AppraisalCycleId);

                if (result.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NoContent.ToString(), "No Content");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetDUWiseManagerFeedbackReport", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NoContent.ToString(), "No Content");
            }
        }

        [HttpGet]

        //  [ReportAuthorization]
        public HttpResponseMessage Get(string subordinate, int ManagerEmployeeId, int AppraisalCycleId, string Type)
        {
            try
            {
                ReportsBL reportsBL = new ReportsBL();
                var result = reportsBL.GetDUWiseSubordinateReport(ManagerEmployeeId, AppraisalCycleId, Type);

                if (result.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NoContent.ToString(), "No Content");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetDUWiseSubordinateReport", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NoContent.ToString(), "No Content");
            }
        }

        [HttpGet]
        [Route("api/Reports/GetGoalModificationSummary")]
        public HttpResponseMessage GetGoalModificationSummary(int? AppraisalCycleId = null, int? EmployeeId = null, string Status = null)
        {
            try
            {
                ReportsBL reportsBL = new ReportsBL();
                var result = reportsBL.GetGoalModificationSummaryReport(AppraisalCycleId, EmployeeId, Status);

                if (result.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NoContent.ToString(), "No records found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetGoalModificationSummary", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        [HttpGet]
        [Route("api/Reports/GetGoalModificationSummaryForManager")]
        public HttpResponseMessage GetGoalModificationSummaryForManager(int? AppraisalCycleId = null, int? ManagerId = null, string Status = null)
        {
            try
            {
                // Get ManagerId from request if not provided
                if (!ManagerId.HasValue)
                {
                    ManagerId = EmployeeAuthentication.GetEmployeeId(Request);
                }

                ReportsBL reportsBL = new ReportsBL();
                var result = reportsBL.GetGoalModificationSummaryReportForManager(AppraisalCycleId, ManagerId.Value, Status);

                if (result.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NoContent.ToString(), "No records found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetGoalModificationSummaryForManager", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        [HttpGet]
        [Route("api/Reports/GetNormalizationReport")]
        public HttpResponseMessage GetNormalizationReport(int? AppraisalCycleId = null, string LoginEmpId = null)
        {
            try
            {
                if (string.IsNullOrEmpty(LoginEmpId))
                {
                    LoginEmpId = EmployeeAuthentication.GetEmployeeId(Request).ToString();
                }

                ReportsBL reportsBL = new ReportsBL();
                var result = reportsBL.GetEmployeeTalentManagementData(AppraisalCycleId, LoginEmpId);

                if (result != null && result.Tables.Count > 0 && result.Tables[0].Rows.Count > 0)
                {
                    // Serialize DataTable to JSON
                    string json = JsonConvert.SerializeObject(result.Tables[0]);
                    return Request.CreateResponse(HttpStatusCode.OK, new { Success = true, Result = JsonConvert.DeserializeObject<List<dynamic>>(json) });
                }
                else
                {
                    return Request.CreateResponse(HttpStatusCode.OK, new { Success = true, Result = new List<dynamic>() });
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetNormalizationReport", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }


    }
}
