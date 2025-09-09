import { Card, Col, Row } from "antd";
import DataTable from "./../../layout/DataTable";
import usePDFsPage from "./usePDFsPage";
import AddPDF from "./components/AddPDF";
import EditPDF from "./components/EditPDF";
import DeletePDF from "./components/DeletePDF";

const PDFsPage = () => {
  const {
    data,
    headers,
    addModal,
    setAddModal,
    editModal,
    setEditModal,
    selectedPDF,
    setSelectedPDF,
    deleteModal,
    setDeleteModal,
    getPDFs,
    loading,
    video,
  } = usePDFsPage();

  // Sort data by id
  const sortedData = data.sort((a, b) => a.id - b.id);

  return (
    <div className="tabled">
      <Row className="">
        <Col xs="24" xl={24} className="!w-full">
          <Card
            bordered={false}
            className="!w-full mb-24"
            extra={""}
            title={video ? `مذكرات فيديو: ${video.name}` : "المذكرات"}
          >
            <div className="">
              <DataTable
                loading={loading}
                addBtn={true}
                btnText={
                  <span>
                    إضافة مذكرة <span>+</span>
                  </span>
                }
                onAddClick={() => setAddModal(true)}
                onRow={(record) => {
                  return {
                    onClick: (e) => {
                      if (e.target.closest(".not-target")) {
                        return;
                      }
                      setSelectedPDF(record);
                      setEditModal(true);
                    },
                  };
                }}
                searchPlaceholder={"بحث في المذكرات"}
                table={{ header: headers, rows: sortedData }}
                rowClassName={() => {
                  return "cursor-pointer hover:bg-gray-100 transition-colors duration-200";
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>
      <AddPDF open={addModal} setOpen={setAddModal} getPDFs={getPDFs} />

      <EditPDF
        open={editModal}
        setOpen={setEditModal}
        getPDFs={getPDFs}
        pdf={selectedPDF}
      />

      <DeletePDF
        open={deleteModal}
        setOpen={setDeleteModal}
        getPDFs={getPDFs}
        pdf={selectedPDF}
      />
    </div>
  );
};

export default PDFsPage;
