// duo-solid/communication
import type { Component, JSX } from "solid-js"

export const IconEnvelopeFastDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M22.34 8.605a.392.392 0 0 1 .608.3C23 9.73 23 10.702 23 11.872v.172c0 1.363 0 2.447-.071 3.322-.074.895-.227 1.659-.583 2.358a6 6 0 0 1-2.622 2.622c-.7.356-1.463.51-2.359.583-.874.071-1.958.071-3.321.071H4a1 1 0 1 1 0-2h5a1 1 0 1 0 0-2H2a1 1 0 1 1 0-2h3a1 1 0 1 0 0-2H1a1 1 0 1 1 0-2c.003-.793.013-1.485.052-2.095a.392.392 0 0 1 .608-.3l5.668 3.607c1.402.893 2.317 1.476 3.324 1.708a6 6 0 0 0 2.697 0c1.006-.232 1.921-.815 3.323-1.708z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M14.044 3c1.363 0 2.447 0 3.322.071.895.074 1.659.227 2.358.583a6 6 0 0 1 2.38 2.19.47.47 0 0 1-.161.643l-6.185 3.936c-1.62 1.03-2.23 1.403-2.859 1.548a4 4 0 0 1-1.798 0c-.629-.145-1.24-.517-2.859-1.548L2.057 6.488a.47.47 0 0 1-.16-.644 6 6 0 0 1 2.38-2.19c.698-.356 1.462-.51 2.358-.583C7.509 3 8.593 3 9.956 3z"
			/>
		</svg>
	)
}

export default IconEnvelopeFastDuoSolid
