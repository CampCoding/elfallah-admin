import { Button, Switch } from "antd";
import React, { useEffect, useState } from "react";
import { FileCheck, FileText, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../../utils/base_url";

const emore_user = JSON.parse(localStorage.getItem("emore_user"));

const useCoursesPage = () => {
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API = {
    getCourses: () => {
      return axios
        .post(`${baseUrl}/admin/courses/select_courses.php`, {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
        })
        .then((response) => {
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
    addCourse: () => {
      return axios
        .post(`${baseUrl}/admin/courses/add_course.php`, {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
          course_name: "Surgery Course",
          course_price: 1500,
          course_photo_url: "url image",
          course_content: "course content",
          university_id: "1",
          grade_id: "2",
        })
        .then((response) => {
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

    changeStatus: (course_id, status) => {
      return axios.post(`${baseUrl}/admin/courses/show_hide_course.php`, {
        admin_id: emore_user.admin_id,
        access_token: emore_user.access_token,
        course_id: course_id,
        status: status,
      });
    },
  };

  const getCourses = async () => {
    setLoading(true);
    try {
      const response = await API.getCourses();

      if (response.data.status == "success") {
        setData(response.data.message);
      }
    } catch (error) {
      console.error("Error getting courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (course) => {
    // console.log(course);
    // return;
    try {
      const response = await API.changeStatus(
        course.course_id,
        course.hidden == "no" ? "yes" : "no"
      );

      if (response.data.status == "success") {
        toast.success("تم تحديث حالة الدورة بنجاح");
        getCourses();
      }
    } catch (error) {
      console.error("Error updating course status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة الدورة");
    }
  };

  const headers = [
    { title: "الرقم", dataIndex: "course_id", key: "course_id" },
    { title: "الاسم", dataIndex: "course_name", key: "course_name" },
    { title: "الوصف", dataIndex: "course_content", key: "course_content" },
    {
      title: "الصورة",
      dataIndex: "course_photo_url",
      key: "course_photo_url",
      render: (course_photo_url) => (
        <img
          src={course_photo_url}
          alt="صورة الدورة"
          style={{ width: "50px", height: "50px", objectFit: "cover" }}
        />
      ),
    },
    {
      title: "الحالة",
      dataIndex: "hidden",
      key: "hidden",
      render: (hidden, record) => (
        <Switch
          checked={hidden == "no" ? true : false}
          onChange={() => {
            handleStatusChange(record);
          }}
          className={`not-target ${hidden == "no" ? "" : "bg-red-500"}`}
        />
      ),
    },
    // {
    //   title: "حذف",
    //   dataIndex: "course_id",
    //   key: "delete",
    //   render: (_, record) => (
    //     <Button
    //       type="link"
    //       title="حذف"
    //       className="!bg-transparent flex items-center justify-center p-2 hover:!bg-transparent not-target"
    //       onClick={(e) => {
    //         e.stopPropagation();
    //         setSelectedCourse(record);
    //         setDeleteModal(true);
    //       }}
    //     >
    //       <div className="flex items-center justify-center !text-red-500 hover:bg-red-400 p-2 rounded-md hover:!text-white transition-all duration-300">
    //         <Trash2 className="!mr-0 !w-[20px] !h-[20px]" />
    //       </div>
    //     </Button>
    //   ),
    // },
    {
      title: "الوحدات",
      dataIndex: "course_id",
      key: "units",
      render: (_, record) => (
        <Button
          type="link"
          title="الوحدات"
          className="!bg-transparent flex items-center justify-center p-2 hover:!bg-transparent not-target"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/units?courseId=${record.course_id}`, {
              state: {
                course: record,
              },
            });
          }}
        >
          <div className="flex items-center justify-center !text-blue-500 hover:bg-blue-400 p-2 rounded-md hover:!text-white transition-all duration-300">
            <FileText className="!mr-0 !w-[20px] !h-[20px]" />
          </div>
        </Button>
      ),
    },
    {
      title: "الاختبارات",
      dataIndex: "course_id",
      key: "exams",
      render: (_, record) => (
        <Button
          type="link"
          title="الاختبارات"
          className="!bg-transparent flex items-center justify-center p-2 hover:!bg-transparent not-target"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/exams?courseId=${record.course_id}`, {
              state: {
                course: record,
              },
            });
          }}
        >
          <div className="flex items-center justify-center !text-amber-500 hover:bg-amber-400 p-2 rounded-md hover:!text-white transition-all duration-300">
            <FileCheck className="!mr-0 !w-[20px] !h-[20px]" />
          </div>
        </Button>
      ),
    },
  ];

  useEffect(() => {
    getCourses();
  }, []);

  return {
    headers,
    addModal,
    setAddModal,
    editModal,
    setEditModal,
    selectedCourse,
    setSelectedCourse,
    deleteModal,
    setDeleteModal,
    data,
    getCourses,
    loading,
    handleStatusChange,
  };
};

export default useCoursesPage;
