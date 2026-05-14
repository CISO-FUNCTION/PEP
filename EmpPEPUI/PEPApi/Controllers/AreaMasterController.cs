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
    public class AreaMasterController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(AreaMasterController));
        
        [HttpGet]
        
        public HttpResponseMessage Get()
        {
            try
            {
                AreaMasterBL areaMasterBL = new AreaMasterBL();
                var areaMaster = areaMasterBL.Get();
                if (areaMaster != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, areaMaster);
                }
                else
                {
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetAllAreas", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }
    }
}
