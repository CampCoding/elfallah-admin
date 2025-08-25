import { Button, Switch } from "antd";
import React, { useEffect, useState, useCallback } from "react";
import { BookOpen, HelpCircle, Trash2, Video } from "lucide-react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../../utils/base_url";

// Initial mock data for units

const emore_user = JSON.parse(localStorage.getItem("emore_user"));

// Simulate API responses

const useUnitsPage = () => {
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const courseId = new URLSearchParams(location.search).get("courseId");
  const course = location.state?.course;
  const navigate = useNavigate();

  const API = {
    getUnits: (course_id = courseId) => {
      return axios
        .post(`${baseUrl}/admin/courses/select_course_units.php`, {
          admin_id: emore_user.admin_id,
          access_token: emore_user.access_token,
          course_id: +course_id,
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

    changeStatus: (unit_id, status) => {
      return axios.post(`${baseUrl}/admin/courses/show_hide_unit.php`, {
        admin_id: emore_user.admin_id,
        access_token: emore_user.access_token,
        unit_id: unit_id,
        status: status,
      });
    },
  };
  const getUnits = useCallback(async () => {
    setLoading(true);
    try {
      // Simulated API call
      const response = await API.getUnits();

      if (response.data.status === "success") {
        setData(response.data.message);
      }
    } catch (error) {
      console.error("Error getting units:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStatusChange = async (unit) => {
    try {
      const response = await API.changeStatus(
        unit.unit_id,
        unit.hidden == "no" ? "yes" : "no"
      );

      if (response.data.status == "success") {
        toast.success("تم تحديث حالة الدورة بنجاح");
        getUnits();
      }
    } catch (error) {
      console.error("Error updating course status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة الدورة");
    }
  };

  const headers = [
    { title: "الرقم", dataIndex: "unit_id", key: "unit_id" },
    { title: "الاسم", dataIndex: "unit_name", key: "unit_name" },
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
    //   dataIndex: "unit_id",
    //   key: "delete",
    //   render: (_, record) => (
    //     <Button
    //       type="link"
    //       title="حذف"
    //       className="!bg-transparent flex items-center justify-center p-2 hover:!bg-transparent not-target"
    //       onClick={(e) => {
    //         e.stopPropagation();
    //         setSelectedUnit(record);
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
      title: "الفيديوهات",
      dataIndex: "unit_id",
      key: "videos",
      render: (_, record) => (
        <Button
          type="link"
          title="الفيديوهات"
          className="!bg-transparent flex items-center justify-center p-2 hover:!bg-transparent not-target"
          onClick={(e) => {
            e.stopPropagation();
            // setSelectedUnit(record);
            // setDeleteModal(true);
            navigate(`/unit-videos?unitId=${record.unit_id}`, {
              state: {
                unit: record,
              },
            });
          }}
        >
          <div className="flex items-center justify-center !text-blue-500 hover:bg-blue-400 p-2 rounded-md hover:!text-white transition-all duration-300">
            <Video className="!mr-0 !w-[20px] !h-[20px]" />
          </div>
        </Button>
      ),
    },

    {
      title: "الأسئلة",
      dataIndex: "unit_id",
      key: "questions",
      render: (_, record) => (
        <Button
          type="link"
          title="الأسئلة"
          className="!bg-transparent flex items-center justify-center p-2 hover:!bg-transparent not-target"
          onClick={(e) => {
            e.stopPropagation();
            navigate(
              `/questions?courseId=${courseId}&unitId=${record.unit_id}`,
              {
                state: {
                  unit: record,
                },
              }
            );
          }}
        >
          <div className="flex items-center justify-center !text-purple-500 hover:bg-purple-400 p-2 rounded-md hover:!text-white transition-all duration-300">
            <HelpCircle className="!mr-0 !w-[20px] !h-[20px]" />
          </div>
        </Button>
      ),
    },
  ];

  useEffect(() => {
    getUnits();
  }, [courseId, getUnits]);

  return {
    headers,
    addModal,
    setAddModal,
    editModal,
    setEditModal,
    selectedUnit,
    setSelectedUnit,
    deleteModal,
    setDeleteModal,
    data,
    getUnits,
    loading,
    handleStatusChange,
    courseId,
    course,
  };
};

export default useUnitsPage;
