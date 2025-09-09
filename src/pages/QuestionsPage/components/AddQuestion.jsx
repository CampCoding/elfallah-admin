import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Drawer,
  Form,
  Input,
  Radio,
  Select,
  Space,
  Upload,
} from "antd";
import { CloseOutlined, UploadOutlined } from "@ant-design/icons";
import McqQuestions from "./McqQuestions";
import ArrangePuzzleQuestions from "./ArrangePuzzleQuestions";
import LineMatchQuestions from "./LineMatchQuestions";
import { baseUrl } from "../../../utils/base_url";
import axios from "axios";
import toast from "react-hot-toast";
import uploadImage from "../../../hooks/UploadImage";

const emore_user = JSON.parse(localStorage.getItem("emore_user"));

const { TextArea } = Input;

const AddQuestion = ({ open, setOpen, unitId, courseId, getQuestions }) => {
  const [form] = Form.useForm();
  const [questionType, setQuestionType] = useState("mcq");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const handleClose = () => {
    form.resetFields();
    setQuestionType("mcq");
    setImageUrl("");
    setImageFile(null);
    setOpen(false);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      toast.error("يمكنك رفع الصور فقط!");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      toast.error("يجب أن يكون حجم الصورة أقل من 2 ميجابايت!");
      return false;
    }
    setImageFile(file);
    return false; // Prevent auto upload
  };

  const handleImageChange = (info) => {
    if (info.file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target.result);
      };
      reader.readAsDataURL(info.file);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate form first
      await form.validateFields();
      const values = form.getFieldsValue();

      console.log("Form values:", values); // Debug log

      setLoading(true);

      const questionData = {
        question_text: values.question_text,
        question_type: questionType,
        unit_id: values.unit_id || unitId,
        course_id: values.course_id || courseId,
      };

      if (questionType === "mcq") {
        const mcqOptions = values.mcq_options || [];
        console.log("MCQ Options:", mcqOptions); // Debug log

        const correctOption = mcqOptions.find((opt) => opt.isCorrect);

        questionData.question_answers = mcqOptions.map((opt) => opt.text);
        questionData.question_valid_answer = correctOption
          ? correctOption.text
          : "";
      } else if (questionType === "arrangePuzzle") {
        questionData.question_text = values.question_valid_answer;
        questionData.game_type = values.game_type;
        questionData.question_valid_answer = values.question_valid_answer;
      } else if (questionType === "line-match") {
        questionData.question_answers = values.question_answers;
      }

      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("admin_id", emore_user.admin_id);
        formData.append("access_token", emore_user.access_token);

        const imageUrl = await uploadImage(imageFile);
        questionData.question_image = imageUrl;
      }

      console.log("Final question data:", questionData); // Debug log

      const response = await axios.post(`${baseUrl}/admin/Exams/add_ques.php`, {
        admin_id: emore_user.admin_id,
        access_token: emore_user.access_token,
        ...questionData,
      });

      if (response.data.status === "success") {
        // Reset form and close drawer
        form.resetFields();
        setOpen(false);
        getQuestions();
        setQuestionType("mcq");
        setImageUrl("");
        setImageFile(null);
        toast.success("تم إضافة السؤال بنجاح");
      } else {
        toast.error(response.data.message || "حدث خطأ أثناء إضافة السؤال");
      }
    } catch (error) {
      if (error.errorFields) {
        // Validation error
        console.log("Validation errors:", error.errorFields);
        toast.error("الرجاء التحقق من جميع الحقول المطلوبة");
      } else {
        // Network or other error
        console.error("Error adding question:", error);
        toast.error("حدث خطأ أثناء إضافة السؤال");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <Drawer
      title="إضافة سؤال جديد"
      placement="left"
      onClose={handleClose}
      open={open}
      width={500}
      footer={
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          onClick={() => handleSubmit()}
          className="w-full"
        >
          إضافة السؤال
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ question_type: "mcq" }}
      >
        <Alert
          description="السؤال الذي ستضيفه سيتم تعيينه لهذه الوحدة"
          type="info"
          showIcon
          className="mb-4"
        />

        <Form.Item className="my-4" label="صورة السؤال (اختياري)">
          <Upload
            beforeUpload={beforeUpload}
            onChange={handleImageChange}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>اختر صورة</Button>
          </Upload>
          {imageUrl && (
            <div className="mt-2 flex items-center gap-2">
              <img
                src={imageUrl}
                alt="صورة السؤال"
                style={{ maxWidth: "100%", maxHeight: "100px" }}
              />

              <Button
                type="default"
                // className="mx-2"
                onClick={() => {
                  setImageUrl("");
                  setImageFile(null);
                  form.setFieldsValue({ image: null });
                }}
              >
                إزالة الصورة
              </Button>
            </div>
          )}
        </Form.Item>

        <Form.Item name="question_type" label="نوع السؤال">
          <Radio.Group
            onChange={(e) => {
              setQuestionType(e.target.value);
              form.setFieldsValue({ question_text: "" });
            }}
            value={questionType}
            className="flex flex-wrap gap-4"
          >
            <Radio value="mcq">اختيار من متعدد</Radio>
            <Radio value="arrangePuzzle">ترتيب الكلمات/الأحرف</Radio>
            <Radio value="line-match">توصيل الخطوط</Radio>
          </Radio.Group>
        </Form.Item>

        {questionType == "mcq" && (
          <Form.Item
            disabled={questionType !== "mcq"}
            name="question_text"
            label="نص السؤال"
            rules={[{ required: true, message: "الرجاء إدخال نص السؤال" }]}
          >
            <TextArea rows={4} placeholder="أدخل نص السؤال هنا" />
          </Form.Item>
        )}

        {questionType === "mcq" && <McqQuestions form={form} />}

        {questionType === "arrangePuzzle" && (
          <ArrangePuzzleQuestions form={form} />
        )}

        {questionType === "line-match" && <LineMatchQuestions form={form} />}
      </Form>
    </Drawer>
  );
};

export default AddQuestion;
