using System;

namespace EmpPEP.BusinessEntities
{
    public class GetPromotionGradeConfig_ResultEntity
    {
        public int Id { get; set; }
        public int AppraisalCycleId { get; set; }
        public string AppraisalCycleName { get; set; }
        public string GradeName { get; set; }
        public int GradeId { get; set; }
        public int PromotionPercentage { get; set; }
        public int MalePercentage { get; set; }
        public int FemalePercentage { get; set; }
        public int OthersPercentage { get; set; }
    }
}
