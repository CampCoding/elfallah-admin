import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Drawer } from "antd";
import toast from "react-hot-toast";
import { baseUrl } from "../../../utils/base_url";
import axios from "axios";
const emore_user = JSON.parse(localStorage.getItem("emore_user"));

const EditVideo = ({ open, setOpen, video, getVideos }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const API = {
    editVideo: (record) => {
      // console.log(record);
      // return;
      return axios.post(`${baseUrl}/admin/videos/edit_source_video.php`, {
        admin_id: emore_user.admin_id,
        access_token: emore_user.access_token,
        source_video_id: video.video_id,
        video_title: record.name,
        loom_url: record.loom_url,
        youtube_id: "",
      });
    },
  };

  useEffect(() => {
    if (video && open) {
      form.setFieldsValue({
        name: video.video_title,
        loom_url: video.loom_url,
      });
    }
  }, [video, open, form]);

  const handleSubmit = async (values) => {
    if (!video) return;

    setLoading(true);
    try {
      const response = await API.editVideo(values);

      if (response.data.status == "success") {
        toast.success("تم تحديث الفيديو بنجاح");
        setOpen(false);
        getVideos();
      } else {
        toast.error("حدث خطأ أثناء تحديث الفيديو");
      }
    } catch (error) {
      console.error("Error updating video:", error);
      toast.error("حدث خطأ أثناء تحديث الفيديو");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      placement="left"
      title="تعديل الفيديو"
      open={open}
      onClose={() => {
        setOpen(false);
        form.resetFields();
      }}
      footer={
        <Button
          type="primary"
          className="w-full"
          onClick={() => handleSubmit(form.getFieldsValue())}
          loading={loading}
        >
          حفظ التغييرات
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={() => handleSubmit(form.getFieldsValue())}
      >
        <Form.Item
          label="اسم الفيديو"
          name="name"
          rules={[{ required: true, message: "الرجاء إدخال اسم الفيديو" }]}
        >
          <Input placeholder="أدخل اسم الفيديو" />
        </Form.Item>

        <Form.Item
          label="معرف الفيديو"
          name="loom_url"
          rules={[{ required: true, message: "الرجاء إدخال معرف الفيديو" }]}
        >
          <Input placeholder="مثال: dQw4w9WgXcQ" />
        </Form.Item>

        {/* <Form.Item
          label="الوصف"
          name="desc"
          rules={[{ required: true, message: "الرجاء إدخال وصف الفيديو" }]}
        >
          <Input.TextArea rows={3} placeholder="أدخل وصف الفيديو" />
        </Form.Item> */}

        {/* <Form.Item
          label="الوحدة"
          name="unitId"
          rules={[{ required: true, message: "الرجاء اختيار الوحدة" }]}
        >
          <Select           
          virtual={false} placeholder="اختر الوحدة">
            {units.map((unit) => (
              <Select           
          virtual={false}.Option key={unit.id} value={unit.id}>
                {unit.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item> */}

        {/* <Form.Item
          label="فيديو تسميع الكلمات"
          name="video_id_words"
          rules={[
            { required: true, message: "الرجاء إدخال فيديو تسميع الكلمات" },
          ]}
        >
          <Input placeholder="مثال: dQw4w9WgXcQ" />
        </Form.Item>
        <Form.Item
          label="فيديو لحن الأغنية"
          name="video_id_sound"
          rules={[
            { required: true, message: "الرجاء إدخال فيديو لحن الأغنية" },
          ]}
        >
          <Input placeholder="مثال: dQw4w9WgXcB" />
        </Form.Item>
        <Form.Item
          label="فيديو الحل"
          name="video_id_solution"
          rules={[{ required: true, message: "الرجاء إدخال فيديو الحل" }]}
        >
          <Input placeholder="مثال: dQw4w9WgXcZ" />
        </Form.Item> */}
      </Form>
    </Drawer>
  );
};

export default EditVideo;
