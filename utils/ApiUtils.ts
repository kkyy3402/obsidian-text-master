export const validateOpenAIApiKey = (apiKey: string): boolean => {
	const apiKeyPattern = /^sk-[A-Za-z0-9]{32,}$/
	return apiKeyPattern.test(apiKey)
}

export const callGptApiSync = async (prompt: string, apiKey: string): Promise<string> => {

	// console.log('Calling GPT-4 API with prompt:', prompt)

	const messages = [
		{
			role: 'system',
			content: 'You are a helpful assistant.',
		},
		{
			role: 'user',
			content: prompt,
		},
	]

	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model: 'gpt-4o',
			messages: messages,
		}),
	})

	if (!response.ok) {
		console.error('API call failed:', response.statusText)
		throw new Error('API call failed')
	}

	const data = await response.json()
	console.log('API response:', data)
	return data.choices[0].message.content.trim()
}

export const callGptApiStream = async (prompt: string, apiKey: string, onData: (data: string) => void) => {
	// console.log('Calling GPT-4 API with prompt:', prompt)

	let accumulatedString = ''
	const messages = [
		{
			role: 'system',
			content: 'You are a helpful assistant.',
		},
		{
			role: 'user',
			content: prompt,
		},
	]

	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model: 'gpt-4o',
			messages: messages,
			stream: true,
		}),
	})

	if (!response.ok) {
		console.error('API call failed:', response.statusText)
		throw new Error('API call failed')
	}

	if (!response.body) {
		console.error('Response body is null')
		throw new Error('Response body is null')
	}

	const reader = response.body.getReader()
	const decoder = new TextDecoder('utf-8')
	
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const { done, value } = await reader.read()
		if (done) break
		const chunk = decoder.decode(value, { stream: true })

		const resJsonStr = chunk.split('data: ')[1]
		const resJson = JSON.parse(resJsonStr)
		console.log('### JSON')
		console.log(resJson)
		const contentChar = resJson['choices'][0]['delta']['content']
		accumulatedString = accumulatedString + contentChar
		// console.log(`### contentChar : ${contentChar}`)
		// console.log(`### accumulatedString : ${accumulatedString}`)
		onData(contentChar)
	}

	console.log('Stream ended')
}
