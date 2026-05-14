using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using log4net;
using System.IO;

namespace EmpPEP.Framework.Log4Net
{
    public sealed class FileLogService : ILogService
    {
        readonly ILog _logger;

        static FileLogService()
        {
            // Gets directory path of the calling application
            // RelativeSearchPath is null if the executing assembly i.e. calling assembly is a
            // stand alone exe file (Console, WinForm, etc). 
            // RelativeSearchPath is not null if the calling assembly is a web hosted application i.e. a web site
            var log4NetConfigDirectory = AppDomain.CurrentDomain.BaseDirectory;

            var log4NetConfigFilePath = Path.Combine(log4NetConfigDirectory, "Log4net\\log4net.config");

            log4net.Config.XmlConfigurator.ConfigureAndWatch(new FileInfo(log4NetConfigFilePath));

        }

        public FileLogService(Type logClass)
        {
            _logger = LogManager.GetLogger(logClass);
        }

        public void Fatal(string errorMessage)
        {
            if (_logger.IsFatalEnabled)
                _logger.Fatal(errorMessage);
        }

        public void Fatal(string projectName, string methodName, string errorMessage)
        {
            if (_logger.IsFatalEnabled)
                _logger.Fatal("**ERROR** MethodName: " + methodName + " - ErrorMessage: " + errorMessage);
        }

        public void Fatal(string projectName, string methodName, Object errorMessage)
        {
            if (_logger.IsFatalEnabled)
                _logger.Fatal("**ERROR** MethodName: " + methodName + " - ErrorMessage: " + errorMessage);
        }

        public void Error(string errorMessage)
        {
            if (_logger.IsErrorEnabled)
                _logger.Error(errorMessage);
        }

        public void Error(string projectName, string methodName, string errorMessage)
        {
            if (_logger.IsErrorEnabled)
                _logger.Error("**ERROR** MethodName: " + methodName + " - ErrorMessage: " + errorMessage);
        }

        public void Warn(string message)
        {
            if (_logger.IsWarnEnabled)
                _logger.Warn(message);
        }

        public void Warn(string projectName, string methodName, string message)
        {
            if (_logger.IsWarnEnabled)
                _logger.Warn("**WARN** MethodName: " + methodName + " - Message: " + message);
        }

        public void Info(string message)
        {
            //if (_logger.IsInfoEnabled)
            _logger.Info(message);
        }

        public void Info(string projectName, string methodName, string message)
        {
            //  if (_logger.IsInfoEnabled)
            _logger.Info("**INFO**  MethodName: " + methodName + " - Message: " + message);
        }

        public void Debug(string message)
        {
            if (_logger.IsDebugEnabled)
                _logger.Debug(message);
        }

        public void Debug(string projectName, string methodName, string message)
        {
            if (_logger.IsDebugEnabled)
                _logger.Debug("**DEBUG** MethodName: " + methodName + " - Message: " + message);
        }
    }
}