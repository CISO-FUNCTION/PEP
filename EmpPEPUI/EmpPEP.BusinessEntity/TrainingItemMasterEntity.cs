using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class TrainingItemMasterEntity
    {
        public int TrainingItemId { get; set; }
        public int TrainingTypeId { get; set; }
        public string TrainingItemName { get; set; }
        public string TrainingItemDesc { get; set; }
        public Nullable<int> IsActive { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<System.DateTime> CreatedOn { get; set; }
        public Nullable<int> ModifiedBy { get; set; }
        public Nullable<System.DateTime> ModifiedOn { get; set; }
    }
}
