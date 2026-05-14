using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class GetTeamFeedbackStatsbyManagerId_ResultEntity
    {
        public int SeqNo { get; set; }
        public string TeamFBStatsHeader { get; set; }
        public Nullable<int> TeamFBStatsCount { get; set; }
        public string TeamFBStatsColor { get; set; }
    }
}
