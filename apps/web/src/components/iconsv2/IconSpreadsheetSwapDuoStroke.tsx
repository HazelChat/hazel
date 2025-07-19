// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconSpreadsheetSwapDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 15V9H3v6m6 0v6c-1.977-.002-3.013-.027-3.816-.436a4 4 0 0 1-1.748-1.748c-.41-.803-.434-1.84-.436-3.816m6 0H3"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20 13v5a2 2 0 0 1-2 2h-5"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M22 15a10.2 10.2 0 0 0-1.851-1.947.236.236 0 0 0-.298 0c-.7.564-1.323 1.219-1.851 1.947m-2.6 7a11.6 11.6 0 0 1-2.337-1.851.207.207 0 0 1 0-.298A11.6 11.6 0 0 1 15.4 18"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linejoin="round"
				stroke-width="2"
				d="M14.6 3H9.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C3.026 5.987 3.002 7.024 3 9h18c-.002-1.977-.027-3.013-.436-3.816a4 4 0 0 0-1.748-1.748C17.96 3 16.84 3 14.6 3Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconSpreadsheetSwapDuoStroke
