import { gql } from "@apollo/client";

//Queries
export const GET_USERS_EXCLUDE_SELF = gql`
	query GetUsersExcludeSelf($search: String, $_id: ID!) {
		getUsersExcludeSelf(search: $search, _id: $_id) {
			success
			message
			users {
				_id
				firstName
				lastName
				userName
				createdAt
				updatedAt
			}
		}
	}
`;

export const ME_QUERY = gql`
  query Me {
    me {
      success
      message
      user {
        _id
        firstName
        lastName
        userName
        qrCodeUrl
        qrCodePublicId
      }
    }
  }
`;

//Mutations
export const SIGNUP_MUTATION = gql`
	mutation CreateUser(
		$firstName: String!
		$lastName: String!
		$userName: String!
		$password: String!
	) {
		createUser(
			input: {
				firstName: $firstName
				lastName: $lastName
				userName: $userName
				password: $password
			}
		) {
			success
			message
			user {
				_id
				firstName
				lastName
				userName
			}
			token
		}
	}
`;

export const LOGIN_MUTATION = gql`
	mutation Login($userName: String!, $password: String!) {
		login(input: { userName: $userName, password: $password }) {
			success
			message
			user {
				_id
				firstName
				lastName
				userName
			}
			token
		}
	}
`;

export const UPDATE_QR_CODE = gql`
	mutation UpdateQRCode($qrCodeUrl: String!, $qrCodePublicId: String!) {
		updateQRCode(qrCodeUrl: $qrCodeUrl, qrCodePublicId: $qrCodePublicId) {
			success
			message
			user {
				_id
				firstName
				lastName
				userName
				qrCodeUrl
				qrCodePublicId
			}
		}
	}
`;

export const UPDATE_PROFILE = gql`
	mutation UpdateProfile(
		$firstName: String
		$lastName: String
		$qrCodeUrl: String
		$qrCodePublicId: String
	) {
		updateProfile(
			input: {
				firstName: $firstName
				lastName: $lastName
				qrCodeUrl: $qrCodeUrl
				qrCodePublicId: $qrCodePublicId
			}
		) {
			success
			message
			user {
				_id
				firstName
				lastName
				userName
				qrCodeUrl
				qrCodePublicId
			}
		}
	}
`;

export const DELETE_QR_CODE = gql`
	mutation DeleteQRCode {
		deleteQRCode {
			success
			message
			user {
				_id
				firstName
				lastName
				userName
				qrCodeUrl
				qrCodePublicId
			}
		}
	}
`;
