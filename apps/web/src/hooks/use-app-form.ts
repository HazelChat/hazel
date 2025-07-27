import { createFormHook, createFormHookContexts } from "@tanstack/react-form"
import { Input, TextField } from "~/components/base/input/input"
import { Select } from "~/components/base/select/select"

const { fieldContext, formContext } = createFormHookContexts()

export const { useAppForm } = createFormHook({
	fieldComponents: {
		Input,
		Select,
		TextField,
	},
	formComponents: {},
	fieldContext,
	formContext,
})
