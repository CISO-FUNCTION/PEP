using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetAspireDirectReportees_ResultEntity
    {
        public string EmployeeId { get; set; }
        public string EmployeeName { get; set; }

        public int IsDP { get; set; }
    }
}
