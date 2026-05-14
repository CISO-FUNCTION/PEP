using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class AppraisalCycleYearbreakupDetailEntity
    {
        public int Id { get; set; }
        public Nullable<int> AppraisalCycleId { get; set; }
        public string AppraisalCycleName { get; set; }
        public string AppraisalCycleDesc { get; set; }
        public Nullable<System.DateTime> StartDate { get; set; }
        public Nullable<System.DateTime> EndDate { get; set; }
        public Nullable<int> YearBreakCheck { get; set; }
        public string CreatedBy { get; set; }
        public Nullable<System.DateTime> CreatedOn { get; set; }
        public string ModifiedBy { get; set; }
        public Nullable<System.DateTime> ModifiedOn { get; set; }
        public Nullable<bool> IsClosed { get; set; }
        public Nullable<System.DateTime> ClosedDate { get; set; }
        public Nullable<int> ClosedBy { get; set; }
        public string ClosedByName { get; set; }
    }
}
