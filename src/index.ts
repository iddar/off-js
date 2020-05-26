export type EventCallback = (ev: Event) => void
export type CleanEvent = () => void
export type Render = (innerHTML: string, action?: Action) => void
export type ActionResponse = CleanEvent|Array<CleanEvent>|void
export type Action = () => ActionResponse

export interface Off {
  render (html: string, action: Action): void
  render (el: HTMLElement, html: string, action: Action): void
  render (elOrHtml: HTMLElement | string, htmlOrAction?: string|Action, action?: Action ): void
}

export function createEvent <K extends keyof DocumentEventMap>(el: HTMLElement, on: K, cb: EventCallback): CleanEvent {
  el.addEventListener(on, cb)
  const cleanEvent = () => el.removeEventListener('click', cb)
  return cleanEvent
}

createEvent.prevent = function <K extends keyof DocumentEventMap>(el: HTMLElement, on: K, cb: EventCallback): CleanEvent {
  return createEvent(el, on, (ev) => {
    ev.preventDefault()
    cb(ev)
  })
}

export function html (template: TemplateStringsArray, ...args: Array<any>): string {
  return template.reduce((acc, currentString, index) => {
    return acc + currentString + (args[index] || "")
  },"")
}

export class Off {
  private _events: CleanEvent[] = []
  private _container: HTMLElement

  constructor(container?: HTMLElement) {
    if (container) {
      this._container = container
    } else {
      this._container = document.querySelector('body') as HTMLElement
    }
  }

  private cleanEvents (): void {
    this._events.forEach(clear => clear())
  }
  
  render (html: string, action: Action): void
  render (el: HTMLElement, html: string, action: Action): void
  render (elOrHtml: HTMLElement | string, htmlOrAction?: string|Action, action?: Action ): void {
    this.cleanEvents()
    
    if (typeof elOrHtml === 'string') {
      this._container.innerHTML = elOrHtml
    } else if(typeof htmlOrAction === 'string'){
      elOrHtml.innerHTML = htmlOrAction
    }
    
    let event: ActionResponse
    if (typeof htmlOrAction === "function") {
      event = htmlOrAction()
    }else if (typeof action === "function") {
      event = action()
    }

    if (event) {
      if(Array.isArray(event)) {
        this._events.push(...event)
      }else {
        this._events.push(event)
      }
    }
  }
}

let instance: Off
export default function niboffle (el?: HTMLElement) {
  if (instance == null) {
    instance = new Off(el)
  }
  
  return instance.render.bind(instance)
}
