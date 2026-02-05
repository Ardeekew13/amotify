import { GET_USERS_EXCLUDE_SELF } from "@/app/api/graphql/user";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { GetUsersExcludeSelf } from "@/interface/common/common";
import { useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";

export const useUserList = () => {
	const { user } = useAuthContext();
	const [userLists, setUserLists] = useState<
		{ value: string; label: string }[]
	>([]);

	const { data, loading, error } = useQuery<GetUsersExcludeSelf>(
		GET_USERS_EXCLUDE_SELF,
		{
			variables: { _id: user?._id },
		},
	);
	useEffect(() => {
		if (data && data.getUsersExcludeSelf && data.getUsersExcludeSelf.users) {
			const formattedUsers = data.getUsersExcludeSelf.users.map(
				(user: any) => ({
					value: user._id,
					label: `${user.firstName} ${user.lastName} (${user.userName})`,
				}),
			);
			setUserLists(formattedUsers);
		}
	}, [data]);
	return { userLists, loading, error };
};
