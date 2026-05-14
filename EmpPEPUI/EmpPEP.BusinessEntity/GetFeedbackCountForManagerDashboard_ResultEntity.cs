using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetFeedbackCountForManagerDashboard_ResultEntity
    {
        public int ToEmployeeId { get; set; }
        public string FirstName { get; set; }
        public Nullable<int> KRA { get; set; }
        public Nullable<int> Behavioural_Competency { get; set; }
        public DateTime FeedBackDate { get; set; }
        public string RN { get; set; }

    }
}
