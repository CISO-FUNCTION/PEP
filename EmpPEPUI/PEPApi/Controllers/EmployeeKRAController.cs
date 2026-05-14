using EmpPEP.BusinessEntities;
using EmpPEP.BusinessLayer;
using EmpPEP.Framework.Helper;
using EmpPEP.Framework.Log4Net;
using EmpPEP.WebApi.Common;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;




namespace EmpPEP.WebApi.Controllers
{

    [AuthorizeAttribute]

    [RoutePrefix("api/EmployeeKRA")]
    public class EmployeeKRAController : ApiController
    {
        readonly ILogService logService = new FileLogService(typeof(EmployeeKRAController));

        // Employee get his/her own KRA fromEmployeeID and ToEmployeeId need to be same and 
        // Manaager Can Get the KRA from TeamMember to give feedback fromEmployeeID is managersId and ToEmployeeId is TeamMembersId
        //  [Route("api/EmployeeKRA/GetKRA")]
        [HttpGet]

        [Route("GetEmployeeKRA")]
        public HttpResponseMessage GetEmployeeKRA(int AppraisalCycleId, int ToEmployeeId, int StatusId, int Selectedyear, string SelfAssCycleId)
        {
            try
            {
                //int i = 10;
                //int j = 0;
                //int k = i / j;

                int FromEmployeeId = EmployeeAuthentication.GetEmployeeId(Request);


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

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");

                }
                EmployeeMasterBL employeeMasterBL = new BusinessLayer.EmployeeMasterBL();

                bool IsCurrentManager = employeeMasterBL.IsMyManager(ToEmployeeId, userIdFromToken, Convert.ToInt32(AppraisalCycleId));

                if (!IsCurrentManager && ToEmployeeId != userIdFromToken)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotAcceptable.ToString(), "Access Denied! You can only access/modify your own data.");
                }


                EmployeeKRABL employeeKRABL = new EmployeeKRABL();
                var employeeKRAResultEntity = employeeKRABL.Get(AppraisalCycleId, FromEmployeeId, ToEmployeeId, StatusId, Selectedyear, SelfAssCycleId);

                if (employeeKRAResultEntity == null)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }
                else
                {
                    // Assuming employeeKRAResultEntity is your DataSet returned from GetKRAForManagersApproval
                    foreach (DataRow row in employeeKRAResultEntity.Tables[0].Rows)
                    {
                        // Check if KRAStatusId is null or DBNull before conversion
                        if (row["KRAStatusId"] == null || row["KRAStatusId"] == DBNull.Value)
                        {
                            // Skip this row if KRAStatusId is null
                            continue;
                        }
                        
                        // Check if EmployeeId is null or DBNull before conversion
                        if (row["EmployeeId"] == null || row["EmployeeId"] == DBNull.Value)
                        {
                            // Skip this row if EmployeeId is null
                            continue;
                        }
                        
                        // Retrieve the values of KRAStatusId and EmployeeId from the row
                        int kraStatusId = Convert.ToInt32(row["KRAStatusId"]);
                        int employeeId = Convert.ToInt32(row["EmployeeId"]);

                        // Check if the KRAStatusId is "Submitted" and EmployeeId is not equal to FromEmployeeId
                        if (kraStatusId == Convert.ToInt32(EnumCollection.KRA.Submitted) && employeeId != FromEmployeeId)
                        {
                            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "All G&Os are not in Approved status");
                        }
                    }


                    return ResponseMessages.CreateResponseMessage(true, employeeKRAResultEntity);
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetEmployeeKRA", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }





        [HttpGet]

        [Route("GetTeamKRA")]
        public HttpResponseMessage GetTeamKRA(int AppraisalCycleId, int ToEmployeeId, string SelfAssCycleId)
        {
            try
            {
                //int i = 10;
                //int j = 0;
                //int k = i / j;
                int FromEmployeeId = EmployeeAuthentication.GetEmployeeId(Request);


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

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");

                }
                EmployeeMasterBL employeeMasterBL = new BusinessLayer.EmployeeMasterBL();

                bool IsCurrentManager = employeeMasterBL.IsMyManager(ToEmployeeId, userIdFromToken, Convert.ToInt32(AppraisalCycleId));

                PageSideBarBL pgbl = new PageSideBarBL();

                if (!pgbl.IsAdmin(userIdFromToken))
                {
                    if (!IsCurrentManager && ToEmployeeId != userIdFromToken)
                    {
                        return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotAcceptable.ToString(), "Access Denied! You can only access/modify your own data.");
                    }
                }


                EmployeeKRABL employeeKRABL = new EmployeeKRABL();
                var employeeKRAResultEntity = employeeKRABL.Get(AppraisalCycleId, FromEmployeeId, ToEmployeeId, SelfAssCycleId);

                if (employeeKRAResultEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }

                return ResponseMessages.CreateResponseMessage(true, employeeKRAResultEntity);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetEmployeeKRA", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }



        /// <summary>
        /// Get all KRAs for Copy functionality - simplified endpoint
        /// Only requires AppraisalCycleId and ToEmployeeId
        /// </summary>
        [HttpGet]
        [Route("GetKRAsForCopy")]
        public HttpResponseMessage GetKRAsForCopy(int AppraisalCycleId, int ToEmployeeId)
        {
            try
            {
                int FromEmployeeId = EmployeeAuthentication.GetEmployeeId(Request);

                // Get UserId from the Token
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim);

                // Ensure the User can only access their own data
                if (userIdFromToken != ToEmployeeId)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");
                }

                EmployeeKRABL employeeKRABL = new EmployeeKRABL();
                var employeeKRAResultEntity = employeeKRABL.GetKRAsForCopy(AppraisalCycleId, ToEmployeeId);

                if (employeeKRAResultEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }

                return ResponseMessages.CreateResponseMessage(true, employeeKRAResultEntity);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetKRAsForCopy", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        [HttpGet]

        [Route("GetKRAById")]
        public HttpResponseMessage Get(int id)
        {
            try
            {
                int FromEmployeeId = EmployeeAuthentication.GetEmployeeId(Request);

                EmployeeKRABL employeeKRABL = new EmployeeKRABL();
                // Use stored procedure for faster performance
                var employeeKRAEntity = employeeKRABL.GetWithSP(id);
                
                // Fallback to LINQ if stored procedure returns null
                if (employeeKRAEntity == null)
                {
                    employeeKRAEntity = employeeKRABL.Get(id);
                }

                if (employeeKRAEntity != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, employeeKRAEntity);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetEmployeeKRAById", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }






        //  [Route("api/EmployeeKRA/PostKRA")]   //KRA insertions
        [HttpPost]
        [Route("SubmitKRAOp")]
        public HttpResponseMessage Post([FromBody] EmployeeKRAEntity employeeKRAEntity)
            {
            try
            {
                if (employeeKRAEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Invalid Data");
                }

                EmployeeKRABL employeeKRAkBL = new EmployeeKRABL();
                var validations = new List<ValidationsEntity>();
                // Call BL Validations function
                //var validations = employeeKRAkBL.Validations(employeeKRAEntity);
                if (employeeKRAEntity.flag == 1 && employeeKRAEntity.CreatedBy != employeeKRAEntity.ManagerId)
                {
                    validations = employeeKRAkBL.ValidationsTeamKRAUpdate(Convert.ToInt32(employeeKRAEntity.AppraisalCycleId), Convert.ToInt32(employeeKRAEntity.ManagerId), Convert.ToInt32(employeeKRAEntity.EmployeeId), employeeKRAEntity);
                }
                else
                {
                    validations = employeeKRAkBL.Validations(employeeKRAEntity);
                }
                if (validations.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(false, validations);
                }

                var result = employeeKRAkBL.Post(employeeKRAEntity);
                if (result > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, new { KRAId = result });
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "Post", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Batch insert multiple KRAs in one request
        /// </summary>
        [HttpPost]
        [Route("SubmitKRAOpBatch")]
        public HttpResponseMessage PostBatch([FromBody] List<EmployeeKRAEntity> employeeKRAEntities, [FromUri] bool overrideExisting = false)
        
        {
            try
            {
                if (employeeKRAEntities == null || employeeKRAEntities.Count == 0)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "No data provided");
                }

                // Get logged-in employee ID for validation
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.Unauthorized.ToString(), "Access Denied");
                }

                int userIdFromToken = int.Parse(userIdClaim);

                // Validate all KRAs belong to the logged-in user
                foreach (var kra in employeeKRAEntities)
                {
                    if (kra.EmployeeId != userIdFromToken)
                    {
                        return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.Forbidden.ToString(), "Access Denied! You can only insert your own KRAs");
                    }
                }

                EmployeeKRABL employeeKRABL = new EmployeeKRABL();

                // Validate before inserting (check if goals already exist for the cycle)
                var firstKRA = employeeKRAEntities.First();
                var validations = employeeKRABL.PostBatchValidations(Convert.ToInt32(firstKRA.AppraisalCycleId), userIdFromToken);
                
                if (validations.Count > 0)
                {
                    // Check if override is allowed and requested
                    if (validations.Any(v => v.CanOverride) && overrideExisting)
                    {
                        // Delete existing non-approved goals before inserting new ones
                        bool deleted = employeeKRABL.DeleteGoalsByEmployeeAndCycle(userIdFromToken, Convert.ToInt32(firstKRA.AppraisalCycleId));
                        // Continue with insert even if no goals were deleted (might have been deleted already)
                    }
                    else
                    {
                        // Return validation errors (either cannot override or override not requested)
                        return ResponseMessages.CreateResponseMessage(false, validations);
                    }
                }

                // All validations passed or override completed, proceed with insert
                int successCount = employeeKRABL.PostBatch(employeeKRAEntities);

                if (successCount > 0)
                {
                    string message = overrideExisting ? 
                        "Existing goals overridden successfully. " + successCount + " new goal(s) added." : 
                        successCount + " goal(s) added successfully.";
                    return ResponseMessages.CreateResponseMessage(true, new { InsertedCount = successCount, TotalRequested = employeeKRAEntities.Count, Message = message });
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), "Failed to insert KRAs");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "PostBatch", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Delete all non-approved goals for a specific appraisal cycle (called before override)
        /// </summary>
        [HttpPost]
        [Route("DeleteExistingGoals")]
        public HttpResponseMessage DeleteExistingGoals(int AppraisalCycleId)
        {
            try
            {
                // Get logged-in employee ID for validation
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.Unauthorized.ToString(), "Access Denied");
                }

                int userIdFromToken = int.Parse(userIdClaim);

                EmployeeKRABL employeeKRABL = new EmployeeKRABL();
                bool deleted = employeeKRABL.DeleteGoalsByEmployeeAndCycle(userIdFromToken, AppraisalCycleId);

                if (deleted)
                {
                    return ResponseMessages.CreateResponseMessage(true, "Existing goals deleted successfully");
                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(true, "No goals to delete");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "DeleteExistingGoals", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        // KRA insertions using stored procedure for faster performance
        [HttpPost]
        [Route("SubmitKRAOpWithSP")]
        public HttpResponseMessage PostWithSP([FromBody] EmployeeKRAEntity employeeKRAEntity)
        {
            try
            {
                if (employeeKRAEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Invalid Data");
                }

                // Validate AppraisalCycleId is provided
                if (employeeKRAEntity.AppraisalCycleId == null || employeeKRAEntity.AppraisalCycleId == 0)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "AppraisalCycleId is required");
                }

                // Get logged-in employee ID
                int FromEmployeeId = EmployeeAuthentication.GetEmployeeId(Request);
                
                // Additional validations using old BL for business rules
                EmployeeKRABL employeeKRAkBL = new EmployeeKRABL();
                var validations = new List<ValidationsEntity>();
                
                // Check if this is a manager adding goal for team member
                bool isManagerAddingForTeam = employeeKRAEntity.EmployeeId != FromEmployeeId 
                    && employeeKRAEntity.ManagerId > 0 
                    && employeeKRAEntity.ManagerId == FromEmployeeId;
                
                // Call BL Validations function
                if (employeeKRAEntity.flag == 1 && employeeKRAEntity.CreatedBy != employeeKRAEntity.ManagerId)
                {
                    validations = employeeKRAkBL.ValidationsTeamKRAUpdate(Convert.ToInt32(employeeKRAEntity.AppraisalCycleId), Convert.ToInt32(employeeKRAEntity.ManagerId), Convert.ToInt32(employeeKRAEntity.EmployeeId), employeeKRAEntity);
                }
                else if (isManagerAddingForTeam)
                {
                    validations = employeeKRAkBL.ValidationsTeamKRAUpdate(Convert.ToInt32(employeeKRAEntity.AppraisalCycleId), FromEmployeeId, Convert.ToInt32(employeeKRAEntity.EmployeeId), employeeKRAEntity);
                }
                else
                {
                    validations = employeeKRAkBL.Validations(employeeKRAEntity);
                }
                if (validations.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(false, validations);
                }

                // Use new ADO.NET-based business layer
                EmployeeKRABLADO employeeKRABLADO = new EmployeeKRABLADO();
                
                // Set CreatedBy if not set
                if (!employeeKRAEntity.CreatedBy.HasValue)
                {
                    employeeKRAEntity.CreatedBy = FromEmployeeId;
                }

                logService.Info("EmpPEP.WebApi", "PostWithSP", 
                    $"Inserting KRA - EmployeeId: {employeeKRAEntity.EmployeeId}, TrainingItemId: {employeeKRAEntity.TrainingItemId ?? "NULL"}, " +
                    $"TrainingCategory: {employeeKRAEntity.TrainingCategory ?? "NULL"}");

                int result = employeeKRABLADO.InsertKRA(employeeKRAEntity);
                if (result > 0)
                {
                    logService.Info("EmpPEP.WebApi", "PostWithSP", $"KRA inserted successfully with KRAId: {result} using ADO.NET");
                    return ResponseMessages.CreateResponseMessage(true, new { KRAId = result });
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Insert failed - no KRAId returned");
                }

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "PostWithSP", $"Error: {ex.Message}, StackTrace: {ex.StackTrace}");
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        // This update is for employees KRA update and Complete Status
        //[Route("api/EmployeeKRA/PutKRA")]
        
        [HttpPost]
        [Route("UpdateKRA")]
        public HttpResponseMessage Put([FromBody] EmployeeKRAEntity employeeKRAEntity)
        {
            try
            {
                int FromEmployeeId = EmployeeAuthentication.GetEmployeeId(Request);

                if (employeeKRAEntity == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Invalid Data");
                }

                // Log the received data for debugging
                logService.Info("EmpPEP.WebApi", "UpdateKRA", 
                    $"Received KRAId: {employeeKRAEntity.KRAId}, TrainingItemId: {employeeKRAEntity.TrainingItemId?.ToString() ?? "NULL"}, " +
                    $"TrainingRequirementName: {employeeKRAEntity.TrainingRequirementName ?? "NULL"}, " +
                    $"TrainingCategory: {employeeKRAEntity.TrainingCategory ?? "NULL"}");

                // Use new ADO.NET-based business layer
                EmployeeKRABLADO employeeKRABLADO = new EmployeeKRABLADO();
                
                // Additional validations using old BL for business rules
                EmployeeKRABL employeeKRAkBL = new EmployeeKRABL();
                var validations = new List<ValidationsEntity>();
                if (employeeKRAEntity.flag == 1)
                {
                    validations = employeeKRAkBL.ValidationsTeamKRAUpdate(Convert.ToInt32(employeeKRAEntity.AppraisalCycleId), Convert.ToInt32(employeeKRAEntity.ManagerId), Convert.ToInt32(employeeKRAEntity.EmployeeId), employeeKRAEntity);
                }
                else
                {
                    validations = employeeKRAkBL.Validations(employeeKRAEntity);
                }
                if (validations.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(false, validations);
                }

                // Update using ADO.NET
                bool result = employeeKRABLADO.UpdateKRA(employeeKRAEntity);
                if (result)
                {
                    logService.Info("EmpPEP.WebApi", "UpdateKRA", $"KRA {employeeKRAEntity.KRAId} updated successfully using ADO.NET");
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Update failed - no rows affected");
                }

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "UpdateKRA", $"Error: {ex.Message}, StackTrace: {ex.StackTrace}");
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }


        /// <summary>
        /// This update is for Approve and Submit status // Give Self Assesment
        /// </summary>
        /// <param name="FromEmployeeId"></param>
        /// <param name="KRAId"></param>
        /// <param name="Selfassesment">Create By Kaushal</param>
        ///// <returns></returns>
        [HttpPost]
        [Route("PostSelfAssessment")]


        public HttpResponseMessage PostSelfAssessment([FromBody] EmployeeKRAEntity employeeKRAEntity)
        {
            try
            {
                bool result = false;

                string YearSubCycleCheck = employeeKRAEntity.Measure;


                // Get UserId from the Token added on 3 feb 2025 by kaushal saini
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;

                if (userIdClaim == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access your own data.");
                }

                int userIdFromToken = int.Parse(userIdClaim); // Convert to int

                // Ensure the User can only access their data
                if (userIdFromToken != employeeKRAEntity.EmployeeId)
                {

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access your own data.");

                }

                EmployeeKRABL employeeKRAkBL = new EmployeeKRABL();

                // Use new method that returns SelfAssessmentId for attachment upload
                int selfAssessmentId = employeeKRAkBL.PutReturnSelfAssessmentId(employeeKRAEntity, YearSubCycleCheck);

                if (selfAssessmentId > 0)
                {
                    // Return SelfAssessmentId so frontend can upload attachments
                    return ResponseMessages.CreateResponseMessage(true, new { SelfAssessmentId = selfAssessmentId, Success = true });
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Failed to save Self Assessment");
                }

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "SetEmployeeKRA", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }


        /// <summary>
        /// This update is for Approve and Submit status
        /// </summary>
        /// <param name="AppraisalCycleId"></param>
        /// <param name="ToEmployeeId"></param>
        /// <param name="KRAAction">Submit = 8,            Approve = 9,            Reject = 10</param>
        /// <returns></returns>
        [HttpPost]
        [Route("SubmitKRA")]
        public HttpResponseMessage Put(int AppraisalCycleId, int ToEmployeeId, int KRAAction, int ManagerId)
        {
            try
            {
                bool result = false;
                int FromEmployeeId = EmployeeAuthentication.GetEmployeeId(Request);

                EmployeeKRABL employeeKRAkBL = new EmployeeKRABL();
                EmployeeKRAEntity employeeKRAEntity = new EmployeeKRAEntity();
                //if (FromEmployeeId != ToEmployeeId)
                //{

                //    result = employeeKRAkBL.Put(AppraisalCycleId, FromEmployeeId, ToEmployeeId, KRAAction, ManagerId);
                //}
                //else if ((FromEmployeeId == ToEmployeeId))
                //{
                //    //validations


                // For Reject action (10), use optimized stored procedure
                if (KRAAction == 10) // Reject
                {
                    result = employeeKRAkBL.RejectEmployeeKRA(ToEmployeeId, AppraisalCycleId, FromEmployeeId);
                }
                // For Approve action (9), use optimized stored procedure
                else if (KRAAction == 9) // Approve
                {
                    // Run validations first
                    var validations = employeeKRAkBL.ValidationsSubmit(AppraisalCycleId, FromEmployeeId, ToEmployeeId);
                    if (validations.Count > 0)
                    {
                        return ResponseMessages.CreateResponseMessage(false, validations);
                    }
                    // Use stored procedure for approval
                    result = employeeKRAkBL.ApproveEmployeeKRA(ToEmployeeId, AppraisalCycleId, FromEmployeeId);
                }
                else
                {
                    // For Submit (8) and other actions, use existing validation and logic
                    var validations = employeeKRAkBL.ValidationsSubmit(AppraisalCycleId, FromEmployeeId, ToEmployeeId);

                    if (validations.Count > 0)
                    {
                        return ResponseMessages.CreateResponseMessage(false, validations);
                    }
                    result = employeeKRAkBL.Put(AppraisalCycleId, FromEmployeeId, ToEmployeeId, KRAAction, ManagerId);
                }
                // }

                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "SetEmployeeKRA", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        // IsSeen Update;
        [HttpPut]

        public HttpResponseMessage Put(int EmployeeId, int AppraisalCycleId)
        {
            try
            {
                bool result = false;
                EmployeeKRABL employeeKRAkBL = new EmployeeKRABL();
                result = employeeKRAkBL.Put(EmployeeId, AppraisalCycleId);

                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
                }

            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "SetEmployeeKRA", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        //[Route("api/EmployeeKRA/DeleteKRA/")]
        [HttpPost]

        public HttpResponseMessage Delete(int KRAId)
        {
            try
            {

                int FromEmployeeId = Convert.ToInt32(Request.Headers.GetValues("X-EmpNo").First());

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

                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Access Denied! You can only access/modify your own data.");

                }


                if (KRAId == 0)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Invalid Data");
                }
                EmployeeKRABL employeeKRAkBL = new EmployeeKRABL();
                bool result = employeeKRAkBL.Delete(KRAId);
                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Not Found");
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "DeleteEmployeeKRA", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Validate if Add Goal button should be shown
        /// </summary>
        [HttpGet]
        [Route("ValidateCanAddGoal")]
        public HttpResponseMessage ValidateCanAddGoal(int AppraisalCycleId, int? EmployeeId = null, string Subcycle = null)
        {
            try
            {
                int FromEmployeeId = EmployeeAuthentication.GetEmployeeId(Request);
                // If EmployeeId is provided (for team member validation), use it; otherwise use logged-in employee
                int targetEmployeeId = EmployeeId.HasValue && EmployeeId.Value > 0 ? EmployeeId.Value : FromEmployeeId;
                
                // If validating for a different employee, check if the logged-in user is a manager
                bool isManager = false;
                if (targetEmployeeId != FromEmployeeId)
                {
                    EmployeeMasterBL employeeMasterBL = new EmployeeMasterBL();
                    PageSideBarBL pageSideBarBL = new PageSideBarBL();
                    isManager = employeeMasterBL.IsMyManager(targetEmployeeId, FromEmployeeId, AppraisalCycleId) || pageSideBarBL.IsAdmin(FromEmployeeId);
                    if (!isManager)
                    {
                        return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.Forbidden.ToString(), "You can only validate goals for your own team members");
                    }
                }

                EmployeeKRABL employeeKRABL = new EmployeeKRABL();
                CanAddGoalResultEntity result;
                
                // For managers: cycle active and total weight (incl. Rejected) &lt; 100 — see ValidateCanAddGoalForManager
                if (isManager)
                {
                    result = employeeKRABL.ValidateCanAddGoalForManager(targetEmployeeId, AppraisalCycleId);
                }
                else
                {
                    // For employees, use the existing validation with subcycle check
                    result = employeeKRABL.ValidateCanAddGoal(targetEmployeeId, AppraisalCycleId, Subcycle);
                }

                if (result != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Validation failed");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "ValidateCanAddGoal", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Validate if Goal Modification Request button should be shown
        /// </summary>
        [HttpGet]
        [Route("ValidateCanRequestGoalModification")]
        public HttpResponseMessage ValidateCanRequestGoalModification(int AppraisalCycleId, string Cycle = null)
        {
            try
            {
                int FromEmployeeId = EmployeeAuthentication.GetEmployeeId(Request);
                int EmployeeId = FromEmployeeId; // For now, validate for the logged-in employee

                EmployeeKRABL employeeKRABL = new EmployeeKRABL();
                var result = employeeKRABL.ValidateCanRequestGoalModification(EmployeeId, AppraisalCycleId, Cycle);

                if (result != null)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Validation failed");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "ValidateCanRequestGoalModification", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

     

        /// <summary>
        /// Upload and encrypt KRA attachment file
        /// </summary>
        [HttpPost]
        [Route("UploadAttachment")]
        public async Task<HttpResponseMessage> UploadAttachment(int KRAId, int EmployeeId, int AppraisalCycleId)
        {
            try
            {
                if (!Request.Content.IsMimeMultipartContent())
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "Request must be multipart/form-data");
                }

                // CRITICAL FIX: Get EmployeeId from KRA entity, not from parameter
                // When manager adds goal for team member, EmployeeId parameter might be manager's ID
                // But the file should be saved in the team member's folder
                EmployeeKRABL employeeKRABL = new EmployeeKRABL();
                var kraEntity = employeeKRABL.Get(KRAId);
                int actualEmployeeId = EmployeeId; // Default to parameter
                int actualAppraisalCycleId = AppraisalCycleId; // Default to parameter
                
                if (kraEntity != null)
                {
                    // Use EmployeeId from KRA entity (this is the correct employee - team member if manager created it)
                    actualEmployeeId = kraEntity.EmployeeId;
                    // Use AppraisalCycleId from KRA entity if available
                    if (kraEntity.AppraisalCycleId.HasValue)
                    {
                        actualAppraisalCycleId = kraEntity.AppraisalCycleId.Value;
                    }
                }
                
                // Use async/await instead of .Wait() to avoid blocking
                var provider = await Request.Content.ReadAsMultipartAsync();

                HttpContent fileContent = provider.Contents.FirstOrDefault();
                if (fileContent == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "No file uploaded");
                }

                string fileName = fileContent.Headers.ContentDisposition.FileName.Trim('"');
                
                // Get configuration values
                string filePath = ConfigurationManager.AppSettings["FilePath"];
                string aesKeyBase64 = ConfigurationManager.AppSettings["AesKey"];
                string aesIVBase64 = ConfigurationManager.AppSettings["AesIV"];

                if (string.IsNullOrEmpty(filePath) || string.IsNullOrEmpty(aesKeyBase64) || string.IsNullOrEmpty(aesIVBase64))
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), "File upload configuration missing");
                }

                // Convert base64 keys to byte arrays (cache these if possible)
                byte[] key = Convert.FromBase64String(aesKeyBase64);
                byte[] iv = Convert.FromBase64String(aesIVBase64);

                // Create folder structure: EmployeeId/AppraisalCycleId/
                // Use actualEmployeeId (from KRA entity) to ensure file is saved in correct folder
                string folderPath = Path.Combine(filePath, actualEmployeeId.ToString(), actualAppraisalCycleId.ToString());
                
                // Ensure directory exists before processing
                if (!Directory.Exists(folderPath))
                {
                    Directory.CreateDirectory(folderPath);
                }
                
                // Generate file name with timestamp and .enc extension
                string fileExtension = Path.GetExtension(fileName);
                string fileNameWithoutExt = Path.GetFileNameWithoutExtension(fileName);
                string timestamp = DateTime.Now.ToString("yyyyMMddHHmmss");
                string encryptedFileName = $"{fileNameWithoutExt}_{timestamp}{fileExtension}.enc";
                string fullFilePath = Path.Combine(folderPath, encryptedFileName);

                // Read file stream asynchronously and encrypt directly to file (more efficient for large files)
                using (Stream fileStream = await fileContent.ReadAsStreamAsync())
                {
                    // Encrypt and save file directly from stream (more memory efficient)
                    EncryptionDecryption.EncryptFile(fileStream, fullFilePath, key, iv);
                }

                // Store only the filename (not the full path) in the database
                string fileNameOnly = Path.GetFileName(fullFilePath); // e.g., "Picture2_20251117175430.png.enc"
                
                // Update KRA with attachment filename only (reuse existing employeeKRABL instance)
                var result = employeeKRABL.UpdateAttachmentPath(KRAId, fileNameOnly);

                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, new { FilePath = fullFilePath, FileName = fileName });
                }
                else
                {
                    // Log the error but don't fail the upload - file is already saved
                    logService.Warn("EmpPEP.WebApi", "UploadAttachment", $"File saved successfully but failed to update KRA {KRAId} with attachment filename: {fileNameOnly}");
                    // Still return success since file was saved, but log the warning
                    return ResponseMessages.CreateResponseMessage(true, new { FilePath = fullFilePath, FileName = fileName, Warning = "File saved but database update may have failed" });
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "UploadAttachment", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Download KRA attachment file (decrypted)
        /// </summary>
        [HttpGet]
        [Route("DownloadAttachment")]
        public HttpResponseMessage DownloadAttachment(int KRAId)
        {
            try
            {
                EmployeeKRABL employeeKRABL = new EmployeeKRABL();
                string fileNameOnly = employeeKRABL.GetAttachmentPath(KRAId);

                if (string.IsNullOrEmpty(fileNameOnly))
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Attachment file not found");
                }

                // Reconstruct full path from filename
                // IMPORTANT: Use EmployeeId from KRA entity, not the logged-in user
                // This allows managers to download team member attachments
                int loggedInEmployeeId = EmployeeAuthentication.GetEmployeeId(Request);
                int EmployeeId = 0;
                int AppraisalCycleId = 0;
                
                // Get EmployeeId and AppraisalCycleId from KRA entity
                var kraEntity = employeeKRABL.Get(KRAId);
                if (kraEntity != null)
                {
                    // EmployeeId is non-nullable int, so assign directly
                    EmployeeId = kraEntity.EmployeeId;
                    // AppraisalCycleId is nullable, so use null-coalescing operator
                    AppraisalCycleId = kraEntity.AppraisalCycleId ?? 0;
                }
                
                // Fallback to logged-in user's EmployeeId if KRA entity doesn't have it
                if (EmployeeId == 0)
                {
                    EmployeeId = loggedInEmployeeId;
                }
                
                // Reconstruct full path: FilePath/EmployeeId/AppraisalCycleId/filename
                string filePath = ConfigurationManager.AppSettings["FilePath"];
                if (string.IsNullOrEmpty(filePath))
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), "File path configuration missing");
                }
                
                string fullFilePath = Path.Combine(filePath, EmployeeId.ToString(), AppraisalCycleId.ToString(), fileNameOnly);

                if (!File.Exists(fullFilePath))
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Attachment file not found on disk");
                }

                // Get configuration values
                string aesKeyBase64 = ConfigurationManager.AppSettings["AesKey"];
                string aesIVBase64 = ConfigurationManager.AppSettings["AesIV"];

                if (string.IsNullOrEmpty(aesKeyBase64) || string.IsNullOrEmpty(aesIVBase64))
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), "Decryption configuration missing");
                }

                // Convert base64 keys to byte arrays
                byte[] key = Convert.FromBase64String(aesKeyBase64);
                byte[] iv = Convert.FromBase64String(aesIVBase64);

                // Decrypt file in memory with error handling
                byte[] decryptedContent;
                try
                {
                    decryptedContent = EncryptionDecryption.DecryptFileInMemory(fullFilePath, key, iv);
                    
                    // Validate decrypted content is not empty
                    if (decryptedContent == null || decryptedContent.Length == 0)
                    {
                        logService.Warn("EmpPEP.WebApi", "DownloadAttachment", $"Decrypted content is empty for file {fullFilePath}");
                        return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), "File decryption failed. The file may be corrupted.");
                    }
                }
                catch (Exception decryptEx)
                {
                    logService.Fatal("EmpPEP.WebApi", "DownloadAttachment", $"Decryption failed for file {fullFilePath}: {decryptEx.Message}");
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), "File decryption failed. The file may be corrupted or encrypted with different keys.");
                }

                // Extract original file name using centralized helper method
                string originalFileName = ExtractOriginalFileName(fileNameOnly);

                // Determine content type based on file extension
                string contentType = "application/octet-stream";
                string fileExtension = Path.GetExtension(originalFileName).ToLower();
                switch (fileExtension)
                {
                    case ".pdf":
                        contentType = "application/pdf";
                        break;
                    case ".doc":
                        contentType = "application/msword";
                        break;
                    case ".docx":
                        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                        break;
                    case ".xls":
                        contentType = "application/vnd.ms-excel";
                        break;
                    case ".xlsx":
                        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                        break;
                    case ".jpg":
                    case ".jpeg":
                        contentType = "image/jpeg";
                        break;
                    case ".png":
                        contentType = "image/png";
                        break;
                    case ".gif":
                        contentType = "image/gif";
                        break;
                    default:
                        contentType = "application/octet-stream";
                        break;
                }

                // Create response with decrypted content
                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);
                response.Content = new ByteArrayContent(decryptedContent);
                response.Content.Headers.ContentType = new MediaTypeHeaderValue(contentType);
                
                // Set Content-Disposition header with properly quoted filename
                var contentDisposition = new ContentDispositionHeaderValue("attachment")
                {
                    FileName = originalFileName
                };
                response.Content.Headers.ContentDisposition = contentDisposition;

                return response;
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "DownloadAttachment", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Download all attachments for a user in a particular appraisal cycle as ZIP
        /// All files are decrypted before adding to ZIP and maintain their original format and extension
        /// </summary>
        [HttpGet]
        [Route("DownloadAllAttachments")]
        public HttpResponseMessage DownloadAllAttachments(int AppraisalCycleId, int? EmployeeId = null)
        {
            try
            {
                int loggedInEmployeeId = EmployeeAuthentication.GetEmployeeId(Request);
                
                // Use provided EmployeeId (for team member downloads) or default to logged-in user
                int targetEmployeeId = EmployeeId ?? loggedInEmployeeId;
                
                // Validate that the logged-in user has permission to download attachments for the target employee
                if (targetEmployeeId != loggedInEmployeeId)
                {
                    EmployeeMasterBL employeeMasterBL = new EmployeeMasterBL();
                    PageSideBarBL pageSideBarBL = new PageSideBarBL();
                    
                    bool isManager = employeeMasterBL.IsMyManager(targetEmployeeId, loggedInEmployeeId, AppraisalCycleId);
                    bool isAdmin = pageSideBarBL.IsAdmin(loggedInEmployeeId);
                    
                    if (!isManager && !isAdmin)
                    {
                        return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.Forbidden.ToString(), "You do not have permission to download attachments for this employee");
                    }
                }
                
                EmployeeKRABL employeeKRABL = new EmployeeKRABL();
                var attachmentPaths = employeeKRABL.GetAllAttachmentPaths(targetEmployeeId, AppraisalCycleId);

                if (attachmentPaths == null || attachmentPaths.Count == 0)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "No attachments found");
                }

                // Get decryption configuration
                string aesKeyBase64 = ConfigurationManager.AppSettings["AesKey"];
                string aesIVBase64 = ConfigurationManager.AppSettings["AesIV"];

                if (string.IsNullOrEmpty(aesKeyBase64) || string.IsNullOrEmpty(aesIVBase64))
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), "Decryption configuration missing");
                }

                byte[] key = Convert.FromBase64String(aesKeyBase64);
                byte[] iv = Convert.FromBase64String(aesIVBase64);

                // Get file path from config
                string filePath = ConfigurationManager.AppSettings["FilePath"];
                if (string.IsNullOrEmpty(filePath))
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), "File path configuration missing");
                }

                // Create ZIP in memory
                using (MemoryStream zipStream = new MemoryStream())
                {
                    int filesAdded = 0;
                    int filesSkipped = 0;
                    
                    using (ZipArchive zip = new ZipArchive(zipStream, ZipArchiveMode.Create, true))
                    {
                        foreach (var attachment in attachmentPaths)
                        {
                            // Skip if no file path
                            if (string.IsNullOrWhiteSpace(attachment.FilePath))
                            {
                                filesSkipped++;
                                continue;
                            }
                            
                            // Reconstruct full path: FilePath/{EmployeeId}/{AppraisalCycleId}/{filename}
                            string fullFilePath = Path.Combine(filePath, targetEmployeeId.ToString(), AppraisalCycleId.ToString(), attachment.FilePath);
                            
                            if (!File.Exists(fullFilePath))
                            {
                                logService.Warn("EmpPEP.WebApi", "DownloadAllAttachments", $"File not found: {fullFilePath}");
                                filesSkipped++;
                                continue;
                            }
                            
                            try
                            {
                                // CRITICAL: Decrypt file in memory BEFORE adding to ZIP
                                byte[] decryptedContent = null;
                                try
                                {
                                    decryptedContent = EncryptionDecryption.DecryptFileInMemory(fullFilePath, key, iv);
                                    
                                    // Validate decrypted content
                                    if (decryptedContent == null || decryptedContent.Length == 0)
                                    {
                                        logService.Warn("EmpPEP.WebApi", "DownloadAllAttachments", $"Decrypted content is empty for file: {attachment.FilePath}");
                                        filesSkipped++;
                                        continue;
                                    }
                                }
                                catch (Exception decryptEx)
                                {
                                    logService.Warn("EmpPEP.WebApi", "DownloadAllAttachments", $"Decryption failed for {attachment.FilePath}: {decryptEx.Message}");
                                    filesSkipped++;
                                    continue;
                                }

                                // Extract original filename (remove timestamp and .enc extension)
                                // Encrypted format: originalname_YYYYMMDDHHMMSS.ext.enc
                                // Example: Picture2_20251117175430.png.enc -> Picture2.png
                                string originalFileName = ExtractOriginalFileName(attachment.FilePath);

                                // Validate we have both decrypted content and original filename
                                if (decryptedContent != null && decryptedContent.Length > 0 && !string.IsNullOrWhiteSpace(originalFileName))
                                {
                                    // Create ZIP entry with original filename (with KRA ID prefix for uniqueness)
                                    string zipEntryName = $"KRA_{attachment.KRAId}_{originalFileName}";
                                    
                                    ZipArchiveEntry entry = zip.CreateEntry(zipEntryName);
                                    using (Stream entryStream = entry.Open())
                                    {
                                        entryStream.Write(decryptedContent, 0, decryptedContent.Length);
                                    }
                                    
                                    filesAdded++;
                                    logService.Info("EmpPEP.WebApi", "DownloadAllAttachments", $"Added decrypted file to ZIP: {originalFileName} (from {attachment.FilePath})");
                                }
                                else
                                {
                                    logService.Warn("EmpPEP.WebApi", "DownloadAllAttachments", $"Invalid data for file {attachment.FilePath}: decryptedContent={decryptedContent?.Length ?? 0} bytes, originalFileName={originalFileName ?? "null"}");
                                    filesSkipped++;
                                }
                            }
                            catch (Exception ex)
                            {
                                logService.Warn("EmpPEP.WebApi", "DownloadAllAttachments", $"Failed to process file {attachment.FilePath}: {ex.Message}");
                                filesSkipped++;
                            }
                        }

                        // Validate that at least one file was added
                        if (filesAdded == 0)
                        {
                            string errorMsg = filesSkipped > 0 
                                ? $"No valid attachments found to download. {filesSkipped} file(s) were skipped (may be missing, corrupted, or failed decryption)."
                                : "No attachments found to download.";
                            return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), errorMsg);
                        }
                    }

                    // Flush ZIP stream
                    zipStream.Position = 0;
                    byte[] zipBytes = zipStream.ToArray();
                    
                    // Final validation
                    if (zipBytes == null || zipBytes.Length == 0)
                    {
                        return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), "ZIP file creation failed. The archive is empty.");
                    }

                    // Return ZIP file
                    HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);
                    response.Content = new ByteArrayContent(zipBytes);
                    response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/zip");
                    response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
                    {
                        FileName = $"KRA_Attachments_Employee_{targetEmployeeId}_Cycle_{AppraisalCycleId}_{DateTime.Now:yyyyMMddHHmmss}.zip"
                    };

                    logService.Info("EmpPEP.WebApi", "DownloadAllAttachments", $"ZIP created successfully: {filesAdded} file(s) added, {filesSkipped} file(s) skipped");
                    return response;
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "DownloadAllAttachments", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), $"An error occurred while creating the ZIP file: {ex.Message}");
            }
        }

        /// <summary>
        /// Helper method to extract original filename from encrypted filename
        /// Removes timestamp and .enc extension to restore original format
        /// </summary>
        private string ExtractOriginalFileName(string encryptedFileName)
        {
            if (string.IsNullOrWhiteSpace(encryptedFileName))
            {
                return encryptedFileName;
            }

            string fileName = encryptedFileName;
            
            // Step 1: Remove .enc extension if present
            if (fileName.EndsWith(".enc", StringComparison.OrdinalIgnoreCase))
            {
                fileName = fileName.Substring(0, fileName.Length - 4);
            }
            
            // Step 2: Extract original filename by removing timestamp
            // Format: originalname_YYYYMMDDHHMMSS.ext
            // Find the last underscore which should be before the timestamp
            int lastUnderscore = fileName.LastIndexOf('_');
            if (lastUnderscore > 0)
            {
                string beforeUnderscore = fileName.Substring(0, lastUnderscore);
                string afterUnderscore = fileName.Substring(lastUnderscore + 1);
                
                // Check if after underscore starts with timestamp pattern (14 digits)
                if (afterUnderscore.Length >= 14)
                {
                    string possibleTimestamp = afterUnderscore.Substring(0, 14);
                    if (possibleTimestamp.All(char.IsDigit))
                    {
                        // Get extension from afterUnderscore (everything after the 14-digit timestamp)
                        string extension = Path.GetExtension(afterUnderscore);
                        return beforeUnderscore + extension;
                    }
                }
            }
            
            // If no timestamp pattern found, return filename without .enc
            return fileName;
        }

        /// <summary>
        /// Get Self Assessment Attachments by Employee, AppraisalCycle, and SelfAssessmentCycle
        /// </summary>
        [HttpGet]
        [Route("GetSelfAssessmentAttachmentsByEmployeeCycle")]
        public HttpResponseMessage GetSelfAssessmentAttachmentsByEmployeeCycle(int EmployeeId, int AppraisalCycleId, int? SelfAssessmentCycleId = null)
        {
            try
            {
                EmployeeKRABL employeeKRABL = new EmployeeKRABL();
                var attachmentsData = employeeKRABL.GetSelfAssessmentAttachmentsByEmployeeCycle(EmployeeId, AppraisalCycleId, SelfAssessmentCycleId);

                if (attachmentsData == null || attachmentsData.Rows.Count == 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, new List<object>()); // Return empty list instead of error
                }

                // Convert DataTable to list of objects
                var attachmentsList = new List<object>();
                foreach (DataRow row in attachmentsData.Rows)
                {
                    attachmentsList.Add(new
                    {
                        AttachmentId = row["AttachmentId"],
                        SelfAssessmentId = row["SelfAssessmentId"],
                        EmployeeId = row["EmployeeId"],
                        AppraisalCycleId = row["AppraisalCycleId"],
                        SelfAssessmentCycleId = row["SelfAssessmentCycleId"] != DBNull.Value ? row["SelfAssessmentCycleId"] : (int?)null,
                        AttachmentPath = row["AttachmentPath"],
                        OriginalFileName = row["OriginalFileName"] != DBNull.Value ? row["OriginalFileName"] : string.Empty,
                        FileSize = row["FileSize"] != DBNull.Value ? row["FileSize"] : (long?)null,
                        ContentType = row["ContentType"] != DBNull.Value ? row["ContentType"] : string.Empty,
                        CreatedBy = row["CreatedBy"],
                        CreatedOn = row["CreatedOn"],
                        KRAId = row["KRAId"]
                    });
                }

                return ResponseMessages.CreateResponseMessage(true, attachmentsList);
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetSelfAssessmentAttachmentsByEmployeeCycle", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Upload and encrypt Self Assessment attachment file
        /// </summary>
        [HttpPost]
        [Route("UploadSelfAssessmentAttachment")]
        public async Task<HttpResponseMessage> UploadSelfAssessmentAttachment(int SelfAssessmentId, int KRAId, int EmployeeId, int AppraisalCycleId, int? SelfAssessmentCycleId = null)
        {
            try
            {
                if (!Request.Content.IsMimeMultipartContent())
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "Request must be multipart/form-data");
                }

                var provider = new MultipartMemoryStreamProvider();
                await Request.Content.ReadAsMultipartAsync(provider);

                HttpContent fileContent = null;
                string fileName = null;

                foreach (var content in provider.Contents)
                {
                    if (content.Headers.ContentDisposition != null && content.Headers.ContentDisposition.FileName != null)
                    {
                        fileContent = content;
                        fileName = content.Headers.ContentDisposition.FileName.Trim('"');
                        break;
                    }
                }

                if (fileContent == null || string.IsNullOrEmpty(fileName))
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "No file provided");
                }

                byte[] fileBytes = await fileContent.ReadAsByteArrayAsync();
                if (!EmployeeKRABL.TryValidateSelfAssessmentAttachment(fileName, fileBytes.LongLength, out string validationError))
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), validationError);
                }

                // Get configuration values
                string filePath = ConfigurationManager.AppSettings["FilePath"];
                string aesKeyBase64 = ConfigurationManager.AppSettings["AesKey"];
                string aesIVBase64 = ConfigurationManager.AppSettings["AesIV"];

                if (string.IsNullOrEmpty(filePath) || string.IsNullOrEmpty(aesKeyBase64) || string.IsNullOrEmpty(aesIVBase64))
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), "File path or encryption configuration missing");
                }

                // Convert base64 keys to byte arrays
                byte[] key = Convert.FromBase64String(aesKeyBase64);
                byte[] iv = Convert.FromBase64String(aesIVBase64);

                // Create folder structure: EmployeeId/AppraisalCycleId/
                string folderPath = Path.Combine(filePath, EmployeeId.ToString(), AppraisalCycleId.ToString());
                
                // Ensure directory exists
                if (!Directory.Exists(folderPath))
                {
                    Directory.CreateDirectory(folderPath);
                }

                // Generate file name with timestamp and .enc extension
                string fileExtension = Path.GetExtension(fileName);
                string fileNameWithoutExt = Path.GetFileNameWithoutExtension(fileName);
                string timestamp = DateTime.Now.ToString("yyyyMMddHHmmss");
                string encryptedFileName = $"{fileNameWithoutExt}_{timestamp}{fileExtension}.enc";
                string fullFilePath = Path.Combine(folderPath, encryptedFileName);

                // Encrypt file (content already read and size-validated above)
                using (Stream fileStream = new MemoryStream(fileBytes))
                {
                    EncryptionDecryption.EncryptFile(fileStream, fullFilePath, key, iv);
                }

                // Store only the filename (not the full path) in the database
                string fileNameOnly = Path.GetFileName(fullFilePath);
                
                // File size (original) and content type
                long fileSize = fileBytes.Length;
                string contentType = fileContent.Headers.ContentType?.MediaType ?? "application/octet-stream";
                
                // Get user ID from token
                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;
                int createdBy = userIdClaim != null ? int.Parse(userIdClaim) : EmployeeId;
                
                // Insert attachment record
                EmployeeKRABL employeeKRABL = new EmployeeKRABL();
                var result = employeeKRABL.InsertSelfAssessmentAttachment(
                    SelfAssessmentId, 
                    EmployeeId, 
                    AppraisalCycleId, 
                    SelfAssessmentCycleId, 
                    fileNameOnly, 
                    fileName, 
                    fileSize, 
                    contentType, 
                    createdBy
                );

                if (result)
                {
                    return ResponseMessages.CreateResponseMessage(true, new { FilePath = fullFilePath, FileName = fileName, AttachmentPath = fileNameOnly });
                }
                else
                {
                    // File was saved but database insert failed - log warning
                    logService.Warn("EmpPEP.WebApi", "UploadSelfAssessmentAttachment", $"File saved successfully but failed to insert attachment record for SelfAssessmentId {SelfAssessmentId}");
                    return ResponseMessages.CreateResponseMessage(true, new { FilePath = fullFilePath, FileName = fileName, Warning = "File saved but database update may have failed" });
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "UploadSelfAssessmentAttachment", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Download Self Assessment attachment file (decrypted)
        /// </summary>
        [HttpGet]
        [Route("DownloadSelfAssessmentAttachment")]
        public HttpResponseMessage DownloadSelfAssessmentAttachment(int AttachmentId)
        {
            try
            {
                EmployeeKRABL employeeKRABL = new EmployeeKRABL();
                var attachmentData = employeeKRABL.GetSelfAssessmentAttachmentById(AttachmentId);

                if (attachmentData == null || attachmentData.Rows.Count == 0)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Attachment not found");
                }

                DataRow attachment = attachmentData.Rows[0];
                string fileNameOnly = attachment["AttachmentPath"].ToString();
                int employeeId = Convert.ToInt32(attachment["EmployeeId"]);
                int appraisalCycleId = Convert.ToInt32(attachment["AppraisalCycleId"]);

                // Get file path configuration
                string filePath = ConfigurationManager.AppSettings["FilePath"];
                if (string.IsNullOrEmpty(filePath))
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), "File path configuration missing");
                }
                
                string fullFilePath = Path.Combine(filePath, employeeId.ToString(), appraisalCycleId.ToString(), fileNameOnly);

                if (!File.Exists(fullFilePath))
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Attachment file not found on disk");
                }

                // Get decryption configuration
                string aesKeyBase64 = ConfigurationManager.AppSettings["AesKey"];
                string aesIVBase64 = ConfigurationManager.AppSettings["AesIV"];

                if (string.IsNullOrEmpty(aesKeyBase64) || string.IsNullOrEmpty(aesIVBase64))
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), "Decryption configuration missing");
                }

                // Convert base64 keys to byte arrays
                byte[] key = Convert.FromBase64String(aesKeyBase64);
                byte[] iv = Convert.FromBase64String(aesIVBase64);

                // Decrypt file in memory
                byte[] decryptedContent;
                try
                {
                    decryptedContent = EncryptionDecryption.DecryptFileInMemory(fullFilePath, key, iv);
                    
                    if (decryptedContent == null || decryptedContent.Length == 0)
                    {
                        logService.Warn("EmpPEP.WebApi", "DownloadSelfAssessmentAttachment", $"Decrypted content is empty for file {fullFilePath}");
                        return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), "File decryption failed. The file may be corrupted.");
                    }
                }
                catch (Exception decryptEx)
                {
                    logService.Fatal("EmpPEP.WebApi", "DownloadSelfAssessmentAttachment", $"Decryption failed for file {fullFilePath}: {decryptEx.Message}");
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), "File decryption failed. The file may be corrupted or encrypted with different keys.");
                }

                // Extract original file name
                string originalFileName = attachment["OriginalFileName"] != DBNull.Value ? attachment["OriginalFileName"].ToString() : ExtractOriginalFileName(fileNameOnly);

                // Determine content type
                string contentType = "application/octet-stream";
                if (attachment["ContentType"] != DBNull.Value && !string.IsNullOrEmpty(attachment["ContentType"].ToString()))
                {
                    contentType = attachment["ContentType"].ToString();
                }
                else
                {
                    string fileExtension = Path.GetExtension(originalFileName).ToLower();
                    switch (fileExtension)
                    {
                        case ".pdf": contentType = "application/pdf"; break;
                        case ".doc": contentType = "application/msword"; break;
                        case ".docx": contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"; break;
                        case ".xls": contentType = "application/vnd.ms-excel"; break;
                        case ".xlsx": contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; break;
                        case ".jpg": case ".jpeg": contentType = "image/jpeg"; break;
                        case ".png": contentType = "image/png"; break;
                        case ".gif": contentType = "image/gif"; break;
                        default: contentType = "application/octet-stream"; break;
                    }
                }

                // Create response with decrypted content
                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);
                response.Content = new ByteArrayContent(decryptedContent);
                response.Content.Headers.ContentType = new MediaTypeHeaderValue(contentType);
                
                // Set Content-Disposition header
                var contentDisposition = new ContentDispositionHeaderValue("attachment")
                {
                    FileName = originalFileName
                };
                response.Content.Headers.ContentDisposition = contentDisposition;

                return response;
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "DownloadSelfAssessmentAttachment", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Soft-delete a self-assessment attachment (employee may only delete their own).
        /// </summary>
        [HttpDelete]
        [Route("DeleteSelfAssessmentAttachment")]
        public HttpResponseMessage DeleteSelfAssessmentAttachment(int AttachmentId)
        {
            try
            {
                if (AttachmentId <= 0)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "Invalid attachment id");
                }

                var identity = (ClaimsIdentity)User.Identity;
                var userIdClaim = identity.Claims.FirstOrDefault(c => c.Type == "LoginId")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int loginEmployeeId))
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.Unauthorized.ToString(), "Invalid user");
                }

                EmployeeKRABL employeeKRABL = new EmployeeKRABL();
                bool ok = employeeKRABL.DeactivateSelfAssessmentAttachment(AttachmentId, loginEmployeeId, loginEmployeeId);
                if (!ok)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Attachment not found or access denied");
                }

                return ResponseMessages.CreateResponseMessage(true, new { AttachmentId = AttachmentId });
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "DeleteSelfAssessmentAttachment", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Download all Self Assessment attachments for a user in a particular appraisal cycle as ZIP
        /// All files are decrypted before adding to ZIP and maintain their original format and extension
        /// </summary>
        [HttpGet]
        [Route("DownloadAllSelfAssessmentAttachments")]
        public HttpResponseMessage DownloadAllSelfAssessmentAttachments(int AppraisalCycleId, int EmployeeId, int? SelfAssessmentCycleId = null)
        {
            try
            {
                EmployeeKRABL employeeKRABL = new EmployeeKRABL();
                var attachmentsData = employeeKRABL.GetSelfAssessmentAttachmentsByEmployeeCycle(EmployeeId, AppraisalCycleId, SelfAssessmentCycleId);

                if (attachmentsData == null || attachmentsData.Rows.Count == 0)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "No attachments found");
                }

                // Get file path and encryption configuration
                string filePath = ConfigurationManager.AppSettings["FilePath"];
                string aesKeyBase64 = ConfigurationManager.AppSettings["AesKey"];
                string aesIVBase64 = ConfigurationManager.AppSettings["AesIV"];

                if (string.IsNullOrEmpty(filePath) || string.IsNullOrEmpty(aesKeyBase64) || string.IsNullOrEmpty(aesIVBase64))
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), "File path or decryption configuration missing");
                }

                byte[] key = Convert.FromBase64String(aesKeyBase64);
                byte[] iv = Convert.FromBase64String(aesIVBase64);

                // Create ZIP in memory
                using (MemoryStream zipStream = new MemoryStream())
                {
                    using (ZipArchive zip = new ZipArchive(zipStream, ZipArchiveMode.Create, true))
                    {
                        foreach (DataRow attachment in attachmentsData.Rows)
                        {
                            string fileNameOnly = attachment["AttachmentPath"].ToString();
                            string fullFilePath = Path.Combine(filePath, EmployeeId.ToString(), AppraisalCycleId.ToString(), fileNameOnly);

                            if (File.Exists(fullFilePath))
                            {
                                try
                                {
                                    // Decrypt file
                                    byte[] decryptedContent = EncryptionDecryption.DecryptFileInMemory(fullFilePath, key, iv);
                                    
                                    if (decryptedContent != null && decryptedContent.Length > 0)
                                    {
                                        // Use original filename if available, otherwise extract from encrypted filename
                                        string originalFileName = attachment["OriginalFileName"] != DBNull.Value 
                                            ? attachment["OriginalFileName"].ToString() 
                                            : ExtractOriginalFileName(fileNameOnly);
                                        
                                        // Create entry in ZIP with original filename
                                        ZipArchiveEntry entry = zip.CreateEntry(originalFileName);
                                        using (Stream entryStream = entry.Open())
                                        {
                                            entryStream.Write(decryptedContent, 0, decryptedContent.Length);
                                        }
                                    }
                                }
                                catch (Exception ex)
                                {
                                    logService.Warn("EmpPEP.WebApi", "DownloadAllSelfAssessmentAttachments", $"Failed to process file {fullFilePath}: {ex.Message}");
                                    // Continue with other files
                                }
                            }
                        }
                    }

                    zipStream.Position = 0;
                    byte[] zipBytes = zipStream.ToArray();

                    if (zipBytes.Length == 0)
                    {
                        return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), "Failed to create ZIP file");
                    }

                    // Create response
                    HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);
                    response.Content = new ByteArrayContent(zipBytes);
                    response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/zip");
                    
                    string zipFileName = $"SelfAssessment_Attachments_{EmployeeId}_{AppraisalCycleId}_{DateTime.Now:yyyyMMddHHmmss}.zip";
                    var contentDisposition = new ContentDispositionHeaderValue("attachment")
                    {
                        FileName = zipFileName
                    };
                    response.Content.Headers.ContentDisposition = contentDisposition;

                    return response;
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "DownloadAllSelfAssessmentAttachments", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }
        /// <summary>
        /// Validate if Reference Goal Master button should be shown
        /// </summary>
        [HttpGet]
        [Route("ValidateReferenceGoalMasterAccess")]
        public HttpResponseMessage ValidateReferenceGoalMasterAccess(string EmployeeId)
        {
            try
            {
                EmployeeKRABL employeeKRABL = new EmployeeKRABL();
                var result = employeeKRABL.GetReferenceGoalMasterAccessable(EmployeeId.ToString());

                if (result != null && result.Tables.Count > 0 && result.Tables[0].Rows.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "Validation failed");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "ValidateReferenceGoalMasterAccess", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Get Reference Goal Master data by GradeId and EmpUnitId
        /// </summary>
        [HttpGet]
        [Route("GetReferenceGoalMaster")]
        public HttpResponseMessage GetReferenceGoalMaster(int GradeId, int? EmpUnitId = null)
        {
            try
            {
                EmployeeKRABL employeeKRABL = new EmployeeKRABL();
                var result = employeeKRABL.GetReferenceGoalMaster(GradeId, EmpUnitId);

                if (result != null && result.Tables.Count > 0 && result.Tables[0].Rows.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, result);
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "No reference goals found");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetReferenceGoalMaster", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Insert a custom reference goal
        /// </summary>
        [HttpPost]
        [Route("InsertCustomReferenceGoal")]
        public HttpResponseMessage InsertCustomReferenceGoal([FromBody] dynamic customGoalData)
        {
            try
            {
                if (customGoalData == null)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "Invalid data");
                }

                int employeeId = (int)customGoalData.EmployeeId;
                int appraisalCycleId = (int)customGoalData.AppraisalCycleId;
                string roleDescription = customGoalData.RoleDescription;
                string skillsUsed = customGoalData.SkillsUsed;
                string projectDetails = customGoalData.ProjectDetails;
                int createdBy = (int)customGoalData.CreatedBy;

                EmployeeKRABL employeeKRABL = new EmployeeKRABL();
                
                // Check if custom goal already exists for this employee and appraisal cycle
                bool alreadyExists = employeeKRABL.CheckCustomReferenceGoalExists(employeeId, appraisalCycleId);
                if (alreadyExists)
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.BadRequest.ToString(), "Reference goal already exists for this appraisal cycle. Only one reference goal is allowed per cycle.");
                }
                
                int customGoalId = employeeKRABL.InsertCustomReferenceGoal(employeeId, appraisalCycleId, 
                    roleDescription, skillsUsed, projectDetails, createdBy);

                if (customGoalId > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, new { CustomGoalId = customGoalId, Message = "Reference goal created successfully" });
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), "Failed to create reference goal");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "InsertCustomReferenceGoal", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Get custom reference goals by employee and appraisal cycle
        /// </summary>
        [HttpGet]
        [Route("GetCustomReferenceGoals")]
        public HttpResponseMessage GetCustomReferenceGoals(int EmployeeId, int AppraisalCycleId)
        {
            try
            {
                EmployeeKRABL employeeKRABL = new EmployeeKRABL();
                DataTable dt = employeeKRABL.GetCustomReferenceGoalsByEmployee(EmployeeId, AppraisalCycleId);

                if (dt != null && dt.Rows.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, dt);
                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(true, new DataTable());
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetCustomReferenceGoals", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Get all active sub-skills for dropdown
        /// </summary>
        [HttpGet]
        [Route("GetAllSubSkills")]
        public HttpResponseMessage GetAllSubSkills()
        {
            try
            {
                EmployeeKRABL employeeKRABL = new EmployeeKRABL();
                DataTable dt = employeeKRABL.GetAllSubSkills();

                if (dt != null && dt.Rows.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, dt);
                }
                else
                {
                    return ResponseMessages.CreateResponseMessage(true, new DataTable());
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetAllSubSkills", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Get Employee Project Name by EmployeeId
        /// </summary>
        [HttpGet]
        [Route("GetEmployeeProjectName")]
        public HttpResponseMessage GetEmployeeProjectName(int EmployeeId)
        {
            try
            {
                EmployeeKRABL employeeKRABL = new EmployeeKRABL();
                string projectName = employeeKRABL.GetEmployeeProjectName(EmployeeId);
                
                if (!string.IsNullOrEmpty(projectName))
                {
                    return Request.CreateResponse(HttpStatusCode.OK, new { Success = true, ProjectName = projectName });
                }
                else
                {
                    return Request.CreateResponse(HttpStatusCode.OK, new { Success = false, Message = "Project name not found", ProjectName = "" });
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetEmployeeProjectName", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

        /// <summary>
        /// Get all active grades for dropdown
        /// </summary>
        [HttpGet]
        [Route("GetGradeList")]
        public HttpResponseMessage GetGradeList()
        {
            try
            {
                EmployeeKRABL employeeKRABL = new EmployeeKRABL();
                DataTable dt = employeeKRABL.GetGradeList();
                
                if (dt != null && dt.Rows.Count > 0)
                {
                    return ResponseMessages.CreateResponseMessage(true, dt);
                }
                else
                {
                    return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.NotFound.ToString(), "No grades found");
                }
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.WebApi", "GetGradeList", ex.Message);
                return ResponseMessages.CreateResponseErrorMessage(false, HttpStatusCode.InternalServerError.ToString(), ex.Message);
            }
        }

    }
}