import React, { useState, useEffect, useContext } from 'react'
import { Card, Row, Col, Divider, List, Space, Tag, Input, Button, message, Timeline, Empty, Modal } from 'antd'
import {
  InfoCircleOutlined,
  CopyrightOutlined,
  UserOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  CodeOutlined,
  HistoryOutlined,
  MessageOutlined,
  SendOutlined,
  DeleteOutlined,
  StarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import { UserContext } from '../App.jsx'

const { TextArea } = Input

export default function About() {
  const { userInfo } = useContext(UserContext)

  // === Changelog Data ===
  const changelogData = [
    {
      version: 'V1.1.0',
      date: '2026-07-07',
      color: '#00f2fe',
      changes: [
        '🔒 学生端数据隔离：不同账号登录只能查看本账号的打卡记录、反思日记和操作日志',
        '🎯 新用户操作引导：新注册账号首次登录自动弹出功能引导，快速熟悉系统',
        '🧪 默认测试账户：student 测试账号每次登录自动清空所有数据，方便测试演示',
        '📋 更新日志与用户反馈：新增版本更新记录和用户反馈功能',
        '📊 ECharts 图表修复：修复从"成长日记与今日打卡"切回"个人成长面板"时曲线缩在一起的问题'
      ]
    },
    {
      version: 'V1.0.0',
      date: '2026-06-25',
      color: '#05f3ad',
      changes: [
        '🌟 系统初始发布：学生端心理成长空间、教师端看板、管理员系统管理中心',
        '🧠 AI 情绪陪伴与深度分析引擎上线',
        '🫁 4-7-8 呼吸训练与正念冥想气泡可视化',
        '🎵 真实 Web Audio 声音合成白噪音模块',
        '📝 心理测评题库与危机自动预警系统',
        '🎯 微小目标设定与成长徽章解锁系统',
        '🎙️ 语音输入与情绪色块配图功能',
        '📱 移动端响应式布局支持'
      ]
    }
  ]

  // === User Feedback ===
  const feedbackStorageKey = 'userFeedbacks'
  const [feedbackInput, setFeedbackInput] = useState('')
  const [feedbacks, setFeedbacks] = useState(() => {
    try {
      const saved = localStorage.getItem(feedbackStorageKey)
      if (saved) return JSON.parse(saved)
    } catch {}
    return []
  })

  useEffect(() => {
    localStorage.setItem(feedbackStorageKey, JSON.stringify(feedbacks))
  }, [feedbacks])

  const handleSubmitFeedback = () => {
    if (!feedbackInput.trim()) {
      message.warning('请输入反馈内容')
      return
    }
    if (feedbackInput.trim().length < 5) {
      message.warning('反馈内容至少5个字')
      return
    }

    const pad = (n) => String(n).padStart(2, '0')
    const now = new Date()
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`

    const newFeedback = {
      id: 'fb-' + Date.now(),
      time: timeStr,
      content: feedbackInput.trim(),
      author: userInfo?.nickname || '匿名用户',
      role: userInfo?.role || 'unknown'
    }

    setFeedbacks([newFeedback, ...feedbacks])
    setFeedbackInput('')
    message.success('感谢您的反馈！我们会认真阅读并不断改进系统')
  }

  const handleDeleteFeedback = (id) => {
    Modal.confirm({
      title: '确认删除该条反馈？',
      content: '删除后将无法恢复。',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        setFeedbacks(feedbacks.filter(f => f.id !== id))
        message.success('已删除该条反馈')
      }
    })
  }

  const features = [
    { title: 'AI 情绪陪伴 & 深度分析', desc: '基于大语言模型的自然语言理解能力，提供实时、高共情、定制化的心理支持与安抚服务。' },
    { title: '4-7-8 与腹式呼吸气泡冥想', desc: '以 4-7-8 声学节拍与可视化缩放呼吸圆环为核心，帮助学生快速平复考试前急促的心率。' },
    { title: '真实 Web Audio 声音合成器', desc: '集成纯前端自然环境声波合成模块，提供雨声、潮汐等高逼真解压白噪音。' },
    { title: '心理测评与危机自动预警', desc: '内置 20 题自主评测题库，异常评分数据即时上报至教师端首页关注列表。' }
  ]

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header-container">
        <div>
          <div className="page-title">关于系统</div>
          <div className="page-subtitle">查看 EmotionGrowth AI 心理成长支持系统的版权所有权、创作者架构、技术指标、更新日志与反馈</div>
        </div>
      </div>

      <Row gutter={[20, 20]}>
        {/* Author Card */}
        <Col xs={24} md={12}>
          <Card className="cyber-card" style={{ height: '100%' }} title={<span><CopyrightOutlined style={{ color: 'var(--cyber-primary)' }} /> 系统版权与归属</span>}>
            <div style={{ padding: '10px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--cyber-text-muted)', marginBottom: 4 }}>
                    <BookOutlined /> 学校/单位归属
                  </div>
                  <div style={{ fontSize: 16, color: '#fff', fontWeight: 'bold' }}>
                    上海交通大学附属闵行实验学校
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, color: 'var(--cyber-text-muted)', marginBottom: 4 }}>
                    <UserOutlined /> 主创作者 / 系统总规划
                  </div>
                  <div style={{ fontSize: 16, color: 'var(--cyber-primary)', fontWeight: 'bold' }}>
                    邹钰萧 
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, color: 'var(--cyber-text-muted)', marginBottom: 4 }}>
                    <SafetyCertificateOutlined /> 软件著作权保护
                  </div>
                  <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.5 }}>
                    本项目自主研发，主要供校内学生进行日常心理调节、正念听歌、成长日记记录以及班主任日常心理健康数据统计使用。
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, color: 'var(--cyber-text-muted)', marginBottom: 4 }}>
                    <CodeOutlined /> 系统当前版本
                  </div>
                  <div>
                    <Tag color="cyan">V1.1.0-SECURE-STABLE</Tag>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Feature Overview Card */}
        <Col xs={24} md={12}>
          <Card className="cyber-card" style={{ height: '100%' }} title={<span><InfoCircleOutlined style={{ color: 'var(--cyber-secondary)' }} /> 系统核心设计与原理</span>}>
            <div style={{ marginBottom: 16, fontSize: 12, color: 'var(--cyber-text-muted)' }}>
              EmotionGrowth AI 深度结合了积极心理学中的 Micro-Goals（微小目标设定机制）与认知行为疗法（CBT）的认知调节机制，开发了如下模块：
            </div>
            <List
              dataSource={features}
              renderItem={(item) => (
                <List.Item style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '10px 0', display: 'block' }}>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>
                    ✦ {item.title}
                  </div>
                  <div style={{ color: 'var(--cyber-text-muted)', fontSize: 11, lineHeight: 1.4 }}>
                    {item.desc}
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Update Changelog */}
      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        <Col xs={24} md={12}>
          <Card
            className="cyber-card"
            title={<span><HistoryOutlined style={{ color: '#ffb800' }} /> 系统更新日志</span>}
            style={{ height: '100%' }}
          >
            <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 4 }}>
              <Timeline>
                {changelogData.map((release, idx) => (
                  <Timeline.Item key={idx} color={release.color}>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Tag color={release.color === '#00f2fe' ? 'cyan' : 'green'} style={{ fontWeight: 'bold' }}>
                          {release.version}
                        </Tag>
                        <span style={{ fontSize: 11, color: 'var(--cyber-text-muted)' }}>
                          {release.date}
                        </span>
                      </div>
                      <ul style={{
                        margin: 0,
                        paddingLeft: 16,
                        color: 'var(--cyber-text)',
                        fontSize: 12,
                        lineHeight: '2'
                      }}>
                        {release.changes.map((change, cIdx) => (
                          <li key={cIdx} style={{ color: '#e2e8f0' }}>{change}</li>
                        ))}
                      </ul>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          </Card>
        </Col>

        {/* User Feedback */}
        <Col xs={24} md={12}>
          <Card
            className="cyber-card"
            title={<span><MessageOutlined style={{ color: 'var(--cyber-secondary)' }} /> 用户反馈</span>}
            style={{ height: '100%' }}
          >
            {/* Feedback Input */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--cyber-text-muted)', marginBottom: 8 }}>
                对系统有任何建议、Bug 反馈或功能期望？请在这里告诉我们：
              </div>
              <TextArea
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                placeholder="请输入您的反馈或建议..."
                autoSize={{ minRows: 2, maxRows: 4 }}
                maxLength={500}
                showCount
                style={{ marginBottom: 10 }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="primary"
                  className="cyber-btn"
                  icon={<SendOutlined />}
                  onClick={handleSubmitFeedback}
                >
                  提交反馈
                </Button>
              </div>
            </div>

            <Divider style={{ borderColor: 'rgba(0, 242, 254, 0.1)', margin: '12px 0' }} />

            {/* Feedback History */}
            <div style={{ fontSize: 12, color: 'var(--cyber-text-muted)', marginBottom: 8 }}>
              <CheckCircleOutlined style={{ color: 'var(--cyber-success)' }} /> 已提交的反馈 ({feedbacks.length})
            </div>
            <div style={{ maxHeight: 250, overflowY: 'auto', paddingRight: 4 }}>
              {feedbacks.length === 0 ? (
                <Empty description="暂无反馈记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                feedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    style={{
                      background: 'rgba(6, 11, 25, 0.5)',
                      border: '1px solid rgba(0, 242, 254, 0.08)',
                      borderRadius: 8,
                      padding: '10px 12px',
                      marginBottom: 8,
                      position: 'relative'
                    }}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                      onClick={() => handleDeleteFeedback(fb.id)}
                      style={{ position: 'absolute', top: 6, right: 6, background: 'transparent' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Tag color={fb.role === 'student' ? 'purple' : fb.role === 'teacher' ? 'cyan' : 'green'} style={{ fontSize: 9 }}>
                        {fb.role === 'student' ? '学生' : fb.role === 'teacher' ? '教师' : '管理员'}
                      </Tag>
                      <span style={{ fontSize: 12, color: '#fff', fontWeight: '500' }}>{fb.author}</span>
                      <span style={{ fontSize: 10, color: 'var(--cyber-text-muted)' }}>{fb.time}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--cyber-text)', lineHeight: '1.5', paddingRight: 20 }}>
                      {fb.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Footer Quote */}
      <div style={{
        marginTop: 30,
        textAlign: 'center',
        padding: '20px 0',
        borderTop: '1px solid rgba(0, 242, 254, 0.08)',
        color: 'var(--cyber-text-muted)',
        fontSize: 12
      }}>
        <div>EmotionGrowth AI 心理成长支持系统</div>
        <div style={{ marginTop: 4, fontSize: 10 }}>Copyright © 2026 上海交通大学附属闵行实验学校 邹钰萧. All Rights Reserved.</div>
      </div>
    </div>
  )
}
