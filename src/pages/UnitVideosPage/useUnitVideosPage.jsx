import { Button, Switch } from "antd";
import React, { useEffect, useState, useCallback } from "react";
import { Trash2, Edit, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../../utils/base_url";

// Get user from localStorage
const emore_user = JSON.parse(localStorage.getItem("emore_user"));

export const API = {
  getUnitVideos: (unitId) => {
    return axios
      .post(`${baseUrl}/admin/videos/select_unit_videos.php`, {
        admin_id: emore_user.admin_id,
        access_token: emore_user.access_token,
        unit_id: unitId,
      })
      .then((response) => {
        if (response.data.status == "success") {
          return {
            data: {
              status: "success",
              message: response.data.message,
            },
          };
        }
      })
      .catch((error) => {
        console.error("Error fetching unit videos:", error);
        return {
          data: {
            status: "error",
            message: error.response ? error.response.data : error.message,
          },
        };
      });
  },

  toggleVideoStatus: (video_id, hidden_value) => {
    return axios
      .post(`${baseUrl}/admin/videos/update_videos_hidden.php`, {
        admin_id: emore_user.admin_id,
        access_token: emore_user.access_token,
        unit_video_id: video_id,
        hidden_value: hidden_value,
      })
      .then((response) => {
        if (response.status == 200) {
          return {
            data: {
              status: "success",
              message: response.data || response.data.message,
            },
          };
        }
      })
      .catch((error) => {
        console.error("Error toggling video status:", error);
        return {
          data: {
            status: "error",
            message: error.response ? error.response.data : error.message,
          },
        };
      });
  },
};

const useUnitVideosPage = () => {
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const unitId = new URLSearchParams(location.search).get("unitId");
  const unit = location.state?.unit;

  const getUnitVideos = useCallback(async () => {
    if (!unitId) return;

    setLoading(true);
    try {
      const response = await API.getUnitVideos(parseInt(unitId));

      if (response.data.status == "success") {
        setData(response.data.message);
      }
    } catch (error) {
      console.error("Error getting unit videos:", error);
      toast.error("حدث خطأ أثناء جلب الفيديوهات");
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  const handleToggleStatus = async (video) => {
    try {
      const response = await API.toggleVideoStatus(
        video.unit_video_id,
        video.hidden == "no" ? "yes" : "no"
      );

      if (response.data.status === "success") {
        toast.success(
          `تم ${video.hidden == "no" ? "إلغاء تفعيل" : "تفعيل"} الفيديو بنجاح`
        );
        getUnitVideos();
      } else {
        toast.error("حدث خطأ أثناء تغيير حالة الفيديو");
      }
    } catch (error) {
      console.error("Error toggling video status:", error);
      toast.error("حدث خطأ أثناء تغيير حالة الفيديو");
    }
  };

  const headers = [
    { title: "الرقم", dataIndex: "unit_video_id", key: "unit_video_id" },
    { title: "الاسم", dataIndex: "new_title", key: "new_title" },
    {
      title: "الحالة",
      dataIndex: "hidden",
      key: "hidden",
      render: (hidden, record) => (
        <Switch
          checked={hidden == "no" ? true : false}
          onChange={() => {
            handleToggleStatus(record);
          }}
          className={`not-target ${hidden == "no" ? "" : "bg-red-500"}`}
        />
      ),
    },

    {
      title: "حذف",
      dataIndex: "video_id",
      key: "delete",
      render: (_, record) => (
        <Button
          type="link"
          title="حذف"
          className="!bg-transparent flex items-center justify-center p-2 hover:!bg-transparent not-target"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedVideo(record);
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

  useEffect(() => {
    if (unitId) {
      getUnitVideos();
    }
  }, [getUnitVideos, unitId]);

  return {
    headers,
    addModal,
    setAddModal,
    editModal,
    setEditModal,
    selectedVideo,
    setSelectedVideo,
    deleteModal,
    setDeleteModal,
    data,
    getUnitVideos,
    loading,

    handleToggleStatus,
    unitId,
    unit,
  };
};

export default useUnitVideosPage;
