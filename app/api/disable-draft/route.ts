import { draftMode } from "next/headers";

export async function GET(_request: Request) {
	const draft = await draftMode();
	draft.disable();
	return new Response("Draft mode is disabled");
}
