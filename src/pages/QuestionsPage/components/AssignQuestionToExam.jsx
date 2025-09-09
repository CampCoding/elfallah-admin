import React, { useState, useEffect } from "react";
import { Modal, Form, Select, Button, Spin, Alert } from "antd";
import { baseUrl } from "../../../utils/base_url";
import axios from "axios";
import toast from "react-hot-toast";

const emore_user = JSON.parse(localStorage.getItem("emore_user"));

const AssignQuestionToExam = ({ open, onClose, questionId, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState([]);
  const [fetchingExams, setFetchingExams] = useState(false);

  // Fetch available exams when modal opens
  useEffect(() => {
    if (open) {
      fetchExams();
    }
  }, [open]);

  const fetchExams = async () => {
    setFetchingExams(true);
    try {
      const response = await axios.post(
        `${baseUrl}/admin/Exams/select_all_exams.php`,
        {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
        }
      );

      if (response.data.status === "success") {
        setExams(response.data.message || []);
      } else {
        toast.error("فشل في تحميل الاختبارات");
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast.error("حدث خطأ أثناء تحميل الاختبارات");
    } finally {
      setFetchingExams(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const response = await axios.post(
        `${baseUrl}/admin/Exams/assign_ques_to_exam.php`,
        {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
          exam_id: values.exam_id,
          question_id: questionId,
        }
      );

      if (response.data.status === "success") {
        toast.success("تم تعيين السؤال للاختبار بنجاح");
        form.resetFields();
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(response.data.message || "فشل في تعيين السؤال للاختبار");
      }
    } catch (error) {
      console.error("Error assigning question to exam:", error);
      toast.error("حدث خطأ أثناء تعيين السؤال للاختبار");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="تعيين السؤال للاختبار"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          إلغاء
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          disabled={fetchingExams}
        >
          تعيين
        </Button>,
      ]}
    >
      <Alert
        message="تعيين السؤال للاختبار"
        description="سيتم تعيين هذا السؤال للاختبار المحدد"
        type="info"
        showIcon
        className="mb-4"
      />

      <Form form={form} layout="vertical">
        <Form.Item
          name="exam_id"
          label="اختر الاختبار"
          rules={[{ required: true, message: "الرجاء اختيار اختبار" }]}
        >
          <Select
            virtual={false}
            placeholder="اختر الاختبار"
            loading={fetchingExams}
            disabled={fetchingExams}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
            options={exams.map((exam) => ({
              label: exam.exam_name,
              value: exam.exam_id,
            }))}
          />
        </Form.Item>
      </Form>

      {fetchingExams && (
        <div className="flex justify-center my-4">
          <Spin tip="جاري تحميل الاختبارات..." />
        </div>
      )}
    </Modal>
  );
};

export default AssignQuestionToExam;
