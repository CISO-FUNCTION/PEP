using System.Web;
using System.Web.Mvc;
using EmpPEP.UI.Common;

namespace PEP
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new EmpPEP.UI.Common.CspHandleErrorAttribute());
            filters.Add(new CheckSession());
        }
    }
}
