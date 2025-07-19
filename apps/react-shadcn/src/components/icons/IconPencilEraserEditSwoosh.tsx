// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconPencilEraserEditSwoosh: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path
				d="M16.154 2.757a2.57 2.57 0 0 1 3.215-.346 7.3 7.3 0 0 1 2.24 2.278 2.6 2.6 0 0 1-.396 3.235l-.973.977a.3.3 0 0 1-.424 0l-4.689-4.688a.3.3 0 0 1 0-.424z"
				fill="currentColor"
			/>
			<path
				d="M13.717 5.631a.3.3 0 0 0-.425 0L3.102 15.868l-.05.05c-.216.216-.428.428-.586.684a2.6 2.6 0 0 0-.309.722c-.075.292-.082.59-.089.898l-.045 1.85-.023.9a1.01 1.01 0 0 0 .998 1.024l2.8.005c.316.001.627.002.93-.07.264-.064.518-.17.75-.312.265-.164.485-.384.709-.61l.05-.05 10.17-10.214a.3.3 0 0 0-.001-.424z"
				fill="currentColor"
			/>
			<path
				d="M21.737 19.676a1 1 0 0 0-1.474-1.352c-1.18 1.287-1.939 1.703-2.41 1.816-.41.098-.736.004-1.233-.25q-.107-.055-.241-.128c-.45-.246-1.115-.608-1.85-.695-1.001-.12-2.022.23-3.16 1.158a1 1 0 1 0 1.263 1.55c.87-.709 1.365-.758 1.66-.723.32.039.572.172.99.396q.188.1.428.224c.638.325 1.5.68 2.61.412 1.05-.252 2.141-1.016 3.417-2.408Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconPencilEraserEditSwoosh
