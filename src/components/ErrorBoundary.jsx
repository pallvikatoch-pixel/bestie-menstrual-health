import { Component } from 'react'
import en from '../i18n/en.js'
import hi from '../i18n/hi.js'

// A crash in one screen shows a friendly message instead of a blank page.
export default class ErrorBoundary extends Component {
  constructor(p) { super(p); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) { console.error('Screen error:', error, info) }
  componentDidUpdate(prev) { if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null }) }
  render() {
    if (!this.state.error) return this.props.children
    const d = this.props.lang === 'hi' ? hi : en
    return (
      <div className="card text-center m-4" role="alert">
        <h1 className="text-2xl font-bold mb-2">{d['err.title']}</h1>
        <p className="mb-4">{d['err.body']}</p>
        <a className="btn-primary" href="#/">{d['err.home']}</a>
      </div>
    )
  }
}
