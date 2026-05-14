using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class PEP_GivenPendingFeedbackSelfAssesmentstatusResultEntity
    {
        public string RmID { get; set; }
        public string RmName { get; set; }
        public string EmpID { get; set; }
        public string EmpName { get; set; }
        public string EmpGrade { get; set; }
        public string EmpDU { get; set; }
        public string EmpAccountName { get; set; }
        public string EmpLocation { get; set; }
        public string FeedbackGiven { get; set; }
        public string SelfAssementGiven { get; set; }
    }
}
