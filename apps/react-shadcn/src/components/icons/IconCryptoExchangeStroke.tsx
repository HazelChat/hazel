// icons/svgs/stroke/web3-&-crypto

import type React from "react"
import type { SVGProps } from "react"

export const IconCryptoExchangeStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M21 4.5c-.206-.863-.93-1.5-1.794-1.5H18m-3 6.5c.206.863.93 1.5 1.794 1.5H18m0-8h-1.148C15.829 3 15 3.895 15 5s.83 2 1.852 2h2.296C20.171 7 21 7.895 21 9s-.83 2-1.852 2H18m0-8V2m0 9v1M5.07 8A8 8 0 0 1 11 4.062M18.93 16A8 8 0 0 1 13 19.938M3 17h4m-4 0v-4h4a2 2 0 1 1 0 4m-4 0v4h4a2 2 0 1 0 0-4m-1 4v1m0-10v1"
				fill="none"
			/>
		</svg>
	)
}

export default IconCryptoExchangeStroke
