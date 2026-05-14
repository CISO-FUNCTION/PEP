//------------------------------------------------------------------------------
// Partial class extension for AppraisalCycleYearbreakupDetail
// Adds cycle close properties added in Phase 1
//------------------------------------------------------------------------------

namespace EmpPEP.Repository.EntityDataModel
{
    public partial class AppraisalCycleYearbreakupDetail
    {
        // Cycle close fields added in Phase 1
        public System.Nullable<bool> IsClosed { get; set; }
        public System.Nullable<System.DateTime> ClosedDate { get; set; }
        public System.Nullable<int> ClosedBy { get; set; }
    }
}

