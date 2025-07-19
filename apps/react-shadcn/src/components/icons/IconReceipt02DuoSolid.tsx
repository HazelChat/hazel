// icons/svgs/duo-solid/files-&-folders

import type React from "react"
import type { SVGProps } from "react"

export const IconReceipt02DuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M10.357 1C9.273 1 8.4 1 7.691 1.058c-.728.06-1.369.185-1.96.487A5 5 0 0 0 3.544 3.73c-.302.592-.428 1.233-.487 1.961C3 6.4 3 7.273 3 8.357v11.206c0 .346 0 .663.02.922.022.265.073.604.262.92a2 2 0 0 0 1.57.971c.369.028.694-.078.941-.178.24-.097.525-.239.834-.393l.032-.017c.647-.323.838-.412 1.025-.46.251-.062.513-.076.77-.04.19.027.39.096 1.067.35l.529.199c.54.203.948.356 1.378.418.38.055.765.055 1.144 0 .43-.062.838-.215 1.378-.418l.53-.199c.676-.254.876-.323 1.066-.35.257-.036.519-.023.77.04.187.048.379.137 1.025.46l.032.017c.31.154.593.296.834.393.247.1.572.206.94.178a2 2 0 0 0 1.571-.97c.19-.317.24-.656.261-.921.021-.259.021-.576.021-.922V8.357c0-1.084 0-1.958-.058-2.666-.06-.728-.185-1.369-.487-1.961a5 5 0 0 0-2.185-2.185c-.592-.302-1.232-.428-1.961-.487C15.6 1 14.727 1 13.643 1z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M8 7h8m-8 4h8m-8 4h4"
			/>
		</svg>
	)
}

export default IconReceipt02DuoSolid
