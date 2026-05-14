using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetDUWiseSubordinateReport_ResultEntity
    {
        public int EmployeeId { get; set; }
        public string DeliveryUnit { get; set; }
        public string NewEmployeeCode { get; set; }
        public string EmployeeName { get; set; }
        public string DESIGNATION { get; set; }
    }
}
