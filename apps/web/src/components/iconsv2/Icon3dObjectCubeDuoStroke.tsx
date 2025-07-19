// duo-stroke/ar-&-vr
import type { Component, JSX } from "solid-js"

export const Icon3dObjectCubeDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 21.678q.484 0 .96-.101c.58-.124 1.133-.403 2.04-.919m-3 1.02q-.484 0-.96-.101c-.58-.124-1.133-.403-2.04-.919m3 1.02V19m0-16.678q.484 0 .96.101c.58.123 1.133.403 2.04.918m-3-1.019a4.6 4.6 0 0 0-.96.101c-.58.123-1.133.403-2.04.918m3-1.019V5M3.619 7.16q-.242.42-.393.882c-.183.565-.218 1.183-.225 2.226M3.62 7.16q.24-.419.567-.781c.397-.441.915-.78 1.815-1.307M3.62 7.16 5.938 8.5m-2.32 8.339q.244.419.568.781c.397.441.915.78 1.815 1.307M3.62 16.84a4.6 4.6 0 0 1-.393-.882c-.183-.565-.218-1.183-.225-2.226m.618 3.108 2.319-1.34M20.38 7.162a4.6 4.6 0 0 0-.567-.781c-.398-.441-.916-.78-1.816-1.307m2.383 2.088q.242.42.393.882c.183.565.218 1.183.224 2.226m-.617-3.108L18.062 8.5m2.32 8.339q.241-.42.392-.882c.183-.565.218-1.183.224-2.226m-.617 3.108q-.24.419-.567.781c-.398.441-.916.78-1.816 1.307m2.383-2.088L18 15.464"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 15v-3m2.599-1.5L12 12m-2.598-1.5L12 12"
				fill="none"
			/>
		</svg>
	)
}

export default Icon3dObjectCubeDuoStroke
