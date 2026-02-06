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
      }
    }
  }
`;

//Mutations
export const CREATE_USER = gql`
	mutation CreateUser($input: CreateUserInput!) {
		createUser(input: $input) {
			success
			message
			user {
				firstName
				lastName
				userName
			}
			token
		}
	}
`;

export const LOGIN_USER = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
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
