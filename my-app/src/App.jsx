import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import CategoryDetail from "./pages/CategoryDetail.jsx";
import LifePage from "./pages/LifePage.jsx";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/detail/:category" element={<CategoryDetail />} />
      <Route path="/life" element={<LifePage />} />
    </Routes>
  );
}
