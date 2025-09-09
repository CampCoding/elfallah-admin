import React, { useEffect } from "react";
import { Modal, Typography, Tag, List } from "antd";
import { ClockIcon } from "lucide-react";

const { Title, Text } = Typography;

const ExamQuestionDetailsModal = ({ open, onClose, question }) => {
  useEffect(() => {
    console.log(question);
  }, [question]);

  if (!question) return null;

  const renderQuestionContent = () => {
    if (question.question_type === "mcq" || question.type === "mcq") {
      // Check if we have real_answers array with objects or the old format with arrays
      const hasRealAnswers =
        Array.isArray(question.real_answers) &&
        question.real_answers.length > 0 &&
        typeof question.real_answers[0] === "object";

      // Determine which data source to use
      const answersData = hasRealAnswers
        ? question.real_answers
        : question.question_answers
        ? typeof question.question_answers === "string"
          ? question.question_answers.split("//CAMP//")
          : question.question_answers
        : question.options || [];

      return (
        <div className="mt-4">
          <Title level={5}>الخيارات:</Title>
          <List
            style={{
              direction: "ltr",
            }}
            dataSource={answersData}
            renderItem={(option, index) => {
              // Handle different data formats
              const optionText = hasRealAnswers ? option.answer_text : option;
              const isCorrect = hasRealAnswers
                ? option.answer_check
                : optionText === question.question_valid_answer;

              return (
                <List.Item
                  className={isCorrect ? "bg-green-50 p-2 rounded" : ""}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                          isCorrect ? "bg-green-500 text-white" : "bg-gray-200"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <Text>{optionText}</Text>
                    </div>
                    {isCorrect && (
                      <Tag color="success" className="mx-2">
                        الإجابة الصحيحة
                      </Tag>
                    )}
                  </div>
                </List.Item>
              );
            }}
          />
        </div>
      );
    } else if (question.type === "arrangePuzzle") {
      const gameType = question.game_type || question.gameType || "word";
      const validAnswer = question.question_valid_answer || "";

      return (
        <div className="mt-4">
          <Title level={5}>نوع اللعبة:</Title>
          <Tag color="blue" className="mb-4">
            {gameType === "word" ? "ترتيب الكلمات" : "ترتيب الأحرف"}
          </Tag>

          <Title level={5}>النص الأصلي:</Title>
          <div className="p-3 bg-green-50 rounded-md mb-4">
            <Text>{validAnswer}</Text>
          </div>

          <Title level={5}>العناصر للترتيب:</Title>
          <div className="flex flex-wrap gap-2">
            {gameType === "word"
              ? validAnswer.split(" ").map((word, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-300 rounded px-3 py-1"
                  >
                    {word}
                  </div>
                ))
              : validAnswer.split("").map((char, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-300 rounded px-3 py-1"
                  >
                    {char}
                  </div>
                ))}
          </div>
        </div>
      );
    } else if (question.type === "line-match") {
      return (
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Title level={5}>العمود الأيسر:</Title>
              <List
                dataSource={question.leftColumn.sort((a, b) => a.type - b.type)}
                renderItem={(item) => (
                  <List.Item>
                    <div className="p-2 border border-gray-300 rounded w-full">
                      <Text>{item.text}</Text>
                    </div>
                  </List.Item>
                )}
              />
            </div>
            <div>
              <Title level={5}>العمود الأيمن:</Title>
              <List
                dataSource={question.rightColumn.sort(
                  (a, b) => a.type - b.type
                )}
                renderItem={(item) => (
                  <List.Item>
                    <div className="p-2 border border-gray-300 rounded w-full">
                      <Text>{item.text}</Text>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Modal
      title={
        <div className="flex items-center justify-between">
          <Title level={4} className="!m-0">
            تفاصيل السؤال
          </Title>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <div className="py-2">
        <div>
          <Tag
            color={
              question.type === "mcq"
                ? "blue"
                : question.type === "matching"
                ? "purple"
                : question.type === "arrangePuzzle"
                ? "green"
                : question.type === "line-match"
                ? "orange"
                : "default"
            }
          >
            {question.type === "mcq"
              ? "اختيار من متعدد"
              : question.type === "matching"
              ? "مطابقة"
              : question.type === "arrangePuzzle"
              ? "ترتيب الكلمات/الأحرف"
              : question.type === "line-match"
              ? "توصيل الخطوط"
              : question.type || ""}
          </Tag>
        </div>

        {question.type !== "line-match" && (
          <div className="my-4">
            <Title level={5}>نص السؤال:</Title>
            <Text>{question.question_text}</Text>
          </div>
        )}

        {question.question_image && (
          <div className="my-4 flex justify-center items-center">
            <img
              src={question.question_image}
              alt="question"
              className="w-full h-[200px] object-contain"
            />
          </div>
        )}

        {renderQuestionContent()}
      </div>
    </Modal>
  );
};

export default ExamQuestionDetailsModal;
