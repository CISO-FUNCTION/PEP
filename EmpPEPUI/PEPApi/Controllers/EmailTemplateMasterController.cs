using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Web.Http;
using EmpPEP.BusinessEntities;
using EmpPEP.BusinessLayer;
using EmpPEP.Framework;
using AttributeRouting.Web.Http;
using EmpPEP.Framework.Log4Net;
using Newtonsoft.Json;
using EmpPEP.WebApi.Common;

namespace EmpPEP.WebApi.Controllers
{

    [AuthorizeAttribute]
    public class EmailTemplateMasterController : ApiController
    {

        readonly ILogService logService = new FileLogService(typeof(FeedbackController));


        [HttpGet]
  
        public HttpResponseMessage Get(int Id)
        {
            try
            {
                EmailTemplateMasterBL emailTemplateMasterBL = new EmailTemplateMasterBL();
                var EmailTemplateMasterEntity = emailTemplateMasterBL.Get(Id);

                if (EmailTemplateMasterEntity != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, EmailTemplateMasterEntity);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "No data found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "Get(int Id)", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }

        [HttpPost]
        [Route("api/EmailTemplateMaster/UpdateTemplate")]
        public HttpResponseMessage Post([FromBody] dynamic model)
        {
            try
            {
                int id = model.Id;
                string body = model.Body;

                if (id == 0)
                    return ResponseMessages.CreateResponseMessage(false, "Id not found");

                EmailTemplateMasterEntity obj = new EmailTemplateMasterEntity
                {
                    EmailTemplateId = id,
                    Body = body
                };

                bool result = new EmailTemplateMasterBL().Put(obj);

                return result
                    ? ResponseMessages.CreateResponseMessage(true, "Template modified")
                    : ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Could not modify the Email Template.");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "POST", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }
        [HttpPut]
        public HttpResponseMessage Put(int Id, string Body)
        {
            try
            {
                bool result = false;
                if (Id == 0)
                {
                    return ResponseMessages.CreateResponseMessage(false, "Id not found");
                }

                EmailTemplateMasterBL emailTemplateMasterBL = new EmailTemplateMasterBL();
                EmailTemplateMasterEntity obj = new EmailTemplateMasterEntity();
                obj.EmailTemplateId = Id;
                obj.Body = Body;
                result = emailTemplateMasterBL.Put(obj);
                if (result == true)
                {
                    return ResponseMessages.CreateResponseMessage(true, "Template modified");
                }

                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Could not modify the Email Template.");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "PUT", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }


        [HttpPost]
  
        public HttpResponseMessage post([FromBody] string EmaiIds)
        {
            try
            {
                EmailTemplateMasterBL emailTemplateMasterBL = new EmailTemplateMasterBL();
                int result = emailTemplateMasterBL.sendMailToKRADefaulter(EmaiIds);

                if (result > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, "Mail has been sent to Selected Defaulters.");
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "No data found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "Get(int Id)", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }
        [HttpPost]
  
        public HttpResponseMessage post(int ToEmployee, int FromEmployeeId, int actionTypeId)
        {
            try
            {
                EmailTemplateMasterBL emailTemplateMasterBL = new EmailTemplateMasterBL();

                int result = emailTemplateMasterBL.sendMailToAcknowBC(ToEmployee, FromEmployeeId, actionTypeId);

                if (result > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, "Mail has been sent.");
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "No data found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "Get(int Id)", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }
        [HttpPost]
  
        public HttpResponseMessage post(int ToEmployee, int FromEmployeeId,int EmployeeManagerId, int actionTypeId,int MailType)
        {
            try
            {
                EmailTemplateMasterBL emailTemplateMasterBL = new EmailTemplateMasterBL();

                int result = emailTemplateMasterBL.sendMailToAcknowBC(ToEmployee, FromEmployeeId, EmployeeManagerId,actionTypeId, MailType);

                if (result > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, "Mail has been sent.");
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "No data found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "Get(int Id)", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }
        
 
        [HttpPost]
        [Route("api/EmailTemplateMaster/postEmailfeedback")]
    // create for feedback autopaste mail : created by kaushal saini || created Date :6 august 2019
        public HttpResponseMessage postEmailfeedback([FromBody]EmployeeFeedbackEntity feedbackEntity)
        {
            try
            {
                if (feedbackEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "Request body is required.");
                }

                // Align sender with token when client sends 0 / wrong id (JSON binding or string ids).
                var identity = User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;
                if (userIdClaim != null && int.TryParse(userIdClaim, out int userIdFromToken))
                {
                    if (feedbackEntity.FromEmployeeId == 0)
                        feedbackEntity.FromEmployeeId = userIdFromToken;
                    else if (feedbackEntity.FromEmployeeId != userIdFromToken)
                    {
                        return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.Forbidden.ToString(), "Access denied: FromEmployeeId must match the signed-in user.");
                    }
                }

                if (feedbackEntity.ToEmployeeId <= 0 || feedbackEntity.FromEmployeeId <= 0)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "FromEmployeeId and ToEmployeeId must be valid employee ids.");
                }

                EmailTemplateMasterBL emailTemplateMasterBL = new EmailTemplateMasterBL();

                // This route is feedback-reply notification only: always use action type 5 so template path uses LoadFeedbackReplyEmailTemplate (avoids empty DB template 5/1 returning "No data found").
                const int feedbackReplyActionTypeId = 5;
                // StatusID maps to MailType in BL (reply notification). BL normalizes ActionTypeId 5 to MailType 5 except when StatusID is 1.
                int? mailType = feedbackEntity.StatusID;

                int result = emailTemplateMasterBL.sendMailToAcknowBC(feedbackEntity.ToEmployeeId, feedbackEntity.FromEmployeeId, feedbackEntity.FeedBackId, feedbackReplyActionTypeId, feedbackEntity.Feedback, mailType);

                if (result > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, "Mail has been sent.");
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(),
                        "Mail was not sent: check employee EmailAddress in the database, EmailTemplateMaster rows (5/9/1), and for non-production set OverrideMailToTest in Web.config when test users have no email.");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "Get(int Id)", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }
    }
}
