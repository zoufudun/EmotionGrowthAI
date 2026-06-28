# Implementation Plan - Enhancing Data Isolation, Dynamic Class Management, and Real-time Alerts

This plan outlines the changes required to meet the user's requirements:
1. Retaining only the default student ("默认学生") and default teacher ("陈老师") in the student/teacher lists.
2. Enabling teachers to create classes, providing grouped class options (Elementary, Junior High, Senior High, University - 15 classes each) or manual input during registration, and collecting school name and ID card number.
3. Making the teacher's dashboard "Real-time Abnormal Events" section dynamically display warning events when students get abnormal test scores.

---

## User Review Required

> [!IMPORTANT]
> **Data Reset**: The changes will reset `localStorage` seed keys (`studentsList`, `teachersList`) on first load to remove the previous mock students and teachers, keeping only the defaults. Any locally created mock students (like "李四", "王五", etc.) will be replaced by the clean default seed unless new ones are registered.
> **Teacher Menu Upgrade**: Teachers will now have access to a new menu item, **"班级管理" (Class Management)** (routing to `/classes`), which was previously an admin-only "班级统计" page. This enables teachers to manage and create classes.

---

## Proposed Changes

### 1. User Context & Storage (`src/App.jsx`)

#### [MODIFY] [App.jsx](file:///c:/Users/Phodon/psychology-admin/src/App.jsx)
- Update `register` to accept `school` and `idCard` for students, storing them in both the registered user list and the `studentsList` in `localStorage`.
- Update the default seed list in `register` to contain only the default student (ID 1, "默认学生").

---

### 2. Login & Registration View (`src/views/Login.jsx`)

#### [MODIFY] [Login.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/Login.jsx)
- Add new fields in the "新生注册" (Student Registration) form:
  - **所属学校 (School)**: Using an `AutoComplete` input with pre-filled default schools and custom typing support.
  - **身份证号 (ID Card)**: Using an `Input` field with format validation.
  - **学段组别 (Group)**: Using a `Select` dropdown with options: `小学组`, `初中组`, `高中组`, `大学组`, `其他/自定义`.
  - **所属班级 (Class)**: Using an `AutoComplete` dropdown that dynamically shows the 15 default classes of the selected group (plus any custom teacher-created classes in that group) while allowing manual text typing.

---

### 3. Student Management View (`src/views/StudentList.jsx`)

#### [MODIFY] [StudentList.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/StudentList.jsx)
- Clean up the seed data in `studentsList` to only keep `默认学生`.
- Add **所属学校 (School)** and **身份证号 (ID Card)** to:
  - The main table columns.
  - The "详情档案" (Detail Profile) drawer descriptions.

---

### 4. Teacher Management View (`src/views/TeacherList.jsx`)

#### [MODIFY] [TeacherList.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/TeacherList.jsx)
- Initialize the `teachers` list by loading from `localStorage.getItem('teachersList')` with a fallback seed containing only the default teacher ("陈老师").
- Write updates to `localStorage.getItem('teachersList')` whenever teachers are added, edited, or disabled.

---

### 5. Class Statistics & Management View (`src/views/ClassStatistics.jsx`)

#### [MODIFY] [ClassStatistics.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/ClassStatistics.jsx)
- Add a **"新建班级" (Create Class)** button and modal, allowing teachers or admins to create a class with a name, group category, and school name.
- Save created classes to `localStorage.getItem('classList')`.
- Compute class statistics (student count, warning count, average score) dynamically by combining the `classList` with the students in `studentsList`.
- Update the comparison charts to load data dynamically from the calculated database instead of using static mock values.

---

### 6. Digital Dashboard View (`src/views/Dashboard.jsx`)

#### [MODIFY] [Dashboard.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/Dashboard.jsx)
- Load `alerts` dynamically from `studentsList` in `localStorage` by filtering for students whose risk level is not "正常".
- Connect the top numerical stats (students count, teachers count, class count) to the actual data in `localStorage`.
- Dynamically toggle the "智能监控警报" (Warning Banner) to show a warning when there are alerts, or a success banner ("No abnormal events detected") when `alerts.length === 0`.

---

### 7. Layout Sidebar Menu (`src/layouts/AdminLayout.jsx`)

#### [MODIFY] [AdminLayout.jsx](file:///c:/Users/Phodon/psychology-admin/src/layouts/AdminLayout.jsx)
- Expose the `/classes` route in `teacherMenuItems` as **"班级管理"**, enabling teachers to view and create classes.

---

## Verification Plan

### Automated Build Verification
- Propose a production build command to check for any compilation issues:
  ```bash
  npm run build
  ```

### Manual Verification
1. **Initial Clean Screen**: Log in as a teacher (`teacher`/`123`) or admin (`admin`/`123`), navigate to **学生管理** and verify only "默认学生" is present, and to **教师管理** to verify only "陈老师" is present.
2. **Class Management**: Navigate to **班级管理**, click **新建班级** to add a new class (e.g. `高中(16)班` under `高中组` at `山海星空高级中学`). Verify it shows up in the list with 0 students.
3. **Student Registration**: Log out, go to **新生注册**, fill in details:
   - Name: `测试学生`
   - School: Select `山海星空高级中学` or type a custom name
   - ID Card: Enter a valid 18-digit ID
   - Group: Select `高中组`
   - Class: Verify the dropdown shows `高中(1)班` to `高中(15)班` as well as the newly created `高中(16)班`, or type a custom one.
   - Complete registration and log in.
4. **Dynamic Alerts**: Log in as the new student, take the psychological test, and answer negatively to get a low score (e.g., < 45, resulting in `重点关注`). Log out, log in as `teacher`, and verify that the student name, class, and warning details show up immediately in the **实时异常情绪事件** section of the home dashboard.
