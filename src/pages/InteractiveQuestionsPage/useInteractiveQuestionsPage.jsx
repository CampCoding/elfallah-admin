import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../../utils/base_url";
import toast from "react-hot-toast";
import { Button, Tag } from "antd";
import { EditIcon, Trash2 } from "lucide-react";

const emore_user = JSON.parse(localStorage.getItem("emore_user"));

export const API = {
  getInteractiveQuestions: (videoId) => {
    return axios
      .post(
        `${baseUrl}/admin/interactive_videos/select_video_interactive_questions.php`,
        {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
          video_id: videoId,
        }
      )
      .then((response) => {
        if (response.status === 200) {
          // Ensure the message is an array
          let questions = [];
          if (response.data) {
            if (Array.isArray(response.data)) {
              questions = response.data;
            } else if (response.data.message) {
              if (Array.isArray(response.data.message)) {
                questions = response.data.message;
              } else if (
                typeof response.data.message === "object" &&
                response.data.message !== null
              ) {
                // If it's an object, convert to array
                questions = [response.data.message];
              }
            } else if (response.data.data) {
              if (Array.isArray(response.data.data)) {
                questions = response.data.data;
              }
            }
          }

          return {
            data: {
              status: "success",
              message: questions,
            },
          };
        }
      })
      .catch((error) => {
        console.error("Error fetching interactive questions:", error);
        return {
          data: {
            status: "error",
            message: [],
          },
        };
      });
  },

  addInteractiveQuestion: (data) => {
    return axios
      .post(
        `${baseUrl}/admin/interactive_videos/add_interactive_question.php`,
        {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
          ...data,
        }
      )
      .then((response) => response.data)
      .catch((error) => {
        console.error("Error adding interactive question:", error);
        throw error;
      });
  },

  updateInteractiveQuestion: (data) => {
    return axios
      .post(
        `${baseUrl}/admin/interactive_videos/update_interactive_question.php`,
        {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
          ...data,
        }
      )
      .then((response) => response.data)
      .catch((error) => {
        console.error("Error updating interactive question:", error);
        throw error;
      });
  },

  deleteInteractiveQuestion: (interactive_question_id) => {
    return axios
      .post(
        `${baseUrl}/admin/interactive_videos/delete_interactive_question.php`,
        {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
          interactive_question_id,
        }
      )
      .then((response) => response.data)
      .catch((error) => {
        console.error("Error deleting interactive question:", error);
        throw error;
      });
  },
};

const useInteractiveQuestionsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [video, setVideo] = useState(null);

  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const location = useLocation();
  const videoId = new URLSearchParams(location.search).get("videoId");
  const videoData = location.state?.video;

  const getInteractiveQuestions = useCallback(async () => {
    if (!videoId) {
      setData([]);
      return;
    }

    setLoading(true);
    try {
      const response = await API.getInteractiveQuestions(parseInt(videoId));
      if (response.data.status === "success") {
        // Ensure we're setting an array
        const questions = Array.isArray(response.data.message)
          ? response.data.message
          : [];
        setData(questions);
      } else {
        setData([]); // Set empty array on error
      }
    } catch (error) {
      console.error("Error getting interactive questions:", error);
      toast.error("حدث خطأ أثناء تحميل الأسئلة التفاعلية");
      setData([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  const handleAdd = async (questionData) => {
    setSubmitting(true);
    try {
      const response = await API.addInteractiveQuestion({
        video_id: parseInt(videoId),
        ...questionData,
      });

      if (response.status === "success") {
        toast.success("تم إضافة السؤال التفاعلي بنجاح");
        await getInteractiveQuestions(); // Refresh the list
        return true;
      } else {
        toast.error(response.message || "حدث خطأ أثناء إضافة السؤال");
        return false;
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء إضافة السؤال التفاعلي");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (questionData) => {
    try {
      const response = await API.updateInteractiveQuestion(questionData);

      if (response.status === "success") {
        toast.success("تم تحديث السؤال التفاعلي بنجاح");
        await getInteractiveQuestions(); // Refresh the list
        return true;
      } else {
        toast.error(response.message || "حدث خطأ أثناء تحديث السؤال");
        return false;
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث السؤال التفاعلي");
      return false;
    }
  };

  const handleDelete = async (interactive_question_id) => {
    try {
      const response = await API.deleteInteractiveQuestion(
        interactive_question_id
      );

      if (response.status === "success") {
        toast.success("تم حذف السؤال التفاعلي بنجاح");
        await getInteractiveQuestions(); // Refresh the list
        return true;
      } else {
        toast.error(response.message || "حدث خطأ أثناء حذف السؤال");
        return false;
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف السؤال التفاعلي");
      return false;
    }
  };

  const columns = [
    {
      title: "السؤال",
      dataIndex: "question_text",
      key: "question_text",
      render: (text) => (
        <div className="max-w-xs truncate" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: "وقت الظهور",
      dataIndex: "show_time",
      key: "show_time",
      render: (time) => (
        <Tag color="blue" className="font-mono">
          {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, "0")}
        </Tag>
      ),
    },
    {
      title: "الحالة",
      dataIndex: "active",
      key: "active",
      render: (active) => (
        <Tag color={active === "yes" ? "green" : "red"}>
          {active === "yes" ? "نشط" : "غير نشط"}
        </Tag>
      ),
    },
    {
      title: "الإجراءات",
      key: "actions",
      render: (_, record) => (
        <div className="flex items-center">
          {/* Delete Button - Red */}
          <Button
            type="link"
            title="حذف"
            className="!bg-transparent flex items-center justify-center p-2 hover:!bg-transparent not-target"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedQuestion(record);
              setDeleteModal(true);
            }}
          >
            <div className="flex items-center justify-center !text-red-500 hover:bg-red-400 p-2 rounded-md hover:!text-white transition-all duration-300">
              <Trash2 className="!mr-0 !w-[20px] !h-[20px]" />
            </div>
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (videoData) {
      setVideo(videoData);
    }
    getInteractiveQuestions();
  }, [getInteractiveQuestions, videoData]);

  return {
    data,
    loading,
    video,
    getInteractiveQuestions,
    handleAdd,
    handleUpdate,
    handleDelete,
    submitting,
    columns,
    // Added missing modal state and setters
    selectedQuestion,
    setSelectedQuestion,
    editModal,
    setEditModal,
    deleteModal,
    setDeleteModal,
  };
};

export default useInteractiveQuestionsPage;
