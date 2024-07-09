import { Editor, MarkdownView, Modifier, Notice, Plugin } from 'obsidian'
import { callGptApiSync } from './utils/ApiUtils'
import { ActionSelectionModal } from './components/modal/ActionSelectionModal'
import { ApiKeySetupModal } from './components/modal/ApiKeySetupModal'
import { SettingTab } from './components/SettingTab'
import { getPromptForTextGeneration } from './utils/PromptUtils'

interface ITextMaseterSettings {
	apiKey: string;
	shortcutKey: string;
}

const DEFAULT_SETTINGS: ITextMaseterSettings = {
	apiKey: '',
	shortcutKey: 'Ctrl + Enter',
}

export default class TextMasterPlugin extends Plugin {
	settings: ITextMaseterSettings

	showActionModal = (editor: Editor) => {
		const userInput = editor.getValue()
		new ActionSelectionModal(this.app, async (action: string, maxOutputStrLength: number) => {
			const prompt = getPromptForTextGeneration(action, userInput, maxOutputStrLength)
			const apiKey = this.settings.apiKey

			editor.setValue(`${userInput}\n\n### GENERATED\n\n`)

			// Sync GPT
			const syncResponse = await callGptApiSync(prompt, apiKey)
			editor.setValue(`${editor.getValue()}` + syncResponse)

			// streaming GPT
			// callGptApiStream(prompt, apiKey, (data: string) => {
			//     editor.setValue(`${editor.getValue()}` + data);
			// });

			new Notice('Creation is complete.')
		}).open()
	}

	async onload() {
		await this.loadSettings()
		this.updateCommandShortcut()

		// Add settings tab
		this.addSettingTab(new SettingTab(this.app, this))
	}

	updateCommandShortcut() {
		this.addCommand({
			id: 'trigger-gpt-api',
			name: 'Trigger GPT API',
			hotkeys: [
				this.parseShortcutKey(this.settings.shortcutKey),
			],
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				if (!this.settings.apiKey) {
					new ApiKeySetupModal(this.app, this, () => {
						this.showActionModal(editor)
					}).open()
					return
				}

				this.showActionModal(editor)
			},
		})
	}

	parseShortcutKey(shortcutKey: string) {
		const parts = shortcutKey.split(' + ')
		const key = parts.pop()
		if (!key) {
			throw new Error('Invalid shortcut key')
		}
		const modifiers = parts.map(part => part as Modifier)
		return {
			modifiers: modifiers,
			key: key,
		}
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
	}

	async saveSettings() {
		await this.saveData(this.settings)
	}
}
