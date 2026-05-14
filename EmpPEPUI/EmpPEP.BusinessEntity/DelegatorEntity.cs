using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
   public class DelegatorEntity
    {
       public int AppraisalCycleId { get; set; } 
       public int FromEmployeeId { get; set; } 
       public int EmpMgrMapId { get; set; } 
       public int ToEmployeeId { get; set; } 
       public string Action { get; set; }
       public string SuccessMessage { get; set; }
       public string EmployeeName { get; set; } 
    }
}
