using EmpPEP.BusinessEntities;
using EmpPEP.BusinessLayer;
using EmpPEP.Framework.Log4Net;
using EmpPEP.WebApi.Common;
using System;
using System.Net;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Web.Http;

namespace EmpPEP.WebApi.Controllers
{

    [AuthorizeAttribute]
    public class EmployeeKRACopyController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(EmployeeKRACopyController));

        // copy KRA functionality
        [HttpPost]
  
        public HttpResponseMessage GetCopyKRA(int PreviousAppraisalCycleId, int CurrentAppraisalCycleId, int EmployeeId, int statusId)
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
                if (userIdFromToken != EmployeeId)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");

                }

                EmployeeKRABL employeeKRABL = new EmployeeKRABL();
                
                 // Call BL Validations function
                 var validations = employeeKRABL.CopyKRAValidations(PreviousAppraisalCycleId, CurrentAppraisalCycleId,EmployeeId);
                if (validations.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(false, validations);
                }

                var result = employeeKRABL.CopyKRA(PreviousAppraisalCycleId, CurrentAppraisalCycleId, EmployeeId);
                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, "G&Os Copied Successfully.Please submitt the G&Os for Managers Approval.");
                }
                else
                return ResponseMessages.CreateResponseMessage(false, "Problem in G&Os previous year G&Os.");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "Copy KRA", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }
    }
}
