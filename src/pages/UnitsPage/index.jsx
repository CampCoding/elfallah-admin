import { Card, Col, Row } from "antd";
import DataTable from "./../../layout/DataTable";
import useUnitsPage from "./useUnitsPage";
import AddUnit from "./components/AddUnit";
import EditUnit from "./components/EditUnit";
import DeleteUnit from "./components/DeleteUnit";

const UnitsPage = () => {
  const {
    data,
    headers,
    addModal,
    setAddModal,
    editModal,
    setEditModal,
    selectedUnit,
    setSelectedUnit,
    deleteModal,
    setDeleteModal,
    getUnits,
    loading,
    course,
  } = useUnitsPage();

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
            title={course ? `وحدات دورة: ${course.course_name}` : "الوحدات"}
          >
            <div className="">
              <DataTable
                // onRow={(record) => {
                //   return {
                //     onClick: (e) => {
                //       if (e.target.closest(".not-target")) {
                //         return;
                //       }
                //       setSelectedUnit(record);
                //       setEditModal(true);
                //     },
                //   };
                // }}
                loading={loading}
                addBtn={true}
                btnText={
                  <span>
                    إضافة وحدة <span>+</span>
                  </span>
                }
                onAddClick={() => setAddModal(true)}
                searchPlaceholder={"بحث في الوحدات"}
                table={{ header: headers, rows: sortedData }}
                rowClassName={() => {
                  return "cursor-pointer hover:bg-gray-100 transition-colors duration-200";
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>
      <AddUnit
        open={addModal}
        setOpen={setAddModal}
        data={data}
        getUnits={getUnits}
      />

      <EditUnit
        open={editModal}
        setOpen={setEditModal}
        unit={selectedUnit}
        getUnits={getUnits}
      />

      <DeleteUnit
        open={deleteModal}
        setOpen={setDeleteModal}
        getUnits={getUnits}
        unit={selectedUnit}
      />
    </div>
  );
};

export default UnitsPage;
