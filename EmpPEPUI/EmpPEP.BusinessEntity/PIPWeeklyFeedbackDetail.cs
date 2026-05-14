using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntity
{
    public class PIPWeeklyFeedbackDetail
    {
        public int WeekId { get; set; }
        public int LogEmpId { get; set; }
        public string Feedback { get; set; }
        public DateTime ModifiedOn { get; set; }
    }
}
