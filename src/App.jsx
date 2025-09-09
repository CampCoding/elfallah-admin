import "antd/dist/reset.css";
import "./assets/styles/main.css";
import "./assets/styles/responsive.css";
import "./App.css";

import AppRoutes from "./routes/appRoutes.jsx";
import { ConfigProvider } from "antd";
import { Toaster } from "react-hot-toast";
function App() {
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
