# Implementation Plan - Student Drafts, Settings, Account Cancellation, and Full Profiles

This plan outlines the implementation details for the 5 requested features:
1. Removing all demo students except `默认学生` (with self-healing local storage logic to clean up old browser records).
2. Implementing a "Save Draft/Restore Draft" system for both **量表测评 (Psychological Test)** and **情绪打卡 (Mood Check-in)**.
3. Adding a secure **账号注销 (Account Cancellation)** function.
4. Enhancing the teacher/admin **学生管理** details drawer to show the complete account profile.
5. Adding a **学生资料及用户设置 (Student Settings)** sidebar menu and view allowing students to edit their details, mock-bind WeChat/QQ/Email, and cancel their accounts.

---

## User Review Required

> [!IMPORTANT]
> **Data Self-Healing**: The app will automatically scan `localStorage` for previous mock student names ("张三", "李四", "王五", "赵六", "孙七") and remove them on startup to clean up the database, preserving only `默认学生` and user-registered accounts.
> **Account Cancellation Action**: Cancelling an account deletes the user credentials and student database entry from `localStorage` permanently. This action will require a safety confirmation modal.

---

## Proposed Changes

### 1. Core State & Storage (`src/App.jsx`)

#### [MODIFY] [App.jsx](file:///c:/Users/Phodon/psychology-admin/src/App.jsx)
- In `UserProvider`, check and filter out any deprecated seed students/records from `studentsList` and `assessmentRecords` in `localStorage` on init.
- Expose a `cancelAccount` context method that removes a user's record from registered accounts and `studentsList` in `localStorage`, clears active sessions, and redirects to `/login`.
- Import and register the new [StudentProfile.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/StudentProfile.jsx) view under the route `/student-profile`.

---

### 2. Sidebar Navigation & Guards (`src/layouts/AdminLayout.jsx`)

#### [MODIFY] [AdminLayout.jsx](file:///c:/Users/Phodon/psychology-admin/src/layouts/AdminLayout.jsx)
- Add **"个人资料设置" (Profile & Settings)** to the `studentMenuItems` sidebar list, pointing to `/student-profile`.
- Update the student route guard logic to allow both `/student-dashboard` and `/student-profile` (otherwise, students are locked out of settings).

---

### 3. Student Dashboard Draft System (`src/views/StudentDashboard.jsx`)

#### [MODIFY] [StudentDashboard.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/StudentDashboard.jsx)
- **Psychological Test Drafts**:
  - Add a **"暂存草稿"** button next to test navigation buttons.
  - Save progress (`currentStep` and `answers`) to `localStorage.getItem('testDraft_' + username)`.
  - On loading the test card, prompt the student if they want to restore or delete an existing draft.
- **Mood Check-in Drafts**:
  - Add a **"存为草稿"** button inside the mood logger.
  - Save draft fields (`selectedMood`, `diaryText`, `goals`) to `localStorage.getItem('diaryDraft_' + username)`.
  - Automatically load/pre-fill and notify the student if a draft is available when opening the check-in panel.

---

### 4. Complete Profile Details (`src/views/StudentList.jsx` & `src/views/AssessmentRecords.jsx`)

#### [MODIFY] [StudentList.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/StudentList.jsx)
- Filter out deprecated mock students on state load.
- In the "详情档案" drawer, add a new detailed section **"学生账号与基本资料" (Student Account & Details)** containing Username, ID Card, School, School Stage, Counselor, Biography, and bound account labels.

#### [MODIFY] [AssessmentRecords.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/AssessmentRecords.jsx)
- Clean up old mock student test history from state load.

---

### 5. [NEW] Student Profile & Settings Page (`src/views/StudentProfile.jsx`)

#### [NEW] [StudentProfile.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/StudentProfile.jsx)
- Implement a premium, responsive settings view for students:
  - **资料修改 (Edit Profile)**: Form to edit nickname, school, ID card, and biography.
  - **安全修改 (Update Password)**: Fields to set a new password.
  - **社交账号绑定 (Social Accounts Binding)**:
    - **WeChat (微信)**: Shows status ("未绑定" / "已绑定 WeChat_User") with interactive QR Code binding/unbinding mock modals.
    - **QQ**: Similar mock binding actions.
    - **Email (邮箱)**: Editable input to save email address.
  - **账号注销 (Account Cancellation)**: A red danger zone with a "注销账号" button that verifies confirmation and invokes `cancelAccount`.

---

## Verification Plan

### Automated Verification
- Run compilation checks to verify correct bundling:
  ```bash
  npm run build
  ```

### Manual Verification
1. **Database Cleanup**: Log in as a teacher (`teacher`/`123`), navigate to **学生管理** and check if only `默认学生` is present.
2. **Student settings & Binding**: Log in as student (`student`/`123`), click **个人资料设置** on the sidebar:
   - Edit name, school, or bio. Save and check if it persists.
   - Click "立即绑定" for WeChat. Check if the QR code modal pops up, click "已扫描确认" and verify it switches status to "已绑定". Verify unbinding works.
3. **Draft saving & recovery**:
   - Go to **心理成长空间**, open the psychological test, answer 3 questions, click **暂存草稿**, refresh the browser, click "恢复进度" and check if it returns to question 4.
   - Open check-in, select "开心" emoji, write some diary draft text, click **存为草稿**, switch tabs, come back, and check if the draft restores automatically.
4. **Account Cancellation**:
   - In student settings, scroll to the bottom, click **注销账号**, confirm the warning, and verify it automatically logs out, redirects to login, and deletes the student record from the teacher's list.
