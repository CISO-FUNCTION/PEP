using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Configuration;
using Newtonsoft.Json;
using EmpPEP.Framework.Log4Net;
using EmpPEP.BusinessEntities;

namespace EmpPEP.BusinessLayer
{
    public class TrainingRequestService
    {
        private readonly ILogService logService = new FileLogService(typeof(TrainingRequestService));
        
        // Read configuration from web.config
        private string API_URL => ConfigurationManager.AppSettings["TrainingRequestAPI:URL"] ?? "https://preprod-iep.infogain.com/wp-json/v01/assign-training-request";
        private string API_USERNAME => ConfigurationManager.AppSettings["TrainingRequestAPI:Username"] ?? "iepapi";
        private string API_PASSWORD => ConfigurationManager.AppSettings["TrainingRequestAPI:Password"] ?? "Pas@123!";

        /// <summary>
        /// Call external API to create training request
        /// </summary>
        /// <param name="trainingType">Must be 'course', 'lp', or 'certifications'</param>
        /// <param name="trainingId">The ID of the training</param>
        /// <param name="empId">The employee ID to assign the training to</param>
        /// <returns>API response object</returns>
        public TrainingRequestAPIResponse CreateTrainingRequest(string trainingType, string trainingId, string empId)
        {
            try
            {
                // Use HttpWebRequest for better control over headers
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12 | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls;
                
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(API_URL);
                request.Method = "POST";
                request.ContentType = "application/json";
                request.Accept = "application/json";
                
                // Set custom authentication headers as per API requirements
                // Use Headers.Add() for HttpWebRequest (indexer may not work correctly)
                request.Headers.Add("username", API_USERNAME);
                request.Headers.Add("password", API_PASSWORD);
                
                // Log the request details for debugging
                logService.Info("EmpPEP.BusinessLayer", "CreateTrainingRequest", $"Making API call to: {API_URL}");
                logService.Info("EmpPEP.BusinessLayer", "CreateTrainingRequest", $"Request body: training_type={trainingType}, training_id={trainingId}, emp_id={empId}");
                
                // Prepare request body
                var requestBody = new
                {
                    training_type = trainingType,
                    training_id = trainingId,
                    emp_id = empId
                };

                string jsonRequestBody = JsonConvert.SerializeObject(requestBody);
                
                // Write request body
                byte[] requestData = Encoding.UTF8.GetBytes(jsonRequestBody);
                request.ContentLength = requestData.Length;
                
                using (Stream requestStream = request.GetRequestStream())
                {
                    requestStream.Write(requestData, 0, requestData.Length);
                }
                
                // Get response
                using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
                using (StreamReader reader = new StreamReader(response.GetResponseStream()))
                {
                    string responseContent = reader.ReadToEnd();
                    
                    // Deserialize response
                    var apiResponse = JsonConvert.DeserializeObject<TrainingRequestAPIResponse>(responseContent);
                    
                    return apiResponse;
                }
            }
            catch (WebException ex)
            {
                logService.Fatal("EmpPEP.BusinessLayer", "CreateTrainingRequest", $"WebException: {ex.Message}");
                
                // Try to read error response
                if (ex.Response != null)
                {
                    using (var errorResponse = (HttpWebResponse)ex.Response)
                    using (var reader = new StreamReader(errorResponse.GetResponseStream()))
                    {
                        string errorContent = reader.ReadToEnd();
                        logService.Fatal("EmpPEP.BusinessLayer", "CreateTrainingRequest", $"Error Response Status: {errorResponse.StatusCode}, Content: {errorContent}");
                        
                        // Try to deserialize error response
                        try
                        {
                            var errorApiResponse = JsonConvert.DeserializeObject<TrainingRequestAPIResponse>(errorContent);
                            if (errorApiResponse != null)
                            {
                                return errorApiResponse;
                            }
                        }
                        catch
                        {
                            // If deserialization fails, continue with manual check
                        }
                        
                        // Check if it's a duplicate request
                        if (errorContent.Contains("duplicate") || errorContent.Contains("already") || errorContent.Contains("Duplicate"))
                        {
                            return new TrainingRequestAPIResponse
                            {
                                success = false,
                                message = "Duplicate request",
                                isDuplicate = true
                            };
                        }
                        
                        // Check for 401 Unauthorized
                        if (errorResponse.StatusCode == HttpStatusCode.Unauthorized)
                        {
                            logService.Fatal("EmpPEP.BusinessLayer", "CreateTrainingRequest", $"401 Unauthorized - Auth Header used: {GetBasicAuthHeader().Substring(0, Math.Min(20, GetBasicAuthHeader().Length))}...");
                            return new TrainingRequestAPIResponse
                            {
                                success = false,
                                message = "Authentication failed. Please check credentials.",
                                isDuplicate = false
                            };
                        }
                    }
                }
                
                return new TrainingRequestAPIResponse
                {
                    success = false,
                    message = ex.Message,
                    isDuplicate = false
                };
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.BusinessLayer", "CreateTrainingRequest", $"Exception: {ex.Message}");
                return new TrainingRequestAPIResponse
                {
                    success = false,
                    message = ex.Message,
                    isDuplicate = false
                };
            }
        }

        /// <summary>
        /// Call external API to create batch training requests (for regular trainings with training_id != 0)
        /// </summary>
        /// <param name="trainingTypes">Comma-separated training types (e.g., "course,lp,certifications")</param>
        /// <param name="trainingIds">Comma-separated training IDs (e.g., "304,305,306") - must match trainingTypes order</param>
        /// <param name="empId">The employee ID to assign the training to</param>
        /// <returns>API response object</returns>
        public TrainingRequestAPIResponse CreateBatchTrainingRequest(string trainingTypes, string trainingIds, string empId)
        {
            try
            {
                // Use HttpWebRequest for better control over headers
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12 | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls;
                
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(API_URL);
                request.Method = "POST";
                request.ContentType = "application/json";
                request.Accept = "application/json";
                
                // Set custom authentication headers as per API requirements
                request.Headers.Add("username", API_USERNAME);
                request.Headers.Add("password", API_PASSWORD);
                
                // Log the request details for debugging
                logService.Info("EmpPEP.BusinessLayer", "CreateBatchTrainingRequest", $"Making batch API call to: {API_URL}");
                logService.Info("EmpPEP.BusinessLayer", "CreateBatchTrainingRequest", $"Request body: training_type={trainingTypes}, training_id={trainingIds}, emp_id={empId}");
                
                // Prepare request body with comma-separated values
                var requestBody = new
                {
                    training_type = trainingTypes,
                    training_id = trainingIds,
                    emp_id = empId
                };

                string jsonRequestBody = JsonConvert.SerializeObject(requestBody);
                
                // Write request body
                byte[] requestData = Encoding.UTF8.GetBytes(jsonRequestBody);
                request.ContentLength = requestData.Length;
                
                using (Stream requestStream = request.GetRequestStream())
                {
                    requestStream.Write(requestData, 0, requestData.Length);
                }
                
                // Get response
                using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
                using (StreamReader reader = new StreamReader(response.GetResponseStream()))
                {
                    string responseContent = reader.ReadToEnd();
                    
                    // Deserialize response
                    var apiResponse = JsonConvert.DeserializeObject<TrainingRequestAPIResponse>(responseContent);
                    
                    return apiResponse;
                }
            }
            catch (WebException ex)
            {
                logService.Fatal("EmpPEP.BusinessLayer", "CreateBatchTrainingRequest", $"WebException: {ex.Message}");
                
                // Try to read error response
                if (ex.Response != null)
                {
                    using (var errorResponse = (HttpWebResponse)ex.Response)
                    using (var reader = new StreamReader(errorResponse.GetResponseStream()))
                    {
                        string errorContent = reader.ReadToEnd();
                        logService.Fatal("EmpPEP.BusinessLayer", "CreateBatchTrainingRequest", $"Error Response Status: {errorResponse.StatusCode}, Content: {errorContent}");
                        
                        // Try to deserialize error response
                        try
                        {
                            var errorApiResponse = JsonConvert.DeserializeObject<TrainingRequestAPIResponse>(errorContent);
                            if (errorApiResponse != null)
                            {
                                return errorApiResponse;
                            }
                        }
                        catch
                        {
                            // If deserialization fails, continue with manual check
                        }
                        
                        // Check if it's a duplicate request
                        if (errorContent.Contains("duplicate") || errorContent.Contains("already") || errorContent.Contains("Duplicate"))
                        {
                            return new TrainingRequestAPIResponse
                            {
                                success = false,
                                message = "Duplicate request",
                                isDuplicate = true
                            };
                        }
                        
                        // Check for 401 Unauthorized
                        if (errorResponse.StatusCode == HttpStatusCode.Unauthorized)
                        {
                            return new TrainingRequestAPIResponse
                            {
                                success = false,
                                message = "Authentication failed. Please check credentials.",
                                isDuplicate = false
                            };
                        }
                    }
                }
                
                return new TrainingRequestAPIResponse
                {
                    success = false,
                    message = ex.Message,
                    isDuplicate = false
                };
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.BusinessLayer", "CreateBatchTrainingRequest", $"Exception: {ex.Message}");
                return new TrainingRequestAPIResponse
                {
                    success = false,
                    message = ex.Message,
                    isDuplicate = false
                };
            }
        }

        /// <summary>
        /// Call external API to create batch custom training requests (for trainings with training_id == 0)
        /// </summary>
        /// <param name="courseNames">Comma-separated course names (e.g., "Leadership Development,Data Privacy Training")</param>
        /// <param name="courseCategories">Comma-separated course categories (e.g., "Soft Skill,Compliance") - must match courseNames order</param>
        /// <param name="empId">The employee ID to assign the training to</param>
        /// <returns>API response object</returns>
        public TrainingRequestAPIResponse CreateBatchCustomTrainingRequest(string courseNames, string courseCategories, string empId)
        {
            try
            {
                // Use HttpWebRequest for better control over headers
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12 | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls;
                
                // Use custom API URL for custom trainings
                string customAPI_URL = ConfigurationManager.AppSettings["TrainingRequestAPI:CustomURL"] ?? "https://preprod-iep.infogain.com/wp-json/v01/assign-custom-training-request";
                
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(customAPI_URL);
                request.Method = "POST";
                request.ContentType = "application/json";
                request.Accept = "application/json";
                
                // Set custom authentication headers as per API requirements (same as regular API)
                request.Headers.Add("username", API_USERNAME);
                request.Headers.Add("password", API_PASSWORD);
                
                // Log the request details for debugging
                logService.Info("EmpPEP.BusinessLayer", "CreateBatchCustomTrainingRequest", $"Making batch custom API call to: {customAPI_URL}");
                logService.Info("EmpPEP.BusinessLayer", "CreateBatchCustomTrainingRequest", $"Request body: course_name={courseNames}, course_category={courseCategories}, emp_id={empId}");
                
                // Prepare request body with course_name and course_category
                var requestBody = new
                {
                    emp_id = empId,
                    course_name = courseNames,
                    course_category = courseCategories
                };

                string jsonRequestBody = JsonConvert.SerializeObject(requestBody);
                
                // Write request body
                byte[] requestData = Encoding.UTF8.GetBytes(jsonRequestBody);
                request.ContentLength = requestData.Length;
                
                using (Stream requestStream = request.GetRequestStream())
                {
                    requestStream.Write(requestData, 0, requestData.Length);
                }
                
                // Get response
                using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
                using (StreamReader reader = new StreamReader(response.GetResponseStream()))
                {
                    string responseContent = reader.ReadToEnd();
                    
                    // Deserialize response
                    var apiResponse = JsonConvert.DeserializeObject<TrainingRequestAPIResponse>(responseContent);
                    
                    return apiResponse;
                }
            }
            catch (WebException ex)
            {
                logService.Fatal("EmpPEP.BusinessLayer", "CreateBatchCustomTrainingRequest", $"WebException: {ex.Message}");
                
                // Try to read error response
                if (ex.Response != null)
                {
                    using (var errorResponse = (HttpWebResponse)ex.Response)
                    using (var reader = new StreamReader(errorResponse.GetResponseStream()))
                    {
                        string errorContent = reader.ReadToEnd();
                        logService.Fatal("EmpPEP.BusinessLayer", "CreateBatchCustomTrainingRequest", $"Error Response Status: {errorResponse.StatusCode}, Content: {errorContent}");
                        
                        // Try to deserialize error response
                        try
                        {
                            var errorApiResponse = JsonConvert.DeserializeObject<TrainingRequestAPIResponse>(errorContent);
                            if (errorApiResponse != null)
                            {
                                return errorApiResponse;
                            }
                        }
                        catch
                        {
                            // If deserialization fails, continue with manual check
                        }
                        
                        // Check if it's a duplicate request
                        if (errorContent.Contains("duplicate") || errorContent.Contains("already") || errorContent.Contains("Duplicate"))
                        {
                            return new TrainingRequestAPIResponse
                            {
                                success = false,
                                message = "Duplicate request",
                                isDuplicate = true
                            };
                        }
                        
                        // Check for 401 Unauthorized
                        if (errorResponse.StatusCode == HttpStatusCode.Unauthorized)
                        {
                            return new TrainingRequestAPIResponse
                            {
                                success = false,
                                message = "Authentication failed. Please check credentials.",
                                isDuplicate = false
                            };
                        }
                    }
                }
                
                return new TrainingRequestAPIResponse
                {
                    success = false,
                    message = ex.Message,
                    isDuplicate = false
                };
            }
            catch (Exception ex)
            {
                logService.Fatal("EmpPEP.BusinessLayer", "CreateBatchCustomTrainingRequest", $"Exception: {ex.Message}");
                return new TrainingRequestAPIResponse
                {
                    success = false,
                    message = ex.Message,
                    isDuplicate = false
                };
            }
        }

        /// <summary>
        /// Get Basic Authentication header
        /// </summary>
        private string GetBasicAuthHeader()
        {
            // Format: username:password
            string credentials = $"{API_USERNAME}:{API_PASSWORD}";
            
            // Convert to bytes using UTF8 encoding
            byte[] credentialsBytes = Encoding.UTF8.GetBytes(credentials);
            
            // Encode to Base64
            string base64Credentials = Convert.ToBase64String(credentialsBytes);
            
            // Return in format: "Basic base64encodedstring" (note the space after "Basic")
            string authHeader = $"Basic {base64Credentials}";
            
            // Verify the encoding (for debugging)
            // Expected: "iepapi:Pas@123!" should encode to "aWVwYXBpOlBhc0AxMjMh"
            // You can verify at: https://www.base64encode.org/
            logService.Info("EmpPEP.BusinessLayer", "GetBasicAuthHeader", $"Generated Basic Auth header (length: {authHeader.Length}, base64 part length: {base64Credentials.Length})");
            
            return authHeader;
        }
    }
}

