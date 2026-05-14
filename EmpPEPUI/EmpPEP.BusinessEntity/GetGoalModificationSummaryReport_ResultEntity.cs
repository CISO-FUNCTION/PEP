using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetGoalModificationSummaryReport_ResultEntity
    {
        public long SrNo { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeEmail { get; set; }
        public int AppraisalCycleId { get; set; }
        public string AppraisalCycleName { get; set; }
        public string Status { get; set; }
        public int RequestCount { get; set; }
        public string RejectionReason { get; set; }
        public DateTime CreatedDate { get; set; }
        public Nullable<DateTime> ModifiedDate { get; set; }
        public Nullable<DateTime> ApprovedDate { get; set; }
        public string ApprovedByName { get; set; }
        public string ApprovedByCode { get; set; }
        public string LocationName { get; set; }
        public string EmployeeDesignationName { get; set; }
        public DateTime RequestDate { get; set; }
        public string RequestMonth { get; set; }
        public int RequestYear { get; set; }
        public int RequestQuarter { get; set; }
        public int RequestWeek { get; set; }
    }

    public class GetGoalModificationSummaryStatistics_ResultEntity
    {
        public int TotalRequests { get; set; }
        public int ApprovedCount { get; set; }
        public int RejectedCount { get; set; }
        public int PendingCount { get; set; }
        public Nullable<int> AvgRequestCountPerEmployee { get; set; }
        public int UniqueEmployees { get; set; }
        public int UniqueCycles { get; set; }
    }

    public class GetGoalModificationTimeBasedSummary_ResultEntity
    {
        public DateTime Date { get; set; }
        public int RequestCount { get; set; }
        public int Approved { get; set; }
        public int Rejected { get; set; }
        public int Pending { get; set; }
    }
}
