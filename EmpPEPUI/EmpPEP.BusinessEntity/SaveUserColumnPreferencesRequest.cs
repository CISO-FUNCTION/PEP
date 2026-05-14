namespace EmpPEP.BusinessEntities
{
    /// <summary>
    /// Request body for SaveUserColumnPreferences API.
    /// Wrapper ensures reliable JSON binding in Web API 2 (raw [FromBody] string often binds as null).
    /// </summary>
    public class SaveUserColumnPreferencesRequest
    {
        /// <summary>
        /// Comma-separated column IDs to save as visible (e.g. "1,2,3,4").
        /// </summary>
        public string VisibleColumnIds { get; set; }
    }
}
