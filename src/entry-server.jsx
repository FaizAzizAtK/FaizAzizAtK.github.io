import { renderToString } from 'react-dom/server'
import App from './App.jsx'

// Runs at build time only: real text in the HTML for search engines and no-JS readers.
export const render = (path) => renderToString(<App initialPath={path} />)
