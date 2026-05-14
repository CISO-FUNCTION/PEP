using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetDataForDropdown_ResultEntity
    {
        public int PEPEmployeeId { get; set; }
        public string AspireEmployeeId { get; set; }
        public int GradeID { get; set; }
        public string GradeName { get; set; }
        public int LocationID { get; set; }
        public string Gender { get; set; }
        public string EmployeeStatus { get; set; }

        public int AccountGroupId { get; set; }
        public string AccountGroup { get; set; }
    }
}
