# 变更总结 — EmotionGrowth AI V1.1.0

## 修改文件清单

| 文件 | 变更内容 |
|---|---|
| [App.jsx](file:///c:/Users/Phodon/psychology-admin/src/App.jsx) | 测试账户数据清空 + getUserLogs 方法 + 账户防丢双重备份与合并更新逻辑 |
| [Login.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/Login.jsx) | 新增"找回与恢复账户中心"弹窗，支持信息找回密保、重置密码与导入导出 JSON 备份 |
| [StudentDashboard.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/StudentDashboard.jsx) | 打卡历史数据隔离 + ECharts ResizeObserver 修复 |
| [StudentCounseling.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/StudentCounseling.jsx) | 反思日记数据隔离 |
| [StudentMusic.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/StudentMusic.jsx) | 音乐推荐读取用户级打卡历史 |
| [AdminLayout.jsx](file:///c:/Users/Phodon/psychology-admin/src/layouts/AdminLayout.jsx) | Ant Design Tour 新手引导 + 版本号更新 |
| [About.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/About.jsx) | 更新日志 + 用户反馈功能（重写） |

---

## 1. 注册用户信息防丢与系统更新保护

为了确保系统代码更新或部署不会丢失已注册的账户数据，并在极端情况下（如清理浏览器缓存）支持找回账户，我们实现了以下安全机制：
- **更新合并算法 (Update Merge)**：在 [App.jsx](file:///c:/Users/Phodon/psychology-admin/src/App.jsx) 中重构了用户初始化逻辑。系统启动时会把现有的用户列表与系统预设的默认账户进行平滑合并，**绝不直接重置或覆盖已注册的用户**，从而保证版本更新时的注册信息绝对安全。
- **双重备份机制 (Dual-Key Backup)**：每次更新用户列表时，系统会自动在 `localStorage` 写入两个不同的 Key (`registeredUsers` 和 `registeredUsers_backup`)。若其中一个被破坏，系统会自动从备份恢复，防止非预期数据丢失。
- **文件导出备份 (File Export)**：在登录界面增加了**用户数据备份导出**功能，用户可以将所有注册账户一键导出为 `json` 文件进行物理保存。
- **一键导入恢复 (File Import)**：用户可以通过上传备份的 `json` 备份文件，瞬间恢复和合并全部注册账号。

---

## 2. 忘记密码 & 找回与恢复账户功能

我们在登录页面添加了 **忘记密码 / 找回与恢复账户** 安全选项：
- **信息核对找回**：用户通过输入“角色 + 账户名 + 姓名/昵称”及“学校信息（仅学生）”，系统匹配成功后即可立即查看当前秘钥/密码，并支持在弹窗中**当场重置新密码**直接登录。
- **备份一键恢复**：无缝解析导入的备份 JSON 文件并合并至系统用户库中。

---

## 3. 数据隔离修复
- `moodCheckInHistory` → `moodCheckInHistory_${userInfo.id}`
- `reflectiveLogs` → `reflectiveLogs_${userInfo.id}`
- 默认 seed 数据仅对内置学生账号（id='1'）注入，新注册账号从空白开始。
- 音乐推荐引擎也改为读取用户级 key。
- 徽章检查（呼吸练习）改为读取用户级 key。
- 新增 `getUserLogs()` 方法用于按用户过滤审计日志。

---

## 4. 新手引导
- 使用 Ant Design `Tour` 组件实现 **7 步引导流程**。
- 首次登录（`onboardingDone_${userId}` 未设置）自动触发，延迟 800ms 确保 DOM 已渲染。

---

## 5. 默认测试账户清空
- 登录 `student` 账号时自动清除：打卡历史、反思日记、日记草稿、测试草稿、音乐收藏等，并重置任务。

---

## 6. 更新日志 & 用户反馈
- **更新日志**：Timeline 展示 V1.1.0 和 V1.0.0 的详细变更条目。
- **用户反馈**：TextArea 输入 → 保存到 `userFeedbacks` localStorage → 列表展示（支持删除）。

---

## 7. ECharts resize bug 修复
- 使用 `ResizeObserver` 配合 150ms 延迟彻底解决从打卡日记 Tab 切回面板时图表缩缩成一团的问题。

---

## 验证结果
- ✅ `npm run build` 构建成功，无报错。
