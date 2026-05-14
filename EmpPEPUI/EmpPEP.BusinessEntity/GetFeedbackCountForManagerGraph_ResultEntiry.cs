using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetFeedbackCountForManagerGraph_ResultEntiry
    {
        public Nullable<int> ManagerId { get; set; }
        public Nullable<int> TeamCount { get; set; }
        public Nullable<int> MinMaxCounter { get; set; }
        public Nullable<int> LessThanCount { get; set; }
        public Nullable<int> GreaterThanCount { get; set; }
        public Nullable<int> NoGiven { get; set; }
    }
}
