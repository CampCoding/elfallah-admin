import React, { useState } from "react";
import { Modal, Typography, Button } from "antd";
import { AlertTriangle } from "lucide-react";
import axios from "axios";
import { baseUrl } from "../../../utils/base_url";
import toast from "react-hot-toast";

const { Title, Text } = Typography;

const emore_user = JSON.parse(localStorage.getItem("emore_user"));

const DeleteQuestion = ({
  open,
  setOpen,

  questionId,
  getQuestions,
}) => {
  const [loading, setLoading] = useState(false);
  const API = {
    deleteQuestion: (questionId) => {
      setLoading(true);
      return axios
        .post(`${baseUrl}/admin/Exams/delete_question.php`, {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
          question_id: questionId,
        })
        .then((response) => {
          return {
            data: {
              status: "success",
              message: response.data.message || "تم حذف السؤال بنجاح",
            },
          };
        })
        .catch((error) => {
          console.error("Error deleting question:", error);
          return {
            data: {
              status: "error",
              message: error.response ? error.response.data : error.message,
            },
          };
        })
        .finally(() => {
          setLoading(false);
        });
    },
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await API.deleteQuestion(questionId);
      toast.success(res.data.message);
      setOpen(false);
      getQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-red-500" size={24} />
          <Title level={4} className="!m-0">
            حذف السؤال
          </Title>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      centered
    >
      <div className="py-4">
        <Text>
          هل أنت متأكد من رغبتك في حذف هذا السؤال؟ لا يمكن التراجع عن هذا
          الإجراء.
        </Text>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={handleCancel}>إلغاء</Button>
          <Button
            type="primary"
            danger
            loading={loading}
            onClick={handleDelete}
          >
            حذف
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteQuestion;
