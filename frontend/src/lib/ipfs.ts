import axios from 'axios'

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY

export async function uploadToIPFS(file: File) {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`

    let data = new FormData()
    data.append('file', file)

    const response = await axios.post(url, data, {
        maxBodyLength: Infinity,
        headers: {
            'Content-Type': `multipart/form-data;`,
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
        }
    })

    return response.data.IpfsHash
}

export async function uploadJSONToIPFS(json: any) {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`

    const response = await axios.post(url, json, {
        headers: {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
        }
    })

    return response.data.IpfsHash
}
