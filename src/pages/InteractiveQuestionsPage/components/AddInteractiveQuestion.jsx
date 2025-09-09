import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  message,
  Spin,
  Drawer,
  Button,
} from "antd";
import axios from "axios";
import useCoursesPage from "../../CoursesPage/useCoursesPage";
import { baseUrl } from "../../../utils/base_url";

const { Option } = Select;

const emore_user = JSON.parse(localStorage.getItem("emore_user"));

const AddInteractiveQuestion = ({
  open,
  setOpen,
  videoId,
  getInteractiveQuestions,
  handleAdd,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [units, setUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [unitId, setUnitId] = useState("");

  const { data: courses, getCourses } = useCoursesPage();

  // Fetch courses when modal opens
  useEffect(() => {
    if (open) {
      getCourses();
    }
  }, [open]);

  // Function to get units based on course selection
  const getUnits = async (selectedCourseId) => {
    if (!selectedCourseId) {
      setUnits([]);
      return;
    }

    setUnitsLoading(true);
    try {
      const response = await axios.post(
        `${baseUrl}/admin/courses/select_course_units.php`,
        {
          course_id: selectedCourseId,
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
        }
      );

      if (response.data.status === "success") {
        setUnits(response.data.message || []);
      } else {
        setUnits([]);
        message.error("فشل في جلب الوحدات");
      }
    } catch (error) {
      console.error("Error fetching units:", error);
      message.error("حدث خطأ في جلب الوحدات");
      setUnits([]);
    } finally {
      setUnitsLoading(false);
    }
  };

  // Fetch questions when unitId and courseId are available
  useEffect(() => {
    if (unitId && courseId) {
      fetchQuestions();
    } else {
      setQuestions([]);
    }
  }, [unitId, courseId]);

  const fetchQuestions = async () => {
    if (!unitId || !courseId) return;

    setQuestionsLoading(true);
    try {
      const response = await axios.post(
        `${baseUrl}/admin/Exams/select_questions.php`,
        {
          unit_id: unitId,
          course_id: courseId,
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
        }
      );

      if (response.data.status === "success") {
        setQuestions(response.data.message || []);
      } else {
        setQuestions([]);
        message.error("فشل في جلب الأسئلة");
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      message.error("حدث خطأ في جلب الأسئلة");
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  };

  // Handle course selection
  const handleCourseChange = (value) => {
    setCourseId(value);
    setUnitId("");
    setUnits([]);
    setQuestions([]);

    // Reset form fields
    form.setFieldsValue({
      unit_id: undefined,
      question_id: undefined,
      question_text: "",
      question_type: undefined,
    });
  };

  useEffect(() => {
    if (courseId) {
      getUnits(+courseId);
    }
  }, [courseId]);

  // Handle unit selection
  const handleUnitChange = (value) => {
    setUnitId(value);
    setQuestions([]); // Clear questions

    // Reset question-related form fields
    form.setFieldsValue({
      question_id: undefined,
      question_text: "",
      question_type: undefined,
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const questionData = {
        ...values,
        active: values.active ? "yes" : "no",
        video_id: videoId,
        course_id: courseId,
        unit_id: unitId,
      };

      const success = await handleAdd(questionData);

      if (success) {
        form.resetFields();
        setCourseId("");
        setUnitId("");
        setUnits([]);
        setQuestions([]);
        getInteractiveQuestions(); // Refresh the data
        setOpen(false); // Close the modal
      }
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    form.resetFields();
    setCourseId("");
    setUnitId("");
    setUnits([]);
    setQuestions([]);
    setOpen(false);
  };

  // Handle question selection change
  const handleQuestionSelect = (value, option) => {
    const selectedQuestion = questions.find((q) => q.id === value);

    if (selectedQuestion) {
      form.setFieldsValue({
        question_text: selectedQuestion.question_text || selectedQuestion.title,
      });

      if (selectedQuestion.type) {
        form.setFieldsValue({
          question_type: selectedQuestion.type,
        });
      }
    }
  };

  // Custom filter function for the select search
  const filterOption = (input, option) => {
    return option.children.toLowerCase().includes(input.toLowerCase());
  };

  return (
    <Drawer
      placement="left"
      title="إضافة سؤال تفاعلي جديد"
      open={open}
      onClose={handleModalCancel}
      width={450}
      footer={
        <Button
          onClick={handleSubmit}
          className="mt-auto"
          htmlType="submit"
          type="primary"
          block
          loading={loading}
        >
          {loading ? "جاري الإضافة..." : "إضافة"}
        </Button>
      }
    >
      <Form form={form} layout="vertical" name="addInteractiveQuestion">
        {/* Course Selection */}
        <Form.Item
          name="course_id"
          label="اختر الكورس"
          rules={[{ required: true, message: "الرجاء اختيار الكورس" }]}
        >
          <Select
            virtual={false}
            placeholder="اختر الكورس"
            allowClear
            showSearch
            filterOption={filterOption}
            onChange={handleCourseChange}
            value={courseId}
          >
            {courses?.map((course) => (
              <Option key={course.course_id} value={course.course_id}>
                {course.course_name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Unit Selection */}
        <Form.Item
          name="unit_id"
          label="اختر الوحدة"
          rules={[{ required: true, message: "الرجاء اختيار الوحدة" }]}
        >
          <Select
            virtual={false}
            placeholder="اختر الوحدة"
            allowClear
            showSearch
            filterOption={filterOption}
            onChange={handleUnitChange}
            value={unitId}
            disabled={!courseId}
            loading={unitsLoading}
            notFoundContent={
              unitsLoading ? (
                <Spin size="small" />
              ) : !courseId ? (
                "اختر الكورس أولاً"
              ) : (
                "لا توجد وحدات"
              )
            }
          >
            {units.map((unit) => (
              <Option key={unit.unit_id} value={unit.unit_id}>
                {unit.unit_name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Question Selection */}
        <Form.Item
          name="question_id"
          label="اختر سؤال من البنك"
          rules={[{ required: false, message: "الرجاء اختيار سؤال" }]}
        >
          <Select
            virtual={false}
            placeholder="اختر سؤال موجود أو أضف سؤال جديد"
            allowClear
            showSearch
            filterOption={filterOption}
            onChange={handleQuestionSelect}
            disabled={!unitId}
            loading={questionsLoading}
            notFoundContent={
              questionsLoading ? (
                <Spin size="small" />
              ) : !unitId ? (
                "اختر الوحدة أولاً"
              ) : (
                "لا توجد أسئلة"
              )
            }
          >
            {questions.map((question) => (
              <Option
                style={{
                  direction: "ltr",
                }}
                key={question.question_id}
                value={question.question_id}
              >
                {`${question.question_text}`}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Show Time */}
        <Form.Item
          name="show_time"
          label="وقت الظهور (بالثواني)"
          rules={[{ required: true, message: "الرجاء إدخال وقت الظهور" }]}
        >
          <InputNumber
            min={0}
            placeholder="وقت الظهور (بالثواني)"
            style={{ width: "100%" }}
          />
        </Form.Item>

        {/* Active Status */}
        <Form.Item
          name="active"
          label="الحالة"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch checkedChildren="نشط" unCheckedChildren="غير نشط" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AddInteractiveQuestion;
