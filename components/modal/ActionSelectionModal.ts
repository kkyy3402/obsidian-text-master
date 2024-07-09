import { App, Modal, Setting } from 'obsidian'
import { actions, DEFAULT_MAX_GENERATION_STR_LENGTH } from '../../constants'

export class ActionSelectionModal extends Modal {
	onChoose: (choice: string, maxOutputStrLength: number) => void

	constructor(app: App, onChoose: (choice: string, maxOutputStrLength: number) => void) {
		super(app)
		this.onChoose = onChoose
	}

	onOpen() {
		const { contentEl } = this
		contentEl.createEl('h3', { text: 'Please select the desired action.' })

		let selectedValue = actions.rearrange
		let maxOutputStrLength = DEFAULT_MAX_GENERATION_STR_LENGTH

		new Setting(contentEl)
			.setName('Select Action')
			.setDesc('Choose the action you want.')
			.addDropdown(dropdown => {
				[
					{ value: actions.rearrange, text: 'Rearrange - Rearrange the given content.' },
					{ value: actions.summarization, text: 'Summarize - Summarize the given sentences.' },
					{ value: actions.augmentation, text: 'Augment - Augment the given sentences.' },
				].forEach(option => {
					dropdown.addOption(option.value, option.text)
				})
				dropdown.setValue(selectedValue)
				dropdown.onChange(value => {
					selectedValue = value
				})
			})

		new Setting(contentEl)
			.setName('Max String Length')
			.setDesc('Limit the length of the generated string.')
			.addText(text => {
				text.setPlaceholder('Enter the length.')
				text.inputEl.type = 'number'
				text.setValue(`${DEFAULT_MAX_GENERATION_STR_LENGTH}`)
				text.onChange(value => {
					maxOutputStrLength = parseInt(value)
					validateInput()
				})
			})

		const validateInput = () => {

			if (!generateButton) return

			if (!isNaN(maxOutputStrLength) && maxOutputStrLength > 0) {
				generateButton.removeAttribute('disabled')
			} else {
				generateButton.setAttribute('disabled', 'true')
			}
		}

		const buttonSetting = new Setting(contentEl)
		const generateButton = buttonSetting.addButton(button => {
			button.setButtonText('Start Gen')
				.setDisabled(false)
				.onClick(() => {
					this.onChoose(selectedValue, maxOutputStrLength)
					this.close()
				})
		}).settingEl.querySelector('button')

		validateInput() // Initial validation
	}

	onClose() {
		const { contentEl } = this
		contentEl.empty()
	}
}
