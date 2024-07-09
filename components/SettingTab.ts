import { App, PluginSettingTab, Setting } from 'obsidian'
import TextMasterPlugin from '../main'

export class SettingTab extends PluginSettingTab {
	plugin: TextMasterPlugin

	constructor(app: App, plugin: TextMasterPlugin) {
		super(app, plugin)
		this.plugin = plugin
	}

	display(): void {
		const { containerEl } = this

		containerEl.empty()

		const apiKeyStatus = document.createElement('div')
		containerEl.appendChild(apiKeyStatus)

		new Setting(containerEl)
			.setName('GPT API Key')
			.setDesc('Enter your GPT API key here')
			.addText(text => text
				.setPlaceholder('Enter your API key')
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (value) => {
					this.plugin.settings.apiKey = value
					await this.plugin.saveSettings()
				}))

		const shortcutSetting = new Setting(containerEl)
			.setName('Shortcut Key')
			.setDesc('Set your shortcut key here (default: Ctrl + Enter)')

		const shortcutInput = document.createElement('input')
		shortcutInput.type = 'text'
		shortcutInput.placeholder = 'Press your shortcut key'
		shortcutInput.value = this.plugin.settings.shortcutKey || 'Ctrl + Enter'
		shortcutInput.readOnly = true // Read-only to prevent manual typing

		const shortcutError = document.createElement('div')
		shortcutError.style.color = 'red'
		shortcutError.style.marginTop = '10px'
		shortcutSetting.settingEl.appendChild(shortcutInput)
		shortcutSetting.settingEl.appendChild(shortcutError)

		shortcutInput.addEventListener('keydown', async (event) => {
			event.preventDefault() // Prevent default input behavior
			const key = []
			if (event.ctrlKey) key.push('Ctrl')
			if (event.shiftKey) key.push('Shift')
			if (event.altKey) key.push('Alt')
			key.push(event.key)
			const shortcutKey = key.join(' + ')

			if (this.isDuplicateShortcut(shortcutKey)) {
				shortcutError.textContent = `This shortcut conflicts with an existing shortcut: ${shortcutKey}`
				return
			}

			shortcutError.textContent = ''
			shortcutInput.value = shortcutKey
			this.plugin.settings.shortcutKey = shortcutKey
			await this.plugin.saveSettings()

			// Update the command with the new shortcut key
			this.plugin.updateCommandShortcut()
		})

		const supportLink = document.createElement('a')
		supportLink.href = 'https://github.com/kkyy3402'
		supportLink.textContent = '후원하러 가기'
		supportLink.target = '_blank'
		supportLink.style.display = 'block'
		supportLink.style.marginTop = '20px'
		supportLink.style.textAlign = 'center'
		supportLink.style.color = 'var(--text-normal)'

		containerEl.appendChild(supportLink)
	}

	isDuplicateShortcut(newShortcut: string): boolean {
		// Check if the new shortcut key conflicts with any existing shortcuts
		const existingShortcuts = [this.plugin.settings.shortcutKey] // Add more shortcuts if needed
		return existingShortcuts.includes(newShortcut)
	}
}
