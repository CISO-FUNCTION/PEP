using EmpPEP.BusinessLayer;
using EmpPEP.Framework.Log4Net;
using EmpPEP.WebApi.Common;
using System;
using System.Collections.Generic;
using EmpPEP.BusinessEntities;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Security.Claims;
using System.Linq;

namespace EmpPEP.WebApi.Controllers
{

    [AuthorizeAttribute]
    public class EmployeeMasterController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(EmployeeMasterController));

        // [Route("api/EmployeeMaster/GetEmployeeDetails")]
        [HttpGet]
       
        public HttpResponseMessage Get(int EmployeeId)
        {
            try
            {
                EmployeeMasterBL empBL = new EmployeeMasterBL();
                var empList = empBL.GetEmployeeDetails(EmployeeId);
                if (empList != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, empList);

                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetEmployeeDetails", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }


        //     [Route("api/EmployeeMaster/GetEmployeeDetailsByDomainId/domain")]
        [HttpGet]
        public HttpResponseMessage Get(string DomainId)
        {
            try
            {
                //EmployeeAuthentication employeeAuthentication = new EmployeeAuthentication();
                //int FromEmployeeId = EmployeeAuthentication.GetEmployeeId(Request);

                //if (!employeeAuthentication.isAuthenticatedUser(Request))
                //{
                //    return Request.CreateErrorResponse(HttpStatusCode.Unauthorized, "Not Authorized");
                //}

                EmployeeMasterBL empBL = new EmployeeMasterBL();
                var empList = empBL.GetEmployeeDetailsByDomainId(DomainId);
                if (empList != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, empList);
                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetEmployeeDetailsByDomainiId", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }



        //    [Route("api/EmployeeMaster/GetPreviousManager")]
        [HttpGet]
       
        public HttpResponseMessage Get(int EmpNo, string PrevMgr)
        {
            try
            {
                EmployeeAuthentication employeeAuthentication = new EmployeeAuthentication();
                int FromEmployeeId = EmployeeAuthentication.GetEmployeeId(Request);

                if (!employeeAuthentication.isAuthenticatedUser(Request))
                {
                    return Request.CreateErrorResponse(HttpStatusCode.Unauthorized, "Not Authorized");
                }

                EmployeeMasterBL empBL = new EmployeeMasterBL();
                var empList = empBL.GetPreviousManager(EmpNo);
                if (empList != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, empList);
                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetPreviousManager", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }

        [HttpGet]

        public HttpResponseMessage Get(int AppraisalCycleId, int LocationId)
        {
            try
            {

                EmployeeMasterBL empMasterBL = new EmployeeMasterBL();
                var mgrList = empMasterBL.GetManager(AppraisalCycleId, LocationId);
                if (mgrList != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, mgrList);

                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetManagers", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]
        public HttpResponseMessage Get(string LocationId,string report)
        {
            try
            {

                EmployeeMasterBL empMasterBL = new EmployeeMasterBL();
                var mgrList = empMasterBL.GetAllManager(Convert.ToInt32(LocationId));
                if (mgrList != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, mgrList);

                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetManagers", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }
        [HttpGet]
       
        public HttpResponseMessage Get()
        {
            try
            {

                EmployeeMasterBL empMasterBL = new EmployeeMasterBL();
                var mgrList = empMasterBL.GetAllEmpList();
                if (mgrList != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, mgrList);

                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetManagers", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]
       
        public HttpResponseMessage Get(int AppraisalCycleId, int EmploginId, int LocationId)
        {
            try
            {

                EmployeeMasterBL empMasterBL = new EmployeeMasterBL();
                var mgrList = empMasterBL.GetManagenyLocationAdmin(AppraisalCycleId, EmploginId);
                if (mgrList != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, mgrList);

                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetManagers", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpPut]
       
        public HttpResponseMessage Put(int ToEmployeeId, int ByEmployeeId, int RoleId)
        {
            try
            {
                bool result = false;

                EmployeeMasterBL employeeMasterBL = new EmployeeMasterBL();
                result = employeeMasterBL.Put(ToEmployeeId, ByEmployeeId, RoleId);
                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "SetEmployee", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpPut]
       
        public HttpResponseMessage Put(int ToEmployeeId, int ByEmployeeId, int RoleId, int DUId)
        {
            try
            {
                bool result = false;

                EmployeeMasterBL employeeMasterBL = new EmployeeMasterBL();
                result = employeeMasterBL.Put(ToEmployeeId, ByEmployeeId, RoleId, DUId);
                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "SetEmployee", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpPut]
       
        public HttpResponseMessage Put(int ToEmployeeId, int ByEmployeeId, int RoleId, int multi, string DUId)
        {

            try
            {

                bool result = false;

                string[] values = DUId.Split(',');
                EmployeeMasterBL employeeMasterBL = new EmployeeMasterBL();
                List<Tuple<int, int, int, string>> mylist = new List<Tuple<int, int, int, string>>();
                foreach (var item in values)
                {
                    mylist.Add(new Tuple<int, int, int, string>(ToEmployeeId, ByEmployeeId, RoleId, item));
                }


                result = employeeMasterBL.Put(mylist);
                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }



            }


            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "SetEmployee", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }


        [HttpGet]
       
        public HttpResponseMessage Get(int EmployeeId, int AppraisalCycleId, string extra1)
        {
            try
            {
                EmployeeMasterBL empBL = new EmployeeMasterBL();
                var empList = empBL.GetEmployeeDetailsById(EmployeeId, AppraisalCycleId);
                if (empList != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, empList);

                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetEmployeeDetailsByEmpId", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }

        [HttpGet]
        //added by janice 27March2017
        public HttpResponseMessage Get(string type, int AppraisalCycleId, int DUId)
        {
            try
            {

                EmployeeMasterBL empMasterBL = new EmployeeMasterBL();
                var mgrList = empMasterBL.GetManagerListByDUId(AppraisalCycleId, DUId);
                if (mgrList != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, mgrList);

                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetManagersDUId", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpPost]
       
        public HttpResponseMessage BulkUpload(List<PEPEmployeeRatingEntity> objRatingEntity)
        {
            try
            {
                EmployeeMasterBL objMasterBL = new EmployeeMasterBL();
                var data = objMasterBL.BulkUploadEmpRating(objRatingEntity);
                if (data != 0)
                {
                    return ResponseMessages.CreateResponseMessage(false, data);
                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(true, data);
                }
            }
            catch (Exception ex)
            {
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }

        }

        /// <summary>
        /// Get All Annual Rating 
        /// </summary>
        [HttpGet]
       
        [Route("api/Employeemaster/GetAnnualRating")]

        public HttpResponseMessage GetAnnualRating(int EmployeeId, int AppraisalCycleId)
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

                EmployeeMasterBL objMasterBLL = new EmployeeMasterBL();
                var data = objMasterBLL.GetAnnualrating(EmployeeId, AppraisalCycleId);
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
    }

}
