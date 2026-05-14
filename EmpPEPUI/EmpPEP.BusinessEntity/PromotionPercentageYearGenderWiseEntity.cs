using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class PromotionPercentageYearGenderWiseEntity
    {
        public int Id { get; set; }
        public int AppraisalCycleId { get; set; }
        public string GradeeName { get; set; }
        public int GradeId { get; set; }
        public int PromotionPercentage { get; set; }
        public int MalePercentage { get; set; }
        public int FemalePercentage { get; set; }
        public int OthersPercentage { get; set; }
        public int CreatedBy { get; set; }
        public System.DateTime CreatedOn { get; set; }
        public Nullable<int> ModifiedBy { get; set; }
        public Nullable<System.DateTime> ModifiedOn { get; set; }
        public bool IsActive { get; set; }
    }
}
