import { Button, Input, Upload } from "antd";
import { Plus, Trash2 } from "lucide-react";
import { UploadOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";

const MatchingWithImagesQuestions = ({ pairs, setPairs }) => {
  const addPair = () => {
    setPairs([...pairs, { name: "", imageFile: null, imagePreview: "" }]);
  };

  const removePair = (index) => {
    if (pairs.length > 1) {
      const updated = [...pairs];
      updated.splice(index, 1);
      setPairs(updated);
    }
  };

  const handleNameChange = (index, value) => {
    const updated = [...pairs];
    updated[index] = { ...updated[index], name: value };
    setPairs(updated);
  };

  const beforeUpload = (file, index) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      toast.error("يمكنك رفع الصور فقط!");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      toast.error("يجب أن يكون حجم الصورة أقل من 2 ميجابايت!");
      return false;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const updated = [...pairs];
      updated[index] = {
        ...updated[index],
        imageFile: file,
        imagePreview: e.target.result,
      };
      setPairs(updated);
    };
    reader.readAsDataURL(file);

    return false;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">
        أزواج النص والصورة
      </h3>

      {pairs.map((pair, index) => (
        <div
          key={index}
          className="flex items-start gap-2 p-3 border border-gray-200 rounded-lg"
        >
          <div className="flex-1 space-y-2">
            <Input
              placeholder="اسم العنصر"
              value={pair.name}
              onChange={(e) => handleNameChange(index, e.target.value)}
            />
            <Upload
              beforeUpload={(file) => beforeUpload(file, index)}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />} size="small">
                {pair.imageFile ? "تغيير الصورة" : "رفع صورة"}
              </Button>
            </Upload>
            {pair.imagePreview && (
              <img
                src={pair.imagePreview}
                alt="preview"
                className="rounded"
                style={{ maxHeight: "80px", maxWidth: "100%" }}
              />
            )}
          </div>
          <Button
            type="text"
            onClick={() => removePair(index)}
            disabled={pairs.length === 1}
            className="text-red-500 flex items-center justify-center hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 !mr-0" />
          </Button>
        </div>
      ))}

      <Button
        type="dashed"
        onClick={addPair}
        className="w-full flex items-center justify-center h-10 mt-2"
        icon={<Plus size={16} className="mr-1" />}
      >
        إضافة زوج جديد
      </Button>
    </div>
  );
};

export default MatchingWithImagesQuestions;
