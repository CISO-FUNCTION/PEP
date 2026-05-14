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
    public class PageSideBarController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(PageSideBarController));
        [HttpGet]
     //   [AuthenticateUser]
        public HttpResponseMessage Get(int EmpId)
        {
            try
            {
                if (EmpId == 0)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "Employee ID is required. Please provide a valid EmpId.");
                }

                PageSideBarBL sideBarBL = new PageSideBarBL();
                var menuList = sideBarBL.GetMenus(EmpId);
                if (menuList != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, menuList);

                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "PageSideBar\\GetMenus", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }
    }
}