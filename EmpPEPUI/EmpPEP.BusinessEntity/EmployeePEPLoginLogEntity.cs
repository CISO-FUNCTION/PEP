using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class EmployeePEPLoginLogEntity
    {
        public int EmployeeLoginId { get; set; }
        public int EmployeeId { get; set; }
        public DateTime? LoginDate { get; set; }
        public string Activity { get; set; }
        public string ActivityType { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
    }
}
