// hooks/UploadPdf.js
import axios from "axios";
import { baseUrl } from "../utils/base_url";

const emore_user = JSON.parse(localStorage.getItem("emore_user"));

const uploadPdf = async (file, options = {}) => {
  const { onProgress, onSuccess, onError } = options;

  if (!file) {
    throw new Error("No file provided");
  }

  // Validate file type
  if (file.type !== "application/pdf") {
    const error = new Error("Invalid file type. Only PDF files are allowed.");
    if (onError) onError(error);
    throw error;
  }

  // Validate file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    const error = new Error("File size exceeds 10MB limit.");
    if (onError) onError(error);
    throw error;
  }

  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post(
      `${baseUrl}/admin/pdf_uploader.php`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );

    if (response.status == 200) {
      const fileUrl = response.data;
      if (onSuccess) onSuccess(fileUrl);
      return fileUrl;
    } else {
      const error = new Error(response.data || "Upload failed");
      if (onError) onError(error);
      throw error;
    }
  } catch (error) {
    console.error("PDF upload error:", error);

    let errorMessage = "Failed to upload PDF file";

    if (error.response) {
      // Server responded with error
      errorMessage = error.response.data || errorMessage;
    } else if (error.request) {
      // Network error
      errorMessage = "Network error. Please check your connection.";
    } else {
      // Other error
      errorMessage = error.message || errorMessage;
    }

    const uploadError = new Error(errorMessage);
    if (onError) onError(uploadError);
    throw uploadError;
  }
};

export default uploadPdf;
