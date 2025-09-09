import { Button, Switch } from "antd";
import React, { useEffect, useState, useCallback } from "react";
import { Trash2, Copy, FileText, HelpCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../../utils/base_url";

// Simulate API responses
const emore_user = JSON.parse(localStorage.getItem("emore_user"));

export const API = {
  getVideos: (unitId) => {
    const endpoint = unitId
      ? `${baseUrl}/admin/videos/select_unit_videos.php`
      : `${baseUrl}/admin/videos/select_videos.php`;
    return axios
      .post(endpoint, {
        admin_id: emore_user.admin_id,
        access_token: emore_user.access_token,
        ...(unitId && { unit_id: unitId }),
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
        console.error("Error fetching courses:", error);
        return {
          data: {
            status: "error",
            message: error.response ? error.response.data : error.message,
          },
        };
      });
  },

  // deleteVideo: (video_id) => {
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       const videos = localStorage.getItem("videos")
  //         ? JSON.parse(localStorage.getItem("videos"))
  //         : [];

  //       const updatedVideos = videos.filter((v) => v.video_id !== video_id);
  //       localStorage.setItem("videos", JSON.stringify(updatedVideos));

  //       resolve({
  //         data: {
  //           status: "success",
  //           message: "تم حذف الفيديو بنجاح",
  //         },
  //       });
  //     }, 500);
  //   });
  // },
  duplicateVideo: (video, newUnitId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const videos = localStorage.getItem("videos")
          ? JSON.parse(localStorage.getItem("videos"))
          : [];

        const newVideo = {
          ...video,
          video_id: Math.max(...videos.map((v) => v.video_id), 0) + 1,
          unitId: newUnitId,
        };

        const updatedVideos = [...videos, newVideo];
        localStorage.setItem("videos", JSON.stringify(updatedVideos));

        resolve({
          data: {
            status: "success",
            message: "تم نسخ الفيديو بنجاح",
          },
        });
      }, 500);
    });
  },
  getUnits: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Get units from localStorage or use initial data
        const units = localStorage.getItem("units")
          ? JSON.parse(localStorage.getItem("units"))
          : [];

        resolve({
          data: {
            status: "success",
            message: units,
          },
        });
      }, 500);
    });
  },
};

const useVideosPage = () => {
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [duplicateModal, setDuplicateModal] = useState(false);
  const [data, setData] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const unitId = new URLSearchParams(location.search).get("unitId");
  const unit = location.state?.unit;

  useEffect(() => {
    console.log(data);
  }, [data]);

  const getVideos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.getVideos(unitId ? parseInt(unitId) : null);

      if (response.data.status == "success") {
        setData(response.data.message);
      }
    } catch (error) {
      console.error("Error getting videos:", error);
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  const getUnits = useCallback(async () => {
    try {
      const response = await API.getUnits();
      if (response.data.status === "success") {
        setUnits(response.data.message);
      }
    } catch (error) {
      console.error("Error getting units:", error);
    }
  }, []);

  const handleDuplicate = async (video, unitIds) => {
    try {
      // Create an array of promises for each unit ID
      const duplicatePromises = unitIds.map((unitId) =>
        API.duplicateVideo(video, parseInt(unitId))
      );

      // Wait for all duplications to complete
      const responses = await Promise.all(duplicatePromises);

      // Check if all operations were successful
      const allSuccessful = responses.every(
        (response) => response.data.status === "success"
      );

      if (allSuccessful) {
        const unitCount = unitIds.length;
        toast.success(
          `تم نسخ الفيديو إلى ${unitCount} ${
            unitCount === 1 ? "وحدة" : "وحدات"
          } بنجاح`
        );
        getVideos();
      }
    } catch (error) {
      console.error("Error duplicating video:", error);
      toast.error("حدث خطأ أثناء نسخ الفيديو");
    }
  };

  const headers = [
    { title: "الرقم", dataIndex: "video_id", key: "video_id" },
    { title: "الاسم", dataIndex: "video_title", key: "video_title" },
    {
      title: "الأسئلة",
      dataIndex: "questions",
      key: "questions",
      render: (questions) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          {questions?.length || 0}
        </span>
      ),
    },

    {
      title: "نسخ",
      dataIndex: "video_id",
      key: "duplicate",
      render: (_, record) => (
        <Button
          type="link"
          title="نسخ"
          className="!bg-transparent flex items-center justify-center p-2 hover:!bg-transparent not-target"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedVideo(record);
            setDuplicateModal(true);
          }}
        >
          <div className="flex items-center justify-center !text-blue-500 hover:bg-blue-400 p-2 rounded-md hover:!text-white transition-all duration-300">
            <Copy className="!mr-0 !w-[20px] !h-[20px]" />
          </div>
        </Button>
      ),
    },

    // {
    //   title: "المذكرات",
    //   dataIndex: "pdfs",
    //   key: "pdf",
    //   render: (_, record) => (
    //     <Button
    //       type="link"
    //       title="المذكرات"
    //       className="!bg-transparent flex items-center justify-center p-2 hover:!bg-transparent not-target"
    //       onClick={(e) => {
    //         e.stopPropagation();
    //         navigate(`/pdfs?videoId=${record.video_id}`, {
    //           state: {
    //             video: record,
    //           },
    //         });
    //       }}
    //     >
    //       <div className="flex items-center justify-center !text-green-500 hover:bg-green-400 p-2 rounded-md hover:!text-white transition-all duration-300">
    //         <FileText className="!mr-0 !w-[20px] !h-[20px]" />
    //       </div>
    //     </Button>
    //   ),
    // },
    {
      title: "الأسئلة التفاعلية",
      dataIndex: "interactive_questions",
      key: "interactive_questions",
      render: (_, record) => (
        <Button
          type="link"
          title="الأسئلة التفاعلية"
          className="!bg-transparent flex items-center justify-center p-2 hover:!bg-transparent not-target"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/interactive-questions?videoId=${record.video_id}`, {
              state: {
                video: record,
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
  ];

  useEffect(() => {
    getVideos();
    getUnits();
  }, [getVideos, getUnits]);

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
    duplicateModal,
    setDuplicateModal,
    data,
    units,
    getVideos,
    loading,
    handleDuplicate,
    unitId,
    unit,
  };
};

export default useVideosPage;
