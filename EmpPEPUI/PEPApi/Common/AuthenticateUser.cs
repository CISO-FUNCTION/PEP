using EmpPEP.BusinessLayer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace EmpPEP.WebApi.Common
{
    public class AuthenticateUser
    {
        //    : AuthorizeAttribute
        //{
        //    public override void OnAuthorization(System.Web.Http.Controllers.HttpActionContext actionContext)
        //    {
        //        string tokenString = null;
        //        string genericToken = null;
        //        string empIdHeader = null;
        //        var req = actionContext.Request;
        //        var headers = req.Headers;

        //        if (IsAllowAnonymous(actionContext))
        //        {
        //            return;
        //        }

        //        if (!headers.Contains("X-Token") || !headers.Contains("X-EmpNo"))
        //        {
        //            actionContext.Response = ResponseMessages.CreateResponseErrorMessage(false, System.Net.HttpStatusCode.BadRequest.ToString(), "Header information is missing");
        //            return;
        //        }

        //        if (headers.Contains("X-Token"))
        //        {
        //            tokenString = headers.GetValues("X-Token").First();
        //        }
        //        if (headers.Contains("X-EmpNo"))
        //        {
        //            empIdHeader = headers.GetValues("X-EmpNo").First();
        //        }

        //        genericToken = tokenString.Replace(@"""\", "").Replace(@"""\", "");
        //        string EmpID = empIdHeader.Replace(@"""\", "").Replace(@"""\", "");

        //        EmployeeLoginDetailsBL employeeLoginDetailsBL = new EmployeeLoginDetailsBL();

        //        var isValidUser = employeeLoginDetailsBL.IsValidToken(tokenString, empIdHeader);

        //        if (!isValidUser)
        //        {                
        //            actionContext.Response = ResponseMessages.CreateResponseErrorMessage(false, System.Net.HttpStatusCode.Unauthorized.ToString(), "Not Authorized");
        //        }
        //        //else //comment if not required
        //        //{
        //        //    if (employeeLoginDetailsBL.hasTokenExpired(empIdHeader, tokenString))
        //        //        actionContext.Response = ResponseMessages.CreateResponseErrorMessage(false, "SessionTimeOut", "Session expired");
        //        //}
        //    }

        //    private static bool IsAllowAnonymous(System.Web.Http.Controllers.HttpActionContext actionContext)
        //    {
        //        //Contract.Assert(actionContext != null);
        //        return actionContext.ActionDescriptor.GetCustomAttributes<AllowAnonymousAttribute>().Any()
        //               || actionContext.ControllerContext.ControllerDescriptor.GetCustomAttributes<AllowAnonymousAttribute>().Any();
        //    }
    }
}