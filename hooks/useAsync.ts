"use client";

import { useState, useEffect, useCallback } from 'react';

interface UseAsyncOptions<T> {
	initialData?: T;
	onSuccess?: (data: T) => void;
	onError?: (error: Error) => void;
}

export function useAsync<T = any>(
	asyncFunction: () => Promise<T>,
	deps: React.DependencyList = [],
	options: UseAsyncOptions<T> = {}
) {
	const [data, setData] = useState<T | undefined>(options.initialData);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const execute = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const result = await asyncFunction();
			setData(result);
			options.onSuccess?.(result);
		} catch (err) {
			const error = err instanceof Error ? err : new Error(String(err));
			setError(error);
			options.onError?.(error);
		} finally {
			setLoading(false);
		}
	}, deps);

	useEffect(() => {
		execute();
	}, [execute]);

	const refetch = useCallback(() => {
		execute();
	}, [execute]);

	return {
		data,
		loading,
		error,
		refetch,
		execute
	};
}

interface UseMutationOptions<T, P> {
	onSuccess?: (data: T, params: P) => void;
	onError?: (error: Error, params: P) => void;
}

export function useMutation<T = any, P = any>(
	mutationFn: (params: P) => Promise<T>,
	options: UseMutationOptions<T, P> = {}
) {
	const [data, setData] = useState<T | undefined>();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const mutate = useCallback(async (params: P) => {
		setLoading(true);
		setError(null);

		try {
			const result = await mutationFn(params);
			setData(result);
			options.onSuccess?.(result, params);
			return result;
		} catch (err) {
			const error = err instanceof Error ? err : new Error(String(err));
			setError(error);
			options.onError?.(error, params);
			throw error;
		} finally {
			setLoading(false);
		}
	}, [mutationFn, options]);

	return {
		data,
		loading,
		error,
		mutate
	};
}