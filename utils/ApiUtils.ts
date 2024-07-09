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
			model: 'gpt-4',
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
	let buffer = ''

	// eslint-disable-next-line no-constant-condition
	while (true) {
		const { done, value } = await reader.read()
		if (done) break

		buffer += decoder.decode(value, { stream: true })

		const lines = buffer.split('\n')
		buffer = lines.pop() || '' // Keep the last partial line in the buffer

		for (const line of lines) {
			if (line.trim() === '') continue // Skip empty lines
			if (line.startsWith('data: ')) {
				const jsonString = line.replace(/^data: /, '').trim()
				if (jsonString !== '[DONE]') {
					try {
						const parsedJson = JSON.parse(jsonString)
						const contentChar = parsedJson.choices[0].delta.content
						if (contentChar) {
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
							accumulatedString += contentChar
							onData(contentChar)
						}
					} catch (e) {
						console.error('Error parsing JSON:', e)
					}
				}
			}
		}
	}

	console.log('Stream ended')
}
