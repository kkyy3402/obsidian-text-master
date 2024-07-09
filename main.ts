import {Editor, MarkdownView, Plugin} from 'obsidian';
import {SettingTab} from "./components/SettingTab";
import {SettingModal} from "./components/SettingModal";
import {callGptApi} from "./utils/apiUtils";
import {ActionSelectionModal} from "./components/ActionSelectionModal";

interface ITextMaseterSettings {
	apiKey: string;
}

const DEFAULT_SETTINGS: ITextMaseterSettings = {
	apiKey: ''
}

export default class TextMasterPlugin extends Plugin {
	settings: ITextMaseterSettings;

	getPromptForArrange = (inputText: string) => {
		return `### Instruction:
다음 문장을 매끄럽게 정리해주세요. 예시 데이터의 언어를 지켜서 작성해주세요. (영어일 경우 영어, 한글일 경우 한글)

### Input:
${inputText}

### Output: 
`
	}

	getPromptForSummarize = (inputText: string) => {
		return `### Instruction:
다음 문장을 100자 이내로 요약해주세요. 예시 데이터의 언어를 지켜서 작성해주세요. (영어일 경우 영어, 한글일 경우 한글)

### Input:
${inputText}

### Output: 
`
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
					new SettingModal(this.app, this).open();
					return;
				}
				const userInput = editor.getValue()
				new ActionSelectionModal(this.app, async (choice: string) => {
					let prompt = '';
					if (choice === 'rearrange') {
						prompt = this.getPromptForArrange(userInput);
					} else if (choice === 'summarize') {
						prompt = this.getPromptForSummarize(userInput);
					}

					const apiKey = this.settings.apiKey;
					const response = await callGptApi(prompt, apiKey);
					editor.setValue(`${userInput} 
  
### GENERATED  
${response}`);
				}).open();
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


