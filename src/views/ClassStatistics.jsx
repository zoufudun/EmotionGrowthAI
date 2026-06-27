import React, { useEffect, useRef } from 'react'
import { Row, Col, Progress, Table, Tag } from 'antd'
import * as echarts from 'echarts'

export default function ClassStatistics() {
  const barChartRef = useRef(null)
  const radarChartRef = useRef(null)

  // Rank data
  const ranks = [
    { key: 1, name: '高二1班', total: 40, warnNum: 8, rate: 20 },
    { key: 2, name: '高一2班', total: 45, warnNum: 7, rate: 15.5 },
    { key: 3, name: '高三4班', total: 42, warnNum: 5, rate: 11.9 },
    { key: 4, name: '高一1班', total: 46, warnNum: 2, rate: 4.3 }
  ]

  const rankColumns = [
    { title: '排名', dataIndex: 'key', width: 60, align: 'center', render: (val) => <span style={{ color: 'var(--cyber-primary)', fontWeight: 'bold' }}>{val}</span> },
    { title: '班级', dataIndex: 'name' },
    { title: '总人数', dataIndex: 'total' },
    { title: '预警人数', dataIndex: 'warnNum', render: (val) => <span style={{ color: '#ff4d4f' }}>{val} 人</span> },
    {
      title: '关注比例',
      dataIndex: 'rate',
      render: (rate) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Progress percent={rate} size="small" showInfo={false} strokeColor={{ '0%': '#8b5cf6', '100%': '#ff4d4f' }} trailColor="rgba(255,255,255,0.05)" style={{ width: 80 }} />
          <span>{rate}%</span>
        </div>
      )
    }
  ]

  useEffect(() => {
    if (!barChartRef.current) return
    const barChart = echarts.init(barChartRef.current)
    barChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { top: '15%', left: '5%', right: '5%', bottom: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['高一1班', '高一2班', '高一3班', '高二1班', '高二2班', '高三4班'],
        axisLine: { lineStyle: { color: 'rgba(0, 242, 254, 0.2)' } },
        axisLabel: { color: '#8499b4' }
      },
      yAxis: {
        type: 'value',
        min: 50,
        max: 100,
        splitLine: { lineStyle: { color: 'rgba(0, 242, 254, 0.05)' } },
        axisLine: { lineStyle: { color: 'rgba(0, 242, 254, 0.2)' } },
        axisLabel: { color: '#8499b4' }
      },
      series: [
        {
          name: '班级平均分',
          type: 'bar',
          barWidth: '40%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#00f2fe' },
              { offset: 1, color: 'rgba(0, 242, 254, 0.1)' }
            ]),
            borderRadius: [4, 4, 0, 0],
            shadowBlur: 10,
            shadowColor: 'rgba(0, 242, 254, 0.3)'
          },
          data: [82, 76, 79, 71, 85, 78]
        }
      ]
    })

    if (!radarChartRef.current) return
    const radarChart = echarts.init(radarChartRef.current)
    radarChart.setOption({
      backgroundColor: 'transparent',
      tooltip: {},
      legend: {
        bottom: '0',
        textStyle: { color: '#8499b4' }
      },
      radar: {
        indicator: [
          { name: '学习压力因子', max: 5 },
          { name: '同伴关系紧张', max: 5 },
          { name: '情绪敏感波动', max: 5 },
          { name: '自我肯定失落', max: 5 },
          { name: '网络依赖倾向', max: 5 }
        ],
        axisName: { color: '#8499b4' },
        splitArea: { show: false },
        splitLine: { lineStyle: { color: 'rgba(0, 242, 254, 0.15)' } },
        axisLine: { lineStyle: { color: 'rgba(0, 242, 254, 0.15)' } }
      },
      series: [
        {
          name: '班级维度对比',
          type: 'radar',
          data: [
            {
              value: [4.2, 3.8, 4.0, 3.1, 2.5],
              name: '高二1班 (警示高)',
              itemStyle: { color: '#ff4d4f' },
              areaStyle: { color: 'rgba(255, 77, 79, 0.15)' }
            },
            {
              value: [2.1, 1.8, 2.3, 1.9, 1.5],
              name: '高一1班 (平稳级)',
              itemStyle: { color: '#05f3ad' },
              areaStyle: { color: 'rgba(5, 243, 173, 0.15)' }
            }
          ]
        }
      ]
    })

    const handleResize = () => {
      barChart.resize()
      radarChart.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      barChart.dispose()
      radarChart.dispose()
    }
  }, [])

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header-container">
        <div>
          <div className="page-title">年级班级心理统计</div>
          <div className="page-subtitle">年级整体与各班级心理素质指标对比分析大屏</div>
        </div>
      </div>

      {/* Numerical Stats */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <div className="cyber-card" style={{ padding: '20px 24px', marginBottom: 0 }}>
            <span className="cyber-stat-label">年级整体心理平均分</span>
            <div className="cyber-stat-num" style={{ color: 'var(--cyber-primary)' }}>78.5 分</div>
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div className="cyber-card" style={{ padding: '20px 24px', marginBottom: 0 }}>
            <span className="cyber-stat-label">测评正常率</span>
            <div className="cyber-stat-num" style={{ color: '#05f3ad' }}>87.9 %</div>
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div className="cyber-card" style={{ padding: '20px 24px', marginBottom: 0 }}>
            <span className="cyber-stat-label">待关注学生总量</span>
            <div className="cyber-stat-num" style={{ color: '#ff4d4f' }}>110 人</div>
          </div>
        </Col>
      </Row>

      {/* Main Charts */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12}>
          <div className="cyber-card" style={{ height: 420, marginBottom: 20 }}>
            <div className="cyber-card-header">
              <span>各班级心理测评平均分对比</span>
            </div>
            <div ref={barChartRef} style={{ height: 330, width: '100%' }}></div>
          </div>
        </Col>

        <Col xs={24} lg={12}>
          <div className="cyber-card" style={{ height: 420, marginBottom: 20 }}>
            <div className="cyber-card-header">
              <span>重点关注班级因子雷达对比</span>
            </div>
            <div ref={radarChartRef} style={{ height: 330, width: '100%' }}></div>
          </div>
        </Col>
      </Row>

      {/* Ranking List Table */}
      <div className="cyber-card">
        <div className="cyber-card-header" style={{ marginBottom: 16 }}>
          <span>班级心理关注比例与隐性风险排行</span>
          <Tag color="purple">重点预排</Tag>
        </div>
        <Table
          columns={rankColumns}
          dataSource={ranks}
          pagination={false}
          rowKey="key"
        />
      </div>
    </div>
  )
}
