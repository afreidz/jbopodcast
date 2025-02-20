/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	Calls = "calls",
	Connections = "connections",
	Scenes = "scenes",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created?: IsoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated?: IsoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated?: IsoDateString
}

export type MfasRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	method: string
	recordRef: string
	updated?: IsoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated?: IsoDateString
}

export type SuperusersRecord = {
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

export type CallsRecord = {
	activeScene?: RecordIdString
	connections?: RecordIdString[]
	created?: IsoDateString
	ended?: IsoDateString
	guests?: RecordIdString[]
	host: RecordIdString
	id: string
	scenes?: RecordIdString[]
	scheduled: IsoDateString
	started?: IsoDateString
	title: string
	updated?: IsoDateString
}

export type ConnectionsRecord<Tanswer = unknown, Tice = unknown, Toffer = unknown> = {
	answer?: null | Tanswer
	call: RecordIdString
	created?: IsoDateString
	from: RecordIdString
	ice?: null | Tice
	id: string
	offer?: null | Toffer
	to: RecordIdString
	updated?: IsoDateString
}

export enum ScenesTypeOptions {
	"pull" = "pull",
	"twoUp" = "twoUp",
	"fourUp" = "fourUp",
	"splash" = "splash",
	"threeUp" = "threeUp",
	"countdown" = "countdown",
	"spotlight" = "spotlight",
}
export type ScenesRecord = {
	A?: RecordIdString
	B?: RecordIdString
	C?: RecordIdString
	D?: RecordIdString
	countdownMS?: number
	created?: IsoDateString
	id: string
	label: string
	splashURL?: string
	type: ScenesTypeOptions
	updated?: IsoDateString
}

export enum UsersRoleOptions {
	"admin" = "admin",
	"host" = "host",
	"guest" = "guest",
}
export type UsersRecord = {
	avatar?: string
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	handle?: string
	id: string
	name?: string
	password: string
	role: UsersRoleOptions
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type CallsResponse<Texpand = unknown> = Required<CallsRecord> & BaseSystemFields<Texpand>
export type ConnectionsResponse<Tanswer = unknown, Tice = unknown, Toffer = unknown, Texpand = unknown> = Required<ConnectionsRecord<Tanswer, Tice, Toffer>> & BaseSystemFields<Texpand>
export type ScenesResponse<Texpand = unknown> = Required<ScenesRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	calls: CallsRecord
	connections: ConnectionsRecord
	scenes: ScenesRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	calls: CallsResponse
	connections: ConnectionsResponse
	scenes: ScenesResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: '_authOrigins'): RecordService<AuthoriginsResponse>
	collection(idOrName: '_externalAuths'): RecordService<ExternalauthsResponse>
	collection(idOrName: '_mfas'): RecordService<MfasResponse>
	collection(idOrName: '_otps'): RecordService<OtpsResponse>
	collection(idOrName: '_superusers'): RecordService<SuperusersResponse>
	collection(idOrName: 'calls'): RecordService<CallsResponse>
	collection(idOrName: 'connections'): RecordService<ConnectionsResponse>
	collection(idOrName: 'scenes'): RecordService<ScenesResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
