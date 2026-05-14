using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetEmployeeAvgRatings_ResultEntity
    {
        public Nullable<int> QuestionaireId { get; set; }
        public string Question { get; set; }
        public string ExpectedPoint { get; set; }
        public Nullable<int> AvgRatings { get; set; }
        public string Selfassesment { get; set; }
        public DateTime FeedbackDate { get; set; }

        public string Feedback { get; set; }
    }
}
