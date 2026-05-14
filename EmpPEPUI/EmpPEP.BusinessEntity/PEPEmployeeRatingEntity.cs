using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class PEPEmployeeRatingEntity
    {
        public int Id { get; set; }
        public Nullable<int> AppraisalCycleId { get; set; }
        public string AppraisalCycleName { get; set; }
        public string RatingDesc { get; set; }
        public string EmployeeId { get; set; }
        public string Rating { get; set; }
        public Nullable<System.DateTime> CreatedOn { get; set; }
        public string CreatedBy { get; set; }
        public Nullable<System.DateTime> ModifiedOn { get; set; }
        public string ModifiedBy { get; set; }
    }
}
