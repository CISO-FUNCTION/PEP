using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntity
{
    public class AddPIPWeeklyFeedback
    {
        public List<PIPWeeklyFeedbackDetail> FeedbackArray { get; set; }
        public int PIPId { get; set; }
        public int LoginEmpID { get; set; }
        public int WeekNo { get; set; }
        public int Status { get; set; }

    }
}
