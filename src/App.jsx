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
import StudentProfile from './views/StudentProfile.jsx'
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
      { id: '1', username: 'student', password: '123', nickname: '默认学生', role: 'student', className: '高一1班', gender: '男', school: '朝阳区第一实验小学', idCard: '110101201001011234', avatar: '😊', bio: '好好学习，天天向上！' },
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

  // Self-healing database cleanup for old seed data
  useEffect(() => {
    try {
      const savedStudents = localStorage.getItem('studentsList')
      if (savedStudents) {
        const parsed = JSON.parse(savedStudents)
        const cleaned = parsed.filter(s => s.name !== '张三' && s.name !== '李四' && s.name !== '王五' && s.name !== '赵六' && s.name !== '孙七')
        if (cleaned.length !== parsed.length) {
          localStorage.setItem('studentsList', JSON.stringify(cleaned))
        }
      }

      const savedRecords = localStorage.getItem('assessmentRecords')
      if (savedRecords) {
        const parsed = JSON.parse(savedRecords)
        const cleaned = parsed.filter(r => r.studentName !== '张三' && r.studentName !== '李四' && r.studentName !== '王五' && r.studentName !== '赵六' && r.studentName !== '孙七')
        if (cleaned.length !== parsed.length) {
          localStorage.setItem('assessmentRecords', JSON.stringify(cleaned))
        }
      }
      
      const savedTasks = localStorage.getItem('assignedTasks')
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks)
        const cleaned = parsed.filter(t => t.studentName !== '李四' && t.studentName !== '王五' && t.studentName !== '赵六' && t.studentName !== '孙七' && t.studentName !== '张三')
        if (cleaned.length !== parsed.length) {
          localStorage.setItem('assignedTasks', JSON.stringify(cleaned))
          setAssignedTasks(cleaned)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

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

  const register = (username, password, nickname, role, className = '', gender = '男', school = '', idCard = '') => {
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
      school: role === 'student' ? school : '',
      idCard: role === 'student' ? idCard : '',
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
            { id: 1, name: '默认学生', gender: '男', className: '高一1班', school: '朝阳区第一实验小学', idCard: '110101201001011234', score: 82, risk: '正常', counselor: '陈老师', moodTrend: [75, 78, 80, 85, 82], dimensions: [80, 85, 70, 78, 82], interventions: [] }
          ]
        }

        const newStudent = {
          id: listToUse.length + 1,
          name: nickname,
          gender,
          className,
          school,
          idCard,
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

  const cancelAccount = (userId) => {
    const targetUser = users.find(u => u.id === userId)
    if (!targetUser) return

    // 1. Remove from registered users list
    setUsers(prev => prev.filter(u => u.id !== userId))
    
    // 2. If it is a student, delete their profile record from studentsList
    if (targetUser.role === 'student') {
      try {
        const currentStudents = JSON.parse(localStorage.getItem('studentsList') || '[]')
        const updatedStudents = currentStudents.filter(s => s.name !== targetUser.nickname)
        localStorage.setItem('studentsList', JSON.stringify(updatedStudents))
        
        // Also delete their assessment records
        const currentRecords = JSON.parse(localStorage.getItem('assessmentRecords') || '[]')
        const updatedRecords = currentRecords.filter(r => r.studentName !== targetUser.nickname)
        localStorage.setItem('assessmentRecords', JSON.stringify(updatedRecords))
      } catch (e) {
        console.error(e)
      }
    }

    addLog('operation', `${targetUser.nickname || '未知用户'} (${targetUser.role || '未知角色'})`, '用户账号已注销并清除个人心理档案')

    // 3. Clear session and log out
    setToken('')
    setUserInfo({})
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    
    message.success('您的账号已注销成功，感谢您的使用！')
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
          <Route path="student-profile" element={<StudentProfile />} />
          
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
