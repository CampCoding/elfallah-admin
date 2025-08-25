import React, { useCallback, useEffect, useState } from "react";
import { Modal, Form, Button, Select, Input, Upload, Progress } from "antd";
import toast from "react-hot-toast";
import { baseUrl } from "../../../utils/base_url";
import axios from "axios";
import useCoursesPage from "../../CoursesPage/useCoursesPage";
import {
  InboxOutlined,
  FileOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import uploadPdf from "../../../hooks/UploadPdf";

const emore_user = JSON.parse(localStorage.getItem("emore_user"));

const DuplicateVideo = ({ open, setOpen, video, getVideos }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [courseId, setCourseId] = useState(null);
  const [units, setUnits] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");

  const { data: courses, getCourses } = useCoursesPage();

  useEffect(() => {
    getCourses();
  }, []);

  const getUnits = useCallback(async () => {
    try {
      const response = await axios.post(
        `${baseUrl}/admin/courses/select_course_units.php`,
        {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
          course_id: +courseId,
        }
      );
      if (response.data.status === "success") {
        setUnits(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
      toast.error("حدث خطأ في تحميل الوحدات");
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      getUnits();
    } else {
      setUnits([]);
    }
  }, [courseId, getUnits]);

  const API = {
    assignVideo: (record) => {
      return axios.post(`${baseUrl}/admin/videos/assign_videos_to_unit.php`, {
        admin_id: emore_user.admin_id,
        access_token: emore_user.access_token,
        source_video_id: video.video_id,
        new_title: record.new_title,
        unit_id: record.unit_id,
        course_id: record.course_id,
        solve: record.video_id_solution,
        tune: record.video_id_sound,
        words: record.video_id_words,
        pdf_url: record.pdf_file,
      });
    },
  };

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
      setPdfPreviewUrl("");
    }
  };

  // Remove PDF file
  const handleRemovePdf = () => {
    setFileList([]);
    setPdfFile(null);
    setPdfPreviewUrl("");
    form.setFieldsValue({ pdf_file: null });
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

  const handleSubmit = async (values) => {
    if (!video) return;

    // if (!pdfFile) {
    //   toast.error("برجاء اختيار ملف PDF");
    //   return;
    // }

    setLoading(true);
    try {
      // Upload PDF first
      let uploadPdf = "";
      if (pdfFile) {
        setUploadingPdf(true);
        const uploadedPdfUrl = await uploadPdf(pdfFile, {
          onProgress: (progress) => {
            setUploadProgress(progress);
          },
        });

        uploadPdf = uploadedPdfUrl;
      } else {
        uploadPdf = "";
      }

      setUploadingPdf(false);
      console.log("Uploaded PDF URL:", uploadPdf);

      // Assign video with uploaded PDF URL
      const response = await API.assignVideo({
        ...values,
        pdf_file: uploadPdf,
      });

      if (response.data.status === "success") {
        toast.success("تم نسخ الفيديو بنجاح");
        handleModalClose();
        getVideos();
      } else {
        toast.error(response.data.message || "حدث خطأ أثناء نسخ الفيديو");
      }
    } catch (error) {
      console.error("Error duplicating video:", error);
      toast.error("حدث خطأ أثناء نسخ الفيديو");
      setUploadingPdf(false);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setOpen(false);
    form.resetFields();
    setFileList([]);
    setPdfFile(null);
    setPdfPreviewUrl("");
    setCourseId(null);
    setUnits([]);
    setUploadProgress(0);
    setUploadingPdf(false);
  };

  // Custom PDF upload component
  const PdfUploadComponent = () => {
    if (fileList.length > 0) {
      const file = fileList[0];
      return (
        <div className="border border-dashed border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileOutlined className="text-red-500 text-2xl" />
              <div className="flex-1">
                <p className="font-medium truncate max-w-xs">{file.name}</p>
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

  return (
    <>
      <Modal
        centered
        title="نسخ الفيديو إلى وحدات أخرى"
        open={open}
        onCancel={handleModalClose}
        footer={null}
        destroyOnClose
        width={600}
      >
        <p className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          سيتم نسخ الفيديو "<strong>{video?.video_title}</strong>" إلى الوحدات
          المحددة مع الاحتفاظ بجميع البيانات الأخرى.
        </p>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
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
              options={courses.map((course) => ({
                label: course.course_name,
                value: course.course_id,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="اختر الوحدة"
            name="unit_id"
            rules={[
              { required: true, message: "الرجاء اختيار وحدة واحدة على الأقل" },
            ]}
          >
            <Select
              virtual={false}
              disabled={!courseId || units.length === 0}
              placeholder={
                !courseId
                  ? "اختر الدورة أولاً"
                  : units.length === 0
                  ? "لا توجد وحدات متاحة"
                  : "اختر الوحدة"
              }
              allowClear
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              options={units.map((unit) => ({
                label: unit.unit_name,
                value: unit.unit_id,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="عنوان الفيديو الجديد"
            name="new_title"
            rules={[
              { required: true, message: "الرجاء إدخال عنوان الفيديو الجديد" },
              { min: 3, message: "العنوان يجب أن يكون 3 أحرف على الأقل" },
            ]}
          >
            <Input
              placeholder="عنوان الفيديو الجديد"
              showCount
              maxLength={100}
            />
          </Form.Item>

          <Form.Item label="فيديو تسميع الكلمات" name="video_id_words">
            <Input placeholder="مثال: dQw4w9WgXcQ" />
          </Form.Item>

          <Form.Item label="فيديو لحن الأغنية" name="video_id_sound">
            <Input placeholder="مثال: dQw4w9WgXcB" />
          </Form.Item>

          <Form.Item label="فيديو الحل" name="video_id_solution">
            <Input placeholder="مثال: dQw4w9WgXcZ" />
          </Form.Item>

          <Form.Item label="ملف المذكرة (PDF)" name="pdf_file">
            <PdfUploadComponent />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <div className="space-x-2">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={uploadingPdf}
                className="bg-goldenOrange hover:!bg-darkgold"
              >
                {uploadingPdf
                  ? `جاري رفع الملف... ${uploadProgress}%`
                  : loading
                  ? "جاري النسخ..."
                  : "نسخ الفيديو"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

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

export default DuplicateVideo;
