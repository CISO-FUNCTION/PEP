using System;

namespace EmpPEP.Repository.EntityDataModel
{
    /// <summary>
    /// Result class for UnlockEmployeeGoals stored procedure
    /// </summary>
    public class UnlockGoalsResult
    {
        public int Success { get; set; }
        public int UpdatedCount { get; set; }
        public string Message { get; set; }
    }
}
