using EmpPEP.BusinessLayer;
using PEPApi.App_Start;
using System;
using System.Collections.Generic;
using System.Data;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Filters;

namespace PEPApi.Controllers
{
    // Use the correct attribute name, which is typically CustomAuthenticationFilterAttribute.
    // If your attribute is named CustomAuthenticationFilter, ensure the class exists and is accessible.
    [CustomAuthenticationFilterAttribute]
    public class GlobalAppConfigController : ApiController
    {
        [HttpGet]
        [Route("api/GlobalAppConfig/GetConfig")]
        public HttpResponseMessage GetConfig(string configKey = null)
        {
            try
            {
                GlobalAppConfigBL bl = new GlobalAppConfigBL();
                DataSet ds = bl.GetGlobalAppConfig(configKey);

                if (ds != null && ds.Tables["data"].Rows.Count > 0)
                {
                    return Request.CreateResponse(HttpStatusCode.OK, new
                    {
                        Success = true,
                        Result = ds.Tables["data"]
                    });
                }

                return Request.CreateResponse(HttpStatusCode.NotFound, new
                {
                    Success = false,
                    Message = "Configuration not found"
                });
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }

        [HttpGet]
        [Route("api/GlobalAppConfig/GetConfigValue")]
        public HttpResponseMessage GetConfigValue(string configKey)
        {
            try
            {
                GlobalAppConfigBL bl = new GlobalAppConfigBL();
                string value = bl.GetConfigValue(configKey);

                return Request.CreateResponse(HttpStatusCode.OK, new
                {
                    Success = true,
                    Result = value
                });
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }

        [AllowAnonymous]
        [HttpGet]
        [Route("api/GlobalAppConfig/GetAllConfigs")]
        public HttpResponseMessage GetAllConfigs()
        {
            try
            {
                GlobalAppConfigBL bl = new GlobalAppConfigBL();
                DataSet ds = bl.GetGlobalAppConfig(null);

                if (ds != null && ds.Tables["data"].Rows.Count > 0)
                {
                    // Convert DataTable to Dictionary for easy consumption in JavaScript
                    var configDictionary = new Dictionary<string, string>();

                    foreach (DataRow row in ds.Tables["data"].Rows)
                    {
                        // Assuming your table has columns: ConfigKey and ConfigValue
                        // Adjust column names based on your actual database schema
                        string key = row["ConfigKey"]?.ToString() ?? row[0]?.ToString();
                        string value = row["ConfigValue"]?.ToString() ?? row[1]?.ToString();

                        if (!string.IsNullOrEmpty(key))
                        {
                            configDictionary[key] = value ?? string.Empty;
                        }
                    }

                    return Request.CreateResponse(HttpStatusCode.OK, new
                    {
                        Success = true,
                        Result = configDictionary
                    });
                }

                return Request.CreateResponse(HttpStatusCode.OK, new
                {
                    Success = true,
                    Result = new Dictionary<string, string>()
                });
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }
    }
    // Define the custom authentication filter attribute if it does not already exist.
    public class CustomAuthenticationFilterAttribute : AuthorizationFilterAttribute
    {
        public override void OnAuthorization(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            // Implement your authentication logic here.
            // For now, this is a placeholder that allows all requests.
            // Replace with your actual authentication logic.
            base.OnAuthorization(actionContext);
        }
    }
}