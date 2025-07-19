// icons/svgs/solid/media

import type React from "react"
import type { SVGProps } from "react"

export const IconPhotoImageCancel: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M9.956 2h4.088c1.363 0 2.447 0 3.321.071.896.074 1.66.227 2.359.583a6 6 0 0 1 2.622 2.622c.356.7.51 1.463.583 2.359.071.874.071 1.958.071 3.321v1.238a1 1 0 1 1-2 0V11c0-.669 0-1.245-.007-1.75h-.054c-1.335 0-2.067 0-2.692.064A12.25 12.25 0 0 0 7.346 19.97c.694.029 1.548.03 2.654.03h3.2a1 1 0 1 1 0 2H9.955c-1.363 0-2.447 0-3.321-.071-.896-.074-1.66-.227-2.359-.583a6 6 0 0 1-2.622-2.622c-.356-.7-.51-1.463-.583-2.359C1 15.491 1 14.407 1 13.044v-2.088c0-1.363 0-2.447.071-3.321.074-.896.227-1.66.583-2.359a6 6 0 0 1 2.622-2.622c.7-.356 1.463-.51 2.359-.583C7.509 2 8.593 2 9.956 2ZM5.5 8.5a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
			<path
				d="M16.493 15.493a1 1 0 0 1 1.414 0l1.693 1.693 1.693-1.693a1 1 0 0 1 1.414 1.414L21.014 18.6l1.693 1.693a1 1 0 0 1-1.414 1.414L19.6 20.014l-1.693 1.693a1 1 0 0 1-1.414-1.414l1.693-1.693-1.693-1.693a1 1 0 0 1 0-1.414Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconPhotoImageCancel
