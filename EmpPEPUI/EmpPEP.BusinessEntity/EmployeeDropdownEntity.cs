using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class EmployeeDropdownEntity
    {
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public string EmployeeCode { get; set; }
        public string DisplayText { get; set; } // EmployeeName (EmployeeCode)
    }
}

