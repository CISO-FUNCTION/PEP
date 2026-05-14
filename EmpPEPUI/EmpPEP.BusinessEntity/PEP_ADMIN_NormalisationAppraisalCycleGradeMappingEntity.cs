using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class PEP_ADMIN_NormalisationAppraisalCycleGradeMappingEntity
    {
        public int Id { get; set; }
        public int AppraisalCycleId { get; set; }
        public int GradeId { get; set; }
        public Nullable<System.DateTime> NormalisationStartDate { get; set; }
        public Nullable<System.DateTime> NormalisationEndDate { get; set; }
        public bool IsActive { get; set; }
        public int CreatedBy { get; set; }
        public Nullable<System.DateTime> CreatedOn { get; set; }
        public Nullable<int> ModifiedBy { get; set; }
        public Nullable<System.DateTime> ModifiedOn { get; set; }

        public bool IsRatingVisible { get; set; }
    }
}
