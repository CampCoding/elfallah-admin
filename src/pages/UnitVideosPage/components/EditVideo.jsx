import React, { useState, useEffect } from "react";
import { Form, Input, Button, Drawer, Upload, Progress, Modal } from "antd";
import toast from "react-hot-toast";
import { baseUrl } from "../../../utils/base_url";
import axios from "axios";
import {
  InboxOutlined,
  FileOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import uploadPdf from "../../../hooks/UploadPdf";

const emore_user = JSON.parse(localStorage.getItem("emore_user"));

const EditVideo = ({ open, setOpen, video, getVideos }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");
  const [existingPdfUrl, setExistingPdfUrl] = useState("");

  useEffect(() => {
    if (video && open) {
      form.setFieldsValue({
        video_title: video.new_title,
        solve: video.solve,
        tune: video.tune,
        words: video.words,
        pdf_file: video.pdf_url,
      });

      // Handle existing PDF URL
      if (video.pdf_url) {
        setExistingPdfUrl(video.pdf_url);
        setPdfPreviewUrl(video.pdf_url);
      } else {
        setExistingPdfUrl("");
        setPdfPreviewUrl("");
      }

      // Reset file states
      setFileList([]);
      setPdfFile(null);
      setUploadProgress(0);
      setUploadingPdf(false);
    }
  }, [video, open, form]);

  // Handle PDF file selection and preview
  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);

    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj || newFileList[0];
      setPdfFile(file);

      // Create preview URL for PDF
      if (file.type === "application/pdf") {
        const url = URL.createObjectURL(file);
        setPdfPreviewUrl(url);
      }
    } else {
      setPdfFile(null);

      // If there's an existing PDF, restore its preview URL
      if (existingPdfUrl) {
        setPdfPreviewUrl(existingPdfUrl);
      } else {
        setPdfPreviewUrl("");
      }
    }
  };

  // Remove PDF file
  const handleRemovePdf = () => {
    setFileList([]);
    setPdfFile(null);

    // If we're removing an existing PDF (not a new upload)
    if (!pdfFile && existingPdfUrl) {
      setExistingPdfUrl("");
      setPdfPreviewUrl("");
    } else if (existingPdfUrl) {
      // If we removed a new upload but there's still an existing PDF
      setPdfPreviewUrl(existingPdfUrl);
    } else {
      setPdfPreviewUrl("");
    }
  };

  // Preview PDF
  const handlePreviewPdf = () => {
    if (pdfPreviewUrl) {
      setPreviewVisible(true);
    }
  };

  // Validate PDF file
  const beforeUpload = (file) => {
    const isPdf = file.type === "application/pdf";
    if (!isPdf) {
      toast.error("يمكنك رفع ملفات PDF فقط!");
      return false;
    }

    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      toast.error("حجم الملف يجب أن يكون أقل من 10MB!");
      return false;
    }

    return false; // Prevent automatic upload
  };

  // Custom PDF upload component
  const PdfUploadComponent = () => {
    // If we have a file in the fileList (new upload)
    if (fileList.length > 0) {
      const file = fileList[0];
      return (
        <div className="border border-dashed border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileOutlined className="text-red-500 text-2xl" />
              <div className="flex-1">
                <p className="font-medium truncate max-w-[10rem]">
                  {file.name}
                </p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {uploadingPdf && (
                  <Progress
                    percent={uploadProgress}
                    size="small"
                    className="mt-2"
                  />
                )}
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Button
                type="text"
                className="!p-2"
                onClick={handlePreviewPdf}
                disabled={!pdfPreviewUrl}
                title="معاينة الملف"
              >
                <div className="flex items-center justify-center">
                  <EyeOutlined className="!mx-auto text-[12px] flex items-center justify-center" />
                </div>
              </Button>
              <Button
                type="text"
                danger
                className="!p-2"
                onClick={handleRemovePdf}
                title="حذف الملف"
              >
                <div className="flex items-center justify-center">
                  <DeleteOutlined className="!mx-auto text-[12px] flex items-center justify-center" />
                </div>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // If we have an existing PDF URL but no new file
    if (existingPdfUrl && !fileList.length) {
      return (
        <div className="border border-dashed border-gray-300 rounded-lg p-4">
          <div className="grid grid-cols-4 gap-2">
            <div className="flex items-center space-x-3 col-span-3">
              <FileOutlined className="text-red-500 text-2xl" />
              <div className="flex-1">
                <p
                  title={existingPdfUrl.split("/").pop()}
                  className="font-medium truncate max-w-[10rem]"
                >
                  {existingPdfUrl.split("/").pop() || "ملف PDF"}
                </p>
                <p className="text-sm text-gray-500">ملف PDF موجود</p>
              </div>
            </div>
            <div className="flex items-center col-span-1 justify-center gap-2">
              <Button
                type="text"
                className="!p-2"
                onClick={handlePreviewPdf}
                title="معاينة الملف"
              >
                <div className="flex items-center justify-center">
                  <EyeOutlined className="!mx-auto text-[12px] flex items-center justify-center" />
                </div>
              </Button>
              <Button
                type="text"
                danger
                className="!p-2"
                onClick={handleRemovePdf}
                title="حذف الملف"
              >
                <div className="flex items-center justify-center">
                  <DeleteOutlined className="!mx-auto text-[12px] flex items-center justify-center" />
                </div>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Default upload component when no file is selected
    return (
      <Upload.Dragger
        name="file"
        accept=".pdf,application/pdf"
        fileList={fileList}
        onChange={handleFileChange}
        beforeUpload={beforeUpload}
        maxCount={1}
        showUploadList={false}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">انقر أو اسحب ملف PDF هنا للتحميل</p>
        <p className="ant-upload-hint">
          يدعم الملفات بصيغة PDF فقط (حد أقصى 10MB)
        </p>
      </Upload.Dragger>
    );
  };

  const handleSubmit = async (values) => {
    if (!video) return;

    setLoading(true);
    try {
      let pdfUrl = existingPdfUrl;

      // Upload new PDF if selected
      if (pdfFile) {
        setUploadingPdf(true);
        try {
          pdfUrl = await uploadPdf(pdfFile, {
            onProgress: (progress) => {
              setUploadProgress(progress);
            },
          });
          setUploadingPdf(false);
        } catch (error) {
          setUploadingPdf(false);
          toast.error("فشل في رفع ملف PDF: " + error.message);
          setLoading(false);
          return;
        }
      }

      const response = await axios.post(
        `${baseUrl}/admin/videos/update_videos_info.php`,
        {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
          unit_video_id: video.unit_video_id,
          new_title: values.video_title,
          pdf_url: pdfUrl,
          solve: values.solve,
          tune: values.tune,
          words: values.words,
          source_video_id: video.source_video_id,
          course_id: video.course_id,
          unit_id: video.unit_id,
        }
      );

      if (response.data.status === "success") {
        toast.success("تم تحديث الفيديو بنجاح");
        setOpen(false);
        getVideos();
      } else {
        toast.error(response.data.message || "حدث خطأ أثناء تحديث الفيديو");
      }
    } catch (error) {
      console.error("Error updating video:", error);
      toast.error("حدث خطأ أثناء تحديث الفيديو");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <>
      <Drawer
        placement="left"
        title="تعديل الفيديو"
        open={open}
        onClose={() => {
          setOpen(false);
          form.resetFields();
          setFileList([]);
          setPdfFile(null);
          setPdfPreviewUrl("");
          setExistingPdfUrl("");
          setUploadProgress(0);
        }}
        footer={
          <Button
            type="primary"
            className="w-full"
            onClick={() => form.submit()}
            loading={loading || uploadingPdf}
            disabled={uploadingPdf}
          >
            {uploadingPdf
              ? `جاري رفع الملف... ${uploadProgress}%`
              : loading
              ? "جاري الحفظ..."
              : "حفظ التغييرات"}
          </Button>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="اسم الفيديو"
            name="video_title"
            rules={[{ required: true, message: "الرجاء إدخال اسم الفيديو" }]}
          >
            <Input placeholder="أدخل اسم الفيديو" />
          </Form.Item>

          <Form.Item
            label="فيديو تسميع الكلمات"
            name="words"
           
          >
            <Input placeholder="مثال: dQw4w9WgXcQ" />
          </Form.Item>

          <Form.Item
            label="فيديو لحن الأغنية"
            name="tune"
           
          >
            <Input placeholder="مثال: dQw4w9WgXcB" />
          </Form.Item>

          <Form.Item
            label="فيديو الحل"
            name="solve"
          >
            <Input placeholder="مثال: dQw4w9WgXcZ" />
          </Form.Item>

          <Form.Item label="ملف المذكرة (PDF)" name="pdf_file">
            <PdfUploadComponent />
          </Form.Item>
        </Form>
      </Drawer>

      {/* PDF Preview Modal */}
      <Modal
        title="معاينة الملف"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width="80%"
        style={{ top: 20 }}
      >
        {pdfPreviewUrl && (
          <iframe
            src={pdfPreviewUrl}
            width="100%"
            height="600px"
            title="PDF Preview"
            style={{ border: "none" }}
          />
        )}
      </Modal>
    </>
  );
};

export default EditVideo;
