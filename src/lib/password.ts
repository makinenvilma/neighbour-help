import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

/**
 * Password hashing with scrypt, from Node's standard library.
 *
 * scrypt is deliberately slow and memory-hungry. Hashing one password takes a
 * noticeable fraction of a second and 64 MiB of RAM, which a signing-in user
 * never feels and an attacker with a stolen database feels on every one of the
 * billions of guesses they want to make. A fast hash like SHA-256 would let them
 * make those guesses on a GPU in hours.
 *
 * The parameters are one of OWASP's recommended scrypt settings. They are stored
 * inside every hash, so raising them later only affects new hashes - old ones
 * still verify with the parameters they were made with.
 */
const PARAMS = { N: 2 ** 16, r: 8, p: 2 };
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

// scrypt needs about 128 * N * r bytes. Node refuses anything over 32 MiB by
// default, which is below what these parameters use.
const MAX_MEMORY = 256 * 1024 * 1024;

function deriveKey(
  password: string,
  salt: Buffer,
  { N, r, p }: { N: number; r: number; p: number },
): Promise<Buffer> {
  const options: ScryptOptions = { N, r, p, maxmem: MAX_MEMORY };
  return new Promise((resolve, reject) => {
    scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, options, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

/**
 * Hash a password for storage. The result looks like
 * `scrypt$65536$8$2$<salt>$<hash>` - everything needed to check a password
 * against it later, and nothing that gives the password back.
 *
 * The random salt means two people with the same password get different hashes,
 * so one cracked hash does not reveal everyone else who used that password.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await deriveKey(password, salt, PARAMS);
  return [
    "scrypt",
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString("base64url"),
    key.toString("base64url"),
  ].join("$");
}

/** True if `password` is the one `stored` was made from. */
export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [scheme, N, r, p, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !hash) return false;

  const expected = Buffer.from(hash, "base64url");
  const actual = await deriveKey(password, Buffer.from(salt, "base64url"), {
    N: Number(N),
    r: Number(r),
    p: Number(p),
  });

  // timingSafeEqual takes the same time however many bytes match. `===` stops
  // at the first difference, and that timing can be measured.
  return (
    actual.length === expected.length && timingSafeEqual(actual, expected)
  );
}
