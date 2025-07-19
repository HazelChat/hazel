// duo-solid/media
import type { Component, JSX } from "solid-js"

export const IconPhotoImageArrowRightDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M9.956 2h4.088c1.363 0 2.447 0 3.321.071.896.074 1.66.227 2.359.583a6 6 0 0 1 2.622 2.622c.605 1.187.645 2.634.653 4.72L23 11v2.044c0 .897 0 1.673-.02 2.348a16 16 0 0 0-1.59-1.365A3 3 0 0 0 16.62 16H16a3 3 0 0 0-.196 5.993c-.529.008-1.113.008-1.76.008H9.993c-.75 0-1.412 0-1.995-.01-1.544-.03-2.714-.13-3.722-.644a6 6 0 0 1-2.622-2.622c-.356-.7-.51-1.463-.583-2.359C1 15.491 1 14.407 1 13.044v-2.088c0-1.363 0-2.447.071-3.321.074-.896.227-1.66.583-2.359a6 6 0 0 1 2.622-2.622c.7-.356 1.463-.51 2.359-.583C7.509 2 8.593 2 9.956 2Z"
				opacity=".28"
			/>
			<path fill="currentColor" d="M7.5 6.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
			<path
				fill="currentColor"
				d="M20.993 9.25h-.054c-1.335 0-2.067 0-2.692.064A12.25 12.25 0 0 0 7.346 19.97c.694.029 1.548.03 2.654.03h3.171A3 3 0 0 1 16 15.999h.62a3 3 0 0 1 4.38-2.22V11c0-.669 0-1.245-.007-1.75Z"
			/>
			<path
				fill="currentColor"
				d="M23 18.999c0 .357-.12.716-.358 1.01a14 14 0 0 1-2.452 2.361 1 1 0 0 1-1.2-1.6q.483-.362.927-.771H16a1 1 0 1 1 0-2h3.916a12 12 0 0 0-.926-.772 1 1 0 0 1 1.2-1.6 14 14 0 0 1 2.452 2.362c.238.294.358.652.358 1.01Z"
			/>
		</svg>
	)
}

export default IconPhotoImageArrowRightDuoSolid
