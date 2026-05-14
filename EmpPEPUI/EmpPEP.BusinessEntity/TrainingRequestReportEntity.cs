using System;

namespace EmpPEP.BusinessEntities
{
    /// <summary>
    /// Entity for Training Request Report
    /// </summary>
    public class TrainingRequestReportEntity
    {
        public int TrackingId { get; set; }
        public int KRAId { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeCode { get; set; }
        public int TrainingId { get; set; }
        public string TrainingType { get; set; }
        public string TrainingName { get; set; }
        public string Progress { get; set; }
        public decimal? ProgressPercentage { get; set; }  // Can be decimal or string, will handle in repository
        public string Status { get; set; }
        public string CompletionTimeline { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        
        // Employee Information
        public string EmployeeName { get; set; }
        public string EmployeeOldCode { get; set; }
        public string EmployeeNewCode { get; set; }
        
        // Requested By Information
        public string RequestedByName { get; set; }
        public string RequestedByCode { get; set; }
        
        // KRA Information
        public string GoalDescription { get; set; }
        public string GoalType { get; set; }
        public string TrainingRequirementName { get; set; }
        public int? Sequence { get; set; }
        
        // Appraisal Cycle Information
        public int? AppraisalCycleId { get; set; }
    }
}

