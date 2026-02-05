export interface CreateUserResponse {
	createUser: {
		success: boolean;
		message: string;
		user?: {
			_id: string;
			firstName: string;
			lastName: string;
			userName: string;
		};
		token?: string;
	};
}

export interface LoginResponse {
	login: {
		success: boolean;
		message: string;
		user?: {
			_id: string;
			firstName: string;
			lastName: string;
			userName: string;
		};
		token?: string;
	};
}

export interface User {
	_id: string;
	firstName: string;
	lastName: string;
	userName: string;
	createdAt: string;
	updatedAt: string;
}
