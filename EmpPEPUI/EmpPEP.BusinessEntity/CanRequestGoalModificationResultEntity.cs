using System;

namespace EmpPEP.BusinessEntities
{
    /// <summary>
    /// Entity for validating if Goal Modification Request button should be shown
    /// </summary>
    public class CanRequestGoalModificationResultEntity
    {
        public bool CanRequestModification { get; set; }
        public bool IsCycleActive { get; set; }
        public decimal TotalWeightage { get; set; }
        public bool AllGoalsApproved { get; set; }
        public bool HasPendingRequest { get; set; }
        public string Message { get; set; }
        
        // Additional debugging fields to see which validations are failing
        public bool? IsCycleClosed { get; set; }
        public bool? HasSelfAssessment { get; set; }
        public bool? HasManagerFeedback { get; set; }
        public int? TotalGoalsCount { get; set; }
        public int? ApprovedGoalsCount { get; set; }
    }
}

