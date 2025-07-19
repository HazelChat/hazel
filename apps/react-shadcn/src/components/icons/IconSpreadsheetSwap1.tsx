// icons/svgs/contrast/general

import type React from "react"
import type { SVGProps } from "react"

export const IconSpreadsheetSwap1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9.4 3h5.2c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748c.41.803.434 1.84.436 3.816H9v12c-1.977-.002-3.013-.027-3.816-.436a4 4 0 0 1-1.748-1.748c-.41-.803-.434-1.84-.436-3.816V9c.002-1.977.027-3.013.436-3.816a4 4 0 0 1 1.748-1.748C6.04 3 7.16 3 9.4 3Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M9 9v6m0-6H3m6 0h12c-.002-1.977-.027-3.013-.436-3.816a4 4 0 0 0-1.748-1.748C17.96 3 16.84 3 14.6 3H9.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C3.026 5.987 3.002 7.024 3 9m6 6v6c-1.977-.002-3.013-.027-3.816-.436a4 4 0 0 1-1.748-1.748c-.41-.803-.434-1.84-.436-3.816m6 0H3m0 0V9"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M20 13v5a2 2 0 0 1-2 2h-5"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M22 15a10.2 10.2 0 0 0-1.851-1.947.236.236 0 0 0-.298 0c-.7.564-1.323 1.219-1.851 1.947m-2.6 7a11.6 11.6 0 0 1-2.337-1.851.207.207 0 0 1 0-.298A11.6 11.6 0 0 1 15.4 18"
			/>
		</svg>
	)
}

export default IconSpreadsheetSwap1
