import { Button } from "antd";
import React, { useEffect, useState, useCallback } from "react";
import { Trash2, Edit } from "lucide-react";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

// Initial mock data for PDFs
const initialPDFs = [
  {
    id: 1,
    name: "مذكرة مقدمة البرمجة",
    pdf_file: "intro_to_programming.pdf",
    videoId: 1,
  },
  {
    id: 2,
    name: "تمارين البرمجة",
    pdf_file: "programming_exercises.pdf",
    videoId: 1,
  },
  {
    id: 3,
    name: "أساسيات JavaScript",
    pdf_file: "javascript_basics.pdf",
    videoId: 2,
  },
];

// Update videos to include pdfs array
const updateVideosWithPDFs = () => {
  const videos = localStorage.getItem("videos")
    ? JSON.parse(localStorage.getItem("videos"))
    : [];

  const pdfs = localStorage.getItem("pdfs")
    ? JSON.parse(localStorage.getItem("pdfs"))
    : initialPDFs;

  // Group PDFs by videoId
  const pdfsByVideo = {};
  pdfs.forEach((pdf) => {
    if (!pdfsByVideo[pdf.videoId]) {
      pdfsByVideo[pdf.videoId] = [];
    }
    pdfsByVideo[pdf.videoId].push(pdf);
  });

  // Update videos with pdfs array
  const updatedVideos = videos.map((video) => ({
    ...video,
    pdfs: pdfsByVideo[video.id] || [],
  }));

  localStorage.setItem("videos", JSON.stringify(updatedVideos));
};

// Simulate API responses
const mockAPI = {
  getPDFs: (videoId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Get PDFs from localStorage or use initial data
        const allPDFs = localStorage.getItem("pdfs")
          ? JSON.parse(localStorage.getItem("pdfs"))
          : initialPDFs;

        // Filter PDFs by videoId if provided
        const pdfs = videoId
          ? allPDFs.filter((pdf) => pdf.videoId === videoId)
          : allPDFs;

        resolve({
          data: {
            status: "success",
            message: pdfs,
          },
        });
      }, 500);
    });
  },
  addPDF: (pdf) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const pdfs = localStorage.getItem("pdfs")
          ? JSON.parse(localStorage.getItem("pdfs"))
          : initialPDFs;

        const newPDF = {
          ...pdf,
          id: Math.max(...pdfs.map((p) => p.id), 0) + 1,
        };

        const updatedPDFs = [...pdfs, newPDF];
        localStorage.setItem("pdfs", JSON.stringify(updatedPDFs));

        // Update videos with pdfs array
        updateVideosWithPDFs();

        resolve({
          data: {
            status: "success",
            message: "تم إضافة المذكرة بنجاح",
          },
        });
      }, 500);
    });
  },
  deletePDF: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const pdfs = localStorage.getItem("pdfs")
          ? JSON.parse(localStorage.getItem("pdfs"))
          : initialPDFs;

        const updatedPDFs = pdfs.filter((p) => p.id !== id);
        localStorage.setItem("pdfs", JSON.stringify(updatedPDFs));

        // Update videos with pdfs array
        updateVideosWithPDFs();

        resolve({
          data: {
            status: "success",
            message: "تم حذف المذكرة بنجاح",
          },
        });
      }, 500);
    });
  },
  getVideos: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Get videos from localStorage or use initial data
        const videos = localStorage.getItem("videos")
          ? JSON.parse(localStorage.getItem("videos"))
          : [];

        resolve({
          data: {
            status: "success",
            message: videos,
          },
        });
      }, 500);
    });
  },
};

const usePDFsPage = () => {
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [data, setData] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const videoId = new URLSearchParams(location.search).get("videoId");
  const video = location.state?.video;

  // Initialize pdfs in localStorage if not exists
  useEffect(() => {
    if (!localStorage.getItem("pdfs")) {
      localStorage.setItem("pdfs", JSON.stringify(initialPDFs));
    }
    // Update videos with pdfs array on first load
    updateVideosWithPDFs();
  }, []);

  const getPDFs = useCallback(async () => {
    setLoading(true);
    try {
      // Simulated API call
      const response = await mockAPI.getPDFs(
        videoId ? parseInt(videoId) : null
      );

      if (response.data.status === "success") {
        setData(response.data.message);
      }
    } catch (error) {
      console.error("Error getting PDFs:", error);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  const getVideos = useCallback(async () => {
    try {
      const response = await mockAPI.getVideos();
      if (response.data.status === "success") {
        setVideos(response.data.message);
      }
    } catch (error) {
      console.error("Error getting videos:", error);
    }
  }, []);

  const headers = [
    { title: "الرقم", dataIndex: "id", key: "id" },
    { title: "الاسم", dataIndex: "name", key: "name" },
    { title: "الملف", dataIndex: "pdf_file", key: "pdf_file" },

    {
      title: "حذف",
      dataIndex: "id",
      key: "delete",
      render: (_, record) => (
        <Button
          type="link"
          title="حذف"
          className="!bg-transparent flex items-center justify-center p-2 hover:!bg-transparent not-target"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPDF(record);
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
    getPDFs();
    getVideos();
  }, [getPDFs, getVideos]);

  return {
    headers,
    addModal,
    setAddModal,
    editModal,
    setEditModal,
    selectedPDF,
    setSelectedPDF,
    deleteModal,
    setDeleteModal,
    data,
    videos,
    getPDFs,
    loading,
    videoId,
    video,
  };
};

export default usePDFsPage;
