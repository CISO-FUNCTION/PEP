using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class EmployeeRatingDetails_Entity
    {

        public int Id { get; set; }
        public int RowNo { get; set; }
        public int AppraisalCycleId { get; set; }
        public int RatingGivenBy { get; set; }
        public int PEPEmployeeId { get; set; }
        public string Rating { get; set; }
        public int RecoForpromotion { get; set; }
        public int RecommendedDesignation { get; set; }
        public int IsDesignationUpdate { get; set; }
        public string Comments { get; set; }
    }
}
