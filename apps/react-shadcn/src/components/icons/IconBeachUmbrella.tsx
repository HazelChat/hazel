// icons/svgs/solid/building

import type React from "react"
import type { SVGProps } from "react"

export const IconBeachUmbrella: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9.875 14a1 1 0 0 1 1.732 1l-2.886 5H21a1 1 0 0 1 0 2H3a1 1 0 1 1 0-2h3.411z"
				fill="currentColor"
			/>
			<path
				d="M19.615 5.24c2.656 3.029 3.203 7.559 1.06 11.269q-.245.424-.526.816a1 1 0 0 1-1.565.078l-.267-.303a5.8 5.8 0 0 0-2.499-1.67q.2-.33.397-.667c1.62-2.806 2.724-5.605 3.18-7.882.113-.57.19-1.12.22-1.64Z"
				fill="currentColor"
			/>
			<path
				d="M16.328 3.37c.552-.217.801-.143.89-.092.09.052.279.23.368.818.087.574.05 1.382-.152 2.393-.403 2.012-1.41 4.605-2.95 7.274q-.142.243-.285.481l-.252.411-1.051-1.026a5.8 5.8 0 0 0-2.133-1.322l-.346-.109-1.416-.397.231-.425q.135-.242.276-.486c1.54-2.669 3.282-4.838 4.823-6.192.774-.68 1.456-1.117 1.997-1.329Z"
				fill="currentColor"
			/>
			<path
				d="M4.033 6.9c2.142-3.71 6.338-5.502 10.288-4.716-.435.286-.874.628-1.31 1.011-1.745 1.533-3.616 3.89-5.236 6.696q-.148.258-.292.515l-.087.16a5.8 5.8 0 0 0-2.462-1.278l-.234-.05-.395-.08a1 1 0 0 1-.717-1.394q.2-.44.445-.865Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconBeachUmbrella
