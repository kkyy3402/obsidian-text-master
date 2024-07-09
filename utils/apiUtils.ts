export const validateOpenAIApiKey = (apiKey: string): boolean => {
	const apiKeyPattern = /^sk-[A-Za-z0-9]{32,}$/;
	return apiKeyPattern.test(apiKey);
}

export const callGptApi = async (prompt: string, apiKey: string): Promise<string> => {

	console.log('Calling GPT-4 API with prompt:', prompt);

	const messages = [
		{
			role: 'system',
			content: 'You are a helpful assistant.'
		},
		{
			role: 'user',
			content: prompt
		}
	];

	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: 'gpt-4o',
			messages: messages,
		})
	});

	if (!response.ok) {
		console.error('API call failed:', response.statusText);
		throw new Error('API call failed');
	}

	const data = await response.json();
	console.log('API response:', data);
	return data.choices[0].message.content.trim();
}
