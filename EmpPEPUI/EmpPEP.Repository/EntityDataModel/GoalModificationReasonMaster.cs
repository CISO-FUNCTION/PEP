using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EmpPEP.Repository.EntityDataModel
{
    [Table("GoalModificationReasonMaster")]
    public class GoalModificationReasonMaster
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ReasonId { get; set; }

        [Required]
        [MaxLength(500)]
        public string ReasonText { get; set; }

        [Required]
        public bool IsActive { get; set; }

        [Required]
        public int DisplayOrder { get; set; }

        [Required]
        public DateTime CreatedDate { get; set; }

        public DateTime? ModifiedDate { get; set; }

        public int? CreatedBy { get; set; }

        public int? ModifiedBy { get; set; }
    }
}
