using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntity
{
    public class PIPIssueMeasuremntDetails
    {
        public int ParamterId { get; set; }
        public int PIPId { get; set; }
        public int LoginEmpId { get; set; }
        public int SelectEmpID { get; set; }
        public string ProgressIssue { get; set; }
        public string Deliverables { get; set; }
        public string ProgressMeasuremnt { get; set; }
        public int CreatedBy { get; set; }
    }
}
