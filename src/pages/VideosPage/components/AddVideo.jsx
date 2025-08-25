import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Select, Switch, Drawer } from "antd";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { baseUrl } from "../../../utils/base_url";
import axios from "axios";
const emore_user = JSON.parse(localStorage.getItem("emore_user"));

const AddVideo = ({ open, setOpen, units, getVideos }) => {
  const [searchParams] = useSearchParams();
  const unitId = searchParams.get("unitId");
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const API = {
    addVideo: (video) => {
      return axios
        .post(`${baseUrl}/admin/videos/insert_video.php`, {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
          video_title: video.name,
          loom_url: video.loom_url,
          youtube_id: "",
        })
        .then((response) => {
          return {
            data: {
              status: "success",
              message: response.data.message,
            },
          };
        })
        .catch((error) => {
          console.error("Error adding video:", error);
          return {
            data: {
              status: "error",
              message: error.response ? error.response.data : error.message,
            },
          };
        });
    },
  };

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        unitId: unitId ? +unitId : undefined,
      });
    }
  }, [open, unitId, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await API.addVideo(values);
      if (response.data.status == "success") {
        toast.success("تم إضافة الفيديو بنجاح");
        setOpen(false);
        form.resetFields();
        getVideos();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error adding video:", error);
      toast.error("حدث خطأ أثناء إضافة الفيديو");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      placement="left"
      title="إضافة فيديو جديد"
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
          إضافة
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={() => handleSubmit(form.getFieldsValue())}
        preserve={false}
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
      </Form>
    </Drawer>
  );
};

export default AddVideo;
