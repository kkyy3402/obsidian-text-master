import {App, Editor, MarkdownView, Modal, Plugin, PluginSettingTab, Setting} from 'obsidian';
import {validateOpenAIApiKey} from "./utils/apiUtils";

interface MyPluginSettings {
	apiKey: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	apiKey: ''
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	getPromptForArrange = (inputText: string) => {
		return `### Instruction:
다음 문장을 매끄럽게 정리해주세요. 예시 데이터의 언어를 지켜서 작성해주세요. (영어일 경우 영어, 한글일 경우 한글)

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
				const prompt = this.getPromptForArrange(userInput)
				const response = await this.callGptApi(prompt);
				editor.setValue(`${userInput}
 
### GENERATED  
${response}`);
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

	async callGptApi(prompt: string): Promise<string> {
		const apiKey = this.settings.apiKey;
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
				model: 'gpt-4',
				messages: messages,
				max_tokens: 150
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

}

class SettingModal extends Modal {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('API key is not set. Please go to the settings to configure your GPT API key.');

		// Add a div for spacing
		contentEl.createEl('br');

		const buttonEl = contentEl.createEl('button', {text: 'Go to Settings'});
		buttonEl.onclick = () => {
			this.plugin.addSettingTab(new SettingTab(this.app, this.plugin));
			this.close();
		}
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		const apiKeyStatus = document.createElement('div');
		containerEl.appendChild(apiKeyStatus);

		new Setting(containerEl)
			.setName('GPT API Key')
			.setDesc('Enter your GPT API key here')
			.addText(text => text
				.setPlaceholder('Enter your API key')
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (value) => {
					if (validateOpenAIApiKey(value)) {
						apiKeyStatus.textContent = "올바른 api키 형식입니다.";
						apiKeyStatus.style.color = 'green';
						this.plugin.settings.apiKey = value;
						await this.plugin.saveSettings();
					} else {
						apiKeyStatus.textContent = "잘못된 api 키입니다.";
						apiKeyStatus.style.color = 'red';
					}
				}));
	}
}
