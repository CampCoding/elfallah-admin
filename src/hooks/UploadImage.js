import axios from "axios";
import { baseUrl } from "../utils/base_url";

const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const res = await axios.post(
      `${baseUrl}/admin/image_uploader.php`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (res.status === 200 && res.data) {
      return res.data;
    } else {
      console.error("Upload failed:", res.data);
      return null;
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};

export default uploadImage;
