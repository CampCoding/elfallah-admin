import { Card, Col, Row } from "antd";
import DataTable from "./../../layout/DataTable";
import useUnitVideosPage from "./useUnitVideosPage";
import EditVideo from "./components/EditVideo";
import DeleteVideo from "./components/DeleteVideo";

const UnitVideosPage = () => {
  const {
    data,
    headers,

    editModal,
    setEditModal,
    selectedVideo,
    setSelectedVideo,
    deleteModal,
    setDeleteModal,
    getUnitVideos,
    loading,
    unit,
  } = useUnitVideosPage();

  // Sort data by id
  const sortedData = data?.sort((a, b) => a.video_id - b.video_id);

  return (
    <div className="tabled">
      <Row className="">
        <Col xs="24" xl={24} className="!w-full">
          <Card
            bordered={false}
            className="!w-full mb-24"
            extra={""}
            title={
              unit ? `فيديوهات وحدة: ${unit.unit_name}` : "فيديوهات الوحدة"
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
                      setSelectedVideo(record);
                      setEditModal(true);
                    },
                  };
                }}
                loading={loading}
                searchPlaceholder={"بحث في فيديوهات الوحدة"}
                table={{ header: headers, rows: sortedData }}
                rowClassName={() => {
                  return "cursor-pointer hover:bg-gray-100 transition-colors duration-200";
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <EditVideo
        open={editModal}
        setOpen={setEditModal}
        video={selectedVideo}
        getVideos={getUnitVideos}
      />

      <DeleteVideo
        open={deleteModal}
        setOpen={setDeleteModal}
        getVideos={getUnitVideos}
        video={selectedVideo}
      />
    </div>
  );
};

export default UnitVideosPage;
