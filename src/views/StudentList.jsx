import React, { useState, useEffect, useRef, useContext } from 'react'
import { Form, Input, Select, Button, Table, Card, Tag, Space, Drawer, Descriptions, Divider, Timeline, Radio, Row, Col, message } from 'antd'
import { SearchOutlined, ReloadOutlined, ProfileOutlined, RobotOutlined, PlusOutlined } from '@ant-design/icons'
import * as echarts from 'echarts'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../App.jsx'

const { Option } = Select

export default function StudentList() {
  const navigate = useNavigate()
  const { userInfo, addLog } = useContext(UserContext)
  const [form] = Form.useForm()
  const [interventionForm] = Form.useForm()
  
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  
  const lineChartRef = useRef(null)
  const radarChartRef = useRef(null)

  // 1. Dynamic Students Data from localStorage
  const [allStudents, setAllStudents] = useState(() => {
    try {
      const saved = localStorage.getItem('studentsList')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Self-healing database cleanup
        const cleaned = parsed.filter(s => s.name !== '张三' && s.name !== '李四' && s.name !== '王五' && s.name !== '赵六' && s.name !== '孙七')
        if (cleaned.length !== parsed.length) {
          localStorage.setItem('studentsList', JSON.stringify(cleaned))
        }
        return cleaned
      }
    } catch {}
    // Fallback seed
    const seed = [
      { id: 1, name: '默认学生', gender: '男', className: '高一1班', school: '朝阳区第一实验小学', idCard: '110101201001011234', score: 82, risk: '正常', counselor: '陈老师', moodTrend: [75, 78, 80, 85, 82], dimensions: [80, 85, 70, 78, 82], interventions: [] }
    ]
    localStorage.setItem('studentsList', JSON.stringify(seed))
    return seed
  })

  const [students, setStudents] = useState(allStudents)

  // Sync state whenever allStudents updates
  useEffect(() => {
    localStorage.setItem('studentsList', JSON.stringify(allStudents))
  }, [allStudents])

  // Sync local view students if allStudents is modified in background
  useEffect(() => {
    const currentFields = form.getFieldsValue()
    handleSearch(currentFields)
  }, [allStudents])

  const handleSearch = (values) => {
    let filtered = [...allStudents]
    if (values.name) {
      filtered = filtered.filter(s => s.name.toLowerCase().includes(values.name.toLowerCase()))
    }
    if (values.className) {
      filtered = filtered.filter(s => s.className === values.className)
    }
    if (values.risk) {
      filtered = filtered.filter(s => s.risk === values.risk)
    }
    setStudents(filtered)
  }

  const handleReset = () => {
    form.resetFields()
    setStudents(allStudents)
  }

  const showDrawer = (student) => {
    let fullProfile = {}
    try {
      const allUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      const matched = allUsers.find(u => u.role === 'student' && u.nickname === student.name)
      if (matched) {
        fullProfile = matched
      }
    } catch (e) {
      console.error(e)
    }

    setSelectedStudent({
      ...student,
      username: fullProfile.username || '暂无账号',
      bio: fullProfile.bio || '好好学习，天天向上！',
      wechat: fullProfile.wechat || '未绑定',
      qq: fullProfile.qq || '未绑定',
      email: fullProfile.email || '未配置',
      schoolStage: fullProfile.schoolStage || '未指定'
    })
    setDrawerVisible(true)
  }

  const closeDrawer = () => {
    setDrawerVisible(false)
    setSelectedStudent(null)
  }

  // Add care intervention records
  const handleAddIntervention = (values) => {
    if (!values.content || !values.content.trim()) {
      message.warning('请输入干预日志详细内容')
      return
    }

    const pad = (n) => String(n).padStart(2, '0')
    const now = new Date()
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`

    const newIntervention = {
      id: 'int-' + Date.now(),
      date: timeStr,
      counselor: userInfo.nickname || '陈老师',
      content: values.content.trim(),
      status: values.status || '已回访'
    }

    const updatedStudent = {
      ...selectedStudent,
      interventions: [newIntervention, ...(selectedStudent.interventions || [])]
    }

    const updatedAll = allStudents.map(s => s.id === selectedStudent.id ? updatedStudent : s)
    setAllStudents(updatedAll)
    setSelectedStudent(updatedStudent)

    addLog(
      'operation',
      `${userInfo.nickname} (${userInfo.role})`,
      `录入了学生 [${selectedStudent.name}] 的心理干预回访记录: [${newIntervention.status}] ${values.content.trim()}`
    )

    interventionForm.resetFields()
    message.success('干预关怀日志录入成功！')
  }

  // Render Charts when drawer opens
  useEffect(() => {
    if (drawerVisible && selectedStudent) {
      const timer = setTimeout(() => {
        if (!lineChartRef.current) return
        const lineChart = echarts.init(lineChartRef.current)
        lineChart.setOption({
          backgroundColor: 'transparent',
          tooltip: { trigger: 'axis' },
          grid: { top: '15%', left: '8%', right: '8%', bottom: '15%' },
          xAxis: {
            type: 'category',
            data: ['第1次', '第2次', '第3次', '第4次', '第5次'],
            axisLine: { lineStyle: { color: 'rgba(0, 242, 254, 0.2)' } },
            axisLabel: { color: '#8499b4' }
          },
          yAxis: {
            type: 'value',
            min: 0,
            max: 100,
            splitLine: { lineStyle: { color: 'rgba(0, 242, 254, 0.05)' } },
            axisLine: { lineStyle: { color: 'rgba(0, 242, 254, 0.2)' } },
            axisLabel: { color: '#8499b4' }
          },
          series: [{
            data: selectedStudent.moodTrend || [70, 70, 70, 70, 70],
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { color: '#00f2fe', width: 2 },
            itemStyle: { color: '#00f2fe' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0, 242, 254, 0.2)' },
                { offset: 1, color: 'transparent' }
              ])
            }
          }]
        })

        if (!radarChartRef.current) return
        const radarChart = echarts.init(radarChartRef.current)
        radarChart.setOption({
          backgroundColor: 'transparent',
          tooltip: {},
          radar: {
            indicator: [
              { name: '自我认可度', max: 100 },
              { name: '情绪调控力', max: 100 },
              { name: '人际沟通度', max: 100 },
              { name: '抗压弹韧性', max: 100 },
              { name: '学习动机度', max: 100 }
            ],
            axisName: { color: '#8499b4' },
            splitArea: { show: false },
            splitLine: { lineStyle: { color: 'rgba(0, 242, 254, 0.15)' } },
            axisLine: { lineStyle: { color: 'rgba(0, 242, 254, 0.15)' } }
          },
          series: [{
            name: '维度指标',
            type: 'radar',
            data: [{
              value: selectedStudent.dimensions || [80, 80, 80, 80, 80],
              name: '个体心理指标',
              itemStyle: { color: '#a78bfa' },
              areaStyle: { color: 'rgba(167, 139, 250, 0.3)' }
            }]
          }]
        })

        const handleResize = () => {
          lineChart.resize()
          radarChart.resize()
        }
        window.addEventListener('resize', handleResize)

        return () => {
          window.removeEventListener('resize', handleResize)
          lineChart.dispose()
          radarChart.dispose()
        }
      }, 200)

      return () => clearTimeout(timer)
    }
  }, [drawerVisible, selectedStudent])

  const getRiskTag = (risk) => {
    if (risk === '正常') return <Tag color="success">正常</Tag>
    if (risk === '轻度关注') return <Tag color="warning">轻度关注</Tag>
    if (risk === '中度关注') return <Tag color="orange">中度关注</Tag>
    return <Tag color="error">重点关注</Tag>
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '性别', dataIndex: 'gender', key: 'gender' },
    { title: '班级', dataIndex: 'className', key: 'className' },
    { title: '所属学校', dataIndex: 'school', key: 'school', render: (s) => s || '朝阳区第一实验小学' },
    { title: '指导咨询师', dataIndex: 'counselor', key: 'counselor' },
    {
      title: '最近测评分',
      dataIndex: 'score',
      key: 'score',
      render: (score) => (
        <span style={{ 
          fontFamily: 'var(--font-family-tech)', 
          fontWeight: 'bold',
          color: score >= 80 ? '#05f3ad' : score >= 60 ? '#ffb800' : '#ff4d4f'
        }}>
          {score}
        </span>
      )
    },
    {
      title: '风险等级',
      dataIndex: 'risk',
      key: 'risk',
      render: (risk) => getRiskTag(risk)
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_, record) => (
        <Space size="middle">
          <Button
            size="small"
            type="primary"
            className="cyber-btn"
            icon={<ProfileOutlined />}
            onClick={() => showDrawer(record)}
          >
            详情档案
          </Button>
          <Button
            size="small"
            type="primary"
            className="cyber-btn cyber-btn-purple"
            icon={<RobotOutlined />}
            onClick={() => navigate('/ai-advice', { state: { record } })}
          >
            AI建议
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header-container">
        <div>
          <div className="page-title">学生心理健康管理</div>
          <div className="page-subtitle">查询、建档及分析学生个人情绪成长轨迹</div>
        </div>
      </div>

      {/* Query Form */}
      <div className="cyber-card">
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          style={{ gap: '16px 8px', display: 'flex', flexWrap: 'wrap' }}
        >
          <Form.Item name="name" label="姓名" style={{ margin: '4px 0', minWidth: 150, flex: '1 1 auto' }}>
            <Input placeholder="请输入学生姓名" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="className" label="班级" style={{ margin: '4px 0', minWidth: 150, flex: '1 1 auto' }}>
            <Select placeholder="请选择班级" style={{ width: '100%' }} allowClear>
              <Option value="高一1班">高一1班</Option>
              <Option value="高一2班">高一2班</Option>
              <Option value="高二1班">高二1班</Option>
              <Option value="高三4班">高三4班</Option>
            </Select>
          </Form.Item>

          <Form.Item name="risk" label="风险等级" style={{ margin: '4px 0', minWidth: 150, flex: '1 1 auto' }}>
            <Select placeholder="选择级别" style={{ width: '100%' }} allowClear>
              <Option value="正常">正常</Option>
              <Option value="轻度关注">轻度关注</Option>
              <Option value="中度关注">中度关注</Option>
              <Option value="重点关注">重点关注</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ margin: '4px 0' }}>
            <Space>
              <Button type="primary" htmlType="submit" className="cyber-btn" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button onClick={handleReset} icon={<ReloadOutlined />}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>

      {/* Students Table */}
      <div className="cyber-card" style={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={students}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: 'max-content' }}
        />
      </div>

      {/* Student Profile Drawer */}
      <Drawer
        title="学生心理情绪成长画像"
        placement="right"
        width={600}
        onClose={closeDrawer}
        open={drawerVisible}
        extra={
          <Space>
            <Button
              type="primary"
              className="cyber-btn"
              icon={<RobotOutlined />}
              onClick={() => {
                closeDrawer()
                navigate('/ai-advice', { state: { record: selectedStudent } })
              }}
            >
              生成AI干预建议
            </Button>
          </Space>
        }
      >
        {selectedStudent && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyStyle: 'space-between', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ color: '#fff', fontSize: 18, margin: 0 }}>
                {selectedStudent.name} <span style={{ fontSize: 13, color: 'var(--cyber-text-muted)', fontWeight: 'normal' }}>({selectedStudent.gender})</span>
              </h3>
              {getRiskTag(selectedStudent.risk)}
            </div>

            <Descriptions bordered size="small" column={2} className="cyber-card" style={{ padding: 12, marginBottom: 24 }}>
              <Descriptions.Item label="登录账号">{selectedStudent.username}</Descriptions.Item>
              <Descriptions.Item label="性别">{selectedStudent.gender}</Descriptions.Item>
              <Descriptions.Item label="所属学校" span={2}>{selectedStudent.school || '朝阳区第一实验小学'}</Descriptions.Item>
              <Descriptions.Item label="学校学段">{selectedStudent.schoolStage || '未指定'}</Descriptions.Item>
              <Descriptions.Item label="所属班级">{selectedStudent.className}</Descriptions.Item>
              <Descriptions.Item label="身份证号" span={2}>{selectedStudent.idCard || '110101201001011234'}</Descriptions.Item>
              <Descriptions.Item label="辅导老师">{selectedStudent.counselor}</Descriptions.Item>
              <Descriptions.Item label="测评分数">
                <span style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--cyber-primary)' }}>{selectedStudent.score} 分</span>
              </Descriptions.Item>
              <Descriptions.Item label="微信绑定">{selectedStudent.wechat}</Descriptions.Item>
              <Descriptions.Item label="QQ 绑定">{selectedStudent.qq}</Descriptions.Item>
              <Descriptions.Item label="联系邮箱" span={2}>{selectedStudent.email}</Descriptions.Item>
              <Descriptions.Item label="个人简介/签名" span={2}>{selectedStudent.bio}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" style={{ borderColor: 'rgba(0, 242, 254, 0.15)', color: '#fff' }}>情绪评测成长趋势</Divider>
            <div style={{ position: 'relative', marginBottom: 24 }}>
              <div ref={lineChartRef} style={{ height: 200, width: '100%' }}></div>
            </div>

            <Divider orientation="left" style={{ borderColor: 'rgba(0, 242, 254, 0.15)', color: '#fff' }}>本期多维心理维度特征</Divider>
            <div style={{ position: 'relative', marginBottom: 24 }}>
              <div ref={radarChartRef} style={{ height: 240, width: '100%' }}></div>
            </div>

            <Divider orientation="left" style={{ borderColor: 'rgba(0, 242, 254, 0.15)', color: '#fff' }}>AI 画像评估标签</Divider>
            <Space size={[8, 16]} wrap style={{ marginBottom: 28 }}>
              {selectedStudent.score < 60 ? (
                <>
                  <Tag color="red">高敏特质</Tag>
                  <Tag color="volcano">抗挫能力薄弱</Tag>
                  <Tag color="orange">学习阻抗上升</Tag>
                  <Tag color="cyan">社交孤立感</Tag>
                </>
              ) : selectedStudent.score < 80 ? (
                <>
                  <Tag color="blue">情绪自我调适中</Tag>
                  <Tag color="purple">课业压力适中</Tag>
                  <Tag color="cyan">同伴接纳良好</Tag>
                </>
              ) : (
                <>
                  <Tag color="green">心理弹性极强</Tag>
                  <Tag color="cyan">高自尊水平</Tag>
                  <Tag color="blue">沟通渠道通畅</Tag>
                  <Tag color="geekblue">情绪稳定性高</Tag>
                </>
              )}
            </Space>

            {/* UPGRADE: Care intervention input & historical timeline */}
            <Divider orientation="left" style={{ borderColor: 'rgba(0, 242, 254, 0.15)', color: '#fff' }}>✍️ 录入辅导干预与关怀日志</Divider>
            
            <div className="cyber-card" style={{ padding: '16px', marginBottom: 24 }}>
              <Form
                form={interventionForm}
                layout="vertical"
                onFinish={handleAddIntervention}
                initialValues={{ status: '已回访' }}
              >
                <Form.Item name="content" label="关怀沟通及干预细节" rules={[{ required: true, message: '请填写干预描述' }]}>
                  <Input.TextArea rows={3} placeholder="如：约谈该学生到心理咨询室进行了课后深度沟通，提供了学习焦虑舒缓方法，学生表示理解且情绪明显放松。" />
                </Form.Item>
                
                <Row gutter={12} align="middle">
                  <Col span={14}>
                    <Form.Item name="status" label="当前干预状态" style={{ marginBottom: 0 }}>
                      <Radio.Group size="small">
                        <Radio.Button value="已回访" style={{ color: '#fff' }}>已回访</Radio.Button>
                        <Radio.Button value="跟进中" style={{ color: '#fff' }}>跟进中</Radio.Button>
                        <Radio.Button value="待观察" style={{ color: '#fff' }}>待观察</Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col span={10} style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 24 }}>
                    <Button type="primary" htmlType="submit" className="cyber-btn" icon={<PlusOutlined />} size="small">
                      提交干预日志
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>

            <Divider orientation="left" style={{ borderColor: 'rgba(0, 242, 254, 0.15)', color: '#fff' }}>📜 历史干预关怀时间轴</Divider>
            
            {!selectedStudent.interventions || selectedStudent.interventions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '12px', color: 'var(--cyber-text-muted)', fontSize: 12 }}>
                暂无历史关怀干预记录。
              </div>
            ) : (
              <Timeline mode="left" style={{ marginTop: 12, paddingLeft: 8 }}>
                {selectedStudent.interventions.map((item) => (
                  <Timeline.Item
                    key={item.id}
                    label={<span style={{ color: 'var(--cyber-text-muted)', fontSize: 11 }}>{item.date}</span>}
                    color={item.status === '已回访' ? 'green' : item.status === '跟进中' ? 'blue' : 'gray'}
                  >
                    <div style={{
                      background: 'rgba(6, 11, 25, 0.3)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 6,
                      padding: '8px 12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 'bold', color: '#fff', fontSize: 12 }}>
                          记录人: {item.counselor}
                        </span>
                        <Tag color={item.status === '已回访' ? 'green' : item.status === '跟进中' ? 'blue' : 'gray'} style={{ fontSize: 9, height: 16, lineHeight: '14px' }}>
                          {item.status}
                        </Tag>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--cyber-text)' }}>
                        {item.content}
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
