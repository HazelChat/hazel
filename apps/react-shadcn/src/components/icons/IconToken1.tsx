// icons/svgs/contrast/web3-&-crypto

import type React from "react"
import type { SVGProps } from "react"

export const IconToken1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path fill="currentColor" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" opacity=".28" />
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M10.303 9.697c.594-.594.89-.891 1.233-1.002a1.5 1.5 0 0 1 .927 0c.343.111.64.408 1.234 1.002l.606.606c.594.594.89.891 1.002 1.233a1.5 1.5 0 0 1 0 .928c-.111.342-.408.639-1.002 1.233l-.606.606c-.594.594-.891.891-1.234 1.002a1.5 1.5 0 0 1-.927 0c-.342-.111-.64-.408-1.233-1.002l-.606-.606c-.594-.594-.891-.891-1.002-1.233a1.5 1.5 0 0 1 0-.928c.11-.342.408-.639 1.002-1.233z"
			/>
		</svg>
	)
}

export default IconToken1
