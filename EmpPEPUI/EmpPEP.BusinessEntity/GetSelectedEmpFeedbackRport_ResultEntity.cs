using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetSelectedEmpFeedbackRport_ResultEntity
    {

        public Nullable<System.DateTime> FBDate { get; set; }
        public string FromEmpName { get; set; }
        public string FromNewEmployeeCode { get; set; }
        public string ToEmpName { get; set; }
        public string ToNewEmployeeCode { get; set; }
        public string Area { get; set; }
        public string Feedback { get; set; }
        public string Goal { get; set; }
        public string Weightage { get; set; }
        public string Measure { get; set; }
        public string Rating { get; set; }
        public string ActionPlan { get; set; }

    }
}
