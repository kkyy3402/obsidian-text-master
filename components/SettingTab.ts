import {App, PluginSettingTab, Setting} from "obsidian";
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
					this.plugin.settings.apiKey = value;
					await this.plugin.saveSettings();
				}));
	}
}

