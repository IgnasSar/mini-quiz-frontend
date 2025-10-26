import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserEntry from "./pages/UserEntry";
import Quiz from "./pages/Quiz";
import TopNav from "./components/TopNav";
import AddQuestion from "./pages/AddQuestion";
import DeleteQuestion from "./pages/DeleteQuestion";
import Result from "./pages/Result";
import "./styles/globals.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0f172a] text-slate-100">
        <TopNav />
        <div className="pt-16">
          <Routes>
            <Route path="/" element={<UserEntry />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/add" element={<AddQuestion />} />
            <Route path="/delete" element={<DeleteQuestion />} />
            <Route path="/result" element={<Result />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
