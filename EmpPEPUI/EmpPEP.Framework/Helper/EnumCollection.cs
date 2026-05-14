using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.Framework.Helper
{
    public static class EnumCollection
    {
        public enum APPRAISALCYCLE
        {
            Initialised = 8,
            Started = 9,
            Completed = 10,
            Cancelled = 11
        };
        public enum KRA
        {
            Initialised = 1,
            Submitted = 2,
            Approved = 3,
            Completed = 4,
            Rejected = 18
        };

        public enum Role
        {
            User = 1,
            Manager = 3,
            LocationAdmin = 4,
            SuperAdmin = 5,
            LOBHead = 6,
            DUwiseHR=7
        };

        public enum TRAININGTYPE
        {
            Technical = 1,
            Behavioural = 2
        };

        public enum PRIORITY
        {
            Low = 1,
            Medium = 2,
            High = 3
        };

        public enum ACTIONTYPE
        {
            Suggest = 4,
            Request = 5
        };

        public enum STATUS
        {
            Requested = 12,
            Replied = 15,
            Feedback = 16,
            Rejected = 17
        };

        public enum KRAACTIONTYPE
        {
            Submit = 8,
            Approve = 9,
            Reject = 10,
        };

    }
}
