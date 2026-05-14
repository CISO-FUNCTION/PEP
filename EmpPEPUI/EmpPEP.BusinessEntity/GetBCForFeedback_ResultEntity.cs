using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetBCForFeedback_ResultEntity
    {
            public int QuestionaireId { get; set; }
            public int GradeAreaQuestionMappingID { get; set; }
            public string Question { get; set; }
            public Nullable<int> AreaID { get; set; }
            public string ExpectedPoint { get; set; }
            public Nullable<int> Sequence { get; set; }
            public int AppraisalCycleId { get; set; }
            public int EmployeeGradeID { get; set; }
            public int EmployeeId { get; set; }
            public string Rate1 { get; set; }
            public string Rate2 { get; set; }
            public string Rate3 { get; set; }
            public string Rate4 { get; set; }
            public string Rate5 { get; set; }

    }
}
