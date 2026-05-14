using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class AppraisalTypeMasterEntity
    {
        public int AppraisalTypeId { get; set; }
        public int CompanyId { get; set; }
        public string AppraisalTypeName { get; set; }
        public string AppraisalTypeDesc { get; set; }
        public Nullable<int> IsActive { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<System.DateTime> CreatedOn { get; set; }
        public Nullable<int> ModifiedBy { get; set; }
        public Nullable<System.DateTime> ModifiedOn { get; set; }
    }
}
