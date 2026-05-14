using EmpPEP.BusinessEntities;
using EmpPEP.Framework.Helper;
using EmpPEP.Framework.Log4Net.Helper;
using EmpPEP.Repository.EntityDataModel;
using EmpPEP.Repository.UnitOfWorks;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Net.Mail;
using System.Linq;
using System.Data;
using System.Transactions;

namespace EmpPEP.BusinessLayer
{
    public class GoalModificationRequestBL
    {
        public string sectionName = "GoalModificationRequestBL";

        #region "Public Methods"

        /// <summary>
        /// Get a goal modification request by ID
        /// </summary>
        public GoalModificationRequestEntity Get(int requestId)
        {
            using (var repository = new GoalModificationRequestRepository())
            {
                var request = repository.Get(requestId);
                if (request != null)
                {
                    GoalModificationRequestEntity entity = new GoalModificationRequestEntity();
                    return (GoalModificationRequestEntity)Utility.ConvertToObject(request, entity);
                }
                return null;
            }
        }

        /// <summary>
        /// Get goal modification requests by employee and cycle
        /// Goals are set once per yearly appraisal cycle
        /// </summary>
        public List<GoalModificationRequestEntity> GetByEmployeeAndCycle(int employeeId, int appraisalCycleId)
        {
            using (var repository = new GoalModificationRequestRepository())
            {
                List<GoalModificationRequest> requests = repository.GetByEmployeeAndCycle(employeeId, appraisalCycleId);
                return Utility.ConvertToList<GoalModificationRequest, GoalModificationRequestEntity>(requests);
            }
        }

        /// <summary>
        /// Check if employee can request goal modification (max 2 per appraisal cycle)
        /// Goals are set once per yearly appraisal cycle
        /// </summary>
        public bool CanRequestModification(int employeeId, int appraisalCycleId)
        {
            using (var repository = new GoalModificationRequestRepository())
            {
                int approvedCount = repository.GetApprovedRequestCount(employeeId, appraisalCycleId);
                return approvedCount < 2;
            }
        }

        /// <summary>
        /// Get count of approved requests for validation
        /// </summary>
        public int GetApprovedRequestCount(int employeeId, int appraisalCycleId)
        {
            using (var repository = new GoalModificationRequestRepository())
            {
                return repository.GetApprovedRequestCount(employeeId, appraisalCycleId);
            }
        }

        /// <summary>
        /// Check if employee has a pending request
        /// </summary>
        public bool HasPendingRequest(int employeeId, int appraisalCycleId)
        {
            using (var repository = new GoalModificationRequestRepository())
            {
                var requests = repository.GetByEmployeeAndCycle(employeeId, appraisalCycleId);
                return requests.Any(r => r.Status == "Pending");
            }
        }

        /// <summary>
        /// Verify if the manager is authorized to approve/reject the request
        /// </summary>
        public bool IsManagerAuthorized(int requestId, int managerId)
        {
            try
            {
                using (var repository = new GoalModificationRequestRepository())
                {
                    return repository.IsManagerAuthorized(requestId, managerId);
                }
            }
            catch (Exception ex)
            {
                //ExceptionLogging.SendErrorToText(ex, sectionName);
                return false;
            }
        }

        /// <summary>
        /// Get count of pending requests for a manager
        /// </summary>
        public int GetPendingRequestCountForManager(int managerId)
        {
            try
            {
                using (var repository = new GoalModificationRequestRepository())
                {
                    return repository.GetPendingRequestCountForManager(managerId);
                }
            }
            catch (Exception ex)
            {
                //ExceptionLogging.SendErrorToText(ex, sectionName);
                return 0;
            }
        }

        /// <summary>
        /// Get pending requests for a manager
        /// </summary>
        public List<GoalModificationRequestEntity> GetPendingRequestsForManager(int managerId)
        {
            using (var repository = new GoalModificationRequestRepository())
            {
                // Use the new method that returns Result class with EmployeeName
                var results = repository.GetPendingRequestsForManagerWithDetails(managerId);
                
                // Map Result to Entity
                var entityList = results.Select(r => new GoalModificationRequestEntity
                {
                    RequestId = r.RequestId,
                    EmployeeId = r.EmployeeId,
                    EmployeeName = r.EmployeeName, // Now from stored procedure JOIN
                    AppraisalCycleId = r.AppraisalCycleId,
                    Cycle = r.Cycle,
                    ReasonId = r.ReasonId,
                    Reason = r.Reason, // Now from stored procedure JOIN
                    Status = r.Status,
                    RequestCount = r.RequestCount,
                    CreatedDate = r.CreatedDate,
                    ModifiedDate = r.ModifiedDate,
                    ApprovedBy = r.ApprovedBy,
                    ApprovedDate = r.ApprovedDate,
                    RejectionReason = r.RejectionReason
                }).ToList();
                
                return entityList;
            }
        }

        /// <summary>
        /// Get actual cycle value (YearBreakCheck) from AppraisalCycleYearbreakupDetail
        /// Converts "H1" or "H2" to actual cycle value like "112025" or "122025"
        /// </summary>
        private string GetActualCycleValue(int appraisalCycleId, string cycle)
        {
            try
            {
                // If cycle is already in the correct format (numeric like "112025" or "122025"), return it as is
                if (!string.IsNullOrEmpty(cycle) && cycle.Length >= 6 && int.TryParse(cycle, out _))
                {
                    return cycle;
                }

                // If cycle is "H1" or "H2", look up the actual YearBreakCheck value from AppraisalCycleYearbreakupDetail
                if (string.IsNullOrEmpty(cycle) || (cycle.ToUpper() != "H1" && cycle.ToUpper() != "H2"))
                {
                    return cycle; // Return as-is if not H1/H2
                }

                using (var repository = new AppraisalCycleRepository())
                {
                    var cycleDetails = repository.GetSelfAssessmentCycleDetails(appraisalCycleId);
                    
                    if (cycleDetails != null && cycleDetails.Count > 0)
                    {
                        // Find the cycle that matches H1 or H2 based on YearBreakCheck first digit
                        // H1 cycles start with "1" (e.g., 112025), H2 cycles start with "2" (e.g., 122025)
                        var matchingCycle = cycleDetails.FirstOrDefault(c => 
                        {
                            if (!c.YearBreakCheck.HasValue)
                                return false;
                            
                            string yearBreakCheck = c.YearBreakCheck.Value.ToString();
                            
                            // Check first digit: 1 = H1, 2 = H2
                            if (cycle.ToUpper() == "H1" && yearBreakCheck.StartsWith("1"))
                                return true;
                            if (cycle.ToUpper() == "H2" && yearBreakCheck.StartsWith("2"))
                                return true;
                            
                            return false;
                        });
                        
                        if (matchingCycle != null && matchingCycle.YearBreakCheck.HasValue)
                        {
                            return matchingCycle.YearBreakCheck.Value.ToString();
                        }
                    }
                }
                
                // If not found, return original cycle value (should not happen in normal flow)
                return cycle;
            }
            catch (Exception ex)
            {
                //ExceptionLogging.SendExcepToDB(ex, sectionName, "GetActualCycleValue");
                // Return original cycle value on error
                return cycle;
            }
        }

        /// <summary>
        /// Create a new goal modification request
        /// </summary>
        public int CreateRequest(GoalModificationRequestEntity entity)
        {
            try
            {
                // IMPORTANT: Perform all validations BEFORE TransactionScope
                // This prevents multiple EF contexts from being created within the transaction
                // which causes "provider failed on Open" errors
                
                // Validate ReasonId
                if (entity.ReasonId <= 0)
                {
                    throw new Exception("Invalid Reason ID");
                }

                // Validate if goals are approved and weightage is 100
                if (!AreGoalsApprovedWithFullWeightage(entity.EmployeeId, entity.AppraisalCycleId))
                {
                    throw new Exception("Goals must be approved with 100% weightage to request modification");
                }

                // Validate if appraisal cycle is active
                if (!IsAppraisalCycleActive(entity.AppraisalCycleId))
                {
                    throw new Exception("Appraisal cycle is not currently active");
                }

                // Convert H1/H2 to actual cycle value for validations
                string actualCycleForValidation = GetActualCycleValue(entity.AppraisalCycleId, entity.Cycle);
                if (string.IsNullOrEmpty(actualCycleForValidation))
                {
                    throw new Exception($"Invalid cycle '{entity.Cycle}'. Could not find cycle details for Appraisal Cycle ID {entity.AppraisalCycleId}.");
                }

                // Validate if cycle is closed (use actual cycle value)
                if (IsCycleClosed(entity.AppraisalCycleId, actualCycleForValidation))
                {
                    throw new Exception($"Cannot request modification. {entity.Cycle} cycle is closed.");
                }

                // Validate if Self Assessment exists (use actual cycle value)
                if (HasSelfAssessment(entity.EmployeeId, entity.AppraisalCycleId, actualCycleForValidation))
                {
                    throw new Exception($"Cannot request modification. Self Assessment already exists for {entity.Cycle} cycle.");
                }

                // Validate if Manager Feedback exists (use actual cycle value)
                if (HasManagerFeedback(entity.EmployeeId, entity.AppraisalCycleId, actualCycleForValidation))
                {
                    throw new Exception($"Cannot request modification. Manager Feedback already exists for {entity.Cycle} cycle.");
                }

                // Validate if employee can make request
                if (!CanRequestModification(entity.EmployeeId, entity.AppraisalCycleId))
                {
                    return -1; // Exceeded limit
                }

                // Check for pending request
                if (HasPendingRequest(entity.EmployeeId, entity.AppraisalCycleId))
                {
                    throw new Exception("You already have a pending modification request");
                }

                // Get current count for this appraisal cycle (read-only, before transaction)
                int currentCount = 0;
                using (var countRepository = new GoalModificationRequestRepository())
                {
                    currentCount = countRepository.GetApprovedRequestCount(entity.EmployeeId, entity.AppraisalCycleId);
                }

                // Use the actual cycle value that was already converted for validations
                string actualCycleValue = actualCycleForValidation;

                // NOW start TransactionScope only for the INSERT and email operations
                // This ensures only ONE EF context is created within the transaction
                using (var transactionScope = new TransactionScope(TransactionScopeOption.Required,
                    new TransactionOptions { IsolationLevel = System.Transactions.IsolationLevel.ReadCommitted }))
                {
                    int requestId = 0;
                    
                    using (var repository = new GoalModificationRequestRepository())
                    {
                        GoalModificationRequest request = new GoalModificationRequest();
                        request.EmployeeId = entity.EmployeeId;
                        request.AppraisalCycleId = entity.AppraisalCycleId;
                        request.Cycle = actualCycleValue;  // Store actual cycle value (e.g., "112025" or "122025") instead of "H1" or "H2"
                        request.ReasonId = entity.ReasonId;
                        request.Status = "Pending";
                        request.RequestCount = currentCount + 1;
                        request.CreatedDate = DateTime.Now;

                        requestId = repository.Insert(request);
                        
                        if (requestId <= 0)
                        {
                            throw new Exception("Failed to create goal modification request");
                        }
                    }
                    
                    // Send email to manager - if this fails, transaction will rollback
                    bool emailSent = SendRequestNotificationToManager(requestId, entity.EmployeeId);
                    
                    if (!emailSent)
                    {
                        throw new Exception("Failed to send notification email to manager. Request not submitted.");
                    }
                    
                    // Commit transaction only if both DB insert and email sending succeed
                    transactionScope.Complete();
                    return requestId;
                }
            }
            catch (Exception ex)
            {
                //ExceptionLogging.SendErrorToText(ex, sectionName);
                throw new Exception(ex.Message);
            }
        }

        /// <summary>
        /// Approve a goal modification request
        /// </summary>
        public bool ApproveRequest(int requestId, int approvedBy)
        {
            try
            {
                // Use TransactionScope to ensure DB operations and email sending succeed together
                using (var transactionScope = new TransactionScope(TransactionScopeOption.Required,
                    new TransactionOptions { IsolationLevel = System.Transactions.IsolationLevel.ReadCommitted }))
                {
                    ApproveAndUnlockGoalsResult result = null;
                    
                    // Use SINGLE stored procedure that does EVERYTHING in one atomic DB operation
                    using (var repository = new GoalModificationRequestRepository())
                    {
                        // Single SP call: Approve request + Unlock goals
                        result = repository.ApproveRequestAndUnlockGoals(requestId, approvedBy);
                        
                        if (result == null || result.Success == 0)
                        {
                            throw new Exception(result?.Message ?? "Failed to approve request and unlock goals");
                        }
                        
                        if (result.UpdatedCount == 0)
                        {
                            throw new Exception("Request approved but no goals were unlocked. No approved KRAs found.");
                        }
                        
                        // Log success
                        System.Diagnostics.Debug.WriteLine($"Request approved and {result.UpdatedCount} goals unlocked for EmployeeId: {result.EmployeeId}");
                    }
                    
                    // Send approval email to employee - if this fails, transaction will rollback
                    bool emailSent = SendApprovalEmailToEmployee(requestId, result.EmployeeId.Value);
                    
                    if (!emailSent)
                    {
                        throw new Exception("Failed to send approval email to employee");
                    }
                    
                    // Commit transaction only if all operations succeed
                    transactionScope.Complete();
                    return true;
                }
            }
            catch (Exception ex)
            {
                //ExceptionLogging.SendErrorToText(ex, sectionName);
                throw new Exception("Failed to approve request: " + ex.Message);
            }
        }

        /// <summary>
        /// Reject a goal modification request
        /// </summary>
        public bool RejectRequest(int requestId, int rejectedBy, string reason)
        {
            try
            {
                // Use TransactionScope to ensure DB update and email sending both succeed together
                using (var transactionScope = new TransactionScope(TransactionScopeOption.Required,
                    new TransactionOptions { IsolationLevel = System.Transactions.IsolationLevel.ReadCommitted }))
                {
                    GoalModificationRequest request = null;
                    
                    using (var repository = new GoalModificationRequestRepository())
                    {
                        // Reject the request in database
                        bool result = repository.RejectRequest(requestId, rejectedBy, reason);
                        
                        if (!result)
                        {
                            throw new Exception("Failed to reject the request in database");
                        }
                        
                        // Get request details
                        request = repository.Get(requestId);
                        
                        if (request == null)
                        {
                            throw new Exception("Request not found after rejection");
                        }
                    }
                    
                    // Send rejection email to employee - if this fails, transaction will rollback
                    bool emailSent = SendRejectionEmailToEmployee(requestId, request.EmployeeId, reason);
                    
                    if (!emailSent)
                    {
                        throw new Exception("Failed to send rejection email to employee");
                    }
                    
                    // Commit transaction only if both operations succeed
                    transactionScope.Complete();
                    return true;
                }
            }
            catch (Exception ex)
            {
                //ExceptionLogging.SendErrorToText(ex, sectionName);
                throw new Exception("Failed to reject request: " + ex.Message);
            }
        }

        /// <summary>
        /// Unlock goals for employee after approval using stored procedure
        /// </summary>
        private bool UnlockGoalsForEmployee(int employeeId, int appraisalCycleId, int modifiedBy)
        {
            try
            {
                using (var repository = new GoalModificationRequestRepository())
                {
                    // Call stored procedure to unlock goals
                    var result = repository.UnlockEmployeeGoals(employeeId, appraisalCycleId, modifiedBy);
                    
                    if (result == null)
                    {
                        throw new Exception("No response from unlock goals stored procedure");
                    }
                    
                    if (result.Success == 0)
                    {
                        throw new Exception(result.Message ?? "Failed to unlock goals");
                    }
                    
                    if (result.UpdatedCount == 0)
                    {
                        throw new Exception("No approved KRAs found to unlock");
                    }
                    
                    return true;
                }
            }
            catch (Exception ex)
            {
                //ExceptionLogging.SendErrorToText(ex, sectionName);
                throw new Exception("Error unlocking goals: " + ex.Message);
            }
        }

        /// <summary>
        /// Send request notification to manager using centralized email service
        /// </summary>
        private bool SendRequestNotificationToManager(int requestId, int employeeId)
        {
            try
            {
                var emailService = new GoalModificationEmailService();
                bool result = emailService.SendRequestRaisedNotification(requestId);
                
                if (!result)
                {
                    throw new Exception("Email service returned false");
                }
                
                return true;
            }
            catch (Exception ex)
            {
                //ExceptionLogging.SendErrorToText(ex, sectionName);
                throw new Exception("Failed to send notification to manager: " + ex.Message);
            }
        }

        /// <summary>
        /// Send approval email to employee using centralized email service
        /// </summary>
        private bool SendApprovalEmailToEmployee(int requestId, int employeeId)
        {
            try
            {
                var emailService = new GoalModificationEmailService();
                bool result = emailService.SendRequestApprovedNotification(requestId);
                
                if (!result)
                {
                    throw new Exception("Email service returned false");
                }
                
                return true;
            }
            catch (Exception ex)
            {
                //ExceptionLogging.SendErrorToText(ex, sectionName);
                throw new Exception("Failed to send approval email to employee: " + ex.Message);
            }
        }

        /// <summary>
        /// Send rejection email to employee using centralized email service
        /// </summary>
        private bool SendRejectionEmailToEmployee(int requestId, int employeeId, string reason)
        {
            try
            {
                var emailService = new GoalModificationEmailService();
                bool result = emailService.SendRequestRejectedNotification(requestId);
                
                if (!result)
                {
                    throw new Exception("Email service returned false");
                }
                
                return true;
            }
            catch (Exception ex)
            {
                //ExceptionLogging.SendErrorToText(ex, sectionName);
                throw new Exception("Failed to send rejection email to employee: " + ex.Message);
            }
        }

        /// <summary>
        /// Check if all goals are approved and total weightage is 100
        /// </summary>
        public bool AreGoalsApprovedWithFullWeightage(int employeeId, int appraisalCycleId)
        {
            try
            {
                using (var employeeKRARepository = new EmployeeKRARepository())
                {
                    EmployeeKRA employeeKRA = new EmployeeKRA();
                    employeeKRA.EmployeeId = employeeId;
                    employeeKRA.AppraisalCycleId = appraisalCycleId;
                    employeeKRA.KRAStatusId = Convert.ToInt32(EnumCollection.KRA.Approved);

                    List<EmployeeKRA> kraList = employeeKRARepository.GetKRAToCopy(employeeKRA);
                    
                    if (kraList == null || kraList.Count == 0)
                    {
                        return false; // No approved goals
                    }

                    // All KRAs returned from GetKRAToCopy are already approved (status check done in query)
                    // Just check if total weightage is 100
                    decimal totalWeightage = kraList.Sum(k => k.Weightage ?? 0);
                    
                    return totalWeightage == 100;
                }
            }
            catch (Exception ex)
            {
                //ExceptionLogging.SendErrorToText(ex, sectionName);
                return false;
            }
        }

        /// <summary>
        /// Check if appraisal cycle is currently active for goal modification
        /// Goals are set once per yearly appraisal cycle based on AppraisalCycleMaster dates
        /// </summary>
        public bool IsAppraisalCycleActive(int appraisalCycleId)
        {
            try
            {
                using (var repository = new GoalModificationRequestRepository())
                {
                    return repository.IsAppraisalCycleActive(appraisalCycleId);
                }
            }
            catch (Exception ex)
            {
                //ExceptionLogging.SendErrorToText(ex, sectionName);
                return false;
            }
        }

        /// <summary>
        /// Check if cycle is closed
        /// </summary>
        public bool IsCycleClosed(int appraisalCycleId, string cycle)
        {
            using (var repository = new AppraisalCycleRepository())
            {
                return repository.IsCycleClosed(appraisalCycleId, cycle);
            }
        }

        /// <summary>
        /// Check if Self Assessment exists for the given cycle
        /// </summary>
        public bool HasSelfAssessment(int employeeId, int appraisalCycleId, string cycle)
        {
            using (var repository = new EmployeeKRARepository())
            {
                return repository.HasSelfAssessment(employeeId, appraisalCycleId, cycle);
            }
        }

        /// <summary>
        /// Check if Manager Feedback exists for the given cycle
        /// </summary>
        public bool HasManagerFeedback(int employeeId, int appraisalCycleId, string cycle)
        {
            using (var repository = new EmployeeFeedBackRepository())
            {
                return repository.HasManagerFeedback(employeeId, appraisalCycleId, cycle);
            }
        }

        /// <summary>
        /// Public method to check if goals can be modified (used by API)
        /// </summary>
        public bool CanModifyGoal(int employeeId, int appraisalCycleId, string cycle)
        {
            // Check if cycle is closed
            if (IsCycleClosed(appraisalCycleId, cycle))
            {
                return false;
            }
            
            // Check if Self Assessment exists
            if (HasSelfAssessment(employeeId, appraisalCycleId, cycle))
            {
                return false;
            }
            
            // Check if Manager Feedback exists
            if (HasManagerFeedback(employeeId, appraisalCycleId, cycle))
            {
                return false;
            }
            
            return true;
        }

        /// <summary>
        /// Check if H2 cycle change warning should be shown
        /// Returns true if: cycle is H2 AND employee hasn't filled self review for H1 AND manager hasn't given feedback for H1
        /// currentCycle is the actual YearBreakCheck value (e.g., "122025" for H2, "112025" for H1)
        /// </summary>
        public bool ShouldShowH2Warning(int employeeId, int appraisalCycleId, string currentCycle)
        {
            try
            {
                // currentCycle is already the actual YearBreakCheck value (like "122025" or "112025")
                // Check if current cycle is H2 (starts with "12")
                bool isH2Cycle = !string.IsNullOrEmpty(currentCycle) && currentCycle.Length >= 6 && currentCycle.StartsWith("12");
                
                if (!isH2Cycle)
                {
                    return false; // Not H2 cycle, no warning needed
                }
                
                // Get H1 cycle value (starts with "11") for the same appraisal cycle
                string h1Cycle = null;
                using (var repository = new AppraisalCycleRepository())
                {
                    var cycleDetails = repository.GetSelfAssessmentCycleDetails(appraisalCycleId);
                    
                    if (cycleDetails != null && cycleDetails.Count > 0)
                    {
                        // Find the H1 cycle (starts with "11")
                        var h1CycleDetail = cycleDetails.FirstOrDefault(c => 
                        {
                            if (!c.YearBreakCheck.HasValue)
                                return false;
                            
                            string yearBreakCheck = c.YearBreakCheck.Value.ToString();
                            return yearBreakCheck.StartsWith("11");
                        });
                        
                        if (h1CycleDetail != null && h1CycleDetail.YearBreakCheck.HasValue)
                        {
                            h1Cycle = h1CycleDetail.YearBreakCheck.Value.ToString();
                        }
                    }
                }
                
                if (string.IsNullOrEmpty(h1Cycle))
                {
                    return false; // H1 cycle not found, no warning needed
                }
                
                // Check if employee has filled self review for H1 (using actual cycle ID)
                bool hasH1SelfAssessment = HasSelfAssessment(employeeId, appraisalCycleId, h1Cycle);
                
                // Check if manager has given feedback for H1 (using actual cycle ID)
                bool hasH1ManagerFeedback = HasManagerFeedback(employeeId, appraisalCycleId, h1Cycle);
                
                // Show warning if H2 cycle AND (no H1 self assessment AND no H1 manager feedback)
                return !hasH1SelfAssessment && !hasH1ManagerFeedback;
            }
            catch (Exception ex)
            {
                //ExceptionLogging.SendExcepToDB(ex, sectionName, "ShouldShowH2Warning");
                return false; // Return false on error to be safe
            }
        }

        #endregion
    }
}
