import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { baseUrl } from "../../utils/base_url";
import { useSearchParams } from "react-router-dom";
import { Button, Modal } from "antd";
import toast from "react-hot-toast";

const useNotesPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addModal, setAddModal] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const [courses, setCourses] = useState([]);
    const [units, setUnits] = useState([]);
    const [videos, setVideos] = useState([]);

    const emore_user = JSON.parse(localStorage.getItem("emore_user"));

    // Get filters from URL
    const courseId = searchParams.get("course_id");
    const unitId = searchParams.get("unit_id");
    const videoId = searchParams.get("video_id");

    const getNotes = useCallback(async () => {
        setLoading(true);
        try {
            const filters = {};
            if (courseId && courseId != "null") filters.course_id = courseId;
            if (unitId && unitId != "null") filters.unit_id = unitId;
            if (videoId && videoId != "null") filters.video_id = videoId;


            const response = await axios.post(
                `${baseUrl}/admin/courses/select_pdf.php?${Object.keys(filters).map((key) => `${key}=${filters[key]}`).join("&")}`,
                filters
            );
            if (response.data.status === "success") {
                setData(response.data.message);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error("Error fetching notes:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [courseId, unitId, videoId]);


    useEffect(() => {
        setSearchParams({ course_id: courseId, unit_id: null, video_id: null })
    }, [courseId])
    const getCourses = async () => {
        try {
            const response = await axios.post(
                `${baseUrl}/admin/courses/select_courses.php`,
                {
                    admin_id: emore_user?.admin_id,
                    access_token: emore_user?.access_token,
                }
            );
            if (response.data.status === "success") {
                setCourses(response.data.message);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    const getUnits = useCallback(async () => {
        if (!courseId) {
            setUnits([]);
            return;
        }
        try {
            const response = await axios.post(
                `${baseUrl}/admin/courses/select_course_units.php`,
                {
                    admin_id: emore_user?.admin_id,
                    access_token: emore_user?.access_token,
                    course_id: courseId,
                }
            );
            if (response.data.status === "success") {
                setUnits(response.data.message);
            } else {
                setUnits([]);
            }
        } catch (error) {
            console.error("Error fetching units:", error);
        }
    }, [courseId, emore_user?.admin_id, emore_user?.access_token]);

    const getVideos = useCallback(async () => {
        if (!unitId) {
            setVideos([]);
            return;
        }
        try {
            const response = await axios.post(
                `${baseUrl}/admin/videos/select_unit_videos.php`,
                {
                    admin_id: emore_user?.admin_id,
                    access_token: emore_user?.access_token,
                    unit_id: unitId,
                }
            );
            if (response.data.status === "success") {
                setVideos(response.data.message);
            } else {
                setVideos([]);
            }
        } catch (error) {
            console.error("Error fetching videos:", error);
        }
    }, [unitId, emore_user?.admin_id, emore_user?.access_token]);

    useEffect(() => {
        getCourses();
    }, []);

    useEffect(() => {
        getUnits();
    }, [getUnits]);

    useEffect(() => {
        getVideos();
    }, [getVideos]);

    useEffect(() => {
        getNotes();
    }, [getNotes]);

    const handleFilterChange = (key, value) => {
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            if (value) {
                newParams.set(key, value);
            } else {
                newParams.delete(key);
            }

            // Reset dependent filters
            if (key === "course_id") {
                newParams.delete("unit_id");
                newParams.delete("video_id");
            }
            if (key === "unit_id") {
                newParams.delete("video_id");
            }

            return newParams;
        });
    };

    const clearFilters = () => {
        setSearchParams({});
    };

    const [editModal, setEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);

    const handleDelete = (record) => {
        setSelectedNote(record);
        setDeleteModal(true);
    };

    const headers = [
        {
            title: "معرف المذكرة",
            dataIndex: "book_id",
            key: "book_id",
        },
        {
            title: "عنوان المذكرة",
            dataIndex: "book_title",
            key: "book_title",
            render: (text) => text || "غير محدد",
        },
        {
            title: "رابط المذكرة",
            dataIndex: "book_url",
            key: "book_url",
            render: (text) =>
                text ? (
                    <a
                        href={text}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                    >
                        عرض الملف
                    </a>
                ) : (
                    "لا يوجد رابط"
                ),
        },
        {
            title: "تاريخ الإضافة",
            dataIndex: "add_date",
            key: "add_date",
        },
        {
            title: "مخفي",
            dataIndex: "hidden",
            key: "hidden",
        },
        {
            title: "إجراءات",
            key: "actions",
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button
                        type="primary"
                        onClick={() => {
                            setSelectedNote(record);
                            setEditModal(true);
                        }}
                    >
                        تعديل
                    </Button>
                    <Button
                        type="primary"
                        danger
                        onClick={() => handleDelete(record)}
                    >
                        حذف
                    </Button>
                </div>
            ),
        },
    ];

    return {
        data,
        loading,
        headers,
        getNotes,
        courses,
        units,
        videos,
        filters: {
            course_id: courseId,
            unit_id: unitId,
            video_id: videoId,
        },
        handleFilterChange,
        clearFilters,
        addModal,
        setAddModal,
        editModal,
        setEditModal,
        deleteModal,
        setDeleteModal,
        selectedNote,
    };
};

export default useNotesPage;
