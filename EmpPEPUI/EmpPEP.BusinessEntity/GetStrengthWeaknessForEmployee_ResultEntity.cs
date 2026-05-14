using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetStrengthWeaknessForEmployee_ResultEntity
    {
        public Nullable<int> QuestionaireId { get; set; }
        public string Question { get; set; }
        public string ExpectedPoint { get; set; }
        public int StrengthWeakness { get; set; }
    }
}
