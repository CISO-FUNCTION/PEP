using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EmpPEP.WebApi.Common
{


    public class RatingParameterDetail
    {

        public int AppraisalCycleId { get; set; }
        public int LoginEmployeeId { get; set; }
        public string ReporteeIds { get; set; }
        public bool AllSelected { get; set; }
        public string GradeId { get; set; }
        public string LocationId { get; set; }
        public string GroupAccountId { get; set; }
        public string Gender { get; set; }
        public string EmpStatus { get; set; }
        public string Promotion { get; set; }
        public int RoleId { get; set; }
        public string CriticalityPriority { get; set; }
        /// <summary>Comma-separated Criticality Priority IDs for multi-select (e.g. "1,2,3"). Empty or "0" = no filter. Same pattern as GradeId, LocationId.</summary>
        public string CriticalityPriorityId { get; set; }
    }

    /// <summary>Body for POST api/Rating/RemoveCriticalityDetails</summary>
    public class RemoveCriticalityRequest
    {
        public int PEPEmployeeId { get; set; }
        public int AppraisalCycleId { get; set; }
        public int RatingGivenBy { get; set; }
        public int RoleId { get; set; }
    }
}