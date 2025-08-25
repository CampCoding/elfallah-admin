import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { baseUrl } from "../../utils/base_url";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { Button, Tooltip } from "antd";

const emore_user = JSON.parse(localStorage.getItem("emore_user"));

const API = {
  getExamQuestions: (examId) => {
    const endpoint = `${baseUrl}/admin/Exams/select_exam_ques.php`;
    return axios
      .post(endpoint, {
        admin_id: emore_user.admin_id,
        access_token: emore_user.access_token,
        exam_id: examId,
      })
      .then((response) => {
        if (
          response.data.status === "error" &&
          response.data.message === "No questions found for this exam"
        ) {
          return {
            data: {
              status: "success",
              message: [],
            },
          };
        }

        // Handle normal success case
        if (response.data.status === "success") {
          return {
            data: {
              status: "success",
              message: response.data.message || [],
            },
          };
        }

        // Handle other error cases
        return {
          data: {
            status: "error",
            message: [],
          },
        };
      })
      .catch((error) => {
        console.error("Error fetching exam questions:", error);
        return {
          data: {
            status: "error",
            message: [],
          },
        };
      });
  },

  addExamQuestion: (question, examId) => {
    console.log("Adding question to exam:", question, examId);
    const endpoint = `${baseUrl}/admin/Exams/add_ques.php`;
    return axios
      .post(endpoint, {
        admin_id: emore_user.admin_id,
        access_token: emore_user.access_token,
        ...question,
        exam_id: examId,
      })
      .then((response) => {
        return {
          data: {
            status: "success",
            message: response.data.message || "تم إضافة السؤال بنجاح",
          },
        };
      })
      .catch((error) => {
        console.error("Error adding exam question:", error);
        return {
          data: {
            status: "error",
            message: error.response ? error.response.data : error.message,
          },
        };
      });
  },
};

const useExamQuesPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [exam, setExam] = useState(null);

  const [searchParams] = useSearchParams();
  const examId = searchParams.get("examId");

  const headers = [
    {
      title: "رقم السؤال",
      dataIndex: "question_id",
      key: "question_id",
      // width: 400,
    },
    {
      title: "السؤال",
      dataIndex: "question_text",
      key: "question_text",
      width: 400,
      render: (text, record) => {
        return (
          <Tooltip
            direction="ltr"
            placement="topLeft"
            title={
              <div
                style={{
                  direction: "ltr",
                }}
              >
                {record.question_text}
              </div>
            }
          >
            <div
              style={{
                direction: "ltr",
              }}
              className="max-w-[25rem] truncate"
            >
              {record.question_text}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "نوع السؤال",
      dataIndex: "type",
      key: "type",
      render: (type, record) => {
        switch (type) {
          case "mcq":
            return "اختيار من متعدد";

          case "arrangePuzzle":
            return `ترتيب ${
              record.game_type === "word" ? "الكلمات" : "الأحرف"
            }`;
          case "line-match":
            return "توصيل الخطوط";
          default:
            return type;
        }
      },
    },

    {
      title: "حذف",
      dataIndex: "unit_id",
      key: "delete",
      render: (_, record) => (
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
      ),
    },

    // { title: "المدة", dataIndex: "duration", key: "duration" },
  ];

  const getExamQuestions = useCallback(async () => {
    if (!examId) return;

    setLoading(true);
    try {
      const response = await API.getExamQuestions(parseInt(examId));

      if (response.data.status == "success") {
        setQuestions(response.data.message);
      }
    } catch (error) {
      console.error("Error getting exam questions:", error);
      toast.error("حدث خطأ أثناء جلب أسئلة الاختبار");
    } finally {
      setLoading(false);
    }
  }, [examId]);

  const getExam = useCallback(async () => {
    if (!examId) return;

    try {
      const response = await API.getExam(parseInt(examId));

      if (response.data.status == "success") {
        setExam(response.data.message);
      }
    } catch (error) {
      console.error("Error getting exam:", error);
    }
  }, [examId]);

  const addExamQuestion = async (questionData) => {
    try {
      const response = await API.addExamQuestion({
        ...questionData,
        exam_id: parseInt(examId),
      });

      if (response.data.status == "success") {
        toast.success("تم إضافة السؤال بنجاح");
        getExamQuestions();
      }
    } catch (error) {
      console.error("Error adding exam question:", error);
      toast.error("حدث خطأ أثناء إضافة السؤال");
    }
  };

  const assignQuestionToExam = async (questionId) => {
    try {
      // Since we're already in the exam context, we just need to assign the question to this exam
      const response = await axios.post(
        `${baseUrl}/admin/Exams/assign_ques_to_exam.php`,
        {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
          exam_id: parseInt(examId),
          question_id: questionId,
        }
      );

      if (response.data.status === "success") {
        toast.success("تم تعيين السؤال للاختبار بنجاح");
        getExamQuestions(); // Refresh questions after assignment
        return true;
      } else {
        toast.error(response.data.message || "فشل في تعيين السؤال للاختبار");
        return false;
      }
    } catch (error) {
      console.error("Error assigning question to exam:", error);
      toast.error("حدث خطأ أثناء تعيين السؤال للاختبار");
      return false;
    }
  };

  const deleteExamQuestion = async (questionId) => {
    try {
      const response = await API.deleteExamQuestion(questionId);

      if (response.data.status == "success") {
        toast.success("تم حذف السؤال بنجاح");
        getExamQuestions();
      }
    } catch (error) {
      console.error("Error deleting exam question:", error);
      toast.error("حدث خطأ أثناء حذف السؤال");
    }
  };

  useEffect(() => {
    if (examId) {
      getExamQuestions();
      getExam();
    }
  }, [examId, getExamQuestions, getExam]);

  return {
    questions,
    loading,
    addModal,
    setAddModal,
    deleteModal,
    setDeleteModal,
    selectedQuestion,
    setSelectedQuestion,
    examId,

    headers,
    getExamQuestions,
    addExamQuestion,
    deleteExamQuestion,
    assignQuestionToExam,
  };
};

export default useExamQuesPage;
