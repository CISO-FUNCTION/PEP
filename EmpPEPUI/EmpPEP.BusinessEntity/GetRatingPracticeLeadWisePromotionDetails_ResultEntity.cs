using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetRatingPracticeLeadWisePromotionDetails_ResultEntity
    {
        public string Grade { get; set; }
        public int TotalCount { get; set; }
        public int RecommendationForPromotion { get; set; }
        public int PromotoionPercentage { get; set; }
        public int ApprovedCount { get; set; }
        public int GradeId { get; set; }
    }
}
