# Implementation Plan - Upgraded Student Space, Separate Assessment, and Counseling Centers

This plan details the updates to restructure the student workspace into a highly aesthetic, responsive, and gamified experience:
1. **Separate Assessment**: Move the 20-question psychological test into a dedicated `/student-assessment` page, renamed as **"心理测评中心" (Psychological Assessment Center)**.
2. **Dashboard Refactoring**: Remove personal profiles from the dashboard tabs (redundant with the settings page), leaving only the trend charts and growth statistics.
3. **Counseling Center**: Create an interactive `/student-counseling` page with bubble breathing exercises, guided relaxation cards, a mock white noise player, and daily reflective logs.
4. **Goal Management**: Create an interactive `/student-goals` page to view active tasks, set goals, review achievement statistics, and write self-feedback logs.
5. **Growth Diary Upgrades**: Upgrade the check-in diary to support mock voice input (transcription and wave animations) and mock image uploads (photo thumbnails), displaying AI-extracted keywords and recommendation badges after submission.
6. **Gamified Growth Panel**: Render active days, self-adjustment completion rates, and an interactive grid of glowing **"成长徽章"** (Growth Badges).
7. **Empathetic AI Chat**: Add quick-click suggestion chips under the treehole chatbot for instant counseling advice, positive reinforcing quotes, and study stress reduction tips.

---

## User Review Required

> [!IMPORTANT]
> **View Split**: Moving the test to the left sidebar menu (renamed as **心理测评中心**) allows us to create independent views.
> **Mock Uploads**: Voice transcription and image selection are simulated with fully functional UI micro-animations and previews to maintain local, frontend-only fidelity.
> **Route Guard Expansion**: The sidebar layout route guard will be updated to whitelist the three new routes: `/student-assessment`, `/student-counseling`, and `/student-goals`.

---

## Proposed Changes

### 1. Routing & Layout (`App.jsx` & `AdminLayout.jsx`)

#### [MODIFY] [App.jsx](file:///c:/Users/Phodon/psychology-admin/src/App.jsx)
- Import the three new views: `StudentAssessment`, `StudentCounseling`, and `StudentGoals`.
- Register Route pathways:
  - `<Route path="student-assessment" element={<StudentAssessment />} />`
  - `<Route path="student-counseling" element={<StudentCounseling />} />`
  - `<Route path="student-goals" element={<StudentGoals />} />`

#### [MODIFY] [AdminLayout.jsx](file:///c:/Users/Phodon/psychology-admin/src/layouts/AdminLayout.jsx)
- Update `studentMenuItems` sidebar menu keys:
  - **心理成长空间** (`/student-dashboard`, SlidersOutlined)
  - **心理测评中心** (`/student-assessment`, FileTextOutlined)
  - **情绪疏导中心** (`/student-counseling`, HeartOutlined)
  - **自我反馈与目标** (`/student-goals`, TrophyOutlined)
  - **个人资料设置** (`/student-profile`, UserOutlined)
- Expand route guard whitelisted pathways for students.

---

### 2. Main Dashboard Upgrade (`src/views/StudentDashboard.jsx`)

#### [MODIFY] [StudentDashboard.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/StudentDashboard.jsx)
- **Tab 1: 个人成长面板 (Growth Panel)**:
  - Remove personal description details.
  - Render a statistics dashboard: positive check-in streak, self-adjustment rate, and goal completion rate.
  - Render **"成长徽章" (Growth Badges)** grid displaying badges like `🌟 心理探索先锋`, `🛡️ 情绪成长卫士`, `🧘 呼吸觉察行者`, `🔥 目标践行达人`.
- **Tab 2: 今日情绪成长打卡 (Growth Diary)**:
  - Add **🎙️ 语音输入** button (pop up animation modal and transcribe simulated text).
  - Add **🖼️ 情绪配图** (file inputs with picture preview).
  - Modify AI report to print **"AI 提炼日记关键词" (Tags)** and direct links pointing to breathing exercises or target management.
- **Tab 3: AI陪伴树洞 (Treehole Chat)**:
  - Add suggestions chips (*"如何缓解学业压力？"*, *"安慰一下我"*, *"今天有放松练习推荐吗？"*) for quick chat interactions.

---

### 3. [NEW] Views Creation

#### [NEW] [StudentAssessment.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/StudentAssessment.jsx)
- Dedicated 20-question self-assessment logic, draft recovery alert, score reporting, and historical results listing.

#### [NEW] [StudentCounseling.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/StudentCounseling.jsx)
- **Breathing Trainer**: CSS animation scaling a bubble for "吸气-呼气" pacing.
- **White Noise Player**: Play list of tracks with active audio equalizer styling.
- **Reflective Logs**: Interactive slider deck to submit responses to local logs.
- **Relaxation Guides**: muscle and mindfulness meditation text card decks.

#### [NEW] [StudentGoals.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/StudentGoals.jsx)
- Dashboard managing tomorrow's goals and checklist tasks.
- Allow toggle, submit self-feedback logs, and view completion rates.

---

## Verification Plan

### Automated Verification
- Run production bundle compilation:
  ```bash
  npm run build
  ```

### Manual Verification
1. **Sidebar Navigation**: Log in as `student` and click each of the 5 sidebar links. Verify no routes crash and the correct page header is shown.
2. **Growth Diary**: Type or click audio transcription, select a dummy photo, and click submit. Verify AI tags and counseling links are rendered.
3. **Assessment Center**: Answer questions, save a draft, navigate away, return, restore the draft, complete and submit. Check if the historical scores record updates.
4. **Counseling Center**: Try the breathing trainer, press play on forest rain white noise, check the animation, and answer a daily reflection prompt.
5. **Goals Management**: Toggle goals and write reflection notes.
