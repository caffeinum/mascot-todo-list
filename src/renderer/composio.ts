import { Composio } from '@composio/core'

const COMPOSIO_API_KEY_STORAGE = 'ELECTRON_COMPOSIO_API_KEY'

export type ToolRouterSession = {
  url: string
  userId: string
  toolkits: string[]
}

export class ComposioClient {
  private apiKey: string | null = null
  private composio: Composio | null = null

  constructor() {
    this.loadApiKey()
  }

  private loadApiKey() {
    if (typeof window !== 'undefined') {
      this.apiKey = localStorage.getItem(COMPOSIO_API_KEY_STORAGE)
      if (this.apiKey) {
        this.initComposio()
      }
    }
  }

  private initComposio() {
    if (this.apiKey) {
      this.composio = new Composio({
        apiKey: this.apiKey,
      })
    }
  }

  setApiKey(key: string) {
    this.apiKey = key
    if (typeof window !== 'undefined') {
      localStorage.setItem(COMPOSIO_API_KEY_STORAGE, key)
    }
    this.initComposio()
  }

  getApiKey(): string | null {
    return this.apiKey
  }

  clearApiKey() {
    this.apiKey = null
    this.composio = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem(COMPOSIO_API_KEY_STORAGE)
    }
  }

  async createSession(
    userId: string,
    toolkits?: string[]
  ): Promise<ToolRouterSession | null> {
    if (!this.composio) {
      throw new Error('composio not initialized - set api key first')
    }

    try {
      const session = await this.composio.experimental.toolRouter.createSession(
        userId,
        toolkits ? { toolkits } : undefined
      )

      return {
        url: session.url,
        userId,
        toolkits: toolkits || [],
      }
    } catch (error) {
      console.error('failed to create composio session:', error)
      return null
    }
  }

  async listAvailableTools(): Promise<string[]> {
    if (!this.composio) {
      throw new Error('composio not initialized - set api key first')
    }

    try {
      // this would list available toolkits
      // composio doesn't expose a simple list method in the sdk yet
      // but we can return common ones
      return [
        'gmail',
        'github',
        'slack',
        'notion',
        'jira',
        'linear',
        'figma',
        'googlecalendar',
        'googledrive',
        'googlesheets',
      ]
    } catch (error) {
      console.error('failed to list tools:', error)
      return []
    }
  }

  isReady(): boolean {
    return !!this.composio && !!this.apiKey
  }
}

export const composioClient = new ComposioClient()
