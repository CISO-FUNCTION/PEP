using EmpPEP.BusinessEntities;
using EmpPEP.BusinessLayer;
using EmpPEP.Framework.Log4Net;
using EmpPEP.WebApi.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace EmpPEP.WebApi.Controllers
{

    [RoutePrefix("api/AppraisalTypeMaster")]
    [AuthorizeAttribute]
    public class AppraisalTypeMasterController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(EmployeeKRAController));

        [HttpGet]
        
        public HttpResponseMessage Get()
        {
            try
            {
                AppraisalTypeMasterBL appraisalTypeMasterBL = new AppraisalTypeMasterBL();
                var appraisalTypeMasterEntity = appraisalTypeMasterBL.Get();

                if (appraisalTypeMasterEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }

                return ResponseMessages.CreateResponseMessage(true, appraisalTypeMasterEntity);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetAppraisalTypeMaster", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]
        
        public HttpResponseMessage Get(int id)
        {
            try
            {
                AppraisalTypeMasterBL appraisalTypeMasterBL = new AppraisalTypeMasterBL();
                var appraisalTypeMasterEntity = appraisalTypeMasterBL.Get(id);

                if (appraisalTypeMasterEntity != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, appraisalTypeMasterEntity);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetAppraisalTypeMasterById", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpPost]
        
        public HttpResponseMessage Post([FromBody] AppraisalTypeMasterEntity appraisalTypeMasterEntity)
        {
            try
            {
                if (appraisalTypeMasterEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Invalid Data");
                }

                AppraisalTypeMasterBL appraisalTypeMasterBL = new AppraisalTypeMasterBL();
                var result = appraisalTypeMasterBL.Post(appraisalTypeMasterEntity);
                if (result > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, new { AppraisalTypeId = result });
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "AppraisalTypeMasterPost", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpPut]
        
        public HttpResponseMessage Put([FromBody] AppraisalTypeMasterEntity appraisalTypeMasterEntity)
        {
            try
            {
                if (appraisalTypeMasterEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Invalid Data");
                }

                AppraisalTypeMasterBL appraisalTypeMasterBL = new AppraisalTypeMasterBL();
                bool result = appraisalTypeMasterBL.Put(appraisalTypeMasterEntity);
                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "AppraisalTypeMasterPut", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpDelete]
        
        public HttpResponseMessage Delete(int id)
        {
            try
            {
                //why is this line written
                // int FromEmployeeId = Convert.ToInt32(Request.Headers.GetValues("X-EmpNo").ToString());

                if (id == 0)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Invalid Data");
                }
                AppraisalTypeMasterBL appraisalTypeMasterBL = new AppraisalTypeMasterBL();
                bool result = appraisalTypeMasterBL.Delete(id);
                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "DeleteAppraisalTypeMaster", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }
    }
}