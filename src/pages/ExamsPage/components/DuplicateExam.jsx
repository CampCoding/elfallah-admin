import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Select, Input } from "antd";
import toast from "react-hot-toast";
import { baseUrl } from "../../../utils/base_url";
import axios from "axios";
import useCoursesPage from "./../../CoursesPage/useCoursesPage";

const emore_user = JSON.parse(localStorage.getItem("emore_user"));

const DuplicateExam = ({ open, setOpen, exam, getExams }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { data: courses, getCourses } = useCoursesPage();
  const [selectedCourses, setSelectedCourses] = useState([]);

  // Fetch courses when modal opens
  useEffect(() => {
    if (open) {
      getCourses();
    }
  }, [open]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setSelectedCourses([]);
    }
  }, [open, form]);

  // Handle form submission
  const handleSubmit = async (values) => {
    if (!exam) return;

    setLoading(true);
    try {
      // Format courses data in the required format
      const coursesData = selectedCourses.join("***matary***");

      const response = await axios.post(
        `${baseUrl}/admin/Exams/assign_exam_to_course.php`,
        {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
          exam_id: exam.exam_id,
          courses_data: coursesData,
          timer: values.timer,
        }
      );

      if (response.data.status === "success") {
        toast.success("تم تعيين الاختبار للدورات بنجاح");
        handleModalClose();
        getExams();
      } else {
        toast.error(response.data.message || "حدث خطأ أثناء تعيين الاختبار");
      }
    } catch (error) {
      console.error("Error assigning exam:", error);
      toast.error("حدث خطأ أثناء تعيين الاختبار");
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setOpen(false);
    form.resetFields();
    setSelectedCourses([]);
  };

  return (
    <Modal
      centered
      title="تعيين الاختبار للدورات"
      open={open}
      onCancel={handleModalClose}
      footer={null}
      destroyOnClose
      width={600}
    >
      <p className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        سيتم تعيين الاختبار "<strong>{exam?.exam_name}</strong>" إلى الدورات
        المحددة.
      </p>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="اختر الدورات"
          name="courses"
          rules={[
            { required: true, message: "الرجاء اختيار دورة واحدة على الأقل" },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="اختر الدورات"
            virtual={false}
            allowClear
            onChange={(values) => setSelectedCourses(values)}
            showSearch
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            options={courses.map((course) => ({
              label: course.course_name,
              value: course.course_id,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="مدة الاختبار (بالدقائق)"
          name="timer"
          rules={[
            { required: true, message: "الرجاء إدخال مدة الاختبار" },
            {
              type: "number",
              min: 1,
              transform: (value) => Number(value),
              message: "يجب أن تكون المدة أكبر من صفر",
            },
          ]}
        >
          <Input type="number" placeholder="مثال: 60" />
        </Form.Item>

        <Form.Item className="mb-0 flex justify-end">
          <div className="space-x-2">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="bg-goldenOrange hover:!bg-darkgold"
            >
              {loading ? "جاري التعيين..." : "تعيين الاختبار"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DuplicateExam;
