using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
   public class GetNotifications_ResultEntity
    {
        public int FeedBackId { get; set; }
        public Nullable<int> AppraisalCycleId { get; set; }
        public string ActionTypeName { get; set; }
        public int FromEmployeeId { get; set; }
        public string FromEmployeeName { get; set; }
        public int ToEmployeeId { get; set; }
        public string ToEmployeeName { get; set; }
        public string AreaName { get; set; }
        public Nullable<int> GradeQuestionMasterId { get; set; }
        public Nullable<int> QuestionaireId { get; set; }
        public string Feedback { get; set; }
        public Nullable<int> ParentFeedBackId { get; set; }
        public Nullable<int> Rating { get; set; }
        public Nullable<int> Sequence { get; set; }
        public string Question { get; set; }
    }
}
