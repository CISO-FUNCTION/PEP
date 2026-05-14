using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace EmpPEP.BusinessEntities
{
    public class AppraisalCycleEntity
    {

        public int AppraisalCycleId { get; set; }
        public int CompanyId { get; set; }
        public int AppraisalTypeId { get; set; }

        [RegularExpression("^([a-zA-Z0-9 .&'-]+)$", ErrorMessage = "Invalid Cycle Name")]
        public string AppraisalCycleName { get; set; }
        public string AppraisalCycleDesc { get; set; }
        public System.DateTime StartDate { get; set; }
        public System.DateTime EndDate { get; set; }
        public int IsActive { get; set; }
        public int StatusId { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<System.DateTime> CreatedOn { get; set; }
        public Nullable<int> ModifiedBy { get; set; }
        public Nullable<System.DateTime> ModifiedOn { get; set; }
    }
}
