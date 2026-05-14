//------------------------------------------------------------------------------
// Partial class extension for EmployeeFeedBackAsDraft
// Adds goal snapshot properties
//------------------------------------------------------------------------------

namespace EmpPEP.Repository.EntityDataModel
{
    public partial class EmployeeFeedBackAsDraft
    {
        // Goal snapshot fields
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

