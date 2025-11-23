'use server';

import { getLiveMatches, getStream } from "@/lib/streamed";
import type { APIMatch, Stream } from "@/types/streamed";

export async function getLiveMatchesAction(): Promise<APIMatch[]> {
    return await getLiveMatches();
}

export async function getStreamAction(source: string, id: string): Promise<Stream[]> {
    return await getStream(source, id);
}
