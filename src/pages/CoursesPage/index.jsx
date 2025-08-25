import { Card, Col, Row } from "antd";
import DataTable from "./../../layout/DataTable";
import useCoursesPage from "./useCoursesPage";
import AddCourse from "./components/AddCourse";
import EditCourse from "./components/EditCourse";
import DeleteCourse from "./components/DeleteCourse";

const CoursesPage = () => {
  const {
    data,
    headers,
    addModal,
    setAddModal,
    editModal,
    setEditModal,
    selectedCourse,
    setSelectedCourse,
    deleteModal,
    setDeleteModal,
    getCourses,
    loading,
  } = useCoursesPage();

  // Sort data by id
  const sortedData = data.sort((a, b) => a.id - b.id);

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
                      setSelectedCourse(record);
                      setEditModal(true);
                    },
                  };
                }}
                loading={loading}
                addBtn={true}
                btnText={
                  <span>
                    إضافة دورة <span>+</span>
                  </span>
                }
                onAddClick={() => setAddModal(true)}
                searchPlaceholder={"بحث في الدورات"}
                table={{ header: headers, rows: sortedData }}
                rowClassName={() => {
                  return "cursor-pointer hover:bg-gray-100 transition-colors duration-200";
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>
      <AddCourse
        open={addModal}
        setOpen={setAddModal}
        data={data}
        getCourses={getCourses}
      />

      <EditCourse
        open={editModal}
        setOpen={setEditModal}
        course={selectedCourse}
        getCourses={getCourses}
      />

      <DeleteCourse
        open={deleteModal}
        setOpen={setDeleteModal}
        getCourses={getCourses}
        course={selectedCourse}
      />
    </div>
  );
};

export default CoursesPage;
