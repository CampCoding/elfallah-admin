"use client";

import { useState } from "react";
import { Plus, Trash2, Check, X } from "lucide-react";
import { Input, Form } from "antd";

export default function McqQuestions({ form }) {
  const [options, setOptions] = useState([
    { id: 1, text: "", isCorrect: false },
    { id: 2, text: "", isCorrect: false },
  ]);

  const [errors, setErrors] = useState({});

  const addOption = () => {
    setOptions([...options, { id: Date.now(), text: "", isCorrect: false }]);
  };

  const removeOption = (optionId) => {
    if (options.length > 2) {
      const updatedOptions = options.filter((o) => o.id !== optionId);
      setOptions(updatedOptions);

      // Update form values
      const currentMcqOptions = form.getFieldValue("mcq_options") || [];
      const updatedMcqOptions = currentMcqOptions.filter(
        (o) => o.id !== optionId
      );
      form.setFieldsValue({ mcq_options: updatedMcqOptions });
    }
  };

  const updateOption = (optionId, field, value) => {
    const updatedOptions = options.map((o) =>
      o.id === optionId ? { ...o, [field]: value } : o
    );
    setOptions(updatedOptions);

    // Update form values
    const currentMcqOptions = form.getFieldValue("mcq_options") || [];
    const updatedMcqOptions = currentMcqOptions.map((o) =>
      o.id === optionId ? { ...o, [field]: value } : o
    );
    form.setFieldsValue({ mcq_options: updatedMcqOptions });

    // Clear option errors when user starts typing
    if (errors[optionId]) {
      const newErrors = { ...errors };
      delete newErrors[optionId];
      setErrors(newErrors);
    }
  };

  const setCorrectAnswer = (optionId) => {
    const updatedOptions = options.map((o) => ({
      ...o,
      isCorrect: o.id === optionId,
    }));
    setOptions(updatedOptions);

    // Update form values
    const currentMcqOptions = form.getFieldValue("mcq_options") || [];
    const updatedMcqOptions = currentMcqOptions.map((o) => ({
      ...o,
      isCorrect: o.id === optionId,
    }));
    form.setFieldsValue({ mcq_options: updatedMcqOptions });

    // Clear correct answer error
    if (errors.correctAnswer) {
      setErrors({
        ...errors,
        correctAnswer: null,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">
            خيارات الإجابة *
          </label>
          <button
            type="button"
            onClick={addOption}
            className="flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors text-sm font-medium"
          >
            <Plus size={16} className="mr-1" />
            إضافة اختيار
          </button>
        </div>

        <div className="space-y-3">
          {options.map((option, optionIndex) => (
            <div key={option.id} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    type="text"
                    value={option.text}
                    onChange={(e) =>
                      updateOption(option.id, "text", e.target.value)
                    }
                    placeholder={`اختيار ${optionIndex + 1}`}
                    className={`w-full p-3 border border-gray-300 rounded-lg`}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCorrectAnswer(option.id)}
                className={`px-2 py-2 rounded-lg font-medium transition-colors text-sm ${
                  option.isCorrect
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-green-100 hover:text-green-700"
                }`}
              >
                <Check
                  size={18}
                  className={`${
                    option.isCorrect ? "text-white-600" : "text-green-500"
                  }`}
                />
              </button>

              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(option.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Form.Item
        name="mcq_options"
        initialValue={options}
        rules={[
          {
            validator: (_, value) => {
              if (!value || value.some((item) => !item.text)) {
                return Promise.reject(new Error("الرجاء إدخال جميع الخيارات"));
              }
              if (!value.some((item) => item.isCorrect)) {
                return Promise.reject(
                  new Error("الرجاء تحديد الإجابة الصحيحة")
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
    </div>
  );
}
