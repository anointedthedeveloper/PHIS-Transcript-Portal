import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import TranscriptPage from './pages/TranscriptPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/transcript/:id" element={<TranscriptPage />} />
      </Routes>
    </BrowserRouter>
  );
}
