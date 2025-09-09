import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";

const AddPDF = ({ open, setOpen, getPDFs }) => {
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get("videoId");
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        videoId: videoId ? +videoId : undefined,
      });
      setFileList([]);
    }
  }, [open, videoId, form]);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Check if no file is uploaded
      if (fileList.length === 0) {
        toast.error("الرجاء تحميل ملف المذكرة");
        setLoading(false);
        return;
      }

      // Check if this video already has 2 PDFs
      const pdfs = localStorage.getItem("pdfs")
        ? JSON.parse(localStorage.getItem("pdfs"))
        : [];

      const videoPdfs = pdfs.filter((pdf) => pdf.videoId === parseInt(videoId));

      if (videoPdfs.length >= 2) {
        toast.error("لا يمكن إضافة أكثر من مذكرتين لكل فيديو");
        setLoading(false);
        return;
      }

      // Get file name from Upload component
      const fileName = fileList[0].name;

      // Add the PDF to localStorage
      const newPDF = {
        name: values.name,
        pdf_file: fileName,
        id: Math.max(...pdfs.map((p) => p.id || 0), 0) + 1,
        videoId: parseInt(values.videoId),
      };

      const updatedPDFs = [...pdfs, newPDF];
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
      toast.success("تم إضافة المذكرة بنجاح");

      // Close modal and refresh data
      setOpen(false);
      form.resetFields();
      setFileList([]);
      getPDFs();
    } catch (error) {
      console.error("Error adding PDF:", error);
      toast.error("حدث خطأ أثناء إضافة المذكرة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="إضافة مذكرة جديدة"
      open={open}
      onCancel={() => {
        setOpen(false);
        form.resetFields();
        setFileList([]);
      }}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        preserve={false}
      >
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

        <Form.Item name="videoId" hidden>
          <Input type="hidden" />
        </Form.Item>

        <Form.Item className="mb-0 flex justify-end">
          <Button
            type="default"
            onClick={() => {
              setOpen(false);
              form.resetFields();
              setFileList([]);
            }}
            className="ml-2"
          >
            إلغاء
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="bg-goldenOrange hover:!bg-darkgold"
          >
            إضافة
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddPDF;
