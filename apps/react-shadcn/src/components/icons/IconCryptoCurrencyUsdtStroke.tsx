// icons/svgs/stroke/web3-&-crypto

import type React from "react"
import type { SVGProps } from "react"

export const IconCryptoCurrencyUsdtStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5 5h7m0 0h7m-7 0v6m0 3v5m0-5c4.97 0 10-1.12 10-2.5S16.97 9 12 9 2 10.12 2 11.5 7.03 14 12 14Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconCryptoCurrencyUsdtStroke
