import ReactDOM from "react-dom/client";
import App from "./App";
import { RoleProvider } from "./context/RoleProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <RoleProvider>
    <App />
  </RoleProvider>
);