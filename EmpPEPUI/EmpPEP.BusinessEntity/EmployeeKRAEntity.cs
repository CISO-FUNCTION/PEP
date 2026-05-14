using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessEntities
{
    public class EmployeeKRAEntity
    {

        public int KRAId { get; set; }
        public int EmployeeId { get; set; }
        public Nullable<int> Sequence { get; set; }


        [Required(ErrorMessage = "Please select goal type")]
        [Range(1, int.MaxValue, ErrorMessage = "Please select goal type")]        
        public string GoalType { get; set; }

        [Required(ErrorMessage = "Please enter goal description")]
        public string GoalDescription { get; set; }

        [Required(ErrorMessage = "Please enter goal weightage")]
        public Nullable<decimal> Weightage { get; set; }
        public string ActionStep { get; set; }
        public string ActionPlan { get; set; }

        [Required(ErrorMessage = "Please enter goal measure")]
        public string Measure { get; set; }
        public Nullable<System.DateTime> TargetDate { get; set; }

        [Required(ErrorMessage = "Please enter start date")]
        [DataType(DataType.Date, ErrorMessage = "Invalid start date")]
        public DateTime KRAFromDate { get; set; }

        [Required(ErrorMessage = "Please enter end date")]
        [DataType(DataType.Date, ErrorMessage = "Invalid end date")]
        public DateTime KRAToDate { get; set; }

        public Nullable<int> KRAStatusId { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<System.DateTime> CreatedOn { get; set; }
        public Nullable<int> ModifiedBy { get; set; }
        public Nullable<System.DateTime> ModifiedOn { get; set; }
        public Nullable<int> AppraisalCycleId { get; set; }

        public string Feedback { get; set; }
        public Nullable<int> Rating { get; set; }
        public Nullable<int> KRASetId { get; set; }
        public Nullable<int> IsSeen { get; set; }
        public Nullable<int> ManagerId { get; set; }
        public string AttachmentPath { get; set; }
        public int flag { get; set; }
        public int kraeditinsert { get; set; }
        public string Selfassesment { get; set; }
        public string TrainingItemId { get; set; }  // Changed to string for comma-separated IDs
        public string TrainingRequirementName { get; set; }  // Already string, supports NVARCHAR(MAX)
        public string TrainingCategory { get; set; }  // Comma-separated categories for custom trainings (training_id = 0)

    }
}
