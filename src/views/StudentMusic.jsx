import React, { useState, useEffect, useRef, useContext } from 'react'
import { Card, Row, Col, Space, Button, Tag, Progress, Slider, Radio, Table, Modal, Alert, Switch, TimePicker, message, List, Divider } from 'antd'
import { CustomerServiceOutlined, PlayCircleOutlined, PauseCircleOutlined, HeartOutlined, StarOutlined, StarFilled, HourglassOutlined, BarChartOutlined, BulbOutlined, BellOutlined, HistoryOutlined } from '@ant-design/icons'
import { UserContext } from '../App.jsx'
import * as echarts from 'echarts'
import dayjs from 'dayjs'

// === Global Web Audio variables ===
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
  
  // 1. Noise Synthesizer (Rain, Sea, Wind, Library, Fireplace)
  if (['rain', 'sea', 'wind', 'library', 'fireplace'].includes(type)) {
    const bufferSize = 2 * audioCtx.sampleRate
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    
    activeGain = audioCtx.createGain()
    activeGain.gain.setValueAtTime(0.12, audioCtx.currentTime)
    activeGain.connect(audioCtx.destination)
    
    let lastOut = 0.0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      if (type === 'rain' || type === 'library') {
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
      filter.frequency.setValueAtTime(380, audioCtx.currentTime)
      
      const osc = audioCtx.createOscillator()
      const oscGain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(type === 'sea' ? 0.22 : 0.08, audioCtx.currentTime)
      oscGain.gain.setValueAtTime(type === 'sea' ? 240 : 130, audioCtx.currentTime)
      
      osc.connect(oscGain)
      oscGain.connect(filter.frequency)
      osc.start()
      
      noiseNode.onended = () => {
        try { osc.stop() } catch(e){}
      }
    } else if (type === 'fireplace') {
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(600, audioCtx.currentTime)
      filter.Q.setValueAtTime(1.2, audioCtx.currentTime)
    } else {
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(900, audioCtx.currentTime)
    }
    
    noiseNode.connect(filter)
    filter.connect(activeGain)
    noiseNode.start(0)
    activeSource = noiseNode
  }
  // 2. Ambient Chords Synthesizer (Piano, Guitar, Zen, Alpha, Binaural)
  else {
    activeGain = audioCtx.createGain()
    activeGain.gain.setValueAtTime(0.0, audioCtx.currentTime)
    activeGain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 1.8) // 1.8s fade in
    activeGain.connect(audioCtx.destination)
    
    const freqs = type === 'anxiety' || type === 'zen'
      ? [110, 165, 220, 275] // A minor drone chord
      : type === 'focus' || type === 'alpha'
      ? [130.81, 196.00, 261.63, 329.63, 392.00] // C major 7th chord
      : [73.42, 110.00, 146.83, 174.61] // D minor deep drone
      
    const oscillators = freqs.map((f, index) => {
      const osc = audioCtx.createOscillator()
      const oscGain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, audioCtx.currentTime)
      
      const lfo = audioCtx.createOscillator()
      const lfoGain = audioCtx.createGain()
      lfo.frequency.setValueAtTime(0.08 + index * 0.04, audioCtx.currentTime)
      lfoGain.gain.setValueAtTime(0.04, audioCtx.currentTime)
      
      lfo.connect(lfoGain)
      lfoGain.connect(oscGain.gain)
      
      oscGain.gain.setValueAtTime(0.025, audioCtx.currentTime)
      osc.connect(oscGain)
      oscGain.connect(activeGain)
      
      osc.start(0)
      lfo.start(0)
      
      return { osc, lfo }
    })
    
    activeSource = {
      stop: () => {
        if (activeGain) {
          activeGain.gain.cancelScheduledValues(audioCtx.currentTime)
          activeGain.gain.setValueAtTime(activeGain.gain.value, audioCtx.currentTime)
          activeGain.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + 1.2) // 1.2s fade out
        }
        setTimeout(() => {
          oscillators.forEach(o => {
            try { o.osc.stop() } catch(e){}
            try { o.lfo.stop() } catch(e){}
          })
        }, 1300)
      }
    }
  }
}

export default function StudentMusic() {
  const { userInfo, addLog } = useContext(UserContext)
  
  // === Playlists Categories ===
  const tracks = [
    // 减压安静
    { id: '1', title: '🌧️ 林间细雨', type: 'rain', category: 'relax', desc: '规律绵密的淅沥雨声，迅速收敛浮躁思绪' },
    { id: '2', title: '🌊 慢拍潮汐', type: 'sea', category: 'relax', desc: '海浪慢节奏起伏拍岸，平复考试前急促的心跳' },
    { id: '3', title: '🔥 炉火碎柴', type: 'fireplace', category: 'relax', desc: '小木屋壁炉柴火的微弱爆裂声，给予安全感' },
    { id: '4', title: '📚 谧静书馆', type: 'library', category: 'relax', desc: '图书馆环境的底噪，提升深度学习专注度' },
    { id: '5', title: '🎹 晨曦钢琴', type: 'focus', category: 'relax', desc: '暖阳钢琴纯乐，无词纯器乐脑波抚慰' },
    // 针对性修复
    { id: '6', title: '🧘 降压脑电波(140Hz)', type: 'anxiety', category: 'heal', desc: '针对考前焦虑：低频减压音乐，镇静神经' },
    { id: '7', title: '🌸 温柔疗愈禅乐', type: 'zen', category: 'heal', desc: '针对委屈低落：古风疗愈，温柔接纳负面情绪' },
    { id: '8', title: '💤 超低音助眠电波', type: 'sleep', category: 'heal', desc: '针对失眠：极慢速无起伏音频，辅助放松肌肉' },
    { id: '9', title: '📝 专注阿尔法脑波', type: 'alpha', category: 'heal', desc: '专注度提升：写作业刷题专用阿尔法脑电波' },
    // 短时放松
    { id: '10', title: '⏱️ 3分钟快速午休', type: 'focus', category: 'short', desc: '课间十分钟碎片化减压，高效清空大脑负荷' },
    { id: '11', title: '⏱️ 5分钟肌肉渐进放松', type: 'zen', category: 'short', desc: '适合久坐后，快速释放肩颈酸痛与紧绷' }
  ]

  // === Playback states ===
  const [playingTrack, setPlayingTrack] = useState(null) // track object
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('musicFavorites_' + userInfo.username)
      if (saved) return JSON.parse(saved)
    } catch {}
    return ['1', '5'] // default favorites
  })

  // === Timers states ===
  const [timerDuration, setTimerDuration] = useState(0) // minutes (0 means loop)
  const [timerRemaining, setTimerRemaining] = useState(0) // seconds
  const timerIntervalRef = useRef(null)

  // === Pre-post Ratings states ===
  const [ratingModalVisible, setRatingModalVisible] = useState(false)
  const [tempBeforeScore, setTempBeforeScore] = useState(5)
  const [beforeScore, setBeforeScore] = useState(null)
  const [postScore, setPostScore] = useState(5)
  
  const [relaxLogs, setRelaxLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('musicRelaxationLogs_' + userInfo.username)
      if (saved) return JSON.parse(saved)
    } catch {}
    return [
      { id: 'l-1', time: '2026-06-27 21:40', track: '🌊 慢拍潮汐', before: 7, after: 3, diff: 4 }
    ]
  })

  // === 4-7-8 Breathing states ===
  const [breathPhase, setBreathPhase] = useState('idle') // 'idle' | 'inhale' | 'hold' | 'exhale'
  const [breathCount, setBreathCount] = useState(0)
  const breathTimerRef = useRef(null)

  // === AI Advice & Reminders ===
  const [aiScheme, setAiScheme] = useState(null)
  const [reminderActive, setReminderActive] = useState(() => {
    try {
      return localStorage.getItem('musicReminderActive_' + userInfo.username) === 'true'
    } catch {}
    return false
  })
  const [reminderTime, setReminderTime] = useState(dayjs('21:30', 'HH:mm'))

  // ECharts container
  const chartContainerRef = useRef(null)

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const timerControls = (
    <Space style={{ flexWrap: 'wrap', gap: 6 }}>
      <HourglassOutlined style={{ color: 'var(--cyber-secondary)' }} />
      <span style={{ color: 'var(--cyber-text-muted)', fontSize: 12 }}>定时停止：</span>
      <Radio.Group size="small" value={timerDuration} onChange={(e) => setTimerDuration(e.target.value)}>
        <Radio.Button value={0}>循环</Radio.Button>
        <Radio.Button value={5}>5分</Radio.Button>
        <Radio.Button value={10}>10分</Radio.Button>
        <Radio.Button value={15}>15分</Radio.Button>
        <Radio.Button value={30}>30分</Radio.Button>
      </Radio.Group>
      {timerDuration > 0 && (
        <Tag color="purple" style={{ marginLeft: 6 }}>
          剩 {Math.floor(timerRemaining / 60)}分{timerRemaining % 60}秒
        </Tag>
      )}
    </Space>
  )

  // === Audio Trigger ===
  const handleTogglePlay = (track) => {
    if (playingTrack?.id === track.id) {
      // Prompt for post-rating on stop
      setRatingModalVisible(true)
    } else {
      // Prompt for pre-rating before start
      setPlayingTrack(track)
      setBeforeScore(null)
      // Auto-set pre-rating score to current stress
      setTempBeforeScore(5)
      Modal.confirm({
        title: '开始本次音乐放松',
        content: (
          <div>
            <div style={{ marginBottom: 12 }}>在聆听【{track.title}】之前，请客观评估您当下的心理压力/焦虑程度（1~10）：</div>
            <Slider min={1} max={10} defaultValue={5} onChange={(val) => setTempBeforeScore(val)} />
            <div style={{ color: 'var(--cyber-primary)', fontSize: 11, marginTop: 6 }}>1 代表心如止水，10 代表极度高压焦虑</div>
          </div>
        ),
        onOk: () => {
          setBeforeScore(tempBeforeScore)
          try {
            startSynthesizer(track.type)
            message.success(`正在为您启动真实 Web Audio 场景声学合成：${track.title}`)
          } catch(e) {
            message.error('声卡驱动初始化失败')
          }
        },
        onCancel: () => {
          setPlayingTrack(null)
        }
      })
    }
  }

  // Handle post-rating submit and save logs
  const handlePostRatingSubmit = () => {
    stopSynthesizer()
    
    const pad = (n) => String(n).padStart(2, '0')
    const now = new Date()
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
    
    const diff = (beforeScore || 5) - postScore
    const newLog = {
      id: 'log-' + Date.now(),
      time: timeStr,
      track: playingTrack.title,
      before: beforeScore || 5,
      after: postScore,
      diff: diff > 0 ? diff : 0
    }

    const updated = [newLog, ...relaxLogs]
    setRelaxLogs(updated)
    localStorage.setItem('musicRelaxationLogs_' + userInfo.username, JSON.stringify(updated))
    
    addLog(
      'operation',
      `${userInfo.nickname} (student)`,
      `完成了音乐放松课程：${playingTrack.title} (压力前: ${beforeScore}, 压力后: ${postScore}, 减压度: ${newLog.diff})`
    )

    setPlayingTrack(null)
    setRatingModalVisible(false)
    message.success(`体验归档成功！心理减压幅度: ${newLog.diff} 分。情绪状态得到有效缓和。`)
  }

  // Handle sleep timer closure
  useEffect(() => {
    if (timerDuration === 0) {
      setTimerRemaining(0)
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      return
    }

    setTimerRemaining(timerDuration * 60)
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    
    timerIntervalRef.current = setInterval(() => {
      setTimerRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current)
          // Timer finished: stop audio
          stopSynthesizer()
          setPlayingTrack(null)
          message.info('⏱️ 定时放松时间到，心灵音乐屋已自动为您暂停声音播放。')
          setTimerDuration(0)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [timerDuration])

  // Toggle favorite
  const handleToggleFavorite = (trackId) => {
    let updated = []
    if (favorites.includes(trackId)) {
      updated = favorites.filter(id => id !== trackId)
      message.info('已取消收藏该曲目')
    } else {
      updated = [...favorites, trackId]
      message.success('已添加到我的放松收藏库！')
    }
    setFavorites(updated)
    localStorage.setItem('musicFavorites_' + userInfo.username, JSON.stringify(updated))
  }

  // === 4-7-8 Breathing Loop ===
  useEffect(() => {
    if (breathPhase === 'idle') {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current)
      return
    }

    let limit = 4
    if (breathPhase === 'hold') limit = 7
    if (breathPhase === 'exhale') limit = 8

    setBreathCount(limit)
    
    breathTimerRef.current = setInterval(() => {
      limit--
      setBreathCount(limit)
      
      if (limit === 0) {
        clearInterval(breathTimerRef.current)
        setBreathPhase(prev => {
          if (prev === 'inhale') return 'hold'
          if (prev === 'hold') return 'exhale'
          return 'inhale' // loop
        })
      }
    }, 1000)

    return () => clearInterval(breathTimerRef.current)
  }, [breathPhase])

  // Smart suggestions from latest check-in
  const getSmartMusicMatch = () => {
    try {
      const savedDiary = localStorage.getItem('moodCheckInHistory')
      if (savedDiary) {
        const history = JSON.parse(savedDiary)
        if (history.length > 0) {
          const lastMood = history[0].mood
          if (lastMood === '郁闷') return { tag: '委屈', title: '🌸 温柔疗愈禅乐', reason: '针对您近期的抑郁低落情绪，AI推荐温柔治愈曲单抚平内心。' }
          if (lastMood === '烦躁') return { tag: '烦躁', title: '🌧️ 林间细雨', reason: '针对您的内心浮躁状态，AI推荐低频白噪音自然雨声静心。' }
          if (lastMood === '疲惫') return { tag: '疲惫', title: '💤 超低音助眠电波', reason: '针对您的肌肉学业疲惫，AI推荐助眠波辅助身体舒缓。' }
        }
      }
    } catch {}
    return { tag: '焦虑', title: '📝 专注阿尔法脑波', reason: '检测到临近考试，AI为您自动引流至专注阿尔法脑波音频，极速沉浸。' }
  }
  const smartRecommendation = getSmartMusicMatch()

  // Generator AI Offline relief schemes
  const handleGenerateOfflineScheme = () => {
    const lastRecord = relaxLogs[0]
    let msg = ''
    if (lastRecord && lastRecord.diff >= 3) {
      msg = `### 🌟 专属您的线下 5 分钟减压疗愈法
根据您上次听【${lastRecord.track}】减压 ${lastRecord.diff} 分的数据反馈，AI已为您匹配以下线下方案：
1. **课间 5 分钟静息**：戴上耳机播放林间细雨，闭上眼睛，双手自然放在大腿上。
2. **渐进式沉底呼吸**：配合 4-7-8 呼吸节奏，吸气时腹部鼓起，呼气时将疲劳感吐出。
3. **身体冷热抚摩**：快速摩擦双手掌心发热，随后按压在双眼上，温热眼周，缓解久坐眼部酸涩。`
    } else {
      msg = `### 💤 专属睡前 10 分钟轻音乐助眠方案
1. **睡前阻断外界**：将手机调成免打扰模式，放置于距离头部 1.5 米之外。
2. **被动音效引导**：开启 15 分钟定时，选择【超低音助眠电波】。
3. **脚趾握拳紧缩放松**：将所有脚趾用力蜷缩紧绷 5 秒，随后彻底松开。从下至上感受重力带来的平躺安全感。`
    }
    setAiScheme(msg)
  }

  // Save Reminder Config
  const handleReminderToggle = (checked) => {
    setReminderActive(checked)
    localStorage.setItem('musicReminderActive_' + userInfo.username, String(checked))
    message.success(checked ? '每日定时放松提醒已开启！' : '提醒已关闭')
  }

  // Draw logs chart
  useEffect(() => {
    if (chartContainerRef.current) {
      const myChart = echarts.init(chartContainerRef.current)
      
      const plotData = [...relaxLogs].slice(0, 7).reverse()
      const xData = plotData.map(l => l.time.split(' ')[1] || l.time)
      const beforeData = plotData.map(l => l.before)
      const afterData = plotData.map(l => l.after)

      const option = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        legend: { data: ['听前压力', '听后压力'], textStyle: { color: '#8499b4' } },
        grid: { top: '20%', left: '5%', right: '5%', bottom: '15%', containLabel: true },
        xAxis: {
          type: 'category',
          data: xData.length > 0 ? xData : ['无记录'],
          axisLine: { lineStyle: { color: 'rgba(0, 242, 254, 0.2)' } },
          axisLabel: { color: '#8499b4' }
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 10,
          splitLine: { lineStyle: { color: 'rgba(0, 242, 254, 0.05)' } },
          axisLabel: { color: '#8499b4' }
        },
        series: [
          {
            name: '听前压力',
            type: 'line',
            data: beforeData.length > 0 ? beforeData : [5],
            smooth: true,
            lineStyle: { color: '#ff4d4f', width: 2 },
            itemStyle: { color: '#ff4d4f' }
          },
          {
            name: '听后压力',
            type: 'line',
            data: afterData.length > 0 ? afterData : [2],
            smooth: true,
            lineStyle: { color: '#05f3ad', width: 2 },
            itemStyle: { color: '#05f3ad' }
          }
        ]
      }
      myChart.setOption(option)

      const resize = () => myChart.resize()
      window.addEventListener('resize', resize)
      return () => {
        window.removeEventListener('resize', resize)
        myChart.dispose()
      }
    }
  }, [relaxLogs])

  useEffect(() => {
    return () => {
      stopSynthesizer()
    }
  }, [])

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header-container">
        <div>
          <div className="page-title">心灵音乐屋</div>
          <div className="page-subtitle">借助 Web Audio 原生合成引擎，带您进入全息疗愈声学空间，扫除脑部高压疲劳</div>
        </div>
      </div>

      <Row gutter={[20, 20]}>
        {/* Playback & Sleep Timers */}
        <Col xs={24} md={16}>
          {/* Smart suggestion header */}
          <Alert
            message="🧠 AI 智能声学调节推荐"
            description={
              <div style={{ color: 'var(--cyber-text-muted)', fontSize: 12, marginTop: 4 }}>
                {smartRecommendation.reason} 推荐使用：<strong>{smartRecommendation.title}</strong>
              </div>
            }
            type="info"
            showIcon
            icon={<BulbOutlined style={{ color: 'var(--cyber-primary)' }} />}
            style={{ marginBottom: 20, background: 'rgba(0, 242, 254, 0.04)', border: '1px solid rgba(0, 242, 254, 0.2)' }}
          />

          <Card
            className="cyber-card"
            title={<span><CustomerServiceOutlined /> 心灵声学分类曲库</span>}
            extra={!isMobile ? timerControls : null}
          >
            {isMobile && (
              <div style={{
                marginBottom: 16,
                padding: '8px 12px',
                background: 'rgba(167, 139, 250, 0.05)',
                border: '1px solid rgba(167, 139, 250, 0.15)',
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'center'
              }}>
                {timerControls}
              </div>
            )}
            {/* Playlists grouped by category */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <Divider orientation="left" style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'var(--cyber-primary)' }}>减压安静类 (核心白噪 & 纯轻音)</Divider>
                <Row gutter={[12, 12]}>
                  {tracks.filter(t => t.category === 'relax').map((track) => {
                    const isPlaying = playingTrack?.id === track.id
                    const isFav = favorites.includes(track.id)
                    return (
                      <Col xs={24} sm={12} key={track.id}>
                        <div style={{
                          padding: 12,
                          background: isPlaying ? 'rgba(0,242,254,0.05)' : 'rgba(255,255,255,0.01)',
                          border: isPlaying ? '1px solid var(--cyber-primary)' : '1px solid rgba(255,255,255,0.06)',
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div style={{ flex: 1, marginRight: 10 }}>
                            <div style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{track.title}</div>
                            <div style={{ color: 'var(--cyber-text-muted)', fontSize: 10, marginTop: 4 }}>{track.desc}</div>
                          </div>
                          <Space>
                            <Button 
                              type="text" 
                              icon={isFav ? <StarFilled style={{ color: '#ffb800' }} /> : <StarOutlined style={{ color: '#8499b4' }} />} 
                              onClick={() => handleToggleFavorite(track.id)}
                            />
                            <Button
                              shape="circle"
                              icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                              onClick={() => handleTogglePlay(track)}
                              className={isPlaying ? "cyber-btn" : ""}
                              style={{ borderColor: isPlaying ? 'var(--cyber-primary)' : 'rgba(255,255,255,0.15)', color: isPlaying ? 'var(--cyber-primary)' : '#fff' }}
                            />
                          </Space>
                        </div>
                      </Col>
                    )
                  })}
                </Row>
              </div>

              <div>
                <Divider orientation="left" style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'var(--cyber-secondary)' }}>情绪针对性修复 (考前、焦虑、失眠脑电波)</Divider>
                <Row gutter={[12, 12]}>
                  {tracks.filter(t => t.category === 'heal').map((track) => {
                    const isPlaying = playingTrack?.id === track.id
                    const isFav = favorites.includes(track.id)
                    return (
                      <Col xs={24} sm={12} key={track.id}>
                        <div style={{
                          padding: 12,
                          background: isPlaying ? 'rgba(139,92,246,0.05)' : 'rgba(255,255,255,0.01)',
                          border: isPlaying ? '1px solid var(--cyber-secondary)' : '1px solid rgba(255,255,255,0.06)',
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div style={{ flex: 1, marginRight: 10 }}>
                            <div style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{track.title}</div>
                            <div style={{ color: 'var(--cyber-text-muted)', fontSize: 10, marginTop: 4 }}>{track.desc}</div>
                          </div>
                          <Space>
                            <Button 
                              type="text" 
                              icon={isFav ? <StarFilled style={{ color: '#ffb800' }} /> : <StarOutlined style={{ color: '#8499b4' }} />} 
                              onClick={() => handleToggleFavorite(track.id)}
                            />
                            <Button
                              shape="circle"
                              icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                              onClick={() => handleTogglePlay(track)}
                              className={isPlaying ? "cyber-btn-purple" : ""}
                              style={{ borderColor: isPlaying ? 'var(--cyber-secondary)' : 'rgba(255,255,255,0.15)', color: isPlaying ? 'var(--cyber-secondary)' : '#fff' }}
                            />
                          </Space>
                        </div>
                      </Col>
                    )
                  })}
                </Row>
              </div>

              <div>
                <Divider orientation="left" style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#05f3ad' }}>短时放松微课程 (3分钟、5分钟肩颈呼吸课)</Divider>
                <Row gutter={[12, 12]}>
                  {tracks.filter(t => t.category === 'short').map((track) => {
                    const isPlaying = playingTrack?.id === track.id
                    const isFav = favorites.includes(track.id)
                    return (
                      <Col xs={24} sm={12} key={track.id}>
                        <div style={{
                          padding: 12,
                          background: isPlaying ? 'rgba(5,243,173,0.05)' : 'rgba(255,255,255,0.01)',
                          border: isPlaying ? '1px solid #05f3ad' : '1px solid rgba(255,255,255,0.06)',
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div style={{ flex: 1, marginRight: 10 }}>
                            <div style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{track.title}</div>
                            <div style={{ color: 'var(--cyber-text-muted)', fontSize: 10, marginTop: 4 }}>{track.desc}</div>
                          </div>
                          <Space>
                            <Button 
                              type="text" 
                              icon={isFav ? <StarFilled style={{ color: '#ffb800' }} /> : <StarOutlined style={{ color: '#8499b4' }} />} 
                              onClick={() => handleToggleFavorite(track.id)}
                            />
                            <Button
                              shape="circle"
                              icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                              onClick={() => handleTogglePlay(track)}
                              style={{ borderColor: isPlaying ? '#05f3ad' : 'rgba(255,255,255,0.15)', color: isPlaying ? '#05f3ad' : '#fff', background: isPlaying ? 'rgba(5,243,173,0.1)' : 'transparent' }}
                            />
                          </Space>
                        </div>
                      </Col>
                    )
                  })}
                </Row>
              </div>
            </div>
          </Card>
        </Col>

        {/* Breathing guide, reminders & personal library */}
        <Col xs={24} md={8}>
          {/* Mindfulness 478 Breathing Guide */}
          <Card className="cyber-card" style={{ marginBottom: 20 }} title={<span><HeartOutlined style={{ color: 'var(--cyber-primary)' }} /> 4-7-8 呼吸法可视化</span>}>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,242,254,0.3) 0%, rgba(139,92,246,0.1) 100%)',
                border: '2px solid var(--cyber-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                transform: breathPhase === 'inhale' ? 'scale(1.4)' : breathPhase === 'hold' ? 'scale(1.4)' : 'scale(1.0)',
                transition: breathPhase === 'hold' ? 'none' : 'transform 4s linear'
              }}>
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{breathCount}s</span>
              </div>
              <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: 12 }}>
                {breathPhase === 'inhale' ? '吸气 (吸足腹部)...' : breathPhase === 'hold' ? '憋气 (静止放松)...' : breathPhase === 'exhale' ? '呼气 (排出负累)...' : '点击下方开始吸气'}
              </div>
              <Space>
                {breathPhase === 'idle' ? (
                  <Button size="small" type="primary" className="cyber-btn" onClick={() => setBreathPhase('inhale')}>开始正念呼吸</Button>
                ) : (
                  <Button size="small" danger onClick={() => setBreathPhase('idle')}>关闭引导</Button>
                )}
              </Space>
            </div>
          </Card>

          {/* Time Reminder Setting */}
          <Card className="cyber-card" style={{ marginBottom: 20 }} title={<span><BellOutlined /> 每日音乐放松定制提醒</span>}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: '#fff', fontSize: 13 }}>开启定时放松推送</span>
              <Switch checked={reminderActive} onChange={handleReminderToggle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--cyber-text-muted)', fontSize: 12 }}>提醒时间设定</span>
              <TimePicker value={reminderTime} format="HH:mm" onChange={setReminderTime} size="small" style={{ width: 120 }} />
            </div>
          </Card>

          {/* Offline Scheme generation */}
          <Card className="cyber-card" title={<span><BulbOutlined style={{ color: '#05f3ad' }} /> 线下放松方案辅助器</span>}>
            <div style={{ marginBottom: 14, color: 'var(--cyber-text-muted)', fontSize: 12 }}>
              AI 结合本页面放松情况，为您制定一份专属的线下课后放松方案。
            </div>
            <Button size="small" type="primary" className="cyber-btn" onClick={handleGenerateOfflineScheme}>
              生成专属线下疗愈方案
            </Button>
            {aiScheme && (
              <div style={{
                marginTop: 14,
                padding: '10px 14px',
                background: 'rgba(5, 243, 173, 0.04)',
                border: '1px dashed rgba(5, 243, 173, 0.25)',
                borderRadius: 6,
                fontSize: 11,
                color: '#fff',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
                textAlign: 'left'
              }}>
                {aiScheme}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Pre-post evaluation logs & Chart */}
      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        <Col xs={24} md={12}>
          <Card className="cyber-card" style={{ height: '100%' }} title={<span><BarChartOutlined /> 情绪 - 音乐放松联动分析曲线</span>}>
            <div ref={chartContainerRef} style={{ height: 320, width: '100%' }}></div>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card className="cyber-card" style={{ height: '100%' }} title={<span><HistoryOutlined /> 个人减压历程清单</span>}>
            <Table
              dataSource={relaxLogs}
              scroll={{ x: 'max-content' }}
              columns={[
                { title: '体验时间', dataIndex: 'time', key: 'time' },
                { title: '所听曲目', dataIndex: 'track', key: 'track' },
                {
                  title: '听前压力',
                  dataIndex: 'before',
                  key: 'before',
                  render: (v) => <span style={{ color: '#ff4d4f' }}>{v} 级</span>
                },
                {
                  title: '听后压力',
                  dataIndex: 'after',
                  key: 'after',
                  render: (v) => <span style={{ color: '#05f3ad' }}>{v} 级</span>
                },
                {
                  title: '下降幅度',
                  dataIndex: 'diff',
                  key: 'diff',
                  render: (v) => <Tag color="success">↓ {v} 分</Tag>
                }
              ]}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
              locale={{ emptyText: '暂无听歌反馈历史数据' }}
            />
          </Card>
        </Col>
      </Row>

        {/* Post-play mood rating feedback modal */}
        <Modal
          title="🎧 音乐疗愈放松效果评估"
          open={ratingModalVisible}
          onCancel={() => setRatingModalVisible(false)}
          footer={[
            <Button key="submit" type="primary" className="cyber-btn" onClick={handlePostRatingSubmit}>
              提交情绪评估并暂停
            </Button>
          ]}
          width={340}
        >
          <div style={{ padding: '10px 0' }}>
            <div style={{ marginBottom: 16 }}>听完这首曲目，您现在的心理压力/焦虑程度感受是多少（1~10）？</div>
            <Slider min={1} max={10} value={postScore} onChange={setPostScore} />
            <div style={{ color: '#05f3ad', fontSize: 11, marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span>1 代表彻底平静</span>
              <span>10 代表焦虑未变</span>
            </div>
          </div>
        </Modal>
      </div>
    )
}
