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
    public class EmployeeAwardController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(EmployeeAwardController));

        [HttpGet]
  
        public HttpResponseMessage Get()
        {
            try
            {
                EmployeeAwardsBL employeeAwardsBL = new EmployeeAwardsBL();
                var employeeAwardsEntity = employeeAwardsBL.Get();
                if (employeeAwardsEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, employeeAwardsEntity);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetEmployeeAwards", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]
  
        public HttpResponseMessage Get(int Id)
        {
            try
            {
                EmployeeAwardsBL employeeAwardsBL = new EmployeeAwardsBL();
                var employeeAwards = employeeAwardsBL.Get(Id);
                if (employeeAwards == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, employeeAwards);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetEmployeeAwards", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]
  
        public HttpResponseMessage Get(string filtertype, int id, string procedure)
        {
            try
            {
                EmployeeAwardsBL employeeAwardsBL = new EmployeeAwardsBL();
                var employeeAwards = employeeAwardsBL.Get(filtertype, id, procedure);
                if (employeeAwards == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, employeeAwards);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetEmployeeAwards_Proc", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }


        [HttpPost]
  
        public HttpResponseMessage Post([FromBody] EmployeeAwardsEntity employeeAwardsEntity)
        {
            try
            {
                if (employeeAwardsEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Invalid Data");
                }
                EmployeeAwardsBL employeeAwardsBL = new EmployeeAwardsBL();
                var validations = employeeAwardsBL.Validations(employeeAwardsEntity);
                if (validations != null)
                {
                    return ResponseMessages.CreateResponseMessage(false, validations);
                }
                EmployeeMasterBL empBL = new EmployeeMasterBL();
                int EmployeeId = 0;
                if (employeeAwardsEntity.EmployeeId != null)
                {
                    EmployeeId = (int)employeeAwardsEntity.EmployeeId;
                }
                var employeeDetailsResultEntity = empBL.GetEmployeeDetails(EmployeeId);
                var employeeResult=empBL.GetEmployeeDetailsByDomainId(employeeDetailsResultEntity.DomainId);
                AppraisalCycleBL appraisalCycleBL = new BusinessLayer.AppraisalCycleBL();
                int AppraisalCycleId = appraisalCycleBL.GetCurrent(0).AppraisalCycleId;

                if (employeeResult != null && employeeResult.Tables.Count > 0)
                {
                    var Row = employeeResult.Tables[0].Rows[0];
                    employeeAwardsEntity.ManagerId = Convert.ToInt32(Row["ManagerEmpId"]); 
                    employeeAwardsEntity.AppraisalCycleId = AppraisalCycleId;
                    employeeAwardsEntity.LocationId = Convert.ToInt32(Row["LocationId"]); 
                }
                var result = employeeAwardsBL.Post(employeeAwardsEntity);
                if (result > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, new { AwardId = result });
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeAwardsPost", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpPut]
  
        public HttpResponseMessage Put([FromBody]  EmployeeAwardsEntity employeeAwardsEntity)
        {
            try
            {
                if (employeeAwardsEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Invalid Data");
                }
                EmployeeAwardsBL employeeAwardsBL = new EmployeeAwardsBL();
                var validations = employeeAwardsBL.Validations(employeeAwardsEntity);
                if (validations != null)
                {
                    return ResponseMessages.CreateResponseMessage(false, validations);
                }
                EmployeeMasterBL empBL = new EmployeeMasterBL();
                
                int EmployeeId = 0;
                if (employeeAwardsEntity.EmployeeId != null)
                {
                    EmployeeId = (int)employeeAwardsEntity.EmployeeId;
                }
                var employeeDetailsResultEntity = empBL.GetEmployeeDetails(EmployeeId);
                var employeeResult = empBL.GetEmployeeDetailsByDomainId(employeeDetailsResultEntity.DomainId);
                AppraisalCycleBL appraisalCycleBL = new BusinessLayer.AppraisalCycleBL();
                int AppraisalCycleId = appraisalCycleBL.GetCurrent(0).AppraisalCycleId;
                if (employeeResult != null && employeeResult.Tables.Count > 0)
                {
                    var Row = employeeResult.Tables[0].Rows[0];
                    employeeAwardsEntity.ManagerId = Convert.ToInt32(Row["ManagerEmpId"]); 
                    employeeAwardsEntity.AppraisalCycleId = AppraisalCycleId;
                    employeeAwardsEntity.LocationId = Convert.ToInt32(Row["LocationId"]); 
                }
                var result = employeeAwardsBL.Put(employeeAwardsEntity);
                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "EmployeeAwardsPut", ex.Message);
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
                EmployeeAwardsBL employeeAwardsBL = new EmployeeAwardsBL();
                bool result = employeeAwardsBL.Delete(Id);
                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "DeleteEmployeeAwardsBL", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

    }
}