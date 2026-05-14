using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
   public class EmailTemplateMasterEntity
    {
        public int EmailTemplateId { get; set; }
        public string TemplateName { get; set; }
        public int EventId { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
    }
}
