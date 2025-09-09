import React, { useState } from "react";
import { Modal, Button } from "antd";
import toast from "react-hot-toast";

const DeletePDF = ({ open, setOpen, pdf, getPDFs }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!pdf) return;

    setLoading(true);
    try {
      // Delete the PDF from localStorage
      const pdfs = localStorage.getItem("pdfs")
        ? JSON.parse(localStorage.getItem("pdfs"))
        : [];

      const updatedPDFs = pdfs.filter((p) => p.id !== pdf.id);
      localStorage.setItem("pdfs", JSON.stringify(updatedPDFs));

      // Update videos with pdfs array
      const videos = localStorage.getItem("videos")
        ? JSON.parse(localStorage.getItem("videos"))
        : [];

      // Group PDFs by videoId
      const pdfsByVideo = {};
      updatedPDFs.forEach((pdf) => {
        if (!pdfsByVideo[pdf.videoId]) {
          pdfsByVideo[pdf.videoId] = [];
        }
        pdfsByVideo[pdf.videoId].push(pdf);
      });

      // Update videos with pdfs array
      const updatedVideos = videos.map((video) => ({
        ...video,
        pdfs: pdfsByVideo[video.id] || [],
      }));

      localStorage.setItem("videos", JSON.stringify(updatedVideos));

      // Show success message
      toast.success("تم حذف المذكرة بنجاح");

      // Close modal and refresh data
      setOpen(false);
      getPDFs();
    } catch (error) {
      console.error("Error deleting PDF:", error);
      toast.error("حدث خطأ أثناء حذف المذكرة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="حذف المذكرة"
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      destroyOnClose
    >
      <p>هل أنت متأكد من حذف المذكرة "{pdf?.name}"؟</p>
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

export default DeletePDF;
