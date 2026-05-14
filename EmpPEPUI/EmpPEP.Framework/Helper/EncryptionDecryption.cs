using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.IO;
using System.Web;

namespace EmpPEP.Framework.Helper
{
    public static class EncryptionDecryption
    {

        public static string Encrypt(string clearText)
        {
            string EncryptionKey = "abc123";
            byte[] clearBytes = Encoding.Unicode.GetBytes(clearText);
            using (Aes encryptor = Aes.Create())
            {
                Rfc2898DeriveBytes pdb = new Rfc2898DeriveBytes(EncryptionKey, new byte[] { 0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76 });
                encryptor.Key = pdb.GetBytes(32);
                encryptor.IV = pdb.GetBytes(16);
                using (MemoryStream ms = new MemoryStream())
                {
                    using (CryptoStream cs = new CryptoStream(ms, encryptor.CreateEncryptor(), CryptoStreamMode.Write))
                    {
                        cs.Write(clearBytes, 0, clearBytes.Length);
                        cs.Close();
                    }
                    clearText = Convert.ToBase64String(ms.ToArray());
                }
            }
            return clearText;
        }
        public static string Decrypt(string cipherText)
        {
            string EncryptionKey = "abc123";
            cipherText = cipherText.Replace(" ", "+");
            byte[] cipherBytes = Convert.FromBase64String(cipherText);
            using (Aes encryptor = Aes.Create())
            {
                Rfc2898DeriveBytes pdb = new Rfc2898DeriveBytes(EncryptionKey, new byte[] { 0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76 });
                encryptor.Key = pdb.GetBytes(32);
                encryptor.IV = pdb.GetBytes(16);
                using (MemoryStream ms = new MemoryStream())
                {
                    using (CryptoStream cs = new CryptoStream(ms, encryptor.CreateDecryptor(), CryptoStreamMode.Write))
                    {
                        cs.Write(cipherBytes, 0, cipherBytes.Length);
                        cs.Close();
                    }
                    cipherText = Encoding.Unicode.GetString(ms.ToArray());
                }
            }
            return cipherText;
        }

        /// <summary>
        /// Encrypts a file stream and saves it to the specified output file path
        /// </summary>
        /// <param name="inputStream">The input stream containing the file data</param>
        /// <param name="outputFile">The full path where the encrypted file should be saved</param>
        /// <param name="key">The AES encryption key (32 bytes)</param>
        /// <param name="iv">The AES initialization vector (16 bytes)</param>
        public static void EncryptFile(Stream inputStream, string outputFile, byte[] key, byte[] iv)
        {
            try
            {
                // Ensure the directory exists
                string outputDirectory = Path.GetDirectoryName(outputFile);
                if (!Directory.Exists(outputDirectory))
                {
                    Directory.CreateDirectory(outputDirectory);
                }

                using (Aes aes = Aes.Create())
                {
                    aes.Key = key;
                    aes.IV = iv;

                    using (FileStream fileStream = new FileStream(outputFile, FileMode.Create))
                    using (CryptoStream cryptoStream = new CryptoStream(fileStream, aes.CreateEncryptor(), CryptoStreamMode.Write))
                    {
                        inputStream.Position = 0; // Ensure stream is at start
                        inputStream.CopyTo(cryptoStream);
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error encrypting file: " + ex.Message, ex);
            }
        }

        /// <summary>
        /// Decrypts a file and returns the decrypted content as a byte array
        /// </summary>
        /// <param name="inputFile">The full path to the encrypted file</param>
        /// <param name="key">The AES encryption key (32 bytes)</param>
        /// <param name="iv">The AES initialization vector (16 bytes)</param>
        /// <returns>Decrypted file content as byte array</returns>
        public static byte[] DecryptFileInMemory(string inputFile, byte[] key, byte[] iv)
        {
            using (Aes aes = Aes.Create())
            {
                aes.Key = key;
                aes.IV = iv;

                using (MemoryStream memoryStream = new MemoryStream())
                {
                    using (CryptoStream cryptoStream = new CryptoStream(memoryStream, aes.CreateDecryptor(), CryptoStreamMode.Write))
                    using (FileStream inputStream = new FileStream(inputFile, FileMode.Open, FileAccess.Read))
                    {
                        // Copy the encrypted file's content to the crypto stream
                        inputStream.CopyTo(cryptoStream);
                    }
                    // Return the decrypted binary content
                    return memoryStream.ToArray();
                }
            }
        }
    }
}

