import React, { useState } from "react";
import { Modal, Button } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const DeleteInteractiveQuestion = ({
  open,
  setOpen,
  question,
  getInteractiveQuestions,
  handleDelete,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirmDelete = async () => {
    if (!question) return;

    setLoading(true);
    try {
      const success = await handleDelete(question.interactive_question_id);

      if (success) {
        getInteractiveQuestions(); // Refresh the data
        setOpen(false); // Close the modal
      }
    } catch (error) {
      console.error("Error deleting question:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Modal
      title="تأكيد الحذف"
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          إلغاء
        </Button>,
        <Button
          key="delete"
          type="primary"
          danger
          loading={loading}
          onClick={handleConfirmDelete}
        >
          حذف
        </Button>,
      ]}
    >
      <div className="flex items-center gap-3">
        <ExclamationCircleOutlined className="text-red-500 text-xl" />
        <div>
          <p className="text-lg font-medium mb-2">
            هل أنت متأكد من حذف هذا السؤال التفاعلي؟
          </p>
          <p className="text-gray-600">
            السؤال:{" "}
            <span className="font-medium">{question?.question_text}</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            لا يمكن التراجع عن هذا الإجراء بعد الحذف
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteInteractiveQuestion;
