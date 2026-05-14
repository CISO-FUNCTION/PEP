using EmpPEP.BusinessEntities;
using EmpPEP.BusinessLayer;
using EmpPEP.Framework.Helper;
using EmpPEP.Framework.Log4Net;
using EmpPEP.WebApi.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Web.Http;

namespace EmpPEP.WebApi.Controllers
{
    
    [RoutePrefix("api/GoalModification")]
    public class GoalModificationRequestController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(GoalModificationRequestController));

        /// <summary>
        /// Check if employee can request goal modification
        /// Goals are set once per yearly appraisal cycle
        /// </summary>
        [HttpGet]
        [Route("CanRequestModification")]
        public HttpResponseMessage CanRequestModification(int employeeId, int appraisalCycleId)
        {
            try
            {
                int currentEmployeeId = EmployeeAuthentication.GetEmployeeId(Request);

                // Ensure employee can only check for themselves
                if (currentEmployeeId != employeeId)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.Forbidden.ToString(), "Access Denied");
                }

                GoalModificationRequestBL bl = new GoalModificationRequestBL();
                
                // Validate all conditions
                string validationMessage = "";
                
                // Check if goals are approved with full weightage
                bool goalsValid = bl.AreGoalsApprovedWithFullWeightage(employeeId, appraisalCycleId);
                if (!goalsValid)
                {
                    validationMessage = "All goals must be approved with 100% weightage to request modification";
                    return ResponseMessages.CreateResponseMessage(true, new
                    {
                        CanRequest = false,
                        ApprovedCount = 0,
                        RemainingRequests = 0,
                        HasPendingRequest = false,
                        ValidationMessage = validationMessage
                    });
                }

                // Check if appraisal cycle is active
                bool cycleActive = bl.IsAppraisalCycleActive(appraisalCycleId);
                if (!cycleActive)
                {
                    validationMessage = "The appraisal cycle is not currently active";
                    return ResponseMessages.CreateResponseMessage(true, new
                    {
                        CanRequest = false,
                        ApprovedCount = 0,
                        RemainingRequests = 0,
                        HasPendingRequest = false,
                        ValidationMessage = validationMessage
                    });
                }

                // Check request limit and pending status
                bool canRequest = bl.CanRequestModification(employeeId, appraisalCycleId);
                int approvedCount = bl.GetApprovedRequestCount(employeeId, appraisalCycleId);
                bool hasPendingRequest = bl.HasPendingRequest(employeeId, appraisalCycleId);

                var result = new
                {
                    CanRequest = canRequest && !hasPendingRequest,
                    ApprovedCount = approvedCount,
                    RemainingRequests = 2 - approvedCount,
                    HasPendingRequest = hasPendingRequest,
                    ValidationMessage = ""
                };

                return ResponseMessages.CreateResponseMessage(true, result);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "CanRequestModification", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Submit a new goal modification request
        /// </summary>
        [HttpPost]
        [Route("SubmitRequest")]
        public HttpResponseMessage SubmitRequest([FromBody] GoalModificationRequestEntity entity)
        {
            try
            {
                int currentEmployeeId = EmployeeAuthentication.GetEmployeeId(Request);

                // Ensure employee can only submit for themselves
                if (currentEmployeeId != entity.EmployeeId)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.Forbidden.ToString(), "Access Denied");
                }

                GoalModificationRequestBL bl = new GoalModificationRequestBL();
                
                // Check if employee can request
                if (!bl.CanRequestModification(entity.EmployeeId, entity.AppraisalCycleId))
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "Maximum limit exceeded for goal modification in this appraisal cycle");
                }

                int requestId = bl.CreateRequest(entity);

                if (requestId == -1)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "Maximum limit exceeded");
                }
                else if (requestId > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, new { RequestId = requestId, Message = "Request submitted successfully" });
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), "Failed to submit request");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "SubmitRequest", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Get pending requests for manager approval
        /// </summary>
        [HttpGet]
        [Route("GetPendingRequests")]
        public HttpResponseMessage GetPendingRequests()
        {
            try
            {
                int managerId = EmployeeAuthentication.GetEmployeeId(Request);

                GoalModificationRequestBL bl = new GoalModificationRequestBL();
                List<GoalModificationRequestEntity> requests = bl.GetPendingRequestsForManager(managerId);

                return ResponseMessages.CreateResponseMessage(true, requests);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetPendingRequests", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Get count of pending requests for manager
        /// </summary>
        [HttpGet]
        [Route("GetPendingRequestCount")]
        public HttpResponseMessage GetPendingRequestCount()
        {
            try
            {
                int managerId = EmployeeAuthentication.GetEmployeeId(Request);

                GoalModificationRequestBL bl = new GoalModificationRequestBL();
                int count = bl.GetPendingRequestCountForManager(managerId);

                return ResponseMessages.CreateResponseMessage(true, new { Count = count });
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetPendingRequestCount", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Get request history for an employee
        /// Goals are set once per yearly appraisal cycle
        /// </summary>
        [HttpGet]
        [Route("GetRequestHistory")]
        public HttpResponseMessage GetRequestHistory(int employeeId, int appraisalCycleId)
        {
            try
            {
                int currentEmployeeId = EmployeeAuthentication.GetEmployeeId(Request);

                // Ensure employee can only view their own history
                if (currentEmployeeId != employeeId)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.Forbidden.ToString(), "Access Denied");
                }

                GoalModificationRequestBL bl = new GoalModificationRequestBL();
                List<GoalModificationRequestEntity> requests = bl.GetByEmployeeAndCycle(employeeId, appraisalCycleId);

                return ResponseMessages.CreateResponseMessage(true, requests);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetRequestHistory", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Approve a goal modification request (Manager only)
        /// </summary>
        [HttpPost]
        [Route("ApproveRequest")]
        public HttpResponseMessage ApproveRequest([FromBody] dynamic data)
        {
            try
            {
                // Parse requestId from JSON body
                int requestId = 0;
                if (data != null && data.requestId != null)
                {
                    requestId = (int)data.requestId;
                }
                
                if (requestId <= 0)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "Invalid request ID");
                }

                int managerId = EmployeeAuthentication.GetEmployeeId(Request);

                // Verify that the current user is the reporting manager
                GoalModificationRequestBL bl = new GoalModificationRequestBL();
                var request = bl.Get(requestId);

                if (request == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Request not found");
                }

                // Validate manager authorization using custom method
                if (!bl.IsManagerAuthorized(requestId, managerId))
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.Forbidden.ToString(), "Only reporting manager can approve this request");
                }

                bool result = bl.ApproveRequest(requestId, managerId);

                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, new { Message = "Request approved successfully" });
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), "Failed to approve request");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "ApproveRequest", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Reject a goal modification request (Manager only)
        /// </summary>
        [HttpPost]
        [Route("RejectRequest")]
        public HttpResponseMessage RejectRequest([FromBody] dynamic data)
        {
            try
            {
                // Parse data from JSON body
                int requestId = 0;
                string reason = null;
                
                if (data != null)
                {
                    // Handle both property name variations
                    if (data.requestId != null)
                    {
                        requestId = (int)data.requestId;
                    }
                    else if (data.RequestId != null)
                    {
                        requestId = (int)data.RequestId;
                    }
                    
                    if (data.rejectionReason != null)
                    {
                        reason = (string)data.rejectionReason;
                    }
                    else if (data.Reason != null)
                    {
                        reason = (string)data.Reason;
                    }
                }
                
                if (requestId <= 0)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "Invalid request ID");
                }
                
                if (string.IsNullOrWhiteSpace(reason))
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "Rejection reason is required");
                }

                int managerId = EmployeeAuthentication.GetEmployeeId(Request);

                // Verify that the current user is the reporting manager
                GoalModificationRequestBL bl = new GoalModificationRequestBL();
                var request = bl.Get(requestId);

                if (request == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Request not found");
                }

                // Validate manager authorization using custom method
                if (!bl.IsManagerAuthorized(requestId, managerId))
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.Forbidden.ToString(), "Only reporting manager can reject this request");
                }

                bool result = bl.RejectRequest(requestId, managerId, reason);

                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, new { Message = "Request rejected successfully" });
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), "Failed to reject request");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "RejectRequest", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Get active modification reasons for dropdown
        /// </summary>
        [HttpGet]
        [Route("GetActiveReasons")]
        public HttpResponseMessage GetActiveReasons()
        {
            try
            {
                GoalModificationReasonMasterBL reasonBL = new GoalModificationReasonMasterBL();
                List<GoalModificationReasonMasterEntity> reasons = reasonBL.GetActiveReasons();

                return ResponseMessages.CreateResponseMessage(true, reasons);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetActiveReasons", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Check if goals can be modified for a specific cycle
        /// </summary>
        [HttpGet]
        [Route("CanModifyGoals")]
        public HttpResponseMessage CanModifyGoals(int employeeId, int appraisalCycleId, string cycle)
        {
            try
            {
                int currentEmployeeId = EmployeeAuthentication.GetEmployeeId(Request);
                
                // Ensure employee can only check their own data
                if (currentEmployeeId != employeeId)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, 
                        HttpStatusCode.Forbidden.ToString(), "Access Denied");
                }
                
                GoalModificationRequestBL bl = new GoalModificationRequestBL();
                bool canModify = bl.CanModifyGoal(employeeId, appraisalCycleId, cycle);
                
                string reason = "";
                if (!canModify)
                {
                    // Determine reason
                    if (bl.IsCycleClosed(appraisalCycleId, cycle))
                    {
                        reason = "Cycle is closed";
                    }
                    else if (bl.HasSelfAssessment(employeeId, appraisalCycleId, cycle))
                    {
                        reason = "Self Assessment already exists for this cycle";
                    }
                    else if (bl.HasManagerFeedback(employeeId, appraisalCycleId, cycle))
                    {
                        reason = "Manager Feedback already exists for this cycle";
                    }
                }
                
                var result = new
                {
                    CanModify = canModify,
                    Reason = reason
                };
                
                return ResponseMessages.CreateResponseMessage(true, result);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "CanModifyGoals", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, 
                    HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Check if H2 cycle change warning should be shown
        /// Returns true if: cycle is H2 AND employee hasn't filled self review for H1 AND manager hasn't given feedback for H1
        /// </summary>
        [HttpGet]
        [Route("ShouldShowH2Warning")]
        public HttpResponseMessage ShouldShowH2Warning(int employeeId, int appraisalCycleId, string cycle)
        {
            try
            {
                int currentEmployeeId = EmployeeAuthentication.GetEmployeeId(Request);
                
                // Ensure employee can only check their own data
                if (currentEmployeeId != employeeId)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, 
                        HttpStatusCode.Forbidden.ToString(), "Access Denied");
                }
                
                GoalModificationRequestBL bl = new GoalModificationRequestBL();
                bool shouldShow = bl.ShouldShowH2Warning(employeeId, appraisalCycleId, cycle);
                
                var result = new
                {
                    ShouldShowWarning = shouldShow
                };
                
                return ResponseMessages.CreateResponseMessage(true, result);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "ShouldShowH2Warning", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, 
                    HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }
    }
}
