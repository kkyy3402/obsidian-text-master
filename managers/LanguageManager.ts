type SupportedLanguages = 'en' | 'ko';
type Messages = { [key: string]: string };

class LanguageManager {
	private static instance: LanguageManager
	private messages: Messages = {}
	private currentLanguage: SupportedLanguages = 'en'

	private constructor() {
		// 생성자가 private이므로 외부에서 인스턴스를 생성할 수 없습니다.
	}

	public static getInstance(): LanguageManager {
		if (!LanguageManager.instance) {
			LanguageManager.instance = new LanguageManager()
		}
		return LanguageManager.instance
	}

	public async loadLanguage(language: SupportedLanguages): Promise<void> {
		if (language !== 'en' && language !== 'ko') {
			throw new Error('Unsupported language')
		}

		const response = await fetch(`../locales/${language}.json`)
		this.messages = await response.json()
		this.currentLanguage = language
	}

	public getMessage(key: string): string {
		return this.messages[key] || key
	}

	public async setLanguage(language: SupportedLanguages): Promise<void> {
		await this.loadLanguage(language)
	}

	public getCurrentLanguage(): SupportedLanguages {
		return this.currentLanguage
	}
}

// 싱글톤 인스턴스를 export
const instance = LanguageManager.getInstance()
export default instance
