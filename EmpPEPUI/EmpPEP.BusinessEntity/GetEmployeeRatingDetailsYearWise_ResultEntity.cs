using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetEmployeeRatingDetailsYearWise_ResultEntity
    {
        public int Id { get; set; }
        public string AspireEmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public string RMName { get; set; }
        public string TotalExp { get; set; }
        public string InfogainExp { get; set; }
        // Previous Year 2 (2 years ago)
        public string Prev2Rating { get; set; }
        public int Prev2RecoForPromotion { get; set; }
        // Previous Year 1 (1 year ago) - this is the existing PrevRating
        public string PrevRating { get; set; }
        public int Prev1RecoForPromotion { get; set; }
        public string LastpromotionDate { get; set; }
        // Current Year (input fields)
        public string CurrentRating { get; set; }
        public int RecoForPromotion { get; set; }
        public string Comment { get; set; }
        public int PEPEmployeeId { get; set; }
        public string CurrentStatus { get; set; }
        public string Gender { get; set; }
        public int DeliveryUnit { get; set; }
        public int NextApproverId { get; set; }
        public string RowStatus { get; set; }
        public int FinalApprover { get; set; }
        public int GradeID { get; set; }
        public string GradeName { get; set; }
        public int LocationID { get; set; }
        public string LocationName { get; set; }
        public string AccountGroup { get; set; }

        public int RatingGivenFlag { get; set; }
        public int LastratingGivenBy { get; set; }
        public string ApprovedRating { get; set; }
        public string ApprovedRecoPromo { get; set; }
        public int AccountGroupID { get; set; }
        public string EmployeeStatus { get; set; }
        public int SLastRatingGivenBy { get; set; }
        public string TalentCube { get; set; }
		public int IsEligibleForPromotion { get; set; }
    }
}
