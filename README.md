# off-js

Off.js is short for "One File Framework": off.js it's a small component framework, including the essentials tools for creating light projects.

# Live Demo

Visit the sandbox example: https://codesandbox.io/s/off-js-counter-pvn6i

[demo](https://codesandbox.io/s/off-js-counter-pvn6i)

## Easy to use

```js
import off, { html } from 'https://unpkg.com/off-js'
const render = off(document.querySelector('.playground'))

render(html`
  <h1>Hello world!</h1>
`)
```

## Install

```js
// ES Module
import off from 'https://unpkg.com/off-js'
```

```sh
# for bundle projects
npm install -S off-js
or
yarn add off-js
```

## Lifecycle

createElement -> (render) mount compoenent -> invoke actions

# Recive Props

```js
const ShowCount = (render, props = {}) => {
  const { count = 0 } = props

  render(html`
    <div>
      <p>Actual counter: ${count.toString()}</p>
      <p>This value is set in "Props"</p>
    </div>
  `)
}

// call with props
ShowCount(render, { count: 5 })
```

# State component

```js
import { html, createEvent } from 'https://unpkg.com/off-js'
import Home from '../app'

const state = {
  count: 0
}

export default (render) => {
  const actions = () => {
    const remove = document.querySelector('.remove')
    const add = document.querySelector('.add')
    const count = document.querySelector('.count')
    
    const removeEvent = createEvent.prevent(remove, 'click', (_ev) => {
      state.count--
      count.innerHTML = state.count.toString()
    })
    
    const addEvent = createEvent.prevent(add, 'click', (_ev) => {
      state.count++
      count.innerHTML = state.count.toString()
    })

    // return all event for clean before unmount (event|[events])
    return [removeEvent, addEvent]
  }
  
  render(html`
    <h1>Counter</h1>
    <p>This component preserves the state after unmounting</p>
    <h3 class="count">${state.count.toString()}</h3>
    <button class="remove"> - </button>
    <button class="add"> + </button>
  `, actions)
}
```

## HTML Method

The `html` metod call without parentheses, this method write only for support this pluging [es6-string-html](https://marketplace.visualstudio.com/items?itemName=Tobermory.es6-string-html) and use HTML color syntax.


## TODO

- [x] Router
- [ ] useRender (call render on any site)
- [ ] More Docs
