import { actions } from '../constants'

const getInstructionText = (action: string, maxOutputStrLength: number) => {
	let result = ''

	if (action === actions.rearrange) {
		result = '다음 문장을 매끄럽게 정리해주세요.'
	}

	if (action === actions.summarization) {
		result = '다음 문장을 요약해주세요.'
	}

	if (action === actions.augmentation) {
		result = '다음 문장 이후에 나올 문장을 원문을 제외하고 생성해주세요.'
	}

	result = result + ` 결과는 ${maxOutputStrLength}자 이내로 작성해주세요.`

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
