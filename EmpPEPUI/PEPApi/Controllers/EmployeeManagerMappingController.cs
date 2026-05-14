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
using System.Security.Claims;


namespace EmpPEP.WebApi.Controllers
{
    [Authorize]
    public class EmployeeManagerMappingController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(EmployeeManagerMappingController));

        //Get the Manager List by EmployeeId
        [HttpGet]
  
        public HttpResponseMessage Get(int AppraisalCycleId, int EmployeeId)
        {
            try
            {


                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != EmployeeId)
                {

                 return   ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access your own data.");
                    
                }


                ManagerDashboardBL managerDashboardBL = new ManagerDashboardBL();
                var Result = managerDashboardBL.GetManagerListByEmployeeId(AppraisalCycleId, EmployeeId);

                if (Result.Tables[0].Rows.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, Result);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "No Data found.");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi EmployeeManagerMappingController", "Get", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }
    }
}
