using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class EmployeeDataForAdminFiltersEntity
    {
        public int AppraisalCycleId { get; set; }
        public int LoginEmployeeId { get; set; }
        public string GDLHeadSpan { get; set; }
        public string DPSpan { get; set; }
        public string RMSpan { get; set; }
        public string GradeId { get; set; }
        public string LocationId { get; set; }
        public string GroupAccountId { get; set; }
        public string Gender { get; set; }
        public string EmpStatus { get; set; }
        public int Role { get; set; }
        public string DeliveryStatus { get; set; }

        public string Promotion { get; set; }
    }
}
