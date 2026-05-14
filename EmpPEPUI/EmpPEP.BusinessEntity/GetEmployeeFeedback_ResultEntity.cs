using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetEmployeeFeedback_ResultEntity
    {
        public int FeedBackId { get; set; }
        public Nullable<int> AppraisalCycleId { get; set; }
        public string ActionTypeName { get; set; }
        public int FromEmployeeId { get; set; }
        public string FromEmployeeName { get; set; }
        public int ToEmployeeId { get; set; }
        public string ToEmployeeName { get; set; }
        public Nullable<int> ActionTypeId { get; set; }
        public Nullable<int> AreaID { get; set; }
        public string AreaName { get; set; }
        public Nullable<int> GradeQuestionMasterId { get; set; }
        public Nullable<int> QuestionaireId { get; set; }
        public string Feedback { get; set; }
        public Nullable<int> ParentFeedBackId { get; set; }
        public Nullable<int> Rating { get; set; }
        public string Selfassesment { get; set; }
        public Nullable<int> Sequence { get; set; }
        public string Question { get; set; }
        public int IsSeen { get; set; }
        public Nullable<int> LastFeedbackGivenBy { get; set; }
        public Nullable<System.DateTime> FeedbackDate { get; set; }
        public string Measure { get; set; }
        public int EmployeeManagerId { get; set; }
        public System.DateTime EditableDateCheck { get; set; }
        public Nullable<int> IsIgnore { get; set; }

        /// <summary>Manager feedback trainings persisted on EmployeeFeedBack (not merged from EmployeeKRA).</summary>
        public string TrainingItemId { get; set; }
        public string TrainingRequirementName { get; set; }
        public string TrainingCategory { get; set; }
    }
}
