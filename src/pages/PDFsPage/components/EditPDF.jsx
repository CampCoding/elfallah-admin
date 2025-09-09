import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Upload, Drawer } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";

const EditPDF = ({ open, setOpen, pdf, getPDFs }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (pdf && open) {
      form.setFieldsValue({
        name: pdf.name,
        pdf_file: pdf.pdf_file,
      });

      // Create a mock file object for the existing PDF
      setFileList([
        {
          uid: "-1",
          name: pdf.pdf_file,
          status: "done",
          url: pdf.pdf_file, // In a real app, this would be the actual URL
        },
      ]);
    } else {
      setFileList([]);
    }
  }, [pdf, open, form]);

  const handleSubmit = async (values) => {
    if (!pdf) return;

    setLoading(true);
    try {
      // Get file name from Upload component if available
      let fileName = values.pdf_file;
      if (fileList.length > 0 && fileList[0].originFileObj) {
        fileName = fileList[0].name;
      }

      // Update the PDF in localStorage
      const pdfs = localStorage.getItem("pdfs")
        ? JSON.parse(localStorage.getItem("pdfs"))
        : [];

      const updatedPDFs = pdfs.map((p) =>
        p.id === pdf.id
          ? {
              ...p,
              name: values.name,
              pdf_file: fileName,
            }
          : p
      );

      localStorage.setItem("pdfs", JSON.stringify(updatedPDFs));

      // Update videos with pdfs array
      const videos = localStorage.getItem("videos")
        ? JSON.parse(localStorage.getItem("videos"))
        : [];

      // Group PDFs by videoId
      const pdfsByVideo = {};
      updatedPDFs.forEach((pdf) => {
        if (!pdfsByVideo[pdf.videoId]) {
          pdfsByVideo[pdf.videoId] = [];
        }
        pdfsByVideo[pdf.videoId].push(pdf);
      });

      // Update videos with pdfs array
      const updatedVideos = videos.map((video) => ({
        ...video,
        pdfs: pdfsByVideo[video.id] || [],
      }));

      localStorage.setItem("videos", JSON.stringify(updatedVideos));

      // Show success message
      toast.success("تم تحديث المذكرة بنجاح");

      // Close modal and refresh data
      setOpen(false);
      form.resetFields();
      getPDFs();
    } catch (error) {
      console.error("Error updating PDF:", error);
      toast.error("حدث خطأ أثناء تحديث المذكرة");
    } finally {
      setLoading(false);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };

  return (
    <Drawer
      placement="left"
      title="تعديل المذكرة"
      open={open}
      onClose={() => {
        setOpen(false);
        form.resetFields();
        setFileList([]);
      }}
      footer={
        <div className="flex justify-end w-full">
          <Button type="primary" className="w-full" onClick={handleSubmit}>
            حفظ التغييرات
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="اسم المذكرة"
          name="name"
          rules={[{ required: true, message: "الرجاء إدخال اسم المذكرة" }]}
        >
          <Input placeholder="أدخل اسم المذكرة" />
        </Form.Item>

        <Form.Item
          label="ملف المذكرة"
          name="pdf_file"
          valuePropName="file"
          getValueFromEvent={normFile}
          rules={[{ required: true, message: "الرجاء اختيار ملف المذكرة" }]}
        >
          <Upload.Dragger
            name="file"
            accept=".pdf"
            fileList={fileList}
            onChange={handleFileChange}
            beforeUpload={() => false} // Prevent auto upload
            maxCount={1}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">انقر أو اسحب الملف هنا للتحميل</p>
            <p className="ant-upload-hint">يدعم الملفات بصيغة PDF فقط</p>
          </Upload.Dragger>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default EditPDF;
