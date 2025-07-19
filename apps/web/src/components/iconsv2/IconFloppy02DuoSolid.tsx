// duo-solid/general
import type { Component, JSX } from "solid-js"

export const IconFloppy02DuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M9.56 2h-.035c-1.046 0-1.898 0-2.594.048-.807.056-1.506.181-2.146.508a5.1 5.1 0 0 0-2.23 2.229c-.306.603-.435 1.255-.496 2C2 7.51 2 8.406 2 9.518v4.966c0 1.112 0 2.007.06 2.731.06.746.189 1.398.496 2.001a5.1 5.1 0 0 0 2.229 2.23c.64.326 1.339.45 2.146.507C7.627 22 8.479 22 9.525 22h4.95c1.046 0 1.898 0 2.594-.048.807-.056 1.506-.181 2.146-.508a5.1 5.1 0 0 0 2.23-2.229c.306-.603.435-1.255.496-2 .059-.725.059-1.62.059-2.732V8.916c0-.38 0-.717-.085-1.064a3 3 0 0 0-.359-.865c-.187-.305-.433-.55-.71-.827l-.055-.055-2.896-2.896-.055-.055c-.276-.277-.522-.523-.827-.71a3 3 0 0 0-.865-.36c-.347-.083-.685-.083-1.064-.084z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13 3v2c0 .838 0 1.257-.118 1.594a2.1 2.1 0 0 1-1.288 1.288C11.257 8 10.838 8 10 8s-1.257 0-1.594-.118a2.1 2.1 0 0 1-1.288-1.288C7 6.257 7 5.838 7 5V3.046m0 17.908V16.36c0-1.176 0-1.764.229-2.213a2.1 2.1 0 0 1 .918-.918C8.596 13 9.184 13 10.36 13h3.28c1.176 0 1.764 0 2.213.229a2.1 2.1 0 0 1 .918.918c.229.449.229 1.037.229 2.213v4.594"
			/>
		</svg>
	)
}

export default IconFloppy02DuoSolid
