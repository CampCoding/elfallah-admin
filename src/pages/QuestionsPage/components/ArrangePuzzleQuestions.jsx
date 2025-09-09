import { useState, useEffect } from "react";
import { Form, Input, Radio, Typography } from "antd";

const { TextArea } = Input;
const { Text } = Typography;

const ArrangePuzzleQuestions = ({ form }) => {
  const [gameType, setGameType] = useState("word");
  const [puzzleText, setPuzzleText] = useState("");

  useEffect(() => {
    // Update form values when game type changes
    form.setFieldsValue({
      game_type: gameType,
    });
  }, [gameType, form]);

  const handleTextChange = (e) => {
    const value = e.target.value;
    setPuzzleText(value);

    // Update form values
    form.setFieldsValue({
      question_valid_answer: value,
    });
  };

  return (
    <div className="space-y-4">
      <Form.Item name="game_type" label="نوع اللعبة">
        <Radio.Group
          onChange={(e) => setGameType(e.target.value)}
          value={gameType}
        >
          <Radio value="word">كلمات</Radio>
          <Radio value="character">أحرف</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        name="question_valid_answer"
        label={gameType === "word" ? "النص للترتيب" : "الكلمة للترتيب"}
        rules={[
          {
            required: true,
            message:
              gameType === "word"
                ? "الرجاء إدخال النص للترتيب"
                : "الرجاء إدخال الكلمة للترتيب",
          },
        ]}
      >
        {gameType === "word" ? (
          <TextArea
            rows={3}
            placeholder="أدخل النص الذي سيتم ترتيبه"
            value={puzzleText}
            onChange={handleTextChange}
          />
        ) : (
          <Input
            placeholder="أدخل الكلمة التي سيتم ترتيب أحرفها"
            value={puzzleText}
            onChange={handleTextChange}
          />
        )}
      </Form.Item>

      {puzzleText && (
        <div className="mt-4">
          <Text type="secondary">
            {gameType === "word"
              ? "سيتم تقسيم النص إلى كلمات للترتيب"
              : "سيتم تقسيم الكلمة إلى أحرف للترتيب"}
          </Text>
          <div className="mt-2 p-3 bg-gray-50 rounded-md">
            {gameType === "word" ? (
              <div className="flex flex-wrap gap-2">
                {puzzleText.split(" ").map((word, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-300 rounded px-3 py-1"
                  >
                    {word}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {puzzleText.split("").map((char, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-300 rounded px-3 py-1"
                  >
                    {char}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArrangePuzzleQuestions;
