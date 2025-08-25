import React, { useState, useEffect, useCallback } from "react";
import { Modal, Form, Select, Button, Spin, Table, Input, Alert } from "antd";
import { baseUrl } from "../../../utils/base_url";
import axios from "axios";
import toast from "react-hot-toast";
import { SearchOutlined } from "@ant-design/icons";
import useCoursesPage from "../../CoursesPage/useCoursesPage";

const { Option } = Select;

const emore_user = JSON.parse(localStorage.getItem("emore_user"));

const SelectExistingQuestion = ({ open, onClose, examId, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [fetchingData, setFetchingData] = useState(false);
  const { data: courses, getCourses } = useCoursesPage();

  // Fetch courses when modal opens
  useEffect(() => {
    if (open) {
      getCourses();
    }
  }, [open]);

  const fetchUnits = useCallback(async (courseId) => {
    if (!courseId) return;

    setFetchingData(true);
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
        setUnits([]);
        toast.error("فشل في تحميل الوحدات");
      }
    } catch (error) {
      console.error("Error fetching units:", error);
      toast.error("حدث خطأ أثناء تحميل الوحدات");
      setUnits([]);
    } finally {
      setFetchingData(false);
    }
  }, []);

  const fetchQuestions = useCallback(async (unitId, courseId) => {
    if (!unitId || !courseId) return;

    setFetchingData(true);
    try {
      const response = await axios.post(
        `${baseUrl}/admin/Exams/select_questions.php`,
        {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
          unit_id: unitId,
          course_id: courseId,
        }
      );

      if (response.data.status === "success") {
        setQuestions(response.data.message || []);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("حدث خطأ أثناء تحميل الأسئلة");
      setQuestions([]);
    } finally {
      setFetchingData(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchUnits(selectedCourseId);
      setSelectedUnitId(null);
      setQuestions([]);
      form.setFieldsValue({ unit_id: undefined });
    }
  }, [selectedCourseId, fetchUnits, form]);

  useEffect(() => {
    if (selectedCourseId && selectedUnitId) {
      fetchQuestions(selectedUnitId, selectedCourseId);
    }
  }, [selectedUnitId, selectedCourseId, fetchQuestions]);

  const handleCourseChange = (value) => {
    setSelectedCourseId(value);
    setSelectedQuestionIds([]);
  };

  const handleUnitChange = (value) => {
    setSelectedUnitId(value);
    setSelectedQuestionIds([]);
  };

  const handleSubmit = async () => {
    if (selectedQuestionIds.length === 0) {
      toast.error("الرجاء اختيار سؤال واحد على الأقل");
      return;
    }

    setLoading(true);
    try {
      // Assign each selected question to the exam
      const promises = selectedQuestionIds.map((questionId) =>
        axios.post(`${baseUrl}/admin/Exams/assign_ques_to_exam.php`, {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
          exam_id: examId,
          question_id: questionId,
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter(
        (res) => res.data.status === "success"
      ).length;

      if (successCount > 0) {
        toast.success(`تم تعيين ${successCount} سؤال للاختبار بنجاح`);
        form.resetFields();
        setSelectedCourseId(null);
        setSelectedUnitId(null);
        setQuestions([]);
        setSelectedQuestionIds([]);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error("فشل في تعيين الأسئلة للاختبار");
      }
    } catch (error) {
      console.error("Error assigning questions to exam:", error);
      toast.error("حدث خطأ أثناء تعيين الأسئلة للاختبار");
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter((question) =>
    question.question_text.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "نص السؤال",
      dataIndex: "question_text",
      key: "question_text",
      ellipsis: true,
      render: (text) => (
        <div
          style={{
            maxWidth: 300,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "نوع السؤال",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        switch (type) {
          case "mcq":
            return "اختيار من متعدد";
          case "line-match":
            return "توصيل الخطوط";
          case "arrangePuzzle":
            return "ترتيب الكلمات/الأحرف";
          default:
            return type;
        }
      },
    },
  ];

  return (
    <Modal
      title="اختيار أسئلة موجودة"
      open={open}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          إلغاء
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          disabled={selectedQuestionIds.length === 0}
        >
          تعيين الأسئلة المحددة ({selectedQuestionIds.length})
        </Button>,
      ]}
    >
      <Alert
        message="اختيار أسئلة موجودة"
        description="اختر الدورة والوحدة ثم حدد الأسئلة التي تريد تعيينها للاختبار"
        type="info"
        showIcon
        className="mb-4"
      />

      <Form form={form} layout="vertical">
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="course_id"
            label="اختر الدورة"
            rules={[{ required: true, message: "الرجاء اختيار دورة" }]}
          >
            <Select
              virtual={false}
              placeholder="اختر الدورة"
              loading={fetchingData}
              disabled={fetchingData}
              onChange={handleCourseChange}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {courses.map((course) => (
                <Option key={course.course_id} value={course.course_id}>
                  {course.course_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="unit_id"
            label="اختر الوحدة"
            rules={[{ required: true, message: "الرجاء اختيار وحدة" }]}
          >
            <Select
              virtual={false}
              placeholder={
                selectedCourseId ? "اختر الوحدة" : "اختر الدورة أولاً"
              }
              loading={fetchingData}
              disabled={!selectedCourseId || fetchingData}
              onChange={handleUnitChange}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {units.map((unit) => (
                <Option key={unit.unit_id} value={unit.unit_id}>
                  {unit.unit_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>
      </Form>

      {selectedCourseId && selectedUnitId && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">الأسئلة المتاحة</h3>
            <Input
              placeholder="بحث في الأسئلة"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
          </div>

          <Table
            rowSelection={{
              type: "checkbox",
              onChange: (selectedRowKeys) => {
                setSelectedQuestionIds(selectedRowKeys);
              },
              selectedRowKeys: selectedQuestionIds,
            }}
            columns={columns}
            dataSource={filteredQuestions}
            rowKey="question_id"
            loading={fetchingData}
            pagination={{ pageSize: 5 }}
            size="small"
          />
        </div>
      )}

      {fetchingData && (
        <div className="flex justify-center my-4">
          <Spin tip="جاري تحميل البيانات..." />
        </div>
      )}
    </Modal>
  );
};

export default SelectExistingQuestion;
