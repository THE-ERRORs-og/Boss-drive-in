import "server-only"
import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId, token } from '../env'

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
})

if(!writeClient.config().token) {
  throw new Error('A write token is required to perform mutations. Please provide one in your environment variables.')
}
