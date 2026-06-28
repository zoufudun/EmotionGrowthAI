import React, { useState, useEffect, useRef } from 'react'
import { Card, Button, Row, Col, Space, Tag, Input, List, Divider, message, Timeline } from 'antd'
import { PlayCircleOutlined, PauseCircleOutlined, HeartOutlined, SoundOutlined, SmileOutlined, MessageOutlined } from '@ant-design/icons'

const { TextArea } = Input

let audioCtx = null
let activeSource = null
let activeGain = null

const stopSynthesizer = () => {
  if (activeSource) {
    try { activeSource.stop() } catch (e) {}
    activeSource = null
  }
  if (activeGain) {
    try { activeGain.disconnect() } catch (e) {}
    activeGain = null
  }
}

const startSynthesizer = (type) => {
  stopSynthesizer()
  
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  
  const bufferSize = 2 * audioCtx.sampleRate
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const output = noiseBuffer.getChannelData(0)
  
  activeGain = audioCtx.createGain()
  activeGain.gain.setValueAtTime(0.12, audioCtx.currentTime)
  activeGain.connect(audioCtx.destination)
  
  let lastOut = 0.0
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1
    if (type === 'rain') {
      output[i] = (lastOut + (0.02 * white)) / 1.02
      lastOut = output[i]
      output[i] *= 3.5
    } else {
      output[i] = (lastOut + (0.05 * white)) / 1.05
      lastOut = output[i]
      output[i] *= 3.5
    }
  }
  
  const noiseNode = audioCtx.createBufferSource()
  noiseNode.buffer = noiseBuffer
  noiseNode.loop = true
  
  const filter = audioCtx.createBiquadFilter()
  if (type === 'sea' || type === 'wind') {
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(400, audioCtx.currentTime)
    
    const osc = audioCtx.createOscillator()
    const oscGain = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(type === 'sea' ? 0.25 : 0.1, audioCtx.currentTime)
    oscGain.gain.setValueAtTime(type === 'sea' ? 250 : 150, audioCtx.currentTime)
    
    osc.connect(oscGain)
    oscGain.connect(filter.frequency)
    osc.start()
    
    noiseNode.onended = () => {
      try { osc.stop() } catch(e){}
    }
  } else if (type === 'fireplace') {
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(650, audioCtx.currentTime)
    filter.Q.setValueAtTime(1.0, audioCtx.currentTime)
  } else {
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1000, audioCtx.currentTime)
  }
  
  noiseNode.connect(filter)
  filter.connect(activeGain)
  noiseNode.start(0)
  activeSource = noiseNode
}

export default function StudentCounseling() {
  // === 1. Breathing Trainer ===
  const [breathState, setBreathState] = useState('idle') // 'idle' | 'inhale' | 'hold' | 'exhale' | 'hold2'
  const [breathTimer, setBreathTimer] = useState(0)
  const breathIntervalRef = useRef(null)

  useEffect(() => {
    if (breathState === 'idle') {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current)
      return
    }

    let count = 4
    setBreathTimer(count)
    
    breathIntervalRef.current = setInterval(() => {
      count--
      setBreathTimer(count)
      
      if (count === 0) {
        setBreathState(prev => {
          if (prev === 'inhale') return 'hold'
          if (prev === 'hold') return 'exhale'
          if (prev === 'exhale') return 'hold2'
          return 'inhale' // hold2 -> inhale loop
        })
        count = 4
        setBreathTimer(count)
      }
    }, 1000)

    return () => clearInterval(breathIntervalRef.current)
  }, [breathState])

  const handleStartBreathing = () => {
    setBreathState('inhale')
    message.success('呼吸调整指导启动，请跟随着圆圈大小变化进行深吸呼...')
  }

  const handleStopBreathing = () => {
    setBreathState('idle')
    if (breathIntervalRef.current) clearInterval(breathIntervalRef.current)
    message.info('呼吸训练已暂停')
  }

  const getBreathText = () => {
    if (breathState === 'inhale') return '缓慢吸气...'
    if (breathState === 'hold') return '屏气感受...'
    if (breathState === 'exhale') return '缓慢呼气...'
    if (breathState === 'hold2') return '屏气平静...'
    return '准备好开始了吗？'
  }

  const getBubbleScale = () => {
    if (breathState === 'inhale') return 1.6 - (breathTimer / 4) * 0.6 // grows from 1.0 to 1.6
    if (breathState === 'hold') return 1.6 // stays at 1.6
    if (breathState === 'exhale') return 1.0 + (breathTimer / 4) * 0.6 // shrinks from 1.6 to 1.0
    if (breathState === 'hold2') return 1.0 // stays at 1.0
    return 1.0
  }

  // === 2. White Noise Player ===
  const [activeTrack, setActiveTrack] = useState(null) // null | trackName
  const whiteNoises = [
    { id: '1', title: '🌧️ 森林夜雨', desc: '模拟幽静森林中密集的淅沥雨声，助眠安神' },
    { id: '2', title: '🌊 潮汐拍岸', desc: '规律、舒缓的海浪起伏退去声，平复浮躁' },
    { id: '3', title: '🔥 篝火柴烧', desc: '林间木屋旁篝火燃烧的细微劈啪声，增添温暖感' },
    { id: '4', title: '🍃 山谷晚风', desc: '穿过松林的阵阵空灵微风声，洗涤心灵尘埃' }
  ]

  const handleToggleNoise = (title) => {
    if (activeTrack === title) {
      setActiveTrack(null)
      stopSynthesizer()
      message.info('已暂停播放白噪音')
    } else {
      setActiveTrack(title)
      
      let type = 'rain'
      if (title.includes('潮汐')) type = 'sea'
      if (title.includes('篝火')) type = 'fireplace'
      if (title.includes('晚风')) type = 'wind'
      
      try {
        startSynthesizer(type)
        message.success(`正在为您播放：${title}`)
      } catch (e) {
        console.error(e)
        message.error('音频驱动初始化失败')
      }
    }
  }

  useEffect(() => {
    return () => {
      stopSynthesizer()
    }
  }, [])

  // === 3. Daily Reflection Logs ===
  const [reflectionInput, setReflectionInput] = useState('')
  const [reflections, setReflections] = useState(() => {
    try {
      const saved = localStorage.getItem('reflectiveLogs')
      if (saved) return JSON.parse(saved)
    } catch {}
    return [
      { id: '1', date: '2026-06-27 21:10', content: '今天最感激的一件小事是和同学在操场上散步，听到了鸟叫声，突然感觉整个人都放松下来了。' }
    ]
  })

  const handleSubmitReflection = () => {
    if (!reflectionInput.trim()) {
      message.warning('请输入您的反思感悟内容')
      return
    }

    const pad = (n) => String(n).padStart(2, '0')
    const now = new Date()
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`

    const newLog = {
      id: 'ref-' + Date.now(),
      date: timeStr,
      content: reflectionInput.trim()
    }

    const updated = [newLog, ...reflections]
    setReflections(updated)
    localStorage.setItem('reflectiveLogs', JSON.stringify(updated))
    setReflectionInput('')
    message.success('已成功提交反思日记！您的积极认知正悄悄滋长')
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header-container">
        <div>
          <div className="page-title">情绪疏导与建议中心</div>
          <div className="page-subtitle">结合呼吸觉察、自然音效及每日反思，安抚浮躁情绪，获取深度心理赋能</div>
        </div>
      </div>

      <Row gutter={[20, 20]}>
        {/* Left Column: Breathing Trainer */}
        <Col xs={24} md={12}>
          <Card className="cyber-card" style={{ height: '100%', minHeight: 460, display: 'flex', flexDirection: 'column' }} title={<span><HeartOutlined style={{ color: 'var(--cyber-primary)' }} /> 4-4-4 呼吸与冥想训练</span>}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 0' }}>
              
              {/* Animated breathing bubble */}
              <div style={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,242,254,0.4) 0%, rgba(139,92,246,0.15) 100%)',
                border: '2px solid var(--cyber-primary)',
                boxShadow: breathState !== 'idle' ? '0 0 30px rgba(0,242,254,0.4)' : '0 0 10px rgba(0,242,254,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scale(${getBubbleScale()})`,
                transition: 'transform 1s linear',
                marginBottom: 36,
                position: 'relative'
              }}>
                {breathState !== 'idle' && (
                  <div style={{
                    fontSize: 22,
                    fontWeight: 'bold',
                    color: '#fff',
                    textShadow: '0 0 5px rgba(0,242,254,0.8)'
                  }}>
                    {breathTimer}s
                  </div>
                )}
              </div>

              {/* Status Text instructions */}
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <h3 style={{ color: '#fff', fontSize: 18, marginBottom: 6 }}>{getBreathText()}</h3>
                <span style={{ color: 'var(--cyber-text-muted)', fontSize: 12 }}>
                  {breathState === 'idle' ? '通过缓慢均匀的深呼吸，激活副交感神经降低焦虑感' : '配合气泡节奏，缓慢调节您的气息'}
                </span>
              </div>

              {/* Controls */}
              <Space>
                {breathState === 'idle' ? (
                  <Button type="primary" className="cyber-btn" onClick={handleStartBreathing}>
                    开始呼吸训练
                  </Button>
                ) : (
                  <Button danger type="primary" onClick={handleStopBreathing} style={{ background: '#ff4d4f', borderColor: '#ff4d4f' }}>
                    暂停训练
                  </Button>
                )}
              </Space>
            </div>
          </Card>
        </Col>

        {/* Right Column: White Noise Player */}
        <Col xs={24} md={12}>
          <Card className="cyber-card" style={{ height: '100%', minHeight: 460 }} title={<span><SoundOutlined style={{ color: 'var(--cyber-secondary)' }} /> 自然白噪音背景之声</span>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {whiteNoises.map((noise) => {
                const isPlaying = activeTrack === noise.title
                return (
                  <div
                    key={noise.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 16,
                      background: 'rgba(255,255,255,0.02)',
                      border: isPlaying ? '1px solid var(--cyber-secondary)' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 8,
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{ flex: 1, marginRight: 16 }}>
                      <div style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {noise.title}
                        {isPlaying && (
                          <div className="eq-bar-container" style={{ display: 'inline-flex', gap: 2, alignItems: 'flex-end', height: 12 }}>
                            <div className="eq-bar" style={{ width: 2, height: 10, background: 'var(--cyber-secondary)' }}></div>
                            <div className="eq-bar" style={{ width: 2, height: 6, background: 'var(--cyber-secondary)' }}></div>
                            <div className="eq-bar" style={{ width: 2, height: 12, background: 'var(--cyber-secondary)' }}></div>
                            <div className="eq-bar" style={{ width: 2, height: 4, background: 'var(--cyber-secondary)' }}></div>
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--cyber-text-muted)', marginTop: 4 }}>{noise.desc}</div>
                    </div>
                    <Button
                      shape="circle"
                      icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                      onClick={() => handleToggleNoise(noise.title)}
                      className={isPlaying ? "cyber-btn-purple" : ""}
                      style={{ borderColor: isPlaying ? 'var(--cyber-secondary)' : 'rgba(255,255,255,0.15)', color: isPlaying ? 'var(--cyber-secondary)' : '#fff' }}
                    />
                  </div>
                )
              })}
            </div>

            {/* Glowing Equalizer Style */}
            <style>{`
              @keyframes bounceBar {
                0%, 100% { transform: scaleY(0.4); }
                50% { transform: scaleY(1.0); }
              }
              .eq-bar-container .eq-bar {
                transform-origin: bottom;
                animation: bounceBar 0.8s ease-in-out infinite;
              }
              .eq-bar-container .eq-bar:nth-child(2) { animation-delay: 0.15s; }
              .eq-bar-container .eq-bar:nth-child(3) { animation-delay: 0.3s; }
              .eq-bar-container .eq-bar:nth-child(4) { animation-delay: 0.45s; }
            `}</style>
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        {/* Left Bottom: Guided Relaxation */}
        <Col xs={24} md={10}>
          <Card className="cyber-card" style={{ height: '100%' }} title={<span><SmileOutlined style={{ color: '#ffb800' }} /> 肌肉渐进式肌肉放松指引</span>}>
            <Timeline
              pending="深呼吸，感受身体各部位的松弛感..."
              locale={{ emptyText: '加载引导中...' }}
              style={{ padding: '8px 4px 0 4px', color: '#fff' }}
            >
              <Timeline.Item color="blue">
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>第一步：头部与脸部扫描 (1分钟)</div>
                <div style={{ color: 'var(--cyber-text-muted)', fontSize: 11, marginTop: 4 }}>
                  用力紧闭双眼，咬紧牙关，皱起眉头，感受脸部肌肉的紧绷。坚持5秒，然后慢慢松开，感受眉头舒展与脸部的温暖松弛。
                </div>
              </Timeline.Item>
              <Timeline.Item color="purple">
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>第二步：双肩与颈椎释放 (1.5分钟)</div>
                <div style={{ color: 'var(--cyber-text-muted)', fontSize: 11, marginTop: 4 }}>
                  耸起双肩，尽量靠近耳朵，保持肌肉高度紧绷。吸气并坚持5秒，随后呼气并将肩膀彻底沉下，感受重力将负荷卸去。
                </div>
              </Timeline.Item>
              <Timeline.Item color="cyan">
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>第三步：腹腔与核心收束 (1分钟)</div>
                <div style={{ color: 'var(--cyber-text-muted)', fontSize: 11, marginTop: 4 }}>
                  紧紧绷住小腹与核心，坚持5秒，随后缓慢放松，感觉小腹随呼吸平缓地起伏，温热的气息在胃部流转。
                </div>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>

        {/* Right Bottom: Reflective Logs */}
        <Col xs={24} md={14}>
          <Card className="cyber-card" title={<span><MessageOutlined style={{ color: '#05f3ad' }} /> 每日认知反思日记</span>}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: 'var(--cyber-secondary)', fontWeight: 'bold', marginBottom: 6 }}>今日思考引导：</div>
              <div style={{ fontSize: 12, color: '#fff', fontStyle: 'italic', marginBottom: 12 }}>
                “回想近两天的一件让你产生学业压力或焦虑的事。写下它，然后尝试用积极的角度（比如你从中收获的成长，或者局势的转折）去重新看待它。”
              </div>
              <TextArea
                value={reflectionInput}
                onChange={(e) => setReflectionInput(e.target.value)}
                placeholder="在此处写下你的深度认知反思... (如：虽然数学周测考砸了，但这让我发现了自己立体几何的漏洞，刚好可以在期末前弥补！)"
                autoSize={{ minRows: 3, maxRows: 6 }}
                style={{ marginBottom: 12 }}
              />
              <Button type="primary" className="cyber-btn" onClick={handleSubmitReflection}>
                提交反思感悟
              </Button>
            </div>

            <Divider orientation="left" style={{ borderColor: 'rgba(0, 242, 254, 0.15)', color: '#fff' }}>历史反思印记</Divider>
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              <List
                dataSource={reflections}
                renderItem={(item) => (
                  <List.Item style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 4px' }}>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--cyber-text-muted)', fontSize: 11, marginBottom: 4 }}>
                        <span>思考记录</span>
                        <span>{item.date}</span>
                      </div>
                      <div style={{ color: '#fff', fontSize: 13, lineHeight: '1.5' }}>{item.content}</div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
