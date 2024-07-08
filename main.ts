import {App, Editor, MarkdownView, Modal, Plugin, PluginSettingTab, Setting} from 'obsidian';

interface MyPluginSettings {
	apiKey: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	apiKey: ''
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

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
				const selection = editor.getSelection();

				let prompt = editor.getSelection();
				if (!prompt) {
					prompt = editor.getValue();  // Get the entire content if nothing is selected
				}

				console.info(`value : ${editor.getValue()}`)

				const response = await this.callGptApi(selection);
				editor.replaceSelection(response);
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

		const response = await fetch('https://api.openai.com/v1/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: 'gpt-4o',
				prompt: prompt,
				max_tokens: 150
			})
		});

		if (!response.ok) {
			console.error('API call failed:', response.statusText);
			throw new Error('API call failed');
		}

		const data = await response.json();
		console.log('API response:', data);
		return data.choices[0].text.trim();
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

		new Setting(containerEl)
			.setName('GPT API Key')
			.setDesc('Enter your GPT API key here')
			.addText(text => text
				.setPlaceholder('Enter your API key')
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (value) => {
					this.plugin.settings.apiKey = value;
					await this.plugin.saveSettings();
				}));
	}
}
