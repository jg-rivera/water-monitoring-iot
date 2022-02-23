from hashlib import sha256
from binascii import a2b_base64, b2a_base64


def HMACSha256(keyBin, msgBin):

    block_size = 64  # SHA-256 blocks size

    trans_5C = bytearray(256)
    for x in range(len(trans_5C)):
        trans_5C[x] = x ^ 0x5C

    trans_36 = bytearray(256)
    for x in range(len(trans_36)):
        trans_36[x] = x ^ 0x36

    def translate(d, t):
        res = bytearray(len(d))
        for x in range(len(d)):
            res[x] = t[d[x]]
        return res

    keyBin = keyBin + b'\x00' * (block_size - len(keyBin))

    inner = sha256()
    inner.update(translate(keyBin, trans_36))
    inner.update(msgBin)
    inner = inner.digest()

    outer = sha256()
    outer.update(translate(keyBin, trans_5C))
    outer.update(inner)

    return outer.digest()


def GenerateAzureSasToken(uri, key, expiryTimestamp, policy_name=None):

    def _quote(s):
        r = ''
        for c in str(s):
            if (c >= 'a' and c <= 'z') or \
               (c >= '0' and c <= '9') or \
               (c >= 'A' and c <= 'Z') or \
               (c in '.-_'):
                r += c
            else:
                r += '%%%02X' % ord(c)
        return r

    uri = _quote(uri)
    sign_key = b'%s\n%d' % (uri, int(expiryTimestamp))
    key = a2b_base64(key)
    hmac = HMACSha256(key, sign_key)
    signature = _quote(b2a_base64(hmac).decode().strip())

    token = 'sr=' + uri + '&' + \
            'sig=' + signature + '&' + \
            'se=' + str(expiryTimestamp)
    if policy_name:
        token += '&' + 'skn=' + policy_name

    return 'SharedAccessSignature ' + token
