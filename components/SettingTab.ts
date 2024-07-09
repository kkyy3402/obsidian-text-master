import {App, PluginSettingTab, Setting} from "obsidian";
import {validateOpenAIApiKey} from "../utils/apiUtils";
import TextMasterPlugin from "../main";

export class SettingTab extends PluginSettingTab {
	plugin: TextMasterPlugin;

	constructor(app: App, plugin: TextMasterPlugin) {
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
