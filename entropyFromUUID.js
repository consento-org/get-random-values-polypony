const reg = /^([0-9a-f]{8})-[0-9a-f]{4}-([0-9a-f]{2})[0-9a-f]{2}-[0-9a-f]{4}-[0-9a-f]{4}([0-9a-f]{8})$/i
module.exports = function entropyFromUUID (uuid) {
  const parts = reg.exec(uuid)
  if (parts === null) {
    return null
  }
  //
  // UUID's have 128bit of random data but bits 6 & 7 of clock_seq_hi_and_reserved
  // (octet 6-7) are set to a fixed 0 and 1
  // and bits 12~15 of time_hi_and_version (octet 8) are set fixed
  // to the version identifying random data - those parts need to be ignored.
  // This results in 122bit of random data, but since we need only 64 bit,
  // this algorithm returns a low/high big int of the octets 0-4 and 12-16
  //
  // See: https://tools.ietf.org/html/rfc4122#section-4.4
  //
  const clockSeqHi = parseInt(parts[2], 16)
  if ((clockSeqHi & 32) !== 0 || (clockSeqHi & 64) !== 64) {
    // Invalid uuid
    return null
  }
  return {
    low: parseInt(parts[1], 16), // the first 4 octets are not affected
    high: parseInt(parts[3], 16) // the last 4 octets are also not affected
  }
}
