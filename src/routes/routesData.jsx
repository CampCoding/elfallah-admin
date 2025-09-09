import React from "react";

import Main from "./../layout/Main";
import UnitsPage from "./../pages/UnitsPage/index";
import CoursesPage from "./../pages/CoursesPage/index";
import VideosPage from "./../pages/VideosPage/index";
import PDFsPage from "./../pages/PDFsPage/index";
import QuestionsPage from "./../pages/QuestionsPage/index";
import LoginPage from "../pages/LoginPage";
import ExamsPage from "../pages/ExamsPage/index";
import ExamQuesPage from "../pages/ExamQuesPage/index";
import UnitVideosPage from "../pages/UnitVideosPage";
import InteractiveQuestionsPage from "../pages/InteractiveQuestionsPage";

export const routes = [
  localStorage.getItem("emore_user")
    ? {
        path: "/",
        // element: <Main />,
        element: <Main />,
        children: [
          { path: "/", element: <>الصفحة الرئيسية</> },
          { path: "/units", element: <UnitsPage /> },
          { path: "/courses", element: <CoursesPage /> },
          { path: "/videos", element: <VideosPage /> },
          { path: "/pdfs", element: <PDFsPage /> },
          { path: "/questions", element: <QuestionsPage /> },
          { path: "/exams", element: <ExamsPage /> },
          { path: "/exam-questions", element: <ExamQuesPage /> },
          { path: "/unit-videos", element: <UnitVideosPage /> },
          {
            path: "/interactive-questions",
            element: <InteractiveQuestionsPage />,
          },
        ],
      }
    : {
        path: "*",
        element: <LoginPage />,
      },
];
