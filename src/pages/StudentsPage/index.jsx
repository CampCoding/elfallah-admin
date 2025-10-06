import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChevronRight,
  Search,
  Filter,
  Users,
  GraduationCap,
  Calendar,
  BookOpen,
  Star,
  Plus,
  Download,
  MoreHorizontal,
  Eye,
  Trash2,
  Ban,
  CheckCircle,
  Edit,
  MessageCircle,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import { baseUrl } from "../../utils/base_url";
import { Table } from "antd";
import { useNavigate } from "react-router-dom";

const StudentsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [univ_grades, setUnivGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const emore_user = JSON.parse(localStorage.getItem("emore_user"));
  const getData = useCallback(async () => {
    await axios
      .post(`${baseUrl}/admin/universities/select_universities_grade.php`, {
        admin_id: emore_user?.admin_id,
        access_token: emore_user?.access_token,
      })
      .then((response) => {
        if (
          response.data.status == "error" &&
          location.pathname != "/login" &&
          location.pathname != "/"
        ) {
          localStorage.clear();
          window.location.href = "/login";
        }
        setUnivGrades(response.data.message);
        return {
          data: {
            status: "success",
            message: response.data.message,
          },
        };
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        return {
          data: {
            status: "error",
            message: error.response ? error.response.data : error.message,
          },
        };
      });
  }, [emore_user?.admin_id, emore_user?.access_token]);
  useEffect(() => {
    getData();
  }, [getData]);

  const exportData = () => {
    if (!students || students.length === 0) {
      alert("لا توجد بيانات للتصدير");
      return;
    }

    exportStudentsData(students, "قائمة_الطلاب");
  };

  const clearFilters = () => {
    setSearchTerm("");
  };
  const navigate = useNavigate();

  const viewStudentReports = (studentId) => {
    navigate("/students-reports?student_id=" + studentId);
  };

  const deleteStudent = (studentId, studentName) => {
    if (window.confirm(`هل أنت متأكد من حذف الطالب: ${studentName}؟`)) {
      console.log("حذف الطالب:", studentId);
      alert(`تم حذف الطالب: ${studentName}`);
    }
  };

  const toggleStudentStatus = async (studentId, studentName, currentStatus) => {
    const action = currentStatus === "no" ? "حظر" : "فك الحظر";
    if (window.confirm(`هل أنت متأكد من ${action} الطالب: ${studentName}؟`)) {
      setLoading(true);
      try {
        const response = await axios.get(
          `${baseUrl}/admin/students/change_status.php`,
          {
            params: {
              student_id: studentId,
              admin_id: emore_user?.admin_id,
              access_token: emore_user?.access_token,
            },
          }
        );
        console.log("response", response);
        if (response.data == "1") {
          setStudents((prevStudents) =>
            prevStudents.map((student) =>
              student.student_id === studentId
                ? { ...student, blocked: currentStatus === "no" ? "yes" : "no" }
                : student
            )
          );
          getData();
          alert(`تم ${action} الطالب: ${studentName} بنجاح`);
        } else {
          alert("حدث خطأ في تغيير حالة الطالب");
        }
      } catch (error) {
        console.error("Error changing student status:", error);
        if (error.response?.status === 401) {
          alert("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى");
          localStorage.clear();
          window.location.href = "/login";
        } else {
          alert("حدث خطأ في تغيير حالة الطالب");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const exportNewStudents = () => {
    const newStudents =
      students?.filter((item) => {
        const createdDate = new Date(item?.join_day);
        const currentDate = new Date();
        const monthAgo = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        return createdDate >= monthAgo;
      }) || [];

    if (newStudents.length === 0) {
      alert("لا توجد طلاب جدد للتصدير");
      return;
    }

    exportStudentsData(newStudents, "الطلاب_الجدد");
  };

  const exportActiveStudents = () => {
    const activeStudents =
      students?.filter((item) => item?.blocked === "no") || [];

    if (activeStudents.length === 0) {
      alert("لا توجد طلاب نشطين للتصدير");
      return;
    }

    exportStudentsData(activeStudents, "الطلاب_النشطين");
  };

  const sendWhatsApp = async (studentId, studentPhone) => {
    if (!studentPhone) {
      alert("لا يوجد رقم هاتف لهذا الطالب");
      return;
    }
    setLoading(true);
    try {
      const reportsResponse = await axios.get(`${baseUrl}/admin/reports/list.php`, {
        params: {
          student_id: studentId,
          type: "monthly",
          admin_id: emore_user?.admin_id,
          access_token: emore_user?.access_token,
        },
      });
      const response = await axios.post(
        `${baseUrl}/admin/students/create-report-pdf.php?student_id=${studentId}&student_phone=${studentPhone}`,
       JSON.stringify({
          admin_id: emore_user?.admin_id,
          access_token: emore_user?.access_token,
          student_id: studentId,
          student_phone: String(studentPhone),
          reports: reportsResponse?.data.data
        })
      );
      if (response?.data === "1" || response?.data?.status === "success") {
        alert("تم إرسال طلب واتساب بنجاح");
      } else {
        alert("تعذر إرسال طلب واتساب");
      }
    } catch (error) {
      console.error("Error sending WhatsApp request:", error);
      // alert("حدث خطأ أثناء إرسال طلب واتساب");
    } finally {
      setLoading(false);
    }
  };

  const exportStudentsData = (studentsData, filePrefix) => {
    const exportData = studentsData.map((student, index) => ({
      "رقم التسلسل": index + 1,
      "اسم الطالب": student.student_name || "",
      "البريد الإلكتروني": student.student_email || "",
      "رقم الهاتف": student.phone || "",
      "المرحلة الدراسية": student.university_name || "",
      "الصف الدراسي": student.grade_name || "",
      الحالة: student.blocked === "no" ? "نشط" : "محظور",
      "تاريخ الانضمام": student.join_day || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const columnWidths = [
      { wch: 10 },
      { wch: 25 },
      { wch: 30 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 10 },
      { wch: 15 },
    ];
    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, filePrefix);

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const currentDate = new Date().toISOString().split("T")[0];
    const fileName = `${filePrefix}_${currentDate}.xlsx`;

    saveAs(data, fileName);
  };

  const columns = [
    {
      title: "رقم الطالب",
      dataIndex: "student_id",
      key: "student_id",
      width: 30,
    },
    {
      title: "الاسم",
      dataIndex: "student_name",
      key: "student_name",
      width: 200,
    },
    {
      title: "الايميل",
      dataIndex: "student_email",
      key: "student_email",
      width: 250,
    },
    {
      title: "الهاتف",
      dataIndex: "phone",
      key: "phone",
      width: 150,
    },
    {
      title: "المرحلة الدراسية",
      dataIndex: "university_name",
      key: "university_name",
      width: 200,
    },
    {
      title: "الصف الدراسي",
      dataIndex: "grade_name",
      key: "grade_name",
      width: 150,
    },
    {
      title: "الحالة",
      dataIndex: "blocked",
      key: "blocked",
      width: 100,
      render: (blocked) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${blocked === "no"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
            }`}
        >
          {blocked === "no" ? "نشط" : "محظور"}
        </span>
      ),
    },
    {
      title: "الأدوات",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse gap-2">
          {/* زر عرض التقارير */}
          <button
            onClick={() => viewStudentReports(record.student_id)}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            title="عرض تقارير الطالب"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* زر إرسال واتساب */}
          <button
            onClick={() => sendWhatsApp(record.student_id, record.phone)}
            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
            title="إرسال واتساب"
          >
            <MessageCircle className="w-4 h-4" />
          </button>

          {/* زر حظر/فك الحظر */}
          <button
            onClick={() =>
              toggleStudentStatus(
                record.student_id,
                record.student_name,
                record.blocked
              )
            }
            className={`p-2 rounded-lg transition-colors ${record.blocked === "no"
              ? "text-red-600 hover:bg-red-100"
              : "text-green-600 hover:bg-green-100"
              }`}
            title={record.blocked === "no" ? "حظر الطالب" : "فك حظر الطالب"}
          >
            {record.blocked === "no" ? (
              <Ban className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
          </button>

          {/* زر الحذف */}
          <button
            onClick={() =>
              deleteStudent(record.student_id, record.student_name)
            }
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            title="حذف الطالب"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];
  const [students, setStudents] = useState([]);
  const selectStdents = useCallback(async () => {
    await axios
      .get(`${baseUrl}/admin/students/list.php`, {
        params: {
          admin_id: emore_user?.admin_id,
          access_token: emore_user?.access_token,
        },
      })
      .then((response) => {
        console.log(response);
        setStudents(response.data);
      })
      .catch((error) => {
        console.error("Error fetching students:", error);
      });
  }, [emore_user?.admin_id, emore_user?.access_token]);

  useEffect(() => {
    selectStdents();
  }, [selectStdents]);

  const filteredStudents = useMemo(() => {
    const normalizedQuery = (searchTerm || "").toString().trim().toLowerCase();
    if (!normalizedQuery) return students;
    return (students || []).filter((student) => {
      const name = String(student?.student_name ?? "").toLowerCase();
      const email = String(student?.student_email ?? "").toLowerCase();
      const phone = String(student?.phone ?? "").toLowerCase();
      const id = String(student?.student_id ?? "").toLowerCase();
      return (
        name.includes(normalizedQuery) ||
        email.includes(normalizedQuery) ||
        phone.includes(normalizedQuery) ||
        id.includes(normalizedQuery)
      );
    });
  }, [students, searchTerm]);
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 rtl:space-x-reverse">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Users className="w-4 h-4 text-blue-500" />
          <span className="text-blue-500 font-medium">الطلاب</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="text-gray-500">قائمة الطلاب</span>
      </nav>

      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6 pt-2">
          <div className="flex items-center space-x-3 rtl:space-x-reverse gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إدارة الطلاب</h1>
              <p className="text-gray-600">
                إدارة ومتابعة بيانات الطلاب المسجلين
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 rtl:space-x-reverse gap-3">
            <div className="flex space-x-2 rtl:space-x-reverse text-sm text-gray-600 gap-3">
              <div className="flex items-center space-x-1 rtl:space-x-reverse gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>
                  نشط:{" "}
                  {students?.filter((item) => item?.blocked == "no").length}
                </span>
              </div>
              <div className="flex items-center space-x-1 rtl:space-x-reverse gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>إجمالي: {students?.length}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="relative group">
                <button
                  onClick={exportData}
                  className="flex items-center gap-2 space-x-2 rtl:space-x-reverse px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير Excel</span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={exportData}
                      className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 rtl:space-x-reverse"
                    >
                      <Download className="w-4 h-4" />
                      <span>جميع البيانات</span>
                    </button>
                    <button
                      onClick={exportActiveStudents}
                      className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 rtl:space-x-reverse"
                    >
                      <Users className="w-4 h-4" />
                      <span>النشطين فقط</span>
                    </button>
                    <button
                      onClick={exportNewStudents}
                      className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 rtl:space-x-reverse"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>الجدد فقط</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4  gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">تصفية البحث</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البحث عن الطلاب
              </label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو الايميل أو رقم الطالب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                />
              </div>
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المرحلة الدراسية
              </label>
              <div className="relative">
                <BookOpen className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-right"
                >
                  <option value="">اختر المرحلة الدراسية</option>
                  {univ_grades?.map((univ) => (
                    <option key={univ.university_id} value={univ.university_id}>
                      {univ.university_name}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div> */}

            {/* Grade Select */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الصف الدراسي
              </label>
              <div className="relative">
                <BookOpen className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-right"
                >
                  <option value="">اختر الصف الدراسي</option>
                  {univ_grades
                    ?.filter((item) => item.university_id == selectedYear)?.[0]
                    ?.grades?.map((grade) => (
                      <option key={grade.grade_id} value={grade.grade_id}>
                        {grade.grade_name}
                      </option>
                    ))}
                </select>
                <ChevronRight className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div> */}

            {/* Status Select */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة
              </label>
              <div className="relative">
                <Star className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-right"
                >
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div> */}
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 rtl:space-x-reverse gap-3">
            <div className="flex items-center space-x-2 rtl:space-x-reverse gap-3">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                مسح الفلاتر
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                تطبيق الفلاتر
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Students Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                إجمالي الطلاب
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {students?.length || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">جميع الطلاب المسجلين</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Students Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                الطلاب النشطين
              </p>
              <p className="text-3xl font-bold text-green-600">
                {students?.filter((item) => item?.blocked == "no").length || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">حسابات نشطة</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Blocked Students Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                الطلاب المحظورين
              </p>
              <p className="text-3xl font-bold text-red-600">
                {students?.filter((item) => item?.blocked == "yes").length || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">حسابات محظورة</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* New Students This Month Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                طلاب جدد هذا الشهر
              </p>
              <p className="text-3xl font-bold text-purple-600">
                {students?.filter((item) => {
                  const createdDate = new Date(item?.join_day);
                  const currentDate = new Date();
                  const monthAgo = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    1
                  );
                  return createdDate >= monthAgo;
                }).length || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">انضموا حديثاً</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Students by University */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4  gap-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              توزيع الجامعات
            </h3>
          </div>
          <div className="space-y-3">
            {univ_grades?.slice(0, 3).map((univ) => {
              const count =
                students?.filter(
                  (student) => student.university_id == univ.university_id
                ).length || 0;
              const percentage =
                students?.length > 0
                  ? Math.round((count / students.length) * 100)
                  : 0;
              return (
                <div
                  key={univ.university_id}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {univ.university_name}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right mr-3 rtl:mr-0 rtl:ml-3">
                    <p className="text-sm font-bold text-gray-900">{count}</p>
                    <p className="text-xs text-gray-500">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4  gap-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              النشاط الأخير
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 rtl:space-x-reverse gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">طلاب نشطين</span>
              </div>
              <span className="text-sm font-bold text-green-600">
                {students?.filter((item) => item?.blocked == "no").length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-2 rtl:space-x-reverse gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-700">طلاب محظورين</span>
              </div>
              <span className="text-sm font-bold text-red-600">
                {students?.filter((item) => item?.blocked == "yes").length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 rtl:space-x-reverse gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">إجمالي المسجلين</span>
              </div>
              <span className="text-sm font-bold text-blue-600">
                {students?.length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 gap-2">
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4  gap-2">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Star className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              إجراءات سريعة
            </h3>
          </div>
          <div className="space-y-3">
            <button
              onClick={exportData}
              className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse p-3 bg-green-600 text-white rounded-lg gap-2 hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">تصدير جميع البيانات</span>
            </button>

            <button
              onClick={exportActiveStudents}
              className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors gap-2"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">تصدير النشطين فقط</span>
            </button>

            <button
              onClick={exportNewStudents}
              className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse p-3 bg-purple-600 text-white gap-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <GraduationCap className="w-4 h-4" />
              <span className="text-sm font-medium">تصدير الجدد فقط</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">قائمة الطلاب</h3>
          <div className="text-sm text-gray-600">
            عرض{" "}
            <span className="font-semibold text-gray-900">
              {filteredStudents?.length || 0}
            </span>{" "}
            طالب
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={filteredStudents}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} من ${total} طالب`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          scroll={{ x: 1000 }}
          rowKey="student_id"
          size="middle"
        />
      </div>
    </div>
  );
};

export default StudentsPage;
