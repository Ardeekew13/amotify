import React from 'react';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface LoadingProps {
	text?: string;
	className?: string;
}

const Loading = ({ 
	text = "Loading...",
	className 
}: LoadingProps) => {
	return (
		<div className={cn("flex items-center justify-center min-h-[60vh]", className)}>
			<div className="flex flex-col items-center gap-4">
				<Spinner className="size-12" />
				<p className="text-muted-foreground">{text}</p>
			</div>
		</div>
	);
};

export default Loading;
