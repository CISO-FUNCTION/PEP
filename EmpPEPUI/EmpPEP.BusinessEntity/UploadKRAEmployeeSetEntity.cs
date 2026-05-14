using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class UploadKRAEmployeeSetEntity
    {
        public int KRASetId { get; set; }
        public int EmployeeId { get; set; }
        public int ApprovedBy { get; set; }
        public int AppraisalCycleId { get; set; }
    }
}
