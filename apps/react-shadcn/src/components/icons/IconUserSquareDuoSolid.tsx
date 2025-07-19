// icons/svgs/duo-solid/users

import type React from "react"
import type { SVGProps } from "react"

export const IconUserSquareDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M11 2h-.044c-1.363 0-2.447 0-3.321.071-.896.074-1.66.227-2.359.583a6 6 0 0 0-2.622 2.622c-.356.7-.51 1.463-.583 2.359C2 8.509 2 9.593 2 10.956v2.088c0 1.363 0 2.447.071 3.321.074.896.227 1.66.583 2.359a6 6 0 0 0 2.622 2.622c.7.356 1.463.51 2.359.583.874.071 1.958.071 3.321.071h2.088c1.363 0 2.447 0 3.321-.071.896-.074 1.66-.227 2.359-.583a6 6 0 0 0 2.622-2.622c.356-.7.51-1.463.583-2.359.071-.874.071-1.958.071-3.321v-2.088c0-1.363 0-2.447-.071-3.321-.074-.896-.227-1.66-.583-2.359a6 6 0 0 0-2.622-2.622c-.7-.356-1.463-.51-2.359-.583C15.491 2 14.407 2 13.044 2z"
				clipRule="evenodd"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M19.634 17.666A4.36 4.36 0 0 0 15.617 15H8.383a4.36 4.36 0 0 0-4.017 2.667 4 4 0 0 0 1.818 1.897c.37.189.842.308 1.614.371C8.58 20 9.583 20 11 20h2c1.417 0 2.42 0 3.203-.065.772-.063 1.243-.182 1.613-.371a4 4 0 0 0 1.818-1.898ZM8 10a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
			/>
		</svg>
	)
}

export default IconUserSquareDuoSolid
