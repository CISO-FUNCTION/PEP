using System;

namespace EmpPEP.BusinessEntities
{
    public class GoalModificationReasonMasterEntity
    {
        public int ReasonId { get; set; }
        public string ReasonText { get; set; }
        public bool IsActive { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public int? CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
    }
}
