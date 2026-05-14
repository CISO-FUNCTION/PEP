using EmpPEP.Framework.Helper;
using EmpPEP.Repository.common;
using EmpPEP.Repository.EntityDataModel;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class GoalModificationRequestRepository : BaseDispose, IBaseRepository<GoalModificationRequest>
    {
        string sectionName = "GoalModificationRequestRepository";
        DataUtility du;

        #region "Private variables"
        bool disposed = false;
        private readonly PEPEntities1 context = null;
        #endregion

        #region Dispose Pattern
        protected override void Dispose(bool disposing)
        {
            if (!this.disposed && disposing)
            {
                context.Dispose();
            }
            this.disposed = true;

            // Call base class implementation.
            base.Dispose(disposing);
        }
        #endregion

        public GoalModificationRequestRepository()
        {
            context = new PEPEntities1();
            du = new DataUtility();
        }

        /// <summary>
        /// Helper method to ensure database connection is open
        /// This is important when using TransactionScope to avoid "provider failed on Open" errors
        /// </summary>
        private void EnsureConnectionOpen()
        {
            try
            {
                if (context.Database.Connection.State != System.Data.ConnectionState.Open)
                {
                    context.Database.Connection.Open();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"EnsureConnectionOpen Error: {ex.Message}");
                throw new Exception("Failed to open database connection: " + ex.Message, ex);
            }
        }

        #region Public Methods

        /// <summary>
        /// Get a goal modification request by ID
        /// </summary>
        public GoalModificationRequest Get(int id)
        {
            try
            {
                // Ensure connection is open before executing query
                EnsureConnectionOpen();

                var result = context.Database.SqlQuery<GoalModificationRequestResult>(
                    "exec [dbo].[GetGoalModificationRequestById] @RequestId",
                    new SqlParameter("@RequestId", id)
                ).FirstOrDefault();

                if (result == null) return new GoalModificationRequest();

                // Map result to GoalModificationRequest
                return new GoalModificationRequest
                {
                    RequestId = result.RequestId,
                    EmployeeId = result.EmployeeId,
                    AppraisalCycleId = result.AppraisalCycleId,
                    Cycle = result.Cycle,
                    ReasonId = result.ReasonId,
                    Status = result.Status,
                    RequestCount = result.RequestCount,
                    CreatedDate = result.CreatedDate,
                    ModifiedDate = result.ModifiedDate,
                    ApprovedBy = result.ApprovedBy,
                    ApprovedDate = result.ApprovedDate,
                    RejectionReason = result.RejectionReason
                };
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Get GoalModificationRequest Error: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Get all goal modification requests
        /// </summary>
        public List<GoalModificationRequest> Get()
        {
            var results = context.Database.SqlQuery<GoalModificationRequestResult>(
                "exec [dbo].[GetAllGoalModificationRequests]"
            ).ToList();

            return results.Select(r => new GoalModificationRequest
            {
                RequestId = r.RequestId,
                EmployeeId = r.EmployeeId,
                AppraisalCycleId = r.AppraisalCycleId,
                Cycle = r.Cycle,
                ReasonId = r.ReasonId,
                Status = r.Status,
                RequestCount = r.RequestCount,
                CreatedDate = r.CreatedDate,
                ModifiedDate = r.ModifiedDate,
                ApprovedBy = r.ApprovedBy,
                ApprovedDate = r.ApprovedDate,
                RejectionReason = r.RejectionReason
            }).ToList();
        }

        /// <summary>
        /// Get goal modification requests by employee ID and appraisal cycle
        /// Goals are set once per yearly appraisal cycle
        /// </summary>
        public List<GoalModificationRequest> GetByEmployeeAndCycle(int employeeId, int appraisalCycleId)
        {
            try
            {
                // Ensure connection is open before executing query
                EnsureConnectionOpen();

                var results = context.Database.SqlQuery<GoalModificationRequestResult>(
                    "exec [dbo].[GetGoalModificationRequestsByEmployeeAndCycle] @EmployeeId, @AppraisalCycleId",
                    new SqlParameter("@EmployeeId", employeeId),
                    new SqlParameter("@AppraisalCycleId", appraisalCycleId)
                ).ToList();

                return results.Select(r => new GoalModificationRequest
                {
                    RequestId = r.RequestId,
                    EmployeeId = r.EmployeeId,
                    AppraisalCycleId = r.AppraisalCycleId,
                    Cycle = r.Cycle,
                    ReasonId = r.ReasonId,
                    Status = r.Status,
                    RequestCount = r.RequestCount,
                    CreatedDate = r.CreatedDate,
                    ModifiedDate = r.ModifiedDate,
                    ApprovedBy = r.ApprovedBy,
                    ApprovedDate = r.ApprovedDate,
                    RejectionReason = r.RejectionReason
                }).ToList();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"GetByEmployeeAndCycle Error: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Get count of approved requests for an employee in the appraisal cycle
        /// Goals are set once per yearly appraisal cycle (max 2 modifications allowed)
        /// </summary>
        public int GetApprovedRequestCount(int employeeId, int appraisalCycleId)
        {
            try
            {
                // Ensure connection is open before executing query
                if (context.Database.Connection.State != System.Data.ConnectionState.Open)
                {
                    context.Database.Connection.Open();
                }

                var result = context.Database.SqlQuery<int>(
                    "exec [dbo].[GetApprovedRequestCountForEmployeeCycle] @EmployeeId, @AppraisalCycleId",
                    new SqlParameter("@EmployeeId", employeeId),
                    new SqlParameter("@AppraisalCycleId", appraisalCycleId)
                ).FirstOrDefault();

                return result;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"GetApprovedRequestCount Error: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Get pending requests for a manager to approve
        /// </summary>
        public List<GoalModificationRequest> GetPendingRequestsForManager(int managerId)
        {
            var results = context.Database.SqlQuery<GoalModificationRequestResult>(
                "exec [dbo].[GetPendingRequestsForManager] @ManagerId",
                new SqlParameter("@ManagerId", managerId)
            ).ToList();

            // Note: EmployeeName from Result class is NOT mapped here because 
            // GoalModificationRequest EF model doesn't have this property (it's not in the database table).
            // EmployeeName will be populated in the Business Layer when converting to Entity.
            return results.Select(r => new GoalModificationRequest
            {
                RequestId = r.RequestId,
                EmployeeId = r.EmployeeId,
                AppraisalCycleId = r.AppraisalCycleId,
                Cycle = r.Cycle,
                ReasonId = r.ReasonId,
                Status = r.Status,
                RequestCount = r.RequestCount,
                CreatedDate = r.CreatedDate,
                ModifiedDate = r.ModifiedDate,
                ApprovedBy = r.ApprovedBy,
                ApprovedDate = r.ApprovedDate,
                RejectionReason = r.RejectionReason
            }).ToList();
        }

        /// <summary>
        /// Get pending requests for a manager with full details (including EmployeeName from JOIN)
        /// </summary>
        public List<GoalModificationRequestResult> GetPendingRequestsForManagerWithDetails(int managerId)
        {
            return context.Database.SqlQuery<GoalModificationRequestResult>(
                "exec [dbo].[GetPendingRequestsForManager] @ManagerId",
                new SqlParameter("@ManagerId", managerId)
            ).ToList();
        }

        /// <summary>
        /// Insert a new goal modification request
        /// </summary>
        public int Insert(GoalModificationRequest obj)
        {
            try
            {
                // Ensure connection is open before executing command
                EnsureConnectionOpen();

                var requestIdParam = new SqlParameter
                {
                    ParameterName = "@RequestId",
                    SqlDbType = SqlDbType.Int,
                    Direction = ParameterDirection.Output
                };

                context.Database.ExecuteSqlCommand(
                    "exec [dbo].[InsertGoalModificationRequest] @EmployeeId, @AppraisalCycleId, @Cycle, @ReasonId, @Status, @RequestCount, @CreatedDate, @RequestId OUTPUT",
                    new SqlParameter("@EmployeeId", obj.EmployeeId),
                    new SqlParameter("@AppraisalCycleId", obj.AppraisalCycleId),
                    new SqlParameter("@Cycle", obj.Cycle ?? (object)DBNull.Value),
                    new SqlParameter("@ReasonId", obj.ReasonId),
                    new SqlParameter("@Status", obj.Status ?? (object)DBNull.Value),
                    new SqlParameter("@RequestCount", obj.RequestCount),
                    new SqlParameter("@CreatedDate", obj.CreatedDate),
                    requestIdParam
                );

                return (int)requestIdParam.Value;
            }
            catch (Exception ex)
            {
                // Log error and rethrow
                System.Diagnostics.Debug.WriteLine($"Insert GoalModificationRequest Error: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Update an existing goal modification request
        /// </summary>
        public bool Update(GoalModificationRequest obj)
        {
            int rowsAffected = context.Database.ExecuteSqlCommand(
                "exec [dbo].[UpdateGoalModificationRequest] @RequestId, @Status, @ModifiedDate, @ApprovedBy, @ApprovedDate, @RejectionReason",
                new SqlParameter("@RequestId", obj.RequestId),
                new SqlParameter("@Status", obj.Status ?? (object)DBNull.Value),
                new SqlParameter("@ModifiedDate", obj.ModifiedDate ?? (object)DBNull.Value),
                new SqlParameter("@ApprovedBy", obj.ApprovedBy ?? (object)DBNull.Value),
                new SqlParameter("@ApprovedDate", obj.ApprovedDate ?? (object)DBNull.Value),
                new SqlParameter("@RejectionReason", obj.RejectionReason ?? (object)DBNull.Value)
            );

            return rowsAffected > 0;
        }

        /// <summary>
        /// Result class for stored procedure responses
        /// </summary>
        public class SpResult
        {
            public int Success { get; set; }
            public string Message { get; set; }
            public string ErrorMessage { get; set; }
        }

        /// <summary>
        /// Approve a goal modification request
        /// </summary>
        public bool ApproveRequest(int requestId, int approvedBy)
        {
            try
            {
                var result = context.Database.SqlQuery<SpResult>(
                    "exec [dbo].[ApproveGoalModificationRequest] @RequestId, @ApprovedBy",
                    new SqlParameter("@RequestId", requestId),
                    new SqlParameter("@ApprovedBy", approvedBy)
                ).FirstOrDefault();

                return result != null && result.Success == 1;
            }
            catch (Exception)
            {
                return false;
            }
        }

        /// <summary>
        /// Approve goal modification request AND unlock employee goals in a single atomic operation
        /// </summary>
        public ApproveAndUnlockGoalsResult ApproveRequestAndUnlockGoals(int requestId, int approvedBy)
        {
            try
            {
                var result = context.Database.SqlQuery<ApproveAndUnlockGoalsResult>(
                    "EXEC [dbo].[ApproveGoalModificationRequestAndUnlockGoals] @RequestId, @ApprovedBy",
                    new SqlParameter("@RequestId", SqlDbType.Int) { Value = requestId },
                    new SqlParameter("@ApprovedBy", SqlDbType.Int) { Value = approvedBy }
                ).FirstOrDefault();

                if (result == null)
                {
                    return new ApproveAndUnlockGoalsResult
                    {
                        Success = 0,
                        UpdatedCount = 0,
                        Message = "No result returned from stored procedure"
                    };
                }

                return result;
            }
            catch (Exception ex)
            {
                return new ApproveAndUnlockGoalsResult
                {
                    Success = 0,
                    UpdatedCount = 0,
                    Message = "Exception occurred: " + ex.Message
                };
            }
        }

        /// <summary>
        /// Reject a goal modification request
        /// </summary>
        public bool RejectRequest(int requestId, int rejectedBy, string reason)
        {
            try
            {
                var result = context.Database.SqlQuery<SpResult>(
                    "exec [dbo].[RejectGoalModificationRequest] @RequestId, @RejectedBy, @RejectionReason",
                    new SqlParameter("@RequestId", requestId),
                    new SqlParameter("@RejectedBy", rejectedBy),
                    new SqlParameter("@RejectionReason", reason ?? (object)DBNull.Value)
                ).FirstOrDefault();

                return result != null && result.Success == 1;
            }
            catch (Exception)
            {
                return false;
            }
        }

        /// <summary>
        /// Check if manager is authorized to approve/reject a request
        /// </summary>
        public bool IsManagerAuthorized(int requestId, int managerId)
        {
            var result = context.Database.SqlQuery<bool>(
                "exec [dbo].[IsManagerAuthorizedForGoalModificationRequest] @RequestId, @ManagerId",
                new SqlParameter("@RequestId", requestId),
                new SqlParameter("@ManagerId", managerId)
            ).FirstOrDefault();

            return result;
        }

        /// <summary>
        /// Get count of pending requests for manager
        /// </summary>
        public int GetPendingRequestCountForManager(int managerId)
        {
            try
            {
                var result = context.Database.SqlQuery<int>(
                    "exec [dbo].[GetPendingGoalModificationRequestCountForManager] @ManagerId",
                    new SqlParameter("@ManagerId", managerId)
                ).FirstOrDefault();

                return result;
            }
            catch (Exception)
            {
                return 0;
            }
        }

        /// <summary>
        /// Check if appraisal cycle is active for goal modification
        /// Goals are set once per yearly appraisal cycle based on AppraisalCycleMaster dates
        /// </summary>
        public bool IsAppraisalCycleActive(int appraisalCycleId)
        {
            try
            {
                var result = context.Database.SqlQuery<int>(
                    "exec [dbo].[IsAppraisalCycleActiveForGoalModification] @AppraisalCycleId",
                    new SqlParameter("@AppraisalCycleId", appraisalCycleId)
                ).FirstOrDefault();

                return result == 1;
            }
            catch (Exception)
            {
                return false;
            }
        }

        /// <summary>
        /// Delete a goal modification request (soft delete by updating status)
        /// </summary>
        public bool Delete(GoalModificationRequest obj)
        {
            GoalModificationRequest request = context.Set<GoalModificationRequest>().Find(obj.RequestId);

            if (context.Entry(request).State == EntityState.Detached)
                context.Set<GoalModificationRequest>().Attach(request);

            context.Set<GoalModificationRequest>().Remove(request);
            return context.SaveChanges() > 0 ? true : false;
        }

        /// <summary>
        /// Update dataset - not implemented for this entity
        /// </summary>
        public bool UpdateDataSet(DataRow dataRow)
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Get email details for goal modification notifications
        /// </summary>
        public GoalModificationEmailDetailsResult GetEmailDetails(int requestId, int eventId)
        {
            try
            {
                var result = context.Database.SqlQuery<GoalModificationEmailDetailsResult>(
                    "exec [dbo].[GetGoalModificationEmailDetails] @RequestId, @EventId",
                    new SqlParameter("@RequestId", requestId),
                    new SqlParameter("@EventId", eventId)
                ).FirstOrDefault();

                // Log if Body is empty for debugging
                if (result != null && string.IsNullOrWhiteSpace(result.Body))
                {
                    System.Diagnostics.Debug.WriteLine($"GetEmailDetails: Body is empty for RequestId={requestId}, EventId={eventId}");
                    System.Diagnostics.Debug.WriteLine($"Subject: {result.Subject ?? "NULL"}");
                    System.Diagnostics.Debug.WriteLine($"ToEmail: {result.ToEmail ?? "NULL"}");
                }

                return result;
            }
            catch (Exception ex)
            {
                // Log exception for debugging
                System.Diagnostics.Debug.WriteLine($"GetEmailDetails Exception: {ex.Message}");
                if (ex.InnerException != null)
                {
                    System.Diagnostics.Debug.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
                return null;
            }
        }

        /// <summary>
        /// Unlock employee goals after approval using stored procedure
        /// </summary>
        public UnlockGoalsResult UnlockEmployeeGoals(int employeeId, int appraisalCycleId, int modifiedBy)
        {
            try
            {
                // Use SqlQuery to get result set from stored procedure
                var result = context.Database.SqlQuery<UnlockGoalsResult>(
                    "EXEC [dbo].[UnlockEmployeeGoals] @EmployeeId, @AppraisalCycleId, @ModifiedBy",
                    new SqlParameter("@EmployeeId", SqlDbType.Int) { Value = employeeId },
                    new SqlParameter("@AppraisalCycleId", SqlDbType.Int) { Value = appraisalCycleId },
                    new SqlParameter("@ModifiedBy", SqlDbType.Int) { Value = modifiedBy }
                ).FirstOrDefault();

                if (result == null)
                {
                    result = new UnlockGoalsResult
                    {
                        Success = 0,
                        UpdatedCount = 0,
                        Message = "No result returned from stored procedure"
                    };
                }

                // Debug logging
                System.Diagnostics.Debug.WriteLine($"UnlockEmployeeGoals Result - Success: {result.Success}, UpdatedCount: {result.UpdatedCount}, Message: {result.Message}");
                System.Diagnostics.Debug.WriteLine($"Input Parameters - EmployeeId: {employeeId}, AppraisalCycleId: {appraisalCycleId}, ModifiedBy: {modifiedBy}");

                return result;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"UnlockEmployeeGoals Exception: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"Stack Trace: {ex.StackTrace}");
                
                return new UnlockGoalsResult
                {
                    Success = 0,
                    UpdatedCount = 0,
                    Message = "Exception occurred: " + ex.Message
                };
            }
        }

        #endregion
    }
}
