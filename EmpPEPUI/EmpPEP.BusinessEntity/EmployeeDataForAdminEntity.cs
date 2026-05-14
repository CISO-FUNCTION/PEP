using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class EmployeeDataForAdminEntity
    {
        public int AppraisalCycleId { get; set; }
        public int LoginEmployeeId { get; set; }
        public string GDLId { get; set; }
        public string DPId { get; set; }
        public string InputterId { get; set; }
        public int Role { get; set; }
        /// <summary>
        /// Comma-separated Criticality Priority IDs for filtering tblHRBPAdminView; empty or "0" = no filter.
        /// </summary>
        public string CriticalityPriorityId { get; set; }
    }
}
