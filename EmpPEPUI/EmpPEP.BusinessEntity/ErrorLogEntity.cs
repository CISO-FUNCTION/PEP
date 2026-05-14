using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class ErrorLogEntity
    {
        public int Id { get; set; }
        public string EmployeeId { get; set; }
        public string Module { get; set; }
        public string Controller { get; set; }
        public string Action { get; set; }
        public string Error { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
