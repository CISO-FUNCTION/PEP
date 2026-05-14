using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
   
        public class EmployeeManagerMappingEntity
        {
            public int Id { get; set; }
            public int EmployeeId { get; set; }
            public int EmployeeManagerId { get; set; }
            public Nullable<System.DateTime> FromDate { get; set; }
            public Nullable<System.DateTime> ToDate { get; set; }
            public Nullable<int> CreatedBy { get; set; }
            public Nullable<System.DateTime> CreatedOn { get; set; }
            public Nullable<int> ModifiedBy { get; set; }
            public Nullable<System.DateTime> ModifiedOn { get; set; }
            public Nullable<int> EmployeeDelegatorId { get; set; }
        }
    
}
