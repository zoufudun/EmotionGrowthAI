import React, { useState, useEffect, useContext } from 'react'
import {
  Row,
  Col,
  Table,
  Tag,
  Button,
  Input,
  Modal,
  Select,
  Slider,
  Switch,
  Space,
  message,
  Tabs,
  Form,
  Divider,
  Card,
  InputNumber,
  Badge
} from 'antd'
import {
  ImportOutlined,
  UserOutlined,
  SettingOutlined,
  SearchOutlined,
  DownloadOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  DatabaseOutlined,
  SlidersOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { UserContext } from '../App.jsx'

const { TextArea } = Input

export default function AdminPanel() {
  const { logs, addLog, users, setUsers, userInfo } = useContext(UserContext)
  const [activeTab, setActiveTab] = useState('classes')

  // === 1. Class Management & Mock Student Import ===
  const [classesData, setClassesData] = useState([
    { key: '1', className: '高一1班', studentCount: 46, warningCount: 2, normalCount: 44, averageScore: 88 },
    { key: '2', className: '高一2班', studentCount: 45, warningCount: 7, normalCount: 38, averageScore: 76 },
    { key: '3', className: '高二1班', studentCount: 40, warningCount: 8, normalCount: 32, averageScore: 71 },
    { key: '4', className: '高三4班', studentCount: 42, warningCount: 5, normalCount: 37, averageScore: 78 }
  ])

  const [importModalVisible, setImportModalVisible] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importCount, setImportCount] = useState(5)

  // Reload class statistics based on localStorage
  const refreshClassStats = () => {
    try {
      const savedStudents = JSON.parse(localStorage.getItem('studentsList') || '[]')
      if (savedStudents.length > 0) {
        // Group by className
        const groups = {}
        savedStudents.forEach(student => {
          const cls = student.className || '高一1班'
          if (!groups[cls]) {
            groups[cls] = { studentCount: 0, warningCount: 0, normalCount: 0, totalScore: 0 }
          }
          groups[cls].studentCount++
          if (student.risk && student.risk !== '正常') {
            groups[cls].warningCount++
          } else {
            groups[cls].normalCount++
          }
          groups[cls].totalScore += (student.score || 80)
        })

        const newClasses = Object.keys(groups).map((cls, idx) => ({
          key: String(idx + 1),
          className: cls,
          studentCount: groups[cls].studentCount,
          warningCount: groups[cls].warningCount,
          normalCount: groups[cls].normalCount,
          averageScore: Math.round(groups[cls].totalScore / groups[cls].studentCount)
        }))
        setClassesData(newClasses)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    refreshClassStats()
  }, [])

  const handleMockImport = () => {
    setIsImporting(true)
    setTimeout(() => {
      try {
        const currentStudents = JSON.parse(localStorage.getItem('studentsList') || '[]')
        const firstNames = ['赵', '钱', '孙', '李', '周', '吴', '郑', '王', '冯', '陈', '楚', '卫', '蒋', '沈', '韩', '杨', '叶', '高']
        const lastNames = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '洋', '勇', '杰', '娟', '涛', '明', '超', '秀兰', '霞', '平']
        const classes = ['高一1班', '高一2班', '高二1班', '高三4班']
        const risks = ['正常', '轻度关注', '中度关注', '重点关注']

        const newStudents = []
        for (let i = 0; i < importCount; i++) {
          const name = firstNames[Math.floor(Math.random() * firstNames.length)] + lastNames[Math.floor(Math.random() * lastNames.length)]
          const gender = Math.random() > 0.5 ? '男' : '女'
          const className = classes[Math.floor(Math.random() * classes.length)]
          const score = Math.floor(Math.random() * 55) + 45 // 45 to 100
          
          let risk = '正常'
          if (score < 55) risk = '重点关注'
          else if (score < 68) risk = '中度关注'
          else if (score < 80) risk = '轻度关注'

          const moodHistory = Array.from({ length: 5 }, () => Math.floor(Math.random() * 40) + 60)
          const dimensions = Array.from({ length: 5 }, () => Math.floor(Math.random() * 40) + 50)

          newStudents.push({
            id: currentStudents.length + i + 1,
            name,
            gender,
            className,
            score,
            risk,
            counselor: Math.random() > 0.5 ? '陈老师' : '刘老师',
            moodTrend: moodHistory,
            dimensions,
            interventions: []
          })
        }

        const updatedList = [...currentStudents, ...newStudents]
        localStorage.setItem('studentsList', JSON.stringify(updatedList))
        refreshClassStats()
        
        // Also register mock student users so they can log in
        const currentUsers = [...users]
        newStudents.forEach(s => {
          // Check if username exists
          const username = 'std_' + Math.floor(Math.random() * 89999 + 10000)
          currentUsers.push({
            id: 'u-mock-' + s.id,
            username,
            password: '123',
            nickname: s.name,
            role: 'student',
            className: s.className,
            gender: s.gender,
            avatar: '😊',
            bio: '我是批量导入的模拟学生。'
          })
        })
        setUsers(currentUsers)

        addLog(
          'operation',
          `${userInfo.nickname} (${userInfo.role})`,
          `批量一键导入并创建了 ${importCount} 名学生心理健康档案及系统账号`
        )

        message.success(`成功导入 ${importCount} 条学生心理健康数据！`)
        setImportModalVisible(false)
      } catch (e) {
        message.error('导入失败: ' + e.message)
      } finally {
        setIsImporting(false)
      }
    }, 1500)
  }

  // === 2. Permissions & Users Management ===
  const handleRoleChange = (userId, newRole) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    const updatedUsers = users.map(u => (u.id === userId ? { ...u, role: newRole } : u))
    setUsers(updatedUsers)
    addLog(
      'operation',
      `${userInfo.nickname} (${userInfo.role})`,
      `修改用户 ${user.nickname} (@${user.username}) 的系统角色为 [${newRole === 'student' ? '学生' : newRole === 'teacher' ? '教师' : '管理员'}]`
    )
    message.success(`已将用户 ${user.nickname} 的权限角色修改为 ${newRole === 'student' ? '学生' : newRole === 'teacher' ? '教师' : '管理员'}`)
  }

  const handleStatusChange = (userId, active) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    const updatedUsers = users.map(u => (u.id === userId ? { ...u, isFrozen: !active } : u))
    setUsers(updatedUsers)
    addLog(
      'operation',
      `${userInfo.nickname} (${userInfo.role})`,
      `${active ? '启用' : '冻结'}了用户 ${user.nickname} (@${user.username}) 的系统账号`
    )
    message.success(`已${active ? '启用' : '冻结'}该用户账号`)
  }

  // === 3. AI Model Parameters Configuration ===
  const [modelConfig, setModelConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('aiModelConfig')
      if (saved) return JSON.parse(saved)
    } catch {}
    return {
      provider: 'DeepSeek-V3',
      temperature: 0.7,
      maxTokens: 800,
      systemPrompt: '你是一位专业的学校心理成长顾问和情绪解惑大师。结合学生今日选择的心情颜色、心情记事（今日发生了什么）以及设定的明日小目标（明日我想怎样做），为学生提供字数适中、带有共情、温暖关怀并附带科学指引的AI成长疏导反馈。'
    }
  })

  const saveModelConfig = (values) => {
    localStorage.setItem('aiModelConfig', JSON.stringify(values))
    setModelConfig(values)
    addLog(
      'operation',
      `${userInfo.nickname} (${userInfo.role})`,
      `更新了系统 AI 情绪分析引擎参数（模型: ${values.provider}, 创造性温度: ${values.temperature}）`
    )
    message.success('AI模型配置参数保存成功，已同步至全局情绪分析引擎！')
  }

  // === 4. Safety Audit Logs Filters ===
  const [searchOperator, setSearchOperator] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [searchAction, setSearchAction] = useState('')
  const [filteredLogs, setFilteredLogs] = useState([])

  useEffect(() => {
    let result = [...logs]
    if (searchOperator) {
      result = result.filter(l => l.operator.toLowerCase().includes(searchOperator.toLowerCase()))
    }
    if (filterType !== 'all') {
      result = result.filter(l => l.type === filterType)
    }
    if (searchAction) {
      result = result.filter(l => l.action.toLowerCase().includes(searchAction.toLowerCase()))
    }
    setFilteredLogs(result)
  }, [logs, searchOperator, filterType, searchAction])

  // === 5. Data Report Mock Exports ===
  const triggerExport = (reportName, format) => {
    try {
      let data = []
      let headers = []
      let filename = `${reportName}_${Date.now()}`

      if (reportName === 'warning_list') {
        const list = JSON.parse(localStorage.getItem('studentsList') || '[]')
        data = list.filter(s => s.risk && s.risk !== '正常')
        headers = ['ID', '姓名', '性别', '班级', '最新评分', '风险评估', '负责教师']
      } else if (reportName === 'assessment_scores') {
        data = JSON.parse(localStorage.getItem('studentsList') || '[]')
        headers = ['ID', '姓名', '性别', '班级', '综合评测分数', '状态等级']
      } else if (reportName === 'audit_logs') {
        data = logs
        headers = ['日志ID', '发生时间', '日志类型', '操作人', '行为细节', '访问IP']
      }

      let fileContent = ''
      if (format === 'csv') {
        // Generate CSV content
        const rows = [headers.join(',')]
        data.forEach(item => {
          if (reportName === 'warning_list') {
            rows.push([item.id, item.name, item.gender, item.className, item.score, item.risk, item.counselor].join(','))
          } else if (reportName === 'assessment_scores') {
            rows.push([item.id, item.name, item.gender, item.className, item.score, item.risk].join(','))
          } else if (reportName === 'audit_logs') {
            rows.push([item.id, item.time, item.type, item.operator, `"${item.action.replace(/"/g, '""')}"`, item.ip].join(','))
          }
        })
        fileContent = '\uFEFF' + rows.join('\n') // UTF-8 BOM
        filename += '.csv'
      } else {
        // Generate JSON content
        fileContent = JSON.stringify(data, null, 2)
        filename += '.json'
      }

      // Browser trigger download
      const blob = new Blob([fileContent], { type: format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      addLog(
        'operation',
        `${userInfo.nickname} (${userInfo.role})`,
        `成功导出了 [${reportName}] 数据报表，格式为 [${format.toUpperCase()}]`
      )
      message.success(`报表 ${filename} 导出成功！`)
    } catch (e) {
      message.error('导出失败: ' + e.message)
    }
  }

  // Table Columns
  const classColumns = [
    { title: '班级名称', dataIndex: 'className', key: 'className' },
    {
      title: '在籍学生总数',
      dataIndex: 'studentCount',
      key: 'studentCount',
      render: (val) => <span style={{ fontFamily: 'var(--font-family-tech)', fontWeight: 'bold' }}>{val} 人</span>
    },
    {
      title: '预警关注人数',
      dataIndex: 'warningCount',
      key: 'warningCount',
      render: (val) => (
        <span style={{ color: val > 0 ? '#ff4d4f' : '#05f3ad', fontWeight: 'bold' }}>
          {val > 0 ? `⚠️ ${val} 人` : '无异常'}
        </span>
      )
    },
    { title: '正常绿码人数', dataIndex: 'normalCount', key: 'normalCount', render: (val) => `${val} 人` },
    {
      title: '班级心理平均分',
      dataIndex: 'averageScore',
      key: 'averageScore',
      render: (score) => (
        <span style={{
          fontFamily: 'var(--font-family-tech)',
          fontWeight: 'bold',
          color: score >= 80 ? '#05f3ad' : score >= 65 ? '#ffb800' : '#ff4d4f'
        }}>
          {score} 分
        </span>
      )
    }
  ]

  const userColumns = [
    { title: '账号用户名', dataIndex: 'username', key: 'username' },
    { title: '显示昵称', dataIndex: 'nickname', key: 'nickname' },
    {
      title: '当前角色',
      dataIndex: 'role',
      key: 'role',
      render: (role, record) => {
        let color = 'blue'
        let label = '学生'
        if (role === 'teacher') {
          color = 'cyan'
          label = '教师'
        } else if (role === 'admin') {
          color = 'green'
          label = '管理员'
        }
        return <Tag color={color}>{label}</Tag>
      }
    },
    {
      title: '账号状态',
      key: 'status',
      render: (_, record) => (
        <Switch
          checkedChildren="启用"
          unCheckedChildren="冻结"
          checked={!record.isFrozen}
          onChange={(checked) => handleStatusChange(record.id, checked)}
          disabled={record.username === 'admin'} // Cannot freeze main admin
        />
      )
    },
    {
      title: '权限提拔变更',
      key: 'action',
      render: (_, record) => (
        <Select
          defaultValue={record.role}
          style={{ width: 120 }}
          onChange={(val) => handleRoleChange(record.id, val)}
          disabled={record.username === 'admin'} // Cannot demote main admin
        >
          <Select.Option value="student">学生端</Select.Option>
          <Select.Option value="teacher">教师端</Select.Option>
          <Select.Option value="admin">管理员</Select.Option>
        </Select>
      )
    }
  ]

  const logColumns = [
    { title: '触发时间', dataIndex: 'time', key: 'time', width: 160 },
    {
      title: '日志类别',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => (
        <Tag color={type === 'login' ? 'blue' : 'purple'}>
          {type === 'login' ? '登录审计' : '操作审计'}
        </Tag>
      )
    },
    {
      title: '操作主体',
      dataIndex: 'operator',
      key: 'operator',
      width: 150,
      render: (text) => (
        <span style={{ color: 'var(--cyber-primary)', fontWeight: '500' }}>
          <UserOutlined /> {text}
        </span>
      )
    },
    {
      title: '详细行为细节描述',
      dataIndex: 'action',
      key: 'action'
    },
    {
      title: '访问IP',
      dataIndex: 'ip',
      key: 'ip',
      width: 120,
      render: (ip) => <code style={{ color: 'var(--cyber-text-muted)', fontSize: 11 }}>{ip}</code>
    }
  ]

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="page-header-container">
        <div>
          <div className="page-title">系统核心管理面板</div>
          <div className="page-subtitle">管理全校心理班级、分配系统角色权限、调谐 AI 引擎参数、审计安全日志</div>
        </div>
      </div>

      <div className="cyber-card" style={{ padding: 0 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ padding: '0 20px 20px 20px' }}
          items={[
            {
              key: 'classes',
              label: (
                <span>
                  <TeamOutlined /> 班级管理与数据导入
                </span>
              ),
              children: (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
                      全校班级心理健康概览看板 ({classesData.length} 个班级)
                    </div>
                    <Button
                      type="primary"
                      className="cyber-btn"
                      icon={<ImportOutlined />}
                      onClick={() => setImportModalVisible(true)}
                    >
                      批量导入学生心理建档
                    </Button>
                  </div>

                  <Table
                    columns={classColumns}
                    dataSource={classesData}
                    pagination={false}
                    rowKey="className"
                    scroll={{ x: 'max-content' }}
                  />
                </div>
              )
            },
            {
              key: 'permissions',
              label: (
                <span>
                  <SafetyCertificateOutlined /> 权限分配与角色分配
                </span>
              ),
              children: (
                <div style={{ marginTop: 16 }}>
                  <div style={{ color: 'var(--cyber-text-muted)', fontSize: 13, marginBottom: 16 }}>
                    管理员可在下方调整系统内所有注册用户的权限类型。更改后用户刷新系统或重新登录即可应用新的角色视图与功能模块。
                  </div>

                  <Table
                    columns={userColumns}
                    dataSource={users}
                    rowKey="id"
                    pagination={{ pageSize: 8 }}
                    scroll={{ x: 'max-content' }}
                  />
                </div>
              )
            },
            {
              key: 'ai-config',
              label: (
                <span>
                  <SettingOutlined /> AI 引擎参数调谐
                </span>
              ),
              children: (
                <div style={{ marginTop: 16, maxWidth: 800 }}>
                  <div style={{ color: 'var(--cyber-text-muted)', fontSize: 13, marginBottom: 20 }}>
                    调整应用于“学生情绪打卡反馈”和“AI心理建议”中的底层语言模型接口控制参数。
                  </div>

                  <Form
                    layout="vertical"
                    initialValues={modelConfig}
                    onFinish={saveModelConfig}
                  >
                    <Form.Item
                      name="provider"
                      label="大语言模型服务商模型选择"
                      rules={[{ required: true }]}
                    >
                      <Select style={{ width: '100%' }}>
                        <Select.Option value="DeepSeek-V3">DeepSeek-V3 (推荐 - 高性价比心理学调优版)</Select.Option>
                        <Select.Option value="GPT-4o">OpenAI GPT-4o (高智能决策版)</Select.Option>
                        <Select.Option value="Claude-3.5-Sonnet">Anthropic Claude 3.5 Sonnet (高共情叙事版)</Select.Option>
                        <Select.Option value="Local-Psych-13B">本地私有化部署 PsychModel-13B (局域网数据隔离)</Select.Option>
                      </Select>
                    </Form.Item>

                    <Row gutter={24}>
                      <Col span={12}>
                        <Form.Item
                          name="temperature"
                          label="创造性温度 (Temperature)"
                          extra="数值越高，AI生成内容越随机、富有同理心与创意；数值越低，回复越严谨和规范。"
                        >
                          <Slider min={0} max={1.2} step={0.1} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="maxTokens"
                          label="最大生成长度限制 (Max Tokens)"
                        >
                          <InputNumber min={100} max={4000} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="systemPrompt"
                      label="情绪导师系统引导 System Prompt 模板"
                      rules={[{ required: true }]}
                    >
                      <TextArea rows={6} placeholder="输入 AI 扮演心理顾问的角色设定..." />
                    </Form.Item>

                    <Form.Item>
                      <Button type="primary" htmlType="submit" className="cyber-btn cyber-btn-purple">
                        保存模型配置参数
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              )
            },
            {
              key: 'audit-logs',
              label: (
                <span>
                  <DatabaseOutlined /> 安全审计操作日志
                </span>
              ),
              children: (
                <div style={{ marginTop: 16 }}>
                  {/* Filters */}
                  <div className="cyber-card" style={{ padding: '16px 20px', marginBottom: 16 }}>
                    <Row gutter={16} align="middle">
                      <Col xs={24} sm={6}>
                        <Input
                          placeholder="搜索操作人"
                          value={searchOperator}
                          onChange={e => setSearchOperator(e.target.value)}
                          prefix={<UserOutlined />}
                        />
                      </Col>
                      <Col xs={24} sm={6}>
                        <Select
                          value={filterType}
                          onChange={setFilterType}
                          style={{ width: '100%' }}
                        >
                          <Select.Option value="all">所有日志类别</Select.Option>
                          <Select.Option value="login">登录审计日志</Select.Option>
                          <Select.Option value="operation">操作行为日志</Select.Option>
                        </Select>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Input
                          placeholder="搜索日志描述细节"
                          value={searchAction}
                          onChange={e => setSearchAction(e.target.value)}
                          prefix={<SearchOutlined />}
                        />
                      </Col>
                      <Col xs={24} sm={4}>
                        <Button
                          icon={<ReloadOutlined />}
                          onClick={() => {
                            setSearchOperator('')
                            setFilterType('all')
                            setSearchAction('')
                          }}
                          style={{ width: '100%' }}
                        >
                          重置筛选
                        </Button>
                      </Col>
                    </Row>
                  </div>

                  <Table
                    columns={logColumns}
                    dataSource={filteredLogs}
                    rowKey="id"
                    pagination={{ pageSize: 8 }}
                    scroll={{ x: 'max-content' }}
                  />
                </div>
              )
            },
            {
              key: 'export-reports',
              label: (
                <span>
                  <DownloadOutlined /> 数据多维报表导出
                </span>
              ),
              children: (
                <div style={{ marginTop: 16 }}>
                  <div style={{ color: 'var(--cyber-text-muted)', fontSize: 13, marginBottom: 24 }}>
                    系统支持以标准 CSV 或格式化 JSON 文件一键模拟导出系统内各维度的管理与监控数据。
                  </div>

                  <Row gutter={[20, 20]}>
                    <Col xs={24} md={8}>
                      <Card title="⚠️ 心理风险预警名单报表" className="cyber-card" style={{ marginBottom: 0 }}>
                        <p style={{ color: 'var(--cyber-text-muted)', fontSize: 12, marginBottom: 16 }}>
                          提取全校测评得分低于 80 分、需要重点关注/中度关注的学生数据名单，用于线下约谈。
                        </p>
                        <Space>
                          <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            className="cyber-btn"
                            onClick={() => triggerExport('warning_list', 'csv')}
                          >
                            导出 CSV
                          </Button>
                          <Button
                            icon={<DownloadOutlined />}
                            onClick={() => triggerExport('warning_list', 'json')}
                          >
                            导出 JSON
                          </Button>
                        </Space>
                      </Card>
                    </Col>

                    <Col xs={24} md={8}>
                      <Card title="📊 学生心理测评得分成绩总表" className="cyber-card" style={{ marginBottom: 0 }}>
                        <p style={{ color: 'var(--cyber-text-muted)', fontSize: 12, marginBottom: 16 }}>
                          导出全校在籍所有学生最新完成的 20 题自主评测成绩表，包含得分及风险分类。
                        </p>
                        <Space>
                          <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            className="cyber-btn"
                            onClick={() => triggerExport('assessment_scores', 'csv')}
                          >
                            导出 CSV
                          </Button>
                          <Button
                            icon={<DownloadOutlined />}
                            onClick={() => triggerExport('assessment_scores', 'json')}
                          >
                            导出 JSON
                          </Button>
                        </Space>
                      </Card>
                    </Col>

                    <Col xs={24} md={8}>
                      <Card title="⚙️ 系统安全与操作审计日志" className="cyber-card" style={{ marginBottom: 0 }}>
                        <p style={{ color: 'var(--cyber-text-muted)', fontSize: 12, marginBottom: 16 }}>
                          导出最近在系统内发生的所有操作记录与登录信息（即当前数据库内存储的历史审计行）。
                        </p>
                        <Space>
                          <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            className="cyber-btn"
                            onClick={() => triggerExport('audit_logs', 'csv')}
                          >
                            导出 CSV
                          </Button>
                          <Button
                            icon={<DownloadOutlined />}
                            onClick={() => triggerExport('audit_logs', 'json')}
                          >
                            导出 JSON
                          </Button>
                        </Space>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )
            }
          ]}
        />
      </div>

      {/* Import Modal */}
      <Modal
        title="批量模拟导入 Excel/CSV 数据档案"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setImportModalVisible(false)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            className="cyber-btn"
            loading={isImporting}
            onClick={handleMockImport}
          >
            开始模拟导入
          </Button>
        ]}
      >
        <div style={{ padding: '10px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ color: '#fff', fontSize: 13, display: 'block', marginBottom: 8 }}>
              设置导入模拟生成的数据条数：
            </span>
            <InputNumber
              min={1}
              max={50}
              value={importCount}
              onChange={setImportCount}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ color: 'var(--cyber-text-muted)', fontSize: 12 }}>
            💡 <b>系统说明</b>：开始导入后，系统将自动使用中国大陆常见姓名库和心理特征模型，在后台自动生成指定数量的虚拟学生，随机填充其 5 次心理评测趋势、心理画像五个因子分值以及负责教师，自动绑定匹配的登录账号（默认密码为 <code>123</code>），并批量同步保存至本地 localStorage，同时记录系统操作审计日志。
          </div>
        </div>
      </Modal>
    </div>
  )
}
