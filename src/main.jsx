import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, theme } from 'antd'
import App from './App.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#00f2fe',
          colorBgBase: '#060b19',
          colorBgContainer: '#0c1530',
          colorBorder: 'rgba(0, 242, 254, 0.25)',
          colorText: '#e2e8f0',
          colorTextDescription: '#8499b4',
          borderRadius: 6,
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)
