using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class EmployeeAwardsEntity : EmployeeBase
    {
        public int AwardId { get; set; }
        public Nullable<int> EmployeeId { get; set; }
        public Nullable<int> ManagerId { get; set; }
        public Nullable<int> LocationId { get; set; }
        public Nullable<int> AppraisalCycleId { get; set; }
        public string Heading { get; set; }
        public string Description { get; set; }
        public Nullable<System.DateTime> AwardDate { get; set; }
    }
}
