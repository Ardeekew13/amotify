import { MemberExpense } from "@/interface/common/common";

// Helper functions for expense calculations
export const roundToTwoDecimals = (num: number): number => 
	Math.round(num * 100) / 100;

export const calculateSplitPercentage = (amount: number, totalAmount: number): number =>
	totalAmount > 0 ? roundToTwoDecimals((amount / totalAmount) * 100) : 0;

export const hasManualAmount = (member: MemberExpense): boolean =>
	(member.amount ?? 0) > 0;

export const resetAllAmounts = (members: MemberExpense[]): MemberExpense[] => 
	members.map(member => ({
		...member,
		amount: 0,
		splitPercentage: 0,
	}));

export const applyRoundingDifference = (
	members: MemberExpense[],
	autoSplitMemberIds: string[],
	totalAmount: number
): MemberExpense[] => {
	const calculatedTotal = members.reduce((sum, m) => sum + (m.amount || 0), 0);
	const difference = roundToTwoDecimals(totalAmount - calculatedTotal);

	if (difference === 0) return members;

	// Find last auto-split member to apply rounding correction
	const lastAutoSplitIndex = members.findIndex((m, index) => 
		autoSplitMemberIds.includes(m._id) && 
		index === members.length - 1 - [...members].reverse().findIndex(rm => 
			autoSplitMemberIds.includes(rm._id)
		)
	);

	if (lastAutoSplitIndex === -1) return members;

	const updatedMembers = [...members];
	const correctedAmount = roundToTwoDecimals(
		updatedMembers[lastAutoSplitIndex].amount + difference
	);

	updatedMembers[lastAutoSplitIndex] = {
		...updatedMembers[lastAutoSplitIndex],
		amount: correctedAmount,
		splitPercentage: calculateSplitPercentage(correctedAmount, totalAmount),
	};

	return updatedMembers;
};

// Number formatting helpers
export const formatToTwoDecimals = (num: number): string => 
	num.toFixed(2);

export const formatPercentage = (num: number): string => 
	`${formatToTwoDecimals(num)}%`;

export const formatCurrency = (num: number): string => 
	`₱${formatToTwoDecimals(num)}`;

// Ensure percentages add up to exactly 100%
export const distributePercentages = (amounts: number[], totalAmount: number): number[] => {
	if (totalAmount === 0) return amounts.map(() => 0);
	
	// Calculate raw percentages
	const rawPercentages = amounts.map(amount => (amount / totalAmount) * 100);
	
	// Round down all percentages
	const roundedPercentages = rawPercentages.map(p => Math.floor(p * 100) / 100);
	
	// Calculate total and difference
	const currentTotal = roundedPercentages.reduce((sum, p) => sum + p, 0);
	const difference = roundToTwoDecimals(100 - currentTotal);
	
	// Distribute the difference to members with the largest fractional parts
	if (difference > 0) {
		const fractionalParts = rawPercentages.map((raw, index) => ({
			index,
			fractional: raw - roundedPercentages[index]
		}));
		
		// Sort by fractional part (largest first)
		fractionalParts.sort((a, b) => b.fractional - a.fractional);
		
		// Add 0.01% to members with largest fractional parts
		const centsToDistribute = Math.round(difference * 100);
		for (let i = 0; i < centsToDistribute && i < fractionalParts.length; i++) {
			const memberIndex = fractionalParts[i].index;
			roundedPercentages[memberIndex] = roundToTwoDecimals(roundedPercentages[memberIndex] + 0.01);
		}
	}
	
	return roundedPercentages;
};