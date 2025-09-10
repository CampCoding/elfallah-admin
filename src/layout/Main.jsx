import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Gamepad2,
  Globe,
  Play,
  Grid3X3,
  Trophy,
  TrendingUp,
  Plus,
  Sparkles,
  Menu,
  X,
  Users,
  Clock,
  Zap,
  Star,
  ChevronRight,
  ChevronLeft,
  Bell,
  Settings,
  Search,
  House,
  Building,
  CreditCard,
  DollarSign,
  ArrowLeftRight,
  User,
  Calendar,
  LogOut,
  Book,
  Video,
  BookOpen,
} from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function Main() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState(3);

  const menuItems = [
    {
      id: "الصفحة الرئيسية",
      icon: BarChart3,
      label: "الصفحة الرئيسية",
      active: true,
      path: "/",
      badge: null,
    },
    // {
    //   id: "العقارات",
    //   icon: House,
    //   label: "العقارات",
    //   active: false,
    //   path: "/rent",
    //   badge: null,
    // },

    {
      id: "الدورات",
      icon: Book,
      label: "الدورات",
      active: false,
      path: "/courses",
      badge: null,
    },

    {
      id: "الفيديوهات",
      icon: Video,
      label: "الفيديوهات",
      active: false,
      path: "/videos",
      badge: null,
    },

    {
      id: "الاختبارات",
      icon: BookOpen,
      label: "الاختبارات",
      active: false,
      path: "/exams",
      badge: null,
    },

    // {
    //   id: "نظام الإدارة",
    //   label: "نظام الإدارة",
    // },
  ];

  const dashboardStats = [
    {
      label: "Total Matches",
      value: "1,247",
      icon: Gamepad2,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Win Rate",
      value: "78.5%",
      icon: Trophy,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
    },
    {
      label: "Hours Played",
      value: "542h",
      icon: Clock,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      label: "Ranking",
      value: "#42",
      icon: Star,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
  ];

  const recentMatches = [
    { game: "Counter Strike 2", result: "WIN", score: "16-12", time: "2h ago" },
    { game: "Valorant", result: "LOSS", score: "11-13", time: "4h ago" },
    { game: "Apex Legends", result: "WIN", score: "#3", time: "6h ago" },
    { game: "Rocket League", result: "WIN", score: "4-2", time: "1d ago" },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMenuClick = (item) => {
    navigate(item?.path);
    setActiveTab(item.label);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
      }
      if (e.key === "m" && e.ctrlKey) {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const location = useLocation();

  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      localStorage.removeItem("emore_user");
    } catch (err) {}
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-900 via-orange-300 to-red-500 p-2">
      <div className="flex  bg-gray-900/60 backdrop-blur-lg p-4  rounded-3xl overflow-hidden shadow-2xl w-full  mx-auto relative">
        {/* Sidebar Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={` transition  ${
            sidebarOpen ? "translate-x-0" : "translate-x-full bg-transparent  "
          } 
          fixed lg:relative  bg-black rounded lg:bg-transparent lg:translate-x-0 z-50 lg:z-auto
          w-64  flex flex-col transition-transform duration-300 ease-in-out h-full`}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 ">
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                <h1 className="text-white font-bold text-sm tracking-wider">
                  لوحة التحكم
                </h1>
              </div>
              <button
                onClick={toggleSidebar}
                className="lg:hidden text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="px-6 py-4 border-b border-gray-800">
            <div className="flex items-center gap-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white text-sm font-semibold">مستخدم</h3>
              </div>
              <div className="relative">
                <Bell className="w-4 h-4 text-gray-400" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white text-[10px]">
                    {notifications}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 py-6 overflow-y-auto">
            <ul className="space-y-1 px-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === activeTab;

                if (!item.path) {
                  return (
                    <li key={item.id} className="pt-3 pb-1">
                      <div className="flex items-center">
                        <div className="h-px bg-gray-400 flex-grow mr-2"></div>
                        <span className="text-sm p-1 text-white font-medium tracking-wider">
                          {item.label}
                        </span>
                        <div className="h-px bg-gray-400 flex-grow ml-2"></div>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleMenuClick(item)}
                      className={`w-full flex items-center gap-x-3 px-4 py-3 !text-3xl  rounded-lg text-left transition-all duration-200 group ${
                        item.path == location.pathname
                          ? "!bg-yellow-400 bg-opacity-20 shadow-2xl backdrop-blur-lg !text-black border-l-4 border-yellow-400 "
                          : "!text-white hover:text-white hover:bg-gray-800 hover:shadow-md"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isActive ? "scale-110" : "group-hover:scale-105"
                        }`}
                      />
                      <span className="text-xs font-medium tracking-wide ">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {!isActive && (
                        <ChevronLeft className="w-3 h-3 flex-grow opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-[calc(100%-256px)] bg-gray-100   rounded-3xl shadow-[0_0_15px_rgba(0,0,0)]    flex flex-col">
          {/* Top Bar */}
          <div className=" scrollba border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-x-4">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-xl font-bold text-gray-800 capitalize">
                {activeTab}
              </h2>
            </div>

            <div className="flex items-center gap-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="بحث ..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>
              <Settings className="w-5 h-5 text-gray-600 hover:text-gray-800 cursor-pointer transition-colors duration-200" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500 text-white text-xs hover:bg-red-600 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>

          <div className="p-4 overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
