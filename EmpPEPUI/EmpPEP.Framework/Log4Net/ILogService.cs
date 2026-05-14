using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.Framework.Log4Net
{
    public interface ILogService
    {
        void Fatal(string errorMessage);
        void Fatal(string projectName, string methodName, string errorMessage);
        void Fatal(string projectName, string methodName, object errorMessage);
        void Error(string errorMessage);
        void Error(string projectName, string methodName, string errorMessage);
        void Warn(string message);
        void Warn(string projectName, string methodName, string message);
        void Info(string message);
        void Info(string projectName, string methodName, string message);
        void Debug(string message);
        void Debug(string projectName, string methodName, string message);
    }
}
