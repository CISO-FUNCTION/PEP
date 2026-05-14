using System;

namespace EmpPEP.BusinessEntities
{
    public class GetAdminRatingVisibility_ResultEntity
    {
        public int Id { get; set; }
        public int AppraisalCycleId { get; set; }
        public bool IsRatingVisible { get; set; }
        public Nullable<System.DateTime> NormalisationStartDate { get; set; }
        public Nullable<System.DateTime> NormalisationEndDate { get; set; }
    }
}
