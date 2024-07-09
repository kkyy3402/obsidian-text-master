import {App, ButtonComponent, Modal, Notice, Setting, TextComponent} from 'obsidian';
import TextMasterPlugin from "../../main";
import {validateOpenAIApiKey} from "../../utils/apiUtils";

export class ApiKeySetupModal extends Modal {
	plugin: TextMasterPlugin;
	apiKeyInput: TextComponent;
	setButton: ButtonComponent;
	onConfirmButtonClicked: () => void;

	constructor(app: App, plugin: TextMasterPlugin, onConfirmButtonClicked: () => void) {
		super(app);
		this.plugin = plugin;
		this.onConfirmButtonClicked = onConfirmButtonClicked;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.createEl('h3', {text: 'Please enter the ChatGPT API key.'});

		// Create text field for API key input
		new Setting(contentEl)
			.setName('API Key')
			.addText(text => {
				this.apiKeyInput = text;
				text.setPlaceholder('Enter your API key')
					.onChange(value => {
						if (validateOpenAIApiKey(value)) { // Assuming API key length is 32 for example
							this.setButton.setDisabled(false);
						} else {
							this.setButton.setDisabled(true);
						}
					});
			});

		// Create the Set button
		new Setting(contentEl)
			.addButton(button => {
				button
					.setButtonText("Cancel")
					.onClick(() => {
						this.close()
					})
			})
			.addButton(button => {
				this.setButton = button;
				button.setButtonText('Confirm')
					.setDisabled(true)
					.onClick(async () => {
						this.plugin.settings.apiKey = this.apiKeyInput.getValue();
						await this.plugin.saveSettings();
						new Notice('The API key has been entered.');
						this.onConfirmButtonClicked();
						this.close();
					});
			});
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
