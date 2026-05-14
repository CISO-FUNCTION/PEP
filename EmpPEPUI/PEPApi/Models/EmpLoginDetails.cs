using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EmpPEP.WebApi.Models
{
    public class EmpLoginDetails
    {
        
        public int EmployeeId { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string Token { get; set; }
    }
}