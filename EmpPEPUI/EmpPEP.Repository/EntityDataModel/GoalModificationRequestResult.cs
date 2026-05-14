using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.Repository.EntityDataModel
{
    /// <summary>
    /// Result class for stored procedures that JOIN with GoalModificationReasonMaster
    /// This includes both ReasonId and Reason (text) fields, plus EmployeeName
    /// </summary>
    public class GoalModificationRequestResult
    {
        public int RequestId { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } // Full name from EmployeeMaster (FirstName + MiddleName + LastName)
        public int AppraisalCycleId { get; set; }
        public string Cycle { get; set; }
        public int ReasonId { get; set; }
        public string Reason { get; set; } // From JOIN with GoalModificationReasonMaster
        public string Status { get; set; }
        public int RequestCount { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public Nullable<System.DateTime> ModifiedDate { get; set; }
        public Nullable<int> ApprovedBy { get; set; }
        public Nullable<System.DateTime> ApprovedDate { get; set; }
        public string RejectionReason { get; set; }
    }
}
