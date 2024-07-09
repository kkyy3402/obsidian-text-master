import {App, Modal, Setting} from 'obsidian';

export class ActionSelectionModal extends Modal {
	onChoose: (choice: string) => void;

	constructor(app: App, onChoose: (choice: string) => void) {
		super(app);
		this.onChoose = onChoose;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.createEl('h2', {text: 'Choose an Action'});

		new Setting(contentEl)
			.setName('내용 재구성')
			.setDesc('주어진 내용을 재구성합니다.')
			.addButton(button => button
				.setButtonText('Select')
				.onClick(() => {
					this.onChoose('rearrange');
					this.close();
				}));

		new Setting(contentEl)
			.setName('요약')
			.setDesc('주어진 문장을 요약합니다.')
			.addButton(button => button
				.setButtonText('Select')
				.onClick(() => {
					this.onChoose('summarize');
					this.close();
				}));
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
