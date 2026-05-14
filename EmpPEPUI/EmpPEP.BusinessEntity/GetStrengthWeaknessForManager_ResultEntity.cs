using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
   public class GetStrengthWeaknessForManager_ResultEntity
    {
        public string EmployeeName { get; set; }
        public string NewEmployeeCode { get; set; }
        public int ToEmployeeId { get; set; }
        public Nullable<int> QuestionaireId { get; set; }
        public string Question { get; set; }
        public string ExpectedPoint { get; set; }
        public int SW { get; set; }
    }
}
