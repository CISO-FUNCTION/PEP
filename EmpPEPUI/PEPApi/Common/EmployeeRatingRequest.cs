using System;
using System.Collections.Generic;
using System.Linq;
using EmpPEP.BusinessEntities;

namespace EmpPEP.WebApi.Common
{
    public class EmployeeRatingRequest
    {
        public List<EmployeeRatingNormailizationDetailsEntity> EmployeeRatings { get; set; }
        public int RoleId { get; set; }
    }
}