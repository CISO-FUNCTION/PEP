using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetEmployeesByGradeIdDUIdForKRAUpload_ResultEntity
    {
        public int EmployeeId { get; set; }
        public string OldEmployeeCode { get; set; }
        public string NewEmployeeCode { get; set; }
        public string EmployeeName { get; set; }
    }
}
