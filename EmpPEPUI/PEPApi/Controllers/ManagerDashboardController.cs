using EmpPEP.BusinessLayer;
using EmpPEP.WebApi.Common;
using EmpPEP.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using EmpPEP.Framework.Log4Net;

namespace EmpPEP.WebApi.Controllers
{

    [AuthorizeAttribute]
    public class ManagerDashboardController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(ManagerDashboardController));
        //  [Route("api/ ManagerDashboard/GetFeedbackCountForManagerGraph")]
        [HttpGet]
  
        public HttpResponseMessage Get(int AppraisalCycleId, int FromEmployeeId, int ActionTypeId)
        {
            try
            {
                ManagerDashboardBL managerDashboardBL = new ManagerDashboardBL();
                var Result = managerDashboardBL.Get(AppraisalCycleId, FromEmployeeId, ActionTypeId);

                if (Result.Tables[0].Rows.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, Result);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "No Data found.");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi ManagerDashboardController", "Get", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        //   [Route("api/ManagerDashboard/GetFeedbackCountForManagerDashboard")]
        [HttpGet]
  
        public HttpResponseMessage Get(int AppraisalCycleId, int FromEmployeeId, int ActionTypeId, string Color, int selectedyear)
        {
            try
            {
                ManagerDashboardBL managerDashboardBL = new ManagerDashboardBL();
                var Result = managerDashboardBL.Get(AppraisalCycleId, FromEmployeeId, ActionTypeId, Color, selectedyear);
                var RCount = managerDashboardBL.Get(AppraisalCycleId, FromEmployeeId, ActionTypeId);
                if (Result.Tables[0].Rows.Count > 0 || RCount.Tables[0].Rows.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, new { FeedbackCount = Result, TeamCount = RCount });
                    //return ResponseMessages.CreateResponseMessage(true, Result);
                    //return ResponseMessages.CreateResponseMessage(true, new { LoginDetails = result, EmpDetails = empList, LatestFeebackDate = (FeebackDate == "" ? "Feedback Not given" : FeebackDate), AppraisalCycleId = (AppraisalCycleId.ToString() == "" ? "0" : AppraisalCycleId.ToString()) });
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "No Data found.");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi ManagerDashboardController", "Get", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        //   for subordinates to display on the Managers Dashboard
        [HttpGet]
  
        public HttpResponseMessage Get(int ManagerId, int AppraisalCycleId,string SelectSubcycle, string selfAssesment)
        {
            try
            {
                EmployeeMasterBL employeeMasterBL = new EmployeeMasterBL();
                var Result = employeeMasterBL.GetSubordinatesByManagerIdForDashboard(ManagerId, AppraisalCycleId, SelectSubcycle);

                if (Result.Tables[0].Rows.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, Result);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "No Data found.");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi ManagerDashboardController", "Get", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        //   [Route("api/ManagerDashboard/GetEmployeeAvgRatings")]
        [HttpGet]
  
        public HttpResponseMessage Get(int AppraisalCycleId, int FromEmployeeId, int ToEmployeeId, int ActionTypeId, int AreaId, int selectedyear)
        {
            try
            {
                ManagerDashboardBL managerDashboardBL = new ManagerDashboardBL();
                var Result = managerDashboardBL.Get(AppraisalCycleId, FromEmployeeId, ToEmployeeId, ActionTypeId, AreaId, selectedyear);

                if (Result.Tables[0].Rows.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, Result);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "No Data found.");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi ManagerDashboardController", "Get", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }
        [HttpGet]

        public HttpResponseMessage Get(int ManagerId, int AppraisalCycleId, string SelectSubcycle)
        {
            try
            {
                ManagerDashboardBL employeeMasterBL = new ManagerDashboardBL();
                var Result = employeeMasterBL.Get(ManagerId, AppraisalCycleId, SelectSubcycle);

                if (Result.Tables[0].Rows.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, Result);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "No Data found.");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi ManagerDashboardController", "Get", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }
    }
}






























