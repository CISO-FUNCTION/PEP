using System;

namespace EmpPEP.BusinessEntities
{
    public class TrainingRequestTrackingEntity
    {
        public int TrackingId { get; set; }
        public int KRAId { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeCode { get; set; }
        public int TrainingId { get; set; }
        public string TrainingType { get; set; }
        public string TrainingName { get; set; }
        public string APIRequest { get; set; }
        public string APIResponse { get; set; }
        public bool? IsSuccess { get; set; }
        public bool? IsDuplicate { get; set; }
        public string Status { get; set; }
        public string Message { get; set; }
        public string FiscalYear { get; set; }
        public string CompletionTimeline { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
    }
}

