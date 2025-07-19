// icons/svgs/duo-solid/security

import type React from "react"
import type { SVGProps } from "react"

export const IconEyeOffDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
					d="M12 4C8.933 4 6.446 5.396 4.745 7.029a11 11 0 0 0-1.988 2.55C2.307 10.394 2 11.257 2 12c0 .91.462 2.022 1.136 3.048a11.5 11.5 0 0 0 2.999 3.065A1 1 0 0 0 7.415 18l3.17-3.171a1 1 0 0 1-1.413 0 4 4 0 0 1 5.657-5.657 1 1 0 0 1 0 1.413L18 7.415a1 1 0 0 0-.135-1.528C16.301 4.796 14.314 4 12 4Z"
				/>
				<path
					fill="currentColor"
					d="M14.828 10.586a1 1 0 0 1-1.414 0 2 2 0 1 0-2.828 2.828 1 1 0 0 1 0 1.414z"
				/>
				<path
					fill="currentColor"
					d="M12.326 15.987a.2.2 0 0 0-.13.059l-2.158 2.159a1 1 0 0 0 .566 1.697A10 10 0 0 0 12 20c3.068 0 5.554-1.396 7.255-3.029a11 11 0 0 0 1.988-2.55c.45-.815.757-1.678.757-2.421 0-.888-.44-1.965-1.081-2.963a1 1 0 0 0-1.548-.166l-3.325 3.325a.2.2 0 0 0-.06.13 4 4 0 0 1-3.66 3.66Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M22 2 2 22"
			/>
		</svg>
	)
}

export default IconEyeOffDuoSolid
