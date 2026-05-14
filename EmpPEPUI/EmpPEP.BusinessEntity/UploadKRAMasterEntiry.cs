using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
   public class UploadKRAMasterEntiry
    {
        public int UploadKRAId { get; set; }
        public string KRATitle { get; set; }
        public string GoalType { get; set; }
        public string GoalDescription { get; set; }
        public Nullable<decimal> Weightage { get; set; }
        public string ActionStep { get; set; }
        public string Measure { get; set; }
        public Nullable<System.DateTime> TargetDate { get; set; }
        public System.DateTime KRAFromDate { get; set; }
        public System.DateTime KRAToDate { get; set; }
        public Nullable<int> Sequence { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<System.DateTime> CreatedOn { get; set; }
        public Nullable<int> ModifiedBy { get; set; }
        public Nullable<System.DateTime> ModifiedOn { get; set; }
        public Nullable<int> UploadKRASetID { get; set; }
        public Nullable<int> AppraisalCycleId { get; set; }
    }
}
