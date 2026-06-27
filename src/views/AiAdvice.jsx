import React, { useState, useEffect, useContext } from 'react'
import { Form, Input, InputNumber, Select, Button, Card, Spin, Alert, Tag, Space, Divider, Row, Col, Radio, message } from 'antd'
import { RobotOutlined, DownloadOutlined, SyncOutlined, CheckCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { useLocation } from 'react-router-dom'
import { UserContext } from '../App.jsx'

const { Option } = Select
const { TextArea } = Input

export default function AiAdvice() {
  const location = useLocation()
  const { assignedTasks, setAssignedTasks, addLog, userInfo } = useContext(UserContext)
  const [form] = Form.useForm()
  const [taskForm] = Form.useForm()

  const [loading, setLoading] = useState(false)
  const [adviceText, setAdviceText] = useState('')
  const [displayedAdvice, setDisplayedAdvice] = useState('')
  const [adviceGenerated, setAdviceGenerated] = useState(false)

  // Task assignment fields
  const [targetType, setTargetType] = useState('class') // 'class' | 'student'
  const [selectedTask, setSelectedTask] = useState('主动运动')
  const [studentsList, setStudentsList] = useState([])

  // Load students list for dropdown
  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem('studentsList') || '[]')
      setStudentsList(list)
    } catch {}
  }, [])

  // Check state redirect prefill
  useEffect(() => {
    if (location.state && location.state.record) {
      const record = location.state.record
      form.setFieldsValue({
        studentName: record.name || record.studentName,
        score: record.score,
        risk: record.risk,
        description: record.msg || '学生近期测评表现出一定的压力感，需结合多维指标给予指导建议。'
      })
    } else {
      // Default prefill
      form.setFieldsValue({
        studentName: '李四',
        score: 61,
        risk: '轻度关注',
        description: '近两周由于大考临近，出现一定程度的睡眠障碍与焦虑。课堂表现较以往沉默，课间少有与同学互动。'
      })
    }
  }, [location.state, form])

  // Typewriter effect
  useEffect(() => {
    if (adviceText) {
      setDisplayedAdvice('')
      let index = 0
      const timer = setInterval(() => {
        setDisplayedAdvice((prev) => prev + adviceText.charAt(index))
        index++
        if (index >= adviceText.length) {
          clearInterval(timer)
        }
      }, 12)
      return () => clearInterval(timer)
    }
  }, [adviceText])

  const handleGenerateAdvice = (values) => {
    setLoading(true)
    setAdviceGenerated(false)
    setAdviceText('')
    setDisplayedAdvice('')

    setTimeout(() => {
      const mockResult = `【AI 情绪成长管理中心 - 智能诊断干预方案报告】

诊断对象：${values.studentName}    综合评测得分：${values.score} 分    当前预警级别：${values.risk}

根据智能情感语义模型与心理健康风险数据库分析，该生主要异常因子集中在“抗压弹性”与“同伴社交敏感度”。建议辅导员/咨询师采取如下阶段性干预方案：

一、 认知重构与心理解压 (24小时内介入)
   1. 安排1对1非正式沟通，不以成绩为导向，建立情感共鸣，倾听其内心对考试或课业的具体焦虑点。
   2. 普及“应激反应”常识，帮助其认识到考前焦虑为生理与情绪的正常自我防御，降低自责心理。

二、 生理舒缓与正念训练 (每日执行)
   1. 引导该生练习“深呼吸解压法”或引入5分钟正念微课。
   2. 配合班主任，指导其合理控制夜间电子设备使用，改善睡眠前脑电兴奋状态。

三、 同伴关怀与良性融入 (本周执行)
   1. 暗中委派心理委员或关系较好的同伴提供社交支撑，日常进行自习邀约，减少其社会退缩行为。
   2. 教师课堂提问中给予正面且低压力的关注，逐渐恢复其课室自我效能感。

四、 持续观察与跟踪复测 (双周跟进)
   1. 建立情感成长日志，建议其使用“情绪打卡”小助手记录心路历程。
   2. 计划在两周后安排复测心理问卷。若分数仍低于60分且睡眠持续紊乱，应及时推介至校外心理门诊进行进一步评估。

生成批次号：SYS-AI-${Date.now().toString().slice(-6)}   本方案已存档进入学校心理健康防护数据库。`

      setAdviceText(mockResult)
      setAdviceGenerated(true)
      setLoading(false)

      addLog(
        'operation',
        `${userInfo.nickname} (${userInfo.role})`,
        `为学生 ${values.studentName} 生成了 AI 智能心理干预建议方案`
      )
    }, 1500)
  }

  const handleDownload = () => {
    const blob = new Blob([adviceText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `AI情绪干预建议-${form.getFieldValue('studentName')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Handle task assignment submission
  const handleAssignTask = (values) => {
    const taskName = values.taskName === '自定义任务' ? values.customTaskName : values.taskName
    if (!taskName || !taskName.trim()) {
      message.warning('请输入成长任务名称！')
      return
    }

    const pad = (n) => String(n).padStart(2, '0')
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`

    let targetClassName = ''
    let targetStudentName = ''

    if (targetType === 'class') {
      targetClassName = values.className
      targetStudentName = '全体学生'
    } else {
      // Find class name of the selected student
      const matchedStudent = studentsList.find(s => s.name === values.studentName)
      targetStudentName = values.studentName
      targetClassName = matchedStudent ? matchedStudent.className : '高一1班'
    }

    const newTask = {
      id: 'task-' + Date.now(),
      taskName: taskName.trim(),
      date: dateStr,
      studentName: targetStudentName,
      status: '进行中',
      feedback: '',
      className: targetClassName
    }

    setAssignedTasks([newTask, ...assignedTasks])
    
    addLog(
      'operation',
      `${userInfo.nickname} (${userInfo.role})`,
      `向 ${targetType === 'class' ? `班级 [${targetClassName}]` : `学生 [${targetStudentName}]`} 布置了心理成长任务【${taskName.trim()}】`
    )

    message.success(`成长任务【${taskName.trim()}】已成功发布！`)
    taskForm.resetFields(['customTaskName'])
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header-container">
        <div>
          <div className="page-title">AI 智能心理成长建议</div>
          <div className="page-subtitle">融合多维心理表征，智能一键输出精准关怀与疏导干预方案</div>
        </div>
      </div>

      <Row gutter={[20, 20]}>
        {/* Form Panel */}
        <Col xs={24} lg={10}>
          <div className="cyber-card" style={{ marginBottom: 0 }}>
            <div className="cyber-card-header">
              <span>输入诊断评估对象参数</span>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleGenerateAdvice}
            >
              <Form.Item
                name="studentName"
                label="学生姓名"
                rules={[{ required: true, message: '请输入学生姓名' }]}
              >
                <Input placeholder="输入受测学生" />
              </Form.Item>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    name="score"
                    label="测评得分"
                    rules={[{ required: true, message: '请输入综合分' }]}
                  >
                    <InputNumber min={0} max={100} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="risk"
                    label="风险级别"
                    rules={[{ required: true, message: '请配置评估风险' }]}
                  >
                    <Select>
                      <Option value="正常">正常</Option>
                      <Option value="轻度关注">轻度关注</Option>
                      <Option value="中度关注">中度关注</Option>
                      <Option value="重点关注">重点关注</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="异常行为与情绪事实描述"
                rules={[{ required: true, message: '请输入评测依据表现' }]}
              >
                <TextArea
                  rows={5}
                  placeholder="请输入该生近期的异常状态，例如失眠、成绩骤降、人际摩擦、语言消极等表现..."
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  icon={<RobotOutlined />}
                  className="cyber-btn"
                  style={{ height: 40 }}
                >
                  生成 AI 成长建议方案
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Col>

        {/* Output Panel */}
        <Col xs={24} lg={14}>
          <div className="cyber-card" style={{ height: '100%', minHeight: 480, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div className="cyber-card-header">
              <span>AI 诊断结果与方案输出</span>
              {adviceGenerated && (
                <Space>
                  <Tag color="success" icon={<CheckCircleOutlined />}>已归档</Tag>
                  <Button
                    size="small"
                    className="cyber-btn"
                    icon={<DownloadOutlined />}
                    onClick={handleDownload}
                  >
                    导出方案
                  </Button>
                </Space>
              )}
            </div>

            {/* Neural scanning loading state */}
            {loading && (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16
              }}>
                <Spin indicator={<SyncOutlined spin style={{ fontSize: 40, color: 'var(--cyber-primary)' }} />} />
                <div style={{ color: 'var(--cyber-primary)', textShadow: '0 0 8px rgba(0, 242, 254, 0.4)', fontSize: 13, letterSpacing: 1.5 }}>
                  深度认知层级模型扫描评估中...
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !adviceGenerated && (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cyber-text-muted)',
                textAlign: 'center'
              }}>
                <RobotOutlined style={{ fontSize: 50, marginBottom: 16, color: 'rgba(0, 242, 254, 0.15)' }} />
                <p>暂无方案数据</p>
                <p style={{ fontSize: 12 }}>请在左侧配置学生测试表征，点击“生成 AI 建议方案”获取干预计划</p>
              </div>
            )}

            {/* Typed advice output */}
            {!loading && adviceGenerated && (
              <div style={{
                flex: 1,
                background: 'rgba(6, 11, 25, 0.6)',
                border: '1px solid rgba(0, 242, 254, 0.1)',
                borderRadius: 6,
                padding: 16,
                overflowY: 'auto',
                fontFamily: 'Consolas, Courier New, monospace',
                fontSize: 13,
                lineHeight: 1.6,
                color: '#fff',
                whiteSpace: 'pre-wrap'
              }}>
                <span className="cyber-typewriter">{displayedAdvice}</span>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* UPGRADE: Assign Growth Task Card */}
      <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <div className="cyber-card" style={{ marginBottom: 0 }}>
            <div className="cyber-card-header">
              <span>布置成长目标与训练任务</span>
              <Tag color="cyan">成长自主管理</Tag>
            </div>

            <Form
              form={taskForm}
              layout="inline"
              onFinish={handleAssignTask}
              initialValues={{
                className: '高一1班',
                taskName: '主动运动'
              }}
              style={{ gap: '16px 12px', alignItems: 'flex-end' }}
            >
              <Form.Item label="发布维度">
                <Radio.Group value={targetType} onChange={(e) => setTargetType(e.target.value)}>
                  <Radio.Button value="class" style={{ color: '#fff' }}>指定班级发布</Radio.Button>
                  <Radio.Button value="student" style={{ color: '#fff' }}>指定学生发布</Radio.Button>
                </Radio.Group>
              </Form.Item>

              {targetType === 'class' ? (
                <Form.Item name="className" label="目标班级" rules={[{ required: true }]}>
                  <Select style={{ width: 150 }}>
                    <Option value="高一1班">高一1班</Option>
                    <Option value="高一2班">高一2班</Option>
                    <Option value="高二1班">高二1班</Option>
                    <Option value="高三4班">高三4班</Option>
                  </Select>
                </Form.Item>
              ) : (
                <Form.Item name="studentName" label="目标学生" rules={[{ required: true, message: '请选择学生' }]}>
                  <Select style={{ width: 150 }} placeholder="选择指派学生" showSearch optionFilterProp="children">
                    {studentsList.map(s => (
                      <Option key={s.id} value={s.name}>{s.name} ({s.className})</Option>
                    ))}
                  </Select>
                </Form.Item>
              )}

              <Form.Item name="taskName" label="任务目标类型" rules={[{ required: true }]}>
                <Select style={{ width: 150 }} onChange={setSelectedTask}>
                  <Option value="认真听讲">认真听讲</Option>
                  <Option value="主动运动">主动运动</Option>
                  <Option value="帮助同学">帮助同学</Option>
                  <Option value="整理书桌">整理书桌</Option>
                  <Option value="整理错题">整理错题</Option>
                  <Option value="复习总结">复习总结</Option>
                  <Option value="学习新知识">学习新知识</Option>
                  <Option value="自定义任务">其他自定义任务</Option>
                </Select>
              </Form.Item>

              {selectedTask === '自定义任务' && (
                <Form.Item name="customTaskName" label="自定义任务内容" rules={[{ required: true, message: '请输入自定义任务名' }]}>
                  <Input placeholder="例如：保持午休30分钟" style={{ width: 180 }} />
                </Form.Item>
              )}

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="cyber-btn"
                  icon={<PlusOutlined />}
                >
                  发布成长任务
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  )
}
