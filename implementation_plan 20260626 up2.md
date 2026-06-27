# EmotionGrowth AI 综合系统升级计划

本项目将对心理系统进行全面扩展与升级，英文名改为 **EmotionGrowth AI**。我们将实现学生端注册登录、多角色视图控制、系统审计日志、教师端成长任务与干预记录、以及管理员专用的系统控制面板。

---

## 用户确认事项 (User Review Required)

> [!IMPORTANT]
> 1. **三角色系统切换**：演示角色切换器将升级为支持 **学生端 (student)**、**教师端 (teacher)** 和 **管理员/班主任端 (admin)** 三种角色的快捷切换，便于调试。
> 2. **数据同步与本地持久化**：
>    - 学生注册后，新生成的账号将持久化在 `localStorage` 的 `registeredUsers` 中。
>    - 学生注册信息会自动同步并加入到教师端的学生列表（`studentsList`）中。
>    - 教师端布置的“成长任务”和记录的“干预日志”将保存在 `localStorage`，并在学生端（“成长计划与任务”标签页）和教师端（“干预记录时间轴”）实时渲染。
> 3. **安全审计日志记录**：所有的关键系统操作（如登录、自测、打卡、布置任务、干预记录、AI 参数修改）将全自动产生“登录日志”或“操作日志”，可于管理员控制面板查看并支持模拟导出。

---

## 拟更改文件 (Proposed Changes)

### 核心系统与框架

#### [MODIFY] [App.jsx](file:///c:/Users/Phodon/psychology-admin/src/App.jsx)
- **用户信息持久化**：重构 `UserProvider`，自动初始化默认账号（student、teacher、admin），支持从 `registeredUsers` 校验登录，提供 `register`（用户注册）与 `updateUserInfo`（用户信息设置）接口。
- **任务与日志持久化**：维护 `assignedTasks`（布置的成长任务列表）与 `auditLogs`（安全审计日志）的全局状态及本地存取。
- **路由扩展**：在 `/` 路由下新增管理员面板 `/admin-panel` 路由。
- **角色切换器升级**：将右下角悬浮切换按钮升级为支持三大角色快捷切换的菜单。

#### [MODIFY] [Login.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/Login.jsx)
- **注册模块**：在登录框旁边增加“用户注册”表单页签，支持学生或教师输入账号、密码、昵称、班级、性别、角色进行快速注册。
- **演示辅助**：升级快速通道，提供 admin (管理员)、teacher (教师)、student (学生) 的一键预填功能。
- **标题改名**：修改主标题为 **EmotionGrowth AI**。

#### [MODIFY] [AdminLayout.jsx](file:///c:/Users/Phodon/psychology-admin/src/layouts/AdminLayout.jsx)
- **三色权限菜单**：根据登录用户的角色分别渲染不同的侧边菜单。
  - `student`：仅显示“心理成长空间”。
  - `teacher`：显示“首页看板”、“学生管理”（无删除/修改敏感操作）、“测评记录”、“AI成长建议”。
  - `admin`：显示“首页看板”、“学生管理”、“教师管理”、“班级统计”、“测评记录”、“AI成长建议”以及“系统管理中心”。
- **标题改名**：侧边栏大标题改为 **EmotionGrowth AI**。

#### [MODIFY] [index.html](file:///c:/Users/Phodon/psychology-admin/index.html)
- 修改网页文档标题为 `EmotionGrowth AI`。

---

### 学生端视图升级

#### [MODIFY] [StudentDashboard.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/StudentDashboard.jsx)
- **多功能四标签页重构**：
  1. `🌟 每日成长打卡`：进行每日心情打卡、成长日记（“今天发生了什么”），接收 AI 情绪分析和疏导建议。
  2. `📋 心理自主测评`：进行 20 题随机自测。
  3. `🎯 成长计划与任务`：列出老师为该学生（或其所在班级）布置的成长任务，学生可在此点击“完成任务”并提交“自我反馈”，任务进度会同步。
  4. `📊 个人趋势与资料`：
     - 使用 ECharts 渲染该学生个人的心情成长波动趋势图（基于历史打卡数据）。
     - 提供**个人信息设置卡片**，允许学生随时更新昵称、密码、头像（Emoji）、性别及班级。

---

### 教师端与分析中心升级

#### [MODIFY] [Dashboard.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/Dashboard.jsx)
- 增加 **“班级对比分析”** 模块，以 ECharts 柱状图对比不同班级（高一1班、高一2班等）的异常情绪人数和测评分数。

#### [MODIFY] [StudentList.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/StudentList.jsx)
- **动态学生列表**：读取 `studentsList` 本地存储（同步渲染新注册的学生）。
- **个体学生画像**：整合 ECharts 心情曲线与心理特征雷达图。
- **记录干预与回访**：在学生画像抽屉中新增“添加干预关怀日志”表单与历史干预时间轴，老师可在此登记关怀措施并同步保存。

#### [MODIFY] [AiAdvice.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/AiAdvice.jsx)
- 新增 **“布置成长任务”** 卡片。老师可选择特定班级或学生个人，从预设任务（如认真听讲、主动运动、整理错题等）或自定义任务中进行布置，保存后学生端可立即可见。

---

### 新建管理员控制面板

#### [NEW] [AdminPanel.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/AdminPanel.jsx)
- **系统核心配置面板**，采用标签页划分五大版块：
  1. `班级管理 & 学生导入`：展示各班级的基本心理监控指标；支持模拟一键导入 Excel/CSV 文件建档。
  2. `权限分配 & 角色管理`：列出所有注册的用户，支持管理员动态修改他们的系统角色（学生/教师/管理员）或冻结状态。
  3. `AI模型参数配置`：提供调节温度（Temperature）、生成限制（Max Tokens）、AI 服务商选择、系统 Prompt 模版编辑等高级模型参数配置，影响 AI 情绪打卡反馈效果。
  4. `安全审计日志`：提供全局安全日志表，详细记录系统内的登录日志和操作日志（包含时间、人员、动作类型、详细行为和 IP），支持按人员/时间过滤。
  5. `数据报表导出`：模拟一键生成并导出多维度报表（心理预警名单、测评成绩表、审计日志）为 CSV/JSON 文件。

---

## 验证计划 (Verification Plan)

### 自动化验证
- 运行 `npm run build`，验证项目全部代码编译打包成功。
- 重启开发服务器，访问 `http://localhost:5173/`。

### 手动验证
- **注册登录验证**：
  - 点击登录页“立即注册”，输入测试账号，选择“学生”角色并指定班级，提交注册。
  - 用新注册的账号登录，确认学生端头部正确显示该用户名。
- **学生信息设置**：
  - 在“个人趋势与资料”中修改昵称和性别，点击保存，确认头部导航的头像和昵称已即时更新。
- **教师端数据同步**：
  - 切换到教师端/管理员视角，进入“学生管理”页面，检查列表里是否出现了刚刚新注册的学生，且性别和班级信息完全匹配。
- **任务与干预同步**：
  - 教师端在 `/ai-advice` 中为刚才注册的学生布置成长任务（如“主动运动”）。
  - 教师端在 `/students` 学生详情里为该生记录一条回访干预（如“进行课后面对面心理谈心”）。
  - 切换回该生视角，确认“成长计划与任务”里看到了此任务，且在自测时干预数据已被系统接收。
  - 在学生端点击“完成任务”并提交自我反馈。
- **安全审计日志**：
  - 切换到管理员视角，进入 `/admin-panel` 检查审计日志页，确认所有以上的登录与操作历史（注册账号、修改资料、布置任务、干预日志）均已在表格中被准确记录，并测试日志搜索和报表导出。
