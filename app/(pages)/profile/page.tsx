"use client";

import {
	Card,
	Typography,
	Upload,
	Button,
	Space,
	App,
	Image,
	Spin,
	Form,
	Input,
	Row,
	Col,
} from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { useMutation } from "@apollo/client";
import { UPDATE_PROFILE, DELETE_QR_CODE } from "@/app/api/graphql/user";
import type { UploadFile } from "antd";

const { Title, Text } = Typography;

const ProfilePage = () => {
	const { user, setAuth } = useAuthContext();
	const { message } = App.useApp();
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [uploading, setUploading] = useState(false);
	const [form] = Form.useForm();
	const [isPageLoading, setIsPageLoading] = useState(true);

	const [updateProfile] = useMutation(UPDATE_PROFILE);
	const [deleteQRCode] = useMutation(DELETE_QR_CODE);

	useEffect(() => {
		// Simulate page load delay to show content is being prepared
		const timer = setTimeout(() => {
			setIsPageLoading(false);
		}, 300);
		return () => clearTimeout(timer);
	}, []);

	const handleSaveProfile = async () => {
		try {
			const values = form.getFieldsValue();
			setUploading(true);

			let qrCodeUrl = user?.qrCodeUrl;
			let qrCodePublicId = user?.qrCodePublicId;

			// If there's a new file to upload
			if (fileList.length > 0 && fileList[0].originFileObj) {
				const file = fileList[0].originFileObj as File;

				// Validate file type
				if (!file.type.startsWith("image/")) {
					message.error("Please upload an image file");
					return;
				}

				// Validate file size (max 5MB)
				if (file.size > 5 * 1024 * 1024) {
					message.error("Image size must be less than 5MB");
					return;
				}

				// Upload to Cloudinary via API route
				const formData = new FormData();
				formData.append("file", file);

				const uploadResponse = await fetch("/api/upload", {
					method: "POST",
					body: formData,
				});

				const uploadData = await uploadResponse.json();

				if (!uploadData.success) {
					throw new Error(uploadData.message || "Upload failed");
				}

				qrCodeUrl = uploadData.url;
				qrCodePublicId = uploadData.publicId;
			}

			// Update profile with all changes
			const variables = {
				firstName: values.firstName,
				lastName: values.lastName,
				qrCodeUrl,
				qrCodePublicId,
			};

			const result = await updateProfile({
				variables,
			});

			if (result.data?.updateProfile?.success) {
				const updatedUser = result.data.updateProfile.user;
				// Update auth context with new user data
				if (user && user.createdAt && user.updatedAt) {
					await setAuth(
						{
							...updatedUser,
							createdAt: user.createdAt,
							updatedAt: user.updatedAt,
						},
						"", // token remains the same
					);
				}
				message.success("Profile updated successfully!");
				setFileList([]);
			} else {
				message.error(
					result.data?.updateProfile?.message || "Failed to update profile",
				);
			}
		} catch (error: any) {
			message.error(error.message || "Failed to update profile");
		} finally {
			setUploading(false);
		}
	};

	const handleDelete = async () => {
		try {
			const result = await deleteQRCode();

			if (result.data?.deleteQRCode?.success) {
				const updatedUser = result.data.deleteQRCode.user;
				// Update auth context with new user data
				if (user && user.createdAt && user.updatedAt) {
					await setAuth(
						{
							...updatedUser,
							createdAt: user.createdAt,
							updatedAt: user.updatedAt,
						},
						"", // token remains the same
					);
				}
				message.success("QR code deleted successfully!");
			} else {
				message.error(
					result.data?.deleteQRCode?.message || "Failed to delete QR code",
				);
			}
		} catch (error: any) {
			message.error(error.message || "Failed to delete QR code");
		}
	};

	if (!user || isPageLoading) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "400px",
				}}
			>
				<Spin size="large" tip="Loading profile..." />
			</div>
		);
	}

	return (
		<div>
			<div>
				<Title level={1} style={{ margin: 0, marginBottom: 4 }}>
					Profile
				</Title>
				<Text type="secondary">
					Manage your account settings and preferences.
				</Text>
			</div>
			<div style={{ width: "100%", marginTop: 24 }}>
				<Form
					layout="vertical"
					form={form}
					initialValues={{
						firstName: user.firstName,
						lastName: user.lastName,
						userName: user.userName,
					}}
				>
					<Row gutter={16}>
						<Col span={8}>
							<Form.Item label="First Name" name="firstName">
								<Input />
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item label="Last Name" name="lastName">
								<Input />
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item label="Username" name="userName">
								<Input readOnly disabled />
							</Form.Item>
						</Col>
					</Row>

					<Card title="Payment QR Code">
						<Space direction="vertical" size="large" style={{ width: "100%" }}>
							<Text type="secondary">
								Upload your payment QR code so others can easily pay you for
								shared expenses.
							</Text>

							{user.qrCodeUrl ? (
								<div>
									<div
										style={{
											marginBottom: 16,
											display: "flex",
											justifyContent: "center",
										}}
									>
										<Image
											src={user.qrCodeUrl}
											alt="Payment QR Code"
											width={300}
											height={300}
											style={{ objectFit: "contain" }}
										/>
									</div>
									<Button
										danger
										icon={<DeleteOutlined />}
										onClick={handleDelete}
										block
									>
										Delete QR Code
									</Button>
								</div>
							) : (
								<div>
									<Upload
										fileList={fileList}
										onChange={({ fileList }) => setFileList(fileList)}
										beforeUpload={() => false}
										accept="image/*"
										maxCount={1}
										listType="picture-card"
										disabled={uploading}
									>
										{fileList.length === 0 && (
											<div>
												<UploadOutlined />
												<div style={{ marginTop: 8 }}>Select QR Code</div>
											</div>
										)}
									</Upload>
									<Text
										type="secondary"
										style={{ display: "block", marginTop: 8 }}
									>
										Click the <strong>Save Profile</strong> button above to
										upload.
									</Text>
								</div>
							)}
						</Space>
					</Card>
				</Form>
			</div>
			<Button
				type="primary"
				block
				onClick={handleSaveProfile}
				style={{ marginTop: 12 }}
				loading={uploading}
				icon={<UploadOutlined />}
			>
				Save Profile
			</Button>
		</div>
	);
};

export default ProfilePage;
