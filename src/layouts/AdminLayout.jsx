import React, { useContext, useEffect, useState } from 'react'
import { Layout, Menu, Button, Space, Avatar, Dropdown, message } from 'antd'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  BarChartOutlined,
  FileTextOutlined,
  RobotOutlined,
  LogoutOutlined,
  ClockCircleOutlined,
  SlidersOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { UserContext } from '../App.jsx'

const { Header, Sider, Content } = Layout

export default function AdminLayout() {
  const { userInfo, logout } = useContext(UserContext)
  const location = useLocation()
  const navigate = useNavigate()
  const [timeStr, setTimeStr] = useState('')

  // Digital clock update
  useEffect(() => {
    const updateTime = () => {
      const d = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      setTimeStr(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`)
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // Dynamic Route Guard based on role
  useEffect(() => {
    if (userInfo && userInfo.role === 'student') {
      if (location.pathname !== '/student-dashboard' && location.pathname !== '/student-profile') {
        navigate('/student-dashboard', { replace: true })
      }
    } else if (userInfo && userInfo.role === 'teacher') {
      if (location.pathname === '/admin-panel' || location.pathname === '/student-dashboard') {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [userInfo, location.pathname, navigate])

  const handleLogout = () => {
    logout()
    message.success('已退出登录')
    navigate('/login')
  }

  // Get active menu key
  const activeKey = location.pathname

  // Menu structures
  const studentMenuItems = [
    {
      key: '/student-dashboard',
      icon: <SlidersOutlined />,
      label: <Link to="/student-dashboard">心理成长空间</Link>,
    },
    {
      key: '/student-profile',
      icon: <UserOutlined />,
      label: <Link to="/student-profile">个人资料设置</Link>,
    }
  ]

  const teacherMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">首页看板</Link>,
    },
    {
      key: '/students',
      icon: <UserOutlined />,
      label: <Link to="/students">学生管理</Link>,
    },
    {
      key: '/classes',
      icon: <BarChartOutlined />,
      label: <Link to="/classes">班级管理</Link>,
    },
    {
      key: '/assessments',
      icon: <FileTextOutlined />,
      label: <Link to="/assessments">测评记录</Link>,
    },
    {
      key: '/ai-advice',
      icon: <RobotOutlined />,
      label: <Link to="/ai-advice">AI成长建议</Link>,
    },
  ]

  const adminMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">首页看板</Link>,
    },
    {
      key: '/students',
      icon: <UserOutlined />,
      label: <Link to="/students">学生管理</Link>,
    },
    {
      key: '/teachers',
      icon: <TeamOutlined />,
      label: <Link to="/teachers">教师管理</Link>,
    },
    {
      key: '/classes',
      icon: <BarChartOutlined />,
      label: <Link to="/classes">班级统计</Link>,
    },
    {
      key: '/assessments',
      icon: <FileTextOutlined />,
      label: <Link to="/assessments">测评记录</Link>,
    },
    {
      key: '/ai-advice',
      icon: <RobotOutlined />,
      label: <Link to="/ai-advice">AI成长建议</Link>,
    },
    {
      key: '/admin-panel',
      icon: <SettingOutlined />,
      label: <Link to="/admin-panel">系统管理中心</Link>,
    },
  ]

  // Dynamically select menu items based on role
  const getMenuItems = () => {
    if (userInfo?.role === 'student') return studentMenuItems
    if (userInfo?.role === 'teacher') return teacherMenuItems
    return adminMenuItems // Default to admin
  }

  // Active page title helper
  const getPageTitle = () => {
    if (userInfo?.role === 'student') return '学生成长空间'
    
    const allMenuItems = [...adminMenuItems, ...studentMenuItems]
    const match = allMenuItems.find(item => item.key === activeKey)
    if (match) {
      return match.label.props.children
    }
    return '系统中心'
  }

  const userDropdownItems = [
    {
      key: '1',
      icon: <LogoutOutlined />,
      label: '退出系统',
      onClick: handleLogout,
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--cyber-bg)' }}>
      {/* Sider Panel */}
      <Sider
        width={240}
        style={{
          background: 'rgba(10, 20, 45, 0.9)',
          borderRight: '1px solid var(--cyber-border)',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          borderBottom: '1px solid rgba(0, 242, 254, 0.15)',
          gap: 8
        }}>
          {/* Animated Brain Wave Ring */}
          <div style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: '2px solid var(--cyber-primary)',
            boxShadow: '0 0 8px var(--cyber-primary)',
            animation: 'glowAnimation 1.5s infinite alternate',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            color: 'var(--cyber-primary)'
          }}>
            Ψ
          </div>
          <span style={{ 
            color: '#fff', 
            fontWeight: 'bold', 
            fontSize: 15, 
            letterSpacing: 1.0,
            textShadow: '0 0 8px rgba(0, 242, 254, 0.5)'
          }}>
            EmotionGrowth AI
          </span>
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          items={getMenuItems()}
          style={{ 
            background: 'transparent', 
            borderRight: 0,
            padding: '16px 8px'
          }}
        />

        <div style={{
          position: 'absolute',
          bottom: 80,
          left: 0,
          width: '100%',
          padding: '0 20px',
          textAlign: 'center'
        }}>
          <div className="cyber-card" style={{ padding: '12px 8px', marginBottom: 0, fontSize: 11, background: 'rgba(6,11,25,0.5)' }}>
            <span style={{ color: 'var(--cyber-primary)' }}>AI CORE ACTIVE</span>
            <div style={{ color: 'var(--cyber-text-muted)', fontSize: 9, marginTop: 4 }}>V1.0.0-SECURE</div>
          </div>
        </div>
      </Sider>

      {/* Main Layout Area */}
      <Layout style={{ marginLeft: 240, background: 'transparent' }}>
        {/* Header Console */}
        <Header style={{ 
          background: 'rgba(10, 20, 45, 0.85)', 
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--cyber-border)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '0 24px',
          height: 64,
          position: 'sticky',
          top: 0,
          zIndex: 99
        }}>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: 'var(--cyber-primary)', fontSize: 14 }}>[CONSOLE]</span>
            <span className="cyber-glitch-text">{getPageTitle()}</span>
          </div>

          <Space size={20}>
            {/* Realtime Digital Clock */}
            <div style={{ 
              color: 'var(--cyber-primary)', 
              fontFamily: 'var(--font-family-tech)', 
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <ClockCircleOutlined />
              <span>{timeStr}</span>
            </div>

            {/* Profile Dropdown */}
            <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar 
                  style={{ 
                    backgroundColor: userInfo?.role === 'student' ? 'var(--cyber-secondary)' : userInfo?.role === 'teacher' ? 'var(--cyber-primary)' : 'var(--cyber-success)',
                    boxShadow: `0 0 10px ${userInfo?.role === 'student' ? 'rgba(167, 139, 250, 0.5)' : userInfo?.role === 'teacher' ? 'rgba(0, 242, 254, 0.5)' : 'rgba(5, 243, 173, 0.5)'}`
                  }}
                  icon={<UserOutlined />} 
                />
                <span style={{ color: '#fff', fontSize: 13 }}>{userInfo?.nickname || '未登录'}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Content Outlet */}
        <Content style={{ minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
