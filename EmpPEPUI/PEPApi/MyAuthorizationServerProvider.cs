using EmpPEP.BusinessEntities;
using EmpPEP.BusinessLayer;
using EmpPEP.WebApi.Controllers;
using Microsoft.Owin.Security.OAuth;
using Microsoft.Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Configuration;
using System.Net;

namespace EmpPEP.WebApi
{

    public class MyAuthorizationServerProvider : OAuthAuthorizationServerProvider
    {

        public override async Task ValidateClientAuthentication(OAuthValidateClientAuthenticationContext context)
        {
            // context.OwinContext.Set<string>("domain", context.Parameters["domain"]);
            context.Validated();
        }
        public override async Task GrantResourceOwnerCredentials(OAuthGrantResourceOwnerCredentialsContext context)
        {
            LoginController objLogin = new LoginController();
            var identity = new ClaimsIdentity(context.Options.AuthenticationType);

            IFormCollection parameters = await context.Request.ReadFormAsync();
            string Code = parameters.Get("Code");

            if (!String.IsNullOrEmpty(Code))
            {
                EmployeeMasterBL empBL = new EmployeeMasterBL();
                EmployeeMasterEntity objEmployeeMasterEntity = new EmployeeMasterEntity();

                string domainAccess = objLogin.GenerateToken(Code);

                var empList = empBL.GetEmployeeDetailsByDomainId(domainAccess);
                if (empList == null)
                {
                    context.SetError("InvalidUser", "You are not an authorized User");
                    return;
                }


                if (Convert.ToInt32(empList.Tables[0].Rows[0]["EmployeeRoleId"]) <= 0)
                {
                    context.SetError("InvalidUser", "You are not an authorized User");
                    return;
                }
                else
                {
                    var Row = empList.Tables[0].Rows[0];
                    identity.AddClaim(new Claim("Emp_DomainId", Row["DomainId"].ToString()));
                    identity.AddClaim(new Claim("Emp_FirstName", Row["FirstName"].ToString()));
                    identity.AddClaim(new Claim("Emp_LastName", Row["LastName"].ToString()));
                    identity.AddClaim(new Claim("FullName", "test"));
                    identity.AddClaim(new Claim("Emp_NewId", Row["NewEmployeeCode"].ToString()));
                    identity.AddClaim(new Claim("Role", "testrole"));

                    context.Validated(identity);
                }


            }
            else
            {
                context.SetError("InvalidCredentials", "Provided UserName and Password is incorrect");
                return;
            }

        }

    }
}