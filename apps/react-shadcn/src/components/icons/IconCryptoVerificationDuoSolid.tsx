// icons/svgs/duo-solid/web3-&-crypto

import type React from "react"
import type { SVGProps } from "react"

export const IconCryptoVerificationDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13.007 1.678a5 5 0 0 0-2.014 0c-.754.155-1.448.541-2.453 1.1L5.664 4.376c-1.06.589-1.794.995-2.34 1.59a5 5 0 0 0-1.071 1.819C1.999 8.55 2 9.39 2 10.603v2.794c0 1.213 0 2.051.253 2.818a5 5 0 0 0 1.07 1.82c.547.593 1.28 1 2.341 1.589l2.876 1.598c1.005.558 1.7.945 2.453 1.1a5 5 0 0 0 2.014 0c.754-.155 1.448-.542 2.453-1.1l2.876-1.598c1.06-.589 1.794-.996 2.34-1.59a5 5 0 0 0 1.072-1.82C22 15.449 22 14.61 22 13.398v-2.794c0-1.213 0-2.052-.252-2.818a5 5 0 0 0-1.071-1.82c-.547-.594-1.28-1-2.341-1.59L15.46 2.779c-1.005-.559-1.7-.945-2.453-1.1Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m8.5 12.666 2.341 2.339C11.99 12.997 13.593 11.302 15.5 10"
			/>
		</svg>
	)
}

export default IconCryptoVerificationDuoSolid
