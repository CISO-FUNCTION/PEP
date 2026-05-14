using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetWeightedScoreCalculationReportEntity
    {
        public string EmployeeName { get; set; }
        public string NewEmployeeCode { get; set; }
        public int ToEmployeeId { get; set; }
        public System.DateTime JoiningDate { get; set; }
        public string EmailAddress { get; set; }
        public string LocationName { get; set; }
        public string EmployeeDesignationName { get; set; }
        public string EmployeeGradeName { get; set; }
        public string ManagersName { get; set; }
        //public Nullable<decimal> WeightedScore { get; set; }
        public string WeightedScore { get; set; }
        public Nullable<decimal> KRAScore { get; set; }
        public Nullable<decimal> CompetencyScore { get; set; }
    }
}
