using EmpPEP.BusinessEntities;
using EmpPEP.BusinessLayer;
using EmpPEP.Framework.Log4Net;
using EmpPEP.WebApi.Common;
using System;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace EmpPEP.WebApi.Controllers
{

    [AuthorizeAttribute]
    public class EmployeeRoleMasterController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(EmployeeRoleMasterController));

        [HttpGet]
  
        public HttpResponseMessage Get()
        {
            try
            {
                EmployeeRoleMasterBL employeeRoleMasterBL = new EmployeeRoleMasterBL();
                var employeeRoleMasterEntity = employeeRoleMasterBL.Get();
                if (employeeRoleMasterEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, employeeRoleMasterEntity);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetEmployeeRoleMaster", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]
  
        public HttpResponseMessage Get(int Id)
        {
            try
            {
                EmployeeRoleMasterBL employeeRoleMasterBL = new EmployeeRoleMasterBL();
                var employeeRoleMaster = employeeRoleMasterBL.Get(Id);
                if (employeeRoleMaster == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, employeeRoleMaster);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetEmployeeRoleMaster", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]
  
        public HttpResponseMessage Get(string filtertype, int id)
        {
            try
            {
                EmployeeRoleMasterBL employeeRoleMasterBL = new EmployeeRoleMasterBL();
                var employeeRoleMaster = employeeRoleMasterBL.Get(filtertype, id);
                if (employeeRoleMaster == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, employeeRoleMaster);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeRoleMaster_Proc", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }


        [HttpPost]
  
        public HttpResponseMessage Post([FromBody] EmployeeRoleMasterEntity employeeRoleMasterEntity)
        {
            try
            {
                if (employeeRoleMasterEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Invalid Data");
                }
                EmployeeRoleMasterBL employeeRoleMasterBL = new EmployeeRoleMasterBL();
                EmployeeMasterBL empBL = new EmployeeMasterBL();
                var result = employeeRoleMasterBL.Post(employeeRoleMasterEntity);
                if (result > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, new { RoleId = result });
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeRoleMasterPost", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpPut]
  
        public HttpResponseMessage Put([FromBody]  EmployeeRoleMasterEntity employeeRoleMasterEntity)
        {
            try
            {
                if (employeeRoleMasterEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Invalid Data");
                }
                EmployeeRoleMasterBL employeeRoleMasterBL = new EmployeeRoleMasterBL();
                var result = employeeRoleMasterBL.Put(employeeRoleMasterEntity);
                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeRoleMasterPut", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpDelete]
  
        public HttpResponseMessage Delete(int Id)
        {
            try
            {
                //why is this line written
                // int FromEmployeeId = Convert.ToInt32(Request.Headers.GetValues("X-EmpNo").ToString());

                if (Id == 0)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Invalid Data");
                }
                EmployeeRoleMasterBL employeeRoleMasterBL = new EmployeeRoleMasterBL();
                bool result = employeeRoleMasterBL.Delete(Id);
                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "DeleteEmployeeRoleMasterBL", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }
    }
}