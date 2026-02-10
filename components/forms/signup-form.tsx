"use client";

import { Form, Input, Button, Typography, Space, App, Row, Col } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/auth/AuthProvider";

const { Title, Text, Link } = Typography;

interface SignupFormData {
	firstName: string;
	lastName: string;
	userName: string;
	password: string;
	confirmPassword: string;
}

export function SignupForm() {
	const [form] = Form.useForm();
	const router = useRouter();
	const { signup, isLoading } = useAuthContext();
	const { message } = App.useApp();

	const onFinish = async (values: SignupFormData) => {
		try {
			const result = await signup(
				values.firstName,
				values.lastName,
				values.userName,
				values.password
			);

			if (result?.data?.createUser?.success) {
				message.success("Account created successfully!");
				router.push("/dashboard");
			} else {
				message.error(
					result?.data?.createUser?.message || "Failed to create account"
				);
			}
		} catch (err: any) {
			message.error(err.message || "An error occurred");
		}
	};

	return (
		<Space direction="vertical" size="large" style={{ width: "100%" }}>
			<div style={{ textAlign: "center" }}>
				<Title level={2} style={{ marginBottom: 8 }}>
					Create an account
				</Title>
				<Text type="secondary">
					Enter your information to create your account
				</Text>
			</div>

			<Form
				form={form}
				name="signup"
				onFinish={onFinish}
				layout="vertical"
				size="large"
				disabled={isLoading}
			>
				<Row gutter={16}>
					<Col span={12}>
						<Form.Item
							name="firstName"
							label="First name"
							rules={[{ required: true, message: "First name is required" }]}
						>
							<Input placeholder="Enter First Name" />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name="lastName"
							label="Last name"
							rules={[{ required: true, message: "Last name is required" }]}
						>
							<Input placeholder="Enter Last Name" />
						</Form.Item>
					</Col>
				</Row>

				<Form.Item
					name="userName"
					label="Username"
					rules={[
						{ required: true, message: "Please input your username!" },
						{ min: 3, message: "Username must be at least 3 characters" },
					]}
				>
					<Input prefix={<UserOutlined />} placeholder="Enter Username" />
				</Form.Item>

				<Form.Item
					name="password"
					label="Password"
					rules={[
						{ required: true, message: "Please input your password!" },
						{ min: 6, message: "Password must be at least 6 characters" },
					]}
				>
					<Input.Password prefix={<LockOutlined />} placeholder="Enter Password" />
				</Form.Item>

				<Form.Item
					name="confirmPassword"
					label="Confirm Password"
					dependencies={["password"]}
					rules={[
						{ required: true, message: "Please confirm your password!" },
						({ getFieldValue }) => ({
							validator(_, value) {
								if (!value || getFieldValue("password") === value) {
									return Promise.resolve();
								}
								return Promise.reject(new Error("Passwords do not match!"));
							},
						}),
					]}
				>
					<Input.Password
						prefix={<LockOutlined />}
						placeholder="Enter Confirm Password"
					/>
				</Form.Item>

				<Form.Item>
					<Button type="primary" htmlType="submit" loading={isLoading} block>
						{isLoading ? "Creating account..." : "Create account"}
					</Button>
				</Form.Item>
			</Form>

			<div style={{ textAlign: "center" }}>
				<Text type="secondary">
					Already have an account? <Link href="/login">Login</Link>
				</Text>
			</div>
		</Space>
	);
}
