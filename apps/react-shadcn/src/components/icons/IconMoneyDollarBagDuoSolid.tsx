// icons/svgs/duo-solid/money-&-payments

import type React from "react"
import type { SVGProps } from "react"

export const IconMoneyDollarBagDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M21.589 14.645c-.423-3.23-2.39-6.704-5.407-8.203l1.41-3.526a1 1 0 0 0-.556-1.3l-.65-.26a4.97 4.97 0 0 0-4.607.48 2.98 2.98 0 0 1-2.233.441l-.977-.195a1 1 0 0 0-1.11 1.387l1.168 2.627c-3.313 1.178-5.537 4.708-6.134 8.028-.341 1.895-.191 3.881.694 5.504.909 1.667 2.536 2.839 4.881 3.13a32 32 0 0 0 7.864 0c2.235-.278 3.823-1.355 4.756-2.91.911-1.52 1.138-3.39.9-5.203ZM12.889 3.5a2.97 2.97 0 0 1 2.47-.385l-1.075 2.689a7 7 0 0 0-1.247-.114h-2.073q-.164 0-.326.008l-.606-1.364a4.97 4.97 0 0 0 2.856-.834Z"
				clipRule="evenodd"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 10.303v.83m0 0h-.767c-.848 0-1.536.742-1.536 1.658s.688 1.658 1.536 1.658h1.535c.848 0 1.536.742 1.536 1.658s-.688 1.659-1.536 1.659H12m0-6.634h.817c.527 0 .993.288 1.27.726M12 17.765v.83m0-.83h-.817c-.527 0-.993-.287-1.27-.725"
			/>
		</svg>
	)
}

export default IconMoneyDollarBagDuoSolid
