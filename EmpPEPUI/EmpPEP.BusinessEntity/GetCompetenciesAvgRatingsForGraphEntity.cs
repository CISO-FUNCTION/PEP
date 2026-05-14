using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
   public class GetCompetenciesAvgRatingsForGraphEntity
    {
        public Nullable<int> QuestionaireId { get; set; }
        public string Question { get; set; }
        public string ExpectedPoint { get; set; }
        public Nullable<int> ActualPoint { get; set; }
    }
}
