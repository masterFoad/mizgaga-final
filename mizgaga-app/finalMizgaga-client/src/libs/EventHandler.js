//eventHandler
class Event {
  constructor (name) {
    this.name = name
    this.callbacks = []
  }

  registerCallback (callback) {
    this.callbacks.push(callback)
  }

  activateCallbacks (args) {
    this.callbacks.forEach((callback) => callback(args))
  }
}

class EventHandler {
  constructor () {
    this.events = []
  }

  registerEvent (eventName) {
    if (!this.events[eventName]) {
      this.events[eventName] = new Event(eventName)
      //console.log(this.events[eventName]);
    } else {
      throw 'event Already exists'
    }
  }

  removeEvent (eventName) {
    this.events = this.events.filter((key) => key !== eventName)
  }

  dispatchEvent (eventName, args) {
    this.events[eventName].activateCallbacks(args)
  }

  addEventListener (eventName, callback) {
    this.events[eventName].registerCallback(callback)
  }
}

const eventHandlerInstance = new EventHandler()
Object.freeze(eventHandlerInstance)

export default eventHandlerInstance
