namespace EmpPEP.Repository.EntityDataModel
{
    /// <summary>
    /// Training columns from EmployeeFeedBack (manager feedback only), returned by GetPreviousRMFeedback @AreaId=2.
    /// </summary>
    public partial class GetPreviousRMFeedback_Result
    {
        public string TrainingItemId { get; set; }
        public string TrainingRequirementName { get; set; }
        public string TrainingCategory { get; set; }
    }
}
