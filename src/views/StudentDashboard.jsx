import React, { useState, useEffect, useContext, useRef } from 'react'
import {
  Row,
  Col,
  Card,
  Button,
  Radio,
  Space,
  Input,
  Avatar,
  Tag,
  message,
  Progress,
  List,
  Alert,
  Divider,
  Tabs,
  Timeline,
  Form,
  Select,
  Badge
} from 'antd'
import {
  SmileOutlined,
  MehOutlined,
  FrownOutlined,
  HeartOutlined,
  SendOutlined,
  CheckCircleOutlined,
  RobotOutlined,
  UserOutlined,
  FieldTimeOutlined,
  PlusOutlined,
  DeleteOutlined,
  TrophyOutlined,
  BookOutlined,
  ScheduleOutlined,
  LineChartOutlined,
  SettingOutlined,
  CheckOutlined
} from '@ant-design/icons'
import { questionBank } from '../data/questionBank.js'
import { UserContext } from '../App.jsx'
import * as echarts from 'echarts'

const { TextArea } = Input

export default function StudentDashboard() {
  const {
    userInfo,
    updateUserInfo,
    assignedTasks,
    setAssignedTasks,
    addLog
  } = useContext(UserContext)

  const [activeTabKey, setActiveTabKey] = useState('daily-log')

  // === 1. Moods & Check-in States ===
  const [selectedMood, setSelectedMood] = useState(null)
  const [checkInDiary, setCheckInDiary] = useState('')
  const [selectedGoals, setSelectedGoals] = useState([])
  const [customGoalInput, setCustomGoalInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('正在上传情绪能量光谱...')
  const [currentFeedback, setCurrentFeedback] = useState(null)

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
    { label: '💪 付出努力', text: '今天在自习课上非常专心，把积攒了很久的错题都整理完了！' },
    { label: '📝 值得记录', text: '今天放学路上看到了美丽的夕阳，还给路边的小猫喂了食。' }
  ]

  const predefinedGoals = ['认真听讲', '主动运动', '帮助同学', '整理书桌', '整理错题', '复习总结', '学习新知识']

  // === 2. Check-in History States ===
  const [checkInHistory, setCheckInHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('moodCheckInHistory')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.error(e)
    }
    return [
      {
        id: 'mock-1',
        time: '2026-06-24 18:30',
        mood: '愉快',
        emoji: '😊',
        color: '#00f2fe',
        diary: '今天在数学课上回答出了老师提问的一道思考题，得到了全班同学掌声，感觉非常开心！',
        goals: ['认真听讲', '整理错题'],
        aiFeedback: '看到你今天状态满满，感到格外优秀！你提到上课解出思考题并获得掌声，这不仅代表你的解题能力，更是专注听讲的体现。数学学习需要这种突破难题的成就感，非常棒！明天继续保持【认真听讲】和【整理错题】的目标，把今天的思考方式总结进错题本，一定会有更大突破。加油！'
      },
      {
        id: 'mock-2',
        time: '2026-06-25 08:15',
        mood: '疲惫',
        emoji: '🥱',
        color: '#ffb800',
        diary: '最近临近期末考试，功课比较繁重，晚上睡眠也有点不足，感觉白天很没精神。',
        goals: ['主动运动', '复习总结'],
        aiFeedback: '学业功课繁重时，感到【疲惫】是身体在提醒你需要进行适当的休息与修整。建议你今晚早点睡，明天小目标里的【主动运动】非常重要，跑跑步或做做拉伸能有效激活你的身体能量，舒缓压力。学习就像是一场马拉松，阶段性的调整比一味拼命更有远见。'
      }
    ]
  })

  useEffect(() => {
    localStorage.setItem('moodCheckInHistory', JSON.stringify(checkInHistory))
  }, [checkInHistory])

  // === 3. Questionnaire States ===
  const [activeQuestions, setActiveQuestions] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [testResult, setTestResult] = useState(null)

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

  useEffect(() => {
    setActiveQuestions(generateRandomQuestions())
  }, [])

  // Cool loader animation sequence
  useEffect(() => {
    let interval
    if (aiLoading) {
      const texts = [
        '正在上传情绪能量光谱...',
        'AI 正在倾听你的成长故事...',
        '正在结合历史记录比对变化规律...',
        '正在为你生成明日成长指南...',
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

  const handleRemoveGoal = (goal) => {
    setSelectedGoals(selectedGoals.filter(g => g !== goal))
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
        moodPart = '今天过得平静而安稳。平静是一种非常有力量的情绪状态，它能让我们内心清明、做事专注，这也是很好的精神能量。'
        break
      case '疲惫':
        moodPart = '你今天觉得有些疲惫，辛苦啦。学业繁重或生活紧凑时，身体和心灵发出求休信号是很正常的。请允许自己今天好好放松一下，充充电。'
        break
      case '烦躁':
        moodPart = '感到有些烦躁吗？抱抱你。内心浮躁或容易动怒的时候，说明你的情绪负荷有点超载了。试着闭上眼做几次深呼吸，把节奏慢下来。'
        break
      case '郁闷':
        moodPart = '今天有些低落和郁闷，给你一个温暖的云拥抱。别担心，成长本就起起落落，允许自己有沮丧的时候，黑暗过去就是黎明。'
        break
      default:
        moodPart = '收到你今天的心情记录。每一个微小的情绪都值得被温柔对待。'
    }

    // 2. Diary analysis
    let diaryPart = ''
    const text = diary.toLowerCase()
    if (!diary.trim()) {
      diaryPart = '今天过得充实而平和，虽然没有写下具体细节，但默默走过的每一步，都是你成长的坚实足迹。'
    } else if (text.includes('考') || text.includes('学') || text.includes('分') || text.includes('题')) {
      diaryPart = '对于你提到学业或考试相关的事情，我想说：学习确实需要日积月累的耐力。每一次做错题、解决难题，都是大脑神经元在建立更强的连接。不要因一时的起伏而否定自己的努力，你走的路每一步都算数。'
    } else if (text.includes('吵') || text.includes('人际') || text.includes('朋友') || text.includes('同桌') || text.includes('老师') || text.includes('爸') || text.includes('妈')) {
      diaryPart = '看到你提到人际关系或人际沟通的细节，与人相处就像是照镜子，有欢笑也偶有摩擦。面对意见分歧，保持温和与坦诚是化解冰雪的良药。多倾听，也多给自己和对方一点宽容。'
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
        goalPart += ' 整理错题和复习总结能让你建立起系统的知识网，温故而知新，非常棒的学习态度。'
      }
      if (goals.includes('帮助同学')) {
        goalPart += ' 赠人玫瑰，手有余香，去向同伴传递温暖，你也会收获满满的成就感。'
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
        diary: checkInDiary.trim() || '今天很平静，没有记录特别的事。',
        goals: [...selectedGoals],
        aiFeedback: feedbackText
      }

      setCheckInHistory([newRecord, ...checkInHistory])
      setCurrentFeedback(newRecord)
      setAiLoading(false)

      addLog(
        'operation',
        `${userInfo.nickname} (student)`,
        `完成了今日情绪成长打卡（心情代表色: ${selectedMood}）`
      )

      message.success('今日打卡提交成功，AI 已为您生成专属成长反馈！')
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

    // Sum score
    const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0)
    let riskLevel = '正常'
    let feedback = '您的情绪成长弹性很好，心理非常健康，请继续保持乐观的心态！'

    if (totalScore < 45) {
      riskLevel = '重点关注'
      feedback = '检测到您近期压力水平偏高，情绪可能处于瓶颈期。建议联系辅导老师或心理老师，聊聊天会感觉轻松许多哦！'
    } else if (totalScore < 65) {
      riskLevel = '中度关注'
      feedback = '您近期似乎背负着不小的课业或人际压力，建议合理规划时间，多安排些户外活动放松紧绷的神经。'
    } else if (totalScore < 85) {
      riskLevel = '轻度关注'
      feedback = '您当前整体状态良好，偶有一些起伏，这是成长的正常现象。通过倾听音乐或找同伴聊天即可调适。'
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

    // Save to assessmentRecords list in localStorage
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
            a: matchedOption ? matchedOption.label : '未答题'
          }
        })
      }
      localStorage.setItem('assessmentRecords', JSON.stringify([newRecord, ...savedRecords]))
    } catch (e) {
      console.error(e)
    }

    addLog(
      'operation',
      `${userInfo.nickname} (student)`,
      `完成了20道随机心理自主测评（得分: ${totalScore}, 结果为: ${riskLevel}）`
    )

    message.success('评测提交成功，AI已生成您的专属心理报告')
  }

  const handleRestartTest = () => {
    setCurrentStep(0)
    setAnswers({})
    setTestResult(null)
    setActiveQuestions(generateRandomQuestions())
  }

  // === 4. AI Treehole Chatbot State ===
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
        aiText = '听到你在学习上感到压力，这其实是很多优秀学生都会经历的阶段。试着把大任务拆解为细小的步骤，每天做一点点。更重要的是，晚上一定要给自己安排二三十分钟的绝对放松时间。相信你！'
      } else if (prompt.includes('难过') || prompt.includes('抑郁') || prompt.includes('不开心') || prompt.includes('哭')) {
        aiText = '感到难过的时候，请允许自己停下来休息一下。抱一抱那个紧绷的自己。如果觉得沉重，可以随时找信任的老师或者心理咨询师倾诉，表达情绪绝不是弱小的表现，而是爱自己的开始。'
      } else if (prompt.includes('人际') || prompt.includes('吵架') || prompt.includes('朋友') || prompt.includes('同桌') || prompt.includes('孤独')) {
        aiText = '同伴交往是成长中的重要维度，有些许摩擦或孤独感是很正常的。试着专注于做真实的自己，也可以尝试用温和的方式先迈出一小步，比如一个微笑或课间的问候。'
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

  // === 5. Task Feedback & Completion ===
  const [taskFeedbackTexts, setTaskFeedbackTexts] = useState({})

  const handleCompleteTask = (taskId) => {
    const feedback = taskFeedbackTexts[taskId] || ''
    if (!feedback.trim()) {
      message.warning('请先填写您的成长任务自我反馈！')
      return
    }

    const updatedTasks = assignedTasks.map(t =>
      t.id === taskId ? { ...t, status: '已完成', feedback: feedback } : t
    )
    setAssignedTasks(updatedTasks)

    const completedTask = assignedTasks.find(t => t.id === taskId)
    addLog(
      'operation',
      `${userInfo.nickname} (student)`,
      `完成了成长任务【${completedTask?.taskName}】并提交自我反馈：${feedback}`
    )
    message.success(`任务【${completedTask?.taskName}】打卡完成！`)
  }

  // Filter tasks assigned to current student (either explicitly named or matching the class)
  const myTasks = assignedTasks.filter(
    t => t.studentName === userInfo.nickname || t.className === userInfo.className
  )

  // === 6. Profile Form Settings ===
  const [profileForm] = Form.useForm()

  useEffect(() => {
    profileForm.setFieldsValue({
      nickname: userInfo.nickname || '',
      gender: userInfo.gender || '男',
      className: userInfo.className || '高一1班',
      avatar: userInfo.avatar || '😊',
      bio: userInfo.bio || ''
    })
  }, [userInfo])

  const handleSaveProfile = (values) => {
    updateUserInfo(values)
    message.success('个人档案信息修改保存成功！')
  }

  // === 7. ECharts Mood Trend rendering ===
  const trendChartRef = useRef(null)

  useEffect(() => {
    if (activeTabKey === 'trends' && trendChartRef.current) {
      const chartDom = trendChartRef.current
      const myChart = echarts.init(chartDom)

      // Chronological check-in logs
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
                <b>心情:</b> ${record.emoji} ${record.mood}<br/>
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

      const handleResize = () => {
        myChart.resize()
      }
      window.addEventListener('resize', handleResize)

      return () => {
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
          <div className="page-title">心理情绪成长空间</div>
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
              key: 'daily-log',
              label: (
                <span>
                  <SmileOutlined /> 每日打卡 & AI情绪分析
                </span>
              ),
              children: (
                <Row gutter={[20, 20]} style={{ marginTop: 16 }}>
                  {/* Left sub-column: check-in registration */}
                  <Col xs={24} lg={15}>
                    <div className="cyber-card" style={{ marginBottom: 20 }}>
                      {!currentFeedback && !aiLoading ? (
                        <div>
                          {/* Step 1: Mood */}
                          <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ color: 'var(--cyber-primary)' }}>1.</span> 选择今日心情代表色
                            </div>
                            <Row gutter={[12, 12]}>
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
                          </div>

                          {/* Step 2: What happened today */}
                          <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ color: 'var(--cyber-primary)' }}>2.</span> 今天发生了什么？ (成长日记)
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--cyber-text-muted)', marginBottom: 8 }}>
                              写下您今天想说的心情故事、学习困惑、努力或是值得开心记录的事情：
                            </div>
                            <TextArea
                              value={checkInDiary}
                              onChange={(e) => setCheckInDiary(e.target.value)}
                              placeholder="写点什么来记录今天吧... (如：今天和同学一起讨论数学题感觉非常充实！)"
                              autoSize={{ minRows: 3, maxRows: 6 }}
                              style={{ marginBottom: 10 }}
                            />
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                              {diaryQuickTags.map((tag, idx) => (
                                <Tag
                                  key={idx}
                                  color="cyan"
                                  onClick={() => setCheckInDiary(tag.text)}
                                  style={{ cursor: 'pointer', fontSize: 11, background: 'rgba(0, 242, 254, 0.05)', borderColor: 'rgba(0, 242, 254, 0.2)' }}
                                >
                                  {tag.label}
                                </Tag>
                              ))}
                            </div>
                          </div>

                          {/* Step 3: Tomorrow's goals */}
                          <div style={{ marginBottom: 28 }}>
                            <div style={{ fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ color: 'var(--cyber-primary)' }}>3.</span> 明天我想怎样做？ (小目标自我管理)
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
                                placeholder="输入自定义成长小目标..."
                                onPressEnter={handleAddCustomGoal}
                                style={{ flex: 1 }}
                              />
                              <Button
                                icon={<PlusOutlined />}
                                onClick={handleAddCustomGoal}
                                style={{ borderColor: 'var(--cyber-primary)', color: 'var(--cyber-primary)', background: 'transparent' }}
                              >
                                添加
                              </Button>
                            </div>

                            {selectedGoals.length > 0 && (
                              <div style={{ marginTop: 12 }}>
                                <span style={{ fontSize: 12, color: 'var(--cyber-text-muted)', marginRight: 8 }}>已选明日目标：</span>
                                <Space size={[0, 8]} wrap>
                                  {selectedGoals.map((goal, idx) => (
                                    <Tag
                                      key={idx}
                                      color="purple"
                                      closable
                                      onClose={() => handleRemoveGoal(goal)}
                                    >
                                      {goal}
                                    </Tag>
                                  ))}
                                </Space>
                              </div>
                            )}
                          </div>

                          <Button
                            type="primary"
                            className="cyber-btn cyber-btn-purple"
                            onClick={handleSubmitCheckIn}
                            disabled={!selectedMood}
                            style={{ width: '100%', height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                          >
                            <RobotOutlined /> ✨ 生成 AI 情绪成长分析并提交打卡
                          </Button>
                        </div>
                      ) : aiLoading ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(6, 11, 25, 0.4)', borderRadius: 8, position: 'relative' }}>
                          <Progress
                             type="circle"
                             percent={100}
                             status="active"
                             strokeColor={{ '0%': '#00f2fe', '100%': '#8b5cf6' }}
                             trailColor="rgba(255, 255, 255, 0.05)"
                             width={90}
                             style={{ marginBottom: 24 }}
                          />
                          <h3 style={{ color: '#fff', fontSize: 15, marginBottom: 8 }}>
                            AI成长导师正在生成智能疏导语...
                          </h3>
                          <div style={{ color: 'var(--cyber-primary)', fontSize: 12, fontStyle: 'italic' }}>
                            {loadingText}
                          </div>
                        </div>
                      ) : (
                        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                          <div style={{
                            background: 'rgba(13, 22, 50, 0.8)',
                            border: '1px solid var(--cyber-primary)',
                            borderRadius: 8,
                            padding: '20px',
                            marginBottom: 20
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(0, 242, 254, 0.2)', paddingBottom: 12, marginBottom: 16 }}>
                              <Avatar size="large" icon={<RobotOutlined />} style={{ backgroundColor: 'var(--cyber-primary)' }} />
                              <div>
                                <h4 style={{ color: '#fff', margin: 0, fontSize: 14 }}>AI 情绪成长顾问意见</h4>
                                <span style={{ color: 'var(--cyber-text-muted)', fontSize: 11 }}>生成时间：{currentFeedback?.time}</span>
                              </div>
                              <div style={{ marginLeft: 'auto' }}>
                                <Tag color="geekblue">
                                  今日心情: {currentFeedback?.emoji} {currentFeedback?.mood}
                                </Tag>
                              </div>
                            </div>
                            <div style={{
                              color: '#fff',
                              fontSize: 13,
                              lineHeight: '1.7',
                              whiteSpace: 'pre-wrap',
                              background: 'rgba(6, 11, 25, 0.3)',
                              padding: '12px 16px',
                              borderRadius: 6,
                              border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                              {currentFeedback?.aiFeedback}
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Button onClick={handleResetCheckInForm} className="cyber-btn">
                              开启新的成长打卡
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Timeline Check-in History */}
                    <div className="cyber-card" style={{ marginBottom: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FieldTimeOutlined style={{ color: 'var(--cyber-primary)' }} /> 历史情绪打卡轨迹 ({checkInHistory.length} 次打卡)
                      </div>

                      {checkInHistory.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--cyber-text-muted)' }}>
                          暂无打卡记录。
                        </div>
                      ) : (
                        <div style={{ maxHeight: 300, overflowY: 'auto', paddingRight: 6 }}>
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
                                    <span style={{ fontSize: 18 }}>{item.emoji}</span>
                                    <span style={{ fontWeight: '600', color: '#fff', fontSize: 13 }}>{item.mood}</span>
                                  </div>
                                  <div style={{ fontSize: 12, color: 'var(--cyber-text)', marginBottom: 8 }}>
                                    <b>打卡日记：</b>{item.diary}
                                  </div>
                                  {item.goals && item.goals.length > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                                      <span style={{ color: 'var(--cyber-text-muted)', fontSize: 11 }}>明日目标：</span>
                                      {item.goals.map((g, idx) => (
                                        <Tag key={idx} color="purple" style={{ fontSize: 10 }}>{g}</Tag>
                                      ))}
                                    </div>
                                  )}
                                  <div style={{
                                    background: 'rgba(167, 139, 250, 0.05)',
                                    border: '1px solid rgba(167, 139, 250, 0.12)',
                                    borderRadius: 6,
                                    padding: '8px',
                                    fontSize: 11,
                                    color: 'rgba(255,255,255,0.85)'
                                  }}>
                                    <div style={{ color: 'var(--cyber-secondary)', fontWeight: 'bold', marginBottom: 2 }}><RobotOutlined /> AI 专属反馈语：</div>
                                    <div style={{ whiteSpace: 'pre-wrap' }}>{item.aiFeedback}</div>
                                  </div>
                                </div>
                              </Timeline.Item>
                            ))}
                          </Timeline>
                        </div>
                      )}
                    </div>
                  </Col>

                  {/* Right sub-column: AI chatbot treehole */}
                  <Col xs={24} lg={9}>
                    <div className="cyber-card" style={{ height: 600, display: 'flex', flexDirection: 'column', marginBottom: 0 }}>
                      <div className="cyber-card-header" style={{ marginBottom: 12 }}>
                        <span>AI 情绪成长守护树洞</span>
                        <Tag color="purple">智能匿名畅聊</Tag>
                      </div>

                      <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        background: 'rgba(6, 11, 25, 0.4)',
                        borderRadius: 6,
                        border: '1px solid rgba(0, 242, 254, 0.1)',
                        padding: '12px',
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
                              AI导师正在输入中...
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <TextArea
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="跟树洞说些心里话吧..."
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
                          style={{ height: 'auto', alignSelf: 'stretch' }}
                        />
                      </div>
                    </div>
                  </Col>
                </Row>
              )
            },
            {
              key: 'assessment',
              label: (
                <span>
                  <TrophyOutlined /> 自测中心 (20题自测)
                </span>
              ),
              children: (
                <div style={{ marginTop: 16, maxWidth: 800, margin: '16px auto' }}>
                  {!testResult ? (
                    <div>
                      {/* Upgraded Progress Indicator */}
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--cyber-text-muted)', fontSize: 13, marginBottom: 8 }}>
                          <span>评测进度：第 {currentStep + 1} / {activeQuestions.length} 题</span>
                          <span>已完成 {Math.round((currentStep / activeQuestions.length) * 100)}%</span>
                        </div>
                        <Progress
                          percent={Math.round((currentStep / activeQuestions.length) * 100)}
                          status="active"
                          strokeColor={{ '0%': '#00f2fe', '100%': '#8b5cf6' }}
                          trailColor="rgba(255,255,255,0.05)"
                          showInfo={false}
                        />
                      </div>

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

                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button disabled={currentStep === 0} onClick={handlePrev}>
                          上一题
                        </Button>
                        
                        {currentStep < activeQuestions.length - 1 ? (
                          <Button type="primary" className="cyber-btn" onClick={handleNext}>
                            下一题
                          </Button>
                        ) : (
                          <Button type="primary" className="cyber-btn cyber-btn-purple" onClick={handleSubmitTest}>
                            提交量表评测
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                      <CheckCircleOutlined style={{ fontSize: 50, color: '#05f3ad', marginBottom: 16 }} />
                      <h3 style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>评测分析已生成</h3>
                      
                      <div style={{ width: 200, margin: '20px auto' }}>
                        <span style={{ fontSize: 12, color: 'var(--cyber-text-muted)' }}>综合情感能量得分</span>
                        <Progress
                          type="circle"
                          percent={testResult.score}
                          strokeColor={{ '0%': '#8b5cf6', '100%': '#00f2fe' }}
                          trailColor="rgba(255,255,255,0.05)"
                          width={100}
                          style={{ marginTop: 8 }}
                        />
                      </div>

                      <Alert
                        message={`您的心理状态评估等级：${testResult.risk}`}
                        description={testResult.msg}
                        type={testResult.score >= 65 ? 'success' : 'warning'}
                        showIcon
                        style={{
                          background: 'rgba(10, 20, 45, 0.6)',
                          borderColor: 'var(--cyber-border)',
                          textAlign: 'left',
                          color: '#fff',
                          marginBottom: 24
                        }}
                      />

                      <Button onClick={handleRestartTest} className="cyber-btn">
                        重新测评量表
                      </Button>
                    </div>
                  )}
                </div>
              )
            },
            {
              key: 'tasks',
              label: (
                <span>
                  <ScheduleOutlined /> 成长计划与任务
                </span>
              ),
              children: (
                <div style={{ marginTop: 16 }}>
                  <div style={{ color: 'var(--cyber-text-muted)', fontSize: 13, marginBottom: 16 }}>
                    下方是教师或管理员专门为您（或您所在的班级）布置的成长任务，请积极参与并完成，点击右侧完成打卡并填写反馈。
                  </div>

                  {myTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--cyber-text-muted)' }}>
                      🎉 暂无专属您的成长管理任务，放松心情也是一种成长！
                    </div>
                  ) : (
                    <List
                      dataSource={myTasks}
                      renderItem={(task) => (
                        <Card
                          key={task.id}
                          className="cyber-card"
                          style={{ marginBottom: 14, borderColor: task.status === '已完成' ? 'var(--cyber-success)' : 'var(--cyber-border)' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <Space>
                                <span style={{ fontSize: 15, fontWeight: 'bold', color: '#fff' }}>
                                  <BookOutlined style={{ color: 'var(--cyber-primary)' }} /> {task.taskName}
                                </span>
                                <Tag color={task.status === '已完成' ? 'green' : 'gold'}>
                                  {task.status}
                                </Tag>
                              </Space>
                              <div style={{ fontSize: 11, color: 'var(--cyber-text-muted)', marginTop: 4 }}>
                                布置时间: {task.date} | 针对班级: {task.className || '全体'}
                              </div>
                            </div>
                            
                            {task.status === '已完成' ? (
                              <Badge status="success" text="已反馈归档" style={{ color: 'var(--cyber-success)' }} />
                            ) : (
                              <span style={{ color: 'var(--cyber-secondary)', fontSize: 12 }}>
                                待反馈打卡完成
                              </span>
                            )}
                          </div>

                          <Divider style={{ margin: '12px 0', borderColor: 'rgba(255,255,255,0.06)' }} />

                          {task.status === '已完成' ? (
                            <div style={{ background: 'rgba(5, 243, 173, 0.05)', padding: '10px 14px', borderRadius: 6, border: '1px solid rgba(5, 243, 173, 0.15)', fontSize: 12 }}>
                              <span style={{ color: 'var(--cyber-success)', fontWeight: 'bold' }}>我的反馈：</span>
                              <span style={{ color: '#fff' }}>{task.feedback}</span>
                            </div>
                          ) : (
                            <div style={{ marginTop: 8 }}>
                              <TextArea
                                rows={2}
                                placeholder="输入您完成此任务的自我心得与情绪改变（如：今天跑了步，出了很多汗，精神饱满了很多）"
                                value={taskFeedbackTexts[task.id] || ''}
                                onChange={(e) => setTaskFeedbackTexts({ ...taskFeedbackTexts, [task.id]: e.target.value })}
                                style={{ marginBottom: 10 }}
                              />
                              <Button
                                type="primary"
                                size="small"
                                className="cyber-btn"
                                icon={<CheckOutlined />}
                                onClick={() => handleCompleteTask(task.id)}
                              >
                                提交成长反馈并打卡完成
                              </Button>
                            </div>
                          )}
                        </Card>
                      )}
                    />
                  )}
                </div>
              )
            },
            {
              key: 'trends',
              label: (
                <span>
                  <LineChartOutlined /> 个人趋势与资料
                </span>
              ),
              children: (
                <Row gutter={[20, 20]} style={{ marginTop: 16 }}>
                  {/* Left Column: Mood Trend ECharts */}
                  <Col xs={24} md={14}>
                    <div className="cyber-card" style={{ height: 420, display: 'flex', flexDirection: 'column' }}>
                      <div className="cyber-card-header">
                        <span>个人历史心情颜色成长趋势轨迹</span>
                      </div>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <div ref={trendChartRef} style={{ height: '340px', width: '100%' }}></div>
                      </div>
                    </div>
                  </Col>

                  {/* Right Column: Profile editing card */}
                  <Col xs={24} md={10}>
                    <div className="cyber-card" style={{ height: 420, display: 'flex', flexDirection: 'column' }}>
                      <div className="cyber-card-header" style={{ marginBottom: 16 }}>
                        <span>个人心理档案设置卡片</span>
                      </div>
                      
                      <Form
                        form={profileForm}
                        layout="vertical"
                        onFinish={handleSaveProfile}
                        style={{ flex: 1, overflowY: 'auto', paddingRight: 6 }}
                      >
                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item name="nickname" label="我的显示昵称" rules={[{ required: true, message: '昵称不能为空' }]}>
                              <Input />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="gender" label="我的性别">
                              <Radio.Group>
                                <Radio value="男" style={{ color: '#fff' }}>男</Radio>
                                <Radio value="女" style={{ color: '#fff' }}>女</Radio>
                              </Radio.Group>
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item name="className" label="当前班级设置">
                              <Select>
                                <Select.Option value="高一1班">高一1班</Select.Option>
                                <Select.Option value="高一2班">高一2班</Select.Option>
                                <Select.Option value="高二1班">高二1班</Select.Option>
                                <Select.Option value="高三4班">高三4班</Select.Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="avatar" label="成长心情头像 (Emoji)">
                              <Select>
                                <Select.Option value="😊">😊 快乐</Select.Option>
                                <Select.Option value="😎">😎 自信</Select.Option>
                                <Select.Option value="🧐">🧐 思考</Select.Option>
                                <Select.Option value="💪">💪 努力</Select.Option>
                                <Select.Option value="🦄">🦄 独特</Select.Option>
                                <Select.Option value="🍀">🍀 幸运</Select.Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item name="bio" label="我的成长宣言/座右铭">
                          <TextArea rows={2} />
                        </Form.Item>

                        <Form.Item>
                          <Button type="primary" htmlType="submit" className="cyber-btn" style={{ width: '100%' }}>
                            保存个人档案设置
                          </Button>
                        </Form.Item>
                      </Form>
                    </div>
                  </Col>
                </Row>
              )
            }
          ]}
        />
      </div>
    </div>
  )
}
