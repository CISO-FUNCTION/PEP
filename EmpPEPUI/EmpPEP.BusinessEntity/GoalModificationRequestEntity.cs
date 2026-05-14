using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GoalModificationRequestEntity
    {
        public int RequestId { get; set; }
        public int EmployeeId { get; set; }
        public int AppraisalCycleId { get; set; }
        public string Cycle { get; set; }
        public int ReasonId { get; set; }
        public string Reason { get; set; } // Populated from join with GoalModificationReasonMaster
        public string Status { get; set; }
        public int RequestCount { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public int? ApprovedBy { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public string RejectionReason { get; set; }

        // Additional properties for display purposes
        public string EmployeeName { get; set; }
        public string ApproverName { get; set; }
        public string CycleName { get; set; }
    }
}
