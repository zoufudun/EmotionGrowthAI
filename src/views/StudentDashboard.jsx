import React, { useState, useEffect, useContext, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Input,
  Button,
  Row,
  Col,
  Space,
  Tag,
  Progress,
  Badge,
  Avatar,
  Timeline,
  message,
  Tabs,
  Card,
  Modal,
  List,
  Empty,
  Rate,
  Slider
} from 'antd'
import {
  SmileOutlined,
  SendOutlined,
  DeleteOutlined,
  TrophyOutlined,
  LineChartOutlined,
  RobotOutlined,
  UserOutlined,
  AudioOutlined,
  PictureOutlined,
  PlusOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  HeartOutlined,
  HistoryOutlined
} from '@ant-design/icons'
import { UserContext } from '../App.jsx'
import * as echarts from 'echarts'

const { TextArea } = Input

export default function StudentDashboard() {
  const {
    userInfo,
    assignedTasks,
    addLog
  } = useContext(UserContext)

  const [activeTabKey, setActiveTabKey] = useState('trends')

  // === 1. Moods & Check-in States ===
  const [selectedMood, setSelectedMood] = useState(null)
  const [checkInDiary, setCheckInDiary] = useState('')
  const [selectedGoals, setSelectedGoals] = useState([])
  const [customGoalInput, setCustomGoalInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('正在上传情绪能量光谱...')
  const [currentFeedback, setCurrentFeedback] = useState(null)

  // Expanded Check-in Parameters
  const [moodIntensity, setMoodIntensity] = useState(5)
  const [triggerReason, setTriggerReason] = useState([])
  const [sleepQuality, setSleepQuality] = useState(4)
  const [studyStress, setStudyStress] = useState(5)

  const triggerOptions = ['学业压力', '人际关系', '家庭环境', '身体状态', '时间管理', '其他']

  const moods = [
    { name: '优秀', emoji: '🌟', color: '#05f3ad', rgb: '5, 243, 173', desc: '精力充沛，状态拉满' },
    { name: '愉快', emoji: '😊', color: '#00f2fe', rgb: '0, 242, 254', desc: '轻松自在，心情愉悦' },
    { name: '平静', emoji: '😐', color: '#8b5cf6', rgb: '139, 92, 246', desc: '无波无澜，情绪稳定' },
    { name: '疲惫', emoji: '🥱', color: '#ffb800', rgb: '255, 184, 0', desc: '学业繁重，身体疲累' },
    { name: '烦躁', emoji: '⚡', color: '#f59e0b', rgb: '245, 158, 11', desc: '内心浮躁，容易动怒' },
    { name: '郁闷', emoji: '😢', color: '#ff4d4f', rgb: '255, 77, 79', desc: '有些沮丧，情绪低落' }
  ]

  const diaryQuickTags = [
    { label: '😊 快乐小事', text: '今天考试考得不错，得到了老师的夸奖，感觉自己的付出有了回报！' },
    { label: '😔 遇到困扰', text: '今天和朋友因为一些琐事产生了误会，心情有点沉闷。' },
    { label: '💪 付出努力', text: '今天在学业上非常专心，把积攒了很久的错题都整理完了！' },
    { label: '📝 值得记录', text: '今天放学路上看到了美丽的夕阳，还给路边的小猫喂了食。' }
  ]

  const predefinedGoals = ['认真听讲', '主动运动', '帮助同学', '整理书桌', '整理错题', '复习总结', '学习新知识']

  // === 2. Check-in History States (per-user isolated) ===
  const moodHistoryKey = 'moodCheckInHistory_' + (userInfo.id || 'default')

  const getDefaultMoodHistory = () => {
    // Only seed default data for the built-in student account (id='1')
    if (userInfo.id === '1') {
      return [
        {
          id: 'mock-1',
          time: '2026-06-24 18:30',
          mood: '愉快',
          emoji: '😊',
          color: '#00f2fe',
          intensity: 6,
          trigger: ['人际关系'],
          sleep: 4,
          stress: 4,
          diary: '今天在数学课上回答出了老师提问的一道思考题，得到了全班同学掌声，感觉非常开心！',
          goals: ['认真听讲', '整理错题'],
          aiFeedback: '看到你今天状态满满，感到格外优秀！你提到上课解出思考题并获得掌声，这不仅代表你的解题能力，更是专注听讲的体现。数学学习需要这种突破难题的成就感，非常棒！明天继续保持【认真听讲】和【整理错题】的目标，把今天的思考方式总结进错题本，一定会有更大突破。加油！',
          tags: ['情绪记录', '正向成长']
        },
        {
          id: 'mock-2',
          time: '2026-06-25 08:15',
          mood: '疲惫',
          emoji: '🥱',
          color: '#ffb800',
          intensity: 7,
          trigger: ['学业压力', '时间管理'],
          sleep: 2,
          stress: 8,
          diary: '最近临近期末考试，功课比较繁重，晚上睡眠也有点不足，感觉白天很没精神。',
          goals: ['主动运动', '复习总结'],
          aiFeedback: '学业功课繁重时，感到【疲惫】是身体在提醒你需要进行适当的休息与修整。建议你今晚早点睡，明天小目标里的【主动运动】非常重要，跑跑步或做做拉伸能有效激活你的身体能量，舒缓压力。学习就像是一场马拉松，阶段性的调整比一味拼命更有远见。',
          tags: ['情绪记录', '高压感知']
        }
      ]
    }
    return []
  }

  const [checkInHistory, setCheckInHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(moodHistoryKey)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.error(e)
    }
    return getDefaultMoodHistory()
  })

  useEffect(() => {
    localStorage.setItem(moodHistoryKey, JSON.stringify(checkInHistory))
  }, [checkInHistory, moodHistoryKey])

  // Load diary draft on mount
  useEffect(() => {
    try {
      const diaryDraft = localStorage.getItem('diaryDraft_' + userInfo.username)
      if (diaryDraft) {
        const parsed = JSON.parse(diaryDraft)
        if (parsed.selectedMood) setSelectedMood(parsed.selectedMood)
        if (parsed.checkInDiary) setCheckInDiary(parsed.checkInDiary)
        if (parsed.selectedGoals) setSelectedGoals(parsed.selectedGoals)
        if (parsed.moodIntensity) setMoodIntensity(parsed.moodIntensity)
        if (parsed.triggerReason) setTriggerReason(parsed.triggerReason)
        if (parsed.sleepQuality) setSleepQuality(parsed.sleepQuality)
        if (parsed.studyStress) setStudyStress(parsed.studyStress)
        message.info('已为您自动载入上次保存的日记打卡草稿。')
      }
    } catch (e) {
      console.error(e)
    }
  }, [userInfo])

  // === 3. Upgraded Growth Diary voice and image states ===
  const [voiceModalVisible, setVoiceModalVisible] = useState(false)
  const [recording, setRecording] = useState(false)
  const [voiceTimer, setVoiceTimer] = useState(0)
  const voiceIntervalRef = useRef(null)
  
  const [selectedImage, setSelectedImage] = useState(null)
  const [imageModalVisible, setImageModalVisible] = useState(false)

  const mockImages = [
    { key: '1', title: '🌇 灿烂晚照', gradient: 'linear-gradient(135deg, #f59e0b 0%, #ff007f 100%)' },
    { key: '2', title: '🌱 坚毅新生', gradient: 'linear-gradient(135deg, #05f3ad 0%, #008080 100%)' },
    { key: '3', title: '☕ 暖心宁静', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #00f2fe 100%)' }
  ]

  const handleStartVoiceRecord = () => {
    setVoiceModalVisible(true)
    setRecording(true)
    setVoiceTimer(0)
    voiceIntervalRef.current = setInterval(() => {
      setVoiceTimer(prev => prev + 1)
    }, 1000)
  }

  const handleStopVoiceRecord = () => {
    setRecording(false)
    if (voiceIntervalRef.current) clearInterval(voiceIntervalRef.current)
    
    const transcription = "今天感觉有些学业挑战，压力有点大，不过好在及时调整了呼吸，感觉情绪慢慢平和下来了，明天打算加油！"
    setCheckInDiary(prev => (prev ? prev + '\n' + transcription : transcription))
    setVoiceModalVisible(false)
    message.success('语音录入识别成功！文字已追加到今日日记。')
  }

  const handleCancelVoiceRecord = () => {
    setRecording(false)
    setVoiceModalVisible(false)
    if (voiceIntervalRef.current) clearInterval(voiceIntervalRef.current)
  }

  const handleSelectMockImage = (url) => {
    setSelectedImage(url)
    setImageModalVisible(false)
    message.success('已添加情绪色块配图！')
  }

  const handleSaveDiaryDraft = () => {
    try {
      const draft = {
        selectedMood,
        checkInDiary,
        selectedGoals,
        moodIntensity,
        triggerReason,
        sleepQuality,
        studyStress
      }
      localStorage.setItem('diaryDraft_' + userInfo.username, JSON.stringify(draft))
      message.success('今日打卡内容已存为草稿！')
    } catch (e) {
      console.error(e)
      message.error('草稿保存失败')
    }
  }

  const handleClearDiaryDraft = () => {
    localStorage.removeItem('diaryDraft_' + userInfo.username)
    setSelectedMood(null)
    setCheckInDiary('')
    setSelectedGoals([])
    setSelectedImage(null)
    setMoodIntensity(5)
    setTriggerReason([])
    setSleepQuality(4)
    setStudyStress(5)
    message.info('打卡草稿已清空。')
  }

  const handleToggleTrigger = (tag) => {
    if (triggerReason.includes(tag)) {
      setTriggerReason(triggerReason.filter(t => t !== tag))
    } else {
      setTriggerReason([...triggerReason, tag])
    }
  }

  // === 4. Badges unlocked state calculator ===
  const getAssessmentRecordsCount = () => {
    try {
      const saved = localStorage.getItem('assessmentRecords')
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed.filter(r => r.studentName === userInfo.nickname).length
      }
    } catch {}
    return 0
  }

  const checkHighScoreBadge = () => {
    try {
      const saved = localStorage.getItem('assessmentRecords')
      if (saved) {
        const parsed = JSON.parse(saved)
        const myRecords = parsed.filter(r => r.studentName === userInfo.nickname)
        if (myRecords.length > 0) {
          return myRecords[0].score >= 75
        }
      }
    } catch {}
    return false
  }

  const checkBreathingBadge = () => {
    try {
      const saved = localStorage.getItem('reflectiveLogs_' + (userInfo.id || 'default'))
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.length > 0) return true
      }
    } catch {}
    return checkInHistory.length > 0
  }

  const checkGoalsBadge = () => {
    try {
      const saved = localStorage.getItem('assignedTasks')
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed.some(t => t.studentName === userInfo.nickname && t.status === '已完成')
      }
    } catch {}
    return false
  }

  // Stats calculation
  const positiveDays = checkInHistory.filter(h => h.mood === '优秀' || h.mood === '愉快' || h.mood === '平静').length
  const selfAdjustRate = checkInHistory.length > 0 ? Math.round((checkInHistory.filter(h => h.mood === '优秀' || h.mood === '愉快' || h.mood === '平静').length / checkInHistory.length) * 100) : 0
  
  const getGoalAchieveRate = () => {
    try {
      const saved = localStorage.getItem('assignedTasks')
      if (saved) {
        const parsed = JSON.parse(saved)
        const myTasks = parsed.filter(t => t.studentName === userInfo.nickname)
        if (myTasks.length > 0) {
          return Math.round((myTasks.filter(t => t.status === '已完成').length / myTasks.length) * 100)
        }
      }
    } catch {}
    return 0
  }
  const goalAchieveRate = getGoalAchieveRate()

  // Cool loader animation sequence
  useEffect(() => {
    let interval
    if (aiLoading) {
      const texts = [
        '正在上传情绪能量光谱...',
        'AI 正在倾听你的成长故事...',
        '正在结合历史记录比对变化规律...',
        '正在为你生成行动疏导建议...',
        '守护能量即将充满...'
      ]
      let step = 0
      interval = setInterval(() => {
        setLoadingText(texts[step % texts.length])
        step++
      }, 500)
    }
    return () => clearInterval(interval)
  }, [aiLoading])

  const handleToggleGoal = (goal) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goal))
    } else {
      setSelectedGoals([...selectedGoals, goal])
    }
  }

  const handleAddCustomGoal = () => {
    if (customGoalInput.trim() && !selectedGoals.includes(customGoalInput.trim())) {
      setSelectedGoals([...selectedGoals, customGoalInput.trim()])
      setCustomGoalInput('')
    }
  }

  // AI Feedback engine settings fallback
  const getAISystemSettings = () => {
    try {
      const config = localStorage.getItem('aiModelConfig')
      if (config) return JSON.parse(config)
    } catch {}
    return {
      provider: 'DeepSeek-V3',
      temperature: 0.7,
      maxTokens: 800,
      systemPrompt: '你是一位专业的学校心理成长顾问和情绪解惑大师。'
    }
  }

  const generateAIFeedback = (moodName, diary, goals) => {
    const settings = getAISystemSettings()
    
    // 1. Mood reflection
    let moodPart = ''
    switch (moodName) {
      case '优秀':
        moodPart = '看到你今天状态满满，感到格外优秀！这种积极蓬勃的心态像星辰一样闪耀，非常棒。要好好珍惜这种充沛的能量哦！'
        break
      case '愉快':
        moodPart = '你今天的心情是愉快的呢，真是太好啦！轻松愉快的情绪不仅能让学业事半功倍，也会感染身边的每一个人。'
        break
      case '平静':
        moodPart = '今天情绪无波无澜、安稳踏实，这也是一种宝贵的心理弹性状态。平静能让我们更理智地观察自我与世界。'
        break
      case '疲惫':
        moodPart = '感到疲惫时，请允许自己停下脚步。这并不是退缩，而是你的身心在拉警报，提醒你该去充充电、洗个热水澡、早点休息了。'
        break
      case '烦躁':
        moodPart = '有些浮躁和容易动怒是正常的，这常常是因为积压了太多的外界刺激。建议你先闭眼做3个深呼吸，阻断这种紧绷感。'
        break
      case '郁闷':
        moodPart = '今天有些低落和郁闷，给你一个温暖的拥抱。别担心，成长本就起起落落，允许自己有沮丧的时候，黑暗过去就是黎明。'
        break
      default:
        moodPart = '收到你今天的心情记录。每一个微小的情绪都值得被温柔对待。'
    }

    // 2. Diary analysis
    let diaryPart = ''
    const text = diary.toLowerCase()
    if (!diary.trim()) {
      diaryPart = '今天过得充实而平和，虽然没有写下具体细节，但默默走过的每一步，都是你成长的坚实足迹。'
    } else if (text.includes('考') || text.includes('学') || text.includes('分') || text.includes('题') || text.includes('课')) {
      diaryPart = '对于你提到学业或考试相关的事情，我想说：学习确实需要日积月累的耐力。每一次解决难题，都是大脑神经元在建立更强的连接。不要因一时的起伏而否定自己的努力，你走的路每一步都算数。'
    } else if (text.includes('吵') || text.includes('人际') || text.includes('朋友') || text.includes('同桌') || text.includes('老师') || text.includes('爸') || text.includes('妈')) {
      diaryPart = '看到你提到人际关系或沟通的细节，与人相处就像是照镜子，有欢笑也偶有摩擦。面对意见分歧，保持温和与坦诚是化解冰雪的良药。多倾听，也多给自己和对方一点宽容。'
    } else if (text.includes('玩') || text.includes('游戏') || text.includes('手机') || text.includes('拖延')) {
      diaryPart = '提到电子产品或时间规划，这其实是现代人共同的挑战。不需要对自己过于苛刻，尝试把大目标拆解开，先专注十分钟，你就会发现进入状态并没有那么难。'
    } else if (text.includes('累') || text.includes('睡') || text.includes('痛') || text.includes('病')) {
      diaryPart = '看到你提到身体疲劳或睡眠问题，健康始终是成长的基石。今晚早点合上书本，喝一杯温牛奶，听听轻音乐，给大脑做个深层放松吧。'
    } else {
      diaryPart = `你记录道：“${diary}”。倾诉是一剂心灵的良药，主动把这些写下来，代表着你正在以成熟的姿态面对并觉察自我，这本身就是非常了不起的成长。`
    }

    // 3. Goal support
    let goalPart = ''
    if (goals && goals.length > 0) {
      const goalListStr = goals.join('、')
      goalPart = `明天你的小目标是【${goalListStr}】。这是一个非常清晰且积极的行动指向！目标不在于有多宏大，而在于每天微小的坚持。`
      if (goals.includes('主动运动')) {
        goalPart += ' 特别是运动，它能激活多巴胺，是绝佳的天然解压器，祝你明天跑得开心！'
      }
      if (goals.includes('整理错题') || goals.includes('复习总结')) {
        goalPart += ' 整理错题 and 复习总结能让你建立起系统的知识网，温故而知新，非常棒的学习态度。'
      }
      goalPart += ' 期待你明天完成打卡，迈出坚实的一步！'
    } else {
      goalPart = '明天你没有设定具体的小目标。没关系，有时候让自己完全放松、无负担地过一天，也是一种很棒的选择。祝你明天过得轻松自在！'
    }

    return `[模型引擎: ${settings.provider}]\n${moodPart}\n\n${diaryPart}\n\n${goalPart}`
  }

  const handleSubmitCheckIn = () => {
    if (!selectedMood) {
      message.warning('请先选择您今天的心情颜色')
      return
    }

    setAiLoading(true)

    setTimeout(() => {
      const selectedMoodObj = moods.find(m => m.name === selectedMood)
      
      // Analyze keywords dynamically
      let tags = ['情绪记录']
      const text = checkInDiary.trim()
      if (text.includes('学习') || text.includes('数学') || text.includes('物理') || text.includes('几何') || text.includes('考试') || text.includes('做题') || text.includes('学业')) {
        tags.push('学业任务')
      }
      if (text.includes('压力') || text.includes('焦虑') || text.includes('累') || text.includes('烦') || text.includes('难过')) {
        tags.push('高压感知')
      }
      if (text.includes('运动') || text.includes('跑') || text.includes('散步') || text.includes('听歌') || text.includes('音乐')) {
        tags.push('积极调节')
      }
      if (text.includes('开心') || text.includes('棒') || text.includes('好') || text.includes('温暖') || text.includes('感谢') || text.includes('朋友')) {
        tags.push('正向成长')
      }

      const feedbackText = generateAIFeedback(selectedMood, checkInDiary, selectedGoals)

      const pad = (n) => String(n).padStart(2, '0')
      const now = new Date()
      const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`

      const newRecord = {
        id: 'record-' + Date.now(),
        time: timeStr,
        mood: selectedMood,
        emoji: selectedMoodObj.emoji,
        color: selectedMoodObj.color,
        intensity: moodIntensity,
        trigger: [...triggerReason],
        sleep: sleepQuality,
        stress: studyStress,
        diary: checkInDiary.trim() || '今天很平静，没有记录特别的事。',
        goals: [...selectedGoals],
        aiFeedback: feedbackText,
        tags: tags,
        image: selectedImage
      }

      setCheckInHistory([newRecord, ...checkInHistory])
      setCurrentFeedback(newRecord)
      setAiLoading(false)
      setSelectedImage(null)
      setMoodIntensity(5)
      setTriggerReason([])
      setSleepQuality(4)
      setStudyStress(5)
      localStorage.removeItem('diaryDraft_' + userInfo.username)

      addLog(
        'operation',
        `${userInfo.nickname} (student)`,
        `完成了今日情绪成长打卡（心情代表色: ${selectedMood}）`
      )

      message.success('今日打卡提交成功，AI 已为您生成专属成长反馈与训练建议！')
    }, 2000)
  }

  const handleDeleteHistory = (id) => {
    setCheckInHistory(checkInHistory.filter(item => item.id !== id))
    message.success('已删除该条打卡历史记录')
  }

  const handleResetCheckInForm = () => {
    setSelectedMood(null)
    setCheckInDiary('')
    setSelectedGoals([])
    setCurrentFeedback(null)
    setSelectedImage(null)
    setMoodIntensity(5)
    setTriggerReason([])
    setSleepQuality(4)
    setStudyStress(5)
  }

  // === 5. AI Treehole Chatbot State ===
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: '你好，我是你的AI心理成长伙伴。不论你有什么学业困扰、小情绪、或开心的小事，随时可以写在这个树洞里。我会一直倾听你的声音。',
      time: '系统连接成功'
    }
  ])
  const [aiTyping, setAiTyping] = useState(false)

  const handleSendChat = () => {
    if (!chatInput.trim()) return

    const userMsg = {
      sender: 'user',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setChatMessages(prev => [...prev, userMsg])
    const prompt = chatInput.trim()
    setChatInput('')
    setAiTyping(true)

    // Simulate AI response logic
    setTimeout(() => {
      let aiText = '我收到你的分享了。成长是一个充满波澜的探索过程，你能主动把感受表达出来，已经是一次非常棒的尝试。我会陪着你的。'

      if (prompt.includes('考试') || prompt.includes('学习') || prompt.includes('作业') || prompt.includes('压力')) {
        aiText = '听到你在学习上感到压力，这其实是很多学生都会经历的阶段。试着把大任务拆解为细小的步骤，每天做一点点。更重要的是，在左侧菜单的【情绪疏导中心】或【心灵音乐屋】里听听白噪音或疗愈曲目，给大脑充充电哦。'
      } else if (prompt.includes('难过') || prompt.includes('抑郁') || prompt.includes('不开心') || prompt.includes('哭')) {
        aiText = '感到难过的时候，请允许自己停下来休息一下。抱一抱那个紧绷的自己。建议去我们的【心灵音乐屋】听听【温柔疗愈禅乐】，闭上眼放松5分钟，会舒服很多。'
      } else if (prompt.includes('人际') || prompt.includes('吵架') || prompt.includes('朋友') || prompt.includes('同桌') || prompt.includes('阻碍')) {
        aiText = '同伴交往是成长中的重要维度，有些许摩擦或孤独感是很正常的。保持温和与坦诚，专注于自己。加油！'
      }

      const aiMsg = {
        sender: 'ai',
        text: aiText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setChatMessages(prev => [...prev, aiMsg])
      setAiTyping(false)

      addLog(
        'operation',
        `${userInfo.nickname} (student)`,
        `与 AI 情绪守护树洞进行了心理对话交流`
      )
    }, 1200)
  }

  const handleSendQuickMsg = (queryText) => {
    const userMsg = {
      sender: 'user',
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setChatMessages(prev => [...prev, userMsg])
    setAiTyping(true)

    setTimeout(() => {
      let aiText = '我收到你的分享了。成长是一个充满波澜的探索过程，你能主动把感受表达出来，已经是一次非常棒的尝试。我会陪着你的。'

      if (queryText.includes('减压') || queryText.includes('压力')) {
        aiText = '学习像跑马拉松，合理休息比盲目加速更重要。今天试着去「心灵音乐屋」听听白噪音或体验呼吸练习，也可以为自己定一个「散步 10 分钟」的微小目标，换个环境脑电波会放松很多哦！'
      } else if (queryText.includes('焦虑') || queryText.includes('安慰')) {
        aiText = '深吸一口气。感到焦虑是很正常的，这是你身体在提醒你它很在乎眼前的挑战。你可以去『心灵音乐屋』做 4-7-8 呼吸冥想，让心跳平缓下来。我会一直陪着你。'
      } else if (queryText.includes('放松') || queryText.includes('练习')) {
        aiText = '我今天最推荐你做『正念腹式呼吸』和『林间细雨』白噪音。你可以在左侧导航的『心灵音乐屋』中找到它们，配合呼吸气泡闭上眼睛，身心就会找回舒适感。'
      }

      const aiMsg = {
        sender: 'ai',
        text: aiText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setChatMessages(prev => [...prev, aiMsg])
      setAiTyping(false)

      addLog(
        'operation',
        `${userInfo.nickname} (student)`,
        `在 AI 树洞中使用了快捷心理指导对话：${queryText}`
      )
    }, 1000)
  }

  // === 6. ECharts Mood Trend rendering ===
  const trendChartRef = useRef(null)

  useEffect(() => {
    if (activeTabKey === 'trends' && trendChartRef.current) {
      const chartDom = trendChartRef.current
      const myChart = echarts.init(chartDom)

      const dataToPlot = [...checkInHistory].reverse()

      const moodValueMap = {
        优秀: 100,
        愉快: 85,
        平静: 70,
        疲惫: 50,
        烦躁: 35,
        郁闷: 20
      }

      const xData = dataToPlot.map(item => item.time.split(' ')[0] || item.time)
      const yData = dataToPlot.map(item => moodValueMap[item.mood] || 70)

      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            const index = params[0].dataIndex
            const record = dataToPlot[index]
            if (!record) return ''
            return `
              <div style="font-size:12px;color:#fff;background:rgba(12, 21, 48, 0.9);padding:8px;border:1px solid #00f2fe;border-radius:4px;">
                <b>时间:</b> ${record.time}<br/>
                <b>心情:</b> ${record.emoji} ${record.mood} (强度: ${record.intensity || 5}级)<br/>
                <b>睡眠质量:</b> ${record.sleep || 4}星 | <b>学习压力:</b> ${record.stress || 5}级<br/>
                <b>纪事:</b> ${record.diary.substring(0, 40)}${record.diary.length > 40 ? '...' : ''}
              </div>
            `
          }
        },
        grid: { top: '15%', left: '5%', right: '5%', bottom: '15%', containLabel: true },
        xAxis: {
          type: 'category',
          data: xData.length > 0 ? xData : ['无记录'],
          axisLine: { lineStyle: { color: 'rgba(0, 242, 254, 0.2)' } },
          axisLabel: { color: '#8499b4' }
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 110,
          splitLine: { lineStyle: { color: 'rgba(0, 242, 254, 0.05)' } },
          axisLine: { lineStyle: { color: 'rgba(0, 242, 254, 0.2)' } },
          axisLabel: {
            color: '#8499b4',
            formatter: (value) => {
              if (value === 100) return '优秀 🌟'
              if (value === 85) return '愉快 😊'
              if (value === 70) return '平静 😐'
              if (value === 50) return '疲惫 🥱'
              if (value === 35) return '烦躁 ⚡'
              if (value === 20) return '郁闷 😢'
              return ''
            }
          }
        },
        series: [
          {
            name: '情绪指数',
            type: 'line',
            data: yData.length > 0 ? yData : [70],
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: {
              color: '#a78bfa',
              width: 3,
              shadowBlur: 8,
              shadowColor: 'rgba(167, 139, 250, 0.4)'
            },
            itemStyle: {
              color: '#00f2fe',
              borderColor: '#a78bfa',
              borderWidth: 2
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(167, 139, 250, 0.25)' },
                { offset: 1, color: 'transparent' }
              ])
            }
          }
        ]
      }

      myChart.setOption(option)

      // Fix: Use ResizeObserver for precise container resize detection
      // This ensures chart resizes correctly when switching Tabs
      const resizeObserver = new ResizeObserver(() => {
        myChart.resize()
      })
      resizeObserver.observe(chartDom)

      // Fix: Delayed resize to handle Tab switch animation completing
      const resizeTimer = setTimeout(() => {
        myChart.resize()
      }, 150)

      // Also listen to window resize as a fallback
      const handleResize = () => {
        myChart.resize()
      }
      window.addEventListener('resize', handleResize)

      return () => {
        clearTimeout(resizeTimer)
        resizeObserver.disconnect()
        window.removeEventListener('resize', handleResize)
        myChart.dispose()
      }
    }
  }, [activeTabKey, checkInHistory])

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="page-header-container">
        <div>
          <div className="page-title">心理成长空间</div>
          <div className="page-subtitle">
            您好，<b>{userInfo?.nickname || '同学'}</b> ({userInfo?.className || '未知班级'})。在这里记录情绪，接收 AI 温柔疏导。
          </div>
        </div>
      </div>

      <div className="cyber-card" style={{ padding: 0 }}>
        <Tabs
          activeKey={activeTabKey}
          onChange={setActiveTabKey}
          style={{ padding: '0 20px 20px 20px' }}
          items={[
            {
              key: 'trends',
              label: (
                <span>
                  <LineChartOutlined /> 个人成长面板
                </span>
              ),
              children: (
                <Row gutter={[20, 20]} style={{ marginTop: 16 }}>
                  {/* Left Column: Growth Stats & Chart */}
                  <Col xs={24} lg={16}>
                    {/* Growth Stats Row */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                      <Col xs={24} sm={8}>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 8, border: '1px solid rgba(0, 242, 254, 0.1)', textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: 'var(--cyber-text-muted)', marginBottom: 4 }}>累计积极打卡</div>
                          <div style={{ fontSize: 20, fontWeight: 'bold', color: 'var(--cyber-primary)' }}>{positiveDays} 天</div>
                        </div>
                      </Col>
                      <Col xs={24} sm={8}>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 8, border: '1px solid rgba(139, 92, 246, 0.1)', textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: 'var(--cyber-text-muted)', marginBottom: 4 }}>自我调节完成率</div>
                          <div style={{ fontSize: 20, fontWeight: 'bold', color: 'var(--cyber-secondary)' }}>{selfAdjustRate}%</div>
                        </div>
                      </Col>
                      <Col xs={24} sm={8}>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 8, border: '1px solid rgba(5, 243, 173, 0.1)', textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: 'var(--cyber-text-muted)', marginBottom: 4 }}>目标达成率</div>
                          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#05f3ad' }}>{goalAchieveRate}%</div>
                        </div>
                      </Col>
                    </Row>

                    {/* Chart Card */}
                    <div className="cyber-card" style={{ height: 350, display: 'flex', flexDirection: 'column' }}>
                      <div className="cyber-card-header">
                        <span>个人历史心情颜色成长趋势轨迹</span>
                      </div>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <div ref={trendChartRef} style={{ height: '280px', width: '100%' }}></div>
                      </div>
                    </div>
                  </Col>

                  {/* Right Column: Growth Badges Grid */}
                  <Col xs={24} lg={8}>
                    <Card className="cyber-card" title={<span><TrophyOutlined style={{ color: '#ffb800' }} /> 我的专属心理成长徽章</span>} style={{ height: '100%' }}>
                      <Row gutter={[12, 12]}>
                        {[
                          { id: '1', name: '探索先锋', desc: '完成首次自测中心量表评估', icon: '🌟', unlocked: getAssessmentRecordsCount() > 0, tip: '去心理测评中心自测一次解锁' },
                          { id: '2', name: '情绪卫士', desc: '最近自测得分达到75分以上', icon: '🛡️', unlocked: checkHighScoreBadge(), tip: '自测得分超过75分解锁' },
                          { id: '3', name: '觉察行者', desc: '参与一次深呼吸放松或日记', icon: '🧘', unlocked: checkBreathingBadge(), tip: '写一次日记或去疏导中心解锁' },
                          { id: '4', name: '目标达人', desc: '完成至少一个成长目标打卡', icon: '🔥', unlocked: checkGoalsBadge(), tip: '在自我反馈与目标中打卡一次解锁' }
                        ].map((b) => (
                          <Col span={12} key={b.id}>
                            <div style={{
                              background: 'rgba(255,255,255,0.02)',
                              border: b.unlocked ? '1px solid rgba(255, 184, 0, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                              boxShadow: b.unlocked ? '0 0 15px rgba(255, 184, 0, 0.15)' : 'none',
                              borderRadius: 8,
                              padding: '16px 8px',
                              textAlign: 'center',
                              filter: b.unlocked ? 'none' : 'grayscale(100%) opacity(0.35)',
                              transition: 'all 0.3s',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <div style={{ fontSize: 32, marginBottom: 8 }}>{b.icon}</div>
                              <div style={{ fontSize: 13, fontWeight: 'bold', color: b.unlocked ? '#ffb800' : '#fff', marginBottom: 4 }}>{b.name}</div>
                              <div style={{ fontSize: 10, color: 'var(--cyber-text-muted)', lineHeight: '1.3', flex: 1 }}>{b.desc}</div>
                              <Tag color={b.unlocked ? 'gold' : 'default'} style={{ marginTop: 8, fontSize: 9 }}>
                                {b.unlocked ? '已解锁' : '未解锁'}
                              </Tag>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </Card>
                  </Col>
                </Row>
              )
            },
            {
              key: 'daily-log',
              label: (
                <span>
                  <SmileOutlined /> 成长日记与今日打卡
                </span>
              ),
              children: (
                <Row gutter={[20, 20]} style={{ marginTop: 16 }}>
                  {/* Check-in input section */}
                  <Col xs={24} lg={15}>
                    <div className="cyber-card" style={{ marginBottom: 20 }}>
                      {!currentFeedback && !aiLoading ? (
                        <div>
                          {/* Step 1: Mood Color */}
                          <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ color: 'var(--cyber-primary)' }}>1.</span> 今日情绪代表色与程度
                            </div>
                            <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                              {moods.map((m) => (
                                <Col xs={12} sm={8} key={m.name}>
                                  <div
                                    className={`mood-btn ${selectedMood === m.name ? 'active' : ''}`}
                                    style={{
                                      '--theme-color': m.color,
                                      '--theme-color-rgb': m.rgb,
                                      '--theme-shadow': `rgba(${m.rgb}, 0.3)`
                                    }}
                                    onClick={() => setSelectedMood(m.name)}
                                  >
                                    <span style={{ fontSize: 24, display: 'block', marginBottom: 6 }}>{m.emoji}</span>
                                    <span style={{ fontWeight: '600', color: '#fff', display: 'block', fontSize: 13 }}>{m.name}</span>
                                    <span style={{ fontSize: 10, color: 'var(--cyber-text-muted)', display: 'block', marginTop: 4 }}>{m.desc}</span>
                                  </div>
                                </Col>
                              ))}
                            </Row>

                            <div style={{ padding: '0 8px' }}>
                              <span style={{ color: 'var(--cyber-text-muted)', fontSize: 12 }}>情绪强度评估（{moodIntensity}级）：</span>
                              <Slider min={1} max={10} value={moodIntensity} onChange={setMoodIntensity} />
                            </div>
                          </div>

                          {/* Step 1.5: Trigger Reason */}
                          <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 12, color: 'var(--cyber-text-muted)', marginBottom: 8 }}>主要触发诱因（可多选）：</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                              {triggerOptions.map((opt) => {
                                const isSelected = triggerReason.includes(opt)
                                return (
                                  <Tag.CheckableTag
                                    key={opt}
                                    checked={isSelected}
                                    onChange={() => handleToggleTrigger(opt)}
                                    style={{
                                      border: isSelected ? '1px solid var(--cyber-secondary)' : '1px solid rgba(255,255,255,0.1)',
                                      padding: '3px 8px',
                                      borderRadius: 4,
                                      color: isSelected ? 'var(--cyber-secondary)' : '#fff',
                                      background: isSelected ? 'rgba(167, 139, 250, 0.15)' : 'transparent'
                                    }}
                                  >
                                    {opt}
                                  </Tag.CheckableTag>
                                )
                              })}
                            </div>
                          </div>

                          {/* Step 2: Growth Diary */}
                          <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ color: 'var(--cyber-primary)' }}>2.</span> 今天发生了什么？ (今日备注日记)
                            </div>
                            <TextArea
                              value={checkInDiary}
                              onChange={(e) => setCheckInDiary(e.target.value)}
                              placeholder="写点备注或记事来记录今天吧... (支持语音输入与色块配图)"
                              autoSize={{ minRows: 2, maxRows: 4 }}
                              style={{ marginBottom: 10 }}
                            />
                            
                            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                              <Button
                                size="small"
                                icon={<AudioOutlined />}
                                onClick={handleStartVoiceRecord}
                                style={{ borderColor: 'var(--cyber-primary)', color: 'var(--cyber-primary)', background: 'transparent' }}
                              >
                                🎙️ 语音输入
                              </Button>
                              <Button
                                size="small"
                                icon={<PictureOutlined />}
                                onClick={() => setImageModalVisible(true)}
                                style={{ borderColor: 'var(--cyber-secondary)', color: 'var(--cyber-secondary)', background: 'transparent' }}
                              >
                                🖼️ 情绪配图
                              </Button>
                            </div>

                            {selectedImage && (
                              <div style={{
                                width: 80,
                                height: 50,
                                borderRadius: 6,
                                background: selectedImage,
                                position: 'relative',
                                border: '2px solid rgba(255,255,255,0.2)',
                                boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                                marginBottom: 12
                              }}>
                                <Button 
                                  shape="circle" 
                                  size="small" 
                                  onClick={() => setSelectedImage(null)}
                                  style={{ position: 'absolute', top: -8, right: -8, width: 16, height: 16, fontSize: 8, padding: 0, background: '#ff4d4f', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  X
                                </Button>
                              </div>
                            )}

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {diaryQuickTags.map((tag, idx) => (
                                <Tag
                                  key={idx}
                                  color="cyan"
                                  onClick={() => setCheckInDiary(tag.text)}
                                  style={{ cursor: 'pointer', fontSize: 10, background: 'rgba(0, 242, 254, 0.03)' }}
                                >
                                  {tag.label}
                                </Tag>
                              ))}
                            </div>
                          </div>

                          {/* Step 2.5: Sleep & Study Stress */}
                          <Row gutter={16} style={{ marginBottom: 20 }}>
                            <Col xs={24} sm={12}>
                              <div style={{ fontSize: 12, color: 'var(--cyber-text-muted)', marginBottom: 6 }}>睡眠质量评估：</div>
                              <Rate value={sleepQuality} onChange={setSleepQuality} style={{ fontSize: 18 }} />
                            </Col>
                            <Col xs={24} sm={12}>
                              <div style={{ fontSize: 12, color: 'var(--cyber-text-muted)', marginBottom: 4 }}>今日学习压力评估（{studyStress}级）：</div>
                              <Slider min={1} max={10} value={studyStress} onChange={setStudyStress} />
                            </Col>
                          </Row>

                          {/* Step 3: Tomorrow Goals */}
                          <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ color: 'var(--cyber-primary)' }}>3.</span> 明天我想怎样做？ (目标设定)
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                              {predefinedGoals.map((goal, idx) => {
                                const isSelected = selectedGoals.includes(goal)
                                return (
                                  <Tag.CheckableTag
                                    key={idx}
                                    checked={isSelected}
                                    onChange={() => handleToggleGoal(goal)}
                                    style={{
                                      border: isSelected ? '1px solid var(--cyber-primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                                      padding: '4px 8px',
                                      borderRadius: 4,
                                      color: isSelected ? 'var(--cyber-primary)' : '#fff',
                                      background: isSelected ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                                      fontSize: 12
                                    }}
                                  >
                                    {goal}
                                  </Tag.CheckableTag>
                                )
                              })}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <Input
                                value={customGoalInput}
                                onChange={(e) => setCustomGoalInput(e.target.value)}
                                placeholder="输入自定义明天的成长小目标..."
                                onPressEnter={handleAddCustomGoal}
                                style={{ flex: 1 }}
                              />
                              <Button
                                icon={<PlusOutlined />}
                                onClick={handleAddCustomGoal}
                                style={{ borderColor: 'var(--cyber-primary)', color: 'var(--cyber-primary)', background: 'transparent' }}
                              >
                                添加目标
                              </Button>
                            </div>
                          </div>

                          {/* Form action buttons */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <Button onClick={handleSaveDiaryDraft}>
                              暂存日记草稿
                            </Button>
                            <Button onClick={handleClearDiaryDraft} danger style={{ background: 'transparent', color: '#ff4d4f', border: '1px solid #ff4d4f' }}>
                              清空草稿
                            </Button>
                            <Button type="primary" className="cyber-btn" onClick={handleSubmitCheckIn}>
                              提交打卡
                            </Button>
                          </div>
                        </div>
                      ) : aiLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                          <Progress type="circle" percent={45} status="active" strokeColor={{ '0%': '#00f2fe', '100%': '#8b5cf6' }} width={80} style={{ marginBottom: 20 }} />
                          <h4 style={{ color: '#fff' }}>{loadingText}</h4>
                          <span style={{ color: 'var(--cyber-text-muted)', fontSize: 12 }}>AI 正在深度解析您的情绪曲线并构建共情回应...</span>
                        </div>
                      ) : (
                        <div>
                          {/* AI feedback report */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ color: '#fff', fontSize: 16, margin: 0 }}>📊 AI 情绪成长深度分析反馈</h3>
                            <Button type="primary" size="small" className="cyber-btn" onClick={handleResetCheckInForm}>
                              再记一篇日记
                            </Button>
                          </div>

                          <div style={{
                            background: 'rgba(6, 11, 25, 0.4)',
                            padding: '16px',
                            borderRadius: 6,
                            border: '1px solid rgba(0, 242, 254, 0.1)',
                            marginBottom: 20
                          }}>
                            {currentFeedback.tags && (
                              <div style={{ marginBottom: 12 }}>
                                <span style={{ fontSize: 12, color: 'var(--cyber-text-muted)', marginRight: 8 }}>AI 提炼日记关键词：</span>
                                {currentFeedback.tags.map((t, idx) => (
                                  <Tag key={idx} color="cyan">{t}</Tag>
                                ))}
                              </div>
                            )}
                            
                            {currentFeedback.image && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <span style={{ fontSize: 12, color: 'var(--cyber-text-muted)' }}>情绪色彩配图：</span>
                                <div style={{ width: 60, height: 35, borderRadius: 4, background: currentFeedback.image }} />
                              </div>
                            )}

                            <div style={{ whiteSpace: 'pre-wrap', color: '#fff', fontSize: 13, lineHeight: '1.6' }}>
                              {currentFeedback.aiFeedback}
                            </div>
                          </div>

                          {/* Specific recommendations links */}
                          <div style={{
                            padding: '14px 16px',
                            background: 'rgba(167, 139, 250, 0.05)',
                            border: '1px solid rgba(167, 139, 250, 0.15)',
                            borderRadius: 8
                          }}>
                            <div style={{ fontSize: 13, color: 'var(--cyber-secondary)', fontWeight: 'bold', marginBottom: 8 }}>💡 AI 情绪疏导与行为建议：</div>
                            <ul style={{ paddingLeft: 16, color: 'var(--cyber-text-muted)', fontSize: 12, margin: 0, lineHeight: '1.8' }}>
                              <li>建议前往 <Link to="/student-music" style={{ color: 'var(--cyber-primary)', fontWeight: 'bold' }}>心灵音乐屋</Link>，听一首针对性的脑电波疗愈音，给大脑松绑。</li>
                              <li>建议前往 <Link to="/student-counseling" style={{ color: 'var(--cyber-primary)', fontWeight: 'bold' }}>情绪疏导中心</Link>，进行一次 4-7-8 正念腹式呼吸，平复身体心慌。</li>
                              <li>建议前往 <Link to="/student-goals" style={{ color: 'var(--cyber-secondary)', fontWeight: 'bold' }}>目标与自我反馈</Link>，打卡完成教师下达的任务。</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </Col>

                  {/* Right Column: Check-in records timeline */}
                  <Col xs={24} lg={9}>
                    <Card className="cyber-card" title={<span><HistoryOutlined /> 情绪打卡历史日记</span>} style={{ height: '100%', minHeight: 460 }}>
                      <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 6 }}>
                        {checkInHistory.length === 0 ? (
                          <Empty description="暂无打卡日记" />
                        ) : (
                          <Timeline mode="left">
                            {checkInHistory.map((item) => (
                              <Timeline.Item
                                key={item.id}
                                color={item.color}
                                label={<span style={{ color: 'var(--cyber-text-muted)', fontSize: 11 }}>{item.time}</span>}
                              >
                                <div style={{
                                  background: 'rgba(6, 11, 25, 0.5)',
                                  border: '1px solid rgba(0, 242, 254, 0.1)',
                                  borderRadius: 8,
                                  padding: '12px',
                                  marginBottom: 10,
                                  position: 'relative'
                                }}>
                                  <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    size="small"
                                    onClick={() => handleDeleteHistory(item.id)}
                                    style={{ position: 'absolute', top: 8, right: 8, background: 'transparent' }}
                                  />
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <span style={{ fontSize: 16 }}>{item.emoji}</span>
                                    <span style={{ fontWeight: '600', color: '#fff', fontSize: 13 }}>{item.mood} (强度: {item.intensity || 5}级)</span>
                                  </div>

                                  {item.trigger && item.trigger.length > 0 && (
                                    <div style={{ fontSize: 11, color: 'var(--cyber-text-muted)', marginBottom: 4 }}>
                                      <b>诱因：</b>{item.trigger.join('、')}
                                    </div>
                                  )}

                                  <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--cyber-text-muted)', marginBottom: 6 }}>
                                    <span><b>睡眠：</b>{item.sleep || 4}星</span>
                                    <span><b>学习压力：</b>{item.stress || 5}级</span>
                                  </div>

                                  <div style={{ fontSize: 12, color: 'var(--cyber-text)', marginBottom: 8, lineHeight: '1.4' }}>
                                    <b>今日备注：</b>{item.diary}
                                  </div>
                                  
                                  {item.tags && item.tags.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                                      {item.tags.map((t, idx) => (
                                        <Tag key={idx} color="cyan" style={{ fontSize: 9 }}>{t}</Tag>
                                      ))}
                                    </div>
                                  )}

                                  {item.image && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                      <span style={{ color: 'var(--cyber-text-muted)', fontSize: 10 }}>配图：</span>
                                      <div style={{ width: 40, height: 24, borderRadius: 3, background: item.image }} />
                                    </div>
                                  )}

                                  <div style={{
                                    background: 'rgba(167, 139, 250, 0.04)',
                                    border: '1px solid rgba(167, 139, 250, 0.1)',
                                    borderRadius: 6,
                                    padding: '8px',
                                    fontSize: 11,
                                    color: 'rgba(255,255,255,0.85)'
                                  }}>
                                    <div style={{ color: 'var(--cyber-secondary)', fontWeight: 'bold', marginBottom: 2 }}><RobotOutlined /> AI 心灵回响：</div>
                                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{item.aiFeedback}</div>
                                  </div>
                                </div>
                              </Timeline.Item>
                            ))}
                          </Timeline>
                        )}
                      </div>
                    </Card>
                  </Col>
                </Row>
              )
            },
            {
              key: 'treehole',
              label: (
                <span>
                  <RobotOutlined /> AI陪伴伴侣
                </span>
              ),
              children: (
                <Row gutter={[20, 20]} style={{ marginTop: 16 }}>
                  {/* Full size Chat window */}
                  <Col span={24}>
                    <div className="cyber-card" style={{ minHeight: 460, display: 'flex', flexDirection: 'column', padding: 20 }}>
                      <div className="cyber-card-header" style={{ marginBottom: 16 }}>
                        <span>AI 情绪成长守护树洞 (轻量对话)</span>
                        <Tag color="purple">智能减压咨询</Tag>
                      </div>

                      {/* Chat messages listing */}
                      <div style={{
                        flex: 1,
                        minHeight: 280,
                        maxHeight: 380,
                        overflowY: 'auto',
                        background: 'rgba(6, 11, 25, 0.4)',
                        borderRadius: 6,
                        border: '1px solid rgba(0, 242, 254, 0.1)',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        marginBottom: 16
                      }}>
                        <List
                          dataSource={chatMessages}
                          renderItem={(item) => (
                            <div style={{
                              display: 'flex',
                              flexDirection: item.sender === 'ai' ? 'row' : 'row-reverse',
                              alignItems: 'flex-start',
                              gap: 8,
                              marginBottom: 8
                            }}>
                              <Avatar
                                icon={item.sender === 'ai' ? <RobotOutlined /> : <UserOutlined />}
                                style={{
                                  backgroundColor: item.sender === 'ai' ? 'var(--cyber-primary)' : 'var(--cyber-secondary)',
                                  flexShrink: 0
                                }}
                              />
                              <div style={{
                                maxWidth: '75%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: item.sender === 'ai' ? 'flex-start' : 'flex-end'
                              }}>
                                <div style={{
                                  background: item.sender === 'ai' ? 'var(--cyber-panel-solid)' : 'rgba(0, 242, 254, 0.12)',
                                  border: `1px solid ${item.sender === 'ai' ? 'var(--cyber-border)' : 'var(--cyber-primary)'}`,
                                  borderRadius: item.sender === 'ai' ? '0 12px 12px 12px' : '12px 0 12px 12px',
                                  padding: '8px 12px',
                                  color: '#fff',
                                  fontSize: 12,
                                  lineHeight: 1.5
                                }}>
                                  {item.text}
                                </div>
                                <span style={{ fontSize: 9, color: 'var(--cyber-text-muted)', marginTop: 4 }}>
                                  {item.time}
                                </span>
                              </div>
                            </div>
                          )}
                        />
                        {aiTyping && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar icon={<RobotOutlined />} style={{ backgroundColor: 'var(--cyber-primary)' }} />
                            <div style={{
                              background: 'var(--cyber-panel-solid)',
                              border: '1px solid var(--cyber-border)',
                              borderRadius: '0 12px 12px 12px',
                              padding: '6px 10px',
                              color: 'var(--cyber-text-muted)',
                              fontSize: 11
                            }}>
                              AI导师正在聆听打字中...
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Quick query chips */}
                      <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: 'var(--cyber-text-muted)' }}>💡 快捷心理减压提问：</span>
                        {[
                          '我感觉临近期末有些学业焦虑，怎么办？',
                          '帮我制定一个今天快速学习减压的微小建议',
                          '我制定了计划总是拖延，有没有正向激励机制？'
                        ].map((qText, idx) => (
                          <Tag
                            key={idx}
                            color="purple"
                            onClick={() => handleSendQuickMsg(qText)}
                            style={{ cursor: 'pointer', fontSize: 11, background: 'rgba(167, 139, 250, 0.05)', borderColor: 'rgba(167, 139, 250, 0.25)' }}
                          >
                            {qText}
                          </Tag>
                        ))}
                      </div>

                      {/* Text chat input bar */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <TextArea
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="和成长伴侣树洞谈谈心吧，支持学业减压、人际交往、拖延克服探讨..."
                          autoSize={{ minRows: 1, maxRows: 3 }}
                          onPressEnter={(e) => {
                            if (!e.shiftKey) {
                              e.preventDefault()
                              handleSendChat()
                            }
                          }}
                        />
                        <Button
                          type="primary"
                          className="cyber-btn"
                          icon={<SendOutlined />}
                          onClick={handleSendChat}
                          style={{ height: 'auto', alignSelf: 'stretch', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        />
                      </div>
                    </div>
                  </Col>
                </Row>
              )
            }
          ]}
        />
      </div>

      {/* Voice input mock modal */}
      <Modal
        title="语音识别转文字输入 (Mock)"
        open={voiceModalVisible}
        onCancel={handleCancelVoiceRecord}
        footer={[
          <Button key="cancel" onClick={handleCancelVoiceRecord}>取消</Button>,
          recording ? (
            <Button key="stop" type="primary" danger onClick={handleStopVoiceRecord}>
              说完了，智能转换为文字
            </Button>
          ) : (
            <Button key="start" type="primary" onClick={handleStartVoiceRecord}>
              重新录音
            </Button>
          )
        ]}
        width={340}
        bodyStyle={{ textAlign: 'center' }}
      >
        <div style={{ padding: '24px 0', textAlign: 'center' }}>
          {recording ? (
            <div className="voice-wave-container" style={{ display: 'flex', gap: 6, justifyContent: 'center', height: 40, alignItems: 'center', marginBottom: 20 }}>
              <div className="wave-bar" style={{ width: 4, height: 16, background: 'var(--cyber-primary)', animation: 'wave 0.6s ease-in-out infinite' }}></div>
              <div className="wave-bar" style={{ width: 4, height: 32, background: 'var(--cyber-primary)', animation: 'wave 0.6s ease-in-out infinite 0.1s' }}></div>
              <div className="wave-bar" style={{ width: 4, height: 24, background: 'var(--cyber-primary)', animation: 'wave 0.6s ease-in-out infinite 0.2s' }}></div>
              <div className="wave-bar" style={{ width: 4, height: 36, background: 'var(--cyber-primary)', animation: 'wave 0.6s ease-in-out infinite 0.3s' }}></div>
              <div className="wave-bar" style={{ width: 4, height: 18, background: 'var(--cyber-primary)', animation: 'wave 0.6s ease-in-out infinite 0.4s' }}></div>
            </div>
          ) : (
            <div style={{ fontSize: 36, marginBottom: 20 }}>🎙️</div>
          )}
          <div style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
            {recording ? `录音录制中：${voiceTimer}秒` : '录音已暂停'}
          </div>
          <div style={{ color: 'var(--cyber-text-muted)', fontSize: 11, marginTop: 4 }}>
            模拟音频录制输入，智能识别普通话文本
          </div>
        </div>

        <style>{`
          @keyframes wave {
            0%, 100% { height: 10px; }
            50% { height: 32px; }
          }
          .voice-wave-container .wave-bar {
            transform-origin: center;
            animation: wave 0.6s ease-in-out infinite;
          }
          .voice-wave-container .wave-bar:nth-child(2) { animation-delay: 0.1s; }
          .voice-wave-container .wave-bar:nth-child(3) { animation-delay: 0.2s; }
          .voice-wave-container .wave-bar:nth-child(4) { animation-delay: 0.3s; }
          .voice-wave-container .wave-bar:nth-child(5) { animation-delay: 0.4s; }
        `}</style>
      </Modal>

      {/* Mock Image selection modal */}
      <Modal
        title="选择心情色块配图 (模拟图像上传)"
        open={imageModalVisible}
        onCancel={() => setImageModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setImageModalVisible(false)}>关闭</Button>
        ]}
        width={400}
      >
        <div style={{ padding: '10px 0' }}>
          <div style={{ fontSize: 12, color: 'var(--cyber-text-muted)', marginBottom: 16 }}>
            您可以选择符合今日精神图腾的渐变配图：
          </div>
          <Row gutter={[12, 12]}>
            {mockImages.map((img) => (
              <Col span={8} key={img.key}>
                <div
                  onClick={() => handleSelectMockImage(img.gradient)}
                  style={{
                    height: 80,
                    borderRadius: 6,
                    background: img.gradient,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: 11,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center',
                    padding: '0 4px'
                  }}
                >
                  {img.title}
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </Modal>
    </div>
  )
}
