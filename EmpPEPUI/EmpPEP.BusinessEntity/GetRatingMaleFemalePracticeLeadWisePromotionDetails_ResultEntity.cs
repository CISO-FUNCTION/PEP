using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetRatingMaleFemalePracticeLeadWisePromotionDetails_ResultEntity
    {
        public string Grade { get; set; }
        public int TotalCount { get; set; }
        public int MaleRecommendationForPromotion { get; set; }
        public int FeMaleRecommendationForPromotion { get; set; }
        public int MalePercentage { get; set; }
        public int FemalePercentage { get; set; }
        public int MaleCount { get; set; }
        public int FemaleCount { get; set; }
        public int MaleApprovedCount { get; set; }
        public int FemaleApprovedCount { get; set; }

        public int OthersRecommendationForPromotion { get; set; }
        public int OthersPercentage { get; set; }
        public int OthersCount { get; set; }
        public int OthersApprovedCount { get; set; }
    }
}
