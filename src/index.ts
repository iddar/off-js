declare global {
  interface Window { __off_router_state__: any; }
}

export type EventCallback = (ev: Event) => void
export type CleanEvent = () => void
export type Render = (innerHTML: string, action?: Action) => void
export type ActionResponse = CleanEvent|Array<CleanEvent>|void
export type Action = () => ActionResponse

export interface Offjs {
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

export class Offjs {
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

let instance: Offjs
export default function off (el?: HTMLElement) {
  if (instance == null) {
    instance = new Offjs(el)
  }
  
  return instance.render.bind(instance)
}

export type props = {}
export type Component = (render: Render, props?: props) => void

export type Routes = Map<string, Component>

type Router = (routes: Routes) => void

export function createRouter (render: Render): Router {
  if (render == null) throw new Error('Should include render function')

  const ROOT = 'INDEX'

  type RouterState = {
    history: [string?],
    courrent: Function,
    perv: Function,
  }

  const state: RouterState = {
    history: [],
    courrent: (): string => {
      return [...state.history].pop() as string
    },
    perv: (): string => {
      if (state.history.length >= 2) {
        state.history.pop()
        return state.history[state.history.length - 1] as string
      } else {
        return state.history[0] as string
      }
    }
  }

  window.__off_router_state__ = state

  let routes: Routes = new Map()

  function to (route: string, props?: props): void {
    const page = routes.get(route.toUpperCase())
    if (typeof page !== 'function') {
      throw new Error(`Expected Component function in '${route} 'route`)
    }
    
    if (props && 'nav' in props) {
      throw new Error('Invalid property: `nav` property is reserved for `Off-router`')
    }

    if (state.courrent() !== route.toUpperCase()) {
      state.history.push(route.toUpperCase())
    }

    page(render, {
      ...props,
      nav: {
        to,
        back: (props?: props) => to(state.perv(), props),
        courrent: () => state.courrent()
      },
    })
  }
  
  return function router (initialRoutes: Routes) {
    if (initialRoutes == null) {
      throw new Error('Should include Routes: Map<\'routeName\', component>')
    }
    
    for (let [route, component] of initialRoutes.entries()) {
      if (routes.has(route.toUpperCase())) {
        throw new Error('Expected all routes must have different names')
      }
      
      if (typeof component !== 'function') {
        throw new Error(`Expected Component function in ${route} route`)
      }
      
      routes.set(route.toUpperCase(), component)
    }

    if (!routes.has(ROOT)) {
      throw new Error('Should include `index` route')
    }
    
    const page = routes.get(ROOT)
    if (typeof page !== 'function') {
      throw new Error('Expected Component function in `index` route')
    }
    
    to(ROOT) // mount index view
  }
}
