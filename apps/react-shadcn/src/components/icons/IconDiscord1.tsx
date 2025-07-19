// icons/svgs/contrast/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconDiscord1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M21.914 16.5C19.931 20 16.491 20 16.491 20l-1.166-2.426c-2.444.735-4.202.735-6.646 0L7.509 20s-3.44 0-5.423-3.5a.5.5 0 0 1-.065-.24c-.029-1.37-.39-7.863 3.475-10.76 1.098-.758 2.474-1.211 3.129-1.4a.476.476 0 0 1 .556.252l.683 1.37a.5.5 0 0 0 .448.277h3.38a.5.5 0 0 0 .449-.278l.678-1.368a.476.476 0 0 1 .557-.253c.656.188 2.03.642 3.128 1.399 3.864 2.897 3.504 9.39 3.475 10.76a.5.5 0 0 1-.065.24Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M11 6h2.693a.5.5 0 0 0 .448-.278l.678-1.368a.476.476 0 0 1 .557-.253c.656.188 2.03.642 3.128 1.399 3.864 2.897 3.504 9.39 3.475 10.76a.5.5 0 0 1-.065.24C19.931 20 16.491 20 16.491 20l-1.166-2.426M13 6h-2.688a.5.5 0 0 1-.448-.277l-.683-1.37a.476.476 0 0 0-.556-.252c-.655.188-2.031.641-3.13 1.399-3.863 2.897-3.503 9.39-3.474 10.76a.5.5 0 0 0 .065.24C4.069 20 7.509 20 7.509 20l1.17-2.427M7 17c.6.225 1.155.416 1.678.573M17.004 17c-.6.225-1.156.416-1.68.574m-6.645 0c2.444.735 4.202.735 6.646 0M10.002 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm6.002 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
			/>
		</svg>
	)
}

export default IconDiscord1
