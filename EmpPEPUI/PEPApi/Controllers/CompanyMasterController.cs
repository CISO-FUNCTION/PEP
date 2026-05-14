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

    [AuthorizeAttribute]
    public class CompanyMasterController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(CompanyMasterController));

        [HttpGet]
  
        public HttpResponseMessage Get()
        {
            try
            {
                CompanyMasterBL companyMaster = new CompanyMasterBL();
                var companyMasterEntity = companyMaster.Get();

                if (companyMasterEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }

                return ResponseMessages.CreateResponseMessage(true, companyMasterEntity);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetCompanyMaster", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]
  
        public HttpResponseMessage Get(int id)
        {
            try
            {
                CompanyMasterBL companyMaster = new CompanyMasterBL();
                var companyMasterEntity = companyMaster.Get(id);

                if (companyMasterEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }

                return ResponseMessages.CreateResponseMessage(true, companyMasterEntity);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetCompanyMaster", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }
    }
}