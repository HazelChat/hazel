// icons/svgs/duo-solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconRocketShipDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M11.359 6.148H6.98c-.327 0-.543.06-.823.228L4.344 7.465c-.433.26-.65.39-.712.549a.5.5 0 0 0 .029.424c.083.15.315.25.78.448l3.473 1.489m5.711 5.71 1.489 3.475c.199.464.298.696.448.779a.5.5 0 0 0 .424.029c.16-.062.29-.279.55-.712l1.088-1.814c.168-.28.228-.496.228-.823v-4.378m-9.9 7.65-.707.707m-3.535-4.95-.708.707"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M21.388 2.612c-.41-.409-.992-.527-1.396-.573-.459-.054-.984-.044-1.513-.004-1.196.091-1.871.144-3.291.622-1 .338-2.665 1.228-3.5 1.873-1.19.92-1.935 1.87-3.228 3.522L7.452 9.34c-.507.647-.886 1.13-1.098 1.652a4 4 0 0 0 .21 3.449c.273.492.707.926 1.29 1.507l.198.199c.581.582 1.015 1.016 1.507 1.29a4 4 0 0 0 3.449.21c.521-.213 1.005-.592 1.652-1.1l1.288-1.007c1.652-1.293 2.603-2.037 3.522-3.227.645-.836 1.535-2.5 1.873-3.5.478-1.421.53-2.096.622-3.292.04-.529.05-1.054-.004-1.513-.046-.404-.164-.986-.573-1.396Z"
			/>
			<path
				fill="currentColor"
				d="M6.538 18.876a1 1 0 1 0-1.414-1.414L2.296 20.29a1 1 0 1 0 1.414 1.414z"
			/>
		</svg>
	)
}

export default IconRocketShipDuoSolid
