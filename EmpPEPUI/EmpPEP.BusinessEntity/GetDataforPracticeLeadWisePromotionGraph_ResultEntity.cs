using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetDataforPracticeLeadWisePromotionGraph_ResultEntity
    {
        public string Grade { get; set; }
        public decimal TotalEmployees { get; set; }
        public int ApprovedforPromotion { get; set; }
        public int RecommendationForPromotion { get; set; }
    }
}
