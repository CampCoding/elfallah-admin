import React, { useState } from "react";
import { Modal, Button } from "antd";
import toast from "react-hot-toast";
import axios from "axios";
import { baseUrl } from "../../../utils/base_url";

const emore_user = JSON.parse(localStorage.getItem("emore_user"));

const DeleteVideo = ({ open, setOpen, video, getVideos }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!video) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${baseUrl}/admin/videos/remove_assign_video_unit.php`,
        {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
          unit_video_id: video.unit_video_id,
        }
      );

      if (response.data.status === "success") {
        toast.success("تم حذف الفيديو بنجاح");

        setOpen(false);
        getVideos();
      } else {
        toast.error(response.data.message || "حدث خطأ أثناء حذف الفيديو");
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("حدث خطأ أثناء حذف الفيديو");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="حذف الفيديو"
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      destroyOnClose
    >
      <p>هل أنت متأكد من حذف الفيديو "{video?.new_title}"؟</p>
      <p className="text-red-500">هذا الإجراء لا يمكن التراجع عنه.</p>

      <div className="flex justify-end mt-4">
        <Button type="default" onClick={() => setOpen(false)} className="ml-2">
          إلغاء
        </Button>
        <Button type="primary" danger onClick={handleDelete} loading={loading}>
          حذف
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteVideo;
