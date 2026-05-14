using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
   public class GetKRADefaulterEmployeeResultEntity
    {
        public int EmployeeId { get; set; }
        public string NewEmployeeCode { get; set; }
        public string OldEmployeeCode { get; set; }
        public string EmployeeName { get; set; }
        public System.DateTime JoiningDate { get; set; }
        public string EmailAddress { get; set; }
        public string LocationName { get; set; }
        public string EmployeeDesignationName { get; set; }
        public string EmployeeGradeName { get; set; }
        public string ManagersName { get; set; }
    }
}
