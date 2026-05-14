using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using EmpPEP.BusinessLayer;
using EmpPEP.Framework.Log4Net;
using EmpPEP.WebApi.Common;
using System.Collections.Generic;
using EmpPEP.BusinessEntities;
using EmpPEP.WebApi.Common;
using System.Collections.Generic;
using EmpPEP.BusinessEntities;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Security.Claims;

using System.Threading.Tasks;
using System.Data.SqlClient;
using System.Configuration;
using System.Data;
using System.Data.Entity.Core.EntityClient;

namespace EmpPEP.WebApi.Controllers
{

    [AuthorizeAttribute]
    public class RatingController : ApiController
    {
        // GET: Rating
        readonly ILogService logService = new FileLogService(typeof(RatingController));


        [HttpPost]
        public HttpResponseMessage Post([FromBody] List<EmployeeRatingNormailizationDetailsEntity> ratingRequest)
        {
            try
            {
                PEPratingMasterBL PEPratingBL = new BusinessLayer.PEPratingMasterBL();

                if (ratingRequest == null)
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest, "Invalid data received.");
                }

                if (ratingRequest == null || !ratingRequest.Any())
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest, "Invalid data provided.");
                }
                int returnresult = PEPratingBL.InsertUpdateRating(ratingRequest);
                if (returnresult > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, returnresult);

                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, returnresult);
                }

            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }


        [HttpPost]
        public HttpResponseMessage UpdateConsent(int AppraisalCycleId, int LogEmpId, int SelectEmpId, int action, int RoleId)
        {
            try
            {
                PEPratingMasterBL PEPratingBL = new BusinessLayer.PEPratingMasterBL();


                int returnresult = PEPratingBL.UpdateConsent(AppraisalCycleId, LogEmpId, SelectEmpId, action, RoleId);
                if (returnresult > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, returnresult);

                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, returnresult);
                }

            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }
        [HttpPost]
        [Route("api/Rating/SendMailAfterAction")]
        // create for feedback autopaste mail : created by kaushal saini || created Date :6 august 2019
        public HttpResponseMessage SendMailAfterAction([FromBody] EmployeeDataEntity empData)
        {
            try
            {
                PEPratingMasterBL ratingMasterBL = new PEPratingMasterBL();

                int result = ratingMasterBL.SendMailAfterAction(empData.EmpId, empData.action, empData.selectedEmployees, empData.Role);


                if (result > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "There is some Error!!");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "SendMailAfterAction", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }
        [HttpGet]

        [Route("api/Rating/GetEmpName")]
        public HttpResponseMessage GetEmpName(string Input)
        {
            try
            {
                PEPratingMasterBL ratingMasterBL = new PEPratingMasterBL();
                var empList = ratingMasterBL.GetEmpName(Input);
                if (empList == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, empList);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetEmpName", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpPost]
        [Route("api/Rating/RatingReferBack")]
        public HttpResponseMessage RatingReferBack([FromBody] List<EmployeeRatingNormailizationDetailsEntity> ratingRequest)
        {
            try
            {
                PEPratingMasterBL PEPratingBL = new BusinessLayer.PEPratingMasterBL();

                if (ratingRequest == null)
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest, "Invalid data received.");
                }

                if (ratingRequest == null || !ratingRequest.Any())
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest, "Invalid data provided.");
                }
                int returnresult = PEPratingBL.ReferbackRating(ratingRequest);
                if (returnresult > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, returnresult);

                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, returnresult);
                }

            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }

        }


        //[HttpPut]
        //[AuthenticateUser]
        //public HttpResponseMessage PUT([FromBody] List<EmployeeRatingNormailizationDetailsEntity> employeeRatingNormailizationDetailEntity)
        //{
        //    try
        //    {
        //        int result = 0;
        //        PEPratingMasterBL PEPratingBL = new BusinessLayer.PEPratingMasterBL();
        //        EmployeeRatingNormailizationDetailsEntity employeeRatingNormailizationDetail = new EmployeeRatingNormailizationDetailsEntity();
        //        if (employeeRatingNormailizationDetailEntity == null)
        //        {
        //            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Please provide valid data to give rating.");
        //        }
        //        else
        //        {
        //            PEPratingMasterBL PEPratingkBL = new PEPratingMasterBL();

        //            foreach (var ERN in employeeRatingNormailizationDetailEntity)
        //            {

        //                employeeRatingNormailizationDetail.AppraisalCycleId = ERN.AppraisalCycleId;
        //                employeeRatingNormailizationDetail.PEPEmployeeId = ERN.PEPEmployeeId;
        //                employeeRatingNormailizationDetail.Rating = PEPratingBL.EncryptString(ERN.Rating);
        //                employeeRatingNormailizationDetail.RatingGivenBy = ERN.RatingGivenBy;
        //                employeeRatingNormailizationDetail.RecoForPromotion = ERN.RecoForPromotion;
        //                employeeRatingNormailizationDetail.Status = ERN.Status;
        //                employeeRatingNormailizationDetail.Comments = ERN.Comments;
        //                employeeRatingNormailizationDetail.Id = ERN.Id;


        //                result = PEPratingBL.update(employeeRatingNormailizationDetail);
        //            }
        //            if (result != 0)
        //                return ResponseMessages.CreateResponseMessage(true, "Feedback Saved!");
        //            else
        //                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Error while sending feedback...");
        //        }

        //    }
        //    catch (Exception ex)
        //    {
        //        logService.Fatal("EmpPEP.WebApi", "post", ex.Message);
        //        return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
        //    }
        //}

        [HttpPost]

        [Route("api/Rating/GetRatingData")]
        public HttpResponseMessage Get([FromBody] RatingParameterDetail Request)
        {
            try
            {

                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != Request.LoginEmployeeId)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }


                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var mgrList = objRatingBLL.GetDashBoardEmployeeRatingDetailsYearWise(Request.AppraisalCycleId, Request.LoginEmployeeId, Request.ReporteeIds, Request.AllSelected, Request.RoleId, Request.CriticalityPriorityId);
                if (mgrList != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, mgrList);

                }
                else
                    return ResponseMessages.CreateResponseMessage(false, mgrList);
            }
            catch (Exception ex)
            {
                ErrorLogEntity objErrorLogEntity = new ErrorLogEntity();
                ErrorLogBL objErrorLogBL = new ErrorLogBL();

                objErrorLogEntity.Module = "API";
                objErrorLogEntity.Controller = "RatingController";
                objErrorLogEntity.Action = "api/Rating/GetRatingData";
                objErrorLogEntity.Timestamp = DateTime.Now;
                objErrorLogEntity.Error = ex.Message;
                var empInsertLogin = objErrorLogBL.Insert(objErrorLogEntity);

                logService.Fatal("EmpPEP.WebApi", "PracticeGridView\\GetDashBoardEmployeeRatingDetailsYearWise", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }


        [Route("api/Rating/PracticeGridView")]

        [HttpGet]

        public HttpResponseMessage PracticeGridView(int AppraisalCycleId, string Practice, int LogEmpID)
        {
            try
            {

                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var mgrList = objRatingBLL.PracticeGridView(AppraisalCycleId, Practice, LogEmpID);
                if (mgrList != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, mgrList);

                }
                else
                    return ResponseMessages.CreateResponseMessage(false, mgrList);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "Rating\\PracticeGridView", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }


        [HttpGet]

        [Route("api/Rating/GetConfirmationRatingGivenCount")]
        public HttpResponseMessage GetConfirmationRatingGivenCount(int AppraisalCycleId, int LoginEmployeeId)
        {
            try
            {

                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != LoginEmployeeId)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }

                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var mgrList = objRatingBLL.GetConfirmationRatingGivenCount(AppraisalCycleId, LoginEmployeeId);
                if (mgrList != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, mgrList);

                }
                else
                    return ResponseMessages.CreateResponseMessage(false, mgrList);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetConfirmationRatingGivenCount", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }





        [HttpGet]

        [Route("api/Rating/GetRatingHistory")]
        public HttpResponseMessage GetRatingHistory(int AppraisalCycleId, int EmpID, int LogEmpId)
        {
            try
            {

                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var ratingHistory = objRatingBLL.GetRatingHistoryDetails(AppraisalCycleId, EmpID, LogEmpId);
                if (ratingHistory != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, ratingHistory);

                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetRatingHistory", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }


        [HttpGet]

        [Route("api/Rating/GetRMHistory")]
        public HttpResponseMessage GetRMHistory(int EmpID)
        {
            try
            {

                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var ratingHistory = objRatingBLL.GetRMHistoryDetails(EmpID);
                if (ratingHistory != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, ratingHistory);

                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetRatingHistory", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }
        [HttpGet]

        [Route("api/Rating/GetApprovedRating")]
        public HttpResponseMessage GetApprovedRating(int AppraisalCycleId, int LoginEmployeeId, string ReporteeIds, bool AllSelected)
        {
            try
            {

                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != LoginEmployeeId)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }

                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var mgrList = objRatingBLL.GetEmployeeApprovedRatingDetailsYearWise(AppraisalCycleId, LoginEmployeeId, ReporteeIds, AllSelected);
                if (mgrList != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, mgrList);

                }
                else
                    return ResponseMessages.CreateResponseMessage(false, mgrList);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetManagersDUId", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]

        [Route("api/Rating/GetAspireeReporteeList")]
        public HttpResponseMessage GetAspireeReporteeList(int AppraisalCycleId, int LoginEmployeeId, int RoleId)
        {
            try
            {
                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != LoginEmployeeId)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }

                PEPratingMasterBL ratingMasterBL = new PEPratingMasterBL();
                var ratinglist = ratingMasterBL.GetAspireeReporteeList(AppraisalCycleId, LoginEmployeeId, RoleId);
                if (ratinglist == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                // Slim DTO: Json.NET serialization of DataSet is very slow; client expects Result.data[] (Ratings.js).
                DataTable reporteeTable = (ratinglist.Tables != null && ratinglist.Tables.Count > 0) ? ratinglist.Tables[0] : null;
                var reporteeRows = new List<object>(reporteeTable?.Rows.Count ?? 0);
                if (reporteeTable != null)
                {
                    foreach (DataRow row in reporteeTable.Rows)
                    {
                        reporteeRows.Add(new
                        {
                            EmployeeId = row["EmployeeId"] == DBNull.Value ? null : Convert.ToString(row["EmployeeId"]),
                            EmployeeName = row["EmployeeName"] == DBNull.Value ? null : Convert.ToString(row["EmployeeName"]),
                            IsDP = row["IsDP"] == DBNull.Value ? 0 : Convert.ToInt32(row["IsDP"])
                        });
                    }
                }
                return ResponseMessages.CreateResponseMessage(true, new { data = reporteeRows });
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetReporteeList", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }


        [HttpGet]

        [Route("api/Rating/IsloginEmpSubmittedRatings")]
        public HttpResponseMessage IsloginEmpSubmittedRatings(int AppraisalCycleId, int LoginEmployeeId, int RoleId)
        {
            try
            {
                PEPratingMasterBL ratingMasterBL = new PEPratingMasterBL();
                var ratinglist = ratingMasterBL.IsloginEmpSubmittedRatings(AppraisalCycleId, LoginEmployeeId, RoleId);
                if (ratinglist == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, ratinglist);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetReporteeList", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]

        [Route("api/Rating/IsDesignationUploaded")]
        public HttpResponseMessage IsDesignationUploaded(int AppraisalCycleId)
        {
            try
            {
                PEPratingMasterBL ratingMasterBL = new PEPratingMasterBL();
                var ratinglist = ratingMasterBL.IsDesignationUploaded(AppraisalCycleId);
                if (ratinglist == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, ratinglist);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetReporteeList", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }


        [HttpGet]

        [Route("api/Rating/GetPracticeList")]
        public HttpResponseMessage GetPracticeList(int LoginEmployeeId)
        {
            try
            {
                PEPratingMasterBL ratingMasterBL = new PEPratingMasterBL();
                var ratinglist = ratingMasterBL.GetPracticeList(LoginEmployeeId);
                if (ratinglist == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, ratinglist);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetReporteeList", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }
        [HttpGet]

        [Route("api/Rating/GetGradeList")]
        public HttpResponseMessage GetGradeList()
        {
            try
            {
                PEPratingMasterBL ratingMasterBL = new PEPratingMasterBL();
                var ratinglist = ratingMasterBL.GetGradeList();
                if (ratinglist == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, ratinglist);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetReporteeList", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }
        [HttpGet]
        [Route("api/Rating/GetRatingAppraisalCycleId")]
        public HttpResponseMessage GetRatingAppraisalCycleId(int loginEmployeeId)
        {
            try
            {
                if (loginEmployeeId <= 0)
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest, "loginEmployeeId is required.");
                }

                AppraisalCycleBL appraisalCycleBL = new AppraisalCycleBL();
                int? ratingAppraisalCycleId = appraisalCycleBL.GetRatingAppraisalCycleId(loginEmployeeId);

                if (!ratingAppraisalCycleId.HasValue || ratingAppraisalCycleId.Value <= 0)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "No rating appraisal cycle found. Ensure dbo.GetRatingAppraisalCycleId exists and returns a row.");
                }

                return ResponseMessages.CreateResponseMessage(true, new { RatingAppraisalCycleId = ratingAppraisalCycleId.Value });
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetRatingAppraisalCycleId", ex.Message);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]

        [Route("api/Rating/GetRoleList")]
        public HttpResponseMessage GetRoleList(int AppraisalId, int LoginEmpId)
        {
            try
            {
                PEPratingMasterBL ratingMasterBL = new PEPratingMasterBL();
                var ratinglist = ratingMasterBL.GetRoleList(AppraisalId, LoginEmpId);
                if (ratinglist == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, ratinglist);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetReporteeList", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }


        [HttpGet]

        [Route("api/Rating/GetAccountList")]
        public HttpResponseMessage GetAccountList()
        {
            try
            {
                PEPratingMasterBL ratingMasterBL = new PEPratingMasterBL();
                var ratinglist = ratingMasterBL.GetAccountList();
                if (ratinglist == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, ratinglist);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetAccountList", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]

        [Route("api/Rating/GetRatingList")]
        public HttpResponseMessage GetRatingList()
        {
            try
            {
                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var data = objRatingBLL.GetRating();
                if (data != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, data);

                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, data);
                }
            }
            catch (Exception ex)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }


        [HttpPost]

        [Route("api/Rating/GetDataForChart")]
        public HttpResponseMessage GetDataForChart([FromBody] RatingParameterDetail Request)
        {
            try
            {
                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != Request.LoginEmployeeId)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }

                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var data = objRatingBLL.GetDataForChart(Request.LoginEmployeeId, Request.AppraisalCycleId, Request.ReporteeIds, Request.GradeId, Request.LocationId, Request.GroupAccountId, Request.Gender, Request.EmpStatus, Request.Promotion, Request.RoleId);
                if (data != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, data);

                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, data);
                }
            }
            catch (Exception ex)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        [HttpGet]

        [Route("api/Rating/GetDataForChartStudioView")]
        public HttpResponseMessage GetDataForChartStudioView(int EMPID, int AppraisalCycleId, string Practice, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus, string Promotion, int RoleId, string criticalityPriorityIds = null)
        {
            try
            {
                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var data = objRatingBLL.GetDataForChartStudioView(AppraisalCycleId, EMPID, Practice, GradeId, LocationId, GroupAccountId, Gender, EmpStatus, Promotion, RoleId, criticalityPriorityIds);
                if (data != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, data);

                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, data);
                }
            }
            catch (Exception ex)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }





        [HttpGet]

        [Route("api/Rating/GetDataChartForImmediateReportee")]
        public HttpResponseMessage GetDataChartForImmediateReportee(int EMPID, int AppraisalCycleId, string IReportee, string GradeId, string LocationId, string GroupAccountId)
        {
            try
            {
                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != EMPID)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }

                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var data = objRatingBLL.GetDataChartForImmediateReportee(EMPID, AppraisalCycleId, IReportee, GradeId, LocationId, GroupAccountId);
                if (data != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, data);

                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, data);
                }
            }
            catch (Exception ex)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }
        [HttpPost]

        [Route("api/Rating/GetMaleFemaleNormalization")]
        public HttpResponseMessage GetMaleFemaleNormalization([FromBody] RatingParameterDetail Request)
        {
            try
            {
                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != Request.LoginEmployeeId)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }
                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var data = objRatingBLL.GetMalefemaleNorm(Request.LoginEmployeeId, Request.AppraisalCycleId, Request.ReporteeIds, Request.GradeId, Request.LocationId, Request.GroupAccountId, Request.Gender, Request.EmpStatus, Request.Promotion, Request.RoleId,Request.CriticalityPriorityId);
                if (data != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, data);

                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, data);
                }
            }
            catch (Exception ex)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }


        [HttpPost]

        [Route("api/Rating/GetRatingOverallData")]
        public HttpResponseMessage GetRatingOverallData([FromBody] RatingParameterDetail Request)
        {
            try
            {

                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != Request.LoginEmployeeId)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }

                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var data = objRatingBLL.GetRatingOverallData(Request.AppraisalCycleId, Request.LoginEmployeeId, Request.ReporteeIds, Request.GradeId, Request.LocationId, Request.GroupAccountId, Request.Gender, Request.EmpStatus, Request.Promotion, Request.RoleId, Request.CriticalityPriorityId);
                if (data != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, data);

                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, data);
                }
            }
            catch (Exception ex)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }


        [Route("api/Rating/GetRatingOverallDataStudioView")]
        public HttpResponseMessage GetRatingOverallDataStudioView(int AppraisalCycleId, int EMPID, string Practice, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus, string Promotion, int RoleId, string criticalityPriorityIds = null)
        {
            try
            {
                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var data = objRatingBLL.GetRatingOverallDataStudioView(AppraisalCycleId, EMPID, Practice, GradeId, LocationId, GroupAccountId, Gender, EmpStatus, Promotion, RoleId, criticalityPriorityIds);
                if (data != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, data);

                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, data);
                }
            }
            catch (Exception ex)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }


        [Route("api/Rating/GetMaleFemaleNormalizationStudioView")]
        public HttpResponseMessage GetMaleFemaleNormalizationStudioView(int EMPID, int AppraisalCycleId, string Practice, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus,string Promotion, int RoleId, string criticalityPriorityIds = null)
        {
            try
            {
                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var data = objRatingBLL.GetMaleFemaleNormalizationStudioView(EMPID, AppraisalCycleId, Practice, GradeId, LocationId, GroupAccountId, Gender, EmpStatus, Promotion, RoleId, criticalityPriorityIds);
                if (data != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, data);

                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, data);
                }
            }
            catch (Exception ex)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }




        [HttpPost]

        [Route("api/Rating/GetRatingPromotionDetails")]
        public HttpResponseMessage GetRatingPromotionDetails([FromBody] RatingParameterDetail Request)
        {
            try
            {
                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != Request.LoginEmployeeId)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }

                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var data = objRatingBLL.GetRatingPromotionDetails(Request.AppraisalCycleId, Request.LoginEmployeeId, Request.ReporteeIds, Request.GradeId, Request.LocationId, Request.GroupAccountId, Request.Gender, Request.EmpStatus, Request.RoleId, Request.CriticalityPriorityId);
                if (data != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, data);

                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, data);
                }
            }
            catch (Exception ex)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }
        [HttpPost]

        [Route("api/Rating/GetRatingMaleFemalePromotionDetails")]
        public HttpResponseMessage GetRatingMaleFemalePromotionDetails([FromBody] RatingParameterDetail Request)
        {
            try
            {
                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != Request.LoginEmployeeId)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }
                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var data = objRatingBLL.GetRatingMaleFemalePromotionDetails(Request.AppraisalCycleId, Request.LoginEmployeeId, Request.ReporteeIds, Request.GradeId, Request.LocationId, Request.GroupAccountId, Request.Gender, Request.EmpStatus, Request.RoleId,Request.CriticalityPriorityId);
                if (data != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, data);

                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, data);
                }
            }
            catch (Exception ex)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        [HttpPost]

        [Route("api/Rating/GetDataforPromotionGraph")]
        public HttpResponseMessage GetDataforPromotionGraph([FromBody] RatingParameterDetail Request)
        {
            try
            {
                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != Request.LoginEmployeeId)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }

                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var data = objRatingBLL.GetDataforPromotionGraph(Request.AppraisalCycleId, Request.LoginEmployeeId, Request.ReporteeIds, Request.GradeId, Request.LocationId, Request.GroupAccountId, Request.Gender, Request.EmpStatus, Request.RoleId);
                if (data != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, data);

                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, data);
                }
            }
            catch (Exception ex)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }


        [HttpGet]

        [Route("api/Rating/GetRatingPracticeLeadWisePromotionDetails")]

        public HttpResponseMessage GetRatingPractiseLeadWisePromotionDetails(int AppraisalCycleId, int LogEmpID, string Practice, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus)

        {

            try

            {
                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != LogEmpID)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }

                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();

                var data = objRatingBLL.GetRatingPracticeLeadWisePromotionDetails(AppraisalCycleId, LogEmpID, Practice, GradeId, LocationId, GroupAccountId, Gender, EmpStatus);

                if (data != null)

                {

                    return ResponseMessages.CreateResponseMessage(true, data);

                }

                else

                {

                    return ResponseMessages.CreateResponseMessage(false, data);

                }

            }

            catch (Exception ex)

            {

                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);

            }

        }
        [HttpGet]

        [Route("api/Rating/GetRatingMaleFemalePracticeLeadWisePromotionDetails")]

        public HttpResponseMessage GetRatingMaleFemalePracticeLeadWisePromotionDetails(int AppraisalCycleId, int LogEmpID, string Practice, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus)

        {

            try

            {
                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != LogEmpID)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }
                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();

                var data = objRatingBLL.GetRatingMaleFemalePracticeLeadWisePromotionDetails(AppraisalCycleId, LogEmpID, Practice, GradeId, LocationId, GroupAccountId, Gender, EmpStatus);

                if (data != null)

                {

                    return ResponseMessages.CreateResponseMessage(true, data);

                }

                else

                {

                    return ResponseMessages.CreateResponseMessage(false, data);

                }

            }

            catch (Exception ex)

            {

                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);

            }

        }
        [HttpGet]

        [Route("api/Rating/GetDataforPracticeLeadWisePromotionGraph")]
        public HttpResponseMessage GetDataforPracticeLeadWisePromotionGraph(int AppraisalCycleId, int LogEmpID, string Practice, string GradeId, string LocationId, string GroupAccountId, string Gender, string EmpStatus)
        {

            try
            {
                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != LogEmpID)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }
                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();

                var data = objRatingBLL.GetDataforPracticeLeadWisePromotionGraph(AppraisalCycleId, LogEmpID, Practice, GradeId, LocationId, GroupAccountId, Gender, EmpStatus);

                if (data != null)

                {

                    return ResponseMessages.CreateResponseMessage(true, data);

                }
                else
                {

                    return ResponseMessages.CreateResponseMessage(false, data);

                }

            }

            catch (Exception ex)

            {

                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);

            }

        }

        [HttpGet]

        [Route("api/RatingAdmin/GetAdminRatingVisibility")]
        public HttpResponseMessage GetAdminRatingVisibility(int AppraisalCycleId)
        {
            try
            {
                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var data = objRatingBLL.GetAdminRatingVisibility(AppraisalCycleId);
                if (data != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, data);
                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, data);
                }
            }
            catch (Exception ex)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        [HttpGet]

        [Route("api/Rating/GetDataForDropdown")]
        public HttpResponseMessage GetDataForDropdown(int AppraisalCycleId, int LoginEmployeeId, int RoleId)
        {
            try
            {

                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != LoginEmployeeId)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }
                PEPratingMasterBL objRatingBLL = new PEPratingMasterBL();
                var mgrList = objRatingBLL.GetDataForDropdown(AppraisalCycleId, LoginEmployeeId, RoleId);
                if (mgrList != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, mgrList);

                }
                else
                    return ResponseMessages.CreateResponseMessage(false, mgrList);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetDataForDropdown", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        #region Column Visibility API Endpoints

        /// <summary>
        /// Get column configuration for Rating table
        /// </summary>
        [HttpGet]
        [Route("api/Rating/GetColumnConfiguration")]
        public HttpResponseMessage GetColumnConfiguration(string PageType = "Rating")
        {
            try
            {
                RatingColumnVisibilityBL columnVisibilityBL = new RatingColumnVisibilityBL();
                var columnConfig = columnVisibilityBL.GetRatingColumnConfiguration(PageType);
                
                if (columnConfig != null && columnConfig.Tables.Count > 0 && columnConfig.Tables[0].Rows.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, columnConfig.Tables[0]);
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "No column configuration found.");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetColumnConfiguration", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Get user's saved column preferences
        /// </summary>
        [HttpGet]
        [Route("api/Rating/GetUserColumnPreferences")]
        public HttpResponseMessage GetUserColumnPreferences(int EmployeeId, string PageType = "Rating")
        {
            try
            {
                // Get UserId from the Token
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.Unauthorized.ToString(), "Access Denied!");
                }

                int userIdFromToken = int.Parse(userIdClaim);

                // Ensure the User can only access their own data
                if (userIdFromToken != EmployeeId)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.Forbidden.ToString(), "Access Denied! You can only access your own preferences.");
                }

                RatingColumnVisibilityBL columnVisibilityBL = new RatingColumnVisibilityBL();
                var preferences = columnVisibilityBL.GetUserColumnPreferences(EmployeeId, PageType);
                
                if (preferences != null && preferences.Tables.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, preferences.Tables[0]);
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "No preferences found.");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetUserColumnPreferences", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Save user's column visibility preferences
        /// </summary>
        [HttpPost]
        [Route("api/Rating/SaveUserColumnPreferences")]
        public HttpResponseMessage SaveUserColumnPreferences(int EmployeeId, [FromBody] SaveUserColumnPreferencesRequest request, string PageType = "Rating")
        {
            try
            {
                // [FromBody] string binds as null in Web API 2 when sending JSON; use wrapper object for reliable binding
                string VisibleColumnIds = request?.VisibleColumnIds;

                // Get UserId from the Token
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.Unauthorized.ToString(), "Access Denied!");
                }

                int userIdFromToken = int.Parse(userIdClaim);

                // Ensure the User can only modify their own data
                if (userIdFromToken != EmployeeId)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.Forbidden.ToString(), "Access Denied! You can only modify your own preferences.");
                }

                if (string.IsNullOrWhiteSpace(VisibleColumnIds))
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "Invalid column IDs provided.");
                }

                RatingColumnVisibilityBL columnVisibilityBL = new RatingColumnVisibilityBL();
                var result = columnVisibilityBL.SaveUserColumnPreferences(EmployeeId, VisibleColumnIds, PageType);
                
                if (result != null && result.Tables.Count > 0 && result.Tables[0].Rows.Count > 0)
                {
                    var success = Convert.ToInt32(result.Tables[0].Rows[0]["Success"]);
                    var message = result.Tables[0].Rows[0]["Message"].ToString();
                    
                    if (success == 1)
                    {
                        return ResponseMessages.CreateResponseMessage(true, message);
                    }
                    else
                    {
                        return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), message);
                    }
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), "Failed to save preferences.");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "SaveUserColumnPreferences", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        #endregion

        #region Criticality Details API Endpoints

        /// <summary>
        /// Get criticality details for an employee
        /// </summary>
        [HttpGet]
        [Route("api/Rating/GetCriticalityDetails")]
        public HttpResponseMessage GetCriticalityDetails(int PEPEmployeeId, int AppraisalCycleId)
        {
            try
            {
                PEPratingMasterBL ratingBL = new PEPratingMasterBL();
                var criticalityData = ratingBL.GetCriticalityDetails(PEPEmployeeId, AppraisalCycleId);
                
                // Return empty object if no data found (first time inputter) instead of 404
                if (criticalityData == null)
                {
                    criticalityData = new EmployeeRatingNormailizationDetailsEntity
                    {
                        PEPEmployeeId = PEPEmployeeId,
                        AppraisalCycleId = AppraisalCycleId,
                        CriticalityReasons = null,
                        CriticalityPriority = null,
                        AttritionRisk = null,
                        AttritionRiskReason = null,
                        ImmediateBackup = null,
                        SuccessorName = null
                    };
                }
                
                return ResponseMessages.CreateResponseMessage(true, criticalityData);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetCriticalityDetails", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Save criticality details for an employee
        /// </summary>
        [HttpPost]
        [Route("api/Rating/SaveCriticalityDetails")]
        public HttpResponseMessage SaveCriticalityDetails([FromBody] EmployeeRatingNormailizationDetailsEntity criticalityData)
        {
            try
            {
                if (criticalityData == null || criticalityData.PEPEmployeeId == 0)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "Invalid criticality data.");
                }

                // Validate Criticality Reasons (max 2)
                if (!string.IsNullOrEmpty(criticalityData.CriticalityReasons))
                {
                    var reasons = criticalityData.CriticalityReasons.Split(',');
                    if (reasons.Length > 2)
                    {
                        return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "Maximum 2 criticality reasons allowed.");
                    }
                }

                // Validate Criticality Priority (25% limit) - if priority is selected
                // This validation will be done in the business layer
                
                // IMPORTANT: Criticality details can be saved WITHOUT rating
                // This should NOT mark the employee as "rating submitted"
                // Only rating+promotion data should trigger submission

                PEPratingMasterBL ratingBL = new PEPratingMasterBL();
                var result = ratingBL.SaveCriticalityDetails(criticalityData);
                
                if (result > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, "Criticality details saved successfully.");
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), "Failed to save criticality details.");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "SaveCriticalityDetails", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Clear criticality details for a reportee (calls sp_RemoveCriticalityDetails).
        /// </summary>
        [HttpPost]
        [Route("api/Rating/RemoveCriticalityDetails")]
        public HttpResponseMessage RemoveCriticalityDetails([FromBody] RemoveCriticalityRequest request)
        {
            try
            {
                if (request == null || request.PEPEmployeeId == 0 || request.AppraisalCycleId == 0)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "Invalid request.");
                }

                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity?.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;
                if (userIdClaim == null || !int.TryParse(userIdClaim, out int userIdFromToken) || userIdFromToken != request.RatingGivenBy)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.Forbidden.ToString(), "Access denied.");
                }

                PEPratingMasterBL ratingBL = new PEPratingMasterBL();
                int? roleId = request.RoleId > 0 ? request.RoleId : (int?)null;
                var result = ratingBL.RemoveCriticalityDetails(request.PEPEmployeeId, request.AppraisalCycleId, request.RatingGivenBy, roleId);

                if (result > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, "Criticality details removed successfully.");
                }
                if (result == 0)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "No criticality details to remove or record not found.");
                }

                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), "Failed to remove criticality details.");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "RemoveCriticalityDetails", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Get Criticality Reasons master data
        /// </summary>
        [HttpGet]
        [Route("api/Rating/GetCriticalityReasons")]
        public HttpResponseMessage GetCriticalityReasons()
        {
            try
            {
                PEPratingMasterBL ratingBL = new PEPratingMasterBL();
                var reasons = ratingBL.GetCriticalityReasons();
                return ResponseMessages.CreateResponseMessage(true, reasons);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetCriticalityReasons", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Get Criticality Priority master data
        /// </summary>
        [HttpGet]
        [Route("api/Rating/GetCriticalityPriorities")]
        public HttpResponseMessage GetCriticalityPriorities()
        {
            try
            {
                PEPratingMasterBL ratingBL = new PEPratingMasterBL();
                var priorities = ratingBL.GetCriticalityPriorities();
                return ResponseMessages.CreateResponseMessage(true, priorities);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetCriticalityPriorities", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Get Attrition Risk master data
        /// </summary>
        [HttpGet]
        [Route("api/Rating/GetAttritionRisks")]
        public HttpResponseMessage GetAttritionRisks()
        {
            try
            {
                PEPratingMasterBL ratingBL = new PEPratingMasterBL();
                var risks = ratingBL.GetAttritionRisks();
                return ResponseMessages.CreateResponseMessage(true, risks);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetAttritionRisks", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Get active employees in logged-in employee's span
        /// Excludes the employee for whom criticality details are being filled
        /// </summary>
        [HttpGet]
        [Route("api/Rating/GetEmployeesInSpan")]
        public HttpResponseMessage GetEmployeesInSpan(int ManagerId, int AppraisalCycleId, int ExcludeEmployeeId = 0)
        {
            try
            {
                PEPratingMasterBL ratingBL = new PEPratingMasterBL();
                var employees = ratingBL.GetEmployeesInSpan(ManagerId, AppraisalCycleId, ExcludeEmployeeId);
                return ResponseMessages.CreateResponseMessage(true, employees);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetEmployeesInSpan", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Get complete hierarchical span count for an employee
        /// </summary>
        [HttpGet]
        [Route("api/Rating/GetCompleteSpanCount")]
        public HttpResponseMessage GetCompleteSpanCount(int EmployeeId, int AppraisalCycleId, int? RoleId = null)
        {
            try
            {
                PEPratingMasterBL ratingBL = new PEPratingMasterBL();
                int spanCount = ratingBL.GetCompleteSpanCount(EmployeeId, AppraisalCycleId, RoleId);
                return ResponseMessages.CreateResponseMessage(true, new { SpanCount = spanCount });
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetCompleteSpanCount", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Validate criticality marking limit (25% of span, minimum 1)
        /// Returns: isValid, maxAllowed, currentCount, spanCount, errorMessage
        /// </summary>
        [HttpGet]
        [Route("api/Rating/ValidateCriticalityMarkingLimit")]
        public HttpResponseMessage ValidateCriticalityMarkingLimit(int EmployeeId, int AppraisalCycleId, int? RoleId = null)
        {
            try
            {
                PEPratingMasterBL ratingBL = new PEPratingMasterBL();
                var validation = ratingBL.ValidateCriticalityMarkingLimit(EmployeeId, AppraisalCycleId, RoleId);
                return ResponseMessages.CreateResponseMessage(true, new 
                { 
                    IsValid = validation.Item1,
                    MaxAllowed = validation.Item2,
                    CurrentCount = validation.Item3,
                    SpanCount = validation.Item4,
                    ErrorMessage = validation.Item5
                });
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "ValidateCriticalityMarkingLimit", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Validate priority marking limit (P1: 5%, P2: 5%, P3: 15% of span)
        /// </summary>
        [HttpGet]
        [Route("api/Rating/ValidatePriorityMarkingLimit")]
        public HttpResponseMessage ValidatePriorityMarkingLimit(int EmployeeId, int AppraisalCycleId, string PriorityCode, decimal PercentageLimit, int? RoleId = null)
        {
            try
            {
                PEPratingMasterBL ratingBL = new PEPratingMasterBL();
                var validation = ratingBL.ValidatePriorityMarkingLimit(EmployeeId, AppraisalCycleId, PriorityCode, PercentageLimit, RoleId);
                return ResponseMessages.CreateResponseMessage(true, new 
                { 
                    IsValid = validation.Item1,
                    MaxAllowed = validation.Item2,
                    CurrentCount = validation.Item3,
                    SpanCount = validation.Item4,
                    ErrorMessage = validation.Item5
                });
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "ValidatePriorityMarkingLimit", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Get current cycle and previous 2 cycles with ShortFYName for dynamic table headers
        /// Uses stored procedure with DataSet
        /// </summary>
        [HttpGet]
        [Route("api/Rating/GetCyclesForTableHeaders")]
        public HttpResponseMessage GetCyclesForTableHeaders(int AppraisalCycleId)
        {
            try
            {
                AppraisalCycleBL appraisalCycleBL = new AppraisalCycleBL();
                DataSet cyclesDataSet = appraisalCycleBL.GetCyclesForTableHeaders(AppraisalCycleId);
                
                if (cyclesDataSet == null || cyclesDataSet.Tables.Count == 0 || cyclesDataSet.Tables[0].Rows.Count == 0)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "No cycles found");
                }

                // Convert DataSet to List of anonymous objects for JSON serialization
                var cycles = new List<object>();
                DataTable dt = cyclesDataSet.Tables[0];
                
                foreach (DataRow row in dt.Rows)
                {
                    cycles.Add(new
                    {
                        AppraisalCycleId = Convert.ToInt32(row["AppraisalCycleId"]),
                        ShortFYName = row["ShortFYName"].ToString(),
                        IsCurrent = Convert.ToInt32(row["IsCurrent"]) == 1
                    });
                }

                return ResponseMessages.CreateResponseMessage(true, cycles);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetCyclesForTableHeaders", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Get employee recognitions (awards) from Aspire database
        /// Accepts NewEmployeeCode, business layer will look up OldEmployeeCode internally
        /// </summary>
        [HttpGet]
        [Route("api/Rating/GetEmployeeAspireAwards")]
        public HttpResponseMessage GetEmployeeAspireAwards(string NewEmployeeCode, int AppraisalCycleId)
        {
            try
            {
                if (string.IsNullOrEmpty(NewEmployeeCode))
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "Employee code is required.");
                }

                if (AppraisalCycleId <= 0)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "Appraisal Cycle ID is required.");
                }

                PEPratingMasterBL ratingBL = new PEPratingMasterBL();
                var awards = ratingBL.GetEmployeeAspireAwards(NewEmployeeCode, AppraisalCycleId);
                return ResponseMessages.CreateResponseMessage(true, awards);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetEmployeeAspireAwards", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        #endregion

        /// <summary>
        /// Get Criticality Priority dropdown data for filter from CriticalityMaster table
        /// </summary>
        [HttpGet]
        [Route("api/Rating/GetCriticalityPriorityForDropdown")]
        public HttpResponseMessage GetCriticalityPriorityForDropdown()
        {
            try
            {
                PEPratingMasterBL _ratingBL = new PEPratingMasterBL();
                var result = _ratingBL.GetCriticalityPriorityForDropdown();
                return ResponseMessages.CreateResponseMessage(true, result);
            }
            catch (Exception ex)
            {
                return ResponseMessages.CreateResponseMessage(true, ex.Message);
            }
        }
    }
}