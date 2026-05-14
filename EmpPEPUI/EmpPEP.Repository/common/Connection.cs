using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity.Core.EntityClient;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.Repository.common
{
    public class Connection
    {
        public SqlConnection ConCampus;
        public Connection()
        {
            ConnectionString = ConfigurationManager.ConnectionStrings["PEPEntities1"].ToString();
        }
        string _Domain;
        public string Domain
        {
            get
            {
                return _Domain;
            }
            set
            {
                _Domain = value;
            }
        }
        string _FROMPWD;
        public string FROMPWD
        {
            get
            {
                return _FROMPWD;
            }
            set
            {
                _FROMPWD = value;
            }
        }
        string _FROMEMAIL;
        public string FROMEMAIL
        {
            get
            {
                return _FROMEMAIL;
            }
            set
            {
                _FROMEMAIL = value;
            }
        }
        string _SMTP;
        public string SMTP
        {
            get
            {
                return _SMTP;
            }
            set
            {
                _SMTP = value;
            }
        }
        string _ConnectionString;
        public string ConnectionString
        {
            get
            {
                return _ConnectionString;
            }
            set
            {
                _ConnectionString = value;
            }
        }

        protected string Scrub(string text) { return text.Replace("&nbsp;", ""); }

        public string ConCampus_ConnectionString
        {
            get
            {
                return ConnectionString;
            }
        }
        public string ConCampus_ConnectionString1
        {
            get
            {
                return System.Configuration.ConfigurationManager.AppSettings["PEPConnection"];
            }
        }

        /// <summary>
        /// This function is used to open connection for eEducation
        /// 
        /// </summary>
        public void OpeneConnection()
        {

            string entityConnectionString = ConfigurationManager.ConnectionStrings["PEPEntities1"].ConnectionString;
            EntityConnectionStringBuilder entityBuilder = new EntityConnectionStringBuilder(entityConnectionString);
            string sqlConnectionString = entityBuilder.ProviderConnectionString;

            if (ConCampus == null)
            {
                ConCampus = new SqlConnection(sqlConnectionString);
            }
            if (ConCampus.State != System.Data.ConnectionState.Open)
            {
                @ConCampus.Open();
            }

        }

        public void CloseConnection()
        {

            if (ConCampus.State == System.Data.ConnectionState.Open)
            {
                ConCampus.Close();
            }

        }

        public void DisposeConnection()
        {

            if (ConCampus == null)
            {
                ConCampus.Dispose();
            }

        }
    }
}
