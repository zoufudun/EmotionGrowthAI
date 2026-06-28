import React, { useState, useEffect } from 'react'
import { Table, Button, Card, Tag, Space, Modal, Descriptions, List, Badge } from 'antd'
import { FileTextOutlined, RobotOutlined, BookOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

export default function AssessmentRecords() {
  const navigate = useNavigate()
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)

  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('assessmentRecords')
      if (saved) return JSON.parse(saved)
    } catch {}
    
    // Seed with only 默认学生
    const seed = [
      {
        id: 1,
        studentName: '默认学生',
        className: '高一1班',
        score: 82,
        risk: '正常',
        time: '2026-06-25 10:20',
        answers: [
          { q: '我确实能够相信自己走的每一步路都在为未来的成功奠定基石吗？', a: '同意' },
          { q: '我确实对自己人生的主控权充满信心，相信命运掌握在自己手中？', a: '同意' },
          { q: '经常遇到不擅长的学科，我第一反应是选择彻底躺平，不再挣扎？', a: '不同意' },
          { q: '经常每当面对新任务时，我总是产生了畏难情绪，迟迟不肯动手。', a: '非常不同意' }
        ]
      }
    ]
    localStorage.setItem('assessmentRecords', JSON.stringify(seed))
    return seed
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem('assessmentRecords')
      if (saved) {
        setRecords(JSON.parse(saved))
      }
    } catch {}
  }, [])

  const showDetailModal = (record) => {
    setSelectedRecord(record)
    setModalVisible(true)
  }

  const getRiskTag = (risk) => {
    if (risk === '正常') return <Tag color="success">正常</Tag>
    if (risk === '轻度关注') return <Tag color="warning">轻度关注</Tag>
    if (risk === '中度关注') return <Tag color="orange">中度关注</Tag>
    return <Tag color="error">重点关注</Tag>
  }

  const columns = [
    { title: '记录ID', dataIndex: 'id', key: 'id', width: 90 },
    { title: '学生姓名', dataIndex: 'studentName', key: 'studentName' },
    { title: '所在班级', dataIndex: 'className', key: 'className' },
    {
      title: '综合得分',
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
      title: '预警等级',
      dataIndex: 'risk',
      key: 'risk',
      render: (risk) => getRiskTag(risk)
    },
    { title: '交卷时间', dataIndex: 'time', key: 'time' },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space size="middle">
          <Button
            size="small"
            type="primary"
            className="cyber-btn"
            icon={<FileTextOutlined />}
            onClick={() => showDetailModal(record)}
          >
            答卷详情
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
          <div className="page-title">测评答卷档案库</div>
          <div className="page-subtitle">保存全校学生心理自评量表的交卷日志与具体回答</div>
        </div>
      </div>

      {/* Table Card */}
      <div className="cyber-card" style={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </div>

      {/* Answer Detail Modal */}
      <Modal
        title="学生测评详情答卷"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>,
          <Button
            key="ai"
            type="primary"
            className="cyber-btn"
            icon={<RobotOutlined />}
            onClick={() => {
              setModalVisible(false)
              navigate('/ai-advice', { state: { record: selectedRecord } })
            }}
          >
            针对此卷生成 AI 建议
          </Button>
        ]}
        width={650}
      >
        {selectedRecord && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
              <Descriptions.Item label="姓名">{selectedRecord.studentName}</Descriptions.Item>
              <Descriptions.Item label="班级">{selectedRecord.className}</Descriptions.Item>
              <Descriptions.Item label="分数">
                <span style={{ fontWeight: 'bold', color: 'var(--cyber-primary)' }}>{selectedRecord.score} 分</span>
              </Descriptions.Item>
              <Descriptions.Item label="风险级别">{getRiskTag(selectedRecord.risk)}</Descriptions.Item>
              <Descriptions.Item label="提交时间" span={2}>{selectedRecord.time}</Descriptions.Item>
            </Descriptions>

            <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOutlined style={{ color: 'var(--cyber-primary)' }} />
              <span>题目详细作答清单</span>
            </div>

            <List
              dataSource={selectedRecord.answers}
              renderItem={(item, index) => (
                <List.Item style={{ borderBottom: '1px solid rgba(0, 242, 254, 0.1)', padding: '12px 0' }}>
                  <List.Item.Meta
                    title={<span style={{ color: 'var(--cyber-text-muted)', fontSize: 13 }}>Q{index + 1}: {item.q}</span>}
                    description={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                        <span style={{ color: '#fff', fontSize: 13, fontWeight: '500' }}>
                          选择答案: <Tag color="blue">{item.a}</Tag>
                        </span>
                        {/* Scoring feedback simulation */}
                        <Badge status={item.a.includes('不') || item.a.includes('总是') ? 'error' : 'success'} />
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
