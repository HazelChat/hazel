// solid/general
import type { Component, JSX } from "solid-js"

export const IconSupportMoneyDonation: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M9 5.5a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0Z" fill="currentColor" />
			<path
				d="M18.68 3.055a1 1 0 0 1 1.392-.248 4.5 4.5 0 0 1-1.93 8.147 1 1 0 0 1-.284-1.98 2.5 2.5 0 0 0 1.07-4.526 1 1 0 0 1-.248-1.393Z"
				fill="currentColor"
			/>
			<path
				d="M1 12a3 3 0 0 1 5.758-1.181A11.5 11.5 0 0 1 12.236 12h1.071c.96 0 1.865.368 2.546 1h4.042c1.009 0 2.14.578 2.811 1.353.35.403.656.955.666 1.608.01.687-.31 1.3-.86 1.782-4.363 4.009-11.137 4.309-15.985.874A3 3 0 0 1 1 17zm6 4.459c4.132 3.458 10.316 3.35 14.167-.197l.025-.022a.7.7 0 0 0 .165-.192.1.1 0 0 0 .015-.057c0-.031-.02-.147-.178-.33a2.1 2.1 0 0 0-.645-.479c-.268-.13-.504-.182-.654-.182h-3.027a2.03 2.03 0 0 1-2.03 2H10a1 1 0 1 1 0-2h4.838l.011-.001h.002s.006-.005.01-.012q.007-.012.006-.014v-.002l-.005-.01A1.74 1.74 0 0 0 13.308 14h-1.122c-.277 0-.55-.065-.798-.188A9.5 9.5 0 0 0 7 12.814z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconSupportMoneyDonation
