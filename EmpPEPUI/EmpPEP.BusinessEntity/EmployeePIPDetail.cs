using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntity
{
    public class EmployeePIPDetail
    {

        public int LoginEmpId { get; set; }
        public int SelectEmpId { get; set; }
        public int PIPId { get; set; }
        public int Action { get; set; }
        public string PIPRejectionReason { get; set; }
    }
}
