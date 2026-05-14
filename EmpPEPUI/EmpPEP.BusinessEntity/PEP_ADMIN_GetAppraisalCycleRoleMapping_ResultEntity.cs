using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class PEP_ADMIN_GetAppraisalCycleRoleMapping_ResultEntity
    {
        public int Id { get; set; }
        public int AppraisalCycleId { get; set; }
        public int RoleId { get; set; }
        public Nullable<System.DateTime> NormalisationStartDate { get; set; }
        public Nullable<System.DateTime> NormalisationEndDate { get; set; }
        public string AppraisalCycleName { get; set; }
        public string RoleName { get; set; }
        public int IsActive{ get; set; }
        public int Actionby { get; set; }
    }
}
