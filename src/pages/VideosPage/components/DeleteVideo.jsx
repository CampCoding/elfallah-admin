import React, { useState } from "react";
import { Modal, Button } from "antd";
import toast from "react-hot-toast";

const DeleteVideo = ({ open, setOpen, video, getVideos }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!video) return;

    setLoading(true);
    try {
      // Delete the video from localStorage
      const videos = localStorage.getItem("videos")
        ? JSON.parse(localStorage.getItem("videos"))
        : [];

      const updatedVideos = videos.filter((v) => v.id !== video.id);
      localStorage.setItem("videos", JSON.stringify(updatedVideos));

      // Show success message
      toast.success("تم حذف الفيديو بنجاح");

      // Close modal and refresh data
      setOpen(false);
      getVideos();
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
      <p>هل أنت متأكد من حذف الفيديو "{video?.name}"؟</p>
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
