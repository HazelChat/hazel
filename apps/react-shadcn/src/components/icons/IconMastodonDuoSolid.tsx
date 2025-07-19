// icons/svgs/duo-solid/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconMastodonDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M16.322 2.062c1.277.339 2.505.886 3.263 1.753.778.888 1.217 1.709 1.434 2.768.202.983.203 2.156.203 3.68 0 1.594-.117 2.756-.392 3.665a4.7 4.7 0 0 1-1.3 2.134c-1.12 1.086-2.669 1.622-4.213 1.87-.83.133-1.69.187-2.536.189 1.284.247 2.938.32 5.002.177a1 1 0 0 1 .788 1.693c-.68.704-2.004 1.362-3.476 1.777-1.51.427-3.352.648-5.16.334-1.826-.316-3.635-1.184-4.98-2.938-1.334-1.741-2.13-4.25-2.15-7.702l-.027-1.178v-.022c0-1.524.001-2.697.203-3.68.217-1.06.656-1.88 1.434-2.768.758-.867 1.986-1.414 3.263-1.753 1.311-.347 2.827-.515 4.322-.515s3.01.168 4.322.516Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 11.312V8.386m0 0c0-1.258-.895-2.278-2-2.278s-2 1.02-2 2.278v4.722m4-4.722c0-1.258.895-2.278 2-2.278s2 1.02 2 2.278v4.722"
			/>
		</svg>
	)
}

export default IconMastodonDuoSolid
