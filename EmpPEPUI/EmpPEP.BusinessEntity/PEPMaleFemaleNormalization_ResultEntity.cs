using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class PEPMaleFemaleNormalization_ResultEntity
    {
        public string Rating { get; set; }
        public int MaleCurrentCount { get; set; }
        public int FemaleCurrentCount { get; set; }
        public string Grade { get; set; }
    }
}
