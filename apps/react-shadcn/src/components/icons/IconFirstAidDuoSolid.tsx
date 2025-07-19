// icons/svgs/duo-solid/medical

import type React from "react"
import type { SVGProps } from "react"

export const IconFirstAidDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M11.162 2c-.528 0-.982 0-1.357.03-.395.033-.789.104-1.167.297a3 3 0 0 0-1.311 1.311c-.193.378-.264.772-.296 1.167C7 5.165 7 5.601 7 6.103a5 5 0 0 0-.855.19 6 6 0 0 0-3.852 3.853C1.999 11.052 2 12.13 2 13.8v.4c0 1.669 0 2.748.294 3.654a6 6 0 0 0 3.852 3.852c.906.295 1.985.294 3.654.294h4.4c1.669 0 2.748 0 3.654-.294a6 6 0 0 0 3.852-3.852c.295-.906.294-1.985.294-3.654v-.4c0-1.669 0-2.748-.294-3.654a6 6 0 0 0-3.852-3.852A5 5 0 0 0 17 6.103c0-.502-.001-.937-.03-1.298-.033-.395-.104-.789-.297-1.167a3 3 0 0 0-1.311-1.311c-.378-.193-.772-.264-1.167-.296A18 18 0 0 0 12.84 2zM9.8 6l-.8.001c0-.466.004-.784.024-1.033.022-.272.06-.373.085-.422a1 1 0 0 1 .437-.437c.05-.025.15-.063.422-.085C10.25 4 10.624 4 11.2 4h1.6c.577 0 .949 0 1.232.024.272.022.373.06.422.085a1 1 0 0 1 .437.437c.025.05.063.15.085.422.02.25.024.567.024 1.033L14.2 6z"
				clipRule="evenodd"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M13 11a1 1 0 1 0-2 0v2H9a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 1 0 0-2h-2z"
			/>
		</svg>
	)
}

export default IconFirstAidDuoSolid
