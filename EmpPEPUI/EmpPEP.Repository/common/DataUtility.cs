using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Data;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.Repository.common
{
    internal class DataUtility : Connection
    {
        public SqlDataAdapter daCampus;
        public DataTable dtCampus;
        public DataSet dsCampus;
        public SqlDataReader drCampus;
        string path = string.Empty;
        public Double countrecord;
        static string str = string.Empty;
        static string table = string.Empty;
        static string valuefoupdate = string.Empty;
        string sectionName = "DataUtility";


        public bool ExecuteSqlProcedure(SqlCommand cmdCampus)
        {
            try
            {
                OpeneConnection();
                cmdCampus.Connection = ConCampus;
                cmdCampus.CommandTimeout = 1000;
                cmdCampus.CommandType = System.Data.CommandType.StoredProcedure;
                cmdCampus.ExecuteNonQuery();
                CloseConnection();
                DisposeConnection();
                return true;
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "ExecuteSqlProcedure");
                return false;
            }

        }

        public bool ExecuteSqlCommand(SqlCommand cmdCampus)
        {
            try
            {
                OpeneConnection();
                cmdCampus.Connection = ConCampus;
                cmdCampus.CommandTimeout = 120;
                cmdCampus.CommandType = System.Data.CommandType.Text;
                cmdCampus.ExecuteNonQuery();
                CloseConnection();
                DisposeConnection();

                return true;
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "ExecuteSqlCommand");
                return false;
            }

        }

        /// <summary>
        /// This Method is used to retrive data from database in a DataTable with help of StoredProcedure.
        /// </summary>
        /// <param name="cmdCampus">SqlCommand cmdCampus</param>
        /// <returns> DataTable </returns>
        public DataTable GetDataTableWithProc(SqlCommand cmdCampus)
        {
            try
            {
                OpeneConnection();
                cmdCampus.Connection = ConCampus;
                cmdCampus.CommandTimeout = 1000;
                cmdCampus.CommandType = System.Data.CommandType.StoredProcedure;
                daCampus = new SqlDataAdapter();
                dtCampus = new DataTable();
                daCampus.SelectCommand = cmdCampus;
                daCampus.Fill(dtCampus);
                CloseConnection();
                DisposeConnection();
                return dtCampus;
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetDataTableWithProc");
                return null;
            }

        }

        /// <summary>
        /// This Method is used to retrive data from database in a DataTable with help of Query.
        /// </summary>
        /// <param name="cmdCampus">SqlCommand cmdCampus</param>
        /// <returns> DataTable </returns>
        public DataTable GetDataTableWithQuery(SqlCommand cmdCampus)
        {
            try
            {
                OpeneConnection();
                cmdCampus.Connection = ConCampus;
                cmdCampus.CommandTimeout = 120;
                cmdCampus.CommandType = System.Data.CommandType.Text;
                daCampus = new SqlDataAdapter();
                dtCampus = new DataTable();
                daCampus.SelectCommand = cmdCampus;
                daCampus.Fill(dtCampus);
                CloseConnection();
                DisposeConnection();
                return dtCampus;
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetDataTableWithQuery");
                return null;
            }

        }

        /// <summary>
        /// This Method is used to retrive data from database in a DataSet with help of StoredProcedure.
        /// </summary>
        /// <param name="cmdCampus">SqlCommand cmdCampus</param>
        /// <returns> DataSet </returns>
        public DataSet GetDataSetWithProc(SqlCommand cmdCampus)
        {
            try
            {
                OpeneConnection();
                cmdCampus.Connection = ConCampus;
                // Match SSMS default so plans/cache behavior align (avoids slow plans SqlClient sometimes gets with ARITHABORT OFF).
                using (var arithAbort = new SqlCommand("SET ARITHABORT ON;", ConCampus))
                {
                    arithAbort.CommandTimeout = 30;
                    arithAbort.ExecuteNonQuery();
                }
                cmdCampus.CommandTimeout = 1200;
                cmdCampus.CommandType = System.Data.CommandType.StoredProcedure;
                daCampus = new SqlDataAdapter();
                dsCampus = new DataSet();
                daCampus.SelectCommand = cmdCampus;
                daCampus.Fill(dsCampus);
                CloseConnection();
                DisposeConnection();
                return dsCampus;
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetDataSetWithProc");
                return null;
            }

        }

        /// <summary>
        /// This Method is used to retrive data from database in a DataSet with help of Query.
        /// </summary>
        /// <param name="cmdCampus">SqlCommand cmdCampus</param>
        /// <returns> DataSet </returns>
        public DataSet GetDataSetWithQuery(SqlCommand cmdCampus)
        {
            try
            {
                OpeneConnection();
                cmdCampus.Connection = ConCampus;
                cmdCampus.CommandTimeout = 60;
                cmdCampus.CommandType = System.Data.CommandType.Text;
                daCampus = new SqlDataAdapter();
                dsCampus = new DataSet();
                daCampus.SelectCommand = cmdCampus;
                daCampus.Fill(dsCampus);
                CloseConnection();
                DisposeConnection();
                return dsCampus;
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetDataSetWithQuery");
                return null;
            }

        }


        /// <summary>
        /// This Function execute sql procedure with help of SqlDataReader
        /// </summary>
        /// <param name="cmdCampus"></param>
        /// <returns>SqlDataReader</returns>
        public SqlDataReader GetDataReaderWithProc(SqlCommand cmdCampus)
        {
            try
            {
                OpeneConnection();
                cmdCampus.Connection = ConCampus;
                cmdCampus.CommandTimeout = 60;
                cmdCampus.CommandType = System.Data.CommandType.StoredProcedure;
                drCampus = cmdCampus.ExecuteReader();
                CloseConnection();
                DisposeConnection();
                return drCampus;
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetDataReaderWithProc");
                return null;
            }
        }

        /// <summary>
        /// This Function execute sql Query with help of SqlDataReader
        /// </summary>
        /// <param name="cmdCampus"></param>
        /// <returns>SqlDataReader</returns>
        public SqlDataReader GetDataReaderWithQuery(SqlCommand cmdCampus)
        {
            try
            {
                OpeneConnection();
                cmdCampus.Connection = ConCampus;
                cmdCampus.CommandTimeout = 60;
                cmdCampus.CommandType = System.Data.CommandType.Text;
                drCampus = cmdCampus.ExecuteReader();
                CloseConnection();
                DisposeConnection();
                return drCampus;
            }
            catch (Exception ex)
            {
                ExceptionLogging.SendExcepToDB(ex, sectionName, "GetDataReaderWithQuery");
                return null;
            }
        }
        public void sendMail(string Subject, string Name, string Body, string To)
        {
            try
            {
                To = To.Trim();// +"" + Domain; 

                MailMessage mail = new MailMessage();
                mail.To.Add(To);
                //mail.Bcc.Add(To);
                mail.From = new MailAddress(FROMEMAIL, Name, System.Text.Encoding.UTF8);
                mail.Subject = Subject;
                mail.SubjectEncoding = System.Text.Encoding.UTF8;
                mail.Body = Body;
                mail.BodyEncoding = System.Text.Encoding.UTF8;
                mail.IsBodyHtml = true;
                mail.Priority = MailPriority.High;
                SmtpClient client = new SmtpClient();
                client.Credentials = new System.Net.NetworkCredential(FROMEMAIL, FROMPWD);
                client.Port = 587;
                client.Host = SMTP;
                client.EnableSsl = true;
                try
                {
                    client.Send(mail);
                }
                catch (Exception) { }
            }
            catch
            {
            }
        }

        string _PoweredBy;
        public string PoweredBy
        {
            get
            {
                return _PoweredBy;
            }
            set
            {
                _PoweredBy = value;
            }
        }
        string _ApplicationName;
        public string ApplicationName
        {
            get
            {
                return _ApplicationName;
            }
            set
            {
                _ApplicationName = value;
            }
        }
        string _Header;
        public string Header
        {
            get
            {
                return _Header;
            }
            set
            {
                _Header = value;
            }
        }
        string _Footer;
        public string Footer
        {
            get
            {
                return _Footer;
            }
            set
            {
                _Footer = value;
            }
        }

        public object ConfigurationManager { get; private set; }

        public void InsertQuery(string qry, string connection)
        {
            SqlConnection _connection = new SqlConnection(connection);
            SqlCommand cmd = new SqlCommand();
            cmd.CommandType = CommandType.Text;
            cmd.CommandText = qry;
            cmd.Connection = _connection;
            _connection.Open();
            cmd.ExecuteNonQuery();
            _connection.Close();

        }

        //public void bulkcopy(string str, string filepath, string tablename, DataTable dt1)
        //{
        //    using (MySqlBulkCopy bulkCopy = new MySqlBulkCopy(str))
        //    {
        //        //set the name of the destination table that data will be inserted into.
        //        //table must already exist.
        //        bulkCopy.DestinationTableName = tablename;
        //        bulkCopy.WriteToServer(dt1);
        //    }
        //}

        public void Droptables(string Procedurename, string connection, string TableName)
        {
            SqlConnection _connection = new SqlConnection(connection);
            SqlCommand cmd = new SqlCommand();
            cmd.CommandType = CommandType.Text;
            cmd.CommandText = Procedurename;
            cmd.Connection = _connection;
            _connection.Open();
            cmd.ExecuteNonQuery();
            _connection.Close();
        }
    }
}
