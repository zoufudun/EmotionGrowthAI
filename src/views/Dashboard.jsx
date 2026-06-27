import React, { useEffect, useRef, useState } from 'react'
import { Row, Col, Card, Statistic, Badge, List, Button, Tag, Space, Alert } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  NotificationOutlined,
  ArrowUpOutlined,
  RobotOutlined,
  WarningOutlined,
  SlidersOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import * as echarts from 'echarts'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  const pieChartRef = useRef(null)
  const trendChartRef = useRef(null)
  const compareChartRef = useRef(null)

  // Demo stats
  const stats = [
    { title: '学生总数', value: 1260, icon: <UserOutlined style={{ color: '#00f2fe' }} />, suffix: '人', color: '#00f2fe' },
    { title: '指导教师', value: 86, icon: <TeamOutlined style={{ color: '#a78bfa' }} />, suffix: '人', color: '#a78bfa' },
    { title: '班级数量', value: 32, icon: <SlidersOutlined style={{ color: '#05f3ad' }} />, suffix: '个', color: '#05f3ad' },
    { title: '今日测评', value: 148, icon: <NotificationOutlined style={{ color: '#ffb800' }} />, suffix: '次', color: '#ffb800' }
  ]

  // Mock warnings
  const alerts = [
    { id: 1, name: '王五', class: '高二1班', score: 45, level: '重点关注', time: '10分钟前', msg: '测评得分较低，表现出中重度学习焦虑。' },
    { id: 2, name: '李四', class: '高一2班', score: 61, level: '轻度关注', time: '1小时前', msg: '近期打卡偏负面，有一定抑郁情绪波折。' },
    { id: 3, name: '赵六', class: '高三4班', score: 52, level: '中度关注', time: '3小时前', msg: '人际交往维度得分低，可能与同伴存在矛盾。' }
  ]

  // Chart setup
  useEffect(() => {
    // Pie Chart
    if (!pieChartRef.current) return
    const pieChart = echarts.init(pieChartRef.current)
    pieChart.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      legend: {
        bottom: '5%',
        left: 'center',
        textStyle: { color: '#8499b4' }
      },
      series: [
        {
          name: '风险等级',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#060b19',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
              color: '#fff',
              formatter: '{b}\n{c}人'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 920, name: '正常', itemStyle: { color: '#05f3ad' } },
            { value: 230, name: '轻度关注', itemStyle: { color: '#ffb800' } },
            { value: 88, name: '中度关注', itemStyle: { color: '#f59e0b' } },
            { value: 22, name: '重点关注', itemStyle: { color: '#ff4d4f' } }
          ]
        }
      ]
    })

    // Trend Chart
    if (!trendChartRef.current) return
    const trendChart = echarts.init(trendChartRef.current)
    trendChart.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', label: { backgroundColor: '#111827' } }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          axisLine: { lineStyle: { color: 'rgba(0, 242, 254, 0.2)' } },
          axisLabel: { color: '#8499b4' }
        }
      ],
      yAxis: [
        {
          type: 'value',
          splitLine: { lineStyle: { color: 'rgba(0, 242, 254, 0.05)' } },
          axisLine: { lineStyle: { color: 'rgba(0, 242, 254, 0.2)' } },
          axisLabel: { color: '#8499b4' }
        }
      ],
      series: [
        {
          name: '新增预警',
          type: 'line',
          stack: 'Total',
          smooth: true,
          lineStyle: {
            width: 3,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#00f2fe' },
              { offset: 1, color: '#a78bfa' }
            ])
          },
          showSymbol: false,
          areaStyle: {
            opacity: 0.15,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#00f2fe' },
              { offset: 1, color: 'transparent' }
            ])
          },
          emphasis: { focus: 'series' },
          data: [15, 23, 12, 38, 22, 19, 28]
        }
      ]
    })

    // Compare Chart (Class comparison analysis)
    if (!compareChartRef.current) return
    const compareChart = echarts.init(compareChartRef.current)

    // Load student records dynamically
    let students = []
    try {
      students = JSON.parse(localStorage.getItem('studentsList') || '[]')
    } catch {}

    if (students.length === 0) {
      students = [
        { id: 1, name: '张三', gender: '男', className: '高一1班', score: 82, risk: '正常' },
        { id: 2, name: '李四', gender: '女', className: '高一2班', score: 61, risk: '轻度关注' },
        { id: 3, name: '王五', gender: '男', className: '高二1班', score: 45, risk: '重点关注' },
        { id: 4, name: '赵六', gender: '女', className: '高三4班', score: 52, risk: '中度关注' },
        { id: 5, name: '孙七', gender: '男', className: '高一1班', score: 94, risk: '正常' }
      ]
    }

    const classMap = {}
    students.forEach(s => {
      const cls = s.className || '高一1班'
      if (!classMap[cls]) {
        classMap[cls] = { totalScore: 0, count: 0, alertCount: 0 }
      }
      classMap[cls].totalScore += (s.score || 80)
      classMap[cls].count++
      if (s.risk && s.risk !== '正常') {
        classMap[cls].alertCount++
      }
    })

    const classes = Object.keys(classMap)
    const averageScores = classes.map(c => Math.round(classMap[c].totalScore / classMap[c].count))
    const alertCounts = classes.map(c => classMap[c].alertCount)

    compareChart.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        textStyle: { color: '#8499b4' },
        data: ['班级心理测评分数', '异常关注人数']
      },
      grid: { top: '15%', left: '3%', right: '3%', bottom: '5%', containLabel: true },
      xAxis: {
        type: 'category',
        data: classes.length > 0 ? classes : ['高一1班', '高一2班', '高二1班', '高三4班'],
        axisLine: { lineStyle: { color: 'rgba(0, 242, 254, 0.2)' } },
        axisLabel: { color: '#8499b4' }
      },
      yAxis: [
        {
          type: 'value',
          name: '平均分',
          min: 0,
          max: 100,
          splitLine: { lineStyle: { color: 'rgba(0, 242, 254, 0.05)' } },
          axisLine: { lineStyle: { color: 'rgba(0, 242, 254, 0.2)' } },
          axisLabel: { color: '#8499b4' },
          nameTextStyle: { color: '#8499b4' }
        },
        {
          type: 'value',
          name: '关注人数',
          min: 0,
          max: 10,
          splitLine: { show: false },
          axisLine: { lineStyle: { color: 'rgba(167, 139, 250, 0.2)' } },
          axisLabel: { color: '#8499b4' },
          nameTextStyle: { color: '#8499b4' }
        }
      ],
      series: [
        {
          name: '班级心理测评分数',
          type: 'bar',
          barWidth: '20%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#00f2fe' },
              { offset: 1, color: 'rgba(0, 242, 254, 0.1)' }
            ]),
            borderRadius: [4, 4, 0, 0]
          },
          data: averageScores.length > 0 ? averageScores : [82, 76, 71, 78]
        },
        {
          name: '异常关注人数',
          type: 'bar',
          yAxisIndex: 1,
          barWidth: '20%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#ff4d4f' },
              { offset: 1, color: 'rgba(255, 77, 79, 0.1)' }
            ]),
            borderRadius: [4, 4, 0, 0]
          },
          data: alertCounts.length > 0 ? alertCounts : [0, 1, 1, 1]
        }
      ]
    })

    const handleResize = () => {
      pieChart.resize()
      trendChart.resize()
      compareChart.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      pieChart.dispose()
      trendChart.dispose()
      compareChart.dispose()
    }
  }, [])

  const handleAction = (record) => {
    navigate('/ai-advice', { state: { record } })
  }

  const getRiskColor = (level) => {
    if (level === '正常') return 'success'
    if (level === '轻度关注') return 'warning'
    if (level === '中度关注') return 'orange'
    return 'error'
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header-container">
        <div>
          <div className="page-title">首页数字看板</div>
          <div className="page-subtitle">心理健康监控与情绪成长数据总控中心</div>
        </div>
        <div style={{ color: 'var(--cyber-primary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Badge status="processing" color="var(--cyber-primary)" />
          <span>核心模型：Cognitive-AI-v4.1</span>
        </div>
      </div>

      {/* Stats Cards Row */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        {stats.map((item, idx) => (
          <Col xs={24} sm={12} md={6} key={idx}>
            <div className="cyber-card" style={{ padding: '24px 20px', marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="cyber-stat-label">{item.title}</span>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span className="cyber-stat-num" style={{ color: item.color, textShadow: `0 0 10px ${item.color}50` }}>
                  {item.value}
                </span>
                <span style={{ color: 'var(--cyber-text-muted)', fontSize: 13 }}>{item.suffix}</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--cyber-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: '#05f3ad', display: 'flex', alignItems: 'center' }}>
                  <ArrowUpOutlined style={{ marginRight: 2 }} /> 4.2%
                </span>
                <span>相比上周同期</span>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Warning Alert banner */}
      <Alert
        message="智能监控警报已触发"
        description="系统检测到最近有 3 名学生测评得分进入非正常区间，请及时关注其情绪走势并采取AI干预措施。"
        type="warning"
        showIcon
        icon={<WarningOutlined style={{ color: '#ffb800' }} />}
        className="cyber-card cyber-alert-pulse"
        style={{ marginBottom: 24, border: '1px solid var(--cyber-warning)', background: 'rgba(255, 184, 0, 0.05)' }}
      />

      {/* Main Panel Content */}
      <Row gutter={[20, 20]}>
        {/* Charts Section */}
        <Col xs={24} lg={16}>
          <Row gutter={[20, 20]}>
            <Col xs={24} md={12}>
              <div className="cyber-card" style={{ height: 440, marginBottom: 0 }}>
                <div className="cyber-card-header">
                  <span>学生心理健康状态分布</span>
                  <Tag color="cyan">实时统计</Tag>
                </div>
                <div ref={pieChartRef} style={{ height: 350, width: '100%' }}></div>
              </div>
            </Col>
            
            <Col xs={24} md={12}>
              <div className="cyber-card" style={{ height: 440, marginBottom: 0 }}>
                <div className="cyber-card-header">
                  <span>心理预警新增趋势</span>
                  <Tag color="purple">近7天</Tag>
                </div>
                <div ref={trendChartRef} style={{ height: 350, width: '100%' }}></div>
              </div>
            </Col>
          </Row>
        </Col>

        {/* Realtime Alert List */}
        <Col xs={24} lg={8}>
          <div className="cyber-card" style={{ height: 440, marginBottom: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="cyber-card-header" style={{ marginBottom: 12 }}>
              <span>实时异常情绪事件</span>
              <Badge count={alerts.length} style={{ backgroundColor: '#ff4d4f' }} />
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              <List
                itemLayout="horizontal"
                dataSource={alerts}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      borderBottom: '1px solid rgba(0, 242, 254, 0.1)',
                      padding: '12px 4px',
                    }}
                    actions={[
                      <Button
                        size="small"
                        type="primary"
                        className="cyber-btn"
                        icon={<RobotOutlined />}
                        onClick={() => handleAction(item)}
                      >
                        AI介入
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <span style={{ color: '#fff', fontWeight: 'bold' }}>{item.name}</span>
                          <span style={{ color: 'var(--cyber-text-muted)', fontSize: 12 }}>{item.class}</span>
                          <Tag color={getRiskColor(item.level)} style={{ fontSize: 10, lineHeight: '14px' }}>
                            {item.level}
                          </Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <div style={{ color: 'var(--cyber-text-muted)', fontSize: 12, margin: '4px 0' }}>{item.msg}</div>
                          <span style={{ fontSize: 10, color: 'var(--cyber-primary)' }}>{item.time}</span>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          </div>
        </Col>
      </Row>

      {/* Class Comparison Chart Row */}
      <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <div className="cyber-card" style={{ height: 390, marginBottom: 0 }}>
            <div className="cyber-card-header">
              <span>班级心理对比分析 (多维比较)</span>
              <Tag color="purple"><BarChartOutlined /> 双轴分析</Tag>
            </div>
            <div ref={compareChartRef} style={{ height: 310, width: '100%' }}></div>
          </div>
        </Col>
      </Row>
    </div>
  )
}
