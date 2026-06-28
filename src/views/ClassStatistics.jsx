import React, { useState, useEffect, useRef } from 'react'
import { Row, Col, Progress, Table, Tag, Button, Modal, Form, Input, Select, AutoComplete, Space, message } from 'antd'
import { PlusOutlined, BarChartOutlined, TeamOutlined, WarningOutlined, PercentageOutlined } from '@ant-design/icons'
import * as echarts from 'echarts'

const { Option } = Select

const DEFAULT_SCHOOLS = [
  '朝阳区第一实验小学',
  '阳光育才双语初级中学',
  '山海星空高级中学',
  '华夏科技大学',
  '明德师范学院'
]

export default function ClassStatistics() {
  const barChartRef = useRef(null)
  const radarChartRef = useRef(null)
  const barChartInstance = useRef(null)
  const radarChartInstance = useRef(null)

  // 1. Load teacher created classes from localStorage
  const [classList, setClassList] = useState(() => {
    try {
      const saved = localStorage.getItem('classList')
      if (saved) return JSON.parse(saved)
    } catch {}
    const seed = [
      { id: 1, className: '高一1班', group: '高中组', school: '朝阳区第一实验小学' },
      { id: 2, className: '高一2班', group: '高中组', school: '朝阳区第一实验小学' }
    ]
    localStorage.setItem('classList', JSON.stringify(seed))
    return seed
  })

  // 2. Load students list
  const [students, setStudents] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  const loadData = () => {
    try {
      const saved = localStorage.getItem('studentsList')
      if (saved) {
        setStudents(JSON.parse(saved))
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // 3. Compute dynamic class data
  const getCalculatedClasses = () => {
    const classMap = {}

    // Initialize with classList
    classList.forEach(c => {
      classMap[c.className] = {
        name: c.className,
        group: c.group,
        school: c.school,
        total: 0,
        warnNum: 0,
        totalScore: 0,
      }
    })

    // Populate with actual students
    students.forEach(s => {
      const clsName = s.className || '未配置班级'
      if (!classMap[clsName]) {
        classMap[clsName] = {
          name: clsName,
          group: '其他/自定义',
          school: s.school || '朝阳区第一实验小学',
          total: 0,
          warnNum: 0,
          totalScore: 0,
        }
      }
      const data = classMap[clsName]
      data.total++
      data.totalScore += (s.score || 80)
      if (s.risk && s.risk !== '正常') {
        data.warnNum++
      }
    })

    // Map to ranks display format
    return Object.values(classMap).map((c, index) => {
      const avg = c.total > 0 ? Math.round(c.totalScore / c.total) : 0
      const rate = c.total > 0 ? parseFloat(((c.warnNum / c.total) * 100).toFixed(1)) : 0
      return {
        key: index + 1,
        name: c.name,
        group: c.group,
        school: c.school,
        total: c.total,
        warnNum: c.warnNum,
        rate: rate,
        averageScore: avg
      }
    })
  }

  const calculatedData = getCalculatedClasses()

  // 4. Calculate global stats
  const totalAvgScore = students.length > 0 ? Math.round(students.reduce((acc, s) => acc + (s.score || 0), 0) / students.length) : 82
  const warningCount = students.filter(s => s.risk && s.risk !== '正常').length
  const normalRate = students.length > 0 ? parseFloat((((students.length - warningCount) / students.length) * 100).toFixed(1)) : 100

  // 5. Create Class Handler
  const handleCreateClass = (values) => {
    const newClass = {
      id: Date.now(),
      className: values.className,
      group: values.group,
      school: values.school
    }
    const updated = [...classList, newClass]
    setClassList(updated)
    localStorage.setItem('classList', JSON.stringify(updated))
    message.success(`班级【${values.className}】成功建立！`)
    form.resetFields()
    setModalVisible(false)
    loadData() // refresh student bindings if any
  }

  // 6. Setup and update charts
  useEffect(() => {
    // Bar Chart
    if (!barChartRef.current) return
    if (barChartInstance.current) {
      barChartInstance.current.dispose()
    }
    
    const barChart = echarts.init(barChartRef.current)
    barChartInstance.current = barChart

    const chartClasses = calculatedData.map(c => c.name)
    const chartScores = calculatedData.map(c => c.averageScore > 0 ? c.averageScore : 80) // fallback default score if class empty

    barChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { top: '15%', left: '5%', right: '5%', bottom: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: chartClasses,
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
      series: [
        {
          name: '班级平均分',
          type: 'bar',
          barWidth: '35%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#00f2fe' },
              { offset: 1, color: 'rgba(0, 242, 254, 0.1)' }
            ]),
            borderRadius: [4, 4, 0, 0],
            shadowBlur: 10,
            shadowColor: 'rgba(0, 242, 254, 0.3)'
          },
          data: chartScores
        }
      ]
    })

    // Radar Chart
    if (!radarChartRef.current) return
    if (radarChartInstance.current) {
      radarChartInstance.current.dispose()
    }

    const radarChart = echarts.init(radarChartRef.current)
    radarChartInstance.current = radarChart

    // Dynamically label Radar data with the top classes
    const sortedRanks = [...calculatedData].sort((a, b) => b.rate - a.rate)
    const class1Name = sortedRanks[0] ? sortedRanks[0].name : '无班级'
    const class2Name = sortedRanks[1] ? sortedRanks[1].name : '无班级'

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
              name: `${class1Name} (关注高)`,
              itemStyle: { color: '#ff4d4f' },
              areaStyle: { color: 'rgba(255, 77, 79, 0.15)' }
            },
            {
              value: [2.1, 1.8, 2.3, 1.9, 1.5],
              name: `${class2Name} (平稳级)`,
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
    }
  }, [calculatedData])

  const rankColumns = [
    { title: '序号', dataIndex: 'key', width: 60, align: 'center', render: (val) => <span style={{ color: 'var(--cyber-primary)', fontWeight: 'bold' }}>{val}</span> },
    { title: '班级名称', dataIndex: 'name' },
    { title: '学段组别', dataIndex: 'group', render: (g) => <Tag color="blue">{g}</Tag> },
    { title: '所属学校', dataIndex: 'school' },
    { title: '总人数', dataIndex: 'total', render: (val) => `${val} 人` },
    { title: '预警人数', dataIndex: 'warnNum', render: (val) => <span style={{ color: val > 0 ? '#ff4d4f' : 'var(--cyber-success)', fontWeight: val > 0 ? 'bold' : 'normal' }}>{val} 人</span> },
    {
      title: '关注比例',
      dataIndex: 'rate',
      render: (rate) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Progress percent={rate} size="small" showInfo={false} strokeColor={{ '0%': '#8b5cf6', '100%': '#ff4d4f' }} trailColor="rgba(255,255,255,0.05)" style={{ width: 80 }} />
          <span>{rate}%</span>
        </div>
      )
    },
    { title: '平均成绩分', dataIndex: 'averageScore', render: (val) => <span style={{ fontFamily: 'var(--font-family-tech)', fontWeight: 'bold', color: 'var(--cyber-primary)' }}>{val} 分</span> }
  ]

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header-container">
        <div>
          <div className="page-title">年级班级管理与统计</div>
          <div className="page-subtitle">管理年级班级配置，展示各班级心理素质指标对比分析</div>
        </div>
        <Button
          type="primary"
          className="cyber-btn"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          新建班级
        </Button>
      </div>

      {/* Numerical Stats */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <div className="cyber-card" style={{ padding: '20px 24px', marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--cyber-primary)' }}>
              <BarChartOutlined />
              <span className="cyber-stat-label" style={{ margin: 0 }}>年级整体心理平均分</span>
            </div>
            <div className="cyber-stat-num" style={{ color: 'var(--cyber-primary)', marginTop: 8 }}>{totalAvgScore} 分</div>
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div className="cyber-card" style={{ padding: '20px 24px', marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#05f3ad' }}>
              <PercentageOutlined />
              <span className="cyber-stat-label" style={{ margin: 0 }}>测评正常率</span>
            </div>
            <div className="cyber-stat-num" style={{ color: '#05f3ad', marginTop: 8 }}>{normalRate} %</div>
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div className="cyber-card" style={{ padding: '20px 24px', marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ff4d4f' }}>
              <WarningOutlined />
              <span className="cyber-stat-label" style={{ margin: 0 }}>待关注学生总量</span>
            </div>
            <div className="cyber-stat-num" style={{ color: '#ff4d4f', marginTop: 8 }}>{warningCount} 人</div>
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
          <Tag color="purple">双轴分析</Tag>
        </div>
        <Table
          columns={rankColumns}
          dataSource={calculatedData}
          pagination={{ pageSize: 5 }}
          rowKey="key"
        />
      </div>

      {/* Create Class Modal */}
      <Modal
        title="建立新管辖班级"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateClass}
          initialValues={{ group: '高中组' }}
        >
          <Form.Item
            name="school"
            label="所属学校"
            rules={[{ required: true, message: '请选择或填写学校' }]}
          >
            <AutoComplete
              options={DEFAULT_SCHOOLS.map(s => ({ value: s }))}
              placeholder="选择或输入对应学校"
              filterOption={(inputValue, option) =>
                option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              }
            />
          </Form.Item>

          <Form.Item
            name="group"
            label="所属学段组别"
            rules={[{ required: true, message: '请配置学段组别' }]}
          >
            <Select>
              <Option value="小学组">小学组 (Elementary)</Option>
              <Option value="初中组">初中组 (Junior High)</Option>
              <Option value="高中组">高中组 (Senior High)</Option>
              <Option value="大学组">大学组 (University)</Option>
              <Option value="其他/自定义">其他/自定义</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="className"
            label="班级名称"
            rules={[{ required: true, message: '请输入自定义或下拉推荐班级' }]}
          >
            <Input placeholder="例如：高二(6)班" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" className="cyber-btn">
                建立班级
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
