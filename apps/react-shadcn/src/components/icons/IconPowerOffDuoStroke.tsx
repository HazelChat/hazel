// icons/svgs/duo-stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconPowerOffDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M11 8a1 1 0 1 0 2 0zm2-6a1 1 0 1 0-2 0zM8.042 4.874a1 1 0 0 0-.973-1.748zm8.889-1.748a1 1 0 0 0-.973 1.748zm4.663 5.554a1 1 0 0 0-1.89.654zM9.335 19.704a1 1 0 0 0-.654 1.89zm-4.511-.527a1 1 0 1 0 1.414-1.414zm12.94-12.94a1 1 0 1 0 1.414-1.414zM21.15 12h-1A8.15 8.15 0 0 1 12 20.15v2c5.606 0 10.15-4.544 10.15-10.15zM12 8h1V2h-2v6zM7.556 4l-.487-.874A10.15 10.15 0 0 0 1.85 12h2a8.15 8.15 0 0 1 4.192-7.126zm13.093 5.007-.945.327c.289.834.446 1.73.446 2.666h2c0-1.16-.195-2.278-.555-3.32zM12 21.15v-1a8.1 8.1 0 0 1-2.666-.446l-.327.945-.327.945c1.042.36 2.16.556 3.32.556zm-6.47-2.68.707-.707A8.12 8.12 0 0 1 3.85 12h-2a10.12 10.12 0 0 0 2.973 7.177zM16.445 4l-.487.874c.664.37 1.271.83 1.805 1.363l.707-.707.707-.707a10.2 10.2 0 0 0-2.246-1.697z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m2 22 3.53-3.53L18.47 5.53 22 2"
			/>
		</svg>
	)
}

export default IconPowerOffDuoStroke
