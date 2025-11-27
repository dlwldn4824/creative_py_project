import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import CategoryDetail from "./pages/CategoryDetail.jsx";
import LifePage from "./pages/LifePage.jsx";
import "./App.css";
import HousingPage from "./pages/HousingPage.jsx";
import TransPortPage from "./pages/TransportPage.jsx"
import CrimePage from "./pages/CrimePage.jsx"


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/detail/:category" element={<CategoryDetail />} />
      <Route path="/life" element={<LifePage />} />
      <Route path="/housing" element={<HousingPage />} />
      <Route path="/transport" element={<TransPortPage/>}/>
      <Route path="/crime" element={<CrimePage/>}/>
      <Route path="/safety" element={<CrimePage />} />

    </Routes>
  );
}
