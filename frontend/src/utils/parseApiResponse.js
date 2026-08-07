function isInfinityFreeChallenge(responseText) {
    return (
        responseText.includes('/aes.js') &&
        responseText.includes('__test=') &&
        responseText.includes('slowAES.decrypt')
    );
}


export default async function parseApiResponse(response) {
    const responseText = await response.text();
    let data;

    if (isInfinityFreeChallenge(responseText)) {
        const error = new Error('InfinityFree ha restituito la pagina di verifica');
        error.code = 'INFINITYFREE_CHALLENGE';
        error.status = response.status;
        throw error;
    }
    
    try {
        data = JSON.parse(responseText);

    }
    catch {
        console.error('Risposta non JSON', responseText);
        const error = new Error(`Risposta non JSON (HTTP ${response.status})`);
        error.status = response.status;
        throw error;
    }

    if (!response.ok) {
        const error = new Error(data?.result?.message || `Errore HTTP ${response.status}`);
        error.status = response.status;
        throw error;
    }

    return data;
}