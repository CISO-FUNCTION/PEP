using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetEmpDetails_ResultEntity
    {
        public int EmployeeId { get; set; }
        public string NewEmployeeCode { get; set; }
        public string OldEmployeeCode { get; set; }
        public int CompanyId { get; set; }
        public string CompanyName { get; set; }
        public Nullable<int> DivisionId { get; set; }
        public int EmployeeRoleId { get; set; }
        public string EmployeeRoleName { get; set; }
        public string DomainId { get; set; }
        public Nullable<int> VerticalHorizontalId { get; set; }
        public string VerticalHorizontalName { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public System.DateTime DateOfBirth { get; set; }
        public System.DateTime JoiningDate { get; set; }
        public int EmployeeDesignationId { get; set; }
        public string EmployeeDesignationName { get; set; }
        public int EmployeeGradeId { get; set; }
        public string EmployeeGradeName { get; set; }
        public string EmailAddress { get; set; }
        public int IsActive { get; set; }
        public int LocationId { get; set; }
        public string LocationName { get; set; }
        public int IsResigned { get; set; }
        public Nullable<System.DateTime> LastWorkingDay { get; set; }
        public Nullable<System.DateTime> ResignedDate { get; set; }
        public string EmployeeType { get; set; }
        public string ManagerName { get; set; }
        public int ManagerEmpId { get; set; }
        public int IsDelegatorManager { get; set; }
        public Nullable<System.DateTime> FromDate { get; set; }
        public bool IsPracticeLead { get; set; }
        public int IsRatingAdmin { get; set; }
        public bool IsHRBP { get; set; }
        public int RatingTabVisible { get; set; }

        public System.DateTime DateCheckBelowDP { get; set; }

        public int IsDP { get; set; }

        public System.DateTime GDLDateCheck { get; set; }

        public int IsGDL { get; set; }
        public System.DateTime GDLClosureDate { get; set; }
        public System.DateTime DPClosureDate { get; set; }

    }
}
