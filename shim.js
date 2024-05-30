import textEncoding from 'text-encoding'
import buffer from 'buffer'
import fs from 'react-native-fs'

if (typeof Buffer === 'undefined') global.Buffer = buffer.Buffer
if (typeof TextEncoder === 'undefined') global.TextEncoder = textEncoding.TextEncoder
if (typeof btoa === 'undefined') global.btoa = (str) => new buffer(str, 'binary').toString('base64');
if (typeof atob === 'undefined') global.atob = (b64Encoded) => new buffer(b64Encoded, 'base64').toString('binary');
if (typeof fs === 'undefined') global.fs = fs