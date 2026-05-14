//------------------------------------------------------------------------------
// Partial class extension for EmployeeKRA
// Adds AttachmentPath property if missing
//------------------------------------------------------------------------------

namespace EmpPEP.Repository.EntityDataModel
{
    public partial class EmployeeKRA
    {
        // AttachmentPath property (may already exist in some versions)
        public string AttachmentPath { get; set; }
    }
}

