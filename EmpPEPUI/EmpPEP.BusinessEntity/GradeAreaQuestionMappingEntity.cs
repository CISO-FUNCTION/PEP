using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
   public class GradeAreaQuestionMappingEntity
    {
        public int GradeAreaQuestionMappingID { get; set; }
        public Nullable<int> AppraisalCycleId { get; set; }
        public Nullable<int> AreaID { get; set; }
        public Nullable<int> QuestionID { get; set; }
        public Nullable<int> EmployeeGradeID { get; set; }
        public Nullable<decimal> SupervisorWeightage { get; set; }
        public Nullable<decimal> PeerAndCustomerWeightage { get; set; }
        public string ExpectedPoint { get; set; }
        public Nullable<int> Sequence { get; set; }
        public Nullable<int> IsActive { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<System.DateTime> CreatedOn { get; set; }
        public Nullable<int> ModifiedBy { get; set; }
        public Nullable<System.DateTime> ModifiedOn { get; set; }
    }
}
