import React, { useEffect, useState } from "react";
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

const emore_user = JSON.parse(localStorage.getItem("emore_user"));

const API = {
  updateExam: (values, exam) => {
    return axios
      .post(`${baseUrl}/admin/Exams/edit_exam.php`, {
        admin_id: emore_user.admin_id,
        access_token: emore_user.access_token,
        exam_id: exam.exam_id,
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

const EditExam = ({ open, setOpen, exam, getExams }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (exam) {
      form.setFieldsValue({
        exam_id: exam.exam_id,
        exam_name: exam.exam_name,
        start_date: exam.start_date ? dayjs(exam.start_date) : null,
        end_date: exam.end_date ? dayjs(exam.end_date) : null,
        exam_description: exam.exam_description,
        type: exam.type,
      });
    }
  }, [exam, form]);

  // Submit the form
  const submit = () => {
    form
      .validateFields()
      .then(async (values) => {
        setSubmitting(true);
        try {
          if (values.start_date) {
            values.start_date = dayjs(values.start_date).format("YYYY-MM-DD");
          }
          if (values.end_date) {
            values.end_date = dayjs(values.end_date).format("YYYY-MM-DD");
          }

          const response = await API.updateExam(values, exam);

          if (response.data.status === "success") {
            toast.success("تم تحديث الاختبار بنجاح");
            setOpen(false);
            getExams();
          } else {
            toast.error("فشل تحديث الاختبار");
          }
        } catch (error) {
          console.error("Error updating exam:", error);
          toast.error("حدث خطأ أثناء تحديث الاختبار");
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
      title={"تعديل الاختبار"}
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
          تحديث
        </Button>
      }
    >
      {exam && (
        <Form form={form} layout="vertical" className="h-full flex flex-col">
          <Form.Item
            name="exam_name"
            label="اسم الاختبار"
            rules={[{ required: true, message: "برجاء إدخال اسم الاختبار" }]}
          >
            <Input />
          </Form.Item>

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
        </Form>
      )}
    </Drawer>
  );
};

export default EditExam;
