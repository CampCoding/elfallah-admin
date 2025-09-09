import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  message,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { HelpCircle } from "lucide-react";
import useInteractiveQuestionsPage from "./useInteractiveQuestionsPage";
import AddInteractiveQuestion from "./components/AddInteractiveQuestion";
import EditInteractiveQuestion from "./components/EditInteractiveQuestion";
import DeleteInteractiveQuestion from "./components/DeleteInteractiveQuestion";
import DataTable from "../../layout/DataTable";

const InteractiveQuestionsPage = () => {
  const {
    data,
    loading,
    video,
    getInteractiveQuestions,
    handleAdd,
    handleUpdate,
    handleDelete,
    columns,
    selectedQuestion,
    setSelectedQuestion,
    editModal,
    setEditModal,
    deleteModal,
    setDeleteModal,
  } = useInteractiveQuestionsPage();

  const [addModal, setAddModal] = useState(false);

  return (
    <div className="tabled">
      <Row className="">
        <Col xs="24" xl={24} className="!w-full">
          <Card
            bordered={false}
            className="!w-full mb-24"
            extra={
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                <span>الأسئلة التفاعلية - {video?.video_title}</span>
              </div>
            }
          >
            <div className="">
              <DataTable
                onRow={(record) => {
                  return {
                    onClick: (e) => {
                      if (e.target.closest(".not-target")) {
                        return;
                      }
                      setSelectedQuestion(record);
                      setEditModal(true);
                    },
                  };
                }}
                loading={loading}
                addBtn={true}
                btnText={
                  <span>
                    إضافة سؤال تفاعلي <span>+</span>
                  </span>
                }
                onAddClick={() => setAddModal(true)}
                searchPlaceholder={"بحث في الأسئلة التفاعلية"}
                table={{ header: columns, rows: data }}
                rowClassName={() => {
                  return "cursor-pointer hover:bg-gray-100 transition-colors duration-200";
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Add Modal */}
      <AddInteractiveQuestion
        open={addModal}
        setOpen={setAddModal}
        videoId={video?.video_id}
        getInteractiveQuestions={getInteractiveQuestions}
        handleAdd={handleAdd}
      />

      {/* Edit Modal */}
      <EditInteractiveQuestion
        open={editModal}
        setOpen={setEditModal}
        question={selectedQuestion}
        getInteractiveQuestions={getInteractiveQuestions}
        handleUpdate={handleUpdate}
      />

      {/* Delete Modal */}
      <DeleteInteractiveQuestion
        open={deleteModal}
        setOpen={setDeleteModal}
        question={selectedQuestion}
        getInteractiveQuestions={getInteractiveQuestions}
        handleDelete={handleDelete}
      />
    </div>
  );
};

export default InteractiveQuestionsPage;
