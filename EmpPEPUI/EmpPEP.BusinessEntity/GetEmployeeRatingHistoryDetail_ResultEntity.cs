using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetEmployeeRatingHistoryDetail_ResultEntity
    {
        public Nullable<int> SrNo { get; set; }
        public string GivenBy { get; set; }
        public string Rating { get; set; }
        public string Givendate { get; set; }
        public string Action { get; set; }
        public string Comments { get; set; }
        public string RecoPromotion { get; set; }
        public string CriticalityStatus { get; set; }
    }
}
