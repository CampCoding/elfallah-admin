import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Play,
  BookOpen,
  Trophy,
  Clock,
  Target,
  TrendingUp,
  BarChart3,
  Users,
  ChevronRight,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react";
import axios from "axios";
import { baseUrl } from "../../utils/base_url";

function StudentsReports() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const studentId = searchParams.get("student_id");
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");

  const emore_user = JSON.parse(localStorage.getItem("emore_user"));

  // جلب بيانات التقرير
  const fetchReportData = useCallback(
    async (period = "weekly") => {
      if (!studentId) return;

      setLoading(true);
      try {
        const response = await axios.get(`${baseUrl}/admin/reports/list.php`, {
          params: {
            student_id: studentId,
            type: period,
            admin_id: emore_user?.admin_id,
            access_token: emore_user?.access_token,
          },
        });
        console.log("response", response);
        if (response.data && response.data?.data?.student_id) {
          setReportData(response.data?.data);
        } else {
          console.error("No data received");
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    },
    [studentId, emore_user?.admin_id, emore_user?.access_token, navigate]
  );

  useEffect(() => {
    fetchReportData(selectedPeriod);
  }, [fetchReportData, selectedPeriod]);

  // تصدير التقرير
  const exportReport = () => {
    if (!reportData) return;

    const reportText = `
تقرير الطالب - ${reportData.student_id}
الفترة: ${reportData.period?.from} إلى ${reportData.period?.to}

📹 مقاطع الفيديو:
- إجمالي الدقائق: ${reportData.videos?.totals?.total_active_minutes || 0}
- عدد المقاطع: ${reportData.videos?.totals?.total_videos || 0}

📝 الأسئلة:
- الإجابات الصحيحة: ${reportData.questions?.totals?.correct || 0}
- الإجابات الخاطئة: ${reportData.questions?.totals?.wrong || 0}
- معدل الدقة: ${reportData.questions?.totals?.accuracy_pct || 0}%

📊 الاختبارات:
- الإجابات: ${reportData.exams?.totals?.answered || 0}
- الصحيحة: ${reportData.exams?.totals?.correct || 0}
- الخاطئة: ${reportData.exams?.totals?.wrong || 0}
    `;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `تقرير_الطالب_${studentId}_${
      new Date().toISOString().split("T")[0]
    }.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-600">جاري تحميل التقرير...</span>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          لا توجد بيانات
        </h3>
        <p className="text-gray-600">لم يتم العثور على بيانات التقرير</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <button
              onClick={() => navigate("/students")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">تقرير الطالب</h1>
              <p className="text-gray-600">رقم الطالب: {studentId}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="daily">يومي</option>
              <option value="weekly">أسبوعي</option>
              <option value="monthly">شهري</option>
            </select>

            <button
              onClick={exportReport}
              className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>تصدير التقرير</span>
            </button>
          </div>
        </div>

        {/* Period Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              الفترة: {reportData.period?.from} - {reportData.period?.to}
            </span>
          </div>
        </div>
      </div>

      {/* Videos Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Play className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">مقاطع الفيديو</h2>
        </div>

        {/* Video Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">
                  إجمالي وقت المشاهدة
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {Math.round(
                    (reportData.videos?.totals?.total_seconds || 0) / 60
                  )}{" "}
                  دقيقة
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {reportData.videos?.totals?.total_seconds || 0} ثانية
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">
                  عدد المقاطع المشاهدة
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {reportData.videos?.totals?.total_videos || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">مقطع فيديو</p>
              </div>
              <Play className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">
                  الدقائق النشطة
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {reportData.videos?.totals?.total_active_minutes || 0}
                </p>
                <p className="text-xs text-purple-600 mt-1">دقيقة نشطة</p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">
                  الدقائق المدرجة
                </p>
                <p className="text-2xl font-bold text-orange-900">
                  {reportData.videos?.totals?.total_inserted_minutes || 0}
                </p>
                <p className="text-xs text-orange-600 mt-1">دقيقة مدرجة</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Video Details */}
        {reportData.videos?.by_video &&
          reportData.videos.by_video.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                تفاصيل المقاطع
              </h3>
              <div className="space-y-3">
                {reportData.videos.by_video.map((video, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-lg">
                          {video.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          آخر مشاهدة:{" "}
                          {new Date(video.last_seen).toLocaleString("en-US")}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {video.minutes_covered} دقيقة
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          من أصل {Math.round(video.last_position / 60)} دقيقة
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">
                          الدقائق المشاهدة
                        </p>
                        <p className="font-semibold text-gray-900">
                          {video.minutes_covered} دقيقة
                        </p>
                        <p className="text-xs text-gray-500">
                          {video.watched_seconds} ثانية
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">الموضع الأخير</p>
                        <p className="font-semibold text-gray-900">
                          {Math.round(video.last_position / 60)} دقيقة
                        </p>
                        <p className="text-xs text-gray-500">
                          {video.last_position} ثانية
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">أقصى دقيقة</p>
                        <p className="font-semibold text-gray-900">
                          {video.max_minute_seen} دقيقة
                        </p>
                        <p className="text-xs text-gray-500">وصل إليها</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">نسبة الإكمال</p>
                        <p className="font-semibold text-gray-900">
                          {Math.round(
                            (video.watched_seconds / video.last_position) * 100
                          )}
                          %
                        </p>
                        <p className="text-xs text-gray-500">من المقطع</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">رقم الفيديو</p>
                        <p className="font-semibold text-gray-900">
                          #{video.video_id}
                        </p>
                        <p className="text-xs text-gray-500">معرف الفيديو</p>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            (video.watched_seconds / video.last_position) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Questions Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <BookOpen className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">الأسئلة</h2>
        </div>

        {/* Question Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">
                  الإجابات الصحيحة
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {reportData.questions?.totals?.correct || 0}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">
                  الإجابات الخاطئة
                </p>
                <p className="text-2xl font-bold text-red-900">
                  {reportData.questions?.totals?.answered -
                    reportData.questions?.totals?.correct || 0}
                </p>
              </div>
              <Target className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">معدل الدقة</p>
                <p className="text-2xl font-bold text-blue-900">
                  {reportData.questions?.totals?.accuracy_pct || 0}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">
                  إجمالي الإجابات
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {reportData.questions?.totals?.answered || 0}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Questions Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ملخص الأسئلة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">أول إجابة</p>
              <p className="font-semibold text-gray-900">
                {reportData.questions?.totals?.first_answered_at
                  ? new Date(
                      reportData.questions.totals.first_answered_at
                    ).toLocaleString("en-US")
                  : "لا توجد"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">آخر إجابة</p>
              <p className="font-semibold text-gray-900">
                {reportData.questions?.totals?.last_answered_at
                  ? new Date(
                      reportData.questions.totals.last_answered_at
                    ).toLocaleString("en-US")
                  : "لا توجد"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">أيام النشاط</p>
              <p className="font-semibold text-gray-900">
                {reportData.questions?.totals?.active_days || 0} يوم
              </p>
            </div>
          </div>
        </div>

        {/* Recent Questions */}
        {reportData.questions?.recent &&
          reportData.questions.recent.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                الأسئلة الأخيرة - تفاصيل كاملة
              </h3>
              <div className="space-y-3">
                {reportData.questions.recent.map((question, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            question.correct_or_not
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        >
                          <span className="text-white text-xs font-bold">
                            {question.correct_or_not ? "✓" : "✗"}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            السؤال #{question.question_id}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {question.question_preview}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            question.correct_or_not
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {question.correct_or_not ? "صحيح" : "خاطئ"}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(question.answered_at).toLocaleString(
                            "en-US"
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">رقم السؤال</p>
                        <p className="font-semibold text-gray-900">
                          #{question.question_id}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">الحالة</p>
                        <p
                          className={`font-semibold ${
                            question.correct_or_not
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {question.correct_or_not
                            ? "إجابة صحيحة"
                            : "إجابة خاطئة"}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">وقت الإجابة</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(question.answered_at).toLocaleDateString(
                            "en-US"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Exams Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Trophy className="w-6 h-6 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">الاختبارات</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">
                  إجمالي الإجابات
                </p>
                <p className="text-2xl font-bold text-yellow-900">
                  {reportData.exams?.totals?.answered || 0}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  إجابة في الاختبارات
                </p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">
                  الإجابات الصحيحة
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {reportData.exams?.totals?.correct || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">إجابة صحيحة</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">
                  الإجابات الخاطئة
                </p>
                <p className="text-2xl font-bold text-red-900">
                  {reportData.exams?.totals?.wrong || 0}
                </p>
                <p className="text-xs text-red-600 mt-1">إجابة خاطئة</p>
              </div>
              <BarChart3 className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Exam Details */}
        {reportData.exams?.by_exam && reportData.exams.by_exam.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              تفاصيل الاختبارات
            </h3>
            <div className="space-y-3">
              {reportData.exams.by_exam.map((exam, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        اختبار #{exam.exam_id}
                      </h4>
                      <p className="text-sm text-gray-600">
                        نتيجة: {(exam.correct / exam?.answered) * 100}%
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          (exam.correct / exam?.answered) * 100 >= 50
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {(exam.correct / exam?.answered) * 100 >= 50
                          ? "ناجح"
                          : "راسب"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!reportData.exams?.by_exam ||
          reportData.exams.by_exam.length === 0) && (
          <div className="mt-6 text-center py-8">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              لم يتم إجراء أي اختبارات في هذه الفترة
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentsReports;
