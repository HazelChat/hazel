// icons/svgs/contrast/web3-&-crypto

import type React from "react"
import type { SVGProps } from "react"

export const IconSmartContract1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="currentColor"
				d="M3.436 5.184C3 6.04 3 7.16 3 9.4v5.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748C6.04 21 7.16 21 9.4 21h3.66v-.588c-.224-.32-.527-.82-.678-1.394a4 4 0 0 1 0-2.036c.215-.817.738-1.485.902-1.695l.036-.047 1.04-1.386c.18-.24.417-.557.651-.818.265-.295.764-.796 1.54-1.097a4 4 0 0 1 2.899 0c.366.142.67.329.918.518H21V9.4c0-2.24 0-3.36-.436-4.216a4 4 0 0 0-1.748-1.748C17.96 3 16.84 3 14.6 3H9.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M8 8h8m-8 4h5m-.754 9H9.4c-2.24 0-3.36 0-4.216-.436a4 4 0 0 1-1.748-1.748C3 17.96 3 16.84 3 14.6V9.4c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C6.04 3 7.16 3 9.4 3h5.2c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748C21 6.04 21 7.16 21 9.4v2.282m-5.28 7.278 1 1.333c.434.58.651.869.918.972a1 1 0 0 0 .724 0c.267-.103.484-.393.918-.972l1-1.333c.258-.344.387-.516.437-.705a1 1 0 0 0 0-.51c-.05-.189-.179-.36-.437-.705l-1-1.333c-.434-.58-.651-.869-.918-.972a1 1 0 0 0-.724 0c-.267.103-.484.393-.918.972l-1 1.333c-.258.344-.387.516-.437.705a1 1 0 0 0 0 .51c.05.189.179.36.437.705Z"
			/>
		</svg>
	)
}

export default IconSmartContract1
