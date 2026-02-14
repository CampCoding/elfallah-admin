import React from "react";
import { Card, Col, Row, Select, Button } from "antd";
import DataTable from "../../layout/DataTable";
import useNotesPage from "./useNotesPage";
import AddNoteModal from "./components/AddNoteModal";
import EditNoteModal from "./components/EditNoteModal";
import DeleteNoteModal from "./components/DeleteNoteModal";
import { Plus } from "lucide-react";

const NotesPage = () => {
    const {
        data,
        loading,
        headers,
        courses,
        units,
        videos,
        filters,
        handleFilterChange,
        clearFilters,
        addModal,
        setAddModal,
        getNotes,
        editModal,
        setEditModal,
        selectedNote,
        deleteModal,
        setDeleteModal,
    } = useNotesPage();

    return (
        <div className="tabled">
            <Row className="">
                <Col xs="24" xl={24} className="!w-full">
                    <Card
                        bordered={false}
                        className="!w-full mb-24"
                        title="المذكرات"
                        extra={
                            <Button
                                type="primary"
                                onClick={() => setAddModal(true)}
                                className="flex items-center gap-2"
                            >
                                <Plus size={16} />
                                إضافة مذكرة
                            </Button>
                        }
                    >
                        <div className="flex flex-wrap gap-4 mb-4 items-end">
                            <div className="flex flex-col gap-2 w-full md:w-1/4">
                                <label className="text-gray-600">اختر الكورس</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={filters.course_id || ""}
                                    onChange={(e) => handleFilterChange("course_id", e.target.value)}
                                >
                                    <option value="">اختر الكورس</option>
                                    {courses.map((course) => (
                                        <option key={course.course_id} value={course.course_id}>
                                            {course.course_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-2 w-full md:w-1/4">
                                <label className="text-gray-600">اختر الوحدة</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    value={filters.unit_id || ""}
                                    onChange={(e) => handleFilterChange("unit_id", e.target.value)}
                                    disabled={!filters.course_id}
                                >
                                    <option value="">اختر الوحدة</option>
                                    {units.map((unit) => (
                                        <option key={unit.unit_id} value={unit.unit_id}>
                                            {unit.unit_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* <div className="flex flex-col gap-2 w-full md:w-1/4">
                                <label className="text-gray-600">اختر الفيديو</label>
                                <Select
                                    placeholder="اختر الفيديو"
                                    className="w-full"
                                    value={filters.video_id ? Number(filters.video_id) : null}
                                    onChange={(value) => handleFilterChange("video_id", value)}
                                    options={videos.map((video) => ({
                                        label: video.video_title,
                                        value: video.video_id,
                                    }))}
                                    disabled={!filters.unit_id}
                                    allowClear
                                />
                            </div> */}

                            <div className="flex flex-col gap-2">
                                <label className="invisible">حذف الفلترة</label>
                                <Button
                                    type="primary"
                                    danger
                                    onClick={clearFilters}
                                    disabled={
                                        !filters.course_id && !filters.unit_id && !filters.video_id
                                    }
                                >
                                    حذف الفلترة
                                </Button>
                            </div>
                        </div>

                        <div className="">
                            <DataTable
                                loading={loading}
                                table={{ header: headers, rows: data }}
                                searchPlaceholder="بحث في المذكرات"
                            />
                        </div>
                    </Card>
                </Col>
            </Row>
            <AddNoteModal
                open={addModal}
                setOpen={setAddModal}
                refreshData={getNotes}
            />
            <EditNoteModal
                open={editModal}
                setOpen={setEditModal}
                refreshData={getNotes}
                note={selectedNote}
            />
            <DeleteNoteModal
                open={deleteModal}
                setOpen={setDeleteModal}
                refreshData={getNotes}
                noteId={selectedNote?.book_id}
            />
        </div>
    );
};

export default NotesPage; 
