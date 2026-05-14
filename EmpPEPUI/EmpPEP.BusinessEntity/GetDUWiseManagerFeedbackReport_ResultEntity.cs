using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetDUWiseManagerFeedbackReport_ResultEntity
    {
        public int EmployeeId { get; set; }
        public string DeliveryUnit { get; set; }
        public string NewEmployeeCode { get; set; }
        public string RMname { get; set; }
        public string AccountName { get; set; }
        public string DESIGNATION { get; set; }
        public Nullable<int> TeamSizeL1 { get; set; }
        public Nullable<int> NoOfTeamMembersFBGiven { get; set; }
        public Nullable<int> PercentOfTeamFBGiven { get; set; }
    }
}
