using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class EmployeeFeedbackEntity
    {
        public int FeedBackId { get; set; }
        public Nullable<int> AppraisalCycleId { get; set; }
        public int FromEmployeeId { get; set; }
        public int ToEmployeeId { get; set; }
        public Nullable<int> ActionTypeId { get; set; }
        public Nullable<int> AreaID { get; set; }
        public Nullable<int> GradeQuestionMasterId { get; set; }
        public Nullable<int> QuestionaireId { get; set; }
        public string Feedback { get; set; }
        public Nullable<int> ParentFeedBackId { get; set; }
        public Nullable<int> Rating { get; set; }
        public Nullable<int> Sequence { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<System.DateTime> CreatedOn { get; set; }
        public Nullable<int> ModifiedBy { get; set; }
        public Nullable<System.DateTime> ModifiedOn { get; set; }
        public Nullable<int> GradeAreaQuestionMappingID { get; set; }
        public Nullable<bool> IsIgnore { get; set; }
        public Nullable<System.DateTime> FeedbackDate { get; set; }
        public Nullable<int> StatusID { get; set; }
        public Nullable<int> IsSeen { get; set; }
        public string PerformCycleCheck { get; set; } //added by kaushal saini

    }
}
