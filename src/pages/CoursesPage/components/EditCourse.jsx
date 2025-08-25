import React, { useEffect, useState } from "react";
import { Button, Drawer, Form, Input, Select, Switch, Upload } from "antd";
import toast from "react-hot-toast";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import axios from "axios";
import { baseUrl } from "../../../utils/base_url";
import uploadImage from "../../../hooks/UploadImage.js";

const emore_user = JSON.parse(localStorage.getItem("emore_user"));

const EditCourse = ({ open, setOpen, course, getCourses }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [universitiesGrade, setUniversitiesGrade] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);

  const API = {
    updateCourse: (values, imageUrl) => {
      return axios
        .post(`${baseUrl}/admin/courses/edit_course.php`, {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
          course_id: course.id,
          course_name: values.name,
          course_price: course.price || 1500,
          course_photo_url: imageUrl,
          course_content: values.desc,
          university_id: values.university_id,
          grade_id: values.grade_id,
          free: course.free || "0",
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
          console.error("Error updating course:", error);
          return {
            data: {
              status: "error",
              message: error.response ? error.response.data : error.message,
            },
          };
        });
    },
    getUniversitiesGrade: () => {
      return axios
        .post(`${baseUrl}/admin/universities/select_universities_grade.php`, {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
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
          console.error("Error fetching universities grade:", error);
          return {
            data: {
              status: "error",
              message: error.response ? error.response.data : error.message,
            },
          };
        });
    },
  };

  const getUniversitiesGrade = async () => {
    setLoading(true);
    try {
      const response = await API.getUniversitiesGrade();

      if (response.data.status == "success") {
        setUniversitiesGrade(response.data.message);
      }
    } catch (error) {
      console.error("Error getting universities grade:", error);
      toast.error("حدث خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUniversitiesGrade();
  }, []);

  useEffect(() => {
    if (universitiesGrade.length > 0 && course) {
      // Find the university that matches the course's university_id
      const selectedUniversity = universitiesGrade.find(
        (item) => item.university_id === course.university_id
      );

      // Set grades based on the selected university
      if (selectedUniversity) {
        setGrades(selectedUniversity.grades || []);
      } else {
        // If no match found, default to first university's grades
        setGrades(universitiesGrade[0].grades || []);
      }
    }
  }, [universitiesGrade, course]);

  useEffect(() => {
    if (course) {
      form.setFieldsValue({
        name: course.course_name,
        desc: course.course_content,
        image: course.course_photo_url,
        university_id: course.university_id,
        grade_id: course.grade_id,
      });
      setImageUrl(course.course_photo_url);
    }
  }, [course, form, universitiesGrade]);

  // Convert file to base64 for preview
  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  // Handle image selection and preview
  const handleImageChange = (info) => {
    const { file } = info;

    if (!file) return;

    const fileObj = file.originFileObj || file;

    if (fileObj) {
      setImageFile(fileObj);

      getBase64(fileObj, (url) => {
        setImageUrl(url);
      });
    }
  };

  useEffect(() => {
    console.log(imageUrl);
  }, [imageUrl]);

  // Validate file before upload
  const beforeUpload = (file) => {
    const isJpgOrPng =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/jpg";
    if (!isJpgOrPng) {
      toast.error("يمكنك رفع صور JPG/PNG فقط!");
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5MB!");
      return false;
    }

    return false; // Prevent automatic upload, we'll handle it manually
  };

  // Custom upload button
  const uploadButton = (
    <div>
      {uploadingImage ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>
        {uploadingImage ? "جاري الرفع..." : "تغيير الصورة"}
      </div>
    </div>
  );

  // Handle form submission
  const submit = () => {
    form
      .validateFields()
      .then(async (values) => {
        setSubmitting(true);
        try {
          let finalImageUrl = course.course_photo_url; // Default to existing image

          // If a new image was selected, upload it
          if (imageFile) {
            setUploadingImage(true);
            finalImageUrl = await uploadImage(imageFile);
            setUploadingImage(false);
          }

          // Update course with the image URL (either new or existing)
          const response = await API.updateCourse(values, finalImageUrl);

          if (response.data.status === "success") {
            toast.success("تم تحديث الدورة بنجاح");
            handleClose();
            getCourses();
          } else {
            toast.error(response.data.message || "فشل تحديث الدورة");
          }
        } catch (error) {
          console.error("Error updating course:", error);
          toast.error("حدث خطأ أثناء تحديث الدورة");
        } finally {
          setSubmitting(false);
        }
      })
      .catch((error) => {
        console.error("Validation failed:", error);
      });
  };

  // Handle drawer close
  const handleClose = () => {
    setOpen(false);
    form.resetFields();
    setImageUrl("");
    setImageFile(null);
    setUploadingImage(false);
  };

  // Handle university selection change
  const handleUniversityChange = (value) => {
    const selectedUniversity = universitiesGrade.find(
      (item) => item.university_id === value
    );
    setGrades(selectedUniversity?.grades || []);
    form.setFieldsValue({ grade_id: null }); // Reset grade selection
  };

  return (
    <Drawer
      placement="left"
      title="تعديل الدورة"
      onClose={handleClose}
      open={open}
      className="rounded-[0_10px_10px_0px]"
      width={400}
      footer={
        <Button
          onClick={submit}
          className="mt-auto"
          htmlType="submit"
          type="primary"
          block
          loading={submitting}
          disabled={uploadingImage}
        >
          {submitting ? "جاري التحديث..." : "تحديث"}
        </Button>
      }
    >
      {course && (
        <Form form={form} layout="vertical" className="h-full flex flex-col">
          <Form.Item
            name="name"
            label="اسم الدورة"
            rules={[{ required: true, message: "برجاء إدخال اسم الدورة" }]}
          >
            <Input placeholder="أدخل اسم الدورة" />
          </Form.Item>

          <Form.Item
            name="desc"
            label="وصف الدورة"
            rules={[{ required: true, message: "برجاء إدخال وصف الدورة" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="أدخل وصف الدورة"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="university_id"
            label="المرحلة"
            rules={[{ required: true, message: "برجاء اختيار المرحلة" }]}
          >
            <Select
              virtual={false}
              placeholder="اختر المرحلة"
              loading={loading}
              options={universitiesGrade.map((item) => ({
                label: item.university_name,
                value: item.university_id,
              }))}
              onChange={handleUniversityChange}
            />
          </Form.Item>

          <Form.Item
            name="grade_id"
            label="الصف"
            rules={[{ required: true, message: "برجاء اختيار الصف" }]}
          >
            <Select
              virtual={false}
              placeholder="اختر الصف"
              disabled={grades.length === 0}
              options={grades.map((item) => ({
                label: item.grade_name,
                value: item.grade_id,
              }))}
            />
          </Form.Item>

          <Form.Item name="image" label="صورة الدورة">
            <Upload
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={beforeUpload}
              onChange={handleImageChange}
              accept="image/png,image/jpeg,image/jpg"
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Course preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                  onError={(e) => {
                    // If image fails to load, show a placeholder
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/150?text=No+Image";
                  }}
                />
              ) : (
                uploadButton
              )}
            </Upload>
          </Form.Item>

          {imageFile && (
            <Form.Item>
              <Button
                type="link"
                danger
                onClick={() => {
                  setImageUrl(course.course_photo_url); // Reset to original image
                  setImageFile(null);
                  form.setFieldsValue({ image: null });
                }}
              >
                إلغاء تغيير الصورة
              </Button>
            </Form.Item>
          )}
        </Form>
      )}
    </Drawer>
  );
};

export default EditCourse;
