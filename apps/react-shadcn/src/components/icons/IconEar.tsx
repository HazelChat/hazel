// icons/svgs/solid/medical

import type React from "react"
import type { SVGProps } from "react"

export const IconEar: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13.526 1.666a7.41 7.41 0 0 1 3.65 13.856l-.219.119c-.348.182-.59.31-.76.404l-.114.066q-.01.067-.021.182l-.084 1.016c-.204 2.673-2.431 5.091-5.41 5.091a5.438 5.438 0 0 1-5.398-6.09l.12-.88c.136-.91.312-1.895.462-2.83.205-1.28.365-2.498.365-3.525a7.41 7.41 0 0 1 7.41-7.409Zm.03 3.417A3.976 3.976 0 0 0 9.58 9.059c0 .753-.043 1.456-.17 2.298a1 1 0 0 0 .73 1.116c1.034.277 1.231.919 1.191 1.255a.65.65 0 0 1-.265.459c-.128.092-.357.188-.732.167l-.169-.017-.102-.009a1 1 0 0 0-.27 1.972l.1.018.334.033c.766.041 1.46-.144 2.01-.542a2.65 2.65 0 0 0 1.08-1.843c.146-1.234-.527-2.453-1.829-3.108a17 17 0 0 0 .092-1.8 1.976 1.976 0 0 1 3.951 0 1 1 0 0 0 2 0 3.976 3.976 0 0 0-3.975-3.975Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconEar
