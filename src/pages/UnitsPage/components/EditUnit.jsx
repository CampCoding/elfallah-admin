import React, { useEffect, useState } from "react";
import { Button, Drawer, Form, Input } from "antd";
import toast from "react-hot-toast";
import { baseUrl } from "../../../utils/base_url";
import axios from "axios";

const emore_user = JSON.parse(localStorage.getItem("emore_user"));

const EditUnit = ({ open, setOpen, unit, getUnits }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const API = {
    editUnit: (values) => {
      return axios
        .post(`${baseUrl}/admin/courses/edit_unit.php`, {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
          unit_id: unit.unit_id,
          unit_name: values.name,
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

  useEffect(() => {
    if (unit) {
      form.setFieldsValue({
        name: unit.unit_name,
      });
    }
  }, [unit, form]);

  // Submit the form
  const submit = () => {
    form
      .validateFields()
      .then(async (values) => {
        setSubmitting(true);
        try {
          const updatedUnit = {
            ...unit,
            ...values,
          };

          // Simulated API call
          const response = await API.editUnit(updatedUnit);

          if (response.data.status === "success") {
            toast.success("تم تحديث الوحدة بنجاح");
            setOpen(false);
            getUnits();
          } else {
            toast.error("فشل تحديث الوحدة");
          }
        } catch (error) {
          console.error("Error updating unit:", error);
          toast.error("حدث خطأ أثناء تحديث الوحدة");
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
      title={"تعديل الوحدة"}
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
      {unit && (
        <Form form={form} layout="vertical" className="h-full flex flex-col">
          <Form.Item
            name="name"
            label="اسم الوحدة"
            rules={[{ required: true, message: "برجاء إدخال اسم الوحدة" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      )}
    </Drawer>
  );
};

export default EditUnit;
