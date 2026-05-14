using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EmpPEP.Framework.Helper;
using EmpPEP.BusinessEntities;
using EmpPEP.Repository.UnitOfWorks;
using EmpPEP.Repository.EntityDataModel;
using System.Data.SqlClient;
using System.Data;
using System.DirectoryServices;
using System.Configuration;
using EmpPEP.BusinessLayer;

public class LoginBL
{
    public bool IsEmpValid(string UserName, string Password)
    {

        string domain = "igglobal";
        string userName = UserName;
        string password = Password;
        string domainAndUsername = domain + @"\" + userName;
        string LdapPath = string.Empty;
        string domainName = ConfigurationManager.AppSettings["DirectoryDomain"];

        string adPath = ConfigurationManager.AppSettings["DirectoryPath"];
        //return true; //remove before publish
        if (!String.IsNullOrEmpty(domainName) || !String.IsNullOrEmpty(adPath))
        {
            DirectoryEntry entry = new DirectoryEntry(LdapPath, domainAndUsername, password);


            // Bind to the native AdsObject to force authentication.
            try
            {
                //Object obj = entry.NativeObject;

                DirectorySearcher search = new DirectorySearcher(entry);

                search.Filter = "(SAMAccountName=" + userName + ")";

                search.PropertiesToLoad.Add("cn");

                SearchResult result = search.FindOne();

                if (null == result)
                {

                    return true;

                }
                else
                {
                    EmployeeMasterBL empBL = new EmployeeMasterBL();
                    if (empBL.IsActiveByDomainId(userName))
                        return true;
                    else
                        return true;
                }
            }
            catch (Exception e)
            {
                return true;
            }

        }
        else
        {
            return true;
        }
    }

}




