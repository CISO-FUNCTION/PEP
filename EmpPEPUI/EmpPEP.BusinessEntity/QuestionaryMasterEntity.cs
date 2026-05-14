using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
   public class QuestionaryMasterEntity
    {
        public int QuestionnaireId { get; set; }
        public int QuestionaireId { get; set; }
        public string Question { get; set; }
        public int QuestionTypeId { get; set; }
        public string QuestionDesc1 { get; set; }
        public int IsActive { get; set; }
        public Nullable<int> AreaID { get; set; }
        public string AreaName { get; set; }

        public Nullable<int> CreatedBy { get; set; }
        public Nullable<System.DateTime> CreatedOn { get; set; }
        public Nullable<int> ModifiedBy { get; set; }
        public Nullable<System.DateTime> ModifiedOn { get; set; }

        public string Rate1 { get; set; }
        public string Rate2 { get; set; }
        public string Rate3 { get; set; }
        public string Rate4 { get; set; }
        public string Rate5 { get; set; }
    }
}
