import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, Checkbox, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
// Using the existing image for logo if needed later
import "./styles.css"; // Import custom styles
import axios from "axios";
import { baseUrl } from "../../utils/base_url";
import toast from "react-hot-toast";

const { Title, Text } = Typography;

const LoginPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);

    try {
      const res = await axios.post(`${baseUrl}/admin/auth/admin_login.php`, {
        user_email: values.username,
        password: values.password,
      });
      if (res.data.status == "success") {
        localStorage.setItem("emore_user", JSON.stringify(res.data.message));
        navigate("/");
        window.location.reload();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 login-page bg-gradient-to-br from-green-900 via-orange-300 to-red-500 ">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          opacity: 0.6,
          // background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
        }}
      ></div>

      <Card className="w-full max-w-lg relative z-10 backdrop-blur-lg bg-white/40 border border-white/30 shadow-[0_8px_32px_rgba(31,38,135,0.15)] rounded-xl glass-card">
        <div className="flex flex-col items-center mb-8">
          <Title level={3} className="text-center text-gray-800 mb-0">
            تسجيل الدخول
          </Title>
          <Text className="text-center text-gray-600">
            الرجاء إدخال بيانات الدخول
          </Text>
        </div>

        <Form
          form={form}
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
          className="flex flex-col justify-between"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "الرجاء إدخال اسم المستخدم" }]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="اسم المستخدم"
              className="bg-white/60 border-white/40 backdrop-blur-sm glass-input"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "الرجاء إدخال كلمة المرور" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="كلمة المرور"
              className="bg-white/60 border-white/40 backdrop-blur-sm glass-input"
            />
          </Form.Item>

          <Form.Item>
            <Button
              htmlType="submit"
              loading={loading}
              className="w-full h-12 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 login-btn"
            >
              تسجيل الدخول
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
