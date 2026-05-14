using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetManagerFeedbackStatusReportForGraph_ResultEntity
    {
        public int EmployeeId { get; set; }
        public string NewEmployeeCode { get; set; }
        public string EmployeeName { get; set; }
        public int FB_KRA { get; set; }
        public int FB_BehCom { get; set; }
        public int Tot_KRA { get; set; }
        public int Tot_BehCom { get; set; }
        public Nullable<decimal> KRA_per { get; set; }
        public Nullable<decimal> Beh_per { get; set; }
    }
}
