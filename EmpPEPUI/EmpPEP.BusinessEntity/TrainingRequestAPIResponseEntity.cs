namespace EmpPEP.BusinessEntities
{
    /// <summary>
    /// API Response model for training request
    /// </summary>
    public class TrainingRequestAPIResponse
    {
        public bool success { get; set; }
        public string message { get; set; }
        public TrainingRequestData data { get; set; }
        public bool isDuplicate { get; set; }
    }

    /// <summary>
    /// API Response data model
    /// </summary>
    public class TrainingRequestData
    {
        public string training_id { get; set; }
        public string training_type { get; set; }
        public string training_name { get; set; }
        public string employee_id { get; set; }
        public string employee_name { get; set; }
        public string reason { get; set; }
        public string completion_timeline { get; set; }
        public string fiscal_year { get; set; }
        public string status { get; set; }
    }
}

