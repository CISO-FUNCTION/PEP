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
using EmpPEP.WebApi.Common;

namespace EmpPEP.WebApi.Controllers
{

    [AuthorizeAttribute]
    public class UploadKRAMasterController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(UploadKRAMasterController));

        // Get The KRASet to display in dropdown
        [HttpGet]
   
        public HttpResponseMessage Get()
        {
            try
            {
                UploadKRAMasterBL uploadKRAMasterBL = new UploadKRAMasterBL();
                var uploadKRA = uploadKRAMasterBL.GetKRASet();
                if (uploadKRA == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, uploadKRA);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "UploadKRAMasterController", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]
  
        public HttpResponseMessage Get(int Id)
        {
            try
            {
                UploadKRAMasterBL uploadKRAMasterBL = new UploadKRAMasterBL();
                var uploadKRA = uploadKRAMasterBL.Get(Id);
                if (uploadKRA == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, uploadKRA);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "UploadKRAMasterController", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        // Get the KRA List on Selection of KRASet from dropdown
        [HttpGet]
   
        public HttpResponseMessage Get(int KRASetId, string IsSet)
        {
            try
            {
                UploadKRAMasterBL uploadKRAMasterBL = new UploadKRAMasterBL();
                var uploadKRA = uploadKRAMasterBL.Get(KRASetId, IsSet);
                if (uploadKRA == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                return ResponseMessages.CreateResponseMessage(true, uploadKRA);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "UploadKRAMasterController", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }


        // To Upload KRA for selected Employee
        [HttpPost]
  
        public HttpResponseMessage Post([FromBody] List<UploadKRAEmployeeSetEntity> uploadKRAEmployeeSetEntity)
        {
            try
            {
                EmployeeMasterBL employeeMasterBL = new BusinessLayer.EmployeeMasterBL();
                bool IsSuperAdmin = employeeMasterBL.IsSuperAdmin(Convert.ToInt32(uploadKRAEmployeeSetEntity[0].ApprovedBy), Convert.ToInt32(uploadKRAEmployeeSetEntity[0].AppraisalCycleId));

                if (!IsSuperAdmin)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotAcceptable.ToString(), "You are not authorised to Upload G&Os");
                }
                if (uploadKRAEmployeeSetEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Please provide valid data to upload.");
                }
                else
                {
                    EmployeeKRABL employeeKRABL = new EmployeeKRABL();
                    bool result = employeeKRABL.UploadKRA(uploadKRAEmployeeSetEntity);
                    if (result)
                        return ResponseMessages.CreateResponseMessage(true, "G&Os Uploaded Successfully.");
                    else
                        return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Error while Uploading.");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "POST UploadKRAMasterController", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }



    }
}
