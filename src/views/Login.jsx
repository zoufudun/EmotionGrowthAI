import React, { useState, useContext, useEffect, useRef } from 'react'
import { Form, Input, Button, Card, message, Tabs, Select, Radio, AutoComplete, Row, Col, Modal } from 'antd'

const REGION_SCHOOLS = {
  '北京': {
    '小学': ['北京市中关村第一小学', '北京师范大学实验小学', '北京市朝阳区实验小学', '北京大学附属小学'],
    '初中': ['人大附中初中部', '北京四中初中部', '清华附中初中部', '北京八中初中部'],
    '大学': ['北京大学', '清华大学', '中国人民大学', '北京师范大学', '北京航空航天大学']
  },
  '上海': {
    '小学': ['上海市第一师范学校附属小学', '上海实验学校小学部', '上海市黄浦区蓬莱路第二小学', '上海市徐汇区实验小学', '上海市马桥文来外国语小学', '上海市长宁区金钟路小学', '上海市浦东新区金钟路小学', '上海市闵行区文来外国语小学', '上海市徐汇区实验小学', '上海市闵行区文来外国语小学', '上海市浦东新区明珠小学', '上海市浦东新区金桥小学', '上海市闵行区紫竹小学', '上海市闵行区晶城第一小学', '上海市闵行区七宝外国语小学'],
    '初中': ['上海民办华育中学', '上海市建平中学西校', '上海市市北初级中学', '上海交通大学附属闵行实验学校', '上海外国语大学附属学校', '上海交通大学第二附属中学'],
    '大学': ['复旦大学', '上海交通大学', '同济大学', '华东师范大学', '上海大学', '上海海事大学', '上海科技大学', '上海对外经济贸易大学', '上海音乐学院', '上海理工大学']
  },
  '广东': {
    '小学': ['华南师范大学附属小学', '广州市东风东路小学', '深圳市深圳小学', '深圳市实验学校小学部'],
    '初中': ['广东实验中学初中部', '深圳中学初中部', '华南师范大学附属中学初中部'],
    '大学': ['中山大学', '华南理工大学', '暨南大学', '深圳大学', '南方科技大学']
  },
  '四川': {
    '小学': ['成都市实验小学', '四川大学附属实验小学', '成都市泡桐树小学', '成都市盐道街小学'],
    '初中': ['成都七中育才学校', '成都石室联合中学', '成都树德实验中学'],
    '大学': ['四川大学', '电子科技大学', '西南交通大学', '西南财经大学', '四川师范大学']
  },
  '湖北': {
    '小学': ['武汉市实验小学', '武汉大学附属小学', '华中师范大学附属小学', '武汉市育才小学'],
    '初中': ['武汉外国语学校初中部', '华中师范大学第一附属中学初中部', '武汉市第二中学初中部'],
    '大学': ['武汉大学', '华中科技大学', '华中师范大学', '武汉理工大学', '中国地质大学']
  },
  '浙江': {
    '小学': ['杭州市天长小学', '杭州市求是教育集团小学', '浙江大学教育学院附属学校'],
    '初中': ['杭州外国语学校初中部', '杭州建兰中学', '杭州文澜中学'],
    '大学': ['浙江大学', '浙江工业大学', '浙江师范大学', '杭州电子科技大学']
  },
  '江苏': {
    '小学': ['南京市拉萨路小学', '南京市琅琊路小学', '苏州大学实验学校小学部'],
    '初中': ['南京外国语学校初中部', '南京师范大学附属中学初中部', '江苏省苏州中学初中部'],
    '大学': ['南京大学', '东南大学', '南京航空航天大学', '苏州大学', '江南大学']
  },
  '其他地区': {
    '小学': ['当地第一实验小学', '市属中心小学'],
    '初中': ['当地第一中学初中部', '市实验中学'],
    '大学': ['当地综合性大学', '省属重点大学']
  }
}

const DEFAULT_CLASSES_BY_GROUP = {
  '小学组': Array.from({ length: 15 }, (_, i) => `小学(${i + 1})班`),
  '初中组': Array.from({ length: 15 }, (_, i) => `初中(${i + 1})班`),
  '高中组': Array.from({ length: 15 }, (_, i) => `高中(${i + 1})班`),
  '大学组': Array.from({ length: 15 }, (_, i) => `大学(${i + 1})班`)
}
import { UserOutlined, LockOutlined, RightOutlined, SmileOutlined, TeamOutlined, SettingOutlined, WechatOutlined, DownloadOutlined, UploadOutlined, SafetyCertificateOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../App.jsx'

const { Option } = Select

export default function Login() {
  const { login, register, users, setUsers } = useContext(UserContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('login')
  const [registerRole, setRegisterRole] = useState('student')
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [customClasses, setCustomClasses] = useState([])
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [selectedStage, setSelectedStage] = useState(null)

  const [loginForm] = Form.useForm()
  const [registerForm] = Form.useForm()
  const [recoveryForm] = Form.useForm()
  const [resetPwdForm] = Form.useForm()

  // Account Recovery States
  const [recoveryModalVisible, setRecoveryModalVisible] = useState(false)
  const [recoveredUser, setRecoveredUser] = useState(null)
  const fileInputRef = useRef(null)

  // Account Recovery Matcher
  const handleRecoverAccount = (values) => {
    const matched = users.find(u => 
      u.username === values.username.trim() && 
      u.nickname === values.nickname.trim() && 
      u.role === values.role
    )
    
    if (!matched) {
      message.error('未找到匹配的账户，请核对用户名、姓名和角色是否正确')
      return
    }

    if (values.role === 'student' && values.school && matched.school !== values.school) {
      message.error('学校信息不匹配')
      return
    }

    setRecoveredUser(matched)
    message.success('账户身份验证成功！')
  }

  // Password Reset
  const handleResetPassword = (values) => {
    const newPassword = values.newPassword
    if (!newPassword || !newPassword.trim()) {
      message.warning('新密码不能为空')
      return
    }

    const updatedUsers = users.map(u => 
      u.id === recoveredUser.id ? { ...u, password: newPassword.trim() } : u
    )
    
    setUsers(updatedUsers)
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers))
    localStorage.setItem('registeredUsers_backup', JSON.stringify(updatedUsers))

    message.success('密码重置成功！请使用新密码登录')
    setRecoveryModalVisible(false)
    setRecoveredUser(null)
    recoveryForm.resetFields()
    resetPwdForm.resetFields()
  }

  // Export Users Backup to File
  const handleExportBackup = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(users, null, 2))
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute("href", dataStr)
      downloadAnchor.setAttribute("download", `emotion_growth_users_backup_${Date.now()}.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
      message.success('用户数据备份导出成功！已保存为本地 JSON 文件')
    } catch (e) {
      message.error('导出备份失败：' + e.message)
    }
  }

  // Import Users Backup from File
  const handleImportBackup = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const importedList = JSON.parse(event.target.result)
        if (!Array.isArray(importedList)) {
          throw new Error('无效的备份文件格式')
        }

        const valid = importedList.every(u => u.username && u.password && u.nickname && u.role)
        if (!valid) {
          throw new Error('备份文件中的部分用户信息字段缺失')
        }

        const currentUsers = [...users]
        let addCount = 0
        importedList.forEach(imp => {
          const exists = currentUsers.some(u => u.username === imp.username)
          if (!exists) {
            currentUsers.push(imp)
            addCount++
          }
        })

        setUsers(currentUsers)
        localStorage.setItem('registeredUsers', JSON.stringify(currentUsers))
        localStorage.setItem('registeredUsers_backup', JSON.stringify(currentUsers))

        message.success(`成功恢复并合并了 ${addCount} 个账户信息！`)
      } catch (err) {
        message.error('导入备份失败：' + err.message)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem('classList')
      if (saved) {
        setCustomClasses(JSON.parse(saved))
      }
    } catch { }
  }, [activeTab])

  const getClassOptions = () => {
    if (!selectedGroup) return []
    const defaults = DEFAULT_CLASSES_BY_GROUP[selectedGroup] || []
    const custom = customClasses
      .filter(c => c.group === selectedGroup)
      .map(c => c.className)
    const combined = Array.from(new Set([...defaults, ...custom]))
    return combined.map(c => ({ value: c }))
  }

  const getSchoolOptions = () => {
    if (!selectedRegion || !selectedStage) return []
    const schools = REGION_SCHOOLS[selectedRegion]?.[selectedStage] || []
    return schools.map(s => ({ value: s }))
  }

  const handleMockWechatLogin = () => {
    setLoading(true)
    setTimeout(() => {
      try {
        login('student', '123')
        message.success('微信扫码授权成功，欢迎进入心理空间！')
        navigate('/student-dashboard')
      } catch (e) {
        message.error(e.message || '微信登录失败')
      } finally {
        setLoading(false)
      }
    }, 1200)
  }

  const onLoginFinish = (values) => {
    setLoading(true)
    setTimeout(() => {
      try {
        login(values.username, values.password)
        message.success('系统验证通过，欢迎进入控制台')

        // Dynamically find user's role to redirect
        const matched = users.find(u => u.username === values.username)
        if (matched && matched.role === 'student') {
          navigate('/student-dashboard')
        } else {
          // Both teacher and admin route to /dashboard by default
          navigate('/dashboard')
        }
      } catch (error) {
        message.error(error.message)
      } finally {
        setLoading(false)
      }
    }, 1000)
  }

  const onRegisterFinish = (values) => {
    setLoading(true)
    setTimeout(() => {
      try {
        register(
          values.username,
          values.password,
          values.nickname,
          values.role,
          values.role === 'student' ? values.className : '',
          values.gender,
          values.role === 'student' ? values.school : '',
          ''
        )
        message.success('注册成功！已为您建立系统档案，请登录。')
        // Pre-fill login credentials and switch tab
        loginForm.setFieldsValue({
          username: values.username,
          password: values.password
        })
        setActiveTab('login')
        registerForm.resetFields()
      } catch (error) {
        message.error(error.message)
      } finally {
        setLoading(false)
      }
    }, 1000)
  }

  const handleQuickLogin = (role) => {
    loginForm.setFieldsValue({
      username: role,
      password: '123'
    })
    setActiveTab('login')
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--cyber-bg)',
      position: 'relative',
      overflowX: 'hidden',
      overflowY: 'auto',
      padding: '20px 12px'
    }}>
      {/* Sci-Fi Decorative Grid Circles */}
      <div style={{
        position: 'fixed',
        width: 600,
        height: 600,
        borderRadius: '50%',
        border: '1px dashed rgba(0, 242, 254, 0.1)',
        animation: 'spin 60s linear infinite',
        pointerEvents: 'none',
        top: '10%',
        left: '-10%',
      }} />
      <div style={{
        position: 'fixed',
        width: 800,
        height: 800,
        borderRadius: '50%',
        border: '1px dashed rgba(167, 139, 250, 0.08)',
        animation: 'spin 120s linear infinite reverse',
        pointerEvents: 'none',
        bottom: '-20%',
        right: '-10%',
      }} />

      {/* Login / Register Card */}
      <Card
        className="cyber-card cyber-alert-pulse"
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'rgba(10, 20, 45, 0.82)',
          boxShadow: '0 0 35px rgba(0, 242, 254, 0.15)',
          zIndex: 10,
          padding: '10px 10px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            display: 'inline-block',
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '2px solid var(--cyber-primary)',
            boxShadow: '0 0 15px var(--cyber-primary)',
            lineHeight: '44px',
            fontSize: 22,
            color: 'var(--cyber-primary)',
            marginBottom: 12
          }}>
            Ψ
          </div>
          <h2 className="cyber-glitch-text" style={{
            color: '#fff',
            fontSize: 24,
            fontWeight: 'bold',
            letterSpacing: 2,
            marginBottom: 2
          }}>
            EmotionGrowth AI
          </h2>
          <div style={{ fontSize: 13, color: 'var(--cyber-primary)', fontWeight: 'bold', marginBottom: 8 }}>
            By 邹钰萧
          </div>
          <p style={{ color: 'var(--cyber-text-muted)', fontSize: 12 }}>
            EMOTION & COGNITIVE INTELLIGENCE SYSTEM
          </p>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={[
            {
              key: 'login',
              label: <span style={{ fontSize: 15 }}><RightOutlined /> 账户登录</span>,
              children: (
                <Form
                  form={loginForm}
                  name="login_form"
                  initialValues={{ username: 'admin', password: '123' }}
                  onFinish={onLoginFinish}
                  layout="vertical"
                  style={{ marginTop: 12 }}
                >
                  <Form.Item
                    name="username"
                    rules={[{ required: true, message: '请输入账户代码' }]}
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: 'var(--cyber-primary)' }} />}
                      placeholder="系统账户名称 / 代码"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: '请输入访问秘钥' }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: 'var(--cyber-primary)' }} />}
                      placeholder="系统访问密码"
                      size="large"
                    />
                  </Form.Item>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                    <a 
                      onClick={() => setRecoveryModalVisible(true)} 
                      style={{ color: 'var(--cyber-primary)', fontSize: 12, cursor: 'pointer', textShadow: '0 0 5px rgba(0, 242, 254, 0.3)' }}
                    >
                      忘记密码 / 找回与恢复账户？
                    </a>
                  </div>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      size="large"
                      icon={<RightOutlined />}
                      className="cyber-btn"
                      style={{
                        height: 44,
                        background: 'transparent',
                        borderColor: 'var(--cyber-primary)',
                        fontWeight: 'bold',
                        letterSpacing: 1.5,
                        marginTop: 8
                      }}
                    >
                      安全登录
                    </Button>
                  </Form.Item>
                </Form>
              )
            },
            {
              key: 'wechat-login',
              label: <span style={{ fontSize: 15 }}><WechatOutlined style={{ color: '#07c160' }} /> 微信扫码</span>,
              children: (
                <div style={{ textAlign: 'center', padding: '20px 0 10px 0' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=07c160&bgcolor=111827&data=${encodeURIComponent(window.location.href + '?mock_wechat_login=true')}`}
                    alt="微信扫码登录二维码"
                    style={{
                      width: 180,
                      height: 180,
                      margin: '0 auto 16px auto',
                      display: 'block',
                      borderRadius: 8,
                      border: '2px solid #07c160',
                      boxShadow: '0 0 15px rgba(7,193,96,0.3)'
                    }}
                  />
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>微信安全扫码登录</div>
                  <div style={{ color: 'var(--cyber-text-muted)', fontSize: 11, marginBottom: 20 }}>
                    请使用微信 App 扫描二维码以快速授权登录本系统
                  </div>
                  
                  <Button 
                    type="primary" 
                    className="cyber-btn"
                    icon={<WechatOutlined />}
                    loading={loading}
                    onClick={handleMockWechatLogin}
                    style={{ width: '100%', height: 40, background: '#07c160', borderColor: '#07c160', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    模拟扫码成功：一键微信快捷登录
                  </Button>
                </div>
              )
            },
            {
              key: 'register',
              label: <span style={{ fontSize: 15 }}><SmileOutlined /> 新生注册</span>,
              children: (
                <Form
                  form={registerForm}
                  name="register_form"
                  initialValues={{ role: 'student', gender: '男', className: '高一1班' }}
                  onFinish={onRegisterFinish}
                  layout="vertical"
                  style={{ marginTop: 12 }}
                >
                  <Form.Item
                    name="username"
                    label="注册账户名"
                    rules={[{ required: true, message: '请设定登录账户名' }]}
                  >
                    <Input placeholder="输入登录所用的账号" />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label="设置系统密码"
                    rules={[{ required: true, message: '请设置登录密码' }]}
                  >
                    <Input.Password placeholder="密码" />
                  </Form.Item>

                  <Form.Item
                    name="nickname"
                    label="姓名 / 昵称"
                    rules={[{ required: true, message: '请输入您的姓名或别名' }]}
                  >
                    <Input placeholder="姓名" />
                  </Form.Item>

                  <Form.Item
                    name="gender"
                    label="性别"
                  >
                    <Radio.Group>
                      <Radio value="男" style={{ color: '#fff' }}>男</Radio>
                      <Radio value="女" style={{ color: '#fff' }}>女</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    name="role"
                    label="账户角色"
                  >
                    <Select onChange={(val) => {
                      setRegisterRole(val)
                      setSelectedGroup(null)
                      setSelectedRegion(null)
                      setSelectedStage(null)
                      registerForm.setFieldsValue({ className: undefined, group: undefined, region: undefined, schoolStage: undefined, school: undefined })
                    }}>
                      <Option value="student">学生 (Student)</Option>
                      <Option value="teacher">心理教师 (Teacher)</Option>
                      <Option value="admin">系统主管 (Admin)</Option>
                    </Select>
                  </Form.Item>

                  {registerRole === 'student' && (
                    <Row gutter={12}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="region"
                          label="所属地区"
                          rules={[{ required: true, message: '请选择所属省份/地区' }]}
                        >
                          <Select
                            placeholder="选择省份/地区 (如：北京、上海)"
                            onChange={(val) => {
                              setSelectedRegion(val)
                              registerForm.setFieldsValue({ school: undefined })
                            }}
                          >
                            {Object.keys(REGION_SCHOOLS).map(r => (
                              <Option key={r} value={r}>{r}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="schoolStage"
                          label="学校类型"
                          rules={[{ required: true, message: '请选择学校类型' }]}
                        >
                          <Select
                            placeholder="选择学校类型 (小学、初中、大学)"
                            onChange={(val) => {
                              setSelectedStage(val)
                              registerForm.setFieldsValue({ school: undefined })
                            }}
                          >
                            <Option value="小学">小学 (Primary School)</Option>
                            <Option value="初中">初中 (Junior High)</Option>
                            <Option value="大学">大学 (University)</Option>
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col xs={24}>
                        <Form.Item
                          name="school"
                          label="所属学校"
                          rules={[{ required: true, message: '请选择或输入您的学校' }]}
                        >
                          <AutoComplete
                            options={getSchoolOptions()}
                            placeholder="请选择或输入具体学校"
                            filterOption={(inputValue, option) =>
                              option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                            }
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="group"
                          label="学段组别"
                          rules={[{ required: true, message: '请选择学段组别' }]}
                        >
                          <Select
                            placeholder="请选择学段组别"
                            onChange={(val) => {
                              setSelectedGroup(val)
                              registerForm.setFieldsValue({ className: undefined })
                            }}
                          >
                            <Option value="小学组">小学组 (Elementary)</Option>
                            <Option value="初中组">初中组 (Junior High)</Option>
                            <Option value="高中组">高中组 (Senior High)</Option>
                            <Option value="大学组">大学组 (University)</Option>
                            <Option value="其他/自定义">其他/自定义</Option>
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="className"
                          label="所属班级"
                          rules={[{ required: true, message: '请选择或输入您的班级' }]}
                        >
                          <AutoComplete
                            options={getClassOptions()}
                            placeholder="选择或输入您的班级"
                            filterOption={(inputValue, option) =>
                              option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                            }
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      size="large"
                      className="cyber-btn cyber-btn-purple"
                      style={{
                        height: 44,
                        background: 'transparent',
                        borderColor: 'var(--cyber-secondary)',
                        fontWeight: 'bold',
                        letterSpacing: 1.5,
                        marginTop: 8
                      }}
                    >
                      提交注册并开户
                    </Button>
                  </Form.Item>
                </Form>
              )
            }
          ]}
        />

        {/* Demo Accounts Panel */}
        <div style={{
          marginTop: 16,
          paddingTop: 12,
          borderTop: '1px dashed rgba(0, 242, 254, 0.15)',
          textAlign: 'center'
        }}>
          <div style={{ color: 'var(--cyber-text-muted)', fontSize: 11, marginBottom: 8 }}>
            快速调试通道 (初始密码: 123)
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              size="small"
              onClick={() => handleQuickLogin('student')}
              className="cyber-btn cyber-btn-purple"
              style={{ fontSize: 10 }}
            >
              学生 (student)
            </Button>
            <Button
              size="small"
              onClick={() => handleQuickLogin('teacher')}
              className="cyber-btn"
              style={{ fontSize: 10 }}
            >
              教师 (teacher)
            </Button>
            <Button
              size="small"
              onClick={() => handleQuickLogin('admin')}
              className="cyber-btn"
              style={{ fontSize: 10, borderColor: 'var(--cyber-success)', color: 'var(--cyber-success)' }}
            >
              主管 (admin)
            </Button>
          </div>
        </div>
      </Card>

      {/* Glitch spin style helper */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Account Recovery & Backup Modal */}
      <Modal
        title={
          <span style={{ color: '#fff', fontSize: 16 }}>
            <SafetyCertificateOutlined style={{ color: 'var(--cyber-primary)', marginRight: 8 }} />
            账户找回与数据安全中心
          </span>
        }
        open={recoveryModalVisible}
        onCancel={() => {
          setRecoveryModalVisible(false)
          setRecoveredUser(null)
          recoveryForm.resetFields()
          resetPwdForm.resetFields()
        }}
        footer={null}
        width={500}
        bodyStyle={{ padding: '12px 0 0 0' }}
      >
        <div style={{ color: 'var(--cyber-text-muted)', fontSize: 12, marginBottom: 16 }}>
          💡 如果您忘记了访问秘钥或由于系统更新/浏览器缓存清理导致账号丢失，可以通过此中心直接找回或使用备份文件恢复。
        </div>

        <Tabs
          defaultActiveKey="find"
          items={[
            {
              key: 'find',
              label: '🔎 身份验证找回',
              children: (
                <div style={{ padding: '10px 0' }}>
                  {!recoveredUser ? (
                    <Form
                      form={recoveryForm}
                      layout="vertical"
                      onFinish={handleRecoverAccount}
                    >
                      <Form.Item
                        name="role"
                        label="您的身份角色"
                        rules={[{ required: true, message: '请选择角色' }]}
                        initialValue="student"
                      >
                        <Radio.Group>
                          <Radio value="student" style={{ color: '#fff' }}>学生</Radio>
                          <Radio value="teacher" style={{ color: '#fff' }}>教师</Radio>
                          <Radio value="admin" style={{ color: '#fff' }}>系统主管</Radio>
                        </Radio.Group>
                      </Form.Item>

                      <Form.Item
                        name="username"
                        label="注册账户名"
                        rules={[{ required: true, message: '请输入您注册时的登录用户名' }]}
                      >
                        <Input placeholder="输入登录用户名" />
                      </Form.Item>

                      <Form.Item
                        name="nickname"
                        label="真实姓名 / 昵称"
                        rules={[{ required: true, message: '请输入您注册时的姓名/昵称' }]}
                      >
                        <Input placeholder="输入姓名/昵称" />
                      </Form.Item>

                      <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role}
                      >
                        {({ getFieldValue }) =>
                          getFieldValue('role') === 'student' ? (
                            <Form.Item
                              name="school"
                              label="所属学校"
                              rules={[{ required: true, message: '学生用户必须核对所属学校' }]}
                            >
                              <Input placeholder="输入注册时的完整学校名称" />
                            </Form.Item>
                          ) : null
                        }
                      </Form.Item>

                      <Form.Item style={{ marginTop: 12 }}>
                        <Button type="primary" htmlType="submit" block className="cyber-btn">
                          验证身份并找回
                        </Button>
                      </Form.Item>
                    </Form>
                  ) : (
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 6, border: '1px solid rgba(0, 242, 254, 0.15)' }}>
                      <div style={{ color: 'var(--cyber-success)', fontWeight: 'bold', marginBottom: 12 }}>
                        ✓ 身份验证成功！您的账户信息如下：
                      </div>
                      <div style={{ color: '#fff', fontSize: 13, marginBottom: 8 }}>
                        <b>账号名：</b> {recoveredUser.username}
                      </div>
                      <div style={{ color: '#fff', fontSize: 13, marginBottom: 8 }}>
                        <b>姓名/昵称：</b> {recoveredUser.nickname}
                      </div>
                      <div style={{ color: '#fff', fontSize: 13, marginBottom: 16 }}>
                        <b>当前密码：</b> <span style={{ color: 'var(--cyber-primary)', fontWeight: 'bold' }}>{recoveredUser.password}</span>
                      </div>

                      <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />

                      <Form
                        form={resetPwdForm}
                        layout="vertical"
                        onFinish={handleResetPassword}
                      >
                        <Form.Item
                          name="newPassword"
                          label="直接重置密码"
                          rules={[{ required: true, message: '密码不能为空' }, { min: 3, message: '密码至少3位' }]}
                        >
                          <Input.Password placeholder="输入新密码" />
                        </Form.Item>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button style={{ flex: 1 }} onClick={() => setRecoveredUser(null)}>
                            重新验证
                          </Button>
                          <Button type="primary" htmlType="submit" style={{ flex: 1 }} className="cyber-btn">
                            确认修改密码
                          </Button>
                        </div>
                      </Form>
                    </div>
                  )}
                </div>
              )
            },
            {
              key: 'backup',
              label: '💾 备份与导入恢复',
              children: (
                <div style={{ padding: '10px 0', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                    <div style={{
                      background: 'rgba(0, 242, 254, 0.05)',
                      border: '1px solid rgba(0, 242, 254, 0.1)',
                      borderRadius: 6,
                      padding: 12,
                      width: '100%',
                      textAlign: 'left'
                    }}>
                      <div style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>
                        1. 导出本站所有注册用户备份
                      </div>
                      <div style={{ color: 'var(--cyber-text-muted)', fontSize: 11, marginBottom: 8 }}>
                        将当前系统内的所有注册账户及密码信息导出为一个本地 JSON 备份文件。
                      </div>
                      <Button 
                        type="primary" 
                        icon={<DownloadOutlined />} 
                        onClick={handleExportBackup}
                        style={{ borderColor: 'var(--cyber-primary)', color: 'var(--cyber-primary)', background: 'transparent' }}
                      >
                        立即导出备份文件
                      </Button>
                    </div>

                    <div style={{
                      background: 'rgba(167, 139, 250, 0.05)',
                      border: '1px solid rgba(167, 139, 250, 0.1)',
                      borderRadius: 6,
                      padding: 12,
                      width: '100%',
                      textAlign: 'left'
                    }}>
                      <div style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>
                        2. 从备份文件恢复账户数据
                      </div>
                      <div style={{ color: 'var(--cyber-text-muted)', fontSize: 11, marginBottom: 8 }}>
                        上传之前导出的 JSON 备份文件，合并未重复的账号信息到当前浏览器中。
                      </div>
                      <input 
                        type="file" 
                        accept=".json" 
                        ref={fileInputRef} 
                        onChange={handleImportBackup} 
                        style={{ display: 'none' }} 
                      />
                      <Button 
                        type="primary" 
                        icon={<UploadOutlined />} 
                        onClick={() => fileInputRef.current.click()}
                        style={{ borderColor: 'var(--cyber-secondary)', color: 'var(--cyber-secondary)', background: 'transparent' }}
                      >
                        上传并恢复备份
                      </Button>
                    </div>
                  </div>
                </div>
              )
            }
          ]}
        />
      </Modal>
    </div>
  )
}

