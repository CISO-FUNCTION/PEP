using System;

namespace EmpPEP.BusinessEntities
{
    /// <summary>
    /// Entity for KRA attachment information
    /// </summary>
    public class KRAAttachmentEntity
    {
        public int KRAId { get; set; }
        public string FilePath { get; set; }
        public string FileName { get; set; }
    }
}

