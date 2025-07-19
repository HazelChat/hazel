// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconPluginAddonPuzzle: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M16.816 21.564a4 4 0 0 0 1.748-1.748c.247-.485.346-1.002.392-1.564.04-.49.044-1.082.044-1.788q.245.036.5.036a3.5 3.5 0 1 0-.508-6.963q-.008-.431-.036-.789c-.046-.562-.145-1.079-.392-1.564a4 4 0 0 0-1.748-1.748c-.485-.247-1.002-.346-1.564-.392-.37-.03-.797-.04-1.288-.043Q14 4.755 14 4.5a3.5 3.5 0 1 0-6.964.501c-.49.003-.918.013-1.288.043-.562.046-1.079.145-1.564.392a4 4 0 0 0-1.748 1.748c-.247.485-.346 1.002-.392 1.564C2 9.29 2 9.954 2 10.758v.742a1 1 0 0 0 1.6.8 1.5 1.5 0 1 1 0 2.401 1 1 0 0 0-1.6.8v.74c0 .805 0 1.47.044 2.01.046.563.145 1.08.392 1.565a4 4 0 0 0 1.748 1.748c.485.247 1.002.346 1.564.392C6.29 22 6.954 22 7.758 22h5.483c.805 0 1.47 0 2.01-.044.563-.046 1.08-.145 1.565-.392Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconPluginAddonPuzzle
