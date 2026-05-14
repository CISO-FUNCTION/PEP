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
using EmpPEP.WebApi.Models;
using EmpPEP.WebApi.Common;
using EmpPEP.Framework.Helper;
using System.Configuration;
using System.Web.Configuration;
using System.IO;
using Microsoft.Owin.Security.OAuth;
using Microsoft.Owin.Security;
using System.Security.Claims;
using System.Web;

namespace EmpPEP.WebApi.Controllers
{

    // [AuthorizeAttribute]
    public class LoginController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(LoginController));

        public class AccessToken
        {
            public string access_token { get; set; }
        }
        //[Route("api/Login")]
        [Route("api/Login/GetSSO")]
        [HttpGet] //changed
        public HttpResponseMessage GetSSO(string paramcode)
        {
            Account result = new Account();

            try
            {
                LoginBL loginBL = new LoginBL();

                byte[] time = BitConverter.GetBytes(DateTime.UtcNow.ToBinary());
                byte[] key = Guid.NewGuid().ToByteArray();
                string token = Convert.ToBase64String(time.Concat(key).ToArray());
                EmployeeMasterBL empBL = new EmployeeMasterBL();

                string domainAccess = GenerateToken(paramcode);

                //string domainAccess = GetUserDetails(Accesstoken);

                //var empList = empBL.GetEmployeeDetailsByDomainId(domainAccess.Split('@')[0]);//objEmpLoginEntity.UserName);
                var empList = empBL.GetEmployeeDetailsByDomainId(domainAccess);//objEmpLoginEntity.UserName);

                // var appList = empBL.GetAppraisalCycleCompanyWise(empList.CompanyId, Convert.ToInt32(EnumCollection.APPRAISALCYCLE.Started));
                //   result.TokenValue = token;
                EmployeeLoginDetailsBL empLoginBL = new EmployeeLoginDetailsBL();
                EmpLoginDetailsEntity empLogin = new EmpLoginDetailsEntity();

                int CompanyId = 0;
                if (empLogin != null && empList.Tables.Count > 0)
                {
                    var Row = empList.Tables[0].Rows[0];
                    empLogin.EmployeeId = Convert.ToInt32(Row["EmployeeId"]);
                    empLogin.LoginDate = DateTime.Now;
                    empLogin.IsActive = 1;
                    empLogin.Token = "";
                    empLogin.CreatedBy = Convert.ToInt32(Row["EmployeeId"]);
                    empLogin.CreatedOn = DateTime.Now;
                    empLogin.DivisionId = Convert.ToInt32(Row["DivisionId"]);

                    EmployeePEPLoginLogEntity empLog = new EmployeePEPLoginLogEntity();
                    empLog.Activity = "Login Successfully";
                    empLog.ActivityType = "Login";
                    empLog.CreatedBy = Convert.ToInt32(Row["EmployeeId"]);
                    empLog.CreatedOn = DateTime.Now;
                    empLog.EmployeeId = Convert.ToInt32(Row["EmployeeId"]);
                    empLog.LoginDate = DateTime.Now;
                    var empInsertLogin = empLoginBL.Insert(empLogin);
                    CompanyId = Convert.ToInt32(Row["CompanyId"]);
                    var empInsertLoginLog = empLoginBL.InsertLog(empLog);

                    var identity = new ClaimsIdentity(OAuthDefaults.AuthenticationType);
                    //identity.AddClaim(new Claim(ClaimTypes.Name, credentials.Username));
                    identity.AddClaim(new Claim("UserId", Row["DomainId"].ToString()));
                    identity.AddClaim(new Claim("LoginId", Row["EmployeeId"].ToString()));
                    identity.AddClaim(new Claim(ClaimTypes.Name, Row["DomainId"].ToString()));
                    identity.AddClaim(new Claim("Role", "User"));

                    var ticket = new AuthenticationTicket(identity, new AuthenticationProperties
                    {
                        IssuedUtc = DateTime.UtcNow,
                        ExpiresUtc = DateTime.UtcNow.AddMinutes(60)
                    });

                    var tokenval = Startup.OAuthAuthorizationServerOptions.AccessTokenFormat.Protect(ticket);
                    result.TokenValue = tokenval;
                }

                EmployeeFeedbackBL employeeFeedbackBL = new EmployeeFeedbackBL();
                AppraisalCycleBL appraisalCycleBL = new BusinessLayer.AppraisalCycleBL();

                int AppraisalCycleId = appraisalCycleBL.GetCurrent(CompanyId).AppraisalCycleId;
                DateTime? FeebackDate = employeeFeedbackBL.Get(empLogin.EmployeeId, AppraisalCycleId);

                return ResponseMessages.CreateResponseMessage(true, new { LoginDetails = result, EmpDetails = empList, LatestFeebackDate = (FeebackDate), AppraisalCycleId = (AppraisalCycleId.ToString() == "" ? "0" : AppraisalCycleId.ToString()) });
            }
            catch (Exception ex)
            {
                ErrorLogEntity objErrorLogEntity = new ErrorLogEntity();

                // objErrorLogEntity.EmployeeId = Employeeid;
                objErrorLogEntity.Module = "API";
                objErrorLogEntity.Controller = "Login";
                objErrorLogEntity.Action = "GetLoginSSO";
                objErrorLogEntity.Timestamp = DateTime.Now;
                objErrorLogEntity.Error = ex.Message;


                logService.Fatal("EmpPEP.WebApi", "GetLoginSSO", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), new
                {
                    error = objErrorLogEntity
                });
            }
            //}
        }

        [HttpDelete]

        [AuthorizeAttribute]
        public HttpResponseMessage Delete()
        {
            try
            {

                EmployeeLoginDetailsBL employeeLoginMasterBL = new BusinessLayer.EmployeeLoginDetailsBL();
                EmpLoginDetailsEntity objEmpLoginEntity = new EmpLoginDetailsEntity();
                var headers = Request.Headers;
                string tokenString = "", empIdHeader = "";
                if (headers.Contains("X-Token"))
                {
                    tokenString = headers.GetValues("X-Token").First();
                }
                if (headers.Contains("X-EmpNo"))
                {
                    empIdHeader = headers.GetValues("X-EmpNo").First();
                }

                string genericToken = tokenString.Replace(@"""\", "").Replace(@"""\", "");
                string EmpID = empIdHeader.Replace(@"""\", "").Replace(@"""\", "");
                objEmpLoginEntity.Token = genericToken;
                objEmpLoginEntity.EmployeeId = Convert.ToInt32(EmpID);
                EmployeeFeedbackBL employeeFeedbackBL = new EmployeeFeedbackBL();
                bool result = employeeLoginMasterBL.Delete(objEmpLoginEntity);
                if (result)
                    return ResponseMessages.CreateResponseMessage(true, "Logged out");
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Error while logging out...");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "delete", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }


        [HttpGet]

        [AuthorizeAttribute]
        public HttpResponseMessage Get()
        {
            try
            {

                EmployeeLoginDetailsBL employeeLoginMasterBL = new BusinessLayer.EmployeeLoginDetailsBL();
                EmpLoginDetailsEntity objEmpLoginEntity = new EmpLoginDetailsEntity();
                var headers = Request.Headers;
                string tokenString = "", empIdHeader = "";
                if (headers.Contains("X-Token"))
                {
                    tokenString = headers.GetValues("X-Token").First();
                }
                if (headers.Contains("X-EmpNo"))
                {
                    empIdHeader = headers.GetValues("X-EmpNo").First();
                }

                string genericToken = tokenString.Replace(@"""\", "").Replace(@"""\", "");
                string EmpID = empIdHeader.Replace(@"""\", "").Replace(@"""\", "");

                bool result = employeeLoginMasterBL.hasTokenExpired(EmpID, genericToken);
                if (result)
                    return ResponseMessages.CreateResponseMessage(false, "Your session has expired. Please login again...");
                else
                    return ResponseMessages.CreateResponseMessage(true, "");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "hasTokenExpired", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }


        public string GenerateToken(string code)
        {
            EmployeeLoginDetailsBL employeeLoginMasterBL = new BusinessLayer.EmployeeLoginDetailsBL();
            EmpLoginDetailsEntity objEmpLoginEntity = new EmpLoginDetailsEntity();
            try
            {
                var webClient = new WebClient();
                webClient.Headers[HttpRequestHeader.CacheControl] = "no-cache";
                webClient.Headers[HttpRequestHeader.ContentType] = "application/x-www-form-urlencoded";
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
                string para = "grant_type=authorization_code&client_id=" + ConfigurationManager.AppSettings["ClientID"].ToString() + "&client_secret=" + ConfigurationManager.AppSettings["SecretID"].ToString() + "&code=" + code + "&redirect_uri=" + ConfigurationManager.AppSettings["LoginRedirection"].ToString();
                //string response = webClient.UploadString("https://login.microsoftonline.com/common/oauth2/v2.0/token", "POST", para);
                //dynamic jsonObj = Newtonsoft.Json.JsonConvert.DeserializeObject(response);

                string response = webClient.UploadString("https://login.microsoftonline.com/common/oauth2/v2.0/token", "POST", para);
                AccessToken jsonObj = Newtonsoft.Json.JsonConvert.DeserializeObject<AccessToken>(response);

                string token = jsonObj.access_token;
                return GetUserDetails(token, code);
            }
            catch (Exception ex)
            {
                ErrorLogEntity objErrorLogEntity = new ErrorLogEntity();
                ErrorLogBL objErrorLogBL = new ErrorLogBL();

                objErrorLogEntity.Module = "API";
                objErrorLogEntity.Controller = "Login";
                objErrorLogEntity.Action = "GenerateToken";
                objErrorLogEntity.Timestamp = DateTime.Now;
                objErrorLogEntity.Error = ex.Message;

                employeeLoginMasterBL.SendExcepToDB("Login", "GenerateToken", code, ex);
                return "";
            }
        }
        public string GetUserDetails(string AccessToken, string code)
        {
            EmployeeLoginDetailsBL employeeLoginMasterBL = new BusinessLayer.EmployeeLoginDetailsBL();
            EmpLoginDetailsEntity objEmpLoginEntity = new EmpLoginDetailsEntity();
            try
            {
                var webClient = new WebClient();
                webClient.Headers[HttpRequestHeader.CacheControl] = "no-cache";
                webClient.Headers[HttpRequestHeader.ContentType] = "application/x-www-form-urlencoded";
                webClient.Headers[HttpRequestHeader.Authorization] = "Bearer " + AccessToken;
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
                string response = webClient.DownloadString("https://graph.microsoft.com/v1.0/me");
                dynamic jsonObj = Newtonsoft.Json.JsonConvert.DeserializeObject(response);
                return jsonObj.userPrincipalName;
            }
            catch (Exception ex)
            {
                ErrorLogEntity objErrorLogEntity = new ErrorLogEntity();
                ErrorLogBL objErrorLogBL = new ErrorLogBL();

                objErrorLogEntity.Module = "API";
                objErrorLogEntity.Controller = "Login";
                objErrorLogEntity.Action = "GetUserDetails";
                objErrorLogEntity.Timestamp = DateTime.Now;
                objErrorLogEntity.Error = ex.Message;
                //    var empInsertLogin = objErrorLogBL.Insert(objErrorLogEntity);

                employeeLoginMasterBL.SendExcepToDB("Login", "GetUserDetails", code, ex);
                return "";
            }
        }

        [HttpPost]
        public HttpResponseMessage Post([FromBody] EmpLoginEntity objEmpLoginEntity)
        {
            Account result = new Account();
            try
            {
                LoginBL loginBL = new LoginBL();
                bool isValid = false;
                if (!String.IsNullOrEmpty(objEmpLoginEntity.token))
                {

                    string apiurl = WebConfigurationManager.AppSettings["WebApiBaseUrl"];
                    WebRequest req = WebRequest.Create(apiurl + "/api/auth/ValidateToken");
                    req.Method = "GET";
                    req.Headers.Add("token:" + objEmpLoginEntity.token);
                    req.ContentType = "application/json; charset=utf-8";
                    WebResponse resp = req.GetResponse();
                    Stream stream = resp.GetResponseStream();
                    StreamReader re = new StreamReader(stream);
                    String json = re.ReadToEnd();
                    var serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
                    EmpLoginEntity _Employee = serializer.Deserialize<EmpLoginEntity>(json);
                    if (!string.IsNullOrEmpty(_Employee.UserId) && !string.IsNullOrEmpty(_Employee.Domain))
                    {
                        objEmpLoginEntity.UserName = _Employee.UserId.Trim();
                        isValid = true;
                        //UserId = _Employee.UserName;
                        //Domain = _Employee.Domain;
                        //HttpCookie cookToken = new HttpCookie("token", token);
                        //cookToken.Expires = DateTime.Now.AddDays(1);
                        //Response.Cookies.Add(cookToken);
                        //Session["DomainId"] = Domain + @"\" + UserId;
                        ////Response.Redirect("Roles.aspx", false);
                        //RetVal = true;
                        //Domain = Domain + @"\" + UserId;

                    }
                    else
                        isValid = false;
                }

                else
                {
                    isValid = loginBL.IsEmpValid(objEmpLoginEntity.UserName, objEmpLoginEntity.Password);
                    //isValid = true;
                }

                if (isValid == true)
                {
                    byte[] time = BitConverter.GetBytes(DateTime.UtcNow.ToBinary());
                    byte[] key = Guid.NewGuid().ToByteArray();
                    string token = Convert.ToBase64String(time.Concat(key).ToArray());
                    EmployeeMasterBL empBL = new EmployeeMasterBL();
                    var empList = empBL.GetEmployeeDetailsByDomainId(objEmpLoginEntity.UserName);
                    // var appList = empBL.GetAppraisalCycleCompanyWise(empList.CompanyId, Convert.ToInt32(EnumCollection.APPRAISALCYCLE.Started));
                    //  result.TokenValue = token;
                    EmployeeLoginDetailsBL empLoginBL = new EmployeeLoginDetailsBL();
                    EmpLoginDetailsEntity empLogin = new EmpLoginDetailsEntity();
                    int CompanyId = 0;
                    if (empLogin != null && empList.Tables.Count > 0)
                    {
                        var Row = empList.Tables[0].Rows[0];
                        empLogin.EmployeeId = Convert.ToInt32(Row["EmployeeId"]);
                        empLogin.LoginDate = DateTime.Now;
                        empLogin.IsActive = 1;
                        empLogin.Token = "";
                        empLogin.CreatedBy = Convert.ToInt32(Row["EmployeeId"]);
                        empLogin.CreatedOn = DateTime.Now;
                        empLogin.DivisionId = Convert.ToInt32(Row["DivisionId"]);
                        var empInsertLogin = empLoginBL.Insert(empLogin);

                        var identity = new ClaimsIdentity(OAuthDefaults.AuthenticationType);
                        //identity.AddClaim(new Claim(ClaimTypes.Name, credentials.Username));
                        identity.AddClaim(new Claim("UserId", Row["DomainId"].ToString()));
                        identity.AddClaim(new Claim("LoginId", Row["EmployeeId"].ToString()));
                        identity.AddClaim(new Claim(ClaimTypes.Name, Row["DomainId"].ToString()));
                        identity.AddClaim(new Claim("Role", "User"));

                        var ticket = new AuthenticationTicket(identity, new AuthenticationProperties
                        {
                            IssuedUtc = DateTime.UtcNow,
                            ExpiresUtc = DateTime.UtcNow.AddMinutes(120)
                        });

                        var tokenval = Startup.OAuthAuthorizationServerOptions.AccessTokenFormat.Protect(ticket);
                        result.TokenValue = tokenval;
                    }

                    EmployeeFeedbackBL employeeFeedbackBL = new EmployeeFeedbackBL();
                    AppraisalCycleBL appraisalCycleBL = new BusinessLayer.AppraisalCycleBL();

                    int AppraisalCycleId = appraisalCycleBL.GetCurrent(CompanyId).AppraisalCycleId;
                    DateTime? FeebackDate = employeeFeedbackBL.Get(empLogin.EmployeeId, AppraisalCycleId);
                    //result.TokenValue = EncryptionDecryption.Encrypt(result.TokenValue);

                    return ResponseMessages.CreateResponseMessage(true, new { LoginDetails = result, EmpDetails = empList, LatestFeebackDate = (FeebackDate), AppraisalCycleId = (AppraisalCycleId.ToString() == "" ? "0" : AppraisalCycleId.ToString()) });

                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(false, result);
                }


                // return ResponseMessages.CreateResponseMessage(false, HttpStatusCode.BadRequest); 
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetLogin", ex.Message);
                ErrorLogEntity objErrorLogEntity = new ErrorLogEntity();

                //objErrorLogEntity.EmployeeId = Employeeid;
                objErrorLogEntity.Module = "API";
                objErrorLogEntity.Controller = "Login";
                objErrorLogEntity.Action = "GetLogin";
                objErrorLogEntity.Timestamp = DateTime.Now;
                objErrorLogEntity.Error = ex.Message;

                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), new { error = objErrorLogEntity });
            }
        }



        [HttpPost]
        [ActionName("UpdateLogin")]
        public HttpResponseMessage UpdateLogin(int EmployeeId)
        {
            try
            {
                var userId = User.Identity.Name; // Get the logged-in user ID
                TokenValidationMiddleware.LogoutUser(userId);

                EmployeeLoginDetailsBL empLoginBL = new EmployeeLoginDetailsBL();
                EmpLoginDetailsEntity empLogin = new EmpLoginDetailsEntity();
                empLogin.UpdateIntLogOutTime = DateTime.Now;
                empLogin.IsActive = 0;
                empLogin.EmployeeId = EmployeeId;
                var empInsertLogin = empLoginBL.UpdateLogin(empLogin);
                return ResponseMessages.CreateResponseMessage(true, new { Success = true });

            }
            catch (Exception ex)
            {
                ErrorLogEntity objErrorLogEntity = new ErrorLogEntity();

                // objErrorLogEntity.EmployeeId = Employeeid;
                objErrorLogEntity.Module = "API";
                objErrorLogEntity.Controller = "Login";
                objErrorLogEntity.Action = "ClearSession";
                objErrorLogEntity.Timestamp = DateTime.Now;
                objErrorLogEntity.Error = ex.Message;

                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), new { error = objErrorLogEntity });
            }
        }

    }
}

