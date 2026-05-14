using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Net.Http;
using EmpPEP.BusinessLayer;


namespace EmpPEP.WebApi.Common
{
    public class EmployeeAuthentication
    {
        public bool isAuthenticatedUser(HttpRequestMessage Request)
        {
            string tokenString = null;
            string genericToken = null;
            string empIdHeader = null;
            var re = Request;
            var headers = re.Headers;

            if (headers.Contains("X-Token"))
            {
                tokenString = headers.GetValues("X-Token").First();
            }
            if (headers.Contains("X-EmpNo"))
            {
                empIdHeader = headers.GetValues("X-EmpNo").First();
            }
            genericToken = tokenString.Replace(@"""\", "").Replace(@"""\", "");
            string EmpID = empIdHeader.Replace(@"""\", "").Replace(@"""\", "");

            EmployeeLoginDetailsBL employeeLoginDetailsBL = new EmployeeLoginDetailsBL();
            return employeeLoginDetailsBL.IsValidToken(tokenString, empIdHeader);
        }

        public static int GetEmployeeId(HttpRequestMessage Request)
        {
            string empIdHeader = null;
            if (Request.Headers.Contains("X-EmpNo"))
            {
                empIdHeader = Request.Headers.GetValues("X-EmpNo").First();
            }
            return Convert.ToInt32(empIdHeader);
        }        
    }
}