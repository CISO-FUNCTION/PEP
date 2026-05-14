using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class EmployeeRatingNormailizationTrackDetails_ResultEntity
    {
        public int Id { get; set; }
        public int AppraisalCycleId { get; set; }
        public int UserEmployeeId { get; set; }
        public string Rating { get; set; }
        public int? Status { get; set; }
        public int RatingHistoryGivenBy { get; set; }
        public int RecoForPromotion { get; set; }
        public string Comments { get; set; }
        public string CreatedBy { get; set; }
        public Nullable<System.DateTime> CreatedOn { get; set; }
        public string ModifiedBy { get; set; }
        public Nullable<System.DateTime> ModifiedOn { get; set; }
       

    }
}
