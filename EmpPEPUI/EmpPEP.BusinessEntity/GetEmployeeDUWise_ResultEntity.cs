using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetEmployeeDUWise_ResultEntity
    {
        public int EmployeeId { get; set; }
        public string NewEmployeeCode { get; set; }
        public string OldEmployeeCode { get; set; }
        public int CompanyId { get; set; }
        public Nullable<int> DivisionId { get; set; }
        public int EmployeeRoleId { get; set; }
        public string DomainId { get; set; }
        public Nullable<int> VerticalHorizontalId { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public System.DateTime DateOfBirth { get; set; }
        public System.DateTime JoiningDate { get; set; }
        public int EmployeeDesignationId { get; set; }
        public int EmployeeGradeId { get; set; }
        public string EmailAddress { get; set; }
        public int IsActive { get; set; }
        public int LocationId { get; set; }
        public int IsResigned { get; set; }
        public Nullable<System.DateTime> LastWorkingDay { get; set; }
        public Nullable<System.DateTime> ResignedDate { get; set; }
        public string EmployeeType { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<System.DateTime> CreatedOn { get; set; }
        public Nullable<int> ModifiedBy { get; set; }
        public Nullable<System.DateTime> ModifiedOn { get; set; }
        public int du { get; set; }
    }
}
