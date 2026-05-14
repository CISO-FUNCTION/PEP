using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
   public class ValidationsEntity
    {
       public string FieldName{ get; set; }
       public string Fieldvalue { get; set; }
       public string ErrorMessage { get; set; }
       public bool CanOverride { get; set; } = false;  // Indicates if the validation error allows override with confirmation
       public int TotalExistingGoals { get; set; } = 0; // Additional info about existing goals count
    }
}
