// icons/svgs/contrast/general

import type React from "react"
import type { SVGProps } from "react"

export const IconExchange1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g opacity=".28">
				<path
					fill="currentColor"
					d="M7.444 13.157A15 15 0 0 1 10 15.812c-.993-.103-1.999-.269-3-.269s-2.006.166-3 .269a15 15 0 0 1 2.557-2.655.7.7 0 0 1 .887 0Z"
				/>
				<path
					fill="currentColor"
					d="M17.444 10.843A15 15 0 0 0 20 8.188c-.993.104-1.999.27-3 .27s-2.006-.166-3-.27a15 15 0 0 0 2.557 2.655.7.7 0 0 0 .887 0Z"
				/>
				<path fill="currentColor" d="M3.85 6a3.15 3.15 0 1 0 6.3 0 3.15 3.15 0 0 0-6.3 0Z" />
				<path fill="currentColor" d="M13.85 18a3.15 3.15 0 1 0 6.3 0 3.15 3.15 0 0 0-6.3 0Z" />
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M7 21v-5.457M17 3v5.457m0 0c1.001 0 2.006-.166 3-.269a15 15 0 0 1-2.556 2.654.7.7 0 0 1-.887 0A15 15 0 0 1 14 8.188c.994.103 1.999.269 3 .269ZM7 15.543c1.001 0 2.006.165 3 .268a15 15 0 0 0-2.556-2.654.7.7 0 0 0-.887 0A15 15 0 0 0 4 15.811c.994-.103 1.999-.268 3-.268ZM7 2.85a3.15 3.15 0 1 0 0 6.3 3.15 3.15 0 0 0 0-6.3Zm10 12a3.15 3.15 0 1 0 0 6.3 3.15 3.15 0 0 0 0-6.3Z"
			/>
		</svg>
	)
}

export default IconExchange1
