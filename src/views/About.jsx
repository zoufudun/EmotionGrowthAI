import React from 'react'
import { Card, Row, Col, Divider, List, Space, Tag } from 'antd'
import { InfoCircleOutlined, CopyrightOutlined, UserOutlined, BookOutlined, SafetyCertificateOutlined, CodeOutlined } from '@ant-design/icons'

export default function About() {
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
          <div className="page-subtitle">查看 EmotionGrowth AI 心理成长支持系统的版权所有权、创作者架构及技术指标</div>
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
                    <Tag color="cyan">V1.0.0-SECURE-STABLE</Tag>
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
