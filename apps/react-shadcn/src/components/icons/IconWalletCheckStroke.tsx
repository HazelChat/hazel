// icons/svgs/stroke/web3-&-crypto

import type React from "react"
import type { SVGProps } from "react"

export const IconWalletCheckStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M2 14.5V11c0-2.8 0-4.2.545-5.27A5 5 0 0 1 4.73 3.545C5.8 3 7.2 3 10 3h3.5c1.398 0 2.097 0 2.648.228a3 3 0 0 1 1.624 1.624c.207.5.226 1.123.228 2.28M2 14.5c0 1.33 0 2.495.38 3.413a5 5 0 0 0 2.707 2.706C6.005 21 7.17 21 9.5 21h2.83M2 14.5c0-2.33 0-3.495.38-4.413A5 5 0 0 1 5.088 7.38C6.005 7 7.17 7 9.5 7h5c1.634 0 2.695 0 3.5.131M14 12h3m1-4.869c.343.056.639.136.913.25a5 5 0 0 1 2.706 2.706c.252.608.337 1.323.366 2.413m-6.275 6.368L17.844 21A13.66 13.66 0 0 1 22 16.5"
				fill="none"
			/>
		</svg>
	)
}

export default IconWalletCheckStroke
