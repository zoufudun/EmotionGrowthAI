import React, { useState } from 'react'
import { Button, Table, Card, Tag, Space, Modal, Form, Input, Select, message } from 'antd'
import { PlusOutlined, EditOutlined, PoweroffOutlined, PhoneOutlined } from '@ant-design/icons'

const { Option } = Select

export default function TeacherList() {
  const [teachers, setTeachers] = useState([
    { id: 1, name: '陈老师', phone: '13800000001', classes: '高一1班、高一2班', status: '启用' },
    { id: 2, name: '刘老师', phone: '13800000002', classes: '高二1班', status: '启用' },
    { id: 3, name: '张老师', phone: '13800000003', classes: '高三4班', status: '禁用' }
  ])

  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [editingTeacher, setEditingTeacher] = useState(null)

  const showAddModal = () => {
    setEditingTeacher(null)
    form.resetFields()
    setModalVisible(true)
  }

  const showEditModal = (teacher) => {
    setEditingTeacher(teacher)
    form.setFieldsValue({
      name: teacher.name,
      phone: teacher.phone,
      classes: teacher.classes,
      status: teacher.status
    })
    setModalVisible(false) // Trigger a reset to ensure modal content update
    setTimeout(() => setModalVisible(true), 50)
  }

  const handleToggleStatus = (id) => {
    const updated = teachers.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === '启用' ? '禁用' : '启用'
        message.success(`已成功【${nextStatus}】教师 ${t.name}`)
        return { ...t, status: nextStatus }
      }
      return t
    })
    setTeachers(updated)
  }

  const handleModalSubmit = (values) => {
    if (editingTeacher) {
      // Update
      const updated = teachers.map(t => {
        if (t.id === editingTeacher.id) {
          return { ...t, ...values }
        }
        return t
      })
      setTeachers(updated)
      message.success('修改成功')
    } else {
      // Create
      const newTeacher = {
        id: teachers.length > 0 ? Math.max(...teachers.map(t => t.id)) + 1 : 1,
        name: values.name,
        phone: values.phone,
        classes: values.classes,
        status: values.status || '启用'
      }
      setTeachers([...teachers, newTeacher])
      message.success('新增成功')
    }
    setModalVisible(false)
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '教师姓名', dataIndex: 'name', key: 'name' },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (
        <Space>
          <PhoneOutlined style={{ color: 'var(--cyber-primary)' }} />
          <span>{phone}</span>
        </Space>
      )
    },
    { title: '管理班级', dataIndex: 'classes', key: 'classes' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '启用' ? 'success' : 'default'}>
          {status}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button
            size="small"
            type="primary"
            className="cyber-btn"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          >
            编辑
          </Button>
          <Button
            size="small"
            type="primary"
            className="cyber-btn cyber-btn-purple"
            icon={<PoweroffOutlined />}
            danger={record.status === '启用'}
            onClick={() => handleToggleStatus(record.id)}
          >
            {record.status === '启用' ? '禁用' : '启用'}
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header-container">
        <div>
          <div className="page-title">咨询师/教师管理</div>
          <div className="page-subtitle">管理心理评测系统的教师角色与负责辖区</div>
        </div>
        <Button
          type="primary"
          className="cyber-btn"
          icon={<PlusOutlined />}
          onClick={showAddModal}
        >
          新增教师
        </Button>
      </div>

      {/* Table List */}
      <div className="cyber-card" style={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={teachers}
          rowKey="id"
          pagination={false}
        />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        title={editingTeacher ? '编辑教师信息' : '录入新教师/咨询师'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleModalSubmit}
          initialValues={{ status: '启用' }}
        >
          <Form.Item
            name="name"
            label="教师姓名"
            rules={[{ required: true, message: '请输入教师真实姓名' }]}
          >
            <Input placeholder="输入姓名，例：张老师" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="联系手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入合法的手机号格式' }
            ]}
          >
            <Input placeholder="输入11位电话号码" />
          </Form.Item>

          <Form.Item
            name="classes"
            label="负责管辖班级"
            rules={[{ required: true, message: '请配置教师负责的管辖班级' }]}
          >
            <Input placeholder="输入班级，多班级以顿号隔开，例：高一1班、高一2班" />
          </Form.Item>

          <Form.Item name="status" label="系统账号状态">
            <Select>
              <Option value="启用">启用</Option>
              <Option value="禁用">禁用</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" className="cyber-btn">
                提交保存
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
