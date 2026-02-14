import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import axios from "axios";
import toast from "react-hot-toast";
import { baseUrl } from "../../../utils/base_url";

const EditNoteModal = ({ open, setOpen, refreshData, note }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);
    const [units, setUnits] = useState([]);
    const [videos, setVideos] = useState([]);
    const [fileList, setFileList] = useState([]);

    const emore_user = JSON.parse(localStorage.getItem("emore_user"));

    // Fetch Courses and Initial Data on Mount/Open
    useEffect(() => {
        if (open && note) {
            // Pre-fill form
            form.setFieldsValue({
                book_title: note.book_title,
                course_id: note.course_id ? Number(note.course_id) : undefined,
                unit_id: note.unit_id ? Number(note.unit_id) : undefined,
                video_id: note.unit_video_id ? Number(note.unit_video_id) : undefined, // Assuming column name is unit_video_id or handled
            });

            // Fetch initial data
            fetchCourses();
            if (note.course_id) handleCourseChange(note.course_id, false);
            if (note.unit_id) handleUnitChange(note.unit_id, false);
        } else {
            form.resetFields();
            setFileList([]);
        }
    }, [open, note]);

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

    const handleCourseChange = async (courseId, resetChildren = true) => {
        if (resetChildren) {
            form.setFieldsValue({ unit_id: undefined, video_id: undefined });
            setUnits([]);
            setVideos([]);
        }

        if (!courseId) return;

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

    const handleUnitChange = async (unitId, resetChildren = true) => {
        if (resetChildren) {
            form.setFieldsValue({ video_id: undefined });
            setVideos([]);
        }

        if (!unitId) return;

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
        setLoading(true);
        const formData = new FormData();
        formData.append("book_id", note.book_id);
        if (values.book_title) formData.append("book_title", values.book_title);
        if (values.course_id) formData.append("book_course", values.course_id);
        if (values.unit_id) formData.append("book_unit", values.unit_id);
        if (values.video_id) formData.append("book_video", values.video_id);

        if (fileList.length > 0) {
            formData.append("book_file", fileList[0].originFileObj);
        }

        try {
            const response = await axios.post(
                `${baseUrl}/admin/courses/edit_pdf.php`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.status === "success") {
                toast.success("تم تعديل المذكرة بنجاح");
                setOpen(false);
                form.resetFields();
                setFileList([]);
                refreshData();
            } else {
                toast.error(response.data.message || "حدث خطأ أثناء تعديل المذكرة");
            }
        } catch (error) {
            console.error("Error editing note:", error);
            toast.error("حدث خطأ أثناء الاتصال بالخادم");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="تعديل المذكرة"
            open={open}
            onCancel={() => setOpen(false)}
            footer={null}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="book_title"
                    label="عنوان المذكرة"
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

                <Form.Item label="ملف المذكرة (اختياري)">
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
                        <p className="ant-upload-text">اضغط أو اسحب الملف هنا لتغييره</p>
                    </Upload.Dragger>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        حفظ التغييرات
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditNoteModal;
