// icons/svgs/duo-solid/navigation

import type React from "react"
import type { SVGProps } from "react"

export const IconMapDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
					d="M7.84 3.478a.19.19 0 0 1 .26.179v14.834c0 .047-.027.09-.069.112l-.042.02c-.71.355-1.302.652-1.792.845-.498.195-1.029.343-1.586.27a3 3 0 0 1-2.098-1.296c-.314-.466-.419-1.006-.466-1.54C2 16.379 2 15.717 2 14.923v-6.07c0-.593 0-1.115.164-1.595a3 3 0 0 1 .693-1.121c.355-.363.822-.596 1.354-.86l3-1.5c.22-.11.426-.214.63-.3Z"
				/>
				<path
					fill="currentColor"
					d="M15.9 5.51c0-.048.027-.091.07-.113l.041-.02c.71-.355 1.303-.652 1.793-.844.498-.196 1.028-.344 1.585-.272a3 3 0 0 1 2.098 1.297c.314.466.419 1.006.466 1.54.047.524.047 1.186.047 1.98v6.069c.001.593.002 1.115-.164 1.595-.145.42-.381.803-.692 1.121-.356.363-.822.595-1.353.86l-.113.056-2.8 1.4-.092.046a10 10 0 0 1-.626.297.19.19 0 0 1-.26-.179z"
				/>
			</g>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M9.9 18.49c0 .048.027.091.07.113l3.242 1.62c.22.11.425.214.629.3a.19.19 0 0 0 .26-.18V5.509a.13.13 0 0 0-.07-.112l-3.242-1.62c-.22-.11-.425-.214-.629-.3a.19.19 0 0 0-.26.18z"
				clipRule="evenodd"
			/>
		</svg>
	)
}

export default IconMapDuoSolid
