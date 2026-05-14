using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data.Entity.Core.EntityClient;

namespace EmpPEP.Repository.common
{
    internal static class ExceptionLogging
    {
        static SqlConnection con;
        private static void connecttion()
        {
            //string constr = ConfigurationManager.ConnectionStrings["PEPConnection"].ToString();

            string entityConnectionString = ConfigurationManager.ConnectionStrings["PEPEntities1"].ConnectionString;
            EntityConnectionStringBuilder entityBuilder = new EntityConnectionStringBuilder(entityConnectionString);
            string sqlConnectionString = entityBuilder.ProviderConnectionString;

            con = new SqlConnection(sqlConnectionString);
            con.Open();
        }
        public static void SendExcepToDB(Exception exdb, string sectionName, string methodName, string EmpID = "")
        {

            try
            {
                connecttion();
                SqlCommand com = new SqlCommand("ExceptionLogging", con);
                com.CommandType = CommandType.StoredProcedure;
                com.Parameters.AddWithValue("@sectionName", sectionName);
                com.Parameters.AddWithValue("@methodName", methodName);
                com.Parameters.AddWithValue("@exceptionMsg", exdb.Message.ToString());
                com.Parameters.AddWithValue("@exceptionType", exdb.GetType().Name.ToString());
                com.Parameters.AddWithValue("@exceptionSource", "Application");
                com.Parameters.AddWithValue("@exceptionDetails", exdb.StackTrace.ToString());
                com.Parameters.AddWithValue("@createdOn", DateTime.Now);
                com.Parameters.AddWithValue("@createdBy", "");
                com.Parameters.AddWithValue("@createdBy", EmpID);
                com.ExecuteNonQuery();
                con.Close();

            }
            catch (Exception ex)
            {
                using (EventLog eventLog = new EventLog("Application"))
                {
                    eventLog.Source = "Application";
                    eventLog.WriteEntry("Unable to create the log using ExceptionLogging class. Exact error is :  " + ex.Message.ToString() + " Stack Trace: " + ex.StackTrace.ToString(), EventLogEntryType.Error, 101, 1);
                }
            }
        }
    }
}
