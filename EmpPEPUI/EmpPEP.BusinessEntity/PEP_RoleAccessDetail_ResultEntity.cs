using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class PEP_RoleAccessDetail_ResultEntity
    {
        public int IsEnabled { get; set; }
        public Nullable<int> Roleid { get; set; }
        public string RoleName { get; set; }
    }
}
