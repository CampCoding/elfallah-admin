import React from "react";
import {routes} from "./routesData";
import {Route, Routes, useLocation} from "react-router-dom";


const AppRoutes = () => {
  const location = useLocation();

  const renderRoutes = (routes) => {
    return routes.map((item , index) => {
      const uniqueKey = item.path + "-" + index; // ✅ اجعل المفتاح فريدًا

      if (item.children) {
        return (
          <Route
            key={uniqueKey} // ✅ استخدم path بدلاً من index
            path={item.path}
            element={<div>{item.element}</div>}
          >
            {renderRoutes(item.children)}
          </Route>
        );
      } else {
        return (
          <Route
            key={uniqueKey} // ✅ استخدم path بدلاً من index
            path={item.path}
            element={<div>{item.element}</div>}
          />
        );
      }
    });
  };

  return (
    <Routes location={location} key={"404"}>
      {renderRoutes(routes)}
    </Routes>
  );
};

export default AppRoutes;
