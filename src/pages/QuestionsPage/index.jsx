import React, { useState } from "react";
import { Card, Col, Row, Button, Empty, Space } from "antd";
import { ArrowRight, Eye } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import DataTable from "../../layout/DataTable";
import useQuestionsPage from "./useQuestionsPage";
import AddQuestion from "./components/AddQuestion";
import DeleteQuestion from "./components/DeleteQuestion";
import QuestionDetailsModal from "./components/QuestionDetailsModal";
import AssignQuestionToExam from "./components/AssignQuestionToExam";

const QuestionsPage = () => {
  const {
    questions,
    loading,
    addModal,
    setAddModal,
    deleteModal,
    setDeleteModal,
    assignModal,
    setAssignModal,
    selectedQuestion,
    // setSelectedQuestion is used in useQuestionsPage internally
    unitId,
    courseId,
    unit,
    // course is used elsewhere in the application
    headers,
    getQuestions,
    // assignQuestionToExam is used in the AssignQuestionToExam component
  } = useQuestionsPage();

  const [viewModal, setViewModal] = useState(false);
  const [viewingQuestion, setViewingQuestion] = useState(null);

  const navigate = useNavigate();

  const location = useLocation();
  // Use unit from useQuestionsPage or location state as fallback
  const unitData = unit || (location.state && location.state.unit);

  return (
    <div className="tabled">
      <Row className="">
        <Col xs="24" xl={24} className="!w-full">
          <div className="flex items-center mb-4">
            <Button
              icon={<ArrowRight size={16} />}
              onClick={() => navigate("/units")}
              className="flex items-center"
            >
              العودة إلى الوحدات
            </Button>
          </div>

          <Card
            bordered={false}
            className="!w-full mb-24"
            title={`أسئلة وحدة: ${unitData ? unitData.unit_name : ""}`}
            extra={
              <div className="flex items-center">
                <span className="text-sm text-gray-500 ml-2">معرف الوحدة:</span>
                <span className="text-sm font-medium">
                  {unitData ? unitData.unit_id : ""}
                </span>
              </div>
            }
          >
            <DataTable
              loading={loading}
              addBtn={true}
              btnText={
                <span>
                  إضافة سؤال <span>+</span>
                </span>
              }
              onAddClick={() => setAddModal(true)}
              searchPlaceholder={"بحث في الأسئلة"}
              table={{ header: headers, rows: questions }}
              onRow={(record) => {
                return {
                  onClick: () => {
                    setViewingQuestion(record);
                    setViewModal(true);
                  },
                };
              }}
              rowClassName={() => {
                return "cursor-pointer hover:bg-gray-100 transition-colors duration-200";
              }}
              emptyText="لا توجد أسئلة لهذه الوحدة"
            />
          </Card>
        </Col>
      </Row>

      {/* Add Question Drawer */}
      <AddQuestion
        open={addModal}
        setOpen={setAddModal}
        unitId={parseInt(unitId)}
        courseId={parseInt(courseId)}
        getQuestions={getQuestions}
      />

      {/* Delete Question Modal */}
      {selectedQuestion && (
        <DeleteQuestion
          open={deleteModal}
          setOpen={setDeleteModal}
          unitId={parseInt(unitId)}
          courseId={parseInt(courseId)}
          questionId={selectedQuestion.question_id}
          getQuestions={getQuestions}
        />
      )}

      {/* Question Details Modal */}
      <QuestionDetailsModal
        open={viewModal}
        onClose={() => setViewModal(false)}
        question={viewingQuestion}
      />

      {/* Assign Question to Exam Modal */}
      {selectedQuestion && (
        <AssignQuestionToExam
          open={assignModal}
          onClose={() => setAssignModal(false)}
          questionId={selectedQuestion.question_id}
          onSuccess={() => {
            // Refresh data if needed
            getQuestions();
          }}
        />
      )}
    </div>
  );
};

export default QuestionsPage;
