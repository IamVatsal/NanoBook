import { ChatRequest, ChatResponse, UploadResponse } from '../Utils/types';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

export async function sendChatMessage(
    payload: ChatRequest
): Promise<ChatResponse> {
    const response = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Chat API error: ${response.statusText}`);
    }

    return response.json();
}

export async function uploadDocument(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Upload API error: ${response.statusText}`);
    }

    return response.json();
}

export async function resetSources(): Promise<void> {
    const response = await fetch(`${BASE_URL}/reset`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error(`Reset API error: ${response.statusText}`);
    }
}
