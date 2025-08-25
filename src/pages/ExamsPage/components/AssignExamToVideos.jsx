import React, { useState, useEffect } from "react";
import { Modal, Form, Select, Button, Spin, message, Input, Tabs } from "antd";
import { Video, BookOpen, Layers, Clock, X } from "lucide-react";
import axios from "axios";
import { baseUrl } from "../../../utils/base_url";
import toast from "react-hot-toast";
import useCoursesPage from "./../../CoursesPage/useCoursesPage";

const { Option } = Select;

const AssignExamToVideos = ({ open, setOpen, exam, getExams }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [assignedVideos, setAssignedVideos] = useState([]);
  const [assignedVideosLoading, setAssignedVideosLoading] = useState(false);
  const [assignedVideosList, setAssignedVideosList] = useState([]); // Fixed: was incorrectly set to false

  // Added missing states
  const [activeTab, setActiveTab] = useState("assign");
  const [unassigningVideos, setUnassigningVideos] = useState([]);

  // New states for courses and units
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [units, setUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const { getCourses, data: courses } = useCoursesPage();

  useEffect(() => {
    getCourses();
  }, []);

  const emore_user = JSON.parse(localStorage.getItem("emore_user"));

  const API = {
    getAllVideos: () => {
      return axios.post(`${baseUrl}/admin/videos/select_videos.php`, {
        admin_id: emore_user.admin_id,
        access_token: emore_user.access_token,
      });
    },
    getCourseUnits: (courseId) => {
      return axios.post(`${baseUrl}/admin/courses/select_course_units.php`, {
        course_id: courseId,
        admin_id: emore_user.admin_id,
        access_token: emore_user.access_token,
      });
    },
    getUnitVideos: (unitId) => {
      return axios.post(`${baseUrl}/admin/videos/select_unit_videos.php`, {
        unit_id: unitId,
        admin_id: emore_user.admin_id,
        access_token: emore_user.access_token,
      });
    },
    getAssignedVideos: (examId) => {
      return axios.post(
        `${baseUrl}/admin/Exams/select_assigned_video_by_exam.php`,
        {
          exam_id: examId,
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
        }
      );
    },
    assignExamToVideos: (data) => {
      return axios.post(`${baseUrl}/admin/Exams/assign_to_video.php`, {
        ...data,
        admin_id: emore_user.admin_id,
        access_token: emore_user.access_token,
      });
    },
  };

  useEffect(() => {
    if (open && exam) {
      fetchAssignedVideos();
      // Fetch assigned videos for unassign tab if it's active
      if (activeTab === "unassign") {
        fetchAssignedVideosForUnassign();
      }
    }
  }, [open, exam]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setSelectedCourse(null);
      setSelectedUnit(null);
      setUnits([]);
      setVideos([]);
      setActiveTab("assign"); // Reset to first tab
      setAssignedVideosList([]);
      setUnassigningVideos([]);
    }
  }, [open]);

  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId);
    setSelectedUnit(null);
    setVideos([]);
    form.setFieldsValue({ unit_id: null, video_ids: [] });

    if (courseId) {
      fetchUnits(courseId);
    } else {
      setUnits([]);
    }
  };

  const handleUnitChange = async (unitId) => {
    setSelectedUnit(unitId);
    setVideos([]);
    form.setFieldsValue({ video_ids: [] });

    if (unitId) {
      fetchUnitVideos(unitId);
    }
  };

  const fetchUnits = async (courseId) => {
    setUnitsLoading(true);
    try {
      const response = await API.getCourseUnits(courseId);
      if (response.status === 200) {
        setUnits(response.data?.message || []);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
      toast.error("حدث خطأ أثناء جلب الوحدات");
      setUnits([]);
    } finally {
      setUnitsLoading(false);
    }
  };

  const fetchUnitVideos = async (unitId) => {
    setVideosLoading(true);
    try {
      const response = await API.getUnitVideos(unitId);
      if (response.data.status === "success") {
        setVideos(response.data?.message || []);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("حدث خطأ أثناء جلب الفيديوهات");
      setVideos([]);
    } finally {
      setVideosLoading(false);
    }
  };

  const fetchAssignedVideos = async () => {
    if (!exam) return;
    try {
      const response = await API.getAssignedVideos(exam.exam_id);
      if (response.data.status === "success") {
        const assigned =
          response?.data?.data?.map((v) => v.source_video_id.toString()) || [];
        setAssignedVideos(assigned);
      }
    } catch (error) {
      console.error("Error fetching assigned videos:", error);
    }
  };

  // Fetch assigned videos for unassign tab
  const fetchAssignedVideosForUnassign = async () => {
    if (!exam) return;
    setAssignedVideosLoading(true);
    try {
      const response = await API.getAssignedVideos(exam.exam_id);
      if (response.data.status === "success") {
        setAssignedVideosList(response.data?.data || []);
      } else {
        setAssignedVideosList([]);
      }
    } catch (error) {
      console.error("Error fetching assigned videos:", error);
      toast.error("حدث خطأ أثناء جلب الفيديوهات المعينة");
      setAssignedVideosList([]);
    } finally {
      setAssignedVideosLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === "unassign") {
      fetchAssignedVideosForUnassign();
    }
  };

  // Handle unassign video
  const handleUnassignVideo = async (videoId) => {
    if (!exam) return;

    setUnassigningVideos((prev) => [...prev, videoId]);
    try {
      const response = await axios.post(
        `${baseUrl}/admin/Exams/unassign_from_video.php`,
        {
          exam_id: exam.exam_id,
          video_data: videoId,
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
        }
      );

      if (response.data.status === "success") {
        toast.success("تم إلغاء تعيين الاختبار من الفيديو بنجاح");
        fetchAssignedVideosForUnassign();
        getExams();
      } else {
        toast.error(response.data.message || "حدث خطأ أثناء إلغاء التعيين");
      }
    } catch (error) {
      console.error("Error unassigning video:", error);
      toast.error("حدث خطأ أثناء إلغاء تعيين الاختبار");
    } finally {
      setUnassigningVideos((prev) => prev.filter((id) => id !== videoId));
    }
  };

  const handleSubmit = async (values) => {
    if (!exam) return;

    setLoading(true);
    try {
      const videoData = values.video_ids.join("***videoemore***");
      const response = await API.assignExamToVideos({
        exam_id: exam.exam_id,
        video_data: videoData,
        timer: values.timer,
      });

      if (response.data.status === "success") {
        toast.success("تم تعيين الاختبار للفيديوهات بنجاح");
        form.resetFields();
        setOpen(false);
        getExams();
      } else {
        toast.error(response.data.message || "حدث خطأ أثناء التعيين");
      }
    } catch (error) {
      console.error("Error assigning exam to videos:", error);
      toast.error("حدث خطأ أثناء تعيين الاختبار للفيديوهات");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedCourse(null);
    setSelectedUnit(null);
    setUnits([]);
    setVideos([]);
    setActiveTab("assign");
    setAssignedVideosList([]);
    setUnassigningVideos([]);
    setOpen(false);
  };

  const tabItems = [
    {
      key: "assign",
      label: (
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4" />
          <span>تعيين جديد</span>
        </div>
      ),
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            label={
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>اضف الوقت (بالثواني)</span>
              </div>
            }
            name="timer"
            rules={[
              { required: true, message: "الرجاء إدخال الوقت بالثواني" },
              {
                pattern: /^[0-9]+$/,
                message: "الرجاء إدخال أرقام فقط",
              },
            ]}
          >
            <Input placeholder="مثال: 60" type="number" min="1" />
          </Form.Item>

          {/* Course Selection */}
          <Form.Item
            label={
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>اختر الكورس</span>
              </div>
            }
            name="course_id"
            rules={[{ required: true, message: "الرجاء اختيار الكورس" }]}
          >
            <Select
              virtual={false}
              placeholder="اختر الكورس"
              onChange={handleCourseChange}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              className="w-full"
            >
              {courses?.map((course) => (
                <Option key={course.course_id} value={course.course_id}>
                  {course.course_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Unit Selection */}
          <Form.Item
            label={
              <div className="flex items-center gap-1">
                <Layers className="w-4 h-4" />
                <span>اختر الوحدة</span>
              </div>
            }
            name="unit_id"
            rules={[{ required: true, message: "الرجاء اختيار الوحدة" }]}
          >
            <Select
              virtual={false}
              placeholder="اختر الوحدة"
              onChange={handleUnitChange}
              disabled={!selectedCourse}
              loading={unitsLoading}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              className="w-full"
            >
              {units?.map((unit) => (
                <Option key={unit.unit_id} value={unit.unit_id}>
                  {unit.unit_name || unit.unit_title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Video Selection */}
          <Form.Item
            label={
              <div className="flex items-center gap-1">
                <Video className="w-4 h-4" />
                <span>اختر الفيديوهات</span>
              </div>
            }
            name="video_ids"
            rules={[
              { required: true, message: "الرجاء اختيار فيديو واحد على الأقل" },
            ]}
          >
            <Select
              virtual={false}
              mode="multiple"
              placeholder="اختر الفيديوهات التي تريد تعيين الاختبار لها"
              disabled={!selectedUnit}
              loading={videosLoading}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              className="w-full"
            >
              {videos?.map((video) => (
                <Option
                  key={video.source_video_id}
                  value={video.source_video_id.toString()}
                  disabled={assignedVideos.includes(
                    video.source_video_id.toString()
                  )}
                >
                  {video.new_title}
                  {assignedVideos.includes(
                    video.source_video_id.toString()
                  ) && (
                    <span className="text-green-600 text-xs ml-2">
                      (مُعين مسبقاً)
                    </span>
                  )}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={handleCancel}>إلغاء</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              تعيين الاختبار
            </Button>
          </div>
        </Form>
      ),
    },
    {
      key: "unassign",
      label: (
        <div className="flex items-center gap-2">
          <X className="w-4 h-4" />
          <span>إلغاء التعيين</span>
        </div>
      ),
      children: (
        <div className="mt-4">
          {assignedVideosLoading ? (
            <div className="flex justify-center py-8">
              <Spin size="large" />
            </div>
          ) : assignedVideosList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد فيديوهات معينة لهذا الاختبار
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {assignedVideosList?.map((video) => (
                <div
                  key={video.source_video_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{video.video_title}</p>
                    {/* <p className="text-sm text-gray-600">
                      {video.course_name} - {video.unit_name}
                    </p> */}
                  </div>
                  <Button
                    // danger
                    size="small"
                    // icon={<X className="w-3 h-3" />}
                    loading={unassigningVideos.includes(
                      video.source_video_id.toString()
                    )}
                    onClick={() =>
                      handleUnassignVideo(video.source_video_id.toString())
                    }
                  >
                    إلغاء التعيين
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          <span>تعيين الاختبار للفيديوهات</span>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      className="assign-exam-modal"
    >
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
        className="assign-exam-tabs"
      />
    </Modal>
  );
};

export default AssignExamToVideos;
