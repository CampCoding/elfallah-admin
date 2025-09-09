import React, { useState } from "react";
import { Button, Modal } from "antd";
import toast from "react-hot-toast";

// Simulate API responses
const mockAPI = {
  deleteUnit: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const units = localStorage.getItem("units")
          ? JSON.parse(localStorage.getItem("units"))
          : [];

        const updatedUnits = units.filter((u) => u.id !== id);
        localStorage.setItem("units", JSON.stringify(updatedUnits));

        resolve({
          data: {
            status: "success",
            message: "تم حذف الوحدة بنجاح",
          },
        });
      }, 500);
    });
  },
};

const DeleteUnit = ({ open, setOpen, unit, getUnits }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!unit) return;

    setDeleting(true);
    try {
      // Simulated API call
      const response = await mockAPI.deleteUnit(unit.id);

      if (response.data.status === "success") {
        toast.success("تم حذف الوحدة بنجاح");
        setOpen(false);
        getUnits();
      } else {
        toast.error("فشل حذف الوحدة");
      }
    } catch (error) {
      console.error("Error deleting unit:", error);
      toast.error("حدث خطأ أثناء حذف الوحدة");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      title="حذف الوحدة"
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
      {unit && <p>هل أنت متأكد من حذف الوحدة "{unit.name}"؟</p>}
    </Modal>
  );
};

export default DeleteUnit;

