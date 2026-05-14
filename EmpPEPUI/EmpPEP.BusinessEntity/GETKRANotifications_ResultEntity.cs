using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
   public class GETKRANotifications_ResultEntity
    {
        public Nullable<int> AppraisalCycleId { get; set; }
        public string ActionTypeName { get; set; }
        public int FromEmployeeId { get; set; }
        public string FromEmployeeName { get; set; }
        public Nullable<int> ToEmployeeId { get; set; }
        public string ToEmployeeName { get; set; }
        public string AreaName { get; set; }
        public string Feedback { get; set; }
    }
}
