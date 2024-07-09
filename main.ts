import { Editor, MarkdownView, Notice, Plugin } from 'obsidian'
import { callGptApiSync } from './utils/ApiUtils'
import { ActionSelectionModal } from './components/modal/ActionSelectionModal'
import { ApiKeySetupModal } from './components/modal/ApiKeySetupModal'
import { SettingTab } from './components/SettingTab'
import { getPromptForTextGeneration } from './utils/PromptUtils'

interface ITextMaseterSettings {
	apiKey: string;
}

const DEFAULT_SETTINGS: ITextMaseterSettings = {
	apiKey: '',
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
			// 	editor.setValue(`${editor.getValue()}` + data)
			// })

			new Notice('Creation is complete.')
		}).open()
	}

	async onload() {
		await this.loadSettings()


		// Command to trigger GPT API
		this.addCommand({
			id: 'trigger-gpt-api',
			name: 'Trigger GPT API',
			hotkeys: [
				{
					modifiers: ['Ctrl'],

					key: 'Enter',
				},
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

		// Add settings tab
		this.addSettingTab(new SettingTab(this.app, this))
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


