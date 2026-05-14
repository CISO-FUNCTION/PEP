using System;

namespace EmpPEP.Repository.EntityDataModel
{
    /// <summary>
    /// Result class for ApproveGoalModificationRequestAndUnlockGoals stored procedure
    /// </summary>
    public class ApproveAndUnlockGoalsResult
    {
        public int Success { get; set; }
        public int UpdatedCount { get; set; }
        public string Message { get; set; }
        public int? RequestId { get; set; }
        public int? EmployeeId { get; set; }
        public int? AppraisalCycleId { get; set; }
        public string Status { get; set; }
    }
}
