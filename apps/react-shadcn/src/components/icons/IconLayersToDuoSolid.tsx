// icons/svgs/duo-solid/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconLayersToDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M11.379.76c1.559-.309 3.029.384 3.853 1.577a3.74 3.74 0 0 0-1.818-.085L6.172 3.687C4.386 4.042 3.11 5.62 3.098 7.442l-.05 7.5c-.005.833.25 1.6.684 2.23a3.855 3.855 0 0 1-2.72-3.72l.05-7.501c.012-1.822 1.288-3.4 3.075-3.755z"
				/>
				<path
					fill="currentColor"
					d="M14.914 3.752c1.558-.31 3.027.382 3.851 1.573a3.74 3.74 0 0 0-1.803-.081L9.72 6.68c-1.786.354-3.062 1.932-3.074 3.754l-.05 7.5a3.86 3.86 0 0 0 .686 2.233 3.855 3.855 0 0 1-2.734-3.725l.05-7.5c.012-1.822 1.288-3.4 3.074-3.755z"
				/>
			</g>
			<path
				fill="currentColor"
				d="M18.463 6.744c2.38-.472 4.553 1.392 4.537 3.806l-.05 7.5c-.012 1.821-1.287 3.4-3.074 3.755l-7.242 1.435c-2.38.472-4.553-1.392-4.538-3.805l.05-7.501c.012-1.822 1.288-3.4 3.074-3.754z"
			/>
		</svg>
	)
}

export default IconLayersToDuoSolid
