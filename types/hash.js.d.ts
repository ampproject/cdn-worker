// See https://github.com/indutny/hash.js/issues/18
declare module 'hash.js/lib/hash/sha/1' {
  import {sha1} from 'hash.js';
  export default sha1;
}
