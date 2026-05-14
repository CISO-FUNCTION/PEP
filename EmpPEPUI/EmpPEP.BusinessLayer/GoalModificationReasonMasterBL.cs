using EmpPEP.BusinessEntities;
using EmpPEP.Framework.Helper;
using EmpPEP.Repository.EntityDataModel;
using EmpPEP.Repository.UnitOfWorks;
using System;
using System.Collections.Generic;

namespace EmpPEP.BusinessLayer
{
    public class GoalModificationReasonMasterBL
    {
        public string sectionName = "GoalModificationReasonMasterBL";

        #region "Public Methods"

        /// <summary>
        /// Get all active reasons for dropdown
        /// </summary>
        public List<GoalModificationReasonMasterEntity> GetActiveReasons()
        {
            using (var repository = new GoalModificationReasonMasterRepository())
            {
                List<GoalModificationReasonMaster> reasons = repository.GetActiveReasons();
                return Utility.ConvertToList<GoalModificationReasonMaster, GoalModificationReasonMasterEntity>(reasons);
            }
        }

        /// <summary>
        /// Get all reasons (for admin screen)
        /// </summary>
        public List<GoalModificationReasonMasterEntity> GetAllReasons()
        {
            using (var repository = new GoalModificationReasonMasterRepository())
            {
                List<GoalModificationReasonMaster> reasons = repository.GetAllReasons();
                return Utility.ConvertToList<GoalModificationReasonMaster, GoalModificationReasonMasterEntity>(reasons);
            }
        }

        /// <summary>
        /// Get reason by ID
        /// </summary>
        public GoalModificationReasonMasterEntity Get(int reasonId)
        {
            using (var repository = new GoalModificationReasonMasterRepository())
            {
                var reason = repository.Get(reasonId);
                if (reason != null)
                {
                    GoalModificationReasonMasterEntity entity = new GoalModificationReasonMasterEntity();
                    return (GoalModificationReasonMasterEntity)Utility.ConvertToObject(reason, entity);
                }
                return null;
            }
        }

        /// <summary>
        /// Insert new reason
        /// </summary>
        public int Insert(GoalModificationReasonMasterEntity entity)
        {
            try
            {
                using (var repository = new GoalModificationReasonMasterRepository())
                {
                    GoalModificationReasonMaster reason = new GoalModificationReasonMaster();
                    reason.ReasonText = entity.ReasonText;
                    reason.IsActive = entity.IsActive;
                    reason.DisplayOrder = entity.DisplayOrder;
                    reason.CreatedBy = entity.CreatedBy;
                    reason.CreatedDate = DateTime.Now;

                    return repository.Insert(reason);
                }
            }
            catch (Exception ex)
            {
                //ExceptionLogging.SendErrorToText(ex, sectionName);
                return 0;
            }
        }

        /// <summary>
        /// Update reason
        /// </summary>
        public bool Update(GoalModificationReasonMasterEntity entity)
        {
            try
            {
                using (var repository = new GoalModificationReasonMasterRepository())
                {
                    GoalModificationReasonMaster reason = new GoalModificationReasonMaster();
                    reason.ReasonId = entity.ReasonId;
                    reason.ReasonText = entity.ReasonText;
                    reason.IsActive = entity.IsActive;
                    reason.DisplayOrder = entity.DisplayOrder;
                    reason.ModifiedBy = entity.ModifiedBy;
                    reason.ModifiedDate = DateTime.Now;

                    int result = repository.Update(reason);
                    return result > 0;
                }
            }
            catch (Exception ex)
            {
                //ExceptionLogging.SendErrorToText(ex, sectionName);
                return false;
            }
        }

        /// <summary>
        /// Delete reason (soft delete)
        /// </summary>
        public bool Delete(int reasonId, int modifiedBy)
        {
            try
            {
                using (var repository = new GoalModificationReasonMasterRepository())
                {
                    int result = repository.Delete(reasonId, modifiedBy);
                    return result > 0;
                }
            }
            catch (Exception ex)
            {
                //ExceptionLogging.SendErrorToText(ex, sectionName);
                return false;
            }
        }

        #endregion
    }
}
