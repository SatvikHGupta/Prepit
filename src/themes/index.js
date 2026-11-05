// Server and test entry: the registry plus validation. A bad colour fails the build with the ratio in the message.
import { validate } from '@/theme/core.js';
import { MODES, ACCENTS, DEFAULTS } from './data.js';

validate(MODES, ACCENTS, DEFAULTS);

export * from './data.js';
