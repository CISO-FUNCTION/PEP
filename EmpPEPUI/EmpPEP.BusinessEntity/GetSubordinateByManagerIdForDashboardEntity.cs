using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetSubordinateByManagerIdForDashboardEntity
    {
        public int EmployeeId { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string NewEmployeeCode { get; set; }
        public string DomainId { get; set; }
        public string DelegatorName { get; set; }
        public int Selfassesment { get; set; }
    }
}
