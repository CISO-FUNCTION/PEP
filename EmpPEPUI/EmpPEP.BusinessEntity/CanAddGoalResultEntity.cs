using System;

namespace EmpPEP.BusinessEntities
{
    /// <summary>
    /// Entity for validating if Add Goal button should be shown
    /// </summary>
    public class CanAddGoalResultEntity
    {
        public bool CanAddGoal { get; set; }
        public bool IsCycleActive { get; set; }
        public bool IsSubcycleClosed { get; set; }
        public bool HasInitializedKRA { get; set; }
        public decimal TotalWeightage { get; set; }
        public string Message { get; set; }
    }
}

