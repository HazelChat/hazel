// PrismJS language components (prismjs/components/prism-xxx) are IIFEs that
// reference the bare global `Prism`.  In Vite's production bundle the global
// assignment inside prismjs/prism.js can be skipped (it guards behind
// `typeof global !== 'undefined'` which is false in browsers), so the
// component scripts blow up with "Prism is not defined".
//
// Importing this module first ensures the global is set before any component
// side-effect imports execute.

import Prism from "prismjs"
;(globalThis as any).Prism = Prism

export default Prism
