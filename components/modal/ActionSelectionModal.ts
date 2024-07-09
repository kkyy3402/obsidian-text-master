import {App, Modal, Setting} from 'obsidian';
import {actions, DEFAULT_MAX_GENERATION_STR_LENGTH} from "../../constants";

export class ActionSelectionModal extends Modal {
	onChoose: (choice: string, maxStrLength: number) => void;

	constructor(app: App, onChoose: (choice: string, maxStrLength: number) => void) {
		super(app);
		this.onChoose = onChoose;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.createEl('h3', {text: '원하시는 작업을 선택해주세요.'});

		let selectedValue = actions.rearrange;
		let maxStrLength = DEFAULT_MAX_GENERATION_STR_LENGTH;

		new Setting(contentEl)
			.setName('작업 선택')
			.setDesc('원하는 작업을 선택하세요.')
			.addDropdown(dropdown => {
				[
					{value: actions.rearrange, text: '내용 재구성 - 주어진 내용을 재구성합니다.'},
					{value: actions.summarization, text: '요약 - 주어진 문장을 요약합니다.'},
					{value: actions.augmentation, text: '증강 - 주어진 문장을 증강합니다.'},
				].forEach(option => {
					dropdown.addOption(option.value, option.text);
				});
				dropdown.setValue(selectedValue);
				dropdown.onChange(value => {
					selectedValue = value;
				});
			});

		new Setting(contentEl)
			.setName('최대 문자열 길이')
			.setDesc('생성되는 문자열의 길이를 제한합니다.')
			.addText(text => {
				text.setPlaceholder('길이를 입력해주세요.');
				text.inputEl.type = 'number';
				text.setValue(`${DEFAULT_MAX_GENERATION_STR_LENGTH}`);
				text.onChange(value => {
					maxStrLength = parseInt(value);
					validateInput();
				});
			});

		const validateInput = () => {

			if (!generateButton) return

			if (!isNaN(maxStrLength) && maxStrLength > 0) {
				generateButton.removeAttribute('disabled');
			} else {
				generateButton.setAttribute('disabled', 'true');
			}
		};

		const buttonSetting = new Setting(contentEl);
		const generateButton = buttonSetting.addButton(button => {
			button.setButtonText('생성 시작하기')
				.setDisabled(false)
				.onClick(() => {
					this.onChoose(selectedValue, maxStrLength);
					this.close();
				});
		}).settingEl.querySelector('button');

		validateInput(); // Initial validation
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
