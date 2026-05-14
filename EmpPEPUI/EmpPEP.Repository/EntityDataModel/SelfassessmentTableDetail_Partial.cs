//------------------------------------------------------------------------------
// Partial class extension for SelfassessmentTableDetail
// Adds goal snapshot properties added in Phase 1
//------------------------------------------------------------------------------

namespace EmpPEP.Repository.EntityDataModel
{
    public partial class SelfassessmentTableDetail
    {
        // Goal snapshot fields added in Phase 1
        public string GoalType { get; set; }
        public string GoalDescription { get; set; }
        public System.Nullable<decimal> Weightage { get; set; }
        public string Measure { get; set; }
        public string AttachmentPath { get; set; }
        public string TrainingItemId { get; set; }
        public string TrainingRequirementName { get; set; }
        public string TrainingCategory { get; set; }
    }
}

