# Implementation Plan - Heart Music House, Web Audio Synthesizer, Seed Data Populating, and Expanded Daily Check-in

This plan details the updates to implement the Heart Music House view, integrate real Web Audio sound generation, expand the student's daily check-in diary parameters, and pre-populate goal task data.

---

## User Review Required

> [!IMPORTANT]
> **Web Audio Synthesizer**: To avoid loading heavy audio files or depending on external networks, we will synthesize sounds (rain, forest wind, ocean swells, and alpha/theta binaural waves) directly in the browser using the **Web Audio API**. This runs offline and outputs real sound.
> **Goal Syncing**: We will populate sample seed tasks for `默认学生` inside `App.jsx` so the goals list is not empty on startup.
> **Before-and-After Analysis**: The Music House will log pre-play and post-play mood scores (1-10) and display a chart summarizing the effectiveness of relaxing sessions.

---

## Proposed Changes

### 1. App Navigation & Routing (`App.jsx` & `AdminLayout.jsx`)

#### [MODIFY] [App.jsx](file:///c:/Users/Phodon/psychology-admin/src/App.jsx)
- Import the new view `StudentMusic` from `./views/StudentMusic.jsx`.
- Register the route: `<Route path="student-music" element={<StudentMusic />} />`.
- Pre-populate seed goals (`assignedTasks` in `localStorage`) for `默认学生` if not present.

#### [MODIFY] [AdminLayout.jsx](file:///c:/Users/Phodon/psychology-admin/src/layouts/AdminLayout.jsx)
- Add **心灵音乐屋** (`/student-music`, CustomerServiceOutlined) to `studentMenuItems` sidebar.
- Whitelist `/student-music` in the route guard whitelist.

---

### 2. Upgraded Daily check-in (`src/views/StudentDashboard.jsx`)

#### [MODIFY] [StudentDashboard.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/StudentDashboard.jsx)
- Expand the check-in form to collect:
  - **当前情绪 (Current Mood)** (color buttons).
  - **强度 (Intensity)** (Slider, 1 to 10).
  - **触发原因 (Trigger Cause)** (Select dropdown: 学业压力, 人际关系, 家庭矛盾, 身体疲劳, 其他).
  - **睡眠质量 (Sleep Quality)** (Rate stars, 1 to 5).
  - **学习压力 (Study Stress)** (Slider, 1 to 10).
  - **今日备注 (Today's Notes)** (TextArea diary text).
- Update the check-in record structure to save these fields.
- Modify the ECharts trend logic or rendering if needed.

---

### 3. Web Audio Playback for Counseling (`src/views/StudentCounseling.jsx`)

#### [MODIFY] [StudentCounseling.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/StudentCounseling.jsx)
- Integrate a Web Audio synthesizer class inside `StudentCounseling.jsx` so that clicking the nature white noise play buttons actually outputs real sound in the speakers.

---

### 4. [NEW] 心灵音乐屋 (`src/views/StudentMusic.jsx`)

#### [NEW] [StudentMusic.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/StudentMusic.jsx)
- **Categorized Player**:
  - Class 1: 减压安静 (rain pink noise, brownian sea wave swells, soft beats).
  - Class 2: 针对性修复 (anxiety-relief theta hums, insomnia delta waves, concentration alpha waves).
  - Class 3: Short 3/5/10 min relaxation timers.
- **Sleep Timer**: setTimeout/interval closure to stop sound.
- **Mindfulness Integrations**: Interactive 4-7-8 breathing counter and body scanner.
- **Favorites & Ratings**:
  - Check-in favorites playlist logic.
  - Before-and-after emotional intensity rating logs, displaying average improvement metrics.
- **AI Relax schemes**: Text markdown generation matching active moods.

---

## Verification Plan

### Automated Verification
- Run production bundle compilation:
  ```bash
  npm run build
  ```

### Manual Verification
1. **Goal Verification**: Log in as `student` and click **自我反馈与目标** sidebar item. Verify the three default seed tasks are visible and can be completed.
2. **Audio Verification**: Go to **情绪疏导中心** or **心灵音乐屋**, click play on any white noise or brain wave. Verify sound is audible from the speakers, and the active visual waves animate.
3. **Timer Verification**: Set a 5-second or 1-minute sleep timer in the Music House and verify the audio automatically pauses.
4. **Diary Verification**: Complete a check-in with sliders (sleep quality, study pressure). Verify values render in the timeline.
