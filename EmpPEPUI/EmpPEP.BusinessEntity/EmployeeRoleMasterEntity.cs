using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class EmployeeRoleMasterEntity
    {
        public int EmployeeRoleId { get; set; }
        public string EmployeeRoleName { get; set; }
        public string EmployeeRoleDesc { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<System.DateTime> CreatedOn { get; set; }
        public Nullable<int> ModifiedBy { get; set; }
        public Nullable<System.DateTime> ModifiedOn { get; set; }
        public Nullable<int> IsActive { get; set; }
        public Nullable<int> RoleLevel { get; set; }
    }
}
