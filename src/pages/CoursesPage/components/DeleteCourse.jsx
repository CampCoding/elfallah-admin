import React, { useState } from "react";
import { Button, Modal } from "antd";
import toast from "react-hot-toast";

// Simulate API responses
const mockAPI = {
  deleteCourse: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const courses = localStorage.getItem("courses")
          ? JSON.parse(localStorage.getItem("courses"))
          : [];

        const updatedCourses = courses.filter((c) => c.id !== id);
        localStorage.setItem("courses", JSON.stringify(updatedCourses));

        resolve({
          data: {
            status: "success",
            message: "تم حذف الدورة بنجاح",
          },
        });
      }, 500);
    });
  },
};

const DeleteCourse = ({ open, setOpen, course, getCourses }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!course) return;

    setDeleting(true);
    try {
      // Simulated API call
      const response = await mockAPI.deleteCourse(course.id);

      if (response.data.status === "success") {
        toast.success("تم حذف الدورة بنجاح");
        setOpen(false);
        getCourses();
      } else {
        toast.error("فشل حذف الدورة");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("حدث خطأ أثناء حذف الدورة");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      title="حذف الدورة"
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
      {course && <p>هل أنت متأكد من حذف الدورة "{course.name}"؟</p>}
    </Modal>
  );
};

export default DeleteCourse;
