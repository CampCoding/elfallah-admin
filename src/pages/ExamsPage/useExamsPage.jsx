import { Button, Switch } from "antd";
import React, { useEffect, useState } from "react";
import { Trash2, HelpCircle, Copy, Video } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { baseUrl } from "../../utils/base_url";
import axios from "axios";
import dayjs from "dayjs";

const emore_user = JSON.parse(localStorage.getItem("emore_user"));

const API = {
  getExams: (courseId) => {
    const endpoint = courseId
      ? `${baseUrl}/admin/Exams/select_course_exam.php`
      : `${baseUrl}/admin/Exams/select_all_exams.php`;
    return axios
      .post(endpoint, {
        admin_id: emore_user.admin_id,
        access_token: emore_user.access_token,
        ...(courseId && { course_id: courseId }),
      })
      .then((response) => {
        console.log(response);
        return {
          data: {
            status: "success",
            message: response.data.message, // Assuming the API returns courses in 'courses' field
          },
        };
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        return {
          data: {
            status: "error",
            message: error.response ? error.response.data : error.message, // Handling Axios error response
          },
        };
      });
  },
};

const useExamsPage = () => {
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [duplicateModal, setDuplicateModal] = useState(false);
  const [assignedVideo, setAssignedVideo] = useState(false);
  const [data, setData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("courseId");
  const navigate = useNavigate();

  const getExams = async () => {
    setLoading(true);
    try {
      // Simulated API call
      const response = await API.getExams(courseId);

      if (response.data.status === "success") {
        setData(response.data.message);
      }
    } catch (error) {
      console.error("Error getting exams:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, checked) => {
    try {
      const examToUpdate = data.find((exam) => exam.exam_id === id);
      if (examToUpdate) {
        const updatedExam = { ...examToUpdate, status: checked };

        // Simulated API call
        const response = await API.updateExam(updatedExam);

        if (response.data.status === "success") {
          toast.success("تم تحديث حالة الاختبار بنجاح");
          getExams();
        }
      }
    } catch (error) {
      console.error("Error updating exam status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة الاختبار");
    }
  };

  const assignExamToVideos = async (examId, videoIds) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${baseUrl}/admin/Exams/assign_to_video.php`,
        {
          exam_id: examId,
          video_data: videoIds.join(","),
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
        }
      );

      if (response.data.status === "success") {
        toast.success("تم تعيين الاختبار للفيديوهات بنجاح");
        getExams();
        return { success: true };
      } else {
        toast.error(response.data.message || "حدث خطأ أثناء التعيين");
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("Error assigning exam to videos:", error);
      toast.error("حدث خطأ أثناء تعيين الاختبار للفيديوهات");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const unassignExamFromVideo = async (examId, videoId) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${baseUrl}/admin/Exams/unassign_from_video.php`,
        {
          exam_id: examId,
          video_data: videoId,
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
        }
      );

      if (response.data.status === "success") {
        toast.success("تم إلغاء تعيين الاختبار من الفيديو بنجاح");
        getExams();
        return { success: true };
      } else {
        toast.error(response.data.message || "حدث خطأ أثناء الإلغاء");
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("Error unassigning exam from video:", error);
      toast.error("حدث خطأ أثناء إلغاء تعيين الاختبار من الفيديو");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getAssignedVideos = async (examId) => {
    try {
      const response = await axios.post(
        `${baseUrl}/admin/Exams/select_assigned_video_by_exam.php`,
        {
          exam_id: examId,
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
        }
      );

      if (response.data.status === "success") {
        return { success: true, data: response.data.message };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("Error getting assigned videos:", error);
      return { success: false, message: error.message };
    }
  };

  const headers = [
    { title: "الرقم", dataIndex: "exam_id", key: "exam_id" },
    { title: "اسم الاختبار", dataIndex: "exam_name", key: "exam_name" },
    {
      title: "تاريخ البدء",
      dataIndex: "start_date",
      key: "start_date",
      render: (start_date) => (
        <span>{dayjs(start_date).format("DD/MM/YYYY")}</span>
      ),
    },
    {
      title: "تاريخ الانتهاء",
      dataIndex: "end_date",
      key: "end_date",
      render: (end_date) => <span>{dayjs(end_date).format("DD/MM/YYYY")}</span>,
    },
    {
      title: "الوصف",
      dataIndex: "exam_description",
      key: "exam_description",
      render: (exam_description) => (
        <span className="truncate max-w-[10rem]">{exam_description}</span>
      ),
    },
    {
      title: "نوع الاختبار",
      dataIndex: "type",
      key: "type",
      render: (type) => <span>{type === "unit" ? "وحدة" : "فيديو"}</span>,
    },

    {
      title: "نسخ",
      dataIndex: "exam_id",
      key: "duplicate",
      render: (_, record) => (
        <Button
          type="link"
          title="نسخ"
          className="!bg-transparent flex items-center justify-center p-2 hover:!bg-transparent not-target"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedExam(record);
            setDuplicateModal(true);
          }}
        >
          <div className="flex items-center justify-center !text-blue-500 hover:bg-blue-400 p-2 rounded-md hover:!text-white transition-all duration-300">
            <Copy className="!mr-0 !w-[20px] !h-[20px]" />
          </div>
        </Button>
      ),
    },

    {
      title: "الأسئلة",
      dataIndex: "questions",
      key: "questions_link",
      render: (_, record) => (
        <Button
          type="link"
          title="الأسئلة"
          className="!bg-transparent flex items-center justify-center p-2 hover:!bg-transparent not-target"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/exam-questions?examId=${record.exam_id}`, {
              state: {
                exam: record,
              },
            });
          }}
        >
          <div className="flex items-center justify-center !text-purple-500 hover:bg-purple-400 p-2 rounded-md hover:!text-white transition-all duration-300">
            <HelpCircle className="!mr-0 !w-[20px] !h-[20px]" />
          </div>
        </Button>
      ),
    },
    {
      title: "الفيديوهات",
      dataIndex: "videos",
      key: "videos_link",
      render: (_, record) => (
        <Button
          type="link"
          title="تعيين للفيديوهات"
          className="!bg-transparent flex items-center justify-center p-2 hover:!bg-transparent not-target"
          onClick={(e) => {
            e.stopPropagation();
            setAssignedVideo(true);
            setSelectedExam(record);
          }}
        >
          <div className="flex items-center justify-center !text-green-500 hover:bg-green-400 p-2 rounded-md hover:!text-white transition-all duration-300">
            <Video className="!mr-0 !w-[20px] !h-[20px]" />
          </div>
        </Button>
      ),
    },
  ];

  useEffect(() => {
    getExams();
  }, [courseId]);

  return {
    headers,
    addModal,
    setAddModal,
    editModal,
    setEditModal,
    selectedExam,
    setSelectedExam,
    deleteModal,
    setDeleteModal,
    duplicateModal,
    setDuplicateModal,
    assignedVideo,
    setAssignedVideo,
    data,
    courses,
    getExams,
    loading,
    handleStatusChange,
    assignExamToVideos,
    unassignExamFromVideo,
    getAssignedVideos,
  };
};

export default useExamsPage;
