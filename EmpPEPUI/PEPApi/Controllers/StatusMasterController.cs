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
using System.Web.Routing;

namespace EmpPEP.WebApi.Controllers
{
    [RoutePrefix("api/StatusMaster")]
    [AuthorizeAttribute]
    public class StatusMasterController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(StatusMasterController));
        [HttpGet]

        [Route("GetType")]
        public HttpResponseMessage GetType(string StatusType)
        {
            try
            {
                if (StatusType == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "Missing Information");
                }
                else
                {
                    StatusMasterBL statusMasterBL = new StatusMasterBL();
                    var StatusMasterResultEntity = statusMasterBL.Get(StatusType);

                    if (StatusMasterResultEntity != null)
                    {
                        return ResponseMessages.CreateResponseMessage(true, StatusMasterResultEntity);
                    }
                    else
                        return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "StatusMaster", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]
  
        [Route("GetKRAById")]
        public HttpResponseMessage GetKRAById(int Id)
        {
            try
            {
                if (Id == 0)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "Missing Information");
                }
                else
                {
                    StatusMasterBL statusMasterBL = new StatusMasterBL();
                    var StatusMasterResultEntity = statusMasterBL.Get(Id);

                    if (StatusMasterResultEntity != null)
                    {
                        return ResponseMessages.CreateResponseMessage(true, StatusMasterResultEntity);
                    }
                    else
                        return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "StatusMaster", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }
    }
}