// icons/svgs/duo-stroke/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconAppleWatchDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				opacity=".28"
			>
				<path
					d="M12 19c1.864 0 2.796 0 3.53-.304q.245-.101.47-.232l-.506 1.79c-.177.625-.265.938-.447 1.17a1.5 1.5 0 0 1-.613.464c-.273.112-.599.112-1.25.112h-2.369c-.65 0-.976 0-1.249-.112a1.5 1.5 0 0 1-.613-.463c-.181-.233-.27-.546-.447-1.172L8 18.464q.225.131.47.232C9.203 19 10.135 19 12 19Z"
					fill="none"
				/>
				<path
					d="M15.53 5.304C14.797 5 13.865 5 12 5s-2.796 0-3.53.304a4 4 0 0 0-.47.232l.506-1.79c.177-.625.266-.938.447-1.17a1.5 1.5 0 0 1 .613-.464C9.84 2 10.165 2 10.816 2h2.369c.65 0 .976 0 1.249.112a1.5 1.5 0 0 1 .613.463c.181.233.27.546.447 1.172L16 5.536a4 4 0 0 0-.47-.232Z"
					fill="none"
				/>
			</g>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M18 11v2c0 1.864 0 2.796-.305 3.53a4 4 0 0 1-2.164 2.165C14.796 19 13.864 19 12 19s-2.796 0-3.53-.305a4 4 0 0 1-2.166-2.164C6 15.796 6 14.864 6 13v-2c0-1.864 0-2.796.304-3.53A4 4 0 0 1 8.47 5.303C9.204 5 10.136 5 12 5s2.796 0 3.53.304a4 4 0 0 1 2.165 2.165C18 8.204 18 9.136 18 11Zm0 0h1v-1h-1"
				fill="none"
			/>
		</svg>
	)
}

export default IconAppleWatchDuoStroke
