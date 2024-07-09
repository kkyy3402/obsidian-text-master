import { actions } from '../constants'

const getInstructionText = (action: string, maxOutputStrLength: number) => {
	let result = ''

	if (action === actions.rearrange) {
		result = 'Please rearrange the following sentences smoothly.'
	}

	if (action === actions.summarization) {
		result = 'Please summarize the following sentences.'
	}

	if (action === actions.augmentation) {
		result = 'Please generate sentences that follow the given sentence, excluding the original.'
	}

	result = result + ` Please limit the result to within ${maxOutputStrLength} characters.`

	return result
}


export const getPromptForTextGeneration = (action: string, inputText: string, maxOutputStrLength: number) => {
	return `### Instruction:
${getInstructionText(action, maxOutputStrLength)}

### Input: 
${inputText}

### Output: 
`
}
 
