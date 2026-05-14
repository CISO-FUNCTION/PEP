using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EmpPEP.UI.Models
{
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