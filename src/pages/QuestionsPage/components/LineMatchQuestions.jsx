import { useState } from "react";
import { Form, Input, Button, Divider } from "antd";
import { Plus, Trash2 } from "lucide-react";

const LineMatchQuestions = ({ form }) => {
  const [pairs, setPairs] = useState([{ left: "", right: "" }]);

  const addPair = () => {
    setPairs([...pairs, { left: "", right: "" }]);
  };

  const removePair = (index) => {
    if (pairs.length > 1) {
      const updatedPairs = [...pairs];
      updatedPairs.splice(index, 1);
      setPairs(updatedPairs);

      // Update form values
      updateFormValues(updatedPairs);
    }
  };

  const handlePairChange = (index, side, value) => {
    const updatedPairs = [...pairs];
    updatedPairs[index][side] = value;
    setPairs(updatedPairs);

    // Update form values
    updateFormValues(updatedPairs);
  };

  const updateFormValues = (updatedPairs) => {
    // Format the data as required by the API
    const leftItems = updatedPairs
      .map(
        (pair, index) =>
          `${pair.left}${
            index < updatedPairs.length
              ? "**linematch**" +
                index +
                `${index < updatedPairs.length - 1 ? "//camp//" : ""}`
              : ""
          }`
      )
      .join("");

    const rightItems = updatedPairs
      .map(
        (pair, index) =>
          `${pair.right}${
            index < updatedPairs.length
              ? "**linematch**" +
                index +
                `${index < updatedPairs.length - 1 ? "//camp//" : ""}`
              : ""
          }`
      )
      .join("");

    form.setFieldsValue({
      question_text: leftItems,
      question_answers: rightItems,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 mb-2">
        <div className=" font-medium">العمود الأيسر</div>
        <div className=" font-medium">العمود الأيمن</div>
      </div>

      {pairs.map((pair, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              placeholder="العنصر الأيسر"
              value={pair.left}
              onChange={(e) => handlePairChange(index, "left", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex-1">
            <Input
              placeholder="العنصر الأيمن"
              value={pair.right}
              onChange={(e) => handlePairChange(index, "right", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <Button
            type="text"
            onClick={() => removePair(index)}
            disabled={pairs.length === 1}
            className="text-red-500 w-fit flex items-center justify-center hover:text-red-700"
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

      {/* Hidden form items to store the formatted data */}
      <Form.Item name="question_text" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="question_answers" hidden>
        <Input />
      </Form.Item>
    </div>
  );
};

export default LineMatchQuestions;
