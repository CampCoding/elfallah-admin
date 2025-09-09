import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { baseUrl } from "../../utils/base_url";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { Button, Tooltip } from "antd";

const emore_user = JSON.parse(localStorage.getItem("emore_user"));

const API = {
  getQuestions: (unitId, courseId) => {
    const endpoint = `${baseUrl}/admin/Exams/select_questions.php`;
    return axios
      .post(endpoint, {
        admin_id: emore_user.admin_id,
        access_token: emore_user.access_token,
        unit_id: unitId,
        course_id: courseId,
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
        console.error("Error fetching video questions:", error);
        return {
          data: {
            status: "error",
            message: error.response ? error.response.data : error.message,
          },
        };
      });
  },

  addQuestion: (question) => {
    const endpoint = `${baseUrl}/admin/Units/add_ques.php`;
    return axios
      .post(endpoint, {
        admin_id: emore_user.admin_id,
        access_token: emore_user.access_token,
        ...question,
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
        console.error("Error adding video question:", error);
        return {
          data: {
            status: "error",
            message: error.response ? error.response.data : error.message,
          },
        };
      });
  },

  deleteQuestion: (questionId) => {
    const endpoint = `${baseUrl}/admin/ُExams/delete_question.php`;
    return axios
      .post(endpoint, {
        admin_id: emore_user.admin_id,
        access_token: emore_user.access_token,
        question_id: questionId,
      })
      .then((response) => {
        return {
          data: {
            status: "success",
            message: response.data.message || "تم حذف السؤال بنجاح",
          },
        };
      })
      .catch((error) => {
        console.error("Error deleting question:", error);
        return {
          data: {
            status: "error",
            message: error.response ? error.response.data : error.message,
          },
        };
      });
  },
};

const useQuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [assignModal, setAssignModal] = useState(false);
  const [unit, setUnit] = useState(null);
  const [course, setCourse] = useState(null);

  const [searchParams] = useSearchParams();
  const unitId = searchParams.get("unitId");
  const courseId = searchParams.get("courseId");

  const headers = [
    {
      title: "الرقم",
      dataIndex: "question_id",
      key: "question_id",
      // width: 100,
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
          case "line-match":
            return "توصيل";
          case "arrangePuzzle":
            return `ترتيب ${
              record.game_type === "word" ? "الكلمات" : "الأحرف"
            }`;
          default:
            return type;
        }
      },
    },

    {
      title: "تعيين للاختبار",
      key: "assign",
      render: (_, record) => (
        <Button
          type="link"
          title="تعيين للاختبار"
          className="!bg-transparent flex items-center justify-center p-2 hover:!bg-transparent not-target"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedQuestion(record);
            setAssignModal(true);
          }}
        >
          <div className="flex items-center justify-center !text-blue-500 hover:bg-blue-400 p-2 rounded-md hover:!text-white transition-all duration-300">
            <span className="text-xs">تعيين</span>
          </div>
        </Button>
      ),
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
  ];

  const getQuestions = useCallback(async () => {
    if (!unitId || !courseId) return;

    setLoading(true);
    try {
      const response = await API.getQuestions(
        parseInt(unitId),
        parseInt(courseId)
      );

      if (response.data.status == "success") {
        setQuestions(response.data.message);
      }
    } catch (error) {
      console.error("Error getting unit questions:", error);
      toast.error("حدث خطأ أثناء جلب أسئلة الوحدة");
    } finally {
      setLoading(false);
    }
  }, [unitId, courseId]);

  const getUnit = useCallback(async () => {
    if (!unitId || !courseId) return;

    try {
      const response = await API.getUnit(parseInt(unitId), parseInt(courseId));

      if (response.data.status == "success") {
        setUnit(response.data.message);
      }
    } catch (error) {
      console.error("Error getting unit:", error);
    }
  }, [unitId, courseId]);

  const getCourse = useCallback(async () => {
    if (!courseId) return;

    try {
      const response = await API.getCourse(parseInt(courseId));

      if (response.data.status == "success") {
        setCourse(response.data.message);
      }
    } catch (error) {
      console.error("Error getting course:", error);
    }
  }, [courseId]);

  const addQuestion = async (questionData) => {
    try {
      const response = await API.addQuestion({
        ...questionData,
        unit_id: parseInt(unitId),
        course_id: parseInt(courseId),
      });

      if (response.data.status == "success") {
        toast.success("تم إضافة السؤال بنجاح");
        getQuestions();
      }
    } catch (error) {
      console.error("Error adding unit question:", error);
      toast.error("حدث خطأ أثناء إضافة السؤال");
    }
  };

  useEffect(() => {
    if (unitId && courseId) {
      getQuestions();
      getUnit();
      getCourse();
    }
  }, [unitId, courseId, getQuestions, getUnit, getCourse]);

  const assignQuestionToExam = async (examId, questionId) => {
    try {
      const response = await axios.post(
        `${baseUrl}/admin/Exams/assign_ques_to_exam.php`,
        {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
          exam_id: examId,
          question_id: questionId,
        }
      );

      if (response.data.status === "success") {
        toast.success("تم تعيين السؤال للاختبار بنجاح");
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

  return {
    questions,
    loading,
    addModal,
    setAddModal,
    deleteModal,
    setDeleteModal,
    assignModal,
    setAssignModal,
    selectedQuestion,
    setSelectedQuestion,
    unitId,
    courseId,
    unit,
    course,
    headers,
    getQuestions,
    addQuestion,
    assignQuestionToExam,
  };
};

export default useQuestionsPage;
