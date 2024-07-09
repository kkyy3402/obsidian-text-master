import {App, Modal, Setting} from 'obsidian';
import {actions} from "../constants";

export class ActionSelectionModal extends Modal {
	onChoose: (choice: string) => void;

	constructor(app: App, onChoose: (choice: string) => void) {
		super(app);
		this.onChoose = onChoose;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.createEl('h3', {text: '원하시는 작업을 선택해주세요.'});

		new Setting(contentEl)
			.setName('내용 재구성')
			.setDesc('주어진 내용을 재구성합니다.')
			.addButton(button => button
				.setButtonText('Select')
				.onClick(() => {
					this.onChoose(actions.rearrange);
					this.close();
				}));

		new Setting(contentEl)
			.setName('요약')
			.setDesc('주어진 문장을 요약합니다.')
			.addButton(button => button
				.setButtonText('Select')
				.onClick(() => {
					this.onChoose(actions.summarization);
					this.close();
				}));
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
