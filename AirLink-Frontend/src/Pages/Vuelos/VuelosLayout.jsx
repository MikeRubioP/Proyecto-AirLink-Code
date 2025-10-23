import { Outlet } from "react-router-dom";
import Steps from "./context/Steps";

export default function VuelosLayout() {
  return (
    <div className="space-y-6">
      <Steps />
      <Outlet />
    </div>
  );
}
