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
using System.Security.Claims;


namespace EmpPEP.WebApi.Controllers
{

    [AuthorizeAttribute]
    public class FeedbackController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(FeedbackController));



        //[Route("api/Feedback/GetEmployeeFeedbackToView")]
        [HttpGet]

        public HttpResponseMessage Get(int Id, bool list = false)
        {
            try
            {
                dynamic employeeFeedbackEntity = null;
                EmployeeFeedbackBL employeeFeedbackBL = new EmployeeFeedbackBL();

                if (list == true)
                {
                    employeeFeedbackEntity = employeeFeedbackBL.GetFeedback(Id);
                }
                else
                {
                    employeeFeedbackEntity = employeeFeedbackBL.Get(Id);
                }

                int FeedbackLimit = employeeFeedbackBL.GetFeedbackLimit();
                if (employeeFeedbackEntity != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, new { employeeFeedbackEntity = employeeFeedbackEntity, FeedbackLimit = FeedbackLimit });
                }
                else
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "Get(int Id)", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }


        //Peer or other feedback.
        [HttpGet]

        public HttpResponseMessage Get(int AppraisalCycleId, int ToEmployeeId, int FromEmployeeId, int ActionTypeId)
        {
            try
            {
                EmployeeFeedbackBL employeeFeedbackBL = new EmployeeFeedbackBL();
                var employeeFeedback_ResultEntity = employeeFeedbackBL.Get(AppraisalCycleId, ToEmployeeId, FromEmployeeId, ActionTypeId);

                if (employeeFeedback_ResultEntity.Tables[0].Rows.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, employeeFeedback_ResultEntity);
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
        // for selected year
        //Created by Garima for History of feedback 11-19-2018
        [HttpGet]

        public HttpResponseMessage Get(int AppraisalCycleId, int ToEmployeeId, int FromEmployeeId, int ActionTypeId, int SelectedYear)
        {
            try
            {
                EmployeeFeedbackBL employeeFeedbackBL = new EmployeeFeedbackBL();
                var employeeFeedback_ResultEntity = employeeFeedbackBL.Get(AppraisalCycleId, ToEmployeeId, FromEmployeeId, ActionTypeId, SelectedYear);

                // Check for null DataSet and empty tables
                if (employeeFeedback_ResultEntity != null 
                    && employeeFeedback_ResultEntity.Tables.Count > 0 
                    && employeeFeedback_ResultEntity.Tables[0] != null
                    && employeeFeedback_ResultEntity.Tables[0].Rows.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, employeeFeedback_ResultEntity);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "No data found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "Get(int AppraisalCycleId, int ToEmployeeId,int FromEmployeeId, int ActionTypeId, int SelectedYear)", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }



        // ManagerId=10 and EmployeeId=12  and this is managers scenario

        // Used for All              To       From       ActionType     Parent     Area
        //1. MyFeedbackGrid,         null     10         1               null     1/2
        //2. FeedbackGiven grid,     null     10         1               null     1/2
        //3. PendingFeedback Grid,   10       null       3               null     null
        //4. RequestFeedback Grid    null     10         3               null     null
        // [Route("api/Feedback/GetEmployeeFeedback")]
        [HttpGet]

        public HttpResponseMessage Get(int AppraisalCycleId, int ToEmployeeId, int FromEmployeeId, int ActionTypeId, int ParentFeedBackId, int AreaID)
        {
            try
            {
                EmployeeFeedbackBL employeeFeedbackBL = new EmployeeFeedbackBL();
                var employeeFeedback_ResultEntity = employeeFeedbackBL.Get(AppraisalCycleId, ToEmployeeId, FromEmployeeId, ActionTypeId, ParentFeedBackId, AreaID);

                if (employeeFeedback_ResultEntity.Tables[0].Rows.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, employeeFeedback_ResultEntity);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "No data found");
                //return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "Get", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }

        //for selected year
        //Created by Garima for History of feedback 11-19-2018
        [HttpGet]
  
        public HttpResponseMessage Get(int AppraisalCycleId, int ToEmployeeId, int FromEmployeeId, int ActionTypeId, int ParentFeedBackId, int AreaID, int SelectedYear)
        {
            try
            {
                EmployeeFeedbackBL employeeFeedbackBL = new EmployeeFeedbackBL();

                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != FromEmployeeId && FromEmployeeId != 0)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }
                EmployeeMasterBL employeeMasterBL = new BusinessLayer.EmployeeMasterBL();

                bool IsCurrentManager = employeeMasterBL.IsMyManager(ToEmployeeId, userIdFromToken, Convert.ToInt32(AppraisalCycleId));

                //if (!IsCurrentManager && ToEmployeeId != userIdFromToken && FromEmployeeId != 0)
                //{
                //    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotAcceptable.ToString(), "Access Denied! You can only access/modify your own data.");
                //}

                var employeeFeedback_ResultEntity = employeeFeedbackBL.Get(AppraisalCycleId, ToEmployeeId, FromEmployeeId, ActionTypeId, ParentFeedBackId, AreaID, SelectedYear);

                // Skip-level grids (Feedback.js): Area 5 = prior RM KRA feedback, 8 = manager id, 0 = skip-level free-text. Empty result is valid (no console "No data found").
                if (employeeFeedback_ResultEntity.Tables[0].Rows.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, employeeFeedback_ResultEntity);
                }
                if (AreaID == 5 || AreaID == 8 || AreaID == 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, employeeFeedback_ResultEntity);
                }
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "No data found");
                //return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "Get", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }

        /// <summary>
        /// this post is for free textfeedback given by peer and clients
        /// </summary>
        /// <param name="FromEmployeeId"></param>
        /// <param name="ToEmployeeId"></param>
        /// <param name="AppraisalCycleId"></param>
        /// <param name="ActionTypeId"></param>
        /// <param name="Feedback"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/Feedback/PostSaveFeedback")]
  
        public HttpResponseMessage PostSaveFeedback([FromBody] EmployeeFeedbackEntity employeefeedbackByMail)
        {
            try
            {
                int result = 0;
                if (ModelState.IsValid == false)
                {
                    return ResponseMessages.CreateResponseMessage(false, ModelState);
                }

                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != employeefeedbackByMail.FromEmployeeId)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }


                EmployeeFeedbackEntity employeeFeedbackEntity = new EmployeeFeedbackEntity();
                employeeFeedbackEntity.FromEmployeeId = employeefeedbackByMail.FromEmployeeId;
                employeeFeedbackEntity.ToEmployeeId = employeefeedbackByMail.ToEmployeeId;
                employeeFeedbackEntity.AppraisalCycleId = employeefeedbackByMail.AppraisalCycleId;
                employeeFeedbackEntity.ActionTypeId = employeefeedbackByMail.ActionTypeId;
                employeeFeedbackEntity.Feedback = employeefeedbackByMail.Feedback;
                employeeFeedbackEntity.CreatedBy = employeefeedbackByMail.FromEmployeeId;
                employeeFeedbackEntity.CreatedOn = DateTime.Now;
                employeeFeedbackEntity.FeedbackDate = DateTime.Now;
                employeeFeedbackEntity.IsSeen = 0;
                // Reply (ActionTypeId 2): link to thread root — must use value from request body
                if (employeefeedbackByMail.ActionTypeId == 2)
                {
                    employeeFeedbackEntity.ParentFeedBackId = employeefeedbackByMail.ParentFeedBackId ?? 0;
                }


                EmployeeFeedbackBL employeeFeedbackBL = new EmployeeFeedbackBL();
                var validations = employeeFeedbackBL.Validations(employeeFeedbackEntity);
                if (validations.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(false, validations);
                }

                result = employeeFeedbackBL.Insert(employeeFeedbackEntity);
                if (result > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, GenerateMessage(employeefeedbackByMail.ActionTypeId, "S"));
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), GenerateMessage(employeefeedbackByMail.ActionTypeId, "E"));

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "POST", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        //[Route("api/Feedback/SaveFeedback")]
        [HttpPost]

        public HttpResponseMessage Put(int FromEmployeeId, int ToEmployeeId, int AppraisalCycleId, int ActionTypeId, string Feedback, int FeedBackId, int QuestionaireId, int GradeAreaQuestionMappingID)
        {
            try
            {
                bool result = false;

                EmployeeFeedbackEntity employeeFeedbackEntity = new EmployeeFeedbackEntity();
                employeeFeedbackEntity.FromEmployeeId = FromEmployeeId;
                employeeFeedbackEntity.ToEmployeeId = ToEmployeeId;
                employeeFeedbackEntity.AppraisalCycleId = AppraisalCycleId;
                employeeFeedbackEntity.ActionTypeId = ActionTypeId;
                employeeFeedbackEntity.Feedback = Feedback;
                employeeFeedbackEntity.FeedBackId = FeedBackId;
                employeeFeedbackEntity.QuestionaireId = QuestionaireId;
                employeeFeedbackEntity.GradeAreaQuestionMappingID = GradeAreaQuestionMappingID;

                EmployeeFeedbackBL employeeFeedbackBL = new EmployeeFeedbackBL();
                var validations = employeeFeedbackBL.Validations(employeeFeedbackEntity);
                if (validations.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(false, validations);
                }
                result = employeeFeedbackBL.Update(employeeFeedbackEntity);
                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(false, result);
                }
                else
                {
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
                }


            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "PUT", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }


        // [Route("api/Feedback/SaveFeedbackAsDraft")] // Create By kaushal
        [HttpPost]

        public HttpResponseMessage Put(int FromEmployeeId, int ToEmployeeId, int AppraisalCycleId, int ActionTypeId, string Feedback, int FeedBackId, int QuestionaireId, int GradeAreaQuestionMappingID, int SaveDraft, int ParentFeedbackId = 0)
        {

            try
            {
                int result = 0;
                if (ModelState.IsValid == false)
                {
                    return ResponseMessages.CreateResponseMessage(false, ModelState);
                }

                EmployeeFeedbackEntity employeeFeedbackEntity = new EmployeeFeedbackEntity();
                employeeFeedbackEntity.FromEmployeeId = FromEmployeeId;
                employeeFeedbackEntity.ToEmployeeId = ToEmployeeId;
                employeeFeedbackEntity.AppraisalCycleId = AppraisalCycleId;
                employeeFeedbackEntity.ActionTypeId = ActionTypeId;
                employeeFeedbackEntity.Feedback = Feedback;
                employeeFeedbackEntity.CreatedBy = FromEmployeeId;
                employeeFeedbackEntity.CreatedOn = DateTime.Now;
                employeeFeedbackEntity.FeedbackDate = DateTime.Now;
                employeeFeedbackEntity.IsSeen = 0;
                if (ActionTypeId == 2)
                {
                    employeeFeedbackEntity.ParentFeedBackId = ParentFeedbackId;
                }


                EmployeeFeedbackBL employeeFeedbackBL = new EmployeeFeedbackBL();
                var validations = employeeFeedbackBL.Validations(employeeFeedbackEntity);
                if (validations.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(false, validations);
                }

                result = employeeFeedbackBL.InsertAsDraft(employeeFeedbackEntity);
                if (result > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, GenerateMessage(ActionTypeId, "S"));
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), GenerateMessage(ActionTypeId, "E"));

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "POST", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }




        // [Route("api/Feedback/UpdateFeedback")]  created By Kaushal saini
        [HttpPost]

        public HttpResponseMessage Put(List<EmployeeFeedbackEntity> employeeFeedbackEntity)
        {
            try
            {
                bool result = false;

                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != employeeFeedbackEntity[0].FromEmployeeId)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }

                EmployeeFeedbackBL employeeFeedbackBL = new EmployeeFeedbackBL();
                EmployeeFeedbackEntity employeeFeedbackEntitySingle = new EmployeeFeedbackEntity();
                foreach (var Efb in employeeFeedbackEntity)
                {
                    employeeFeedbackEntitySingle.FromEmployeeId = Efb.FromEmployeeId;
                    employeeFeedbackEntitySingle.ToEmployeeId = Efb.ToEmployeeId;
                    employeeFeedbackEntitySingle.AppraisalCycleId = Efb.AppraisalCycleId;
                    employeeFeedbackEntitySingle.ActionTypeId = Efb.ActionTypeId;
                    employeeFeedbackEntitySingle.Feedback = Efb.Feedback;
                    employeeFeedbackEntitySingle.FeedBackId = Efb.FeedBackId;
                    employeeFeedbackEntitySingle.QuestionaireId = Efb.QuestionaireId;
                    employeeFeedbackEntitySingle.AreaID = Efb.AreaID;
                    employeeFeedbackEntitySingle.IsIgnore = Efb.IsIgnore;
                    var validations = employeeFeedbackBL.Validations(employeeFeedbackEntitySingle);
                    if (validations.Count > 0)
                    {
                        return ResponseMessages.CreateResponseMessage(false, validations);
                    }
                    result = employeeFeedbackBL.UpdateKRAFeedbackByManager(employeeFeedbackEntitySingle);
                }
                // result = employeeFeedbackBL.Update(employeeFeedbackEntitySingle);
                if (result == true)
                {
                    return ResponseMessages.CreateResponseMessage(true, "Feedback Updated.");
                }
                else
                {
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
                }


            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "PUT", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }
        [HttpPost]

        public HttpResponseMessage Put(int FeedbackId, int UserId)
        {
            try
            {
                bool result = false;
                if (FeedbackId == 0)
                {
                    return ResponseMessages.CreateResponseMessage(false, "Feedback id not found");
                }

                EmployeeFeedbackBL employeeFeedbackBL = new EmployeeFeedbackBL();
                result = employeeFeedbackBL.UpdateIgnore(FeedbackId, UserId);
                if (result == true)
                {
                    return ResponseMessages.CreateResponseMessage(true, "Feedback Ignored");
                }

                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Could not update feedback");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "PUT", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        // To update the feedback to seen
        [HttpPost]

        public HttpResponseMessage Put(int FeedbackId, int ParentId, int UserId)
        {
            try
            {
                bool result = false;
                if (FeedbackId == 0)
                {
                    return ResponseMessages.CreateResponseMessage(false, "Feedback id not found");
                }

                EmployeeFeedbackBL employeeFeedbackBL = new EmployeeFeedbackBL();
                result = employeeFeedbackBL.UpdateIsSeen(FeedbackId, ParentId, UserId);
                if (result == true)
                {
                    return ResponseMessages.CreateResponseMessage(true, "Feedback Seen");
                }

                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Could not update feedback");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "PUT", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }


        private string GenerateMessage(int? ActionTypeId, string MessageType)
        {
            string SaveMessage = "";
            string ErrorMessage = "";
            if (ActionTypeId == 1)
            {
                SaveMessage = "Feedback Saved!";
                ErrorMessage = "Error while sending feedback...";
            }
            else if (ActionTypeId == 2)
            {
                SaveMessage = "Feedback Reply Sent";
                ErrorMessage = "Error while replying to the feedback...";
            }
            else if (ActionTypeId == 3)
            {
                SaveMessage = "Feedback Request Sent";
                ErrorMessage = "Error while requesting feedback...";
            }
            return MessageType == "S" ? SaveMessage : ErrorMessage;
        }
    }
}
