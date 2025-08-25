import { Card, Col, Row } from "antd";
import DataTable from "./../../layout/DataTable";
import useExamsPage from "./useExamsPage";
import AddExam from "./components/AddExam";
import EditExam from "./components/EditExam";
import DeleteExam from "./components/DeleteExam";
import DuplicateExam from "./components/DuplicateExam";
import AssignExamToVideos from "./components/AssignExamToVideos";

const ExamsPage = () => {
  const {
    data,
    headers,
    addModal,
    setAddModal,
    editModal,
    setEditModal,
    selectedExam,
    setSelectedExam,
    deleteModal,
    setDeleteModal,
    duplicateModal,
    setDuplicateModal,
    getExams,
    assignedVideo,
    setAssignedVideo,
    loading,
  } = useExamsPage();

  // Sort data by id
  const sortedData = data.sort((a, b) => a.exam_id - b.exam_id);

  return (
    <div className="tabled">
      <Row className="">
        <Col xs="24" xl={24} className="!w-full">
          <Card bordered={false} className="!w-full mb-24" extra={""}>
            <div className="">
              <DataTable
                onRow={(record) => {
                  return {
                    onClick: (e) => {
                      if (e.target.closest(".not-target")) {
                        return;
                      }
                      setSelectedExam(record);
                      setEditModal(true);
                    },
                  };
                }}
                loading={loading}
                addBtn={true}
                btnText={
                  <span>
                    إضافة اختبار <span>+</span>
                  </span>
                }
                onAddClick={() => setAddModal(true)}
                searchPlaceholder={"بحث في الاختبارات"}
                table={{ header: headers, rows: sortedData }}
                rowClassName={() => {
                  return "cursor-pointer hover:bg-gray-100 transition-colors duration-200";
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>
      <AddExam
        open={addModal}
        setOpen={setAddModal}
        data={data}
        getExams={getExams}
      />

      <EditExam
        open={editModal}
        setOpen={setEditModal}
        exam={selectedExam}
        getExams={getExams}
      />

      <DeleteExam
        open={deleteModal}
        setOpen={setDeleteModal}
        getExams={getExams}
        exam={selectedExam}
      />

      <DuplicateExam
        open={duplicateModal}
        setOpen={setDuplicateModal}
        getExams={getExams}
        exam={selectedExam}
      />

      <AssignExamToVideos
        open={assignedVideo}
        setOpen={setAssignedVideo}
        getExams={getExams}
        exam={selectedExam}
      />
    </div>
  );
};

export default ExamsPage;
