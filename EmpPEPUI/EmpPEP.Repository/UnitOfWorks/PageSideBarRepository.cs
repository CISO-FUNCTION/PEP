using EmpPEP.Repository.EntityDataModel;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EmpPEP.Framework.Helper;
using static EmpPEP.Framework.Helper.EnumCollection;
using System.Data;
using System.Data.SqlClient;
using EmpPEP.Repository.common;

namespace EmpPEP.Repository.UnitOfWorks
{
    public class PageSideBarRepository : BaseDispose
    {
        SqlCommand cmdObj;
        string sectionName = "EmployeeKRARepository";
        DataUtility du;

        #region "Private variables"
        bool disposed = false;
        private readonly PEPEntities1 context = null;
        #endregion

        #region Dispose Pattern
        protected override void Dispose(bool disposing)
        {
            if (!this.disposed && disposing)
            {
                context.Dispose();
            }
            this.disposed = true;

            // Call base class implementation.
            base.Dispose(disposing);
        }
        #endregion
        public PageSideBarRepository()
        {
            context = new PEPEntities1();
            du = new DataUtility();
        }

        //public DataSet Get(int RoleId, int RatingTabVisible, int IsRatingAdmin, bool IsHRBP)
        //{

        //    List<SideBarMenu> SideBarSubMenuItemList = new List<SideBarMenu>();
        //    var getMenuId = (from b in context.AppMenuAccesses
        //                     join aa in context.AppMenus on b.AppMenuId equals aa.Id
        //                     where b.EmployeeRoleId.Equals(RoleId)
        //                     orderby aa.MenuOrder ascending
        //                     select b.AppMenuId).ToList();
        //    foreach (var userRole in getMenuId)
        //    {
        //        var appMenuList = (from b in context.AppMenus.Where(x => x.Id.Equals(userRole)) orderby b.MenuOrder select b).ToList();


        //        if (appMenuList != null)
        //        {

        //            foreach (var appMenu in appMenuList)
        //            {

        //                if (appMenu.MenuName == "Ratings & Promotions")
        //                {
        //                    if (RatingTabVisible == 1)
        //                    {
        //                        SideBarSubMenuItemList.Add(new SideBarMenu { Title = appMenu.MenuName, Href = appMenu.Href, ImageURL = appMenu.ImageURL });
        //                    }
        //                }
        //                else if (appMenu.MenuName == "Rating Admin")
        //                {
        //                    if ((IsRatingAdmin == 1 || IsHRBP == true))
        //                    {
        //                        SideBarSubMenuItemList.Add(new SideBarMenu { Title = appMenu.MenuName, Href = appMenu.Href, ImageURL = appMenu.ImageURL });
        //                    }

        //                }
        //                else
        //                {
        //                    SideBarSubMenuItemList.Add(new SideBarMenu { Title = appMenu.MenuName, Href = appMenu.Href, ImageURL = appMenu.ImageURL });
        //                }
        //            }

        //        }
        //    }

        //    return SideBarSubMenuItemList != null ? SideBarSubMenuItemList.ToList() : new List<SideBarMenu>();
        //}

        public List<SideBarMenu> Get(int EmpId)
        {
            List<SideBarMenu> sideBarMenus = new List<SideBarMenu>();

            try
            {
                OpeneConnection(); // Open the connection

                string storedProcedureName = "GetMenusForRole";

                // Create the SqlCommand object to call the stored procedure
                cmdObj = new SqlCommand(storedProcedureName, ConCampus);
                cmdObj.CommandType = CommandType.StoredProcedure;

                cmdObj.Parameters.AddWithValue("@LoginEmpId", EmpId);

                    using (SqlDataReader reader = cmdObj.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            sideBarMenus.Add(new SideBarMenu
                            {
                                Title = reader["MenuName"].ToString(),
                                Href = reader["Href"].ToString(),
                                ImageURL = reader["ImageURL"].ToString()
                            });
                        }
                    }
                
            }
            catch (Exception ex)
            {
                throw new Exception("Error retrieving sidebar menus", ex);
            }
            finally
            {
                CloseConnection(); // Close the connection
            }

            return sideBarMenus;
        }

        public bool IsAdmin(int EmployeeId)
        {

            return  context.EmployeeMasters.Any(b => b.EmployeeRoleId == 5 && b.EmployeeId == EmployeeId);
        }

        public class SideBarMenu
        {
            public string Title { get; set; }
            public string Class { get; set; }
            public string Href { get; set; }
            public string ImageURL { get; set; }
            public bool IsSelected { get; set; }
            public bool IsActive { get; set; }
            public int Visibility { get; set; }

        }
    }
}
