using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class CriticalityMasterEntity
    {
        public int Id { get; set; }
        public string Value { get; set; }
        public string DisplayText { get; set; }
        public string Type { get; set; } // "Reason", "Priority", "AttritionRisk"
        public Nullable<int> IsActive { get; set; }
        public Nullable<int> DisplayOrder { get; set; }
    }
}

