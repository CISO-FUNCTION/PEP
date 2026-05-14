using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
   public  class GetManagerListByEmployeeId_ResultEntity
    {
        public Nullable<int> ManagerId { get; set; }
        public string ManagerName { get; set; }
    }
}
