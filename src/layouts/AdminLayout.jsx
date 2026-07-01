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
  SettingOutlined,
  HeartOutlined,
  TrophyOutlined,
  CustomerServiceOutlined,
  InfoCircleOutlined,
  MenuOutlined,
  CloseOutlined
} from '@ant-design/icons'
import { UserContext } from '../App.jsx'

const { Header, Sider, Content } = Layout

export default function AdminLayout() {
  const { userInfo, logout } = useContext(UserContext)
  const location = useLocation()
  const navigate = useNavigate()
  const [timeStr, setTimeStr] = useState('')
  const [collapsed, setCollapsed] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Responsive layout listener
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992
      setIsMobile(mobile)
      if (mobile) {
        setCollapsed(true)
      } else {
        setCollapsed(false)
      }
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Auto-close drawer Sider on route change for mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true)
    }
  }, [location.pathname, isMobile])

  // Digital clock update
  useEffect(() => {
    const updateTime = () => {
      const d = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      const timePart = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
      const datePart = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
      setTimeStr(window.innerWidth < 576 ? timePart : `${datePart} ${timePart}`)
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // Dynamic Route Guard based on role
  useEffect(() => {
    if (userInfo && userInfo.role === 'student') {
      const allowedPaths = [
        '/student-dashboard',
        '/student-assessment',
        '/student-counseling',
        '/student-goals',
        '/student-music',
        '/student-profile',
        '/about'
      ]
      if (!allowedPaths.includes(location.pathname)) {
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
      key: '/student-assessment',
      icon: <FileTextOutlined />,
      label: <Link to="/student-assessment">心理测评中心</Link>,
    },
    {
      key: '/student-counseling',
      icon: <HeartOutlined />,
      label: <Link to="/student-counseling">情绪疏导中心</Link>,
    },
    {
      key: '/student-goals',
      icon: <TrophyOutlined />,
      label: <Link to="/student-goals">自我反馈与目标</Link>,
    },
    {
      key: '/student-music',
      icon: <CustomerServiceOutlined />,
      label: <Link to="/student-music">心灵音乐屋</Link>,
    },
    {
      key: '/student-profile',
      icon: <UserOutlined />,
      label: <Link to="/student-profile">个人资料设置</Link>,
    },
    {
      key: '/about',
      icon: <InfoCircleOutlined />,
      label: <Link to="/about">关于系统</Link>,
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
    {
      key: '/about',
      icon: <InfoCircleOutlined />,
      label: <Link to="/about">关于系统</Link>,
    }
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
    {
      key: '/about',
      icon: <InfoCircleOutlined />,
      label: <Link to="/about">关于系统</Link>,
    }
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
    <Layout style={{ minHeight: '100vh', background: 'var(--cyber-bg)', overflow: 'hidden' }}>
      {/* Mobile Drawer Backdrop Mask */}
      {isMobile && !collapsed && (
        <div 
          onClick={() => setCollapsed(true)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 999,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      {/* Sider Panel */}
      <Sider
        width={240}
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: 'rgba(10, 20, 45, 0.95)',
          borderRight: '1px solid var(--cyber-border)',
          position: 'fixed',
          height: '100vh',
          left: isMobile ? (collapsed ? -240 : 0) : 0,
          top: 0,
          zIndex: 1000,
          transition: 'left 0.3s ease, width 0.3s ease',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <div style={{ 
          height: 75, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          borderBottom: '1px solid rgba(0, 242, 254, 0.15)',
          padding: '8px 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Animated Brain Wave Ring */}
            <div style={{
              width: 20,
              height: 20,
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
          <div style={{ fontSize: 9, color: 'var(--cyber-text-muted)', letterSpacing: 0.5, marginTop: 2 }}>
            By 邹钰萧
          </div>
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
          padding: '24px 20px 40px 20px',
          textAlign: 'center'
        }}>
          <div className="cyber-card" style={{ padding: '12px 8px', marginBottom: 0, fontSize: 11, background: 'rgba(6,11,25,0.5)' }}>
            <span style={{ color: 'var(--cyber-primary)' }}>AI CORE ACTIVE By 邹钰萧</span>
            <div style={{ color: 'var(--cyber-text-muted)', fontSize: 9, marginTop: 4 }}>V1.0.0-SECURE</div>
          </div>
        </div>
      </Sider>

      {/* Main Layout Area */}
      <Layout style={{ 
        marginLeft: isMobile ? 0 : 240, 
        transition: 'margin-left 0.3s ease', 
        background: 'transparent',
        minWidth: 0
      }}>
        {/* Header Console */}
        <Header style={{ 
          background: 'rgba(10, 20, 45, 0.85)', 
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--cyber-border)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: isMobile ? '0 12px' : '0 24px',
          height: 64,
          position: 'sticky',
          top: 0,
          zIndex: 99
        }}>
          <div style={{ fontSize: isMobile ? 14 : 18, fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 12 }}>
            {isMobile && (
              <Button
                type="text"
                icon={collapsed ? <MenuOutlined style={{ color: 'var(--cyber-primary)' }} /> : <CloseOutlined style={{ color: 'var(--cyber-primary)' }} />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  marginRight: 4,
                  fontSize: '16px',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--cyber-border)',
                  background: 'rgba(13, 22, 50, 0.8)'
                }}
              />
            )}
            <span style={{ color: 'var(--cyber-primary)', fontSize: isMobile ? 11 : 14 }}>[CONSOLE]</span>
            <span className="cyber-glitch-text">{getPageTitle()}</span>
          </div>

          <Space size={isMobile ? 8 : 20}>
            {/* Realtime Digital Clock */}
            <div style={{ 
              color: 'var(--cyber-primary)', 
              fontFamily: 'var(--font-family-tech)', 
              fontSize: isMobile ? 11 : 13,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <ClockCircleOutlined />
              <span>{timeStr}</span>
            </div>

            {/* Profile Dropdown */}
            <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar 
                  size={isMobile ? 'small' : 'default'}
                  style={{ 
                    backgroundColor: userInfo?.role === 'student' ? 'var(--cyber-secondary)' : userInfo?.role === 'teacher' ? 'var(--cyber-primary)' : 'var(--cyber-success)',
                    boxShadow: `0 0 10px ${userInfo?.role === 'student' ? 'rgba(167, 139, 250, 0.5)' : userInfo?.role === 'teacher' ? 'rgba(0, 242, 254, 0.5)' : 'rgba(5, 243, 173, 0.5)'}`
                  }}
                  icon={<UserOutlined />} 
                />
                {!isMobile && <span style={{ color: '#fff', fontSize: 13 }}>{userInfo?.nickname || '未登录'}</span>}
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
