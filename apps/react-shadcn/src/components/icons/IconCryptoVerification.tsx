// icons/svgs/solid/web3-&-crypto

import type React from "react"
import type { SVGProps } from "react"

export const IconCryptoVerification: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M10.993 1.678a5 5 0 0 1 2.014 0c.754.155 1.448.541 2.453 1.1l2.876 1.598c1.06.589 1.794.995 2.34 1.59a5 5 0 0 1 1.072 1.819C22 8.55 22 9.39 22 10.603v2.794c0 1.213 0 2.051-.252 2.818a5 5 0 0 1-1.071 1.82c-.547.593-1.28 1-2.341 1.589l-2.876 1.598c-1.005.558-1.7.945-2.453 1.1a5 5 0 0 1-2.014 0c-.754-.155-1.448-.542-2.453-1.1l-2.876-1.598c-1.06-.589-1.794-.996-2.34-1.59a5 5 0 0 1-1.071-1.82C1.999 15.449 2 14.61 2 13.398v-2.794c0-1.213 0-2.052.253-2.818a5 5 0 0 1 1.07-1.82c.547-.594 1.28-1 2.341-1.59L8.54 2.779c1.005-.559 1.7-.945 2.453-1.1Zm5.07 9.148a1 1 0 1 0-1.127-1.652 16.4 16.4 0 0 0-4.274 4.238L9.207 11.96a1 1 0 0 0-1.414 1.415l2.341 2.338a1 1 0 0 0 1.575-.21c1.07-1.87 2.566-3.455 4.355-4.676Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconCryptoVerification
