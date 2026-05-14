using EmpPEP.BusinessEntities;
using EmpPEP.Framework.Helper;
using EmpPEP.Repository.EntityDataModel;
using EmpPEP.Repository.UnitOfWorks;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmpPEP.BusinessLayer
{
   public class PageSideBarBL
    {
        //public DataSet GetMenus(int RoleId, int RatingTabVisible, int IsRatingAdmin, bool IsHRBP)
        //{
        //    using (var repository = new PageSideBarRepository())
        //    {
        //        var menuList = repository.Get(RoleId,  RatingTabVisible,  IsRatingAdmin,  IsHRBP);

        //        if (menuList.Any())
        //        {
        //            return Utility.ConvertToList<EmpPEP.Repository.UnitOfWorks.PageSideBarRepository.SideBarMenu, PageSideBarMenuEntity>(menuList);
        //        }
        //        return null;
        //    }
        //}


        public DataSet GetMenus(int EmpId)
        {
            using (var repository = new PageSideBarRepository())
            {
                // Fetch the menu list based on the parameters.
                var menuList = repository.Get(EmpId);

                // Check if there are any menu items
                if (menuList.Any())
                {
                    // Convert the list to a DataTable
                    var menuDataTable = ConvertToDataTable(menuList);

                    // Create a DataSet and add the DataTable to it
                    var dataSet = new DataSet();
                    dataSet.Tables.Add(menuDataTable);

                    return dataSet;
                }

                return null;
            }
        }

        // Helper method to convert the list of menus into a DataTable
        // Helper method to convert the list of menus into a DataTable
        private DataTable ConvertToDataTable(IEnumerable<PageSideBarRepository.SideBarMenu> menuList)
        {
            // Create a DataTable to hold the data
            var dataTable = new DataTable();

            // Define columns based on the properties of the SideBarMenu class
            dataTable.Columns.Add("Title", typeof(string));  // Map the Title property
            dataTable.Columns.Add("Class", typeof(string));  // Map the Class property
            dataTable.Columns.Add("Href", typeof(string));  // Map the Href property
            dataTable.Columns.Add("ImageURL", typeof(string));  // Map the ImageURL property
            dataTable.Columns.Add("IsSelected", typeof(bool));  // Map the IsSelected property
            dataTable.Columns.Add("IsActive", typeof(bool));  // Map the IsActive property
            dataTable.Columns.Add("Visibility", typeof(int));  // Map the Visibility property

            // Populate the DataTable with data from the menuList
            foreach (var menu in menuList)
            {
                // Add a row for each SideBarMenu in the list
                dataTable.Rows.Add(menu.Title, menu.Class, menu.Href, menu.ImageURL, menu.IsSelected, menu.IsActive, menu.Visibility);
            }

            return dataTable;
        }


        public bool IsAdmin(int EmployeeId)
        {
            bool val = false;
            using (var repository = new PageSideBarRepository())
            {
                return val = repository.IsAdmin(EmployeeId);
            }
        }

    }
}
