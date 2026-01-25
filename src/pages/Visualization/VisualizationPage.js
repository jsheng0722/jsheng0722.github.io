import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import VisualizationToolkit from '../../components/Visualizations/VisualizationToolkit';

/**
 * 可视化工具页面 - 独立页面
 */
function VisualizationPage() {
  const location = useLocation();
  const initialCode = location.state?.code || null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header />
      
      <main className="flex-1" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="max-w-full h-full">
          <VisualizationToolkit initialCode={initialCode} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default VisualizationPage;

