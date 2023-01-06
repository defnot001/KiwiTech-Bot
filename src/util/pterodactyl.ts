import { PteroClient } from 'ptero-client';
import { config } from '../config/config';

export const ptero = new PteroClient({
  baseURL: config.ptero.url,
  apiKey: config.ptero.apiKey,
});
