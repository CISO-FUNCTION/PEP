using EmpPEP.BusinessEntities;
using EmpPEP.BusinessLayer;
using EmpPEP.Framework.Helper;
using EmpPEP.Framework.Log4Net;
using EmpPEP.WebApi.Common;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace EmpPEP.WebApi.Controllers
{

    [AuthorizeAttribute]
    [RoutePrefix("api/Search")]
    public class SearchController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(SearchController));

        [Route("GetEmployeeByName")]
        [HttpGet]
  
        public HttpResponseMessage GetEmployeeByName(string Name, int? LocationId = null)
        {
            try
            {

                EmployeeMasterBL empBL = new EmployeeMasterBL();
                var empList = empBL.GetEmployeeByNames(Name, LocationId);
                if (empList != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, empList);

                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetEmployeeByName", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }


        [HttpGet]
        [Route("GetById")]
        public HttpResponseMessage Get(string Name,  int EmpLoginId, int? LocationId = null)
        {
            try
            {

                EmployeeMasterBL empBL = new EmployeeMasterBL();
                var empList = empBL.GetEmployeeByNamesByLocationAdmin(Name, LocationId, EmpLoginId);
                if (empList != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, empList);

                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetEmployeeByName", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]
   //added by janice 27March2018
        public HttpResponseMessage Get(int EmpLoginID, string Name,  string LocationAdmin)
        {
            try
            {

                EmployeeMasterBL empBL = new EmployeeMasterBL();
                var empList = empBL.GetEmployeesLocationWise(Name, EmpLoginID);
                if (empList != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, empList);

                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetEmployeeByName", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]
 // added by janice 27March2018
        public HttpResponseMessage Get(string Name, int DUId, string type)
        {
            try
            {

                EmployeeMasterBL empBL = new EmployeeMasterBL();
                var empList = empBL.GetEmployeeByNameDUId(Name, DUId);
                if (empList != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, empList);

                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetEmployeeByName", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }
        // [Route("api/Search/GetEmployeeByMgrId")]
        [HttpGet]
  
        public HttpResponseMessage Get(int ManagerId, string Name, int AppraisalCycleId)
        {
            try
            {
                List<GetSubordinatesByManagerId_ResultEntity> empList = new List<GetSubordinatesByManagerId_ResultEntity>();
                EmployeeMasterBL empBL = new EmployeeMasterBL();
                if (empBL.IsManager(ManagerId))
                {
                    empList = empBL.GetSubordinatesNameByManagerId(ManagerId, Name, AppraisalCycleId);

                    if (empList != null)
                    {

                        return ResponseMessages.CreateResponseMessage(true, empList);

                    }
                    else
                        return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
                }
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.Unauthorized.ToString(), "You are not authorized");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeMaster\\GetEmployeeByName", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }
    }
}