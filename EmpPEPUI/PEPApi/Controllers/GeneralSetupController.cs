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
using Newtonsoft.Json;
using EmpPEP.WebApi.Common;



namespace EmpPEP.WebApi.Controllers
{

    [AuthorizeAttribute]
    public class GeneralSetupController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(GeneralSetupController));
       
        //Peer or other feedback.
        [HttpGet]
  
        public HttpResponseMessage Get(int FeedbackLimitId, int PieChartParameterId)
        {
            try
            {
                GeneralSetupBL objBL = new GeneralSetupBL();
                var PieChartentity = objBL.GetPieChartParameter(PieChartParameterId);
                var feedbackentity = objBL.GetFeedbackLimitsMaster(FeedbackLimitId);

                if (PieChartentity!=null)
                {
                    return ResponseMessages.CreateResponseMessage(true, new { PieChart = PieChartentity, FeedbackLimit = feedbackentity});
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "No data found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "Get(int AppraisalCycleId, int ToEmployeeId,int FromEmployeeId, int ActionTypeId)", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }

        [HttpPut]
  
        public HttpResponseMessage put(int FeedbackLimitId,int FeedbackLimitValue, int   PieChartParameterId, int  PieChartParameterValue, int EmployeeId )
        {
            try
            {
                bool result = false;
                if (FeedbackLimitValue == 0)
                {
                    return ResponseMessages.CreateResponseMessage(false, "Enter the Feedback limit Value.");
                }

                if (PieChartParameterValue == 0)
                {
                    return ResponseMessages.CreateResponseMessage(false, "Enter the PieChart Parameter Value.");
                }

                GeneralSetupBL objBl = new GeneralSetupBL(); 
                
                result = objBl.UpdateGeneralSetUp(FeedbackLimitId,FeedbackLimitValue,PieChartParameterId,PieChartParameterValue,EmployeeId);

                if (result == true)
                {
                    return ResponseMessages.CreateResponseMessage(true, "Data updated successfuly!");
                }

                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Could not update Data.");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "PUT", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

    }
}
