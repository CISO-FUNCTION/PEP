using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class EmployeeRatingNormailizationDetailsEntity
    {
        public int Id { get; set; }
        public Nullable<int> AppraisalCycleId { get; set; }
        public Nullable<int> PEPEmployeeId { get; set; }
        public string Rating { get; set; }
        public Nullable<int> Status { get; set; }
        public Nullable<int> RatingGivenBy { get; set; }
        public Nullable<int> RecoForPromotion { get; set; }
        public string Comments { get; set; }
        public string CreatedBy { get; set; }
        public Nullable<System.DateTime> CreatedOn { get; set; }
        public string ModifiedBy { get; set; }
        public Nullable<System.DateTime> ModifiedOn { get; set; }
        public int NextSkipRM { get; set; }

        public int DeliveryUnit { get; set; }
        public Nullable<bool> IsAdminApproved { get; set; }
        public Nullable<bool> IsShowtoEmployee { get; set; }

        public Nullable<int> SLastRatingGivenBy { get; set; }

        public Nullable<int> RoleId { get; set; }
        public Nullable<int> PromotionTrack { get; set; }
        
        // Criticality Details Properties
        public string CriticalityReasons { get; set; }
        public string CriticalityPriority { get; set; }
        public string AttritionRisk { get; set; }
        public string AttritionRiskReason { get; set; }
        public string ImmediateBackup { get; set; }
        public string SuccessorName { get; set; }
        
    }
}
