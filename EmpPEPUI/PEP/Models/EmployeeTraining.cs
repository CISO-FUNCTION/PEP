using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EmpPEP.UI.Models
{
    public class EmployeeTraining
    {
        public int TrainingId { get; set; }
        public Nullable<int> TrainingItemId { get; set; }
        public Nullable<int> AppraisalCycleId { get; set; }
        public Nullable<int> EmployeeId { get; set; }
        public Nullable<int> ActionTypeId { get; set; }
        public Nullable<int> TrainingStatusId { get; set; }
        public string Comments { get; set; }
        public Nullable<System.DateTime> SuggestedStartDate { get; set; }
        public Nullable<System.DateTime> SuggestedEndDate { get; set; }
        public Nullable<System.DateTime> ActualEndDate { get; set; }
        public Nullable<int> ParentTrainingId { get; set; }
        public Nullable<int> Sequence { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<System.DateTime> CreatedOn { get; set; }
        public Nullable<int> ModifiedBy { get; set; }
        public Nullable<System.DateTime> ModifiedOn { get; set; }
    }
}