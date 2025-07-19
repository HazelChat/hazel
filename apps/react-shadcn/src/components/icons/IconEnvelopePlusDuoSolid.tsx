// icons/svgs/duo-solid/communication

import type React from "react"
import type { SVGProps } from "react"

export const IconEnvelopePlusDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M22.34 8.605a.392.392 0 0 1 .608.3C23 9.73 23 10.702 23 11.872v.172c0 1.363 0 2.447-.071 3.322-.051.622-.14 1.18-.31 1.698A3 3 0 0 0 22 17a3 3 0 1 0-6 0 3 3 0 0 0-2.83 4H9.957c-1.363 0-2.447 0-3.321-.071-.896-.074-1.66-.227-2.359-.583a6 6 0 0 1-2.622-2.622c-.356-.7-.51-1.463-.583-2.358C1 14.49 1 13.406 1 12.044v-.172c0-1.17 0-2.143.052-2.967a.392.392 0 0 1 .608-.3l5.668 3.607c1.402.893 2.317 1.476 3.324 1.708a6 6 0 0 0 2.697 0c1.006-.232 1.921-.815 3.323-1.708z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M9.956 3h4.088c1.363 0 2.447 0 3.322.071.895.074 1.659.227 2.358.583a6 6 0 0 1 2.38 2.19.47.47 0 0 1-.161.643l-6.185 3.936c-1.62 1.03-2.23 1.403-2.859 1.548a4 4 0 0 1-1.798 0c-.629-.145-1.24-.517-2.859-1.548L2.057 6.488a.47.47 0 0 1-.16-.644 6 6 0 0 1 2.38-2.19c.698-.356 1.462-.51 2.358-.583C7.509 3 8.593 3 9.956 3Z"
			/>
			<path
				fill="currentColor"
				d="M20 17a1 1 0 1 0-2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 1 0 0-2h-2z"
			/>
		</svg>
	)
}

export default IconEnvelopePlusDuoSolid
