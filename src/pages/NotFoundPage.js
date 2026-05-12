// import React, { useEffect  } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Layout/Header/Header';
import { useI18n } from '../context/I18nContext';

function NotFoundPage() {
  const { t } = useI18n();
  // const navigate = useNavigate();

  // // 自动跳转逻辑
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     navigate('/'); // 计时结束后跳转到主页
  //   }, 3000); // 3秒倒计时

  //   return () => clearTimeout(timer); // 清理定时器
  // }, [navigate]);

  return (
    <div>
    <Header/>
      <div className="h-screen flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold mb-4">{t('NotFoundTitle')}</h1>
        <p className="mb-8">{t('NotFoundMessage')}</p>
        <Link to="/" className="text-blue-500 hover:underline">
          {t('NotFoundBackHome')}
        </Link>
      </div>
      
    </div>
  );
}

export default NotFoundPage;
