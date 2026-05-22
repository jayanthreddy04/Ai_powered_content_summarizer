import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { SummaryProvider } from './context/SummaryContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import TextSummarizer from './pages/TextSummarizer';
import UrlSummarizer from './pages/UrlSummarizer';
import PdfSummarizer from './pages/PdfSummarizer';
import History from './pages/History';
import SemanticSearch from './pages/SemanticSearch';

export default function App() {
  return (
    <ThemeProvider>
      <SummaryProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="text" element={<TextSummarizer />} />
              <Route path="url" element={<UrlSummarizer />} />
              <Route path="pdf" element={<PdfSummarizer />} />
              <Route path="history" element={<History />} />
              <Route path="search" element={<SemanticSearch />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'dark:bg-slate-800 dark:text-white',
            duration: 4000,
          }}
        />
      </SummaryProvider>
    </ThemeProvider>
  );
}
