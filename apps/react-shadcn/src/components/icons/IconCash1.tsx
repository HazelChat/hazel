// icons/svgs/contrast/money-&-payments

import type React from "react"
import type { SVGProps } from "react"

export const IconCash1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M2 8.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C3.52 5 4.08 5 5.2 5h13.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C22 6.52 22 7.08 22 8.2v7.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C20.48 19 19.92 19 18.8 19H5.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C2 17.48 2 16.92 2 15.8z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M6 5v.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C4.48 9 3.92 9 2.8 9H2m4-4h-.8c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C2 6.52 2 7.08 2 8.2V9m4-4h12m0 0h.8c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C22 6.52 22 7.08 22 8.2V9m-4-4v.8c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C19.52 9 20.08 9 21.2 9h.8M6 19v-.8c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C4.48 15 3.92 15 2.8 15H2m4 4h-.8c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C2 17.48 2 16.92 2 15.8V15m4 4h12m0 0h.8c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C22 17.48 22 16.92 22 15.8V15m-4 4v-.8c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C19.52 15 20.08 15 21.2 15h.8M2 15V9m20 6V9m-10 6a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
			/>
		</svg>
	)
}

export default IconCash1
