import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Drawer,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  InputNumber,
} from "antd";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import axios from "axios";
import { baseUrl } from "../../../utils/base_url";
import useCoursesPage from "../../CoursesPage/useCoursesPage";

const emore_user = JSON.parse(localStorage.getItem("emore_user"));

const AddExam = ({ data, open, setOpen, getExams }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const API = {
    addExam: (values) => {
      return axios
        .post(`${baseUrl}/admin/Exams/add_exam.php`, {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
          exam_name: values.exam_name,
          start_date: values.start_date,
          end_date: values.end_date,
          exam_description: values.exam_description,
          type: values.type,
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

  // Submit the form
  const submit = () => {
    form
      .validateFields()
      .then(async (values) => {
        setSubmitting(true);
        try {
          // Format dates to strings
          if (values.start_date) {
            values.start_date = values.start_date.format("YYYY-MM-DD");
          }
          if (values.end_date) {
            values.end_date = values.end_date.format("YYYY-MM-DD");
          }

          const response = await API.addExam(values);

          if (response.data.status === "success") {
            toast.success("تم إضافة الاختبار بنجاح");
            setOpen(false);
            form.resetFields();
            getExams();
          } else {
            toast.error("فشل إضافة الاختبار");
          }
        } catch (error) {
          console.error("Error adding exam:", error);
          toast.error("حدث خطأ أثناء إضافة الاختبار");
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
      title={"إضافة اختبار جديد"}
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
        onFinish={submit}
        className="h-full flex flex-col"
      >
        <Form.Item
          name="exam_name"
          label="اسم الاختبار"
          rules={[{ required: true, message: "برجاء إدخال اسم الاختبار" }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        {/* <Form.Item
          label=""
          name="course_id"
          rules={[{ required: true, message: "الرجاء اختيار الدورة" }]}
        >
          <Select           
          virtual={false}
            placeholder="اختر الدورة"
            allowClear
            onChange={(value) => {
              setCourseId(value);
              form.setFieldsValue({ unit_id: null });
            }}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {courses.map((course) => (
              <Select           
          virtual={false}.Option key={course.course_id} value={course.course_id}>
                {course.course_name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item> */}

        <Form.Item
          name="exam_description"
          label="وصف الاختبار"
          rules={[{ required: true, message: "برجاء إدخال وصف الاختبار" }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item
          name="type"
          label="نوع الاختبار"
          rules={[{ required: true, message: "برجاء إدخال نوع الاختبار" }]}
        >
          <Select
            virtual={false}
            options={[
              { label: "وحدة", value: "unit" },
              { label: "فيديو", value: "video" },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="start_date"
          label="تاريخ البدء"
          rules={[{ required: true, message: "برجاء تحديد تاريخ البدء" }]}
        >
          <DatePicker
            format="YYYY-MM-DD"
            style={{ width: "100%" }}
            placeholder="اختر تاريخ البدء"
          />
        </Form.Item>

        <Form.Item
          name="end_date"
          label="تاريخ الانتهاء"
          rules={[
            { required: true, message: "برجاء تحديد تاريخ الانتهاء" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (
                  !value ||
                  !getFieldValue("start_date") ||
                  value.isAfter(getFieldValue("start_date"))
                ) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء")
                );
              },
            }),
          ]}
        >
          <DatePicker
            format="YYYY-MM-DD"
            style={{ width: "100%" }}
            placeholder="اختر تاريخ الانتهاء"
          />
        </Form.Item>

        {/* <Form.Item
          name="exam_time"
          label="مدة الاختبار (دقيقة)"
          rules={[{ required: true, message: "برجاء إدخال مدة الاختبار" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="course_id"
          label="الدورة المرتبطة"
          rules={[{ required: true, message: "برجاء اختيار الدورة المرتبطة" }]}
        >
          <Select           
          virtual={false} placeholder="اختر الدورة">
            {courses.map((course) => (
              <Select           
          virtual={false}.Option key={course.id} value={course.id}>
                {course.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item> */}
      </Form>
    </Drawer>
  );
};

export default AddExam;
