using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class PEP_GradeRatingTypeWiseNormData_ResultEntity
    {
        public int TotalCount { get; set; }
        public int CurrentCount { get; set; }
        public string GRADE { get; set; }
        public int GradeId { get; set; }
        public string Rating { get; set; }
    }
}
