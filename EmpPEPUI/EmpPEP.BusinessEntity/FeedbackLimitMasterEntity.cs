using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
   public class FeedbackLimitMasterEntity
    {
        public int FeedbackLimitID { get; set; }
        public Nullable<int> FeedbackFlowLimit { get; set; }
        public Nullable<int> ManagersTotalFeedback { get; set; }
        public Nullable<int> EmployeeTotalFeedback { get; set; }
        public Nullable<int> ClientTotalFeedback { get; set; }
        public Nullable<int> IsActive { get; set; }
    }
}
