import React, { useState, useContext } from 'react'
import { Card, Button, Input, Progress, Row, Col, Space, Tag, List, Badge, message, Empty, Alert } from 'antd'
import { TrophyOutlined, PlusOutlined, MessageOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { UserContext } from '../App.jsx'

export default function StudentGoals() {
  const { userInfo, assignedTasks, setAssignedTasks, addLog } = useContext(UserContext)
  
  // === Goals List States ===
  const [customGoal, setCustomGoal] = useState('')
  const [feedbackInputs, setFeedbackInputs] = useState({}) // { taskId: string }

  // Filter tasks for this student only
  const studentTasks = assignedTasks.filter(t => t.studentName === userInfo.nickname)

  // Create Custom Goal
  const handleAddCustomGoal = () => {
    if (!customGoal.trim()) {
      message.warning('请输入目标内容')
      return
    }

    const pad = (n) => String(n).padStart(2, '0')
    const now = new Date()
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`

    const newGoal = {
      id: 'task-' + Date.now(),
      taskName: customGoal.trim(),
      date: todayStr,
      studentName: userInfo.nickname,
      status: '进行中',
      feedback: '',
      className: userInfo.className || '未配置班级'
    }

    setAssignedTasks([...assignedTasks, newGoal])
    setCustomGoal('')
    
    addLog(
      'operation',
      `${userInfo.nickname} (student)`,
      `创建了自主成长目标：${newGoal.taskName}`
    )
    message.success('已成功设定成长小目标！开始努力完成它吧')
  }

  // Complete task with reflection feedback
  const handleCompleteTask = (taskId) => {
    const feedback = feedbackInputs[taskId] || ''
    if (!feedback.trim()) {
      message.warning('请简短写写您的自我反馈与感悟吧，这也是心灵成长的重要一步哦！')
      return
    }

    const updated = assignedTasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: '已完成',
          feedback: feedback.trim()
        }
      }
      return t
    })

    setAssignedTasks(updated)
    
    // Clear feedback input
    setFeedbackInputs(prev => {
      const copy = { ...prev }
      delete copy[taskId]
      return copy
    })

    const completedTask = assignedTasks.find(t => t.id === taskId)
    addLog(
      'operation',
      `${userInfo.nickname} (student)`,
      `完成了目标：${completedTask?.taskName}，并提交了反馈。`
    )
    message.success('打卡成功！已记录您的自我调节感悟')
  }

  // Handle input changes
  const handleFeedbackChange = (taskId, text) => {
    setFeedbackInputs(prev => ({
      ...prev,
      [taskId]: text
    }))
  }

  // Statistics
  const totalCount = studentTasks.length
  const completedCount = studentTasks.filter(t => t.status === '已完成').length
  const pendingCount = totalCount - completedCount
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header-container">
        <div>
          <div className="page-title">目标管理与自我反馈</div>
          <div className="page-subtitle">查看辅导老师布置的成长任务，自主设定小目标，记录每日打卡感悟</div>
        </div>
      </div>

      <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
        {/* Statistics Card */}
        <Col xs={24} md={8}>
          <Card className="cyber-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyStyle: 'center' }}>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <TrophyOutlined style={{ fontSize: 40, color: 'var(--cyber-secondary)', marginBottom: 12 }} />
              <div style={{ color: 'var(--cyber-text-muted)', fontSize: 13, marginBottom: 8 }}>成长目标达成率</div>
              
              <Progress
                type="circle"
                percent={completionRate}
                strokeColor={{ '0%': '#8b5cf6', '100%': '#05f3ad' }}
                trailColor="rgba(255,255,255,0.05)"
                width={120}
                style={{ display: 'block', margin: '12px auto' }}
              />

              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-around', color: '#fff', fontSize: 13 }}>
                <div>
                  <Badge status="processing" color="var(--cyber-primary)" />
                  <span>总目标: {totalCount} 个</span>
                </div>
                <div>
                  <Badge status="success" color="#05f3ad" />
                  <span>已完成: {completedCount} 个</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Add custom goals */}
        <Col xs={24} md={16}>
          <Card className="cyber-card" style={{ height: '100%' }} title={<span><PlusOutlined /> 自主设立今日/明日目标</span>}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: 'var(--cyber-text-muted)', marginBottom: 12 }}>
                根据您目前的心情和近期压力，为自己设立一个微小但切合实际的目标（例如：散步15分钟、向同学请教一道几何题、听一首解压轻音乐）。
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Input
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="设定一个新的成长小目标... (如：在心灵音乐屋中收听10分钟解压曲)"
                  onPressEnter={handleAddCustomGoal}
                  size="large"
                  style={{ flex: 1 }}
                />
                <Button
                  type="primary"
                  className="cyber-btn"
                  icon={<PlusOutlined />}
                  onClick={handleAddCustomGoal}
                  size="large"
                >
                  设定小目标
                </Button>
              </div>
            </div>

            <Alert
              message="目标自定引导建议"
              description="心理学表明，设定细微、可操作且能够即时兑现的目标（Micro-Goals），能有效激发大脑多巴胺释放，阻断持续性焦虑带来的无力感。"
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
              style={{ background: 'rgba(0, 242, 254, 0.03)', border: '1px solid rgba(0, 242, 254, 0.15)' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        {/* Pending Goals List */}
        <Col xs={24} md={12}>
          <Card className="cyber-card" style={{ minHeight: 380 }} title={<span style={{ color: 'var(--cyber-primary)' }}><Badge count={pendingCount} style={{ backgroundColor: 'var(--cyber-primary)', marginRight: 8 }} /> 进行中的成长目标</span>}>
            {studentTasks.filter(t => t.status === '进行中').length === 0 ? (
              <Empty description="当前没有进行中的目标，给自己设定一个吧！" style={{ margin: '40px 0' }} />
            ) : (
              <List
                dataSource={studentTasks.filter(t => t.status === '进行中')}
                renderItem={(item) => (
                  <List.Item style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 4px', display: 'block' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>{item.taskName}</div>
                      <Tag color="blue">{item.date}</Tag>
                    </div>
                    
                    {/* Feedback typing & completion check */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <Input
                        value={feedbackInputs[item.id] || ''}
                        onChange={(e) => handleFeedbackChange(item.id, e.target.value)}
                        placeholder="写写达成感悟 (如：今天按时完成了，感觉很放松！)"
                        size="small"
                        style={{ flex: 1 }}
                      />
                      <Button
                        size="small"
                        type="primary"
                        className="cyber-btn cyber-btn-purple"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleCompleteTask(item.id)}
                      >
                        打卡完成
                      </Button>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* Completed Goals List */}
        <Col xs={24} md={12}>
          <Card className="cyber-card" style={{ minHeight: 380 }} title={<span style={{ color: '#05f3ad' }}><Badge count={completedCount} style={{ backgroundColor: '#05f3ad', marginRight: 8 }} /> 已达成的历史目标</span>}>
            {studentTasks.filter(t => t.status === '已完成').length === 0 ? (
              <Empty description="暂无已完成的打卡目标" style={{ margin: '40px 0' }} />
            ) : (
              <List
                dataSource={studentTasks.filter(t => t.status === '已完成')}
                renderItem={(item) => (
                  <List.Item style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '14px 4px', display: 'block' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ color: 'var(--cyber-text-muted)', fontSize: 13, textDecoration: 'line-through' }}>{item.taskName}</div>
                      <Tag color="success">已达成</Tag>
                    </div>
                    {item.feedback && (
                      <div style={{
                        marginTop: 4,
                        padding: '6px 10px',
                        background: 'rgba(5, 243, 173, 0.04)',
                        border: '1px dashed rgba(5, 243, 173, 0.2)',
                        borderRadius: 4,
                        fontSize: 11,
                        color: '#05f3ad',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}>
                        <MessageOutlined />
                        <span>自我感悟：{item.feedback}</span>
                      </div>
                    )}
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
