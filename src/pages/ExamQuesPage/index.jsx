import React, { useState } from "react";
import { Card, Col, Row, Button, Empty, Space, Dropdown } from "antd";
import { ArrowRight, Eye, PlusCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import DataTable from "../../layout/DataTable";
import useExamQuesPage from "./useExamQuesPage";
import AddExamQuestion from "./components/AddExamQuestion";
import DeleteExamQuestion from "./components/DeleteExamQuestion";
import ExamQuestionDetailsModal from "./components/ExamQuestionDetailsModal";
import SelectExistingQuestion from "./components/SelectExistingQuestion";

const ExamQuesPage = () => {
  const {
    questions,
    loading,
    addModal,
    setAddModal,
    deleteModal,
    setDeleteModal,
    selectedQuestion,
    // setSelectedQuestion is used in useExamQuesPage internally
    examId,

    headers,
    getExamQuestions,
    // assignQuestionToExam is used elsewhere in the application
  } = useExamQuesPage();

  const [viewModal, setViewModal] = useState(false);
  const [viewingQuestion, setViewingQuestion] = useState(null);
  const [selectExistingModal, setSelectExistingModal] = useState(false);

  const navigate = useNavigate();

  const location = useLocation();

  const exam = location.state?.exam;

  if (!examId) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Empty description="لم يتم تحديد اختبار" />
        <Button
          type="primary"
          className="mt-4"
          onClick={() => navigate("/exams")}
        >
          العودة إلى الاختبارات
        </Button>
      </div>
    );
  }

  return (
    <div className="tabled">
      <Row className="">
        <Col xs="24" xl={24} className="!w-full">
          <div className="flex items-center mb-4">
            <Button
              icon={<ArrowRight size={16} />}
              onClick={() => navigate("/exams")}
              className="flex items-center"
            >
              العودة إلى الاختبارات
            </Button>
          </div>

          <Card
            bordered={false}
            className="!w-full mb-24"
            title={`أسئلة اختبار: ${exam.exam_name}`}
            extra={
              <div className="flex items-center">
                <span className="text-sm text-gray-500 ml-2">
                  معرف الاختبار: {exam.exam_id}
                </span>
                {/* <span className="text-sm font-medium">{.exam_id}</span> */}
              </div>
            }
          >
            <DataTable
              loading={loading}
              addBtn={true}
              btnText={
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "1",
                        label: "إضافة سؤال جديد",
                        onClick: () => setAddModal(true),
                      },
                      {
                        key: "2",
                        label: "اختيار من الأسئلة الموجودة",
                        onClick: () => setSelectExistingModal(true),
                      },
                    ],
                  }}
                  placement="bottomRight"
                  arrow
                >
                  <span>إضافة سؤال</span>
                </Dropdown>
              }
              onAddClick={null}
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
              emptyText="لا توجد أسئلة لهذا الاختبار"
            />
          </Card>
        </Col>
      </Row>

      {/* Add Exam Question Drawer */}
      <AddExamQuestion
        open={addModal}
        setOpen={setAddModal}
        examId={parseInt(examId)}
        getExamQuestions={getExamQuestions}
      />

      {/* Delete Exam Question Modal */}
      {selectedQuestion && (
        <DeleteExamQuestion
          open={deleteModal}
          setOpen={setDeleteModal}
          examId={parseInt(examId)}
          questionId={selectedQuestion.question_id}
          examQuestionId={selectedQuestion.exam_questions_id}
          getExamQuestions={getExamQuestions}
        />
      )}

      {/* Exam Question Details Modal */}
      <ExamQuestionDetailsModal
        open={viewModal}
        onClose={() => setViewModal(false)}
        question={viewingQuestion}
      />

      {/* Select Existing Question Modal */}
      <SelectExistingQuestion
        open={selectExistingModal}
        onClose={() => setSelectExistingModal(false)}
        examId={parseInt(examId)}
        onSuccess={() => {
          getExamQuestions();
        }}
      />
    </div>
  );
};

export default ExamQuesPage;
