import {App, Modal} from "obsidian";
import {SettingTab} from "./SettingTab";
import TextMasterPlugin from "../main";

export class SettingModal extends Modal {
	plugin: TextMasterPlugin;

	constructor(app: App, plugin: TextMasterPlugin) {
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
