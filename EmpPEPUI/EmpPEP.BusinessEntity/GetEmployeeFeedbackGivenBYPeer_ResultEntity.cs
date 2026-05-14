using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetEmployeeFeedbackGivenBYPeer_ResultEntity
    {
        public int FeedBackId { get; set; }
        public Nullable<int> AppraisalCycleId { get; set; }
        public int FromEmployeeId { get; set; }
        public int ToEmployeeId { get; set; }
        public Nullable<int> ActionTypeId { get; set; }
        public string Feedback { get; set; }
        public Nullable<int> ParentFeedBackId { get; set; }
        public Nullable<int> Rating { get; set; }
        public Nullable<int> Sequence { get; set; }
        public Nullable<System.DateTime> FeedbackDate { get; set; }
        public string FromName { get; set; }
        public string ToName { get; set; }
        public Nullable<int> IsSeen { get; set; }
        public Nullable<int> LastFeedbackGivenBy { get; set; }
    }
}
