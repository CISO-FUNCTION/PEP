using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using EmpPEP.BusinessEntities;
using EmpPEP.BusinessLayer;
using EmpPEP.Framework;
using AttributeRouting.Web.Http;
using EmpPEP.Framework.Log4Net;
using Newtonsoft.Json;
using EmpPEP.WebApi.Common;
using System.Web.Routing;
namespace EmpPEP.WebApi.Controllers
{

    [AuthorizeAttribute]
    public class DelegatorController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(DelegatorController));


        [Route("api/Delegator/UpdateDelegator")]
        [HttpPost]
        public HttpResponseMessage Put(int AppraisalCycleId, int FromEmployeeId, int EmpMgrMapId, int ToEmployeeId, string Action)
        {
            try
            {
                bool result = false;

                DelegatorBL delegatorBL = new DelegatorBL();

                var validations = delegatorBL.Validations(AppraisalCycleId, FromEmployeeId, EmpMgrMapId, ToEmployeeId, Action);
                if ((validations.Count > 0) && Action == "U")
                {
                    return ResponseMessages.CreateResponseMessage(false, validations);
                }
                if ((validations.Count > 0) && Action == "D")
                {
                    return ResponseMessages.CreateResponseMessage(false, validations);
                }

                result = delegatorBL.Put(AppraisalCycleId, FromEmployeeId, EmpMgrMapId, ToEmployeeId, Action);


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
                logService.Fatal("EmpPEP.WebApi", "SetEmployeeKRA", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpPut]
  
        public HttpResponseMessage Put([FromBody] List<DelegatorEntity> delegatorEntity)
        {
            try
            {
                bool result = false;
                DelegatorBL delegatorBL = new DelegatorBL();
                List<DelegatorEntity> lstdelegatorEntity = new List<DelegatorEntity>(); 
                
                
                foreach (var item in delegatorEntity)
                {
                    var validations = delegatorBL.Validations(item.AppraisalCycleId, item.FromEmployeeId, item.EmpMgrMapId, item.ToEmployeeId, item.Action);
                    if ((validations.Count > 0) && item.Action == "U")
                    {
                        
                        foreach (var iteminn in validations)
                        {
                            DelegatorEntity obj = new DelegatorEntity();
                            obj.SuccessMessage = iteminn.ErrorMessage;
                            obj.EmployeeName = iteminn.Fieldvalue;
                            lstdelegatorEntity.Add(obj);
                        }
                    }

                    result = delegatorBL.Put(item.AppraisalCycleId, item.FromEmployeeId, item.EmpMgrMapId, item.ToEmployeeId, item.Action);
                    if (result)
                    {
                        //Message Format
                        EmployeeManagerMappingEntity  mappingDetails = delegatorBL.GetEmployeeMappingDetails(item.EmpMgrMapId);
                        EmployeeMasterBL objBL = new EmployeeMasterBL();
                        var employeeDetails = objBL.GetEmployeeDetails(mappingDetails.EmployeeId);
                        DelegatorEntity obj = new DelegatorEntity();
                        obj.SuccessMessage = "Delegator changes successfuly.";
                        obj.EmployeeName = employeeDetails.FirstName + ' ' + employeeDetails.LastName + ' ' + employeeDetails.NewEmployeeCode;
                        lstdelegatorEntity.Add(obj);
                    }
                    else
                    {
                        var mappingDetails = delegatorBL.GetEmployeeMappingDetails(item.EmpMgrMapId);
                        EmployeeMasterBL objBL = new EmployeeMasterBL();
                        var employeeDetails = objBL.GetEmployeeDetails(mappingDetails.EmployeeId);
                        DelegatorEntity obj = new DelegatorEntity();
                        obj.SuccessMessage = "Issue In Mapping.";
                        obj.EmployeeName = employeeDetails.FirstName + ' ' + employeeDetails.LastName + ' ' + employeeDetails.NewEmployeeCode;
                        lstdelegatorEntity.Add(obj);
                        
                    }
                }
                if(lstdelegatorEntity.Count>0)
                {
                    return ResponseMessages.CreateResponseMessage(true, lstdelegatorEntity);
                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, result);
                }

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "SetEmployeeKRA", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

    }
}