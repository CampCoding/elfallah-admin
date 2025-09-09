import React, { useState } from "react";
import { Button, Modal } from "antd";
import toast from "react-hot-toast";

// Simulate API responses
const mockAPI = {
  deleteExam: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const exams = localStorage.getItem("exams")
          ? JSON.parse(localStorage.getItem("exams"))
          : [];

        const updatedExams = exams.filter((e) => e.exam_id !== id);
        localStorage.setItem("exams", JSON.stringify(updatedExams));

        resolve({
          data: {
            status: "success",
            message: "تم حذف الاختبار بنجاح",
          },
        });
      }, 500);
    });
  },
};

const DeleteExam = ({ open, setOpen, exam, getExams }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!exam) return;

    setDeleting(true);
    try {
      // Simulated API call
      const response = await mockAPI.deleteExam(exam.exam_id);

      if (response.data.status === "success") {
        toast.success("تم حذف الاختبار بنجاح");
        setOpen(false);
        getExams();
      } else {
        toast.error("فشل حذف الاختبار");
      }
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast.error("حدث خطأ أثناء حذف الاختبار");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      title="حذف الاختبار"
      open={open}
      onCancel={() => setOpen(false)}
      footer={[
        <Button key="back" onClick={() => setOpen(false)}>
          إلغاء
        </Button>,
        <Button
          key="submit"
          type="primary"
          danger
          loading={deleting}
          onClick={handleDelete}
        >
          حذف
        </Button>,
      ]}
    >
      {exam && <p>هل أنت متأكد من حذف الاختبار "{exam.exam_name}"؟</p>}
    </Modal>
  );
};

export default DeleteExam;
