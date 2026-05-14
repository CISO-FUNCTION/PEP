using System;

namespace EmpPEP.Repository.EntityDataModel
{
    /// <summary>
    /// Result class for GetGoalModificationEmailDetails stored procedure
    /// </summary>
    public class GoalModificationEmailDetailsResult
    {
        public string ToEmail { get; set; }
        public string CcEmail { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
        public string EmployeeName { get; set; }
        public string ManagerName { get; set; }
        public int Success { get; set; }
    }
}
