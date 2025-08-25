import { useState } from "react";
import { Form, Input, Button } from "antd";
import { Plus, Trash2 } from "lucide-react";

const MatchQuestions = ({ form }) => {
  const [matchPairs, setMatchPairs] = useState([{ question: "", answer: "" }]);

  const addMatchPair = () => {
    setMatchPairs([...matchPairs, { question: "", answer: "" }]);
  };

  const removeMatchPair = (index) => {
    if (matchPairs.length > 1) {
      const updatedPairs = [...matchPairs];
      updatedPairs.splice(index, 1);
      setMatchPairs(updatedPairs);

      // Update form values
      const currentMatchOptions = form.getFieldValue("match_options") || [];
      currentMatchOptions.splice(index, 1);
      form.setFieldsValue({ match_options: currentMatchOptions });
    }
  };

  const handlePairChange = (index, field, value) => {
    const updatedPairs = [...matchPairs];
    updatedPairs[index][field] = value;
    setMatchPairs(updatedPairs);

    // Update form values
    const currentMatchOptions = form.getFieldValue("match_options") || [];
    if (!currentMatchOptions[index]) {
      currentMatchOptions[index] = {};
    }
    currentMatchOptions[index][field] = value;
    form.setFieldsValue({ match_options: currentMatchOptions });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700">أسئلة التوصيل</h3>
      </div>

      <Form.Item
        name="match_options"
        initialValue={matchPairs}
        rules={[
          {
            validator: (_, value) => {
              if (
                !value ||
                value.some((item) => !item.question || !item.answer)
              ) {
                return Promise.reject(
                  new Error("الرجاء إدخال جميع الخيارات والإجابات")
                );
              }
              return Promise.resolve();
            },
          },
        ]}
        noStyle
      >
        <Input type="hidden" />
      </Form.Item>

      {matchPairs.map((pair, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              placeholder="النص"
              value={pair.question}
              onChange={(e) =>
                handlePairChange(index, "question", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex-1">
            <Input
              placeholder="الإجابة المطابقة"
              value={pair.answer}
              onChange={(e) =>
                handlePairChange(index, "answer", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <Button
            type="text"
            onClick={() => removeMatchPair(index)}
            disabled={matchPairs.length === 1}
            className="text-red-500 w-fit flex items-center justify-center hover:text-red-700"
          >
            <div className="flex items-center justify-center">
              <Trash2 className="w-4 h-4 !mr-0" />
            </div>
          </Button>
        </div>
      ))}

      <Button
        type="dashed"
        onClick={addMatchPair}
        className="w-full flex items-center justify-center h-10 mt-2"
        icon={<Plus size={16} className="mr-1" />}
      >
        إضافة خيار جديد
      </Button>
    </div>
  );
};

export default MatchQuestions;
