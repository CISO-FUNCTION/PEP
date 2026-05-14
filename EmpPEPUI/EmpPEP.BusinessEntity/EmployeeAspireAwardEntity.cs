using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class EmployeeAspireAwardEntity
    {
        public int Id { get; set; }
        public string EmpId { get; set; }
        public string Month { get; set; }
        public int Year { get; set; }
        public string Location { get; set; }
        public string DeliveryUnit { get; set; }
        public int AwardId { get; set; }
        public string AwardName { get; set; }
        public string AwardType { get; set; }
        public int IsActive { get; set; }
        public int IsDeleted { get; set; }
        public string Duration { get; set; }
        public DateTime? AwardDate { get; set; }
        public DateTime? CreatedOn { get; set; }
    }
}

