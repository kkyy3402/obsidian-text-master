import {Editor, MarkdownView, Notice, Plugin} from 'obsidian';
import {SettingTab} from "./components/SettingTab";
import {callGptApi} from "./utils/apiUtils";
import {ActionSelectionModal} from "./components/ActionSelectionModal";
import {actions} from "./constants";
import {ApiKeySetupModal} from "./components/modal/ApiKeySetupModal";

interface ITextMaseterSettings {
	apiKey: string;
}

const DEFAULT_SETTINGS: ITextMaseterSettings = {
	apiKey: ''
}

export default class TextMasterPlugin extends Plugin {
	settings: ITextMaseterSettings;

	getPromptForTextGeneration = (action: string, inputText: string) => {

		if (action === actions.rearrange) {
			return `### Instruction:
다음 문장을 매끄럽게 정리해주세요. 예시 데이터의 언어를 지켜서 작성해주세요. (영어일 경우 영어, 한글일 경우 한글)

### Input:
${inputText}

### Output: 
`
		}

		if (action === actions.summarization) {
			return `### Instruction:
다음 문장을 100자 이내로 요약해주세요. 예시 데이터의 언어를 지켜서 작성해주세요. (영어일 경우 영어, 한글일 경우 한글)

### Input:
${inputText}

### Output: 
`
		}

		return `### Instruction:
다음 문장을 100자 이내로 요약해주세요. 예시 데이터의 언어를 지켜서 작성해주세요. (영어일 경우 영어, 한글일 경우 한글)

### Input:
${inputText}

### Output: 
`
	}

	showActionModal = (editor: Editor) => {
		const userInput = editor.getValue()
		new ActionSelectionModal(this.app, async (action: string) => {
			const prompt = this.getPromptForTextGeneration(action, userInput)
			const apiKey = this.settings.apiKey;
			const response = await callGptApi(prompt, apiKey);
			new Notice('처리가 완료되었습니다.');
			editor.setValue(`${userInput}
  
### GENERATED  
${response}`);
		}).open();
	}

	async onload() {
		console.info("HELLO!")
		await this.loadSettings();

		// Command to trigger GPT API
		this.addCommand({
			id: 'trigger-gpt-api',
			name: 'Trigger GPT API',
			hotkeys: [
				{
					modifiers: ["Ctrl"],
					key: "Enter",
				}
			],
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				if (!this.settings.apiKey) {
					new ApiKeySetupModal(this.app, this, () => {
						this.showActionModal(editor)
					}).open()
					return;
				}

				this.showActionModal(editor)
			}
		});

		// Add settings tab
		this.addSettingTab(new SettingTab(this.app, this));
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

}


