import {
	ConfectActionCtx as ConfectActionCtxService,
	type ConfectActionCtx as ConfectActionCtxType,
	type ConfectDataModelFromConfectSchemaDefinition,
	type ConfectDoc as ConfectDocType,
	ConfectMutationCtx as ConfectMutationCtxService,
	type ConfectMutationCtx as ConfectMutationCtxType,
	type ConfectMutationHandler,
	ConfectQueryCtx as ConfectQueryCtxService,
	type ConfectQueryCtx as ConfectQueryCtxType,
	makeFunctions,
	makeGenericFunctions,
	type TableNamesInConfectDataModel,
} from "confect-plus/server"
import { Effect, Schema } from "effect"
import { confectSchema } from "./schema"

export const { action, internalAction, internalMutation, internalQuery, mutation, query } =
	makeFunctions(confectSchema)

const _test = query({
	args: Schema.Struct({ a: Schema.String }),
	returns: Schema.String,
	handler: Effect.fn(function* ({ a }) {
		return a
	}),
})

export const { queryGeneric, confectQueryFunction, mutationGeneric, confectMutationFunction } =
	makeGenericFunctions(confectSchema)

type ConfectSchema = typeof confectSchema

type ConfectDataModel = ConfectDataModelFromConfectSchemaDefinition<ConfectSchema>

export type ConfectDoc<TableName extends TableNamesInConfectDataModel<ConfectDataModel>> = ConfectDocType<
	ConfectDataModel,
	TableName
>

export const ConfectQueryCtx = ConfectQueryCtxService<ConfectDataModel>()
export type ConfectQueryCtx = ConfectQueryCtxType<ConfectDataModel>

export const ConfectMutationCtx = ConfectMutationCtxService<ConfectDataModel>()
export type ConfectMutationCtx = ConfectMutationCtxType<ConfectDataModel>

export const ConfectActionCtx = ConfectActionCtxService<ConfectDataModel>()
export type ConfectActionCtx = ConfectActionCtxType<ConfectDataModel>
