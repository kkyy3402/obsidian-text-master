export const validateOpenAIApiKey = (apiKey: string): boolean => {
	const apiKeyPattern = /^sk-[A-Za-z0-9]{32,}$/;
	return apiKeyPattern.test(apiKey);
}
