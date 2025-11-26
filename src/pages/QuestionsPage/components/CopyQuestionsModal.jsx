import React, { useEffect, useState } from "react";
import { Modal, Form, Select, Button, Alert, Spin } from "antd";
import axios from "axios";
import toast from "react-hot-toast";
import { baseUrl } from "../../../utils/base_url";

const emore_user = JSON.parse(localStorage.getItem("emore_user"));

const CopyQuestionsModal = ({
  open,
  onClose,
  selectedQuestionIds = [],
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [courses, setCourses] = useState([]);
  const [units, setUnits] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      form.resetFields();
      setUnits([]);
      fetchCourses();
    }
  }, [open]);

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const response = await axios.post(
        `${baseUrl}/admin/courses/select_courses.php`,
        {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
        }
      );

      if (response.data.status === "success") {
        setCourses(response.data.message || []);
      } else {
        toast.error(response.data.message || "فشل تحميل الدورات");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("حدث خطأ أثناء تحميل الدورات");
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchUnits = async (courseId) => {
    if (!courseId) return;
    setLoadingUnits(true);
    try {
      const response = await axios.post(
        `${baseUrl}/admin/courses/select_course_units.php`,
        {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
          course_id: courseId,
        }
      );

      if (response.data.status === "success") {
        setUnits(response.data.message || []);
      } else {
        toast.error(response.data.message || "فشل تحميل الوحدات");
      }
    } catch (error) {
      console.error("Error fetching units:", error);
      toast.error("حدث خطأ أثناء تحميل الوحدات");
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleCourseChange = (courseId) => {
    form.setFieldValue("new_unit_id", undefined);
    setUnits([]);
    if (courseId) {
      fetchUnits(courseId);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const response = await axios.post(
        `${baseUrl}/admin/Exams/copy_question.php`,
        {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
          question_ids: selectedQuestionIds,
          new_course_id: values.new_course_id,
          new_unit_id: values.new_unit_id,
        }
      );

      const payload = response.data;
      if (Array.isArray(payload)) {
        const failedItem = payload.find((item) => item.status !== "success");
        if (failedItem) {
          toast.error(failedItem.message || "فشل نسخ بعض الأسئلة");
        } else {
          toast.success("تم نسخ جميع الأسئلة بنجاح");
          onClose();
          onSuccess?.();
        }
      } else if (payload?.status === "success") {
        toast.success(payload.message || "تم نسخ الأسئلة بنجاح");
        onClose();
        onSuccess?.();
      } else {
        toast.error(payload?.message || "فشل نسخ الأسئلة");
      }
    } catch (error) {
      if (error.errorFields) {
        toast.error("الرجاء اختيار الدورة والوحدة");
      } else {
        console.error("Error copying questions:", error);
        toast.error("حدث خطأ أثناء نسخ الأسئلة");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="نسخ الأسئلة المختارة"
      open={open}
      onCancel={() => {
        if (!submitting) {
          onClose();
        }
      }}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={submitting}>
          إلغاء
        </Button>,
        <Button
          key="copy"
          type="primary"
          loading={submitting}
          onClick={handleSubmit}
          disabled={loadingCourses || loadingUnits || submitting}
        >
          نسخ
        </Button>,
      ]}
      destroyOnClose
    >
      <Alert
        type="info"
        showIcon
        className="mb-4"
        message="سيتم إنشاء نسخة من الأسئلة المحددة في الدورة والوحدة الجديدة."
        description={`عدد الأسئلة المحددة: ${selectedQuestionIds.length}`}
      />

      <Form form={form} layout="vertical">
        <Form.Item
          name="new_course_id"
          label="اختر الدورة"
          rules={[{ required: true, message: "الرجاء اختيار الدورة" }]}
        >
          <Select
            showSearch
            placeholder="اختر الدورة"
            loading={loadingCourses}
            disabled={loadingCourses}
            filterOption={(input, option) =>
              option?.label?.toLowerCase().includes(input.toLowerCase())
            }
            options={courses.map((course) => ({
              label: course.course_name,
              value: course.course_id,
            }))}
            onChange={handleCourseChange}
          />
        </Form.Item>

        <Form.Item
          name="new_unit_id"
          label="اختر الوحدة"
          rules={[{ required: true, message: "الرجاء اختيار الوحدة" }]}
        >
          <Select
            showSearch
            placeholder="اختر الوحدة"
            loading={loadingUnits}
            disabled={!form.getFieldValue("new_course_id") || loadingUnits}
            filterOption={(input, option) =>
              option?.label?.toLowerCase().includes(input.toLowerCase())
            }
            notFoundContent={
              loadingUnits ? (
                <div className="py-2 text-center">
                  <Spin size="small" />
                </div>
              ) : null
            }
            options={units.map((unit) => ({
              label: unit.unit_name,
              value: unit.unit_id,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CopyQuestionsModal;

