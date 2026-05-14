using EmpPEP.Repository.EntityDataModel;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class GoalModificationReasonMasterRepository : IDisposable
    {
        private PEPEntities1 context;

        public GoalModificationReasonMasterRepository()
        {
            context = new PEPEntities1();
        }

        /// <summary>
        /// Get all active reasons
        /// </summary>
        public List<GoalModificationReasonMaster> GetActiveReasons()
        {
            try
            {
                return context.Database.SqlQuery<GoalModificationReasonMaster>(
                    "EXEC GetActiveGoalModificationReasons"
                ).ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// Get all reasons (active and inactive)
        /// </summary>
        public List<GoalModificationReasonMaster> GetAllReasons()
        {
            try
            {
                return context.Database.SqlQuery<GoalModificationReasonMaster>(
                    "EXEC GetAllGoalModificationReasons"
                ).ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// Get reason by ID
        /// </summary>
        public GoalModificationReasonMaster Get(int reasonId)
        {
            try
            {
                var reasonIdParam = new SqlParameter("@ReasonId", SqlDbType.Int) { Value = reasonId };

                return context.Database.SqlQuery<GoalModificationReasonMaster>(
                    "EXEC GetGoalModificationReasonById @ReasonId",
                    reasonIdParam
                ).FirstOrDefault();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// Insert new reason
        /// </summary>
        public int Insert(GoalModificationReasonMaster reason)
        {
            try
            {
                var reasonTextParam = new SqlParameter("@ReasonText", SqlDbType.NVarChar, 500) { Value = reason.ReasonText };
                var isActiveParam = new SqlParameter("@IsActive", SqlDbType.Bit) { Value = reason.IsActive };
                var displayOrderParam = new SqlParameter("@DisplayOrder", SqlDbType.Int) { Value = reason.DisplayOrder };
                var createdByParam = new SqlParameter("@CreatedBy", SqlDbType.Int) { Value = (object)reason.CreatedBy ?? DBNull.Value };
                var reasonIdParam = new SqlParameter("@ReasonId", SqlDbType.Int) { Direction = ParameterDirection.Output };

                context.Database.ExecuteSqlCommand(
                    "EXEC InsertGoalModificationReason @ReasonText, @IsActive, @DisplayOrder, @CreatedBy, @ReasonId OUTPUT",
                    reasonTextParam,
                    isActiveParam,
                    displayOrderParam,
                    createdByParam,
                    reasonIdParam
                );

                return (int)reasonIdParam.Value;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// Update reason
        /// </summary>
        public int Update(GoalModificationReasonMaster reason)
        {
            try
            {
                var reasonIdParam = new SqlParameter("@ReasonId", SqlDbType.Int) { Value = reason.ReasonId };
                var reasonTextParam = new SqlParameter("@ReasonText", SqlDbType.NVarChar, 500) { Value = reason.ReasonText };
                var isActiveParam = new SqlParameter("@IsActive", SqlDbType.Bit) { Value = reason.IsActive };
                var displayOrderParam = new SqlParameter("@DisplayOrder", SqlDbType.Int) { Value = reason.DisplayOrder };
                var modifiedByParam = new SqlParameter("@ModifiedBy", SqlDbType.Int) { Value = (object)reason.ModifiedBy ?? DBNull.Value };

                return context.Database.ExecuteSqlCommand(
                    "EXEC UpdateGoalModificationReason @ReasonId, @ReasonText, @IsActive, @DisplayOrder, @ModifiedBy",
                    reasonIdParam,
                    reasonTextParam,
                    isActiveParam,
                    displayOrderParam,
                    modifiedByParam
                );
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// Delete reason (soft delete)
        /// </summary>
        public int Delete(int reasonId, int modifiedBy)
        {
            try
            {
                var reasonIdParam = new SqlParameter("@ReasonId", SqlDbType.Int) { Value = reasonId };
                var modifiedByParam = new SqlParameter("@ModifiedBy", SqlDbType.Int) { Value = modifiedBy };

                return context.Database.ExecuteSqlCommand(
                    "EXEC DeleteGoalModificationReason @ReasonId, @ModifiedBy",
                    reasonIdParam,
                    modifiedByParam
                );
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public void Dispose()
        {
            context.Dispose();
        }
    }
}
