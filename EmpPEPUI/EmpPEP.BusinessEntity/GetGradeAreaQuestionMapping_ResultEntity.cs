using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetGradeAreaQuestionMapping_ResultEntity
    {
        public int EmployeeGradeID { get; set; }
        public string EmployeeGradeName { get; set; }
        public string ExpectedPoint { get; set; }
        public Nullable<int> GradeAreaQuestionMappingID { get; set; }
    }
}
