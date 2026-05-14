using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class EmployeeDataEntity
    {
        public int EmpId { get; set; }
        public string action { get; set; }
        public string selectedEmployees { get; set; }
        public int RowStaus { get; set; }
        public string Role { get; set; }
    }
}