using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class spGetTrainingsSuggetsted_ResultEntity
    {
        public int EmployeeId { get; set; }
        public string Name { get; set; }
        public int TrainingId { get; set; }
        public Nullable<int> ParentTrainingId { get; set; }
        public Nullable<int> TrainingItemId { get; set; }
        public Nullable<System.DateTime> SuggestedStartDate { get; set; }
        public Nullable<System.DateTime> SuggestedEndDate { get; set; }
        public Nullable<int> TrainingStatusId { get; set; }
        public string Training { get; set; }
        public string TrainingType { get; set; }
        public string Status { get; set; }
    }
}
