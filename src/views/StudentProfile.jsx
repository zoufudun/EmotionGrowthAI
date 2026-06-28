import React, { useState, useContext, useEffect } from 'react'
import { Form, Input, Button, Card, Radio, message, Row, Col, Divider, Modal, Space, Tag } from 'antd'
import {
  UserOutlined,
  LockOutlined,
  WechatOutlined,
  QqOutlined,
  MailOutlined,
  QrcodeOutlined,
  WarningOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons'
import { UserContext } from '../App.jsx'

export default function StudentProfile() {
  const { userInfo, updateUserInfo, cancelAccount } = useContext(UserContext)
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()
  
  // Modals visibility
  const [wechatModalVisible, setWechatModalVisible] = useState(false)
  const [qqModalVisible, setQqModalVisible] = useState(false)
  const [emailInputVisible, setEmailInputVisible] = useState(false)
  const [emailValue, setEmailValue] = useState(userInfo.email || '')

  useEffect(() => {
    profileForm.setFieldsValue({
      nickname: userInfo.nickname,
      gender: userInfo.gender || '男',
      school: userInfo.school || '',
      idCard: userInfo.idCard || '',
      bio: userInfo.bio || ''
    })
    setEmailValue(userInfo.email || '')
  }, [userInfo, profileForm])

  // Save profile modifications
  const handleSaveProfile = (values) => {
    try {
      updateUserInfo({
        ...userInfo,
        nickname: values.nickname,
        gender: values.gender,
        school: values.school,
        idCard: values.idCard,
        bio: values.bio
      })
      message.success('个人资料更新成功！')
    } catch (e) {
      console.error(e)
      message.error('保存失败，请稍后重试')
    }
  }

  // Save password updates
  const handleSavePassword = (values) => {
    if (values.currentPassword !== userInfo.password) {
      message.error('当前密码输入错误，请重新确认')
      return
    }
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的新密码不一致')
      return
    }

    try {
      updateUserInfo({
        ...userInfo,
        password: values.newPassword
      })
      passwordForm.resetFields()
      message.success('登录密码修改成功，下次登录将启用新密码！')
    } catch (e) {
      console.error(e)
      message.error('密码修改失败')
    }
  }

  // WeChat Mock Actions
  const handleBindWechat = () => {
    setWechatModalVisible(true)
  }

  const handleConfirmWechatBind = () => {
    updateUserInfo({
      ...userInfo,
      wechat: '微信用户_情绪小助手'
    })
    setWechatModalVisible(false)
    message.success('成功绑定微信账号！您已开启微信专属提醒通知')
  }

  const handleUnbindWechat = () => {
    Modal.confirm({
      title: '确认解除微信绑定？',
      content: '解绑后您将无法接收微信提醒通知，确定继续吗？',
      okText: '确认解绑',
      cancelText: '取消',
      onOk() {
        updateUserInfo({
          ...userInfo,
          wechat: '未绑定'
        })
        message.info('微信账号已解除绑定')
      }
    })
  }

  // QQ Mock Actions
  const handleBindQq = () => {
    setQqModalVisible(true)
  }

  const handleConfirmQqBind = () => {
    updateUserInfo({
      ...userInfo,
      qq: 'QQ用户_逆光飞行'
    })
    setQqModalVisible(false)
    message.success('成功绑定 QQ 账号！')
  }

  const handleUnbindQq = () => {
    Modal.confirm({
      title: '确认解除 QQ 绑定？',
      content: '解绑后将切断与 QQ 生态相关的联动数据，确定吗？',
      okText: '确认解绑',
      cancelText: '取消',
      onOk() {
        updateUserInfo({
          ...userInfo,
          qq: '未绑定'
        })
        message.info('QQ 账号已解除绑定')
      }
    })
  }

  // Email Save Action
  const handleSaveEmail = () => {
    if (!emailValue.trim()) {
      message.warning('邮箱内容不能为空')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailValue)) {
      message.error('请输入合法的邮箱地址')
      return
    }

    updateUserInfo({
      ...userInfo,
      email: emailValue
    })
    setEmailInputVisible(false)
    message.success('邮箱绑定成功！')
  }

  // Cancellation Warning Zone
  const handleCancelAccountConfirm = () => {
    Modal.confirm({
      title: <span style={{ color: '#ff4d4f' }}><WarningOutlined /> 确认永久注销账号？</span>,
      content: (
        <div style={{ color: 'var(--cyber-text-muted)', fontSize: 13 }}>
          <p>⚠️ <strong>警告：此操作不可逆！</strong></p>
          <p>注销账号将清除您在此系统的所有数据：</p>
          <ul>
            <li>个人账号登录凭证；</li>
            <li>所有自主心理测评历史分数及成长档案；</li>
            <li>每日情绪打卡日记及AI情绪成长建议。</li>
          </ul>
          <p>您确定要将账号 <strong>{userInfo.username}</strong> 永久注销吗？</p>
        </div>
      ),
      okText: '确认注销',
      okType: 'danger',
      cancelText: '我再想想',
      onOk() {
        cancelAccount(userInfo.id)
      }
    })
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header-container">
        <div>
          <div className="page-title">个人中心与账号设置</div>
          <div className="page-subtitle">修改个人基础资料、账户安全设置以及绑定第三方账号</div>
        </div>
        <div style={{ color: 'var(--cyber-primary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <SafetyCertificateOutlined />
          <span>账户保护状态：安全</span>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Form: Profile Detail */}
        <Col xs={24} lg={15}>
          <Card className="cyber-card" title={<span style={{ color: '#fff' }}><UserOutlined /> 修改个人基础资料</span>}>
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleSaveProfile}
              requiredMark={false}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="nickname"
                    label="姓名 / 昵称"
                    rules={[{ required: true, message: '姓名/昵称不能为空' }]}
                  >
                    <Input placeholder="姓名" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="gender"
                    label="性别"
                  >
                    <Radio.Group>
                      <Radio value="男" style={{ color: '#fff' }}>男</Radio>
                      <Radio value="女" style={{ color: '#fff' }}>女</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="school"
                label="所属学校"
                rules={[{ required: true, message: '学校不能为空' }]}
              >
                <Input placeholder="请输入您的学校名称" />
              </Form.Item>

              <Form.Item
                name="idCard"
                label="身份证号"
                rules={[
                  { required: true, message: '身份证号不能为空' },
                  { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入合法的身份证号' }
                ]}
              >
                <Input placeholder="请输入身份证号" />
              </Form.Item>

              <Form.Item
                name="bio"
                label="个性签名 / 个人简介"
              >
                <Input.TextArea placeholder="写下你的座右铭或个人寄语..." autoSize={{ minRows: 2, maxRows: 4 }} />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" className="cyber-btn">
                  保存资料修改
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Right Form: Password & Bindings */}
        <Col xs={24} lg={9}>
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            {/* Update Password */}
            <Card className="cyber-card" title={<span style={{ color: '#fff' }}><LockOutlined /> 账户登录密码修改</span>}>
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handleSavePassword}
                requiredMark={false}
              >
                <Form.Item
                  name="currentPassword"
                  label="当前登录密码"
                  rules={[{ required: true, message: '当前密码不能为空' }]}
                >
                  <Input.Password placeholder="请输入当前旧密码" />
                </Form.Item>

                <Form.Item
                  name="newPassword"
                  label="设置新密码"
                  rules={[
                    { required: true, message: '新密码不能为空' },
                    { min: 4, message: '密码不能少于4位' }
                  ]}
                >
                  <Input.Password placeholder="请输入新密码" />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="再次确认新密码"
                  rules={[{ required: true, message: '确认密码不能为空' }]}
                >
                  <Input.Password placeholder="请重新输入新密码" />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button type="primary" htmlType="submit" className="cyber-btn cyber-btn-purple" style={{ width: '100%' }}>
                    确认修改密码
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            {/* Bindings Panel */}
            <Card className="cyber-card" title={<span style={{ color: '#fff' }}><SafetyCertificateOutlined /> 第三方账号绑定</span>}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* WeChat */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(0,242,254,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <WechatOutlined style={{ fontSize: 24, color: '#07c160' }} />
                    <div>
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>微信账号</div>
                      <div style={{ fontSize: 11, color: 'var(--cyber-text-muted)' }}>
                        {userInfo.wechat && userInfo.wechat !== '未绑定' ? `已绑定: ${userInfo.wechat}` : '用于微信公众号预警通知接收'}
                      </div>
                    </div>
                  </div>
                  {userInfo.wechat && userInfo.wechat !== '未绑定' ? (
                    <Button size="small" danger onClick={handleUnbindWechat} style={{ border: '1px solid #ff4d4f', color: '#ff4d4f', background: 'transparent' }}>
                      解绑
                    </Button>
                  ) : (
                    <Button size="small" type="primary" className="cyber-btn" onClick={handleBindWechat}>
                      立即绑定
                    </Button>
                  )}
                </div>

                {/* QQ */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(0,242,254,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <QqOutlined style={{ fontSize: 24, color: '#12b7f5' }} />
                    <div>
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>QQ 账号</div>
                      <div style={{ fontSize: 11, color: 'var(--cyber-text-muted)' }}>
                        {userInfo.qq && userInfo.qq !== '未绑定' ? `已绑定: ${userInfo.qq}` : '暂未绑定QQ服务'}
                      </div>
                    </div>
                  </div>
                  {userInfo.qq && userInfo.qq !== '未绑定' ? (
                    <Button size="small" danger onClick={handleUnbindQq} style={{ border: '1px solid #ff4d4f', color: '#ff4d4f', background: 'transparent' }}>
                      解绑
                    </Button>
                  ) : (
                    <Button size="small" type="primary" className="cyber-btn" onClick={handleBindQq}>
                      立即绑定
                    </Button>
                  )}
                </div>

                {/* Email */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <MailOutlined style={{ fontSize: 24, color: '#ff9c6e' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>绑定邮箱</div>
                      {emailInputVisible ? (
                        <Space style={{ marginTop: 6 }}>
                          <Input
                            size="small"
                            value={emailValue}
                            onChange={(e) => setEmailValue(e.target.value)}
                            placeholder="yourname@domain.com"
                            style={{ width: 140 }}
                          />
                          <Button size="small" type="primary" className="cyber-btn" onClick={handleSaveEmail}>保存</Button>
                          <Button size="small" onClick={() => setEmailInputVisible(false)}>取消</Button>
                        </Space>
                      ) : (
                        <div style={{ fontSize: 11, color: 'var(--cyber-text-muted)' }}>
                          {userInfo.email ? `已绑定: ${userInfo.email}` : '用于密码找回与月度心理报告推送'}
                        </div>
                      )}
                    </div>
                  </div>
                  {!emailInputVisible && (
                    <Button size="small" type="primary" className="cyber-btn" onClick={() => setEmailInputVisible(true)}>
                      {userInfo.email ? '修改邮箱' : '绑定邮箱'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Danger Zone: Account Cancellation */}
      <Card
        className="cyber-card"
        style={{ marginTop: 24, border: '1px solid rgba(255, 77, 79, 0.2)', background: 'rgba(255, 77, 79, 0.02)' }}
        title={<span style={{ color: '#ff4d4f' }}><WarningOutlined /> 账号控制中心 (危险区域)</span>}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ maxWidth: 600 }}>
            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: 14, marginBottom: 4 }}>注销我的系统账号</div>
            <div style={{ color: 'var(--cyber-text-muted)', fontSize: 12 }}>
              永久性注销该账户登录权限。注意：此操作是不可逆的，系统将完全擦除您在该平台的测试打卡明细、心理报告及所有个人档案关联数据。
            </div>
          </div>
          <Button type="primary" danger onClick={handleCancelAccountConfirm} style={{ background: '#ff4d4f', borderColor: '#ff4d4f' }}>
            立即注销当前账号
          </Button>
        </div>
      </Card>

      {/* WeChat Bind QR Code Mock Modal */}
      <Modal
        title="微信扫码安全绑定"
        open={wechatModalVisible}
        onCancel={() => setWechatModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setWechatModalVisible(false)}>取消</Button>,
          <Button key="confirm" type="primary" className="cyber-btn" onClick={handleConfirmWechatBind}>我已扫码确认</Button>
        ]}
        width={340}
        bodyStyle={{ textAlign: 'center' }}
      >
        <div style={{ padding: '20px 0' }}>
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=00f2fe&bgcolor=111827&data=${encodeURIComponent(window.location.href)}`} 
            alt="微信绑定二维码" 
            style={{ width: 160, height: 160, margin: '0 auto 16px auto', display: 'block', borderRadius: 8, border: '2px solid var(--cyber-primary)', boxShadow: '0 0 15px rgba(0,242,254,0.3)' }}
          />
          <div style={{ marginTop: 16, color: 'var(--cyber-text-muted)', fontSize: 12, lineHeight: '1.6' }}>
            请使用微信扫描上方二维码进行安全身份验证。<br />
            <span style={{ color: 'var(--cyber-primary)' }}>（扫码将引导至本系统网页，可在手机端查看）</span>
          </div>
        </div>
      </Modal>

      {/* QQ Bind QR Code Mock Modal */}
      <Modal
        title="QQ 扫码安全绑定"
        open={qqModalVisible}
        onCancel={() => setQqModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setQqModalVisible(false)}>取消</Button>,
          <Button key="confirm" type="primary" className="cyber-btn cyber-btn-purple" onClick={handleConfirmQqBind}>我已扫码确认</Button>
        ]}
        width={340}
        bodyStyle={{ textAlign: 'center' }}
      >
        <div style={{ padding: '20px 0' }}>
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=a78bfa&bgcolor=111827&data=${encodeURIComponent(window.location.href)}`} 
            alt="QQ绑定二维码" 
            style={{ width: 160, height: 160, margin: '0 auto 16px auto', display: 'block', borderRadius: 8, border: '2px solid var(--cyber-secondary)', boxShadow: '0 0 15px rgba(167,139,250,0.3)' }}
          />
          <div style={{ marginTop: 16, color: 'var(--cyber-text-muted)', fontSize: 12, lineHeight: '1.6' }}>
            请使用手机 QQ 扫描上方二维码进行安全身份验证。<br />
            <span style={{ color: 'var(--cyber-secondary)' }}>（扫码将引导至本系统网页，可在手机端查看）</span>
          </div>
        </div>
      </Modal>
    </div>
  )
}
