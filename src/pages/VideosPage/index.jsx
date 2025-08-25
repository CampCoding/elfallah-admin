import { Card, Col, Row } from "antd";
import DataTable from "./../../layout/DataTable";
import useVideosPage from "./useVideosPage";
import AddVideo from "./components/AddVideo";
import EditVideo from "./components/EditVideo";
import DeleteVideo from "./components/DeleteVideo";
import DuplicateVideo from "./components/DuplicateVideo";

const VideosPage = () => {
  const {
    data,
    headers,
    addModal,
    setAddModal,
    editModal,
    setEditModal,
    selectedVideo,
    setSelectedVideo,
    deleteModal,
    setDeleteModal,
    duplicateModal,
    setDuplicateModal,
    getVideos,
    loading,
    units,
    unit,
  } = useVideosPage();

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
            title={unit ? `فيديوهات وحدة: ${unit.unit_name}` : "الفيديوهات"}
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
                addBtn={true}
                btnText={
                  <span>
                    إضافة فيديو <span>+</span>
                  </span>
                }
                onAddClick={() => setAddModal(true)}
                searchPlaceholder={"بحث في الفيديوهات"}
                table={{ header: headers, rows: sortedData }}
                rowClassName={() => {
                  return "cursor-pointer hover:bg-gray-100 transition-colors duration-200";
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>
      <AddVideo
        open={addModal}
        setOpen={setAddModal}
        data={data}
        units={units}
        getVideos={getVideos}
      />

      <EditVideo
        open={editModal}
        setOpen={setEditModal}
        video={selectedVideo}
        units={units}
        getVideos={getVideos}
      />

      <DeleteVideo
        open={deleteModal}
        setOpen={setDeleteModal}
        getVideos={getVideos}
        video={selectedVideo}
      />

      <DuplicateVideo
        open={duplicateModal}
        setOpen={setDuplicateModal}
        getVideos={getVideos}
        video={selectedVideo}
        units={units}
      />
    </div>
  );
};

export default VideosPage;
