using System;

namespace EmpPEP.BusinessEntity
{
    /// <summary>
    /// Entity class for email details returned from GetGoalModificationEmailDetails SP
    /// </summary>
    public class GoalModificationEmailDetails
    {
        public string ToEmail { get; set; }
        public string CcEmail { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
        public string EmployeeName { get; set; }
        public string ManagerName { get; set; }
        public int Success { get; set; }
    }
    
    /// <summary>
    /// Event IDs for goal modification emails
    /// </summary>
    public static class GoalModificationEmailEvents
    {
        public const int RequestRaised = 60;
        public const int RequestApproved = 61;
        public const int RequestRejected = 62;
    }
}
