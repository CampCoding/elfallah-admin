import React, { useState } from "react";
import { Button, Drawer, Form, Input, Switch } from "antd";
import toast from "react-hot-toast";
import { useLocation, useSearchParams } from "react-router-dom";
import { baseUrl } from "../../../utils/base_url";
import axios from "axios";

const emore_user = JSON.parse(localStorage.getItem("emore_user"));

const AddUnit = ({ data, open, setOpen, getUnits }) => {
  const [units, setUnits] = useState(data);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("courseId");

  const API = {
    addUnit: (values) => {
      return axios
        .post(`${baseUrl}/admin/courses/add_unit.php`, {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
          unit_name: values.name,
          course_id: courseId,
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
          console.error("Error adding course:", error);
          return {
            data: {
              status: "error",
              message: error.response ? error.response.data : error.message,
            },
          };
        });
    },
  };

  // Handle form submission
  const onFinish = (values) => {
    setUnits([...units, { id: Date.now(), ...values }]);
    setOpen(false);
  };

  // Submit the form
  const submit = () => {
    form
      .validateFields()
      .then(async (values) => {
        setSubmitting(true);
        try {
          // Set default status to true if not provided
          if (values.status === undefined) {
            values.status = true;
          }

          // Add courseId if available
          if (courseId) {
            values.courseId = parseInt(courseId);
          }

          // Simulated API call
          const response = await API.addUnit(values);

          if (response.data.status === "success") {
            toast.success("تم إضافة الوحدة بنجاح");
            setOpen(false);
            form.resetFields();
            getUnits();
          } else {
            toast.error("فشل إضافة الوحدة");
          }
        } catch (error) {
          console.error("Error adding unit:", error);
          toast.error("حدث خطأ أثناء إضافة الوحدة");
        } finally {
          setSubmitting(false);
        }
      })
      .catch((error) => {
        console.error("Validation failed:", error);
      });
  };

  return (
    <Drawer
      placement="left"
      title={"إضافة وحدة جديدة"}
      onClose={() => setOpen(false)}
      open={open}
      className="rounded-[0_10px_10px_0px]"
      footer={
        <Button
          onClick={() => submit()}
          className="mt-auto"
          htmlType="submit"
          type="primary"
          block
          loading={submitting}
        >
          إضافة
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="h-full flex flex-col"
      >
        <Form.Item
          name="name"
          label="اسم الوحدة"
          rules={[{ required: true, message: "برجاء إدخال اسم الوحدة" }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AddUnit;
