import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import axios from "axios";
import toast from "react-hot-toast";
import { baseUrl } from "../../../utils/base_url";

const AddNoteModal = ({ open, setOpen, refreshData }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);
    const [units, setUnits] = useState([]);
    const [videos, setVideos] = useState([]);
    const [fileList, setFileList] = useState([]);

    const emore_user = JSON.parse(localStorage.getItem("emore_user"));

    // Fetch Courses on Mount
    useEffect(() => {
        if (open) {
            fetchCourses();
        }
    }, [open]);

    const fetchCourses = async () => {
        try {
            const response = await axios.post(
                `${baseUrl}/admin/courses/select_courses.php`,
                {
                    admin_id: emore_user?.admin_id,
                    access_token: emore_user?.access_token,
                }
            );
            if (response.data.status === "success") {
                setCourses(response.data.message);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    const handleCourseChange = async (courseId) => {
        form.setFieldsValue({ unit_id: undefined, video_id: undefined });
        setUnits([]);
        setVideos([]);
        try {
            const response = await axios.post(
                `${baseUrl}/admin/courses/select_course_units.php`,
                {
                    admin_id: emore_user?.admin_id,
                    access_token: emore_user?.access_token,
                    course_id: courseId,
                }
            );
            if (response.data.status === "success") {
                setUnits(response.data.message);
            }
        } catch (error) {
            console.error("Error fetching units:", error);
        }
    };

    const handleUnitChange = async (unitId) => {
        form.setFieldsValue({ video_id: undefined });
        setVideos([]);
        try {
            const response = await axios.post(
                `${baseUrl}/admin/videos/select_unit_videos.php`,
                {
                    admin_id: emore_user?.admin_id,
                    access_token: emore_user?.access_token,
                    unit_id: unitId,
                }
            );
            if (response.data.status === "success") {
                setVideos(response.data.message);
            }
        } catch (error) {
            console.error("Error fetching videos:", error);
        }
    };

    const handleFileChange = ({ fileList }) => {
        setFileList(fileList);
    };

    const onFinish = async (values) => {
        if (fileList.length === 0) {
            toast.error("الرجاء تحميل ملف المذكرة");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("book_title", values.book_title);
        formData.append("book_course", values.course_id);
        formData.append("book_unit", values.unit_id);
        formData.append("book_video", values.video_id);
        formData.append("book_file", fileList[0].originFileObj);

        // Append admin credentials if needed by the backend (not in user request snippet, but good practice if auth required)
        // Based on user request snippet, it only checks POST vars for book details.
        // However, usually admin_id/access_token are needed. The snippet doesn't show auth check, but other endpoints do.
        // I will stick to what the user provided in the snippet, plus add auth just in case or if standard.
        // The snippet: $unit_id = $_POST['book_unit']; ... include("../../user_db_con.php");
        // It doesn't seem to check auth in the snippet, but I'll send just the required fields.

        try {
            const response = await axios.post(
                `${baseUrl}/admin/courses/add_pdf.php`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.status === "success") {
                toast.success("تم إضافة المذكرة بنجاح");
                setOpen(false);
                form.resetFields();
                setFileList([]);
                refreshData();
            } else {
                toast.error(response.data.message || "حدث خطأ أثناء إضافة المذكرة");
            }
        } catch (error) {
            console.error("Error adding note:", error);
            toast.error("حدث خطأ أثناء الاتصال بالخادم");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="إضافة مذكرة جديدة"
            open={open}
            onCancel={() => setOpen(false)}
            footer={null}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="book_title"
                    label="عنوان المذكرة"
                    rules={[{ required: true, message: "يرجى إدخال عنوان المذكرة" }]}
                >
                    <Input placeholder="عنوان المذكرة" />
                </Form.Item>

                <Form.Item
                    name="course_id"
                    label="الكورس"
                >
                    <select
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => handleCourseChange(e.target.value)}
                    >
                        <option value="">اختر الكورس</option>
                        {courses.map((c) => (
                            <option key={c.course_id} value={c.course_id}>
                                {c.course_name}
                            </option>
                        ))}
                    </select>
                </Form.Item>

                <Form.Item
                    name="unit_id"
                    label="الوحدة"
                >
                    <select
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        onChange={(e) => handleUnitChange(e.target.value)}
                        disabled={!units.length}
                    >
                        <option value="">اختر الوحدة</option>
                        {units.map((u) => (
                            <option key={u.unit_id} value={u.unit_id}>
                                {u.unit_name}
                            </option>
                        ))}
                    </select>
                </Form.Item>

                <Form.Item
                    name="video_id"
                    label="الفيديو"
                >
                    <select
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={!videos.length}
                    >
                        <option value="">اختر الفيديو</option>
                        {videos.map((v) => (
                            <option key={v.video_id} value={v.video_id}>
                                {v.video_title}
                            </option>
                        ))}
                    </select>
                </Form.Item>

                <Form.Item label="ملف المذكرة" required>
                    <Upload.Dragger
                        name="file"
                        accept=".pdf"
                        fileList={fileList}
                        onChange={handleFileChange}
                        beforeUpload={() => false}
                        maxCount={1}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">اضغط أو اسحب الملف هنا</p>
                    </Upload.Dragger>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        إضافة
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddNoteModal;
