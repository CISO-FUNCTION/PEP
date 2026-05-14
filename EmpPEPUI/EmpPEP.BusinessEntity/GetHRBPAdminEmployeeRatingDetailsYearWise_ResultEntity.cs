using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetHRBPAdminEmployeeRatingDetailsYearWise_ResultEntity
    {
        public int Id { get; set; }
        public int PEPEmployeeId { get; set; }
        public string AspireEmployeeId { get; set; }
        public int GradeID { get; set; }
        public string GradeName { get; set; }
        public int LocationID { get; set; }
        public string LocationName { get; set; }
        public string AccountGroup { get; set; }
        public string EmployeeName { get; set; }
        public string Gender { get; set; }
        public string RMName { get; set; }
       
        public string PrevRating { get; set; }
        public string LastpromotionDate { get; set; }
        public string RowStatus { get; set; }
        public string Comment { get; set; }
        public string Rating { get; set; }
        public string RecoPromo { get; set; }
        public string CurrentStatus { get; set; }
        public int AccountGroupID { get; set; }
        public int RatingGivenBy { get; set; }
        public string EmployeeStatus { get; set; }
        public string Inputter { get; set; }
        public string Reviewer { get; set; }
        public string Approver { get; set; }
        public string DeliveryStatus { get; set; }
    }

}
