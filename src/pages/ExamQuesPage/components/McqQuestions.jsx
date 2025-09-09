"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { Input, Form } from "antd";

export default function McqQuestions({ form }) {
  const [options, setOptions] = useState([
    { id: 1, text: "", isCorrect: false },
    { id: 2, text: "", isCorrect: false },
  ]);

  const [errors, setErrors] = useState({});

  // Sync options with form whenever options change
  useEffect(() => {
    form.setFieldsValue({ mcq_options: options });
  }, [options, form]);

  const addOption = () => {
    const newOptions = [
      ...options,
      { id: Date.now(), text: "", isCorrect: false },
    ];
    setOptions(newOptions);
  };

  const removeOption = (optionId) => {
    if (options.length > 2) {
      const updatedOptions = options.filter((o) => o.id !== optionId);
      setOptions(updatedOptions);
    }
  };

  const updateOption = (optionId, field, value) => {
    const updatedOptions = options.map((o) =>
      o.id === optionId ? { ...o, [field]: value } : o
    );
    setOptions(updatedOptions);

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
                    className="w-full p-3 border border-gray-300 rounded-lg"
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
                title={
                  option.isCorrect ? "الإجابة الصحيحة" : "تحديد كإجابة صحيحة"
                }
              >
                <Check
                  size={18}
                  className={`${
                    option.isCorrect ? "text-white" : "text-green-500"
                  }`}
                />
              </button>

              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(option.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  title="حذف الاختيار"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Show error messages */}
        {Object.keys(errors).length > 0 && (
          <div className="mt-2 space-y-1">
            {Object.entries(errors).map(([key, error]) => (
              <div key={key} className="text-red-500 text-sm">
                {error}
              </div>
            ))}
          </div>
        )}
      </div>

      <Form.Item
        name="mcq_options"
        initialValue={options}
        rules={[
          {
            validator: (_, value) => {
              const currentOptions = value || options;

              // Check if all options have text
              if (currentOptions.some((item) => !item.text.trim())) {
                return Promise.reject(new Error("الرجاء إدخال جميع الخيارات"));
              }

              // Check if at least one correct answer is selected
              if (!currentOptions.some((item) => item.isCorrect)) {
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
