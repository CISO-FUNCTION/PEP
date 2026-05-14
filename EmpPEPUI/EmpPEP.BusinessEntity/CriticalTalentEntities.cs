using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    /// <summary>
    /// Entity for CriticalityReasonsMaster table
    /// Stores the available criticality reasons for critical talent identification
    /// </summary>
    public class CriticalityReasonsMasterEntity
    {
        public int ReasonId { get; set; }
        public string ReasonName { get; set; }
        public string ReasonCode { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
    }

    /// <summary>
    /// Entity for CriticalityPriorityMaster table
    /// Stores the available priority levels (P1, P2, P3) with percentage limits
    /// </summary>
    public class CriticalityPriorityMasterEntity
    {
        public int PriorityId { get; set; }
        public string PriorityName { get; set; }
        public string PriorityCode { get; set; }
        public decimal PercentageLimit { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
    }

    /// <summary>
    /// Result entity for critical talent validation
    /// Used to check if the user can mark additional employees as critical
    /// </summary>
    public class CriticalTalentValidationResultEntity
    {
        public int TotalSpanCount { get; set; }
        public int MaxAllowedCritical { get; set; }
        public int CurrentP1Count { get; set; }
        public int CurrentP2Count { get; set; }
        public int CurrentP3Count { get; set; }
        public int CurrentTotalCritical { get; set; }
        public int MaxP1Allowed { get; set; }
        public int MaxP2Allowed { get; set; }
        public int MaxP3Allowed { get; set; }
        public bool CanAddP1 { get; set; }
        public bool CanAddP2 { get; set; }
        public bool CanAddP3 { get; set; }
        public bool CanAddAnyCritical { get; set; }
    }
}
