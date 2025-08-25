import React, { useState, useEffect } from "react";
import { Drawer, Form, Input, Button, Select, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";

const EditQuestion = ({ open, setOpen, video, question, getVideos }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (question && open) {
      // Convert seconds to mm:ss format
      const minutes = Math.floor(question.video_duration / 60);
      const seconds = question.video_duration % 60;
      const formattedDuration = `${minutes}:${seconds
        .toString()
        .padStart(2, "0")}`;

      form.setFieldsValue({
        question_text: question.question_text,
        type: question.type,
        video_duration: formattedDuration,
      });

      setImageUrl(question.image || "");
    }
  }, [question, open, form]);

  const handleSubmit = async (values) => {
    if (!question) return;

    setLoading(true);
    try {
      // Format video duration from "mm:ss" to seconds
      const [minutes, seconds] = values?.video_duration
        ?.split(":")
        ?.map(Number);
      const durationInSeconds = minutes * 60 + seconds;

      // Update the question in localStorage
      const videos = localStorage.getItem("videos")
        ? JSON.parse(localStorage.getItem("videos"))
        : [];

      const updatedVideos = videos.map((v) => {
        if (v.id === video.id) {
          const updatedQuestions = (v.questions || []).map((q) =>
            q.id === question.id
              ? {
                  ...q,
                  question_text: values.question_text,
                  type: values.type,
                  video_duration: durationInSeconds,
                  image: imageUrl,
                }
              : q
          );

          return {
            ...v,
            questions: updatedQuestions,
          };
        }
        return v;
      });

      localStorage.setItem("videos", JSON.stringify(updatedVideos));

      // Show success message
      toast.success("تم تحديث السؤال بنجاح");

      // Close modal and refresh data
      setOpen(false);
      getVideos();
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("حدث خطأ أثناء تحديث السؤال");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (info) => {
    if (info.file.status === "uploading") {
      return;
    }
    if (info.file.status === "done") {
      // Get this url from response in real world
      getBase64(info.file.originFileObj, (url) => {
        setImageUrl(url);
      });
    }
  };

  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("يمكنك فقط رفع ملفات JPG/PNG!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("يجب أن يكون حجم الصورة أقل من 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };

  return (
    <Drawer
      placement="left"
      title="تعديل السؤال"
      open={open}
      onClose={() => {
        setOpen(false);
        form.resetFields();
      }}
      footer={
        <Button
          type="primary"
          className="w-full"
          onClick={() => form.submit()}
          loading={loading}
        >
          حفظ التغييرات
        </Button>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="نص السؤال"
          name="question_text"
          rules={[{ required: true, message: "الرجاء إدخال نص السؤال" }]}
        >
          <Input.TextArea rows={3} placeholder="أدخل نص السؤال" />
        </Form.Item>

        {/* <Form.Item
          label="نوع السؤال"
          name="type"
          rules={[{ required: true, message: "الرجاء اختيار نوع السؤال" }]}
        >
          <Select           
          virtual={false} placeholder="اختر نوع السؤال">
            <Select           
          virtual={false}.Option value="match">مطابقة</Select.Option>
            <Select           
          virtual={false}.Option value="mcq">اختيار من متعدد</Select.Option>
          </Select>
        </Form.Item> */}

        <Form.Item
          label="توقيت ظهور السؤال"
          name="video_duration"
          rules={[
            {
              required: true,
              message: "الرجاء إدخال توقيت ظهور السؤال",
            },
            {
              pattern: /^([0-9]{1,2}):([0-5][0-9])$/,
              message: "الرجاء إدخال التوقيت بصيغة صحيحة (مثال: 3:52)",
            },
          ]}
        >
          <Input placeholder="مثال: 3:52" />
        </Form.Item>

        <Form.Item label="صورة السؤال (اختياري)" name="image">
          <Upload
            name="image"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
            beforeUpload={beforeUpload}
            onChange={handleImageUpload}
          >
            {imageUrl ? (
              <img src={imageUrl} alt="question" style={{ width: "100%" }} />
            ) : (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>رفع</div>
              </div>
            )}
          </Upload>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default EditQuestion;
