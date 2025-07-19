// solid/users
import type { Component, JSX } from "solid-js"

export const IconUserEdit: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M7 7a5 5 0 1 1 10 0A5 5 0 0 1 7 7Z" fill="currentColor" />
			<path
				d="M8 14h5.665l-2.085 2.084c-.325.322-.639.655-.883 1.045a4.5 4.5 0 0 0-.536 1.238c-.137.517-.15 1.037-.157 1.29l-.001.029-.003.138v1.18c0 .35.06.684.17.996H6a3 3 0 0 1-3-3 5 5 0 0 1 5-5Z"
				fill="currentColor"
			/>
			<path
				d="M21.333 11.268a1.9 1.9 0 0 0-2.365.257l-6.02 6.02c-.201.2-.404.402-.556.646a2.5 2.5 0 0 0-.298.688c-.074.277-.083.562-.092.846-.009.294-.007.59-.004.885l.002.394a1 1 0 0 0 1 1h1.243c.294-.002.59-.004.878-.074a2.5 2.5 0 0 0 .716-.3c.253-.155.462-.365.67-.573l5.967-5.967a1.94 1.94 0 0 0 .252-2.434l-.02-.03a4.6 4.6 0 0 0-1.373-1.358Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconUserEdit
