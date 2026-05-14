using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetManagerFeedbackStatusReportEntity
    {
        public int ToEmployeeId { get; set; }
        public string NewEmployeeCode { get; set; }
        public string EmployeeName { get; set; }
        public string ManagerName { get; set; }
        public string LocationName { get; set; }
        public string EmployeeDesignationName { get; set; }
        public string ProjectName { get; set; }
        public Nullable<int> KRA { get; set; }
        public Nullable<int> Behavioural_Competency { get; set; }
        public Nullable<int> TeamCount { get; set; }
        public Nullable<int> MaxNumber { get; set; }
       
    }
}
