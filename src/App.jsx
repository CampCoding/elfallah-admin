import "antd/dist/reset.css";
import "./assets/styles/main.css";
import "./assets/styles/responsive.css";
import "./App.css";

import AppRoutes from "./routes/appRoutes.jsx";
import { ConfigProvider } from "antd";
import { Toaster } from "react-hot-toast";
import axios from "axios";
import { baseUrl } from "./utils/base_url";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
function App() {
  const emore_user = JSON.parse(localStorage.getItem("emore_user"));
  console.log("emore_user", emore_user)
  const location = useLocation();
   const getCourses = () => {
      return axios
        .post(`${baseUrl}/admin/universities/select_universities_grade.php`, {
          admin_id: emore_user?.admin_id,
          access_token: emore_user?.access_token,
        })
        .then((response) => {
          if(response.data.status == "error" && location.pathname != "/login"){
            localStorage.clear();
            window.location.href = "/login";
          }
          console.log("response", response)
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
              message: error.response ? error.response.data : error.message, // Handling Axios error response
            },
          };
        });
    }
    useEffect(() => {
      if(emore_user)
      getCourses();
    }, []);
    console.log(getCourses);
  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            // Seed Token
            colorPrimary: "#599066",

            // Alias Token
          },
        }}
      >
        <AppRoutes />
        {/* // initiate toast */}
        {/* <Toaster position="top-center" reverseOrder={false} /> */}
      </ConfigProvider>
      <Toaster />
    </>
  );
}

export default App;
