import React, { useState, useEffect, useContext } from 'react'
import { Progress, Radio, Button, Space, Alert, message, Card, Table, Tag, Descriptions, Modal, List, Badge } from 'antd'
import { CheckCircleOutlined, RobotOutlined, FileTextOutlined, HistoryOutlined, UndoOutlined, SaveOutlined } from '@ant-design/icons'
import { questionBank } from '../data/questionBank.js'
import { UserContext } from '../App.jsx'

export default function StudentAssessment() {
  const { userInfo, addLog } = useContext(UserContext)
  
  // === Questionnaire States ===
  const [activeQuestions, setActiveQuestions] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [testResult, setTestResult] = useState(null)
  
  const [hasDraft, setHasDraft] = useState(false)
  const [draftData, setDraftData] = useState(null)
  const [historyRecords, setHistoryRecords] = useState([])
  
  // Modal detail visibility
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)

  // Shuffle & Pick 20 questions
  const generateRandomQuestions = () => {
    const shuffled = [...questionBank].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 20).map((q) => {
      const options = q.isReverse
        ? [
            { label: '总是', val: 5 },
            { label: '经常', val: 4 },
            { label: '有时', val: 3 },
            { label: '从不', val: 1 }
          ]
        : [
            { label: '从不', val: 5 },
            { label: '有时', val: 3 },
            { label: '经常', val: 2 },
            { label: '总是', val: 1 }
          ]
      return {
        ...q,
        options
      }
    })
  }

  // Load drafts and history
  const loadHistory = () => {
    try {
      const saved = localStorage.getItem('assessmentRecords')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Filter records belonging to current student only
        const filtered = parsed.filter(r => r.studentName === userInfo.nickname)
        setHistoryRecords(filtered)
      }
    } catch {}
  }

  useEffect(() => {
    // Check drafts
    try {
      const draft = localStorage.getItem('testDraft_' + userInfo.username)
      if (draft) {
        const parsed = JSON.parse(draft)
        if (parsed.activeQuestions && parsed.activeQuestions.length > 0) {
          setHasDraft(true)
          setDraftData(parsed)
        }
      }
    } catch (e) {
      console.error(e)
    }

    setActiveQuestions(generateRandomQuestions())
    loadHistory()
  }, [userInfo])

  // Save Draft
  const handleSaveDraft = () => {
    try {
      const draft = {
        activeQuestions,
        currentStep,
        answers
      }
      localStorage.setItem('testDraft_' + userInfo.username, JSON.stringify(draft))
      message.success('测评进度已暂存为草稿！')
    } catch (e) {
      console.error(e)
      message.error('草稿保存失败')
    }
  }

  // Restore Draft
  const handleRestoreDraft = () => {
    if (draftData) {
      setActiveQuestions(draftData.activeQuestions)
      setCurrentStep(draftData.currentStep)
      setAnswers(draftData.answers)
      setHasDraft(false)
      setDraftData(null)
      message.success('已恢复上次测评进度！')
    }
  }

  // Discard Draft
  const handleDiscardDraft = () => {
    localStorage.removeItem('testDraft_' + userInfo.username)
    setHasDraft(false)
    setDraftData(null)
    setActiveQuestions(generateRandomQuestions())
    setCurrentStep(0)
    setAnswers({})
    message.info('已清除草稿，重新开始测评。')
  }

  const handleSelectAnswer = (val) => {
    setAnswers({ ...answers, [currentStep]: val })
  }

  const handleNext = () => {
    if (answers[currentStep] === undefined) {
      message.warning('请选择一个符合您情况的选项')
      return
    }
    if (currentStep < activeQuestions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmitTest = () => {
    if (answers[currentStep] === undefined) {
      message.warning('请选择一个符合您情况的选项')
      return
    }

    const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0)
    let riskLevel = '正常'
    let feedback = '您的情绪成长弹性很好，心理非常健康，请继续保持乐观的心态！'

    if (totalScore < 45) {
      riskLevel = '重点关注'
      feedback = '检测到您近期压力水平偏高，情绪可能处于瓶颈期。建议联系心理辅导老师，进行一次轻松的树洞谈心哦！'
    } else if (totalScore < 65) {
      riskLevel = '中度关注'
      feedback = '您近期可能遇到了一些情绪困扰，建议在“情绪疏导中心”体验呼吸放松，主动调节心态。'
    } else if (totalScore < 75) {
      riskLevel = '轻度关注'
      feedback = '您的情绪有小幅度的波动，可以通过书写成长日记或小目标打卡来进行积极的心态调节。'
    }

    setTestResult({
      score: totalScore,
      risk: riskLevel,
      msg: feedback
    })

    // Update studentsList record score & risk if matching name
    try {
      const list = JSON.parse(localStorage.getItem('studentsList') || '[]')
      const updatedList = list.map(s => {
        if (s.name === userInfo.nickname) {
          const newTrend = [...(s.moodTrend || [70, 70, 70, 70, 70])]
          newTrend.push(totalScore)
          if (newTrend.length > 5) newTrend.shift()
          return { ...s, score: totalScore, risk: riskLevel, moodTrend: newTrend }
        }
        return s
      })
      localStorage.setItem('studentsList', JSON.stringify(updatedList))
    } catch (e) {
      console.error(e)
    }

    // Save to assessmentRecords in localStorage
    try {
      const savedRecords = JSON.parse(localStorage.getItem('assessmentRecords') || '[]')
      const pad = (n) => String(n).padStart(2, '0')
      const now = new Date()
      const timeStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
      
      const newRecord = {
        id: savedRecords.length > 0 ? Math.max(...savedRecords.map(r => r.id)) + 1 : 1,
        studentName: userInfo.nickname,
        className: userInfo.className || '未配置班级',
        score: totalScore,
        risk: riskLevel,
        time: timeStr,
        answers: activeQuestions.map((q, idx) => {
          const selectedVal = answers[idx]
          const matchedOption = q.options.find(opt => opt.val === selectedVal)
          return {
            q: q.text,
            a: matchedOption ? matchedOption.label : '未选择'
          }
        })
      }
      const updatedRecords = [newRecord, ...savedRecords]
      localStorage.setItem('assessmentRecords', JSON.stringify(updatedRecords))
      
      // Update local history
      setHistoryRecords(updatedRecords.filter(r => r.studentName === userInfo.nickname))
    } catch (e) {
      console.error(e)
    }

    // Clear Draft
    localStorage.removeItem('testDraft_' + userInfo.username)
    setHasDraft(false)
    setDraftData(null)

    addLog(
      'operation',
      `${userInfo.nickname} (student)`,
      `完成了20道随机心理自主测评（得分: ${totalScore}, 结果为: ${riskLevel}）`
    )

    message.success('评测提交成功，AI已为您生成专属情绪画像评估')
  }

  const handleRestartTest = () => {
    setCurrentStep(0)
    setAnswers({})
    setTestResult(null)
    setActiveQuestions(generateRandomQuestions())
  }

  const getRiskColor = (risk) => {
    if (risk === '正常') return 'success'
    if (risk === '轻度关注') return 'warning'
    if (risk === '中度关注') return 'orange'
    return 'error'
  }

  const showDetailModal = (record) => {
    setSelectedRecord(record)
    setModalVisible(true)
  }

  const columns = [
    { title: '评测时间', dataIndex: 'time', key: 'time' },
    {
      title: '综合得分',
      dataIndex: 'score',
      key: 'score',
      render: (score) => <span style={{ fontWeight: 'bold', color: 'var(--cyber-primary)' }}>{score} 分</span>
    },
    {
      title: '风险等级',
      dataIndex: 'risk',
      key: 'risk',
      render: (risk) => <Tag color={getRiskColor(risk)}>{risk}</Tag>
    },
    {
      title: '查看明细',
      key: 'action',
      render: (_, record) => (
        <Button size="small" type="primary" className="cyber-btn" onClick={() => showDetailModal(record)}>
          自测报告明细
        </Button>
      )
    }
  ]

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header-container">
        <div>
          <div className="page-title">心理测评中心</div>
          <div className="page-subtitle">定期开展科学的情绪画像测量，及时定位自我心理状态与变化趋势</div>
        </div>
        <div style={{ color: 'var(--cyber-secondary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Badge status="processing" color="var(--cyber-secondary)" />
          <span>随机量表评测引擎启动中</span>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto 24px auto' }}>
        <Card className="cyber-card" style={{ marginBottom: 24 }}>
          {!testResult ? (
            <div>
              {/* Draft Recover Banner */}
              {hasDraft && (
                <Alert
                  message="检测到未完成的测评草稿"
                  description={
                    <div style={{ color: 'var(--cyber-text-muted)', fontSize: 12, marginTop: 4 }}>
                      您上次自测回答到了第 <strong>{draftData?.currentStep + 1}</strong> 题，已记录 <strong>{Object.keys(draftData?.answers || {}).length}</strong> 道题目的进度。您可选择恢复，或清除重新开始。
                    </div>
                  }
                  type="info"
                  showIcon
                  action={
                    <Space direction="vertical" style={{ marginTop: 8 }}>
                      <Button size="small" type="primary" className="cyber-btn" onClick={handleRestoreDraft}>
                        恢复进度
                      </Button>
                      <Button size="small" danger style={{ background: 'transparent', color: '#ff4d4f', border: '1px solid #ff4d4f' }} onClick={handleDiscardDraft}>
                        重新开始
                      </Button>
                    </Space>
                  }
                  style={{ marginBottom: 20, border: '1px solid rgba(0, 242, 254, 0.2)', background: 'rgba(0, 242, 254, 0.05)' }}
                />
              )}

              {/* Progress Indicator */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--cyber-text-muted)', fontSize: 12, marginBottom: 8 }}>
                  <span>自测进度：第 {currentStep + 1} / {activeQuestions.length} 题</span>
                  <span>已完成 {activeQuestions.length > 0 ? Math.round((currentStep / activeQuestions.length) * 100) : 0}%</span>
                </div>
                <Progress
                  percent={activeQuestions.length > 0 ? Math.round((currentStep / activeQuestions.length) * 100) : 0}
                  status="active"
                  strokeColor={{ '0%': '#00f2fe', '100%': '#8b5cf6' }}
                  trailColor="rgba(255,255,255,0.05)"
                  showInfo={false}
                />
              </div>

              {/* Question Frame */}
              <div style={{
                background: 'rgba(6, 11, 25, 0.4)',
                padding: '24px 20px',
                borderRadius: 6,
                border: '1px solid rgba(0, 242, 254, 0.1)',
                minHeight: 120,
                marginBottom: 24
              }}>
                <div style={{ fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 20 }}>
                  Q{currentStep + 1}: {activeQuestions[currentStep]?.text}
                  <div style={{ fontSize: 11, color: 'var(--cyber-secondary)', fontWeight: 'normal', marginTop: 4 }}>
                    (测评维度: {activeQuestions[currentStep]?.dimension})
                  </div>
                </div>

                <Radio.Group
                  onChange={(e) => handleSelectAnswer(e.target.value)}
                  value={answers[currentStep]}
                >
                  <Space direction="vertical">
                    {activeQuestions[currentStep]?.options.map((opt, idx) => (
                      <Radio key={idx} value={opt.val} style={{ color: '#fff' }}>
                        {opt.label}
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              </div>

              {/* Navigation Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <Button disabled={currentStep === 0} onClick={handlePrev}>
                  上一题
                </Button>
                
                <Button onClick={handleSaveDraft} icon={<SaveOutlined />} style={{ borderColor: 'var(--cyber-primary)', color: 'var(--cyber-primary)', background: 'transparent' }}>
                  暂存草稿
                </Button>

                {currentStep < activeQuestions.length - 1 ? (
                  <Button type="primary" className="cyber-btn" onClick={handleNext}>
                    下一题
                  </Button>
                ) : (
                  <Button type="primary" className="cyber-btn cyber-btn-purple" onClick={handleSubmitTest}>
                    提交评测
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <CheckCircleOutlined style={{ fontSize: 50, color: '#05f3ad', marginBottom: 16 }} />
              <h3 style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>情绪能量分析已生成</h3>
              
              <div style={{ width: 200, margin: '20px auto' }}>
                <span style={{ fontSize: 12, color: 'var(--cyber-text-muted)' }}>心理成长能量得分</span>
                <Progress
                  type="circle"
                  percent={testResult.score}
                  strokeColor={{ '0%': '#8b5cf6', '100%': '#00f2fe' }}
                  trailColor="rgba(255,255,255,0.05)"
                  width={120}
                  style={{ display: 'block', margin: '8px auto' }}
                />
              </div>

              <div style={{ margin: '16px 0' }}>
                <span style={{ marginRight: 8, color: '#fff' }}>状态评估等级：</span>
                <Tag color={getRiskColor(testResult.risk)} style={{ padding: '2px 8px', fontSize: 13 }}>
                  {testResult.risk}
                </Tag>
              </div>

              <Alert
                message="AI 导师解读建议"
                description={testResult.msg}
                type="success"
                showIcon
                icon={<RobotOutlined />}
                style={{ textAlign: 'left', marginBottom: 24, background: 'rgba(5, 243, 173, 0.05)', border: '1px solid rgba(5, 243, 173, 0.2)' }}
              />

              <Button type="primary" className="cyber-btn" onClick={handleRestartTest}>
                重新开始测评
              </Button>
            </div>
          )}
        </Card>

        {/* History Table */}
        <Card className="cyber-card" title={<span><HistoryOutlined /> 我的测评历史记录</span>}>
          <Table
            dataSource={historyRecords}
            columns={columns}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 5 }}
            locale={{ emptyText: '暂无历史自测记录' }}
          />
        </Card>
      </div>

      {/* Answer Detail Modal */}
      <Modal
        title="量表自测详情清单"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>关闭</Button>
        ]}
        width={600}
      >
        {selectedRecord && (
          <div>
            <Descriptions bordered size="small" style={{ marginBottom: 16 }} column={2}>
              <Descriptions.Item label="测评时间">{selectedRecord.time}</Descriptions.Item>
              <Descriptions.Item label="综合得分">{selectedRecord.score} 分</Descriptions.Item>
              <Descriptions.Item label="关注等级" span={2}>
                <Tag color={getRiskColor(selectedRecord.risk)}>{selectedRecord.risk}</Tag>
              </Descriptions.Item>
            </Descriptions>
            
            <div style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '8px 12px' }}>
              <List
                dataSource={selectedRecord.answers}
                renderItem={(item, idx) => (
                  <List.Item style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '10px 0' }}>
                    <div style={{ width: '100%' }}>
                      <div style={{ color: '#fff', fontSize: 13, marginBottom: 4 }}>
                        {idx + 1}. {item.q}
                      </div>
                      <div style={{ color: 'var(--cyber-primary)', fontSize: 12, fontWeight: 'bold' }}>
                        您的选择：{item.a}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
