using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetBreakDownOfWeightedScoreCalculationReport_ResultEntity
    {
        public int EmployeeId { get; set; }
        public string EmpName { get; set; }
        public string EmployeeGradeName { get; set; }
        public Nullable<int> KRAId { get; set; }
        public Nullable<decimal> Weightage { get; set; }
        public Nullable<int> Rating { get; set; }
        public Nullable<int> AreaId { get; set; }
        public Nullable<int> AreaWeightage { get; set; }
        public int FromEmployeeId { get; set; }
        public Nullable<System.DateTime> CreatedOn { get; set; }
        public string MgrName { get; set; }
        public Nullable<decimal> FinalWeightedScore { get; set; }
        public Nullable<decimal> AvgRatings { get; set; }
        public Nullable<decimal> FBWeightedScore { get; set; }
        public Nullable<decimal> KRAWeightedScore { get; set; }
    }
}
