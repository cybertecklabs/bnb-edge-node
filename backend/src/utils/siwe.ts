import { SiweMessage } from 'siwe';

export const verifySiweSignature = async (message: any, signature: string) => {
    try {
        const siweMessage = new SiweMessage(message);
        const { data } = await siweMessage.verify({ signature });
        return data;
    } catch (err: any) {
        throw new Error('SIWE Signature verification failed');
    }
};
