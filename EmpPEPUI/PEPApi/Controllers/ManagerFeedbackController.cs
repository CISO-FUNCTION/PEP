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
    public class ManagerFeedbackController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(ManagerFeedbackController));

        // [Route("api/ManagerFeedback/Save")]
        [HttpPost]
        [Route("api/ManagerFeedback/SubmitUpdateFeedback")]

        public HttpResponseMessage Post([FromBody] List<EmployeeFeedbackEntity> employeeFeedbackEntity)
        {
            try
            {
                EmployeeMasterBL employeeMasterBL = new BusinessLayer.EmployeeMasterBL();
                EmployeeFeedbackBL employeefeedbackBL = new BusinessLayer.EmployeeFeedbackBL();
                bool IsCurrentManager = employeeMasterBL.IsMyManager(employeeFeedbackEntity[0].ToEmployeeId, employeeFeedbackEntity[0].FromEmployeeId, Convert.ToInt32(employeeFeedbackEntity[0].AppraisalCycleId));
                if (employeeFeedbackEntity[0].IsIgnore != true)
                {
                    if (!IsCurrentManager)
                    {
                        return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotAcceptable.ToString(), "You are not authorised to give Feedback");
                    }
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
                if (userIdFromToken != employeeFeedbackEntity[0].FromEmployeeId)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access//modify your own data.");

                }

                if (employeeFeedbackEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Please provide valid data to give feedback.");
                }
                else
                {
                    EmployeeFeedbackBL employeeFeedbackBL = new EmployeeFeedbackBL();
                    foreach (var fb in employeeFeedbackEntity)
                    {
                        List<ValidationsEntity> validation = employeeFeedbackBL.ManagerValidations(fb);
                        if (validation.Count > 0)
                        {
                            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotAcceptable.ToString(), validation[0].ErrorMessage);
                        }
                    }
                    bool result;
                    if (employeeFeedbackEntity[0].StatusID == 100)//|| employeeFeedbackEntity[0].StatusID == 101)
                    {
                        result = employeeFeedbackBL.InsertAsDraft(employeeFeedbackEntity);
                    }
                    else
                    {
                        result = employeeFeedbackBL.Insert(employeeFeedbackEntity);
                    }
                    if (result)
                        return ResponseMessages.CreateResponseMessage(true, "Feedback Saved!");
                    else
                        return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Error while sending feedback...");
                }

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "post", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        //By Sourabh
        #region Previous RM Feedback
        /// <summary>Lists previous RMs / delegators for an employee (ddlPreviousRMs).</summary>
        [HttpGet]
        [Route("api/ManagerFeedback/PreviousRMsByEmployee")]
        public HttpResponseMessage GetPreviousRMsByEmployee(int EmployeeId)
        {
            try
            {

                EmployeeFeedbackBL employeeFeedbackBL = new EmployeeFeedbackBL();

                var result = employeeFeedbackBL.GetPreviousRM(EmployeeId);

                if (result.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                {
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetPreviousRMsByEmployee", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }

        /// <summary>Feedback given by a selected previous RM or delegator (KRA Area 2 / competency Area 1). Explicit route avoids Web API ambiguity with GetDelegatorFeedback (5 vs 6 query params).</summary>
        [HttpGet]
        [Route("api/ManagerFeedback/PreviousRMFeedback")]
        public HttpResponseMessage GetPreviousRMFeedback(int AppraisalCycleId, int ToEmployeeId, int FromEmployeeId, int ActionTypeId, int ParentFeedBackId, int AreaID)
        {
            try
            {

                EmployeeFeedbackBL employeeFeedbackBL = new EmployeeFeedbackBL();
                var employeeFeedback_ResultEntity = employeeFeedbackBL.GetPreviousRMFeedback(AppraisalCycleId, ToEmployeeId, FromEmployeeId, ActionTypeId, ParentFeedBackId, AreaID);

                if (employeeFeedback_ResultEntity.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, employeeFeedback_ResultEntity);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "No data found");
                //return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetPreviousRMFeedback", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }

        #endregion


        //Added By Garima 25-10-2018
        #region Delegator Feedback
        [HttpGet]
        [Route("api/ManagerFeedback/GetDelegators")]

        public HttpResponseMessage GetDelegators(int ManagerId)
        {
            try
            {
                EmployeeFeedbackBL employeeFeedbackBL = new EmployeeFeedbackBL();


                var result = employeeFeedbackBL.GetDelegators(ManagerId);
                if (result.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                {
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "Get", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }
        [HttpGet]


        public HttpResponseMessage GetEmployees(int DelegatorId, int ManagerId)
        {
            try
            {
                EmployeeFeedbackBL employeeFeedbackBL = new EmployeeFeedbackBL();


                var result = employeeFeedbackBL.GetEmployees(DelegatorId, ManagerId);
                if (result.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                {
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Not Found");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "Get", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }
        [HttpGet]

        public HttpResponseMessage Get(int AppraisalCycleId, int ToEmployeeId, int FromEmployeeId, int ActionTypeId, int AreaID)
        {
            try
            {
                EmployeeFeedbackBL employeeFeedbackBL = new EmployeeFeedbackBL();
                var employeeFeedback_ResultEntity = employeeFeedbackBL.GetDelegatorFeedback(AppraisalCycleId, ToEmployeeId, FromEmployeeId, ActionTypeId, AreaID);

                if (employeeFeedback_ResultEntity.Count > 0)
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




        // [Route("api/ManagerFeedback/Delete_SaveDRaft_Staust_KRA_And_Compitency_WHEN_Submit)")]  created By Kaushal saini
        [HttpPost]
        [Route("api/ManagerFeedback/DraftDelete")]
        public HttpResponseMessage DraftDelete(List<EmployeeFeedbackEntity> employeeFeedbackEntity)
        {
            try
            {
                bool result = false;

                EmployeeFeedbackBL employeeFeedbackBL = new EmployeeFeedbackBL();
                EmployeeFeedbackEntity employeeFeedbackEntitySingle = new EmployeeFeedbackEntity();

                result = employeeFeedbackBL.DeleteDraftFeedback(employeeFeedbackEntity[0].ToEmployeeId, employeeFeedbackEntity[0].AreaID, employeeFeedbackEntity[0].PerformCycleCheck);

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
        #endregion

        /// <summary>
        /// Save draft feedback with goal metadata
        /// </summary>
        [HttpPost]
        [Route("api/ManagerFeedback/SaveDraft")]
        public HttpResponseMessage SaveDraft([FromBody] SaveDraftRequest request)
        {
            try
            {
                // Get UserId from the Token
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim);

                // Ensure the User can only access their data
                if (userIdFromToken != request.FromEmployeeId)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                // Validate manager authorization
                EmployeeMasterBL employeeMasterBL = new BusinessLayer.EmployeeMasterBL();
                bool IsCurrentManager = employeeMasterBL.IsMyManager(request.ToEmployeeId, request.FromEmployeeId, request.AppraisalCycleId);
                
                if (!IsCurrentManager)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotAcceptable.ToString(), "You are not authorised to give Feedback");
                }

                EmployeeFeedbackBL employeeFeedbackBL = new EmployeeFeedbackBL();
                bool result = employeeFeedbackBL.SaveDraft(
                    request.ToEmployeeId,
                    request.FromEmployeeId,
                    request.AppraisalCycleId,
                    request.QuestionaireId,
                    request.Feedback,
                    request.PerformCycleCheck,
                    2, // AreaID = 2 for Manager Feedback
                    request.TrainingItemId,
                    request.TrainingRequirementName,
                    request.TrainingCategory
                );

                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, "Draft saved successfully");
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Error while saving draft");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "SaveDraft", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Get draft feedbacks for an employee and cycle
        /// </summary>
        [HttpGet]
        [Route("api/ManagerFeedback/GetDraftFeedbacks")]
        public HttpResponseMessage GetDraftFeedbacks(int toEmployeeId, string performCycleCheck)
        {
            try
            {
                // Get UserId from the Token
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied!");
                }

                EmployeeFeedbackBL employeeFeedbackBL = new EmployeeFeedbackBL();
                System.Data.DataSet drafts = employeeFeedbackBL.GetDraftFeedbacks(toEmployeeId, performCycleCheck, 2);

                // Convert DataSet to list for JSON serialization
                var draftsList = new List<object>();
                if (drafts != null && drafts.Tables.Count > 0 && drafts.Tables[0].Rows.Count > 0)
                {
                    foreach (System.Data.DataRow row in drafts.Tables[0].Rows)
                    {
                        draftsList.Add(new
                        {
                            FeedBackId = row["FeedBackId"] != DBNull.Value ? Convert.ToInt32(row["FeedBackId"]) : 0,
                            ToEmployeeId = row["ToEmployeeId"] != DBNull.Value ? Convert.ToInt32(row["ToEmployeeId"]) : 0,
                            FromEmployeeId = row["FromEmployeeId"] != DBNull.Value ? Convert.ToInt32(row["FromEmployeeId"]) : 0,
                            AppraisalCycleId = row["AppraisalCycleId"] != DBNull.Value ? Convert.ToInt32(row["AppraisalCycleId"]) : 0,
                            QuestionaireId = row["QuestionaireId"] != DBNull.Value ? Convert.ToInt32(row["QuestionaireId"]) : 0,
                            Feedback = row["Feedback"] != DBNull.Value ? row["Feedback"].ToString() : string.Empty,
                            PerformCycleCheck = row["PerformCycleCheck"] != DBNull.Value ? row["PerformCycleCheck"].ToString() : string.Empty,
                            GoalType = row["GoalType"] != DBNull.Value ? row["GoalType"].ToString() : null,
                            GoalDescription = row["GoalDescription"] != DBNull.Value ? row["GoalDescription"].ToString() : null,
                            Weightage = row["Weightage"] != DBNull.Value ? Convert.ToDecimal(row["Weightage"]) : (decimal?)null,
                            Measure = row["Measure"] != DBNull.Value ? row["Measure"].ToString() : null,
                            AttachmentPath = row["AttachmentPath"] != DBNull.Value ? row["AttachmentPath"].ToString() : null,
                            TrainingItemId = row["TrainingItemId"] != DBNull.Value ? row["TrainingItemId"].ToString() : null,
                            TrainingRequirementName = row["TrainingRequirementName"] != DBNull.Value ? row["TrainingRequirementName"].ToString() : null,
                            TrainingCategory = row["TrainingCategory"] != DBNull.Value ? row["TrainingCategory"].ToString() : null
                        });
                    }
                }

                return ResponseMessages.CreateResponseMessage(true, draftsList);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetDraftFeedbacks", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Submit all draft feedbacks - move to final EmployeeFeedback table
        /// </summary>
        [HttpPost]
        [Route("api/ManagerFeedback/SubmitFeedback")]
        public HttpResponseMessage SubmitFeedback([FromBody] SubmitFeedbackRequest request)
        {
            try
            {
                // Get UserId from the Token
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim);

                // Ensure the User can only access their data
                if (userIdFromToken != request.FromEmployeeId)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                // Validate manager authorization
                EmployeeMasterBL employeeMasterBL = new BusinessLayer.EmployeeMasterBL();
                bool IsCurrentManager = employeeMasterBL.IsMyManager(request.ToEmployeeId, request.FromEmployeeId, request.AppraisalCycleId);
                
                if (!IsCurrentManager)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotAcceptable.ToString(), "You are not authorised to give Feedback");
                }

                EmployeeFeedbackBL employeeFeedbackBL = new EmployeeFeedbackBL();
                string message;
                bool result = employeeFeedbackBL.SubmitFeedback(
                    request.ToEmployeeId,
                    request.FromEmployeeId,
                    request.AppraisalCycleId,
                    request.PerformCycleCheck,
                    out message,
                    2 // AreaID = 2 for Manager Feedback
                );

                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, message);
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), message);
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "SubmitFeedback", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }
    }

    // Request models
    public class SaveDraftRequest
    {
        public int ToEmployeeId { get; set; }
        public int FromEmployeeId { get; set; }
        public int AppraisalCycleId { get; set; }
        public int QuestionaireId { get; set; }
        public string Feedback { get; set; }
        public string PerformCycleCheck { get; set; }
        public string TrainingItemId { get; set; }
        public string TrainingRequirementName { get; set; }
        public string TrainingCategory { get; set; }
    }

    public class SubmitFeedbackRequest
    {
        public int ToEmployeeId { get; set; }
        public int FromEmployeeId { get; set; }
        public int AppraisalCycleId { get; set; }
        public string PerformCycleCheck { get; set; }
    }
}
