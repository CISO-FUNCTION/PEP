using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetAllAppraisalCycles_ResultEntity
    {
        public int AppraisalCycleId { get; set; }
        public int CompanyId { get; set; }
        public string CompanyName { get; set; }
        public int AppraisalTypeId { get; set; }
        public string AppraisalTypeName { get; set; }
        public string AppraisalCycleName { get; set; }
        public System.DateTime StartDate { get; set; }
        public System.DateTime EndDate { get; set; }
        public string AppraisalCycleDesc { get; set; }
        public int IsActive { get; set; }
        public int StatusId { get; set; }
        public string StatusDescription { get; set; }
    }
}
