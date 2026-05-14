using EmpPEP.WebApi.Common;
using EmpPEP.BusinessEntities;
using EmpPEP.BusinessLayer;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace EmpPEP.WebApi.Controllers
{
    public class ErrorController : ApiController
    {
        // GET: Error
        [HttpPost]
        public HttpResponseMessage Post([FromBody]ErrorLogEntity objErrorLogEntity)
        {
            ErrorLogBL objErrorLogBL = new ErrorLogBL();

            var dbErrorLog = objErrorLogBL.Insert(objErrorLogEntity);
            return ResponseMessages.CreateResponseMessage(false, new { ErrorLog = dbErrorLog });
        }
    }
}