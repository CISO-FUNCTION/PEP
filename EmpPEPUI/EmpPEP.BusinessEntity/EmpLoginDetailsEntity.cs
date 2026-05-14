using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class    EmpLoginDetailsEntity
    {
        public int EmployeeLoginId { get; set; }
        public int EmployeeId { get; set; }
        public string NewEmployeeCode { get; set; }
        public DateTime? LoginDate { get; set; }
        public DateTime? UpdateIntLogInTime { get; set; }
        public DateTime? UpdateIntLogOutTime { get; set; }
        public DateTime? LogoutDate { get; set; }
        public int IsActive { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string Token { get; set; }
        public int? DivisionId { get; set; }
    }

    public class EmpLoginEntity
    {
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Domain { get; set; }
        public string token { get; set; }
        public string UserId { get; set; }
    }
}
