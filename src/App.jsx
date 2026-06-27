import React, { createContext, useContext, useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { message } from 'antd'

// Views
import Login from './views/Login.jsx'
import Dashboard from './views/Dashboard.jsx'
import StudentList from './views/StudentList.jsx'
import TeacherList from './views/TeacherList.jsx'
import ClassStatistics from './views/ClassStatistics.jsx'
import AssessmentRecords from './views/AssessmentRecords.jsx'
import AiAdvice from './views/AiAdvice.jsx'
import StudentDashboard from './views/StudentDashboard.jsx'
import AdminPanel from './views/AdminPanel.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'

// Auth Context
export const UserContext = createContext(null)

export const UserProvider = ({ children }) => {
  // === 1. Local Storage User Seeding ===
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('registeredUsers')
      if (saved) return JSON.parse(saved)
    } catch {}
    
    // Default seed accounts
    const seedUsers = [
      { id: '1', username: 'student', password: '123', nickname: '默认学生', role: 'student', className: '高一1班', gender: '男', avatar: '😊', bio: '好好学习，天天向上！' },
      { id: '2', username: 'teacher', password: '123', nickname: '陈老师', role: 'teacher', gender: '女', avatar: '👩‍🏫', bio: '心理成长守护者。' },
      { id: '3', username: 'admin', password: '123', nickname: '系统管理员', role: 'admin', gender: '男', avatar: '⚙️', bio: '系统核心管理端口。' }
    ]
    localStorage.setItem('registeredUsers', JSON.stringify(seedUsers))
    return seedUsers
  })

  // Sync users list to local storage
  useEffect(() => {
    localStorage.setItem('registeredUsers', JSON.stringify(users))
  }, [users])

  // Current session auth states
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [userInfo, setUserInfo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo') || '{}')
    } catch {
      return {}
    }
  })

  // === 2. Audit Logging System ===
  const [logs, setLogs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('auditLogs') || '[]')
    } catch {}
    return []
  })

  const addLog = (type, operator, action) => {
    const pad = (n) => String(n).padStart(2, '0')
    const now = new Date()
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    const newLog = {
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random()*1000),
      time: timeStr,
      type, // 'login' | 'operation'
      operator, // Name + role
      action,
      ip: '192.168.1.' + Math.floor(Math.random() * 150 + 100)
    }
    setLogs(prev => {
      const updated = [newLog, ...prev]
      localStorage.setItem('auditLogs', JSON.stringify(updated))
      return updated
    })
  }

  // === 3. Shared Tasks System ===
  const [assignedTasks, setAssignedTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('assignedTasks')
      if (saved) return JSON.parse(saved)
    } catch {}
    
    // Seed initial tasks
    const seedTasks = [
      { id: 'task-1', taskName: '主动运动', date: '2026-06-25', studentName: '默认学生', status: '已完成', feedback: '昨天慢跑了30分钟，心情舒畅多了！', className: '高一1班' },
      { id: 'task-2', taskName: '整理错题', date: '2026-06-26', studentName: '默认学生', status: '进行中', feedback: '', className: '高一1班' },
      { id: 'task-3', taskName: '帮助同学', date: '2026-06-26', studentName: '李四', status: '进行中', feedback: '', className: '高一2班' }
    ]
    localStorage.setItem('assignedTasks', JSON.stringify(seedTasks))
    return seedTasks
  })

  // Sync tasks to local storage
  useEffect(() => {
    localStorage.setItem('assignedTasks', JSON.stringify(assignedTasks))
  }, [assignedTasks])

  // === 4. Core Context Functions ===
  const login = (username, password) => {
    if (!username || !password) {
      throw new Error('请输入账号和密码')
    }

    const matchedUser = users.find(u => u.username === username && u.password === password)
    if (!matchedUser) {
      addLog('login', username, '尝试登录失败：密码或账号不匹配')
      throw new Error('账号或系统密钥错误')
    }

    const mockToken = 'token-' + Date.now()
    setToken(mockToken)
    setUserInfo(matchedUser)

    localStorage.setItem('token', mockToken)
    localStorage.setItem('userInfo', JSON.stringify(matchedUser))

    addLog('login', `${matchedUser.nickname} (${matchedUser.role})`, '用户成功登录系统')
  }

  const logout = () => {
    const operator = `${userInfo?.nickname || '未知用户'} (${userInfo?.role || '游客'})`
    addLog('login', operator, '用户退出登录')
    setToken('')
    setUserInfo({})
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  const register = (username, password, nickname, role, className = '', gender = '男') => {
    if (!username || !password || !nickname) {
      throw new Error('请完整填写注册信息')
    }

    const exists = users.some(u => u.username === username)
    if (exists) {
      throw new Error('该账号已被注册')
    }

    const newUser = {
      id: 'u-' + Date.now(),
      username,
      password,
      nickname,
      role,
      className,
      gender,
      avatar: role === 'student' ? '😊' : role === 'teacher' ? '👩‍🏫' : '⚙️',
      bio: role === 'student' ? '我是新加入的学生。' : '我是心理工作者。'
    }

    // Save to users state
    setUsers(prev => [...prev, newUser])

    // If role is student, sync to teacher's student list in localStorage
    if (role === 'student') {
      try {
        const currentStudents = JSON.parse(localStorage.getItem('studentsList') || '[]')
        
        // Check if student list has seeds, if not initialize it
        let listToUse = currentStudents
        if (listToUse.length === 0) {
          listToUse = [
            { id: 1, name: '张三', gender: '男', className: '高一1班', score: 82, risk: '正常', counselor: '陈老师', moodTrend: [75, 78, 80, 85, 82], dimensions: [80, 85, 70, 78, 82], interventions: [] },
            { id: 2, name: '李四', gender: '女', className: '高一2班', score: 61, risk: '轻度关注', counselor: '陈老师', moodTrend: [70, 68, 62, 59, 61], dimensions: [60, 50, 65, 58, 63], interventions: [] },
            { id: 3, name: '王五', gender: '男', className: '高二1班', score: 45, risk: '重点关注', counselor: '刘老师', moodTrend: [60, 55, 48, 42, 45], dimensions: [40, 30, 48, 50, 45], interventions: [] },
            { id: 4, name: '赵六', gender: '女', className: '高三4班', score: 52, risk: '中度关注', counselor: '刘老师', moodTrend: [68, 62, 58, 50, 52], dimensions: [50, 42, 55, 60, 50], interventions: [] },
            { id: 5, name: '孙七', gender: '男', className: '高一1班', score: 94, risk: '正常', counselor: '陈老师', moodTrend: [88, 90, 92, 95, 94], dimensions: [90, 92, 85, 88, 94], interventions: [] }
          ]
        }

        const newStudent = {
          id: listToUse.length + 1,
          name: nickname,
          gender,
          className,
          score: 80, // Initial default score
          risk: '正常',
          counselor: '陈老师',
          moodTrend: [80, 80, 80, 80, 80],
          dimensions: [80, 80, 80, 80, 80],
          interventions: []
        }

        const updatedStudents = [...listToUse, newStudent]
        localStorage.setItem('studentsList', JSON.stringify(updatedStudents))
      } catch (e) {
        console.error(e)
      }
    }

    addLog('operation', `${nickname} (新注册)`, `新账号注册成功，角色为：${role === 'student' ? '学生' : role === 'teacher' ? '教师' : '管理员'}`)
  }

  const updateUserInfo = (updatedFields) => {
    const updatedUser = { ...userInfo, ...updatedFields }
    setUserInfo(updatedUser)
    localStorage.setItem('userInfo', JSON.stringify(updatedUser))

    // Update in registeredUsers list as well
    setUsers(prev => prev.map(u => u.id === userInfo.id ? { ...u, ...updatedFields } : u))

    // Also if they updated their nickname or gender and are a student, sync to the studentsList
    if (userInfo.role === 'student') {
      try {
        const currentStudents = JSON.parse(localStorage.getItem('studentsList') || '[]')
        const updatedStudents = currentStudents.map(s => {
          if (s.name === userInfo.nickname) {
            return {
              ...s,
              name: updatedFields.nickname || s.name,
              gender: updatedFields.gender || s.gender,
              className: updatedFields.className || s.className
            }
          }
          return s
        })
        localStorage.setItem('studentsList', JSON.stringify(updatedStudents))
      } catch (e) {
        console.error(e)
      }
    }

    addLog('operation', `${updatedUser.nickname} (${updatedUser.role})`, '用户更新了个人账户信息设置')
  }

  const switchRole = (newRole) => {
    const defaultUserOfRole = users.find(u => u.role === newRole)
    if (defaultUserOfRole) {
      setUserInfo(defaultUserOfRole)
      localStorage.setItem('userInfo', JSON.stringify(defaultUserOfRole))
      addLog('operation', `演示模式切换`, `系统视角切换至：${newRole === 'student' ? '学生端' : newRole === 'teacher' ? '教师端' : '管理员端'}`)
      message.success(`已切换至【${newRole === 'student' ? '学生端' : newRole === 'teacher' ? '教师端' : '管理员端'}】视角`)
    }
  }

  return (
    <UserContext.Provider value={{
      token,
      userInfo,
      login,
      logout,
      switchRole,
      register,
      updateUserInfo,
      logs,
      addLog,
      assignedTasks,
      setAssignedTasks,
      users,
      setUsers
    }}>
      {children}
    </UserContext.Provider>
  )
}

// Router Guard
const RequireAuth = ({ children }) => {
  const { token } = useContext(UserContext)
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

// Floating Role Switcher Component with Dropdown Menu
const FloatingRoleSwitcher = () => {
  const { token, userInfo, switchRole } = useContext(UserContext)
  const navigate = useNavigate()
  const location = useLocation()

  if (!token || location.pathname === '/login') return null

  const getRoleLabel = (role) => {
    if (role === 'student') return '学生'
    if (role === 'teacher') return '教师'
    return '管理员'
  }

  const handleToggleRole = (nextRole) => {
    switchRole(nextRole)
    if (nextRole === 'student') {
      navigate('/student-dashboard')
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="role-switcher-fab" style={{ display: 'flex', flexDirection: 'column', padding: '12px 16px', borderRadius: 16 }}>
      <div style={{ fontSize: 10, color: 'var(--cyber-text-muted)', marginBottom: 6, fontWeight: 'bold' }}>角色切换面板</div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={() => handleToggleRole('student')}
          style={{
            background: userInfo.role === 'student' ? 'rgba(167, 139, 250, 0.25)' : 'transparent',
            border: `1px solid ${userInfo.role === 'student' ? 'var(--cyber-secondary)' : 'rgba(255,255,255,0.15)'}`,
            color: userInfo.role === 'student' ? 'var(--cyber-secondary)' : 'var(--cyber-text-muted)',
            padding: '3px 8px',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 10
          }}
        >
          学生端
        </button>
        <button
          onClick={() => handleToggleRole('teacher')}
          style={{
            background: userInfo.role === 'teacher' ? 'rgba(0, 242, 254, 0.25)' : 'transparent',
            border: `1px solid ${userInfo.role === 'teacher' ? 'var(--cyber-primary)' : 'rgba(255,255,255,0.15)'}`,
            color: userInfo.role === 'teacher' ? 'var(--cyber-primary)' : 'var(--cyber-text-muted)',
            padding: '3px 8px',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 10
          }}
        >
          教师端
        </button>
        <button
          onClick={() => handleToggleRole('admin')}
          style={{
            background: userInfo.role === 'admin' ? 'rgba(5, 243, 173, 0.25)' : 'transparent',
            border: `1px solid ${userInfo.role === 'admin' ? 'var(--cyber-success)' : 'rgba(255,255,255,0.15)'}`,
            color: userInfo.role === 'admin' ? 'var(--cyber-success)' : 'var(--cyber-text-muted)',
            padding: '3px 8px',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 10
          }}
        >
          主管端
        </button>
      </div>
    </div>
  )
}

function AppContent() {
  const { userInfo } = useContext(UserContext)
  
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/*"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          {/* Shared/Admin routes */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<StudentList />} />
          <Route path="teachers" element={<TeacherList />} />
          <Route path="classes" element={<ClassStatistics />} />
          <Route path="assessments" element={<AssessmentRecords />} />
          <Route path="ai-advice" element={<AiAdvice />} />
          <Route path="admin-panel" element={<AdminPanel />} />
          
          {/* Student routes */}
          <Route path="student-dashboard" element={<StudentDashboard />} />
          
          {/* Fallback route */}
          <Route
            path="*"
            element={
              <Navigate
                to={userInfo?.role === 'student' ? '/student-dashboard' : '/dashboard'}
                replace
              />
            }
          />
        </Route>
      </Routes>
      <FloatingRoleSwitcher />
    </>
  )
}

export default function App() {
  return (
    <UserProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </UserProvider>
  )
}
