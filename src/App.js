import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home/NewHome';
import ClassicHome from './pages/Home/ClassicHome';
import NotePage from './pages/Note/Note';
import NoteHome from './pages/Note/NoteHome';
import NoteEditor from './pages/Note/NoteEditor';
import NoteView from './pages/Note/NoteView';
import NotFoundPage from './pages/NotFoundPage';
import Portfolio from './pages/Portfolio/Portfolio';
import Products from "./pages/Products/Products";
import Music from './pages/Music/Music';
import SimpleTextRecorder from './pages/Music/SimpleTextRecorder';
import FileManagerPage from './pages/FileManager/FileManagerPage';
import DesktopPage from './pages/Desktop/DesktopPage';
import BlogHome from './pages/Blog/BlogHome';
import VideoPlayer from './pages/Video/VideoPlayer';
import ShopHome from './pages/Shop/ShopHome';
import AddProduct from './pages/Shop/AddProduct';
import VisualizationPage from './pages/Visualization/VisualizationPage';
import ArchitecturePage from './pages/Architecture/ArchitecturePage';
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider } from './context/I18nContext';

function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/classic" element={<ClassicHome />} />
            <Route path="/notes" element={<NoteHome />} />
            <Route path="/notes/editor" element={<NoteEditor />} />
            <Route path="/notes/view/:id" element={<NoteView />} />
            <Route path="/notes/old" element={<NotePage />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/products" element={<Products />} />
            <Route path="/music" element={<Music />} />
            <Route path="/music/simple-recorder" element={<SimpleTextRecorder />} />
            <Route path="/files" element={<FileManagerPage />} />
            <Route path="/desktop" element={<DesktopPage />} />
            <Route path="/blog" element={<BlogHome />} />
            <Route path="/video" element={<VideoPlayer />} />
            <Route path="/shop" element={<ShopHome />} />
            <Route path="/shop/add" element={<AddProduct />} />
            <Route path="/visualization" element={<VisualizationPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;