using EmpPEP.Framework.Helper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static EmpPEP.Framework.Helper.EnumCollection;

namespace EmpPEP.Repository
{
    public class GOFeedbackAssessmentTrackerReport
    {
        public int EmployeeId { get; set; }
        public string AppraisalCycle { get; set; }
        public string AppraisalCycleName { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeName { get; set; }
        public string GoalType { get; set; }
        public string GoalDescription { get; set; }
        public decimal Weightage { get; set; }
        public string GoalMeasure { get; set; }
        public string GoalApproved { get; set; }
        public string SelfAssesment { get; set; }
        public string SelfReview_Date { get; set; }

        public string FeedbackStatus { get; set; }
        public string Feedback { get; set; }
        public string Feedback_Date { get; set; }
        public string FeedbackGiven_By { get; set; }
        public string FeedbackGiven_By_EmpID { get; set; }
        public string EmployeeStatus { get; set; }
        public string ActionPlan { get; set; }
    }
}
