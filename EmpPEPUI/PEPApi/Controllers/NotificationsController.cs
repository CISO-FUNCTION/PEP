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
    public class NotificationsController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(NotificationsController));
        //Feedback Notifications.
        [HttpGet]
  
        public HttpResponseMessage Get(int AppraisalCycleId, int ToEmployeeId)
        {
            try
            {
                NotificationsBL notificationsBL = new NotificationsBL();
                var notifications_ResultEntity = notificationsBL.GetNotifications(AppraisalCycleId, ToEmployeeId);

                if (notifications_ResultEntity.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, notifications_ResultEntity);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "No data found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "NotificationsController", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }

        //KRA Notifications.
        [HttpGet]
  
        public HttpResponseMessage Get(int AppraisalCycleId, int ToEmployeeId, string NotificationsType)
        {
            try
            {
                NotificationsBL notificationsBL = new NotificationsBL();
                var notifications_ResultEntity = notificationsBL.GetNotificationsForKRA(AppraisalCycleId, ToEmployeeId);

                if (notifications_ResultEntity.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, notifications_ResultEntity);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "No data found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "NotificationsController", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }

    }
}
