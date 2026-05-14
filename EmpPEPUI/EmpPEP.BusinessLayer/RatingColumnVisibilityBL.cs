using EmpPEP.Repository.UnitOfWorks;
using System.Data;

namespace EmpPEP.BusinessLayer
{
    public class RatingColumnVisibilityBL
    {
        #region "Public Methods"

        /// <summary>
        /// Get all column configuration for Rating table
        /// </summary>
        /// <param name="pageType">Page type - 'Rating' or 'RatingAdmin'</param>
        /// <returns>DataSet containing column configuration</returns>
        public DataSet GetRatingColumnConfiguration(string pageType = "Rating")
        {
            using (var ratingRepository = new RatingRepository())
            {
                return ratingRepository.GetRatingColumnConfiguration(pageType);
            }
        }

        /// <summary>
        /// Get user's saved column preferences or default preferences
        /// </summary>
        /// <param name="employeeId">Employee ID</param>
        /// <param name="pageType">Page type - 'Rating' or 'RatingAdmin'</param>
        /// <returns>DataSet containing user's column preferences</returns>
        public DataSet GetUserColumnPreferences(int employeeId, string pageType = "Rating")
        {
            using (var ratingRepository = new RatingRepository())
            {
                return ratingRepository.GetUserColumnPreferences(employeeId, pageType);
            }
        }

        /// <summary>
        /// Save user's column visibility preferences
        /// </summary>
        /// <param name="employeeId">Employee ID</param>
        /// <param name="visibleColumnIds">Comma-separated list of visible column IDs</param>
        /// <param name="pageType">Page type - 'Rating' or 'RatingAdmin'</param>
        /// <returns>DataSet containing save result</returns>
        public DataSet SaveUserColumnPreferences(int employeeId, string visibleColumnIds, string pageType = "Rating")
        {
            using (var ratingRepository = new RatingRepository())
            {
                return ratingRepository.SaveUserColumnPreferences(employeeId, visibleColumnIds, pageType);
            }
        }

        #endregion
    }
}
