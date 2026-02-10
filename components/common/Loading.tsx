import React from 'react';
import { Spin } from 'antd';

interface LoadingProps {
	text?: string;
	className?: string;
}

const Loading = ({ 
	text = "Loading...",
	className 
}: LoadingProps) => {
	return (
		<div className={className} style={{ 
			display: 'flex', 
			flexDirection: 'column',
			alignItems: 'center', 
			justifyContent: 'center', 
			minHeight: '60vh',
			gap: '16px'
		}}>
			<Spin size="large" />
			<p style={{ color: '#6b7280' }}>{text}</p>
		</div>
	);
};

export default Loading;
