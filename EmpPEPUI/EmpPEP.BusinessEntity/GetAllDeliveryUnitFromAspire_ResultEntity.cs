using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetAllDeliveryUnitFromAspire_ResultEntity
    {
        public int DeliveryUnitID { get; set; }
        public string DeliveryUnit { get; set; }
        public string DeliveryHead { get; set; }
        public System.DateTime EffectiveFrom { get; set; }
        public string Type { get; set; }
        public string Flag { get; set; }
        public string DeptCode { get; set; }
        public string Status { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedOn { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime Modifiedon { get; set; }
    }
}
